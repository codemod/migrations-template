#!/usr/bin/env node

import { readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CODEMOD_API_KEY = process.env.CODEMOD_API_KEY;
const REGISTRY_SCOPE = process.env.CODEMOD_REGISTRY_SCOPE || 'codemod';
const REGISTRY_URL = process.env.CODEMOD_REGISTRY_URL;

if (!CODEMOD_API_KEY) {
  console.error('❌ CODEMOD_API_KEY environment variable is required');
  process.exit(1);
}

console.log('🚀 Starting auto-publish workflow...');
console.log(`📦 Registry: ${REGISTRY_URL || 'default'}`);
console.log(`🏷️  Scope: ${REGISTRY_SCOPE}`);

// Login to Codemod Registry
function loginToRegistry() {
  console.log('🔐 Logging in to Codemod Registry...');
  const loginArgs = [
    'codemod@latest', 
    'login', 
    '--api-key', CODEMOD_API_KEY,
    '--scope', REGISTRY_SCOPE
  ];
  
  if (REGISTRY_URL) {
    loginArgs.push('--registry', REGISTRY_URL);
  }
  
  const result = spawnSync('npx', loginArgs, { stdio: 'inherit' });
  
  if (result.status !== 0) {
    console.error('❌ Failed to login to Codemod Registry');
    process.exit(1);
  }
  console.log('✅ Successfully logged in to Codemod Registry');
}

// Get changed files from git
function getChangedFiles() {
  console.log('📋 Checking for changed files...');
  const result = spawnSync('git', ['diff', '--name-only', 'HEAD~1', 'HEAD'], { 
    encoding: 'utf8' 
  });
  
  if (result.status !== 0) {
    console.log('⚠️  Could not get git diff, checking all recipes...');
    return { changed: getAllRecipes(), removed: [] };
  }
  
  const changedFiles = result.stdout.trim().split('\n').filter(Boolean);
  const changedRecipes = new Set();
  const removedRecipes = new Set();
  
  // Check for deleted files
  const deletedResult = spawnSync('git', ['diff', '--name-only', '--diff-filter=D', 'HEAD~1', 'HEAD'], { 
    encoding: 'utf8' 
  });
  
  if (deletedResult.status === 0) {
    const deletedFiles = deletedResult.stdout.trim().split('\n').filter(Boolean);
    deletedFiles.forEach(file => {
      if (file.startsWith('recipes/')) {
        const recipeName = file.split('/')[1];
        if (recipeName) {
          removedRecipes.add(recipeName);
        }
      }
    });
  }
  
  // Check for modified/added files
  changedFiles.forEach(file => {
    if (file.startsWith('recipes/')) {
      const recipeName = file.split('/')[1];
      if (recipeName) {
        changedRecipes.add(recipeName);
      }
    }
  });
  
  console.log(`📝 Found ${changedRecipes.size} changed recipes:`, Array.from(changedRecipes));
  console.log(`🗑️  Found ${removedRecipes.size} removed recipes:`, Array.from(removedRecipes));
  
  return { 
    changed: Array.from(changedRecipes), 
    removed: Array.from(removedRecipes) 
  };
}

// Get all recipes (fallback)
function getAllRecipes() {
  const recipesDir = join(process.cwd(), 'recipes');
  if (!statSync(recipesDir).isDirectory()) {
    return [];
  }
  
  return readdirSync(recipesDir).filter(name => {
    const recipePath = join(recipesDir, name);
    return statSync(recipePath).isDirectory() && 
           statSync(join(recipePath, 'workflow.yaml')).isFile();
  });
}

// Read package.json from recipe directory
function readRecipePackageJson(recipePath) {
  const packageJsonPath = join(recipePath, 'package.json');
  try {
    const content = readFileSync(packageJsonPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

// Read codemod.yaml from recipe directory
function readCodemodYaml(recipePath) {
  const codemodYamlPath = join(recipePath, 'codemod.yaml');
  try {
    const content = readFileSync(codemodYamlPath, 'utf8');
    // Simple YAML parsing for version field
    const versionMatch = content.match(/version:\s*["']?([^"'\n]+)["']?/);
    return {
      name: content.match(/name:\s*["']?([^"'\n]+)["']?/)?.[1] || 'unknown',
      version: versionMatch?.[1] || '0.1.0'
    };
  } catch (error) {
    return null;
  }
}

// Bump version
function bumpVersion(version) {
  const parts = version.split('.');
  const patch = parseInt(parts[2] || '0') + 1;
  return `${parts[0]}.${parts[1]}.${patch}`;
}

// Update version in codemod.yaml
function updateCodemodYamlVersion(recipePath, newVersion) {
  const codemodYamlPath = join(recipePath, 'codemod.yaml');
  try {
    let content = readFileSync(codemodYamlPath, 'utf8');
    content = content.replace(/version:\s*["']?[^"'\n]+["']?/, `version: "${newVersion}"`);
    writeFileSync(codemodYamlPath, content);
    console.log(`📝 Updated version to ${newVersion} in codemod.yaml`);
  } catch (error) {
    console.error(`❌ Failed to update version in codemod.yaml: ${error.message}`);
  }
}

// Check if package exists in registry
function checkPackageExists(packageName) {
  console.log(`🔍 Checking if package ${packageName} exists in registry...`);
  const result = spawnSync('npx', [
    'codemod@latest', 
    'search', 
    packageName,
    '--format', 'json'
  ], { encoding: 'utf8' });
  
  if (result.status !== 0) {
    return false;
  }
  
  try {
    const searchResults = JSON.parse(result.stdout);
    return searchResults.some(pkg => pkg.name === packageName);
  } catch (error) {
    return false;
  }
}

// Publish package
function publishPackage(recipePath, packageName, isFirstTime = false) {
  console.log(`📦 Publishing ${packageName}${isFirstTime ? ' (first time)' : ''}...`);
  
  const publishArgs = [
    'codemod@latest',
    'publish',
    recipePath,
    '--scope', REGISTRY_SCOPE,
    '--access', 'public'
  ];
  
  if (REGISTRY_URL) {
    publishArgs.push('--registry', REGISTRY_URL);
  }
  
  if (isFirstTime) {
    publishArgs.push('--tag', 'latest');
  }
  
  const result = spawnSync('npx', publishArgs, { 
    cwd: process.cwd(),
    stdio: 'inherit' 
  });
  
  if (result.status !== 0) {
    console.error(`❌ Failed to publish ${packageName}`);
    return false;
  }
  
  console.log(`✅ Successfully published ${packageName}`);
  return true;
}

// Unpublish package
function unpublishPackage(packageName) {
  console.log(`🗑️  Unpublishing ${packageName}...`);
  
  const unpublishArgs = [
    'codemod@latest',
    'unpublish',
    packageName,
    '--force'
  ];
  
  if (REGISTRY_URL) {
    unpublishArgs.push('--registry', REGISTRY_URL);
  }
  
  const result = spawnSync('npx', unpublishArgs, { 
    cwd: process.cwd(),
    stdio: 'inherit' 
  });
  
  if (result.status !== 0) {
    console.error(`❌ Failed to unpublish ${packageName}`);
    return false;
  }
  
  console.log(`✅ Successfully unpublished ${packageName}`);
  return true;
}

// Main workflow
async function main() {
  try {
    // Login to registry
    loginToRegistry();
    
    // Get changed and removed recipes
    const { changed: changedRecipes, removed: removedRecipes } = getChangedFiles();
    
    if (changedRecipes.length === 0 && removedRecipes.length === 0) {
      console.log('ℹ️  No recipes changed or removed, nothing to do');
      return;
    }
    
    // Process removed recipes first
    for (const recipeName of removedRecipes) {
      console.log(`\n🗑️  Processing removed recipe: ${recipeName}`);
      
      const packageName = `@${REGISTRY_SCOPE}/${recipeName}`;
      console.log(`📋 Package: ${packageName}`);
      
      // Check if package exists before trying to unpublish
      const packageExists = checkPackageExists(packageName);
      
      if (packageExists) {
        console.log(`🗑️  Package ${packageName} exists, unpublishing...`);
        const success = unpublishPackage(packageName);
        if (success) {
          console.log(`🎉 Successfully unpublished ${packageName}`);
        }
      } else {
        console.log(`ℹ️  Package ${packageName} doesn't exist in registry, nothing to unpublish`);
      }
    }
    
    // Process each changed recipe
    for (const recipeName of changedRecipes) {
      console.log(`\n🔄 Processing recipe: ${recipeName}`);
      
      const recipePath = join(process.cwd(), 'recipes', recipeName);
      
      // Validate recipe has required files
      if (!statSync(join(recipePath, 'workflow.yaml')).isFile()) {
        console.log(`⚠️  Skipping ${recipeName}: no workflow.yaml found`);
        continue;
      }
      
      // Get package info
      const packageJson = readRecipePackageJson(recipePath);
      const codemodYaml = readCodemodYaml(recipePath);
      
      if (!codemodYaml) {
        console.log(`⚠️  Skipping ${recipeName}: no codemod.yaml found`);
        continue;
      }
      
      const packageName = `@${REGISTRY_SCOPE}/${recipeName}`;
      const currentVersion = codemodYaml.version;
      
      console.log(`📋 Package: ${packageName}`);
      console.log(`📋 Current version: ${currentVersion}`);
      
      // Check if package exists
      const packageExists = checkPackageExists(packageName);
      
      if (!packageExists) {
        // First time publishing
        console.log(`🆕 First time publishing ${packageName}`);
        const success = publishPackage(recipePath, packageName, true);
        if (success) {
          console.log(`🎉 Successfully published ${packageName} for the first time!`);
        }
      } else {
        // Package exists, check if we need to bump version
        console.log(`📦 Package ${packageName} already exists`);
        
        // For now, always bump version for updates
        const newVersion = bumpVersion(currentVersion);
        console.log(`⬆️  Bumping version from ${currentVersion} to ${newVersion}`);
        
        // Update version in codemod.yaml
        updateCodemodYamlVersion(recipePath, newVersion);
        
        // Publish new version
        const success = publishPackage(recipePath, packageName, false);
        if (success) {
          console.log(`🎉 Successfully published ${packageName} v${newVersion}!`);
        }
      }
    }
    
    console.log('\n🎉 Auto-publish workflow completed successfully!');
    
  } catch (error) {
    console.error('❌ Auto-publish workflow failed:', error.message);
    process.exit(1);
  }
}

// Run the workflow
main();
