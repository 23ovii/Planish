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

  render() {
    const weekStart = this.startOfWeek(this.currentDate, {
      weekStartsOn: 1,
    });
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
          <div class="grid grid-cols-8 gap-2">
            <!-- Time labels column -->
            <div class="col-span-1">
              <div class="h-10"></div> <!-- Empty cell for header alignment -->
              <div class="relative h-[600px]">
                ${Array.from({ length: 12 }, (_, i) => i + 8)
                  .map(
                    (hour) => `
                  <div class="absolute w-full" style="top: ${(hour - 8) * 50}px">
                    <div class="text-xs text-gray-500 -mt-2">
                      ${hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                    </div>
                    <div class="border-t border-gray-200 w-full"></div>
                  </div>
                `,
                  )
                  .join("")}
              </div>
            </div>

            <!-- Days columns -->
            ${daysOfWeek
              .map(
                (day, index) => `
              <div class="col-span-1">
                <div class="text-center py-2 font-medium border-b">
                  <div>${this.format(day, "EEE")}</div>
                  <div class="text-sm">${this.format(day, "d")}</div>
                </div>
                <div class="relative h-[600px] border-l first:border-l-0" id="day-column-${index}" data-date="${day.toISOString()}">
                  ${Array.from({ length: 12 }, (_, i) => i + 8)
                    .map(
                      (hour) => `
                    <div class="absolute w-full border-t border-gray-100" style="top: ${(hour - 8) * 50}px"></div>
                  `,
                    )
                    .join("")}
                  
                  <!-- Time blocks will be added here dynamically -->
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
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
          const position = this.getTimeBlockPosition(block);
          if (!position) return;

          const timeBlockEl = document.createElement("div");
          timeBlockEl.className = `absolute rounded-md p-2 ${this.categoryColors[block.category] || "bg-gray-500"} text-white text-xs overflow-hidden cursor-pointer`; // am adăugat cursor-pointer
          timeBlockEl.style.top = position.top;
          timeBlockEl.style.height = position.height;
          timeBlockEl.style.left = "5px";
          timeBlockEl.style.right = "5px";
          timeBlockEl.dataset.id = block.id;
          timeBlockEl.innerHTML = `
            <div class="font-medium">${block.title}</div>
            <div>
              ${this.format(block.start, "h:mm a")} - ${this.format(block.end, "h:mm a")}
            </div>
            <button class="absolute top-1 right-1 text-white delete-event" data-id="${block.id}">×</button>
          `;

          // Add click handler for editing
          timeBlockEl.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showEditEventModal(block);
          });

          const dayColumn = document.getElementById(`day-column-${index}`);
          if (dayColumn) {
            dayColumn.appendChild(timeBlockEl);
          }
        }
      });
    });

    // Adăugăm event listeners pentru butoanele de ștergere
    document.querySelectorAll('.delete-event').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = button.dataset.id;
        this.deleteTimeBlock(id);
      });
    });
  }

  deleteTimeBlock(id) {
    this.timeBlocks = this.timeBlocks.filter(block => block.id !== id);
    this.saveToLocalStorage();
    this.render();
  }

  getTimeBlockPosition(block) {
    const startHour = block.start.getHours();
    const startMinutes = block.start.getMinutes();
    const endHour = block.end.getHours();
    const endMinutes = block.end.getMinutes();

    // Only show events between 8 AM and 8 PM (our visible range)
    if (startHour < 8 || startHour > 20) return null;

    // Calculate position based on 50px per hour
    const hourHeight = 50;
    const top = (startHour - 8) * hourHeight + (startMinutes / 60) * hourHeight;
    const height =
      (endHour - startHour) * hourHeight +
      ((endMinutes - startMinutes) / 60) * hourHeight;

    return {
      top: `${top}px`,
      height: `${height}px`,
    };
  }

  setupEventListeners() {
    try {
      const prevWeekBtn = document.getElementById("prev-week");
      const nextWeekBtn = document.getElementById("next-week");
      const addEventBtn = document.getElementById("add-event");
      const datePickerBtn = document.getElementById("date-picker-btn");
      
      // Referință la obiectul curent pentru a fi folosită în event listeners
      const self = this;

      if (prevWeekBtn) {
        prevWeekBtn.addEventListener("click", function() {
          self.handlePrevWeek();
        });
      }

      if (nextWeekBtn) {
        nextWeekBtn.addEventListener("click", function() {
          self.handleNextWeek();
        });
      }

      if (addEventBtn) {
        addEventBtn.addEventListener("click", function() {
          self.showAddEventModal();
        });
      }

      if (datePickerBtn) {
        datePickerBtn.addEventListener("click", function() {
          self.showDatePicker();
        });
      }

      // Adăugăm event listener pentru click pe coloanele zilelor
      document.querySelectorAll('[id^="day-column-"]').forEach(column => {
        column.addEventListener('click', function(e) {
          if (e.target === column || e.target.classList.contains('border-t')) {
            const dateStr = column.dataset.date;
            if (dateStr) {
              self.selectedDate = new Date(dateStr);
              const selectedDateEl = document.getElementById("selected-date");
              if (selectedDateEl) {
                selectedDateEl.textContent = self.format(self.selectedDate, "PPP");
              }
              self.showAddEventModal();
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
    // Create modal for adding new event
    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
    modal.id = "add-event-modal";

    // Setăm ora implicită la ora curentă rotunjită la ora completă
    const currentHour = new Date().getHours();
    const defaultStartTime = `${String(currentHour).padStart(2, '0')}:00`;
    const defaultEndTime = `${String(currentHour + 1).padStart(2, '0')}:00`;

    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div class="p-4 border-b">
          <h3 class="text-lg font-medium">Adaugă eveniment nou</h3>
          <div class="text-sm text-gray-500">Data: ${this.format(this.selectedDate, "PPP")}</div>
        </div>
        <div class="p-4">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1">Titlu</label>
              <input type="text" id="event-title" class="w-full p-2 border rounded-md" placeholder="Denumire eveniment">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Categorie</label>
              <select id="event-category" class="w-full p-2 border rounded-md">
                <option value="work">Muncă</option>
                <option value="personal">Personal</option>
                <option value="study">Studiu</option>
                <option value="health">Sănătate</option>
                <option value="other">Altele</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Ora de început</label>
                <input type="time" id="event-start" class="w-full p-2 border rounded-md" value="${defaultStartTime}">
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Ora de sfârșit</label>
                <input type="time" id="event-end" class="w-full p-2 border rounded-md" value="${defaultEndTime}">
              </div>
            </div>
          </div>
        </div>
        <div class="p-4 border-t flex justify-end space-x-2">
          <button id="cancel-event" class="px-4 py-2 border rounded-md">Anulează</button>
          <button id="save-event" class="px-4 py-2 bg-blue-600 text-white rounded-md">Salvează</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners to modal buttons using a reference to the current context
    const self = this;
    document.getElementById("cancel-event").addEventListener("click", function() {
      document.body.removeChild(modal);
    });

    document.getElementById("save-event").addEventListener("click", function() {
      self.handleAddTimeBlock();
      document.body.removeChild(modal);
    });
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
      
      const title = titleEl.value;
      const category = categoryEl.value;
      const startTime = startTimeEl.value;
      const endTime = endTimeEl.value;
      
      if (!startTime || !endTime) {
        console.error("Orele nu au fost completate corect");
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
        title: title || "Eveniment nou",
        start: startDate,
        end: endDate,
        category: category || "work",
      };

      this.timeBlocks.push(newBlock);
      this.saveToLocalStorage(); // Salvăm în localStorage
      this.render();
      
      console.log("Eveniment adăugat cu succes:", newBlock);
    } catch (error) {
      console.error("Eroare la adăugarea evenimentului:", error);
    }
  }

  // Add this new method to handle event editing
  editTimeBlock(blockId, updatedData) {
    // Find the event in timeBlocks array
    const index = this.timeBlocks.findIndex(block => block.id === blockId);
    if (index !== -1) {
      // Update the event with new data
      this.timeBlocks[index] = {
        ...this.timeBlocks[index],
        ...updatedData,
        start: new Date(updatedData.start),
        end: new Date(updatedData.end)
      };
      
      // Save to localStorage and re-render
      this.saveToLocalStorage();
      this.render();
    }
  }

  // Add new method for edit modal
  showEditEventModal(event) {
    const modal = document.createElement("div");
    modal.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
    
    // Format dates for input fields
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
              <input type="text" id="edit-title" class="w-full p-2 border rounded-md" 
                placeholder="Denumire eveniment" value="${event.title}">
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
          <button id="cancel-edit" class="px-4 py-2 border rounded-md">Anulează</button>
          <button id="delete-event" class="px-4 py-2 border rounded-md text-red-500">Șterge</button>
          <button id="save-edit" class="px-4 py-2 bg-blue-600 text-white rounded-md">Salvează</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Handle form actions
    const self = this;
    
    // Save button
    document.getElementById('save-edit').addEventListener('click', function() {
      const updatedEvent = {
        id: event.id,
        title: document.getElementById('edit-title').value,
        category: document.getElementById('edit-category').value,
        start: new Date(event.start.setHours(
          ...document.getElementById('edit-start').value.split(':').map(Number)
        )),
        end: new Date(event.end.setHours(
          ...document.getElementById('edit-end').value.split(':').map(Number)
        ))
      };

      self.editTimeBlock(event.id, updatedEvent);
      document.body.removeChild(modal);
    });

    // Delete button
    document.getElementById('delete-event').addEventListener('click', () => {
      if (confirm('Ești sigur că vrei să ștergi acest eveniment?')) {
        this.deleteTimeBlock(event.id);
        document.body.removeChild(modal);
      }
    });

    // Cancel button
    document.getElementById('cancel-edit').addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
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

document.addEventListener('DOMContentLoaded', function() {
  const calendarEl = document.getElementById('calendar-content');
  
  // Initialize FullCalendar
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    editable: true,
    selectable: true,
    events: [], // Your events will go here
    eventClick: function(info) {
      showEditModal(info.event);
    }
  });

  calendar.render();

  function showEditModal(event) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4">Edit Event</h3>
        <form id="edit-event-form">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1">Title</label>
              <input type="text" id="edit-title" class="w-full p-2 border rounded" value="${event.title}">
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Start</label>
                <input type="datetime-local" id="edit-start" class="w-full p-2 border rounded" 
                  value="${event.start ? event.start.toISOString().slice(0, 16) : ''}">
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">End</label>
                <input type="datetime-local" id="edit-end" class="w-full p-2 border rounded"
                  value="${event.end ? event.end.toISOString().slice(0, 16) : ''}">
              </div>
            </div>
            <div class="flex justify-end space-x-2 pt-4">
              <button type="button" class="px-4 py-2 text-red-500 hover:bg-red-50 rounded" onclick="deleteEvent('${event.id}')">
                Delete
              </button>
              <button type="submit" class="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90">
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });

    // Handle form submission
    document.getElementById('edit-event-form').addEventListener('submit', function(e) {
      e.preventDefault();
      
      event.setProp('title', document.getElementById('edit-title').value);
      event.setStart(document.getElementById('edit-start').value);
      event.setEnd(document.getElementById('edit-end').value);
      
      document.body.removeChild(modal);
    });
  }

  // Delete event function
  window.deleteEvent = function(eventId) {
    if (confirm('Are you sure you want to delete this event?')) {
      let event = calendar.getEventById(eventId);
      if (event) {
        event.remove();
      }
      document.body.removeChild(document.querySelector('.fixed'));
    }
  };
});