function goToHome() {
    window.location.href = '/student/dashboard/';
}

function goToSurveyList() {
    window.location.href = '/surveys/';
}

function goToHistory() {
    window.location.href = '/surveys/history/';
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

function goBack() {
    window.history.back();
}

let formProgress = 0;
const formData = {};

// Main initialization
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    setupEventListeners();
    setupFileUpload();
    setupStarRating();
    updateProgress();
    setupBackButtons();
});

function setupBackButtons() {
    const backBtns = document.querySelectorAll('.back-btn, .back-button');
    backBtns.forEach(btn => {
        btn.addEventListener('click', goToSurveyList);
    });
}

function initializeForm() {
    const body = document.body;
    const name = (body.getAttribute('data-user-name') || 'Khy').trim();
    const userNameSpan = document.getElementById('userName');

    if (userNameSpan) userNameSpan.textContent = name || 'Khy';

    const sidebarBtns = document.querySelectorAll('.sidebar-btn');
    sidebarBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            sidebarBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const label = this.getAttribute('aria-label');
            if (label === 'Home') {
                goToHome();
            } else if (label === 'Survey List') {
                goToSurveyList();
            } else if (label === 'Survey History') {
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

    // Character counter for textarea
    const feedbackTextarea = document.getElementById('feedback');
    const feedbackCounter = document.getElementById('feedback-count');

    if (feedbackTextarea && feedbackCounter) {
        feedbackTextarea.addEventListener('input', function() {
            const length = this.value.length;
            feedbackCounter.textContent = length;

            if (length > 450) {
                feedbackCounter.style.color = 'var(--warning)';
            } else if (length > 500) {
                feedbackCounter.style.color = 'var(--error)';
            } else {
                feedbackCounter.style.color = 'var(--gray-500)';
            }
        });
    }
}

function setupEventListeners() {
    const form = document.getElementById('surveyForm');

    // Form submission
    form.addEventListener('submit', handleFormSubmission);

    // Real-time validation
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => {
            if (input.classList.contains('error')) {
                validateField(input);
            }
            updateProgress();
        });
    });

    // Radio button change tracking
    const radioButtons = form.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', updateProgress);
    });

    // Checkbox change tracking
    const checkboxes = form.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateProgress);
    });

    // Save draft button
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveDraft);
    }

    // Modal handlers
    setupModalHandlers();

    // Add ripple effect to buttons
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', createRipple);
    });
}

function setupFileUpload() {
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('file_upload');
    const uploadedFilesContainer = document.getElementById('uploadedFiles');

    if (!fileUploadArea || !fileInput) return;

    // Click to upload
    fileUploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // Drag and drop
    fileUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUploadArea.classList.add('dragover');
    });

    fileUploadArea.addEventListener('dragleave', () => {
        fileUploadArea.classList.remove('dragover');
    });

    fileUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUploadArea.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    // File selection
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    function handleFiles(files) {
        Array.from(files).forEach(file => {
            if (validateFile(file)) {
                displayFile(file);
            }
        });
    }

    function validateFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (file.size > maxSize) {
            showNotification(`File "${file.name}" is too large. Maximum size is 10MB.`, 'error');
            return false;
        }

        if (!allowedTypes.includes(file.type)) {
            showNotification(`File type "${file.type}" is not supported.`, 'error');
            return false;
        }

        return true;
    }

    function displayFile(file) {
        const fileElement = document.createElement('div');
        fileElement.className = 'uploaded-file';
        fileElement.innerHTML = `
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
            </div>
            <button type="button" class="remove-file" onclick="removeFile(this)">
                <span class="material-icons">close</span>
            </button>
        `;
        uploadedFilesContainer.appendChild(fileElement);
        updateProgress();
    }

    // Make removeFile function globally available
    window.removeFile = function(button) {
        button.closest('.uploaded-file').remove();
        updateProgress();
    };
}

function setupStarRating() {
    const starRating = document.querySelector('.star-rating');
    const hiddenInput = document.getElementById('instructor_rating');

    if (!starRating || !hiddenInput) return;

    const stars = starRating.querySelectorAll('.star');

    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            const rating = index + 1;
            hiddenInput.value = rating;
            starRating.setAttribute('data-rating', rating);

            // Update star display
            stars.forEach((s, i) => {
                if (i < rating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });

            updateProgress();
        });

        star.addEventListener('mouseenter', () => {
            const hoverRating = index + 1;
            stars.forEach((s, i) => {
                if (i < hoverRating) {
                    s.style.color = '#fbbf24';
                } else {
                    s.style.color = '';
                }
            });
        });
    });

    starRating.addEventListener('mouseleave', () => {
        const currentRating = parseInt(starRating.getAttribute('data-rating')) || 0;
        stars.forEach((s, i) => {
            if (i < currentRating) {
                s.style.color = '#fbbf24';
            } else {
                s.style.color = '';
            }
        });
    });
}

function validateField(field) {
    const errorElement = document.getElementById(`${field.name}-error`);
    let isValid = true;
    let errorMessage = '';

    // Remove previous error styling
    field.classList.remove('error');
    if (errorElement) {
        errorElement.classList.remove('show');
    }

    // Required field validation
    if (field.hasAttribute('required')) {
        if (field.type === 'radio') {
            const radioGroup = document.querySelectorAll(`input[name="${field.name}"]`);
            const isChecked = Array.from(radioGroup).some(radio => radio.checked);
            if (!isChecked) {
                isValid = false;
                errorMessage = 'This field is required.';
            }
        } else if (!field.value.trim()) {
            isValid = false;
            errorMessage = 'This field is required.';
        }
    }

    // Email validation
    if (field.type === 'email' && field.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(field.value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address.';
        }
    }

    // Show error if validation failed
    if (!isValid) {
        field.classList.add('error');
        if (errorElement) {
            errorElement.textContent = errorMessage;
            errorElement.classList.add('show');
        }
    }

    return isValid;
}

function validateForm() {
    const form = document.getElementById('surveyForm');
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });

    // Validate star rating
    const starRating = document.getElementById('instructor_rating');
    if (starRating && starRating.hasAttribute('required') && !starRating.value) {
        isValid = false;
        const errorElement = document.getElementById('instructor_rating-error');
        if (errorElement) {
            errorElement.textContent = 'Please provide a rating.';
            errorElement.classList.add('show');
        }
    }

    return isValid;
}

function updateProgress() {
    const form = document.getElementById('surveyForm');
    if (!form) return;
    
    // Get all question groups
    const questionGroups = form.querySelectorAll('.question-group');
    const totalQuestions = questionGroups.length;
    
    if (totalQuestions === 0) return;
    
    let answeredQuestions = 0;
    
    questionGroups.forEach(group => {
        const questionId = group.getAttribute('data-question-id');
        if (!questionId) return;
        
        const isRequired = group.getAttribute('data-required') === 'true';
        
        // Check text inputs and textareas
        const textInput = group.querySelector('input[type="text"], textarea');
        if (textInput && textInput.value.trim()) {
            answeredQuestions++;
            return;
        }
        
        // Check radio buttons
        const radioButtons = group.querySelectorAll('input[type="radio"]');
        if (radioButtons.length > 0) {
            const isChecked = Array.from(radioButtons).some(radio => radio.checked);
            if (isChecked) {
                answeredQuestions++;
                return;
            }
        }
        
        // Check checkboxes
        const checkboxes = group.querySelectorAll('input[type="checkbox"]');
        if (checkboxes.length > 0) {
            const isChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);
            if (isChecked) {
                answeredQuestions++;
                return;
            }
        }
        
        // Check select dropdowns
        const select = group.querySelector('select');
        if (select && select.value) {
            answeredQuestions++;
            return;
        }
        
        // If not required and not answered, don't count as incomplete
        if (!isRequired) {
            answeredQuestions++;
        }
    });
    
    const progress = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
    
    // Update progress bar
    const progressBar = document.getElementById('progressBar');
    const progressPercent = document.getElementById('progressPercent');
    
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
    if (progressPercent) {
        progressPercent.textContent = progress;
    }
    
    formProgress = progress;
}

function setupModalHandlers() {
    const modal = document.getElementById('confirmModal');
    const closeBtn = document.getElementById('closeConfirmModal');
    const cancelBtn = document.getElementById('cancelSubmit');
    const confirmBtn = document.getElementById('confirmSubmit');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }

    if (confirmBtn) {
        confirmBtn.addEventListener('click', processFormSubmission);
    }

    // Close modal when clicking overlay
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('show')) {
            closeModal();
        }
    });
}

function handleFormSubmission(e) {
    e.preventDefault();

    if (!validateForm()) {
        showNotification('Please fill in all required fields before submitting.', 'error');
        return;
    }

    // Show confirmation modal
    const modal = document.getElementById('confirmModal');
    if (modal) {
        modal.classList.add('show');
    }
}

function closeModal() {
    const modal = document.getElementById('confirmModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

function processFormSubmission() {
    closeModal();

    // Show loading state
    const submitBtn = document.getElementById('submitBtn');
    const originalContent = submitBtn.innerHTML;

    submitBtn.innerHTML = '<span class="material-icons">hourglass_empty</span> Submitting...';
    submitBtn.disabled = true;

    // Collect form data
    const form = document.getElementById('surveyForm');
    const formData = new FormData(form);

    // Add star rating if not already included
    const starRating = document.getElementById('instructor_rating');
    if (starRating && starRating.value) {
        formData.set('instructor_rating', starRating.value);
    }

    // Simulate form submission
    setTimeout(() => {
        // In real implementation, this would be an AJAX call to the server
        console.log('Form submitted successfully');

        // Store submission data for congratulations page
        localStorage.setItem('surveySubmissionData', JSON.stringify({
            timestamp: new Date().toISOString(),
            surveyTitle: 'IT403 Final Project Evaluation',
            timeSpent: calculateTimeSpent()
        }));

        // Redirect to congratulations page - use Django URL if response_id is available
        const responseId = document.body.getAttribute('data-response-id');
        if (responseId) {
            window.location.href = `/surveys/congratulations/${responseId}/`;
        } else {
            window.location.href = '/surveys/history/';
        }

    }, 2000);
}

function saveDraft() {
    const saveBtn = document.getElementById('saveBtn');
    const originalContent = saveBtn.innerHTML;

    saveBtn.innerHTML = '<span class="material-icons">hourglass_empty</span> Saving...';
    saveBtn.disabled = true;

    // Collect form data
    const form = document.getElementById('surveyForm');
    const formData = new FormData(form);

    // Convert to object for localStorage
    const draftData = {};
    for (let [key, value] of formData.entries()) {
        draftData[key] = value;
    }

    // Add star rating
    const starRating = document.getElementById('instructor_rating');
    if (starRating && starRating.value) {
        draftData.instructor_rating = starRating.value;
    }

    setTimeout(() => {
        localStorage.setItem('surveyDraft', JSON.stringify({
            ...draftData,
            savedAt: new Date().toISOString(),
            progress: formProgress
        }));

        saveBtn.innerHTML = '<span class="material-icons">check</span> Saved!';

        setTimeout(() => {
            saveBtn.innerHTML = originalContent;
            saveBtn.disabled = false;
        }, 2000);

        showNotification('Draft saved successfully!', 'success');
    }, 1000);
}

function calculateTimeSpent() {
    // In real implementation, this would track actual time spent
    return Math.floor(Math.random() * 10) + 5; // Random between 5-15 minutes
}

// Utility functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

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

// Load draft on page load if available
document.addEventListener('DOMContentLoaded', function() {
    const savedDraft = localStorage.getItem('surveyDraft');
    if (savedDraft) {
        try {
            const draftData = JSON.parse(savedDraft);

            // Show restore notification
            const restoreNotification = document.createElement('div');
            restoreNotification.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span>Found saved draft from ${new Date(draftData.savedAt).toLocaleDateString()}</span>
                    <button onclick="restoreDraft()" style="background: white; color: #2F5E53; border: none; padding: 4px 12px; border-radius: 6px; font-size: 12px; cursor: pointer;">Restore</button>
                    <button onclick="dismissDraft()" style="background: transparent; color: white; border: 1px solid white; padding: 4px 12px; border-radius: 6px; font-size: 12px; cursor: pointer;">Dismiss</button>
                </div>
            `;
            restoreNotification.className = 'notification notification-info';
            restoreNotification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 16px 20px;
                border-radius: 12px;
                color: white;
                font-weight: 500;
                z-index: 1000;
                background: linear-gradient(135deg, #3b82f6, #2563eb);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
            `;

            document.body.appendChild(restoreNotification);

            // Auto-dismiss after 10 seconds
            setTimeout(() => {
                if (document.body.contains(restoreNotification)) {
                    restoreNotification.remove();
                }
            }, 10000);

        } catch (e) {
            console.error('Error parsing saved draft:', e);
            localStorage.removeItem('surveyDraft');
        }
    }
});

// Global functions for draft management
window.restoreDraft = function() {
    const savedDraft = localStorage.getItem('surveyDraft');
    if (savedDraft) {
        try {
            const draftData = JSON.parse(savedDraft);

            // Restore form values
            Object.keys(draftData).forEach(key => {
                if (key === 'savedAt' || key === 'progress') return;

                const field = document.querySelector(`[name="${key}"]`);
                if (field) {
                    if (field.type === 'radio') {
                        const radio = document.querySelector(`[name="${key}"][value="${draftData[key]}"]`);
                        if (radio) radio.checked = true;
                    } else if (field.type === 'checkbox') {
                        field.checked = draftData[key] === 'on';
                    } else {
                        field.value = draftData[key];
                    }
                }
            });

            // Restore star rating
            if (draftData.instructor_rating) {
                const starRating = document.querySelector('.star-rating');
                const hiddenInput = document.getElementById('instructor_rating');
                const stars = starRating.querySelectorAll('.star');

                hiddenInput.value = draftData.instructor_rating;
                starRating.setAttribute('data-rating', draftData.instructor_rating);

                stars.forEach((star, index) => {
                    if (index < parseInt(draftData.instructor_rating)) {
                        star.classList.add('active');
                    }
                });
            }

            updateProgress();
            showNotification('Draft restored successfully!', 'success');

        } catch (e) {
            console.error('Error restoring draft:', e);
            showNotification('Error restoring draft', 'error');
        }
    }

    // Remove notification
    document.querySelector('.notification').remove();
};

window.dismissDraft = function() {
    localStorage.removeItem('surveyDraft');
    document.querySelector('.notification').remove();
    showNotification('Draft dismissed', 'info');
};
