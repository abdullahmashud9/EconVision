/**
 * EconVision - Global Interaction & Navigation Logic
 * Academic & Professional Networking Community
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollProgressBar();
  initStickyHeader();
  initMobileMenu();
  highlightActiveNavLink();
  initScrollReveal();
  initHeroParallaxTilt();
  initBackToTopButton();
  initRegistrationForm();
  initContactForm();
});

/**
 * 1. Global Top Scroll Progress Indicator
 */
function initScrollProgressBar() {
  const bar = document.getElementById('scrollProgressBar');
  if (!bar) return;

  const updateProgress = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  };

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}

/**
 * 2. Sticky Header Elevation on Scroll
 */
function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/**
 * 3. Mobile Navigation Drawer Toggle
 */
function initMobileMenu() {
  const toggleBtn = document.querySelector('.mobile-menu-toggle');
  const drawer = document.querySelector('.mobile-drawer');

  if (!toggleBtn || !drawer) return;

  const toggleMenu = (state) => {
    const isOpen = typeof state === 'boolean' ? state : !drawer.classList.contains('is-open');
    drawer.classList.toggle('is-open', isOpen);
    toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    
    // Toggle hamburger icon if SVG inside
    if (isOpen) {
      toggleBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;
    } else {
      toggleBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      `;
    }
  };

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (drawer.classList.contains('is-open') && !drawer.contains(e.target) && !toggleBtn.contains(e.target)) {
      toggleMenu(false);
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
      toggleMenu(false);
      toggleBtn.focus();
    }
  });
}

/**
 * 4. Highlight Active Navigation Links based on URL
 */
function highlightActiveNavLink() {
  const path = window.location.pathname.replace(/\/$/, '') || '/index.html';
  const pageName = path.split('/').pop().replace(/\.html$/, '') || 'index';

  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;

    const linkPage = href.split('/').pop().replace(/\.html$/, '') || 'index';

    if (linkPage === pageName || (pageName === '' && linkPage === 'index')) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });
}

/**
 * 5. Modern Scroll Reveal with Staggered Cascades
 */
function initScrollReveal() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.querySelectorAll('.reveal-on-scroll, .reveal-scale').forEach(el => el.classList.add('is-visible'));
    return;
  }

  const elements = document.querySelectorAll('.reveal-on-scroll, .reveal-scale');
  if (!elements.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          
          // Also trigger any staggered child items
          if (entry.target.classList.contains('reveal-stagger')) {
            entry.target.querySelectorAll('.reveal-on-scroll').forEach(child => child.classList.add('is-visible'));
          }

          obs.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.08,
      rootMargin: '0px 0px -30px 0px'
    });

    elements.forEach(el => observer.observe(el));
    document.querySelectorAll('.reveal-stagger').forEach(el => observer.observe(el));
  } else {
    elements.forEach(el => el.classList.add('is-visible'));
  }
}

/**
 * 6. Interactive 3D Parallax Tilt on Hero Card
 */
function initHeroParallaxTilt() {
  const card = document.querySelector('.hero-visual-card');
  if (!card) return;

  // Only activate on devices that support hover / mouse pointer
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5; // max 5deg
      const rotateY = ((x - centerX) / centerX) * 5;  // max 5deg

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  }
}

/**
 * 7. Smooth Back to Top Button
 */
function initBackToTopButton() {
  const btn = document.getElementById('btnBackToTop');
  if (!btn) return;

  const toggleVisibility = () => {
    if (window.scrollY > 350) {
      btn.classList.add('is-visible');
    } else {
      btn.classList.remove('is-visible');
    }
  };

  window.addEventListener('scroll', toggleVisibility, { passive: true });
  toggleVisibility();

  btn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/**
 * 5. Academic Membership Registration Form Handler (Google Sheets Integration)
 */
// Set your Google Apps Script Web App URL here after deploying google-apps-script.js
const GOOGLE_SHEET_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxZpzOqFdBfz4uV57kOhiHFDiqYsc9AxRy64Qxb2ccbJE_-KPKkm57ApBGg42TXx2UXNg/exec';

function initRegistrationForm() {
  const form = document.getElementById('econRegistrationForm');
  const successBanner = document.getElementById('registrationSuccessBanner');
  const submitBtn = document.getElementById('btnRegisterSubmit');
  const reDownloadBtn = document.getElementById('btnReDownloadReceipt');

  if (!form) return;

  let lastRegisteredData = null;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Check validity
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const originalBtnHTML = submitBtn ? submitBtn.innerHTML : '';

    // Set loading state on submit button
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10"></path>
        </svg>
        <span>Generating Pass &amp; Registering...</span>
      `;
    }

    // Collect all form data
    const formData = new FormData(form);
    const payload = {
      fullName: formData.get('fullName') || '',
      email: formData.get('email') || '',
      phone: formData.get('phone') || '',
      country: formData.get('country') || '',
      profession: formData.get('profession') || '',
      affiliation: formData.get('affiliation') || '',
      whyEconVision: formData.get('whyEconVision') || ''
    };
    lastRegisteredData = payload;

    try {
      if (GOOGLE_SHEET_WEB_APP_URL && GOOGLE_SHEET_WEB_APP_URL.trim() !== '') {
        // Send asynchronously to Google Apps Script
        // Use text/plain to avoid CORS preflight OPTIONS request on Google Apps Script
        const response = await fetch(GOOGLE_SHEET_WEB_APP_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();
        console.log('EconVision registration synced with Google Sheets:', result);
      } else {
        // Simulated local delay if URL is not yet configured
        await new Promise(resolve => setTimeout(resolve, 800));
        console.info('EconVision Registration captured locally:', payload);
      }

      // Generate & automatically trigger download of the receipt image
      await generateAndDownloadReceipt(payload);

      // Hide form and display success confirmation card
      form.style.display = 'none';
      if (successBanner) {
        successBanner.classList.add('is-visible');
        successBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (error) {
      console.warn('Network / fetch response notice:', error);
      
      // Still generate receipt and show success so the user is never stranded
      await generateAndDownloadReceipt(payload);

      form.style.display = 'none';
      if (successBanner) {
        successBanner.classList.add('is-visible');
        successBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
      }
    }
  });

  // Allow re-downloading the receipt from the success banner
  if (reDownloadBtn) {
    reDownloadBtn.addEventListener('click', async () => {
      if (lastRegisteredData) {
        await generateAndDownloadReceipt(lastRegisteredData);
      }
    });
  }
}

/**
 * 6. Academic Inquiries Form Handler (contact.html)
 */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const successBanner = document.getElementById('contactSuccessBanner');
  const submitBtn = document.getElementById('btnContactSubmit');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate fields
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const originalBtnHTML = submitBtn ? submitBtn.innerHTML : '';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10"></path>
        </svg>
        <span>Submitting Inquiry...</span>
      `;
    }

    const formData = new FormData(form);
    const payload = {
      type: 'inquiry',
      fullName: formData.get('fullName') || '',
      affiliation: formData.get('affiliation') || '',
      email: formData.get('email') || '',
      inquiryType: formData.get('inquiryType') || '',
      message: formData.get('message') || ''
    };

    try {
      if (GOOGLE_SHEET_WEB_APP_URL && GOOGLE_SHEET_WEB_APP_URL.trim() !== '') {
        const response = await fetch(GOOGLE_SHEET_WEB_APP_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();
        console.log('EconVision inquiry recorded in Google Sheets:', result);
      } else {
        await new Promise(resolve => setTimeout(resolve, 800));
        console.info('EconVision Inquiry recorded locally:', payload);
      }

      // Display success banner and hide form
      form.style.display = 'none';
      if (successBanner) {
        successBanner.style.display = 'block';
        successBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (error) {
      console.warn('Network / fetch response notice:', error);
      form.style.display = 'none';
      if (successBanner) {
        successBanner.style.display = 'block';
        successBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
      }
    }
  });
}

/**
 * 7. Generate and Download Professional Member Receipt Image (html2canvas)
 */
async function generateAndDownloadReceipt(userData) {
  const receiptElement = document.getElementById('econvisionMemberReceipt');
  if (!receiptElement) return;

  const userNameEl = document.getElementById('receiptUserName');
  const memberNameEl = document.getElementById('receiptMemberName');
  const affiliationEl = document.getElementById('receiptMemberAffiliation');
  const roleEl = document.getElementById('receiptMemberRole');
  const countryEl = document.getElementById('receiptMemberCountry');
  const issueDateEl = document.getElementById('receiptIssueDate');
  const passIdEl = document.getElementById('receiptPassId');

  const fullName = userData.fullName || 'Economist';
  if (userNameEl) userNameEl.textContent = fullName;
  if (memberNameEl) memberNameEl.textContent = fullName;
  if (affiliationEl) affiliationEl.textContent = userData.affiliation || 'EconVision Academic Network';
  if (roleEl) roleEl.textContent = userData.profession || 'Economics Scholar / Researcher';
  if (countryEl) countryEl.textContent = userData.country || 'International';

  // Generate unique scholarly pass ID
  const randomPassCode = Math.floor(1000 + Math.random() * 9000);
  if (passIdEl) passIdEl.textContent = `Pass ID: EV-2026-${randomPassCode}`;

  // Format date: e.g. "August 20, 2026"
  const now = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = now.toLocaleDateString('en-US', options);
  if (issueDateEl) issueDateEl.textContent = `Issued: ${formattedDate}`;

  // Small delay for DOM layout calculation
  await new Promise(resolve => setTimeout(resolve, 150));

  try {
    if (typeof html2canvas === 'function') {
      const canvas = await html2canvas(receiptElement, {
        scale: 2.5, // Ultra-sharp 2.5x retina rendering
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#FFFFFF',
        logging: false,
        windowWidth: 860
      });

      // Convert canvas to image and trigger automatic download
      const imageURL = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = imageURL;
      const sanitizedName = fullName.replace(/[^a-zA-Z0-9]/g, '_');
      downloadLink.download = `EconVision_Receipt_${sanitizedName}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      console.log('EconVision Member Receipt downloaded successfully.');
    } else {
      console.warn('html2canvas library not loaded; skipping image generation.');
    }
  } catch (err) {
    console.error('Error generating receipt canvas:', err);
  }
}
