document.addEventListener('DOMContentLoaded', function() {
    // Always show the premium modal when the page is loaded
    document.getElementById('premiumModal').style.display = 'flex';
    document.getElementById('content').style.filter = 'blur(5px)';
    document.getElementById('content').style.pointerEvents = 'none';

    // Check if terms are confirmed
    if (localStorage.getItem('termsConfirmed')) {
        document.getElementById('content').style.filter = 'none';
        document.getElementById('content').style.pointerEvents = 'auto';
        document.getElementById('overlay').style.display = 'none';
        document.getElementById('sendButton').disabled = false;
    }

    // Check premium status
    const premiumExpiry = new Date(localStorage.getItem('premiumExpiry'));
    if (localStorage.getItem('isPremium') === 'true' && premiumExpiry > new Date()) {
        document.getElementById('userSection').innerHTML = `<p>Welcome, ${localStorage.getItem('username')} (Premium)</p>`;
        showPremiumFeatures();
    } else {
        localStorage.setItem('isPremium', 'false');
        hidePremiumFeatures();
    }
});

// Close premium modal
document.getElementById('closePremiumModal').addEventListener('click', function() {
    document.getElementById('premiumModal').style.display = 'none';
    document.getElementById('content').style.filter = 'none';
    document.getElementById('content').style.pointerEvents = 'auto';
});

// Handle form submission
document.getElementById('imageForm').addEventListener('submit', function(event) {
    event.preventDefault();
    handleUserMessage();
});

// Confirm terms
document.getElementById('confirmButton').addEventListener('click', function() {
    document.getElementById('content').style.filter = 'none';
    document.getElementById('content').style.pointerEvents = 'auto';
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('sendButton').disabled = false;
    localStorage.setItem('termsConfirmed', 'true');
});

// Toggle menu display
document.getElementById('menuButton').addEventListener('click', () => {
    const menu = document.getElementById('menu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    const username = localStorage.getItem('username');
    if (username) {
        const premiumExpiry = new Date(localStorage.getItem('premiumExpiry'));
        if (localStorage.getItem('isPremium') === 'true' && premiumExpiry > new Date()) {
            document.getElementById('userSection').innerHTML = `<p>Welcome, ${username} (Premium)</p>`;
        } else {
            document.getElementById('userSection').innerHTML = `<p>Welcome, ${username}</p>`;
        }
    }
});

// Show login modal
document.getElementById('loginButton').addEventListener('click', () => {
    document.getElementById('loginModal').style.display = 'flex';
});

// Show signup modal
document.getElementById('signupButton').addEventListener('click', () => {
    document.getElementById('signupModal').style.display = 'flex';
});

// Close login modal
document.getElementById('closeLoginModal').addEventListener('click', () => {
    document.getElementById('loginModal').style.display = 'none';
});

// Close signup modal
document.getElementById('closeSignupModal').addEventListener('click', () => {
    document.getElementById('signupModal').style.display = 'none';
});

// Close modals on outside click
window.addEventListener('click', (event) => {
    if (event.target === document.getElementById('loginModal')) {
        document.getElementById('loginModal').style.display = 'none';
    }
    if (event.target === document.getElementById('signupModal')) {
        document.getElementById('signupModal').style.display = 'none';
    }
});

// Handle login
document.getElementById('submitLogin').addEventListener('click', () => {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const storedUsername = localStorage.getItem('username');
    const storedPassword = localStorage.getItem('password');

    if (username === storedUsername && password === storedPassword) {
        alert('Login successful');
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('userSection').innerHTML = `<p>Welcome, ${username}</p>`;
    } else {
        alert('Invalid login credentials');
    }
});

// Handle signup
document.getElementById('submitSignup').addEventListener('click', () => {
    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPassword').value;

    if (username && password) {
        localStorage.setItem('username', username);
        localStorage.setItem('password', password);
        alert('Signup successful');
        document.getElementById('signupModal').style.display = 'none';
        document.getElementById('userSection').innerHTML = `<p>Welcome, ${username}</p>`;
    } else {
        alert('Please fill in both fields');
    }
});

// Buy premium
document.getElementById('buyPremiumButton').addEventListener('click', () => {
    window.location.href = 'https://oxapay.com/pay/51865586/40786708';
});

// Handle payment success
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('payment') && urlParams.get('payment') === 'success') {
        const username = localStorage.getItem('username');
        if (username) {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 30); // Set expiry date to 30 days from now
            localStorage.setItem('isPremium', 'true');
            localStorage.setItem('premiumExpiry', expiryDate);
            alert('Payment successful! You are now a premium member.');
            document.getElementById('userSection').innerHTML = `<p>Welcome, ${username} (Premium)</p>`;
            showPremiumFeatures();
        }
    }
});

// Handle user message submission
function handleUserMessage() {
    const promptInput = document.getElementById('prompt');
    const prompt = promptInput.value.trim();
    if (prompt) {
        addMessage(prompt, 'user');
        promptInput.value = '';
        setTimeout(() => {
            startImageGeneration(prompt);
        }, 1000);
    }
}

// Add message to chat
function addMessage(message, sender) {
    const chatContainer = document.getElementById('chatContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = message;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Start image generation
function startImageGeneration(prompt) {
    const isPremium = localStorage.getItem('isPremium') === 'true';
    isGenerating = true;
    document.getElementById('sendButton').disabled = true;

    const randomDelay = isPremium ? 0 : Math.floor(Math.random() * 41) + 10;

    if (!isPremium) {
        const countdownTimer = document.createElement('div');
        countdownTimer.className = 'timer';
        let timeLeft = randomDelay;
        countdownTimer.textContent = `Image will be ready in ${timeLeft} seconds...`;

        const countdownInterval = setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                countdownTimer.textContent = 'Image is ready, please wait...';
                generateImage(prompt);
            } else {
                countdownTimer.textContent = `Image will be ready in ${timeLeft} seconds...`;
            }
        }, 1000);

        addMessage('Generating image...', 'bot');
        const chatContainer = document.getElementById('chatContainer');
        chatContainer.appendChild(countdownTimer);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    } else {
        generateImage(prompt);
    }
}

// Generate image
function generateImage(prompt) {
    currentSeed = Math.floor(Math.random() * 10000);
    const width = document.getElementById('width').value || '1024';
    const height = document.getElementById('height').value || '1024';

    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${currentSeed}&nologo=true`;

    const image = new Image();
    image.src = imageUrl;
    image.onload = () => {
        addMessage('', 'bot');
        const chatContainer = document.getElementById('chatContainer');
        const lastMessage = chatContainer.lastElementChild;
        lastMessage.appendChild(image);

        if (localStorage.getItem('isPremium') === 'true') {
            const downloadButton = document.createElement('button');
            downloadButton.className = 'regenerate-button';
            downloadButton.textContent = 'Download';
            downloadButton.onclick = () => {
                const link = document.createElement('a');
                link.href = imageUrl;
                link.download = 'generated_image.png';
                link.click();
            };
            lastMessage.appendChild(downloadButton);
        }

        document.getElementById('sendButton').disabled = false;
        isGenerating = false;
    };
}

// Show premium features
function showPremiumFeatures() {
    const premiumFeatures = document.querySelectorAll('.premium-feature');
    premiumFeatures.forEach(feature => {
        feature.style.display = 'block';
    });
}

// Hide premium features
function hidePremiumFeatures() {
    const premiumFeatures = document.querySelectorAll('.premium-feature');
    premiumFeatures.forEach(feature => {
        feature.style.display = 'none';
    });
}












document.addEventListener('DOMContentLoaded', function() {
    // Close settings menu
    document.getElementById('closeSettingsButton').addEventListener('click', () => {
        document.getElementById('menu').style.display = 'none';
    });

    // Show login modal and close settings menu
    document.getElementById('loginButton').addEventListener('click', () => {
        document.getElementById('loginModal').style.display = 'flex';
        document.getElementById('menu').style.display = 'none';
    });

    // Show signup modal and close settings menu
    document.getElementById('signupButton').addEventListener('click', () => {
        document.getElementById('signupModal').style.display = 'flex';
        document.getElementById('menu').style.display = 'none';
    });
});
