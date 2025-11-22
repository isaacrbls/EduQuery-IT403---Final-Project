/**
 * EduQuery Teacher Dashboard JavaScript
 * Enhanced interactivity and functionality for the teacher dashboard
 */

// Navigation functions
function goToHome() {
    window.location.href = '/teacher/dashboard/';
}

function goToSurveyList() {
    window.location.href = '/surveys/';
}

function goToHistory() {
    window.location.href = '/surveys/history/';
}

function goToResponses() {
    window.location.href = '/responses/';
}

function goToAnalytics() {
    window.location.href = '/analytics/';
}

function goToProfile() {
    window.location.href = '/profile/';
}

function goToSettings() {
    window.location.href = '/settings/';
}

function handleLogout() {
    window.location.href = '/logout/';
}

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
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const label = this.getAttribute('aria-label');
            
            // Navigate immediately without visual changes that might interfere
            if (label === 'Home') {
                goToHome();
            } else if (label === 'Survey List') {
                goToSurveyList();
            } else if (label === 'History') {
                goToHistory();
            } else if (label === 'Responses') {
                goToResponses();
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
    // Get all stat cards and read their actual values
    const statElements = [
        'totalSurveys',
        'activeSurveys', 
        'pendingReviews',
        'completedSurveys'
    ];

    statElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            const targetValue = parseInt(element.textContent) || 0;
            animateValue(id, 0, targetValue, 1500);
        }
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
    // Edit buttons - Allow navigation to edit page
    const editBtns = document.querySelectorAll('.edit-btn');
    editBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            // Allow default action - navigate to edit page
            // The href attribute will handle the navigation
        });
    });

    // Delete buttons
    const deleteBtns = document.querySelectorAll('.delete-btn');
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const surveyId = this.getAttribute('data-survey-id');
            const surveyTitle = this.closest('.teacher-survey-card').querySelector('.survey-title').textContent;
            
            Modal.show({
                title: 'Delete Survey',
                message: `Are you sure you want to delete "${surveyTitle}"?`,
                type: 'danger',
                confirmText: 'Delete',
                onConfirm: () => {
                    showNotification('Survey deleted successfully', 'success');
                    this.closest('.teacher-survey-card').remove();
                }
            });
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
 * Update notification badge - Removed
 */
function updateNotificationBadge() {
    // Notifications removed
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
 * Show notification message - Removed
 */
function showNotification(message, type = 'info') {
    console.log('Notification:', message);
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

