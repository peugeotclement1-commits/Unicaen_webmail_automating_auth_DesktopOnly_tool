# Webmail_Unicaen Automator

Ce projet permet d'automatiser l'accès et les traitements sur le Webmail à l'aide d'un script Python / Selenium. Il peut être exécuté directement via un binaire/exécutable ou lancé depuis les sources.

## 📋 Prérequis et Utilisation de l'Exécutable

Pour utiliser l'exécutable généré, vous devez vous munir de vos identifiants d'accès. Lors de son exécution, le programme vous demandera de saisir :

1. **Identifiant** (nom d'utilisateur).
2. **Mot de passe**.
3. **Éléments de la grille de code** (saisir chaque élément demandé par le système d'authentification à double facteur / grille de sécurité).

> 💡 **Note :** Google Chrome (ou Chromium) doit être installé sur votre machine pour que l'automatisation Selenium puisse fonctionner.

## 💻 Installation de Python et des Dépendances (Linux, Windows)

Si vous souhaitez exécuter le projet à partir du code source `cas.py` ou recompiler l'exécutable vous-même, vous devez installer Python et les bibliothèques requises.

### 🐧 Sous Linux (Ubuntu / Debian)

1. Mettez à jour les paquets et installez Python, `pip` et l'environnement virtuel :

   ```bash
   sudo apt update
   sudo apt install python3 python3-pip python3-venv
   ```

2. Créez et activez un environnement virtuel :

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Installez les dépendances du projet :

   ```bash
   pip install selenium webdriver-manager requests pyinstaller
   ```

### 🪟 Sous Windows

1. Téléchargez et installez **Python** depuis le site officiel : [python.org](https://www.python.org/downloads/).

   > ⚠️ Assurez-vous de bien cocher la case **"Add Python to PATH"** lors de l'installation.

2. Ouvrez l'invite de commandes (`cmd`) ou PowerShell et créez un environnement virtuel :

   ```cmd
   python -m venv .venv
   .venv\Scripts\activate
   ```

3. Installez les dépendances :

   ```cmd
   pip install selenium webdriver-manager requests pyinstaller
   ```

## 🛠️ Démarche de Création de l'Exécutable (Compilation)

Pour compiler le script Python `cas.py` sous forme d'un exécutable autonome :

1. Activez votre environnement virtuel si ce n'est pas déjà fait.

2. Installez PyInstaller :

   ```bash
   pip install pyinstaller
   ```

3. Lancez la commande de compilation :

   ```bash
   pyinstaller --onefile --noconsole --collect-all selenium cas.py
   ```

**Explication des options :**

* `--onefile` : Regroupe l'application et toutes ses dépendances dans un seul fichier (situé dans le dossier `dist/`).
* `--noconsole` : Empêche l'ouverture d'une fenêtre de terminal/console en arrière-plan lors du lancement.
* `--collect-all selenium` : Embarque l'intégralité des sous-modules de Selenium pour éviter les erreurs d'importation au runtime.

## 🖥️ Création du Raccourci Bureau (`.desktop`) sous Linux

Pour pouvoir exécuter l'application facilement par double-clic depuis le bureau sous Linux :

1. Créez un fichier `.desktop` sur votre bureau :

   ```bash
   nano ~/Bureau/Webmail_Unicaen.desktop
   ```

2. Ajoutez la configuration suivante (remplacez `/chemin/absolu/vers/votre/projet` par le chemin réel sur votre machine) :

   ```ini
   [Desktop Entry]
   Version=1.0
   Type=Application
   Name=WebmailToMail
   Comment=Lancement automatique du script Webmail
   Exec=/chemin/absolu/vers/votre/projet/dist/cas
   Path=/chemin/absolu/vers/votre/projet/dist
   Icon=utilities-terminal
   Terminal=false
   StartupNotify=true
   ```

3. Rendre le fichier exécutable :

   ```bash
   chmod +x ~/Bureau/Webmail_Unicaen.desktop
   ```

4. **Activation graphique :** Sur votre bureau Linux, faites un **clic droit** sur l'icône du raccourci et sélectionnez **« Autoriser le lancement »** (*Allow Launching*).
