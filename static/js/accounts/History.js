function handleLogout(e) {
    e.preventDefault();
    
    if (typeof Modal === 'undefined') {
        console.error('Modal library not loaded');
        if (confirm('Are you sure you want to logout?')) {
            window.location.href = '/logout/';
        }
        return;
    }

    Modal.show({
        title: 'Logout Confirmation',
        message: 'Are you sure you want to logout? You will be redirected to the login page.',
        type: 'warning',
        icon: 'logout',
        confirmText: 'Logout',
        cancelText: 'Cancel',
        confirmDanger: true,
        onConfirm: () => {
            window.location.href = '/logout/';
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    initializeHistoryPage();
    initializeSidebarNavigation();
});

function initializeSidebarNavigation() {
    const logoutBtns = document.querySelectorAll('.logout-btn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', handleLogout);
    });
}

function initializeHistoryPage() {
    initializeFilters();
    initializeActionButtons();
    initializeTooltips();
    loadUserData();
}

// ============================================
// Filter and Sort Functionality
// ============================================

function initializeFilters() {
    const dateFilter = document.getElementById('date-filter');
    const sortSelect = document.getElementById('sort-select');
    const searchInput = document.getElementById('history-search');

    if (dateFilter) {
        dateFilter.addEventListener('change', function() {
            filterHistory();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortHistory(this.value);
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterHistory();
        });
    }
}

function filterHistory() {
    const dateFilter = document.getElementById('date-filter') ? document.getElementById('date-filter').value : 'all';
    const searchTerm = document.getElementById('history-search') ? document.getElementById('history-search').value.toLowerCase() : '';
    const rows = document.querySelectorAll('tbody tr');
    const currentDate = new Date();

    rows.forEach(row => {
        if (row.cells.length < 3) return;

        const dateText = row.cells[2].textContent.trim();
        const title = row.cells[0].textContent.trim().toLowerCase();
        const teacher = row.cells[1].textContent.trim().toLowerCase();
        
        const completionDate = new Date(dateText);
        let showDate = true;

        switch (dateFilter) {
            case 'week':
                const weekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
                showDate = completionDate >= weekAgo;
                break;
            case 'month':
                const monthAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());
                showDate = completionDate >= monthAgo;
                break;
            case 'semester':
                const semesterStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 4, 1);
                showDate = completionDate >= semesterStart;
                break;
            case 'all':
            default:
                showDate = true;
                break;
        }

        const showSearch = title.includes(searchTerm) || teacher.includes(searchTerm);
        row.style.display = (showDate && showSearch) ? '' : 'none';
    });
}

function sortHistory(sortValue) {
    const tbody = document.querySelector('tbody');
    if (!tbody) return;
    
    const rows = Array.from(tbody.querySelectorAll('tr'));

    rows.sort((a, b) => {
        if (a.cells.length < 3 || b.cells.length < 3) return 0;

        switch (sortValue) {
            case 'completion-date':
                const dateA = new Date(a.cells[2].textContent.trim());
                const dateB = new Date(b.cells[2].textContent.trim());
                return dateB - dateA;
            case 'title':
                const titleA = a.cells[0].textContent.trim().toLowerCase();
                const titleB = b.cells[0].textContent.trim().toLowerCase();
                return titleA.localeCompare(titleB);
            case 'teacher':
                const teacherA = a.cells[1].textContent.trim().toLowerCase();
                const teacherB = b.cells[1].textContent.trim().toLowerCase();
                return teacherA.localeCompare(teacherB);
            default:
                return 0;
        }
    });

    rows.forEach(row => tbody.appendChild(row));
}
    });

    // Re-append sorted cards
    cards.forEach(card => container.appendChild(card));

    // Add animation
    animateVisibleCards();
}

function animateVisibleCards() {
    const visibleCards = document.querySelectorAll('.history-card[style="display: flex"], .history-card:not([style])');
    visibleCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';

        setTimeout(() => {
            card.style.transition = 'all 0.3s ease-out';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 50);
    });
}

// ============================================
// Action Button Functionality
// ============================================

function initializeActionButtons() {
    const viewDetailsButtons = document.querySelectorAll('.action-btn.view-details');
    const deleteButtons = document.querySelectorAll('.action-btn.delete-btn');

    viewDetailsButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const historyCard = this.closest('.history-card');
            const surveyTitle = historyCard.querySelector('.survey-title').textContent;
            showSurveyDetails(surveyTitle, historyCard);
        });
    });

    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const historyCard = this.closest('.history-card');
            const surveyTitle = historyCard.querySelector('.survey-title').textContent;
            showDeleteConfirmation(surveyTitle, historyCard);
        });
    });
}

function showSurveyDetails(surveyTitle, cardElement) {
    // Navigate to the history details page
    console.log('Showing details for:', surveyTitle);

    // Extract survey information
    const teacherInfo = cardElement.querySelector('.teacher-info').textContent.trim();
    const completionInfo = cardElement.querySelector('.completion-info').textContent.trim();

    // Create a survey ID from the title (in real implementation, this would be an actual ID)
    const surveyId = surveyTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Navigate to history details page with parameters
    const params = new URLSearchParams({
        id: surveyId,
        title: surveyTitle,
        teacher: teacherInfo.replace('person', '').trim(),
        completion: completionInfo.replace('check_circle', '').replace('Completed:', '').trim()
    });

    window.location.href = `HistoryDetails.html?${params.toString()}`;
}

// ============================================
// Delete Confirmation Modal
// ============================================

let currentCardToDelete = null;

function showDeleteConfirmation(surveyTitle, cardElement) {
    const modal = document.getElementById('delete-modal');
    const modalSurveyTitle = modal.querySelector('.modal-survey-title');

    // Store reference to the card to delete
    currentCardToDelete = cardElement;

    // Set the survey title in the modal
    modalSurveyTitle.textContent = surveyTitle;

    // Show the modal
    modal.classList.add('show');

    // Setup event listeners if not already set
    setupModalListeners();
}

function setupModalListeners() {
    const modal = document.getElementById('delete-modal');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const confirmBtn = modal.querySelector('.confirm-btn');

    // Remove existing listeners to avoid duplicates
    const newCancelBtn = cancelBtn.cloneNode(true);
    const newConfirmBtn = confirmBtn.cloneNode(true);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    // Add new listeners
    newCancelBtn.addEventListener('click', closeDeleteModal);
    newConfirmBtn.addEventListener('click', confirmDelete);

    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeDeleteModal();
        }
    });

    // Close modal on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeDeleteModal();
        }
    });
}

function closeDeleteModal() {
    const modal = document.getElementById('delete-modal');
    modal.classList.remove('show');
    currentCardToDelete = null;
}

function confirmDelete() {
    if (currentCardToDelete) {
        // Add fade-out animation
        currentCardToDelete.style.transition = 'all 0.3s ease-out';
        currentCardToDelete.style.opacity = '0';
        currentCardToDelete.style.transform = 'translateX(-20px)';

        // Remove the card after animation
        setTimeout(() => {
            currentCardToDelete.remove();

            // Check if there are any cards left
            const remainingCards = document.querySelectorAll('.history-card');
            if (remainingCards.length === 0) {
                showEmptyState();
            }

            // Close the modal
            closeDeleteModal();

            // Show success message (optional)
            showDeleteSuccessMessage();
        }, 300);
    }
}

function showEmptyState() {
    const historyContainer = document.getElementById('history-container');
    historyContainer.innerHTML = `
        <div class="empty-state" style="text-align: center; padding: 60px 20px; color: var(--gray-500);">
            <span class="material-icons" style="font-size: 80px; color: var(--gray-400);">history</span>
            <h3 style="margin-top: 20px; color: var(--gray-700);">No History Yet</h3>
            <p style="margin-top: 10px;">Your completed surveys will appear here.</p>
        </div>
    `;
}

function showDeleteSuccessMessage() {
    // Create a temporary success message
    const message = document.createElement('div');
    message.className = 'delete-success-message';
    message.innerHTML = `
        <span class="material-icons">check_circle</span>
        Survey deleted successfully
    `;
    message.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: var(--success);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
        z-index: 9999;
        animation: slideInRight 0.3s ease-out;
    `;

    document.body.appendChild(message);

    // Remove after 3 seconds
    setTimeout(() => {
        message.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(message);
        }, 300);
    }, 3000);
}

// ============================================
// Navigation Functions
// ============================================

function goToHome() {
    // Go to root; server-side view will redirect based on user type
    window.location.href = '/';
}

function goToSurveyList() {
    // Surveys list is served under /surveys/ (see surveys.urls)
    window.location.href = '/surveys/';
}

// ============================================
// Tooltip System
// ============================================

function initializeTooltips() {
    const buttonsWithTooltips = document.querySelectorAll('[data-tooltip]');

    buttonsWithTooltips.forEach(button => {
        let tooltip;

        button.addEventListener('mouseenter', function() {
            const tooltipText = this.getAttribute('data-tooltip');
            tooltip = createTooltip(tooltipText);
            document.body.appendChild(tooltip);
            positionTooltip(tooltip, this);
        });

        button.addEventListener('mouseleave', function() {
            if (tooltip) {
                document.body.removeChild(tooltip);
                tooltip = null;
            }
        });
    });
}

function createTooltip(text) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = text;
    tooltip.style.cssText = `
        position: absolute;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 0.8rem;
        font-weight: 500;
        white-space: nowrap;
        z-index: 10000;
        pointer-events: none;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.2s ease-out;
    `;

    // Trigger animation
    setTimeout(() => {
        tooltip.style.opacity = '1';
        tooltip.style.transform = 'translateY(0)';
    }, 10);

    return tooltip;
}

function positionTooltip(tooltip, element) {
    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    tooltip.style.left = `${rect.left + (rect.width / 2) - (tooltipRect.width / 2)}px`;
    tooltip.style.top = `${rect.bottom + 8}px`;
}

// ============================================
// User Data Loading
// ============================================

function loadUserData() {
    const userName = document.body.getAttribute('data-user-name');

    // Update any user-specific elements if needed
    console.log('Loaded user:', userName);

    // This function can be extended to load actual user history data from the backend
    loadHistoryData();
}

function loadHistoryData() {
    // This would typically make an AJAX call to fetch user's survey history
    // For now, we're using static data in the HTML

    console.log('Loading history data...');

    // Example of how you might load data dynamically:
    /*
    fetch('/api/user-history/')
        .then(response => response.json())
        .then(data => {
            populateHistoryGrid(data);
        })
        .catch(error => {
            console.error('Error loading history data:', error);
        });
    */
}

function populateHistoryGrid(historyData) {
    const container = document.getElementById('history-container');

    // Clear existing content
    container.innerHTML = '';

    // Populate with new data
    historyData.forEach(survey => {
        const card = createHistoryCard(survey);
        container.appendChild(card);
    });

    // Re-initialize action buttons
    initializeActionButtons();
}

function createHistoryCard(surveyData) {
    const card = document.createElement('div');
    card.className = 'history-card';
    card.setAttribute('data-completion', surveyData.completionDate);

    card.innerHTML = `
        <div class="history-card-main">
            <div class="survey-icon">
                <span class="material-icons">assignment_turned_in</span>
            </div>
            <div class="survey-info">
                <h3 class="survey-title">${surveyData.title}</h3>
                <div class="survey-meta">
                    <span class="teacher-info">
                        <span class="material-icons">person</span>
                        ${surveyData.teacher}
                    </span>
                    <span class="completion-info">
                        <span class="material-icons">check_circle</span>
                        Completed: ${surveyData.completionDate}
                    </span>
                </div>
            </div>
        </div>
        <div class="history-actions">
            <div class="status-badge completed">
                <span class="status-dot"></span>
                COMPLETED
            </div>
            <button class="action-btn view-details">
                <span class="material-icons">visibility</span>
                View Details
            </button>
        </div>
    `;

    return card;
}

// ============================================
// Utility Functions
// ============================================

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================
// Error Handling
// ============================================

window.addEventListener('error', function(e) {
    console.error('History page error:', e.error);
    // You might want to show a user-friendly error message here
});

// Export functions for testing purposes (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        filterHistoryByDate,
        sortHistory,
        showSurveyDetails,
        formatDate
    };
}
