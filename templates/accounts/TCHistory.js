/**
 * EduQuery Teacher History Dashboard JavaScript
 * Manages survey history for teachers
 */

// Navigation functions
function goToHome() {
    window.location.href = 'TeacherDashboard.html';
}

function goToSurveyList() {
    window.location.href = 'TCsurveyList.html';
}

function viewDetails(surveyId) {
    window.location.href = `TCHistoryDetails.html?id=${surveyId}`;
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeHistory();
    setupFilters();
    initializeDeleteButtons();
});

function initializeHistory() {
    // Sidebar active state
    const sidebarBtns = document.querySelectorAll('.sidebar-btn');
    sidebarBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            sidebarBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// ============================================
// Delete Confirmation Modal
// ============================================

let currentCardToDelete = null;

function initializeDeleteButtons() {
    const deleteButtons = document.querySelectorAll('.action-btn.delete-btn');

    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const historyCard = this.closest('.history-card');
            const surveyTitle = historyCard.querySelector('.survey-title').textContent;
            showDeleteConfirmation(surveyTitle, historyCard);
        });
    });
}

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

            // Show success message
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
            <p style="margin-top: 10px;">Your closed surveys will appear here.</p>
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

function setupFilters() {
    const dateFilter = document.getElementById('date-filter');
    const sortSelect = document.getElementById('sort-select');

    if (dateFilter) {
        dateFilter.addEventListener('change', filterByDate);
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', sortCards);
    }
}

function filterByDate() {
    const filterValue = document.getElementById('date-filter').value;
    const historyCards = document.querySelectorAll('.history-card');
    const now = new Date();

    historyCards.forEach(card => {
        const cardDate = new Date(card.getAttribute('data-date'));
        let showCard = true;

        switch(filterValue) {
            case 'week':
                const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                showCard = cardDate >= oneWeekAgo;
                break;
            case 'month':
                const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                showCard = cardDate >= oneMonthAgo;
                break;
            case 'semester':
                const fourMonthsAgo = new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000);
                showCard = cardDate >= fourMonthsAgo;
                break;
            case 'all':
            default:
                showCard = true;
        }

        card.style.display = showCard ? 'flex' : 'none';
    });
}

function sortCards() {
    const sortValue = document.getElementById('sort-select').value;
    const container = document.getElementById('history-container');
    const cards = Array.from(container.querySelectorAll('.history-card'));

    cards.sort((a, b) => {
        switch(sortValue) {
            case 'date-created':
                return new Date(b.getAttribute('data-date')) - new Date(a.getAttribute('data-date'));

            case 'title':
                const titleA = a.querySelector('.survey-title').textContent.toLowerCase();
                const titleB = b.querySelector('.survey-title').textContent.toLowerCase();
                return titleA.localeCompare(titleB);

            case 'responses':
                const responsesA = parseInt(a.querySelector('.response-count .count').textContent);
                const responsesB = parseInt(b.querySelector('.response-count .count').textContent);
                return responsesB - responsesA;

            case 'status':
                const statusA = a.getAttribute('data-status');
                const statusB = b.getAttribute('data-status');
                return statusA.localeCompare(statusB);

            default:
                return 0;
        }
    });

    // Re-append sorted cards
    cards.forEach(card => container.appendChild(card));
}

