document.addEventListener("DOMContentLoaded", () => {
    console.log("Page loaded. Initializing task interactions...");

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
    loadSavedTheme();
});

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
    fetch('/api/notifications/count/')
        .then(resp => resp.json())
        .then(data => {
            console.log('Notification count:', data);
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
    dd = document.createElement('div');
    dd.id = 'notif-dropdown';
    dd.className = 'notif-dropdown';
    const tasks = window._latestNotifTasks || [];
    renderNotifDropdown(dd, tasks);
    // Append to body and position the dropdown exactly under the notification button
    document.body.appendChild(dd);
    const rect = btn.getBoundingClientRect();
    const left = rect.left + rect.width / 2 + window.scrollX;
    const top = rect.bottom + 8 + window.scrollY;
    dd.style.left = `${left}px`;
    dd.style.top = `${top}px`;
    dd.style.transform = 'translateX(-50%)';
}

function renderNotifDropdown(container, tasks) {
    if (!container) return;
    if (!tasks || tasks.length === 0) {
        container.innerHTML = '<div class="notif-empty">No upcoming tasks today.</div>';
        return;
    }
    container.innerHTML = '<ul class="notif-list">' + tasks.map(t => {
        const time = t.due_time ? (' at ' + t.due_time) : '';
        return `<li class="notif-item"><a href="/edit/${t.id}/">${escapeHtml(t.title)}<span class="notif-time">${time}</span></a></li>`;
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
        // Optionally refresh statistics
        location.reload();
    })
    .catch(error => console.error('Error updating task:', error));
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
