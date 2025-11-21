/**
 * EduQuery Teacher Survey Form JavaScript
 * Create and manage surveys
 */

// Navigation functions
function goToHome() {
    window.location.href = '/teacher/dashboard/';
}

function goToSurveyList() {
    window.location.href = '/surveys/builder/';
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
    window.location.href = '/accounts/logout/';
}

function goBack() {
    window.history.back();
}

// Survey data
let questions = [];
let questionIdCounter = 1;

// Main initialization
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    setupEventListeners();
});

function initializeForm() {
    // Set user name from Django contefunction saveDraft() {
    const surveyData = collectFormData();
    surveyData.status = 'draft';

    console.log('Saving draft:', surveyData);

    Modal.alert({
        title: 'Success',
        message: 'Survey saved as draft successfully!',
        type: 'success',
        icon: 'success'
    });

    localStorage.setItem('surveyDraft', JSON.stringify(surveyData));
}

function publishSurvey() {y = document.body;
    const name = (body.getAttribute('data-user-name') || 'Teacher').trim();
    const userNameSpan = document.getElementById('userName');

    if (userNameSpan) userNameSpan.textContent = name || 'Teacher';

    // Add sidebar functionality
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

    // Character counter for description
    const descriptionTextarea = document.getElementById('surveyDescription');
    const descriptionCounter = document.getElementById('description-count');

    if (descriptionTextarea && descriptionCounter) {
        descriptionTextarea.addEventListener('input', function() {
            const length = this.value.length;
            descriptionCounter.textContent = length;

            if (length > 450) {
                descriptionCounter.style.color = 'var(--warning)';
            } else if (length > 500) {
                descriptionCounter.style.color = 'var(--error)';
                this.value = this.value.substring(0, 500);
            } else {
                descriptionCounter.style.color = 'var(--gray-500)';
            }
        });
    }

    // Set minimum date for due date
    const dueDateInput = document.getElementById('dueDate');
    if (dueDateInput) {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        dueDateInput.min = now.toISOString().slice(0, 16);
    }

    // Section color change
    const sectionSelect = document.getElementById('section');
    if (sectionSelect) {
            sectionSelect.addEventListener('change', updateFormColorFromSelect);
    }

    // Color swatch buttons
    setupColorSwatches();
}

function setupColorSwatches() {
    const dropdownBtn = document.getElementById('themeDropdownBtn');
    const dropdownMenu = document.getElementById('themeDropdownMenu');
    const themeOptions = document.querySelectorAll('.theme-option');

    // Toggle dropdown
    if (dropdownBtn) {
        dropdownBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownBtn.classList.toggle('active');
            dropdownMenu.classList.toggle('active');
        });
    }

    // Handle theme selection
    themeOptions.forEach(option => {
        option.addEventListener('click', function() {
            const section = this.getAttribute('data-section');

            // Remove active class from all theme radios
            document.querySelectorAll('.theme-radio').forEach(r => r.classList.remove('active'));

            // Add active class to selected theme radio
            const selectedRadio = this.querySelector('.theme-radio');
            if (selectedRadio) {
                selectedRadio.classList.add('active');
            }

            // Update form color
            updateFormColorManual(section);

            // Optionally sync with section dropdown
            const sectionSelect = document.getElementById('section');
            if (sectionSelect && section !== 'default') {
                sectionSelect.value = section.toUpperCase();
            }

            // Close dropdown
            dropdownBtn.classList.remove('active');
            dropdownMenu.classList.remove('active');
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (dropdownMenu && !dropdownMenu.contains(e.target) && e.target !== dropdownBtn) {
            dropdownBtn.classList.remove('active');
            dropdownMenu.classList.remove('active');
        }
    });
}

function updateFormColorFromSelect() {
    const sectionSelect = document.getElementById('section');
    const formContainer = document.querySelector('.survey-form-container');

    if (!sectionSelect || !formContainer) return;

    const selectedSection = sectionSelect.value.toLowerCase();

    // Update color swatches active state
    updateColorSwatchActive(selectedSection);

    // Update form color
    updateFormColorManual(selectedSection);
}

function updateColorSwatchActive(section) {
    const themeOptions = document.querySelectorAll('.theme-option');

    themeOptions.forEach(option => {
        const optionSection = option.getAttribute('data-section');
        const themeRadio = option.querySelector('.theme-radio');

        if (optionSection === section && themeRadio) {
            themeRadio.classList.add('active');
        } else if (themeRadio) {
            themeRadio.classList.remove('active');
        }
    });
}

function updateFormColorManual(section) {
    const formContainer = document.querySelector('.survey-form-container');

    if (!formContainer) return;

    // Remove all section classes
    formContainer.classList.remove('section-a', 'section-b', 'section-c', 'section-d', 'section-all');

    // Add the appropriate section class
    if (section === 'a') {
        formContainer.classList.add('section-a');
    } else if (section === 'b') {
        formContainer.classList.add('section-b');
    } else if (section === 'c') {
        formContainer.classList.add('section-c');
    } else if (section === 'd') {
        formContainer.classList.add('section-d');
    } else if (section === 'all') {
        formContainer.classList.add('section-all');
    }
    // 'default' or empty means no class, shows default white background
}


function setupEventListeners() {
    const form = document.getElementById('surveyForm');

    // Add question button
    const addQuestionBtn = document.getElementById('addQuestionBtn');
    if (addQuestionBtn) {
        addQuestionBtn.addEventListener('click', openAddQuestionModal);
    }

    // Save draft button
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', saveDraft);
    }

    // Publish button
    const publishBtn = document.getElementById('publishBtn');
    if (publishBtn) {
        publishBtn.addEventListener('click', showPublishConfirmation);
    }

    // Modal event listeners
    setupModalListeners();

    // Real-time validation
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => {
            if (input.classList.contains('error')) {
                validateField(input);
            }
        });
    });
}

function setupModalListeners() {
    // Add Question Modal
    const addQuestionModal = document.getElementById('addQuestionModal');
    const closeQuestionModal = document.getElementById('closeQuestionModal');
    const cancelQuestionBtn = document.getElementById('cancelQuestionBtn');
    const saveQuestionBtn = document.getElementById('saveQuestionBtn');

    if (closeQuestionModal) {
        closeQuestionModal.addEventListener('click', closeAddQuestionModal);
    }

    if (cancelQuestionBtn) {
        cancelQuestionBtn.addEventListener('click', closeAddQuestionModal);
    }

    if (saveQuestionBtn) {
        saveQuestionBtn.addEventListener('click', addQuestion);
    }

    // Question type change
    const questionTypeSelect = document.getElementById('questionType');
    if (questionTypeSelect) {
        questionTypeSelect.addEventListener('change', handleQuestionTypeChange);
    }

    // Add option button
    const addOptionBtn = document.getElementById('addOptionBtn');
    if (addOptionBtn) {
        addOptionBtn.addEventListener('click', addOption);
    }

    // Confirmation Modal
    const confirmModal = document.getElementById('confirmModal');
    const closeConfirmModal = document.getElementById('closeConfirmModal');
    const cancelPublish = document.getElementById('cancelPublish');
    const confirmPublish = document.getElementById('confirmPublish');

    if (closeConfirmModal) {
        closeConfirmModal.addEventListener('click', closePublishConfirmation);
    }

    if (cancelPublish) {
        cancelPublish.addEventListener('click', closePublishConfirmation);
    }

    if (confirmPublish) {
        confirmPublish.addEventListener('click', publishSurvey);
    }

    // Close modal on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });
}

// Modal Functions
function openAddQuestionModal() {
    const modal = document.getElementById('addQuestionModal');
    modal.classList.add('active');
    resetQuestionModal();
}

function closeAddQuestionModal() {
    const modal = document.getElementById('addQuestionModal');
    modal.classList.remove('active');
    resetQuestionModal();
}

function resetQuestionModal() {
    document.getElementById('questionType').value = 'text';
    document.getElementById('questionText').value = '';
    document.getElementById('questionRequired').checked = false;
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = `
        <div class="option-input-group">
            <input type="text" class="form-input option-input" placeholder="Option 1">
            <button type="button" class="btn-icon remove-option" style="display: none;">
                <span class="material-icons">close</span>
            </button>
        </div>
    `;
    document.getElementById('optionsGroup').style.display = 'none';
}

function handleQuestionTypeChange() {
    const questionType = document.getElementById('questionType').value;
    const optionsGroup = document.getElementById('optionsGroup');

    if (questionType === 'radio' || questionType === 'checkbox') {
        optionsGroup.style.display = 'block';
    } else {
        optionsGroup.style.display = 'none';
    }
}

function addOption() {
    const optionsContainer = document.getElementById('optionsContainer');
    const optionCount = optionsContainer.querySelectorAll('.option-input-group').length;

    const optionGroup = document.createElement('div');
    optionGroup.className = 'option-input-group';
    optionGroup.innerHTML = `
        <input type="text" class="form-input option-input" placeholder="Option ${optionCount + 1}">
        <button type="button" class="btn-icon remove-option">
            <span class="material-icons">close</span>
        </button>
    `;

    optionsContainer.appendChild(optionGroup);

    // Add remove functionality
    const removeBtn = optionGroup.querySelector('.remove-option');
    removeBtn.addEventListener('click', function() {
        optionGroup.remove();
        updateOptionPlaceholders();
    });

    // Show remove buttons if more than one option
    if (optionCount >= 1) {
        optionsContainer.querySelectorAll('.remove-option').forEach(btn => {
            btn.style.display = 'flex';
        });
    }
}

function updateOptionPlaceholders() {
    const optionsContainer = document.getElementById('optionsContainer');
    const optionInputs = optionsContainer.querySelectorAll('.option-input');

    optionInputs.forEach((input, index) => {
        input.placeholder = `Option ${index + 1}`;
    });

    // Hide remove button if only one option
    if (optionInputs.length === 1) {
        optionsContainer.querySelector('.remove-option').style.display = 'none';
    }
}

function addQuestion() {
    const questionType = document.getElementById('questionType').value;
    const questionText = document.getElementById('questionText').value.trim();
    const questionRequired = document.getElementById('questionRequired').checked;

    if (!questionText) {
        Modal.alert({
            title: 'Validation Error',
            message: 'Please enter a question text',
            type: 'warning',
            icon: 'warning'
        });
        return;
    }

    let options = [];
    if (questionType === 'radio' || questionType === 'checkbox') {
        const optionInputs = document.querySelectorAll('.option-input');
        options = Array.from(optionInputs)
            .map(input => input.value.trim())
            .filter(value => value !== '');

        if (options.length < 2) {
            Modal.alert({
                title: 'Validation Error',
                message: 'Please provide at least 2 options',
                type: 'warning',
                icon: 'warning'
            });
            return;
        }
    }

    const question = {
        id: questionIdCounter++,
        type: questionType,
        text: questionText,
        required: questionRequired,
        options: options
    };

    questions.push(question);
    renderQuestions();
    closeAddQuestionModal();
}

function renderQuestions() {
    const questionsContainer = document.getElementById('questionsContainer');

    if (questions.length === 0) {
        questionsContainer.innerHTML = '';
        return;
    }

    questionsContainer.innerHTML = questions.map((question, index) => {
        let optionsHTML = '';
        if (question.options && question.options.length > 0) {
            optionsHTML = `
                <div class="question-options">
                    ${question.options.map(option => `
                        <div class="question-option">
                            <span class="material-icons">${question.type === 'radio' ? 'radio_button_unchecked' : 'check_box_outline_blank'}</span>
                            <span>${option}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        return `
            <div class="question-item" data-question-id="${question.id}">
                <div class="question-item-header">
                    <div class="question-item-title">
                        <span class="question-number">${index + 1}.</span>
                        <div>
                            <div class="question-item-content">
                                ${question.text}
                                ${question.required ? '<span class="required">*</span>' : ''}
                            </div>
                            <span class="question-type-badge">${getQuestionTypeName(question.type)}</span>
                        </div>
                    </div>
                    <div class="question-item-actions">
                        <button type="button" class="btn-icon edit" onclick="editQuestion(${question.id})" title="Edit">
                            <span class="material-icons">edit</span>
                        </button>
                        <button type="button" class="btn-icon delete" onclick="deleteQuestion(${question.id})" title="Delete">
                            <span class="material-icons">delete</span>
                        </button>
                    </div>
                </div>
                ${optionsHTML}
            </div>
        `;
    }).join('');
}

function getQuestionTypeName(type) {
    const typeNames = {
        'text': 'Short Answer',
        'textarea': 'Long Answer',
        'radio': 'Multiple Choice',
        'checkbox': 'Checkboxes',
        'rating': 'Rating Scale',
        'star': 'Star Rating'
    };
    return typeNames[type] || type;
}

function editQuestion(questionId) {
    // Find the question
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    // Populate the modal with question data
    document.getElementById('questionType').value = question.type;
    document.getElementById('questionText').value = question.text;
    document.getElementById('questionRequired').checked = question.required;

    // Handle options for radio/checkbox
    if (question.type === 'radio' || question.type === 'checkbox') {
        const optionsContainer = document.getElementById('optionsContainer');
        optionsContainer.innerHTML = '';

        question.options.forEach((option, index) => {
            const optionGroup = document.createElement('div');
            optionGroup.className = 'option-input-group';
            optionGroup.innerHTML = `
                <input type="text" class="form-input option-input" placeholder="Option ${index + 1}" value="${option}">
                <button type="button" class="btn-icon remove-option" ${index === 0 && question.options.length === 1 ? 'style="display: none;"' : ''}>
                    <span class="material-icons">close</span>
                </button>
            `;
            optionsContainer.appendChild(optionGroup);

            const removeBtn = optionGroup.querySelector('.remove-option');
            removeBtn.addEventListener('click', function() {
                optionGroup.remove();
                updateOptionPlaceholders();
            });
        });

        document.getElementById('optionsGroup').style.display = 'block';
    }

    // Remove the old question
    deleteQuestion(questionId, true);

    // Open modal
    openAddQuestionModal();
}

function deleteQuestion(questionId, silent = false) {
    if (!silent && !confirm('Are you sure you want to delete this question?')) {
        return;
    }

    questions = questions.filter(q => q.id !== questionId);
    renderQuestions();
}

// Validation Functions
function validateField(field) {
    const value = field.value.trim();
    const errorElement = document.getElementById(`${field.id}-error`);

    if (field.hasAttribute('required') && !value) {
        field.classList.add('error');
        if (errorElement) {
            errorElement.textContent = 'This field is required';
            errorElement.style.display = 'block';
        }
        return false;
    } else {
        field.classList.remove('error');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
        return true;
    }
}

function validateForm() {
    const form = document.getElementById('surveyForm');
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });

    if (questions.length === 0) {
        Modal.alert({
            title: 'Validation Error',
            message: 'Please add at least one question to the survey',
            type: 'warning',
            icon: 'warning'
        });
        isValid = false;
    }

    return isValid;
}

function saveDraft() {
    const surveyData = collectFormData();
    surveyData.status = 'draft';

    console.log('Saving draft:', surveyData);

    // Here you would send the data to your backend
    // For now, we'll just show a success message
    Modal.alert({
        title: 'Success',
        message: 'Survey saved as draft successfully!',
        type: 'success'
    });

    // Optionally store in localStorage
    localStorage.setItem('surveyDraft', JSON.stringify(surveyData));
}

// Publish Survey
function showPublishConfirmation() {
    if (!validateForm()) {
        return;
    }

    const modal = document.getElementById('confirmModal');
    modal.classList.add('active');
}

function closePublishConfirmation() {
    const modal = document.getElementById('confirmModal');
    modal.classList.remove('active');
}

function publishSurvey() {
    const surveyData = collectFormData();
    surveyData.status = 'published';

    console.log('Publishing survey:', surveyData);

    closePublishConfirmation();

    setTimeout(() => {
        Modal.alert({
            title: 'Success',
            message: 'Survey published successfully!',
            type: 'success',
            icon: 'success',
            onClose: () => {
                goToSurveyList();
            }
        });
    }, 300);
}

function collectFormData() {
    return {
        title: document.getElementById('surveyTitle').value.trim(),
        description: document.getElementById('surveyDescription').value.trim(),
        course: document.getElementById('course').value,
        section: document.getElementById('section').value,
        dueDate: document.getElementById('dueDate').value,
        questions: questions,
        createdAt: new Date().toISOString()
    };
}

// Load draft from localStorage on page load
window.addEventListener('load', function() {
    const draft = localStorage.getItem('surveyDraft');
    if (draft && confirm('Would you like to load your saved draft?')) {
        const surveyData = JSON.parse(draft);

        document.getElementById('surveyTitle').value = surveyData.title || '';
        document.getElementById('surveyDescription').value = surveyData.description || '';
        document.getElementById('course').value = surveyData.course || '';
        document.getElementById('section').value = surveyData.section || '';
        document.getElementById('dueDate').value = surveyData.dueDate || '';

        if (surveyData.questions) {
            questions = surveyData.questions;
            questionIdCounter = Math.max(...questions.map(q => q.id)) + 1;
            renderQuestions();
        }

        // Update character counter
        const descCounter = document.getElementById('description-count');
        if (descCounter) {
            descCounter.textContent = surveyData.description?.length || 0;
        }

        // Update form color based on loaded section
        updateFormColorFromSelect();
    }
});

