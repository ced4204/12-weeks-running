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

/* ============ PROTOCOLE D'AFFÛTAGE 10 KM (29 sept → 10 oct) ============
   Paramètres de contrôle : FCMax 173 · Z1 112-130 · Z2/3 130-156.
   Un segment peut surcharger ses libellés : ln1 / ln2 (liste) et ph (lecteur). */
Object.assign(Z,{
  tz1:     {lbl:'Z1 · 112-130',          col:'var(--z1)'},
  tz1low:  {lbl:'Z1 · 112-125',          col:'var(--z1)'},
  tz3:     {lbl:'Z3 · 147-156',          col:'var(--z3)'},
  stride:  {lbl:'Accélération progressive', col:'var(--z4)'},
  race1:   {lbl:'Z2 haute · 130-142',    col:'var(--z2)'},
  race2:   {lbl:'Z3 · 145-154',          col:'var(--z3)'},
  race3:   {lbl:'155-165+',              col:'var(--z4)'}
});
const lbl=(step,ln1,ln2,ph)=>Object.assign(step,{ln1,ln2,ph});
const Rs=(sec,z)=>({type:'run', dur:sec, z});

PROGRAM.taper={
  no:'04', title:'AFFÛTAGE 10 KM', weeks:'29 septembre → 10 octobre',
  focus:"Paramètres de contrôle : FCMax 173 BPM · Zone 1 (112-130 BPM) · Zone 2/3 (130-156 BPM). Volume réduit, intensité conservée, zéro fatigue résiduelle le jour J.",
  sessions:[
    {id:'j11', tag:'J-11', day:'MARDI 29 SEPT', kind:'iv', name:'Rappel spécifique allure 10 km',
     label:"3 × 1 000 m (ou 3 × 6 min) à l'allure cible 10 km · 2 min marche active",
     objective:"Mémorisation neuromusculaire de l'allure sans accumulation d'acide lactique.",
     steps:[
       lbl(W(5),'Marche rapide','Échauffement','ÉCHAUFFEMENT'),
       lbl(R(5,'tz1'),'Trot très léger',null,'TROT LÉGER'),
       lbl(R(6,'tz3'),'Allure cible 10 km','1 000 m ou 6 min','ALLURE 10 KM'),
       lbl(W(2),'Marche active','Récupération','RÉCUPÉRATION'),
       lbl(R(6,'tz3'),'Allure cible 10 km','1 000 m ou 6 min','ALLURE 10 KM'),
       lbl(W(2),'Marche active','Récupération','RÉCUPÉRATION'),
       lbl(R(6,'tz3'),'Allure cible 10 km','1 000 m ou 6 min','ALLURE 10 KM'),
       lbl(W(5),'Marche lente','Retour au calme','RETOUR AU CALME')
     ]},
    {id:'j6', tag:'J-6', day:'DIMANCHE 4 OCT', kind:'ef', name:'Dernière sortie de régulation',
     label:'25 min course continue · Zone 1 stricte · volume réduit de moitié',
     objective:"Éliminer l'acide urique et les tensions musculaires de la semaine, maintenir le flux sanguin vers les tendons sans puiser dans le glycogène. Volume réduit de moitié par rapport à la normale.",
     steps:[
       lbl(W(5),'Marche progressive','Échauffement','ÉCHAUFFEMENT'),
       lbl(R(25,'tz1'),'Course continue','Zone 1 stricte','COURSE Z1'),
       lbl(W(5),'Marche','Décélération','RETOUR AU CALME')
     ]},
    {id:'j4', tag:'J-4', day:'MARDI 6 OCT', kind:'iv', name:'Activation neuromusculaire pré-course',
     label:'12 min trot très léger + 4 × 60 m en lignes droites progressives',
     objective:"Réveiller la réactivité des fuseaux neuromusculaires et ouvrir la cage thoracique sans générer de fatigue résiduelle.",
     note:"Lignes droites : accélération fluide sur le plat, relâchement des bras, axe neutre du poignet. Retour marché au point de départ.",
     steps:[
       lbl(W(5),'Marche','Échauffement','ÉCHAUFFEMENT'),
       lbl(R(12,'tz1low'),'Trot très léger',null,'TROT LÉGER'),
       lbl(Rs(15,'stride'),'Ligne droite 60 m','Relâchement des bras','LIGNE DROITE 60 M'),
       lbl(W(1),'Retour marché','Au point de départ','RETOUR MARCHÉ'),
       lbl(Rs(15,'stride'),'Ligne droite 60 m','Relâchement des bras','LIGNE DROITE 60 M'),
       lbl(W(1),'Retour marché','Au point de départ','RETOUR MARCHÉ'),
       lbl(Rs(15,'stride'),'Ligne droite 60 m','Relâchement des bras','LIGNE DROITE 60 M'),
       lbl(W(1),'Retour marché','Au point de départ','RETOUR MARCHÉ'),
       lbl(Rs(15,'stride'),'Ligne droite 60 m','Relâchement des bras','LIGNE DROITE 60 M'),
       lbl(W(3),'Marche lente','Retour au calme','RETOUR AU CALME')
     ]},
    {id:'race', tag:'JOUR J', day:'SAMEDI 10 OCT', kind:'race', name:'Course officielle 10 km',
     label:'Échauffement 15 min avant le départ · stratégie négative split',
     objective:"Zéro fatigue avant le coup de feu. Départ contrôlé, stabilisation, puis exploitation totale du réservoir.",
     steps:[
       lbl(W(5),'Marche rapide','Échauffement','ÉCHAUFFEMENT'),
       lbl(R(3,'tz1'),'Trot léger',null,'TROT LÉGER'),
       lbl(W(2),'Mobilisations articulaires','Douces · zéro fatigue','MOBILISATIONS')
     ],
     plan:[
       {km:'Km 0 → 3',  z:'race1', txt:'Démarrage contrôlé. Ne te laisse pas emporter par le peloton.'},
       {km:'Km 3 → 7',  z:'race2', txt:"Stabilisation à l'allure cible. Respiration régulière, foulée économique."},
       {km:'Km 7 → 10', z:'race3', txt:'Bascule mentale, exploitation totale du réservoir. Maintien ou accélération progressive jusqu\'à la ligne.'}
     ]}
  ]
};
