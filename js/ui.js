/**
 * Smart DT Project V3 — js/ui.js
 * ─────────────────────────────────────────────────────────────────
 * All DOM rendering and UI interactions live here.
 * Reads data exclusively through window.DT (data.js).
 * No localStorage calls are made directly in this file.
 *
 * Sections:
 *  1.  Routing & guards
 *  2.  Page boot (DOMContentLoaded)
 *  3.  Pink blob & dot grid injection
 *  4.  Header — language selector, avatar
 *  5.  Bottom navigation — active state
 *  6.  Toast notification
 *  7.  Carousel
 *  8.  Phase stepper (dashboard)
 *  9.  Progress bar
 * 10.  Accordion rows (dashboard)
 * 11.  Dashboard page renderer
 * 12.  Profile page renderer
 * 13.  Login form handler
 * 14.  Badge display
 * 15.  AI Coach panel
 * 16.  Google Sheets submission
 * 17.  Utility helpers
 * ─────────────────────────────────────────────────────────────────
 *
 * DEPENDENCY: data.js must be loaded before this file.
 * Load order in every HTML page (just before </body>):
 *
 *   <script src="js/data.js"></script>
 *   <script src="js/ui.js"></script>
 *   <!-- phase pages also load: -->
 *   <script src="js/phase-engine.js"></script>
 * ─────────────────────────────────────────────────────────────────
 */

(function () {
'use strict';


/* ═══════════════════════════════════════════════════════════════
   1. ROUTING & GUARDS
   ═══════════════════════════════════════════════════════════════ */

/**
 * checkRegistration()
 * Call at the very top of the page-specific script on
 * dashboard.html and all phase/progress/profile pages.
 * Immediately redirects unregistered visitors to welcome.html.
 */
function checkRegistration() {
  if (!window.DT.isRegistered()) {
    window.location.replace('welcome.html');
  }
}

/**
 * routeFromIndex()
 * Only for index.html.
 * Sends registered students → dashboard.html,
 * everyone else → welcome.html.
 */
function routeFromIndex() {
  window.location.replace(
    window.DT.isRegistered() ? 'dashboard.html' : 'welcome.html'
  );
}

/**
 * navigateTo(page)
 * Centralised navigation so we can add transition animations later.
 * @param {string} page  e.g. 'dashboard.html'
 */
function navigateTo(page) {
  window.location.href = page;
}

/**
 * logoutStudent()
 * Called by the Log Out row on profile.html.
 */
function logoutStudent() {
  window.DT.clearAllStudentData();
  window.location.replace('welcome.html');
}


/* ═══════════════════════════════════════════════════════════════
   2. PAGE BOOT
   Runs shared setup automatically on every page.
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Guard: data.js must load before ui.js ──────────────────
     If window.DT is missing, data.js failed to load.
     Most common cause: opening the HTML file directly by
     double-clicking (file:// protocol on some browsers), or
     the js/ folder is missing / in the wrong location.
     Solution: open via Live Server in VS Code instead.        */
  if (typeof window.DT === 'undefined') {
    console.error(
      '[Smart DT] data.js did not load.\n' +
      'Fix: open this project using VS Code Live Server,\n' +
      'not by double-clicking the HTML file.'
    );
    /* Show a visible on-screen error so it is impossible to miss */
    const banner = document.createElement('div');
    banner.setAttribute('role', 'alert');
    banner.style.cssText = [
      'position:fixed', 'top:0', 'left:0', 'right:0',
      'background:#071B3D', 'color:#fff',
      'font:600 14px/1.5 sans-serif',
      'padding:16px 20px', 'z-index:9999',
      'border-bottom:3px solid #FF6A3D'
    ].join(';');
    banner.innerHTML =
      '⚠ Smart DT could not load its scripts.<br>' +
      '<span style="font-weight:400;font-size:13px">' +
      'Open this project using <strong>VS Code → Live Server</strong> ' +
      '(right-click index.html → Open with Live Server). ' +
      'Do not open HTML files by double-clicking them.' +
      '</span>';
    document.body.prepend(banner);
    return; /* stop — nothing else will work without data.js */
  }

  _injectBlob();
  _injectDotGrid();
  _setNavActive();
  _updateLanguageLabels();
  _updateHeaderAvatar();
  window.DT.evaluateAndAwardBadges();
});


/* ═══════════════════════════════════════════════════════════════
   3. PINK BLOB & DOT GRID INJECTION
   ═══════════════════════════════════════════════════════════════ */

/**
 * _injectBlob()
 * Inserts the pink-blob SVG as the FIRST child of .app-container
 * on every page. Does nothing if already present.
 */
function _injectBlob() {
  const container = document.querySelector('.app-container');
  if (!container || container.querySelector('.pink-blob')) return;

  const img       = document.createElement('img');
  img.src         = 'assets/shared/pink-blob.svg';
  img.className   = 'pink-blob';
  img.alt         = '';
  img.setAttribute('aria-hidden', 'true');
  container.insertBefore(img, container.firstChild);
}

/**
 * _injectDotGrid()
 * Inserts a CSS dot-grid div into .app-container only on pages
 * that have data-dots="true" on the <body> element.
 */
function _injectDotGrid() {
  if (document.body.getAttribute('data-dots') !== 'true') return;

  const container = document.querySelector('.app-container');
  if (!container || container.querySelector('.dot-grid-css')) return;

  const grid       = document.createElement('div');
  grid.className   = 'dot-grid-css';
  grid.setAttribute('aria-hidden', 'true');
  container.appendChild(grid);
}


/* ═══════════════════════════════════════════════════════════════
   4. HEADER — LANGUAGE SELECTOR & AVATAR
   ═══════════════════════════════════════════════════════════════ */

/**
 * _updateLanguageLabels()
 * Fills every element with class .language-label
 * with the stored language preference.
 */
function _updateLanguageLabels() {
  const lang = window.DT.getLanguage();
  document.querySelectorAll('.language-label').forEach(el => {
    el.textContent = lang;
  });
}

/**
 * _updateHeaderAvatar()
 * Fills .header-avatar-name and .header-avatar-initials
 * with student data if those elements exist on the page.
 */
function _updateHeaderAvatar() {
  const nameEl     = document.querySelector('.header-avatar-name');
  const initialsEl = document.querySelector('.header-avatar-initials');

  if (nameEl)     nameEl.textContent     = window.DT.getFirstName();
  if (initialsEl) initialsEl.textContent = window.DT.getInitials();
}

/**
 * setLanguage(lang)
 * Called when the student selects a language from the dropdown.
 * @param {string} lang  e.g. 'Bahasa Malaysia'
 */
function setLanguage(lang) {
  window.DT.setLanguage(lang);
  _updateLanguageLabels();
}


/* ═══════════════════════════════════════════════════════════════
   5. BOTTOM NAVIGATION — ACTIVE STATE
   ═══════════════════════════════════════════════════════════════ */

const PHASE_PAGES = [
  'phase01-empathy.html',
  'phase02-define.html',
  'phase03-ideation.html',
  'phase04-prototype.html',
  'phase05-test.html',
];

/**
 * _setNavActive()
 * Reads the current filename and adds class 'active' to the
 * matching .nav-item[data-page] element.
 *
 * HTML requirement:
 *   <a class="nav-item" data-page="dashboard.html" href="dashboard.html">
 */
function _setNavActive() {
  const current = _currentPage();
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    const target = item.getAttribute('data-page');
    const isActive =
      target === current ||
      (target === 'projects' && PHASE_PAGES.includes(current));
    item.classList.toggle('active', isActive);
  });
}

/**
 * _currentPage()
 * @returns {string}  e.g. 'dashboard.html'
 */
function _currentPage() {
  const parts = window.location.pathname.split('/');
  return parts[parts.length - 1] || 'index.html';
}


/* ═══════════════════════════════════════════════════════════════
   6. TOAST NOTIFICATION
   ═══════════════════════════════════════════════════════════════ */

let _toastTimer = null;

/**
 * showToast(message, type, duration)
 * Shows a slide-up notification bar.
 *
 * @param {string} message
 * @param {string} type      'success' | 'error' | 'warning' | ''
 * @param {number} duration  milliseconds (default 3000)
 */
function showToast(message, type = '', duration = 3000) {
  let toast = document.getElementById('dt-toast');

  if (!toast) {
    toast           = document.createElement('div');
    toast.id        = 'dt-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.className   = 'toast' + (type ? ` ${type}` : '');
  toast.textContent = message;

  /* Force reflow so transition fires even on repeat calls */
  void toast.offsetWidth;
  toast.classList.add('show');

  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}


/* ═══════════════════════════════════════════════════════════════
   7. CAROUSEL
   Works for welcome.html (4 slides) and all phase pages.
   ═══════════════════════════════════════════════════════════════ */

/**
 * initCarousel(wrapSelector)
 * Initialises a touch+mouse swipeable carousel.
 *
 * @param {string} wrapSelector  CSS selector for .carousel-wrap
 *                               Default: '.carousel-wrap'
 * @returns {{ goToSlide: Function, getIndex: Function } | null}
 */
function initCarousel(wrapSelector = '.carousel-wrap') {
  const wrap   = document.querySelector(wrapSelector);
  if (!wrap) return null;

  const track  = wrap.querySelector('.carousel-track');
  const slides = wrap.querySelectorAll('.carousel-slide');
  const dotRow = document.querySelector('.dot-row');
  if (!track || slides.length === 0) return null;

  let current = 0;
  const total = slides.length;

  /* Build dots */
  if (dotRow) {
    dotRow.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const dot     = document.createElement('div');
      dot.className = i === 0 ? 'dot active' : 'dot';
      dot.setAttribute('aria-label', `Slide ${i + 1} of ${total}`);
      dot.addEventListener('click', () => goToSlide(i));
      dotRow.appendChild(dot);
    }
  }

  function goToSlide(index) {
    if (index < 0 || index >= total) return;
    current                = index;
    track.style.transform  = `translateX(-${current * 100}%)`;
    if (dotRow) {
      dotRow.querySelectorAll('.dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
    }
  }

  /* Touch swipe */
  let startX     = 0;
  let dragging   = false;

  wrap.addEventListener('touchstart', e => {
    startX   = e.touches[0].clientX;
    dragging = true;
  }, { passive: true });

  wrap.addEventListener('touchend', e => {
    if (!dragging) return;
    const delta = startX - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) {
      goToSlide(delta > 0
        ? Math.min(current + 1, total - 1)
        : Math.max(current - 1, 0));
    }
    dragging = false;
  }, { passive: true });

  /* Mouse drag (desktop) */
  wrap.addEventListener('mousedown', e => {
    startX   = e.clientX;
    dragging = true;
    e.preventDefault();
  });

  document.addEventListener('mouseup', e => {
    if (!dragging) return;
    const delta = startX - e.clientX;
    if (Math.abs(delta) > 40) {
      goToSlide(delta > 0
        ? Math.min(current + 1, total - 1)
        : Math.max(current - 1, 0));
    }
    dragging = false;
  });

  return { goToSlide, getIndex: () => current };
}


/* ═══════════════════════════════════════════════════════════════
   8. PHASE STEPPER (dashboard.html)
   ═══════════════════════════════════════════════════════════════ */

const PHASE_META = [
  { num: 1, label: 'Empathize', page: 'phase01-empathy.html'  },
  { num: 2, label: 'Define',    page: 'phase02-define.html'    },
  { num: 3, label: 'Ideate',    page: 'phase03-ideation.html'  },
  { num: 4, label: 'Prototype', page: 'phase04-prototype.html' },
  { num: 5, label: 'Test',      page: 'phase05-test.html'      },
];

/**
 * renderStepper(containerSelector)
 * Draws the 5-step stepper with correct states from localStorage.
 *
 * @param {string} containerSelector  Default: '.stepper'
 */
function renderStepper(containerSelector = '.stepper') {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const activeIdx = window.DT.getActivePhaseIndex();
  let html        = '';

  PHASE_META.forEach((phase, i) => {
    const { submitted } = window.DT.getPhaseProgress(phase.num);
    const isComplete = submitted;
    const isActive   = !submitted && i === activeIdx;

    const circleClass = isComplete ? 'complete' : isActive ? 'active' : 'pending';
    const labelClass  = isComplete || isActive ? circleClass : '';
    const lineClass   = i > 0 && (submitted || i <= activeIdx) ? 'complete' : '';
    const lineHTML    = i > 0 ? `<div class="step-line ${lineClass}"></div>` : '';

    html += `
      ${lineHTML}
      <div class="step-item">
        <div class="step-circle ${circleClass}"
             role="button"
             tabindex="0"
             aria-label="Phase ${phase.num}: ${phase.label}"
             data-page="${phase.page}">
        </div>
        <span class="step-label ${labelClass}">${phase.label}</span>
      </div>`;
  });

  container.innerHTML = html;

  /* Make completed / active steps clickable */
  container.querySelectorAll('.step-circle:not(.pending)').forEach(circle => {
    const page = circle.getAttribute('data-page');
    circle.style.cursor = 'pointer';
    circle.addEventListener('click', () => navigateTo(page));
    circle.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') navigateTo(page);
    });
  });

  _updateCurrentPhaseLabel(activeIdx);
  _updateContinueButton(activeIdx);
}

function _updateCurrentPhaseLabel(activeIdx) {
  const el = document.querySelector('.current-phase-label');
  if (!el) return;
  const allDone = activeIdx >= PHASE_META.length;
  el.innerHTML  = allDone
    ? 'You have completed all phases! 🎉'
    : `You are in <span>${PHASE_META[activeIdx].label} Phase</span>`;
}

function _updateContinueButton(activeIdx) {
  const btn = document.querySelector('[data-continue-phase]');
  if (!btn) return;
  const idx  = Math.min(activeIdx, PHASE_META.length - 1);
  btn.addEventListener('click', () => navigateTo(PHASE_META[idx].page));
}


/* ═══════════════════════════════════════════════════════════════
   9. PROGRESS BAR
   ═══════════════════════════════════════════════════════════════ */

/**
 * renderProgressBar(fillSelector, labelSelector)
 * Updates the visual progress bar and the percentage text.
 *
 * @param {string} fillSelector   Default: '.progress-bar-fill'
 * @param {string} labelSelector  Default: '.project-progress-pct'
 */
function renderProgressBar(
  fillSelector  = '.progress-bar-fill',
  labelSelector = '.project-progress-pct'
) {
  const pct   = window.DT.calculateOverallProgress();
  const fill  = document.querySelector(fillSelector);
  const label = document.querySelector(labelSelector);
  if (fill)  fill.style.width  = `${pct}%`;
  if (label) label.textContent = `${pct}%`;
}


/* ═══════════════════════════════════════════════════════════════
   10. ACCORDION ROWS (dashboard.html)
   ═══════════════════════════════════════════════════════════════ */

/**
 * initAccordions(listSelector)
 * Wires up expand/collapse on accordion rows.
 * Each .accordion-row must be immediately followed by
 * a sibling .accordion-body element.
 *
 * @param {string} listSelector  Default: '.accordion-list'
 */
function initAccordions(listSelector = '.accordion-list') {
  const list = document.querySelector(listSelector);
  if (!list) return;

  list.querySelectorAll('.accordion-row').forEach(row => {
    const body    = row.nextElementSibling;
    const chevron = row.querySelector('.accordion-chevron');
    if (!body?.classList.contains('accordion-body')) return;

    row.addEventListener('click', () => {
      const isOpen = body.classList.contains('open');

      /* Close all open bodies */
      list.querySelectorAll('.accordion-body.open').forEach(b => {
        b.classList.remove('open');
        b.previousElementSibling
          ?.querySelector('.accordion-chevron')
          ?.classList.remove('open');
      });

      /* Toggle the clicked one */
      if (!isOpen) {
        body.classList.add('open');
        chevron?.classList.add('open');
      }
    });
  });
}


/* ═══════════════════════════════════════════════════════════════
   11. DASHBOARD PAGE RENDERER
   ═══════════════════════════════════════════════════════════════ */

/**
 * renderDashboardPage()
 * Fills all dynamic content on dashboard.html.
 * Call this after DOMContentLoaded on dashboard.html.
 */
function renderDashboardPage() {
  const student = window.DT.getStudentData();

  _setText('.greeting-name',  window.DT.getFirstName());
  _setText('.project-title',  student.projectName || 'My FYP Project');
  _setText('.project-meta',
    `${student.team || 'My Team'} · ${student.supervisor || 'My Supervisor'}`);

  renderProgressBar();
  renderStepper();
  initAccordions();
  _updateHeaderAvatar();
}


/* ═══════════════════════════════════════════════════════════════
   12. PROFILE PAGE RENDERER
   ═══════════════════════════════════════════════════════════════ */

/**
 * renderProfilePage()
 * Fills all dynamic content on profile.html.
 */
function renderProfilePage() {
  const student = window.DT.getStudentData();

  _setText('.profile-name',        student.name         || 'Student');
  _setText('.profile-field-reg',   student.regNo        || '—');
  _setText('.profile-field-class', student.studentClass || '—');
  _setText('.profile-field-team',  student.team         || '—');
  _setText('.profile-field-role',  student.role         || 'Team Member');
  _setText('.stat-badges-count',   String(window.DT.countEarnedBadges()));

  /* Submitted phases count */
  const submitted = window.DT.getAllPhaseProgress().filter(p => p.submitted).length;
  _setText('.stat-submitted-count', String(submitted));

  _updateHeaderAvatar();
}


/* ═══════════════════════════════════════════════════════════════
   13. LOGIN FORM HANDLER
   ═══════════════════════════════════════════════════════════════ */

/**
 * handleLoginSubmit(event, formSelector)
 * Validates and saves the login form, then navigates to dashboard.
 *
 * Attach to the Continue button:
 *   onclick="UI.handleLoginSubmit(event, '#login-form')"
 *
 * @param {Event}  event
 * @param {string} formSelector
 */
function handleLoginSubmit(event, formSelector = '#login-form') {
  event.preventDefault();

  const form  = document.querySelector(formSelector);
  if (!form) return;

  const email = form.querySelector('[name="email"]')?.value.trim()        || '';
  const regNo = form.querySelector('[name="regNo"]')?.value.trim()        || '';
  const cls   = form.querySelector('[name="studentClass"]')?.value.trim() || '';

  /* Validate — all 3 fields required */
  if (!email || !regNo || !cls) {
    showToast('Please fill in all fields.', 'error');

    /* Highlight empty fields with red border */
    [['[name="email"]', email], ['[name="regNo"]', regNo], ['[name="studentClass"]', cls]]
      .forEach(([sel, val]) => {
        const el = form.querySelector(sel);
        if (!el) return;
        el.closest('.form-field')?.style.setProperty(
          'border-color', val ? '' : '#EF4444'
        );
      });
    return;
  }

  /* Save and redirect */
  window.DT.saveStudentData({ email, regNo, studentClass: cls });
  window.DT.markRegistered();
  navigateTo('dashboard.html');
}


/* ═══════════════════════════════════════════════════════════════
   14. BADGE DISPLAY
   ═══════════════════════════════════════════════════════════════ */

/**
 * renderBadgeGrid(containerSelector)
 * Renders all badges inside a container, showing earned ones
 * in full colour and unearned ones as locked/grey.
 *
 * @param {string} containerSelector  e.g. '.badge-grid'
 */
function renderBadgeGrid(containerSelector = '.badge-grid') {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const BADGE_DEF = [
    { key: window.DT.KEYS.BADGE_EXPLORER,  name: 'DT Explorer',       desc: 'Completed 3 of 5 phases'     },
    { key: window.DT.KEYS.BADGE_EMPATHY,   name: 'Empathy Champion',   desc: 'Empathy Map completed'        },
    { key: window.DT.KEYS.BADGE_FRAMER,    name: 'Problem Framer',     desc: 'Gate 1 approved'              },
    { key: window.DT.KEYS.BADGE_IDEAS,     name: 'Idea Generator',     desc: '20+ ideas in brainstorm'      },
    { key: window.DT.KEYS.BADGE_BUILDER,   name: 'Prototype Builder',  desc: '2+ build iterations logged'   },
    { key: window.DT.KEYS.BADGE_TESTER,    name: 'User Tester',        desc: '3+ feedback forms submitted'  },
    { key: window.DT.KEYS.BADGE_GRADUATE,  name: 'DT Graduate',        desc: 'All phases + Gate 3 approved' },
    { key: window.DT.KEYS.BADGE_PORTFOLIO, name: 'Full Portfolio',      desc: 'Portfolio submitted'          },
  ];

  container.innerHTML = BADGE_DEF.map(badge => {
    const earned  = window.DT.hasBadge(badge.key);
    const locked  = !earned ? 'locked' : '';
    const dateStr = earned ? `Earned ${_todayString()}` : 'Not yet earned';

    return `
      <div class="badge-card ${locked}" aria-label="${badge.name} badge${earned ? '' : ' (locked)'}">
        <div class="badge-hex">
          <svg class="badge-hex-icon" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <div class="badge-ribbon">
          <div class="badge-ribbon-stripe"></div>
          <div class="badge-ribbon-stripe"></div>
        </div>
        <p class="badge-name">${badge.name}</p>
        <p class="badge-desc">${badge.desc}</p>
        <p class="badge-date">${dateStr}</p>
      </div>`;
  }).join('');
}


/* ═══════════════════════════════════════════════════════════════
   15. AI COACH PANEL
   ═══════════════════════════════════════════════════════════════ */

const _COACH_PROMPTS = {
  1: `You are DT Coach for Diploma students at Politeknik Port Dickson. The student is on Phase 01: Empathy. Help them understand users' real feelings and needs before thinking about solutions. Key concepts: empathy interviews, Empathy Map (Says/Thinks/Does/Feels), User Persona, User Needs Summary. Keep responses to 3–4 short sentences. Ask guiding questions instead of giving answers. Be warm and encouraging.`,
  2: `You are DT Coach for Diploma students at Politeknik Port Dickson. The student is on Phase 02: Define. Help them write ONE clear, user-centred problem statement. No solutions yet. Key concepts: POV statement format, How Might We questions. Keep responses short. Redirect gently if they include a solution.`,
  3: `You are DT Coach for Diploma students at Politeknik Port Dickson. The student is on Phase 03: Ideation. Help them generate many ideas before judging any. Key concepts: brainstorming (no judging), SCAMPER technique, Idea Selection Matrix. Encourage wild ideas. Keep energy positive.`,
  4: `You are DT Coach for Diploma students at Politeknik Port Dickson. The student is on Phase 04: Prototype. Help them build a rough low-fidelity prototype. Key concepts: lo-fi prototype, Version Log, iteration cycles. Remind them: rough is good. Don't over-engineer. Keep responses practical.`,
  5: `You are DT Coach for Diploma students at Politeknik Port Dickson. The student is on Phase 05: Test. Help them observe users silently and write a Final Reflection. Key concepts: User Feedback Form, silent observation, Improvement Plan. Remind them: don't explain the prototype first. Be celebratory — this is the last phase!`,
};

const _COACH_CHIPS = {
  1: ['What is an Empathy Map?', 'How do I interview users?', 'Check my questions'],
  2: ['What is a POV statement?', 'How do I write HMW questions?', 'Check my problem statement'],
  3: ['Explain SCAMPER', 'How do I score ideas?', 'I am stuck on ideas'],
  4: ['What counts as a prototype?', 'What goes in the Version Log?', 'How rough is rough enough?'],
  5: ['How do I run a user test?', 'Why not explain the prototype?', 'Help me write my reflection'],
};

let _coachPhase   = 0;
let _coachHistory = [];

/**
 * initAICoach(phaseNum)
 * Creates the floating coach button and slide-up panel.
 * Call on each phase page: initAICoach(1);
 *
 * @param {number} phaseNum  1 to 5
 */
function initAICoach(phaseNum) {
  _coachPhase   = phaseNum;
  _coachHistory = [];

  if (!document.getElementById('coach-fab'))   _buildCoachFAB();
  if (!document.getElementById('coach-panel')) _buildCoachPanel(phaseNum);
  _injectCoachStyles();
}

function _buildCoachFAB() {
  const btn     = document.createElement('button');
  btn.id        = 'coach-fab';
  btn.className = 'fab';
  btn.setAttribute('aria-label', 'Open DT Coach');
  btn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>`;
  btn.addEventListener('click', _openCoach);
  document.body.appendChild(btn);
}

function _buildCoachPanel(phaseNum) {
  const chips = (_COACH_CHIPS[phaseNum] || [])
    .map(c => `<button class="coach-chip" onclick="UI.sendCoachMessage('${c.replace(/'/g, "\\'")}')">${c}</button>`)
    .join('');

  const scrim     = document.createElement('div');
  scrim.id        = 'coach-scrim';
  scrim.className = 'scrim';
  scrim.addEventListener('click', _closeCoach);
  document.body.appendChild(scrim);

  const panel     = document.createElement('div');
  panel.id        = 'coach-panel';
  panel.className = 'coach-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-label', 'DT Coach');
  panel.innerHTML = `
    <div class="coach-header">
      <div class="coach-title">
        <div class="coach-avatar-sm" aria-hidden="true">💡</div>
        <span>DT Coach</span>
      </div>
      <button class="coach-close" onclick="UI._closeCoach()" aria-label="Close DT Coach">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
    <div class="coach-chat" id="coach-chat">
      <div class="coach-msg coach-msg--bot">
        <div class="coach-avatar-sm" aria-hidden="true">💡</div>
        <div class="coach-bubble">
          Hi! I am your DT Coach. I am here to help you through this phase. What would you like to know?
        </div>
      </div>
      <div class="coach-chips" id="coach-chips">${chips}</div>
    </div>
    <div class="coach-footer">
      <input id="coach-input" class="coach-input" type="text"
             placeholder="Ask DT Coach anything..."
             onkeydown="if(event.key==='Enter') UI.sendCoachMessage()">
      <button class="coach-send" onclick="UI.sendCoachMessage()" aria-label="Send">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
    </div>`;
  document.body.appendChild(panel);
}

function _openCoach() {
  document.getElementById('coach-panel')?.classList.add('open');
  document.getElementById('coach-scrim')?.classList.add('show');
  document.getElementById('coach-input')?.focus();
}

function _closeCoach() {
  document.getElementById('coach-panel')?.classList.remove('open');
  document.getElementById('coach-scrim')?.classList.remove('show');
}

/**
 * sendCoachMessage(text)
 * Sends a message to the AI Coach API.
 * Called by chip clicks and the Send button.
 *
 * @param {string} [text]  If omitted, reads from #coach-input
 */
async function sendCoachMessage(text) {
  const input   = document.getElementById('coach-input');
  const message = text || input?.value.trim() || '';
  if (!message) return;

  if (input) input.value = '';

  /* Hide chips after first message */
  const chips = document.getElementById('coach-chips');
  if (chips) chips.style.display = 'none';

  _appendMsg(message, 'user');
  _coachHistory.push({ role: 'user', content: message });

  const loadId = _showLoading();

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 800,
        system:     _COACH_PROMPTS[_coachPhase] || _COACH_PROMPTS[1],
        messages:   _coachHistory,
      }),
    });

    const data  = await resp.json();
    const reply = data?.content?.[0]?.text
      || 'I could not get a response right now. Please try again.';

    _removeLoading(loadId);
    _coachHistory.push({ role: 'assistant', content: reply });
    _appendMsg(reply, 'bot');

  } catch {
    _removeLoading(loadId);
    _appendMsg('DT Coach is unavailable right now. Please check your connection.', 'bot');
  }
}

function _appendMsg(text, role) {
  const chat = document.getElementById('coach-chat');
  if (!chat) return;

  const div = document.createElement('div');
  div.className = `coach-msg coach-msg--${role}`;
  div.innerHTML = role === 'bot'
    ? `<div class="coach-avatar-sm" aria-hidden="true">💡</div>
       <div class="coach-bubble">${_esc(text)}</div>`
    : `<div class="coach-bubble coach-bubble--user">${_esc(text)}</div>`;

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function _showLoading() {
  const chat = document.getElementById('coach-chat');
  if (!chat) return null;
  const id  = `cl-${Date.now()}`;
  const div = document.createElement('div');
  div.id    = id;
  div.className = 'coach-msg coach-msg--bot';
  div.innerHTML = `<div class="coach-avatar-sm" aria-hidden="true">💡</div>
    <div class="coach-bubble coach-loading"><span></span><span></span><span></span></div>`;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  return id;
}

function _removeLoading(id) {
  if (id) document.getElementById(id)?.remove();
}

function _esc(str) {
  return str
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/\n/g, '<br>');
}

function _injectCoachStyles() {
  if (document.getElementById('coach-css')) return;
  const s = document.createElement('style');
  s.id    = 'coach-css';
  s.textContent = `
.coach-panel{position:fixed;bottom:0;left:50%;transform:translateX(-50%) translateY(100%);
  width:100%;max-width:480px;height:72vh;background:#fff;border-radius:24px 24px 0 0;
  display:flex;flex-direction:column;z-index:210;
  transition:transform .35s cubic-bezier(.32,.72,0,1);
  box-shadow:0 -8px 32px rgba(7,27,61,.18);}
.coach-panel.open{transform:translateX(-50%) translateY(0);}
.coach-header{display:flex;align-items:center;justify-content:space-between;
  padding:16px 20px 12px;border-bottom:1px solid #E8EDF2;flex-shrink:0;}
.coach-title{display:flex;align-items:center;gap:8px;
  font:700 16px 'Poppins',sans-serif;color:#071B3D;}
.coach-avatar-sm{width:28px;height:28px;border-radius:50%;background:#14B8A6;
  display:flex;align-items:center;justify-content:center;
  color:#fff;font-size:13px;flex-shrink:0;}
.coach-close{width:32px;height:32px;border-radius:50%;background:#F5F5F5;
  border:none;display:flex;align-items:center;justify-content:center;
  cursor:pointer;color:#6B7280;}
.coach-chat{flex:1;overflow-y:auto;padding:16px;display:flex;
  flex-direction:column;gap:12px;}
.coach-msg{display:flex;align-items:flex-end;gap:8px;}
.coach-msg--user{flex-direction:row-reverse;}
.coach-bubble{background:#F0FAFA;border:1px solid #E8EDF2;
  border-radius:16px 16px 16px 4px;padding:10px 14px;
  font:400 14px/1.55 'Poppins',sans-serif;color:#1A1A2E;max-width:82%;}
.coach-bubble--user{background:#071B3D;color:#fff;border:none;
  border-radius:16px 16px 4px 16px;}
.coach-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;}
.coach-chip{background:#fff;border:1.5px solid #14B8A6;color:#14B8A6;
  border-radius:50px;padding:6px 14px;
  font:500 12px 'Poppins',sans-serif;cursor:pointer;
  transition:background .15s,color .15s;}
.coach-chip:hover{background:#14B8A6;color:#fff;}
.coach-loading{display:flex;align-items:center;gap:5px;padding:12px 16px;}
.coach-loading span{width:7px;height:7px;border-radius:50%;background:#14B8A6;
  animation:cdot 1.2s infinite ease-in-out;}
.coach-loading span:nth-child(2){animation-delay:.2s;}
.coach-loading span:nth-child(3){animation-delay:.4s;}
@keyframes cdot{0%,80%,100%{transform:scale(.7);opacity:.4}40%{transform:scale(1);opacity:1}}
.coach-footer{display:flex;align-items:center;gap:10px;
  padding:12px 16px 20px;border-top:1px solid #E8EDF2;flex-shrink:0;}
.coach-input{flex:1;border:1.5px solid #E8EDF2;border-radius:50px;
  padding:10px 16px;font:400 14px 'Poppins',sans-serif;
  color:#1A1A2E;outline:none;background:#FAFBFC;}
.coach-input:focus{border-color:#14B8A6;}
.coach-send{width:40px;height:40px;min-width:40px;border-radius:50%;
  background:#14B8A6;border:none;display:flex;align-items:center;
  justify-content:center;cursor:pointer;color:#fff;
  transition:opacity .15s;}
.coach-send:hover{opacity:.85;}`;
  document.head.appendChild(s);
}


/* ═══════════════════════════════════════════════════════════════
   16. GOOGLE SHEETS SUBMISSION
   ═══════════════════════════════════════════════════════════════ */

/**
 * submitToSheets(sheetUrl, phaseData)
 * POSTs phase data to a Google Apps Script Web App.
 * Automatically prepends student info and a timestamp.
 *
 * @param {string} sheetUrl   Web App URL from Apps Script Deploy
 * @param {Object} phaseData  Phase-specific key:value pairs
 * @returns {Promise<void>}
 *
 * Usage:
 *   await UI.submitToSheets(SHEETS_URL, { phase: 'Phase01', t01_date: '...' });
 */
async function submitToSheets(sheetUrl, phaseData) {
  if (!sheetUrl) { console.warn('submitToSheets: no URL'); return; }

  const student = window.DT.getStudentData();
  const payload = {
    timestamp:    _todayString() + ' ' + _timeString(),
    studentName:  student.name,
    regNo:        student.regNo,
    studentClass: student.studentClass,
    team:         student.team,
    supervisor:   student.supervisor,
    projectName:  student.projectName,
    ...phaseData,
  };

  await fetch(sheetUrl, {
    method:  'POST',
    mode:    'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });
}


/* ═══════════════════════════════════════════════════════════════
   17. UTILITY HELPERS
   ═══════════════════════════════════════════════════════════════ */

/**
 * _setText(selector, text)
 * Safely sets textContent if the element exists.
 */
function _setText(selector, text) {
  const el = document.querySelector(selector);
  if (el) el.textContent = text;
}

/**
 * _todayString()
 * @returns {string}  e.g. '16/05/2026'
 */
function _todayString() {
  const d = new Date();
  return [
    String(d.getDate()).padStart(2, '0'),
    String(d.getMonth() + 1).padStart(2, '0'),
    d.getFullYear(),
  ].join('/');
}

/**
 * _timeString()
 * @returns {string}  e.g. '10:30 AM'
 */
function _timeString() {
  const d   = new Date();
  const h   = d.getHours();
  const m   = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${m} ${ampm}`;
}

/**
 * debounce(fn, delay)
 * @param {Function} fn
 * @param {number}   delay  ms
 * @returns {Function}
 */
function debounce(fn, delay = 400) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * validateForm(formEl)
 * Highlights empty required fields and shows a toast.
 * @param  {HTMLFormElement} formEl
 * @returns {boolean}  true = all required fields filled
 */
function validateForm(formEl) {
  if (!formEl) return true;
  let ok = true;
  formEl.querySelectorAll('[required]').forEach(field => {
    const empty = !field.value.trim();
    if (empty) ok = false;
    field.closest('.form-field')?.style.setProperty(
      'border-color', empty ? '#EF4444' : ''
    );
  });
  if (!ok) showToast('Please fill in all required fields.', 'error');
  return ok;
}


/* ═══════════════════════════════════════════════════════════════
   EXPORTS
   Exposed on window.UI so all pages can call without a bundler.
   ═══════════════════════════════════════════════════════════════ */

window.UI = window.UI || {};

Object.assign(window.UI, {
  /* Routing */
  checkRegistration,
  routeFromIndex,
  navigateTo,
  logoutStudent,

  /* Language */
  setLanguage,

  /* Toast */
  showToast,

  /* Carousel */
  initCarousel,

  /* Dashboard */
  renderDashboardPage,
  renderStepper,
  renderProgressBar,
  initAccordions,

  /* Profile */
  renderProfilePage,
  renderBadgeGrid,

  /* Login */
  handleLoginSubmit,

  /* AI Coach */
  initAICoach,
  sendCoachMessage,
  _closeCoach,

  /* Sheets */
  submitToSheets,

  /* Utilities */
  showToast,
  validateForm,
  debounce,
});

}()); /* end IIFE — window.UI is now available globally */
