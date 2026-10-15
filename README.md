   WebmailToMail Automator

Ce projet permet d'automatiser l'accès et le traitement sur Webmail à l'aide d'un script Python / Selenium compilé sous forme d'exécutable autonome pour Linux.

## 📋 Prérequis et Utilisation de l'Exécutable

Pour utiliser l'exécutable, vous devez vous munir de vos identifiants d'accès. Lors de son exécution, le programme vous demandera de saisir :

1. **Identifiant** (nom d'utilisateur)

2. **Mot de passe**

3. **Éléments de la grille de code** (saisir chaque élément demandé par le système d'authentification double-facteur / grille de sécurité).

   💡 Note : Google Chrome (ou Chromium) doit être installé sur votre machine pour que l'automatisation Selenium puisse fonctionner.

💻 Installation de Python et des Dépendances (Linux, Windows, macOS)

Si vous souhaitez exécuter le projet à partir du code source cas.py ou recompiler l'exécutable vous-même, vous devez installer Python et les bibliothèques requises.

🐧 Sous Linux (Ubuntu / Debian)

Mettez à jour les paquets et installez Python, pip et l'environnement virtuel :

sudo apt update
sudo apt install python3 python3-pip python3-venv


Clonez le dépôt et créez un environnement virtuel :

python3 -m venv .venv
source .venv/bin/activate


Installez les dépendances du projet :

pip install selenium webdriver-manager requests pyinstaller


🪟 Sous Windows

Téléchargez et installez Python depuis le site officiel : python.org.

⚠️ Assurez-vous de bien cocher la case "Add Python to PATH" lors de l'installation.

Ouvre l'invite de commandes (cmd) ou PowerShell et créez un environnement virtuel :

python -m venv .venv
.venv\Scripts\activate


Installez les dépendances :

pip install selenium webdriver-manager requests pyinstaller

## 🛠️ Guide de Création de l'Exécutable

Si vous souhaitez modifier le code source (`cas.py`) et recompiler l'exécutable vous-même, suivez la démarche ci-dessous.

### 1. Installation des dépendances

Assurez-vous d'avoir Python et `pip` installés, puis installez PyInstaller :

```
pip install pyinstaller

```

### 2. Compilation du script Python

Pour générer un fichier exécutable unique sans affichage de console d'arrière-plan, lancez la commande suivante :

```
pyinstaller --onefile --noconsole --collect-all selenium cas.py

```

* `--onefile` : Regroupe tout le projet et ses dépendances dans un seul fichier exécutable dans le dossier `dist/`.

* `--noconsole` : Masque la fenêtre de terminal lors du lancement de l'application.

* `--collect-all selenium` : Embarque l'intégralité des modules et sous-modules de Selenium pour éviter les erreurs d'importation.

## 🖥️ Création du Raccourci Bureau (`.desktop`) sous Linux

Pour pouvoir exécuter l'application facilement depuis le bureau Linux sans passer par le terminal, créez un fichier d'application `.desktop`.

1. Créez un fichier sur le bureau :

   ```
   nano ~/Bureau/Webmail_Unicaen.desktop
   
   ```

2. Ajoutez-y la configuration suivante (ajustez les chemins selon votre dossier d'installation) :

   ```
   [Desktop Entry]
   Version=1.0
   Type=Application
   Name=Webmail_Unicaen
   Comment=Lancement automatique du script Webmail
   Exec=/chemin/absolu/vers/votre/projet/dist/cas
   Path=/chemin/absolu/vers/votre/projet/dist
   Icon=utilities-terminal
   Terminal=false
   StartupNotify=true
   
   ```

3. Rendez le fichier exécutable :

   ```
   chmod +x ~/Bureau/Webmail_Unicaen.desktop
   
   ```

4. **Activation sur l'interface graphique :** Faites un clic droit sur l'icône du raccourci sur votre bureau, puis cliquez sur **"Autoriser le lancement"** (*Allow Launching*).
