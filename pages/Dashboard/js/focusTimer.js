// focusTimer.js - Focus Timer component functionality

function initFocusTimer(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return null;

  // Initial state
  let settings = {
    workDuration: 25,
    breakDuration: 5,
    cycles: 4,
  };
  let timeLeft = settings.workDuration * 60;
  let timerState = "idle"; // idle, work, break
  let isRunning = false;
  let currentCycle = 1;
  let activeTab = "timer";
  let interval = null;

  // Render the focus timer UI
  function render() {
    // Calculate progress percentage
    const totalTime =
      timerState === "work"
        ? settings.workDuration * 60
        : settings.breakDuration * 60;
    const progress = 100 - (timeLeft / totalTime) * 100;

    container.innerHTML = `
      <div class="w-full max-w-md mx-auto bg-background shadow-lg rounded-lg border">
        <div class="p-6 border-b">
          <h2 class="text-2xl font-bold text-center">Focus Timer</h2>
          <p class="text-center text-muted-foreground">Stay productive with Pomodoro technique</p>
          
          <div class="mt-4 border-b">
            <div class="flex space-x-2">
              <button id="timer-tab" class="px-4 py-2 ${activeTab === "timer" ? "border-b-2 border-primary text-primary font-medium" : "border-b-2 border-transparent hover:text-primary"}">Timer</button>
              <button id="settings-tab" class="px-4 py-2 ${activeTab === "settings" ? "border-b-2 border-primary text-primary font-medium" : "border-b-2 border-transparent hover:text-primary"}">Settings</button>
            </div>
          </div>
        </div>

        <div class="p-6">
          <!-- Timer Tab Content -->
          <div id="timer-content" class="${activeTab === "timer" ? "" : "hidden"} space-y-4">
            <div class="flex flex-col items-center justify-center">
              <div class="relative w-64 h-64 flex items-center justify-center rounded-full border-8 border-primary/20">
                <div class="absolute inset-0 rounded-full border-8 border-primary" 
                  style="clip-path: polygon(50% 50%, 50% 0%, ${progress <= 25 ? 50 + progress * 2 : 100}% 0%, ${progress > 25 && progress <= 50 ? 100 : 50 + (progress - 50) * 2}% ${progress > 25 && progress <= 50 ? (progress - 25) * 4 : 0}%, ${progress > 50 && progress <= 75 ? 100 - (progress - 50) * 4 : 0}% ${progress > 50 ? 100 : 50 + (progress - 25) * 2}%, ${progress > 75 ? 50 - (progress - 75) * 2 : 0}% ${progress > 75 ? 100 - (progress - 75) * 4 : 100}%)">
                </div>
                <div class="text-4xl font-bold">${formatTime(timeLeft)}</div>
              </div>

              <div class="mt-4 text-center">
                <p class="text-lg font-medium">
                  ${timerState === "work" ? "Focus Time" : timerState === "break" ? "Break Time" : "Ready"}
                </p>
                <p class="text-sm text-muted-foreground">
                  Cycle ${currentCycle} of ${settings.cycles}
                </p>
              </div>
            </div>

            <div class="flex justify-center space-x-4 mt-6">
              <button id="reset-btn" class="p-2 border rounded-md ${timerState === "idle" && !isRunning ? "opacity-50 cursor-not-allowed" : ""}">
                <i data-lucide="rotate-ccw" class="h-5 w-5"></i>
              </button>

              <button id="toggle-btn" class="px-6 py-2 bg-primary text-white rounded-md flex items-center justify-center w-32">
                ${isRunning ? '<i data-lucide="pause" class="mr-2 h-5 w-5"></i> Pause' : '<i data-lucide="play" class="mr-2 h-5 w-5"></i> Start'}
              </button>

              <button id="settings-btn" class="p-2 border rounded-md">
                <i data-lucide="settings" class="h-5 w-5"></i>
              </button>
            </div>
          </div>

          <!-- Settings Tab Content -->
          <div id="settings-content" class="${activeTab === "settings" ? "" : "hidden"} space-y-6">
            <div class="space-y-4">
              <div class="space-y-2">
                <div class="flex justify-between">
                  <label for="work-duration" class="text-sm font-medium">Work Duration (minutes)</label>
                  <span>${settings.workDuration}</span>
                </div>
                <input type="range" id="work-duration" min="1" max="60" step="1" value="${settings.workDuration}" 
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
              </div>

              <div class="space-y-2">
                <div class="flex justify-between">
                  <label for="break-duration" class="text-sm font-medium">Break Duration (minutes)</label>
                  <span>${settings.breakDuration}</span>
                </div>
                <input type="range" id="break-duration" min="1" max="30" step="1" value="${settings.breakDuration}" 
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
              </div>

              <div class="space-y-2">
                <div class="flex justify-between">
                  <label for="cycles" class="text-sm font-medium">Number of Cycles</label>
                  <span>${settings.cycles}</span>
                </div>
                <input type="range" id="cycles" min="1" max="10" step="1" value="${settings.cycles}" 
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
              </div>
            </div>

            <button id="apply-settings" class="w-full py-2 bg-primary text-white rounded-md">
              Apply Settings
            </button>
          </div>
        </div>

        <div class="p-4 border-t text-center">
          <p class="text-xs text-muted-foreground">
            The Pomodoro Technique helps improve productivity by breaking work
            into focused intervals with short breaks.
          </p>
        </div>
      </div>
    `;

    // Initialize Lucide icons
    lucide.createIcons();

    // Add event listeners
    setupEventListeners();
  }

  // Format time as MM:SS
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  // Set up event listeners
  function setupEventListeners() {
    // Tab switching
    document.getElementById("timer-tab").addEventListener("click", () => {
      activeTab = "timer";
      render();
    });

    document.getElementById("settings-tab").addEventListener("click", () => {
      activeTab = "settings";
      render();
    });

    document.getElementById("settings-btn").addEventListener("click", () => {
      activeTab = "settings";
      render();
    });

    // Timer controls
    document
      .getElementById("toggle-btn")
      .addEventListener("click", toggleTimer);
    document.getElementById("reset-btn").addEventListener("click", resetTimer);

    // Settings controls
    document.getElementById("work-duration").addEventListener("input", (e) => {
      document.querySelector("label[for='work-duration'] + span").textContent =
        e.target.value;
    });

    document.getElementById("break-duration").addEventListener("input", (e) => {
      document.querySelector("label[for='break-duration'] + span").textContent =
        e.target.value;
    });

    document.getElementById("cycles").addEventListener("input", (e) => {
      document.querySelector("label[for='cycles'] + span").textContent =
        e.target.value;
    });

    document.getElementById("apply-settings").addEventListener("click", () => {
      const workDuration = parseInt(
        document.getElementById("work-duration").value,
      );
      const breakDuration = parseInt(
        document.getElementById("break-duration").value,
      );
      const cycles = parseInt(document.getElementById("cycles").value);

      settings = {
        workDuration,
        breakDuration,
        cycles,
      };

      if (timerState === "idle") {
        timeLeft = settings.workDuration * 60;
      }

      activeTab = "timer";
      render();
    });
  }

  // Start/pause timer
  function toggleTimer() {
    if (timerState === "idle") {
      timerState = "work";
      timeLeft = settings.workDuration * 60;
    }

    isRunning = !isRunning;

    if (isRunning) {
      startTimer();
    } else {
      stopTimer();
    }

    render();
  }

  // Reset timer
  function resetTimer() {
    stopTimer();
    isRunning = false;
    timerState = "idle";
    timeLeft = settings.workDuration * 60;
    currentCycle = 1;
    render();
  }

  // Start timer interval
  function startTimer() {
    if (interval) clearInterval(interval);

    interval = setInterval(() => {
      timeLeft--;

      if (timeLeft <= 0) {
        // Timer completed
        if (timerState === "work") {
          // Work period completed, start break
          timerState = "break";
          timeLeft = settings.breakDuration * 60;
        } else {
          // Break period completed
          if (currentCycle < settings.cycles) {
            // Start next cycle
            currentCycle++;
            timerState = "work";
            timeLeft = settings.workDuration * 60;
          } else {
            // All cycles completed
            stopTimer();
            isRunning = false;
            timerState = "idle";
            currentCycle = 1;
            timeLeft = settings.workDuration * 60;
          }
        }
      }

      render();
    }, 1000);
  }

  // Stop timer interval
  function stopTimer() {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  }

  // Initial render
  render();

  // Clean up on destroy
  function destroy() {
    stopTimer();
  }

  // Return public methods
  return {
    render,
    toggleTimer,
    resetTimer,
    destroy,
  };
}
