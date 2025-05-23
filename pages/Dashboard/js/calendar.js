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
    } else if (formatStr === "HH:mm") {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
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
    <div class="w-full bg-gray-50 dark:bg-[#1e2837] rounded-lg shadow-lg overflow-hidden">
      <!-- Header with days -->
      <div class="grid grid-cols-8 bg-white dark:bg-[#1e2837] border-b dark:border-gray-700/50">
        <!-- Empty cell for time column -->
        <div class="p-3 border-r dark:border-gray-700/50"></div>
        
        <!-- Day headers -->
        ${daysOfWeek.map(day => `
          <div class="p-3 text-center border-r dark:border-gray-700/50 last:border-r-0 ${this.isSameDay(day, new Date()) ? 'bg-purple-50 dark:bg-[#233045]' : ''}">
            <div class="text-sm font-medium dark:text-gray-300">${this.format(day, "EEE")}</div>
            <div class="text-2xl font-bold ${this.isSameDay(day, new Date()) ? 'text-[#7a65db] dark:text-[#7a65db]' : 'dark:text-white'}">${this.format(day, "d")}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">${this.format(day, "MMM")}</div>
          </div>
        `).join('')}
      </div>
      
      <!-- Time grid -->
      <div class="grid grid-cols-8">
        <!-- Time column -->
        <div class="border-r dark:border-gray-700/50">
          ${timeSlots.map(hour => `
            <div class="h-16 relative border-b dark:border-gray-700/50">
              <span class="absolute -top-2 left-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                ${hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
              </span>
            </div>
          `).join('')}
        </div>
        
        <!-- Day columns -->
        ${daysOfWeek.map((day, index) => `
          <div class="relative border-r dark:border-gray-700/50 last:border-r-0" id="modern-day-column-${index}" data-date="${day.toISOString()}">
            ${timeSlots.map(hour => `
              <div class="h-16 border-b dark:border-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-150"></div>
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
  const daysOfWeek = this.eachDayOfInterval({ start: weekStart, end: weekEnd });

  const html = `
    <div class="w-full h-full bg-white dark:bg-[#1e2837] rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800">
      <!-- Header Section -->
      <div class="flex flex-row items-center justify-between p-6 border-b dark:border-gray-800">
        <div class="flex items-center space-x-4">
          <h2 class="text-2xl font-bold bg-gradient-to-r from-[#7a65db] to-[#9d88ff] bg-clip-text text-transparent">
            Calendar
          </h2>
          <span class="px-3 py-1 text-sm font-medium text-[#7a65db] dark:text-[#9d88ff] bg-purple-50 dark:bg-purple-900/20 rounded-full">
            ${this.format(weekStart, "MMM yyyy")}
          </span>
        </div>
        
        <div class="flex items-center space-x-3">
          <div class="flex items-center bg-gray-50 dark:bg-gray-800/50 rounded-lg p-1">
            <button id="prev-week" class="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-all duration-200">
              <svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <div class="px-4 font-medium text-gray-600 dark:text-gray-300">
              ${this.format(weekStart, "MMM d")} - ${this.format(weekEnd, "MMM d")}
            </div>
            <button id="next-week" class="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-all duration-200">
              <svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          <button id="add-event" class="px-4 py-2 bg-gradient-to-r from-[#7a65db] to-[#9d88ff] hover:from-[#6952c7] hover:to-[#8b74ff] text-white rounded-lg shadow-lg shadow-purple-500/20 flex items-center space-x-2 transform hover:scale-105 transition-all duration-200">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            <span>Adaugă eveniment</span>
          </button>

          <button id="export-week" class="p-2 text-gray-600 dark:text-gray-300 hover:text-[#7a65db] dark:hover:text-[#9d88ff] rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="p-6">
        ${this.generateModernGrid(daysOfWeek)}
      </div>
    </div>
  `;

  this.container.innerHTML = html;
  if (window.lucide) {
    window.lucide.createIcons();
  }
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

  // Funcție comună pentru actualizarea afișării timpului
  const updateTimeDisplay = () => {
    const timeDisplay = element.querySelector('div:nth-child(2)');
    if (timeDisplay) {
      timeDisplay.textContent = `${this.format(block.start, "h:mm a")} - ${this.format(block.end, "h:mm a")}`;
    }
  };

  // Funcție pentru gestionarea tragerii
  element.addEventListener('mousedown', (e) => {
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

      // Verifică limitele
      if (newStart.getHours() < 8 || newEnd.getHours() > 20) return;

      element.style.top = `${startTop + dy}px`;
      block.start = newStart;
      block.end = newEnd;
      
      updateTimeDisplay();
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
  });

  // Funcție pentru gestionarea redimensionării
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
          // Redimensionare de sus
          const newStart = new Date(originalStart.getTime() + deltaMinutes * 60000);
          
          // Validare
          if (newStart >= originalEnd || newStart.getHours() < 8) return;
          
          const newTop = (newStart.getHours() - 8) * 50 + (newStart.getMinutes() / 60) * 50;
          const newHeight = startHeight + (startTop - newTop);
          
          element.style.top = `${newTop}px`;
          element.style.height = `${newHeight}px`;
          block.start = newStart;
        } else {
          // Redimensionare de jos 
          const newEnd = new Date(originalEnd.getTime() + deltaMinutes * 60000);
          
          // Validare
          if (newEnd <= originalStart || newEnd.getHours() > 20 || 
              (newEnd.getHours() === 20 && newEnd.getMinutes() > 0)) return;
          
          const newHeight = startHeight + dy;
          if (newHeight < 25) return;
          
          element.style.height = `${newHeight}px`;
          block.end = newEnd;
        }
        
        updateTimeDisplay();
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

  // Configurare pentru mânerele de redimensionare
  setupResizeHandler(topHandle, true);
  setupResizeHandler(bottomHandle, false);
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
async showDeleteConfirmationDialog(eventId) {
    const isDarkMode = document.documentElement.classList.contains('dark');
    const event = this.timeBlocks.find(e => e.id === eventId);
    
    if (!event) {
        console.error("Event not found:", eventId);
        return false;
    }
    
    const dialogOverlay = document.createElement('div');
    dialogOverlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    dialogOverlay.id = 'delete-confirm-dialog';
    
    dialogOverlay.innerHTML = `
        <div class="transform transition-all duration-300 scale-95 opacity-0">
            <div class="${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl p-6 max-w-sm mx-4 relative">
                <div class="flex items-center mb-4">
                    <div class="rounded-full ${isDarkMode ? 'bg-red-900' : 'bg-red-100'} p-2 mr-3">
                        <svg class="w-6 h-6 ${isDarkMode ? 'text-red-500' : 'text-red-600'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                        </svg>
                    </div>
                    <h3 class="text-lg font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}">Confirmare ștergere</h3>
                </div>
                
                <div class="mb-6">
                    <p class="${isDarkMode ? 'text-gray-300' : 'text-gray-600'}">
                        Ești sigur că vrei să ștergi acest eveniment?<br>
                        <span class="font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}">"${event.title}"</span>
                    </p>
                    <div class="mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}">
                        ${this.format(event.start, "HH:mm")} - ${this.format(event.end, "HH:mm")}
                    </div>
                </div>
                
                <div class="flex justify-end space-x-3">
                    <button id="cancel-delete" 
                        class="${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} 
                        px-4 py-2 rounded-md transition-colors duration-200">
                        Anulează
                    </button>
                    <button id="confirm-delete" 
                        class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors duration-200">
                        Șterge
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(dialogOverlay);

    // Animate in
    requestAnimationFrame(() => {
        const dialog = dialogOverlay.querySelector('div');
        dialog.classList.remove('scale-95', 'opacity-0');
        dialog.classList.add('scale-100', 'opacity-100');
    });

    return new Promise((resolve) => {
        const handleCancel = () => {
            this.animateAndRemoveDialog(dialogOverlay);
            resolve(false);
        };

        const handleConfirm = () => {
            this.animateAndRemoveDialog(dialogOverlay);
            resolve(true);
        };

        const handleOutsideClick = (e) => {
            if (e.target === dialogOverlay) {
                handleCancel();
            }
        };

        // Add event listeners
        dialogOverlay.querySelector('#cancel-delete').addEventListener('click', handleCancel);
        dialogOverlay.querySelector('#confirm-delete').addEventListener('click', handleConfirm);
        dialogOverlay.addEventListener('click', handleOutsideClick);
    });
}

animateAndRemoveDialog(dialog) {
        const dialogContent = dialog.querySelector('div');
        dialogContent.classList.remove('scale-100', 'opacity-100');
        dialogContent.classList.add('scale-95', 'opacity-0');
        
        setTimeout(() => {
            if (dialog && dialog.parentNode) {
                dialog.remove();
            }
        }, 200);
    }

    // Update deleteTimeBlock to use class methods
    async deleteTimeBlock(id) {
    try {
        const shouldDelete = await this.showDeleteConfirmationDialog(id);
        if (!shouldDelete) return false;

        const index = this.timeBlocks.findIndex(block => block.id === id);
        if (index === -1) {
            console.error("Could not find event with ID:", id);
            return false;
        }

        this.timeBlocks.splice(index, 1);
        this.saveToLocalStorage();
        this.render();
        return true;
    } catch (error) {
        console.error("Error deleting time block:", error);
        return false;
    }
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
    const exportWeekBtn = document.getElementById("export-week");
    const datePickerBtn = document.getElementById("date-picker-btn");
    
    // Add event listener for export button
    if (exportWeekBtn) {
      exportWeekBtn.replaceWith(exportWeekBtn.cloneNode(true));
      document.getElementById("export-week").addEventListener("click", () => {
        this.exportWeekData();
      });
    }
    
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
  
  // Detectăm dacă este activ dark mode
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  // Creăm modalul optimizat
  const modal = document.createElement('div');
  modal.id = 'add-event-modal';
  modal.className = isDarkMode ? 'dark' : '';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, ${isDarkMode ? '0.7' : '0.5'});
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    opacity: 0;
    transition: opacity 150ms ease-out;
  `;
  
  // Înlocuiește stilurile actuale cu acestea:
  const styles = {
    dark: {
      modalBg: '#1f2937',
      headerBg: '#1a1f2e',
      borderColor: '#374151',
      inputBg: '#1f2937',
      inputBorder: '#4b5563',
      textColor: '#f3f4f6',
      labelColor: '#d1d5db',
      shadowColor: '0.4',
      buttonPrimaryBg: '#7a65db',
      buttonSecondaryBg: '#374151',
      buttonSecondaryText: '#d1d5db',
      buttonSecondaryBorder: '#4b5563'
    },
    light: {
      modalBg: '#ffffff',
      headerBg: '#f8fafc',
      borderColor: '#e5e7eb',
      inputBg: '#ffffff',
      inputBorder: '#e2e8f0',
      textColor: '#1f2937',
      labelColor: '#6b7280',
      shadowColor: '0.1',
      buttonPrimaryBg: '#3b82f6',
      buttonSecondaryBg: '#ffffff',
      buttonSecondaryText: '#4b5563',
      buttonSecondaryBorder: '#e2e8f0'
    }
  };

  // Apoi, modifică tema pentru a fi aplicată corect
  const theme = isDarkMode ? styles.dark : styles.light;

  modal.innerHTML = `
    <div id="modal-content" style="
      background-color: ${theme.modalBg};
      border-radius: 0.5rem;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, ${theme.shadowColor});
      width: 100%;
      max-width: 28rem;
      opacity: 0;
      transform: translateY(8px);
      transition: opacity 150ms ease-out, transform 150ms ease-out;
      color: ${theme.textColor};
    ">
      <div style="
        padding: 1.25rem;
        border-bottom: 1px solid ${theme.borderColor};
        background: ${theme.headerBg};
        border-top-left-radius: 0.5rem;
        border-top-right-radius: 0.5rem;
      ">
        <h3 style="
          font-size: 1.125rem; 
          font-weight: bold; 
          color: ${theme.textColor}; 
          margin: 0 0 0.25rem 0;
        ">Adaugă eveniment nou</h3>
      </div>
      
      <!-- Aplică același pattern pentru inputuri -->
      <form id="add-event-form" style="padding: 1.25rem;">
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div>
            <label style="
              display: block;
              font-size: 0.875rem;
              font-weight: 500;
              color: ${theme.labelColor};
              margin-bottom: 0.25rem;
            ">Titlu</label>
            <input type="text" id="event-title" required placeholder="Denumire eveniment" style="
              width: 100%;
              padding: 0.5rem;
              border: 1px solid ${theme.inputBorder};
              border-radius: 0.375rem;
              background-color: ${theme.inputBg};
              color: ${theme.textColor};
              transition: border-color 150ms ease-out, box-shadow 150ms ease-out;
            ">
          </div>
          
          <div>
            <label style="
              display: block;
              font-size: 0.875rem;
              font-weight: 500;
              color: ${theme.labelColor};
              margin-bottom: 0.25rem;
            ">Data</label>
            <input type="date" id="event-date" required value="${formattedDate}" style="
              width: 100%;
              padding: 0.5rem;
              border: 1px solid ${theme.inputBorder};
              border-radius: 0.375rem;
              background-color: ${theme.inputBg};
              color: ${theme.textColor};
              transition: border-color 150ms ease-out, box-shadow 150ms ease-out;
            "
            onfocus="this.style.boxShadow='0 0 0 2px rgba(59, 130, 246, ${isDarkMode ? '0.5' : '0.3'})'; this.style.borderColor='#3b82f6';" 
            onblur="this.style.boxShadow=''; this.style.borderColor='${isDarkMode ? '#4b5563' : '#d1d5db'}';">
          </div>
          
          <div>
            <label style="
              display: block;
              font-size: 0.875rem;
              font-weight: 500;
              color: ${theme.labelColor};
              margin-bottom: 0.25rem;
            ">Categorie</label>
            <select id="event-category" required style="
              width: 100%;
              padding: 0.5rem;
              border: 1px solid ${theme.inputBorder};
              border-radius: 0.375rem;
              background-color: ${theme.inputBg};
              color: ${theme.textColor};
              transition: border-color 150ms ease-out, box-shadow 150ms ease-out;
            "
            onfocus="this.style.boxShadow='0 0 0 2px rgba(59, 130, 246, ${isDarkMode ? '0.5' : '0.3'})'; this.style.borderColor='#3b82f6';" 
            onblur="this.style.boxShadow=''; this.style.borderColor='${isDarkMode ? '#4b5563' : '#d1d5db'}';">
              <option value="work" style="background-color: ${isDarkMode ? '#374151' : 'white'}; color: ${isDarkMode ? '#f3f4f6' : '#1f2937'};">Muncă</option>
              <option value="personal" style="background-color: ${isDarkMode ? '#374151' : 'white'}; color: ${isDarkMode ? '#f3f4f6' : '#1f2937'};">Personal</option>
              <option value="study" style="background-color: ${isDarkMode ? '#374151' : 'white'}; color: ${isDarkMode ? '#f3f4f6' : '#1f2937'};">Studiu</option>
              <option value="health" style="background-color: ${isDarkMode ? '#374151' : 'white'}; color: ${isDarkMode ? '#f3f4f6' : '#1f2937'};">Sănătate</option>
              <option value="other" style="background-color: ${isDarkMode ? '#374151' : 'white'}; color: ${isDarkMode ? '#f3f4f6' : '#1f2937'};">Altele</option>
            </select>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
              <label style="
                display: block;
                font-size: 0.875rem;
                font-weight: 500;
                color: ${theme.labelColor};
                margin-bottom: 0.25rem;
              ">Ora de început</label>
              <input type="time" 
                id="event-start" 
                required 
                value="${defaultStartTime}" 
                min="08:00"
                max="21:00"
                style="
                  width: 100%;
                  padding: 0.5rem;
                  border: 1px solid ${theme.inputBorder};
                  border-radius: 0.375rem;
                  background-color: ${theme.inputBg};
                  color: ${theme.textColor};
                  transition: border-color 150ms ease-out, box-shadow 150ms ease-out;
                " 
                onfocus="this.style.boxShadow='0 0 0 2px rgba(59, 130, 246, ${isDarkMode ? '0.5' : '0.3'})'; this.style.borderColor='#3b82f6';" 
                onblur="this.style.boxShadow=''; this.style.borderColor='${isDarkMode ? '#4b5563' : '#d1d5db'}';">
            </div>
            <div>
              <label style="
                display: block;
                font-size: 0.875rem;
                font-weight: 500;
                color: ${theme.labelColor};
                margin-bottom: 0.25rem;
              ">Ora de sfârșit</label>
              <input type="time" 
                id="event-end" 
                required 
                value="${defaultEndTime}"
                min="08:00"
                max="21:00"
                style="
                  width: 100%;
                  padding: 0.5rem;
                  border: 1px solid ${theme.inputBorder};
                  border-radius: 0.375rem;
                  background-color: ${theme.inputBg};
                  color: ${theme.textColor};
                  transition: border-color 150ms ease-out, box-shadow 150ms ease-out;
                " 
                onfocus="this.style.boxShadow='0 0 0 2px rgba(59, 130, 246, ${isDarkMode ? '0.5' : '0.3'})'; this.style.borderColor='#3b82f6';" 
                onblur="this.style.boxShadow=''; this.style.borderColor='${isDarkMode ? '#4b5563' : '#d1d5db'}';">
            </div>
          </div>
        </div>
        
        <!-- Butoane -->
        <div style="
          padding-top: 1.25rem;
          margin-top: 1rem;
          border-top: 1px solid ${theme.borderColor};
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
        ">
          <button type="button" id="cancel-event" style="
            padding: 0.5rem 1rem;
            border: 1px solid ${theme.buttonSecondaryBorder};
            border-radius: 0.375rem;
            background-color: ${theme.buttonSecondaryBg};
            color: ${theme.buttonSecondaryText};
            cursor: pointer;
            transition: all 150ms ease-out;
          ">Anulează</button>
          
          <button type="submit" style="
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            background: ${theme.buttonPrimaryBg};
            color: white;
            border: none;
            cursor: pointer;
            transition: all 150ms ease-out;
          ">Salvează</button>
        </div>
      </form>
    </div>
  `;
  
  // Adăugăm stiluri speciale pentru dark mode
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    .dark-mode input::-webkit-calendar-picker-indicator {
      filter: invert(1);
    }
    
    .dark-mode select option {
      background-color: #111827;
      color: #f3f4f6;
    }
    
    .dark-mode ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
  `;
  
  document.head.appendChild(styleElement);
  
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
      
      // Găsim și eliminăm doar stilurile specifice modalului
      const styleElements = document.querySelectorAll('style');
      styleElements.forEach(style => {
          if (style.innerHTML.includes('.dark-mode')) {
              style.remove();
          }
      });
      
      setTimeout(() => {
        // Eliminăm modalul doar dacă încă există în DOM
        if (modal && modal.parentNode) {
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
    
    this.handleAddTimeBlock({
        title,
        category,
        startTime,
        endTime,
        date: eventDate
    });
    
    closeModal(); // Folosește aceeași funcție de închidere
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
handleAddTimeBlock({title, category, startTime, endTime, date}) {
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

        // Parse times
        const [startHours, startMinutes] = startTime.split(":").map(Number);
        const [endHours, endMinutes] = endTime.split(":").map(Number);

        // Validate time range
        if (startHours < 8 || (endHours >= 21 && endMinutes > 0) || endHours > 21) {
            alert("Programul este disponibil doar între orele 8:00 și 21:00!");
            return;
        }

        // Create dates
        const startDate = new Date(this.selectedDate);
        startDate.setHours(startHours, startMinutes, 0, 0);

        const endDate = new Date(this.selectedDate);
        endDate.setHours(endHours, endMinutes, 0, 0);

        // Validate end time is after start time
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
        alert("A apărut o eroare la adăugarea evenimentului!");
    }
}
showEditEventModal(event) {
      console.log("Opening edit modal for event:", event);
      
      // Adaugă detectarea pentru dark mode
      const isDarkMode = document.documentElement.classList.contains('dark');
      
      // Trigger mouseleave on all events to reset their visual state
      document.querySelectorAll('.absolute.rounded-md[class*="bg-"]').forEach(eventEl => {
          const mouseLeaveEvent = new MouseEvent('mouseleave');
          eventEl.dispatchEvent(mouseLeaveEvent);
      });
      
      const modal = document.createElement("div");
      modal.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
      modal.style.opacity = "0";
      modal.style.transition = "opacity 150ms ease-out";

    const startTime = `${String(event.start.getHours()).padStart(2, '0')}:${String(event.start.getMinutes()).padStart(2, '0')}`;
    const endTime = `${String(event.end.getHours()).padStart(2, '0')}:${String(event.end.getMinutes()).padStart(2, '0')}`;

    // Înlocuiește stilurile actuale cu acestea:
    const styles = {
      dark: {
        modalBg: '#1f2937',
        headerBg: 'linear-gradient(to right, #1e3a8a, #312e81)',
        borderColor: '#374151',
        inputBg: '#374151',
        inputBorder: '#4b5563',
        textColor: '#f3f4f6',
        labelColor: '#d1d5db',
        shadowColor: '0.4',
        buttonPrimaryBg: 'linear-gradient(to right, #1d4ed8, #4338ca)',
        buttonSecondaryBg: '#374151',
        buttonSecondaryText: '#d1d5db',
        buttonSecondaryBorder: '#4b5563'
      },
      light: {
        modalBg: '#ffffff',
        headerBg: 'linear-gradient(to right, #f0f9ff, #e0f2fe)',
        borderColor: '#e5e7eb',
        inputBg: '#ffffff',
        inputBorder: '#d1d5db',
        textColor: '#1f2937',
        labelColor: '#374151',
        shadowColor: '0.2',
        buttonPrimaryBg: 'linear-gradient(to right, #2563eb, #4f46e5)',
        buttonSecondaryBg: '#ffffff',
        buttonSecondaryText: '#374151',
        buttonSecondaryBorder: '#d1d5db'
      }
    };

    const theme = isDarkMode ? styles.dark : styles.light;

    modal.innerHTML = `
        <div class="bg-white dark:bg-[#1e2837] rounded-lg shadow-lg w-full max-w-md transform translate-y-4 transition-transform duration-150 ease-out" id="modal-content">
            <div class="p-4 border-b dark:border-gray-700/50">
                <h3 class="text-lg font-medium dark:text-white">Editează eveniment</h3>
                <div class="text-sm text-gray-500 dark:text-gray-400">Data: ${this.format(event.start, "PPP")}</div>
            </div>
            <div class="p-4">
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-300">Titlu</label>
                        <input type="text" id="edit-title" class="w-full p-2 border rounded-md dark:bg-[#233045] dark:border-gray-700/50 dark:text-white focus:ring-[#7a65db] focus:border-[#7a65db]" value="${event.title}">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1 dark:text-gray-300">Categorie</label>
                        <select id="edit-category" class="w-full p-2 border rounded-md dark:bg-[#233045] dark:border-gray-700/50 dark:text-white focus:ring-[#7a65db] focus:border-[#7a65db]">
                            <option value="work" ${event.category === 'work' ? 'selected' : ''}>Muncă</option>
                            <option value="personal" ${event.category === 'personal' ? 'selected' : ''}>Personal</option>
                            <option value="study" ${event.category === 'study' ? 'selected' : ''}>Studiu</option>
                            <option value="health" ${event.category === 'health' ? 'selected' : ''}>Sănătate</option>
                            <option value="other" ${event.category === 'other' ? 'selected' : ''}>Altele</option>
                        </select>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-1 dark:text-gray-300">Ora de început</label>
                            <input 
                                type="time" 
                                id="edit-start" 
                                class="w-full p-2 border rounded-md dark:bg-[#233045] dark:border-gray-700/50 dark:text-white focus:ring-[#7a65db] focus:border-[#7a65db]" 
                                value="${startTime}"
                                min="08:00"
                                max="21:00"
                                required
                            >
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1 dark:text-gray-300">Ora de sfârșit</label>
                            <input 
                                type="time" 
                                id="edit-end" 
                                class="w-full p-2 border rounded-md dark:bg-[#233045] dark:border-gray-700/50 dark:text-white focus:ring-[#7a65db] focus:border-[#7a65db]" 
                                value="${endTime}"
                                min="08:00"
                                max="21:00"
                                required
                            >
                        </div>
                    </div>
                </div>
            </div>
            <div class="p-4 border-t dark:border-gray-700/50 flex justify-end space-x-2">
                <button type="button" id="cancel-edit" class="px-4 py-2 border rounded-md dark:border-gray-700/50 dark:bg-[#233045] dark:text-gray-300 dark:hover:bg-[#1a2535]">Anulează</button>
                <button type="button" id="delete-event" class="px-4 py-2 border rounded-md dark:border-gray-700/50 dark:bg-[#233045] text-red-500 dark:text-red-400 dark:hover:bg-[#1a2535]">Șterge</button>
                <button type="button" id="save-edit" class="px-4 py-2 bg-blue-600 dark:bg-[#7a65db] hover:bg-blue-700 dark:hover:bg-[#6a55cb] text-white rounded-md">Salvează</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    
    // Activate the smooth animation after a short delay
    setTimeout(() => {
        modal.style.opacity = "1";
        const modalContent = document.getElementById('modal-content');
        if (modalContent) {
            modalContent.style.transform = "translateY(0)";
        }
    }, 10);

    // Add event listeners for all buttons
    document.getElementById('cancel-edit').addEventListener('click', () => {
        // Add smooth close animation
        modal.style.opacity = "0";
        const modalContent = document.getElementById('modal-content');
        if (modalContent) {
            modalContent.style.transform = "translateY(4px)";
        }
        
        // Remove the modal after animation completes
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 150);
    });

   document.getElementById('delete-event').addEventListener('click', async () => {
            const deleted = await this.deleteTimeBlock(event.id);
            if (deleted) {
                modal.style.opacity = "0";
                setTimeout(() => {
                    document.body.removeChild(modal);
                }, 150);
            }
        });;

    const saveButton = document.getElementById('save-edit');
    if (saveButton) {
        saveButton.addEventListener('click', (e) => {
            try {
                e.preventDefault();
                
                const titleInput = document.getElementById('edit-title');
                const categoryInput = document.getElementById('edit-category');
                const startInput = document.getElementById('edit-start');
                const endInput = document.getElementById('edit-end');
                
                // Validate inputs
                if (!titleInput.value.trim()) {
                    alert("Te rog completează titlul!");
                    return;
                }

                // Parse times for validation
                const [startHours, startMinutes] = startInput.value.split(':').map(Number);
                const [endHours, endMinutes] = endInput.value.split(':').map(Number);

                // Validate time range
                if (startHours < 8 || (endHours >= 21 && endMinutes > 0) || endHours > 21) {
                    alert("Programul este disponibil doar între orele 8:00 și 21:00!");
                    return;
                }

                // Create new Date objects
                const updatedStart = new Date(event.start);
                updatedStart.setHours(startHours, startMinutes, 0, 0);
                
                const updatedEnd = new Date(event.end);
                updatedEnd.setHours(endHours, endMinutes, 0, 0);

                // Validate end time is after start time
                if (updatedEnd <= updatedStart) {
                    alert("Ora de sfârșit trebuie să fie după ora de început!");
                    return;
                }

                // Create the updated event object
                const updatedEvent = {
                    id: event.id,
                    title: titleInput.value,
                    category: categoryInput.value,
                    start: updatedStart,
                    end: updatedEnd
                };
                
                // Update the event
                this.editTimeBlock(event.id, updatedEvent);
                
                // Remove the modal with animation
                modal.style.opacity = "0";
                const modalContent = document.getElementById('modal-content');
                if (modalContent) {
                    modalContent.style.transform = "translateY(4px)";
                }
                
                setTimeout(() => {
                    document.body.removeChild(modal);
                }, 150);
                
            } catch (error) {
                console.error("Error in save event handler:", error);
                alert("A apărut o eroare la salvarea evenimentului!");
            }
        });
    }

    // Add click outside to close with animation
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.opacity = "0";
            const modalContent = document.getElementById('modal-content');
            if (modalContent) {
                modalContent.style.transform = "translateY(4px)";
            }
            
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 150);
        }
    });
}
handleOverlappingEvents() {
  try {
    // Selectează toate evenimentele din calendar
    const events = document.querySelectorAll('.absolute.rounded-md[class*="bg-"]');
    
    // Aplică stilurile pentru fiecare eveniment
    events.forEach((event, index) => {
      event.style.zIndex = 10 + index;
      
      // Adaugă evenimentele mouse pentru efecte vizuale
      event.addEventListener('mouseenter', function() {
        this.style.zIndex = 999;
        this.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
        this.style.transform = 'scale(1.02)';
      });
      
      event.addEventListener('mouseleave', function() {
        this.style.zIndex = 10 + Array.from(events).indexOf(this);
        this.style.boxShadow = '';
        this.style.transform = '';
      });
    });
  } catch (error) {
    console.error("Eroare la gestionarea evenimentelor suprapuse:", error);
  }
}

// Add this method to the Calendar class
exportWeekData() {
    try {
        const weekStart = this.startOfWeek(this.currentDate, { weekStartsOn: 1 });
        const weekEnd = this.endOfWeek(this.currentDate, { weekStartsOn: 1 });

        const weekEvents = this.timeBlocks.filter(event => {
            const eventDate = new Date(event.start);
            return eventDate >= weekStart && eventDate <= weekEnd;
        });

        // Check if there are any events in the current week
        if (weekEvents.length === 0) {
            const isDarkMode = document.documentElement.classList.contains('dark');
            const toastBg = isDarkMode ? 'bg-gray-800' : 'bg-white';
            const toastText = isDarkMode ? 'text-gray-200' : 'text-gray-800';
            
            // Create and show toast notification
            const toast = document.createElement('div');
            toast.className = `fixed bottom-4 right-4 ${toastBg} ${toastText} px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-y-2 opacity-0`;
            toast.innerHTML = `
                <div class="flex items-center space-x-2">
                    <svg class="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                    <span>Nu există evenimente de exportat în această săptămână</span>
                </div>
            `;
            
            document.body.appendChild(toast);
            
            // Animate toast in
            requestAnimationFrame(() => {
                toast.classList.remove('translate-y-2', 'opacity-0');
            });
            
            // Remove toast after 3 seconds
            setTimeout(() => {
                toast.classList.add('translate-y-2', 'opacity-0');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
            
            return;
        }

        // Continue with export if there are events
        const exportData = {
            weekRange: `${this.format(weekStart, "dd/MM/yyyy")} - ${this.format(weekEnd, "dd/MM/yyyy")}`,
            events: weekEvents.map(event => ({
                title: event.title,
                category: event.category,
                date: this.format(event.start, "dd/MM/yyyy"),
                startTime: this.format(event.start, "HH:mm"),
                endTime: this.format(event.end, "HH:mm")
            }))
        };

        const fileName = `calendar-${this.format(weekStart, "dd-MM-yyyy")}.json`;
        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

    } catch (error) {
        console.error("Eroare la exportul datelor:", error);
        alert("A apărut o eroare la exportul datelor!");
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