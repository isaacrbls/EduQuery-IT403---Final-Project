// Sidebar navigation
const sidebarButtons = document.querySelectorAll('.sidebar-btn');
sidebarButtons.forEach(button => {
    button.addEventListener('click', function() {
        sidebarButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
    });
});

// Survey button actions
const surveyButtons = document.querySelectorAll('.survey-btn');
surveyButtons.forEach(button => {
    button.addEventListener('click', function() {
        if (!this.classList.contains('disabled')) {
            alert('Opening survey...');
        }
    });
});

// Notification button
document.querySelector('.notification-btn').addEventListener('click', function() {
    alert('No new notifications');
});

// Month selector
document.getElementById('monthSelect').addEventListener('change', function() {
    console.log('Selected month:', this.value);
    // You can add chart update logic here
});

// Search functionality
document.querySelector('.search-box input').addEventListener('input', function() {
    console.log('Searching for:', this.value);
    // You can add search logic here
});
