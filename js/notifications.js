/**
 * EconVision - Dynamic Notification & Announcement System
 * Lightweight, accessible, and easily maintainable notice board renderer.
 */

// Embedded fallback data in case of offline / local file protocol access
const FALLBACK_NOTIFICATIONS = [
  {
    id: "notif-launch-2026",
    title: "Official Announcement: The EconVision Web Platform is Officially Live!",
    date: "2026-08-22",
    category: "General",
    content: "We are thrilled to announce that the official EconVision web platform is now live! EconVision is an independent academic and professional networking initiative founded to bridge economics undergraduates, graduate scholars, college faculty, pre-doctoral researchers, and policy analysts across India and globally. Our platform provides open access to 27 curated datasets and literature indexes, 14 peer-reviewed long-form empirical papers, active research working groups, and a collaborative forum dedicated to open science, thesis clinics, and graduate guidance. Explore our resource directories, read our latest working papers, and connect with fellow economists across our active WhatsApp and LinkedIn channels.",
    isNew: true,
    pdfUrl: "assets/docs/econvision-official-launch-announcement.pdf",
    pinned: true
  },
  {
    id: "notif-001",
    title: "Call for Papers: EconVision Working Paper Series (Fall 2026)",
    date: "2026-08-20",
    category: "Research",
    content: "Submissions are officially open for undergraduate, master's, and doctoral scholars to submit empirical working papers, thesis drafts, and policy briefs. Accepted papers will receive detailed methodological feedback from university faculty and be indexed in our open research repository.",
    isNew: true,
    pdfUrl: "assets/docs/call-for-papers-fall2026.pdf",
    pinned: true
  },
  {
    id: "notif-002",
    title: "Virtual Workshop: Staggered Difference-in-Differences & Causal Inference in R",
    date: "2026-08-18",
    category: "Event",
    content: "Join our 2-hour hands-on technical workshop on August 29, 2026. We will demonstrate how to diagnose negative weighting issues in TWFE, implement Callaway & Sant'Anna (2021) in R with the 'did' package, and plot clean event study graphs.",
    isNew: true,
    pdfUrl: "assets/docs/workshop-schedule-econometrics-2026.pdf",
    pinned: true
  },
  {
    id: "notif-003",
    title: "Empirical Policy Brief: Digital Payment Rails & Rural Credit Access in Northeast India",
    date: "2026-08-12",
    category: "Report",
    content: "Our research cohort has published a comprehensive policy report based on primary survey data from 350 micro-enterprises in Assam, analyzing how UPI transaction velocity unlocks formal bank credit under Mudra and PM SVANidhi schemes.",
    isNew: false,
    pdfUrl: "assets/docs/policy-brief-upi-rural-credit.pdf",
    pinned: false
  },
  {
    id: "notif-004",
    title: "Pre-Doctoral Fellowship & RA Application Mentorship Circle",
    date: "2026-08-05",
    category: "General",
    content: "An open virtual Q&A session with alumni currently working as full-time pre-docs at J-PAL South Asia and Opportunity Insights. Discussion topics include Stata/R data cleaning coding tests, Math course preparation (Real Analysis), and faculty recommendation letters.",
    isNew: false,
    pdfUrl: "",
    pinned: false
  },
  {
    id: "notif-005",
    title: "Reading Circle Notes: Public Provisioning & The Capability Approach in South Asia",
    date: "2026-07-28",
    category: "Report",
    content: "Synthesis document and discussion notes from our reading roundtable on Amartya Sen & Jean Drèze's framework, evaluating NFHS-5 child stunting data and universal primary health delivery.",
    isNew: false,
    pdfUrl: "assets/docs/reading-circle-notes-july2026.pdf",
    pinned: false
  }
];

/**
 * Fetch and parse notifications from data/notifications.json (with fallback)
 */
async function fetchNotifications() {
  try {
    const response = await fetch('data/notifications.json?v=' + Date.now());
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const data = await response.json();
    return Array.isArray(data) && data.length > 0 ? data : FALLBACK_NOTIFICATIONS;
  } catch (err) {
    console.info('Loading notifications from embedded data store.');
    return FALLBACK_NOTIFICATIONS;
  }
}

/**
 * Format YYYY-MM-DD into readable English date (e.g. "August 20, 2026")
 */
function formatNotificationDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${months[monthIdx] || ''} ${day}, ${year}`;
}

/**
 * Get category badge color class
 */
function getCategoryBadgeClass(category) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('urgent')) return 'badge-urgent';
  if (cat.includes('event')) return 'badge-navy';
  if (cat.includes('research')) return 'badge-green';
  if (cat.includes('report')) return 'badge-gold';
  return 'badge-navy';
}

/**
 * Render single notification card HTML
 */
function renderNotificationCardHTML(item, options = {}) {
  const isCompact = options.isCompact || false;
  const formattedDate = formatNotificationDate(item.date);
  const badgeClass = getCategoryBadgeClass(item.category);

  const pinnedBadge = item.pinned
    ? `<span class="notif-badge notif-badge-pinned" title="Pinned Announcement">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="17" x2="12" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path></svg>
        PINNED
      </span>`
    : '';

  const newBadge = item.isNew
    ? `<span class="notif-badge notif-badge-new">NEW</span>`
    : '';

  const pdfButton = item.pdfUrl && item.pdfUrl.trim() !== ''
    ? `<a href="${item.pdfUrl}" target="_blank" rel="noopener noreferrer" class="notif-pdf-btn" title="Download Document (PDF)" download>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="12" y1="18" x2="12" y2="12"></line>
          <polyline points="9 15 12 18 15 15"></polyline>
        </svg>
        <span>Download PDF</span>
      </a>`
    : '';

  const cardPinnedClass = item.pinned ? 'notification-card-pinned' : '';

  return `
    <article class="notification-card ${cardPinnedClass} reveal-on-scroll" data-category="${(item.category || '').toLowerCase()}" data-pinned="${item.pinned ? 'true' : 'false'}">
      <div class="notif-card-header">
        <div class="notif-badges-group">
          ${pinnedBadge}
          ${newBadge}
          <span class="badge ${badgeClass}">${item.category || 'General'}</span>
        </div>
        <time class="notif-date" datetime="${item.date}">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          ${formattedDate}
        </time>
      </div>

      <h3 class="notif-card-title">${item.title}</h3>
      <p class="notif-card-content">${item.content}</p>

      ${pdfButton ? `<div class="notif-card-footer">${pdfButton}</div>` : ''}
    </article>
  `;
}

/**
 * Sort helper: Pinned items first, then descending by date
 */
function sortNotifications(items) {
  return [...items].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.date) - new Date(a.date);
  });
}

/**
 * Initialize Home Page Announcements Teaser Widget (#homeNotificationsContainer)
 */
async function initNotificationsHome() {
  const container = document.getElementById('homeNotificationsContainer');
  if (!container) return;

  const rawData = await fetchNotifications();
  const sorted = sortNotifications(rawData);
  const topItems = sorted.slice(0, 3); // Display top 3 on homepage

  if (topItems.length === 0) {
    container.innerHTML = `<p class="text-muted" style="text-align:center; padding: 2rem;">No announcements at this time.</p>`;
    return;
  }

  container.innerHTML = topItems.map(item => renderNotificationCardHTML(item, { isCompact: true })).join('');
}

/**
 * Initialize Dedicated Notifications Board Page (#notificationsList)
 */
async function initNotificationsBoard() {
  const listContainer = document.getElementById('notificationsList');
  const searchInput = document.getElementById('notifSearchInput');
  const filterPills = document.querySelectorAll('.notif-filter-btn');
  const countBadge = document.getElementById('notifCountBadge');

  if (!listContainer) return;

  const rawData = await fetchNotifications();
  const allItems = sortNotifications(rawData);

  let currentCategory = 'all';
  let searchTerm = '';

  function renderFilteredList() {
    const filtered = allItems.filter(item => {
      // Category filter
      let matchesCat = true;
      if (currentCategory === 'pinned') {
        matchesCat = Boolean(item.pinned);
      } else if (currentCategory !== 'all') {
        matchesCat = (item.category || '').toLowerCase() === currentCategory.toLowerCase();
      }

      // Search term filter
      let matchesSearch = true;
      if (searchTerm) {
        const text = `${item.title} ${item.content} ${item.category} ${item.date}`.toLowerCase();
        matchesSearch = text.includes(searchTerm);
      }

      return matchesCat && matchesSearch;
    });

    if (countBadge) {
      countBadge.textContent = `${filtered.length} Notice${filtered.length === 1 ? '' : 's'}`;
    }

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div class="notif-empty-state">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <h4>No announcements found</h4>
          <p>No notices match your selected filter or search term. Try resetting your search query.</p>
          <button type="button" class="btn btn-outline-navy btn-sm" id="btnResetNotifFilter" style="margin-top: 1rem;">Reset Filters</button>
        </div>
      `;

      const resetBtn = document.getElementById('btnResetNotifFilter');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          if (searchInput) searchInput.value = '';
          searchTerm = '';
          currentCategory = 'all';
          filterPills.forEach(b => b.classList.toggle('active', b.getAttribute('data-filter') === 'all'));
          renderFilteredList();
        });
      }
      return;
    }

    listContainer.innerHTML = filtered.map(item => renderNotificationCardHTML(item)).join('');
  }

  // Bind filter button clicks
  filterPills.forEach(btn => {
    btn.addEventListener('click', () => {
      filterPills.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-filter') || 'all';
      renderFilteredList();
    });
  });

  // Bind search input events
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.trim().toLowerCase();
      renderFilteredList();
    });
  }

  // Initial render
  renderFilteredList();
}

// Auto-run on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  initNotificationsHome();
  initNotificationsBoard();
});
