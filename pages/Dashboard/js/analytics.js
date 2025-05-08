// analytics.js - Time Usage Analytics functionality

function initAnalytics(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return null;

  // Initial state
  let view = "daily";
  let selectedCategory = "all";

  // Mock data for time usage
  const dailyData = [
    { category: "Work", hours: 6, color: "#4f46e5" },
    { category: "Study", hours: 2, color: "#10b981" },
    { category: "Exercise", hours: 1, color: "#f59e0b" },
    { category: "Leisure", hours: 3, color: "#ec4899" },
    { category: "Sleep", hours: 8, color: "#6366f1" },
    { category: "Other", hours: 4, color: "#8b5cf6" },
  ];

  const weeklyData = [
    { category: "Work", hours: 30, color: "#4f46e5" },
    { category: "Study", hours: 10, color: "#10b981" },
    { category: "Exercise", hours: 5, color: "#f59e0b" },
    { category: "Leisure", hours: 15, color: "#ec4899" },
    { category: "Sleep", hours: 56, color: "#6366f1" },
    { category: "Other", hours: 20, color: "#8b5cf6" },
  ];

  // Render the analytics UI
  function render() {
    const currentData = view === "daily" ? dailyData : weeklyData;
    const filteredData =
      selectedCategory === "all"
        ? currentData
        : currentData.filter((item) => item.category === selectedCategory);

    const totalHours = filteredData.reduce((sum, item) => sum + item.hours, 0);

    // Create the analytics UI
    container.innerHTML = `
      <div class="bg-background p-6 rounded-lg w-full h-full">
        <div class="flex flex-col space-y-6">
          <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold">Time Usage Analytics</h2>
            <div class="flex space-x-4">
              <!-- View Tabs -->
              <div class="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
                <button id="daily-tab" class="${view === "daily" ? "bg-background text-foreground" : ""} inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                  <i data-lucide="activity" class="mr-2 h-4 w-4"></i>
                  Daily
                </button>
                <button id="weekly-tab" class="${view === "weekly" ? "bg-background text-foreground" : ""} inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                  <i data-lucide="calendar" class="mr-2 h-4 w-4"></i>
                  Weekly
                </button>
              </div>

              <!-- Category Filter -->
              <div class="relative inline-block w-[180px]">
                <button id="category-select" class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <span>${selectedCategory === "all" ? "All Categories" : selectedCategory}</span>
                  <i data-lucide="chevron-down" class="h-4 w-4 opacity-50"></i>
                </button>
                <div id="category-dropdown" class="absolute z-10 mt-1 hidden max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
                  <div class="p-1">
                    <button class="category-option relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground" data-value="all">
                      <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                        ${selectedCategory === "all" ? '<i data-lucide="check" class="h-4 w-4"></i>' : ""}
                      </span>
                      <span>All Categories</span>
                    </button>
                    ${currentData
                      .map(
                        (item) => `
                      <button class="category-option relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground" data-value="${item.category}">
                        <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                          ${selectedCategory === item.category ? '<i data-lucide="check" class="h-4 w-4"></i>' : ""}
                        </span>
                        <span>${item.category}</span>
                      </button>
                    `,
                      )
                      .join("")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Pie Chart Card -->
            <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div class="flex flex-col space-y-1.5 p-6">
                <h3 class="text-lg font-semibold leading-none tracking-tight flex items-center gap-2">
                  <i data-lucide="pie-chart" class="h-5 w-5"></i>
                  Time Distribution
                </h3>
              </div>
              <div class="p-6 pt-0 flex justify-center">
                <div class="relative w-64 h-64">
                  <!-- SVG Pie Chart -->
                  <svg viewBox="0 0 100 100" class="w-full h-full">
                    ${generatePieChartPaths(filteredData)}
                  </svg>
                  <div class="absolute inset-0 flex items-center justify-center flex-col">
                    <span class="text-3xl font-bold">${totalHours}</span>
                    <span class="text-sm text-muted-foreground">hours</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Bar Chart Card -->
            <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div class="flex flex-col space-y-1.5 p-6">
                <h3 class="text-lg font-semibold leading-none tracking-tight flex items-center gap-2">
                  <i data-lucide="bar-chart-3" class="h-5 w-5"></i>
                  Time by Category
                </h3>
              </div>
              <div class="p-6 pt-0">
                <div class="space-y-4">
                  ${filteredData
                    .map(
                      (item) => `
                    <div class="space-y-1">
                      <div class="flex justify-between items-center">
                        <span class="text-sm font-medium">${item.category}</span>
                        <span class="text-sm text-muted-foreground">${item.hours} hours</span>
                      </div>
                      <div class="h-2 bg-secondary rounded-full overflow-hidden">
                        <div class="h-full rounded-full" style="width: ${(item.hours / totalHours) * 100}%; background-color: ${item.color};"></div>
                      </div>
                    </div>
                  `,
                    )
                    .join("")}
                </div>
              </div>
            </div>
          </div>

          <!-- Productivity Trends Card -->
          <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div class="flex flex-col space-y-1.5 p-6">
              <h3 class="text-lg font-semibold leading-none tracking-tight">Productivity Trends</h3>
            </div>
            <div class="p-6 pt-0">
              <div class="h-[200px] flex items-center justify-center border-2 border-dashed border-muted-foreground/20 rounded-lg">
                <p class="text-muted-foreground">Productivity trend chart will be displayed here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Initialize Lucide icons
    lucide.createIcons();

    // Add event listeners
    document.getElementById("daily-tab").addEventListener("click", () => {
      view = "daily";
      render();
    });

    document.getElementById("weekly-tab").addEventListener("click", () => {
      view = "weekly";
      render();
    });

    // Category dropdown toggle
    const categorySelect = document.getElementById("category-select");
    const categoryDropdown = document.getElementById("category-dropdown");

    categorySelect.addEventListener("click", () => {
      categoryDropdown.classList.toggle("hidden");
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (event) => {
      if (
        !categorySelect.contains(event.target) &&
        !categoryDropdown.contains(event.target)
      ) {
        categoryDropdown.classList.add("hidden");
      }
    });

    // Category options
    document.querySelectorAll(".category-option").forEach((option) => {
      option.addEventListener("click", () => {
        selectedCategory = option.dataset.value;
        categoryDropdown.classList.add("hidden");
        render();
      });
    });
  }

  // Helper function to generate pie chart SVG paths
  function generatePieChartPaths(data) {
    if (data.length === 0) return "";

    const total = data.reduce((sum, item) => sum + item.hours, 0);
    let paths = "";
    let startAngle = 0;

    data.forEach((item) => {
      const sliceAngle = (item.hours / total) * 360;
      const endAngle = startAngle + sliceAngle;

      // Convert angles to radians and calculate coordinates
      const startRad = ((startAngle - 90) * Math.PI) / 180;
      const endRad = ((endAngle - 90) * Math.PI) / 180;

      const x1 = 50 + 40 * Math.cos(startRad);
      const y1 = 50 + 40 * Math.sin(startRad);
      const x2 = 50 + 40 * Math.cos(endRad);
      const y2 = 50 + 40 * Math.sin(endRad);

      // Determine if the arc should be drawn as a large arc
      const largeArcFlag = sliceAngle > 180 ? 1 : 0;

      // Create the SVG path for the slice
      const path = [
        `M 50 50`,
        `L ${x1} ${y1}`,
        `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `Z`,
      ].join(" ");

      paths += `<path d="${path}" fill="${item.color}" stroke="#ffffff" stroke-width="0.5"></path>`;

      startAngle = endAngle;
    });

    return paths;
  }

  // Initial render
  render();

  // Return the instance for potential future reference
  return {
    updateView: (newView) => {
      view = newView;
      render();
    },
    updateCategory: (newCategory) => {
      selectedCategory = newCategory;
      render();
    },
  };
}
