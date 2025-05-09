// main.js - Main application functionality

document.addEventListener("DOMContentLoaded", function () {
  // Initialize Lucide icons
  lucide.createIcons();

  // Load user data from localStorage
  loadUserData();

  // Initialize components when tab is selected
  let calendarInstance = null;
  let focusTimerInstance = null;
  let analyticsInstance = null;
  let taskMatrixInstance = null;

  // Load all component scripts immediately
  function loadComponentScripts() {
    const scripts = [
      { src: "js/calendar.js", loaded: false },
      { src: "js/taskMatrix.js", loaded: false },
      { src: "js/analytics.js", loaded: false },
      { src: "js/focusTimer.js", loaded: false },
    ];

    scripts.forEach((scriptInfo) => {
      const script = document.createElement("script");
      script.src = scriptInfo.src;
      script.onload = () => {
        scriptInfo.loaded = true;
        // Initialize the default tab once all scripts are loaded
        if (scripts.every((s) => s.loaded)) {
          switchTab("calendar");
        }
      };
      document.body.appendChild(script);
    });
  }

  // Load all scripts on page load
  loadComponentScripts();

  // Load user data from localStorage
  function loadUserData() {
    // Get user data from localStorage
    const userName = localStorage.getItem('user_name');
    const userEmail = localStorage.getItem('user_email');
    
    // Get avatar seed (or generate one from email)
    const userAvatarSeed = localStorage.getItem('user_avatar_seed') || 
                           (userEmail ? userEmail.split('@')[0] : 'user123');
    
    // Update DOM elements
    const userNameElement = document.getElementById('user-name');
    const userEmailElement = document.getElementById('user-email');
    const userAvatarElement = document.getElementById('user-avatar');
    
    // Set user name and email if available, otherwise show default text
    userNameElement.textContent = userName || 'Guest User';
    userEmailElement.textContent = userEmail || 'guest@example.com';
    
    // Update avatar with user-specific seed
    userAvatarElement.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userAvatarSeed}`;
    
    // If no user data is found and we're not on login page, redirect to login
    if (!userName && !userEmail && !window.location.href.includes('login.html')) {
      // Uncomment the line below when login page is ready
      // window.location.href = 'login.html';
      console.log('No user data found - would redirect to login page');
    }
  }

  // Sidebar functionality
  const sidebar = document.getElementById("sidebar");
  const sidebarOverlay = document.getElementById("sidebar-overlay");
  const toggleSidebarBtn = document.getElementById("toggle-sidebar");
  const closeSidebarBtn = document.getElementById("close-sidebar");
  const mainContent = document.getElementById("main-content");
  let sidebarCollapsed = false;

  function toggleSidebar() {
    sidebarCollapsed = !sidebarCollapsed;

    if (sidebarCollapsed) {
      sidebar.classList.add("sidebar-collapsed");
      mainContent.classList.add("collapsed-margin");
      sidebarOverlay.classList.add("invisible", "opacity-0");
      
      // Center icons in collapsed sidebar (desktop only)
      if (window.innerWidth >= 768) {
        document.querySelectorAll(".sidebar .w-8").forEach(el => {
          el.style.width = "100%";
        });
        
        // Ensure logo container is centered too
        const logoContainer = document.querySelector(".logo-container");
        logoContainer.style.justifyContent = "center";
        logoContainer.style.padding = "0.5rem";
        logoContainer.style.marginBottom = "0.5rem";
      }
    } else {
      sidebar.classList.remove("sidebar-collapsed");
      mainContent.classList.remove("collapsed-margin");
      if (window.innerWidth < 768) {
        sidebarOverlay.classList.remove("invisible", "opacity-0");
      }
      
      // Reset icon containers
      document.querySelectorAll(".sidebar .w-8").forEach(el => {
        el.style.width = "2rem"; // 8 * 0.25rem = 2rem (w-8)
      });
      
      // Reset logo container
      if (window.innerWidth >= 768) {
        const logoContainer = document.querySelector(".logo-container");
        logoContainer.style.justifyContent = "flex-start";
        logoContainer.style.padding = "0.25rem";
        logoContainer.style.marginBottom = "0";
      }
    }
  }

  // Initialize sidebar state based on screen size
  function initSidebar() {
    if (window.innerWidth < 768) {
      // Start with sidebar closed on mobile
      sidebarCollapsed = true;
      sidebar.classList.add("sidebar-collapsed");
      sidebarOverlay.classList.add("invisible", "opacity-0");
    } else {
      // Start with sidebar open on desktop
      sidebarCollapsed = false;
      sidebar.classList.remove("sidebar-collapsed");
      mainContent.classList.remove("collapsed-margin");
      sidebarOverlay.classList.add("invisible", "opacity-0");
      document.querySelector(".logo-container").style.justifyContent = "flex-start";
    }
  }

  // Add event listeners for sidebar
  toggleSidebarBtn.addEventListener("click", function() {
    toggleSidebar();
    
    // On mobile, show overlay when opening sidebar
    if (window.innerWidth < 768 && !sidebarCollapsed) {
      sidebarOverlay.classList.remove("invisible", "opacity-0");
    }
  });
  
  closeSidebarBtn.addEventListener("click", function() {
    if (!sidebarCollapsed) {
      toggleSidebar();
    }
  });
  
  sidebarOverlay.addEventListener("click", function() {
    if (!sidebarCollapsed && window.innerWidth < 768) {
      toggleSidebar();
    }
  });

  // Close sidebar when clicking a menu item on mobile
  const sidebarButtons = [
    "calendar-btn",
    "tasks-btn",
    "analytics-btn",
    "focus-btn",
  ];
  
  sidebarButtons.forEach((btnId) => {
    document.getElementById(btnId).addEventListener("click", () => {
      if (window.innerWidth < 768 && !sidebarCollapsed) {
        toggleSidebar();
      }
    });
  });

  // Initialize sidebar on page load
  initSidebar();

  // Update sidebar on window resize
  window.addEventListener("resize", () => {
    // Handle resize behavior
    if (window.innerWidth >= 768) {
      // On desktop
      sidebarOverlay.classList.add("invisible", "opacity-0");
      if (sidebarCollapsed) {
        mainContent.classList.add("collapsed-margin");
        const logoContainer = document.querySelector(".logo-container");
        logoContainer.style.justifyContent = "center";
        logoContainer.style.padding = "0.5rem";
        logoContainer.style.marginBottom = "0.5rem";
      } else {
        mainContent.classList.remove("collapsed-margin");
        const logoContainer = document.querySelector(".logo-container");
        logoContainer.style.justifyContent = "flex-start";
        logoContainer.style.padding = "0.25rem";
        logoContainer.style.marginBottom = "0";
      }
    } else {
      // On mobile
      mainContent.classList.remove("collapsed-margin");
      if (!sidebarCollapsed) {
        sidebarOverlay.classList.remove("invisible", "opacity-0");
      } else {
        sidebarOverlay.classList.add("invisible", "opacity-0");
      }
    }
  });

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

  // Dark mode toggle functionality
  // Check if user preference already exists in localStorage
  if (localStorage.getItem('color-theme') === 'dark' || 
     (!localStorage.getItem('color-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  // Get the toggle button
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  
  if (darkModeToggle) {
    // Add click handler to toggle dark mode
    darkModeToggle.addEventListener('click', function() {
      // Toggle the dark class on the html element
      document.documentElement.classList.toggle('dark');
      
      // Update localStorage value
      if (document.documentElement.classList.contains('dark')) {
        localStorage.setItem('color-theme', 'dark');
      } else {
        localStorage.setItem('color-theme', 'light');
      }
    });
  }
});