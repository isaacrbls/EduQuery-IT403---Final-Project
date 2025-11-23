/**
 * EduQuery Teacher Dashboard JavaScript
 * Enhanced interactivity and functionality for the teacher dashboard
 */

// Helper function to get CSRF token
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
            e.preventDefault();
            
            const surveyId = this.getAttribute('data-survey-id');
            const surveyCard = this.closest('.teacher-survey-card');
            const surveyTitle = surveyCard.querySelector('.survey-title').textContent;
            
            Modal.show({
                title: 'Delete Survey',
                message: `Are you sure you want to delete "${surveyTitle}"? This action cannot be undone.`,
                type: 'danger',
                confirmText: 'Delete',
                onConfirm: () => {
                    const csrfToken = getCookie('csrftoken');
                    
                    fetch(`/surveys/${surveyId}/delete/`, {
                        method: 'POST',
                        headers: {
                            'X-CSRFToken': csrfToken,
                            'Content-Type': 'application/json'
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            showNotification('Survey deleted successfully', 'success');
                            surveyCard.remove();
                            
                            // Update stats if needed
                            const totalSurveysEl = document.getElementById('totalSurveys');
                            if (totalSurveysEl) {
                                totalSurveysEl.textContent = Math.max(0, parseInt(totalSurveysEl.textContent) - 1);
                            }
                        } else {
                            showNotification(data.message || 'Error deleting survey', 'error');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showNotification('An error occurred while deleting the survey', 'error');
                    });
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

/* ============================================
   Real-time Updates
   ============================================ */

function formatDate(dateString) {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function renderTeacherSurveyCard(survey) {
    const statusClass = survey.status === 'published' ? 'active' : 'completed';
    const iconClass = survey.status === 'published' ? '' : 'completed';
    const iconName = survey.status === 'published' ? 'assignment' : 'assignment_turned_in';
    const statusText = survey.status === 'published' ? 'Published' : (survey.status === 'draft' ? 'Draft' : 'Closed');
    
    return `
        <div class="survey-card teacher-survey-card">
            <div class="survey-card-main">
                <div class="survey-icon ${iconClass}">
                    <span class="material-icons">${iconName}</span>
                </div>
                <div class="survey-info">
                    <h3 class="survey-title">${survey.title}</h3>
                    <div class="survey-meta">
                        <span class="date-info">
                            <span class="material-icons">event</span>
                            Created: ${formatDate(survey.created_at)}
                        </span>
                        <span class="due-info">
                            <span class="material-icons">schedule</span>
                            ${formatDate(survey.due_date)}
                        </span>
                    </div>
                </div>
            </div>
            <div class="survey-middle">
                <div class="response-info">
                    <span class="material-icons">people</span>
                    <span class="response-count">Responses: <strong>${survey.response_count || 0}</strong></span>
                </div>
                <div class="survey-status-badge ${statusClass}">
                    <span class="status-dot"></span>
                    Status: ${statusText}
                </div>
            </div>
            <div class="survey-actions">
                <a href="/surveys/${survey.id}/edit/" class="survey-action-btn edit-btn">
                    <span class="material-icons">edit</span>
                    Edit
                </a>
                <button class="survey-action-btn delete-btn" data-survey-id="${survey.id}">
                    <span class="material-icons">delete</span>
                    Delete
                </button>
            </div>
        </div>
    `;
}

function fetchTeacherSurveys() {
    fetch('/api/surveys/my_surveys/')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('teacher-survey-list');
            if (!container) return;

            // Check if we have surveys
            if (data && data.length > 0) {
                const html = data.map(survey => renderTeacherSurveyCard(survey)).join('');
                
                // Simple check to avoid unnecessary DOM updates
                // In a real app, we'd use a virtual DOM or more sophisticated diffing
                // Here we just check if the HTML string length is significantly different
                // or just update it periodically.
                
                // Since we want "realtime" response counts, we should update.
                // But replacing innerHTML kills event listeners.
                // So we must re-initialize them.
                
                container.innerHTML = html;
                initializeSurveyActions();
                
                // Update stats
                const totalSurveysEl = document.getElementById('totalSurveys');
                if (totalSurveysEl) totalSurveysEl.textContent = data.length;
                
                const activeSurveysEl = document.getElementById('activeSurveys');
                if (activeSurveysEl) {
                    const activeCount = data.filter(s => s.status === 'published').length;
                    activeSurveysEl.textContent = activeCount;
                }
                
                const pendingReviewsEl = document.getElementById('pendingReviews');
                if (pendingReviewsEl) {
                    const draftCount = data.filter(s => s.status === 'draft').length;
                    pendingReviewsEl.textContent = draftCount;
                }
                
                const completedSurveysEl = document.getElementById('completedSurveys');
                if (completedSurveysEl) {
                    const totalResponses = data.reduce((sum, s) => sum + (s.response_count || 0), 0);
                    completedSurveysEl.textContent = totalResponses;
                }

            } else {
                container.innerHTML = `
                    <div class="empty-state">
                        <span class="material-icons">assignment</span>
                        <p>No surveys created yet</p>
                        <a href="/surveys/create/" class="create-survey-btn">
                            <span class="material-icons">add</span>
                            Create Your First Survey
                        </a>
                    </div>
                `;
            }
        })
        .catch(error => console.error('Error fetching surveys:', error));
}

// Start polling
setInterval(fetchTeacherSurveys, 10000); // Poll every 10 seconds

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

