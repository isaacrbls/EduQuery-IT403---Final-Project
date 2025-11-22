let questions = [];
let questionIdCounter = 1;

$(document).ready(function() {
    initDragDrop();
    loadExistingSurvey();
    bindEvents();
});

function initDragDrop() {
    $('.question-type-item').draggable({
        helper: 'clone',
        revert: 'invalid',
        start: function() {
            $('#addQuestionPrompt').hide();
        }
    });
    
    $('#questionContainer').droppable({
        accept: '.question-type-item',
        drop: function(event, ui) {
            const questionType = ui.draggable.data('type');
            addQuestion(questionType);
        }
    });
    
    $('#questionContainer').sortable({
        handle: '.question-handle',
        placeholder: 'ui-state-highlight',
        update: function() {
            updateQuestionOrders();
        }
    });
}

function addQuestion(type) {
    const questionId = `q_${questionIdCounter++}`;
    const question = {
        id: questionId,
        type: type,
        text: '',
        required: true,
        order: questions.length,
        options: [],
        matching_pairs: [],
        likert_scale: {
            min_value: 1,
            max_value: 5,
            min_label: 'Strongly Disagree',
            max_label: 'Strongly Agree'
        }
    };
    
    questions.push(question);
    renderQuestion(question);
    $('#addQuestionPrompt').hide();
}

function renderQuestion(question) {
    const questionHtml = `
        <div class="question-card" data-question-id="${question.id}">
            <div class="question-header">
                <span class="question-handle material-icons">drag_indicator</span>
                <span class="question-type-badge">
                    <span class="material-icons">${getQuestionIcon(question.type)}</span>
                    ${getQuestionTypeLabel(question.type)}
                </span>
                <div class="question-actions">
                    <button class="btn btn-sm btn-outline-danger delete-question">
                        <span class="material-icons">delete</span>
                    </button>
                </div>
            </div>
            
            <input type="text" class="question-input question-text" placeholder="Question text" value="${question.text}">
            
            <div class="required-toggle">
                <input type="checkbox" class="form-check-input required-checkbox" ${question.required ? 'checked' : ''}>
                <label class="form-check-label">Required</label>
            </div>
            
            ${renderQuestionTypeFields(question)}
        </div>
    `;
    
    $('#questionContainer').append(questionHtml);
    initQuestionEvents($('.question-card').last());
}

function renderQuestionTypeFields(question) {
    switch(question.type) {
        case 'mcq':
        case 'checkbox':
        case 'dropdown':
            return renderOptionsField(question);
        case 'likert':
            return renderLikertField(question);
        case 'matching':
            return renderMatchingField(question);
        default:
            return '';
    }
}

function renderOptionsField(question) {
    let html = '<div class="option-list">';
    
    if (question.options.length === 0) {
        question.options = ['Option 1', 'Option 2'];
    }
    
    question.options.forEach((option, index) => {
        html += `
            <div class="option-item">
                <input type="text" class="form-control option-text" placeholder="Option ${index + 1}" value="${option}">
                <button class="btn btn-sm btn-outline-danger remove-option">
                    <span class="material-icons">close</span>
                </button>
            </div>
        `;
    });
    
    html += `
        <button class="btn btn-sm btn-outline-primary add-option">
            <span class="material-icons">add</span> Add Option
        </button>
    </div>`;
    
    return html;
}

function renderLikertField(question) {
    return `
        <div class="likert-config">
            <input type="number" class="form-control likert-min" placeholder="Min Value" value="${question.likert_scale.min_value}">
            <input type="text" class="form-control likert-min-label" placeholder="Min Label" value="${question.likert_scale.min_label}">
            <input type="number" class="form-control likert-max" placeholder="Max Value" value="${question.likert_scale.max_value}">
            <input type="text" class="form-control likert-max-label" placeholder="Max Label" value="${question.likert_scale.max_label}">
        </div>
    `;
}

function renderMatchingField(question) {
    if (question.matching_pairs.length === 0) {
        question.matching_pairs = [
            {left_item: '', right_item: ''},
            {left_item: '', right_item: ''}
        ];
    }
    
    let html = '<div class="matching-pairs">';
    
    question.matching_pairs.forEach((pair, index) => {
        html += `
            <div class="matching-pair">
                <input type="text" class="form-control matching-left" placeholder="Left item ${index + 1}" value="${pair.left_item}">
                <span class="material-icons">compare_arrows</span>
                <input type="text" class="form-control matching-right" placeholder="Right item ${index + 1}" value="${pair.right_item}">
                <button class="btn btn-sm btn-outline-danger remove-pair">
                    <span class="material-icons">close</span>
                </button>
            </div>
        `;
    });
    
    html += `
        <button class="btn btn-sm btn-outline-primary add-pair">
            <span class="material-icons">add</span> Add Pair
        </button>
    </div>`;
    
    return html;
}

function initQuestionEvents($card) {
    $card.find('.question-text').on('input', function() {
        const questionId = $card.data('question-id');
        const question = questions.find(q => q.id === questionId);
        question.text = $(this).val();
    });
    
    $card.find('.required-checkbox').on('change', function() {
        const questionId = $card.data('question-id');
        const question = questions.find(q => q.id === questionId);
        question.required = $(this).is(':checked');
    });
    
    $card.find('.delete-question').on('click', function() {
        Modal.show({
            title: 'Delete Question',
            message: 'Delete this question?',
            type: 'danger',
            confirmText: 'Delete',
            onConfirm: () => {
                const questionId = $card.data('question-id');
                questions = questions.filter(q => q.id !== questionId);
                $card.remove();
                if (questions.length === 0) {
                    $('#addQuestionPrompt').show();
                }
            }
        });
    });
    
    $card.find('.option-text').on('input', function() {
        updateQuestionOptions($card);
    });
    
    $card.find('.add-option').on('click', function() {
        const questionId = $card.data('question-id');
        const question = questions.find(q => q.id === questionId);
        question.options.push('');
        $card.find('.option-list').html($(renderOptionsField(question)).html());
        initQuestionEvents($card);
    });
    
    $card.on('click', '.remove-option', function() {
        $(this).closest('.option-item').remove();
        updateQuestionOptions($card);
    });
    
    $card.find('.matching-left, .matching-right').on('input', function() {
        updateMatchingPairs($card);
    });
    
    $card.find('.add-pair').on('click', function() {
        const questionId = $card.data('question-id');
        const question = questions.find(q => q.id === questionId);
        question.matching_pairs.push({left_item: '', right_item: ''});
        $card.find('.matching-pairs').html($(renderMatchingField(question)).html());
        initQuestionEvents($card);
    });
    
    $card.on('click', '.remove-pair', function() {
        $(this).closest('.matching-pair').remove();
        updateMatchingPairs($card);
    });
    
    $card.find('.likert-min, .likert-max, .likert-min-label, .likert-max-label').on('input', function() {
        updateLikertScale($card);
    });
}

function updateQuestionOptions($card) {
    const questionId = $card.data('question-id');
    const question = questions.find(q => q.id === questionId);
    question.options = [];
    $card.find('.option-text').each(function() {
        question.options.push($(this).val());
    });
}

function updateMatchingPairs($card) {
    const questionId = $card.data('question-id');
    const question = questions.find(q => q.id === questionId);
    question.matching_pairs = [];
    $card.find('.matching-pair').each(function() {
        question.matching_pairs.push({
            left_item: $(this).find('.matching-left').val(),
            right_item: $(this).find('.matching-right').val()
        });
    });
}

function updateLikertScale($card) {
    const questionId = $card.data('question-id');
    const question = questions.find(q => q.id === questionId);
    question.likert_scale = {
        min_value: parseInt($card.find('.likert-min').val()) || 1,
        max_value: parseInt($card.find('.likert-max').val()) || 5,
        min_label: $card.find('.likert-min-label').val(),
        max_label: $card.find('.likert-max-label').val()
    };
}

function updateQuestionOrders() {
    $('.question-card').each(function(index) {
        const questionId = $(this).data('question-id');
        const question = questions.find(q => q.id === questionId);
        if (question) {
            question.order = index;
        }
    });
}

function bindEvents() {
    $('#saveSurvey').on('click', saveSurvey);
    $('#publishSurvey').on('click', publishSurvey);
    $('#previewSurvey').on('click', previewSurvey);
}

function saveSurvey() {
    const surveyData = {
        title: $('#surveyTitle').val(),
        description: $('#surveyDescription').val(),
        due_date: $('#dueDate').val(),
        section_ids: $('#sectionSelect').val(),
        questions: questions.map(q => ({
            question_text: q.text,
            question_type: q.type,
            required: q.required,
            order: q.order,
            options: q.options,
            matching_pairs: q.matching_pairs,
            likert_scale: q.likert_scale
        }))
    };
    
    const url = surveyId ? `/api/surveys/${surveyId}/` : '/api/surveys/';
    const method = surveyId ? 'PUT' : 'POST';
    
    $.ajax({
        url: url,
        method: method,
        headers: {'X-CSRFToken': csrfToken},
        contentType: 'application/json',
        data: JSON.stringify(surveyData),
        success: function(response) {
            Modal.alert({
                title: 'Success',
                message: 'Survey saved successfully!',
                type: 'success',
                onClose: () => {
                    if (!surveyId) {
                        window.location.href = `/surveys/builder/${response.id}/`;
                    }
                }
            });
        },
        error: function(error) {
            Modal.alert({
                title: 'Error',
                message: 'Error saving survey: ' + error.responseText,
                type: 'danger'
            });
        }
    });
}

function publishSurvey() {
    if (!surveyId) {
        Modal.alert({
            title: 'Validation Error',
            message: 'Please save the survey first',
            type: 'warning'
        });
        return;
    }
    
    $.ajax({
        url: `/api/surveys/${surveyId}/publish/`,
        method: 'POST',
        headers: {'X-CSRFToken': csrfToken},
        success: function() {
            Modal.alert({
                title: 'Success',
                message: 'Survey published successfully!',
                type: 'success'
            });
        },
        error: function(error) {
            Modal.alert({
                title: 'Error',
                message: 'Error publishing survey: ' + error.responseText,
                type: 'danger'
            });
        }
    });
}

function previewSurvey() {
    if (surveyId) {
        window.open(`/surveys/preview/${surveyId}/`, '_blank');
    } else {
        Modal.alert({
            title: 'Validation Error',
            message: 'Please save the survey first',
            type: 'warning'
        });
    }
}

function loadExistingSurvey() {
    if (surveyId) {
        $.ajax({
            url: `/api/surveys/${surveyId}/`,
            method: 'GET',
            success: function(survey) {
                $('#surveyTitle').val(survey.title);
                $('#surveyDescription').val(survey.description);
                $('#dueDate').val(survey.due_date);
                
                if (survey.questions) {
                    survey.questions.forEach(q => {
                        const question = {
                            id: `q_${questionIdCounter++}`,
                            type: q.question_type,
                            text: q.question_text,
                            required: q.required,
                            order: q.order,
                            options: q.options || [],
                            matching_pairs: q.matching_pairs || [],
                            likert_scale: q.likert_scale || {}
                        };
                        questions.push(question);
                        renderQuestion(question);
                    });
                    $('#addQuestionPrompt').hide();
                }
            }
        });
    }
}

function getQuestionIcon(type) {
    const icons = {
        text: 'short_text',
        textarea: 'notes',
        mcq: 'radio_button_checked',
        checkbox: 'check_box',
        dropdown: 'arrow_drop_down_circle',
        likert: 'linear_scale',
        rating: 'star',
        matching: 'compare_arrows',
        date: 'event',
        email: 'email'
    };
    return icons[type] || 'help';
}

function getQuestionTypeLabel(type) {
    const labels = {
        text: 'Short Text',
        textarea: 'Long Text',
        mcq: 'Multiple Choice',
        checkbox: 'Checkboxes',
        dropdown: 'Dropdown',
        likert: 'Likert Scale',
        rating: 'Rating',
        matching: 'Matching',
        date: 'Date',
        email: 'Email'
    };
    return labels[type] || type;
}
