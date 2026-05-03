// DOM Elements
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const themeToggle = document.getElementById('themeToggle');
const statsCount = document.getElementById('statsCount');
const clearCompletedBtn = document.getElementById('clearCompleted');
const filterBtns = document.querySelectorAll('.filter-btn');

let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    renderTodos();
});

// Theme
themeToggle.addEventListener('click', toggleTheme);

function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function loadTheme() {
    const saved = localStorage.getItem('theme') || 'light';
    applyTheme(saved);
}

// Filter buttons
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTodos();
    });
});

// Clear completed
clearCompletedBtn.addEventListener('click', () => {
    const completedItems = todoList.querySelectorAll('.todo-item.completed-item');
    completedItems.forEach(item => {
        item.classList.add('removing');
        item.addEventListener('animationend', () => {
            item.remove();
            showEmptyIfNeeded();
        }, { once: true });
    });

    let todos = getTodos();
    todos = todos.filter(t => !t.completed);
    localStorage.setItem('todos', JSON.stringify(todos));
    setTimeout(updateStats, 300);
});

// Add
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});

function shakeInput() {
    todoInput.classList.remove('shake');
    void todoInput.offsetWidth; // force reflow to restart animation
    todoInput.classList.add('shake');
    todoInput.addEventListener('animationend', () => todoInput.classList.remove('shake'), { once: true });
}

function addTodo() {
    const todoText = todoInput.value.trim();
    if (todoText === '') {
        shakeInput();
        return;
    }

    const todo = { id: Date.now(), text: todoText, completed: false };
    saveTodoToStorage(todo);

    if (currentFilter !== 'completed') {
        const emptyMsg = todoList.querySelector('.empty-message');
        if (emptyMsg) emptyMsg.remove();
        addTodoToList(todo);
    }

    updateStats();
    todoInput.value = '';
    todoInput.focus();
}

function addTodoToList(todo) {
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.completed ? ' completed-item' : '');
    li.dataset.id = todo.id;

    const checkbox = document.createElement('div');
    checkbox.className = 'todo-checkbox';
    checkbox.setAttribute('role', 'checkbox');
    checkbox.setAttribute('aria-checked', String(todo.completed));
    checkbox.addEventListener('click', () => toggleTodo(todo.id));

    const span = document.createElement('span');
    span.className = 'todo-text' + (todo.completed ? ' completed' : '');
    span.textContent = todo.text;
    span.addEventListener('click', () => toggleTodo(todo.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-button';
    deleteBtn.innerHTML = '&times;';
    deleteBtn.setAttribute('aria-label', 'Delete task');
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    todoList.appendChild(li);
}

function toggleTodo(id) {
    let todos = getTodos();
    todos = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    localStorage.setItem('todos', JSON.stringify(todos));

    const todoItem = todoList.querySelector(`[data-id="${id}"]`);
    if (todoItem) {
        const isNowCompleted = todos.find(t => t.id === id).completed;
        todoItem.classList.toggle('completed-item', isNowCompleted);
        todoItem.querySelector('.todo-text').classList.toggle('completed', isNowCompleted);
        todoItem.querySelector('.todo-checkbox').setAttribute('aria-checked', String(isNowCompleted));

        if (currentFilter !== 'all') {
            todoItem.classList.add('removing');
            todoItem.addEventListener('animationend', () => {
                todoItem.remove();
                showEmptyIfNeeded();
            }, { once: true });
        }
    }
    updateStats();
}

function deleteTodo(id) {
    const todoItem = todoList.querySelector(`[data-id="${id}"]`);
    if (todoItem) {
        todoItem.classList.add('removing');
        todoItem.addEventListener('animationend', () => {
            todoItem.remove();
            showEmptyIfNeeded();
        }, { once: true });
    }

    let todos = getTodos();
    todos = todos.filter(t => t.id !== id);
    localStorage.setItem('todos', JSON.stringify(todos));
    updateStats();
}

function showEmptyIfNeeded() {
    if (todoList.querySelectorAll('.todo-item').length === 0) {
        showEmptyState();
    }
}

function showEmptyState() {
    const empty = document.createElement('li');
    empty.className = 'empty-message';
    const messages = {
        all:       '<span class="empty-icon">✨</span>No tasks yet.<br>Add one above to get started!',
        active:    '<span class="empty-icon">🎉</span>No active tasks!<br>You\'re all caught up.',
        completed: '<span class="empty-icon">📋</span>No completed tasks yet.<br>Keep going!'
    };
    empty.innerHTML = messages[currentFilter] || messages.all;
    todoList.appendChild(empty);
}

function getTodos() {
    return JSON.parse(localStorage.getItem('todos')) || [];
}

function saveTodoToStorage(todo) {
    const todos = getTodos();
    todos.push(todo);
    localStorage.setItem('todos', JSON.stringify(todos));
}

function renderTodos() {
    todoList.innerHTML = '';
    const todos = getTodos();
    const filtered = todos.filter(t => {
        if (currentFilter === 'active') return !t.completed;
        if (currentFilter === 'completed') return t.completed;
        return true;
    });

    if (filtered.length === 0) {
        showEmptyState();
    } else {
        filtered.forEach(todo => addTodoToList(todo));
    }
    updateStats();
}

function updateStats() {
    const todos = getTodos();
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const active = total - completed;

    if (total === 0) {
        statsCount.textContent = 'No tasks';
    } else if (currentFilter === 'active') {
        statsCount.textContent = `${active} active task${active !== 1 ? 's' : ''}`;
    } else if (currentFilter === 'completed') {
        statsCount.textContent = `${completed} completed task${completed !== 1 ? 's' : ''}`;
    } else {
        statsCount.textContent = `${active} of ${total} task${total !== 1 ? 's' : ''} remaining`;
    }

    clearCompletedBtn.disabled = completed === 0;
}
