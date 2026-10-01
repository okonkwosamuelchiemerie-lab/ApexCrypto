const authStorageKey = 'apexcrypto-authenticated';

function syncNavigation() {
  let authenticated = false;

  try {
    authenticated = localStorage.getItem(authStorageKey) === 'true';
  } catch {
    authenticated = false;
  }

  document.body.classList.toggle('is-authenticated', authenticated);

  const navRight = document.querySelector('.nav-right');
  if (!navRight || navRight.querySelector('.logout-link')) return;

  const logoutLink = document.createElement('a');
  logoutLink.href = 'home_crypto.html';
  logoutLink.className = 'btn-outline logout-link';
  logoutLink.textContent = 'Log out';
  logoutLink.addEventListener('click', function(event) {
    event.preventDefault();
    try {
      localStorage.removeItem(authStorageKey);
    } catch {
      // Navigation still returns to the public homepage if storage is unavailable.
    }
    window.location.href = 'home_crypto.html';
  });
  navRight.appendChild(logoutLink);
}

// ===== DROPDOWN INTERACTIONS =====
document.addEventListener('DOMContentLoaded', function() {
  syncNavigation();

  const dropdowns = document.querySelectorAll('.dropdown');
  
  dropdowns.forEach(dropdown => {
    const link = dropdown.querySelector('a');
    
    if (link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        dropdown.classList.toggle('active');
        
        // Close other dropdowns
        dropdowns.forEach(d => {
          if (d !== dropdown) {
            d.classList.remove('active');
          }
        });
      });
    }
  });
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.dropdown')) {
      dropdowns.forEach(d => d.classList.remove('active'));
    }
  });
  
  // Close on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      dropdowns.forEach(d => d.classList.remove('active'));
    }
  });
});

// ===== FILTER BUTTONS =====
function setupFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // Remove active from all
      filterBtns.forEach(b => b.classList.remove('active'));
      // Add active to clicked
      this.classList.add('active');
      // Trigger filter logic here
    });
  });
}

// ===== SEARCH FUNCTIONALITY =====
function setupSearch() {
  const searchInput = document.querySelector('.nav-right input');
  
  if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        const query = this.value.trim();
        if (query) {
          console.log('Searching for:', query);
          // Add your search logic here
        }
      }
    });
  }
}

// ===== PAGE LOAD =====
document.addEventListener('DOMContentLoaded', function() {
  setupFilters();
  setupSearch();
});

// ===== SCROLL TO TOP =====
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// Show scroll-to-top button when scrolled
window.addEventListener('scroll', function() {
  const scrollBtn = document.querySelector('.scroll-to-top');
  if (scrollBtn) {
    if (window.scrollY > 300) {
      scrollBtn.style.display = 'block';
    } else {
      scrollBtn.style.display = 'none';
    }
  }
});
