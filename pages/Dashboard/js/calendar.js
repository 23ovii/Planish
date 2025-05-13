// calendar.js - Calendar component with localStorage functionality

let currentEvent = null;

class Calendar {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Containerul cu ID-ul "${containerId}" nu a fost găsit`);
      throw new Error(`Containerul cu ID-ul "${containerId}" nu a fost găsit`);
    }
    
    this.currentDate = new Date();
    this.selectedDate = new Date();
    // Încărcăm timeBlocks din localStorage sau inițializăm un array gol
    this.timeBlocks = this.loadFromLocalStorage() || [];
    this.categoryColors = {
      work: "bg-blue-500",
      personal: "bg-green-500",
      study: "bg-purple-500",
      health: "bg-red-500",
      other: "bg-gray-500",
    };
    this.isAddingTimeBlock = false;
    this.newTimeBlock = {
      title: "",
      start: new Date(),
      end: this.addHours(new Date(), 1),
      category: "work",
    };
  }

  // Funcții pentru localStorage
  saveToLocalStorage() {
    try {
      // Convertim datele în format JSON pentru localStorage
      const serializedData = JSON.stringify(this.timeBlocks.map(block => ({
        ...block,
        start: block.start.toISOString(),
        end: block.end.toISOString()
      })));
      localStorage.setItem('calendarEvents', serializedData);
      console.log('Date salvate în localStorage:', this.timeBlocks.length + ' evenimente');
    } catch (e) {
      console.error("Eroare la salvarea datelor în localStorage:", e);
    }
  }

  loadFromLocalStorage() {
    try {
      const data = localStorage.getItem('calendarEvents');
      if (!data) {
        console.log('Nu există date în localStorage');
        return [];
      }
      
      // Convertim înapoi datele din JSON în obiecte Date
      const parsedData = JSON.parse(data).map(block => ({
        ...block,
        start: new Date(block.start),
        end: new Date(block.end)
      }));
      
      console.log('Date încărcate din localStorage:', parsedData.length + ' evenimente');
      return parsedData;
    } catch (e) {
      console.error("Eroare la încărcarea datelor din localStorage:", e);
      return [];
    }
  }

  // Date utility functions (replacing dateFns dependency)
  format(date, formatStr) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    if (formatStr === 'PPP') {
      return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    } else if (formatStr === 'MMM d') {
      return `${shortMonths[date.getMonth()]} ${date.getDate()}`;
    } else if (formatStr === 'MMM d, yyyy') {
      return `${shortMonths[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    } else if (formatStr === 'EEE') {
      return shortDays[date.getDay()];
    } else if (formatStr === 'd') {
      return date.getDate().toString();
    } else if (formatStr === 'h:mm a') {
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      return `${hours}:${minutes} ${ampm}`;
    }
    return date.toLocaleDateString();
  }

  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  subDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
  }

  addHours(date, hours) {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
  }

  startOfWeek(date, options = {}) {
    const weekStartsOn = options.weekStartsOn || 0;
    const result = new Date(date);
    const day = result.getDay();
    const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
    result.setDate(result.getDate() - diff);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  endOfWeek(date, options = {}) {
    const weekStartsOn = options.weekStartsOn || 0;
    const result = this.startOfWeek(date, options);
    result.setDate(result.getDate() + 6);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  eachDayOfInterval(interval) {
    const result = [];
    let currentDate = new Date(interval.start);
    
    while (currentDate <= interval.end) {
      result.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return result;
  }

  isSameDay(date1, date2) {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }

  init() {
    this.render();
    this.setupEventListeners();
  }
  
generateModernGrid(daysOfWeek) {
  // Create time slots for the day (8 AM to 8 PM)
  const timeSlots = Array.from({ length: 13 }, (_, i) => i + 8);
  
  // Build the HTML for the modern grid
  const html = `
    <div class="w-full bg-gray-50 rounded-lg shadow-lg overflow-hidden">
      <!-- Header with days -->
      <div class="grid grid-cols-8 bg-white border-b">
        <!-- Empty cell for time column -->
        <div class="p-3 border-r"></div>
        
        <!-- Day headers -->
        ${daysOfWeek.map(day => `
          <div class="p-3 text-center border-r last:border-r-0 ${this.isSameDay(day, new Date()) ? 'bg-blue-50' : ''}">
            <div class="text-sm font-medium">${this.format(day, "EEE")}</div>
            <div class="text-2xl font-bold ${this.isSameDay(day, new Date()) ? 'text-blue-600' : ''}">${this.format(day, "d")}</div>
            <div class="text-xs text-gray-500">${this.format(day, "MMM")}</div>
          </div>
        `).join('')}
      </div>
      
      <!-- Time grid -->
      <div class="grid grid-cols-8">
        <!-- Time column -->
        <div class="border-r">
          ${timeSlots.map(hour => `
            <div class="h-16 relative border-b">
              <span class="absolute -top-2 left-2 text-xs font-medium text-gray-500">
                ${hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
              </span>
            </div>
          `).join('')}
        </div>
        
        <!-- Day columns -->
        ${daysOfWeek.map((day, index) => `
          <div class="relative border-r last:border-r-0" id="modern-day-column-${index}" data-date="${day.toISOString()}">
            ${timeSlots.map(hour => `
              <div class="h-16 border-b hover:bg-blue-50 transition-colors duration-150"></div>
            `).join('')}
            <!-- Time blocks will be rendered here dynamically -->
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  return html;
}


  render() {
  const weekStart = this.startOfWeek(this.currentDate, { weekStartsOn: 1 });
  const weekEnd = this.endOfWeek(this.currentDate, { weekStartsOn: 1 });
  const daysOfWeek = this.eachDayOfInterval({
    start: weekStart,
    end: weekEnd,
  });

  const html = `
    <div class="w-full h-full bg-white rounded-lg shadow">
      <div class="flex flex-row items-center justify-between p-4 border-b">
        <h2 class="text-xl font-bold">Calendar</h2>
        <div class="flex items-center space-x-2">
          <div class="relative">
            <button id="date-picker-btn" class="px-3 py-1.5 border rounded-md text-sm flex items-center">
              <span class="mr-2 h-4 w-4">📅</span>
              <span id="selected-date">${this.format(this.selectedDate, "PPP")}</span>
            </button>
            <!-- Date picker will be added here dynamically -->
          </div>

          <div class="flex items-center space-x-2">
            <button id="prev-week" class="p-1 border rounded-md">
              <span class="h-4 w-4">←</span>
            </button>
            <div class="font-medium">
              ${this.format(weekStart, "MMM d")} - ${this.format(weekEnd, "MMM d, yyyy")}
            </div>
            <button id="next-week" class="p-1 border rounded-md">
              <span class="h-4 w-4">→</span>
            </button>
          </div>

          <button id="add-event" class="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm flex items-center">
            <span class="h-4 w-4 mr-1">+</span> Adaugă eveniment
          </button>
        </div>
      </div>
      
      <div class="p-4">
        ${this.generateModernGrid(daysOfWeek)}
      </div>
    </div>
  `;

  this.container.innerHTML = html;
  this.renderTimeBlocks(daysOfWeek);
  this.setupEventListeners();
}
 renderTimeBlocks(daysOfWeek) {
  this.timeBlocks.forEach((block) => {
    daysOfWeek.forEach((day, index) => {
      if (this.isSameDay(block.start, day)) {
        const timeBlockEl = document.createElement("div");
        timeBlockEl.className = `absolute rounded-md p-2 ${this.categoryColors[block.category] || "bg-gray-500"} text-white text-xs overflow-hidden cursor-move shadow-md`;

        timeBlockEl.innerHTML = `
          <div class="font-medium">${block.title}</div>
          <div>
            ${this.format(block.start, "h:mm a")} - ${this.format(block.end, "h:mm a")}
          </div>
          <button class="absolute top-1 right-1 text-white edit-event cursor-pointer hover:text-gray-200" data-id="${block.id}">
            <i data-lucide="edit-2" class="h-4 w-4"></i>
          </button>
          <div class="resize-handle-top absolute top-0 left-0 right-0 h-1 cursor-n-resize hover:bg-white/20"></div>
          <div class="resize-handle-bottom absolute bottom-0 left-0 right-0 h-1 cursor-s-resize hover:bg-white/20"></div>
        `;

        // Set position and size
        const position = this.getTimeBlockPosition(block);
        Object.assign(timeBlockEl.style, position);

        // Add resize functionality
        this.addResizeHandlers(timeBlockEl, block);

        // Add click handler for edit button
        const editButton = timeBlockEl.querySelector('.edit-event');
        if (editButton) {
          editButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.showEditEventModal(block);
          });
        }

        // Use the new ID format for the columns
        const dayColumn = document.getElementById(`modern-day-column-${index}`);
        if (dayColumn) {
          dayColumn.appendChild(timeBlockEl);
        }

        // Initialize Lucide icons
        if (window.lucide) {
          window.lucide.createIcons();
        }
      }
    });
  });
    this.handleOverlappingEvents();
}

  // Add this new method for resize functionality
addResizeHandlers(element, block) {
  const topHandle = element.querySelector('.resize-handle-top');
  const bottomHandle = element.querySelector('.resize-handle-bottom');
  let startY, startHeight, startTop, originalStart, originalEnd;
  let isDragging = false;

  // Function for handling drag operation
  const setupDragHandler = (e) => {
    if (e.target === topHandle || e.target === bottomHandle || e.target.closest('.edit-event')) {
      return;
    }
    
    e.stopPropagation();
    isDragging = true;
    startY = e.clientY;
    startTop = parseInt(element.style.top, 10);
    originalStart = new Date(block.start);
    originalEnd = new Date(block.end);
    const duration = originalEnd - originalStart;

    const handleMouseMove = (e) => {
      if (!isDragging) return;

      const dy = e.clientY - startY;
      const minutesPerPixel = 60 / 50;
      const deltaMinutes = Math.round(dy * minutesPerPixel / 15) * 15;

      const newStart = new Date(originalStart.getTime() + deltaMinutes * 60000);
      const newEnd = new Date(newStart.getTime() + duration);

      // Check boundaries
      if (newStart.getHours() < 8 || newEnd.getHours() > 20) return;

      element.style.top = `${startTop + dy}px`;
      block.start = newStart;
      block.end = newEnd;

      const timeDisplay = element.querySelector('div:nth-child(2)');
      if (timeDisplay) {
        timeDisplay.textContent = `${this.dateUtils().format(block.start, "h:mm a")} - ${this.dateUtils().format(block.end, "h:mm a")}`;
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        isDragging = false;
        this.editTimeBlock(block.id, block);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Function for handling resize operations
  const setupResizeHandler = (handle, isTop) => {
    handle.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      startY = e.clientY;
      startHeight = parseInt(element.style.height, 10);
      startTop = parseInt(element.style.top, 10);
      originalStart = new Date(block.start);
      originalEnd = new Date(block.end);

      const handleMouseMove = (e) => {
        const dy = e.clientY - startY;
        const minutesPerPixel = 60 / 50;
        const deltaMinutes = Math.round(dy * minutesPerPixel / 15) * 15;

        if (isTop) {
          // Handle top resize
          const newStart = new Date(originalStart.getTime() + deltaMinutes * 60000);
          
          // Validate
          if (newStart >= originalEnd || newStart.getHours() < 8) return;
          
          const newTop = (newStart.getHours() - 8) * 50 + (newStart.getMinutes() / 60) * 50;
          const newHeight = startHeight + (startTop - newTop);
          
          element.style.top = `${newTop}px`;
          element.style.height = `${newHeight}px`;
          block.start = newStart;
        } else {
          // Handle bottom resize  
          const newEnd = new Date(originalEnd.getTime() + deltaMinutes * 60000);
          
          // Validate
          if (newEnd <= originalStart || newEnd.getHours() > 20 || 
              (newEnd.getHours() === 20 && newEnd.getMinutes() > 0)) return;
          
          const newHeight = startHeight + dy;
          if (newHeight < 25) return;
          
          element.style.height = `${newHeight}px`;
          block.end = newEnd;
        }
        
        // Update displayed time
        const timeDisplay = element.querySelector('div:nth-child(2)');
        if (timeDisplay) {
          timeDisplay.textContent = `${this.dateUtils().format(block.start, "h:mm a")} - ${this.dateUtils().format(block.end, "h:mm a")}`;
        }
      };

      const handleMouseUp = () => {
        this.editTimeBlock(block.id, block);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    });
  };

  // Set up the event handlers
  element.addEventListener('mousedown', setupDragHandler);
  setupResizeHandler(topHandle, true);  // top handle
  setupResizeHandler(bottomHandle, false); // bottom handle
}

  editTimeBlock(id, updatedBlock) {
    // Găsim indexul blocului de timp cu ID-ul specificat
    const index = this.timeBlocks.findIndex(block => block.id === id);
    
    if (index !== -1) {
      // Actualizăm blocul de timp, păstrând id-ul original
      this.timeBlocks[index] = {
        ...this.timeBlocks[index],
        ...updatedBlock,
        id: id // Ne asigurăm că ID-ul rămâne neschimbat
      };
      
      // Salvăm modificările în localStorage
      this.saveToLocalStorage();
      
      // Re-render calendar pentru a reflecta modificările
      this.render();
      
      console.log("Eveniment actualizat:", this.timeBlocks[index]);
      return true;
    } else {
      console.error("Nu s-a găsit evenimentul cu ID-ul:", id);
      return false;
    }
  }
deleteTimeBlock(id) {
  // Find the index of the time block with the specified ID
  const index = this.timeBlocks.findIndex(block => block.id === id);
  
  if (index !== -1) {
    // Remove the time block from the array
    this.timeBlocks.splice(index, 1);
    
    // Save changes to localStorage
    this.saveToLocalStorage();
    
    // Re-render calendar to reflect the changes
    this.render();
    
    console.log("Event deleted successfully:", id);
    return true;
  } else {
    console.error("Could not find event with ID:", id);
    return false;
  }
}
showDeleteConfirmationDialog(eventId) {
  // Elimină orice dialog existent
  const existingDialog = document.getElementById('confirm-delete-dialog');
  if (existingDialog) {
    document.body.removeChild(existingDialog);
  }
  
  // Creăm un dialog ultra-optimizat
  const confirmDialog = document.createElement('div');
  // Simplificăm clasele și setăm direct stilurile pentru mai multă eficiență
  confirmDialog.id = 'confirm-delete-dialog';
  confirmDialog.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 60;
    opacity: 0;
    transition: opacity 150ms ease-out;
  `;
  
  // Simplificăm HTML-ul și eliminăm efectele de animație complexe
  confirmDialog.innerHTML = `
    <div style="
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
      padding: 1.5rem;
      width: 100%;
      max-width: 20rem;
      transform: translateY(0);
      opacity: 0;
      transition: opacity 150ms ease-out;
    ">
      <h3 style="font-size: 1.125rem; font-weight: bold; color: #1f2937; margin-bottom: 1rem;">Confirmare ștergere</h3>
      <p style="color: #4b5563; margin-bottom: 1.5rem;">Ești sigur că vrei să ștergi acest eveniment?</p>
      <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
        <button id="cancel-delete" style="
          padding: 0.5rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          background-color: white;
          color: #374151;
          cursor: pointer;
          transition: background-color 150ms ease-out, transform 150ms ease-out;
        " onmouseover="this.style.backgroundColor='#f3f4f6'; this.style.transform='translateY(-1px)';" 
           onmouseout="this.style.backgroundColor='white'; this.style.transform='translateY(0)';">Anulează</button>
        <button id="confirm-delete" style="
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          background-color: #ef4444;
          color: white;
          border: none;
          cursor: pointer;
          transition: background-color 150ms ease-out, transform 150ms ease-out;
        " onmouseover="this.style.backgroundColor='#dc2626'; this.style.transform='translateY(-1px)';" 
           onmouseout="this.style.backgroundColor='#ef4444'; this.style.transform='translateY(0)';">Șterge</button>
      </div>
    </div>
  `;
  
  // Adăugăm la DOM
  document.body.appendChild(confirmDialog);
  
  // Folosim direct setTimeout mic pentru a activa opacitatea
  setTimeout(() => {
    confirmDialog.style.opacity = '1';
    confirmDialog.querySelector('div').style.opacity = '1';
  }, 10);
  
  // Funcția de închidere simplificată
  const closeDialog = () => {
    const dialog = document.getElementById('confirm-delete-dialog');
    if (dialog) {
      dialog.style.opacity = '0';
      // Durată scurtă de așteptare înainte de eliminare
      setTimeout(() => {
        if (dialog.parentNode) {
          dialog.parentNode.removeChild(dialog);
        }
      }, 150);
    }
  };
  
  // Funcție pentru confirmare
  const handleConfirmDelete = () => {
    this.deleteTimeBlock(eventId);
    closeDialog();
  };
  
  // Adăugăm event listeners simple
  document.getElementById('cancel-delete').addEventListener('click', closeDialog);
  document.getElementById('confirm-delete').addEventListener('click', handleConfirmDelete);
  
  // Click în afara dialogului închide dialogul
  confirmDialog.addEventListener('click', (e) => {
    if (e.target === confirmDialog) {
      closeDialog();
    }
  });
}
  getTimeBlockPosition(block) {
  const startHour = block.start.getHours();
  const startMinutes = block.start.getMinutes();
  const endHour = block.end.getHours();
  const endMinutes = block.end.getMinutes();

  // Only show events between 8 AM and 8 PM (our visible range)
  if (startHour < 8 || startHour > 20) return null;

  // Calculate position based on 64px per hour (h-16 = 64px)
  const hourHeight = 64;
  const top = (startHour - 8) * hourHeight + (startMinutes / 60) * hourHeight;
  const height =
    (endHour - startHour) * hourHeight +
    ((endMinutes - startMinutes) / 60) * hourHeight;

  return {
    top: `${top}px`,
    height: `${height}px`,
    left: '2px',
    right: '2px',
  };
}

  setupEventListeners() {
    try {
    const prevWeekBtn = document.getElementById("prev-week");
    const nextWeekBtn = document.getElementById("next-week");
    const addEventBtn = document.getElementById("add-event");
    const datePickerBtn = document.getElementById("date-picker-btn");
    
    // Remove existing event listeners first
    if (prevWeekBtn) {
      prevWeekBtn.replaceWith(prevWeekBtn.cloneNode(true));
      document.getElementById("prev-week").addEventListener("click", () => {
        this.handlePrevWeek();
      });
    }

    if (nextWeekBtn) {
      nextWeekBtn.replaceWith(nextWeekBtn.cloneNode(true));
      document.getElementById("next-week").addEventListener("click", () => {
        this.handleNextWeek();
      });
    }

    if (addEventBtn) {
      addEventBtn.replaceWith(addEventBtn.cloneNode(true));
      document.getElementById("add-event").addEventListener("click", () => {
        this.showAddEventModal();
      });
    }

    if (datePickerBtn) {
      datePickerBtn.replaceWith(datePickerBtn.cloneNode(true));
      document.getElementById("date-picker-btn").addEventListener("click", () => {
        this.showDatePicker();
      });
    }

    // Adăugăm event listener pentru click pe coloanele zilelor
    document.querySelectorAll('[id^="day-column-"]').forEach(column => {
      column.addEventListener('click', (e) => {
        if (e.target === column || e.target.classList.contains('border-t')) {
          const dateStr = column.dataset.date;
          if (dateStr) {
            this.selectedDate = new Date(dateStr);
            const selectedDateEl = document.getElementById("selected-date");
            if (selectedDateEl) {
              selectedDateEl.textContent = this.format(this.selectedDate, "PPP");
            }
            this.showAddEventModal();
          }
        }
      });
    });
    
    
document.querySelectorAll('[id^="modern-day-column-"]').forEach(column => {
  column.addEventListener('click', (e) => {
    if (e.target === column || e.target.classList.contains('border-b')) {
      const dateStr = column.dataset.date;
      if (dateStr) {
        this.selectedDate = new Date(dateStr);
        const selectedDateEl = document.getElementById("selected-date");
        if (selectedDateEl) {
          selectedDateEl.textContent = this.format(this.selectedDate, "PPP");
        }
        
        // Calculăm ora pe baza poziției click-ului
        const columnRect = column.getBoundingClientRect();
        const clickPositionY = e.clientY - columnRect.top;
        const hourHeight = 64; // Înălțimea unui bloc de o oră (h-16 = 64px)
        
        // Calculăm ora de început (8 AM este poziția de start)
        const hourOffset = clickPositionY / hourHeight;
        const startHour = Math.floor(8 + hourOffset);
        const startMinutes = Math.round((hourOffset - Math.floor(hourOffset)) * 60 / 15) * 15;
        
        // Ora de sfârșit (o oră mai târziu)
        let endHour = startHour;
        let endMinutes = startMinutes + 60;
        
        // Ajustăm dacă depășim 60 de minute
        if (endMinutes >= 60) {
          endHour = startHour + 1;
          endMinutes = endMinutes - 60;
        }
        
        // Verificăm ca orele să fie în intervalul valid (8-20)
        const validStartHour = Math.max(8, Math.min(20, startHour));
        const validEndHour = Math.max(8, Math.min(20, endHour));
        
        // Formatul pentru input type="time"
        const startTime = `${String(validStartHour).padStart(2, '0')}:${String(startMinutes).padStart(2, '0')}`;
        const endTime = `${String(validEndHour).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
        
        // Stocăm temporar orele pentru a le folosi în modal
        this.tempStartTime = startTime;
        this.tempEndTime = endTime;
        
        this.showAddEventModal();
      }
    }
  });
});
    
    console.log("Event listeners configurați cu succes");
  } catch (error) {
    console.error("Eroare la configurarea event listeners:", error);
  }
  }

  showDatePicker() {
    // Implementare simplă de date picker
    const datePicker = document.createElement("div");
    datePicker.className = "absolute top-full left-0 mt-1 bg-white p-2 border rounded-md shadow-lg z-10";
    datePicker.id = "date-picker";
    
    // Header cu luna curentă
    const currentMonth = new Date(this.selectedDate);
    currentMonth.setDate(1);
    
    datePicker.innerHTML = `
      <div class="flex justify-between items-center mb-2">
        <button id="prev-month" class="px-2">←</button>
        <div class="font-medium">${this.format(currentMonth, "MMM yyyy")}</div>
        <button id="next-month" class="px-2">→</button>
      </div>
      <div class="grid grid-cols-7 gap-1">
        <div class="text-center text-xs text-gray-500">L</div>
        <div class="text-center text-xs text-gray-500">M</div>
        <div class="text-center text-xs text-gray-500">M</div>
        <div class="text-center text-xs text-gray-500">J</div>
        <div class="text-center text-xs text-gray-500">V</div>
        <div class="text-center text-xs text-gray-500">S</div>
        <div class="text-center text-xs text-gray-500">D</div>
        ${this.generateCalendarDays(currentMonth)}
      </div>
    `;
    
    document.getElementById("date-picker-btn").parentNode.appendChild(datePicker);
    
    // Adăugăm event listeners pentru butoanele de navigare
    document.getElementById("prev-month").addEventListener("click", () => {
      currentMonth.setMonth(currentMonth.getMonth() - 1);
      const calendarDays = this.generateCalendarDays(currentMonth);
      document.querySelector("#date-picker .grid").innerHTML = `
        <div class="text-center text-xs text-gray-500">L</div>
        <div class="text-center text-xs text-gray-500">M</div>
        <div class="text-center text-xs text-gray-500">M</div>
        <div class="text-center text-xs text-gray-500">J</div>
        <div class="text-center text-xs text-gray-500">V</div>
        <div class="text-center text-xs text-gray-500">S</div>
        <div class="text-center text-xs text-gray-500">D</div>
        ${calendarDays}
      `;
      document.querySelector("#date-picker .font-medium").textContent = this.format(currentMonth, "MMM yyyy");
      this.setupDatePickerDays();
    });
    
    document.getElementById("next-month").addEventListener("click", () => {
      currentMonth.setMonth(currentMonth.getMonth() + 1);
      const calendarDays = this.generateCalendarDays(currentMonth);
      document.querySelector("#date-picker .grid").innerHTML = `
        <div class="text-center text-xs text-gray-500">L</div>
        <div class="text-center text-xs text-gray-500">M</div>
        <div class="text-center text-xs text-gray-500">M</div>
        <div class="text-center text-xs text-gray-500">J</div>
        <div class="text-center text-xs text-gray-500">V</div>
        <div class="text-center text-xs text-gray-500">S</div>
        <div class="text-center text-xs text-gray-500">D</div>
        ${calendarDays}
      `;
      document.querySelector("#date-picker .font-medium").textContent = this.format(currentMonth, "MMM yyyy");
      this.setupDatePickerDays();
    });
    
    // Închidere date picker când se face click în afara lui
    document.addEventListener("click", (e) => {
      if (!datePicker.contains(e.target) && e.target !== document.getElementById("date-picker-btn")) {
        datePicker.remove();
      }
    });
    
    this.setupDatePickerDays();
  }
  
  setupDatePickerDays() {
    document.querySelectorAll(".calendar-day").forEach(day => {
      day.addEventListener("click", () => {
        const dateValue = parseInt(day.dataset.value);
        const newDate = new Date(this.selectedDate);
        newDate.setDate(dateValue);
        this.selectedDate = newDate;
        document.getElementById("selected-date").textContent = this.format(this.selectedDate, "PPP");
        document.getElementById("date-picker").remove();
      });
    });
  }
  
  generateCalendarDays(month) {
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Ajustăm pentru a începe cu luni
    
    let days = '';
    
    // Adăugăm celule goale pentru zilele de la începutul lunii
    for (let i = 0; i < adjustedFirstDay; i++) {
      days += `<div class="text-center p-1 text-gray-300"></div>`;
    }
    
    // Adăugăm zilele lunii
    for (let i = 1; i <= daysInMonth; i++) {
      const isCurrentDay = i === this.selectedDate.getDate() && 
                          month.getMonth() === this.selectedDate.getMonth() && 
                          month.getFullYear() === this.selectedDate.getFullYear();
      
      days += `
        <div class="calendar-day text-center p-1 cursor-pointer ${isCurrentDay ? 'bg-blue-500 text-white rounded-full' : 'hover:bg-gray-100'}" data-value="${i}">
          ${i}
        </div>
      `;
    }
    
    return days;
  }

  handlePrevWeek() {
    this.currentDate = this.subDays(this.currentDate, 7);
    this.render();
  }

  handleNextWeek() {
    this.currentDate = this.addDays(this.currentDate, 7);
    this.render();
  }

showAddEventModal() {
  // Verifică dacă există deja un modal și îl elimină
  const existingModal = document.getElementById('add-event-modal');
  if (existingModal) {
    document.body.removeChild(existingModal);
  }
  
  // Setăm orele default
  const defaultStartTime = this.tempStartTime || `${String(new Date().getHours()).padStart(2, '0')}:00`;
  const defaultEndTime = this.tempEndTime || `${String(new Date().getHours() + 1).padStart(2, '0')}:00`;

// Resetăm valorile temporare după ce le-am folosit
this.tempStartTime = null;
this.tempEndTime = null;
  
  // Formatăm data selectată pentru input type="date"
  const formattedDate = this.formatDateForInput(this.selectedDate);
  
  // Creăm modalul optimizat
  const modal = document.createElement('div');
  modal.id = 'add-event-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    opacity: 0;
    transition: opacity 150ms ease-out;
  `;
  
  modal.innerHTML = `
    <div id="modal-content" style="
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
      width: 100%;
      max-width: 28rem;
      opacity: 0;
      transform: translateY(8px);
      transition: opacity 150ms ease-out, transform 150ms ease-out;
    ">
      <div style="
        padding: 1.25rem;
        border-bottom: 1px solid #e5e7eb;
        background: linear-gradient(to right, #eff6ff, #eef2ff);
        border-top-left-radius: 0.5rem;
        border-top-right-radius: 0.5rem;
      ">
        <h3 style="font-size: 1.125rem; font-weight: bold; color: #1f2937; margin: 0 0 0.25rem 0;">Adaugă eveniment nou</h3>
      </div>
      
      <form id="add-event-form" style="padding: 1.25rem;">
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div>
            <label style="
              display: block;
              font-size: 0.875rem;
              font-weight: 500;
              color: #374151;
              margin-bottom: 0.25rem;
            ">Titlu</label>
            <input type="text" id="event-title" required placeholder="Denumire eveniment" style="
              width: 100%;
              padding: 0.5rem;
              border: 1px solid #d1d5db;
              border-radius: 0.375rem;
              transition: border-color 150ms ease-out, box-shadow 150ms ease-out;
            " onfocus="this.style.boxShadow='0 0 0 2px rgba(59, 130, 246, 0.3)'; this.style.borderColor='#3b82f6';" 
              onblur="this.style.boxShadow=''; this.style.borderColor='#d1d5db';">
          </div>
          
          <div>
            <label style="
              display: block;
              font-size: 0.875rem;
              font-weight: 500;
              color: #374151;
              margin-bottom: 0.25rem;
            ">Data</label>
            <input type="date" id="event-date" required value="${formattedDate}" style="
              width: 100%;
              padding: 0.5rem;
              border: 1px solid #d1d5db;
              border-radius: 0.375rem;
              transition: border-color 150ms ease-out, box-shadow 150ms ease-out;
            " onfocus="this.style.boxShadow='0 0 0 2px rgba(59, 130, 246, 0.3)'; this.style.borderColor='#3b82f6';" 
              onblur="this.style.boxShadow=''; this.style.borderColor='#d1d5db';">
          </div>
          
          <div>
            <label style="
              display: block;
              font-size: 0.875rem;
              font-weight: 500;
              color: #374151;
              margin-bottom: 0.25rem;
            ">Categorie</label>
            <select id="event-category" required style="
              width: 100%;
              padding: 0.5rem;
              border: 1px solid #d1d5db;
              border-radius: 0.375rem;
              transition: border-color 150ms ease-out, box-shadow 150ms ease-out;
            " onfocus="this.style.boxShadow='0 0 0 2px rgba(59, 130, 246, 0.3)'; this.style.borderColor='#3b82f6';" 
              onblur="this.style.boxShadow=''; this.style.borderColor='#d1d5db';">
              <option value="work">Muncă</option>
              <option value="personal">Personal</option>
              <option value="study">Studiu</option>
              <option value="health">Sănătate</option>
              <option value="other">Altele</option>
            </select>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
              <label style="
                display: block;
                font-size: 0.875rem;
                font-weight: 500;
                color: #374151;
                margin-bottom: 0.25rem;
              ">Ora de început</label>
              <input type="time" id="event-start" required value="${defaultStartTime}" style="
                width: 100%;
                padding: 0.5rem;
                border: 1px solid #d1d5db;
                border-radius: 0.375rem;
                transition: border-color 150ms ease-out, box-shadow 150ms ease-out;
              " onfocus="this.style.boxShadow='0 0 0 2px rgba(59, 130, 246, 0.3)'; this.style.borderColor='#3b82f6';" 
                onblur="this.style.boxShadow=''; this.style.borderColor='#d1d5db';">
            </div>
            <div>
              <label style="
                display: block;
                font-size: 0.875rem;
                font-weight: 500;
                color: #374151;
                margin-bottom: 0.25rem;
              ">Ora de sfârșit</label>
              <input type="time" id="event-end" required value="${defaultEndTime}" style="
                width: 100%;
                padding: 0.5rem;
                border: 1px solid #d1d5db;
                border-radius: 0.375rem;
                transition: border-color 150ms ease-out, box-shadow 150ms ease-out;
              " onfocus="this.style.boxShadow='0 0 0 2px rgba(59, 130, 246, 0.3)'; this.style.borderColor='#3b82f6';" 
                onblur="this.style.boxShadow=''; this.style.borderColor='#d1d5db';">
            </div>
          </div>
        </div>
        
        <div style="
          padding-top: 1.25rem;
          margin-top: 1rem;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
        ">
          <button type="button" id="cancel-event" style="
            padding: 0.5rem 1rem;
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            color: #374151;
            cursor: pointer;
            transition: background-color 150ms ease-out, transform 150ms ease-out;
          " onmouseover="this.style.backgroundColor='#f3f4f6'; this.style.transform='translateY(-1px)';" 
            onmouseout="this.style.backgroundColor=''; this.style.transform='';">Anulează</button>
          
          <button type="submit" style="
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            background: linear-gradient(to right, #2563eb, #4f46e5);
            color: white;
            border: none;
            cursor: pointer;
            transition: filter 150ms ease-out, transform 150ms ease-out;
          " onmouseover="this.style.filter='brightness(1.1)'; this.style.transform='translateY(-1px)';" 
            onmouseout="this.style.filter=''; this.style.transform='';">Salvează</button>
        </div>
      </form>
    </div>
  `;
  
  // Adăugăm modalul la DOM
  document.body.appendChild(modal);
  
  // Activăm animația de apariție
  setTimeout(() => {
    modal.style.opacity = '1';
    const modalContent = document.getElementById('modal-content');
    if (modalContent) {
      modalContent.style.opacity = '1';
      modalContent.style.transform = 'translateY(0)';
    }
  }, 10);
  
  // Funcția pentru închiderea modalului
  const closeModal = () => {
    const modal = document.getElementById('add-event-modal');
    if (modal) {
      modal.style.opacity = '0';
      const modalContent = document.getElementById('modal-content');
      if (modalContent) {
        modalContent.style.opacity = '0';
        modalContent.style.transform = 'translateY(8px)';
      }
      
      setTimeout(() => {
        if (modal.parentNode) {
          modal.parentNode.removeChild(modal);
        }
      }, 150);
    }
  };
  
  // Event handler pentru submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const title = document.getElementById('event-title').value;
    const dateInput = document.getElementById('event-date').value;
    const eventDate = new Date(dateInput);
    const category = document.getElementById('event-category').value;
    const startTime = document.getElementById('event-start').value;
    const endTime = document.getElementById('event-end').value;
    
    // Aici adaugi logica ta pentru salvarea evenimentului
    this.handleAddTimeBlock({
      title,
      category,
      startTime,
      endTime,
      date: eventDate
    });
    
    closeModal();
  };
  
  // Adăugăm event listeners
  document.getElementById('cancel-event').addEventListener('click', closeModal);
  document.getElementById('add-event-form').addEventListener('submit', handleSubmit);
  
  // Închiderea modalului când se face click în afara lui
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  // Focus pe câmpul de titlu pentru o experiență mai bună
  setTimeout(() => {
    document.getElementById('event-title').focus();
  }, 200);
}

// Adaugă această funcție pentru a formata data pentru input type="date"
formatDateForInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
handleAddTimeBlock() {
    try {
        const titleEl = document.getElementById("event-title");
        const categoryEl = document.getElementById("event-category");
        const startTimeEl = document.getElementById("event-start");
        const endTimeEl = document.getElementById("event-end");
        
        if (!titleEl || !categoryEl || !startTimeEl || !endTimeEl) {
            console.error("Nu s-au găsit elementele necesare");
            return;
        }
        
        const title = titleEl.value.trim();
        const category = categoryEl.value;
        const startTime = startTimeEl.value;
        const endTime = endTimeEl.value;
        
        if (!title || !startTime || !endTime) {
            alert("Te rog completează toate câmpurile!");
            return;
        }

        // Create start and end dates
        const [startHours, startMinutes] = startTime.split(":").map(Number);
        const [endHours, endMinutes] = endTime.split(":").map(Number);

        const startDate = new Date(this.selectedDate);
        startDate.setHours(startHours, startMinutes, 0, 0);

        const endDate = new Date(this.selectedDate);
        endDate.setHours(endHours, endMinutes, 0, 0);

        // Validare dată
        if (endDate <= startDate) {
            alert("Ora de sfârșit trebuie să fie după ora de început!");
            return;
        }

        // Add new time block
        const newBlock = {
            id: Date.now().toString(),
            title: title,
            start: startDate,
            end: endDate,
            category: category
        };

        this.timeBlocks.push(newBlock);
        this.saveToLocalStorage();
        this.render();
        
        console.log("Eveniment adăugat cu succes:", newBlock);
    } catch (error) {
        console.error("Eroare la adăugarea evenimentului:", error);
    }
}
  showEditEventModal(event) {
      console.log("Opening edit modal for event:", event);
      
      // Trigger mouseleave on all events to reset their visual state
      document.querySelectorAll('.absolute.rounded-md[class*="bg-"]').forEach(eventEl => {
          const mouseLeaveEvent = new MouseEvent('mouseleave');
          eventEl.dispatchEvent(mouseLeaveEvent);
      });
      
      const modal = document.createElement("div");
      modal.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";

    const startTime = `${String(event.start.getHours()).padStart(2, '0')}:${String(event.start.getMinutes()).padStart(2, '0')}`;
    const endTime = `${String(event.end.getHours()).padStart(2, '0')}:${String(event.end.getMinutes()).padStart(2, '0')}`;

    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div class="p-4 border-b">
                <h3 class="text-lg font-medium">Editează eveniment</h3>
                <div class="text-sm text-gray-500">Data: ${this.format(event.start, "PPP")}</div>
            </div>
            <div class="p-4">
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Titlu</label>
                        <input type="text" id="edit-title" class="w-full p-2 border rounded-md" value="${event.title}">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Categorie</label>
                        <select id="edit-category" class="w-full p-2 border rounded-md">
                            <option value="work" ${event.category === 'work' ? 'selected' : ''}>Muncă</option>
                            <option value="personal" ${event.category === 'personal' ? 'selected' : ''}>Personal</option>
                            <option value="study" ${event.category === 'study' ? 'selected' : ''}>Studiu</option>
                            <option value="health" ${event.category === 'health' ? 'selected' : ''}>Sănătate</option>
                            <option value="other" ${event.category === 'other' ? 'selected' : ''}>Altele</option>
                        </select>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">Ora de început</label>
                            <input type="time" id="edit-start" class="w-full p-2 border rounded-md" value="${startTime}">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Ora de sfârșit</label>
                            <input type="time" id="edit-end" class="w-full p-2 border rounded-md" value="${endTime}">
                        </div>
                    </div>
                </div>
            </div>
            <div class="p-4 border-t flex justify-end space-x-2">
                <button type="button" id="cancel-edit" class="px-4 py-2 border rounded-md">Anulează</button>
                <button type="button" id="delete-event" class="px-4 py-2 border rounded-md text-red-500">Șterge</button>
                <button type="button" id="save-edit" class="px-4 py-2 bg-blue-600 text-white rounded-md">Salvează</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Stashing the 'this' reference
    const self = this;
    
    // Set up event listeners with error handling
    try {
        const saveButton = document.getElementById('save-edit');
        console.log("Save button element:", saveButton);
        
        if (saveButton) {
            saveButton.addEventListener('click', function(e) {
                try {
                    console.log("Save button clicked");
                    e.preventDefault();
                    
                    const titleInput = document.getElementById('edit-title');
                    const categoryInput = document.getElementById('edit-category');
                    const startInput = document.getElementById('edit-start');
                    const endInput = document.getElementById('edit-end');
                    
                    console.log("Form values:", {
                        title: titleInput.value,
                        category: categoryInput.value,
                        start: startInput.value,
                        end: endInput.value
                    });
                    
                    // Parse the time inputs
                    const [startHours, startMinutes] = startInput.value.split(':').map(Number);
                    const [endHours, endMinutes] = endInput.value.split(':').map(Number);
                    
                    console.log("Parsed times:", {startHours, startMinutes, endHours, endMinutes});
                    
                    // Create new Date objects
                    const updatedStart = new Date(event.start);
                    updatedStart.setHours(startHours, startMinutes, 0, 0);
                    
                    const updatedEnd = new Date(event.end);
                    updatedEnd.setHours(endHours, endMinutes, 0, 0);
                    
                    console.log("New dates:", {updatedStart, updatedEnd});
                    
                    // Create the updated event object
                    const updatedEvent = {
                        id: event.id,
                        title: titleInput.value,
                        category: categoryInput.value,
                        start: updatedStart,
                        end: updatedEnd
                    };
                    
                    console.log("Updated event:", updatedEvent);
                    
                    // Update the event
                    self.editTimeBlock(event.id, updatedEvent);
                    
                    // Remove the modal
                    document.body.removeChild(modal);
                    
                    console.log("Edit completed and modal closed");
                } catch (error) {
                    console.error("Error in save event handler:", error);
                }
            });
        } else {
            console.error("Could not find save button element!");
        }
        
        const cancelButton = document.getElementById('cancel-edit');
        if (cancelButton) {
            cancelButton.addEventListener('click', function() {
                console.log("Cancel button clicked");
                document.body.removeChild(modal);
            });
        }
        
        const deleteButton = document.getElementById('delete-event');
        if (deleteButton) {
            deleteButton.addEventListener('click', function() {
                console.log("Delete button clicked");
                document.body.removeChild(modal); // Închide mai întâi modalul de editare
                self.showDeleteConfirmationDialog(event.id);
            });
        }
        
        // Close on outside click
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                console.log("Outside modal clicked, closing");
                document.body.removeChild(modal);
            }
        });
        
    } catch (error) {
        console.error("Error setting up event listeners:", error);
    }
    
    console.log("Edit modal setup complete");
}
handleOverlappingEvents() {
  try {
    // Selectăm toate evenimentele din calendar
    let events = document.querySelectorAll('.absolute.rounded-md[class*="bg-"]');
    
    // Fallback la selecție alternativă dacă e nevoie
    if (events.length === 0) {
      events = document.querySelectorAll('[class*="bg-blue-500"], [class*="bg-green-500"], [class*="bg-purple-500"], [class*="bg-red-500"], [class*="bg-gray-500"]');
    }
    
    // Aplicăm stilurile pentru fiecare eveniment
    events.forEach((event, index) => {
      // Adăugăm efectele vizuale de bază
      event.style.zIndex = 10 + index;
      
      // Gestionăm evenimentele de mouse
      event.onmouseenter = function() {
        this.style.zIndex = 999;
        this.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
        this.style.transform = 'scale(1.02)';
      };
      
      event.onmouseleave = function() {
        this.style.zIndex = 10 + Array.from(events).indexOf(this);
        this.style.boxShadow = '';
        this.style.transform = '';
      };
    });
  } catch (error) {
    console.error("Eroare:", error);
  }
}
}

// Initialize calendar when loaded into the page
function initCalendar(containerId) {
  try {
    console.log("Inițializare calendar în containerul:", containerId);
    const calendar = new Calendar(containerId);
    calendar.init();
    console.log("Calendar inițializat cu succes");
    return calendar;
  } catch (error) {
    console.error("Eroare la inițializarea calendarului:", error);
  }
}
