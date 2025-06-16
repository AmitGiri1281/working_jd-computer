document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  // Use absolute URL to your backend
 const API_URL = 'https://working-jd-computer.onrender.com/api/contacts';


  // Remove any existing listeners to prevent duplicates
  contactForm.replaceWith(contactForm.cloneNode(true));
  const freshForm = document.getElementById('contactForm');

  freshForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const formStatus = document.getElementById('formStatus');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Disable button during submission
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    
    try {
      // Validate form
      const errors = validateForm(form);
      if (errors.length > 0) {
        throw new Error(errors.join('\n'));
      }

      // Prepare form data
      const formData = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim() || null,
        message: form.message.value.trim()
      };

      // Send to backend
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Submission failed');
      }
      
      // Success
      formStatus.textContent = result.message || 'Thank you! Your message has been sent.';
      formStatus.style.color = 'green';
      formStatus.style.display = 'block';
      form.reset();
      
    } catch (error) {
      // Error handling
      formStatus.textContent = error.message || 'Error submitting form. Please try again.';
      formStatus.style.color = 'red';
      formStatus.style.display = 'block';
      console.error('Form submission error:', error);
    } finally {
      // Reset button
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Send Message';
    }
  });

  // Form validation
  function validateForm(form) {
    const errors = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Name validation
    if (!form.name.value.trim()) {
      errors.push('Name is required');
    } else if (form.name.value.trim().length < 2) {
      errors.push('Name must be at least 2 characters');
    }

    // Email validation
    if (!form.email.value.trim()) {
      errors.push('Email is required');
    } else if (!emailRegex.test(form.email.value.trim())) {
      errors.push('Please enter a valid email');
    }

    // Phone validation (optional)
    if (form.phone.value.trim() && !/^\d{10,15}$/.test(form.phone.value.trim())) {
      errors.push('Phone must be 10-15 digits');
    }

    // Message validation
    if (!form.message.value.trim()) {
      errors.push('Message is required');
    } else if (form.message.value.trim().length < 10) {
      errors.push('Message must be at least 10 characters');
    }

    return errors;
  }
});