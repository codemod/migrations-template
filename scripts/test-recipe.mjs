#!/usr/bin/env node
import { spawnSync } from "child_process";
import { join } from "path";

const recipeName = process.argv[2];

if (!recipeName) {
  console.log("Usage: node scripts/test-recipe.mjs <recipe-name>");
  console.log("Example: node scripts/test-recipe.mjs my-codemod");
  process.exit(1);
}

const recipePath = join(process.cwd(), "recipes", recipeName);
const workflowPath = join(recipePath, "workflow.yaml");

console.log(`Testing recipe: ${recipeName}`);
console.log(`Workflow path: ${workflowPath}\n`);

const result = spawnSync(
  "npx",
  ["-y", "codemod@latest", "workflow", "run", "-w", workflowPath],
  { cwd: recipePath, stdio: "inherit" }
);

if (result.status === 0) {
  console.log(`\n✅ Recipe ${recipeName} tested successfully!`);
} else {
  console.log(`\n❌ Recipe ${recipeName} test failed with exit code ${result.status}`);
  process.exit(result.status);
}
