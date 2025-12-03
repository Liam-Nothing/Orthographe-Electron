#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔍 Vérification du build avant commit...\n');

try {
  execSync('npm run build:check', { stdio: 'inherit' });
  console.log('\n✅ Build réussi, commit autorisé.');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Le build a échoué. Le commit a été annulé.');
  process.exit(1);
}


