#!/usr/bin/env node
import { execSync, spawnSync } from 'child_process';
import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

console.log('🔍 Running TypeScript typecheck...\n');

// Find all TypeScript files to check
function findTypescriptFiles() {
  const files = [];
  
  // Check utils directory
  const utilsDir = 'utils';
  if (existsSync(utilsDir)) {
    const utilsFiles = execSync(`find ${utilsDir} -name "*.ts" -type f -not -path "*/node_modules/*"`, { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(f => f.length > 0);
    files.push(...utilsFiles);
  }
  
  // Check recipes for TypeScript source files (excluding codemod scripts, tests, and node_modules)
  const recipesDir = 'recipes';
  if (existsSync(recipesDir)) {
    try {
      const recipeSourceFiles = execSync(`find ${recipesDir} -path "*/src/*.ts" -o -path "*/src/**/*.ts" -type f | grep -v node_modules`, { encoding: 'utf8' })
        .trim()
        .split('\n')
        .filter(f => f.length > 0 && f !== '');
      files.push(...recipeSourceFiles);
    } catch (e) {
      // No src files found, which is fine
    }
  }
  
  return files;
}

// Find codemod script files (these need special handling)
function findCodemodScripts() {
  const scripts = [];
  const recipesDir = 'recipes';
  
  if (existsSync(recipesDir)) {
    try {
      const scriptFiles = execSync(`find ${recipesDir} -path "*/scripts/*.ts" -type f | grep -v node_modules`, { encoding: 'utf8' })
        .trim()
        .split('\n')
        .filter(f => f.length > 0 && f !== '');
      scripts.push(...scriptFiles);
    } catch (e) {
      // No script files found, which is fine
    }
  }
  
  return scripts;
}

// Check TypeScript files
const typescriptFiles = findTypescriptFiles();
const codemodScripts = findCodemodScripts();

console.log('📁 TypeScript files found:');
if (typescriptFiles.length > 0) {
  typescriptFiles.forEach(file => console.log(`  ✓ ${file}`));
} else {
  console.log('  (no TypeScript source files found)');
}

console.log('\n🛠️  Codemod scripts found:');
if (codemodScripts.length > 0) {
  codemodScripts.forEach(file => console.log(`  ⚠️  ${file} (excluded - codemod environment only)`));
} else {
  console.log('  (no codemod scripts found)');
}

console.log('\n🔍 Running TypeScript compiler...');

if (typescriptFiles.length === 0) {
  console.log('✅ No TypeScript source files to typecheck - skipping compilation');
  process.exit(0);
}

// Run TypeScript compiler
const result = spawnSync('npx', ['tsc', '--noEmit', '--pretty', ...typescriptFiles], {
  stdio: 'pipe',
  encoding: 'utf8'
});

if (result.status === 0) {
  console.log(`✅ TypeScript compilation successful! (${typescriptFiles.length} files checked)`);
  
  if (codemodScripts.length > 0) {
    console.log(`\nℹ️  Note: ${codemodScripts.length} codemod script(s) excluded from typecheck`);
    console.log('   (these files are meant for the codemod runtime environment)');
  }
} else {
  console.log('❌ TypeScript compilation failed:\n');
  console.log(result.stdout);
  if (result.stderr) {
    console.log(result.stderr);
  }
  
  console.log(`\n📊 Summary: Failed to compile ${typescriptFiles.length} file(s)`);
  process.exit(1);
}

console.log('\n🎉 Typecheck completed successfully!');
