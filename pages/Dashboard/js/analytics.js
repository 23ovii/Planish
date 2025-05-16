// analytics.js - Time Usage Analytics functionality

function initAnalytics(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return null;

  // Initial state
  let view = "daily";
  let selectedCategory = "all";

  // Funcție pentru a încărca datele din localStorage
  function loadCalendarData() {
    try {
        const data = localStorage.getItem('calendarEvents');
        if (!data) {
            console.log('Nu există date în localStorage');
            return [];
        }
        
        let events = JSON.parse(data).map(event => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end)
        }));

        // Filter by category if needed
        if (selectedCategory !== 'all') {
            events = events.filter(event => event.category === selectedCategory);
        }

        // Filter by view (daily/weekly)
        const today = new Date();
        if (view === 'daily') {
            events = events.filter(event => isSameDay(new Date(event.start), today));
        } else {
            const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
            const weekEnd = new Date(today.setDate(today.getDate() + 6));
            events = events.filter(event => {
                const eventDate = new Date(event.start);
                return eventDate >= weekStart && eventDate <= weekEnd;
            });
        }

        return events;
    } catch (e) {
        console.error("Eroare la încărcarea datelor din localStorage:", e);
        return [];
    }
  }

  // Funcție pentru a calcula orele pentru fiecare categorie
  function calculateHoursByCategory(events, isDaily = true) {
    const today = new Date();
    const categories = {};
    
    events.forEach(event => {
      const eventDate = new Date(event.start);
      
      // Filtrăm evenimentele în funcție de vizualizare (zilnică/săptămânală)
      if (isDaily && !isSameDay(eventDate, today)) return;
      if (!isDaily && !isThisWeek(eventDate)) return;

      const duration = (new Date(event.end) - new Date(event.start)) / (1000 * 60 * 60); // durata în ore
      
      if (!categories[event.category]) {
        categories[event.category] = {
          hours: 0,
          color: getCategoryColor(event.category)
        };
      }
      
      categories[event.category].hours += duration;
    });

    return Object.entries(categories).map(([category, data]) => ({
      category,
      hours: Math.round(data.hours * 10) / 10, // rotunjim la o zecimală
      color: data.color
    }));
  }

  // Funcție helper pentru a verifica dacă două date sunt în aceeași zi
  function isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  // Funcție helper pentru a verifica dacă o dată este în această săptămână
  function isThisWeek(date) {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    return date >= weekStart && date <= weekEnd;
  }

  // Funcție pentru a obține culoarea categoriei
  function getCategoryColor(category) {
    const colors = {
      work: "#4f46e5",
      personal: "#10b981",
      study: "#8b5cf6",
      health: "#ef4444",
      other: "#6366f1"
    };
    return colors[category] || "#6366f1";
  }

  // Render the analytics UI
  function render() {
    const events = loadCalendarData();
    const currentData = calculateHoursByCategory(events, view === "daily");
    
    const filteredData = selectedCategory === "all" 
      ? currentData 
      : currentData.filter(item => item.category === selectedCategory);

    const totalHours = filteredData.reduce((sum, item) => sum + item.hours, 0);

    // Create the analytics UI
    container.innerHTML = `
      <div class="bg-background p-8 rounded-xl shadow-lg dark:bg-gray-800">
        <div class="flex flex-col space-y-8">
          <!-- Modern Header Section -->
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-3xl font-bold text-[#7a65db] ">Analytics Dashboard</h2>
              <p class="text-gray-500 dark:text-gray-400 mt-1">Track your time usage and productivity</p>
            </div>
            
            <div class="flex items-center gap-4">
              <!-- Modern View Tabs -->
              <div class="bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                <button id="daily-tab" 
                  class="${view === "daily" 
                    ? "bg-white dark:bg-gray-600 shadow-sm" 
                    : "text-gray-500 dark:text-gray-400"} 
                  px-4 py-2 rounded-lg transition-all duration-200">
                  <i data-lucide="activity" class="inline-block w-4 h-4 mr-2"></i>
                  Daily
                </button>
                <button id="weekly-tab"
                  class="${view === "weekly" 
                    ? "bg-white dark:bg-gray-600 shadow-sm" 
                    : "text-gray-500 dark:text-gray-400"} 
                  px-4 py-2 rounded-lg transition-all duration-200">
                  <i data-lucide="calendar" class="inline-block w-4 h-4 mr-2"></i>
                  Weekly
                </button>
              </div>

              <!-- Modern Category Dropdown -->
              <div class="relative">
                <button id="category-select" 
                  class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-500 transition-all duration-200">
                  <span>${selectedCategory === "all" ? "All Categories" : selectedCategory}</span>
                  <i data-lucide="chevron-down" class="w-4 h-4 opacity-50"></i>
                </button>
                <div id="category-dropdown" 
                  class="absolute z-10 mt-2 hidden w-full py-2 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-xl">
                  <!-- Category options will be populated here -->
                </div>
              </div>
            </div>
          </div>

          <!-- Modern Stats Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Modern Pie Chart Card -->
            <div class="bg-white dark:bg-gray-700 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-600">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Time Distribution</h3>
                <span class="text-sm font-medium px-3 py-1 bg-gray-100 dark:bg-gray-600 rounded-full">
                  ${totalHours.toFixed(1)} total hours
                </span>
              </div>
              <div class="relative w-full aspect-square max-w-[300px] mx-auto">
                <svg viewBox="0 0 100 100" class="w-full h-full">
                  ${generatePieChartPaths(filteredData)}
                </svg>
              </div>
            </div>

            <!-- Modern Bar Chart Card -->
            <div class="bg-white dark:bg-gray-700 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-600">
              <h3 class="text-lg font-semibold mb-6 text-gray-800 dark:text-white">Category Breakdown</h3>
              <div class="space-y-6">
                ${filteredData.map(item => `
                  <div class="space-y-2">
                    <div class="flex justify-between items-center">
                      <div class="flex items-center gap-2">
                        <span class="w-3 h-3 rounded-full" style="background-color: ${item.color}"></span>
                        <span class="font-medium text-gray-700 dark:text-gray-300">${item.category}</span>
                      </div>
                      <span class="font-medium text-gray-900 dark:text-white">
                        ${item.hours.toFixed(1)}h
                        <span class="text-sm text-gray-500 dark:text-gray-400 ml-1">
                          (${((item.hours / totalHours) * 100).toFixed(0)}%)
                        </span>
                      </span>
                    </div>
                    <div class="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div class="h-full rounded-full transition-all duration-500 ease-out hover:brightness-110"
                        style="width: ${(item.hours / totalHours) * 100}%; background-color: ${item.color}">
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Modern Productivity Card -->
          <div class="bg-white dark:bg-gray-700 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-600">
            <h3 class="text-lg font-semibold mb-6">Time Usage Insights</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              ${generateInsightCards(filteredData, totalHours)}
            </div>
          </div>
        </div>
      </div>
    `;

    // Add this helper function for generating insight cards
    function generateInsightCards(data, total) {
      const mostUsedCategory = data.sort((a, b) => b.hours - a.hours)[0];
      const averageHours = total / data.length;
      
      return `
        <div class="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-600">
          <div class="flex items-center gap-3 mb-2">
            <div class="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <i data-lucide="clock" class="w-5 h-5 text-purple-600 dark:text-purple-400"></i>
            </div>
            <h4 class="font-medium">Total Time</h4>
          </div>
          <p class="text-2xl font-bold">${total.toFixed(1)}h</p>
        </div>
        
        <div class="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-600">
          <div class="flex items-center gap-3 mb-2">
            <div class="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <i data-lucide="target" class="w-5 h-5 text-blue-600 dark:text-blue-400"></i>
            </div>
            <h4 class="font-medium">Most Used</h4>
          </div>
          <p class="text-2xl font-bold capitalize">${mostUsedCategory?.category || 'N/A'}</p>
        </div>
        
        <div class="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-600">
          <div class="flex items-center gap-3 mb-2">
            <div class="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
              <i data-lucide="trending-up" class="w-5 h-5 text-green-600 dark:text-green-400"></i>
            </div>
            <h4 class="font-medium">Average</h4>
          </div>
          <p class="text-2xl font-bold">${averageHours.toFixed(1)}h</p>
        </div>
      `;
    }

    // Initialize icons and listeners as before
    lucide.createIcons();
    setupEventListeners();
  }

  // Helper function to generate pie chart SVG paths
  function generatePieChartPaths(data) {
    if (data.length === 0) return "";

    const total = data.reduce((sum, item) => sum + item.hours, 0);
    let paths = "";
    let startAngle = 0;

    data.forEach(item => {
        const sliceAngle = (item.hours / total) * 360;
        const endAngle = startAngle + sliceAngle;

        const startRad = ((startAngle - 90) * Math.PI) / 180;
        const endRad = ((endAngle - 90) * Math.PI) / 180;

        const x1 = 50 + 35 * Math.cos(startRad);
        const y1 = 50 + 35 * Math.sin(startRad);
        const x2 = 50 + 35 * Math.cos(endRad);
        const y2 = 50 + 35 * Math.sin(endRad);

        const path = `M 50 50 L ${x1} ${y1} A 35 35 0 ${sliceAngle > 180 ? 1 : 0} 1 ${x2} ${y2} Z`;

        paths += `<path d="${path}" fill="${item.color}" class="transition-all duration-300 hover:opacity-90"/>`;
        
        startAngle = endAngle;
    });

    return paths;
  }

  // Funcție pentru setarea event listener-elor
  function setupEventListeners() {
    // Daily/Weekly toggle buttons
    const dailyTab = document.getElementById('daily-tab');
    const weeklyTab = document.getElementById('weekly-tab');

    if (dailyTab) {
        dailyTab.addEventListener('click', () => {
            dailyTab.classList.add('bg-white', 'dark:bg-gray-600', 'shadow-sm');
            weeklyTab.classList.remove('bg-white', 'dark:bg-gray-600', 'shadow-sm');
            view = "daily";
            render();
        });
    }

    if (weeklyTab) {
        weeklyTab.addEventListener('click', () => {
            weeklyTab.classList.add('bg-white', 'dark:bg-gray-600', 'shadow-sm');
            dailyTab.classList.remove('bg-white', 'dark:bg-gray-600', 'shadow-sm');
            view = "weekly";
            render();
        });
    }

    // Category dropdown
    const categorySelect = document.getElementById('category-select');
    const categoryDropdown = document.getElementById('category-dropdown');

    if (categorySelect && categoryDropdown) {
        // Populate dropdown with categories
        const categories = [
            { id: 'all', label: 'All Categories' },
            { id: 'work', label: 'Work' },
            { id: 'personal', label: 'Personal' },
            { id: 'study', label: 'Study' },
            { id: 'health', label: 'Health' },
            { id: 'other', label: 'Other' }
        ];

        categoryDropdown.innerHTML = categories.map(cat => `
            <button 
                class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 
                       ${selectedCategory === cat.id ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : ''}"
                data-category="${cat.id}">
                ${cat.label}
            </button>
        `).join('');

        // Toggle dropdown
        categorySelect.addEventListener('click', (e) => {
            e.stopPropagation();
            categoryDropdown.classList.toggle('hidden');
        });

        // Handle category selection
        categoryDropdown.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                selectedCategory = category;
                categorySelect.querySelector('span').textContent = 
                    category === 'all' ? 'All Categories' : 
                    category.charAt(0).toUpperCase() + category.slice(1);
                categoryDropdown.classList.add('hidden');
                render();
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!categorySelect.contains(e.target) && !categoryDropdown.contains(e.target)) {
                categoryDropdown.classList.add('hidden');
            }
        });
    }
  }

  // Prima randare
  render();

  // Returnăm instanța
  return {
    updateView: (newView) => {
      view = newView;
      render();
    },
    updateCategory: (newCategory) => {
      selectedCategory = newCategory;
      render();
    },
    refresh: () => {
      render();
    }
  };
}
