// calendar.js - Fixed Calendar component functionality

class Calendar {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentDate = new Date();
    this.selectedDate = new Date();
    this.timeBlocks = [
      {
        id: "1",
        title: "Project Meeting",
        start: new Date(new Date().setHours(10, 0, 0, 0)),
        end: new Date(new Date().setHours(11, 30, 0, 0)),
        category: "work",
      },
      {
        id: "2",
        title: "Gym Session",
        start: new Date(new Date().setHours(17, 0, 0, 0)),
        end: new Date(new Date().setHours(18, 0, 0, 0)),
        category: "health",
      },
      {
        id: "3",
        title: "Study Time",
        start: this.addDays(new Date(new Date().setHours(14, 0, 0, 0)), 1),
        end: this.addDays(new Date(new Date().setHours(16, 0, 0, 0)), 1),
        category: "study",
      },
    ];
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
              <span class="h-4 w-4 mr-1">+</span> Add Event
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
                <div class="relative h-[600px] border-l first:border-l-0" id="day-column-${index}">
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
          timeBlockEl.className = `absolute rounded-md p-2 ${this.categoryColors[block.category] || "bg-gray-500"} text-white text-xs overflow-hidden`;
          timeBlockEl.style.top = position.top;
          timeBlockEl.style.height = position.height;
          timeBlockEl.style.left = "5px";
          timeBlockEl.style.right = "5px";
          timeBlockEl.innerHTML = `
            <div class="font-medium">${block.title}</div>
            <div>
              ${this.format(block.start, "h:mm a")} - ${this.format(block.end, "h:mm a")}
            </div>
          `;

          const dayColumn = document.getElementById(`day-column-${index}`);
          if (dayColumn) {
            dayColumn.appendChild(timeBlockEl);
          }
        }
      });
    });
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
    const prevWeekBtn = document.getElementById("prev-week");
    const nextWeekBtn = document.getElementById("next-week");
    const addEventBtn = document.getElementById("add-event");

    if (prevWeekBtn) {
      prevWeekBtn.addEventListener("click", () => this.handlePrevWeek());
    }

    if (nextWeekBtn) {
      nextWeekBtn.addEventListener("click", () => this.handleNextWeek());
    }

    if (addEventBtn) {
      addEventBtn.addEventListener("click", () => this.showAddEventModal());
    }
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

    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div class="p-4 border-b">
          <h3 class="text-lg font-medium">Add New Event</h3>
        </div>
        <div class="p-4">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1">Title</label>
              <input type="text" id="event-title" class="w-full p-2 border rounded-md">
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Category</label>
              <select id="event-category" class="w-full p-2 border rounded-md">
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="study">Study</option>
                <option value="health">Health</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Start Time</label>
                <input type="time" id="event-start" class="w-full p-2 border rounded-md" value="09:00">
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">End Time</label>
                <input type="time" id="event-end" class="w-full p-2 border rounded-md" value="10:00">
              </div>
            </div>
          </div>
        </div>
        <div class="p-4 border-t flex justify-end space-x-2">
          <button id="cancel-event" class="px-4 py-2 border rounded-md">Cancel</button>
          <button id="save-event" class="px-4 py-2 bg-blue-600 text-white rounded-md">Save</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners to modal buttons
    document.getElementById("cancel-event").addEventListener("click", () => {
      document.body.removeChild(modal);
    });

    document.getElementById("save-event").addEventListener("click", () => {
      this.handleAddTimeBlock();
      document.body.removeChild(modal);
    });
  }

  handleAddTimeBlock() {
    const title = document.getElementById("event-title").value;
    const category = document.getElementById("event-category").value;
    const startTime = document.getElementById("event-start").value;
    const endTime = document.getElementById("event-end").value;

    // Create start and end dates
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);

    const startDate = new Date(this.selectedDate);
    startDate.setHours(startHours, startMinutes, 0, 0);

    const endDate = new Date(this.selectedDate);
    endDate.setHours(endHours, endMinutes, 0, 0);

    // Add new time block
    const newBlock = {
      id: Date.now().toString(),
      title: title || "New Event",
      start: startDate,
      end: endDate,
      category: category || "work",
    };

    this.timeBlocks.push(newBlock);
    this.render();
  }
}

// Initialize calendar when loaded into the page
function initCalendar(containerId) {
  const calendar = new Calendar(containerId);
  calendar.init();
  return calendar;
}