document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const loginForm = document.getElementById('loginForm');
  const statusMsg = document.getElementById('loginStatus');
  const submitBtn = loginForm.querySelector('button[type="submit"]');
  const togglePassword = document.querySelector('.toggle-password');
  const passwordInput = document.getElementById('password');

  // Configuration
  const API_BASE_URL = 'http://localhost:5000'; // Your backend server URL
  const DASHBOARD_URL = 'admin-dashboard.html'; // Your dashboard page
  const TOKEN_KEY = 'adminToken'; // LocalStorage key for token

  // Password visibility toggle
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', () => {
      const type = passwordInput.type === 'password' ? 'text' : 'password';
      passwordInput.type = type;
      togglePassword.setAttribute('aria-pressed', type === 'text');
      togglePassword.innerHTML = `<i class="fas fa-eye${type === 'password' ? '' : '-slash'}"></i>`;
    });
  }

  // Form submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form values - using username instead of email
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    // Validation
    if (!validateInputs(username, password)) return;

    // UI Loading state
    setLoading(true);

    try {
      // API Request - sending username instead of email
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }) // Using username
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      
      // Successful login
      localStorage.setItem(TOKEN_KEY, data.token);
      displayStatus('Login successful! Redirecting...', 'green');
      
      // Redirect after delay
      setTimeout(() => {
        window.location.href = DASHBOARD_URL;
      }, 1500);

    } catch (error) {
      handleLoginError(error);
    } finally {
      setLoading(false);
    }
  });

  // Helper Functions
  function validateInputs(username, password) {
    if (!username || !password) {
      displayStatus('Please fill in all fields', 'red');
      return false;
    }

    if (password.length < 8) {
      displayStatus('Password must be at least 8 characters', 'red');
      return false;
    }

    return true;
  }

  function displayStatus(message, color) {
    statusMsg.textContent = message;
    statusMsg.style.color = color;
    statusMsg.style.display = 'block';
  }

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitBtn.innerHTML = isLoading
      ? '<i class="fas fa-spinner fa-spin"></i> Logging in...'
      : '<i class="fas fa-sign-in-alt"></i> Login';
  }

  function handleLoginError(error) {
    console.error('Login error:', error);
    
    let errorMessage = error.message;
    if (error.message.includes('Failed to fetch')) {
      errorMessage = 'Network error. Please check your connection.';
    } else if (error.message.includes('credentials')) {
      errorMessage = 'Invalid username or password';
    }

    displayStatus(errorMessage, 'red');
    document.getElementById('password').value = '';
    passwordInput.focus();
  }
});