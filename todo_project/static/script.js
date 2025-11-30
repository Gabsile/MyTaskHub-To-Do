document.addEventListener("DOMContentLoaded", () => {
    console.log("Page loaded. Initializing task interactions...");

    // WORD OF DAY AUTO-POPUP - Must run first!
    console.log("=== WORD OF DAY AUTO-POPUP START ===");
    
    const wordModalElement = document.getElementById('word-modal');
    console.log("Word modal element found:", wordModalElement);
    
    if (wordModalElement) {
        const today = new Date().toDateString();
        const lastShown = localStorage.getItem('wordOfDayLastShown');
        console.log("Today:", today);
        console.log("Last shown:", lastShown);
        console.log("Should show:", lastShown !== today);
        
        if (lastShown !== today) {
            console.log("TRIGGERING POPUP NOW!");
            setTimeout(() => {
                console.log("Displaying word modal...");
                wordModalElement.style.display = 'flex';
                displayDailyMessage();
                localStorage.setItem('wordOfDayLastShown', today);
                
                setTimeout(() => {
                    console.log("Auto-closing word modal...");
                    wordModalElement.style.display = 'none';
                }, 5000);
            }, 500);
        } else {
            console.log("Already shown today, skipping");
        }
    } else {
        console.error("WORD MODAL NOT FOUND!");
    }
    console.log("=== WORD OF DAY AUTO-POPUP END ===");

    // Load saved theme
    const savedTheme = localStorage.getItem('selectedTheme') || 'light';
    applyTheme(savedTheme);

    const tasks = document.querySelectorAll(".task");

    tasks.forEach((task, index) => {
        const checkbox = task.querySelector("input[type='checkbox']");
        const deleteBtn = task.querySelector(".delete-btn");

        console.log(`Task ${index + 1}:`, task.textContent.trim());

        checkbox.addEventListener("change", () => {
            task.classList.toggle("completed", checkbox.checked);
            console.log(`Task "${task.textContent.trim()}" marked as ${checkbox.checked ? "completed" : "incomplete"}`);
        });

        deleteBtn.addEventListener("click", () => {
            console.log(`Deleting task: "${task.textContent.trim()}"`);
            task.remove();
        });
    });

    // Poll for task notifications every 60 seconds (check for tasks due in 10 minutes)
    checkForNotifications(); // run once immediately on load
    setInterval(checkForNotifications, 60000);

    // Fetch and display notification count badge
    fetchNotificationCount();
    setInterval(fetchNotificationCount, 5000); // update every 5 seconds for real-time feedback

    const notifBtn = document.getElementById('notif-btn');
    if (notifBtn) {
        notifBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleNotifDropdown();
        });
        document.addEventListener('click', (e) => {
            const dd = document.getElementById('notif-dropdown');
            if (dd && !notifBtn.contains(e.target) && !dd.contains(e.target)) {
                dd.remove();
            }
        });
    }

    // Theme switcher
    initThemeSwitcher();

    // Handle delete button clicks with proper confirmation
    document.querySelectorAll('.delete-task-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (!confirm('Delete this task?')) {
                e.preventDefault();
                return false;
            }
            // Allow the link to proceed, which will delete and redirect
        });
    });
    loadSavedTheme();

    // Statistics modal
    const statsBtn = document.getElementById('stats-btn');
    const statsModal = document.getElementById('stats-modal');
    const statsClose = document.querySelector('.stats-modal-close');
    
    if (statsBtn && statsModal) {
        statsBtn.addEventListener('click', () => {
            fetchStatistics();
            statsModal.style.display = 'flex';
        });
        
        if (statsClose) {
            statsClose.addEventListener('click', () => {
                statsModal.style.display = 'none';
            });
        }
        
        statsModal.addEventListener('click', (e) => {
            if (e.target === statsModal) {
                statsModal.style.display = 'none';
            }
        });
    }

    // Theme settings modal
    const settingsBtn = document.getElementById('settings-btn');
    const themeModal = document.getElementById('theme-modal');
    const themeClose = document.querySelector('.theme-modal-close');
    
    // Word of the Day Modal
    const wordBtn = document.getElementById('word-btn');
    const wordModal = document.getElementById('word-modal');
    const wordClose = document.querySelector('.word-modal-close');
    const wordMessage = document.getElementById('word-message');
    
    // Chatbot Modal
    const chatBtn = document.getElementById('chat-btn');
    const chatModal = document.getElementById('chat-modal');
    const chatClose = document.querySelector('.chat-modal-close');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatMessages = document.getElementById('chat-messages');
    
    if (chatBtn && chatModal) {
        chatBtn.addEventListener('click', () => {
            chatModal.style.display = 'flex';
        });
        
        if (chatClose) {
            chatClose.addEventListener('click', () => {
                chatModal.style.display = 'none';
            });
        }
        
        chatModal.addEventListener('click', (e) => {
            if (e.target === chatModal) {
                chatModal.style.display = 'none';
            }
        });
        
        // Send message on button click
        if (chatSend) {
            chatSend.addEventListener('click', () => {
                sendChatMessage();
            });
        }
        
        // Send message on Enter key
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    sendChatMessage();
                }
            });
        }
    }
    
    if (wordBtn && wordModal) {
        wordBtn.addEventListener('click', () => {
            wordModal.style.display = 'flex';
            displayDailyMessage();
        });
        
        if (wordClose) {
            wordClose.addEventListener('click', () => {
                wordModal.style.display = 'none';
            });
        }
        
        wordModal.addEventListener('click', (e) => {
            if (e.target === wordModal) {
                wordModal.style.display = 'none';
            }
        });
    }

    
    if (settingsBtn && themeModal) {
        settingsBtn.addEventListener('click', () => {
            themeModal.style.display = 'flex';
            updateThemeSelection();
        });
        
        if (themeClose) {
            themeClose.addEventListener('click', () => {
                themeModal.style.display = 'none';
            });
        }
        
        themeModal.addEventListener('click', (e) => {
            if (e.target === themeModal) {
                themeModal.style.display = 'none';
            }
        });

        // Theme option click handlers
        const themeOptions = document.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            option.addEventListener('click', () => {
                const theme = option.dataset.theme;
                applyTheme(theme);
                localStorage.setItem('selectedTheme', theme);
                updateThemeSelection();
            });
        });
    }
});


function updateThemeSelection() {
    const currentTheme = localStorage.getItem('selectedTheme') || 'light';
    document.querySelectorAll('.theme-option').forEach(option => {
        if (option.dataset.theme === currentTheme) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
}

function applyTheme(theme) {
    const themes = {
        light: {
            '--bg-primary': '#f0f2f5',
            '--bg-secondary': '#ffffff',
            '--bg-hover': '#e8eaed',
            '--text-primary': '#1f1f1f',
            '--text-secondary': '#5f6368',
            '--border-color': '#dadce0',
            '--accent-blue': '#4A90E2',
            '--accent-orange': '#ff6b35'
        },
        peach: {
            '--bg-primary': '#FFF5EE',
            '--bg-secondary': '#FFE4CC',
            '--bg-hover': '#FFDAB9',
            '--text-primary': '#3E2723',
            '--text-secondary': '#6D4C41',
            '--border-color': '#FFCCBC',
            '--accent-blue': '#FF8A65',
            '--accent-orange': '#FF7043'
        },
        green: {
            '--bg-primary': '#F1F8E9',
            '--bg-secondary': '#DCEDC8',
            '--bg-hover': '#C5E1A5',
            '--text-primary': '#1B5E20',
            '--text-secondary': '#33691E',
            '--border-color': '#AED581',
            '--accent-blue': '#66BB6A',
            '--accent-orange': '#8BC34A'
        },
        'red-texture': {
            '--bg-primary': '#FFEBEE',
            '--bg-secondary': '#FFCDD2',
            '--bg-hover': '#EF9A9A',
            '--text-primary': '#B71C1C',
            '--text-secondary': '#C62828',
            '--border-color': '#E57373',
            '--accent-blue': '#E53935',
            '--accent-orange': '#F44336'
        },
        'blue-grid': {
            '--bg-primary': '#E3F2FD',
            '--bg-secondary': '#BBDEFB',
            '--bg-hover': '#90CAF9',
            '--text-primary': '#0D47A1',
            '--text-secondary': '#1565C0',
            '--border-color': '#64B5F6',
            '--accent-blue': '#2196F3',
            '--accent-orange': '#1976D2'
        },
        'teal-waves': {
            '--bg-primary': '#E0F2F1',
            '--bg-secondary': '#B2DFDB',
            '--bg-hover': '#80CBC4',
            '--text-primary': '#004D40',
            '--text-secondary': '#00695C',
            '--border-color': '#4DB6AC',
            '--accent-blue': '#009688',
            '--accent-orange': '#00796B'
        },
        burgundy: {
            '--bg-primary': '#FCE4EC',
            '--bg-secondary': '#F8BBD0',
            '--bg-hover': '#F48FB1',
            '--text-primary': '#880E4F',
            '--text-secondary': '#AD1457',
            '--border-color': '#F06292',
            '--accent-blue': '#C2185B',
            '--accent-orange': '#E91E63'
        },
        beige: {
            '--bg-primary': '#EFEBE9',
            '--bg-secondary': '#D7CCC8',
            '--bg-hover': '#BCAAA4',
            '--text-primary': '#3E2723',
            '--text-secondary': '#4E342E',
            '--border-color': '#A1887F',
            '--accent-blue': '#6D4C41',
            '--accent-orange': '#8D6E63'
        },
        orange: {
            '--bg-primary': '#FFF3E0',
            '--bg-secondary': '#FFE0B2',
            '--bg-hover': '#FFCC80',
            '--text-primary': '#E65100',
            '--text-secondary': '#EF6C00',
            '--border-color': '#FFB74D',
            '--accent-blue': '#FB8C00',
            '--accent-orange': '#FF9800'
        },
        yellow: {
            '--bg-primary': '#FFFDE7',
            '--bg-secondary': '#FFF9C4',
            '--bg-hover': '#FFF59D',
            '--text-primary': '#F57F17',
            '--text-secondary': '#F9A825',
            '--border-color': '#FFF176',
            '--accent-blue': '#FBC02D',
            '--accent-orange': '#FDD835'
        },
        'gray-dots': {
            '--bg-primary': '#ECEFF1',
            '--bg-secondary': '#CFD8DC',
            '--bg-hover': '#B0BEC5',
            '--text-primary': '#263238',
            '--text-secondary': '#37474F',
            '--border-color': '#90A4AE',
            '--accent-blue': '#546E7A',
            '--accent-orange': '#607D8B'
        },
        'blue-curve': {
            '--bg-primary': '#E1F5FE',
            '--bg-secondary': '#B3E5FC',
            '--bg-hover': '#81D4FA',
            '--text-primary': '#01579B',
            '--text-secondary': '#0277BD',
            '--border-color': '#4FC3F7',
            '--accent-blue': '#039BE5',
            '--accent-orange': '#03A9F4'
        },
        'teal-dark': {
            '--bg-primary': '#E0F7FA',
            '--bg-secondary': '#B2EBF2',
            '--bg-hover': '#80DEEA',
            '--text-primary': '#006064',
            '--text-secondary': '#00838F',
            '--border-color': '#4DD0E1',
            '--accent-blue': '#00ACC1',
            '--accent-orange': '#00BCD4'
        },
        'dark-gray': {
            '--bg-primary': '#303030',
            '--bg-secondary': '#424242',
            '--bg-hover': '#616161',
            '--text-primary': '#FFFFFF',
            '--text-secondary': '#BDBDBD',
            '--border-color': '#757575',
            '--accent-blue': '#90CAF9',
            '--accent-orange': '#FFB74D'
        },
        lime: {
            '--bg-primary': '#F9FBE7',
            '--bg-secondary': '#F0F4C3',
            '--bg-hover': '#E6EE9C',
            '--text-primary': '#827717',
            '--text-secondary': '#9E9D24',
            '--border-color': '#DCE775',
            '--accent-blue': '#AFB42B',
            '--accent-orange': '#CDDC39'
        },
        snow: {
            '--bg-primary': '#FAFAFA',
            '--bg-secondary': '#FFFFFF',
            '--bg-hover': '#F5F5F5',
            '--text-primary': '#212121',
            '--text-secondary': '#616161',
            '--border-color': '#E0E0E0',
            '--accent-blue': '#1976D2',
            '--accent-orange': '#FF6F00'
        },
        'dark-red': {
            '--bg-primary': '#FFEBEE',
            '--bg-secondary': '#EF9A9A',
            '--bg-hover': '#E57373',
            '--text-primary': '#B71C1C',
            '--text-secondary': '#C62828',
            '--border-color': '#EF5350',
            '--accent-blue': '#D32F2F',
            '--accent-orange': '#F44336'
        },
        purple: {
            '--bg-primary': '#F3E5F5',
            '--bg-secondary': '#E1BEE7',
            '--bg-hover': '#CE93D8',
            '--text-primary': '#4A148C',
            '--text-secondary': '#6A1B9A',
            '--border-color': '#BA68C8',
            '--accent-blue': '#8E24AA',
            '--accent-orange': '#AB47BC'
        },
        'bright-orange': {
            '--bg-primary': '#FBE9E7',
            '--bg-secondary': '#FFCCBC',
            '--bg-hover': '#FFAB91',
            '--text-primary': '#BF360C',
            '--text-secondary': '#D84315',
            '--border-color': '#FF8A65',
            '--accent-blue': '#F4511E',
            '--accent-orange': '#FF5722'
        },
        forest: {
            '--bg-primary': '#E8F5E9',
            '--bg-secondary': '#C8E6C9',
            '--bg-hover': '#A5D6A7',
            '--text-primary': '#1B5E20',
            '--text-secondary': '#2E7D32',
            '--border-color': '#81C784',
            '--accent-blue': '#43A047',
            '--accent-orange': '#4CAF50'
        },
        navy: {
            '--bg-primary': '#E3F2FD',
            '--bg-secondary': '#90CAF9',
            '--bg-hover': '#64B5F6',
            '--text-primary': '#0D47A1',
            '--text-secondary': '#1565C0',
            '--border-color': '#42A5F5',
            '--accent-blue': '#1976D2',
            '--accent-orange': '#2196F3'
        },
        plum: {
            '--bg-primary': '#F3E5F5',
            '--bg-secondary': '#CE93D8',
            '--bg-hover': '#BA68C8',
            '--text-primary': '#4A148C',
            '--text-secondary': '#6A1B9A',
            '--border-color': '#AB47BC',
            '--accent-blue': '#8E24AA',
            '--accent-orange': '#9C27B0'
        },
        'cyan-black': {
            '--bg-primary': '#E0F7FA',
            '--bg-secondary': '#80DEEA',
            '--bg-hover': '#4DD0E1',
            '--text-primary': '#006064',
            '--text-secondary': '#00838F',
            '--border-color': '#26C6DA',
            '--accent-blue': '#00ACC1',
            '--accent-orange': '#00BCD4'
        }
    };

    const selectedTheme = themes[theme] || themes.light;
    const root = document.documentElement;
    
    Object.keys(selectedTheme).forEach(property => {
        root.style.setProperty(property, selectedTheme[property]);
    });
}

function fetchStatistics() {
    fetch('/api/statistics/')
        .then(response => response.json())
        .then(data => {
            document.getElementById('stat-total-completed').textContent = data.total_completed || 0;
            document.getElementById('stat-week-completed').textContent = data.tasks_completed_this_week || 0;
            document.getElementById('stat-today-completed').textContent = data.tasks_completed_today || 0;
        })
        .catch(error => console.error('Error fetching statistics:', error));
}

function checkForNotifications() {
    fetch('/api/notifications/')
        .then(response => response.json())
        .then(data => {
            console.log('Notifications check result:', data);
            if (data.notifications && data.notifications.length > 0) {
                data.notifications.forEach(notification => {
                    showNotification(notification);
                });
            }
        })
        .catch(error => console.error('Error checking notifications:', error));
}

function fetchNotificationCount() {
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    fetch(`/api/notifications/count/?_=${timestamp}`)
        .then(resp => resp.json())
        .then(data => {
            console.log('=== Notification count response ===');
            console.log('Count:', data.count);
            console.log('Tasks:', data.tasks);
            
            const el = document.getElementById('notif-count');
            if (el) el.textContent = data.count || 0;
            window._latestNotifTasks = data.tasks || [];
            const dd = document.getElementById('notif-dropdown');
            if (dd) renderNotifDropdown(dd, window._latestNotifTasks);
        })
        .catch(err => console.error('Error fetching notification count:', err));
}

function toggleNotifDropdown() {
    let dd = document.getElementById('notif-dropdown');
    if (dd) { dd.remove(); return; }
    
    const btn = document.getElementById('notif-btn');
    if (!btn) return;
    
    // Fetch fresh notification data when opening the dropdown
    const timestamp = new Date().getTime();
    fetch(`/api/notifications/count/?_=${timestamp}`)
        .then(res => res.json())
        .then(data => {
            console.log('Fresh notification data fetched:', data);
            
            // Update cache
            window._latestNotifTasks = data.tasks || [];
            
            // Create and render dropdown with fresh data
            dd = document.createElement('div');
            dd.id = 'notif-dropdown';
            dd.className = 'notif-dropdown';
            renderNotifDropdown(dd, data.tasks || []);
            
            // Append to body and position the dropdown exactly under the notification button
            document.body.appendChild(dd);
            const rect = btn.getBoundingClientRect();
            const left = rect.left + rect.width / 2 + window.scrollX;
            const top = rect.bottom + 8 + window.scrollY;
            dd.style.left = `${left}px`;
            dd.style.top = `${top}px`;
            dd.style.transform = 'translateX(-50%)';
        })
        .catch(err => {
            console.error('Error fetching notifications:', err);
            // Fallback to cached data
            dd = document.createElement('div');
            dd.id = 'notif-dropdown';
            dd.className = 'notif-dropdown';
            const tasks = window._latestNotifTasks || [];
            renderNotifDropdown(dd, tasks);
            document.body.appendChild(dd);
            const rect = btn.getBoundingClientRect();
            const left = rect.left + rect.width / 2 + window.scrollX;
            const top = rect.bottom + 8 + window.scrollY;
            dd.style.left = `${left}px`;
            dd.style.top = `${top}px`;
            dd.style.transform = 'translateX(-50%)';
        });
}

function renderNotifDropdown(container, tasks) {
    if (!container) return;
    
    console.log('Rendering notification dropdown with tasks:', tasks);
    
    if (!tasks || tasks.length === 0) {
        container.innerHTML = '<div class="notif-empty">No tasks to display.</div>';
        return;
    }
    
    // Get current filter from URL
    const urlParams = new URLSearchParams(window.location.search);
    const currentFilter = urlParams.get('filter') || 'today';
    
    container.innerHTML = '<ul class="notif-list">' + tasks.map(t => {
        const time = t.due_time ? (' at ' + t.due_time) : '';
        const date = t.due_date ? (' on ' + t.due_date) : '';
        const timeInfo = (date || time) ? `<span class="task-time">${date}${time}</span>` : '';
        return `<li class="notif-item">
            <a href="/edit/${t.id}/?filter=${currentFilter}">
                <span class="task-title">${escapeHtml(t.title)}</span>
                ${timeInfo}
            </a>
        </li>`;
    }).join('') + '</ul>';
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"'`=\/]/g, function (s) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;'
        }[s];
    });
}

function showNotification(task) {
    const message = `⏰ Reminder: "${task.title}" is due today! (Priority: ${task.priority})`;
    
    // Create modal popup
    const modal = document.createElement('div');
    modal.className = 'notification-modal';
    modal.innerHTML = `
        <div class="notification-content">
            <div class="notification-header">
                <span class="notification-icon">🔔</span>
                <h3>Task Reminder</h3>
                <button class="notification-close">&times;</button>
            </div>
            <div class="notification-body">
                <p><strong>${task.title}</strong></p>
                <p>${task.description || 'No description'}</p>
                <p class="notification-priority">Priority: <span class="priority-${task.priority.toLowerCase()}">${task.priority}</span></p>
            </div>
            <div class="notification-footer">
                <button class="notification-btn btn-primary">Got it!</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close button functionality
    const closeBtn = modal.querySelector('.notification-close');
    const gotItBtn = modal.querySelector('.notification-btn');
    
    closeBtn.addEventListener('click', () => {
        modal.remove();
    });
    
    gotItBtn.addEventListener('click', () => {
        modal.remove();
    });
    
    // Auto-close after 8 seconds
    setTimeout(() => {
        if (modal.parentElement) {
            modal.remove();
        }
    }, 8000);
    
    // If browser notifications are available, also show a desktop notification
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Task Reminder', {
            body: message,
            icon: '/static/icon.png'
        });
    }
}

// Request notification permission on page load
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// Theme Switcher Functions
const themes = {
    light: { name: 'Light', category: 'Bright' },
    bright: { name: 'Neon Bright', category: 'Bright' },
    ocean: { name: 'Ocean Blue', category: 'Bright' },
    forest: { name: 'Forest Green', category: 'Bright' },
    sunset: { name: 'Sunset Glow', category: 'Bright' },
    dark: { name: 'Dark Mode', category: 'Dark' },
    neon: { name: 'Neon Dark', category: 'Dark' },
    midnight: { name: 'Midnight', category: 'Dark' },
    dracula: { name: 'Dracula', category: 'Dark' }
};

const themeColors = {
    light: {
        '--bg-primary': '#f0f2f5',
        '--bg-secondary': '#fff',
        '--text-primary': '#333',
        '--text-secondary': '#666',
        '--header-bg': '#e73aed',
        '--footer-bg': '#7C3AED',
        '--border-color': '#ccc',
        '--shadow-color': 'rgba(0, 0, 0, 0.1)',
        '--link-color': '#1abc9c',
        '--link-hover': '#16a085',
        '--btn-primary': '#1abc9c',
        '--btn-hover': '#16a085',
        '--accent-color': '#e73aed',
        '--success-color': '#27ae60',
        '--warning-color': '#f39c12',
        '--danger-color': '#e74c3c'
    },
    bright: {
        '--bg-primary': '#fffef0',
        '--bg-secondary': '#fff9e6',
        '--text-primary': '#ff1493',
        '--text-secondary': '#ff69b4',
        '--header-bg': '#ff6b9d',
        '--footer-bg': '#ffb6c1',
        '--border-color': '#ffc0cb',
        '--shadow-color': 'rgba(255, 107, 157, 0.2)',
        '--link-color': '#ff1493',
        '--link-hover': '#ff69b4',
        '--btn-primary': '#ff6b9d',
        '--btn-hover': '#ff1493',
        '--accent-color': '#ffff00',
        '--success-color': '#ff69b4',
        '--warning-color': '#ffa500',
        '--danger-color': '#ff0000'
    },
    ocean: {
        '--bg-primary': '#e3f2fd',
        '--bg-secondary': '#b3e5fc',
        '--text-primary': '#0277bd',
        '--text-secondary': '#01579b',
        '--header-bg': '#0277bd',
        '--footer-bg': '#00838f',
        '--border-color': '#81d4fa',
        '--shadow-color': 'rgba(2, 119, 189, 0.2)',
        '--link-color': '#0277bd',
        '--link-hover': '#01579b',
        '--btn-primary': '#0277bd',
        '--btn-hover': '#01579b',
        '--accent-color': '#00acc1',
        '--success-color': '#00897b',
        '--warning-color': '#ff9800',
        '--danger-color': '#d32f2f'
    },
    forest: {
        '--bg-primary': '#e8f5e9',
        '--bg-secondary': '#c8e6c9',
        '--text-primary': '#1b5e20',
        '--text-secondary': '#2e7d32',
        '--header-bg': '#2e7d32',
        '--footer-bg': '#1b5e20',
        '--border-color': '#a5d6a7',
        '--shadow-color': 'rgba(46, 125, 50, 0.2)',
        '--link-color': '#1b5e20',
        '--link-hover': '#2e7d32',
        '--btn-primary': '#43a047',
        '--btn-hover': '#2e7d32',
        '--accent-color': '#558b2f',
        '--success-color': '#689f38',
        '--warning-color': '#fbc02d',
        '--danger-color': '#d32f2f'
    },
    sunset: {
        '--bg-primary': '#fff3e0',
        '--bg-secondary': '#ffe0b2',
        '--text-primary': '#e65100',
        '--text-secondary': '#bf360c',
        '--header-bg': '#ff6f00',
        '--footer-bg': '#e65100',
        '--border-color': '#ffb74d',
        '--shadow-color': 'rgba(230, 81, 0, 0.2)',
        '--link-color': '#e65100',
        '--link-hover': '#bf360c',
        '--btn-primary': '#ff6f00',
        '--btn-hover': '#e65100',
        '--accent-color': '#ffa000',
        '--success-color': '#f57f17',
        '--warning-color': '#ff6f00',
        '--danger-color': '#d84315'
    },
    dark: {
        '--bg-primary': '#1a1a1a',
        '--bg-secondary': '#2d2d2d',
        '--text-primary': '#e8e8e8',
        '--text-secondary': '#b0b0b0',
        '--header-bg': '#1f0033',
        '--footer-bg': '#2f0052',
        '--border-color': '#444',
        '--shadow-color': 'rgba(0, 0, 0, 0.5)',
        '--link-color': '#5dade2',
        '--link-hover': '#3498db',
        '--btn-primary': '#3498db',
        '--btn-hover': '#2980b9',
        '--accent-color': '#e73aed',
        '--success-color': '#52be80',
        '--warning-color': '#f8b88b',
        '--danger-color': '#ec7063'
    },
    neon: {
        '--bg-primary': '#0f0c29',
        '--bg-secondary': '#302b63',
        '--text-primary': '#00ff88',
        '--text-secondary': '#00ffff',
        '--header-bg': '#1a0066',
        '--footer-bg': '#330099',
        '--border-color': '#00ff88',
        '--shadow-color': 'rgba(0, 255, 136, 0.2)',
        '--link-color': '#00ffff',
        '--link-hover': '#00ff88',
        '--btn-primary': '#00ff88',
        '--btn-hover': '#00ffff',
        '--accent-color': '#ff00ff',
        '--success-color': '#00ff88',
        '--warning-color': '#ffff00',
        '--danger-color': '#ff0055'
    },
    midnight: {
        '--bg-primary': '#001a4d',
        '--bg-secondary': '#003d7a',
        '--text-primary': '#00d4ff',
        '--text-secondary': '#66e6ff',
        '--header-bg': '#001a4d',
        '--footer-bg': '#003d7a',
        '--border-color': '#00a3cc',
        '--shadow-color': 'rgba(0, 212, 255, 0.2)',
        '--link-color': '#00d4ff',
        '--link-hover': '#66e6ff',
        '--btn-primary': '#0088cc',
        '--btn-hover': '#00aaff',
        '--accent-color': '#00d4ff',
        '--success-color': '#00cc88',
        '--warning-color': '#ffaa00',
        '--danger-color': '#ff3366'
    },
    dracula: {
        '--bg-primary': '#1e1e2e',
        '--bg-secondary': '#44475a',
        '--text-primary': '#f8f8f2',
        '--text-secondary': '#bd93f9',
        '--header-bg': '#44475a',
        '--footer-bg': '#282a36',
        '--border-color': '#6272a4',
        '--shadow-color': 'rgba(68, 71, 90, 0.5)',
        '--link-color': '#8be9fd',
        '--link-hover': '#ff79c6',
        '--btn-primary': '#bd93f9',
        '--btn-hover': '#ff79c6',
        '--accent-color': '#ff79c6',
        '--success-color': '#50fa7b',
        '--warning-color': '#f1fa8c',
        '--danger-color': '#ff5555'
    }
};

function initThemeSwitcher() {
    const themeBtn = document.getElementById('theme-btn');
    if (!themeBtn) return;

    themeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleThemeMenu();
    });

    document.addEventListener('click', (e) => {
        const menu = document.getElementById('theme-menu');
        if (menu && !themeBtn.contains(e.target) && !menu.contains(e.target)) {
            menu.remove();
        }
    });
}

function toggleThemeMenu() {
    let menu = document.getElementById('theme-menu');
    if (menu) {
        menu.remove();
        return;
    }

    const themeBtn = document.getElementById('theme-btn');
    if (!themeBtn) return;

    menu = document.createElement('div');
    menu.id = 'theme-menu';
    menu.className = 'theme-menu';

    let html = '<h4>Choose Your Theme</h4>';
    
    const brightThemes = Object.keys(themes).filter(t => themes[t].category === 'Bright');
    html += '<div class="theme-category"><div class="theme-category-title">✨ Bright Themes</div>';
    brightThemes.forEach(theme => {
        html += `
            <div class="theme-option theme-${theme}">
                <div class="theme-preview"></div>
                <label>${themes[theme].name}</label>
            </div>
        `;
    });
    html += '</div>';

    const darkThemes = Object.keys(themes).filter(t => themes[t].category === 'Dark');
    html += '<div class="theme-category"><div class="theme-category-title">🌙 Dark Themes</div>';
    darkThemes.forEach(theme => {
        html += `
            <div class="theme-option theme-${theme}">
                <div class="theme-preview"></div>
                <label>${themes[theme].name}</label>
            </div>
        `;
    });
    html += '</div>';

    menu.innerHTML = html;
    // Append to body and position the menu exactly under the theme button
    document.body.appendChild(menu);
    const rect = themeBtn.getBoundingClientRect();
    const left = rect.left + rect.width / 2 + window.scrollX;
    const top = rect.bottom + 8 + window.scrollY;
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
    menu.style.transform = 'translateX(-50%)';

    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', (e) => {
            const themeKey = e.currentTarget.className.match(/theme-(\w+)/)[1];
            setTheme(themeKey);
            menu.remove();
        });
    });
}

function setTheme(themeName) {
    const colors = themeColors[themeName];
    if (!colors) return;

    Object.entries(colors).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
    });

    // Apply dark theme class if needed
    if (themes[themeName].category === 'Dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }

    // Save to localStorage
    localStorage.setItem('selectedTheme', themeName);
}

function loadSavedTheme() {
    const saved = localStorage.getItem('selectedTheme') || 'light';
    setTheme(saved);
}

// Task completion toggle
function toggleTaskCompletion(taskId, isCompleted) {
    fetch(`/api/toggle-task/${taskId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ completed: isCompleted })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Task updated:', data);
        
        // Update the task item appearance
        const taskItem = document.querySelector(`[data-task-id="${taskId}"]`);
        if (taskItem) {
            if (isCompleted) {
                taskItem.classList.add('task-completed');
            } else {
                taskItem.classList.remove('task-completed');
            }
        }
        
        // Update statistics counters
        const pendingElement = document.querySelector('.stat-card .stat-value');
        const completedElement = document.querySelectorAll('.stat-card .stat-value')[1];
        
        if (pendingElement && completedElement) {
            let pending = parseInt(pendingElement.textContent) || 0;
            let completed = parseInt(completedElement.textContent) || 0;
            
            if (isCompleted) {
                pending = Math.max(0, pending - 1);
                completed = completed + 1;
            } else {
                pending = pending + 1;
                completed = Math.max(0, completed - 1);
            }
            
            pendingElement.textContent = pending;
            completedElement.textContent = completed;
        }
    })
    .catch(error => console.error('Error updating task:', error));
}

// Daily Motivational Messages
function displayDailyMessage() {
    const messages = [
        "🌟 Believe in yourself and all that you are!",
        "💪 You are capable of amazing things!",
        "🎯 Success is the sum of small efforts repeated day in and day out.",
        "✨ Dream big, work hard, stay focused!",
        "🚀 The only way to do great work is to love what you do.",
        "🌈 Every accomplishment starts with the decision to try.",
        "💎 Your potential is endless. Go do what you were created to do.",
        "🔥 Don't watch the clock; do what it does. Keep going.",
        "⭐ Believe you can and you're halfway there.",
        "🌺 The future depends on what you do today.",
        "🎨 Creativity is intelligence having fun.",
        "🏆 Strive for progress, not perfection.",
        "🌸 Be yourself; everyone else is already taken.",
        "💫 Life is 10% what happens to you and 90% how you react to it.",
        "🌻 Act as if what you do makes a difference. It does.",
        "🎭 Success is not final, failure is not fatal: It is the courage to continue that counts.",
        "🌙 The best time to plant a tree was 20 years ago. The second best time is now.",
        "☀️ You miss 100% of the shots you don't take.",
        "🎪 Don't be afraid to give up the good to go for the great.",
        "🌠 I find that the harder I work, the more luck I seem to have.",
        "🎯 Success usually comes to those who are too busy to be looking for it.",
        "🌟 Opportunities don't happen. You create them.",
        "💪 Don't be pushed around by the fears in your mind. Be led by the dreams in your heart.",
        "✨ It's not whether you get knocked down, it's whether you get up.",
        "🚀 If you are working on something that you really care about, you don't have to be pushed.",
        "🌈 We may encounter many defeats but we must not be defeated.",
        "💎 Knowing is not enough; we must apply. Wishing is not enough; we must do.",
        "🔥 Imagine your life is perfect in every respect; what would it look like?",
        "⭐ We generate fears while we sit. We overcome them by action.",
        "🌺 Whether you think you can or think you can't, you're right.",
        "🎨 I have learned over the years that when one's mind is made up, this diminishes fear.",
        "🏆 Security is mostly a superstition. Life is either a daring adventure or nothing.",
        "🌸 The only person you are destined to become is the person you decide to be.",
        "💫 Go confidently in the direction of your dreams! Live the life you've imagined.",
        "🌻 Everything you've ever wanted is on the other side of fear.",
        "🎭 It does not matter how slowly you go as long as you do not stop.",
        "🌙 Too many of us are not living our dreams because we are living our fears."
    ];
    
    // Get current date as seed for consistent daily message
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const messageIndex = dayOfYear % messages.length;
    
    const wordMessage = document.getElementById('word-message');
    if (wordMessage) {
        wordMessage.textContent = messages[messageIndex];
    }
}

// Chatbot functionality
function sendChatMessage() {
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    
    if (!chatInput || !chatMessages) return;
    
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;
    
    // Add user message
    addChatMessage(userMessage, 'user');
    chatInput.value = '';
    
    // Simulate typing indicator
    setTimeout(() => {
        const botResponse = getBotResponse(userMessage);
        addChatMessage(botResponse, 'bot');
    }, 500);
}

function addChatMessage(message, sender) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}-message`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = message;
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getBotResponse(userMessage) {
    const msg = userMessage.toLowerCase();
    
    // Planning responses
    if (msg.includes('plan') && (msg.includes('day') || msg.includes('daily'))) {
        return "📅 To plan your day effectively:\n\n1. Start the night before - review tomorrow's tasks\n2. Identify your top 3 priorities\n3. Block time for deep work in the morning\n4. Schedule breaks every 90 minutes\n5. Leave buffer time for unexpected tasks\n6. Review and adjust at end of day";
    }
    
    if (msg.includes('plan') && msg.includes('week')) {
        return "📆 Weekly planning tips:\n\n1. Sunday/Monday: Set weekly goals\n2. Identify your big 3 tasks for the week\n3. Schedule important tasks early in the week\n4. Block time for recurring activities\n5. Plan for review on Friday\n6. Keep some flexibility for urgent matters";
    }
    
    // Task management responses
    if (msg.includes('manage') && msg.includes('task')) {
        return "📝 Effective task management:\n\n1. Write everything down - don't rely on memory\n2. Break large tasks into smaller steps\n3. Set clear deadlines for each task\n4. Use categories or labels to organize\n5. Review your task list daily\n6. Complete quick tasks (under 2 min) immediately\n7. Delete or delegate tasks when possible";
    }
    
    if (msg.includes('organize') || msg.includes('organise')) {
        return "🗂️ Organization tips:\n\n1. Group similar tasks together\n2. Use the Today/Tomorrow/This Week filters\n3. Set priorities: High, Medium, Low\n4. Create a 'waiting for' list for delegated tasks\n5. Keep a separate list for ideas and future tasks\n6. Clean up completed tasks weekly";
    }
    
    // Priority responses
    if (msg.includes('priorit')) {
        return "🎯 How to prioritize:\n\n1. Eisenhower Matrix:\n   - Urgent + Important = Do first\n   - Important + Not urgent = Schedule\n   - Urgent + Not important = Delegate\n   - Neither = Eliminate\n\n2. Ask: What will have the most impact?\n3. Consider deadlines and consequences\n4. Focus on 3 main tasks per day\n5. Do your hardest task first (eat the frog)";
    }
    
    // Time management responses
    if (msg.includes('time') && (msg.includes('manage') || msg.includes('management'))) {
        return "⏰ Time management strategies:\n\n1. Time blocking - assign specific times to tasks\n2. Pomodoro Technique - 25 min work, 5 min break\n3. Batch similar tasks together\n4. Minimize distractions (turn off notifications)\n5. Use the 2-minute rule for quick tasks\n6. Track where your time actually goes\n7. Learn to say 'no' to non-essential tasks";
    }
    
    if (msg.includes('procrastinat')) {
        return "🚀 Beat procrastination:\n\n1. Start with just 5 minutes\n2. Break tasks into tiny steps\n3. Remove distractions from workspace\n4. Use a timer to create urgency\n5. Reward yourself after completing tasks\n6. Understand WHY you're avoiding it\n7. Make it easier to start than to avoid";
    }
    
    // Focus and productivity
    if (msg.includes('focus') || msg.includes('concentrate')) {
        return "🎯 Improve focus:\n\n1. Single-tasking > Multi-tasking\n2. Use website blockers during work time\n3. Put phone in another room\n4. Work in 90-minute focused blocks\n5. Take regular breaks to recharge\n6. Create a dedicated workspace\n7. Use background music or white noise\n8. Start with your most important task";
    }
    
    if (msg.includes('productive') || msg.includes('efficiency')) {
        return "⚡ Boost productivity:\n\n1. Plan the night before\n2. Morning routine sets the tone\n3. Tackle hardest task when energy is highest\n4. Use the 80/20 rule - focus on high-impact tasks\n5. Automate repetitive tasks\n6. Batch similar tasks\n7. Take care of yourself - sleep, exercise, nutrition\n8. Review what worked/didn't weekly";
    }
    
    // Energy and motivation
    if (msg.includes('motivat') || msg.includes('inspired')) {
        return "💪 Stay motivated:\n\n1. Connect tasks to your bigger goals\n2. Visualize the end result\n3. Celebrate small wins\n4. Track your progress visually\n5. Find an accountability partner\n6. Remember your 'why'\n7. Take breaks to prevent burnout\n8. Adjust goals if they're not serving you";
    }
    
    if (msg.includes('energy') || msg.includes('tired') || msg.includes('exhausted')) {
        return "⚡ Manage your energy:\n\n1. Identify your peak energy times\n2. Schedule important work during high-energy periods\n3. Take real breaks - walk, stretch, hydrate\n4. Avoid back-to-back meetings\n5. Get 7-9 hours of sleep\n6. Exercise regularly\n7. Eat balanced meals\n8. Say no to energy drains";
    }
    
    // Goals
    if (msg.includes('goal')) {
        return "🎯 Set effective goals:\n\n1. Use SMART criteria:\n   - Specific\n   - Measurable\n   - Achievable\n   - Relevant\n   - Time-bound\n\n2. Break big goals into milestones\n3. Write them down and review regularly\n4. Align daily tasks with goals\n5. Track progress weekly\n6. Adjust as needed";
    }
    
    // Habits
    if (msg.includes('habit')) {
        return "🔄 Build better habits:\n\n1. Start small - 2 minutes per day\n2. Stack new habits onto existing ones\n3. Make it obvious (visual cues)\n4. Make it attractive (pair with something enjoyable)\n5. Make it easy (reduce friction)\n6. Make it satisfying (track and celebrate)\n7. Be consistent for 66 days\n8. Don't break the chain";
    }
    
    // Stress and overwhelm
    if (msg.includes('stress') || msg.includes('overwhelm')) {
        return "🧘 Manage stress:\n\n1. Brain dump - write everything down\n2. Prioritize ruthlessly\n3. Focus on what you can control\n4. Break tasks into smaller steps\n5. Take regular breaks\n6. Practice deep breathing\n7. Exercise or walk\n8. Ask for help when needed\n9. Remember: done is better than perfect";
    }
    
    // Greetings
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
        return "Hello! 👋 I'm here to help you with:\n\n• Planning your day or week\n• Managing tasks effectively\n• Prioritizing your work\n• Time management strategies\n• Beating procrastination\n• Improving focus and productivity\n\nWhat would you like to know about?";
    }
    
    if (msg.includes('thank')) {
        return "You're welcome! 😊 Feel free to ask me anything about productivity and task management anytime!";
    }
    
    // Default response
    return "I can help you with:\n\n📅 Planning your day/week\n📝 Managing tasks\n🎯 Setting priorities\n⏰ Time management\n🚀 Beating procrastination\n💪 Staying motivated\n🎯 Setting goals\n\nTry asking: 'How do I plan my day?' or 'How do I prioritize tasks?'";
}



// Toggle completed tasks visibility
function toggleCompleted() {
    const completedTasks = document.querySelectorAll('.task-completed');
    completedTasks.forEach(task => {
        task.style.display = task.style.display === 'none' ? 'flex' : 'none';
    });
}

// Get CSRF token from cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
