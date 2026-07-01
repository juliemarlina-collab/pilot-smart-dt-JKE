(function(){
  const $=(s,r=document)=>r.querySelector(s); const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const KEY='smartdt_emp_phase01_';
  const questions=[
    {q:'What is the main purpose of the Empathy phase?',a:0,o:['To understand users and their real needs','To immediately build the final product','To choose colours and app icons','To present the final pitch']},
    {q:'Which action best shows empathy during an interview?',a:1,o:['Giving solutions quickly','Listening actively and asking follow-up questions','Interrupting users to save time','Asking only yes/no questions']},
    {q:'What should students record after an interview?',a:2,o:['Only the user name','Only the final solution','Quotes, repeated problems and surprising findings','The lecturer’s comments only']},
    {q:'An empathy map usually helps students organise...',a:0,o:['What users say, think, do and feel','App colours and logo choices','Budget and purchasing records','Final presentation slides']},
    {q:'Why should we understand users before designing?',a:3,o:['So the project looks more expensive','So we can skip testing','So students can avoid teamwork','So the solution is based on real needs']}
  ];
  let current=0, answers=Array(questions.length).fill(null);

  function showPanel(name){$$('.panel').forEach(p=>p.classList.toggle('active',p.dataset.panel===name));$$('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===name)); if(name==='quiz') renderQuiz();}
  function renderQuiz(){const box=$('#quizMount'); if(!box)return; const item=questions[current]; box.innerHTML=`<div class="quiz-card"><div class="quiz-head"><div><h2>Quick Check</h2><p>Answer 5 questions to unlock Empathy Templates.</p></div><div class="quiz-pill">${current+1} / ${questions.length}</div></div><div class="question">${item.q}</div><div class="options">${item.o.map((x,i)=>`<button type="button" class="option ${answers[current]===i?'selected':''}" data-answer="${i}">${String.fromCharCode(65+i)}. ${x}</button>`).join('')}</div><div class="quiz-nav"><button type="button" class="small-btn" data-prev ${current===0?'disabled':''}>Back</button><button type="button" class="small-btn dark" data-next>${current===questions.length-1?'Finish':'Next →'}</button></div></div>`;}
  function finishQuiz(){let score=answers.reduce((s,a,i)=>s+(a===questions[i].a?1:0),0); localStorage.setItem(KEY+'quiz_score',score); localStorage.setItem(KEY+'quiz_done',score>=3?'yes':'no'); const box=$('#quizMount'); box.innerHTML=`<div class="quiz-card result"><h2>${score>=3?'Templates Unlocked 🎉':'Try Again'}</h2><p>You scored ${score}/5. ${score>=3?'You may now continue to the Empathy Templates.':'Review the overview and attempt the quiz again.'}</p>${score>=3?'<a class="primary-btn" href="phase01-templates.html">Go to Templates →</a>':'<button class="primary-btn" type="button" data-retry>Retry Quiz</button>'}</div>`;}
  document.addEventListener('click',e=>{
    const t=e.target.closest('[data-tab]'); if(t){ e.preventDefault(); if(t.dataset.tab==='templates') location.href='phase01-templates.html'; else showPanel(t.dataset.tab); }
    const start=e.target.closest('[data-start-quiz]'); if(start){e.preventDefault();showPanel('quiz'); window.scrollTo({top:260,behavior:'smooth'});}
    const opt=e.target.closest('[data-answer]'); if(opt){answers[current]=Number(opt.dataset.answer); renderQuiz();}
    if(e.target.closest('[data-prev]')){if(current>0){current--;renderQuiz();}}
    if(e.target.closest('[data-next]')){if(answers[current]===null){alert('Please choose an answer first.');return;} if(current<questions.length-1){current++;renderQuiz();} else finishQuiz();}
    if(e.target.closest('[data-retry]')){current=0;answers=Array(questions.length).fill(null);renderQuiz();}
    const tt=e.target.closest('[data-template-tab]'); if(tt){const name=tt.dataset.templateTab; $$('.template-tab').forEach(b=>b.classList.toggle('active',b.dataset.templateTab===name)); $$('.template-panel').forEach(p=>p.classList.toggle('active',p.dataset.templatePanel===name));}
  });
  function autosave(){ $$('[data-save]').forEach(el=>{ const id=KEY+el.name; el.value=localStorage.getItem(id)||''; el.addEventListener('input',()=>localStorage.setItem(id,el.value)); }); }
  document.addEventListener('DOMContentLoaded',()=>{autosave(); renderQuiz();});
})();
