#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Configuration des hooks Git...\n');

const gitHooksDir = path.join(__dirname, '..', '.git', 'hooks');
const preCommitHook = path.join(gitHooksDir, 'pre-commit');
const sourceHook = path.join(__dirname, 'pre-commit.js');

// Créer le dossier .git/hooks s'il n'existe pas
if (!fs.existsSync(gitHooksDir)) {
  fs.mkdirSync(gitHooksDir, { recursive: true });
  console.log('✅ Dossier .git/hooks créé');
}

// Créer le hook pre-commit
try {
  const preCommitScriptPath = path.resolve(__dirname, 'pre-commit.js');
  
  // Pour Windows, Git utilise généralement Git Bash, donc on crée un script shell
  // qui fonctionne avec Git Bash (inclus avec Git pour Windows)
  if (process.platform === 'win32') {
    // Convertir le chemin Windows en chemin Unix pour Git Bash
    const unixPath = preCommitScriptPath.replace(/\\/g, '/').replace(/^([A-Z]):/, '/$1').toLowerCase();
    
    // Créer un script shell qui fonctionne avec Git Bash
    const hookContent = `#!/bin/sh
# Hook pre-commit pour vérifier le build
node "${preCommitScriptPath.replace(/\\/g, '/')}" "$@"`;
    fs.writeFileSync(preCommitHook, hookContent, { encoding: 'utf8' });
    
    // Essayer de rendre le fichier exécutable via Git
    try {
      execSync(`git update-index --chmod=+x "${preCommitHook}"`, { stdio: 'ignore', cwd: path.join(__dirname, '..') });
    } catch (e) {
      // Si ça ne fonctionne pas, essayer avec attrib (Windows)
      try {
        execSync(`attrib +x "${preCommitHook}"`, { stdio: 'ignore' });
      } catch (e2) {
        // Ignorer si ça ne fonctionne pas
      }
    }
  } else {
    // Pour Unix/Mac, créer un script shell
    const hookContent = `#!/bin/sh
node "${preCommitScriptPath}" "$@"`;
    fs.writeFileSync(preCommitHook, hookContent, { encoding: 'utf8' });
    execSync(`chmod +x "${preCommitHook}"`);
  }
  
  console.log('✅ Hook pre-commit installé avec succès !');
  console.log('💡 Le build sera maintenant vérifié avant chaque commit.\n');
} catch (error) {
  console.error('❌ Erreur lors de l\'installation du hook:', error.message);
  process.exit(1);
}

