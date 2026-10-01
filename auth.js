// ===== PASSWORD TOGGLE =====
document.addEventListener('DOMContentLoaded', function() {
  const toggleButtons = document.querySelectorAll('.toggle-password');
  
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      
      const input = this.previousElementSibling;
      const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
      input.setAttribute('type', type);
      
      // Update button visual feedback
      this.classList.toggle('active');
    });
  });
});

// ===== FORM VALIDATION =====
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

if (loginForm) {
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    let isValid = true;
    
    // Clear errors
    clearErrors();
    
    // Validate email
    if (!email.value || !isValidEmail(email.value)) {
      showError('emailError', 'Please enter a valid email address');
      isValid = false;
    }
    
    // Validate password
    if (!password.value || password.value.length < 6) {
      showError('passwordError', 'Password must be at least 6 characters');
      isValid = false;
    }
    
    if (isValid) {
      localStorage.setItem('apexcrypto-authenticated', 'true');
      window.location.href = 'home_crypto.html';
    }
  });
}

if (registerForm) {
  registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const fullname = document.getElementById('fullname');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirm-password');
    const terms = document.querySelector('input[name="terms"]');
    
    let isValid = true;
    clearErrors();
    
    // Validate full name
    if (!fullname.value || fullname.value.trim().length < 3) {
      showError('fullnameError', 'Please enter a valid name');
      isValid = false;
    }
    
    // Validate email
    if (!email.value || !isValidEmail(email.value)) {
      showError('emailError', 'Please enter a valid email address');
      isValid = false;
    }
    
    // Validate password
    if (!password.value || password.value.length < 8) {
      showError('passwordError', 'Password must be at least 8 characters');
      isValid = false;
    }
    
    // Check password strength
    if (password.value && !isStrongPassword(password.value)) {
      showError('passwordError', 'Password should contain letters, numbers, and symbols');
      isValid = false;
    }
    
    // Validate confirm password
    if (!confirmPassword.value || confirmPassword.value !== password.value) {
      showError('confirmPasswordError', 'Passwords do not match');
      isValid = false;
    }
    
    // Validate terms
    if (!terms.checked) {
      showError('termsError', 'Please accept the terms and conditions');
      isValid = false;
    }
    
    if (isValid) {
      localStorage.setItem('apexcrypto-authenticated', 'true');
      window.location.href = 'home_crypto.html';
    }
  });
}

// ===== HELPER FUNCTIONS =====
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isStrongPassword(password) {
  const hasLetters = /[a-zA-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);
  
  return hasLetters && hasNumbers && hasSpecial;
}

function showError(elementId, message) {
  const errorEl = document.getElementById(elementId);
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('show');
    errorEl.previousElementSibling?.classList.add('invalid');
  }
}

function clearErrors() {
  const errorEls = document.querySelectorAll('.error-msg');
  errorEls.forEach(el => {
    el.textContent = '';
    el.classList.remove('show');
    el.previousElementSibling?.classList.remove('invalid');
  });
}

// Real-time validation
document.addEventListener('DOMContentLoaded', function() {
  const inputs = document.querySelectorAll('.auth-form input');
  
  inputs.forEach(input => {
    input.addEventListener('blur', function() {
      let errorId = this.name + 'Error';
      
      if (this.type === 'email' && this.value) {
        if (!isValidEmail(this.value)) {
          showError(errorId, 'Invalid email address');
        }
      }
      
      if (this.name === 'password' && this.value) {
        if (this.value.length < 8) {
          showError(errorId, 'Password must be at least 8 characters');
        }
      }
    });
  });
});
