function goToHome() {
    window.location.href = '/student/dashboard/';
}

function goToSurveyList() {
    window.location.href = '/student/surveys/';
}

function goToHistory() {
    window.location.href = '/student/history/';
}

function goToAnalytics() {
    window.location.href = '/student/analytics/';
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

document.addEventListener('DOMContentLoaded', function() {
    initializeProfile();
    initializeEventListeners();
    initializeAnimations();
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

/* ============================================
   Profile Initialization
   ============================================ */

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

function initializeProfile() {
    // Get user name from body data attribute
    const userName = document.body.getAttribute('data-user-name') || 'Khy';

    // Update user name in welcome message
    const userNameElement = document.querySelector('.user-name');
    if (userNameElement) {
        userNameElement.textContent = userName;
    }

    // Initialize form state - all fields should be readonly by default
    setFormReadOnly(true);

    // Ensure edit mode is disabled initially
    toggleEditButtons(false);

    // Apply animations
    addPageAnimations();
}

/* ============================================
   Event Listeners
   ============================================ */

function initializeEventListeners() {
    // Edit Profile Button
    const editBtn = document.getElementById('editProfileBtn');
    if (editBtn) {
        editBtn.addEventListener('click', handleEditProfile);
    }

    // Update Password Button
    const updatePassBtn = document.getElementById('updatePasswordBtn');
    if (updatePassBtn) {
        updatePassBtn.addEventListener('click', handleUpdatePassword);
    }

    // Save Profile Button
    const saveBtn = document.getElementById('saveProfileBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', handleSaveProfile);
    }

    // Cancel Edit Button
    const cancelBtn = document.getElementById('cancelEditBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', handleCancelEdit);
    }

    // Search and notification functionality removed as requested

    // Form validation
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleSaveProfile();
        });
    }
}

/* ============================================
   Navigation Functions
   ============================================ */

function goToHome() {
    console.log('Navigating to Home...');
    // Add your navigation logic here
    window.location.href = '/student/dashboard/';
}

function goToSurveyList() {
    console.log('Navigating to Survey List...');
    // Add your navigation logic here
    window.location.href = '/surveys/';
}

function goToHistory() {
    console.log('Navigating to History...');
    window.location.href = '/surveys/history/';
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
            console.log('Logging out...');
            window.location.href = '/logout/';
        }
    });
}

/* ============================================
   Profile Management Functions
   ============================================ */

let currentMode = null; // 'profile' or 'password'

function handleEditProfile() {
    console.log('Enabling edit mode...');
    currentMode = 'profile';

    // Enable form inputs
    setFormReadOnly(false, 'profile');

    // Toggle buttons
    toggleEditButtons(true);

    // Focus on first input
    const nameInput = document.getElementById('first_name');
    if (nameInput) {
        nameInput.focus();
        nameInput.select();
    }

    // Add visual feedback
    showNotification('Edit mode enabled', 'info');
}

function handleUpdatePassword() {
    console.log('Enabling password update mode...');
    currentMode = 'password';

    // Enable form inputs
    setFormReadOnly(false, 'password');

    // Toggle buttons
    toggleEditButtons(true);

    // Focus on password input
    const passInput = document.getElementById('password');
    if (passInput) {
        passInput.focus();
    }

    // Add visual feedback
    showNotification('Password update mode enabled', 'info');
}

function handleSaveProfile() {
    console.log('Saving profile...');

    // Validate form
    if (!validateForm()) {
        return;
    }

    // Get form data
    const form = document.getElementById('profileForm');
    const formData = new FormData(form);

    // Show loading state
    const saveBtn = document.getElementById('saveProfileBtn');
    if (saveBtn) {
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;

        fetch(window.location.href, {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(response => {
            if (response.ok) {
                // Show success message
                showNotification(currentMode === 'password' ? 'Password updated successfully!' : 'Profile updated successfully!', 'success');
                
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                throw new Error('Network response was not ok');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Error saving profile. Please try again.', 'error');
            saveBtn.textContent = originalText;
            saveBtn.disabled = false;
        });
    }
}

function handleCancelEdit() {
    console.log('Cancelling edit...');

    Modal.show({
        title: 'Cancel Edit',
        message: 'Are you sure you want to cancel? Any unsaved changes will be lost.',
        type: 'warning',
        confirmText: 'Yes, Cancel',
        onConfirm: () => {
            // Reset form to original values
            resetFormData();

            // Disable edit mode
            setFormReadOnly(true);
            toggleEditButtons(false);
            currentMode = null;

            // Show notification
            showNotification('Changes cancelled', 'info');
        }
    });
}

/* ============================================
   Form Management Functions
   ============================================ */

function setFormReadOnly(readonly, mode = null) {
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
        // Skip position field - it should always be readonly
        if (input.id === 'position') return;

        if (readonly) {
            input.readOnly = true;
            input.classList.add('readonly-mode');
        } else {
            if (mode === 'profile') {
                // Enable profile fields, disable password fields
                if (input.id === 'password' || input.id === 'confirm_password') {
                    input.readOnly = true;
                    input.classList.add('readonly-mode');
                } else {
                    input.readOnly = false;
                    input.classList.remove('readonly-mode');
                }
            } else if (mode === 'password') {
                // Enable password fields, disable profile fields
                if (input.id === 'password' || input.id === 'confirm_password') {
                    input.readOnly = false;
                    input.classList.remove('readonly-mode');
                } else {
                    input.readOnly = true;
                    input.classList.add('readonly-mode');
                }
            }
        }
    });
}

function toggleEditButtons(isEditing) {
    const editBtn = document.getElementById('editProfileBtn');
    const updatePassBtn = document.getElementById('updatePasswordBtn');
    const saveBtn = document.getElementById('saveProfileBtn');
    const cancelBtn = document.getElementById('cancelEditBtn');

    if (editBtn) editBtn.style.display = isEditing ? 'none' : 'flex';
    if (updatePassBtn) updatePassBtn.style.display = isEditing ? 'none' : 'flex';
    if (saveBtn) saveBtn.style.display = isEditing ? 'flex' : 'none';
    if (cancelBtn) cancelBtn.style.display = isEditing ? 'flex' : 'none';
}

function validateForm() {
    let isValid = true;

    if (currentMode === 'profile') {
        const requiredFields = ['first_name', 'last_name', 'email', 'username'];

        requiredFields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field && !field.value.trim()) {
                showFieldError(field, `${fieldName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`);
                isValid = false;
            } else if (field) {
                clearFieldError(field);
            }
        });

        // Validate email format
        const email = document.getElementById('email');
        if (email && email.value && !isValidEmail(email.value)) {
            showFieldError(email, 'Please enter a valid email address');
            isValid = false;
        }
    } else if (currentMode === 'password') {
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirm_password');
        
        if (password && !password.value) {
             showFieldError(password, 'Password is required');
             isValid = false;
        } else if (password) {
             clearFieldError(password);
        }

        if (password && password.value) {
            if (password.value !== confirmPassword.value) {
                showFieldError(confirmPassword, 'Passwords do not match');
                isValid = false;
            } else {
                clearFieldError(confirmPassword);
            }
        }
    }

    return isValid;
}

function getFormData() {
    const form = document.getElementById('profileForm');
    const formData = new FormData(form);
    const data = {};

    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }

    return data;
}

function resetFormData() {
    // Reload page to reset form data
    window.location.reload();
}

/* ============================================
   Utility Functions
   ============================================ */


function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 20px;
        border-radius: 12px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        display: flex;
        align-items: center;
        gap: 12px;
        max-width: 400px;
    `;

    // Set background color based on type
    const colors = {
        success: '#22c55e',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Auto remove
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 4000);
}

function showFieldError(field, message) {
    // Remove existing error
    clearFieldError(field);

    // Add error class
    field.classList.add('field-error');

    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: #ef4444;
        font-size: 0.875rem;
        margin-top: 4px;
        font-weight: 500;
    `;

    // Insert after field
    field.parentNode.insertBefore(errorDiv, field.nextSibling);

    // Add error styles to field
    field.style.borderColor = '#ef4444';
    field.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
}

function clearFieldError(field) {
    field.classList.remove('field-error');
    field.style.borderColor = '';
    field.style.boxShadow = '';

    const errorMessage = field.parentNode.querySelector('.field-error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateImageFile(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    return allowedTypes.includes(file.type) && file.size <= maxSize;
}

function showImagePreview(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const avatarCircle = document.querySelector('.avatar-circle');
        if (avatarCircle) {
            // Add loading animation
            avatarCircle.style.opacity = '0.5';
            avatarCircle.style.transform = 'scale(0.95)';

            setTimeout(() => {
                // Create image element
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.cssText = `
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: inherit;
                    transition: all 0.3s ease;
                `;

                // Replace avatar text with image with animation
                avatarCircle.innerHTML = '';
                avatarCircle.appendChild(img);

                // Animate back to normal
                avatarCircle.style.opacity = '1';
                avatarCircle.style.transform = 'scale(1)';

                // Add a subtle glow effect
                avatarCircle.style.boxShadow = '0 0 20px rgba(47, 94, 83, 0.3)';
                setTimeout(() => {
                    avatarCircle.style.boxShadow = 'var(--shadow-lg)';
                }, 1000);
            }, 300);
        }
    };

    reader.onerror = function() {
        showNotification('Error reading the selected file', 'error');
        const avatarCircle = document.querySelector('.avatar-circle');
        if (avatarCircle) {
            avatarCircle.style.opacity = '1';
            avatarCircle.style.transform = 'scale(1)';
        }
    };

    reader.readAsDataURL(file);
}

/* ============================================
   Animation Functions
   ============================================ */

function initializeAnimations() {
    // Add intersection observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });

    // Observe elements for scroll animations
    document.querySelectorAll('.stat-card, .profile-card').forEach(el => {
        observer.observe(el);
    });
}

function addPageAnimations() {
    // Add staggered animation to form groups
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach((group, index) => {
        group.style.opacity = '0';
        group.style.transform = 'translateY(20px)';
        group.style.transition = 'all 0.4s ease';

        setTimeout(() => {
            group.style.opacity = '1';
            group.style.transform = 'translateY(0)';
        }, 100 + (index * 50));
    });

    // Add animation to stat cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.5s ease';

        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 300 + (index * 100));
    });
}

/* ============================================
   Keyboard Shortcuts
   ============================================ */

document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + E to edit profile
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        const editBtn = document.getElementById('editProfileBtn');
        if (editBtn && editBtn.style.display !== 'none') {
            handleEditProfile();
        }
    }

    // Escape to cancel edit
    if (e.key === 'Escape') {
        const cancelBtn = document.getElementById('cancelEditBtn');
        if (cancelBtn && cancelBtn.style.display !== 'none') {
            handleCancelEdit();
        }
    }

    // Ctrl/Cmd + S to save (when editing)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const saveBtn = document.getElementById('saveProfileBtn');
        if (saveBtn && saveBtn.style.display !== 'none') {
            handleSaveProfile();
        }
    }
});

/* ============================================
   Error Handling
   ============================================ */

window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    showNotification('An error occurred. Please try again.', 'error');
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled Promise Rejection:', e.reason);
    showNotification('An error occurred. Please try again.', 'error');
});

/* ============================================
   Debug Functions (Remove in production)
   ============================================ */

function debugProfile() {
    console.log('Profile Debug Info:');
    console.log('User Name:', document.body.getAttribute('data-user-name'));
    console.log('Form Data:', getFormData());
    console.log('Form State:', {
        isEditing: document.getElementById('saveProfileBtn').style.display !== 'none'
    });
}

// Make debug function available globally (remove in production)
window.debugProfile = debugProfile;
