//chatbot.js
const predefinedQuestions = [
    { question: 'What is your first career preference?' },
    { question: 'What is your second career preference?' },
    { question: 'What is your third career preference?' }
];

let currentQuestionIndex = 0;
let userResponses = {
    first: '',
    second: '',
    third: ''
};

const allSuggestions = [
    { text: "I would like to be an author", icon: "📚" },
    { text: "I would like to be a neurosurgeon", icon: "🧠" },
    { text: "I would like to be a footballer", icon: "⚽" },
    { text: "I would like to be a product manager", icon: "📊" },
    { text: "I would like to be an artist", icon: "🎨" },
    { text: "I want to explore space", icon: "🚀" },
    { text: "I would like to be a chef", icon: "🍳" },
    { text: "I want to start a business", icon: "💼" },
    { text: "I want to work in tech", icon: "💻" },
    { text: "I would like to be a musician", icon: "🎶" },
    { text: "I want to help animals", icon: "🐾" },
    { text: "I would like to be an environmentalist", icon: "🌍" },
    { text: "I want to be a teacher", icon: "📚" },
    { text: "I aspire to be a scientist", icon: "🔬" },
    { text: "I would like to be an architect", icon: "🏛️" }
];

// Function to get four random suggestions
function getRandomSuggestions(num) {
    const shuffled = allSuggestions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
}

document.addEventListener('DOMContentLoaded', (event) => {
    const modeToggle = document.getElementById('mode-toggle');
    const body = document.body;

    // Light/Dark mode toggle functionality
    modeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        updateToggleButtonAriaLabel();
    });
    const randomSuggestions = getRandomSuggestions(4);
    const suggestionsContainer = document.querySelector('.suggestions');
    suggestionsContainer.innerHTML = ''; // Clear any existing suggestions

    // Populate suggestions dynamically
    randomSuggestions.forEach(suggestion => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'suggestion';

        // Set button content
        button.innerHTML = `
            <span class="suggestion-text">${suggestion.text}</span>
            <span class="suggestion-icon">${suggestion.icon}</span>
        `;

        // Attach click event to set the input
        button.addEventListener('click', function() {
            document.getElementById('chat-input').value = suggestion.text;
        });

        suggestionsContainer.appendChild(button);
    });
    function updateToggleButtonAriaLabel() {
        modeToggle.setAttribute('aria-label', body.classList.contains('dark-mode') ? 'Switch to dark mode' : 'Switch to light mode');
    }

    // Initial setup
    updateToggleButtonAriaLabel();
    loadNextQuestion();

    // Attach event listeners
    document.getElementById('chat-input').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleUserInput();
        }
    });

    document.getElementById('chat-form').addEventListener('submit', function (e) {
        e.preventDefault();
        handleUserInput();
    });

    document.getElementById('continue-button').addEventListener('click', handleContinueButtonClick);

    document.querySelectorAll('.suggestion').forEach(button => {
        button.addEventListener('click', function() {
            const suggestionText = this.querySelector('.suggestion-text').textContent; // Get the text within the suggestion button
            document.getElementById('chat-input').value = suggestionText; // Set the input to the selected suggestion
        });
    });
    
});

function loadNextQuestion() {
    if (currentQuestionIndex < predefinedQuestions.length) {
        addChatMessage('bot', predefinedQuestions[currentQuestionIndex].question);
    } else {
        addChatMessage('bot', 'Thank you for your responses!');
        setTimeout(showModal, 2000);
    }
}

function handleUserInput() {
    const chatInput = document.getElementById('chat-input');
    const userMessage = chatInput.value.trim();

    if (userMessage) {
        addChatMessage('user', userMessage);
        // Hide the greeting and question after the first input
        if (currentQuestionIndex === 0) {
            const greeting = document.querySelector('.greeting');
            const question = document.querySelector('.question');
            greeting.style.display = 'none';
            question.style.display = 'none';

            // Hide the suggestions box after the first input
            const suggestions = document.querySelector('.suggestions');
            suggestions.style.display = 'none';
        }
        // Store user response in the appropriate property based on current question index
        switch (currentQuestionIndex) {
            case 0:
                userResponses.first = userMessage; // First preference
                break;
            case 1:
                userResponses.second = userMessage; // Second preference
                break;
            case 2:
                userResponses.third = userMessage; // Third preference
                break;
        }

        currentQuestionIndex++; // Move to the next question
        loadNextQuestion(); // Load the next question
        chatInput.value = ''; // Clear input field after sending the message
    }
}

function addChatMessage(sender, message) {
    const chatContainer = document.getElementById('chatbot');
    const chatMessage = document.createElement('div');
    chatMessage.classList.add('chat-message', sender);
    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    messageContent.textContent = message;
    chatMessage.appendChild(messageContent);
    chatContainer.appendChild(chatMessage);
    chatContainer.scrollTop = chatContainer.scrollHeight; // Auto-scroll to bottom
}

function showModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'flex';
}

function handleContinueButtonClick() {
    // Ensure all three questions are answered
    if (!userResponses.first || !userResponses.second || !userResponses.third) {
        alert('Please answer all three questions before continuing.');
        return;
    }

    const continueButton = document.getElementById('continue-button');
    const modalContent = document.querySelector('.modal-content p'); // Select the paragraph element

    // Disable the button to prevent multiple clicks
    continueButton.disabled = true;

    // Change the button text to show loading state
    continueButton.innerHTML = '<span class="spinner"></span> Loading...';

    // Change the paragraph text to indicate waiting
    modalContent.textContent = 'Please wait...';

    const userData = {
        careerPreferences: userResponses // Store user responses as an object
    };

    fetch('/save-data/', { // Updated endpoint for saving data and generating questions
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    })
    .then(response => {
        if (response.ok) {
            window.location.href = '/questions'; // Redirect to the new questions page
        } else {
            console.error('Failed to save data');
            alert('Failed to save data. Please try again.');
            continueButton.disabled = false; // Re-enable button in case of error
            continueButton.innerHTML = 'Continue'; // Reset button text
            modalContent.textContent = 'Press continue to begin analysis...'; // Reset paragraph text
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while saving data. Please check your connection.');
        continueButton.disabled = false; // Re-enable button in case of error
        continueButton.innerHTML = 'Continue'; // Reset button text
        modalContent.textContent = 'Press continue to begin analysis...'; // Reset paragraph text
    });
}

