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
  let isDarkMode = false; // Dark mode state

  // Render the focus timer UI
  function render() {
    // Detectează dark mode la fiecare render
    isDarkMode = document.documentElement.classList.contains('dark');

    // Calculate progress percentage (100 means full circle, 0 means empty)
    const totalTime = timerState === "work" 
        ? settings.workDuration * 60 
        : settings.breakDuration * 60;
    const progress = 100 - ((timeLeft / totalTime) * 100); // Inverted calculation

    // Replace the progress circle section
    container.innerHTML = `
        <div class="w-full max-w-md mx-auto ${isDarkMode ? 'bg-slate-900' : 'bg-white'} shadow-lg rounded-lg ${isDarkMode ? 'border-slate-700' : 'border'}">
            <div class="p-6 ${isDarkMode ? 'border-slate-700' : 'border-b'}">
              <h2 class="text-2xl font-bold text-center ${isDarkMode ? 'text-[#7a65db]' : 'text-[#7a65db]'}">Focus Timer</h2>
              <p class="text-center ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}">Stay productive with Pomodoro technique</p>
              
              <div class="mt-4 ${isDarkMode ? 'border-slate-700' : 'border-b'}">
                <div class="flex space-x-2">
                  <button id="timer-tab" class="px-4 py-2 ${
                    activeTab === "timer" 
                        ? `border-b-2 border-[#7a65db] text-[#7a65db] font-medium` 
                        : `border-b-2 border-transparent hover:text-[#7a65db] ${isDarkMode ? 'text-slate-400' : ''}`
                  }">Timer</button>
                  <button id="settings-tab" class="px-4 py-2 ${
                    activeTab === "settings" 
                        ? `border-b-2 border-[#7a65db] text-[#7a65db] font-medium` 
                        : `border-b-2 border-transparent hover:text-[#7a65db] ${isDarkMode ? 'text-slate-400' : ''}`
                  }">Settings</button>
                </div>
              </div>
            </div>

            <div class="p-6">
                <!-- Timer Tab Content -->
                <div id="timer-content" class="${activeTab === "timer" ? "" : "hidden"} space-y-4">
                    <div class="flex flex-col items-center justify-center">
                        <div class="relative w-64 h-64 flex items-center justify-center">
                            <svg class="absolute inset-0 w-full h-full -rotate-90">
                                <!-- Background circle -->
                                <circle
                                    cx="128"
                                    cy="128"
                                    r="120"
                                    stroke="${isDarkMode ? '#7a65db20' : '#7a65db20'}"
                                    stroke-width="8"
                                    fill="none"
                                />
                                <!-- Progress circle -->
                                <circle
                                    cx="128"
                                    cy="128"
                                    r="120"
                                    stroke="#7a65db"
                                    stroke-width="8"
                                    fill="none"
                                    stroke-dasharray="${2 * Math.PI * 120}"
                                    stroke-dashoffset="${(progress / 100) * (2 * Math.PI * 120)}"
                                    style="transition: stroke-dashoffset 0.5s ease"
                                />
                            </svg>

                            <!-- Timer text -->
                            <div class="text-5xl font-bold ${isDarkMode ? 'text-[#7a65db]' : 'text-[#7a65db]'} z-10">
                                ${formatTime(timeLeft)}
                            </div>
                        </div>

                        <!-- Action buttons -->
                        <div class="flex justify-center space-x-4 mt-8">
                            <button id="reset-btn" class="p-2 rounded-md transition-colors ${isDarkMode ? 'border-slate-700 text-slate-400 hover:border-[#7a65db] hover:text-[#7a65db]' : 'border hover:border-[#7a65db] hover:text-[#7a65db]'} ${
                                timerState === "idle" && !isRunning ? "opacity-50 cursor-not-allowed" : ""
                            }">
                                <i data-lucide="rotate-ccw" class="h-5 w-5"></i>
                            </button>

                            <button id="toggle-btn" class="px-6 py-2 bg-[#7a65db] hover:bg-[#6952c7] text-white rounded-md flex items-center justify-center w-32 transition-colors">
                                ${isRunning ? '<i data-lucide="pause" class="mr-2 h-5 w-5"></i> Pause' : '<i data-lucide="play" class="mr-2 h-5 w-5"></i> Start'}
                            </button>

                            <button id="settings-btn" class="p-2 rounded-md transition-colors ${isDarkMode ? 'border-slate-700 text-slate-400 hover:border-[#7a65db] hover:text-[#7a65db]' : 'border hover:border-[#7a65db] hover:text-[#7a65db]'}">
                                <i data-lucide="settings" class="h-5 w-5"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Settings Tab Content -->
                <div id="settings-content" class="${activeTab === "settings" ? "" : "hidden"} space-y-8">
                    <div class="space-y-8">
                        <div>
                            <div class="flex justify-between mb-2">
                                <label for="work-duration" class="text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}">Work Duration (minutes)</label>
                                <span class="${isDarkMode ? 'text-slate-300' : 'text-slate-700'}">${settings.workDuration}</span>
                            </div>
                            <input type="range" id="work-duration" min="1" max="60" step="1" value="${settings.workDuration}" 
                                class="w-full h-2 rounded-lg appearance-none cursor-pointer ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} accent-[#7a65db]">
                        </div>

                        <div>
                            <div class="flex justify-between mb-2">
                                <label for="break-duration" class="text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}">Break Duration (minutes)</label>
                                <span class="${isDarkMode ? 'text-slate-300' : 'text-slate-700'}">${settings.breakDuration}</span>
                            </div>
                            <input type="range" id="break-duration" min="1" max="30" step="1" value="${settings.breakDuration}" 
                                class="w-full h-2 rounded-lg appearance-none cursor-pointer ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} accent-[#7a65db]">
                        </div>

                        <div>
                            <div class="flex justify-between mb-2">
                                <label for="cycles" class="text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}">Number of Cycles</label>
                                <span class="${isDarkMode ? 'text-slate-300' : 'text-slate-700'}">${settings.cycles}</span>
                            </div>
                            <input type="range" id="cycles" min="1" max="10" step="1" value="${settings.cycles}" 
                                class="w-full h-2 rounded-lg appearance-none cursor-pointer ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'} accent-[#7a65db]">
                        </div>
                    </div>

                    <button id="apply-settings" class="w-full py-2 bg-[#7a65db] hover:bg-[#6952c7] text-white rounded-md transition-colors">
                        Apply Settings
                    </button>
                </div>
            </div>

            <div class="p-4 ${isDarkMode ? 'border-slate-700' : 'border-t'} text-center">
                <p class="text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}">
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

    // Modify the apply settings click listener
    document.getElementById("apply-settings").addEventListener("click", () => {
        const workDuration = parseInt(document.getElementById("work-duration").value);
        const breakDuration = parseInt(document.getElementById("break-duration").value);
        const cycles = parseInt(document.getElementById("cycles").value);

        // Update settings
        settings.workDuration = workDuration;
        settings.breakDuration = breakDuration;
        settings.cycles = cycles;

        // Reset timeLeft if timer is idle
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

  // Replace the audio initialization with this:
  function createBeep(frequency = 440, duration = 200, volume = 0.5) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);

    oscillator.start(audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration / 1000);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  }

  // Replace the playNotification function with this:
  function playNotification(isWorkEnd = true) {
    try {
      // Different frequencies for work and break
      const frequency = isWorkEnd ? 440 : 520; // A4 for work, C5 for break
      createBeep(frequency);
    } catch (err) {
      console.error('Error playing notification:', err);
    }
  }

  // Start timer interval
  function startTimer() {
    if (interval) clearInterval(interval);

    interval = setInterval(() => {
      timeLeft--;

      if (timeLeft <= 0) {
        if (timerState === "work") {
          // Play notification and switch to break
          playNotification(true); // Work ended sound
          timerState = "break";
          timeLeft = settings.breakDuration * 60;
        } else if (timerState === "break") {
          // Play notification and handle cycle completion
          playNotification(false); // Break ended sound
          
          if (currentCycle < settings.cycles) {
            currentCycle++;
            timerState = "work";
            timeLeft = settings.workDuration * 60;
          } else {
            stopTimer();
            isRunning = false;
            timerState = "idle";
            currentCycle = 1;
            timeLeft = settings.workDuration * 60;
          }
        }
        render();
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
