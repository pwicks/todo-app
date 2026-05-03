// DOM Elements
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');

// Load todos from localStorage on page load
document.addEventListener('DOMContentLoaded', loadTodos);

// Add event listeners
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

function addTodo() {
    const todoText = todoInput.value.trim();

    if (todoText === '') {
        alert('Please enter a todo item');
        return;
    }

    // Create todo object
    const todo = {
        id: Date.now(),
        text: todoText,
        completed: false
    };

    // Add to list
    addTodoToList(todo);

    // Save to localStorage
    saveTodoToStorage(todo);

    // Clear input
    todoInput.value = '';
    todoInput.focus();
}

function addTodoToList(todo) {
    // Create list item
    const li = document.createElement('li');
    li.className = 'todo-item';
    li.dataset.id = todo.id;

    // Create todo text span
    const span = document.createElement('span');
    span.className = 'todo-text' + (todo.completed ? ' completed' : '');
    span.textContent = todo.text;
    span.addEventListener('click', () => toggleTodo(todo.id));

    // Create delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-button';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

    // Append elements
    li.appendChild(span);
    li.appendChild(deleteBtn);
    todoList.appendChild(li);
}

function toggleTodo(id) {
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    todos = todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo);
    localStorage.setItem('todos', JSON.stringify(todos));

    const todoItem = document.querySelector(`[data-id="${id}"]`);
    if (todoItem) {
        todoItem.querySelector('.todo-text').classList.toggle('completed');
    }
}

function deleteTodo(id) {
    // Remove from DOM
    const todoItem = document.querySelector(`[data-id="${id}"]`);
    if (todoItem) {
        todoItem.remove();
    }

    // Remove from localStorage
    removeTodoFromStorage(id);
}

function saveTodoToStorage(todo) {
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    todos.push(todo);
    localStorage.setItem('todos', JSON.stringify(todos));
}

function removeTodoFromStorage(id) {
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    todos = todos.filter(todo => todo.id !== id);
    localStorage.setItem('todos', JSON.stringify(todos));
}

function loadTodos() {
    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    todos.forEach(todo => addTodoToList(todo));
}
