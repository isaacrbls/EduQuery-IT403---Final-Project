function goToHome() {
    window.location.href = '/student/dashboard/';
}

function goToSurveyList() {
    window.location.href = '/student/surveys/';
}

function goToHistory() {
    window.location.href = '/student/history/';
}

function goToAnalytics() {
    window.location.href = '/student/analytics/';
}

function goToProfile() {
    window.location.href = '/profile/';
}

function goToSettings() {
    window.location.href = '/settings/';
}

function handleLogout() {
    Modal.show({
        title: 'Logout Confirmation',
        message: 'Are you sure you want to logout? You will be redirected to the login page.',
        type: 'warning',
        icon: 'warning',
        confirmText: 'Logout',
        cancelText: 'Cancel',
        confirmDanger: true,
        onConfirm: () => {
            window.location.href = '/logout/';
        }
    });
}

/* ============================================
   Real-time Updates
   ============================================ */

function formatDate(dateString) {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return 'Due: ' + date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function renderSurveyCard(survey) {
    return `
        <div class="survey-card active-survey">
            <div class="survey-card-main">
                <div class="survey-icon">
                    <span class="material-icons">assignment</span>
                </div>
                <div class="survey-info">
                    <h3 class="survey-title">${survey.title}</h3>
                    <div class="survey-meta">
                        <span class="teacher-info">
                            <span class="material-icons">person</span>
                            ${survey.creator_name || 'Unknown Teacher'}
                        </span>
                        <span class="due-info">
                            <span class="material-icons">schedule</span>
                            ${formatDate(survey.due_date)}
                        </span>
                    </div>
                </div>
            </div>
            <div class="survey-actions">
                <div class="survey-status-badge active">
                    <span class="status-dot"></span>
                    ACTIVE
                </div>
                <a href="/surveys/${survey.id}/take/" class="survey-action-btn primary">
                    <span class="material-icons">play_arrow</span>
                    Take Survey
                </a>
            </div>
        </div>
    `;
}

function fetchPendingSurveys() {
    fetch('/api/accounts/surveys/unanswered/')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('pending-surveys-list');
            if (!container) return;

            // Check if we have surveys
            if (data.surveys && data.surveys.length > 0) {
                const html = data.surveys.map(survey => renderSurveyCard(survey)).join('');
                
                // Only update if content has changed to avoid flickering
                // A simple way is to compare length or IDs, but for now we'll just replace
                // Ideally we should diff the DOM or data
                
                // For now, let's just update. 
                // To prevent replacing if user is interacting, we could check for hover, 
                // but since these are just links, it's okay.
                
                // However, to avoid constant DOM thrashing, let's compare the HTML string length or hash
                // Or just check if the number of items changed.
                
                // Let's just replace it for simplicity as requested "realtime"
                container.innerHTML = html;
                
                // Update stats if needed
                const pendingStat = document.querySelector('.stat-card[data-stat="pending"] .stat-value');
                if (pendingStat) {
                    pendingStat.textContent = data.count;
                }
                
                // Also update total surveys stat
                // We might need another API for total count or calculate it
                
            } else {
                container.innerHTML = ''; // No pending surveys
            }
        })
        .catch(error => console.error('Error fetching surveys:', error));
}

document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    const name = (body.getAttribute('data-user-name') || 'Khy').trim();
    const userNameSpan = document.getElementById('userName');

    if (userNameSpan) userNameSpan.textContent = name || 'Khy';

    const sidebarBtns = document.querySelectorAll('.sidebar-btn');
    sidebarBtns.forEach((btn, index) => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            sidebarBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const label = this.getAttribute('aria-label');
            if (label === 'Home') {
                goToHome();
            } else if (label === 'Survey List') {
                goToSurveyList();
            } else if (label === 'History' || label === 'Survey History') {
                goToHistory();
            } else if (label === 'Analytics') {
                goToAnalytics();
            } else if (label === 'Profile') {
                goToProfile();
            } else if (label === 'Settings') {
                goToSettings();
            } else if (label === 'Logout') {
                handleLogout();
            }
        });
    });

    // Animate stat cards on load
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 100}ms`;
    });

    // Add hover effects to survey cards
    const surveyCards = document.querySelectorAll('.survey-card');
    surveyCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.01)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Add click handlers for survey action buttons
    const surveyActionBtns = document.querySelectorAll('.survey-action-btn:not(.disabled):not(.completed)');
    surveyActionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const surveyTitle = this.closest('.survey-card').querySelector('.survey-title').textContent;
            showNotification(`Opening survey: ${surveyTitle}`, 'info');
        });
    });

    // Simulate stat counter animation
    const statValues = document.querySelectorAll('.stat-value');
    statValues.forEach(stat => {
        const finalValue = parseInt(stat.textContent) || 0;
        let currentValue = 0;
        const increment = Math.ceil(finalValue / 30);

        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= finalValue) {
                currentValue = finalValue;
                clearInterval(timer);
            }
            stat.textContent = currentValue;
        }, 50);
    });

    // Add ripple effect to buttons
    function createRipple(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');

        button.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // Apply ripple effect to all buttons
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', createRipple);
    });

    // Search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            // Add search functionality here
            console.log('Searching for:', searchTerm);
        });
    }

    // Month dropdown change handler
    const monthSelect = document.getElementById('month-select');
    if (monthSelect) {
        monthSelect.addEventListener('change', function(e) {
            console.log('Month changed to:', e.target.value);
            // Add analytics update logic here
        });
    }

    // Add loading states
    function showLoading(element) {
        element.style.opacity = '0.6';
        element.style.pointerEvents = 'none';
    }

    function hideLoading(element) {
        element.style.opacity = '1';
        element.style.pointerEvents = 'auto';
    }

    // Notification system
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 20px;
            border-radius: 12px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;

        switch(type) {
            case 'success':
                notification.style.background = 'var(--success)';
                break;
            case 'error':
                notification.style.background = 'var(--error)';
                break;
            case 'warning':
                notification.style.background = 'var(--warning)';
                break;
            default:
                notification.style.background = 'var(--info)';
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Welcome message
    setTimeout(() => {
        showNotification('Welcome to your dashboard! 🎉', 'success');
    }, 1000);

    // Make functions available globally if needed
    window.showLoading = showLoading;
    window.hideLoading = hideLoading;
    window.showNotification = showNotification;

    // Start polling for pending surveys
    fetchPendingSurveys(); // Initial fetch
    setInterval(fetchPendingSurveys, 10000); // Poll every 10 seconds
});
