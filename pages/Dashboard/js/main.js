// main.js - Main application functionality

document.addEventListener("DOMContentLoaded", function () {
  // Initialize Lucide icons
  lucide.createIcons();

  // Initialize components when tab is selected
  let calendarInstance = null;
  let focusTimerInstance = null;
  let analyticsInstance = null;
  let taskMatrixInstance = null;

  // Tab switching functionality
  const tabs = {
    calendar: {
      btn: document.getElementById("tab-calendar"),
      content: document.getElementById("calendar-content"),
      sideBtn: document.getElementById("calendar-btn"),
      init: () => {
        if (!calendarInstance) {
          // Load calendar script if not already loaded
          if (!document.querySelector('script[src="js/calendar.js"]')) {
            const script = document.createElement("script");
            script.src = "js/calendar.js";
            script.onload = () => {
              calendarInstance = initCalendar("calendar-content");
            };
            document.body.appendChild(script);
          } else if (typeof initCalendar === "function") {
            calendarInstance = initCalendar("calendar-content");
          }
        }
      },
    },
    tasks: {
      btn: document.getElementById("tab-tasks"),
      content: document.getElementById("tasks-content"),
      sideBtn: document.getElementById("tasks-btn"),
      init: () => {
        if (!taskMatrixInstance) {
          // Load task matrix script if not already loaded
          if (!document.querySelector('script[src="js/taskMatrix.js"]')) {
            const script = document.createElement("script");
            script.src = "js/taskMatrix.js";
            script.onload = () => {
              taskMatrixInstance = initTaskMatrix("tasks-content");
            };
            document.body.appendChild(script);
          } else if (typeof initTaskMatrix === "function") {
            taskMatrixInstance = initTaskMatrix("tasks-content");
          }
        }
      },
    },
    analytics: {
      btn: document.getElementById("tab-analytics"),
      content: document.getElementById("analytics-content"),
      sideBtn: document.getElementById("analytics-btn"),
      init: () => {
        if (!analyticsInstance) {
          // Load analytics script if not already loaded
          if (!document.querySelector('script[src="js/analytics.js"]')) {
            const script = document.createElement("script");
            script.src = "js/analytics.js";
            script.onload = () => {
              analyticsInstance = initAnalytics("analytics-content");
            };
            document.body.appendChild(script);
          } else if (typeof initAnalytics === "function") {
            analyticsInstance = initAnalytics("analytics-content");
          }
        }
      },
    },
    focus: {
      btn: document.getElementById("tab-focus"),
      content: document.getElementById("focus-content"),
      sideBtn: document.getElementById("focus-btn"),
      init: () => {
        if (!focusTimerInstance) {
          // Load focus timer script if not already loaded
          if (!document.querySelector('script[src="js/focusTimer.js"]')) {
            const script = document.createElement("script");
            script.src = "js/focusTimer.js";
            script.onload = () => {
              focusTimerInstance = initFocusTimer("focus-content");
            };
            document.body.appendChild(script);
          } else if (typeof initFocusTimer === "function") {
            focusTimerInstance = initFocusTimer("focus-content");
          }
        }
      },
    },
  };

  function switchTab(tabId) {
    // Hide all content
    Object.values(tabs).forEach((tab) => {
      tab.content.classList.add("hidden");
      tab.btn.classList.remove("border-primary", "text-primary");
      tab.btn.classList.add("border-transparent");
      tab.sideBtn.classList.remove("bg-primary", "text-white");
      tab.sideBtn.classList.add("hover:bg-muted");
    });

    // Show selected content
    tabs[tabId].content.classList.remove("hidden");
    tabs[tabId].btn.classList.add("border-primary", "text-primary");
    tabs[tabId].btn.classList.remove("border-transparent");
    tabs[tabId].sideBtn.classList.add("bg-primary", "text-white");
    tabs[tabId].sideBtn.classList.remove("hover:bg-muted");

    // Initialize the component for this tab if needed
    tabs[tabId].init();
  }

  // Add click event listeners to tabs
  Object.entries(tabs).forEach(([tabId, tab]) => {
    tab.btn.addEventListener("click", () => switchTab(tabId));
    tab.sideBtn.addEventListener("click", () => switchTab(tabId));
  });

  // Initialize the default tab (calendar)
  switchTab("calendar");
});
