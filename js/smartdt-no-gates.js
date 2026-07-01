/* Smart DT V4 no-supervisor gate patch. Loaded before smartdt.js. */
(function(){
  'use strict';
  const routes={01:'phase01-empathy.html',02:'phase02-define.html',03:'phase03-ideation.html',04:'phase04-prototype.html',05:'phase05-test.html',portfolio:'portfolio-completion.html'};
  function approve(){try{['1','2','3'].forEach(n=>localStorage.setItem('df_gate_'+n,'approved'));['01','02','03','04','05'].forEach(ph=>localStorage.setItem('df_unlocked_phase'+ph,'true'));}catch(e){}}
  function current(){try{for(let i=1;i<=5;i++){let ph=String(i).padStart(2,'0');if(localStorage.getItem('df_submitted_phase'+ph)!=='true')return ph;}}catch(e){}return '05';}
  function clean(){
    approve();
    const lock=document.getElementById('gateLockScreen'); if(lock) lock.remove();
    const main=document.querySelector('main'); if(main) main.style.display='';
    const gate=document.getElementById('gateList'); if(gate){const sec=gate.closest('section'); if(sec) sec.remove(); else gate.remove();}
    document.querySelectorAll('body *').forEach(el=>{if(el.children.length||!el.textContent)return;el.textContent=el.textContent
      .replace(/Supervisor Gates/gi,'')
      .replace(/Supervisor Feedback/gi,'Submission Status')
      .replace(/Gate approval and comments/gi,'Draft · Submitted · Updated')
      .replace(/sent to your supervisor/gi,'saved as final submission')
      .replace(/Your supervisor will review your work and approve[^.]*\./gi,'Your final submission has been saved.')
      .replace(/Gate 1|Gate 2|Gate 3/gi,'Submitted')
      .replace(/supervisor gates and /gi,'');});
  }
  function patchButtons(){
    document.querySelectorAll('[data-continue],#continuePhaseBtn').forEach(btn=>{if(btn.dataset.noGatePatched)return;btn.dataset.noGatePatched='1';btn.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();location.href=routes[current()]||routes['01'];},true);});
    document.querySelectorAll('[data-submit-phase]').forEach(btn=>{if(btn.dataset.noGateSubmit)return;btn.dataset.noGateSubmit='1';btn.addEventListener('click',()=>setTimeout(clean,80),true);});
  }
  function boot(){approve();clean();patchButtons();new MutationObserver(()=>{clean();patchButtons();}).observe(document.body,{childList:true,subtree:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
