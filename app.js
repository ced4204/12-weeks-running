/* ============ APEX RUN — app logic ============ */
const ZN = PROGRAM.ZONES;
const STORE = 'apexrun.progress.v1';
let progress = load();

function load(){ try{return JSON.parse(localStorage.getItem(STORE))||{};}catch(e){return {};} }
function save(){ localStorage.setItem(STORE, JSON.stringify(progress)); }
function key(w,kind){ return `w${w}_${kind}`; }
function isDone(w,kind){ return !!progress[key(w,kind)]; }
function setDone(w,kind,v){ progress[key(w,kind)]=v; save(); render(); }
/* référence de séance : "<semaine>-<iv|ef>" ou "t-<id>" (affûtage) */
function refKey(ref){ const[a,b]=ref.split('-'); return a==='t'?`t_${b}`:key(+a,b); }
function isDoneRef(ref){ return !!progress[refKey(ref)]; }
function setDoneRef(ref,v){ progress[refKey(ref)]=v; save(); render(); }
function getSess(ref){ const[a,b]=ref.split('-'); return a==='t'?PROGRAM.taper.sessions.find(s=>s.id===b):PROGRAM.weeks[+a-1][b]; }
const TOTAL_SESS=PROGRAM.weeks.length*2+PROGRAM.taper.sessions.length;

function fmt(sec){ const m=Math.floor(sec/60), s=Math.round(sec%60); return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; }
function totalDur(steps){ return steps.reduce((a,s)=>a+s.dur,0); }
function totalLabel(steps){ const t=totalDur(steps); const m=Math.round(t/60); return `${m} min`; }

/* ---- classification des segments ----
   role marche : 'warmup' (1er segment) | 'cooldown' (dernier segment) | 'recovery'
   isLastRun : true pour le dernier segment de course de la séance */
function firstWalkIdx(steps){ return steps.findIndex(s=>s.type==='walk'); }
function lastWalkIdx(steps){ for(let i=steps.length-1;i>=0;i--) if(steps[i].type==='walk') return i; return -1; }
function lastRunIdx(steps){ for(let i=steps.length-1;i>=0;i--) if(steps[i].type==='run') return i; return -1; }
function walkRole(steps,i){
  if(i===firstWalkIdx(steps)) return 'warmup';
  if(i===lastWalkIdx(steps) && lastWalkIdx(steps)!==firstWalkIdx(steps)) return 'cooldown';
  return 'recovery';
}
const WALK_LABEL={warmup:{ln1:'Marche rapide',ln2:'Échauffement'},cooldown:{ln1:'Marche',ln2:'Retour au calme'},recovery:{ln1:'Marche',ln2:'Récupération active'}};

/* ---------- RENDER ---------- */
function render(){
  const app=document.getElementById('app');
  const allKinds=[]; PROGRAM.weeks.forEach(w=>{allKinds.push(isDone(w.w,'iv'),isDone(w.w,'ef'));});
  PROGRAM.taper.sessions.forEach(t=>allKinds.push(isDoneRef('t-'+t.id)));
  const done=allKinds.filter(Boolean).length;
  document.getElementById('pfill').style.width=(done/TOTAL_SESS*100)+'%';
  document.getElementById('pdone').textContent=done;
  document.getElementById('ptotal').textContent=TOTAL_SESS;

  // current week = first week with an incomplete session ; ensuite l'affûtage
  let cur=PROGRAM.weeks.find(w=>!isDone(w.w,'iv')||!isDone(w.w,'ef'));
  const curTaper=cur?null:(PROGRAM.taper.sessions.find(t=>!isDoneRef('t-'+t.id))||PROGRAM.taper.sessions[PROGRAM.taper.sessions.length-1]);
  document.getElementById('pweek').textContent=cur
    ?`Semaine ${cur.w} · Bloc ${cur.block+1}`
    :`Affûtage · ${curTaper.tag}`;

  let html='';
  PROGRAM.blocks.forEach((b,bi)=>{
    html+=`<section class="block">
      <div class="block-head">
        <div class="block-no cond">${b.no}</div>
        <div><div class="t">${b.title}</div><div class="w">${b.weeks}</div><div class="f">${b.focus}</div></div>
      </div>`;
    PROGRAM.weeks.filter(w=>w.block===bi).forEach(w=>{
      const ivc=isDone(w.w,'iv'), efc=isDone(w.w,'ef');
      const wdone=ivc&&efc, open=(cur&&w.w===cur.w);
      html+=`<div class="week ${wdone?'done':''} ${open?'open':''}" data-week="${w.w}">
        <div class="week-top" data-toggle="${w.w}">
          <div class="wno cond">S${String(w.w).padStart(2,'0')}</div>
          <div class="wbars">
            <div class="session-chip ${ivc?'c':''}"><span class="ic" style="background:var(--amber)"></span><span class="lbl">${ivc?'✓ ':''}Intervalles</span></div>
            <div class="session-chip ${efc?'c':''}"><span class="ic" style="background:var(--walk)"></span><span class="lbl">${efc?'✓ ':''}Endurance</span></div>
          </div>
          <svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div class="week-body">
          ${sessionHTML(w.iv,`${w.w}-iv`,ivc)}
          ${sessionHTML(w.ef,`${w.w}-ef`,efc)}
        </div>
      </div>`;
    });
    html+=`</section>`;
  });
  html+=taperHTML(curTaper);
  app.innerHTML=html;

  // open current week body
  document.querySelectorAll('.week.open .week-body').forEach(b=>b.style.maxHeight=b.scrollHeight+'px');

  // events
  document.querySelectorAll('[data-toggle]').forEach(el=>el.onclick=()=>{
    const wk=el.closest('.week'); const body=wk.querySelector('.week-body');
    const isOpen=wk.classList.toggle('open');
    body.style.maxHeight=isOpen?body.scrollHeight+'px':'0';
  });
  document.querySelectorAll('[data-go]').forEach(el=>el.onclick=(e)=>{
    e.stopPropagation(); openPlayer(el.dataset.go);
  });
  document.querySelectorAll('[data-done]').forEach(el=>el.onclick=(e)=>{
    e.stopPropagation(); const ref=el.dataset.done; setDoneRef(ref,!isDoneRef(ref));
  });
}

const TAG_LABEL={iv:'INTERVALLES',ef:'ENDURANCE',race:'COURSE'};
function sessionHTML(s,ref,done){
  const kind=s.kind; const tag=kind;
  let steps='';
  s.steps.forEach((st,i)=>{
    const isRun=st.type==='run'; const z=isRun?ZN[st.z]:ZN.walk;
    const wl=isRun?null:WALK_LABEL[walkRole(s.steps,i)];
    const zp=isRun?`<span class="zpill" style="background:${z.col}22;color:${z.col}">${z.lbl}</span>`:'';
    const ln1=st.ln1||(isRun?'Course':wl.ln1);
    const ln2=isRun?(st.ln2?`${st.ln2} ${zp}`:zp):(st.ln2||wl.ln2);
    steps+=`<div class="step">
      <div class="bar" style="background:${z.col}"></div>
      <div class="body">
        <div class="ln1">${ln1}</div>
        <div class="ln2">${ln2}</div>
      </div>
      <div class="dur mono">${fmt(st.dur)}</div>
    </div>`;
  });
  return `<div class="sess">
    <div class="sess-head">
      <div class="sess-name"><span class="day">${s.day}</span> ${s.name}
        <span class="tag ${tag}">${TAG_LABEL[kind]}</span></div>
      <div class="dur mono" style="font-size:12px;color:var(--mut)">${totalLabel(s.steps)}</div>
    </div>
    <div style="font-size:11.5px;color:var(--mut);margin:-4px 0 11px;line-height:1.4">${s.label}</div>
    <div class="steps">${steps}</div>
    ${s.note?`<div class="sess-note">${s.note}</div>`:''}
    ${s.plan?planHTML(s.plan):''}
    ${s.objective?`<div class="sess-obj"><b>Objectif</b> · ${s.objective}</div>`:''}
    <div class="sess-actions">
      <button class="btn btn-go" data-go="${ref}">▶ ${kind==='race'?"Lancer l'échauffement":'Lancer la séance'}</button>
      <button class="btn btn-done ${done?'is':''}" data-done="${ref}">${done?'✓ Terminée':'Marquer faite'}</button>
    </div>
  </div>`;
}

/* stratégie de course (négative split) — affichage uniquement */
function planHTML(plan){
  return `<div class="plan"><div class="plan-t">Stratégie de course · négative split</div>`+
    plan.map(p=>{const z=ZN[p.z]; return `<div class="step">
      <div class="bar" style="background:${z.col}"></div>
      <div class="body"><div class="ln1">${p.km} <span class="zpill" style="background:${z.col}22;color:${z.col}">${z.lbl} BPM</span></div>
      <div class="ln2">${p.txt}</div></div></div>`;}).join('')+`</div>`;
}

/* bloc 04 — affûtage : une carte repliable par séance */
function taperHTML(curTaper){
  const T=PROGRAM.taper;
  let h=`<section class="block">
    <div class="block-head">
      <div class="block-no cond">${T.no}</div>
      <div><div class="t">${T.title}</div><div class="w">${T.weeks}</div><div class="f">${T.focus}</div></div>
    </div>`;
  T.sessions.forEach(t=>{
    const ref='t-'+t.id, d=isDoneRef(ref), open=(curTaper&&curTaper.id===t.id);
    const col=t.kind==='iv'?'var(--amber)':t.kind==='ef'?'var(--walk)':'var(--z4)';
    h+=`<div class="week ${d?'done':''} ${open?'open':''}">
      <div class="week-top" data-toggle="${ref}">
        <div class="wno cond" style="width:auto;min-width:44px">${t.tag}</div>
        <div class="wbars">
          <div class="session-chip ${d?'c':''}"><span class="ic" style="background:${col}"></span><span class="lbl">${d?'✓ ':''}${t.day} · ${t.name}</span></div>
        </div>
        <svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <div class="week-body">${sessionHTML(t,ref,d)}</div>
    </div>`;
  });
  return h+`</section>`;
}

/* ============ PLAYER ============ */
let P={ref:'',steps:[],idx:0,remain:0,running:false,timer:null,notifTimer:null};

function openPlayer(ref){
  const s=getSess(ref);
  P={ref,steps:s.steps,idx:0,remain:s.steps[0].dur,running:false,timer:null,notifTimer:null};
  const head=s.tag?`AFFÛTAGE · ${s.tag}`:`SEMAINE ${ref.split('-')[0]} · ${TAG_LABEL[s.kind]}`;
  document.getElementById('plTitle').innerHTML=`${head}<small>${s.tag?s.name:s.label}</small>`;
  buildSegTrack();
  paintPhase(); updatePlay();
  document.getElementById('plTotal').innerHTML=`Durée totale <b>${totalLabel(s.steps)}</b> · ${s.steps.length} segments`;
  document.getElementById('player').classList.add('on');
  if('wakeLock' in navigator){requestWake();}
  if('Notification' in window && Notification.permission==='default') Notification.requestPermission();
}
function closePlayer(){
  stopTick(); releaseWake();
  document.getElementById('player').classList.remove('on');
}

let wakeLock=null;
async function requestWake(){try{wakeLock=await navigator.wakeLock.request('screen');}catch(e){}}
function releaseWake(){try{wakeLock&&wakeLock.release();wakeLock=null;}catch(e){}}

const CIRC=2*Math.PI*120;
function buildSegTrack(){
  const t=document.getElementById('segTrack'); t.innerHTML='';
  P.steps.forEach(st=>{const i=document.createElement('i');
    i.style.background=st.type==='run'?'var(--panel2)':'var(--panel2)';
    i.dataset.run=st.type==='run'; t.appendChild(i);});
}
function paintSegTrack(){
  [...document.getElementById('segTrack').children].forEach((i,n)=>{
    const st=P.steps[n];
    if(n<P.idx) i.style.background=st.type==='run'?'var(--amber)':'var(--walk)';
    else if(n===P.idx) i.style.background=st.type==='run'?'var(--amber)':'var(--walk)';
    else i.style.background='var(--panel2)';
    i.style.opacity=n===P.idx?'1':(n<P.idx?'.55':'1');
  });
}

function paintPhase(){
  const st=P.steps[P.idx]; const isRun=st.type==='run';
  const z=isRun?ZN[st.z]:ZN.walk; const col=isRun?'var(--amber)':'var(--walk)';
  const role=isRun?null:walkRole(P.steps,P.idx);
  const phaseTxt=st.ph||(isRun?'COURSE':(role==='warmup'?'ÉCHAUFFEMENT':role==='cooldown'?'RETOUR AU CALME':'MARCHE'));
  document.getElementById('phaseLbl').textContent=phaseTxt;
  document.getElementById('phaseLbl').style.color=col;
  document.getElementById('bigtime').textContent=fmt(P.remain);
  document.getElementById('ring').style.stroke=col;
  const zl=document.getElementById('zline');
  if(isRun){zl.innerHTML=`<span style="width:9px;height:9px;border-radius:99px;background:${z.col};display:inline-block"></span> Cible <b>${z.lbl}${/\d/.test(z.lbl)?' BPM':''}</b>`;zl.style.color=z.col;}
  else{const sub=st.ln1||(role==='warmup'?'Marche rapide':role==='cooldown'?'Retour au calme':'Récupération active');zl.innerHTML=sub;zl.style.color='var(--mut)';}
  // up next
  const nx=P.steps[P.idx+1];
  document.getElementById('upnext').innerHTML=nx
    ? `À suivre · <b>${nx.ln1||(nx.type==='run'?'Course '+(ZN[nx.z].lbl.split(' ·')[0]):'Marche')}</b> · ${fmt(nx.dur)}`
    : `Dernier segment · termine fort 🔥`;
  document.getElementById('phaseSub').textContent=`Segment ${P.idx+1} / ${P.steps.length}`;
  ring();
  paintSegTrack();
}
function ring(){
  const st=P.steps[P.idx];
  const frac=P.remain/st.dur;
  document.getElementById('ring').style.strokeDashoffset=CIRC*(1-frac);
}

function startTick(){
  P.running=true; updatePlay();
  startAudioKeepalive();
  scheduleSegNotif();
  let last=Date.now();
  P.timer=setInterval(()=>{
    const now=Date.now(); const dt=(now-last)/1000; last=now;
    P.remain-=dt;
    if(P.remain<=0){
      // fast-forward through all segments elapsed during background suspension
      let advanced=false;
      while(P.remain<=0){
        if(P.idx>=P.steps.length-1){ finishSession(); return; }
        P.idx++; P.remain+=P.steps[P.idx].dur; P._lastBeep=null; advanced=true;
      }
      if(advanced){
        const st=P.steps[P.idx]; const isRun=st.type==='run';
        segmentCue(isRun, P.idx===lastRunIdx(P.steps), !isRun&&walkRole(P.steps,P.idx)==='cooldown');
        paintPhase(); scheduleSegNotif();
      }
      return;
    }
    document.getElementById('bigtime').textContent=fmt(Math.ceil(P.remain)); ring();
    // 3-2-1 beep
    const r=Math.ceil(P.remain);
    if(P.remain>0 && r<=3 && r!==P._lastBeep){ P._lastBeep=r; beep(660,90,.5); }
  },120);
}
function stopTick(){
  P.running=false; clearInterval(P.timer);
  clearTimeout(P.notifTimer); P.notifTimer=null;
  stopAudioKeepalive(); updatePlay();
}

function nextSeg(auto){
  if(P.idx>=P.steps.length-1){ finishSession(); return; }
  P.idx++; P.remain=P.steps[P.idx].dur; P._lastBeep=null;
  const st=P.steps[P.idx];
  const isRun=st.type==='run';
  const isLastRun=(P.idx===lastRunIdx(P.steps));
  const isCooldown=(!isRun && walkRole(P.steps,P.idx)==='cooldown');
  if(auto) segmentCue(isRun,isLastRun,isCooldown);
  paintPhase();
  if(P.running) scheduleSegNotif();
}
/* signal de début de segment.
   - double bip neutre de transition, teinté course (aigu) / marche (grave)
   - (A) dernier segment de course : mélodie descendante + vibration marquée
   - (B) début du retour au calme : mélodie ascendante + vibration */
function segmentCue(isRun,isLastRun,isCooldown){
  if(isLastRun){ chimeLastEffort(); vibrate([200,90,200,90,200]); return; }
  if(isCooldown){ chimeCooldown(); vibrate([300,120,300]); return; }
  // bip de début standard : deux notes rapprochées, hauteur selon l'effort
  if(isRun){ beep(880,140,.6); setTimeout(()=>beep(1100,180,.7),150); vibrate([120,60,120]); }
  else { beep(523,150,.55); setTimeout(()=>beep(440,220,.55),160); vibrate([200]); }
}
function prevSeg(){ if(P.idx>0){P.idx--; P.remain=P.steps[P.idx].dur; P._lastBeep=null; paintPhase();} }

function finishSession(){
  clearTimeout(P.notifTimer); P.notifTimer=null;
  stopAudioKeepalive();
  stopTick();
  document.getElementById('phaseLbl').textContent='TERMINÉ';
  document.getElementById('phaseLbl').style.color='var(--ok)';
  document.getElementById('bigtime').textContent='✓';
  document.getElementById('phaseSub').textContent='Séance complétée';
  document.getElementById('zline').innerHTML='Bien joué 💪';
  document.getElementById('ring').style.stroke='var(--ok)';
  document.getElementById('ring').style.strokeDashoffset=0;
  document.getElementById('upnext').innerHTML='';
  beep(880,150,.7);setTimeout(()=>beep(1100,150,.7),180);setTimeout(()=>beep(1320,300,.7),360);
  vibrate([120,80,120,80,260]);
  setDoneRef(P.ref,true);
  document.getElementById('plPlay').innerHTML='✓ Marquée faite';
}

function updatePlay(){
  const b=document.getElementById('plPlay');
  b.innerHTML=P.running?'❚❚ Pause':'▶ Démarrer';
}

/* sound + haptics */
let actx=null;
function beep(freq,ms,vol){
  try{ actx=actx||new (window.AudioContext||window.webkitAudioContext)();
    const o=actx.createOscillator(),g=actx.createGain();
    o.frequency.value=freq;o.type='sine';o.connect(g);g.connect(actx.destination);
    g.gain.setValueAtTime(vol||.5,actx.currentTime);
    g.gain.exponentialRampToValueAtTime(.001,actx.currentTime+ms/1000);
    o.start();o.stop(actx.currentTime+ms/1000);
  }catch(e){}
}
function vibrate(p){ try{navigator.vibrate&&navigator.vibrate(p);}catch(e){} }
// mélodie : suite de [freq, durée_ms, délai_ms]
function chime(notes,vol){ notes.forEach(([f,ms,delay])=>setTimeout(()=>beep(f,ms,vol||.6),delay)); }
// (A) dernier segment de course : descendante distinctive
function chimeLastEffort(){ chime([[784,180,0],[659,180,190],[523,320,380]],.7); }
// (B) début du retour au calme : ascendante douce
function chimeCooldown(){ chime([[523,180,0],[659,180,190],[784,320,380]],.55); }

/* silent audio loop — signale au navigateur qu'il y a de l'audio actif,
   réduit le throttling JS quand l'app passe en arrière-plan (écran allumé) */
let keepAliveNode=null;
function startAudioKeepalive(){
  try{
    actx=actx||new(window.AudioContext||window.webkitAudioContext)();
    if(keepAliveNode) return;
    const osc=actx.createOscillator(); const g=actx.createGain(); g.gain.value=0;
    osc.connect(g); g.connect(actx.destination); osc.start(); keepAliveNode=osc;
  }catch(e){}
}
function stopAudioKeepalive(){
  try{keepAliveNode&&keepAliveNode.stop();}catch(e){} keepAliveNode=null;
}

/* notification de transition de segment via Service Worker.
   Planifie un setTimeout pour la fin du segment courant ; quand JS reprend
   après suspension (retour sur l'écran), le SW affiche la notif immédiatement. */
function scheduleSegNotif(){
  clearTimeout(P.notifTimer); P.notifTimer=null;
  if(!('Notification' in window)||Notification.permission!=='granted') return;
  const nx=P.steps[P.idx+1]; if(!nx) return; // dernier segment
  const isNextRun=nx.type==='run';
  const title=nx.ph?(isNextRun?'▶ ':'🚶 ')+nx.ph:(isNextRun?'▶ COURSE':'🚶 MARCHE');
  const body=isNextRun
    ?`${fmt(nx.dur)} · ${ZN[nx.z].lbl}`
    :`${fmt(nx.dur)} · ${nx.ln2||WALK_LABEL[walkRole(P.steps,P.idx+1)].ln2}`;
  P.notifTimer=setTimeout(async()=>{
    try{const reg=await navigator.serviceWorker.ready;
      reg.active?.postMessage({type:'apex-notif',title,body,
        vibrate:isNextRun?[200,80,200]:[300]});}catch(e){}
  }, Math.max(0,P.remain)*1000);
}

/* controls */
document.getElementById('plPlay').onclick=()=>{
  if(actx&&actx.state==='suspended')actx.resume();
  if(!actx){beep(1,1,0);} // unlock audio on first tap
  if(P.idx>=P.steps.length-1 && P.remain<=0) return;
  P.running?stopTick():startTick();
};
document.getElementById('plSkip').onclick=()=>nextSeg(false);
document.getElementById('plClose').onclick=closePlayer;

/* reset */
document.getElementById('reset').onclick=()=>{
  if(confirm('Réinitialiser toute ta progression ?')){progress={};save();render();}
};

/* ---------- PWA install ---------- */
let deferred=null;
window.addEventListener('beforeinstallprompt',e=>{
  e.preventDefault();deferred=e;
  if(!localStorage.getItem('apexrun.installDismissed'))
    document.getElementById('installToast').classList.add('show');
});
document.getElementById('installBtn').onclick=async()=>{
  document.getElementById('installToast').classList.remove('show');
  if(deferred){deferred.prompt();await deferred.userChoice;deferred=null;}
};
document.getElementById('installX').onclick=()=>{
  document.getElementById('installToast').classList.remove('show');
  localStorage.setItem('apexrun.installDismissed','1');
};

/* resync notification quand l'app revient au premier plan pendant une séance */
document.addEventListener('visibilitychange',()=>{
  if(document.hidden||!P.running) return;
  // laisser le premier tick corriger P.remain / P.idx avant de replanifier
  setTimeout(scheduleSegNotif, 200);
});

render();
