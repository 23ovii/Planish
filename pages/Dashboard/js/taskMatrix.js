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
    container.innerHTML = `
      <div class="bg-background p-6 rounded-lg">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold">Task Prioritization Matrix</h2>
          <button id="add-task-btn" class="bg-primary text-white px-4 py-2 rounded-md flex items-center">
            <i data-lucide="plus-circle" class="mr-2" style="width: 18px; height: 18px;"></i>
            Add Task
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Quadrant 1: Urgent & Important -->
          <div class="border border-red-500 border-t-4 rounded-lg bg-white">
            <div class="p-4 border-b">
              <h3 class="text-lg font-medium">Urgent & Important</h3>
            </div>
            <div class="p-4">
              <p class="text-sm text-muted-foreground mb-4">
                Do these tasks immediately
              </p>
              <div id="q1-tasks" class="space-y-2">
                <!-- Tasks will be inserted here -->
              </div>
            </div>
          </div>

          <!-- Quadrant 2: Not Urgent & Important -->
          <div class="border border-blue-500 border-t-4 rounded-lg bg-white">
            <div class="p-4 border-b">
              <h3 class="text-lg font-medium">Important, Not Urgent</h3>
            </div>
            <div class="p-4">
              <p class="text-sm text-muted-foreground mb-4">
                Schedule time for these tasks
              </p>
              <div id="q2-tasks" class="space-y-2">
                <!-- Tasks will be inserted here -->
              </div>
            </div>
          </div>

          <!-- Quadrant 3: Urgent & Not Important -->
          <div class="border border-yellow-500 border-t-4 rounded-lg bg-white">
            <div class="p-4 border-b">
              <h3 class="text-lg font-medium">Urgent, Not Important</h3>
            </div>
            <div class="p-4">
              <p class="text-sm text-muted-foreground mb-4">
                Delegate these tasks if possible
              </p>
              <div id="q3-tasks" class="space-y-2">
                <!-- Tasks will be inserted here -->
              </div>
            </div>
          </div>

          <!-- Quadrant 4: Not Urgent & Not Important -->
          <div class="border border-gray-500 border-t-4 rounded-lg bg-white">
            <div class="p-4 border-b">
              <h3 class="text-lg font-medium">Not Urgent, Not Important</h3>
            </div>
            <div class="p-4">
              <p class="text-sm text-muted-foreground mb-4">
                Eliminate these tasks when possible
              </p>
              <div id="q4-tasks" class="space-y-2">
                <!-- Tasks will be inserted here -->
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Task Dialog -->
      <div id="add-task-dialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-50">
        <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h3 class="text-lg font-medium mb-4">Add New Task</h3>
          <div class="space-y-4">
            <div class="space-y-2">
              <label for="title" class="block text-sm font-medium">Title</label>
              <input id="task-title" type="text" class="w-full border rounded-md px-3 py-2" />
            </div>
            <div class="space-y-2">
              <label for="description" class="block text-sm font-medium">Description</label>
              <textarea id="task-description" class="w-full border rounded-md px-3 py-2 h-20 resize-y" style="max-height: 200px;"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label for="urgency" class="block text-sm font-medium">Urgency</label>
                <select id="task-urgency" class="w-full border rounded-md px-3 py-2">
                  <option value="high">High</option>
                  <option value="low" selected>Low</option>
                </select>
              </div>
              <div class="space-y-2">
                <label for="importance" class="block text-sm font-medium">Importance</label>
                <select id="task-importance" class="w-full border rounded-md px-3 py-2">
                  <option value="high">High</option>
                  <option value="low" selected>Low</option>
                </select>
              </div>
            </div>
            <div class="space-y-2">
              <label for="dueDate" class="block text-sm font-medium">Due Date (DD/MM)</label>
              <input id="task-due-date" type="text" placeholder="DD/MM" pattern="(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[012])" class="w-full border rounded-md px-3 py-2" />
            </div>
          </div>
          <div class="flex justify-end space-x-2 mt-6">
            <button id="cancel-add-task" class="px-4 py-2 border rounded-md">Cancel</button>
            <button id="confirm-add-task" class="px-4 py-2 bg-primary text-white rounded-md">Add Task</button>
          </div>
        </div>
      </div>

      <!-- Edit Task Dialog -->
      <div id="edit-task-dialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-50">
        <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h3 class="text-lg font-medium mb-4">Edit Task</h3>
          <div class="space-y-4">
            <div class="space-y-2">
              <label for="edit-title" class="block text-sm font-medium">Title</label>
              <input id="edit-task-title" type="text" class="w-full border rounded-md px-3 py-2" />
            </div>
            <div class="space-y-2">
              <label for="edit-description" class="block text-sm font-medium">Description</label>
              <textarea id="edit-task-description" class="w-full border rounded-md px-3 py-2 h-20 resize-y" style="max-height: 200px;"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label for="edit-urgency" class="block text-sm font-medium">Urgency</label>
                <select id="edit-task-urgency" class="w-full border rounded-md px-3 py-2">
                  <option value="high">High</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div class="space-y-2">
                <label for="edit-importance" class="block text-sm font-medium">Importance</label>
                <select id="edit-task-importance" class="w-full border rounded-md px-3 py-2">
                  <option value="high">High</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            <div class="space-y-2">
              <label for="edit-dueDate" class="block text-sm font-medium">Due Date (DD/MM)</label>
              <input id="edit-task-due-date" type="text" placeholder="DD/MM" pattern="(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[012])" class="w-full border rounded-md px-3 py-2" />
            </div>
            <div class="space-y-2">
              <label for="edit-status" class="block text-sm font-medium">Status</label>
              <select id="edit-task-status" class="w-full border rounded-md px-3 py-2">
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div class="flex justify-end space-x-2 mt-6">
            <button id="cancel-edit-task" class="px-4 py-2 border rounded-md">Cancel</button>
            <button id="confirm-edit-task" class="px-4 py-2 bg-primary text-white rounded-md">Save Changes</button>
          </div>
        </div>
      </div>

      <style>
        /* Add these styles to ensure proper text wrapping */
        .task-text-container {
          width: 100%;
          overflow-wrap: break-word;
          word-wrap: break-word;
          word-break: break-word;
          hyphens: auto;
          max-width: 100%;
        }
        
        .truncated-text, .full-text {
          width: 100%;
          overflow-wrap: break-word;
          word-wrap: break-word;
          word-break: break-word;
          hyphens: auto;
          max-width: 100%;
          white-space: pre-wrap;
        }
      </style>
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

  // Helper function to truncate text with "See more" option
  function createTruncatedText(text, maxLength = 150) {
    if (!text || text.length <= maxLength) {
      return `<p class="text-sm text-muted-foreground mt-1 task-text-container">${text || ""}</p>`;
    }
    
    const truncatedText = text.substring(0, maxLength) + "...";
    return `
      <div class="text-content task-text-container">
        <p class="text-sm text-muted-foreground mt-1 truncated-text">${truncatedText}</p>
        <p class="text-sm text-muted-foreground mt-1 full-text hidden">${text}</p>
        <button class="text-xs text-blue-500 see-more-toggle">See more</button>
      </div>
    `;
  }

  // Create a task element
  function createTaskElement(task) {
    const taskElement = document.createElement("div");
    taskElement.className = `mb-3 border rounded-lg ${task.status === "completed" ? "opacity-60" : ""}`;
    
    // Create the inner content using HTML string instead of DOM manipulation
    // This approach ensures proper HTML structure for the Lucide icons
    taskElement.innerHTML = `
      <div class="p-4">
        <div class="flex justify-between items-start">
          <div class="flex-1 mr-2 task-text-container">
            <h3 class="font-medium ${task.status === "completed" ? "line-through" : ""} break-words">${task.title}</h3>
            ${createTruncatedText(task.description)}
            <p class="text-xs mt-2">Due: ${new Date(task.dueDate).toLocaleDateString()}</p>
          </div>
          <div class="flex space-x-1 shrink-0">
            <button class="toggle-status p-1 rounded-full hover:bg-gray-100" data-id="${task.id}">
              <i data-lucide="check-circle" class="${task.status === "completed" ? "text-green-500" : "text-gray-300"}" style="width: 18px; height: 18px;"></i>
            </button>
            <button class="edit-task p-1 rounded-full hover:bg-gray-100" data-id="${task.id}">
              <i data-lucide="edit" style="width: 18px; height: 18px;"></i>
            </button>
            <button class="delete-task p-1 rounded-full hover:bg-gray-100" data-id="${task.id}">
              <i data-lucide="trash-2" style="width: 18px; height: 18px;"></i>
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
      seeMoreBtn.addEventListener('click', () => {
        const contentDiv = seeMoreBtn.closest('.text-content');
        const truncatedText = contentDiv.querySelector('.truncated-text');
        const fullText = contentDiv.querySelector('.full-text');
        
        // Toggle visibility of text elements
        truncatedText.classList.toggle('hidden');
        fullText.classList.toggle('hidden');
        
        // Toggle button text
        seeMoreBtn.textContent = truncatedText.classList.contains('hidden') ? 'See less' : 'See more';
      });
    }
    
    return taskElement;
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
    document
      .getElementById("confirm-add-task")
      .addEventListener("click", () => {
        handleAddTask();
      });

    // Cancel edit task
    document
      .getElementById("cancel-edit-task")
      .addEventListener("click", () => {
        hideEditTaskDialog();
      });

    // Confirm edit task
    document
      .getElementById("confirm-edit-task")
      .addEventListener("click", () => {
        handleEditTask();
      });
      
    // Add key event listeners for form submission with Enter key
    // For add task form
    const addTaskForm = document.getElementById("add-task-dialog");
    addTaskForm.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleAddTask();
      }
    });

    // For edit task form
    const editTaskForm = document.getElementById("edit-task-dialog");
    editTaskForm.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleEditTask();
      }
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

    // Show dialog
    document.getElementById("add-task-dialog").classList.remove("hidden");
  }

  // Hide add task dialog
  function hideAddTaskDialog() {
    document.getElementById("add-task-dialog").classList.add("hidden");
  }

  // Show edit task dialog
  function showEditTaskDialog(taskId) {
    // Find task
    editingTask = tasks.find((task) => task.id === taskId);
    if (!editingTask) return;

    // Fill form
    document.getElementById("edit-task-title").value = editingTask.title;
    document.getElementById("edit-task-description").value =
      editingTask.description;
    document.getElementById("edit-task-urgency").value = editingTask.urgency;
    document.getElementById("edit-task-importance").value =
      editingTask.importance;
    document.getElementById("edit-task-due-date").value = editingTask.dueDate;
    document.getElementById("edit-task-status").value = editingTask.status;

    // Show dialog
    document.getElementById("edit-task-dialog").classList.remove("hidden");
  }

  // Hide edit task dialog
  function hideEditTaskDialog() {
    document.getElementById("edit-task-dialog").classList.add("hidden");
    editingTask = null;
  }

  // Handle add task
  function handleAddTask() {
    // Get form values
    const title = document.getElementById("task-title").value;
    const description = document.getElementById("task-description").value;
    const urgency = document.getElementById("task-urgency").value;
    const importance = document.getElementById("task-importance").value;
    const dueDate = document.getElementById("task-due-date").value;

    // Validate
    if (!title || !dueDate) {
      alert("Please fill in all required fields");
      return;
    }

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

    // Add to tasks
    tasks.push(task);
    
    // Save to localStorage
    saveTasksToLocalStorage();

    // Hide dialog
    hideAddTaskDialog();

    // Re-render
    render();
  }

  // Handle edit task
  function handleEditTask() {
    if (!editingTask) return;

    // Get form values
    const title = document.getElementById("edit-task-title").value;
    const description = document.getElementById("edit-task-description").value;
    const urgency = document.getElementById("edit-task-urgency").value;
    const importance = document.getElementById("edit-task-importance").value;
    const dueDate = document.getElementById("edit-task-due-date").value;
    const status = document.getElementById("edit-task-status").value;

    // Validate
    if (!title || !dueDate) {
      alert("Please fill in all required fields");
      return;
    }

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
          status,
        };
      }
      return task;
    });
    
    // Save to localStorage
    saveTasksToLocalStorage();

    // Hide dialog
    hideEditTaskDialog();

    // Re-render
    render();
  }

  // Handle delete task
  function handleDeleteTask(taskId) {
    if (confirm("Are you sure you want to delete this task?")) {
      tasks = tasks.filter((task) => task.id !== taskId);
      
      // Save to localStorage
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

  // Return public methods
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
    }
  };
}