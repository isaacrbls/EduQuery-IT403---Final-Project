/**
 * EduQuery Survey Congratulations JavaScript
 * Enhanced functionality for celebration page
 */

// Navigation functions
function goToHome() {
    window.location.href = '/student/dashboard/';
}

function goToSurveyList() {
    window.location.href = '/surveys/';
}

// Main initialization
function goToHome() {
    window.location.href = '/student/dashboard/';
}

function goToSurveyList() {
    window.location.href = '/surveys/';
}

function goToHistory() {
    window.location.href = '/surveys/history/';
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
    initializeCongratulationsPage();
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
            } else if (label === 'Survey History') {
                goToHistory();
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

function initializeCongratulationsPage() {
    createConfetti();
    setupButtonHandlers();
}

function setupButtonHandlers() {
    const surveysBtn = document.querySelector('.surveys-btn');
    const homeBtn = document.querySelector('.home-btn');
    
    if (surveysBtn) {
        surveysBtn.addEventListener('click', goToSurveyList);
    }
    
    if (homeBtn) {
        homeBtn.addEventListener('click', goToHome);
    }
}

function startCelebration() {
    // Trigger success animation sequence
    setTimeout(() => {
        playSuccessSound();
    }, 500);

    // Add additional confetti burst after initial animation
    setTimeout(() => {
        createConfettiBurst();
    }, 1500);

    // Start continuous floating particles
    setTimeout(() => {
        startFloatingParticles();
    }, 2000);
}

function displaySubmissionDetails() {
    // Get submission data from localStorage if available
    const submissionData = localStorage.getItem('surveySubmissionData');

    if (submissionData) {
        try {
            const data = JSON.parse(submissionData);

            // Update submission date
            const submissionDateElement = document.getElementById('submissionDate');
            if (submissionDateElement && data.timestamp) {
                const date = new Date(data.timestamp);
                submissionDateElement.textContent = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }

            // Clean up localStorage
            localStorage.removeItem('surveySubmissionData');

        } catch (e) {
            console.error('Error parsing submission data:', e);
        }
    } else {
        // Fallback to current date
        const submissionDateElement = document.getElementById('submissionDate');
        if (submissionDateElement) {
            const now = new Date();
            submissionDateElement.textContent = now.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }
}

function playSuccessSound() {
    // Create success sound effect (optional - requires Web Audio API)
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Create a simple success chime
        const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5

        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
            }, index * 100);
        });
    } catch (e) {
        console.log('Audio not supported or blocked');
    }
}

function createConfettiBurst() {
    const confettiContainer = document.querySelector('.confetti');

    // Create additional confetti pieces
    for (let i = 0; i < 20; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.cssText = `
            --delay: ${Math.random() * 2}s;
            --x: ${Math.random() * 100}%;
            --rotation: ${Math.random() * 360}deg;
        `;

        // Random colors
        const colors = ['var(--success)', 'var(--warning)', 'var(--info)', 'var(--primary-500)'];
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];

        confettiContainer.appendChild(confetti);

        // Remove after animation
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.parentNode.removeChild(confetti);
            }
        }, 3000);
    }
}

function startFloatingParticles() {
    const particleContainer = document.querySelector('.floating-particles');

    setInterval(() => {
        createFloatingParticle();
    }, 2000);

    function createFloatingParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';

        // Random horizontal position
        particle.style.left = Math.random() * 100 + '%';

        // Random color
        const colors = ['var(--success)', 'var(--warning)', 'var(--info)'];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];

        // Random size
        const size = Math.random() * 4 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';

        particleContainer.appendChild(particle);

        // Remove after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 8000);
    }
}

// Action functions
function downloadCertificate() {
    showNotification('Generating completion certificate...', 'info');

    // Simulate certificate generation
    setTimeout(() => {
        // Create a simple certificate data URL
        const certificateData = generateCertificateDataURL();

        // Create download link
        const link = document.createElement('a');
        link.href = certificateData;
        link.download = 'survey-completion-certificate.png';
        link.click();

        showNotification('Certificate downloaded successfully!', 'success');
    }, 2000);
}

function shareSuccess() {
    // Check if Web Share API is supported
    if (navigator.share) {
        navigator.share({
            title: 'Survey Completed Successfully!',
            text: 'I just completed the IT403 Final Project Evaluation survey on EduQuery!',
            url: window.location.origin
        }).then(() => {
            showNotification('Thanks for sharing!', 'success');
        }).catch((error) => {
            console.log('Error sharing:', error);
            fallbackShare();
        });
    } else {
        fallbackShare();
    }
}

function fallbackShare() {
    // Copy link to clipboard as fallback
    const shareText = `I just completed the IT403 Final Project Evaluation survey on EduQuery! 🎉 ${window.location.origin}`;

    if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText).then(() => {
            showNotification('Share text copied to clipboard!', 'success');
        }).catch(() => {
            showShareModal(shareText);
        });
    } else {
        showShareModal(shareText);
    }
}

function showShareModal(shareText) {
    const modal = document.createElement('div');
    modal.className = 'share-modal';
    modal.innerHTML = `
        <div class="modal-overlay show">
            <div class="modal-container">
                <div class="modal-header">
                    <h3>Share Your Achievement</h3>
                    <button class="modal-close" onclick="this.closest('.share-modal').remove()">
                        <span class="material-icons">close</span>
                    </button>
                </div>
                <div class="modal-content">
                    <p>Copy and share this message:</p>
                    <textarea readonly style="width: 100%; margin-top: 10px; padding: 10px; border: 1px solid #ccc; border-radius: 8px;">${shareText}</textarea>
                </div>
                <div class="modal-actions">
                    <button class="btn-primary" onclick="copyShareText(this, '${shareText}')">
                        <span class="material-icons">content_copy</span>
                        Copy Text
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function copyShareText(button, text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            button.innerHTML = '<span class="material-icons">check</span> Copied!';
            setTimeout(() => {
                button.closest('.share-modal').remove();
                showNotification('Text copied successfully!', 'success');
            }, 1000);
        });
    }
}

function generateCertificateDataURL() {
    // Create a simple certificate using canvas
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    // Background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = '#2F5E53';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Title
    ctx.fillStyle = '#2F5E53';
    ctx.font = 'bold 48px Poppins, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Certificate of Completion', canvas.width / 2, 120);

    // Subtitle
    ctx.font = '24px Poppins, Arial';
    ctx.fillStyle = '#6b7280';
    ctx.fillText('EduQuery Survey System', canvas.width / 2, 160);

    // Main text
    ctx.font = '18px Poppins, Arial';
    ctx.fillStyle = '#374151';
    ctx.fillText('This is to certify that', canvas.width / 2, 220);

    // Name
    ctx.font = 'bold 32px Poppins, Arial';
    ctx.fillStyle = '#2F5E53';
    const userName = document.getElementById('userName')?.textContent || 'Student';
    ctx.fillText(userName, canvas.width / 2, 280);

    // Survey details
    ctx.font = '18px Poppins, Arial';
    ctx.fillStyle = '#374151';
    ctx.fillText('has successfully completed the', canvas.width / 2, 330);
    ctx.fillText('IT403 Final Project Evaluation Survey', canvas.width / 2, 360);

    // Date
    ctx.font = '16px Poppins, Arial';
    ctx.fillStyle = '#6b7280';
    const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    ctx.fillText(`Completed on: ${today}`, canvas.width / 2, 450);

    // Signature line
    ctx.font = '14px Poppins, Arial';
    ctx.fillText('EduQuery System', canvas.width / 2, 520);
    ctx.strokeStyle = '#2F5E53';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 100, 510);
    ctx.lineTo(canvas.width / 2 + 100, 510);
    ctx.stroke();

    return canvas.toDataURL('image/png');
}

// Utility functions
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
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Clean up any survey drafts since survey is completed
document.addEventListener('DOMContentLoaded', function() {
    localStorage.removeItem('surveyDraft');
});

// Add some easter eggs for extra celebration
document.addEventListener('keydown', function(e) {
    // Konami code or space for extra confetti
    if (e.code === 'Space') {
        e.preventDefault();
        createConfettiBurst();
        showNotification('Extra celebration! 🎊', 'success');
    }
});

// Auto-redirect after 5 minutes of inactivity
let inactivityTimer;

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        showNotification('Redirecting to dashboard...', 'info');
        setTimeout(goToHome, 2000);
    }, 300000); // 5 minutes
}

document.addEventListener('mousemove', resetInactivityTimer);
document.addEventListener('keypress', resetInactivityTimer);
document.addEventListener('click', resetInactivityTimer);

// Initialize inactivity timer
resetInactivityTimer();
