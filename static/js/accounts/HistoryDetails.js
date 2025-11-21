function goToHome() {
    window.location.href = '/accounts/student/dashboard/';
}

function goToSurveyList() {
    window.location.href = '/accounts/student/surveys/';
}

function goToHistory() {
    window.location.href = '/accounts/student/history/';
}

function goToAnalytics() {
    window.location.href = '/accounts/student/analytics/';
}

function goToProfile() {
    window.location.href = '/accounts/profile/';
}

function goToSettings() {
    window.location.href = '/accounts/settings/';
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
    initializeHistoryDetails();
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

function initializeHistoryDetails() {
    loadSurveyDetails();
    initializeChart();
    initializeTooltips();
    loadUserData();
    setupBackButton();
    setupDownloadButton();
}

function setupBackButton() {
    const backBtn = document.querySelector('.back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', goToHistory);
    }
}

function setupDownloadButton() {
    const downloadBtn = document.querySelector('.download-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadResults);
    }
}

// ============================================
// Survey Details Loading
// ============================================

function loadSurveyDetails() {
    // This would typically load details from URL parameters or API
    const urlParams = new URLSearchParams(window.location.search);
    const surveyId = urlParams.get('id') || 'default';

    // For demo purposes, using static data
    // In real implementation, this would fetch from API
    const surveyData = getSurveyData(surveyId);
    populateSurveyDetails(surveyData);
}

function getSurveyData(surveyId) {
    // Get data from URL parameters first
    const urlParams = new URLSearchParams(window.location.search);
    const titleFromUrl = urlParams.get('title');
    const teacherFromUrl = urlParams.get('teacher');
    const completionFromUrl = urlParams.get('completion');

    // Mock data with different surveys - replace with actual API call
    const mockData = {
        'it403-final-project-evaluation': {
            title: 'IT403 Final Project Evaluation',
            teacher: 'Prof. Rodriguez',
            completionDate: 'Nov 1, 2025',
            submissionTime: '2:30 PM',
            completionPercentage: 85,
            responses: { excellent: 85, good: 10, average: 5, poor: 0 },
            stats: { questionsAnswered: 12, completionRate: 100, averageRating: 8.5, timeTaken: '15 min' }
        },
        'database-design-assessment': {
            title: 'Database Design Assessment',
            teacher: 'Prof. Martinez',
            completionDate: 'Oct 28, 2025',
            submissionTime: '1:45 PM',
            completionPercentage: 92,
            responses: { excellent: 92, good: 6, average: 2, poor: 0 },
            stats: { questionsAnswered: 15, completionRate: 100, averageRating: 9.1, timeTaken: '12 min' }
        },
        'algorithm-design-course-feedback': {
            title: 'Algorithm Design Course Feedback',
            teacher: 'Prof. Williams',
            completionDate: 'Oct 25, 2025',
            submissionTime: '3:20 PM',
            completionPercentage: 78,
            responses: { excellent: 78, good: 15, average: 7, poor: 0 },
            stats: { questionsAnswered: 10, completionRate: 100, averageRating: 7.8, timeTaken: '18 min' }
        }
    };

    // Use URL parameters if available, otherwise use mock data
    if (titleFromUrl && teacherFromUrl && completionFromUrl) {
        return {
            title: titleFromUrl,
            teacher: teacherFromUrl,
            completionDate: completionFromUrl,
            submissionTime: '2:30 PM',
            completionPercentage: Math.floor(Math.random() * 20) + 75, // Random between 75-95
            responses: {
                excellent: Math.floor(Math.random() * 30) + 65,
                good: Math.floor(Math.random() * 15) + 10,
                average: Math.floor(Math.random() * 10) + 5,
                poor: Math.floor(Math.random() * 5)
            },
            stats: {
                questionsAnswered: Math.floor(Math.random() * 10) + 8,
                completionRate: 100,
                averageRating: (Math.random() * 2 + 7).toFixed(1),
                timeTaken: `${Math.floor(Math.random() * 10) + 10} min`
            }
        };
    }

    return mockData[surveyId] || mockData['it403-final-project-evaluation'];
}

function populateSurveyDetails(data) {
    // Update survey information
    document.getElementById('surveyTitle').textContent = data.title;
    document.getElementById('teacherName').textContent = data.teacher;
    document.getElementById('completionDate').textContent = `Completed: ${data.completionDate}`;
    document.getElementById('submissionStatus').textContent = `Submitted at ${data.submissionTime}`;
    document.getElementById('headerPercentage').textContent = `${data.completionPercentage}%`;

    // Update chart
    updateChart(data.responses);
}

// ============================================
// Chart Functionality
// ============================================

function initializeChart() {
    // Initialize the large percentage display with animations
    animatePercentageDisplay();
}

function updateChart(responses) {
    const total = responses.excellent + responses.good + responses.average + responses.poor;

    // Calculate percentages
    const excellentPercent = (responses.excellent / total) * 100;
    const goodPercent = (responses.good / total) * 100;
    const averagePercent = (responses.average / total) * 100;

    // Calculate degrees for conic gradient
    const excellentDeg = (excellentPercent / 100) * 360;
    const goodDeg = excellentDeg + (goodPercent / 100) * 360;
    const averageDeg = goodDeg + (averagePercent / 100) * 360;

    // Update pie chart in header
    const pieChart = document.getElementById('responseChart');
    if (pieChart) {
        let gradientStops = [];

        if (excellentPercent > 0) {
            gradientStops.push(`var(--chart-excellent) 0deg ${excellentDeg}deg`);
        }
        if (goodPercent > 0) {
            gradientStops.push(`var(--chart-good) ${excellentDeg}deg ${goodDeg}deg`);
        }
        if (averagePercent > 0) {
            gradientStops.push(`var(--chart-average) ${goodDeg}deg ${averageDeg}deg`);
        }

        pieChart.style.background = `conic-gradient(${gradientStops.join(', ')})`;
    }

    // Update mini legend
    updateMiniLegend(Math.round(excellentPercent), Math.round(goodPercent), Math.round(averagePercent));
}

function updateMiniLegend(excellentPercent, goodPercent, averagePercent) {
    const legendItems = document.querySelectorAll('.legend-mini-item span');

    if (legendItems.length >= 3) {
        legendItems[0].textContent = `Excellent (${excellentPercent}%)`;
        legendItems[1].textContent = `Good (${goodPercent}%)`;
        legendItems[2].textContent = `Average (${averagePercent}%)`;
    }
}

function animatePercentageDisplay() {
    const pieChart = document.getElementById('responseChart');
    const percentage = document.getElementById('headerPercentage');

    if (pieChart && percentage) {
        // Animate pie chart appearance
        pieChart.style.transform = 'scale(0.8)';
        pieChart.style.opacity = '0';

        setTimeout(() => {
            pieChart.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            pieChart.style.transform = 'scale(1)';
            pieChart.style.opacity = '1';
        }, 300);

        // Animate percentage counter
        animateCountUp(percentage, parseInt(percentage.textContent));
    }
}

function animateCountUp(element, target) {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = `${Math.round(current)}%`;
    }, 20);
}

// ============================================
// Navigation Functions
// ============================================

function goBack() {
    // Check if there's a referrer, otherwise go to history page
    if (document.referrer && document.referrer.includes('history')) {
        window.history.back();
    } else {
        window.location.href = '/surveys/history/';
    }
}

function goToHome() {
    window.location.href = '/student/dashboard/';
}

function goToSurveyList() {
    window.location.href = '/surveys/';
}

function goToHistory() {
    window.location.href = '/surveys/history/';
}

// ============================================
// Action Functions
// ============================================

// viewDetailedResponses function removed - button no longer exists

function downloadResults() {
    console.log('Downloading survey results...');

    const surveyTitle = document.getElementById('surveyTitle').textContent;
    const filename = `${surveyTitle.replace(/\s+/g, '_')}_Results.pdf`;

    Modal.alert({
        title: 'Download Started',
        message: `Downloading: ${filename}\n\nThis would download a PDF report of the survey results.`,
        type: 'info',
        icon: 'info',
        okText: 'OK'
    });

    // Example of actual download implementation:
    /*
    fetch(`/api/survey-results/${surveyId}/download/`)
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        })
        .catch(error => console.error('Download failed:', error));
    */
}

// viewFullReport function removed - button no longer exists

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
    console.log('Loaded user:', userName);
}

// ============================================
// Animation Utilities
// ============================================

function fadeInElements() {
    const elements = document.querySelectorAll('.survey-details-card, .quick-actions');

    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';

        setTimeout(() => {
            element.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 200);
    });
}

// ============================================
// Initialize animations on load
// ============================================

setTimeout(fadeInElements, 500);

// ============================================
// Error Handling
// ============================================

window.addEventListener('error', function(e) {
    console.error('History details page error:', e.error);
});

// Export functions for testing purposes (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadSurveyDetails,
        updateChart,
        updateMiniLegend,
        downloadResults
    };
}
