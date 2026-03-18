/**
 * Proxima - Productivity Hub Logic
 */

const App = {
    // App State
    state: {
        currentUser: null,
        currentDate: new Date(), // Used for calendar navigation
        selectedDate: new Date(), // Used for adding events
        todos: [],
        events: []
    },

    // Hardcoded Users
    users: {
        'user1': 'pass1',
        'user2': 'pass2'
    },

    // DOM Elements
    elements: {
        screens: {
            login: document.getElementById('login-screen'),
            dashboard: document.getElementById('dashboard-screen')
        },
        login: {
            form: document.getElementById('login-form'),
            username: document.getElementById('username'),
            password: document.getElementById('password'),
            error: document.getElementById('login-error')
        },
        dashboard: {
            usernameDisplay: document.getElementById('current-username'),
            userInitial: document.getElementById('user-initial'),
            logoutBtn: document.getElementById('logout-btn'),
            mobileMenuBtn: document.getElementById('mobile-menu-btn'),
            sidebar: document.querySelector('.sidebar')
        },
        todo: {
            form: document.getElementById('todo-form'),
            input: document.getElementById('new-todo-input'),
            list: document.getElementById('todo-list'),
            count: document.getElementById('task-count')
        },
        calendar: {
            grid: document.getElementById('calendar-grid'),
            monthYearTitle: document.getElementById('current-month-year'),
            prevMonthBtn: document.getElementById('prev-month'),
            nextMonthBtn: document.getElementById('next-month'),
            todayBtn: document.getElementById('today-btn')
        },
        modal: {
            overlay: document.getElementById('event-modal'),
            form: document.getElementById('event-form'),
            closeBtns: document.querySelectorAll('.close-modal-btn'),
            title: document.getElementById('event-title'),
            date: document.getElementById('event-date'),
            time: document.getElementById('event-time'),
            colorPicker: document.getElementById('color-picker'),
            colorValue: document.getElementById('event-color-value'),
            openBtn: document.getElementById('add-event-btn')
        }
    },

    init() {
        this.bindEvents();
        this.checkAuth();
    },

    bindEvents() {
        // Auth
        this.elements.login.form.addEventListener('submit', (e) => this.handleLogin(e));
        this.elements.dashboard.logoutBtn.addEventListener('click', () => this.handleLogout());

        // Mobile Sidebar
        this.elements.dashboard.mobileMenuBtn.addEventListener('click', () => {
            this.elements.dashboard.sidebar.classList.toggle('open');
        });

        // Todos
        this.elements.todo.form.addEventListener('submit', (e) => this.handleAddTodo(e));

        // Calendar Navigation
        this.elements.calendar.prevMonthBtn.addEventListener('click', () => this.changeMonth(-1));
        this.elements.calendar.nextMonthBtn.addEventListener('click', () => this.changeMonth(1));
        this.elements.calendar.todayBtn.addEventListener('click', () => this.goToToday());

        // Modal
        this.elements.modal.openBtn.addEventListener('click', () => this.openEventModal());
        this.elements.modal.closeBtns.forEach(btn => btn.addEventListener('click', () => this.closeEventModal()));
        this.elements.modal.form.addEventListener('submit', (e) => this.handleAddEvent(e));
        
        // Color Picker
        const colorOptions = this.elements.modal.colorPicker.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                colorOptions.forEach(opt => opt.classList.remove('active'));
                e.target.classList.add('active');
                this.elements.modal.colorValue.value = e.target.dataset.color;
            });
        });
    },

    // --- Authentication --- //

    checkAuth() {
        const storedUser = localStorage.getItem('proxima_currentUser');
        if (storedUser && this.users[storedUser]) {
            this.state.currentUser = storedUser;
            this.showDashboard();
        } else {
            this.showLogin();
        }
    },

    handleLogin(e) {
        e.preventDefault();
        const username = this.elements.login.username.value.trim();
        const password = this.elements.login.password.value;

        if (this.users[username] && this.users[username] === password) {
            this.state.currentUser = username;
            localStorage.setItem('proxima_currentUser', username);
            this.elements.login.error.style.display = 'none';
            this.elements.login.form.reset();
            this.showDashboard();
        } else {
            this.elements.login.error.style.display = 'block';
            this.elements.login.password.value = '';
        }
    },

    handleLogout() {
        this.state.currentUser = null;
        localStorage.removeItem('proxima_currentUser');
        this.showLogin();
    },

    // --- UI State Management --- //

    showLogin() {
        this.elements.screens.dashboard.classList.remove('active');
        this.elements.screens.login.classList.add('active');
        this.state.todos = [];
        this.state.events = [];
    },

    showDashboard() {
        this.elements.screens.login.classList.remove('active');
        this.elements.screens.dashboard.classList.add('active');
        
        // Update user profile info
        this.elements.dashboard.usernameDisplay.textContent = this.state.currentUser;
        this.elements.dashboard.userInitial.textContent = this.state.currentUser.charAt(0).toUpperCase();

        this.loadUserData();
        this.renderTodos();
        this.renderCalendar();
    },

    // --- Data Management --- //

    loadUserData() {
        const dataKey = `proxima_data_${this.state.currentUser}`;
        const storedData = localStorage.getItem(dataKey);
        
        if (storedData) {
            try {
                const parsed = JSON.parse(storedData);
                this.state.todos = parsed.todos || [];
                this.state.events = parsed.events || [];
            } catch (e) {
                console.error("Error parsing stored data", e);
                this.state.todos = [];
                this.state.events = [];
            }
        } else {
            this.state.todos = [];
            this.state.events = [];
        }
    },

    saveUserData() {
        if (!this.state.currentUser) return;
        
        const dataKey = `proxima_data_${this.state.currentUser}`;
        localStorage.setItem(dataKey, JSON.stringify({
            todos: this.state.todos,
            events: this.state.events
        }));
    },

    // --- Todo Management --- //

    handleAddTodo(e) {
        e.preventDefault();
        const text = this.elements.todo.input.value.trim();
        if (!text) return;

        const newTodo = {
            id: Date.now().toString(),
            text,
            completed: false
        };

        this.state.todos.unshift(newTodo);
        this.elements.todo.input.value = '';
        this.saveUserData();
        this.renderTodos();
    },

    toggleTodo(id) {
        const todo = this.state.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveUserData();
            this.renderTodos();
        }
    },

    deleteTodo(id) {
        this.state.todos = this.state.todos.filter(t => t.id !== id);
        this.saveUserData();
        this.renderTodos();
    },

    renderTodos() {
        this.elements.todo.list.innerHTML = '';
        
        // Sort: incomplete first, then complete
        const sortedTodos = [...this.state.todos].sort((a, b) => {
            if (a.completed === b.completed) return 0;
            return a.completed ? 1 : -1;
        });

        sortedTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            
            li.innerHTML = `
                <div class="custom-checkbox" data-id="${todo.id}">
                    <i class="fa-solid fa-check"></i>
                </div>
                <span class="todo-text" data-id="${todo.id}">${this.escapeHtml(todo.text)}</span>
                <button class="icon-btn delete-todo-btn" data-id="${todo.id}">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            `;
            this.elements.todo.list.appendChild(li);
        });

        // Update count (only incomplete tasks)
        const incompleteCount = this.state.todos.filter(t => !t.completed).length;
        this.elements.todo.count.textContent = incompleteCount;

        // Bind Todo Events inside list
        this.elements.todo.list.querySelectorAll('.custom-checkbox, .todo-text').forEach(el => {
            el.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.toggleTodo(id);
            });
        });

        this.elements.todo.list.querySelectorAll('.delete-todo-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = e.currentTarget.dataset.id;
                this.deleteTodo(id);
            });
        });
    },

    // --- Calendar Management --- //

    changeMonth(delta) {
        const newDate = new Date(this.state.currentDate);
        newDate.setMonth(newDate.getMonth() + delta);
        this.state.currentDate = newDate;
        this.renderCalendar();
    },

    goToToday() {
        this.state.currentDate = newDate = new Date();
        this.renderCalendar();
    },

    renderCalendar() {
        const year = this.state.currentDate.getFullYear();
        const month = this.state.currentDate.getMonth();
        
        // Set Month Title
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        this.elements.calendar.monthYearTitle.textContent = `${monthNames[month]} ${year}`;

        // Clear grid
        this.elements.calendar.grid.innerHTML = '';

        // Get first day of month and total days
        const firstDay = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Days from previous month to fill first row
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        
        const today = new Date();
        const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

        // Number of cells in grid (usually 35 or 42 based on first day and total days)
        const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement('div');
            cell.className = 'calendar-cell';

            let cellDate;
            
            if (i < firstDay) {
                // Prev month days
                cell.classList.add('other-month');
                const dayNum = daysInPrevMonth - firstDay + i + 1;
                cellDate = new Date(year, month - 1, dayNum);
                cell.innerHTML = `<div class="date-num">${dayNum}</div>`;
            } else if (i >= firstDay && i < firstDay + daysInMonth) {
                // Current month days
                const dayNum = i - firstDay + 1;
                cellDate = new Date(year, month, dayNum);
                
                if (isCurrentMonth && dayNum === today.getDate()) {
                    cell.classList.add('today');
                }
                
                cell.innerHTML = `<div class="date-num">${dayNum}</div>`;
            } else {
                // Next month days
                cell.classList.add('other-month');
                const dayNum = i - firstDay - daysInMonth + 1;
                cellDate = new Date(year, month + 1, dayNum);
                cell.innerHTML = `<div class="date-num">${dayNum}</div>`;
            }

            // Render events for this day
            const dayEvents = this.getEventsForDate(cellDate);
            if (dayEvents.length > 0) {
                const eventsList = document.createElement('div');
                eventsList.className = 'events-list';
                
                // Sort by time
                dayEvents.sort((a, b) => a.time.localeCompare(b.time));
                
                dayEvents.forEach(evt => {
                    const chip = document.createElement('div');
                    chip.className = 'event-chip';
                    chip.style.backgroundColor = evt.color;
                    chip.textContent = `${evt.time} ${evt.title}`;
                    chip.title = `${evt.title} at ${evt.time}`;
                    
                    // Allow deleting event on click
                    chip.addEventListener('click', (e) => {
                        e.stopPropagation(); // prevent clicking cell
                        if(confirm(`Delete event '${evt.title}'?`)) {
                            this.deleteEvent(evt.id);
                        }
                    });
                    
                    eventsList.appendChild(chip);
                });
                
                cell.appendChild(eventsList);
            }

            // Click cell to add event for that date
            cell.addEventListener('click', () => {
                this.openEventModal(cellDate);
            });

            this.elements.calendar.grid.appendChild(cell);
        }
    },

    getEventsForDate(date) {
        const dateString = date.toISOString().split('T')[0];
        return this.state.events.filter(e => e.date === dateString);
    },

    // --- Event Modal Management --- //

    openEventModal(date = new Date()) {
        this.state.selectedDate = date;
        
        // Format date for input YYYY-MM-DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        this.elements.modal.date.value = `${year}-${month}-${day}`;
        
        // Set default time to now + 1 hour approx formatting
        const now = new Date();
        const hrs = String(now.getHours() + 1).padStart(2, '0');
        this.elements.modal.time.value = `${hrs}:00`;
        
        this.elements.modal.overlay.classList.remove('hidden');
        this.elements.modal.title.focus();
    },

    closeEventModal() {
        this.elements.modal.overlay.classList.add('hidden');
        this.elements.modal.form.reset();
        
        // Reset color picker
        const colorOptions = this.elements.modal.colorPicker.querySelectorAll('.color-option');
        colorOptions.forEach(opt => opt.classList.remove('active'));
        colorOptions[3].classList.add('active'); // default red
        this.elements.modal.colorValue.value = "#ef4444";
    },

    handleAddEvent(e) {
        e.preventDefault();
        
        const title = this.elements.modal.title.value.trim();
        const date = this.elements.modal.date.value;
        const time = this.elements.modal.time.value;
        const color = this.elements.modal.colorValue.value;
        
        if (!title || !date || !time) return;

        const newEvent = {
            id: Date.now().toString(),
            title,
            date,
            time,
            color
        };

        this.state.events.push(newEvent);
        this.saveUserData();
        this.renderCalendar();
        this.closeEventModal();
    },

    deleteEvent(id) {
        this.state.events = this.state.events.filter(e => e.id !== id);
        this.saveUserData();
        this.renderCalendar();
    },

    // --- Helpers --- //
    
    escapeHtml(unsafe) {
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
