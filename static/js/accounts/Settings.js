'use strict';

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

const SettingsState = {
    currentPanel: 'password',
    isFormDirty: false,
    codeTimer: null,
    codeCooldown: 60
};

document.addEventListener('DOMContentLoaded', function() {
    initializeSettings();
    bindEventListeners();
    initializeTooltips();
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
}

// ============================================
// Initialization Functions
// ============================================

function initializeSettings() {
    console.log('Settings page initialized');

    // Set initial active panel
    showSetting('password');

    // Initialize form validation
    initializeFormValidation();

    // Set user name in header
    const userName = document.body.getAttribute('data-user-name') || 'User';
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(element => {
        element.textContent = userName;
    });
}

function bindEventListeners() {
    // Settings navigation
    const navButtons = document.querySelectorAll('.settings-nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', handleNavClick);
    });

    // Password form events
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    if (passwordInput) {
        passwordInput.addEventListener('input', handlePasswordInput);
        passwordInput.addEventListener('focus', showPasswordTips);
    }

    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', validatePasswordMatch);
    }

    // Send code button
    const sendCodeBtn = document.querySelector('.send-code-btn');
    if (sendCodeBtn) {
        sendCodeBtn.addEventListener('click', handleSendCode);
    }

    // Form submission
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordFormSubmit);
    }

    // Cancel button
    const cancelBtn = document.querySelector('.btnCancel');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', handleFormCancel);
    }
}

function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function initializeFormValidation() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            SettingsState.isFormDirty = true;
        });
    });
}

// ============================================
// Navigation Functions
// ============================================

function handleNavClick(event) {
    const setting = event.currentTarget.getAttribute('data-setting');
    if (setting) {
        showSetting(setting);
    }
}

function showSetting(settingName) {
    // Update navigation
    const navButtons = document.querySelectorAll('.settings-nav-btn');
    navButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-setting') === settingName) {
            btn.classList.add('active');
        }
    });

    // Update panels
    const panels = document.querySelectorAll('.setting-card');
    panels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === `${settingName}-panel`) {
            panel.classList.add('active');
        }
    });

    SettingsState.currentPanel = settingName;
}

// ============================================
// Enhanced Form Functions
// ============================================

// Password visibility toggle
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('.material-icons');

    if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = 'visibility_off';
        button.setAttribute('aria-label', 'Hide password');
    } else {
        input.type = 'password';
        icon.textContent = 'visibility';
        button.setAttribute('aria-label', 'Show password');
    }
}

// Password strength checker
function handlePasswordInput(event) {
    const password = event.target.value;
    updatePasswordStrength(password);
    SettingsState.isFormDirty = true;

    // Also validate match if confirm password has value
    const confirmPassword = document.getElementById('confirmPassword');
    if (confirmPassword && confirmPassword.value) {
        validatePasswordMatch({ target: confirmPassword });
    }
}

function updatePasswordStrength(password) {
    const strengthBars = document.querySelectorAll('.strength-bar');
    const strengthText = document.getElementById('strength-level');
    const strengthContainer = document.querySelector('.password-strength');

    if (!strengthBars.length || !strengthText) return;

    // Reset classes
    strengthContainer.className = 'password-strength';

    if (!password) {
        strengthText.textContent = 'Enter a password';
        return;
    }

    let score = 0;
    const checks = {
        length: password.length >= 8,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        numbers: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    score = Object.values(checks).filter(Boolean).length;

    let level = 'weak';
    let text = 'Weak';

    if (score >= 4) {
        level = 'strong';
        text = 'Strong';
    } else if (score >= 3) {
        level = 'good';
        text = 'Good';
    } else if (score >= 2) {
        level = 'fair';
        text = 'Fair';
    }

    strengthContainer.classList.add(`strength-${level}`);
    strengthText.textContent = text;
}

// Password match validation
function validatePasswordMatch(event) {
    const confirmPassword = event.target;
    const password = document.getElementById('password');
    const field = confirmPassword.closest('.field');

    // Remove existing validation classes
    field.classList.remove('field-error', 'field-success');

    if (!confirmPassword.value) return;

    if (password.value === confirmPassword.value) {
        field.classList.add('field-success');
    } else {
        field.classList.add('field-error');
    }

    SettingsState.isFormDirty = true;
}

// Enhanced send code function
function handleSendCode(event) {
    event.preventDefault();
    const button = event.target;
    const email = document.getElementById('email').value;

    if (!email) {
        showNotification('Please enter your email address', 'error');
        return;
    }

    // Disable button and start countdown
    button.disabled = true;
    startCodeCooldown(button);

    // Simulate API call
    showNotification('Verification code sent to your email', 'success');

    // Enable code input and focus
    const codeInput = document.getElementById('code');
    if (codeInput) {
        codeInput.removeAttribute('disabled');
        setTimeout(() => codeInput.focus(), 100);
    }
}

function startCodeCooldown(button) {
    let timeLeft = SettingsState.codeCooldown;
    const originalText = button.innerHTML;

    const countdown = setInterval(() => {
        button.innerHTML = `<span class="material-icons">hourglass_empty</span>Resend in ${timeLeft}s`;
        timeLeft--;

        if (timeLeft < 0) {
            clearInterval(countdown);
            button.disabled = false;
            button.innerHTML = originalText;
        }
    }, 1000);
}

// Enhanced form submission
function handlePasswordFormSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    // Validate form
    if (!validateEnhancedPasswordForm(data)) {
        return;
    }

    // Show loading state
    const submitBtn = document.querySelector('.btnSave');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="material-icons rotating">sync</span>UPDATING...';

    // Simulate API call
    setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        showNotification('Password updated successfully!', 'success');

        // Reset form
        resetPasswordForm();
        SettingsState.isFormDirty = false;
    }, 2000);
}

function validateEnhancedPasswordForm(data) {
    const errors = [];

    if (!data.code || data.code.trim().length !== 6) {
        errors.push('Please enter a valid 6-digit verification code');
    }

    if (!data.password) {
        errors.push('New password is required');
    } else if (data.password.length < 8) {
        errors.push('Password must be at least 8 characters');
    }

    if (data.password !== data.confirmPassword) {
        errors.push('Passwords do not match');
    }

    if (errors.length > 0) {
        showNotification(errors.join('. '), 'error');
        return false;
    }

    return true;
}

// Form cancel
function handleFormCancel(event) {
    event.preventDefault();

    if (SettingsState.isFormDirty) {
        if (confirm('Are you sure you want to cancel? Your changes will be lost.')) {
            resetPasswordForm();
        }
    } else {
        resetPasswordForm();
    }
}

function resetPasswordForm() {
    const form = document.getElementById('passwordForm');
    if (form) {
        form.reset();
        updatePasswordStrength('');

        // Remove validation classes
        const fields = form.querySelectorAll('.field');
        fields.forEach(field => {
            field.classList.remove('field-error', 'field-success');
        });
    }

    SettingsState.isFormDirty = false;
}

// Show password tips
function showPasswordTips() {
    showNotification('Password should contain uppercase, lowercase, numbers, and special characters', 'info');
}

// ============================================
// Navigation Functions
// ============================================

function goToHome() {
    // Go to root; server will redirect to appropriate dashboard
    window.location.href = '/';
}

function goToSurveyList() {
    window.location.href = '/surveys/list/';
}

function goToHistory() {
    // History view is served under /surveys/history/
    window.location.href = '/surveys/history/';
}

function goToProfile() {
    window.location.href = '/profile/';
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
            // Use the root logout path
            window.location.href = '/logout/';
        }
    });
}

function showTooltip(event) {
    const element = event.currentTarget;
    const tooltipText = element.getAttribute('data-tooltip');

    if (!tooltipText) return;

    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = tooltipText;
    document.body.appendChild(tooltip);

    const rect = element.getBoundingClientRect();
    tooltip.style.position = 'fixed';
    tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
    tooltip.style.top = rect.bottom + 8 + 'px';
    tooltip.style.zIndex = '1000';

    element._tooltip = tooltip;
}

function hideTooltip(event) {
    const element = event.currentTarget;
    if (element._tooltip) {
        element._tooltip.remove();
        element._tooltip = null;
    }
}

// ============================================
// Enhanced Notification System
// ============================================

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="material-icons notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <span class="material-icons">close</span>
            </button>
        </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    requestAnimationFrame(() => {
        notification.classList.add('notification-show');
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.add('notification-hide');
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check_circle',
        error: 'error',
        warning: 'warning',
        info: 'info'
    };
    return icons[type] || 'info';
}

// ============================================
// Initialize notification styles
// ============================================

// Add notification styles if not present
if (!document.querySelector('#notification-styles')) {
    const notificationStyles = document.createElement('style');
    notificationStyles.id = 'notification-styles';
    notificationStyles.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
            border-left: 4px solid;
            max-width: 400px;
            z-index: 1000;
            transform: translateX(100%);
            opacity: 0;
            transition: all 0.3s ease;
        }

        .notification-show {
            transform: translateX(0);
            opacity: 1;
        }

        .notification-hide {
            transform: translateX(100%);
            opacity: 0;
        }

        .notification-success { border-left-color: #10B981; }
        .notification-error { border-left-color: #EF4444; }
        .notification-warning { border-left-color: #F59E0B; }
        .notification-info { border-left-color: #3B82F6; }

        .notification-content {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
        }

        .notification-icon {
            flex-shrink: 0;
            font-size: 20px;
        }

        .notification-success .notification-icon { color: #10B981; }
        .notification-error .notification-icon { color: #EF4444; }
        .notification-warning .notification-icon { color: #F59E0B; }
        .notification-info .notification-icon { color: #3B82F6; }

        .notification-message {
            flex: 1;
            font-size: 14px;
            color: #374151;
            line-height: 1.4;
        }

        .notification-close {
            background: none;
            border: none;
            color: #9CA3AF;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            transition: color 0.2s ease;
        }

        .notification-close:hover {
            color: #6B7280;
        }

        .rotating {
            animation: rotate 1s linear infinite;
        }

        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        .field-error input {
            border-color: #EF4444 !important;
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
        }

        .field-success input {
            border-color: #10B981 !important;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
        }

        .tooltip {
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            white-space: nowrap;
            pointer-events: none;
            opacity: 0;
            animation: tooltipIn 0.2s ease forwards;
        }

        @keyframes tooltipIn {
            to { opacity: 1; }
        }
    `;
    document.head.appendChild(notificationStyles);
}
