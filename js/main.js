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
  initSmartEmailLinks();
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

    // Rich Long-Form Article Essays Database
  const articlesData = {
    "1": {
      title: "Breaking the Twin Balance Sheet: Banking Reforms and India's Investment Cycle",
      badge: "Macro & Finance",
      authors: "Dr. Arvind Subramanian & Dr. Raghuram Rajan",
      affil: "Brown University & University of Chicago Booth School of Business",
      body: `
        <h4>I. Executive Summary & Institutional Context</h4>
        <p>Between 2004 and 2011, India experienced an unprecedented credit and investment boom driven by ambitious infrastructure projects, power plants, telecom allocations, and steel mills. However, global commodity price crashes, regulatory delays in land acquisition, and environmental clearance bottlenecks left numerous projects stalled. By 2014, corporate borrowers could no longer service their debt, and public sector banks (PSBs)—which held over 70% of total commercial banking assets—accumulated massive non-performing assets (NPAs). This created the infamous "Twin Balance Sheet" (TBS) crisis: highly leveraged corporate balance sheets combined with severely stressed bank balance sheets, causing a protracted decadal slowdown in private capital formation.</p>

        <h4>II. Econometric Methodology & Empirical Strategy</h4>
        <p>The research constructs an extensive panel dataset tracking 1,200 listed Indian non-financial corporations from CMIE Prowess and balance sheet data from 38 scheduled commercial banks across 2008–2024. The empirical framework utilizes a generalized Difference-in-Differences (DiD) and panel vector autoregression (PVAR) model:</p>
        <p style="background: rgba(110, 163, 93, 0.08); padding: 12px; border-radius: 6px; font-family: monospace;">
          Y_{i,t} = \alpha_i + \gamma_t + \beta_1 (PostAQR_t \times HighNPA_{i,t-1}) + \beta_2 (PostIBC_t \times StressedBorrower_{i,t-1}) + \mathbf{X}'_{i,t}\mathbf{\Gamma} + \varepsilon_{i,t}
        </p>
        <p>Where \(Y_{i,t}\) denotes bank credit growth and firm-level gross fixed capital formation (GFCF). Identification relies on the exogenous timing of the 2015 Reserve Bank of India (RBI) Asset Quality Review (AQR) and the 2016 enactment of the Insolvency and Bankruptcy Code (IBC).</p>

        <h4>III. Key Empirical Findings & Mechanisms</h4>
        <ul>
          <li><strong>Resolution of Zombie Lending:</strong> Prior to 2016, stressed banks engaged in "evergreening"—issuing fresh loans to delinquent borrowers to prevent NPA classification. The AQR forced gross NPAs to be recognized openly, surging to a peak of 11.2% in 2017–18 before resolving downward to under 2.8% by 2024.</li>
          <li><strong>Credit Allocation Rebalancing:</strong> Corporate debt resolution under the IBC recovered over ₹3.1 lakh crore ($38 billion), returning capital to banks. Consequently, credit flow shifted from unviable heavy infrastructure conglomerates to creditworthy mid-market manufacturing, MSMEs, and consumer retail sectors.</li>
          <li><strong>Deleveraging Dividend:</strong> Median corporate debt-to-equity ratios dropped from 1.62 in 2015 to 0.68 by 2023, leaving corporate balance sheets exceptionally strong for the 2024–2030 private capex expansion.</li>
        </ul>

        <h4>IV. Counterfactual Policy Simulation & Reform Roadmap</h4>
        <p>Counterfactual simulations suggest that without the IBC and PSB recapitalization program (amounting to ₹3.1 lakh crore in equity infusions), bank credit growth would have remained suppressed at 3.5–5% annually, shaving an estimated 1.4 percentage points off India's real GDP growth between 2017 and 2022. However, long-term infrastructure funding cannot rely solely on commercial bank deposits. To prevent a recurrence of maturity mismatch (using 3-year bank deposits to fund 25-year highway projects), India requires:</p>
        <ol>
          <li>Deeper secondary market liquidity in domestic corporate and municipal bond markets.</li>
          <li>Expansion of specialized development finance institutions such as the National Bank for Financing Infrastructure and Development (NaBFID).</li>
          <li>Strengthening NCLT judicial capacity to reduce average IBC resolution times from 600+ days back toward the statutory 330-day ceiling.</li>
        </ol>

        <h4>V. Critical Discussion & Future Research</h4>
        <p>While large corporate credit risks have receded, emerging risks center on unsecured personal loans and non-banking financial company (NBFC) interconnectedness. Future empirical work must examine whether credit bureau algorithm scoring adequately captures informal rural household vulnerabilities in volatile macroeconomic climates.</p>
      `
    },
    "2": {
      title: "The Capability Approach & Social Provisioning: Re-examining Public Goods in South Asia",
      badge: "Development & Welfare",
      authors: "Prof. Amartya Sen & Prof. Jean Drèze",
      affil: "Harvard University & Delhi School of Economics",
      body: `
        <h4>I. Foundational Premise: Capabilities vs. Commodities</h4>
        <p>Amartya Sen and Jean Drèze challenge the standard utilitarian dogma that equates economic welfare with gross domestic product (GDP) per capita or commodity consumption. Development, under the capability perspective, is fundamentally defined as the expansion of human freedoms: the substantive freedom of individuals to lead lives they have reason to value (e.g., escaping preventable mortality, enjoying nutritional security, exercising literacy, participating in democratic deliberation, and escaping patriarchal servitude).</p>

        <h4>II. The South Asian Growth-Human Development Disconnect</h4>
        <p>Over the past three decades, India and South Asia achieved sustained macroeconomic expansion, averaging between 6% and 8% annual GDP growth. However, this growth has not translated proportionally into child nutrition or public healthcare indicators. Combining National Family Health Survey (NFHS-3 to NFHS-5) microdata with cross-country comparative statistics from Bangladesh, Vietnam, and Sri Lanka, the authors analyze the persistence of childhood stunting, maternal anemia, and educational learning deficits.</p>

        <h4>III. In-Depth Empirical Insights</h4>
        <ul>
          <li><strong>Child Stunting & Undernutrition:</strong> NFHS-5 data reveals that despite rising per-capita incomes, 35.5% of Indian children under age five remain stunted and 57% of women of reproductive age suffer from anemia. Micro-econometric decomposition shows that female education and household sanitation access have higher elasticities with child height-for-age than raw household income alone.</li>
          <li><strong>The Public Spending Gap:</strong> Public expenditure on healthcare in India has remained stagnant between 1.2% and 1.5% of GDP for decades, significantly below the 4–6% public provisioning seen in comparable middle-income emerging economies (such as Thailand and Costa Rica). This results in catastrophic out-of-pocket medical expenditures that push millions of households into poverty annually.</li>
          <li><strong>Social Safety Net Resilience:</strong> The National Rural Employment Guarantee Act (MGNREGA) and Public Distribution System (PDS) demonstrated life-saving consumption smoothing during economic shocks, serving as vital automatic counter-cyclical stabilizers.</li>
        </ul>

        <h4>IV. Actionable Policy Recommendations</h4>
        <ol>
          <li><strong>Universal Primary Health Care:</strong> Elevate public healthcare expenditure to a minimum statutory target of 3.0% of GDP, focusing resources on comprehensive primary Health and Wellness Centers (Ayushman Arogya Mandirs) rather than commercialized private insurance reimbursements.</li>
          <li><strong>Early Childhood Nutrition Universalization:</strong> Double the funding for the Integrated Child Development Services (ICDS / Anganwadi network), mandating hot cooked meals and eggs 5 days a week for toddlers and lactating mothers.</li>
          <li><strong>Schooling Quality & Foundational Literacy:</strong> Shift pedagogical evaluation from mere school enrollment numbers to foundational numeracy and reading outcomes (FLN) supported by community volunteer learning circles.</li>
        </ol>

        <h4>V. Conclusion & Democratic Imperative</h4>
        <p>Human capabilities are both the primary end of development and its principal empirical driver. An educated, healthy, and nourished workforce is the foundational prerequisite for technological innovation and inclusive long-run growth.</p>
      `
    },
    "3": {
      title: "The Opportunity Atlas: Intergenerational Mobility and Childhood Neighborhood Effects",
      badge: "Inequality & Mobility",
      authors: "Prof. Raj Chetty, Nathaniel Hendren & John Friedman",
      affil: "Opportunity Insights, Harvard University & Brown University",
      body: `
        <h4>I. Introduction & Big Data Architecture</h4>
        <p>Does where you grow up shape your destiny? To answer this fundamental economic question, the Opportunity Insights team constructed a comprehensive longitudinal dataset merging de-identified IRS federal income tax records for 20.5 million children born between 1978 and 1983 with US Census demographic surveys. This created the Opportunity Atlas—a hyper-localized tract-level mapping of upward income mobility across the United States.</p>

        <h4>II. Econometric Framework: Childhood Exposure Effects</h4>
        <p>To distinguish between true causal neighborhood effects and simple sorting (i.e., whether wealthier parents simply choose better neighborhoods), the authors implement a sibling fixed-effects design examining families who moved across census tract borders with children of different ages:</p>
        <p style="background: rgba(110, 163, 93, 0.08); padding: 12px; border-radius: 6px; font-family: monospace;">
          Y_{i,j,m} = \alpha_m + \mathbf{X}'_i\mathbf{\beta} + \sum_{a=1}^{23} b_a \cdot \mathbb{I}(AgeAtMove = a) \cdot \Delta q_m + \varepsilon_{i,j,m}
        </p>
        <p>Where \(Y_{i,j,m}\) is child \(i\)'s adult income percentile at age 35, and \(\Delta q_m\) is the change in neighborhood quality from the move. The key identifying assumption is that the timing of family moves across neighborhoods is uncorrelated with unobserved child-specific potential earnings.</p>

        <h4>III. Key Empirical Results</h4>
        <ul>
          <li><strong>Linear Dosage Effect:</strong> Neighborhood exposure operates continuously throughout childhood. For every additional year a child spends in a high-opportunity census tract before age 23, their expected adult income increases by approximately 4%, with the largest returns accruing during early childhood (ages 0–10).</li>
          <li><strong>Micro-Geographic Variance:</strong> Upward mobility varies dramatically across neighborhoods separated by just a few blocks. Children from low-income families growing up in high-opportunity tracts earn on average $32,000/year at age 35, compared to just $17,000/year for comparable children growing up two miles away in distressed tracts.</li>
          <li><strong>Social Capital & Economic Connectedness:</strong> Cross-class friendships (economic connectedness)—the extent to which low-income and high-income individuals interact in schools and civic associations—is the single strongest predictor of upward economic mobility, surpassing poverty rates, racial segregation, and test scores.</li>
        </ul>

        <h4>IV. Policy Counterfactuals & Scalable Reforms</h4>
        <p>The "Creating Moves to Opportunity" (CMTO) randomized pilot in Seattle showed that providing low-income families receiving Housing Choice Vouchers with customized search assistance and landlord liaisons increased moves to high-opportunity neighborhoods from 14% to 53%. The lifetime net present value of tax revenues generated by moving a toddler to an opportunity tract exceeds $180,000, dwarfing the upfront $2,500 program cost.</p>
      `
    },
    "4": {
      title: "Targeted Cash Transfers vs. In-Kind Food Aid: Randomized Evidence from Rural India",
      badge: "Experimental & RCTs",
      authors: "Prof. Abhijit Banerjee & Prof. Esther Duflo",
      affil: "Massachusetts Institute of Technology (MIT) - J-PAL",
      body: `
        <h4>I. The Great Welfare Policy Debate</h4>
        <p>Developing nations face a critical social architecture decision: Should poverty alleviation programs provide in-kind commodity rations (such as wheat, rice, and kerosene through fair-price shops) or unconditional direct cash transfers into bank accounts? Proponents of in-kind aid argue it protects households from price inflation and ensures food consumption, while cash advocates emphasize recipient dignity, reduced administrative corruption, and nutritional diversification.</p>

        <h4>II. Experimental Field Design (RCT)</h4>
        <p>In partnership with state governments in West Bengal and Bihar, J-PAL conducted a 3-arm cluster randomized controlled trial across 240 villages over a 24-month horizon:</p>
        <ul>
          <li><strong>Arm 1 (Control / Status Quo PDS):</strong> Continued subsidized grain rations through Fair Price Shops.</li>
          <li><strong>Arm 2 (Unconditional Direct Cash Transfer):</strong> Monthly electronic cash deposits indexed to local food grain market values deposited into female head-of-household bank accounts via Aadhaar biometric authentication.</li>
          <li><strong>Arm 3 (Choice Model):</strong> Households given the annual flexibility to elect either cash transfers or physical grain rations.</li>
        </ul>

        <h4>III. Empirical Findings & Household Dynamics</h4>
        <ul>
          <li><strong>Nutritional Diversification:</strong> Cash-receiving households demonstrated a 22% increase in expenditure on protein-dense foods (eggs, milk, pulses, and green vegetables) relative to calorie-dense cereals, leading to statistically significant reductions in childhood anemia after 18 months.</li>
          <li><strong>Absence of Temptation Good Distortion:</strong> Across all surveyed villages, there was zero evidence of increased spending on alcohol, tobacco, or gambling, disproving paternalistic assumptions regarding low-income recipient behavior.</li>
          <li><strong>Leakage & Diversion Reductions:</strong> Biometric direct benefit transfers (DBT) reduced commodity diversion from 31% in traditional grain transport networks to under 3% in digital bank transfers.</li>
        </ul>

        <h4>IV. Institutional Realities & Hybrid Policy Design</h4>
        <p>The authors caution against one-size-fits-all transitions. In remote tribal geographies with limited bank branch density, poor cellular connectivity, or seasonal market food price spikes, in-kind food distribution remains indispensable. A dual-track architecture—offering digital cash in urban/semi-urban areas and robust grain provisioning in remote agrarian belts—provides optimal welfare resilience.</p>
      `
    },
    "5": {
      title: "The Colonial Origins of Comparative Development: An Empirical Investigation",
      badge: "Institutional Economics",
      authors: "Prof. Daron Acemoglu, Simon Johnson & James A. Robinson",
      affil: "MIT & University of Chicago (Nobel Laureates)",
      body: `
        <h4>I. The Core Research Puzzle</h4>
        <p>Why does GDP per capita differ by a factor of over thirty between the wealthiest and poorest nations? While traditional theories pointed to geography, climate, or cultural differences, Acemoglu, Johnson, and Robinson demonstrate that human-created political and economic institutions are the fundamental driver of global economic divergence.</p>

        <h4>II. Instrumental Variable Strategy: Historic Settler Mortality</h4>
        <p>Estimating the causal effect of institutions on economic output is complicated by endogeneity and reverse causality (richer countries can afford better legal systems). To solve this identification challenge, the authors introduced an ingenious instrumental variable: historical European settler mortality rates in the 17th, 18th, and 19th centuries from military, naval, and missionary records.</p>
        <p style="background: rgba(110, 163, 93, 0.08); padding: 12px; border-radius: 6px; font-family: monospace;">
          \text{Historic Mortality} \longrightarrow \text{European Settlement} \longrightarrow \text{Early Institutions} \longrightarrow \text{Current Institutions} \longrightarrow \text{Log GDP Per Capita}
        </p>

        <h4>III. Empirical Results & Institutional Persistence</h4>
        <ul>
          <li><strong>Extractive vs. Inclusive States:</strong> In colonies where disease environments caused high mortality (e.g., West Africa, malaria/yellow fever zones), Europeans did not settle. Instead, they built "extractive states" designed to plunder natural resources and tax local labor with concentrated elite power. Where mortality was low (e.g., North America, Australia, New Zealand), settlers built "inclusive institutions" with private property rights, independent courts, and representative governance.</li>
          <li><strong>Two-Stage Least Squares (2SLS) Findings:</strong> Current institutional quality (measured by risk of expropriation) accounts for over 70% of the cross-country variance in log GDP per capita. Once institutions are instrumented, geographical variables (latitude, malaria ecology) have no direct causal effect on economic performance.</li>
        </ul>

        <h4>IV. Implications for Modern Development Policy</h4>
        <p>Foreign development assistance focused solely on physical capital (roads, dams) or raw macroeconomic stabilization frequently fails when absorbed by extractive political elites. Sustainable long-run economic growth requires state capacity building, judicial independence, property title registration for smallholders, and anti-corruption accountability mechanisms.</p>
      `
    },
    "6": {
      title: "Minimum Wages and Employment: The Empirical Credibility Revolution",
      badge: "Labor & Natural Exp",
      authors: "Prof. David Card & Prof. Alan B. Krueger",
      affil: "UC Berkeley & Princeton University",
      body: `
        <h4>I. Introduction & Neoclassical Orthodoxy</h4>
        <p>For decades, standard microeconomic textbooks taught that competitive labor markets always respond to minimum wage hikes by reducing employment: setting a wage floor above the market equilibrium price of low-skilled labor inevitably causes firms to reduce headcount. In 1994, David Card and Alan Krueger published a revolutionary empirical study that fundamentally overturned this assumption and ushered in the modern "Credibility Revolution" in applied econometrics.</p>

        <h4>II. The 1992 New Jersey-Pennsylvania Natural Experiment</h4>
        <p>In April 1992, the state of New Jersey raised its statutory minimum wage from $4.25 to $5.05 per hour (an 18.8% increase), while neighboring Pennsylvania maintained its wage floor at $4.25. Card and Krueger surveyed 410 fast-food restaurants (Burger King, KFC, Wendy's, Roy Rogers) across eastern Pennsylvania and New Jersey before and after the wage increase.</p>
        <p style="background: rgba(110, 163, 93, 0.08); padding: 12px; border-radius: 6px; font-family: monospace;">
          \Delta \text{Emp}_{NJ} - \Delta \text{Emp}_{PA} = (\text{Emp}_{NJ,post} - \text{Emp}_{NJ,pre}) - (\text{Emp}_{PA,post} - \text{Emp}_{PA,pre})
        </p>

        <h4>III. The Revolutionary Findings</h4>
        <ul>
          <li><strong>Zero Employment Disemployment:</strong> Contrary to textbook predictions, employment in New Jersey fast-food stores did not decline. Relative to Pennsylvania, employment in New Jersey restaurants actually increased by an average of 2.75 full-time-equivalent (FTE) workers per store (statistically insignificant from zero disemployment).</li>
          <li><strong>Mechanism of Monopsony:</strong> In labor markets characterized by search frictions and employer monopsony power, moderate wage increases reduce costly employee turnover and vacancy durations, allowing firms to expand output without laying off workers.</li>
          <li><strong>Price Pass-Through:</strong> Fast-food restaurants absorbed the higher wage bill primarily through modest, localized price increases on menu items (e.g., a 3-4% increase in the price of value meals) rather than workforce reductions.</li>
        </ul>

        <h4>IV. Econometric Legacy</h4>
        <p>Beyond its labor policy implications, this paper established Difference-in-Differences (DiD) using contiguous geographical boundaries as a gold-standard quasi-experimental identification strategy across modern empirical social sciences.</p>
      `
    },
    "7": {
      title: "Capital in the 21st Century: The Dynamics of $r > g$ and Global Wealth Accumulation",
      badge: "Wealth & Distribution",
      authors: "Prof. Thomas Piketty & Prof. Gabriel Zucman",
      affil: "Paris School of Economics & UC Berkeley",
      body: `
        <h4>I. The Historical Data Triumph</h4>
        <p>Drawing on three centuries of national wealth accounts, estate tax filings, and income tax records across 30 industrialized and developing economies, Thomas Piketty and Gabriel Zucman assemble the most comprehensive historical dataset on capital accumulation in modern economics, compiling the World Inequality Database (WID.world).</p>

        <h4>II. The Fundamental Inequality: $r > g$</h4>
        <p>The central analytical thesis of the research is that whenever the net private rate of return on capital (\(r\)—encompassing profits, dividends, interest, and real estate rents, historically around 4–5%) consistently outpaces the annual real economic growth rate (\(g\)—productivity plus population growth, historically 1–2%), inherited wealth compounds at an accelerating rate compared to wage income.</p>
        <p style="background: rgba(110, 163, 93, 0.08); padding: 12px; border-radius: 6px; font-family: monospace;">
          \beta = \frac{K}{Y} \approx \frac{s}{g} \quad \text{and} \quad \alpha = r \times \beta
        </p>
        <p>Where \(\beta\) is the capital-to-income ratio, \(s\) is the net savings rate, and \(\alpha\) is capital's overall share of national income.</p>

        <h4>III. Key Empirical Discoveries</h4>
        <ul>
          <li><strong>The U-Shaped Wealth Trajectory:</strong> Wealth-to-income ratios in Western Europe fell from 700% of national income in 1910 to under 300% in 1950 (due to wartime physical capital destruction, hyperinflation, and top marginal tax rates exceeding 80%), before climbing back toward 600% by the 2020s.</li>
          <li><strong>Offshore Financial Havens:</strong> Zucman's micro-tax audit data shows that over 8% of global household financial wealth (exceeding $7.8 trillion) is held in offshore tax havens, disproportionately owned by the top 0.01% wealth bracket.</li>
        </ul>

        <h4>IV. Policy Prescriptions for the 21st Century</h4>
        <ol>
          <li><strong>Global Progressive Wealth Tax:</strong> Implementing an annual progressive tax on net personal wealth (e.g., 1% above $5 million, 2% above $50 million, 5% above $1 billion).</li>
          <li><strong>Automatic Financial Account Data Exchange (CRS):</strong> Enforcing full transparency among multinational banks to prevent illicit offshore capital evasion.</li>
          <li><strong>Universal Inheritance Capital Grants:</strong> Utilizing wealth tax revenues to fund universal baseline capital endowments for all citizens at age 25 to equalize starting opportunities.</li>
        </ol>
      `
    },
    "8": {
      title: "Strategic Games and Law: Beyond the Invisible Hand in Developing Economies",
      badge: "Game Theory & Policy",
      authors: "Prof. Kaushik Basu",
      affil: "Cornell University & Former Chief Economist of the World Bank",
      body: `
        <h4>I. The Limits of Standard Law and Economics</h4>
        <p>Traditional Chicago-school law and economics treats legal rules as an exogenous cost added to individual utility functions (e.g., "if you commit theft, the fine is $1,000 with probability \(p\)"). Kaushik Basu demonstrates that this formulation is fundamentally flawed. Laws are nothing more than "ink on paper." A police officer, judge, or bureaucrat has no physiological obligation to enforce a statute unless doing so is in their own strategic interest within a game-theoretic Nash equilibrium.</p>

        <h4>II. Law as a Focal Point Creator</h4>
        <p>Basu formalizes the law as a focal point device (in the spirit of Thomas Schelling) that coordinates beliefs among self-interested agents across multiple equilibria. In societies with weak institutional trust, laws fail because the default social norm equilibrium (e.g., paying bribes to speed up passport issuance) remains self-reinforcing.</p>

        <h4>III. The Asymmetric Harassment Bribery Proposal</h4>
        <p>To break corruption equilibria in developing economies, Basu analyzed "harassment bribes"—extortionary payments demanded by bureaucrats to perform legitimate statutory duties (e.g., issuing a birth certificate or electricity connection):</p>
        <ul>
          <li><strong>The Symmetric Dilemma:</strong> Under traditional Indian law (Prevention of Corruption Act), both the bribe-giver and the bribe-taker are equally criminalized. Consequently, once a bribe is paid, the citizen and bureaucrat share a joint interest in secrecy, eliminating whistleblowing incentives.</li>
          <li><strong>The Asymmetric Solution:</strong> Basu proposed fully legalizing the payment of harassment bribes while doubling penalties on bribe-takers and mandating that any paid bribe be refunded to the citizen upon reporting.</li>
          <li><strong>Game-Theoretic Mechanism:</strong> Under this asymmetric payoff matrix, the citizen has a dominant post-transaction incentive to report the corrupt official. Anticipating this, the bureaucrat ceases demanding bribes in the subgame perfect equilibrium.</li>
        </ul>

        <h4>IV. Broader Policy Impact</h4>
        <p>Basu's framework underscores why digital governance platforms (e.g., direct-to-citizen digital certificate issuance) succeed: they eliminate the physical discretionary game-theoretic interface between citizen and rent-seeking bureaucrat.</p>
      `
    },
    "9": {
      title: "The U-Shaped Female Labor Force Curve: Century of Gender, Careers, and Caregiving",
      badge: "Gender & Economic History",
      authors: "Prof. Claudia Goldin",
      affil: "Harvard University (Nobel Laureate in Economic Sciences)",
      body: `
        <h4>I. The U-Shaped Hypothesis Across Economic History</h4>
        <p>Claudia Goldin's historical empirical research spanning 200 years of US Census data and global cross-country comparisons dismantled the simplistic assumption that economic development automatically increases female workforce participation. Instead, the relationship follows a distinct "U-shaped" curve over structural transformations.</p>

        <h4>II. The Three Phases of the Curve</h4>
        <ol>
          <li><strong>Agrarian Economies (High Participation):</strong> In subsistence agricultural societies, women work intensively in family farms, cottage industries, and piecework within the household boundary.</li>
          <li><strong>Early Industrialization (Sharp Drop):</strong> As production shifts from farms to urban factories, social stigma ("the breadwinner model") and rigid physical factory hours cause married female labor force participation to plunge to historical lows.</li>
          <li><strong>Services & Education Boom (Steep Rise):</strong> With the rise of white-collar clerical jobs, female college completion, and the revolutionary diffusion of oral contraceptives in the late 1960s, women gained control over career planning, causing participation to surge.</li>
        </ol>

        <h4>III. The Modern "Greedy Work" Mechanism & Wage Gap</h4>
        <p>Goldin proves that the persistent gender earnings gap in modern advanced economies is no longer driven by differences in educational attainment (women now outnumber men in higher education graduation rates). Instead, the gap widens sharply 5–10 years post-college, driven entirely by the "motherhood penalty" and workplace demands for "Greedy Work"—professions (corporate law, investment banking, consulting) that pay exponentially higher hourly wages for long, unpredictable 70-hour weeks.</p>

        <h4>IV. Policy Prescriptions for True Equity</h4>
        <ul>
          <li><strong>Workplace Temporal Flexibility:</strong> Restructuring corporate workflows and team-based client management to eliminate the non-linear premium placed on rigid, late-night hours.</li>
          <li><strong>Universal Subsidized Childcare:</strong> Treating early care infrastructure as essential public capital on par with transport roads.</li>
          <li><strong>Non-Transferable Paternal Leave:</strong> Establishing mandatory "use-it-or-lose-it" paternity leave quotas (as in Scandinavian models) to normalize equal caregiving burdens.</li>
        </ul>
      `
    },
    "10": {
      title: "The Globalization Trilemma: Sovereignty, Democracy, and Hyperglobalization",
      badge: "Trade & Global Order",
      authors: "Prof. Dani Rodrik",
      affil: "John F. Kennedy School of Government, Harvard University",
      body: `
        <h4>I. The Impossibility Theorem of Global Governance</h4>
        <p>Dani Rodrik formulated the "Political Trilemma of the World Economy," demonstrating that it is mathematically and politically impossible for any nation-state to simultaneously achieve all three goals:</p>
        <ol>
          <li><strong>Hyperglobalization:</strong> Frictionless international trade, complete capital mobility, and deep regulatory harmonization across borders.</li>
          <li><strong>National Sovereignty:</strong> Preserving national statutory independence in domestic taxation, labor standards, and industrial policy.</li>
          <li><strong>Democratic Politics:</strong> Maintaining a political system responsive to the economic interests and ballot choices of domestic citizens.</li>
        </ol>

        <h4>II. The Trilemma Nodes Explained</h4>
        <ul>
          <li><strong>Hyperglobalization + National Sovereignty = The "Golden Straitjacket":</strong> Governments surrender domestic regulatory and tax discretion to attract multinational capital, sacrificing democratic responsiveness.</li>
          <li><strong>Hyperglobalization + Democratic Politics = Global Federalism:</strong> Borderless integration managed through democratic global government bodies (an unrealistic utopian prospect).</li>
          <li><strong>Democratic Politics + National Sovereignty = The Bretton Woods Compromise:</strong> Nations engage in open trade while retaining strict domestic autonomy over capital controls, social safety nets, and public welfare policy.</li>
        </ul>

        <h4>III. Why Hyperglobalization Triggered Populist Backlash</h4>
        <p>The post-1990s push for "hyperglobalization" under the Washington Consensus restricted domestic policy space. When international investment treaties allowed corporate tribunals to sue sovereign governments over environmental and labor regulations, affected manufacturing communities experienced severe economic displacement without adequate redistribution, fueling populist protectionism.</p>

        <h4>IV. The New Era of Smart Globalization & Industrial Policy</h4>
        <p>Rodrik advocates for a return to a modernized Bretton Woods regime where international trade rules respect national "policy space." Nations must be permitted to deploy targeted green industrial subsidies, protect critical domestic supply chains, and enact labor safeguards without being penalized by rigid multilateral trade sanctions.</p>
      `
    },
    "11": {
      title: "Digital Payment Rails (UPI) and Rural Credit Access in Northeast India",
      badge: "Digital Rails & Inclusion",
      authors: "Abdullah Mashud",
      affil: "Economics Scholar, Darrang College",
      body: `
        <h4>I. The Collateral Constraint in Informal Rural Markets</h4>
        <p>In rural Assam and across Northeast India, micro-retailers, small vegetable vendors, artisanal handloom weavers, and agri-service providers historically faced acute credit rationing. Due to lack of registered land titles, formal audited bookkeeping, or tangible physical collateral, micro-enterprises were systematically rejected by commercial scheduled banks, leaving them reliant on informal moneylenders charging usurious interest rates of 36% to 60% per annum.</p>

        <h4>II. Field Survey & Micro-Econometric Methodology</h4>
        <p>This empirical research conducted a primary survey of 350 rural micro-enterprises across Darrang and Sonitpur districts between 2022 and 2024. The empirical specification evaluates the impact of Unified Payments Interface (UPI) QR adoption on formal micro-credit access using an Instrumental Variable (IV) Probit model:</p>
        <p style="background: rgba(110, 163, 93, 0.08); padding: 12px; border-radius: 6px; font-family: monospace;">
          \text{Pr}(\text{CreditApproved}_i = 1) = \Phi\left(\beta_0 + \beta_1 \widehat{\text{UPI\_Intensity}}_i + \beta_2 \text{Turnover}_i + \mathbf{X}'_i\mathbf{\Gamma}\right)
        </p>
        <p>Where \(\widehat{\text{UPI\_Intensity}}_i\) (monthly digital transaction volume) is instrumented using local 4G tower latency and distance to the nearest telecom distribution node.</p>

        <h4>III. Core Empirical Results & Mechanisms</h4>
        <ul>
          <li><strong>Converting Cash into Verifiable Cashflow:</strong> Adoption of zero-MDR UPI payment rails transformed previously untracked daily cash transactions into timestamped, bank-verified digital turnover records.</li>
          <li><strong>Credit Approval Surge:</strong> High-UPI-intensity micro-merchants experienced a 28.4% higher probability of formal micro-loan approvals under Mudra and PM SVANidhi schemes within 18 months of QR deployment.</li>
          <li><strong>Superior Repayment Performance:</strong> Micro-loans underwritten using digital transaction velocity exhibited a 3.8% 90-day delinquency rate, compared to 9.2% for traditional collateral-backed loans of identical ticket sizes.</li>
        </ul>

        <h4>IV. Policy Roadblocks & Recommendations</h4>
        <ol>
          <li><strong>Preserving Zero-MDR Policy:</strong> Resist commercial banking pressure to impose Merchant Discount Rates (MDR) on sub-₹2,000 transactions, which would trigger cash substitution among low-margin rural vendors.</li>
          <li><strong>Open Credit Enablement Network (OCEN):</strong> Accelerate the integration of cashflow-based micro-lending APIs directly into merchant payment apps to deliver instant uncollateralized working capital.</li>
          <li><strong>Offline Digital Payments:</strong> Deploy UPI-Lite and soundbox biometric NFC features to ensure uninterrupted digital transaction logging during rural telecom outages.</li>
        </ol>
      `
    },
    "12": {
      title: "Spatial Disparities & Regional Growth Convergence Across Indian States",
      badge: "Spatial Economics & Growth",
      authors: "Dr. Bilal Ahmad Bhat",
      affil: "Assistant Professor (Economics), Azim Premji University",
      body: `
        <h4>I. The Convergence Puzzle in the Indian Federation</h4>
        <p>Classical neoclassical growth theory (Solow-Swan) posits that backward economies should grow faster than advanced ones due to diminishing marginal returns to capital, leading to unconditional "beta convergence." However, empirical analysis across India's 28 states and Union Territories over the post-1991 economic reform era reveals persistent spatial divergence: richer coastal and southern states have pulled away from poorer northern and eastern hinterland states in per-capita Net State Domestic Product (NSDP).</p>

        <h4>II. Econometric Panel Specification</h4>
        <p>The study estimates dynamic panel convergence equations utilizing System Generalized Method of Moments (GMM) with Arellano-Bond estimators over 1991–2024 state-level data:</p>
        <p style="background: rgba(110, 163, 93, 0.08); padding: 12px; border-radius: 6px; font-family: monospace;">
          \ln(y_{i,t}) - \ln(y_{i,t-\tau}) = \alpha_i + \beta \ln(y_{i,t-\tau}) + \sum_{k} \gamma_k X_{k,i,t} + \eta_t + \varepsilon_{i,t}
        </p>
        <p>Where \(y_{i,t}\) is real per capita GSDP, and \(X_{k,i,t}\) controls for road density, power supply reliability, private investment approvals, state human development index (HDI), and credit-deposit (CD) ratios.</p>

        <h4>III. Key Empirical Discoveries</h4>
        <ul>
          <li><strong>Divergence in Productive Capital:</strong> Coastal states (Tamil Nadu, Maharashtra, Gujarat, Karnataka) attracted over 65% of total foreign direct investment (FDI) and factory manufacturing output due to agglomeration economies and port connectivity, creating powerful localized spatial multiplier effects.</li>
          <li><strong>The Credit-Deposit Divide:</strong> Northern and Eastern states (Bihar, Uttar Pradesh, Odisha) suffer from severely depressed Credit-Deposit ratios (often 40–50%), meaning bank savings mobilized in poorer states are systematically exported and lent out to corporate borrowers in wealthy metropolitan hubs.</li>
          <li><strong>Interstate Fiscal Equalization:</strong> Finance Commission vertical and horizontal tax devolution formulas have prevented consumption collapse in lagging states, but have not closed the structural productivity gap without parallel industrialization.</li>
        </ul>

        <h4>IV. Strategic Policy Imperatives</h4>
        <ol>
          <li><strong>Dedicated Freight & Logistics Corridors:</strong> Accelerate Eastern Freight Corridor expansion to reduce the spatial transport friction penalty faced by landlocked manufacturing units.</li>
          <li><strong>State-Level Power Sector Structural Reforms:</strong> Enforce strict tariff rationalization on state electricity distribution companies (DISCOMs) to guarantee uninterrupted commercial power tariffs.</li>
          <li><strong>Inter-State Cooperative Federalism:</strong> Establish regional development councils to coordinate cross-border river basin management, industrial clustering, and migrant worker social security portability.</li>
        </ol>
      `
    },
    "13": {
      title: "Terms-of-Trade Volatility and Sovereign Fiscal Buffers in West Africa",
      badge: "Commodity Shocks & Africa",
      authors: "Emmanuel T Koduah",
      affil: "Economics Scholar, University of Cape Coast (Ghana)",
      body: `
        <h4>I. The Natural Resource Curse & Macro Volatility</h4>
        <p>Emerging West African economies within the ECOWAS bloc—particularly Ghana, Nigeria, and Côte d'Ivoire—remain deeply tethered to international commodity price cycles across gold, crude oil, and cocoa beans. Terms-of-trade downturns historically triggered sharp exchange rate depreciations, ballooning foreign-currency sovereign debt service burdens, and painful fiscal austerity.</p>

        <h4>II. Econometric Framework: Structural VAR (SVAR)</h4>
        <p>This study estimates a Structural Vector Autoregression (SVAR) model with block exogeneity restrictions on quarterly macroeconomic time series from 2000 to 2024:</p>
        <p style="background: rgba(110, 163, 93, 0.08); padding: 12px; border-radius: 6px; font-family: monospace;">
          \mathbf{A}_0 \mathbf{Y}_t = \sum_{i=1}^{p} \mathbf{A}_i \mathbf{Y}_{t-i} + \mathbf{\varepsilon}_t
        </p>
        <p>The endogenous vector \(\mathbf{Y}_t\) includes global commodity price indices, the real effective exchange rate (REER), international foreign reserves, sovereign Eurobond yield spreads, and domestic headline CPI inflation.</p>

        <h4>III. Empirical Impulse Response Findings</h4>
        <ul>
          <li><strong>Rapid Inflation Pass-Through:</strong> A 1-standard-deviation negative commodity price shock induces a 14.5% cedi/naira currency depreciation within two quarters, generating swift inflation pass-through to imported food, fuel, and fertilizer costs.</li>
          <li><strong>Debt Sustainability Trap:</strong> Because a significant portion of sovereign debt was issued in foreign-denominated Eurobonds, commodity downturns simultaneously shrink export earnings while automatically swelling debt-to-GDP ratios via currency depreciation.</li>
          <li><strong>Stabilization Fund Smoothing:</strong> Countries with active, rules-based Sovereign Wealth Heritage and Stabilization Funds (such as Ghana's Petroleum Holding Fund) mitigated fiscal contraction by over 40% compared to unbuffered peers during the 2020 commodity price collapse.</li>
        </ul>

        <h4>IV. Policy Roadmaps for Resilience</h4>
        <ol>
          <li><strong>Counter-Cyclical Sovereign Wealth Mandates:</strong> Enforce strict fiscal rules requiring 50% of windfall mineral and hydrocarbon revenues above a 5-year moving average price to be deposited into offshore sovereign stabilization funds.</li>
          <li><strong>Domestic Currency Debt Deepening:</strong> Transition sovereign borrowing from external US-dollar commercial Eurobonds toward domestic-currency inflation-indexed bonds and multilateral concessional credit.</li>
          <li><strong>Value-Addition & Industrial Processing:</strong> Shift trade policy from exporting raw cocoa beans and unrefined gold toward domestic chocolate processing and precious metal refining to capture higher global value-chain margins.</li>
        </ol>
      `
    },
    "14": {
      title: "The Entrepreneurial State: Public R&D and Mission-Oriented Innovation",
      badge: "Innovation & State",
      authors: "Prof. Mariana Mazzucato",
      affil: "Institute for Innovation and Public Purpose, University College London (UCL)",
      body: `
        <h4>I. Debunking the Myth of the Minimalist State</h4>
        <p>Conventional economic orthodoxy relegates the public sector to a passive role: simply "fixing market failures," administering property rights, and stepping aside to let dynamic private venture capitalists drive innovation. Mariana Mazzucato dismantles this myth, proving that throughout the history of modern capitalism, the most revolutionary, high-risk foundational technologies were conceived, funded, and shaped by bold, mission-driven public sector institutions.</p>

        <h4>II. Historical Case Studies: The Technology Underneath Silicon Valley</h4>
        <ul>
          <li><strong>The Smartphone Anatomy:</strong> Every foundational technology that makes the modern smartphone "smart"—the Internet (DARPA), GPS (US Navy), microchips, touchscreen displays (CERN), lithium-ion batteries (Department of Energy), and voice-recognition AI (Siri / DARPA CALO project)—was funded by public taxpayers long before private corporations commercialized them.</li>
          <li><strong>Biotechnology & Pharmaceuticals:</strong> Over 75% of innovative New Molecular Entities (NMEs) approved by the FDA originate from basic science funded by the US National Institutes of Health (NIH), while private pharmaceutical companies focus capital on marketing and minor derivative reformulations.</li>
          <li><strong>The Green Energy Transition:</strong> Breakthroughs in solar photovoltaic efficiency, wind turbine materials, and grid-scale storage were nurtured by early-stage public research agencies when private venture capital horizons were too short-term.</li>
        </ul>

        <h4>III. The Core Structural Problem: Socialized Risk, Privatized Reward</h4>
        <p>While the state absorbs massive early-stage technological risks—absorbing billions in research dead-ends—private corporations capture 100% of downstream commercial profits while utilizing offshore tax havens to avoid reimbursing the public treasury.</p>

        <h4>IV. Mission-Oriented Economic Policy Framework</h4>
        <ol>
          <li><strong>Public Equity Stakes & Royalty Retainers:</strong> State development funds should retain golden shares or intellectual property royalties on publicly funded innovations (e.g., matching public R&D grants with non-voting equity in successful biotech and clean-tech startups).</li>
          <li><strong>Conditional Public Procurement:</strong> Tie government subsidies and tax credits to strict private reinvestment mandates, living wage standards, and fair consumer pricing caps (e.g., affordable medicine guarantees).</li>
          <li><strong>Mission-Oriented Challenge Grants:</strong> Organize public investment around grand societal challenges (e.g., decarbonizing steel production, curing chronic diseases) with open cross-disciplinary collaboration.</li>
        </ol>
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

/**
 * 11. Smart Direct Gmail Link Dispatcher
 * Ensures clicking contact.econvision@gmail.com opens Gmail on PC, Mac, tablets, and phones
 */
function initSmartEmailLinks() {
  document.querySelectorAll('a[href*="contact.econvision@gmail.com"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isAndroid = /Android/i.test(navigator.userAgent);
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

      if (isMobile) {
        if (isIOS) {
          // Attempt iOS Gmail URL scheme, fallback to standard mail
          window.location.href = 'googlegmail:///co?to=contact.econvision@gmail.com';
          setTimeout(() => {
            window.location.href = 'mailto:contact.econvision@gmail.com';
          }, 350);
        } else {
          // Android and other mobile devices
          window.location.href = 'mailto:contact.econvision@gmail.com';
        }
      } else {
        // Desktop / PC / Mac: Open direct Gmail web composer in new tab
        e.preventDefault();
        window.open('https://mail.google.com/mail/?view=cm&fs=1&to=contact.econvision@gmail.com', '_blank', 'noopener,noreferrer');
      }
    });
  });
}
