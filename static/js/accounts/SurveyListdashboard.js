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

function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');

    button.appendChild(ripple);

    setTimeout(() => {
        ripple.remove();
    }, 600);
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

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 20px;
        border-radius: 12px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    `;

    switch(type) {
        case 'success':
            notification.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
            break;
        case 'warning':
            notification.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
            break;
        default:
            notification.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
    }, 3000);
}

function initializeSidebarNavigation() {
    const sidebarBtns = document.querySelectorAll('.sidebar-btn');
    sidebarBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const label = this.getAttribute('aria-label');
            if (label === 'Home') {
                goToHome();
            } else if (label === 'Survey List') {
                goToSurveyList();
            } else if (label === 'Survey History' || label === 'History') {
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

document.addEventListener('DOMContentLoaded', function() {
    initializeSidebarNavigation();
    setTimeout(updateResultsCount, 100);
});
/**
 * EduQuery Survey List Dashboard JavaScript
 * Enhanced functionality for survey list management and submission viewing
 */

// Sample submission data with pictures
const submissionData = {
    'database-design': {
        title: 'Database Design Assessment',
        submittedDate: 'October 28, 2025',
        submissionTime: '14:32',
        responses: [
            {
                question: 'Rate the overall course content quality',
                answer: 'Excellent',
                type: 'rating'
            },
            {
                question: 'How would you improve the database normalization lessons?',
                answer: 'More practical examples and hands-on exercises would be helpful. The theoretical concepts were clear but needed more real-world applications.',
                type: 'text'
            },
            {
                question: 'Please upload a screenshot of your final database schema',
                answer: 'database-schema-submission.png',
                type: 'image',
                imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjM2MCIgaGVpZ2h0PSIyNjAiIGZpbGw9IndoaXRlIiBzdHJva2U9IiNFNUU3RUIiIHN0cm9rZS13aWR0aD0iMiIvPgo8dGV4dCB4PSIyMDAiIHk9IjUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMzc0MTUxIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZvbnQtd2VpZ2h0PSJib2xkIj5EYXRhYmFzZSBTY2hlbWEgRGlhZ3JhbTwvdGV4dD4KPCEtLSBUYWJsZSAxOiBVc2VycyAtLT4KPHJlY3QgeD0iNTAiIHk9IjgwIiB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzJGNUU1MyIgcng9IjgiLz4KPHR1eHQgeD0iMTEwIiB5PSIxMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIj5Vc2VyczwvdGV4dD4KPHR1eHQgeD0iNjAiIHk9IjEyMCIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCI+aWQgKFBLKTwvdGV4dD4KPHR1eHQgeD0iNjAiIHk9IjEzNSIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCI+bmFtZTwvdGV4dD4KPHR1eHQgeD0iNjAiIHk9IjE1MCIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCI+ZW1haWw8L3RleHQ+Cjx0ZXh0IHg9IjYwIiB5PSIxNjUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiPmNyZWF0ZWRfYXQ8L3RleHQ+CjwhLS0gVGFibGUgMjogU3VydmV5cyAtLT4KPHJlY3QgeD0iMjMwIiB5PSI4MCIgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMyRjVFNTMiIHJ4PSI4Ii8+Cjx0ZXh0IHg9IjI5MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCI+U3VydmV5czwvdGV4dD4KPHR1eHQgeD0iMjQwIiB5PSIxMjAiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiPmlkIChQSyk8L3RleHQ+Cjx0ZXh0IHg9IjI0MCIgeT0iMTM1IiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIj50aXRsZTwvdGV4dD4KPHR1eHQgeD0iMjQwIiB5PSIxNTAiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiPnRlYWNoZXJfaWQgKEZLKTwvdGV4dD4KPHR1eHQgeD0iMjQwIiB5PSIxNjUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiPmR1ZV9kYXRlPC90ZXh0Pgo8IS0tIFRhYmxlIDM6IFJlc3BvbnNlcyAtLT4KPHJlY3QgeD0iMTQwIiB5PSIyMDAiIHdpZHRoPSIxMjAiIGhlaWdodD0iODAiIGZpbGw9IiMyRjVFNTMiIHJ4PSI4Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCI+UmVzcG9uc2VzPC90ZXh0Pgo8dGV4dCB4PSIxNTAiIHk9IjI0MCIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCI+aWQgKFBLKTwvdGV4dD4KPHR1eHQgeD0iMTUwIiB5PSIyNTUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiPnVzZXJfaWQgKEZLKTwvdGV4dD4KPHR1eHQgeD0iMTUwIiB5PSIyNzAiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiPnN1cnZleV9pZCAoRkspPC90ZXh0Pgo8IS0tIFJlbGF0aW9uc2hpcCBsaW5lcyAtLT4KPGxpbmUgeDE9IjE3MCIgeTE9IjEzMCIgeDI9IjIzMCIgeTI9IjEzMCIgc3Ryb2tlPSIjNjU3M0ZGIiBzdHJva2Utd2lkdGg9IjIiLz4KPGxpbmUgeDE9IjE3MCIgeTE9IjE4MCIgeDI9IjIwMCIgeTI9IjIwMCIgc3Ryb2tlPSIjNjU3M0ZGIiBzdHJva2Utd2lkdGg9IjIiLz4KPGxpbmUgeDE9IjI5MCIgeTE9IjE4MCIgeDI9IjIwMCIgeTI9IjIwMCIgc3Ryb2tlPSIjNjU3M0ZGIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+'
            }
        ],
        completionPercentage: 100,
        timeSpent: '8 minutes'
    },
    'algorithm-design': {
        title: 'Algorithm Design Course Feedback',
        submittedDate: 'October 25, 2025',
        submissionTime: '16:45',
        responses: [
            {
                question: 'Rate your understanding of algorithm complexity',
                answer: 'Good',
                type: 'rating'
            },
            {
                question: 'Share your Big-O notation analysis diagram',
                answer: 'big-o-analysis.png',
                type: 'image',
                imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjlGQUZCIi8+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjM2MCIgaGVpZ2h0PSIyNjAiIGZpbGw9IndoaXRlIiBzdHJva2U9IiNFNUU3RUIiIHN0cm9rZS13aWR0aD0iMiIvPgo8dGV4dCB4PSIyMDAiIHk9IjUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMzc0MTUxIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZvbnQtd2VpZ2h0PSJib2xkIj5CaWctTyBDb21wbGV4aXR5IENoYXJ0PC90ZXh0Pgo8IS0tIEF4ZXMgLS0+CjxsaW5lIHgxPSI2MCIgeTE9IjI0MCIgeDI9IjM0MCIgeTI9IjI0MCIgc3Ryb2tlPSIjMzc0MTUxIiBzdHJva2Utd2lkdGg9IjIiLz4KPGxpbmUgeDE9IjYwIiB5MT0iMjQwIiB4Mj0iNjAiIHkyPSI4MCIgc3Ryb2tlPSIjMzc0MTUxIiBzdHJva2Utd2lkdGg9IjIiLz4KPHR1eHQgeD0iMjAwIiB5PSIyNjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMzNzQxNTEiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiI+SW5wdXQgU2l6ZSAobik8L3RleHQ+Cjx0ZXh0IHg9IjMwIiB5PSIxNjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiMzNzQxNTEiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgdHJhbnNmb3JtPSJyb3RhdGUoLTkwIDMwIDE2MCkiPlRpbWUgQ29tcGxleGl0eTwvdGV4dD4KPCEtLSBPKDEpIC0gQ29uc3RhbnQgLS0+CjxsaW5lIHgxPSI4MCIgeTE9IjIyMCIgeDI9IjMyMCIgeTI9IjIyMCIgc3Ryb2tlPSIjMjJDNTVFIiBzdHJva2Utd2lkdGg9IjMiLz4KPHR1eHQgeD0iMzMwIiB5PSIyMjQiIGZpbGw9IiMyMkM1NUUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZm9udC13ZWlnaHQ9ImJvbGQiPk8oMSk8L3RleHQ+CjwhLS0gTyhuKSAtIExpbmVhciAtLT4KPGxpbmUgeDE9IjgwIiB5MT0iMjIwIiB4Mj0iMzIwIiB5Mj0iMTIwIiBzdHJva2U9IiMzQjgyRjYiIHN0cm9rZS13aWR0aD0iMyIvPgo8dGV4dCB4PSIzMzAiIHk9IjEyNCIgZmlsbD0iIzNCODJGNiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iYm9sZCI+TyhuKTwvdGV4dD4KPCEtLSBPKG5eMikgLSBRdWFkcmF0aWMgLS0+CjxwYXRoIGQ9Ik04MCAyMjAgUTEyMCAyMDAgMTYwIDE2MCBRMjAwIDEyMCAyNDAgMTAwIFEyODAgOTAgMzIwIDkwIiBzdHJva2U9IiNGNTlFMEIiIHN0cm9rZS13aWR0aD0iMyIgZmlsbD0ibm9uZSIvPgo8dGV4dCB4PSIzMzAiIHk9Ijk0IiBmaWxsPSIjRjU5RTBCIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSJib2xkIj5PKG7Csik8L3RleHQ+CjwhLS0gTygyXm4pIC0gRXhwb25lbnRpYWwgLS0+CjxwYXRoIGQ9Ik04MCAyMjAgUTEwMCAyMTAgMTIwIDIwMCBRMTQwIDE4MCAxNjAgMTQwIFExODAgMTAwIDIwMCA4MCBRIDI0MCA3MCAyODAgNzAiIHN0cm9rZT0iI0VGNDQ0NCIgc3Ryb2tlLXdpZHRoPSIzIiBmaWxsPSJub25lIi8+Cjx0ZXh0IHg9IjI5MCIgeT0iNzQiIGZpbGw9IiNFRjQ0NDQiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZm9udC13ZWlnaHQ9ImJvbGQiPk8oMsKhKTwvdGV4dD4KPCEtLSBMZWdlbmQgLS0+CjxyZWN0IHg9IjI0MCIgeT0iMTcwIiB3aWR0aD0iMTQwIiBoZWlnaHQ9IjYwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuOSkiIHN0cm9rZT0iI0U1RTdFQiIgcng9IjQiLz4KPHR1eHQgeD0iMjUwIiB5PSIxODUiIGZpbGw9IiMzNzQxNTEiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZm9udC13ZWlnaHQ9ImJvbGQiPkFsZ29yaXRobSBDb21wYXJpc29uOjwvdGV4dD4KPHR1eHQgeD0iMjUwIiB5PSIyMDAiIGZpbGw9IiMzNzQxNTEiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI5Ij5CaW5hcnkgU2VhcmNoOiBPKGxvZyBuKTwvdGV4dD4KPHR1eHQgeD0iMjUwIiB5PSIyMTIiIGZpbGw9IiMzNzQxNTEiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI5Ij5RdWljayBTb3J0OiBPKG4gbG9nIG4pPC90ZXh0Pgo8dGV4dCB4PSIyNTAiIHk9IjIyNCIgZmlsbD0iIzM3NDE1MSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjkiPk1lcmdlIFNvcnQ6IE8obiBsb2cgbik8L3RleHQ+Cjwvc3ZnPg=='
            },
            {
                question: 'What was the most challenging topic?',
                answer: 'Dynamic programming was initially difficult to understand, but the step-by-step examples really helped clarify the concept.',
                type: 'text'
            }
        ],
        completionPercentage: 100,
        timeSpent: '6 minutes'
    }
};

// Navigation functions
function goToHome() {
    window.location.href = '/student/dashboard/';
}

// Main dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupEventListeners();
    setupSearchAndFilters();
    setupModalHandlers();
    animateElements();
});

function initializeDashboard() {
    // Set user name from Django context
    const body = document.body;
    const name = (body.getAttribute('data-user-name') || 'Khy').trim();
    const userNameSpan = document.getElementById('userName');

    if (userNameSpan) userNameSpan.textContent = name || 'Khy';

    console.log('Survey List Dashboard initialized for user:', name);

    // Add click handlers for sidebar buttons
    const sidebarBtns = document.querySelectorAll('.sidebar-btn');
    sidebarBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            sidebarBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Initialize survey card animations and ensure all cards are visible
    const surveyCards = document.querySelectorAll('.survey-card');
    surveyCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 100}ms`;
        // Ensure all cards are visible by default
        card.style.display = '';
        card.classList.add('fade-in');
    });

    // Reset filters to default values
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        statusFilter.value = 'all';
    }
}

function setupEventListeners() {
    // Survey action buttons
    const surveyBtns = document.querySelectorAll('.survey-btn');
    surveyBtns.forEach(btn => {
        if (!btn.classList.contains('disabled') && !btn.classList.contains('completed')) {
            btn.addEventListener('click', handleSurveyAction);
        }
    });

    // View submission buttons
    const viewSubmissionBtns = document.querySelectorAll('.view-submission');
    viewSubmissionBtns.forEach(btn => {
        btn.addEventListener('click', handleViewSubmission);
    });

    // Refresh button
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshSurveys);
    }

    // View toggle buttons
    const viewToggles = document.querySelectorAll('.view-toggle');
    viewToggles.forEach(toggle => {
        toggle.addEventListener('click', handleViewToggle);
    });

    // Overview stats - make them clickable
    const overviewStats = document.querySelectorAll('.overview-stat');
    overviewStats.forEach(stat => {
        stat.addEventListener('click', handleStatClick);
    });

    // Add ripple effect to all buttons
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', createRipple);
    });
}

function setupSearchAndFilters() {
    // Search functionality
    const searchInput = document.getElementById('survey-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }

    // Filter functionality - reload page with query params
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        // Set current value from URL
        const urlParams = new URLSearchParams(window.location.search);
        const currentStatus = urlParams.get('status');
        if (currentStatus) {
            statusFilter.value = currentStatus;
        }
        
        statusFilter.addEventListener('change', function() {
            const url = new URL(window.location);
            url.searchParams.set('status', this.value);
            url.searchParams.delete('page'); // Reset to page 1
            window.location.href = url.toString();
        });
    }

    // Sort functionality
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSort);
    }
}

function setupModalHandlers() {
    const modal = document.getElementById('submissionModal');
    const closeBtn = document.getElementById('closeModal');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Close modal when clicking overlay
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });
}

function handleSurveyAction(e) {
    const button = e.currentTarget;
    const surveyCard = button.closest('.survey-card');
    const surveyTitle = surveyCard.querySelector('.survey-title').textContent;

    if (button.classList.contains('urgent')) {
        showNotification(`Opening overdue survey: ${surveyTitle}`, 'warning');
    } else {
        showNotification(`Opening survey: ${surveyTitle}`, 'info');
    }

    // Simulate loading state
    button.classList.add('loading');
    button.innerHTML = '<span class="material-icons">hourglass_empty</span> Opening...';

    setTimeout(() => {
        button.classList.remove('loading');
        button.innerHTML = '<span class="material-icons">play_arrow</span> Take Survey';
        showNotification('Survey opened successfully!', 'success');
    }, 2000);
}

function handleViewSubmission(e) {
    const button = e.currentTarget;
    const surveyId = button.getAttribute('data-survey');

    if (submissionData[surveyId]) {
        showSubmissionModal(submissionData[surveyId]);
    } else {
        showNotification('Submission data not available', 'error');
    }
}

function showSubmissionModal(submission) {
    const modal = document.getElementById('submissionModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');

    modalTitle.textContent = `${submission.title} - Submission Details`;

    let contentHTML = `
        <div class="submission-header">
            <div class="submission-info">
                <div class="info-item">
                    <span class="material-icons">calendar_today</span>
                    <span>Submitted: ${submission.submittedDate}</span>
                </div>
                <div class="info-item">
                    <span class="material-icons">access_time</span>
                    <span>Time: ${submission.submissionTime}</span>
                </div>
                <div class="info-item">
                    <span class="material-icons">timer</span>
                    <span>Duration: ${submission.timeSpent}</span>
                </div>
                <div class="info-item">
                    <span class="material-icons">check_circle</span>
                    <span>Completion: ${submission.completionPercentage}%</span>
                </div>
            </div>
        </div>
        <div class="submission-responses">
            <h4>Responses:</h4>
    `;

    submission.responses.forEach((response, index) => {
        contentHTML += `
            <div class="response-item">
                <div class="response-question">
                    <span class="question-number">${index + 1}.</span>
                    ${response.question}
                </div>
                <div class="response-answer">
        `;

        if (response.type === 'image') {
            contentHTML += `
                <div class="image-submission">
                    <div class="image-container">
                        <img src="${response.imageUrl}" alt="Student submission" class="submission-image" />
                        <div class="image-overlay">
                            <button class="image-expand" onclick="expandImage('${response.imageUrl}')">
                                <span class="material-icons">zoom_in</span>
                                View Full Size
                            </button>
                        </div>
                    </div>
                    <p class="image-filename">📎 ${response.answer}</p>
                </div>
            `;
        } else {
            contentHTML += `<p>${response.answer}</p>`;
        }

        contentHTML += `
                </div>
            </div>
        `;
    });

    contentHTML += `
        </div>
        <div class="submission-actions">
            <button class="action-btn secondary" onclick="downloadSubmission('${submission.title}')">
                <span class="material-icons">download</span>
                Download PDF
            </button>
            <button class="action-btn primary" onclick="printSubmission()">
                <span class="material-icons">print</span>
                Print
            </button>
        </div>
    `;

    modalContent.innerHTML = contentHTML;

    // Add CSS for submission modal content
    if (!document.getElementById('submission-modal-styles')) {
        const style = document.createElement('style');
        style.id = 'submission-modal-styles';
        style.textContent = `
            .submission-header {
                margin-bottom: 2rem;
                padding: 1rem;
                background: #f8fafc;
                border-radius: 12px;
                border: 1px solid #e2e8f0;
            }

            .submission-info {
                display: flex;
                gap: 1.5rem;
                flex-wrap: wrap;
            }

            .info-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.875rem;
                color: #4b5563;
            }

            .info-item .material-icons {
                font-size: 16px;
                color: #2F5E53;
            }

            .submission-responses h4 {
                color: #374151;
                margin-bottom: 1rem;
                font-size: 1.1rem;
            }

            .response-item {
                margin-bottom: 2rem;
                padding: 1rem;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                background: white;
            }

            .response-question {
                font-weight: 600;
                color: #374151;
                margin-bottom: 0.75rem;
                display: flex;
                gap: 0.5rem;
            }

            .question-number {
                color: #2F5E53;
                font-weight: 700;
            }

            .response-answer {
                color: #6b7280;
                line-height: 1.6;
            }

            .image-submission {
                margin-top: 0.5rem;
            }

            .image-container {
                position: relative;
                display: inline-block;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }

            .submission-image {
                max-width: 100%;
                height: auto;
                display: block;
                border-radius: 8px;
            }

            .image-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .image-container:hover .image-overlay {
                opacity: 1;
            }

            .image-expand {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem 1rem;
                background: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
                color: #374151;
            }

            .image-filename {
                margin-top: 0.5rem;
                font-size: 0.875rem;
                color: #6b7280;
                font-style: italic;
            }

            .submission-actions {
                display: flex;
                gap: 1rem;
                justify-content: flex-end;
                margin-top: 2rem;
                padding-top: 1rem;
                border-top: 1px solid #e5e7eb;
            }

            .action-btn {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.75rem 1.5rem;
                border-radius: 8px;
                border: none;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .action-btn.primary {
                background: #2F5E53;
                color: white;
            }

            .action-btn.primary:hover {
                background: #1F3C35;
            }

            .action-btn.secondary {
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #d1d5db;
            }

            .action-btn.secondary:hover {
                background: #e5e7eb;
            }
        `;
        document.head.appendChild(style);
    }

    modal.classList.add('show');
}

function closeModal() {
    const modal = document.getElementById('submissionModal');
    modal.classList.remove('show');
}

// Global functions for modal actions
window.expandImage = function(imageUrl) {
    const imageWindow = window.open('', '_blank');
    imageWindow.document.write(`
        <html>
            <head><title>Student Submission - Full Size</title></head>
            <body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh;">
                <img src="${imageUrl}" style="max-width:100%;max-height:100%;object-fit:contain;" />
            </body>
        </html>
    `);
};

window.downloadSubmission = function(surveyTitle) {
    showNotification(`Downloading ${surveyTitle} submission as PDF...`, 'info');
    // Simulate download
    setTimeout(() => {
        showNotification('Download completed!', 'success');
    }, 2000);
};

window.printSubmission = function() {
    window.print();
};

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const surveyCards = document.querySelectorAll('.survey-card');

    surveyCards.forEach(card => {
        const title = card.querySelector('.survey-title').textContent.toLowerCase();
        const teacher = card.querySelector('.teacher-info').textContent.toLowerCase();
        // Fixed: course-info doesn't exist, search in the title and teacher only

        if (title.includes(searchTerm) || teacher.includes(searchTerm)) {
            card.style.display = '';
            card.classList.add('fade-in');
        } else {
            card.style.display = 'none';
            card.classList.remove('fade-in');
        }
    });

    updateResultsCount();
}

function handleStatusFilter(e) {
    const selectedStatus = e.target.value;
    const surveyCards = document.querySelectorAll('.survey-card');

    surveyCards.forEach(card => {
        const cardStatus = card.getAttribute('data-status');

        if (selectedStatus === 'all' || cardStatus === selectedStatus) {
            card.style.display = '';
            card.classList.add('fade-in');
        } else {
            card.style.display = 'none';
            card.classList.remove('fade-in');
        }
    });

    updateResultsCount();
}

function handleSort(e) {
    const sortBy = e.target.value;
    const container = document.getElementById('surveys-container');
    const cards = Array.from(container.querySelectorAll('.survey-card'));

    cards.sort((a, b) => {
        switch (sortBy) {
            case 'due-date':
                const dateA = new Date(a.getAttribute('data-due'));
                const dateB = new Date(b.getAttribute('data-due'));
                return dateA - dateB;

            case 'title':
                const titleA = a.querySelector('.survey-title').textContent;
                const titleB = b.querySelector('.survey-title').textContent;
                return titleA.localeCompare(titleB);

            case 'teacher':
                const teacherA = a.querySelector('.teacher-info').textContent;
                const teacherB = b.querySelector('.teacher-info').textContent;
                return teacherA.localeCompare(teacherB);

            case 'status':
                const statusA = a.getAttribute('data-status');
                const statusB = b.getAttribute('data-status');
                return statusA.localeCompare(statusB);

            default:
                return 0;
        }
    });

    // Clear and re-append sorted cards
    container.innerHTML = '';
    cards.forEach(card => container.appendChild(card));
}

function handleViewToggle(e) {
    const viewType = e.currentTarget.getAttribute('data-view');
    const container = document.getElementById('surveys-container');

    // Update active toggle
    document.querySelectorAll('.view-toggle').forEach(toggle => {
        toggle.classList.remove('active');
    });
    e.currentTarget.classList.add('active');

    // Update view
    if (viewType === 'list') {
        container.classList.add('list-view');
    } else {
        container.classList.remove('list-view');
    }
}

function handleStatClick(e) {
    const stat = e.currentTarget;
    const statLabel = stat.querySelector('.stat-label').textContent.toLowerCase();

    // Filter surveys based on clicked stat
    const statusFilter = document.getElementById('status-filter');

    switch (statLabel) {
        case 'completed':
            statusFilter.value = 'completed';
            break;
        case 'pending':
            statusFilter.value = 'active';
            break;
        case 'overdue':
            statusFilter.value = 'overdue';
            break;
        default:
            statusFilter.value = 'all';
    }

    statusFilter.dispatchEvent(new Event('change'));
    showNotification(`Filtered surveys: ${statLabel}`, 'info');
}

function refreshSurveys() {
    const refreshBtn = document.querySelector('.refresh-btn');
    const originalHTML = refreshBtn.innerHTML;

    // Show loading state
    refreshBtn.innerHTML = '<span class="material-icons">refresh</span> Refreshing...';
    refreshBtn.classList.add('loading');

    // Simulate API call
    setTimeout(() => {
        refreshBtn.innerHTML = originalHTML;
        refreshBtn.classList.remove('loading');
        showNotification('Surveys refreshed successfully!', 'success');

        // Reset filters
        document.getElementById('status-filter').value = 'all';
        document.getElementById('sort-select').value = 'due-date';
        document.getElementById('survey-search').value = '';

        // Show all cards
        document.querySelectorAll('.survey-card').forEach(card => {
            card.style.display = '';
        });

        updateResultsCount();
    }, 1500);
}

function updateResultsCount() {
    // Functionality removed: "Showing X of Y surveys" text is no longer displayed.
    const existingCount = document.querySelector('.results-count');
    if (existingCount) {
        existingCount.remove();
    }
}

function animateElements() {
    // Animate overview stats
    const stats = document.querySelectorAll('.stat-number');
    stats.forEach(stat => {
        const finalValue = parseInt(stat.textContent);
        animateCounter(stat, 0, finalValue, 1000);
    });

    // Stagger card animations
    const cards = document.querySelectorAll('.survey-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('fade-in');
        }, index * 100);
    });
}

function animateCounter(element, start, end, duration) {
    const range = end - start;
    const startTime = performance.now();

    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(start + range * easeOutCubic(progress));

        element.textContent = current;

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = end;
        }
    }

    requestAnimationFrame(updateCounter);
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// ============================================
// SEARCH FUNCTIONALITY FOR UNANSWERED SURVEYS
// ============================================

/**
 * Initialize search functionality on page load
 */
function initializeSearchFunctionality() {
    const searchInput = document.getElementById('survey-search');
    const clearButton = document.getElementById('clear-search');
    
    if (!searchInput) return;
    
    // Show/hide clear button based on input
    searchInput.addEventListener('input', function() {
        if (this.value.length > 0) {
            clearButton.style.display = 'flex';
        } else {
            clearButton.style.display = 'none';
        }
    });
    
    // Initialize clear button visibility
    if (searchInput.value.length > 0) {
        clearButton.style.display = 'flex';
    }
    
    // Clear search functionality
    if (clearButton) {
        clearButton.addEventListener('click', function() {
            searchInput.value = '';
            clearButton.style.display = 'none';
            // Reload page without search parameter
            const url = new URL(window.location.href);
            url.searchParams.delete('search');
            window.location.href = url.toString();
        });
    }
    
    // Debounced search on input
    const debouncedSearch = debounce(function() {
        performSearch(searchInput.value);
    }, 500);
    
    searchInput.addEventListener('input', debouncedSearch);
    
    // Search on Enter key
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch(this.value);
        }
    });
}

/**
 * Perform search by updating URL with search parameter
 */
function performSearch(query) {
    const trimmedQuery = query.trim();
    const url = new URL(window.location.href);
    
    if (trimmedQuery) {
        url.searchParams.set('search', trimmedQuery);
    } else {
        url.searchParams.delete('search');
    }
    
    window.location.href = url.toString();
}

/**
 * Fetch and display unanswered surveys via API (optional enhancement)
 */
async function fetchUnansweredSurveys(searchQuery = '') {
    try {
        const url = new URL('/api/accounts/surveys/unanswered/', window.location.origin);
        if (searchQuery) {
            url.searchParams.set('search', searchQuery);
        }
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching unanswered surveys:', error);
        showNotification('Failed to load surveys', 'error');
        return null;
    }
}

/**
 * Render survey cards dynamically (optional enhancement)
 */
function renderSurveyCards(surveys) {
    const container = document.getElementById('surveys-container');
    if (!container) return;
    
    if (!surveys || surveys.length === 0) {
        container.innerHTML = `
            <div class="no-surveys-message">
                <span class="material-icons" style="font-size: 64px; color: #9CA3AF;">search_off</span>
                <h3>No surveys found</h3>
                <p>Try adjusting your search or filters</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = surveys.map(survey => `
        <div class="survey-card active" data-status="active">
            <div class="survey-card-main">
                <div class="survey-icon">
                    <span class="material-icons">assignment</span>
                </div>
                <div class="survey-info">
                    <h3 class="survey-title">${escapeHtml(survey.title)}</h3>
                    <div class="survey-meta">
                        <span class="teacher-info">
                            <span class="material-icons">person</span>
                            ${escapeHtml(survey.creator_name || 'Teacher')}
                        </span>
                        ${survey.due_date ? `
                        <span class="due-info">
                            <span class="material-icons">schedule</span>
                            Due: ${formatDate(survey.due_date)}
                        </span>
                        ` : ''}
                    </div>
                </div>
            </div>
            <div class="survey-actions">
                <div class="survey-status-badge active">
                    <span class="status-dot"></span>
                    ACTIVE
                </div>
                <button class="survey-action-btn primary" onclick="window.location.href='/surveys/${survey.id}/take/'">
                    <span class="material-icons">play_arrow</span>
                    Take Survey
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Initialize search when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeSearchFunctionality();
});
