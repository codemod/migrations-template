#!/usr/bin/env node
import { readdirSync, statSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

function findWorkflows(dir) {
	return readdirSync(dir)
		.map((name) => join(dir, name))
		.filter((p) => statSync(p).isDirectory())
		.map((recipeDir) => ({
			recipeDir,
			workflowPath: join(recipeDir, "workflow.yaml"),
		}))
		.filter(({ workflowPath }) => {
			try {
				statSync(workflowPath);
				return true;
			} catch {
				return false;
			}
		});
}

function extractJsAstGrepConfig(workflowYaml) {
	const jsFileMatch = workflowYaml.match(/js_file:\s*["']?([^"'\n]+)["']?/);
	const languageMatch = workflowYaml.match(/language:\s*["']?([^"'\n]+)["']?/);
	return {
		jsFile: jsFileMatch ? jsFileMatch[1].trim() : null,
		language: languageMatch ? languageMatch[1].trim() : "typescript",
	};
}

function run() {
	const recipesRoot = join(process.cwd(), "recipes");
	const recipes = findWorkflows(recipesRoot);
	for (const { recipeDir, workflowPath } of recipes) {
		const pkgJsonPath = join(recipeDir, "package.json");
		try {
			const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf8"));
			if (pkg?.scripts?.test) {
				process.stdout.write(`Running tests in ${recipeDir}\n\n`);
				const r1 = spawnSync("npm", ["run", "test"], { cwd: recipeDir, stdio: "inherit" });
				if (r1.status !== 0) process.exit(r1.status ?? 1);
				continue;
			}
		} catch {}

		const wf = readFileSync(workflowPath, "utf8");
		const { jsFile, language } = extractJsAstGrepConfig(wf);
		if (!jsFile) continue;
		const transformPath = join(recipeDir, jsFile);
		process.stdout.write(`Running tests in ${recipeDir}\n\n`);
		const res = spawnSync(
			"npx",
			["-y", "codemod@latest", "jssg", "test", "-l", language, transformPath, recipeDir],
			{ stdio: "inherit" },
		);
		if (res.status !== 0) process.exit(res.status ?? 1);
	}
}

run();


