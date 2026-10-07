# Tableau de bord d'exécution de scripts Python (React + TypeScript)

Application web moderne construite avec **React**, **TypeScript**, **Vite** et un serveur backend **Node.js / Express** permettant de gérer, exécuter et superviser en direct vos programmes Python (comme [mdp.py](file:///home/clement/Documents/webmailToMail/mdp.py) et tous les futurs scripts que vous créerez).

---

## 🚀 Démarrage rapide

### 1. Mode Développement (Recommandé)
Lance le serveur API (port 3001) et le serveur de développement Vite (port 5173) en simultané avec rechargement à chaud :
```bash
npm run dev
```
Ouvrez ensuite votre navigateur sur : **`http://localhost:5173`**

### 2. Mode Production / Serveur autonome
Compile le frontend et lance le serveur tout-en-un sur le port 3001 :
```bash
npm run build
npm start
```
Ouvrez ensuite votre navigateur sur : **`http://localhost:3001`**

---

## ✨ Fonctionnalités incluses

1. **Détection automatique des scripts Python** :
   - Détecte automatiquement [mdp.py](file:///home/clement/Documents/webmailToMail/mdp.py) ainsi que tout nouveau fichier `.py` ajouté au dossier.
   - Affiche le statut en temps réel : *Prêt*, *En cours...*, *Succès (code 0)*, *Erreur*, *Interrompu*.
   - Affiche la durée d'exécution et la taille du fichier.

2. **Exécution & Contrôle en 1 clic** :
   - Bouton **Exécuter** pour lancer le programme avec `python3 -u` (flux non bufférisé en direct).
   - Bouton **Arrêter** pour stopper immédiatement un script en cours d'exécution (`SIGTERM` / `SIGKILL`).

3. **Console Interactive & Stdin en temps réel** :
   - Streaming instantané de la sortie standard (`stdout`) et des erreurs (`stderr`).
   - Barre d'entrée interactive pour envoyer des données à `stdin` : idéal pour les pauses d'entrée comme `input(" press enter to quit ")` présent dans `mdp.py`.
   - Bouton d'accès rapide **"Touche Entrée"** pour valider rapidement les prompts interactifs.
   - Défilement automatique (auto-scroll) et bouton pour vider l'écran.

4. **Créateur de nouveaux scripts** :
   - Bouton **"Nouveau script"** permettant de créer directement de nouveaux fichiers `.py` avec plusieurs modèles préconfigurés :
     - Script basique
     - Automatisation Selenium WebDriver
     - Requêtes HTTP (`requests`)

5. **Éditeur de code intégré** :
   - Visualisez et modifiez directement le code source Python depuis l'interface web avec bouton **Enregistrer & Exécuter**.

---

## 📁 Structure du projet

- `src/` : Frontend React + TypeScript
  - `App.tsx` : Composant principal et gestion de l'état
  - `components/ScriptCard.tsx` : Cartes de contrôle des scripts
  - `components/ConsoleOutput.tsx` : Console interactive temps réel
  - `components/NewScriptModal.tsx` : Modal de création de programmes
  - `components/ScriptEditorModal.tsx` : Éditeur de code dans le navigateur
  - `types.ts` : Types TypeScript partagés
- `server/` : Backend Node.js TypeScript
  - `index.ts` : Serveur Express + WebSockets assurant le spawn des processus Python et le streaming des flux
- `mdp.py` : Votre script d'authentification Webmail & Selenium

