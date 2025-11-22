/**
 * EduQuery Teacher Survey List Dashboard JavaScript
 * Enhanced functionality for survey management and creation
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
    window.location.href = '/accounts/logout/';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeSidebarNavigation();
});

function initializeSidebarNavigation() {
    const sidebarBtns = document.querySelectorAll('.sidebar-btn');
    sidebarBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const label = this.getAttribute('aria-label');
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
}

// Global Variables
let questionCounter = 1;
let surveys = [];

// Utility Functions
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

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

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
        z-index: 2000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    `;

    switch(type) {
        case 'success':
            notification.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
            break;
        case 'warning':
            notification.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
            break;
        default:
            notification.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
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

// Navigation Functions
function goToHome() {
    window.location.href = '/teacher/dashboard/';
}

// Modal Functions
function openCreateSurveyModal() {
    const createUrl = document.body.getAttribute('data-create-survey-url');
    if (createUrl) {
        window.location.href = createUrl;
        return;
    }

    const modal = document.getElementById('createSurveyModal');
    if (!modal) {
        console.warn('Create survey modal not found and no redirect URL provided.');
        return;
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCreateSurveyModal() {
    const modal = document.getElementById('createSurveyModal');
    if (!modal) {
        return;
    }

    modal.classList.remove('active');
    document.body.style.overflow = 'auto';

    // Reset form
    const createForm = document.getElementById('createSurveyForm');
    if (!createForm) {
        return;
    }
    createForm.reset();

    // Reset questions to just one
    const questionsContainer = document.getElementById('questions-container');
    if (!questionsContainer) {
        return;
    }
    questionsContainer.innerHTML = `
        <div class="question-item" data-question-id="1">
            <div class="question-header">
                <span class="question-number">Question 1</span>
                <button type="button" class="remove-question-btn" onclick="removeQuestion(1)">
                    <span class="material-icons">close</span>
                </button>
            </div>
            <div class="form-group">
                <label for="question-1-text" class="visually-hidden">Question 1 text</label>
                <input type="text" id="question-1-text" name="question-1-text" placeholder="Enter your question" required>
            </div>
            <div class="form-group">
                <label for="question-1-type" class="visually-hidden">Question 1 type</label>
                <select id="question-1-type" name="question-1-type" onchange="handleQuestionTypeChange(1, this.value)">
                    <option value="text">Text Answer</option>
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="rating">Rating Scale</option>
                    <option value="file">File Upload</option>
                </select>
            </div>
            <div class="question-options" id="question-1-options"></div>
        </div>
    `;
    questionCounter = 1;
}

// Question Management
function addQuestion() {
    questionCounter++;
    const questionsContainer = document.getElementById('questions-container');

    const questionItem = document.createElement('div');
    questionItem.className = 'question-item';
    questionItem.setAttribute('data-question-id', questionCounter);

    questionItem.innerHTML = `
        <div class="question-header">
            <span class="question-number">Question ${questionCounter}</span>
            <button type="button" class="remove-question-btn" onclick="removeQuestion(${questionCounter})">
                <span class="material-icons">close</span>
            </button>
        </div>
        <div class="form-group">
            <label for="question-${questionCounter}-text" class="visually-hidden">Question ${questionCounter} text</label>
            <input type="text" id="question-${questionCounter}-text" name="question-${questionCounter}-text" placeholder="Enter your question" required>
        </div>
        <div class="form-group">
            <label for="question-${questionCounter}-type" class="visually-hidden">Question ${questionCounter} type</label>
            <select id="question-${questionCounter}-type" name="question-${questionCounter}-type" onchange="handleQuestionTypeChange(${questionCounter}, this.value)">
                <option value="text">Text Answer</option>
                <option value="multiple-choice">Multiple Choice</option>
                <option value="rating">Rating Scale</option>
                <option value="file">File Upload</option>
            </select>
        </div>
        <div class="question-options" id="question-${questionCounter}-options"></div>
    `;

    questionsContainer.appendChild(questionItem);
    showNotification('Question added successfully!', 'success');
}

function removeQuestion(questionId) {
    const questionItem = document.querySelector(`[data-question-id="${questionId}"]`);
    if (questionItem) {
        const questionsContainer = document.getElementById('questions-container');
        if (questionsContainer.children.length > 1) {
            questionItem.remove();
            showNotification('Question removed', 'info');
            updateQuestionNumbers();
        } else {
            showNotification('You must have at least one question', 'warning');
        }
    }
}

function updateQuestionNumbers() {
    const questionItems = document.querySelectorAll('.question-item');
    questionItems.forEach((item, index) => {
        const questionNumber = item.querySelector('.question-number');
        questionNumber.textContent = `Question ${index + 1}`;
    });
}

function handleQuestionTypeChange(questionId, type) {
    const optionsContainer = document.getElementById(`question-${questionId}-options`);

    optionsContainer.innerHTML = '';

    if (type === 'multiple-choice') {
        optionsContainer.innerHTML = `
            <div class="form-group">
                <label>Options (one per line)</label>
                <textarea name="question-${questionId}-options" rows="4" placeholder="Option 1\nOption 2\nOption 3\nOption 4" required></textarea>
            </div>
        `;
    } else if (type === 'rating') {
        optionsContainer.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label>Min Value</label>
                    <input type="number" name="question-${questionId}-min" value="1" min="0" required>
                </div>
                <div class="form-group">
                    <label>Max Value</label>
                    <input type="number" name="question-${questionId}-max" value="5" min="1" required>
                </div>
            </div>
        `;
    }
}

// Survey Actions
function editSurvey(surveyId) {
    showNotification('Opening survey editor...', 'info');
    // In a real application, this would navigate to an edit page
    setTimeout(() => {
        showNotification('Edit functionality will be implemented soon!', 'warning');
    }, 1000);
}

function deleteSurvey(surveyId) {
    Modal.show({
        title: 'Delete Survey',
        message: 'Are you sure you want to delete this survey? This action cannot be undone.',
        type: 'danger',
        confirmText: 'Delete',
        onConfirm: () => {
            showNotification('Survey deleted successfully!', 'success');
            // In a real application, this would delete from the database
            setTimeout(() => {
                // Find the survey item by its onclick attribute
                const allSurveys = document.querySelectorAll('.survey-item');
                allSurveys.forEach(item => {
                    const deleteBtn = item.querySelector('.delete-btn');
                    if (deleteBtn && deleteBtn.getAttribute('onclick')?.includes(surveyId)) {
                        item.style.opacity = '0';
                        item.style.transform = 'translateX(-20px)';
                        setTimeout(() => {
                            item.remove();
                            updateResultsCount();
                        }, 300);
                    }
                });
            }, 500);
        }
    });
}

function publishSurvey(surveyId) {
    Modal.show({
        title: 'Publish Survey',
        message: 'Are you sure you want to publish this survey? Students will be able to access it.',
        type: 'info',
        confirmText: 'Publish',
        onConfirm: () => {
            showNotification('Survey published successfully!', 'success');
            // In a real application, this would update the database
            setTimeout(() => {
                // Update the survey card status
                const surveyCard = document.querySelector(`[data-survey-id="${surveyId}"]`);
                if (surveyCard) {
                    surveyCard.classList.remove('draft');
                    surveyCard.classList.add('active');

                    const badge = surveyCard.querySelector('.survey-status-badge');
                    badge.className = 'survey-status-badge active';
                badge.innerHTML = '<span class="status-dot"></span>ACTIVE';

                const icon = surveyCard.querySelector('.survey-icon');
                icon.classList.remove('draft');
                icon.innerHTML = '<span class="material-icons">assignment</span>';

                // Update action buttons
                const actionButtons = surveyCard.querySelector('.action-buttons');
                actionButtons.innerHTML = `
                    <button class="survey-action-btn edit-btn" onclick="editSurvey('${surveyId}')">
                        <span class="material-icons">edit</span>
                        Edit
                    </button>
                    <button class="survey-action-btn delete-btn" onclick="deleteSurvey('${surveyId}')">
                        <span class="material-icons">delete</span>
                        Delete
                    </button>
                `;
            }
        }, 500);
    }
}

function viewResults(surveyId) {
    showNotification('Loading survey results...', 'info');
    // In a real application, this would navigate to a results page
    setTimeout(() => {
        showNotification('Results view will be implemented soon!', 'warning');
    }, 1000);
}

function saveDraft() {
    const form = document.getElementById('createSurveyForm');
    const formData = new FormData(form);

    const title = formData.get('title');

    if (!title) {
        showNotification('Please enter a survey title', 'warning');
        return;
    }

    showNotification('Survey saved as draft!', 'success');

    // In a real application, this would save to the database
    setTimeout(() => {
        closeCreateSurveyModal();
    }, 1000);
}

// Form Submission
function handleFormSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    // Validate required fields
    const title = formData.get('title');
    const course = formData.get('course');
    const section = formData.get('section');
    const dueDate = formData.get('due-date');

    if (!title || !course || !section || !dueDate) {
        showNotification('Please fill in all required fields', 'warning');
        return;
    }

    // Get all questions
    const questions = [];
    const questionItems = document.querySelectorAll('.question-item');

    for (let item of questionItems) {
        const questionId = item.getAttribute('data-question-id');
        const questionText = formData.get(`question-${questionId}-text`);
        const questionType = formData.get(`question-${questionId}-type`);

        if (!questionText) {
            showNotification(`Please fill in Question ${questionId}`, 'warning');
            return;
        }

        questions.push({
            text: questionText,
            type: questionType
        });
    }

    showNotification('Publishing survey...', 'info');

    // Simulate API call
    setTimeout(() => {
        showNotification('Survey published successfully! 🎉', 'success');
        closeCreateSurveyModal();

        // In a real application, this would add to the database and refresh the list
    }, 1500);
}

// Filter and Sort Functions
function filterSurveys() {
    const statusFilter = document.getElementById('status-filter').value;
    const surveyItems = document.querySelectorAll('.survey-item');

    let visibleCount = 0;

    surveyItems.forEach(item => {
        const status = item.getAttribute('data-status');

        if (statusFilter === 'all' || status === statusFilter) {
            item.style.display = '';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });

    updateResultsCount(visibleCount);
}

function sortSurveys() {
    const sortValue = document.getElementById('sort-select').value;
    const container = document.getElementById('surveys-container');
    const items = Array.from(container.querySelectorAll('.survey-item'));

    items.sort((a, b) => {
        switch(sortValue) {
            case 'due-date':
                return new Date(a.getAttribute('data-due')) - new Date(b.getAttribute('data-due'));
            case 'created-date':
                return new Date(b.getAttribute('data-due')) - new Date(a.getAttribute('data-due'));
            case 'title':
                const titleA = a.querySelector('.survey-title').textContent;
                const titleB = b.querySelector('.survey-title').textContent;
                return titleA.localeCompare(titleB);
            case 'responses':
                const responsesTextA = a.querySelector('.stat-chip span:last-child')?.textContent || '0 Responses';
                const responsesTextB = b.querySelector('.stat-chip span:last-child')?.textContent || '0 Responses';
                const responsesA = parseInt(responsesTextA);
                const responsesB = parseInt(responsesTextB);
                return responsesB - responsesA;
            default:
                return 0;
        }
    });

    // Re-append sorted items
    items.forEach(item => container.appendChild(item));

    showNotification(`Sorted by ${sortValue}`, 'info');
}

function updateResultsCount(count = null) {
    const resultsCount = document.getElementById('results-count');
    if (count === null) {
        const visibleItems = document.querySelectorAll('.survey-item:not([style*="display: none"])').length;
        const allItems = document.querySelectorAll('.survey-item').length;
        count = visibleItems > 0 ? visibleItems : allItems;
    }
    resultsCount.textContent = `Showing ${count} of ${document.querySelectorAll('.survey-item').length} surveys`;
}

// Search Functionality
const searchInput = document.getElementById('search-input');
if (searchInput) {
    searchInput.addEventListener('input', debounce(function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const surveyItems = document.querySelectorAll('.survey-item');

        let visibleCount = 0;

        surveyItems.forEach(item => {
            const title = item.querySelector('.survey-title').textContent.toLowerCase();
            const statusFilter = document.getElementById('status-filter').value;
            const itemStatus = item.getAttribute('data-status');

            const matchesSearch = title.includes(searchTerm);
            const matchesFilter = statusFilter === 'all' || itemStatus === statusFilter;

            if (matchesSearch && matchesFilter) {
                item.style.display = '';
                visibleCount++;
            } else {
                item.style.display = 'none';
            }
        });

        updateResultsCount(visibleCount);
    }, 300));
}

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Set user name from Django context
    const body = document.body;
    const name = (body.getAttribute('data-user-name') || 'Khy').trim();
    const userNameSpan = document.getElementById('userName');

    if (userNameSpan) userNameSpan.textContent = name || 'Khy';

    // Set user initial in avatar
    const userInitial = document.getElementById('userInitial');
    if (userInitial && name) {
        userInitial.textContent = name.charAt(0).toUpperCase();
    }

    // Setup event listeners
    setupEventListeners();

    // Initialize results count
    updateResultsCount();

    // Add ripple effect to buttons
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', createRipple);
    });

    // Welcome message
    setTimeout(() => {
        showNotification('Welcome to Survey Management! 📝', 'success');
    }, 1000);
});

function setupEventListeners() {
    // Filter and sort
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', filterSurveys);
    }

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', sortSurveys);
    }

    // Form submission
    const createSurveyForm = document.getElementById('createSurveyForm');
    if (createSurveyForm) {
        createSurveyForm.addEventListener('submit', handleFormSubmit);
    }

    // Close modal on outside click
    const modal = document.getElementById('createSurveyModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeCreateSurveyModal();
            }
        });
    }

    // Sidebar buttons
    const sidebarBtns = document.querySelectorAll('.sidebar-btn');
    sidebarBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (!this.classList.contains('logout-btn')) {
                sidebarBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            }
            
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
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape key to close modal
    if (e.key === 'Escape') {
        const modal = document.getElementById('createSurveyModal');
        if (modal && modal.classList.contains('active')) {
            closeCreateSurveyModal();
        }
    }

    // Ctrl/Cmd + K to open create survey
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openCreateSurveyModal();
    }
});

// Export functions for use in HTML
window.goToHome = goToHome;
window.openCreateSurveyModal = openCreateSurveyModal;
window.closeCreateSurveyModal = closeCreateSurveyModal;
window.addQuestion = addQuestion;
window.removeQuestion = removeQuestion;
window.handleQuestionTypeChange = handleQuestionTypeChange;
window.editSurvey = editSurvey;
window.deleteSurvey = deleteSurvey;
window.publishSurvey = publishSurvey;
window.viewResults = viewResults;
window.saveDraft = saveDraft;

