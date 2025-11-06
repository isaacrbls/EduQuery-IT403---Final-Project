/**
 * Response Viewer JavaScript
 * Handles pagination, sorting, filtering, and jQuery UI components
 */

(function() {
    'use strict';

    // Configuration
    const API_BASE_URL = '/api/responses/';
    const API_STUDENT_AUTOCOMPLETE = '/api/responses/students/autocomplete/';
    const API_SURVEY_LIST = '/api/responses/surveys/list/';
    
    let currentPage = 1;
    let pageSize = 10;
    let currentFilters = {
        search: '',
        date_from: '',
        date_to: '',
        survey_id: '',
        sort_by: '-submitted_at'
    };

    // Initialize on DOM ready
    $(document).ready(function() {
        initializeDatePickers();
        initializeStudentAutocomplete();
        loadSurveys();
        loadResponses();
        
        // Event listeners
        $('#student-search').on('change', function() {
            currentFilters.search = $(this).val();
            currentPage = 1;
            loadResponses();
        });

        $('#date-from, #date-to').on('change', function() {
            currentFilters.date_from = $('#date-from').val();
            currentFilters.date_to = $('#date-to').val();
            currentPage = 1;
            loadResponses();
        });

        $('#survey-filter').on('change', function() {
            currentFilters.survey_id = $(this).val();
            currentPage = 1;
            loadResponses();
        });

        $('#sort-by').on('change', function() {
            currentFilters.sort_by = $(this).val();
            currentPage = 1;
            loadResponses();
        });

        $('#clear-filters').on('click', function() {
            clearFilters();
        });

        // Table header sorting
        $('#responses-table thead th[data-sort]').on('click', function() {
            const sortField = $(this).data('sort');
            if (sortField) {
                // Toggle sort direction
                if (currentFilters.sort_by === sortField) {
                    currentFilters.sort_by = '-' + sortField;
                } else if (currentFilters.sort_by === '-' + sortField) {
                    currentFilters.sort_by = sortField;
                } else {
                    currentFilters.sort_by = '-' + sortField;
                }
                $('#sort-by').val(currentFilters.sort_by);
                currentPage = 1;
                loadResponses();
            }
        });
    });

    /**
     * Initialize jQuery UI Datepicker
     */
    function initializeDatePickers() {
        $('.datepicker').datepicker({
            dateFormat: 'yy-mm-dd',
            changeMonth: true,
            changeYear: true,
            showButtonPanel: true,
            maxDate: new Date(), // Can't select future dates
            onSelect: function(dateText, inst) {
                $(this).trigger('change');
            }
        });
    }

    /**
     * Initialize jQuery UI Autocomplete for student search
     */
    function initializeStudentAutocomplete() {
        $('#student-search').autocomplete({
            source: function(request, response) {
                $.ajax({
                    url: API_STUDENT_AUTOCOMPLETE,
                    data: {
                        q: request.term
                    },
                    beforeSend: function(xhr) {
                        xhr.setRequestHeader('X-CSRFToken', csrftoken);
                    },
                    success: function(data) {
                        response(data.results || []);
                    },
                    error: function() {
                        response([]);
                    }
                });
            },
            minLength: 2,
            select: function(event, ui) {
                $(this).val(ui.item.value);
                currentFilters.search = ui.item.value;
                currentPage = 1;
                loadResponses();
                return false;
            },
            focus: function(event, ui) {
                return false;
            }
        });
    }

    /**
     * Load surveys for filter dropdown
     */
    function loadSurveys() {
        $.ajax({
            url: API_SURVEY_LIST,
            beforeSend: function(xhr) {
                xhr.setRequestHeader('X-CSRFToken', csrftoken);
            },
            success: function(data) {
                const select = $('#survey-filter');
                select.empty();
                select.append('<option value="">All Surveys</option>');
                
                if (data.results && data.results.length > 0) {
                    data.results.forEach(function(survey) {
                        select.append(
                            `<option value="${survey.id}">${escapeHtml(survey.title)} (${survey.response_count} responses)</option>`
                        );
                    });
                }
            },
            error: function(xhr) {
                console.error('Error loading surveys:', xhr);
            }
        });
    }

    /**
     * Load responses from API
     */
    function loadResponses() {
        const params = {
            page: currentPage,
            page_size: pageSize,
            ...currentFilters
        };

        // Remove empty filters
        Object.keys(params).forEach(key => {
            if (params[key] === '' || params[key] === null) {
                delete params[key];
            }
        });

        const queryString = $.param(params);
        const url = API_BASE_URL + '?' + queryString;

        // Show loading state
        $('#responses-tbody').html(`
            <tr>
                <td colspan="7" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2">Loading responses...</p>
                </td>
            </tr>
        `);

        $.ajax({
            url: url,
            method: 'GET',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('X-CSRFToken', csrftoken);
            },
            success: function(data) {
                renderTable(data.results || []);
                renderPagination(data);
                updateResultsInfo(data);
            },
            error: function(xhr) {
                let errorMessage = 'Error loading responses.';
                if (xhr.status === 403) {
                    errorMessage = 'Access denied. You do not have permission to view responses.';
                } else if (xhr.status === 404) {
                    errorMessage = 'Responses not found.';
                } else if (xhr.responseJSON && xhr.responseJSON.error) {
                    errorMessage = xhr.responseJSON.error;
                }
                
                $('#responses-tbody').html(`
                    <tr>
                        <td colspan="7" class="text-center py-5 text-danger">
                            <span class="material-icons">error</span>
                            <p class="mt-2">${escapeHtml(errorMessage)}</p>
                        </td>
                    </tr>
                `);
                $('#pagination').empty();
                $('#results-info').text('');
            }
        });
    }

    /**
     * Render table with response data
     */
    function renderTable(responses) {
        const tbody = $('#responses-tbody');
        
        if (responses.length === 0) {
            tbody.html(`
                <tr>
                    <td colspan="7" class="text-center py-5">
                        <span class="material-icons" style="font-size: 48px; color: #ccc;">assignment</span>
                        <p class="mt-2 text-muted">No responses found.</p>
                    </td>
                </tr>
            `);
            return;
        }

        let html = '';
        responses.forEach(function(response) {
            const submittedDate = response.submitted_at 
                ? formatDateTime(response.submitted_at) 
                : 'Not submitted';
            
            const statusBadge = response.status === 'submitted' 
                ? '<span class="badge bg-success">Submitted</span>'
                : '<span class="badge bg-warning">In Progress</span>';

            html += `
                <tr>
                    <td>${response.id}</td>
                    <td>${escapeHtml(response.survey_title || 'N/A')}</td>
                    <td>${escapeHtml(response.respondent_name || 'Anonymous')}</td>
                    <td>${submittedDate}</td>
                    <td>
                        <span class="badge bg-info">${response.answer_count || 0} answers</span>
                    </td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="btn btn-sm btn-primary view-details-btn" data-response-id="${response.id}">
                            <span class="material-icons" style="font-size: 18px;">visibility</span>
                            View
                        </button>
                    </td>
                </tr>
            `;
        });

        tbody.html(html);

        // Attach event listeners to view buttons
        $('.view-details-btn').on('click', function() {
            const responseId = $(this).data('response-id');
            viewResponseDetails(responseId);
        });
    }

    /**
     * Render pagination controls
     */
    function renderPagination(data) {
        const pagination = $('#pagination');
        pagination.empty();

        if (!data.total_pages || data.total_pages <= 1) {
            return;
        }

        const current = data.page;
        const total = data.total_pages;

        // Previous button
        const prevDisabled = current === 1 ? 'disabled' : '';
        pagination.append(`
            <li class="page-item ${prevDisabled}">
                <a class="page-link" href="#" data-page="${current - 1}">Previous</a>
            </li>
        `);

        // Page numbers
        const startPage = Math.max(1, current - 2);
        const endPage = Math.min(total, current + 2);

        if (startPage > 1) {
            pagination.append(`<li class="page-item"><a class="page-link" href="#" data-page="1">1</a></li>`);
            if (startPage > 2) {
                pagination.append(`<li class="page-item disabled"><span class="page-link">...</span></li>`);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            const active = i === current ? 'active' : '';
            pagination.append(`
                <li class="page-item ${active}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `);
        }

        if (endPage < total) {
            if (endPage < total - 1) {
                pagination.append(`<li class="page-item disabled"><span class="page-link">...</span></li>`);
            }
            pagination.append(`<li class="page-item"><a class="page-link" href="#" data-page="${total}">${total}</a></li>`);
        }

        // Next button
        const nextDisabled = current === total ? 'disabled' : '';
        pagination.append(`
            <li class="page-item ${nextDisabled}">
                <a class="page-link" href="#" data-page="${current + 1}">Next</a>
            </li>
        `);

        // Attach click handlers
        pagination.find('a.page-link').on('click', function(e) {
            e.preventDefault();
            const page = parseInt($(this).data('page'));
            if (page && page !== current && page >= 1 && page <= total) {
                currentPage = page;
                loadResponses();
                // Scroll to top of table
                $('.table-section').get(0).scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    /**
     * Update results info text
     */
    function updateResultsInfo(data) {
        const start = ((data.page - 1) * data.page_size) + 1;
        const end = Math.min(data.page * data.page_size, data.count);
        const total = data.count;

        if (total === 0) {
            $('#results-info').text('No responses found.');
        } else {
            $('#results-info').text(`Showing ${start}-${end} of ${total} responses`);
        }
    }

    /**
     * View response details in modal
     */
    function viewResponseDetails(responseId) {
        const modal = new bootstrap.Modal(document.getElementById('responseDetailModal'));
        const content = $('#response-detail-content');
        
        content.html(`
            <div class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading response details...</p>
            </div>
        `);
        
        modal.show();

        $.ajax({
            url: API_BASE_URL + responseId + '/',
            method: 'GET',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('X-CSRFToken', csrftoken);
            },
            success: function(data) {
                renderResponseDetails(data);
            },
            error: function(xhr) {
                let errorMessage = 'Error loading response details.';
                if (xhr.responseJSON && xhr.responseJSON.error) {
                    errorMessage = xhr.responseJSON.error;
                }
                content.html(`
                    <div class="alert alert-danger">
                        <span class="material-icons">error</span>
                        ${escapeHtml(errorMessage)}
                    </div>
                `);
            }
        });
    }

    /**
     * Render response details in modal
     */
    function renderResponseDetails(response) {
        const content = $('#response-detail-content');
        
        let html = `
            <div class="response-detail-header mb-4">
                <h6 class="text-muted">Survey</h6>
                <h4>${escapeHtml(response.survey_title || 'N/A')}</h4>
                <p class="text-muted">${escapeHtml(response.survey_description || '')}</p>
            </div>

            <div class="response-meta mb-4">
                <div class="row">
                    <div class="col-md-6">
                        <strong>Student:</strong> ${escapeHtml(response.respondent_name || 'Anonymous')}
                    </div>
                    <div class="col-md-6">
                        <strong>Submitted:</strong> ${response.submitted_at ? formatDateTime(response.submitted_at) : 'Not submitted'}
                    </div>
                    <div class="col-md-6 mt-2">
                        <strong>Status:</strong> 
                        <span class="badge ${response.status === 'submitted' ? 'bg-success' : 'bg-warning'}">
                            ${response.status === 'submitted' ? 'Submitted' : 'In Progress'}
                        </span>
                    </div>
                    ${response.completion_time_seconds ? `
                        <div class="col-md-6 mt-2">
                            <strong>Completion Time:</strong> ${formatDuration(response.completion_time_seconds)}
                        </div>
                    ` : ''}
                </div>
            </div>

            <hr>

            <div class="answers-section">
                <h5 class="mb-3">Answers</h5>
        `;

        if (response.answers && response.answers.length > 0) {
            html += '<div class="list-group">';
            response.answers.forEach(function(answer, index) {
                html += `
                    <div class="list-group-item">
                        <div class="d-flex w-100 justify-content-between mb-2">
                            <h6 class="mb-1">Question ${answer.question_order}: ${escapeHtml(answer.question_text)}</h6>
                            <small class="text-muted">${answer.question_type}</small>
                        </div>
                        <p class="mb-1">
                            <strong>Answer:</strong> 
                            <span class="answer-text">${escapeHtml(answer.answer_display || 'No answer provided')}</span>
                        </p>
                    </div>
                `;
            });
            html += '</div>';
        } else {
            html += '<p class="text-muted">No answers found.</p>';
        }

        html += '</div>';
        content.html(html);
    }

    /**
     * Clear all filters
     */
    function clearFilters() {
        $('#student-search').val('');
        $('#date-from').val('');
        $('#date-to').val('');
        $('#survey-filter').val('');
        $('#sort-by').val('-submitted_at');
        
        currentFilters = {
            search: '',
            date_from: '',
            date_to: '',
            survey_id: '',
            sort_by: '-submitted_at'
        };
        
        currentPage = 1;
        loadResponses();
    }

    /**
     * Format datetime string
     */
    function formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Format duration in seconds to readable format
     */
    function formatDuration(seconds) {
        if (!seconds) return 'N/A';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, function(m) { return map[m]; });
    }
})();

