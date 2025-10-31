// Main JavaScript for EduQuery

$(document).ready(function() {
    // Initialize tooltips
    $('[data-bs-toggle="tooltip"]').tooltip();

    // Initialize popovers
    $('[data-bs-toggle="popover"]').popover();

    // Auto-dismiss alerts after 5 seconds
    setTimeout(function() {
        $('.alert').fadeOut('slow');
    }, 5000);
});

// CSRF Token setup for AJAX requests
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

const csrftoken = getCookie('csrftoken');

// Setup AJAX with CSRF token
$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!(/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type)) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});

// Loading spinner functions
function showLoading() {
    const spinner = `
        <div class="spinner-overlay" id="loadingSpinner">
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;
    $('body').append(spinner);
}

function hideLoading() {
    $('#loadingSpinner').remove();
}

// Form validation helper
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return false;
    }
    return true;
}

// Confirmation dialog
function confirmAction(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// Toast notification
function showToast(message, type = 'info') {
    const toastHtml = `
        <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
            <div class="toast align-items-center text-white bg-${type} border-0" role="alert">
                <div class="d-flex">
                    <div class="toast-body">${message}</div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        </div>
    `;
    $('body').append(toastHtml);
    const toastElement = $('.toast').last()[0];
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
    setTimeout(() => $(toastElement).parent().remove(), 5000);
}

// Export utilities
window.EduQuery = {
    showLoading,
    hideLoading,
    validateForm,
    confirmAction,
    showToast,
    csrftoken
};

