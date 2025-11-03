(function(){
  const track = document.querySelector('.nav-track');
  const indicator = document.querySelector('.nav-indicator');
  const buttons = Array.from(document.querySelectorAll('.nav-track .nav-btn'));
  function moveIndicator(btn){ if(!btn||!indicator||!track) return; const r1=track.getBoundingClientRect(); const r2=btn.getBoundingClientRect(); const y=r2.top-r1.top+(r2.height-indicator.offsetHeight)/2; indicator.style.transform=`translateY(${Math.max(0,y)}px)`; }
  const active=document.querySelector('.nav-btn.active')||buttons[0]; if(active) moveIndicator(active);
  buttons.forEach(b=>{ b.addEventListener('mouseenter',()=>moveIndicator(b)); b.addEventListener('focus',()=>moveIndicator(b)); b.addEventListener('click',()=>{buttons.forEach(x=>x.classList.remove('active')); b.classList.add('active'); moveIndicator(b);}); });
  window.addEventListener('resize',()=>{ moveIndicator(document.querySelector('.nav-btn.active')||buttons[0]); });
  const name=(document.body.getAttribute('data-user-name')||'Khy').trim(); const initial=name.charAt(0).toUpperCase(); const avatar=document.querySelector('.avatar'); const span=document.getElementById('userName'); if(avatar) avatar.textContent=initial; if(span) span.textContent=name||'Khy';
})();

