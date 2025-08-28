#!/usr/bin/env node
import { spawnSync } from 'child_process';
import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

console.log('🔍 Running TypeScript typecheck...\n');

// Detect CI environment
const isCI = process.env.CI || process.env.GITHUB_ACTIONS || process.env.GITLAB_CI;
if (isCI) {
  console.log('🏗️  CI environment detected\n');
  console.log('📊 Environment info:');
  console.log(`   Node.js: ${process.version}`);
  console.log(`   Platform: ${process.platform}`);
  console.log(`   Architecture: ${process.arch}`);
  console.log(`   Working directory: ${process.cwd()}\n`);
}

// Recursively find TypeScript files in a directory
function findTypescriptFilesRecursive(dir, excludePatterns = []) {
  const files = [];
  
  if (!existsSync(dir)) return files;
  
  try {
    const items = readdirSync(dir);
    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip excluded directories
        if (excludePatterns.some(pattern => fullPath.includes(pattern))) {
          continue;
        }
        // Recursively search subdirectories
        files.push(...findTypescriptFilesRecursive(fullPath, excludePatterns));
      } else if (item.endsWith('.ts') && !item.endsWith('.d.ts')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.log(`⚠️  Warning: Could not read directory ${dir}: ${error.message}`);
  }
  
  return files;
}

// Find all TypeScript files to check
function findTypescriptFiles() {
  const files = [];
  
  // Check utils directory
  const utilsDir = 'utils';
  if (existsSync(utilsDir)) {
    const utilsFiles = findTypescriptFilesRecursive(utilsDir, ['node_modules']);
    files.push(...utilsFiles);
  }
  
  // Check recipes for TypeScript source files (excluding codemod scripts, tests, and node_modules)
  const recipesDir = 'recipes';
  if (existsSync(recipesDir)) {
    const recipeSourceFiles = findTypescriptFilesRecursive(recipesDir, ['node_modules', 'tests', 'scripts']);
    files.push(...recipeSourceFiles);
  }
  
  return files;
}

// Find codemod script files (these need special handling)
function findCodemodScripts() {
  const scripts = [];
  const recipesDir = 'recipes';
  
  if (existsSync(recipesDir)) {
    const scriptFiles = findTypescriptFilesRecursive(join(recipesDir, 'jssg-codemod', 'scripts'), ['node_modules']);
    scripts.push(...scriptFiles);
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
  if (isCI) {
    console.log('ℹ️  This is normal in CI environments where only test files may be present');
  }
  process.exit(0);
}

// Run TypeScript compiler - try multiple approaches for CI compatibility
let result;
try {
  // First try: direct tsc command
  result = spawnSync('tsc', ['--noEmit', '--pretty', ...typescriptFiles], {
    stdio: 'pipe',
    encoding: 'utf8'
  });
} catch (e) {
  try {
    // Second try: npx tsc
    result = spawnSync('npx', ['tsc', '--noEmit', '--pretty', ...typescriptFiles], {
      stdio: 'pipe',
      encoding: 'utf8'
    });
  } catch (e2) {
    // Third try: local node_modules tsc
    result = spawnSync('node', ['./node_modules/.bin/tsc', '--noEmit', '--pretty', ...typescriptFiles], {
      stdio: 'pipe',
      encoding: 'utf8'
    });
  }
}

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
