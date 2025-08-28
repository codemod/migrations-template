// Type definitions and utilities for the migrations template

export interface CodemodRecipe {
  name: string;
  type: 'jssg' | 'ast-grep' | 'shell';
  hasTests: boolean;
}

export interface TestResult {
  recipe: string;
  passed: number;
  total: number;
  success: boolean;
}

export function createRecipe(name: string, type: CodemodRecipe['type']): CodemodRecipe {
  return {
    name,
    type,
    hasTests: false
  };
}

export function validateRecipe(recipe: CodemodRecipe): boolean {
  return recipe.name.length > 0 && recipe.type in ['jssg', 'ast-grep', 'shell'];
}
