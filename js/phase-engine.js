/**
 * Smart DT Project V3 — js/phase-engine.js
 * ─────────────────────────────────────────────────────────────────
 * Handles everything that happens INSIDE a phase page:
 *  - Tab switching (Quick Info / Quiz / Templates)
 *  - Quiz runner (one question at a time, scoring, unlock logic)
 *  - Template form save & restore
 *  - Phase submission
 *  - Supervisor gate display
 *
 * DEPENDENCIES (load in this order, just before </body>):
 *   <script src="js/data.js"></script>
 *   <script src="js/ui.js"></script>
 *   <script src="js/phase-engine.js"></script>
 *
 * USAGE on each phase page — add one inline script after the above:
 *
 *   <script>
 *     PhaseEngine.init({
 *       phaseNum:  1,
 *       namespace: 'df_t01_',
 *       quiz:      QUIZ_DATA_P1,      // defined in this file
 *       hasGate:   false,
 *       sheetUrl:  '',                // fill in after Google Sheets is set up
 *     });
 *   </script>
 * ─────────────────────────────────────────────────────────────────
 */

'use strict';


/* ═══════════════════════════════════════════════════════════════
   QUIZ DATA
   5 questions per phase. Each option array has exactly 4 items.
   correctIndex is 0-based.
   ═══════════════════════════════════════════════════════════════ */

const QUIZ_DATA = {

  /* Phase 01 — Empathy */
  1: [
    {
      question:     'What is the MAIN goal of the Empathy phase?',
      options:      [
        'To design the final solution quickly',
        'To understand users\' real feelings, needs and experiences',
        'To test the prototype with users',
        'To select the best idea from brainstorming',
      ],
      correctIndex: 1,
    },
    {
      question:     'Should you already know the solution BEFORE interviewing users?',
      options:      [
        'Yes — it saves time during interviews',
        'Yes — the lecturer already knows the answer',
        'No — keep an open mind and let users guide you',
        'No — only if the project is technical',
      ],
      correctIndex: 2,
    },
    {
      question:     'Which is the BEST interview question for Empathy research?',
      options:      [
        'Do you like the current canteen system? Yes or No?',
        'Would you prefer option A or option B?',
        'Tell me about your experience using the canteen during peak hours.',
        'How many times do you visit the canteen per week?',
      ],
      correctIndex: 2,
    },
    {
      question:     'Is interviewing ONE person enough for the Empathy phase?',
      options:      [
        'Yes — one deep interview is sufficient',
        'No — interview at least 3 users to find patterns',
        'Yes — if the person is an expert',
        'No — you need at least 20 people',
      ],
      correctIndex: 1,
    },
    {
      question:     'Which tool maps what a user SAYS, THINKS, DOES and FEELS?',
      options:      [
        'SCAMPER sheet',
        'Idea Selection Matrix',
        'User Feedback Form',
        'Empathy Map — the 4-quadrant visual tool',
      ],
      correctIndex: 3,
    },
  ],

  /* Phase 02 — Define */
  2: [
    {
      question:     'What is the MAIN output of the Define phase?',
      options:      [
        'A working prototype',
        'A list of 20 ideas',
        'A clear user-centred problem statement based on research',
        'A final reflection on the project',
      ],
      correctIndex: 2,
    },
    {
      question:     'Should the problem statement include a solution?',
      options:      [
        'Yes — the solution helps focus the problem',
        'No — define the problem only, never the solution',
        'Yes — if the solution is obvious',
        'No — only if the supervisor agrees',
      ],
      correctIndex: 1,
    },
    {
      question:     'Which HMW (How Might We) question is correctly formatted?',
      options:      [
        'How might we build a mobile app for students?',
        'How might we fix the canteen queue problem?',
        'How might we help students eat lunch faster on campus?',
        'How might we redesign the whole canteen system?',
      ],
      correctIndex: 2,
    },
    {
      question:     'Can you skip Define if Empathy was thorough enough?',
      options:      [
        'Yes — Empathy already covers problem definition',
        'No — Empathy and Define serve different purposes',
        'Yes — if you already have a good idea',
        'No — only if the supervisor asks for it',
      ],
      correctIndex: 1,
    },
    {
      question:     'What should a good problem statement focus on?',
      options:      [
        'The technology stack to be used',
        'The budget and timeline',
        'The team member strengths',
        'The user\'s need and the insight behind it',
      ],
      correctIndex: 3,
    },
  ],

  /* Phase 03 — Ideation */
  3: [
    {
      question:     'What is the golden rule of brainstorming?',
      options:      [
        'Only write down practical ideas',
        'No judging or evaluating ideas during the session',
        'The team leader chooses the best idea immediately',
        'Always start with the most expensive idea',
      ],
      correctIndex: 1,
    },
    {
      question:     'Should you stop when you find your FIRST good idea?',
      options:      [
        'Yes — act on it immediately',
        'Yes — one great idea is enough',
        'No — push for 20+ ideas before evaluating',
        'No — only if the supervisor disagrees',
      ],
      correctIndex: 2,
    },
    {
      question:     'What does the S in SCAMPER stand for?',
      options:      [
        'Simplify — make the idea simpler',
        'Substitute — replace or swap a part of the solution',
        'Share — present the idea to the class',
        'Scale — make the idea bigger',
      ],
      correctIndex: 1,
    },
    {
      question:     'Does the Idea Selection Matrix use gut feelings to choose ideas?',
      options:      [
        'Yes — gut feeling is the most important factor',
        'Yes — if the whole team agrees',
        'No — it uses objective criteria with numerical scores',
        'No — only the supervisor can decide',
      ],
      correctIndex: 2,
    },
    {
      question:     'What is the correct order for the Ideation phase?',
      options:      [
        'Select → Brainstorm → SCAMPER → Justify',
        'SCAMPER → Brainstorm → Select → Justify',
        'Brainstorm → Select → SCAMPER → Justify',
        'Brainstorm → SCAMPER → Select → Justify',
      ],
      correctIndex: 3,
    },
  ],

  /* Phase 04 — Prototype */
  4: [
    {
      question:     'What type of prototype should students build FIRST?',
      options:      [
        'A polished high-fidelity digital prototype',
        'A working coded mobile app',
        'A low-fidelity rough sketch or paper prototype',
        'A 3D-printed physical model',
      ],
      correctIndex: 2,
    },
    {
      question:     'Must the prototype be polished before testing with users?',
      options:      [
        'Yes — users will not take rough prototypes seriously',
        'No — rough prototypes generate the most honest feedback',
        'Yes — the supervisor requires a polished version',
        'No — only if time is limited',
      ],
      correctIndex: 1,
    },
    {
      question:     'What is the MAIN purpose of building a prototype?',
      options:      [
        'To impress the supervisor with design skills',
        'To have something to present at the end of the semester',
        'To test the idea and learn from real user feedback',
        'To demonstrate technical programming ability',
      ],
      correctIndex: 2,
    },
    {
      question:     'If a prototype fails during testing, has the project failed?',
      options:      [
        'Yes — the team should restart from the beginning',
        'Yes — a failed prototype means a failed project',
        'No — failure reveals problems, which is the whole point',
        'No — only if the supervisor says so',
      ],
      correctIndex: 2,
    },
    {
      question:     'What should the Version Log record for each iteration?',
      options:      [
        'The cost and materials used',
        'What was built, feedback received, and what to improve next',
        'Only positive feedback from users',
        'The date and the team member who built it',
      ],
      correctIndex: 1,
    },
  ],

  /* Phase 05 — Test */
  5: [
    {
      question:     'Who should you select as test participants?',
      options:      [
        'Your own team members',
        'The lecturer and supervisor',
        'Real target users who match the Persona from Phase 01',
        'Anyone who is available on that day',
      ],
      correctIndex: 2,
    },
    {
      question:     'Should you explain how the prototype works BEFORE testing?',
      options:      [
        'Yes — it helps users understand what to do',
        'No — never explain first, watching them struggle IS the data',
        'Yes — it saves time during the test session',
        'No — only if the user asks for help',
      ],
      correctIndex: 1,
    },
    {
      question:     'What is the most important thing to do DURING a user test?',
      options:      [
        'Fix problems immediately as the user encounters them',
        'Take photos for the presentation slides',
        'Explain each feature to help the user succeed',
        'Observe and listen without interfering',
      ],
      correctIndex: 3,
    },
    {
      question:     'If ALL testers complete the task successfully, is testing done?',
      options:      [
        'Yes — success means the design is perfect',
        'No — also identify friction points and improvement opportunities',
        'Yes — submit the phase immediately',
        'No — you need to rebuild the prototype first',
      ],
      correctIndex: 1,
    },
    {
      question:     'What happens AFTER collecting all test feedback?',
      options:      [
        'Start coding the final product immediately',
        'Present the prototype to the class',
        'Analyse patterns, create an improvement plan, then write a final reflection',
        'Delete the prototype and start over',
      ],
      correctIndex: 2,
    },
  ],
};


/* ═══════════════════════════════════════════════════════════════
   TAB SWITCHING
   Tabs: Quick Info / Quiz / Templates
   ═══════════════════════════════════════════════════════════════ */

/**
 * initTabs(containerSelector)
 * Wires up the 3-tab bar on every phase page.
 *
 * Requires this HTML structure:
 *   <div class="tab-bar">
 *     <button class="tab-btn active" data-tab="info">Quick Info</button>
 *     <button class="tab-btn" data-tab="quiz">Quiz</button>
 *     <button class="tab-btn" data-tab="templates">Templates</button>
 *   </div>
 *   <div class="tab-panel" id="tab-info">...</div>
 *   <div class="tab-panel hidden" id="tab-quiz">...</div>
 *   <div class="tab-panel hidden" id="tab-templates">...</div>
 *
 * @param {string} containerSelector  Default: '.tab-bar'
 */
function initTabs(containerSelector = '.tab-bar') {
  const bar = document.querySelector(containerSelector);
  if (!bar) return;

  bar.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');

      /* Templates tab: blocked if quiz not passed */
      if (target === 'templates' && !_isQuizPassedForPage()) {
        UI.showToast('Pass the quiz first to unlock Templates.', 'error');
        return;
      }

      /* Update button active states */
      bar.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      /* Show matching panel, hide others */
      document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.toggle('hidden', panel.id !== `tab-${target}`);
      });
    });
  });
}

/**
 * _isQuizPassedForPage()
 * Reads the phase number from the body's data-phase attribute.
 * @returns {boolean}
 */
function _isQuizPassedForPage() {
  const phaseNum = parseInt(document.body.getAttribute('data-phase') || '0', 10);
  if (!phaseNum) return false;
  return window.DT.getPhaseProgress(phaseNum).quizPassed;
}


/* ═══════════════════════════════════════════════════════════════
   QUIZ RUNNER
   Shows one question at a time. Validates answer. Shows score.
   ═══════════════════════════════════════════════════════════════ */

let _quizState = {
  phaseNum:    0,
  questions:   [],
  current:     0,
  score:       0,
  answered:    false,
};

/**
 * initQuiz(phaseNum, containerSelector)
 * Bootstraps the quiz for a phase page.
 *
 * @param {number} phaseNum          1 to 5
 * @param {string} containerSelector Default: '#quiz-container'
 */
function initQuiz(phaseNum, containerSelector = '#quiz-container') {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  _quizState = {
    phaseNum,
    questions: QUIZ_DATA[phaseNum] || [],
    current:   0,
    score:     0,
    answered:  false,
  };

  /* If already passed, show result immediately */
  const progress = window.DT.getPhaseProgress(phaseNum);
  if (progress.quizPassed) {
    _renderQuizResult(container, progress.quizScore, true);
    return;
  }

  _renderQuestion(container);
}

/**
 * _renderQuestion(container)
 * Renders the current question card.
 */
function _renderQuestion(container) {
  const { questions, current } = _quizState;
  if (current >= questions.length) {
    _renderQuizResult(container, _quizState.score, false);
    return;
  }

  const q    = questions[current];
  const qNum = current + 1;
  const tot  = questions.length;

  container.innerHTML = `
    <div class="quiz-card" role="group" aria-labelledby="quiz-question">
      <div class="quiz-progress-text">${qNum} of ${tot}</div>
      <div class="quiz-progress-bar-wrap">
        <div class="quiz-progress-bar-fill" style="width:${(qNum / tot) * 100}%"></div>
      </div>
      <p class="quiz-question" id="quiz-question">${_esc(q.question)}</p>
      <div class="quiz-options" role="list">
        ${q.options.map((opt, i) => `
          <button class="quiz-option" data-index="${i}" role="listitem"
                  aria-label="Option ${i + 1}: ${opt}">
            <span class="quiz-option-letter">${String.fromCharCode(65 + i)}</span>
            <span class="quiz-option-text">${_esc(opt)}</span>
          </button>`).join('')}
      </div>
    </div>`;

  /* Wire up option buttons */
  container.querySelectorAll('.quiz-option').forEach(btn => {
    btn.addEventListener('click', () => _selectAnswer(btn, container));
  });
}

/**
 * _selectAnswer(btn, container)
 * Handles answer selection. Shows correct/wrong. Advances.
 */
function _selectAnswer(btn, container) {
  if (_quizState.answered) return;
  _quizState.answered = true;

  const selected  = parseInt(btn.getAttribute('data-index'), 10);
  const correct   = _quizState.questions[_quizState.current].correctIndex;
  const isCorrect = selected === correct;

  if (isCorrect) _quizState.score++;

  /* Highlight correct and wrong */
  container.querySelectorAll('.quiz-option').forEach((b, i) => {
    b.disabled = true;
    if (i === correct) {
      b.classList.add('correct');
      b.setAttribute('aria-label', b.getAttribute('aria-label') + ' — Correct');
    }
    if (i === selected && !isCorrect) {
      b.classList.add('wrong');
      b.setAttribute('aria-label', b.getAttribute('aria-label') + ' — Wrong');
    }
  });

  /* Add Next button after a short delay */
  setTimeout(() => {
    const next       = document.createElement('button');
    next.className   = 'btn-primary quiz-next-btn';
    next.textContent = _quizState.current < _quizState.questions.length - 1
      ? 'Next Question →'
      : 'See My Score →';
    next.addEventListener('click', () => {
      _quizState.current++;
      _quizState.answered = false;
      _renderQuestion(container);
    });
    container.querySelector('.quiz-card')?.appendChild(next);
  }, 600);
}

/**
 * _renderQuizResult(container, score, alreadyPassed)
 * Shows the score card after all questions are answered.
 */
function _renderQuizResult(container, score, alreadyPassed) {
  const { phaseNum } = _quizState;
  const passed       = score >= 3;
  const pct          = Math.round((score / 5) * 100);

  if (!alreadyPassed) {
    window.DT.saveQuizScore(phaseNum, score);
  }

  const passClass = passed ? 'result--pass' : 'result--fail';
  const icon      = passed ? '🎉' : '😔';
  const headline  = passed ? 'Well done! You passed!' : 'Not quite — try again!';
  const subtext   = passed
    ? 'Templates are now unlocked. Tap the Templates tab to continue.'
    : 'You need at least 3 out of 5 to unlock Templates. Try again!';

  container.innerHTML = `
    <div class="quiz-result ${passClass}" role="status" aria-live="polite">
      <div class="quiz-result-icon" aria-hidden="true">${icon}</div>
      <h2 class="quiz-result-score">${score} / 5</h2>
      <p class="quiz-result-pct">${pct}%</p>
      <p class="quiz-result-headline">${headline}</p>
      <p class="quiz-result-sub">${subtext}</p>
      ${passed
        ? `<button class="btn-primary" onclick="PhaseEngine.switchToTemplates()">
             Go to Templates →
           </button>`
        : `<button class="btn-primary" onclick="PhaseEngine.retryQuiz()">
             Try Again
           </button>`
      }
    </div>`;

  /* Unlock tab visually if passed */
  if (passed) _unlockTemplatesTab();
}

/**
 * switchToTemplates()
 * Switches the active tab to Templates.
 * Called by the result card button.
 */
function switchToTemplates() {
  document.querySelector('.tab-btn[data-tab="templates"]')?.click();
}

/**
 * retryQuiz()
 * Resets the quiz and starts from Q1.
 */
function retryQuiz() {
  const phaseNum = _quizState.phaseNum;
  const container = document.querySelector('#quiz-container');
  if (!container) return;

  _quizState = {
    phaseNum,
    questions: QUIZ_DATA[phaseNum] || [],
    current:   0,
    score:     0,
    answered:  false,
  };
  _renderQuestion(container);
}

/**
 * _unlockTemplatesTab()
 * Removes the locked visual state from the Templates tab button.
 */
function _unlockTemplatesTab() {
  const btn = document.querySelector('.tab-btn[data-tab="templates"]');
  if (btn) {
    btn.classList.remove('locked');
    btn.removeAttribute('disabled');
  }
}


/* ═══════════════════════════════════════════════════════════════
   TEMPLATE FORM — SAVE & RESTORE
   ═══════════════════════════════════════════════════════════════ */

/**
 * initTemplateForm(formSelector, namespace)
 * Restores saved data into a template form on page load,
 * then sets up auto-save on every input change.
 *
 * @param {string} formSelector  e.g. '#t01-form'
 * @param {string} namespace     e.g. 'df_t01_'
 */
function initTemplateForm(formSelector, namespace) {
  const form = document.querySelector(formSelector);
  if (!form) return;

  /* Restore saved values */
  window.DT.loadFormFromStorage(form, namespace);

  /* Auto-save on input (debounced) */
  const save = UI.debounce(() => {
    window.DT.saveFormToStorage(form, namespace);
  }, 500);

  form.querySelectorAll('input, textarea, select').forEach(field => {
    field.addEventListener('input', save);
    field.addEventListener('change', save);
  });
}

/**
 * saveTemplateForm(formSelector, namespace)
 * Manual save — called by the 'Save Progress' button.
 *
 * @param {string} formSelector
 * @param {string} namespace
 */
function saveTemplateForm(formSelector, namespace) {
  const form = document.querySelector(formSelector);
  if (!form) return;
  window.DT.saveFormToStorage(form, namespace);
  UI.showToast('Progress saved!', 'success');
}


/* ═══════════════════════════════════════════════════════════════
   SUPERVISOR GATE
   Renders and manages the gate card on Define, Ideation, Test.
   ═══════════════════════════════════════════════════════════════ */

/**
 * initGateCard(containerSelector, gateNum, phaseNum, sheetUrl)
 * Renders the Supervisor Gate card.
 *
 * @param {string} containerSelector  e.g. '#gate-container'
 * @param {number} gateNum            1, 2, or 3
 * @param {number} phaseNum           2, 3, or 5
 * @param {string} sheetUrl           Google Apps Script URL
 */
function initGateCard(containerSelector, gateNum, phaseNum, sheetUrl = '') {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const approved = window.DT.isGateApproved(gateNum);
  _renderGateCard(container, gateNum, phaseNum, approved, sheetUrl);
}

function _renderGateCard(container, gateNum, phaseNum, approved, sheetUrl) {
  const stateClass = approved ? 'gate--approved' : 'gate--locked';
  const stateText  = approved ? '✓ Approved by Supervisor' : '⏳ Awaiting Supervisor Approval';
  const btnHTML    = approved
    ? ''
    : `<button class="btn-primary" onclick="PhaseEngine.submitGate(${gateNum}, ${phaseNum}, '${sheetUrl}')">
         Submit for Supervisor Approval →
       </button>`;

  container.innerHTML = `
    <div class="gate-card ${stateClass}" role="region"
         aria-label="Supervisor Gate ${gateNum}">
      <div class="gate-icon" aria-hidden="true">${approved ? '🔓' : '🔒'}</div>
      <h3 class="gate-title">Supervisor Gate ${gateNum}</h3>
      <p class="gate-status">${stateText}</p>
      ${!approved ? `
        <div class="gate-checklist">
          <p class="gate-checklist-title">Before submitting, confirm:</p>
          <label class="gate-check-item">
            <input type="checkbox"> All templates for this phase are complete
          </label>
          <label class="gate-check-item">
            <input type="checkbox"> I have reviewed my work with my team
          </label>
          <label class="gate-check-item">
            <input type="checkbox"> I am ready for supervisor review
          </label>
        </div>` : ''}
      ${btnHTML}
    </div>`;
}

/**
 * submitGate(gateNum, phaseNum, sheetUrl)
 * Validates checklist and submits gate approval request.
 *
 * @param {number} gateNum
 * @param {number} phaseNum
 * @param {string} sheetUrl
 */
async function submitGate(gateNum, phaseNum, sheetUrl) {
  /* All checkboxes must be ticked */
  const container  = document.querySelector('#gate-container');
  const checkboxes = container?.querySelectorAll('.gate-check-item input[type="checkbox"]') || [];
  const allChecked = [...checkboxes].every(cb => cb.checked);

  if (!allChecked) {
    UI.showToast('Please tick all items in the checklist before submitting.', 'error');
    return;
  }

  UI.showToast('Submitting…', '', 1500);

  try {
    if (sheetUrl) {
      await UI.submitToSheets(sheetUrl, {
        phase:   `Phase${String(phaseNum).padStart(2, '0')}`,
        gate:    `Gate${gateNum}`,
        action:  'Gate Submission',
        status:  'Pending Supervisor Approval',
      });
    }
    UI.showToast(`Gate ${gateNum} submitted! Awaiting supervisor approval.`, 'success', 4000);
  } catch {
    UI.showToast('Submission failed. Please try again.', 'error');
  }
}


/* ═══════════════════════════════════════════════════════════════
   PHASE SUBMISSION
   ═══════════════════════════════════════════════════════════════ */

/**
 * submitPhase(phaseNum, sheetUrl, formNamespaces)
 * Validates, submits to Google Sheets, marks phase done,
 * awards badges, shows success, returns to dashboard.
 *
 * @param {number}   phaseNum       1 to 5
 * @param {string}   sheetUrl       Google Apps Script URL
 * @param {string[]} formNamespaces Array of namespace prefixes to collect e.g. ['df_t01_','df_t02_']
 */
async function submitPhase(phaseNum, sheetUrl = '', formNamespaces = []) {
  /* Must have passed the quiz */
  if (!window.DT.getPhaseProgress(phaseNum).quizPassed) {
    UI.showToast('Pass the quiz before submitting this phase.', 'error');
    return;
  }

  UI.showToast('Submitting phase…', '', 2000);

  /* Collect all template data from localStorage */
  const templateData = {};
  formNamespaces.forEach(ns => {
    Object.keys(localStorage)
      .filter(k => k.startsWith(ns))
      .forEach(k => { templateData[k] = localStorage.getItem(k); });
  });

  try {
    if (sheetUrl) {
      await UI.submitToSheets(sheetUrl, {
        phase:  `Phase${String(phaseNum).padStart(2, '0')}`,
        action: 'Phase Submission',
        ...templateData,
      });
    }

    window.DT.markPhaseSubmitted(phaseNum);
    window.DT.evaluateAndAwardBadges();

    UI.showToast('Phase submitted successfully! 🎉', 'success', 3500);

    /* Return to dashboard after a short delay */
    setTimeout(() => UI.navigateTo('dashboard.html'), 2000);

  } catch {
    UI.showToast('Submission failed. Please check your connection and try again.', 'error');
  }
}


/* ═══════════════════════════════════════════════════════════════
   MASTER INIT
   Called by the inline script on each phase page.
   ═══════════════════════════════════════════════════════════════ */

/**
 * init(config)
 * Bootstraps the entire phase page.
 *
 * @param {Object} config
 * @param {number}   config.phaseNum   1 to 5 — REQUIRED
 * @param {string}   config.namespace  Template namespace e.g. 'df_t01_'
 * @param {boolean}  [config.hasGate]  Whether this phase has a supervisor gate
 * @param {number}   [config.gateNum]  Which gate number (1, 2, or 3)
 * @param {string}   [config.sheetUrl] Google Apps Script URL
 */
function init(config) {
  const { phaseNum, namespace, hasGate, gateNum, sheetUrl } = config;

  document.addEventListener('DOMContentLoaded', () => {
    /* Guard — redirect if not registered */
    UI.checkRegistration();

    /* Set phase number on body for _isQuizPassedForPage() */
    document.body.setAttribute('data-phase', String(phaseNum));

    /* Carousel on the Quick Info slide card */
    UI.initCarousel();

    /* Tab bar */
    initTabs();

    /* Lock Templates tab if quiz not yet passed */
    if (!window.DT.getPhaseProgress(phaseNum).quizPassed) {
      const templatesBtn = document.querySelector('.tab-btn[data-tab="templates"]');
      if (templatesBtn) {
        templatesBtn.classList.add('locked');
      }
    }

    /* Quiz */
    initQuiz(phaseNum);

    /* Template form */
    if (namespace) {
      initTemplateForm('#template-form', namespace);
    }

    /* Supervisor gate */
    if (hasGate && gateNum) {
      initGateCard('#gate-container', gateNum, phaseNum, sheetUrl || '');
    }

    /* AI Coach — disabled until M10 milestone */
    /* UI.initAICoach(phaseNum); */
  });
}


/* ═══════════════════════════════════════════════════════════════
   PRIVATE HELPERS
   ═══════════════════════════════════════════════════════════════ */

function _esc(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}


/* ═══════════════════════════════════════════════════════════════
   EXPORTS
   ═══════════════════════════════════════════════════════════════ */

window.PhaseEngine = {
  /* Master init */
  init,

  /* Tabs */
  initTabs,

  /* Quiz */
  initQuiz,
  retryQuiz,
  switchToTemplates,

  /* Templates */
  initTemplateForm,
  saveTemplateForm,

  /* Gate */
  initGateCard,
  submitGate,

  /* Phase submit */
  submitPhase,

  /* Quiz data (exposed for testing) */
  QUIZ_DATA,
};
