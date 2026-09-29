APEX RUN — Installation sur Android
====================================

CETTE APP EST UNE PWA (web app installable). Pas besoin du Play Store.

Pour l'installer, les fichiers doivent être servis en HTTPS (le mode hors
ligne et l'installation ne fonctionnent pas en ouvrant index.html
directement depuis le système de fichiers).

OPTION A — La plus simple (hébergement gratuit, 2 min) :
1. Va sur https://app.netlify.com/drop (ou GitHub Pages, Vercel, Cloudflare Pages).
2. Glisse-dépose le DOSSIER apex-run (ou le contenu du zip).
3. Tu obtiens un lien https://....
4. Ouvre ce lien dans Chrome sur ton Android.
5. Chrome proposera « Installer l'application » (ou menu ⋮ > Ajouter à
   l'écran d'accueil). Confirme. L'icône apparaît sur ton écran d'accueil.
6. Une fois installée, elle fonctionne hors ligne. Ta progression est
   sauvegardée localement sur le téléphone.

OPTION B — Servir depuis ton ordinateur (réseau local) :
1. Dans le dossier apex-run, lance :  python3 -m http.server 8080
2. Trouve l'IP locale de ton PC (ex. 192.168.1.20).
3. Sur Android (même Wi-Fi), ouvre http://192.168.1.20:8080
   (note : l'install PWA complète exige HTTPS ; en HTTP local l'app
    fonctionne mais « Ajouter à l'écran d'accueil » crée un simple
    raccourci sans cache hors ligne).

FONCTIONS :
- Programme complet 12 semaines (3 blocs, 24 séances).
- Bloc 04 · Affûtage 10 km (29 sept → 10 oct) : J-11 rappel allure,
  J-6 régulation, J-4 activation, Jour J (échauffement + stratégie
  négative split).
- Lecteur de séance : chrono par segment, anneau de progression,
  cible de zone FC affichée, bips sonores 3-2-1 + vibration à chaque
  transition marche/course, écran maintenu allumé.
- Suivi de progression (cases « faite » + barre globale), sauvegardé
  sur l'appareil.
- « Passer » pour avancer manuellement un segment.

Bon entraînement.
