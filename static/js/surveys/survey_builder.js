// Survey Builder JavaScript
// Handles drag-and-drop, question management, and survey saving

// Sections Dropdown Management
function updateSectionsDropdownText() {
    const checkboxes = document.querySelectorAll('.section-checkbox:checked');
    const dropdownText = document.getElementById('sectionsDropdownText');
    const selectedDisplay = document.getElementById('selectedSectionsDisplay');
    
    if (checkboxes.length === 0) {
        dropdownText.textContent = 'Select sections...';
        dropdownText.classList.add('text-muted');
        selectedDisplay.innerHTML = '';
    } else {
        dropdownText.textContent = `${checkboxes.length} section${checkboxes.length > 1 ? 's' : ''} selected`;
        dropdownText.classList.remove('text-muted');
        
        // Show selected sections as badges
        let badges = '<div class="d-flex flex-wrap gap-2">';
        checkboxes.forEach(checkbox => {
            const sectionName = checkbox.dataset.name;
            badges += `
                <span class="badge bg-primary d-flex align-items-center gap-1">
                    ${sectionName}
                    <i class="material-icons" style="font-size: 1rem; cursor: pointer;" onclick="unselectSection(${checkbox.value})">close</i>
                </span>
            `;
        });
        badges += '</div>';
        selectedDisplay.innerHTML = badges;
    }
}

function unselectSection(sectionId) {
    const checkbox = document.querySelector(`.section-checkbox[value="${sectionId}"]`);
    if (checkbox) {
        checkbox.checked = false;
        updateSectionsDropdownText();
    }
}

async function refreshSections() {
    const container = document.getElementById('sectionsChecklistContainer');
    const refreshBtn = event.target.closest('button');
    
    // Show loading state
    const originalIcon = refreshBtn.querySelector('.material-icons').textContent;
    refreshBtn.querySelector('.material-icons').textContent = 'hourglass_empty';
    refreshBtn.disabled = true;
    
    try {
        const response = await fetch('/api/sections/teacher_sections/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch sections');
        
        const sections = await response.json();
        
        // Store currently selected sections
        const selectedIds = Array.from(document.querySelectorAll('.section-checkbox:checked'))
            .map(cb => parseInt(cb.value));
        
        // Rebuild the sections list
        if (sections.length === 0) {
            container.innerHTML = '<li><span class="dropdown-item text-muted small">No sections available</span></li>';
        } else {
            container.innerHTML = sections.map(section => `
                <li>
                    <label class="dropdown-item">
                        <input class="form-check-input me-2 section-checkbox" 
                               type="checkbox" 
                               value="${section.id}" 
                               data-name="${section.name}"
                               ${selectedIds.includes(section.id) ? 'checked' : ''}>
                        ${section.name}
                    </label>
                </li>
            `).join('');
            
            // Re-attach event listeners
            container.querySelectorAll('.section-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', updateSectionsDropdownText);
            });
        }
        
        updateSectionsDropdownText();
        
        // Show success feedback
        refreshBtn.querySelector('.material-icons').textContent = 'check';
        setTimeout(() => {
            refreshBtn.querySelector('.material-icons').textContent = originalIcon;
        }, 1000);
        
    } catch (error) {
        console.error('Error refreshing sections:', error);
        this.showErrorModal('Failed to refresh sections. Please try again.');
        refreshBtn.querySelector('.material-icons').textContent = 'error';
        setTimeout(() => {
            refreshBtn.querySelector('.material-icons').textContent = originalIcon;
        }, 2000);
    } finally {
        refreshBtn.disabled = false;
    }
}

// Initialize sections dropdown listeners
document.addEventListener('DOMContentLoaded', function() {
    // Attach change event to all section checkboxes
    document.querySelectorAll('.section-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', updateSectionsDropdownText);
    });
    
    // Prevent dropdown from closing when clicking checkboxes
    document.getElementById('sectionsDropdownMenu').addEventListener('click', function(e) {
        if (e.target.classList.contains('section-checkbox') || e.target.closest('label')) {
            e.stopPropagation();
        }
    });
    
    // Initialize dropdown text
    updateSectionsDropdownText();
});

class SurveyBuilder {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = null;
        this.questionCounter = 0;
        this.modal = null;
        
        this.likertTemplates = {
            agreement: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
            satisfaction: ['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'],
            frequency: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
            quality: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'],
            likelihood: ['Very Unlikely', 'Unlikely', 'Neutral', 'Likely', 'Very Likely']
        };
        
        this.init();
    }
    
    init() {
        this.setupDragAndDrop();
        this.setupEventListeners();
        this.modal = new bootstrap.Modal(document.getElementById('questionEditorModal'));
        
        // Load existing survey data if editing
        if (window.surveyData) {
            this.loadSurveyData(window.surveyData);
        }
    }
    
    setupDragAndDrop() {
        // Make question types clickable
        const questionTypes = document.querySelectorAll('.question-type-item');
        questionTypes.forEach(item => {
            item.addEventListener('click', (e) => {
                const questionType = item.dataset.type;
                if (questionType) {
                    this.addQuestion(questionType);
                    // Add visual feedback
                    item.classList.add('clicked');
                    setTimeout(() => item.classList.remove('clicked'), 300);
                }
            });
        });
        
        // Make questions sortable
        const dropZone = document.getElementById('questionsContainer');
        new Sortable(dropZone, {
            animation: 150,
            handle: '.drag-handle',
            filter: '.empty-state',
            onEnd: () => {
                this.updateQuestionOrder();
            }
        });
    }
    
    setupEventListeners() {
        // Save buttons - show confirmation modals
        document.getElementById('saveDraftBtn').addEventListener('click', () => {
            const modal = new bootstrap.Modal(document.getElementById('confirmSaveDraftModal'));
            modal.show();
        });
        
        document.getElementById('publishBtn').addEventListener('click', () => {
            const modal = new bootstrap.Modal(document.getElementById('confirmPublishModal'));
            modal.show();
        });
        
        // Confirmation modal buttons
        document.getElementById('confirmSaveDraftBtn').addEventListener('click', () => {
            bootstrap.Modal.getInstance(document.getElementById('confirmSaveDraftModal')).hide();
            this.saveSurvey('draft');
        });
        
        document.getElementById('confirmPublishBtn').addEventListener('click', () => {
            bootstrap.Modal.getInstance(document.getElementById('confirmPublishModal')).hide();
            this.saveSurvey('published');
        });
        
        // Question editor modal
        document.getElementById('saveQuestionBtn').addEventListener('click', () => {
            this.saveQuestion();
        });
        
        document.getElementById('addOptionBtn').addEventListener('click', () => {
            this.addOption();
        });
        
        // Likert scale changes
        document.getElementById('likertMin').addEventListener('change', () => {
            this.updateLikertLabels();
        });
        
        document.getElementById('likertMax').addEventListener('change', () => {
            this.updateLikertLabels();
        });
        
        document.getElementById('likertTemplate').addEventListener('change', () => {
            this.updateLikertLabels();
        });
        
        // Real-time preview updates
        document.getElementById('questionText').addEventListener('input', () => {
            this.updatePreview();
        });
        
        // Modal cleanup
        document.getElementById('questionEditorModal').addEventListener('hidden.bs.modal', () => {
            this.resetQuestionEditor();
        });
    }
    
    addQuestion(type) {
        const question = {
            id: `q_${this.questionCounter++}`,
            question_type: type,
            question_text: '',
            is_required: true,
            options: [],
            likert_min: 1,
            likert_max: 5,
            likert_labels: []
        };
        
        this.questions.push(question);
        this.currentQuestionIndex = this.questions.length - 1;
        
        this.renderQuestions();
        this.openQuestionEditor(this.currentQuestionIndex);
    }
    
    renderQuestions() {
        const container = document.getElementById('questionsContainer');
        const emptyState = document.getElementById('emptyState');
        
        if (this.questions.length === 0) {
            if (emptyState) emptyState.style.display = 'block';
            return;
        }
        
        if (emptyState) emptyState.style.display = 'none';
        
        // Clear existing question cards (keep empty state)
        const questionCards = container.querySelectorAll('.question-card');
        questionCards.forEach(card => card.remove());
        
        this.questions.forEach((question, index) => {
            const card = this.createQuestionCard(question, index);
            container.appendChild(card);
        });
    }
    
    createQuestionCard(question, index) {
        const card = document.createElement('div');
        card.className = 'question-card';
        card.dataset.index = index;
        
        const typeLabels = {
            multiple_choice: 'Multiple Choice',
            checkbox: 'Checkboxes',
            likert_scale: 'Likert Scale',
            short_answer: 'Short Answer',
            long_answer: 'Long Answer'
        };
        
        const typeIcons = {
            multiple_choice: 'radio_button_checked',
            checkbox: 'check_box',
            likert_scale: 'linear_scale',
            short_answer: 'short_text',
            long_answer: 'subject'
        };
        
        card.innerHTML = `
            <div class="question-card-header">
                <div class="question-card-title">
                    <i class="material-icons drag-handle">drag_indicator</i>
                    <i class="material-icons type-icon">${typeIcons[question.question_type]}</i>
                    <span class="question-number">Question ${index + 1}</span>
                    <span class="badge bg-secondary">${typeLabels[question.question_type]}</span>
                    ${question.is_required ? '<span class="badge bg-danger">Required</span>' : ''}
                </div>
                <div class="question-card-actions">
                    <button type="button" class="btn btn-sm btn-outline-primary edit-question" data-index="${index}">
                        <i class="material-icons">edit</i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-danger delete-question" data-index="${index}">
                        <i class="material-icons">delete</i>
                    </button>
                </div>
            </div>
            <div class="question-card-body">
                <p class="question-text">${question.question_text || '<em class="text-muted">No question text yet</em>'}</p>
                ${this.renderQuestionPreview(question)}
            </div>
        `;
        
        // Add event listeners
        card.querySelector('.edit-question').addEventListener('click', () => {
            this.openQuestionEditor(index);
        });
        
        card.querySelector('.delete-question').addEventListener('click', () => {
            this.deleteQuestion(index);
        });
        
        return card;
    }
    
    renderQuestionPreview(question) {
        let preview = '';
        
        switch (question.question_type) {
            case 'multiple_choice':
                if (question.options.length > 0) {
                    preview = '<div class="preview-options">';
                    question.options.forEach((option, i) => {
                        preview += `
                            <div class="form-check">
                                <input class="form-check-input" type="radio" disabled>
                                <label class="form-check-label">${option}</label>
                            </div>
                        `;
                    });
                    preview += '</div>';
                } else {
                    preview = '<em class="text-muted small">No options added yet</em>';
                }
                break;
                
            case 'checkbox':
                if (question.options.length > 0) {
                    preview = '<div class="preview-options">';
                    question.options.forEach((option, i) => {
                        preview += `
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" disabled>
                                <label class="form-check-label">${option}</label>
                            </div>
                        `;
                    });
                    preview += '</div>';
                } else {
                    preview = '<em class="text-muted small">No options added yet</em>';
                }
                break;
                
            case 'likert_scale':
                preview = '<div class="likert-preview">';
                const range = question.likert_max - question.likert_min + 1;
                for (let i = 0; i < range; i++) {
                    const value = question.likert_min + i;
                    const label = question.likert_labels[i] || value;
                    preview += `
                        <div class="likert-option">
                            <input type="radio" disabled>
                            <label>${label}</label>
                        </div>
                    `;
                }
                preview += '</div>';
                break;
                
            case 'short_answer':
                preview = '<input type="text" class="form-control" placeholder="Short answer text" disabled>';
                break;
                
            case 'long_answer':
                preview = '<textarea class="form-control" rows="3" placeholder="Long answer text" disabled></textarea>';
                break;
        }
        
        return preview;
    }
    
    openQuestionEditor(index) {
        this.currentQuestionIndex = index;
        const question = this.questions[index];
        
        // Reset form
        this.resetQuestionEditor();
        
        // Populate form
        document.getElementById('questionText').value = question.question_text;
        document.getElementById('isRequired').checked = question.is_required;
        
        // Show/hide type-specific sections
        const optionsSection = document.getElementById('optionsSection');
        const likertSection = document.getElementById('likertSection');
        
        optionsSection.style.display = 'none';
        likertSection.style.display = 'none';
        
        if (question.question_type === 'multiple_choice' || question.question_type === 'checkbox') {
            optionsSection.style.display = 'block';
            question.options.forEach(option => {
                this.addOption(option);
            });
            if (question.options.length === 0) {
                this.addOption();
                this.addOption();
            }
        } else if (question.question_type === 'likert_scale') {
            likertSection.style.display = 'block';
            document.getElementById('likertMin').value = question.likert_min;
            document.getElementById('likertMax').value = question.likert_max;
            this.updateLikertLabels(question.likert_labels);
        }
        
        this.updatePreview();
        this.modal.show();
    }
    
    saveQuestion() {
        const question = this.questions[this.currentQuestionIndex];
        
        // Get values
        question.question_text = document.getElementById('questionText').value.trim();
        question.is_required = document.getElementById('isRequired').checked;
        
        // Validation
        if (!question.question_text) {
            this.showErrorModal('Please enter question text');
            return;
        }
        
        if (question.question_type === 'multiple_choice' || question.question_type === 'checkbox') {
            const options = Array.from(document.querySelectorAll('.option-input'))
                .map(input => input.value.trim())
                .filter(val => val !== '');
            
            if (options.length < 2) {
                this.showErrorModal('Please add at least 2 options');
                return;
            }
            
            question.options = options;
        } else if (question.question_type === 'likert_scale') {
            question.likert_min = parseInt(document.getElementById('likertMin').value);
            question.likert_max = parseInt(document.getElementById('likertMax').value);
            
            const labels = Array.from(document.querySelectorAll('.likert-label-input'))
                .map(input => input.value.trim());
            question.likert_labels = labels;
        }
        
        this.renderQuestions();
        this.modal.hide();
    }
    
    deleteQuestion(index) {
        Modal.show({
            title: 'Delete Question',
            message: 'Are you sure you want to delete this question?',
            type: 'danger',
            icon: 'warning',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            confirmDanger: true,
            onConfirm: () => {
                this.questions.splice(index, 1);
                this.renderQuestions();
            }
        });
    }
    
    updateQuestionOrder() {
        const cards = document.querySelectorAll('.question-card');
        const newOrder = [];
        
        cards.forEach(card => {
            const index = parseInt(card.dataset.index);
            newOrder.push(this.questions[index]);
        });
        
        this.questions = newOrder;
        this.renderQuestions();
    }
    
    addOption(value = '') {
        const container = document.getElementById('optionsContainer');
        const optionDiv = document.createElement('div');
        optionDiv.className = 'input-group mb-2';
        
        optionDiv.innerHTML = `
            <input type="text" class="form-control option-input" placeholder="Enter option text" value="${value}">
            <button type="button" class="btn btn-outline-danger remove-option">
                <i class="material-icons">close</i>
            </button>
        `;
        
        container.appendChild(optionDiv);
        
        // Add event listeners
        optionDiv.querySelector('.remove-option').addEventListener('click', () => {
            if (container.children.length > 2) {
                optionDiv.remove();
                this.updatePreview();
            } else {
                this.showErrorModal('You must have at least 2 options');
            }
        });
        
        optionDiv.querySelector('.option-input').addEventListener('input', () => {
            this.updatePreview();
        });
    }
    
    updateLikertLabels(existingLabels = null) {
        const min = parseInt(document.getElementById('likertMin').value);
        const max = parseInt(document.getElementById('likertMax').value);
        const template = document.getElementById('likertTemplate').value;
        const container = document.getElementById('likertLabelsContainer');
        
        container.innerHTML = '';
        
        const range = max - min + 1;
        let labels = [];
        
        if (existingLabels) {
            labels = existingLabels;
        } else if (template && this.likertTemplates[template]) {
            labels = this.likertTemplates[template].slice(0, range);
            // Pad if needed
            while (labels.length < range) {
                labels.push(`${min + labels.length}`);
            }
        } else {
            // Generate numeric labels
            for (let i = 0; i < range; i++) {
                labels.push(`${min + i}`);
            }
        }
        
        labels.forEach((label, i) => {
            const labelDiv = document.createElement('div');
            labelDiv.className = 'input-group mb-2';
            labelDiv.innerHTML = `
                <span class="input-group-text">${min + i}</span>
                <input type="text" class="form-control likert-label-input" value="${label}" placeholder="Label for ${min + i}">
            `;
            container.appendChild(labelDiv);
            
            labelDiv.querySelector('input').addEventListener('input', () => {
                this.updatePreview();
            });
        });
        
        this.updatePreview();
    }
    
    updatePreview() {
        const preview = document.getElementById('questionPreview');
        const questionText = document.getElementById('questionText').value || 'Your question text will appear here';
        const isRequired = document.getElementById('isRequired').checked;
        
        const question = this.questions[this.currentQuestionIndex];
        
        let html = `
            <p><strong>${questionText}</strong> ${isRequired ? '<span class="text-danger">*</span>' : ''}</p>
        `;
        
        if (question.question_type === 'multiple_choice' || question.question_type === 'checkbox') {
            const options = Array.from(document.querySelectorAll('.option-input'))
                .map(input => input.value.trim())
                .filter(val => val !== '');
            
            if (options.length > 0) {
                html += '<div class="preview-options">';
                options.forEach(option => {
                    const inputType = question.question_type === 'multiple_choice' ? 'radio' : 'checkbox';
                    html += `
                        <div class="form-check">
                            <input class="form-check-input" type="${inputType}" disabled>
                            <label class="form-check-label">${option}</label>
                        </div>
                    `;
                });
                html += '</div>';
            }
        } else if (question.question_type === 'likert_scale') {
            const min = parseInt(document.getElementById('likertMin').value);
            const max = parseInt(document.getElementById('likertMax').value);
            const labels = Array.from(document.querySelectorAll('.likert-label-input'))
                .map(input => input.value);
            
            html += '<div class="likert-preview">';
            for (let i = 0; i <= max - min; i++) {
                html += `
                    <div class="likert-option">
                        <input type="radio" disabled>
                        <label>${labels[i] || (min + i)}</label>
                    </div>
                `;
            }
            html += '</div>';
        } else if (question.question_type === 'short_answer') {
            html += '<input type="text" class="form-control" placeholder="Short answer text" disabled>';
        } else if (question.question_type === 'long_answer') {
            html += '<textarea class="form-control" rows="3" placeholder="Long answer text" disabled></textarea>';
        }
        
        preview.innerHTML = html;
    }
    
    resetQuestionEditor() {
        document.getElementById('questionEditorForm').reset();
        document.getElementById('optionsContainer').innerHTML = '';
        document.getElementById('likertLabelsContainer').innerHTML = '';
        document.getElementById('questionPreview').innerHTML = '';
    }
    
    loadSurveyData(data) {
        console.log('Loading survey data:', data); // Debug log
        
        // Populate survey info
        document.getElementById('surveyTitle').value = data.title;
        document.getElementById('surveyDescription').value = data.description;
        document.getElementById('dueDate').value = data.due_date;
        document.getElementById('isActive').checked = data.is_active;
        
        // Check assigned sections using value attribute
        data.sections.forEach(sectionId => {
            const checkbox = document.querySelector(`.section-checkbox[value="${sectionId}"]`);
            if (checkbox) checkbox.checked = true;
        });
        
        // Update sections dropdown display
        updateSectionsDropdownText();
        
        // Load questions
        if (data.questions && data.questions.length > 0) {
            console.log('Loading questions:', data.questions.length); // Debug log
            this.questions = data.questions.map((q, index) => {
                // Update counter to avoid ID conflicts
                if (typeof q.id === 'number' && q.id >= this.questionCounter) {
                    this.questionCounter = q.id + 1;
                }
                return {
                    id: q.id || `q_${this.questionCounter++}`,
                    question_type: q.question_type,
                    question_text: q.question_text,
                    is_required: q.is_required,
                    options: q.options || [],
                    likert_min: q.likert_min || 1,
                    likert_max: q.likert_max || 5,
                    likert_labels: q.likert_labels || []
                };
            });
            console.log('Questions loaded:', this.questions); // Debug log
            this.renderQuestions();
        } else {
            console.log('No questions to load'); // Debug log
        }
    }
    
    async saveSurvey(status) {
        // Validate survey info
        const title = document.getElementById('surveyTitle').value.trim();
        const description = document.getElementById('surveyDescription').value.trim();
        const dueDate = document.getElementById('dueDate').value;
        const isActive = document.getElementById('isActive').checked;
        
        const sectionIds = Array.from(document.querySelectorAll('.section-checkbox:checked'))
            .map(cb => parseInt(cb.value));
        
        if (!title) {
            this.showErrorModal('Please enter a survey title');
            return;
        }
        
        if (sectionIds.length === 0) {
            this.showErrorModal('Please assign the survey to at least one section');
            return;
        }
        
        if (!dueDate) {
            this.showErrorModal('Please set a due date');
            return;
        }
        
        if (this.questions.length === 0) {
            this.showErrorModal('Please add at least one question');
            return;
        }
        
        // Check all questions are properly configured
        for (let i = 0; i < this.questions.length; i++) {
            const q = this.questions[i];
            if (!q.question_text) {
                this.showErrorModal(`Question ${i + 1} is missing text`);
                return;
            }
            if ((q.question_type === 'multiple_choice' || q.question_type === 'checkbox') && q.options.length < 2) {
                this.showErrorModal(`Question ${i + 1} needs at least 2 options`);
                return;
            }
        }
        
        // Prepare data
        const surveyData = {
            title,
            description,
            due_date: dueDate,
            is_active: isActive,
            status: status,
            sections: sectionIds,
            questions: this.questions.map((q, index) => ({
                question_text: q.question_text,
                question_type: q.question_type,
                is_required: q.is_required,
                order: index,
                options: q.options,
                likert_min: q.likert_min,
                likert_max: q.likert_max,
                likert_labels: q.likert_labels
            }))
        };
        
        // Add survey ID if editing
        if (window.surveyData && window.surveyData.id) {
            surveyData.id = window.surveyData.id;
        }
        
        // Show loading
        document.getElementById('loadingOverlay').style.display = 'flex';
        
        try {
            const response = await fetch('/surveys/builder/save/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCookie('csrftoken')
                },
                body: JSON.stringify(surveyData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showSuccessModal(result.message || 'Survey saved successfully!');
                setTimeout(() => {
                    window.location.href = '/teacher/dashboard/';
                }, 1500);
            } else {
                this.showErrorModal(result.error || 'Failed to save survey');
            }
        } catch (error) {
            console.error('Save error:', error);
            this.showErrorModal('Error saving survey. Please try again.');
        } finally {
            document.getElementById('loadingOverlay').style.display = 'none';
        }
    }
    
    showErrorModal(message) {
        const modalBody = document.querySelector('#errorModal .modal-body p');
        if (modalBody) {
            modalBody.textContent = message;
        }
        const modal = new bootstrap.Modal(document.getElementById('errorModal'));
        modal.show();
    }
    
    showSuccessModal(message) {
        const modalBody = document.querySelector('#successModal .modal-body p');
        if (modalBody) {
            modalBody.textContent = message;
        }
        const modal = new bootstrap.Modal(document.getElementById('successModal'));
        modal.show();
    }
    
    getCookie(name) {
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
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SurveyBuilder();
});
