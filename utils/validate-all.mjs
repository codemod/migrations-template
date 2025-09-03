#!/usr/bin/env node
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

function findWorkflows(dir) {
	return readdirSync(dir)
		.map((name) => join(dir, name))
		.filter((p) => statSync(p).isDirectory())
		.map((recipeDir) => join(recipeDir, "workflow.yaml"))
		.filter((workflowPath) => {
			try {
				statSync(workflowPath);
				return true;
			} catch {
				return false;
			}
		});
}

function run() {
	const codemodsRoot = join(process.cwd(), "codemods");
	const workflows = findWorkflows(codemodsRoot);
	for (const workflowPath of workflows) {
		process.stdout.write(`Validating ${workflowPath}\n`);
		const res = spawnSync(
			"npx",
			["-y", "codemod@latest", "workflow", "validate", "-w", workflowPath],
			{ stdio: "inherit" },
		);
		if (res.status !== 0) {
			process.exit(res.status ?? 1);
		}
	}
}

run();


