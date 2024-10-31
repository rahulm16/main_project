//login.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginFormContainer = document.querySelector('.login-form');
    const signupFormContainer = document.querySelector('.signup-form');
    const exploreButton = document.getElementById("explore-button");

    // Show signup form by default
    signupFormContainer.style.display = 'block';
    loginFormContainer.style.display = 'none';

    // Form toggle functions
    window.showLoginPrompt = () => {
        signupFormContainer.style.display = 'none';
        loginFormContainer.style.display = 'block';
    };

    window.showSignUpForm = () => {
        signupFormContainer.style.display = 'block';
        loginFormContainer.style.display = 'none';
    };

    // Password visibility toggle
    document.getElementById('togglePassword').addEventListener('click', () => 
        togglePasswordVisibility('password')
    );
    document.getElementById('togglePasswordLogin').addEventListener('click', () => 
        togglePasswordVisibility('login-password')
    );

    function togglePasswordVisibility(inputId) {
        const passwordInput = document.getElementById(inputId);
        const eyeIcon = document.getElementById(inputId === 'password' ? 'eyeIcon' : 'eyeIconLogin');
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        eyeIcon.classList.toggle('fa-eye');
        eyeIcon.classList.toggle('fa-eye-slash');
    }

    // Handle explore button
    function handleExploreClick(event) {
        event.preventDefault();
        const profileIcon = document.getElementById("profile-icon");
        
        if (profileIcon.style.display === 'block') {
            window.location.href = "/profile";
        } else {
            window.headerUtils.showAlert('Please log in to explore the chatbot.', 'error');
        }
    }

    // Form submissions
    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = {
            fullName: document.getElementById('fullname').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };

        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                window.headerUtils.showAlert('Account created successfully! You can now log in.', 'success');
                showLoginPrompt();
            } else {
                window.headerUtils.showAlert(data.message || 'An error occurred during signup.', 'error');
            }
        } catch (error) {
            window.headerUtils.showAlert('Failed to connect to server.', 'error');
        }
    });

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = {
            email: document.getElementById('login-email').value,
            password: document.getElementById('login-password').value
        };

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                window.headerUtils.showAlert('Logged in successfully!', 'success');
                signupFormContainer.style.display = 'none';
                loginFormContainer.style.display = 'none';
                window.headerUtils.updateProfileIcon(data.user);
                updateExploreButton(true);
            } else {
                window.headerUtils.showAlert(data.message || 'Login failed. Please check your credentials.', 'error');
            }
        } catch (error) {
            window.headerUtils.showAlert('Failed to connect to server.', 'error');
        }
    });

    function updateExploreButton(enabled) {
        if (enabled) {
            exploreButton.classList.remove('disabled');
            exploreButton.disabled = false;
            exploreButton.querySelector('.tooltip').style.display = 'none';
        } else {
            exploreButton.classList.add('disabled');
            exploreButton.disabled = true;
            exploreButton.querySelector('.tooltip').style.display = '';
        }
    }

    // Listen for logout event
    document.addEventListener('userLoggedOut', () => {
        showSignUpForm();
        updateExploreButton(false);
    });

    exploreButton.addEventListener('click', handleExploreClick);
});