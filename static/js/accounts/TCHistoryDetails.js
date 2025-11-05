/**
 * EduQuery Teacher History Details JavaScript
 * Manages individual survey response viewing
 */

// Navigation functions
function goToHome() {
    window.location.href = '/teacher/dashboard/';
}

function goToSurveyList() {
    window.location.href = '/teacher/surveys/';
}

function goToHistory() {
    window.location.href = '/surveys/history/';
}

function goBack() {
    window.history.back();
}

// Sample student response data
const studentResponses = {
    1: {
        name: "John Doe",
        id: "2021-12345",
        answers: [
            { question: "How would you rate the overall course content?", answer: "Excellent - The course content was comprehensive and well-structured." },
            { question: "What aspects of the course did you find most valuable?", answer: "The practical projects and hands-on coding exercises really helped solidify the concepts." },
            { question: "How effective was the instructor's teaching method?", answer: "Very effective - Clear explanations and good use of examples." },
            { question: "Would you recommend this course to other students?", answer: "Yes, definitely! It's a well-designed course with practical applications." },
            { question: "Any suggestions for improvement?", answer: "More time for the final project would be helpful." }
        ]
    },
    2: {
        name: "Jane Smith",
        id: "2021-12346",
        answers: [
            { question: "How would you rate the overall course content?", answer: "Good - The content was relevant and interesting." },
            { question: "What aspects of the course did you find most valuable?", answer: "The real-world case studies were very insightful." },
            { question: "How effective was the instructor's teaching method?", answer: "Excellent - The professor made complex topics easy to understand." },
            { question: "Would you recommend this course to other students?", answer: "Yes, I would recommend it to anyone interested in database systems." },
            { question: "Any suggestions for improvement?", answer: "Perhaps include more group work opportunities." }
        ]
    },
    3: {
        name: "Michael Johnson",
        id: "2021-12347",
        answers: [
            { question: "How would you rate the overall course content?", answer: "Excellent - Very comprehensive and up-to-date." },
            { question: "What aspects of the course did you find most valuable?", answer: "The lab exercises were extremely helpful." },
            { question: "How effective was the instructor's teaching method?", answer: "Good - Clear and organized lectures." },
            { question: "Would you recommend this course to other students?", answer: "Absolutely! One of the best courses I've taken." },
            { question: "Any suggestions for improvement?", answer: "No major suggestions, the course was well-structured." }
        ]
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeDetails();
    setupSearch();
    setupModal();
    createChart();
});

function initializeDetails() {
    // Sidebar active state
    const sidebarBtns = document.querySelectorAll('.sidebar-btn');
    sidebarBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            sidebarBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Get survey ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const surveyId = urlParams.get('id');

    // Load survey details (in production, this would fetch from backend)
    loadSurveyDetails(surveyId);
}

function loadSurveyDetails(surveyId) {
    // This would normally fetch from backend
    // For now, using placeholder data
    const surveyData = {
        1: {
            title: "IT403 Final Project Evaluation",
            section: "Section A",
            dateCreated: "Oct 15, 2025",
            dueDate: "Nov 1, 2025",
            totalResponses: 25,
            completionRate: 92,
            avgTime: "8 min"
        }
    };

    const survey = surveyData[surveyId] || surveyData[1];

    document.getElementById('surveyTitle').textContent = survey.title;
    document.getElementById('sectionName').textContent = `Section: ${survey.section}`;
    document.getElementById('dateCreated').textContent = `Date Created: ${survey.dateCreated}`;
    document.getElementById('dueDate').textContent = `Due Date: ${survey.dueDate}`;
    document.getElementById('totalResponses').textContent = survey.totalResponses;
    document.getElementById('completionRate').textContent = survey.completionRate + '%';
    document.getElementById('avgTime').textContent = survey.avgTime;
}

function setupSearch() {
    const searchInput = document.getElementById('studentSearch');
    const filterSelect = document.getElementById('responseFilter');

    if (searchInput) {
        searchInput.addEventListener('input', filterResponses);
    }

    if (filterSelect) {
        filterSelect.addEventListener('change', filterResponses);
    }
}

function filterResponses() {
    const searchValue = document.getElementById('studentSearch').value.toLowerCase();
    const filterValue = document.getElementById('responseFilter').value;
    const responseItems = document.querySelectorAll('.response-item');

    responseItems.forEach(item => {
        const studentName = item.querySelector('.student-name').textContent.toLowerCase();
        const studentId = item.querySelector('.student-id').textContent.toLowerCase();
        const isCompleted = item.classList.contains('completed');
        const isIncomplete = item.classList.contains('incomplete');

        let matchesSearch = studentName.includes(searchValue) || studentId.includes(searchValue);
        let matchesFilter = true;

        if (filterValue === 'completed') {
            matchesFilter = isCompleted;
        } else if (filterValue === 'incomplete') {
            matchesFilter = isIncomplete;
        }

        item.style.display = (matchesSearch && matchesFilter) ? 'flex' : 'none';
    });
}

function setupModal() {
    const modal = document.getElementById('responseModal');
    const closeBtn = document.getElementById('closeModal');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
}

function viewStudentResponse(studentId) {
    const modal = document.getElementById('responseModal');
    const modalContent = document.getElementById('modalContent');
    const modalTitle = document.getElementById('modalStudentName');

    const student = studentResponses[studentId];

    if (!student) return;

    // Update modal title
    modalTitle.textContent = `${student.name}'s Response`;

    // Build response content
    let responseHTML = '<div class="student-answers">';

    student.answers.forEach((item, index) => {
        responseHTML += `
            <div class="answer-item">
                <div class="question-number">Question ${index + 1}</div>
                <div class="question-text">${item.question}</div>
                <div class="answer-text">${item.answer}</div>
            </div>
        `;
    });

    responseHTML += '</div>';

    // Add styles for modal content
    responseHTML += `
        <style>
            .student-answers {
                display: flex;
                flex-direction: column;
                gap: var(--space-5);
            }
            .answer-item {
                padding: var(--space-4);
                background: var(--gray-50);
                border-radius: var(--radius-lg);
                border-left: 4px solid var(--primary-500);
            }
            .question-number {
                font-size: 0.75rem;
                font-weight: 700;
                color: var(--primary-600);
                text-transform: uppercase;
                letter-spacing: 0.05em;
                margin-bottom: var(--space-2);
            }
            .question-text {
                font-size: 1rem;
                font-weight: 600;
                color: var(--gray-900);
                margin-bottom: var(--space-3);
            }
            .answer-text {
                font-size: 0.9375rem;
                color: var(--gray-700);
                line-height: 1.6;
            }
        </style>
    `;

    modalContent.innerHTML = responseHTML;
    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('responseModal');
    modal.classList.remove('active');
}

function createChart() {
    const ctx = document.getElementById('responseChart');

    if (!ctx) {
        console.error('Chart canvas not found');
        return;
    }

    // Set canvas size explicitly
    ctx.width = 200;
    ctx.height = 200;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Excellent', 'Good', 'Average'],
            datasets: [{
                data: [76, 18, 6],
                backgroundColor: [
                    '#22c55e',
                    '#84cc16',
                    '#f59e0b'
                ],
                borderWidth: 3,
                borderColor: '#ffffff',
                cutout: '70%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            layout: {
                padding: 0
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true
            }
        }
    });
}

