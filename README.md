# Fluence

Relire le même texte pour lire plus vite. Inspiré du principe de la lecture répétée : on lit le même texte plusieurs jours de suite, on compte les mots justes lus par minute, et la courbe monte.

- **Jouer en ligne :** https://lechampdelaurore-boop.github.io/fluence/
- **Toutes les applis :** https://lechampdelaurore-boop.github.io/

## Une séance (environ 10 minutes, avec un adulte)

1. **Texte nouveau :** la voix du téléphone (ou l'adulte) lit d'abord le texte lentement, puis on explique 2 ou 3 mots.
2. L'enfant lit à voix haute. L'adulte lance le chrono, **touche les mots ratés**, puis touche « Fini ». S'il s'est arrêté avant la fin, l'adulte touche le dernier mot lu.
3. L'appli calcule les **mots justes par minute** et ajoute un point sur la courbe. **3 lectures** par séance.
4. Une seule question de compréhension, à la première séance, sans chrono.
5. À la fin, il relit les mots ratés (on peut les écouter).
6. On garde le même texte **3 à 5 séances**. Après 5 séances, le texte est « maîtrisé » et donne un trophée.

Le chrono sert à mesurer, pas à faire la course : l'enfant ne voit pas les secondes pendant qu'il lit. Pas de reconnaissance vocale : c'est l'adulte qui écoute.

## Le reste

- 10 textes originaux de 93 à 136 mots, écrits pour l'appli. On peut **ajouter ses propres textes** (par exemple un texte de l'école) : ils restent sur l'appareil.
- Mise en page pour les enfants dys : grande police sans empattement, double interligne, une ligne sur deux surlignée, syllabes en couleur en option, 4 tailles de texte.
- Récompenses : étoiles, confettis pour un record, personnages kawaii originaux, « séance du jour faite » et la semaine en cours. Tout se désactive avec « Sons et animations ».
- **Carnet du parent** (en bas de l'accueil) : courbe de toutes les séances, tableau par texte, toutes les lectures, et un bouton pour copier le résumé.
- S'installe sur l'écran d'accueil et fonctionne hors ligne.

Les progrès restent dans le navigateur de l'appareil (clés `marc.fluence.*`) : aucun compte, et rien n'est envoyé sur internet.

## Fichiers

- `index.html` : toute l'appli (HTML, CSS et JavaScript, sans bibliothèque). Les textes sont dans le tableau `TEXTS`.
- `sw.js` et `manifest.webmanifest` : mode hors ligne et installation. Après une modification, changer la valeur de `CACHE` dans `sw.js`.
- `fonts/` : polices Fredoka et Nunito (licence SIL Open Font License, voir les fichiers `OFL-*.txt`).
- `tests/telephone.cjs` et `.github/workflows/test-telephone.yml` : après chaque mise en ligne, GitHub ouvre le site publié dans Chrome à 7 tailles d'écran et joue une séance complète (lecture, question, mots ratés, bilan). Le test échoue si l'écran de lecture dépasse, si la page défile en largeur ou s'il y a une erreur dans la console. Lancement local : `npm install --no-save playwright && node tests/telephone.cjs`.
