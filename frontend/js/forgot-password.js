document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('forgotPasswordForm');
  const statusMsg = document.getElementById('statusMessage');
  const submitBtn = document.getElementById('submitBtn');
  const resetSteps = document.getElementById('resetSteps');
  let resetToken = null;
  let currentUsername = null;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const username = document.getElementById('username').value.trim();
      
      if (!resetToken) {
        // Step 1: Request password reset
        const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to initiate password reset');
        }

        const data = await response.json();
        resetToken = data.token;
        currentUsername = username;
        
        // Show password reset fields
        resetSteps.style.display = 'block';
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Reset Password';
        statusMsg.textContent = 'Please enter your new password';
        statusMsg.style.color = 'green';
        statusMsg.style.display = 'block';
      } else {
        // Step 2: Submit new password
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
          throw new Error('Passwords do not match');
        }

        if (newPassword.length < 8) {
          throw new Error('Password must be at least 8 characters');
        }

        const response = await fetch('http://localhost:5000/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            username: currentUsername,
            token: resetToken,
            newPassword 
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to reset password');
        }

        statusMsg.textContent = 'Password reset successfully! Redirecting to login...';
        statusMsg.style.color = 'green';
        
        setTimeout(() => {
          window.location.href = 'admin-login.html';
        }, 2000);
      }
    } catch (error) {
      statusMsg.textContent = error.message;
      statusMsg.style.color = 'red';
    } finally {
      setLoading(false);
    }
  });

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    const icon = submitBtn.querySelector('i');
    if (isLoading) {
      icon.classList.add('fa-spinner', 'fa-spin');
      icon.classList.remove('fa-paper-plane', 'fa-save');
    } else {
      if (resetToken) {
        icon.classList.add('fa-save');
        icon.classList.remove('fa-paper-plane', 'fa-spinner', 'fa-spin');
      } else {
        icon.classList.add('fa-paper-plane');
        icon.classList.remove('fa-save', 'fa-spinner', 'fa-spin');
      }
    }
  }
});