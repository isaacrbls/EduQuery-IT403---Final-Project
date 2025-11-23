document.addEventListener('DOMContentLoaded', function() {
    // Modal Elements
    const modal = document.getElementById('section-modal');
    const createBtn = document.getElementById('create-section-btn');
    const closeBtns = document.querySelectorAll('.close-modal');
    const form = document.getElementById('section-form');
    const modalTitle = document.getElementById('modal-title');
    
    // Open Modal for Create
    createBtn.addEventListener('click', () => {
        modalTitle.textContent = 'Create New Section';
        form.reset();
        document.getElementById('section-id').value = '';
        modal.classList.add('active');
    });

    // Close Modal
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    });

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    // Edit Section
    document.querySelectorAll('.edit-section-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            modalTitle.textContent = 'Edit Section';
            
            // Populate form
            document.getElementById('section-id').value = btn.dataset.id;
            document.getElementById('section-name').value = btn.dataset.name;
            document.getElementById('section-code').value = btn.dataset.code;
            document.getElementById('academic-year').value = btn.dataset.year;
            document.getElementById('semester').value = btn.dataset.semester;
            document.getElementById('description').value = btn.dataset.description;
            
            modal.classList.add('active');
        });
    });

    // Handle Form Submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const sectionId = data.id;
        
        // Determine URL and Method
        const url = sectionId 
            ? `/api/accounts/sections/${sectionId}/` 
            : '/api/accounts/sections/';
        const method = sectionId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                window.location.reload();
            } else {
                const errorData = await response.json();
                Modal.alert({
                    title: 'Error',
                    message: 'Error: ' + JSON.stringify(errorData),
                    type: 'danger',
                    icon: 'error'
                });
            }
        } catch (error) {
            console.error('Error:', error);
            Modal.alert({
                title: 'Error',
                message: 'An error occurred while saving the section.',
                type: 'danger',
                icon: 'error'
            });
        }
    });

    // Tab Switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => {
                c.classList.remove('active');
                c.style.display = 'none';
            });

            // Add active class to clicked button
            btn.classList.add('active');

            // Show corresponding content
            const tabId = btn.dataset.tab;
            const content = document.getElementById(tabId);
            content.classList.add('active');
            content.style.display = 'grid';
        });
    });

    // Archive Section
    document.querySelectorAll('.archive-section-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const sectionId = btn.dataset.id;
            Modal.show({
                title: 'Archive Section',
                message: 'Are you sure you want to archive this section? It will be moved to the archived tab.',
                type: 'warning',
                icon: 'archive',
                confirmText: 'Archive',
                onConfirm: async () => {
                    await updateSectionStatus(sectionId, true);
                }
            });
        });
    });

    // Restore Section
    document.querySelectorAll('.restore-section-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const sectionId = btn.dataset.id;
            Modal.show({
                title: 'Restore Section',
                message: 'Are you sure you want to restore this section? It will be moved back to active sections.',
                type: 'info',
                icon: 'unarchive',
                confirmText: 'Restore',
                onConfirm: async () => {
                    await updateSectionStatus(sectionId, false);
                }
            });
        });
    });

    async function updateSectionStatus(sectionId, isArchived) {
        try {
            const response = await fetch(`/api/accounts/sections/${sectionId}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({ is_archived: isArchived })
            });

            if (response.ok) {
                window.location.reload();
            } else {
                const errorData = await response.json();
                Modal.alert({
                    title: 'Error',
                    message: 'Error: ' + JSON.stringify(errorData),
                    type: 'danger',
                    icon: 'error'
                });
            }
        } catch (error) {
            console.error('Error:', error);
            Modal.alert({
                title: 'Error',
                message: 'An error occurred while updating the section.',
                type: 'danger',
                icon: 'error'
            });
        }
    }

    // View Students Modal
    const studentsModal = document.getElementById('view-students-modal');
    const closeStudentsBtns = document.querySelectorAll('.close-modal-students');
    const studentsContainer = document.getElementById('students-list-container');

    // Close Students Modal
    closeStudentsBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            studentsModal.classList.remove('active');
        });
    });

    // Close on outside click (Students Modal)
    window.addEventListener('click', (e) => {
        if (e.target === studentsModal) {
            studentsModal.classList.remove('active');
        }
    });

    // View Students Button Click
    document.querySelectorAll('.view-students-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const sectionId = btn.dataset.id;
            studentsModal.classList.add('active');
            studentsContainer.innerHTML = `
                <div class="loading-spinner" style="text-align: center; padding: 20px;">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p style="margin-top: 10px; color: var(--gray-500);">Loading students...</p>
                </div>
            `;

            try {
                const response = await fetch(`/api/accounts/sections/${sectionId}/students/`, {
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken')
                    }
                });

                if (response.ok) {
                    const students = await response.json();
                    renderStudentsList(students);
                } else {
                    studentsContainer.innerHTML = '<p class="error-message" style="text-align: center; color: var(--danger);">Failed to load students.</p>';
                }
            } catch (error) {
                console.error('Error:', error);
                studentsContainer.innerHTML = '<p class="error-message" style="text-align: center; color: var(--danger);">An error occurred.</p>';
            }
        });
    });

    function renderStudentsList(students) {
        if (students.length === 0) {
            studentsContainer.innerHTML = `
                <div class="empty-state" style="padding: 30px; text-align: center; color: var(--gray-500);">
                    <span class="material-icons" style="font-size: 48px; margin-bottom: 10px; color: var(--gray-300);">school</span>
                    <p>No students enrolled in this section yet.</p>
                </div>
            `;
            return;
        }

        const listHtml = students.map(student => `
            <div class="student-item" style="display: flex; align-items: center; padding: 12px; border-bottom: 1px solid #e5e7eb; transition: background-color 0.2s;">
                <div class="student-avatar" style="width: 40px; height: 40px; border-radius: 50%; background: #d1fae5; color: #065f46; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: 600; font-size: 14px;">
                    ${student.first_name ? student.first_name[0].toUpperCase() : ''}${student.last_name ? student.last_name[0].toUpperCase() : ''}
                </div>
                <div class="student-info">
                    <h4 style="margin: 0; font-size: 14px; font-weight: 600; color: #1f2937;">${student.first_name} ${student.last_name}</h4>
                    <p style="margin: 2px 0 0; font-size: 12px; color: #6b7280;">${student.email}</p>
                </div>
            </div>
        `).join('');

        studentsContainer.innerHTML = listHtml;
    }

    // Logout Handler
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }

    // Helper to get CSRF token
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
});

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
            window.location.href = '/accounts/logout/';
        }
    });
}
