/* ============ APEX RUN — app logic ============ */
const ZN = PROGRAM.ZONES;
const STORE = 'apexrun.progress.v1';
let progress = load();

function load(){ try{return JSON.parse(localStorage.getItem(STORE))||{};}catch(e){return {};} }
function save(){ localStorage.setItem(STORE, JSON.stringify(progress)); }
function key(w,kind){ return `w${w}_${kind}`; }
function isDone(w,kind){ return !!progress[key(w,kind)]; }
function setDone(w,kind,v){ progress[key(w,kind)]=v; save(); render(); }

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
  const done=allKinds.filter(Boolean).length;
  document.getElementById('pfill').style.width=(done/24*100)+'%';
  document.getElementById('pdone').textContent=done;

  // current week = first week with an incomplete session
  let cur=PROGRAM.weeks.find(w=>!isDone(w.w,'iv')||!isDone(w.w,'ef'))||PROGRAM.weeks[11];
  document.getElementById('pweek').textContent=`Semaine ${cur.w} · Bloc ${PROGRAM.weeks[cur.w-1].block+1}`;

  let html='';
  PROGRAM.blocks.forEach((b,bi)=>{
    html+=`<section class="block">
      <div class="block-head">
        <div class="block-no cond">${b.no}</div>
        <div><div class="t">${b.title}</div><div class="w">${b.weeks}</div><div class="f">${b.focus}</div></div>
      </div>`;
    PROGRAM.weeks.filter(w=>w.block===bi).forEach(w=>{
      const ivc=isDone(w.w,'iv'), efc=isDone(w.w,'ef');
      const wdone=ivc&&efc, open=(w.w===cur.w);
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
          ${sessionHTML(w,'iv',ivc)}
          ${sessionHTML(w,'ef',efc)}
        </div>
      </div>`;
    });
    html+=`</section>`;
  });
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
    e.stopPropagation(); const[w,k]=el.dataset.go.split('-'); openPlayer(+w,k);
  });
  document.querySelectorAll('[data-done]').forEach(el=>el.onclick=(e)=>{
    e.stopPropagation(); const[w,k]=el.dataset.done.split('-'); setDone(+w,k,!isDone(+w,k));
  });
}

function sessionHTML(w,kind,done){
  const s=w[kind]; const tag=kind==='iv'?'iv':'ef';
  let steps='';
  s.steps.forEach((st,i)=>{
    const isRun=st.type==='run'; const z=isRun?ZN[st.z]:ZN.walk;
    const wl=isRun?null:WALK_LABEL[walkRole(s.steps,i)];
    const ln1=isRun?'Course':wl.ln1;
    const ln2=isRun?`<span class="zpill" style="background:${z.col}22;color:${z.col}">${z.lbl}</span>`:wl.ln2;
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
        <span class="tag ${tag}">${kind==='iv'?'INTERVALLES':'ENDURANCE'}</span></div>
      <div class="dur mono" style="font-size:12px;color:var(--mut)">${totalLabel(s.steps)}</div>
    </div>
    <div style="font-size:11.5px;color:var(--mut);margin:-4px 0 11px;line-height:1.4">${s.label}</div>
    <div class="steps">${steps}</div>
    <div class="sess-actions">
      <button class="btn btn-go" data-go="${w.w}-${kind}">▶ Lancer la séance</button>
      <button class="btn btn-done ${done?'is':''}" data-done="${w.w}-${kind}">${done?'✓ Terminée':'Marquer faite'}</button>
    </div>
  </div>`;
}

/* ============ PLAYER ============ */
let P={w:0,kind:'',steps:[],idx:0,remain:0,running:false,timer:null,segStart:0};

function openPlayer(w,kind){
  const s=PROGRAM.weeks[w-1][kind];
  P={w,kind,steps:s.steps,idx:0,remain:s.steps[0].dur,running:false,timer:null};
  document.getElementById('plTitle').innerHTML=`SEMAINE ${w} · ${kind==='iv'?'INTERVALLES':'ENDURANCE'}<small>${s.label}</small>`;
  buildSegTrack();
  paintPhase(); updatePlay();
  document.getElementById('plTotal').innerHTML=`Durée totale <b>${totalLabel(s.steps)}</b> · ${s.steps.length} segments`;
  document.getElementById('player').classList.add('on');
  if('wakeLock' in navigator){requestWake();}
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
  const phaseTxt=isRun?'COURSE':(role==='warmup'?'ÉCHAUFFEMENT':role==='cooldown'?'RETOUR AU CALME':'MARCHE');
  document.getElementById('phaseLbl').textContent=phaseTxt;
  document.getElementById('phaseLbl').style.color=col;
  document.getElementById('bigtime').textContent=fmt(P.remain);
  document.getElementById('ring').style.stroke=col;
  const zl=document.getElementById('zline');
  if(isRun){zl.innerHTML=`<span style="width:9px;height:9px;border-radius:99px;background:${z.col};display:inline-block"></span> Cible <b>${z.lbl} BPM</b>`;zl.style.color=z.col;}
  else{const sub=role==='warmup'?'Marche rapide':role==='cooldown'?'Retour au calme':'Récupération active';zl.innerHTML=sub;zl.style.color='var(--mut)';}
  // up next
  const nx=P.steps[P.idx+1];
  document.getElementById('upnext').innerHTML=nx
    ? `À suivre · <b>${nx.type==='run'?'Course '+(ZN[nx.z].lbl.split(' ·')[0]):'Marche'}</b> · ${fmt(nx.dur)}`
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
  let last=Date.now();
  P.timer=setInterval(()=>{
    const now=Date.now(); const dt=(now-last)/1000; last=now;
    P.remain-=dt;
    if(P.remain<=0){ nextSeg(true); }
    else { document.getElementById('bigtime').textContent=fmt(Math.ceil(P.remain)); ring(); }
    // 3-2-1 beep
    const r=Math.ceil(P.remain);
    if(P.remain>0 && r<=3 && r!==P._lastBeep){ P._lastBeep=r; beep(660,90,.5); }
  },120);
}
function stopTick(){ P.running=false; clearInterval(P.timer); updatePlay(); }

function nextSeg(auto){
  if(P.idx>=P.steps.length-1){ finishSession(); return; }
  P.idx++; P.remain=P.steps[P.idx].dur; P._lastBeep=null;
  const st=P.steps[P.idx];
  const isRun=st.type==='run';
  const isLastRun=(P.idx===lastRunIdx(P.steps));
  const isCooldown=(!isRun && walkRole(P.steps,P.idx)==='cooldown');
  if(auto) segmentCue(isRun,isLastRun,isCooldown);
  paintPhase();
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
  setDone(P.w,P.kind,true);
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

render();
