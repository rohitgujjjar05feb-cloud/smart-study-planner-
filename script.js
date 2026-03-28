const subjectInput = document.getElementById("subject");
const taskTitleInput = document.getElementById("taskTitle");
const dueDateInput = document.getElementById("dueDate");
const priorityInput = document.getElementById("priority");
const descriptionInput = document.getElementById("description");

const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const statusFilter = document.getElementById("statusFilter");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");
const highPriorityTasks = document.getElementById("highPriorityTasks");
const todayDate = document.getElementById("todayDate");

const progressCircle = document.getElementById("progressCircle");
const progressText = document.getElementById("progressText");

const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");
const taskModal = document.getElementById("taskModal");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let editTaskId = null;

// Show today's date
if (todayDate) {
  todayDate.textContent = new Date().toDateString();
}

// Initial render
renderTasks();
updateSummary();

// Status filter
if (statusFilter) {
  statusFilter.addEventListener("change", function () {
    renderTasks();
  });
}

// Open modal
if (openModalBtn) {
  openModalBtn.addEventListener("click", function () {
    clearForm();
    editTaskId = null;
    if (addTaskBtn) {
      addTaskBtn.textContent = "Add Task";
    }
    if (taskModal) {
      taskModal.style.display = "flex";
    }
  });
}

// Close modal
if (closeModalBtn) {
  closeModalBtn.addEventListener("click", closeTaskModal);
}

if (cancelModalBtn) {
  cancelModalBtn.addEventListener("click", closeTaskModal);
}

window.addEventListener("click", function (event) {
  if (event.target === taskModal) {
    closeTaskModal();
  }
});

// Add or update task
if (addTaskBtn) {
  addTaskBtn.addEventListener("click", function () {
    const subject = subjectInput ? subjectInput.value.trim() : "";
    const title = taskTitleInput ? taskTitleInput.value.trim() : "";
    const dueDate = dueDateInput ? dueDateInput.value : "";
    const priority = priorityInput ? priorityInput.value : "";
    const description = descriptionInput ? descriptionInput.value.trim() : "";

    if (subject === "" || title === "" || dueDate === "" || priority === "") {
      alert("Please fill all required fields");
      return;
    }

    if (editTaskId === null) {
      const task = {
        id: Date.now(),
        subject: subject,
        title: title,
        dueDate: dueDate,
        priority: priority,
        description: description,
        completed: false
      };
      tasks.push(task);
    } else {
      tasks = tasks.map(function (task) {
        if (task.id === editTaskId) {
          return {
            ...task,
            subject: subject,
            title: title,
            dueDate: dueDate,
            priority: priority,
            description: description
          };
        }
        return task;
      });

      editTaskId = null;
      addTaskBtn.textContent = "Add Task";
    }

    saveTasks();
    renderTasks();
    updateSummary();
    clearForm();
    closeTaskModal();
  });
}

function closeTaskModal() {
  if (taskModal) {
    taskModal.style.display = "none";
  }
  clearForm();
  editTaskId = null;
  if (addTaskBtn) {
    addTaskBtn.textContent = "Add Task";
  }
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
  if (!taskList) return;

  taskList.innerHTML = "";

  let filteredTasks = tasks;

  if (statusFilter && statusFilter.value === "completed") {
    filteredTasks = tasks.filter(function (task) {
      return task.completed === true;
    });
  } else if (statusFilter && statusFilter.value === "pending") {
    filteredTasks = tasks.filter(function (task) {
      return task.completed === false;
    });
  }

  if (filteredTasks.length === 0) {
   taskList.innerHTML = `
  <p class="no-task-message">
    🚀 No tasks yet. Click <strong>+ Add Task</strong> to start planning.
  </p>
`;
    return;
  }

  filteredTasks.forEach(function (task) {
    const taskCard = document.createElement("div");
    taskCard.classList.add("task-card");

    if (task.completed) {
      taskCard.classList.add("completed-task");
    }

    const priorityClass = task.priority.toLowerCase();

    taskCard.innerHTML = `
      <div class="task-card-top">
        <div class="task-left">
          <button class="complete-circle" onclick="markComplete(${task.id})">
            ${task.completed ? "✓" : ""}
          </button>

          <div class="task-content">
            <h3>${task.title}</h3>
            <p class="task-subject">Subject: ${task.subject}</p>
            ${task.description ? `<p class="task-description">${task.description}</p>` : ""}
          </div>
        </div>

        <div class="task-actions">
          <button class="edit-btn" onclick="editTask(${task.id})">✏️</button>
          <button class="delete-btn" onclick="deleteTask(${task.id})">🗑</button>
        </div>
      </div>

      <div class="task-tags">
        <span class="tag subject-tag">${task.subject}</span>
        <span class="tag priority-tag ${priorityClass}">${task.priority} Priority</span>
        <span class="tag date-tag">${task.dueDate}</span>
      </div>
    `;

    taskList.appendChild(taskCard);
  });
}

function markComplete(id) {
  tasks = tasks.map(function (task) {
    if (task.id === id) {
      task.completed = true;
    }
    return task;
  });

  saveTasks();
  renderTasks();
  updateSummary();
}

function deleteTask(id) {
  tasks = tasks.filter(function (task) {
    return task.id !== id;
  });

  saveTasks();
  renderTasks();
  updateSummary();
}

function editTask(id) {
  const taskToEdit = tasks.find(function (task) {
    return task.id === id;
  });

  if (!taskToEdit) return;

  if (taskTitleInput) taskTitleInput.value = taskToEdit.title;
  if (subjectInput) subjectInput.value = taskToEdit.subject;
  if (dueDateInput) dueDateInput.value = taskToEdit.dueDate;
  if (priorityInput) priorityInput.value = taskToEdit.priority;
  if (descriptionInput) descriptionInput.value = taskToEdit.description || "";

  editTaskId = id;

  if (addTaskBtn) {
    addTaskBtn.textContent = "Update Task";
  }

  if (taskModal) {
    taskModal.style.display = "flex";
  }
}

function updateSummary() {
  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  const pending = total - completed;
  const highPriority = tasks.filter(task => task.priority === "High").length;

  if (totalTasks) totalTasks.textContent = total;
  if (completedTasks) completedTasks.textContent = completed;
  if (pendingTasks) pendingTasks.textContent = pending;
  if (highPriorityTasks) highPriorityTasks.textContent = highPriority;

  let progressPercent = 0;
  if (total > 0) {
    progressPercent = (completed / total) * 100;
  }

  if (progressCircle) {
    const degree = (progressPercent / 100) * 360;
    progressCircle.style.background =
      `conic-gradient(#00e676 ${degree}deg, #2d3748 ${degree}deg)`;
  }

  if (progressText) {
    progressText.textContent = Math.round(progressPercent) + "%";
  }
}

function clearForm() {
  if (subjectInput) subjectInput.value = "";
  if (taskTitleInput) taskTitleInput.value = "";
  if (dueDateInput) dueDateInput.value = "";
  if (priorityInput) priorityInput.value = "";
  if (descriptionInput) descriptionInput.value = "";
}