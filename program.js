/* APEX RUN — Programme 12 semaines, structuré en segments jouables.
   type: 'walk' | 'run'  | dur en secondes | z = label zone (affichage) */

const Z = {
  z12:   {lbl:'Z1/2 · 125-146',       col:'var(--z2)'},
  z12low:{lbl:'Z1/2 basse · 125-135', col:'var(--z1)'},
  z34:   {lbl:'Z3/4 · 155-165',       col:'var(--z3)'},
  z4:    {lbl:'Z4 · 159-170',         col:'var(--z4)'},
  z3sb2: {lbl:'Z3 Sup · 155-162',     col:'var(--z3)'},
  z3s:   {lbl:'Z3 Sup · 153-158',     col:'var(--z3)'},
  z3:    {lbl:'Z3 · 147-158',         col:'var(--z3)'},
  z23:   {lbl:'Z2/3 · 140-158',       col:'var(--z3)'},
  walk:  {lbl:'Marche',               col:'var(--walk)'}
};

// helpers
const W=(m)=>({type:'walk', dur:m*60});
const R=(m,z)=>({type:'run', dur:m*60, z});
function reps(n, runMin, runZ, walkMin){
  const a=[]; for(let i=0;i<n;i++){ a.push(R(runMin,runZ)); a.push(W(walkMin)); } return a;
}

// Build the 12 weeks. Each week: {iv:{steps}, ef:{steps}}
function ivWeek(steps,label){return {kind:'iv',day:'MARDI',name:'Intervalles',label,steps};}
function efWeek(steps,label){return {kind:'ef',day:'DIMANCHE',name:'Endurance fondamentale',label,steps};}

const PROGRAM = {
  blocks:[
    {no:'01', title:'RÉADAPTATION & VOLUME AÉROBIE', weeks:'Semaines 1-4',
     focus:"Réhabituer les tendons aux impacts, rebâtir l'endurance aérobie de base (Z1/2 · 125-146 BPM) sans accumuler de fatigue résiduelle pour les séances de jambes."},
    {no:'02', title:'DÉVELOPPEMENT DU SEUIL & EXTENSION', weeks:'Semaines 5-8',
     focus:"Augmenter la capacité à maintenir une vitesse élevée. Intervalles Z4 (159-170) puis Z3 Sup (155-162). Transition vers le volume continu Z1/2."},
    {no:'03', title:'SPÉCIFIQUE CAPACITÉ & VOLUME 10 KM', weeks:'Semaines 9-12',
     focus:"Conversion de l'endurance en distance brute. Intervalles Z3 Sup (153-158) puis Z3 (147-158). Test final 10 km continu Z2/3 (140-158 BPM)."}
  ],
  weeks:[
    // ----- BLOC 1 -----
    {w:1, block:0,
      iv:ivWeek([W(5),...reps(6,3,'z34',1),W(5)],'6 × 3 min course / 1 min marche'),
      ef:efWeek([W(5),R(15,'z12'),W(2),R(15,'z12'),W(5)],'2 × 15 min course · Z1/2')},
    {w:2, block:0,
      iv:ivWeek([W(5),...reps(6,3,'z34',1),W(5)],'6 × 3 min course / 1 min marche'),
      ef:efWeek([W(5),R(15,'z12'),W(2),R(15,'z12'),W(5)],'2 × 15 min course · Z1/2')},
    {w:3, block:0,
      iv:ivWeek([W(5),...reps(5,4,'z34',1),W(5)],'5 × 4 min course / 1 min marche'),
      ef:efWeek([W(5),R(30,'z12')],'30 min course continue · Z1/2')},
    {w:4, block:0,
      iv:ivWeek([W(5),...reps(5,4,'z34',1),W(5)],'5 × 4 min course / 1 min marche'),
      ef:efWeek([W(5),R(30,'z12')],'30 min course continue · Z1/2')},
    // ----- BLOC 2 -----
    {w:5, block:1,
      iv:ivWeek([W(5),...reps(4,5,'z4',1),W(5)],'4 × 5 min course / 1 min marche · Z4'),
      ef:efWeek([W(5),R(35,'z12')],'35 min course continue · Z1/2')},
    {w:6, block:1,
      iv:ivWeek([W(5),...reps(4,5,'z4',1),W(5)],'4 × 5 min course / 1 min marche · Z4'),
      ef:efWeek([W(5),R(35,'z12')],'35 min course continue · Z1/2')},
    {w:7, block:1,
      iv:ivWeek([W(5),...reps(3,7,'z3sb2',1.5),W(5)],'3 × 7 min course / 1 min 30 marche'),
      ef:efWeek([W(5),R(40,'z12')],'40 min course continue · Z1/2 (cap 5-6 km)')},
    {w:8, block:1,
      iv:ivWeek([W(5),...reps(3,7,'z3sb2',1.5),W(5)],'3 × 7 min course / 1 min 30 marche'),
      ef:efWeek([W(5),R(40,'z12')],'40 min course continue · Z1/2 (cap 5-6 km)')},
    // ----- BLOC 3 -----
    {w:9, block:2,
      iv:ivWeek([W(5),...reps(3,8,'z3s',2),W(5)],'3 × 8 min course / 2 min marche'),
      ef:efWeek([W(5),R(45,'z12')],'45 min course continue · Z1/2')},
    {w:10, block:2,
      iv:ivWeek([W(5),...reps(3,8,'z3s',2),W(5)],'3 × 8 min course / 2 min marche'),
      ef:efWeek([W(5),R(50,'z12')],'50 min course continue · Z1/2 (~7,5-8 km)')},
    {w:11, block:2,
      iv:ivWeek([W(5),...reps(2,12,'z3',2),W(5)],'2 × 12 min course / 2 min marche'),
      ef:efWeek([W(5),R(30,'z12low')],'30 min course continue · Z1/2 basse (affûtage)')},
    {w:12, block:2,
      iv:ivWeek([W(5),...reps(2,12,'z3',2),W(5)],'2 × 12 min course / 2 min marche'),
      ef:efWeek([W(5),R(60,'z23')],'LE TEST · Objectif 10 km continu · 140-158 BPM', true)}
  ]
};
PROGRAM.ZONES = Z;
