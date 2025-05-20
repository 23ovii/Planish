// taskMatrix.js - Task Matrix component functionality with localStorage support

function initTaskMatrix(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return null;

  // Storage key for localStorage
  const STORAGE_KEY = 'taskMatrixData';

  // Load tasks from localStorage or use empty array
  let tasks = loadTasksFromLocalStorage() || [];

  // Save tasks to localStorage
  function saveTasksToLocalStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      console.log('Tasks saved to localStorage:', tasks);
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
    }
  }

  // Load tasks from localStorage
  function loadTasksFromLocalStorage() {
    try {
      const storedTasks = localStorage.getItem(STORAGE_KEY);
      console.log('Retrieved from localStorage:', storedTasks);
      return storedTasks ? JSON.parse(storedTasks) : [];
    } catch (error) {
      console.error('Error loading tasks from localStorage:', error);
      return [];
    }
  }

  // New task template
  const newTaskTemplate = {
    title: "",
    description: "",
    urgency: "low",
    importance: "low",
    dueDate: "",
    status: "pending",
  };

  let newTask = { ...newTaskTemplate };
  let editingTask = null;

  // Render the task matrix UI
  function render() {
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    container.innerHTML = `
      <div class="w-full h-full bg-gradient-to-br from-white to-gray-50 dark:from-[#1e2837] dark:to-[#151c28] rounded-xl shadow-2xl p-8">
        <!-- Header Section -->
        <div class="flex justify-between items-center mb-8">
          <div class="space-y-2">
            <h2 class="text-3xl font-bold bg-gradient-to-r from-[#7a65db] to-[#9d88ff] bg-clip-text text-transparent">
              Task Matrix
            </h2>
            <p class="text-gray-500 dark:text-gray-400">Organize your tasks by priority and importance</p>
          </div>
          
          <button id="add-task-btn" 
            class="px-5 py-3 bg-gradient-to-r from-[#7a65db] to-[#9d88ff] hover:from-[#6952c7] hover:to-[#8b74ff] 
            text-white rounded-lg shadow-lg shadow-purple-500/20 flex items-center space-x-2 
            transform hover:scale-105 transition-all duration-200">
            <i data-lucide="plus-circle" class="w-5 h-5"></i>
            <span>Add Task</span>
          </button>
        </div>

        <!-- Matrix Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Quadrant 1 -->
          <div class="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden
            border border-red-200 dark:border-red-900/30 shadow-xl">
            <div class="p-5 border-b border-red-100 dark:border-red-900/30 bg-gradient-to-r from-red-50 to-transparent dark:from-red-900/20">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-red-500/10 rounded-lg">
                  <i data-lucide="alert-triangle" class="w-5 h-5 text-red-500"></i>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Urgent & Important</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Do these tasks immediately</p>
                </div>
              </div>
            </div>
            <div id="q1-tasks" class="p-5 space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar"></div>
          </div>

          <!-- Quadrant 2 -->
          <div class="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden
            border border-blue-200 dark:border-blue-900/30 shadow-xl">
            <div class="p-5 border-b border-blue-100 dark:border-blue-900/30 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/20">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-blue-500/10 rounded-lg">
                  <i data-lucide="calendar" class="w-5 h-5 text-blue-500"></i>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Important, Not Urgent</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Schedule these tasks</p>
                </div>
              </div>
            </div>
            <div id="q2-tasks" class="p-5 space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar"></div>
          </div>

          <!-- Quadrant 3 -->
          <div class="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden
            border border-yellow-200 dark:border-yellow-900/30 shadow-xl">
            <div class="p-5 border-b border-yellow-100 dark:border-yellow-900/30 bg-gradient-to-r from-yellow-50 to-transparent dark:from-yellow-900/20">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-yellow-500/10 rounded-lg">
                  <i data-lucide="clock" class="w-5 h-5 text-yellow-500"></i>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Urgent, Not Important</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Delegate if possible</p>
                </div>
              </div>
            </div>
            <div id="q3-tasks" class="p-5 space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar"></div>
          </div>

          <!-- Quadrant 4 -->
          <div class="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden
            border border-gray-200 dark:border-gray-800 shadow-xl">
            <div class="p-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-800/50">
              <div class="flex items-center space-x-3">
                <div class="p-2 bg-gray-500/10 rounded-lg">
                  <i data-lucide="battery-low" class="w-5 h-5 text-gray-500"></i>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Not Urgent, Not Important</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Eliminate if possible</p>
                </div>
              </div>
            </div>
            <div id="q4-tasks" class="p-5 space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar"></div>
          </div>
        </div>

        <style>
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #7a65db40;
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #7a65db60;
          }
        </style>
      </div>

      <!-- Add Task Dialog -->
      <div id="add-task-dialog" class="fixed inset-0 bg-black/50 backdrop-blur-sm hidden z-50 flex items-center justify-center">
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 transform transition-all duration-200">
              <div class="p-6">
                  <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add New Task</h3>
                  <div class="space-y-4">
                      <div>
                          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title*</label>
                          <input type="text" id="task-title" class="w-full rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2">
                      </div>
                      <div>
                          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                          <textarea id="task-description" rows="3" class="w-full rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"></textarea>
                      </div>
                      <div class="grid grid-cols-2 gap-4">
                          <div>
                              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Urgency</label>
                              <select id="task-urgency" class="w-full rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2">
                                  <option value="low">Low</option>
                                  <option value="high">High</option>
                              </select>
                          </div>
                          <div>
                              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Importance</label>
                              <select id="task-importance" class="w-full rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2">
                                  <option value="low">Low</option>
                                  <option value="high">High</option>
                              </select>
                          </div>
                      </div>
                      <div>
                          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date* (DD/MM)</label>
                          <input type="text" id="task-due-date" placeholder="DD/MM" class="w-full rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2">
                      </div>
                  </div>
              </div>
              <div class="border-t dark:border-gray-700 p-4 flex justify-end space-x-3">
                  <button id="cancel-add-task" class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      Cancel
                  </button>
                  <button id="confirm-add-task" class="px-4 py-2 bg-[#7a65db] hover:bg-[#6952c7] text-white rounded-lg transition-colors">
                      Add Task
                  </button>
              </div>
          </div>
      </div>

      <!-- Edit Task Dialog -->
      <div id="edit-task-dialog" class="fixed inset-0 bg-black/50 backdrop-blur-sm hidden z-50 flex items-center justify-center">
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 transform transition-all duration-200">
              <div class="p-6">
                  <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Edit Task</h3>
                  <div class="space-y-4">
                      <div>
                          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title*</label>
                          <input type="text" id="edit-task-title" class="w-full rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2">
                      </div>
                      <div>
                          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                          <textarea id="edit-task-description" rows="3" class="w-full rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2"></textarea>
                      </div>
                      <div class="grid grid-cols-2 gap-4">
                          <div>
                              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Urgency</label>
                              <select id="edit-task-urgency" class="w-full rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2">
                                  <option value="low">Low</option>
                                  <option value="high">High</option>
                              </select>
                          </div>
                          <div>
                              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Importance</label>
                              <select id="edit-task-importance" class="w-full rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2">
                                  <option value="low">Low</option>
                                  <option value="high">High</option>
                              </select>
                          </div>
                      </div>
                      <div>
                          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date* (DD/MM)</label>
                          <input type="text" id="edit-task-due-date" placeholder="DD/MM" class="w-full rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2">
                      </div>
                      <div>
                          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                          <select id="edit-task-status" class="w-full rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2">
                              <option value="pending">Pending</option>
                              <option value="completed">Completed</option>
                          </select>
                      </div>
                  </div>
              </div>
              <div class="border-t dark:border-gray-700 p-4 flex justify-end space-x-3">
                  <button id="cancel-edit-task" class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      Cancel
                  </button>
                  <button id="confirm-edit-task" class="px-4 py-2 bg-[#7a65db] hover:bg-[#6952c7] text-white rounded-lg transition-colors">
                      Save Changes
                  </button>
              </div>
          </div>
      </div>
    `;

    // Initialize Lucide icons
    lucide.createIcons();

    // Render tasks in each quadrant
    renderTasks();

    // Add event listeners
    setupEventListeners();
  }

  // Render tasks in their respective quadrants
  function renderTasks() {
    // Clear all quadrants
    document.getElementById("q1-tasks").innerHTML = "";
    document.getElementById("q2-tasks").innerHTML = "";
    document.getElementById("q3-tasks").innerHTML = "";
    document.getElementById("q4-tasks").innerHTML = "";

    // Sort tasks into quadrants
    tasks.forEach((task) => {
      const quadrantId = getQuadrantId(task.urgency, task.importance);
      const quadrantElement = document.getElementById(quadrantId);
      if (quadrantElement) {
        quadrantElement.appendChild(createTaskElement(task));
      }
    });

    // Important fix: Initialize Lucide icons after adding all task elements
    lucide.createIcons();
  }

  // Get the quadrant ID based on urgency and importance
  function getQuadrantId(urgency, importance) {
    if (urgency === "high" && importance === "high") return "q1-tasks";
    if (urgency === "low" && importance === "high") return "q2-tasks";
    if (urgency === "high" && importance === "low") return "q3-tasks";
    if (urgency === "low" && importance === "low") return "q4-tasks";
    return "q4-tasks"; // Default
  }

  // Update createTaskElement function for better task cards
  function createTaskElement(task) {
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    const taskElement = document.createElement("div");
    taskElement.className = `
      group relative bg-white dark:bg-gray-800/50 rounded-lg shadow-sm 
      hover:shadow-md transition-all duration-200 border border-gray-100 
      dark:border-gray-700/30 backdrop-blur-sm
      ${task.status === "completed" ? "opacity-60" : ""}
    `;
    
    taskElement.innerHTML = `
      <div class="p-4">
        <div class="flex justify-between items-start gap-4">
          <div class="flex-1 min-w-0">
            <h3 class="font-medium text-gray-900 dark:text-white ${task.status === "completed" ? "line-through" : ""} 
              truncate group-hover:text-[#7a65db] transition-colors">
              ${task.title}
            </h3>
            ${createTruncatedText(task.description)}
            <div class="flex items-center gap-2 mt-3">
              <span class="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <i data-lucide="calendar" class="w-3 h-3 mr-1"></i>
                ${task.dueDate}
              </span>
              <span class="flex items-center text-xs px-2 py-1 rounded-full 
                ${getPriorityClass(task.urgency, task.importance)}">
                ${getPriorityLabel(task.urgency, task.importance)}
              </span>
            </div>
          </div>
          
          <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button class="toggle-status p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 
              transition-colors" data-id="${task.id}">
              <i data-lucide="check-circle" class="${
                task.status === "completed" 
                  ? "text-green-500" 
                  : "text-gray-400 dark:text-gray-600"
              }" style="width: 18px; height: 18px;"></i>
            </button>
            <button class="edit-task p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 
              transition-colors" data-id="${task.id}">
              <i data-lucide="edit" class="text-gray-400 dark:text-gray-600" 
                style="width: 18px; height: 18px;"></i>
            </button>
            <button class="delete-task p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 
              transition-colors" data-id="${task.id}">
              <i data-lucide="trash-2" class="text-gray-400 dark:text-gray-600" 
                style="width: 18px; height: 18px;"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    // Add event listeners
    taskElement.querySelector('.toggle-status').addEventListener('click', () => {
      handleToggleStatus(task.id);
    });
    
    taskElement.querySelector('.edit-task').addEventListener('click', () => {
      showEditTaskDialog(task.id);
    });
    
    taskElement.querySelector('.delete-task').addEventListener('click', () => {
      handleDeleteTask(task.id);
    });
    
    return taskElement;
  }

  // Add helper functions for priority styling
  function getPriorityClass(urgency, importance) {
    if (urgency === "high" && importance === "high") 
      return "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400";
    if (urgency === "low" && importance === "high") 
      return "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400";
    if (urgency === "high" && importance === "low") 
      return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400";
    return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400";
  }

  function getPriorityLabel(urgency, importance) {
    if (urgency === "high" && importance === "high") return "High Priority";
    if (urgency === "low" && importance === "high") return "Important";
    if (urgency === "high" && importance === "low") return "Urgent";
    return "Low Priority";
  }

  // Helper function to truncate text with "See more" option
 function createTruncatedText(text, maxLength = 150) {
  // Cazul 1: Textul este gol sau null
  if (!text) {
    return '<p class="text-sm text-gray-500 dark:text-gray-400 mt-1"></p>';
  }
  
  // Cazul 2: Textul este scurt, sub maxLength
  if (text.length <= maxLength) {
    return `<p class="text-sm text-gray-500 dark:text-gray-400 mt-1 break-all break-words overflow-hidden">${text}</p>`;
  }
  
  // Cazul 3: Textul este lung, peste maxLength - AICI APLICĂM TRUNCAREA
  // Indiferent de conținut, dacă e lung, îl trunchiăm
  const shortVersion = text.substring(0, maxLength) + "...";
  
  // Construim elementul HTML cu textul trunchiat și cel complet
  const truncatedHTML = `
    <div class="text-content w-full">
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 break-all break-words overflow-hidden truncated-text">${shortVersion}</p>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 break-all break-words overflow-hidden full-text hidden">${text}</p>
      <button class="text-xs text-blue-500 see-more-toggle mt-1">See more</button>
    </div>
  `;
  
  return truncatedHTML;
}

  // Create a task element
  function createTaskElement(task) {
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    const taskElement = document.createElement("div");
    taskElement.className = `mb-3 border rounded-lg ${task.status === "completed" ? "opacity-60" : ""} ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`;
    
    // Create the inner content using HTML string instead of DOM manipulation
    // This approach ensures proper HTML structure for the Lucide icons
    taskElement.innerHTML = `
      <div class="p-4">
        <div class="flex justify-between items-start">
          <div class="flex-1 mr-2 task-text-container">
            <h3 class="font-medium ${task.status === "completed" ? "line-through" : ""} break-words ${isDarkMode ? 'text-gray-100' : ''}">${task.title}</h3>
            ${createTruncatedText(task.description)}
            <p class="text-xs mt-2 ${isDarkMode ? 'text-gray-400' : ''}">Due: ${task.dueDate}</p>
          </div>
          <div class="flex space-x-1 shrink-0">
            <button class="toggle-status p-1 rounded-full hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}" data-id="${task.id}">
              <i data-lucide="check-circle" class="${task.status === "completed" ? "text-green-500" : isDarkMode ? "text-gray-600" : "text-gray-300"}" style="width: 18px; height: 18px;"></i>
            </button>
            <button class="edit-task p-1 rounded-full hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}" data-id="${task.id}">
              <i data-lucide="edit" class="${isDarkMode ? 'text-gray-400' : 'text-gray-600'}" style="width: 18px; height: 18px;"></i>
            </button>
            <button class="delete-task p-1 rounded-full hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}" data-id="${task.id}">
              <i data-lucide="trash-2" class="${isDarkMode ? 'text-gray-400' : 'text-gray-600'}" style="width: 18px; height: 18px;"></i>
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Add event listeners after HTML is set
    taskElement.querySelector('.toggle-status').addEventListener('click', () => {
      handleToggleStatus(task.id);
    });
    
    taskElement.querySelector('.edit-task').addEventListener('click', () => {
      showEditTaskDialog(task.id);
    });
    
    taskElement.querySelector('.delete-task').addEventListener('click', () => {
      handleDeleteTask(task.id);
    });
    
    // Add event listener for "See more" toggle button if it exists
    const seeMoreBtn = taskElement.querySelector('.see-more-toggle');
if (seeMoreBtn) {
  // Folosim function() în loc de arrow function pentru a avea this corect
  seeMoreBtn.addEventListener('click', function() {
    const textContent = this.parentElement;
    const truncatedEl = textContent.querySelector('.truncated-text');
    const fullEl = textContent.querySelector('.full-text');
    
    // Comută vizibilitatea
    truncatedEl.classList.toggle('hidden');
    fullEl.classList.toggle('hidden');
    
    // Actualizează textul butonului
    this.textContent = truncatedEl.classList.contains('hidden') ? 'See less' : 'See more';
  });
}
    
    return taskElement;
  }

  // Add this function after createTaskElement
  function showDeleteConfirmDialog(taskId, taskTitle) {
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    // Create the dialog
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
                    <h3 class="text-lg font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}">Confirm Delete</h3>
                </div>
                
                <div class="mb-6">
                    <p class="${isDarkMode ? 'text-gray-300' : 'text-gray-600'}">
                        Are you sure you want to delete this task?<br>
                        <span class="font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}">"${taskTitle}"</span>
                    </p>
                </div>
                
                <div class="flex justify-end space-x-3">
                    <button id="cancel-delete" 
                        class="${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} 
                        px-4 py-2 rounded-md transition-colors duration-200">
                        Cancel
                    </button>
                    <button id="confirm-delete" 
                        class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors duration-200">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    `;

    // Add to DOM
    document.body.appendChild(dialogOverlay);

    // Animate in
    requestAnimationFrame(() => {
        const dialog = dialogOverlay.querySelector('div');
        dialog.classList.remove('scale-95', 'opacity-0');
        dialog.classList.add('scale-100', 'opacity-100');
    });

    // Handle click events
    return new Promise((resolve) => {
        dialogOverlay.querySelector('#cancel-delete').addEventListener('click', () => {
            animateAndRemoveDialog(dialogOverlay, false);
            resolve(false);
        });

        dialogOverlay.querySelector('#confirm-delete').addEventListener('click', () => {
            animateAndRemoveDialog(dialogOverlay, true);
            resolve(true);
        });

        // Close on backdrop click
        dialogOverlay.addEventListener('click', (e) => {
            if (e.target === dialogOverlay) {
                animateAndRemoveDialog(dialogOverlay, false);
                resolve(false);
            }
        });
    });
}

function animateAndRemoveDialog(dialog, result) {
    const dialogContent = dialog.querySelector('div');
    dialogContent.classList.remove('scale-100', 'opacity-100');
    dialogContent.classList.add('scale-95', 'opacity-0');
    
    setTimeout(() => {
        dialog.remove();
    }, 200);
}

// Modify handleDeleteTask to use the new dialog
async function handleDeleteTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    const shouldDelete = await showDeleteConfirmDialog(taskId, task.title);
    
    if (shouldDelete) {
        tasks = tasks.filter((task) => task.id !== taskId);
        saveTasksToLocalStorage();
        render();
    }
}

  // Set up event listeners
  function setupEventListeners() {
    // Add task button
    document.getElementById("add-task-btn").addEventListener("click", () => {
      showAddTaskDialog();
    });

    // Cancel add task
    document.getElementById("cancel-add-task").addEventListener("click", () => {
      hideAddTaskDialog();
    });

    // Confirm add task
    document.getElementById("confirm-add-task").addEventListener("click", () => {
      handleAddTask();
    });

    // Cancel edit task
    document.getElementById("cancel-edit-task").addEventListener("click", () => {
      hideEditTaskDialog();
    });

    // Confirm edit task
    document.getElementById("confirm-edit-task").addEventListener("click", () => {
      handleEditTask();
    });
  }

  // Show add task dialog
  function showAddTaskDialog() {
    // Reset form
    newTask = { ...newTaskTemplate };
    document.getElementById("task-title").value = "";
    document.getElementById("task-description").value = "";
    document.getElementById("task-urgency").value = "low";
    document.getElementById("task-importance").value = "low";
    document.getElementById("task-due-date").value = "";

    const dialog = document.getElementById("add-task-dialog");
    const dialogContent = dialog.querySelector('div');

    // Show dialog and set initial state
    dialog.classList.remove("hidden");
    dialog.classList.add("opacity-0");
    dialogContent.classList.add("transform", "scale-95", "opacity-0");

    // Trigger animation
    requestAnimationFrame(() => {
        dialog.classList.remove("opacity-0");
        dialog.classList.add("opacity-100", "transition-opacity", "duration-200");
        dialogContent.classList.remove("scale-95", "opacity-0");
        dialogContent.classList.add("scale-100", "opacity-100", "transition-all", "duration-200");
    });
}

  // Hide add task dialog
  function hideAddTaskDialog() {
    const dialog = document.getElementById("add-task-dialog");
    const dialogContent = dialog.querySelector('div');

    // Trigger closing animation
    dialog.classList.remove("opacity-100");
    dialog.classList.add("opacity-0");
    dialogContent.classList.remove("scale-100", "opacity-100");
    dialogContent.classList.add("scale-95", "opacity-0");

    // Hide dialog after animation
    setTimeout(() => {
        dialog.classList.add("hidden");
        // Reset classes
        dialog.classList.remove("opacity-0", "transition-opacity", "duration-200");
        dialogContent.classList.remove("scale-95", "opacity-0", "transition-all", "duration-200");
    }, 200);
}

  // Show edit task dialog
  function showEditTaskDialog(taskId) {
    // Find task
    editingTask = tasks.find((task) => task.id === taskId);
    if (!editingTask) return;

    // Fill form
    document.getElementById("edit-task-title").value = editingTask.title;
    document.getElementById("edit-task-description").value = editingTask.description;
    document.getElementById("edit-task-urgency").value = editingTask.urgency;
    document.getElementById("edit-task-importance").value = editingTask.importance;
    document.getElementById("edit-task-due-date").value = editingTask.dueDate;
    document.getElementById("edit-task-status").value = editingTask.status;

    const dialog = document.getElementById("edit-task-dialog");
    const dialogContent = dialog.querySelector('div');

    // Show dialog and set initial state
    dialog.classList.remove("hidden");
    dialog.classList.add("opacity-0");
    dialogContent.classList.add("transform", "scale-95", "opacity-0");

    // Trigger animation
    requestAnimationFrame(() => {
        dialog.classList.remove("opacity-0");
        dialog.classList.add("opacity-100", "transition-opacity", "duration-200");
        dialogContent.classList.remove("scale-95", "opacity-0");
        dialogContent.classList.add("scale-100", "opacity-100", "transition-all", "duration-200");
    });
}

  // Hide edit task dialog
  function hideEditTaskDialog() {
    const dialog = document.getElementById("edit-task-dialog");
    const dialogContent = dialog.querySelector('div');

    // Trigger closing animation
    dialog.classList.remove("opacity-100");
    dialog.classList.add("opacity-0");
    dialogContent.classList.remove("scale-100", "opacity-100");
    dialogContent.classList.add("scale-95", "opacity-0");

    // Hide dialog after animation
    setTimeout(() => {
        dialog.classList.add("hidden");
        // Reset classes
        dialog.classList.remove("opacity-0", "transition-opacity", "duration-200");
        dialogContent.classList.remove("scale-95", "opacity-0", "transition-all", "duration-200");
        editingTask = null;
    }, 200);
}

  // Handle add task
  function handleAddTask() {
    // Get form values
    const title = document.getElementById("task-title").value;
    const description = document.getElementById("task-description").value;
    const urgency = document.getElementById("task-urgency").value;
    const importance = document.getElementById("task-importance").value;
    const dueDateInput = document.getElementById("task-due-date").value;

    // Basic validation
    if (!title || !dueDateInput) {
        alert("Te rog completează toate câmpurile obligatorii!");
        return;
    }

    // Validate date format using regex
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])$/;
    if (!dateRegex.test(dueDateInput)) {
        alert("Te rog introdu data în formatul corect: ZZ/LL (exemplu: 05/12)");
        return;
    }

    // Extract and validate day and month
    const [day, month] = dueDateInput.split('/').map(Number);
    
    // Create a date object to validate the day for specific months
    const tempDate = new Date(2025, month - 1, day);
    if (tempDate.getMonth() !== month - 1) {
        alert(`Data ${day}/${month} nu este validă! Te rog verifică numărul de zile pentru luna selectată.`);
        return;
    }

    // Format date properly
    const dueDate = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${new Date().getFullYear()}`;

    // Create new task
    const task = {
        id: Date.now().toString(),
        title,
        description,
        urgency,
        importance,
        dueDate,
        status: "pending",
    };

    tasks.push(task);
    saveTasksToLocalStorage();
    hideAddTaskDialog();
    render();
}

  // Handle edit task
  function handleEditTask() {
    if (!editingTask) return;

    const title = document.getElementById("edit-task-title").value;
    const description = document.getElementById("edit-task-description").value;
    const urgency = document.getElementById("edit-task-urgency").value;
    const importance = document.getElementById("edit-task-importance").value;
    const dueDateInput = document.getElementById("edit-task-due-date").value;

    // Basic validation
    if (!title || !dueDateInput) {
        alert("Te rog completează toate câmpurile obligatorii!");
        return;
    }

    // Validate date format using regex
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])$/;
    if (!dateRegex.test(dueDateInput)) {
        alert("Te rog introdu data în formatul corect: ZZ/LL (exemplu: 05/12)");
        return;
    }

    // Extract and validate day and month
    const [day, month] = dueDateInput.split('/').map(Number);
    
    // Create a date object to validate the day for specific months
    const tempDate = new Date(2025, month - 1, day);
    if (tempDate.getMonth() !== month - 1) {
        alert(`Data ${day}/${month} nu este validă! Te rog verifică numărul de zile pentru luna selectată.`);
        return;
    }

    // Format date properly
    const dueDate = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${new Date().getFullYear()}`;

    // Update task
    tasks = tasks.map((task) => {
        if (task.id === editingTask.id) {
            return {
                ...task,
                title,
                description,
                urgency,
                importance,
                dueDate,
                status: document.getElementById("edit-task-status").value,
            };
        }
        return task;
    });

    saveTasksToLocalStorage();
    hideEditTaskDialog();
    render();
  }

  // Handle delete task
  async function handleDeleteTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    const shouldDelete = await showDeleteConfirmDialog(taskId, task.title);
    
    if (shouldDelete) {
        tasks = tasks.filter((task) => task.id !== taskId);
        saveTasksToLocalStorage();
        render();
    }
  }

  // Handle toggle status
  function handleToggleStatus(taskId) {
    tasks = tasks.map((task) => {
      if (task.id === taskId) {
        return {
          ...task,
          status: task.status === "pending" ? "completed" : "pending",
        };
      }
      return task;
    });
    
    // Save to localStorage
    saveTasksToLocalStorage();
    
    render();
  }

  // Initial render and ensure localStorage is synced
  render();
  
  // Make sure tasks are saved in localStorage at initialization
  // This ensures we have data in localStorage even on first load
  if (tasks.length === 0) {
    saveTasksToLocalStorage();
  }

  // Add theme change observer
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class' && 
          mutation.target === document.documentElement) {
        render();
      }
    });
  });

  // Start observing theme changes
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });

  // Cleanup function
  function cleanup() {
    observer.disconnect();
  }

  // Modify return statement to include cleanup
  return {
    render,
    addTask: (task) => {
      tasks.push(task);
      saveTasksToLocalStorage();
      render();
    },
    getTasks: () => tasks,
    clearAllTasks: () => {
      tasks = [];
      saveTasksToLocalStorage();
      render();
    },
    cleanup // Add cleanup method
  };
}

// Usage example:
const taskMatrix = initTaskMatrix('task-matrix');
// When unmounting/cleaning up:
// taskMatrix.cleanup();