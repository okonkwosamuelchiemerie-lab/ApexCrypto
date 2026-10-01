// ===== CONTACT PAGE FUNCTIONALITY =====

document.addEventListener('DOMContentLoaded', function() {
  setupContactForm();
  setupFAQ();
  setupEditButtons();
});

// ===== SETUP CONTACT FORM =====
function setupContactForm() {
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', handleContactSubmit);
  }
}

// ===== HANDLE CONTACT FORM SUBMISSION =====
function handleContactSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('contactName').value;
  const email = document.getElementById('contactEmail').value;
  const phone = document.getElementById('contactPhone').value;
  const subject = document.getElementById('contactSubject').value;
  const message = document.getElementById('contactMessage').value;

  // Validate form
  if (!name || !email || !subject || !message) {
    showContactStatus('Please fill in all required fields', 'error');
    return;
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showContactStatus('Please enter a valid email address', 'error');
    return;
  }

  // Show processing message
  showContactStatus('Sending your message...', 'pending');

  // Simulate sending email (in real application, this would send to server)
  setTimeout(() => {
    // Create message object
    const contactMessage = {
      name: name,
      email: email,
      phone: phone,
      subject: subject,
      message: message,
      date: new Date().toLocaleString(),
      id: Date.now()
    };

    // Store in localStorage (in real app, this would be sent to backend)
    let messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
    messages.unshift(contactMessage);
    localStorage.setItem('contactMessages', JSON.stringify(messages));

    // Show success message
    showContactStatus(
      `✓ Message sent successfully! We'll get back to you at ${email} as soon as possible.`,
      'success'
    );

    // Clear form
    document.getElementById('contactForm').reset();
  }, 1500);
}

// ===== SHOW CONTACT STATUS =====
function showContactStatus(message, type) {
  const statusElement = document.getElementById('contactStatus');
  statusElement.textContent = message;
  statusElement.className = `status-message show ${type}`;

  if (type === 'success') {
    setTimeout(() => {
      statusElement.classList.remove('show');
    }, 5000);
  }
}

// ===== SETUP FAQ ACCORDION =====
function setupFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    question.addEventListener('click', function() {
      // Close other items
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          otherItem.querySelector('.faq-answer').style.display = 'none';
        }
      });

      // Toggle current item
      item.classList.toggle('active');
      if (item.classList.contains('active')) {
        answer.style.display = 'block';
      } else {
        answer.style.display = 'none';
      }
    });
  });
}

// ===== SETUP EDIT BUTTONS =====
function setupEditButtons() {
  // Email edit
  const emailEditForm = document.getElementById('emailEditForm');
  const emailInput = document.getElementById('emailInput');
  const emailDisplay = document.getElementById('emailDisplay');

  // Phone edit
  const phoneEditForm = document.getElementById('phoneEditForm');
  const phoneInput = document.getElementById('phoneInput');
  const phoneDisplay = document.getElementById('phoneDisplay');

  // Set initial values
  emailInput.value = emailDisplay.textContent;
  phoneInput.value = phoneDisplay.textContent;
}

// ===== TOGGLE EDIT EMAIL =====
function toggleEditEmail() {
  const form = document.getElementById('emailEditForm');
  const input = document.getElementById('emailInput');
  
  if (form.style.display === 'none') {
    form.style.display = 'block';
    input.value = document.getElementById('emailDisplay').textContent;
    input.focus();
  } else {
    form.style.display = 'none';
  }
}

// ===== SAVE EMAIL =====
function saveEmail() {
  const input = document.getElementById('emailInput');
  const email = input.value.trim();

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    alert('Please enter a valid email address');
    return;
  }

  // Update display
  document.getElementById('emailDisplay').textContent = email;
  
  // Save to localStorage
  localStorage.setItem('businessEmail', email);

  // Hide form
  document.getElementById('emailEditForm').style.display = 'none';
}

// ===== CANCEL EMAIL EDIT =====
function cancelEditEmail() {
  document.getElementById('emailEditForm').style.display = 'none';
}

// ===== TOGGLE EDIT PHONE =====
function toggleEditPhone() {
  const form = document.getElementById('phoneEditForm');
  const input = document.getElementById('phoneInput');
  
  if (form.style.display === 'none') {
    form.style.display = 'block';
    input.value = document.getElementById('phoneDisplay').textContent;
    input.focus();
  } else {
    form.style.display = 'none';
  }
}

// ===== SAVE PHONE =====
function savePhone() {
  const input = document.getElementById('phoneInput');
  const phone = input.value.trim();

  // Validate phone (basic validation)
  if (!phone || phone.length < 10) {
    alert('Please enter a valid phone number');
    return;
  }

  // Update display
  document.getElementById('phoneDisplay').textContent = phone;
  
  // Save to localStorage
  localStorage.setItem('businessPhone', phone);

  // Hide form
  document.getElementById('phoneEditForm').style.display = 'none';
}

// ===== CANCEL PHONE EDIT =====
function cancelEditPhone() {
  document.getElementById('phoneEditForm').style.display = 'none';
}

// ===== LOAD SAVED CONTACT INFO =====
window.addEventListener('load', function() {
  const savedEmail = localStorage.getItem('businessEmail');
  const savedPhone = localStorage.getItem('businessPhone');

  if (savedEmail) {
    document.getElementById('emailDisplay').textContent = savedEmail;
    document.getElementById('emailInput').value = savedEmail;
  }

  if (savedPhone) {
    document.getElementById('phoneDisplay').textContent = savedPhone;
    document.getElementById('phoneInput').value = savedPhone;
  }
});
