// Global variables to store user data and chart instance
let userData = null;
let aptitudeChart = null;

// Create alert container on load
document.addEventListener('DOMContentLoaded', () => {
    const alertContainer = document.createElement('div');
    alertContainer.id = 'alert-container';
    document.body.appendChild(alertContainer);
});

// Show alert function
function showAlert(message, type = 'success', duration = 3000) {
    const alertId = 'alert-' + Date.now();
    const alertElement = document.createElement('div');
    alertElement.className = `alert-modal ${type}`;
    alertElement.id = alertId;
    
    alertElement.innerHTML = `
        <div class="alert-modal-content">
            <span class="alert-modal-message">${message}</span>
            <button class="alert-modal-close">&times;</button>
        </div>
    `;

    document.getElementById('alert-container').appendChild(alertElement);
    
    // Show alert
    setTimeout(() => {
        alertElement.style.display = 'block';
    }, 100);

    // Setup close button
    const closeBtn = alertElement.querySelector('.alert-modal-close');
    closeBtn.onclick = () => {
        alertElement.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => alertElement.remove(), 300);
    };

    // Auto dismiss
    if (duration > 0) {
        setTimeout(() => {
            if (document.getElementById(alertId)) {
                alertElement.style.animation = 'slideOut 0.3s ease-out forwards';
                setTimeout(() => alertElement.remove(), 300);
            }
        }, duration);
    }
}

// Fetch user data from the API
async function fetchUserData() {
    try {
        const response = await fetch('http://localhost:5000/api/profile-data');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        userData = await response.json();
        
        // Initial load - initialize everything
        if (!aptitudeChart) {
            initializeAll();
        } else {
            // Subsequent updates - only update necessary components
            updateProfileData();
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        showAlert('Error loading user data. Please try again later.', 'error');
    }
}

// Initialize all components with fetched data
function initializeAll() {
    initializeProfilePreview();
    initializeForm();
    initializeRecommendations();
    initializeAptitudeChart();
}

// Update only profile-related data
function updateProfileData() {
    initializeProfilePreview();
    initializeForm();
    initializeRecommendations();
}

// Initialize profile preview
function initializeProfilePreview() {
    document.getElementById('profile-name').textContent = userData.user.name;
    document.getElementById('profile-email').textContent = userData.user.email;
    document.getElementById('current-role').textContent = userData.userData.currentStatus;
    document.getElementById('current-field').textContent = userData.userData.currentField;
    
    const skillsContainer = document.getElementById('skills-container');
    skillsContainer.innerHTML = '';
    userData.userData.keySkills.forEach(skill => {
        const skillBadge = document.createElement('span');
        skillBadge.classList.add('skill-badge');
        skillBadge.textContent = skill;
        skillsContainer.appendChild(skillBadge);
    });
}

// Initialize form
function initializeForm() {
    document.getElementById('name').value = userData.user.name;
    document.getElementById('email').value = userData.user.email;
    document.getElementById('age').value = userData.userData.age;
    document.getElementById('currentStatus').value = userData.userData.currentStatus;
    document.getElementById('education').value = userData.userData.education;
    document.getElementById('currentField').value = userData.userData.currentField;
    document.getElementById('workExperience').value = userData.userData.workExperience;
    document.getElementById('skills').value = userData.userData.keySkills.join(', ');
    document.getElementById('specialization').value = userData.userData.educationDetails.specialization;
    document.getElementById('course').value = userData.userData.educationDetails.course;
}

// Initialize recommendations
function initializeRecommendations() {
    const container = document.getElementById('recommendations-container');
    container.innerHTML = '';
    userData.careerSuggestions.forEach(career => {
        const careerDiv = document.createElement('div');
        careerDiv.classList.add('career-recommendation');
        careerDiv.innerHTML = `
            <p>${career.title}</p>
            <span class="skill-badge">${career.match}% Match</span>
        `;
        container.appendChild(careerDiv);
    });
}

// Initialize aptitude chart
function initializeAptitudeChart() {
    const ctx = document.getElementById('aptitude-chart').getContext('2d');
    
    // Create new chart instance
    aptitudeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: userData.aptitudeScores.map(score => score.name),
            datasets: [{
                label: 'Aptitude Scores',
                data: userData.aptitudeScores.map(score => score.score),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

// Tab functionality
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        
        tabBtns.forEach(btn => btn.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(tabId).classList.add('active');
    });
});

// Form submission
document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const updatedProfile = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        age: parseInt(document.getElementById('age').value, 10) || null,
        currentStatus: document.getElementById('currentStatus').value,
        education: document.getElementById('education').value,
        currentField: document.getElementById('currentField').value,
        workExperience: document.getElementById('workExperience').value,
        keySkills: document.getElementById('skills').value.split(',').map(skill => skill.trim()),
        educationDetails: {
            specialization: document.getElementById('specialization').value,
            course: document.getElementById('course').value
        }
    };

    try {
        const response = await fetch('http://localhost:5000/api/update-profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedProfile)
        });

        if (!response.ok) {
            throw new Error('Failed to update profile');
        }

        const result = await response.json();
        showAlert(result.message || 'Profile updated successfully!', 'success');

        // Refresh user data after update
        await fetchUserData();
    } catch (error) {
        console.error('Error updating profile:', error);
        showAlert('An error occurred while updating your profile. Please try again.', 'error');
    }
});

// Modal functionality
const modal = document.getElementById('full-profile-modal');
const modalClose = modal.querySelector('.close');
const viewFullProfileBtn = document.getElementById('view-full-profile');

viewFullProfileBtn.addEventListener('click', () => {
    const modalName = document.getElementById('modal-name');
    const modalEmail = document.getElementById('modal-email');
    const modalContent = document.getElementById('modal-content');
    
    modalName.textContent = userData.user.name;
    modalEmail.textContent = userData.user.email;
    
    modalContent.innerHTML = `
        <h3>Education</h3>
        <p><strong>Highest Level:</strong> ${userData.userData.education}</p>
        <p><strong>Specialization:</strong> ${userData.userData.educationDetails.specialization}</p>
        <p><strong>Course:</strong> ${userData.userData.educationDetails.course}</p>
        
        <h3>Professional Information</h3>
        <p><strong>Current Status:</strong> ${userData.userData.currentStatus}</p>
        <p><strong>Current Field:</strong> ${userData.userData.currentField}</p>
        <p><strong>Work Experience:</strong> ${userData.userData.workExperience}</p>
    `;
    
    modal.style.display = 'block';
});

modalClose.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Close modal on outside click
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Initial fetch of user data on page load
fetchUserData();