// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Create a function to generate a unique task id
function generateTaskId() {
    return nextId++;
}

// Create a function to create a task card
function createTaskCard(task) {
    return `
        <div class="card mb-2" id="task-${task.id}">
            <div class="card-body">
                <h5 class="card-title">${task.title}</h5>
                <p class="card-text">${task.description}</p>
                <p class="card-text"><small class="text-muted">Due: ${task.dueDate}</small></p>
                <button class="btn btn-danger btn-sm delete-task">Delete</button>
            </div>
        </div>
    `;
}

// Create a function to render the task list and make cards draggable
function renderTaskList() {
    $("#todo-cards").empty();
    $("#in-progress-cards").empty();
    $("#done-cards").empty();

    taskList.forEach(task => {
        const cardHtml = createTaskCard(task);
        $(`#${task.status}-cards`).append(cardHtml);
    });

    $(".card").draggable({
        helper: "clone",
        start: function(event, ui) {
            $(ui.helper).addClass('dragging');
        }
    });

    $(".lane").droppable({
        accept: ".card",
        drop: handleDrop
    });
}

// Create a function to handle adding a new task
function handleAddTask(event) {
    event.preventDefault();

    const title = $("#task-title").val();
    const description = $("#task-description").val();
    const dueDate = $("#task-due-date").val();

    if (title && description) {
        const newTask = {
            id: generateTaskId(),
            title,
            description,
            dueDate,
            status: "to-do" // Default status
        };

        taskList.push(newTask);
        localStorage.setItem("tasks", JSON.stringify(taskList));
        localStorage.setItem("nextId", JSON.stringify(nextId));

        $("#formModal").modal('hide');
        renderTaskList();
    }
}

// Create a function to handle deleting a task
function handleDeleteTask(event) {
    const taskId = $(event.target).closest(".card").attr("id").split("-")[1];
    taskList = taskList.filter(task => task.id != taskId);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    renderTaskList();
}

// Create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    const taskId = $(ui.draggable).attr("id").split("-")[1];
    const newStatus = $(event.target).attr("id");

    const task = taskList.find(task => task.id == taskId);
    if (task) {
        task.status = newStatus;
        localStorage.setItem("tasks", JSON.stringify(taskList));
        renderTaskList();
    }
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    renderTaskList();

    $("#formModal").on('submit', handleAddTask);
    $(document).on('click', '.delete-task', handleDeleteTask);

    $("#task-due-date").datepicker({
        dateFormat: "yy-mm-dd"
    });
});
