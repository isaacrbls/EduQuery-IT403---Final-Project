function goToHome() {
    window.location.href = '/student/dashboard/';
}

function goToSurveyList() {
    window.location.href = '/student/surveys/';
}

function goToHistory() {
    window.location.href = '/student/history/';
}

function goToResponses() {
    window.location.href = '/responses/';
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
    initializeSidebarNavigation();
    initializeCharts();
});

function initializeSidebarNavigation() {
    const navBtns = document.querySelectorAll('.sidebar-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            const label = this.getAttribute('aria-label');
            
            // Skip if it's a link (already has href)
            if (this.tagName === 'A') {
                return;
            }
            
            // Handle button clicks
            if (label === 'Home') {
                goToHome();
            } else if (label === 'Survey List') {
                goToSurveyList();
            } else if (label === 'History' || label === 'Survey History') {
                goToHistory();
            } else if (label === 'Responses') {
                goToResponses();
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

function initializeCharts() {
    const completionChartElement = document.getElementById('completionChart');
    const statusChartElement = document.getElementById('statusChart');

    // Get data from script tag
    const dataScript = document.getElementById('analytics-data');
    let analyticsData = {
        statusData: [0, 0, 0],
        completionLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        completionData: [0, 0, 0, 0, 0, 0]
    };
    
    if (dataScript) {
        try {
            analyticsData = JSON.parse(dataScript.textContent);
        } catch (e) {
            console.error('Error parsing analytics data', e);
        }
    }

    if (completionChartElement) {
        const completionCtx = completionChartElement.getContext('2d');
        new Chart(completionCtx, {
            type: 'line',
            data: {
                labels: analyticsData.completionLabels,
                datasets: [{
                    label: 'Surveys Completed',
                    data: analyticsData.completionData,
                    borderColor: '#2d6a5f',
                    backgroundColor: 'rgba(45, 106, 95, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#2d6a5f',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            precision: 0
                        }
                    }
                }
            }
        });
    }

    if (statusChartElement) {
        const statusCtx = statusChartElement.getContext('2d');
        new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'Pending', 'In Progress'],
                datasets: [{
                    data: analyticsData.statusData,
                    backgroundColor: [
                        '#10b981',
                        '#f59e0b',
                        '#3b82f6'
                    ],
                    borderWidth: 3,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}
