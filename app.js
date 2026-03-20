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
        events: [],
        periodTracking: { periods: [], showCalendar: true },
        pomodoro: {
            mode: 'work',
            timeLeft: 25 * 60,
            totalTime: 25 * 60,
            timerId: null,
            isRunning: false
        },
        shortcuts: []
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
        },
        gfqol: {
            modal: document.getElementById('gfqol-modal'),
            openBtn: document.getElementById('gfqol-app-btn'),
            closeBtns: document.querySelectorAll('.close-gfqol-btn'),
            addForm: document.getElementById('gfqol-add-form'),
            start: document.getElementById('period-start'),
            end: document.getElementById('period-end'),
            list: document.getElementById('gfqol-period-list'),
            showCalendar: document.getElementById('show-predicted-period')
        },
        pomodoro: {
            appBtn: document.getElementById('pomodoro-app-btn'),
            window: document.getElementById('pomodoro-window'),
            header: document.getElementById('pomodoro-header'),
            closeBtn: document.querySelector('.close-pomodoro-btn'),
            modeWork: document.getElementById('mode-work'),
            modeRest: document.getElementById('mode-rest'),
            modeCustom: document.getElementById('mode-custom'),
            customInputArea: document.getElementById('custom-time-input'),
            customMinutes: document.getElementById('custom-minutes'),
            timerDisplay: document.getElementById('timer-display'),
            startBtn: document.getElementById('start-timer-btn'),
            resetBtn: document.getElementById('reset-timer-btn'),
            progressCircle: document.getElementById('timer-progress')
        },
        shortcuts: {
            appBtn: document.getElementById('shortcuts-app-btn'),
            window: document.getElementById('shortcuts-window'),
            header: document.getElementById('shortcuts-header'),
            closeBtn: document.querySelector('.close-shortcuts-btn'),
            grid: document.getElementById('shortcuts-grid'),
            addForm: document.getElementById('add-shortcut-form'),
            nameInput: document.getElementById('shortcut-name'),
            urlInput: document.getElementById('shortcut-url')
        }
    },

    init() {
        this.initTheme();
        this.bindEvents();
        this.checkAuth();
    },

    initTheme() {
        const storedTheme = localStorage.getItem('daohub_theme');
        if (storedTheme === 'light') {
            document.documentElement.classList.add('light-mode');
        } else if (storedTheme === 'dark') {
            document.documentElement.classList.remove('light-mode');
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            document.documentElement.classList.add('light-mode');
        }
        this.updateThemeIcons();
    },

    toggleTheme() {
        document.documentElement.classList.toggle('light-mode');
        const isLight = document.documentElement.classList.contains('light-mode');
        localStorage.setItem('daohub_theme', isLight ? 'light' : 'dark');
        this.updateThemeIcons();
    },

    updateThemeIcons() {
        const isLight = document.documentElement.classList.contains('light-mode');
        const btns = document.querySelectorAll('.theme-toggle i');
        btns.forEach(icon => {
            icon.className = isLight ? 'fa-solid fa-moon' : 'fa-solid fa-sun'; // Show moon in light mode normally, but sun in dark to toggle light
        });
    },

    bindEvents() {
        // Theme toggles
        document.querySelectorAll('.theme-toggle').forEach(btn => {
            btn.addEventListener('click', () => this.toggleTheme());
        });

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
        
        // Gf qol Modal
        if (this.elements.gfqol.openBtn) {
            this.elements.gfqol.openBtn.addEventListener('click', () => this.openGfqolModal());
            this.elements.gfqol.closeBtns.forEach(btn => btn.addEventListener('click', () => this.closeGfqolModal()));
            this.elements.gfqol.addForm.addEventListener('submit', (e) => this.handleAddGfqolPeriod(e));
            this.elements.gfqol.showCalendar.addEventListener('change', () => this.handleToggleGfqolCalendar());
        }
        
        // Color Picker
        const colorOptions = this.elements.modal.colorPicker.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                colorOptions.forEach(opt => opt.classList.remove('active'));
                e.target.classList.add('active');
                this.elements.modal.colorValue.value = e.target.dataset.color;
            });
        });

        // Pomodoro Timer
        if (this.elements.pomodoro.appBtn) {
            this.elements.pomodoro.appBtn.addEventListener('click', () => this.togglePomodoroWindow());
            this.elements.pomodoro.closeBtn.addEventListener('click', () => this.closePomodoroWindow());
            this.elements.pomodoro.modeWork.addEventListener('click', () => this.setPomodoroMode('work'));
            this.elements.pomodoro.modeRest.addEventListener('click', () => this.setPomodoroMode('rest'));
            this.elements.pomodoro.modeCustom.addEventListener('click', () => this.setPomodoroMode('custom'));
            this.elements.pomodoro.customMinutes.addEventListener('input', () => this.updateCustomTime());
            this.elements.pomodoro.startBtn.addEventListener('click', () => this.togglePomodoroTimer());
            this.elements.pomodoro.resetBtn.addEventListener('click', () => this.resetPomodoroTimer());
            this.initPomodoroDraggable();
            this.updatePomodoroDisplay();
        }

        // Shortcuts Widget
        if (this.elements.shortcuts.appBtn) {
            this.elements.shortcuts.appBtn.addEventListener('click', () => this.toggleShortcutsWindow());
            this.elements.shortcuts.closeBtn.addEventListener('click', () => this.closeShortcutsWindow());
            this.elements.shortcuts.addForm.addEventListener('submit', (e) => this.handleAddShortcut(e));
            this.initShortcutsDraggable();
        }
    },

    // --- Authentication --- //

    async checkAuth() {
        const storedUser = localStorage.getItem('proxima_currentUser');
        if (storedUser && ACCOUNTS && ACCOUNTS[storedUser]) {
            this.state.currentUser = storedUser;
            await this.showDashboard();
        } else {
            this.showLogin();
        }
    },

    async handleLogin(e) {
        e.preventDefault();
        const username = this.elements.login.username.value.trim();
        const password = this.elements.login.password.value;

        if (typeof ACCOUNTS !== 'undefined' && ACCOUNTS[username] && ACCOUNTS[username] === password) {
            this.state.currentUser = username;
            localStorage.setItem('proxima_currentUser', username);
            this.elements.login.error.style.display = 'none';
            this.elements.login.form.reset();
            await this.showDashboard();
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
        this.state.periodTracking = { periods: [], showCalendar: true };
        this.state.shortcuts = [];
    },

    async showDashboard() {
        this.elements.screens.login.classList.remove('active');
        this.elements.screens.dashboard.classList.add('active');
        
        // Update user profile info
        this.elements.dashboard.usernameDisplay.textContent = this.state.currentUser;
        this.elements.dashboard.userInitial.textContent = this.state.currentUser.charAt(0).toUpperCase();

        await this.loadUserData();
        this.renderTodos();
        this.renderCalendar();
    },

    // --- Data Management --- //

    async loadUserData() {
        if (!this.state.currentUser) return;

        try {
            const { data, error } = await supabase
                .from('user_data')
                .select('*')
                .eq('username', this.state.currentUser)
                .single();

            if (data) {
                this.state.todos = data.todos || [];
                this.state.events = data.events || [];
                this.state.periodTracking = data.period_tracking || { periods: [], showCalendar: true };
                this.state.shortcuts = data.shortcuts || [];
            } else {
                // Initialize defaults
                this.state.todos = [];
                this.state.events = [];
                this.state.periodTracking = { periods: [], showCalendar: true };
                this.state.shortcuts = [];
            }
        } catch (e) {
            console.error("Error loading user data from Supabase", e);
            this.state.todos = [];
            this.state.events = [];
            this.state.periodTracking = { periods: [], showCalendar: true };
            this.state.shortcuts = [];
        }
    },

    async saveUserData() {
        if (!this.state.currentUser) return;
        
        try {
            const { error } = await supabase
                .from('user_data')
                .upsert({
                    username: this.state.currentUser,
                    todos: this.state.todos,
                    events: this.state.events,
                    period_tracking: this.state.periodTracking,
                    shortcuts: this.state.shortcuts
                });
            
            if (error) {
                console.error("Error saving user data to Supabase:", error);
            }
        } catch (e) {
            console.error("Exception saving user data to Supabase:", e);
        }
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
            
            // Add Gf qol highlights
            const phase = this.getGfqolPhase(cellDate);
            if (phase) {
                cell.classList.add(`period-${phase}`);
            }

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

    // --- Gf qol Management --- //

    openGfqolModal() {
        this.elements.gfqol.showCalendar.checked = this.state.periodTracking.showCalendar !== false;
        this.renderGfqolPeriods();
        this.elements.gfqol.modal.classList.remove('hidden');
    },

    closeGfqolModal() {
        this.elements.gfqol.modal.classList.add('hidden');
    },

    handleAddGfqolPeriod(e) {
        e.preventDefault();
        const start = this.elements.gfqol.start.value;
        const end = this.elements.gfqol.end.value;
        
        if (start > end) {
            alert("Start date cannot be after end date.");
            return;
        }

        const newPeriod = {
            id: Date.now().toString(),
            start,
            end
        };

        this.state.periodTracking.periods.push(newPeriod);
        this.state.periodTracking.periods.sort((a, b) => new Date(b.start) - new Date(a.start)); // Sort descending for UI
        
        this.elements.gfqol.addForm.reset();
        this.saveUserData();
        this.renderGfqolPeriods();
        this.renderCalendar();
    },

    deleteGfqolPeriod(id) {
        this.state.periodTracking.periods = this.state.periodTracking.periods.filter(p => p.id !== id);
        this.saveUserData();
        this.renderGfqolPeriods();
        this.renderCalendar();
    },
    
    handleToggleGfqolCalendar() {
        this.state.periodTracking.showCalendar = this.elements.gfqol.showCalendar.checked;
        this.saveUserData();
        this.renderCalendar();
    },

    renderGfqolPeriods() {
        const list = this.elements.gfqol.list;
        list.innerHTML = '';
        
        if (!this.state.periodTracking.periods || this.state.periodTracking.periods.length === 0) {
            list.innerHTML = '<li style="font-size:0.85rem; color:var(--text-muted); text-align:center; padding: 1rem 0;">No periods recorded yet.</li>';
            return;
        }

        this.state.periodTracking.periods.forEach(p => {
            const li = document.createElement('li');
            li.style.cssText = 'display:flex; justify-content:space-between; align-items:center; background:var(--bg-color); border:1px solid var(--border-color); padding:0.5rem 1rem; border-radius:var(--radius-md); font-size:0.9rem;';
            li.innerHTML = `
                <span>${p.start} to ${p.end}</span>
                <button class="icon-btn delete-period-btn" data-id="${p.id}" style="width:28px; height:28px;"><i class="fa-solid fa-trash-can" style="font-size:0.8rem;"></i></button>
            `;
            list.appendChild(li);
        });

        list.querySelectorAll('.delete-period-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.deleteGfqolPeriod(e.currentTarget.dataset.id);
            });
        });
    },

    getGfqolPhase(date) {
        if (!this.state.periodTracking.showCalendar || !this.state.periodTracking.periods || this.state.periodTracking.periods.length === 0) {
            return null;
        }

        const periods = [...this.state.periodTracking.periods].sort((a, b) => new Date(a.start) - new Date(b.start));
        
        const msPerDay = 1000 * 60 * 60 * 24;
        let avgCycle = 28;
        let avgDuration = 5;

        if (periods.length >= 2) {
            let totalCycleDays = 0;
            let totalDurationDays = 0;
            
            for (let i = 0; i < periods.length - 1; i++) {
                const s1 = new Date(periods[i].start);
                const s2 = new Date(periods[i+1].start);
                totalCycleDays += Math.round((s2 - s1) / msPerDay);
            }
            avgCycle = Math.round(totalCycleDays / (periods.length - 1));
            
            periods.forEach(p => {
                const s = new Date(p.start);
                const e = new Date(p.end);
                totalDurationDays += Math.round((e - s) / msPerDay) + 1;
            });
            avgDuration = Math.round(totalDurationDays / periods.length);
        } else if (periods.length === 1) {
            const s = new Date(periods[0].start);
            const e = new Date(periods[0].end);
            avgDuration = Math.max(1, Math.round((e - s) / msPerDay) + 1);
        }

        const dateAtMidnight = new Date(date);
        dateAtMidnight.setHours(0,0,0,0);

        for (const p of periods) {
            const pS = new Date(p.start); pS.setHours(0,0,0,0);
            const pE = new Date(p.end); pE.setHours(0,0,0,0);
            if (dateAtMidnight >= pS && dateAtMidnight <= pE) {
                return 'bleed';
            }
        }

        let refPeriod = periods[0];
        for (let i = periods.length - 1; i >= 0; i--) {
            const pS = new Date(periods[i].start); pS.setHours(0,0,0,0);
            if (dateAtMidnight >= pS) {
                refPeriod = periods[i];
                break;
            }
        }

        const refStart = new Date(refPeriod.start); refStart.setHours(0,0,0,0);
        const refEnd = new Date(refPeriod.end); refEnd.setHours(0,0,0,0);
        const refDuration = Math.round((refEnd - refStart) / msPerDay) + 1;
        const refDiffDays = Math.round((dateAtMidnight.getTime() - refStart.getTime()) / msPerDay);
        
        if (refDiffDays < 0) return null; // Before Earliest Date

        const dayOfCycle = refDiffDays % avgCycle;
        
        if (dateAtMidnight > refEnd) {
            if (dayOfCycle >= 0 && dayOfCycle < avgDuration) {
                return 'bleed';
            }
            
            const isFirstCycleFromRef = refDiffDays < avgCycle;
            const endOfPeriodDay = isFirstCycleFromRef ? refDuration : avgDuration;
            
            if (dayOfCycle >= endOfPeriodDay && dayOfCycle < endOfPeriodDay + 7) {
                return 'glow';
            }
            
            if (dayOfCycle >= avgCycle - 14 && dayOfCycle < avgCycle) {
                return 'luteal';
            }
        }

        return null;
    },

    // --- Pomodoro Management --- //

    togglePomodoroWindow() {
        if (this.elements.pomodoro.window.classList.contains('hidden')) {
            this.elements.pomodoro.window.classList.remove('hidden');
        } else {
            this.closePomodoroWindow();
        }
    },

    closePomodoroWindow() {
        this.elements.pomodoro.window.classList.add('hidden');
    },

    setPomodoroMode(mode) {
        if (this.state.pomodoro.isRunning) return; // Prevent change while running
        
        this.state.pomodoro.mode = mode;
        
        this.elements.pomodoro.modeWork.classList.remove('active');
        this.elements.pomodoro.modeRest.classList.remove('active');
        this.elements.pomodoro.modeCustom.classList.remove('active');
        this.elements.pomodoro.customInputArea.classList.add('hidden');
        
        if (mode === 'work') {
            this.elements.pomodoro.modeWork.classList.add('active');
            this.state.pomodoro.totalTime = 25 * 60;
        } else if (mode === 'rest') {
            this.elements.pomodoro.modeRest.classList.add('active');
            this.state.pomodoro.totalTime = 5 * 60;
        } else if (mode === 'custom') {
            this.elements.pomodoro.modeCustom.classList.add('active');
            this.elements.pomodoro.customInputArea.classList.remove('hidden');
            let mins = parseInt(this.elements.pomodoro.customMinutes.value) || 15;
            this.state.pomodoro.totalTime = mins * 60;
        }
        
        this.resetPomodoroTimer();
    },

    updateCustomTime() {
        if (this.state.pomodoro.mode === 'custom' && !this.state.pomodoro.isRunning) {
            let mins = parseInt(this.elements.pomodoro.customMinutes.value) || 15;
            if (mins < 1) mins = 1;
            if (mins > 120) mins = 120;
            this.state.pomodoro.totalTime = mins * 60;
            this.resetPomodoroTimer();
        }
    },

    togglePomodoroTimer() {
        if (this.state.pomodoro.isRunning) {
            // Pause
            clearInterval(this.state.pomodoro.timerId);
            this.state.pomodoro.isRunning = false;
            this.elements.pomodoro.startBtn.textContent = 'Resume';
        } else {
            // Start
            this.state.pomodoro.isRunning = true;
            this.elements.pomodoro.startBtn.textContent = 'Pause';
            
            this.state.pomodoro.timerId = setInterval(() => {
                this.state.pomodoro.timeLeft--;
                this.updatePomodoroDisplay();
                
                if (this.state.pomodoro.timeLeft <= 0) {
                    this.pomodoroFinished();
                }
            }, 1000);
        }
    },

    pomodoroFinished() {
        clearInterval(this.state.pomodoro.timerId);
        this.state.pomodoro.isRunning = false;
        this.state.pomodoro.timeLeft = 0;
        this.updatePomodoroDisplay();
        this.elements.pomodoro.startBtn.textContent = 'Start';
        // Auto reset after 3 seconds could be added, but manual reset is fine
    },

    resetPomodoroTimer() {
        clearInterval(this.state.pomodoro.timerId);
        this.state.pomodoro.isRunning = false;
        this.state.pomodoro.timeLeft = this.state.pomodoro.totalTime;
        this.elements.pomodoro.startBtn.textContent = 'Start';
        this.updatePomodoroDisplay();
    },

    updatePomodoroDisplay() {
        let minutes = Math.floor(this.state.pomodoro.timeLeft / 60);
        let seconds = this.state.pomodoro.timeLeft % 60;
        
        // Handle negative time strictly by flooring to 0 just in case
        if (minutes < 0) minutes = 0;
        if (seconds < 0) seconds = 0;

        this.elements.pomodoro.timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        // Update Circle SVG
        const pct = this.state.pomodoro.timeLeft / this.state.pomodoro.totalTime;
        const targetOffset = 283 - (pct * 283);
        this.elements.pomodoro.progressCircle.style.strokeDashoffset = targetOffset;
    },

    initPomodoroDraggable() {
        const header = this.elements.pomodoro.header;
        const windowEl = this.elements.pomodoro.window;
        
        let isDragging = false;
        let startX, startY, initialX, initialY;

        const dragStart = (e) => {
            if (e.type === 'mousedown' && e.button !== 0) return;
            isDragging = true;
            
            const style = window.getComputedStyle(windowEl);
            let m41 = 0, m42 = 0;
            if (style.transform && style.transform !== 'none') {
                const matrixValues = style.transform.match(/matrix.*\((.+)\)/);
                if (matrixValues) {
                    const vals = matrixValues[1].split(', ');
                    if(vals.length === 16) {
                        m41 = parseFloat(vals[12]);
                        m42 = parseFloat(vals[13]);
                    } else {
                        m41 = parseFloat(vals[4]);
                        m42 = parseFloat(vals[5]);
                    }
                }
            }
            initialX = m41;
            initialY = m42;
            
            if(e.type === 'touchstart') {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                document.addEventListener('touchmove', onMouseMove, {passive: false});
                document.addEventListener('touchend', onMouseUp);
            } else {
                startX = e.clientX;
                startY = e.clientY;
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            }
        };

        const onMouseMove = (e) => {
            if (!isDragging) return;
            e.preventDefault(); // prevent scrolling while dragging
            let curX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
            let curY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
            
            const dx = curX - startX;
            const dy = curY - startY;
            windowEl.style.transform = `translate(${initialX + dx}px, ${initialY + dy}px)`;
        };

        const onMouseUp = () => {
            if (!isDragging) return;
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('touchmove', onMouseMove);
            document.removeEventListener('touchend', onMouseUp);
        };

        header.addEventListener('mousedown', dragStart);
        header.addEventListener('touchstart', dragStart, {passive: false});
    },

    // --- Shortcuts Management --- //

    toggleShortcutsWindow() {
        if (this.elements.shortcuts.window.classList.contains('hidden')) {
            this.elements.shortcuts.window.classList.remove('hidden');
            this.renderShortcuts();
        } else {
            this.closeShortcutsWindow();
        }
    },

    closeShortcutsWindow() {
        this.elements.shortcuts.window.classList.add('hidden');
    },

    handleAddShortcut(e) {
        e.preventDefault();
        const name = this.elements.shortcuts.nameInput.value.trim();
        let url = this.elements.shortcuts.urlInput.value.trim();
        
        if (!name || !url) return;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        let iconUrl = '';
        try {
            let domain = new URL(url).hostname;
            iconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        } catch (err) {
            console.error("Invalid URL", err);
        }

        const newShortcut = {
            id: Date.now().toString(),
            name,
            url,
            icon: iconUrl
        };

        this.state.shortcuts.push(newShortcut);
        this.saveUserData();
        this.renderShortcuts();
        
        this.elements.shortcuts.addForm.reset();
    },

    deleteShortcut(id) {
        this.state.shortcuts = this.state.shortcuts.filter(s => s.id !== id);
        this.saveUserData();
        this.renderShortcuts();
    },

    renderShortcuts() {
        this.elements.shortcuts.grid.innerHTML = '';
        
        this.state.shortcuts.forEach(shortcut => {
            const a = document.createElement('a');
            a.className = 'shortcut-item';
            a.href = shortcut.url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            
            let iconHtml = shortcut.icon 
                ? `<img src="${this.escapeHtml(shortcut.icon)}" alt="${this.escapeHtml(shortcut.name)}" style="width: 28px; height: 28px; margin-bottom: 0.25rem; border-radius: 4px; object-fit: contain;">`
                : `<i class="fa-solid fa-link" style="font-size: 1.5rem; margin-bottom: 0.25rem; color: var(--primary);"></i>`;
            
            a.innerHTML = `
                ${iconHtml}
                <span>${this.escapeHtml(shortcut.name)}</span>
                <button class="delete-shortcut-btn" data-id="${shortcut.id}" aria-label="Delete">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            `;
            
            this.elements.shortcuts.grid.appendChild(a);
        });
        
        // Bind delete
        this.elements.shortcuts.grid.querySelectorAll('.delete-shortcut-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault(); // prevent navigation
                e.stopPropagation();
                this.deleteShortcut(e.currentTarget.dataset.id);
            });
        });
    },

    initShortcutsDraggable() {
        const header = this.elements.shortcuts.header;
        const windowEl = this.elements.shortcuts.window;
        
        let isDragging = false;
        let startX, startY, initialX, initialY;

        const dragStart = (e) => {
            if (e.type === 'mousedown' && e.button !== 0) return;
            isDragging = true;
            
            const style = window.getComputedStyle(windowEl);
            let m41 = 0, m42 = 0;
            if (style.transform && style.transform !== 'none') {
                const matrixValues = style.transform.match(/matrix.*\((.+)\)/);
                if (matrixValues) {
                    const vals = matrixValues[1].split(', ');
                    if(vals.length === 16) {
                        m41 = parseFloat(vals[12]);
                        m42 = parseFloat(vals[13]);
                    } else {
                        m41 = parseFloat(vals[4]);
                        m42 = parseFloat(vals[5]);
                    }
                }
            }
            initialX = m41;
            initialY = m42;
            
            if(e.type === 'touchstart') {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                document.addEventListener('touchmove', onMouseMove, {passive: false});
                document.addEventListener('touchend', onMouseUp);
            } else {
                startX = e.clientX;
                startY = e.clientY;
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            }
        };

        const onMouseMove = (e) => {
            if (!isDragging) return;
            e.preventDefault(); // prevent scrolling while dragging
            let curX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
            let curY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
            
            const dx = curX - startX;
            const dy = curY - startY;
            windowEl.style.transform = `translate(${initialX + dx}px, ${initialY + dy}px)`;
        };

        const onMouseUp = () => {
            if (!isDragging) return;
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('touchmove', onMouseMove);
            document.removeEventListener('touchend', onMouseUp);
        };

        header.addEventListener('mousedown', dragStart);
        header.addEventListener('touchstart', dragStart, {passive: false});
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
