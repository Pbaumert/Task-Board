// Retrieve tasks and nextId from localStorage
const taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Generate a unique task id
const generateTaskId = () => nextId++;

// Save tasks and nextId to localStorage
const saveToLocalStorage = () => {
  localStorage.setItem("tasks", JSON.stringify(taskList));
  localStorage.setItem("nextId", JSON.stringify(nextId));
};

// Create a task card element
const createTaskCard = (task) => {
  const cardClass = task.isOverdue ? 'bg-danger' : task.isNearingDeadline ? 'bg-warning' : '';
  const taskCard = $(`
    <div class="task-card card mb-3 ${cardClass}" data-id="${task.id}">
      <div class="card-body">
        <h5 class="card-title">${task.title}</h5>
        <p class="card-text">${task.description}</p>
        <p class="card-text"><small class="text-muted">Due: ${task.deadline}</small></p>
        <button class="btn btn-danger btn-sm delete-task">Delete</button>
      </div>
    </div>
  `);
  taskCard.draggable({
    revert: "invalid",
    stack: ".task-card",
    cursor: "move"
  });
  return taskCard;
};

// Render task cards based on their status
const renderTaskList = () => {
  // Clear existing cards from all lanes
  ["todo-cards", "in-progress-cards", "done-cards"].forEach(id => $(`#${id}`).empty());

  taskList.forEach(task => {
    const taskCard = createTaskCard(task);
    const targetLane = {
      "to-do": "#todo-cards",
      "in-progress": "#in-progress-cards",
      "done": "#done-cards"
    }[task.status];
    $(targetLane).append(taskCard);
  });
};

// Handle adding a new task
const handleAddTask = (event) => {
  event.preventDefault();

  const newTask = {
    id: generateTaskId(),
    title: $("#task-title").val(),
    description: $("#task-description").val(),
    deadline: $("#task-deadline").val(),
    status: "to-do",
    isOverdue: dayjs().isAfter(dayjs($("#task-deadline").val())),
    isNearingDeadline: dayjs().add(3, 'day').isAfter(dayjs($("#task-deadline").val()))
  };

  taskList.push(newTask);
  saveToLocalStorage();
  renderTaskList();
  $("#formModal").modal('hide');
};

// Handle deleting a task
const handleDeleteTask = (event) => {
  const taskId = $(event.target).closest(".task-card").data("id");
  const taskIndex = taskList.findIndex(task => task.id === taskId);

  if (taskIndex !== -1) {
    taskList.splice(taskIndex, 1);
    saveToLocalStorage();
    renderTaskList();
  }
};

// Handle dropping a task into a new status lane
const handleDrop = (event, ui) => {
  const taskId = ui.draggable.data("id");
  const newStatus = $(event.target).closest(".lane").attr("id").replace("-cards", "");

  const task = taskList.find(task => task.id === taskId);
  if (task) {
    task.status = newStatus;
    saveToLocalStorage();
    renderTaskList();
  }
};

// Initialize page functionality
$(document).ready(() => {
  // Render task list
  renderTaskList();

  // Initialize droppable lanes
  $(".lane").droppable({
    accept: ".task-card",
    drop: handleDrop
  });

  // Handle form submission
  $("#add-task-form").on("submit", handleAddTask);

  // Handle task deletion
  $(document).on("click", ".delete-task", handleDeleteTask);

  // Initialize datepicker
  $("#task-deadline").datepicker({
    dateFormat: "yy-mm-dd"
  });
});
