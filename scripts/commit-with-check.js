#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification du build avant commit...\n');

try {
  // Vérifier que le build passe
  console.log('📦 Compilation du projet...');
  execSync('npm run build:check', { stdio: 'inherit' });
  console.log('✅ Build réussi !\n');
  
  // Récupérer les arguments de commit
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('❌ Veuillez fournir un message de commit');
    console.log('Usage: npm run commit "votre message de commit"');
    process.exit(1);
  }
  
  const commitMessage = args.join(' ');
  
  // Faire le commit
  console.log('📝 Création du commit...');
  execSync(`git add .`, { stdio: 'inherit' });
  execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
  
  console.log('\n✅ Commit créé avec succès !');
  console.log('💡 Pour pousser les changements: git push');
  
} catch (error) {
  console.error('\n❌ Erreur lors de la vérification du build');
  console.error('Le commit a été annulé pour éviter de commiter du code qui ne compile pas.');
  process.exit(1);
}


