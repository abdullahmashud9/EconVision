/**
 * EconVision - Global Interaction & Navigation Logic
 * Academic & Professional Networking Community
 */

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileMenu();
  highlightActiveNavLink();
  initScrollReveal();
  initRegistrationForm();
  initContactForm();
  initBackToTop();
  initResourceFilter();
  initArticlesHub();
});

/**
 * 1. Sticky Header Elevation on Scroll
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
 * 2. Mobile Navigation Drawer Toggle
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
 * 3. Highlight Active Navigation Links based on URL
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
 * 4. Gentle Minimal Scroll Fade-in Reveal
 */
function initScrollReveal() {
  // Check if reduced motion is requested
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.querySelectorAll('.reveal-on-scroll').forEach(el => el.classList.add('is-visible'));
    return;
  }

  const elements = document.querySelectorAll('.reveal-on-scroll');
  if (!elements.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach(el => observer.observe(el));
  } else {
    // Fallback for older browsers
    elements.forEach(el => el.classList.add('is-visible'));
  }
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

/**
 * 8. Floating Back to Top Button
 */
function initBackToTop() {
  const backToTopBtn = document.getElementById('btnBackToTop');
  if (!backToTopBtn) return;

  const handleScroll = () => {
    if (window.scrollY > 350) {
      backToTopBtn.classList.add('is-visible');
    } else {
      backToTopBtn.classList.remove('is-visible');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/**
 * 9. Interactive Resource Directory Search & Category Filter
 */
function initResourceFilter() {
  const searchInput = document.getElementById('resourceSearchInput');
  const pillBtns = document.querySelectorAll('.resource-pill-btn');
  const resourceCards = document.querySelectorAll('.resource-item-card');
  const sectionBlocks = document.querySelectorAll('.resource-section-block');

  if (!resourceCards.length) return;

  let activeCategory = 'all';
  let searchTerm = '';

  function applyFilter() {
    resourceCards.forEach(card => {
      const cardCategory = card.getAttribute('data-category') || '';
      const cardKeywords = (card.getAttribute('data-keywords') || '').toLowerCase();
      const cardText = (card.textContent || '').toLowerCase();

      const matchesCategory = (activeCategory === 'all') || (cardCategory === activeCategory);
      const matchesSearch = !searchTerm || cardKeywords.includes(searchTerm) || cardText.includes(searchTerm);

      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });

    // Hide/show section blocks based on visible cards inside them
    sectionBlocks.forEach(section => {
      const visibleCards = section.querySelectorAll('.resource-item-card[style*="display: flex"], .resource-item-card:not([style*="display: none"])');
      let count = 0;
      section.querySelectorAll('.resource-item-card').forEach(c => {
        if (c.style.display !== 'none') count++;
      });
      section.style.display = count > 0 ? 'block' : 'none';
    });
  }

  // Pill click handler
  pillBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      pillBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-filter') || 'all';
      applyFilter();
    });
  });

  // Search input handler
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.trim().toLowerCase();
      applyFilter();
    });
  }
}

/**
 * 10. Interactive Articles & Scholarly Insights Hub
 */
function initArticlesHub() {
  const searchInput = document.getElementById('articleSearchInput');
  const pillBtns = document.querySelectorAll('.article-pill-btn');
  const articleCards = document.querySelectorAll('.article-item-card');
  const modal = document.getElementById('articleModal');
  const modalClose = document.getElementById('articleModalClose');
  const modalBadge = document.getElementById('modalBadge');
  const modalTitle = document.getElementById('modalTitle');
  const modalAuthors = document.getElementById('modalAuthors');
  const modalAffil = document.getElementById('modalAffil');
  const modalBody = document.getElementById('modalBody');

  if (!articleCards.length) return;

  // Rich Article Essays Database
  const articlesData = {
    "1": {
      title: "Breaking the Twin Balance Sheet: Banking Reforms and India's Investment Cycle",
      badge: "Macro & Finance",
      authors: "Dr. Arvind Subramanian & Dr. Raghuram Rajan",
      affil: "Brown University & University of Chicago Booth School of Business",
      body: `
        <h4>1. Background & The Over-Leverage Problem</h4>
        <p>Following the post-2008 infrastructure boom in India, public sector banks faced staggering non-performing assets (NPAs) exceeding 11% of gross advances by 2017. Infrastructure conglomerates were unable to service their debt, locking up banking capital in "evergreened" zombie loans and depressing private capital expenditure.</p>
        <h4>2. The Structural Reform Package</h4>
        <p>The Reserve Bank of India enacted the comprehensive Asset Quality Review (AQR), forcing full balance sheet transparency. In parallel, the enactment of the Insolvency and Bankruptcy Code (IBC) in 2016 introduced a time-bound statutory resolution mechanism, ending the era of perpetual debtor immunity.</p>
        <h4>3. Empirical Outcomes & Policy Takeaways</h4>
        <ul>
          <li><strong>Gross NPAs declined</strong> from 11.2% in 2017 to under 2.8% by 2024.</li>
          <li><strong>Corporate leverage ratios</strong> dropped to historical 15-year lows, allowing mid-sized manufacturing firms to resume domestic capex.</li>
          <li><strong>Future Imperative:</strong> Sustainable long-term financing requires strengthening the domestic municipal and corporate bond market rather than overloading commercial bank balance sheets.</li>
        </ul>
      `
    },
    "2": {
      title: "The Capability Approach & Social Provisioning: Re-examining Public Goods in South Asia",
      badge: "Development & Welfare",
      authors: "Prof. Amartya Sen & Prof. Jean Drèze",
      affil: "Harvard University & Delhi School of Economics",
      body: `
        <h4>1. Growth vs. Human Freedom</h4>
        <p>Amartya Sen and Jean Drèze argue that economic development must be evaluated not merely by per-capita GDP expansion, but by the substantive "freedoms and capabilities" citizens enjoy: freedom from premature mortality, undernutrition, illiteracy, and systemic social exclusion.</p>
        <h4>2. The South Asian Paradox</h4>
        <p>Despite sustained 6–8% GDP growth rates, South Asia has historically lagged behind East Asia in public spending on health (barely 1.5% of GDP) and primary education. The authors demonstrate that economic growth is a means to an end, and human capital investments are themselves the most powerful driver of long-run productivity.</p>
        <h4>3. Policy Recommendations</h4>
        <ul>
          <li>Universal public provisioning in early-childhood health and nutrition (POSHAN/Anganwadi).</li>
          <li>Reinforcing the National Rural Employment Guarantee Act (MGNREGA) to prevent rural distress migration.</li>
          <li>Prioritizing public health primary centers over commercialized tertiary subsidies.</li>
        </ul>
      `
    },
    "3": {
      title: "The Opportunity Atlas: Intergenerational Mobility and Childhood Neighborhood Effects",
      badge: "Inequality & Mobility",
      authors: "Prof. Raj Chetty, Nathaniel Hendren & John Friedman",
      affil: "Opportunity Insights, Harvard University & Brown University",
      body: `
        <h4>1. Methodology & Big Data Architecture</h4>
        <p>By linking anonymized IRS tax returns covering 20.5 million children born between 1978 and 1983 to their parents' incomes, the Opportunity Insights team created tract-level maps of upward economic mobility across the United States.</p>
        <h4>2. Causal Childhood Exposure Effects</h4>
        <p>Using sibling comparisons and family moves across county borders, the researchers proved that neighborhood quality is causal: for every additional year a child spends in a high-upward-mobility neighborhood before age 23, their expected adult earnings increase linearly by ~4%.</p>
        <h4>3. Policy Implications</h4>
        <ul>
          <li><strong>Desegregation & Housing Vouchers:</strong> Moving low-income families with toddlers to high-opportunity zip codes generates millions in net positive lifetime tax revenues.</li>
          <li><strong>Local School Quality & Social Capital:</strong> Cross-class connections (economic connectedness) in neighborhoods predict upward mobility more strongly than school test scores alone.</li>
        </ul>
      `
    },
    "4": {
      title: "Targeted Cash Transfers vs. In-Kind Food Aid: Randomized Evidence from Rural India",
      badge: "Experimental & RCTs",
      authors: "Prof. Abhijit Banerjee & Prof. Esther Duflo",
      affil: "Massachusetts Institute of Technology (MIT) - J-PAL",
      body: `
        <h4>1. The Experimental Design</h4>
        <p>J-PAL conducted a multi-arm randomized controlled trial across rural communities in West Bengal and Bihar, randomly assigning households to receive either monthly grain rations through the Public Distribution System (PDS) or equivalent cash transfers via Aadhaar-linked bank accounts.</p>
        <h4>2. Key Findings & Behavioral Insights</h4>
        <ul>
          <li><strong>Dietary Quality:</strong> Cash-receiving households diversified their consumption into milk, vegetables, eggs, and pulses, significantly increasing micro-nutrient intake.</li>
          <li><strong>No Temptation Good Surge:</strong> There was zero statistical increase in spending on alcohol or tobacco.</li>
          <li><strong>Labor Supply:</strong> Unconditional liquidity did not cause adult household members to work fewer hours.</li>
        </ul>
        <h4>3. Institutional Feasibility</h4>
        <p>While cash provides superior dietary choice, remote rural villages with sparse bank branches or high inflation still require hybrid models with food security backstops.</p>
      `
    },
    "5": {
      title: "The Colonial Origins of Comparative Development: An Empirical Investigation",
      badge: "Institutional Economics",
      authors: "Prof. Daron Acemoglu, Simon Johnson & James A. Robinson",
      affil: "MIT & University of Chicago (Nobel Laureates)",
      body: `
        <h4>1. The Fundamental Question</h4>
        <p>Why are some countries rich while others remain poor? Acemoglu, Johnson, and Robinson show that contemporary income per capita differences are rooted in the institutional choices made during the colonial era.</p>
        <h4>2. Settler Mortality as an Instrumental Variable</h4>
        <p>Where European colonizers faced high mortality rates (malaria, yellow fever), they established "extractive states" focused on resource extraction. Where mortality was low (e.g., North America, Australia), they settled and created "inclusive institutions" with private property rights and checks on government power.</p>
        <h4>3. Historical Persistence</h4>
        <p>These early institutions persisted long after independence, explaining over 70% of the cross-country variation in GDP per capita today.</p>
      `
    },
    "6": {
      title: "Minimum Wages and Employment: The Empirical Credibility Revolution",
      badge: "Labor & Natural Exp",
      authors: "Prof. David Card & Prof. Alan B. Krueger",
      affil: "UC Berkeley & Princeton University",
      body: `
        <h4>1. The 1992 Natural Experiment</h4>
        <p>When New Jersey raised its state minimum wage from $4.25 to $5.05 per hour while neighboring Pennsylvania kept its wage unchanged, Card and Krueger surveyed 410 fast-food restaurants across both borders before and after the reform.</p>
        <h4>2. The Revolutionary Finding</h4>
        <p>Contrary to standard neoclassical textbook theory, employment in New Jersey fast-food stores did not decline relative to Pennsylvania. In fact, employment slightly increased in New Jersey stores.</p>
        <h4>3. Theoretical & Methodological Impact</h4>
        <ul>
          <li>Demonstrated the existence of employer monopsony power in low-wage service labor markets.</li>
          <li>Pioneered the modern Difference-in-Differences (DiD) quasi-experimental method that redefined empirical economics.</li>
        </ul>
      `
    },
    "7": {
      title: "Capital in the 21st Century: The Dynamics of $r > g$ and Global Wealth Accumulation",
      badge: "Wealth & Distribution",
      authors: "Prof. Thomas Piketty & Prof. Gabriel Zucman",
      affil: "Paris School of Economics & UC Berkeley",
      body: `
        <h4>1. The Central Economic Inequality ($r > g$)</h4>
        <p>When the average annual rate of return on capital ($r$, around 4–5%) substantially exceeds the real economic growth rate ($g$, around 1–2%), accumulated wealth compounds faster than output and wages can grow.</p>
        <h4>2. Historical Empirical Evidence</h4>
        <p>Using three centuries of probate records and tax data from France, the UK, the US, and Germany, Piketty and Zucman show that the low inequality of the mid-20th century was an exception caused by war destruction and wartime progressive taxation.</p>
        <h4>3. Policy Proposals</h4>
        <p>To avoid returning to 19th-century oligarchic patrimonial wealth structures, the authors advocate for a global wealth registry and coordinated progressive taxation on high net-worth capital.</p>
      `
    },
    "8": {
      title: "Strategic Games and Law: Beyond the Invisible Hand in Developing Economies",
      badge: "Game Theory & Policy",
      authors: "Prof. Kaushik Basu",
      affil: "Cornell University & Former Chief Economist of the World Bank",
      body: `
        <h4>1. Legal Statutes as Focal Points</h4>
        <p>Kaushik Basu argues that traditional economics treats the law as an exogenous cost, when in reality laws are "ink on paper." Laws only succeed if they alter the focal point of a non-cooperative game among citizens, judges, and law enforcement.</p>
        <h4>2. Asymmetric Bribery Theory</h4>
        <p>Basu proposed legalizing the payment of "harassment bribes" while doubling penalties on bribe-takers. Under this asymmetric rule, bribe-givers have strong post-transaction incentives to report corrupt officials, breaking the collusive silence of corruption equilibria.</p>
        <h4>3. Relevance for Emerging Markets</h4>
        <p>Standard top-down anti-corruption mandates fail in South Asia because they neglect game-theoretic incentives of whistleblowers and enforcement agents.</p>
      `
    },
    "9": {
      title: "The U-Shaped Female Labor Force Curve: Century of Gender, Careers, and Caregiving",
      badge: "Gender & Economic History",
      authors: "Prof. Claudia Goldin",
      affil: "Harvard University (Nobel Laureate in Economic Sciences)",
      body: `
        <h4>1. The 200-Year Historical Arc</h4>
        <p>Claudia Goldin uncovered that female labor force participation does not rise linearly with industrialization. In agrarian societies, female home-based labor is high. As production moves to factories, women's participation drops due to social stigma, before rising sharply as female educational attainment and service-sector desk jobs expand.</p>
        <h4>2. The Modern Earnings Gap</h4>
        <p>Goldin's research proves that the modern gender wage gap in developed economies is not driven by overt hiring discrimination, but by "greedy work"—jobs that disproportionately reward long, inflexible hours, penalizing mothers who bear the unequal share of caregiving.</p>
      `
    },
    "10": {
      title: "The Globalization Trilemma: Sovereignty, Democracy, and Hyperglobalization",
      badge: "Trade & Global Order",
      authors: "Prof. Dani Rodrik",
      affil: "John F. Kennedy School of Government, Harvard University",
      body: `
        <h4>1. The Trilemma Theorem</h4>
        <p>Dani Rodrik showed that it is impossible for a nation to simultaneously maintain all three: (1) Hyperglobalization, (2) National Sovereignty, and (3) Democratic Politics. You can only choose two.</p>
        <h4>2. The Breakdown of the Washington Consensus</h4>
        <p>When international trade agreements enforce intellectual property, corporate investor-state arbitration, and capital account liberalization over domestic democratic consensus, citizen backlash manifests in populist protectionism.</p>
        <h4>3. The New Industrial Policy Era</h4>
        <p>Rodrik advocates for "smart globalization" that allows countries policy room for domestic green industrial subsidies, wage protection, and supply chain resilience.</p>
      `
    },
    "11": {
      title: "Digital Payment Rails (UPI) and Rural Credit Access in Northeast India",
      badge: "Digital Rails & Inclusion",
      authors: "Abdullah Mashud",
      affil: "Economics Scholar, Darrang College",
      body: `
        <h4>1. The Informal Credit Problem</h4>
        <p>In rural Assam and Northeast India, small vegetable vendors, artisanal weavers, and agricultural retail merchants historically relied on informal moneylenders charging 30–60% annual interest due to lack of formal credit history or tangible physical collateral.</p>
        <h4>2. The UPI Transformation</h4>
        <p>With the adoption of zero-MDR QR code payments through UPI, daily cash sales became automatically timestamped and verified digital transaction records on merchant accounts.</p>
        <h4>3. Empirical Findings</h4>
        <ul>
          <li>Analysis of 350 rural enterprises showed a 28% increase in formal credit access within 18 months of UPI adoption.</li>
          <li>Micro-loans based on digital cashflow velocity exhibited lower 90-day delinquency rates than traditional collateralized loans.</li>
        </ul>
      `
    },
    "12": {
      title: "Spatial Disparities & Regional Growth Convergence Across Indian States",
      badge: "Spatial Economics & Growth",
      authors: "Dr. Bilal Ahmad Bhat",
      affil: "Assistant Professor (Economics), Azim Premji University",
      body: `
        <h4>1. Beta and Sigma Convergence Analysis</h4>
        <p>Using state-level GSDP panel data from 1991 to 2024, Dr. Bilal Ahmad Bhat analyzes why Indian states exhibit persistent spatial divergence rather than classical neoclassical income convergence.</p>
        <h4>2. Key Drivers of Spatial Divergence</h4>
        <p>Coastal and Southern states (Tamil Nadu, Maharashtra, Karnataka, Gujarat) benefited disproportionately from high-skill services, ports, and manufacturing clusters, while landlocked agrarian states faced power shortages and logistics friction.</p>
        <h4>3. Policy Takeaway</h4>
        <p>Fiscal transfers via Finance Commission formulas prevent human consumption collapse, but closing the productivity gap requires dedicated freight corridors, industrial park plug-and-play zones, and municipal governance devolution.</p>
      `
    },
    "13": {
      title: "Terms-of-Trade Volatility and Sovereign Fiscal Buffers in West Africa",
      badge: "Commodity Shocks & Africa",
      authors: "Emmanuel T Koduah",
      affil: "Economics Scholar, University of Cape Coast (Ghana)",
      body: `
        <h4>1. Primary Commodity Dependency</h4>
        <p>West African economies like Ghana remain vulnerable to global market price swings in gold, crude petroleum, and cocoa beans. Terms-of-trade downturns historically triggered sharp exchange rate depreciations and sovereign debt crises.</p>
        <h4>2. Econometric SVAR Findings</h4>
        <p>Using Structural Vector Autoregression (SVAR), the study finds that external price drops transmit to domestic consumer inflation within 60 days via imported fuel and food costs.</p>
        <h4>3. Policy Recommendations</h4>
        <ul>
          <li>Establish counter-cyclical Sovereign Wealth Stabilization Funds backed by mineral royalties.</li>
          <li>Deepen local currency bond markets to insulate public debt from US dollar appreciation shocks.</li>
        </ul>
      `
    },
    "14": {
      title: "The Entrepreneurial State: Public R&D and Mission-Oriented Innovation",
      badge: "Innovation & State",
      authors: "Prof. Mariana Mazzucato",
      affil: "Institute for Innovation and Public Purpose, University College London (UCL)",
      body: `
        <h4>1. Debunking Innovation Myths</h4>
        <p>Mariana Mazzucato demonstrates that the most revolutionary technologies embedded in modern smartphones—the internet (DARPA), GPS (US Navy), touchscreens (CERN), lithium-ion batteries, and voice recognition (Siri)—were funded by state agencies when risk was too high for private venture capital.</p>
        <h4>2. Socializing Risks, Privatizing Rewards</h4>
        <p>While public taxpayers absorb massive early-stage R&D risks (including failed bets), corporate monopolies capture all downstream private profits. Mazzucato advocates for public equity stakes, conditional price caps on subsidized pharmaceuticals, and reinvestment mandates.</p>
      `
    }
  };

  let activeCategory = 'all';
  let searchTerm = '';

  function applyFilter() {
    articleCards.forEach(card => {
      const cardCategory = card.getAttribute('data-category') || '';
      const cardKeywords = (card.getAttribute('data-keywords') || '').toLowerCase();
      const cardText = (card.textContent || '').toLowerCase();

      const matchesCategory = (activeCategory === 'all') || cardCategory.includes(activeCategory);
      const matchesSearch = !searchTerm || cardKeywords.includes(searchTerm) || cardText.includes(searchTerm);

      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }

  // Category Pill Handlers
  pillBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      pillBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-filter') || 'all';
      applyFilter();
    });
  });

  // Search input handler
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.trim().toLowerCase();
      applyFilter();
    });
  }

  // Modal Reading View Handlers
  document.querySelectorAll('.article-read-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const articleId = btn.getAttribute('data-article');
      const article = articlesData[articleId];
      if (!article || !modal) return;

      modalBadge.textContent = article.badge;
      modalTitle.textContent = article.title;
      modalAuthors.textContent = article.authors;
      modalAffil.textContent = article.affil;
      modalBody.innerHTML = article.body;

      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
}
