// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem('tasks'));
let nextId = JSON.parse(localStorage.getItem('nextId'));

// init tasks array
let tasks = [];

// function to generate a unique task id
function generateTaskId() {
  return Math.floor(Math.random() * 100000).toString();
}

// function to compare current date and task due date
function compareDates(dueDate) {
  const formattedDueDate = dayjs(dueDate);
  // for card color
  if (formattedDueDate.isTomorrow() || formattedDueDate.isToday()) {
    return { cardBg: 'bg-warning', btnBorder: null };
  }
  if (formattedDueDate.isSameOrBefore()) {
    return { cardBg: 'bg-danger text-white', btnBorder: 'border-white' };
  }
  return { cardBg: null, btnBorder: null };
}

// function to create a task card
function createTaskCard(
  { id, taskTitle, taskDueDate, taskDescription },
  isDone
) {
  // create card with proper styling
  const newTaskCard = $(
    `<div class='card task-card mb-3 draggable 
    ${!isDone && compareDates(taskDueDate).cardBg}
    ' data-task='${id}'>`
  );

  // card content with proper styling
  newTaskCard.html(`<h4 class='card-header'>${taskTitle}</h4>
  <div class='card-body'>
    <p>${taskDescription}</p>
    <p>${dayjs(taskDueDate).format('MM/DD/YYYY')}</p>
    <button class='btn btn-danger ${
      !isDone && compareDates(taskDueDate).btnBorder
    }'>Delete</button>
  </div>
  `);

  // cards only have delete button, add delete event listener
  newTaskCard.find('button').on('click', handleDeleteTask);
  return newTaskCard;
}

// function to render the task list and make cards draggable
function renderTaskList() {
  // clear out all three lanes
  $('#todo-cards').html('');
  $('#in-progress-cards').html('');
  $('#done-cards').html('');

  // render each task in their proper lanes
  tasks.forEach((task) => {
    if (task.status === 'to-do') {
      $('#todo-cards').append(createTaskCard(task, false));
    }
    if (task.status === 'in-progress') {
      $('#in-progress-cards').append(createTaskCard(task, false));
    }
    if (task.status === 'done') {
      $('#done-cards').append(createTaskCard(task, true));
    }
  });

  // make cards draggable
  $('.draggable').draggable({
    opacity: 0.7,
    zIndex: 100,
    helper: function (e) {
      const original = $(e.target).hasClass('ui-draggable')
        ? $(e.target)
        : $(e.target).closest('.ui-draggable');
      // Return the clone with the width set to the width of the original card. This is so the clone does not take up the entire width of the lane. This is to also fix a visual bug where the card shrinks as it's dragged to the right.
      return original.clone().css({
        width: original.outerWidth(),
      });
    },
  });
}

// function to handle adding a new task
function handleAddTask(event) {
  // prevent page reload
  event.preventDefault();
  // declare form variable as it is used several times throughout this function
  const form = event.target;
  // for bootstrap validation messages
  $(form).addClass('was-validated');

  // prevent the rest of code from running if not validated
  if (!form.checkValidity()) {
    return;
  }

  // create new object of form data
  const taskTitle = $(event.target).find('input')[0].value;
  const taskDueDate = $(event.target).find('input')[1].value;
  const taskDescription = $(event.target).find('input')[2].value;
  const newTask = {
    id: generateTaskId(),
    taskTitle,
    taskDueDate,
    taskDescription,
    status: 'to-do',
  };

  // pushes new tasks to global tasks array
  tasks.push(newTask);
  // sets local storage
  localStorage.setItem('tasks', JSON.stringify(tasks));
  // render tasks
  renderTaskList();
}

// function to handle deleting a task
function handleDeleteTask(event) {
  // get the targeted card through the clicked button
  const deleteCardId = $(event.target).parent().parent()[0].dataset.task;
  // find the right task in the tasks array and removes it
  tasks = tasks.filter((task) => {
    return task.id !== deleteCardId;
  });

  // set local storage to new task
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTaskList();
}

// function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    console.log('Drop event:', event);
    console.log('UI Data:', ui);
  // get a reference to the id of the dragged card
  const taskId = ui.helper.data('task');

  // get the new status that will be applied to the card
  const newStatus = event.target.id;

  // filter through the right task and applies the new status to the task
  tasks.forEach((task) => {
    if (task.id === taskId) {
      task.status = newStatus;
    }
  });

  // stores new array to local storage
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTaskList();
}

// when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  // checks if there are any tasks in localstorage
  if (!taskList) {
    tasks = [];
    return;
  }

  // initializes tasks array and renders them
  tasks = taskList;
  renderTaskList();

  // form submit listener
  $('#taskForm').on('submit', handleAddTask);

  // make lanes droppable
  $(function () {
    $('.lane').droppable({
      accept: '.draggable',
      drop: handleDrop,
    });
  });
});
