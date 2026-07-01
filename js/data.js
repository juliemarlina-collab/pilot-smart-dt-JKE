/**
 * Smart DT Project V3 — js/data.js
 * ─────────────────────────────────────────────────────────────────
 * ALL data operations for the app live here.
 * No page should ever call localStorage directly.
 * Every read and write goes through this file.
 *
 * Sections:
 *  1. Key constants
 *  2. Registration
 *  3. Student profile
 *  4. Phase progress
 *  5. Supervisor gates
 *  6. Badge flags
 *  7. Template / form data
 *  8. App preferences
 *  9. Nuclear clear (logout)
 * ─────────────────────────────────────────────────────────────────
 */

(function () {
  'use strict';
  /* ── All functions and constants are scoped to this IIFE.
        window.DT is assigned at the very end.
        This pattern guarantees window.DT is always set,
        regardless of browser, protocol (file:// or http://),
        or script load order quirks.                           */



/* ═══════════════════════════════════════════════════════════════
   1. KEY CONSTANTS
   Never type a raw string like 'df_registered' outside this file.
   ═══════════════════════════════════════════════════════════════ */

const KEYS = Object.freeze({

  /* Registration */
  REGISTERED:      'df_registered',

  /* Student profile (collected across login + profile pages) */
  EMAIL:           'df_email',
  REG_NO:          'df_reg_no',
  CLASS:           'df_class',
  NAME:            'df_student_name',
  TEAM:            'df_team',
  SUPERVISOR:      'df_supervisor',
  PROJECT_NAME:    'df_project_name',
  ROLE:            'df_role',

  /* App preferences */
  LANGUAGE:        'df_language',

  /* Quiz scores  — value: "0" to "5" */
  QUIZ_P1:         'df_quiz_phase01',
  QUIZ_P2:         'df_quiz_phase02',
  QUIZ_P3:         'df_quiz_phase03',
  QUIZ_P4:         'df_quiz_phase04',
  QUIZ_P5:         'df_quiz_phase05',

  /* Phase submission flags — value: "true" */
  SUBMITTED_P1:    'df_submitted_phase01',
  SUBMITTED_P2:    'df_submitted_phase02',
  SUBMITTED_P3:    'df_submitted_phase03',
  SUBMITTED_P4:    'df_submitted_phase04',
  SUBMITTED_P5:    'df_submitted_phase05',

  /* Supervisor gate approvals — value: "true" */
  GATE1:           'df_gate1_approved',
  GATE2:           'df_gate2_approved',
  GATE3:           'df_gate3_approved',

  /* Badge flags — value: "true" */
  BADGE_EXPLORER:  'df_badge_explorer',
  BADGE_EMPATHY:   'df_badge_empathy',
  BADGE_FRAMER:    'df_badge_framer',
  BADGE_IDEAS:     'df_badge_ideas',
  BADGE_BUILDER:   'df_badge_builder',
  BADGE_TESTER:    'df_badge_tester',
  BADGE_GRADUATE:  'df_badge_graduate',
  BADGE_PORTFOLIO: 'df_badge_portfolio',
});


/* ═══════════════════════════════════════════════════════════════
   2. REGISTRATION
   ═══════════════════════════════════════════════════════════════ */

/**
 * isRegistered()
 * Returns true if the student has completed login.
 * Used by index.html and checkRegistration() in ui.js.
 */
function isRegistered() {
  return localStorage.getItem(KEYS.REGISTERED) === 'true';
}

/**
 * markRegistered()
 * Called after a successful login form submission.
 */
function markRegistered() {
  localStorage.setItem(KEYS.REGISTERED, 'true');
}


/* ═══════════════════════════════════════════════════════════════
   3. STUDENT PROFILE
   ═══════════════════════════════════════════════════════════════ */

/**
 * getStudentData()
 * Returns all student info as a plain object.
 * Missing fields return an empty string — never null.
 *
 * @returns {Object}
 */
function getStudentData() {
  return {
    email:        localStorage.getItem(KEYS.EMAIL)        || '',
    regNo:        localStorage.getItem(KEYS.REG_NO)       || '',
    studentClass: localStorage.getItem(KEYS.CLASS)        || '',
    name:         localStorage.getItem(KEYS.NAME)         || '',
    team:         localStorage.getItem(KEYS.TEAM)         || '',
    supervisor:   localStorage.getItem(KEYS.SUPERVISOR)   || '',
    projectName:  localStorage.getItem(KEYS.PROJECT_NAME) || '',
    role:         localStorage.getItem(KEYS.ROLE)         || 'Team Member',
    language:     localStorage.getItem(KEYS.LANGUAGE)     || 'English',
  };
}

/**
 * saveStudentData(obj)
 * Saves any student fields that are present in obj.
 * Unknown keys are silently ignored — safe to call with partial data.
 *
 * @param {Object} obj  e.g. { email: 'x@y.com', regNo: '23DEM001' }
 */
function saveStudentData(obj) {
  const keyMap = {
    email:        KEYS.EMAIL,
    regNo:        KEYS.REG_NO,
    studentClass: KEYS.CLASS,
    name:         KEYS.NAME,
    team:         KEYS.TEAM,
    supervisor:   KEYS.SUPERVISOR,
    projectName:  KEYS.PROJECT_NAME,
    role:         KEYS.ROLE,
    language:     KEYS.LANGUAGE,
  };

  Object.keys(obj).forEach(field => {
    if (keyMap[field] !== undefined && obj[field] !== undefined && obj[field] !== null) {
      localStorage.setItem(keyMap[field], String(obj[field]));
    }
  });
}

/**
 * getFirstName()
 * Returns just the first word of the student's full name.
 * Falls back to 'Student' if name is not stored yet.
 *
 * @returns {string}
 */
function getFirstName() {
  const full = localStorage.getItem(KEYS.NAME) || '';
  const first = full.trim().split(/\s+/)[0];
  return first || 'Student';
}

/**
 * getInitials()
 * Returns up to two initials from the student's full name.
 * e.g. 'Aina Binti Ahmad' → 'AA'
 * Falls back to 'S' for Student.
 *
 * @returns {string}
 */
function getInitials() {
  const full  = (localStorage.getItem(KEYS.NAME) || '').trim();
  const parts = full.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'S';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}


/* ═══════════════════════════════════════════════════════════════
   4. PHASE PROGRESS
   ═══════════════════════════════════════════════════════════════ */

/**
 * getPhaseProgress(phaseNum)
 * Returns all progress info for a single phase.
 *
 * @param  {number} phaseNum  1 to 5
 * @returns {{ quizScore: number, quizPassed: boolean, submitted: boolean }}
 */
function getPhaseProgress(phaseNum) {
  const pad       = _padPhase(phaseNum);
  const rawScore  = localStorage.getItem(`df_quiz_phase${pad}`);
  const score     = rawScore !== null ? parseInt(rawScore, 10) : 0;
  const submitted = localStorage.getItem(`df_submitted_phase${pad}`) === 'true';

  return {
    quizScore:  score,
    quizPassed: score >= 3,
    submitted,
  };
}

/**
 * saveQuizScore(phaseNum, score)
 * Stores a quiz score for a phase.
 *
 * @param {number} phaseNum  1 to 5
 * @param {number} score     0 to 5
 */
function saveQuizScore(phaseNum, score) {
  localStorage.setItem(`df_quiz_phase${_padPhase(phaseNum)}`, String(score));
}

/**
 * markPhaseSubmitted(phaseNum)
 * Marks a phase as fully submitted.
 *
 * @param {number} phaseNum  1 to 5
 */
function markPhaseSubmitted(phaseNum) {
  localStorage.setItem(`df_submitted_phase${_padPhase(phaseNum)}`, 'true');
}

/**
 * getAllPhaseProgress()
 * Returns an array of progress objects for phases 1–5.
 *
 * @returns {Array}  [ { phaseNum, quizScore, quizPassed, submitted }, ... ]
 */
function getAllPhaseProgress() {
  return [1, 2, 3, 4, 5].map(n => ({
    phaseNum: n,
    ...getPhaseProgress(n),
  }));
}

/**
 * calculateOverallProgress()
 * Returns overall completion as an integer 0–100.
 * Each submitted phase = 20%.
 *
 * @returns {number}
 */
function calculateOverallProgress() {
  const submitted = getAllPhaseProgress().filter(p => p.submitted).length;
  return submitted * 20;
}

/**
 * getActivePhaseIndex()
 * Returns the 0-based index of the current active phase.
 * Active = the first phase that is not yet submitted.
 * If all are submitted, returns 4 (last phase).
 *
 * @returns {number}  0 to 4
 */
function getActivePhaseIndex() {
  const all = getAllPhaseProgress();
  const idx = all.findIndex(p => !p.submitted);
  return idx === -1 ? 4 : idx;
}


/* ═══════════════════════════════════════════════════════════════
   5. SUPERVISOR GATES
   ═══════════════════════════════════════════════════════════════ */

/**
 * isGateApproved(gateNum)
 * @param  {number} gateNum  1, 2, or 3
 * @returns {boolean}
 */
function isGateApproved(gateNum) {
  return localStorage.getItem(`df_gate${gateNum}_approved`) === 'true';
}

/**
 * approveGate(gateNum)
 * Sets a gate to approved.
 * NOTE: In production this is set by the supervisor,
 * not by the student. This function is for testing only.
 *
 * @param {number} gateNum  1, 2, or 3
 */
function approveGate(gateNum) {
  localStorage.setItem(`df_gate${gateNum}_approved`, 'true');
}


/* ═══════════════════════════════════════════════════════════════
   6. BADGE FLAGS
   ═══════════════════════════════════════════════════════════════ */

/**
 * hasBadge(key)
 * @param  {string} key  One of KEYS.BADGE_* constants
 * @returns {boolean}
 */
function hasBadge(key) {
  return localStorage.getItem(key) === 'true';
}

/**
 * awardBadge(key)
 * Sets a badge to earned. Idempotent — safe to call repeatedly.
 *
 * @param {string} key  One of KEYS.BADGE_* constants
 */
function awardBadge(key) {
  if (!hasBadge(key)) {
    localStorage.setItem(key, 'true');
  }
}

/**
 * getBadgeSummary()
 * Returns the status of every badge as a plain object.
 *
 * @returns {Object}  { explorer: bool, empathy: bool, ... }
 */
function getBadgeSummary() {
  return {
    explorer:  hasBadge(KEYS.BADGE_EXPLORER),
    empathy:   hasBadge(KEYS.BADGE_EMPATHY),
    framer:    hasBadge(KEYS.BADGE_FRAMER),
    ideas:     hasBadge(KEYS.BADGE_IDEAS),
    builder:   hasBadge(KEYS.BADGE_BUILDER),
    tester:    hasBadge(KEYS.BADGE_TESTER),
    graduate:  hasBadge(KEYS.BADGE_GRADUATE),
    portfolio: hasBadge(KEYS.BADGE_PORTFOLIO),
  };
}

/**
 * countEarnedBadges()
 * @returns {number}
 */
function countEarnedBadges() {
  return Object.values(getBadgeSummary()).filter(Boolean).length;
}

/**
 * evaluateAndAwardBadges()
 * Checks all badge conditions and awards any that are now met.
 * Safe to call on every page load — won't re-award existing badges.
 */
function evaluateAndAwardBadges() {
  if (!isRegistered()) return;

  const all          = getAllPhaseProgress();
  const submittedCnt = all.filter(p => p.submitted).length;

  /* DT Explorer — 3 or more phases submitted */
  if (submittedCnt >= 3) awardBadge(KEYS.BADGE_EXPLORER);

  /* Problem Framer — Gate 1 approved */
  if (isGateApproved(1)) awardBadge(KEYS.BADGE_FRAMER);

  /* Prototype Builder — Gate 2 approved */
  if (isGateApproved(2)) awardBadge(KEYS.BADGE_BUILDER);

  /* User Tester — Gate 3 approved */
  if (isGateApproved(3)) awardBadge(KEYS.BADGE_TESTER);

  /* DT Graduate — all 5 submitted AND Gate 3 approved */
  if (submittedCnt === 5 && isGateApproved(3)) {
    awardBadge(KEYS.BADGE_GRADUATE);
  }
}


/* ═══════════════════════════════════════════════════════════════
   7. TEMPLATE / FORM DATA
   Each template has its own namespace prefix, e.g. 'df_t01_'.
   ═══════════════════════════════════════════════════════════════ */

/**
 * saveField(namespace, fieldName, value)
 * Saves a single template form field.
 *
 * @param {string} namespace  e.g. 'df_t01_'
 * @param {string} fieldName  e.g. 'date'
 * @param {string} value
 */
function saveField(namespace, fieldName, value) {
  localStorage.setItem(namespace + fieldName, value);
}

/**
 * loadField(namespace, fieldName, defaultValue)
 * Loads a single template form field.
 *
 * @param {string} namespace
 * @param {string} fieldName
 * @param {string} defaultValue  returned if nothing is stored
 * @returns {string}
 */
function loadField(namespace, fieldName, defaultValue = '') {
  return localStorage.getItem(namespace + fieldName) ?? defaultValue;
}

/**
 * saveFormToStorage(formEl, namespace)
 * Reads all named inputs/textareas/selects inside a form element
 * and saves them using namespace+name as the key.
 *
 * @param {HTMLFormElement} formEl
 * @param {string}          namespace  e.g. 'df_t01_'
 */
function saveFormToStorage(formEl, namespace) {
  if (!formEl) return;
  formEl.querySelectorAll('[name]').forEach(field => {
    localStorage.setItem(namespace + field.name, field.value);
  });
}

/**
 * loadFormFromStorage(formEl, namespace)
 * Restores all named form fields from localStorage.
 * Call this when a template page loads.
 *
 * @param {HTMLFormElement} formEl
 * @param {string}          namespace
 */
function loadFormFromStorage(formEl, namespace) {
  if (!formEl) return;
  formEl.querySelectorAll('[name]').forEach(field => {
    const stored = localStorage.getItem(namespace + field.name);
    if (stored !== null) field.value = stored;
  });
}

/**
 * clearFormNamespace(namespace)
 * Removes all keys that start with the given namespace.
 * Use when resetting a template.
 *
 * @param {string} namespace
 */
function clearFormNamespace(namespace) {
  Object.keys(localStorage)
    .filter(k => k.startsWith(namespace))
    .forEach(k => localStorage.removeItem(k));
}


/* ═══════════════════════════════════════════════════════════════
   8. APP PREFERENCES
   ═══════════════════════════════════════════════════════════════ */

/**
 * getLanguage()
 * @returns {string}  e.g. 'English'
 */
function getLanguage() {
  return localStorage.getItem(KEYS.LANGUAGE) || 'English';
}

/**
 * setLanguage(lang)
 * @param {string} lang
 */
function setLanguage(lang) {
  localStorage.setItem(KEYS.LANGUAGE, lang);
}


/* ═══════════════════════════════════════════════════════════════
   9. NUCLEAR CLEAR — LOGOUT
   ═══════════════════════════════════════════════════════════════ */

/**
 * clearAllStudentData()
 * Removes every df_ key from localStorage.
 * Called by logoutStudent() in ui.js.
 *
 * Does NOT remove keys that don't start with 'df_',
 * so any other app data (if any) is preserved.
 */
function clearAllStudentData() {
  Object.keys(localStorage)
    .filter(k => k.startsWith('df_'))
    .forEach(k => localStorage.removeItem(k));
}


/* ═══════════════════════════════════════════════════════════════
   PRIVATE HELPERS
   ═══════════════════════════════════════════════════════════════ */

/**
 * _padPhase(n)
 * Pads a phase number to 2 digits.
 * 1 → '01', 5 → '05'
 *
 * @param  {number} n
 * @returns {string}
 */
function _padPhase(n) {
  return String(n).padStart(2, '0');
}


/* ═══════════════════════════════════════════════════════════════
   EXPORTS
   (Assigned to window so all pages can access without a bundler)
   ═══════════════════════════════════════════════════════════════ */

window.DT = window.DT || {};

Object.assign(window.DT, {
  /* Constants */
  KEYS,

  /* Registration */
  isRegistered,
  markRegistered,

  /* Student profile */
  getStudentData,
  saveStudentData,
  getFirstName,
  getInitials,

  /* Phase progress */
  getPhaseProgress,
  saveQuizScore,
  markPhaseSubmitted,
  getAllPhaseProgress,
  calculateOverallProgress,
  getActivePhaseIndex,

  /* Gates */
  isGateApproved,
  approveGate,

  /* Badges */
  hasBadge,
  awardBadge,
  getBadgeSummary,
  countEarnedBadges,
  evaluateAndAwardBadges,

  /* Template forms */
  saveField,
  loadField,
  saveFormToStorage,
  loadFormFromStorage,
  clearFormNamespace,

  /* Preferences */
  getLanguage,
  setLanguage,

  /* Logout */
  clearAllStudentData,
});

}()); /* end IIFE — window.DT is now available globally */
