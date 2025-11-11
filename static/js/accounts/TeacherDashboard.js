/**
 * EduQuery Teacher Dashboard JavaScript
 * Enhanced interactivity and functionality for the teacher dashboard
 */

// Main dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Set user name from Django context
    const body = document.body;
    const name = (body.getAttribute('data-user-name') || 'Khy').trim();
    const userNameSpan = document.getElementById('userName');

    if (userNameSpan) userNameSpan.textContent = name || 'Khy';

    // Initialize stats with animation
    initializeStats();

    // Add click handlers for sidebar buttons
    const sidebarBtns = document.querySelectorAll('.sidebar-btn');
    sidebarBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            sidebarBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });


    // Survey action buttons
    initializeSurveyActions();

    // Create survey button
    const createSurveyBtn = document.querySelector('.create-survey-btn');
    if (createSurveyBtn) {
        createSurveyBtn.addEventListener('click', function() {
            showNotification('Create Survey feature coming soon!', 'info');
        });
    }

    // Month dropdown change handler
    const monthSelect = document.getElementById('month-select');
    if (monthSelect) {
        monthSelect.addEventListener('change', function(e) {
            showNotification(`Analytics updated for ${e.target.options[e.target.selectedIndex].text}`, 'success');
        });
    }

    // Search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            // Add search functionality here
            console.log('Searching for:', searchTerm);
        });
    }

    // Add ripple effect to buttons
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', createRipple);
    });

    // Welcome message removed
});

/**
 * Initialize statistics with counter animation
 */
function initializeStats() {
    const stats = [
        { id: 'totalSurveys', value: 0 },
        { id: 'activeSurveys', value: 0 },
        { id: 'pendingReviews', value: 0 },
        { id: 'completedSurveys', value: 0 }
    ];

    stats.forEach(stat => {
        animateValue(stat.id, 0, stat.value, 1500);
    });

    // Animate stat cards on load
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 100}ms`;
    });
}

/**
 * Animate counter value
 */
function animateValue(id, start, end, duration) {
    const element = document.getElementById(id);
    if (!element) return;

    const range = end - start;
    const increment = range / (duration / 50);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.round(current);
    }, 50);
}


/**
 * Initialize survey action buttons
 */
function initializeSurveyActions() {
    // Edit buttons
    const editBtns = document.querySelectorAll('.edit-btn');
    editBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const surveyTitle = this.closest('.teacher-survey-card').querySelector('.survey-title').textContent;
            showNotification(`Editing survey: ${surveyTitle}`, 'info');
        });
    });

    // Delete buttons
    const deleteBtns = document.querySelectorAll('.delete-btn');
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const surveyId = this.getAttribute('data-survey-id');
            const surveyTitle = this.closest('.teacher-survey-card').querySelector('.survey-title').textContent;
            if (confirm(`Are you sure you want to delete "${surveyTitle}"?`)) {
                showNotification('Survey deleted successfully', 'success');
                this.closest('.teacher-survey-card').remove();
            }
        });
    });

    // View buttons
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const surveyTitle = this.closest('.teacher-survey-card').querySelector('.survey-title').textContent;
            showNotification(`Viewing results for: ${surveyTitle}`, 'info');
        });
    });

    // Add hover effects to survey cards
    const surveyCards = document.querySelectorAll('.teacher-survey-card');
    surveyCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

/**
 * Update notification badge
 */
function updateNotificationBadge() {
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        const currentCount = parseInt(badge.textContent) || 0;
        badge.textContent = currentCount + 1;
    }
}

/**
 * Create ripple effect on button click
 */
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

/**
 * Show notification message
 */
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
        z-index: 1001;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        max-width: 300px;
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

/**
 * Show loading state
 */
function showLoading(element) {
    element.style.opacity = '0.6';
    element.style.pointerEvents = 'none';
}

/**
 * Hide loading state
 */
function hideLoading(element) {
    element.style.opacity = '1';
    element.style.pointerEvents = 'auto';
}

// Make functions available globally
window.showNotification = showNotification;
window.showLoading = showLoading;
window.hideLoading = hideLoading;

