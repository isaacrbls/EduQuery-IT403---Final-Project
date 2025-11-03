/* ============================================
   EduQuery Profile Page - JavaScript Functionality
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the profile page
    initializeProfile();
    initializeEventListeners();
    initializeAnimations();
});

/* ============================================
   Profile Initialization
   ============================================ */

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

    // Change Profile Picture Button
    const changeProfileBtn = document.querySelector('.change-profile-btn');
    if (changeProfileBtn) {
        changeProfileBtn.addEventListener('click', handleChangeProfilePicture);
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
    window.location.href = 'StudentDashboard.html';
}

function goToSurveyList() {
    console.log('Navigating to Survey List...');
    // Add your navigation logic here
    window.location.href = 'SurveyListdashboard.html';
}

function goToHistory() {
    console.log('Navigating to History...');
    // Add your navigation logic here
    window.location.href = 'History.html';
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        console.log('Logging out...');
        // Add your logout logic here
        // window.location.href = 'SignIn.html';
    }
}

/* ============================================
   Profile Management Functions
   ============================================ */

function handleEditProfile() {
    console.log('Enabling edit mode...');

    // Enable form inputs
    setFormReadOnly(false);

    // Toggle buttons
    toggleEditButtons(true);

    // Focus on first input
    const nameInput = document.getElementById('name');
    if (nameInput) {
        nameInput.focus();
        nameInput.select();
    }

    // Add visual feedback
    showNotification('Edit mode enabled', 'info');
}

function handleSaveProfile() {
    console.log('Saving profile...');

    // Validate form
    if (!validateForm()) {
        return;
    }

    // Get form data
    const formData = getFormData();

    // Show loading state
    const saveBtn = document.getElementById('saveProfileBtn');
    if (saveBtn) {
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;

        // Simulate save operation
        setTimeout(() => {
            // Reset button
            saveBtn.textContent = originalText;
            saveBtn.disabled = false;

            // Disable edit mode
            setFormReadOnly(true);
            toggleEditButtons(false);

            // Show success message
            showNotification('Profile updated successfully!', 'success');

            // Here you would typically send the data to your backend
            console.log('Form data to save:', formData);
        }, 1500);
    }
}

function handleCancelEdit() {
    console.log('Cancelling edit...');

    if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
        // Reset form to original values
        resetFormData();

        // Disable edit mode
        setFormReadOnly(true);
        toggleEditButtons(false);

        // Show notification
        showNotification('Changes cancelled', 'info');
    }
}

function handleChangeProfilePicture() {
    console.log('Changing profile picture...');

    // Show loading state on button
    const changeBtn = document.querySelector('.change-profile-btn');
    const originalText = changeBtn.innerHTML;
    changeBtn.innerHTML = 'Selecting...';
    changeBtn.disabled = true;

    // Create file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/jpeg,image/jpg,image/png,image/gif';
    fileInput.style.display = 'none';

    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Show processing state
            changeBtn.innerHTML = 'Processing...';

            // Validate file
            if (validateImageFile(file)) {
                // Show preview with animation
                showImagePreview(file);
                showNotification(`Profile picture updated! (${file.name})`, 'success');

                // Reset button after success
                setTimeout(() => {
                    changeBtn.innerHTML = 'Updated!';
                    setTimeout(() => {
                        changeBtn.innerHTML = originalText;
                        changeBtn.disabled = false;
                    }, 1500);
                }, 500);
            } else {
                showNotification('Please select a valid image file (JPG, PNG, GIF) under 5MB', 'error');
                // Reset button on error
                changeBtn.innerHTML = originalText;
                changeBtn.disabled = false;
            }
        } else {
            // Reset button if no file selected
            changeBtn.innerHTML = originalText;
            changeBtn.disabled = false;
        }

        // Clean up
        if (document.body.contains(fileInput)) {
            document.body.removeChild(fileInput);
        }
    });

    // Handle cancel (when user closes file dialog without selecting)
    fileInput.addEventListener('cancel', function() {
        changeBtn.innerHTML = originalText;
        changeBtn.disabled = false;
    });

    document.body.appendChild(fileInput);
    fileInput.click();
}

/* ============================================
   Form Management Functions
   ============================================ */

function setFormReadOnly(readonly) {
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
        // All fields should be readonly by default, only editable when in edit mode
        input.readOnly = readonly;

        // Update visual styling based on readonly state
        if (readonly) {
            input.classList.add('readonly-mode');
        } else {
            input.classList.remove('readonly-mode');
        }
    });
}

function toggleEditButtons(isEditing) {
    const editBtn = document.getElementById('editProfileBtn');
    const saveBtn = document.getElementById('saveProfileBtn');
    const cancelBtn = document.getElementById('cancelEditBtn');

    if (editBtn) editBtn.style.display = isEditing ? 'none' : 'flex';
    if (saveBtn) saveBtn.style.display = isEditing ? 'flex' : 'none';
    if (cancelBtn) cancelBtn.style.display = isEditing ? 'flex' : 'none';
}

function validateForm() {
    const requiredFields = ['name', 'email'];
    let isValid = true;

    requiredFields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field && !field.value.trim()) {
            showFieldError(field, `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`);
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
    // Reset to original values (you would get these from your backend)
    const userName = document.body.getAttribute('data-user-name') || 'Khy User';
    const userEmail = 'khy@example.com'; // This would come from your backend

    document.getElementById('name').value = userName;
    document.getElementById('email').value = userEmail;
    document.getElementById('confirmEmail').value = userEmail;
    document.getElementById('position').value = 'Student';
    document.getElementById('section').value = 'IT-401';
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
