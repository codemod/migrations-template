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

function extractWorkflowConfig(workflowYaml) {
	// Check if this is an AST-grep workflow
	const hasAstGrep = workflowYaml.includes('ast-grep:');
	// Check if this is a JSSG workflow
	const hasJsFile = workflowYaml.includes('js_file:');
	// Check if this is a shell workflow
	const hasShellScripts = workflowYaml.includes('run:') && workflowYaml.includes('.sh');
	
	return {
		hasAstGrep,
		hasJsFile,
		hasShellScripts,
		jsFile: hasJsFile ? workflowYaml.match(/js_file:\s*["']?([^"'\n]+)["']?/)?.[1]?.trim() : null,
		language: hasJsFile ? workflowYaml.match(/language:\s*["']?([^"'\n]+)["']?/)?.[1]?.trim() || "typescript" : null,
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
		const { hasAstGrep, hasJsFile, hasShellScripts, jsFile, language } = extractWorkflowConfig(wf);
		
		if (hasAstGrep) {
			// For AST-grep workflows, run the workflow to test transformations
			process.stdout.write(`Running AST-grep workflow tests in ${recipeDir}\n\n`);
			
			const testInputDir = join(recipeDir, "tests", "input");
			const testExpectedDir = join(recipeDir, "tests", "expected");
			
			try {
				// Check if we have test files to validate
				if (statSync(testInputDir).isDirectory() && statSync(testExpectedDir).isDirectory()) {
					// Get list of test files
					const inputFiles = readdirSync(testInputDir).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
					const expectedFiles = readdirSync(testExpectedDir).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
					
					if (inputFiles.length === 0) {
						process.stdout.write(`⚠️  No test input files found in ${recipeDir}\n\n`);
						continue;
					}
					
					// Run the workflow to apply transformations
					const workflowRes = spawnSync(
						"npx",
						["-y", "codemod@latest", "workflow", "run", "-w", workflowPath],
						{ cwd: recipeDir, stdio: "inherit" },
					);
					
					if (workflowRes.status !== 0) {
						process.stdout.write(`❌ Workflow execution failed in ${recipeDir}\n\n`);
						process.exit(workflowRes.status ?? 1);
					}
					
					// Validate transformations by comparing input and expected
					let testResults = [];
					let passed = 0;
					let total = 0;
					
					for (const inputFile of inputFiles) {
						const expectedFile = expectedFiles.find(f => f === inputFile);
						if (!expectedFile) {
							testResults.push(`❌ ${inputFile} - No expected output file found`);
							total++;
							continue;
						}
						
						const inputPath = join(testInputDir, inputFile);
						const expectedPath = join(testExpectedDir, expectedFile);
						
						try {
							const transformedCode = readFileSync(inputPath, "utf8");
							const expectedCode = readFileSync(expectedPath, "utf8");
							
							// Normalize whitespace for comparison
							const normalizedTransformed = transformedCode.trim().replace(/\r\n/g, '\n');
							const normalizedExpected = expectedCode.trim().replace(/\r\n/g, '\n');
							
							if (normalizedTransformed === normalizedExpected) {
								testResults.push(`✅ ${inputFile} - PASS`);
								passed++;
							} else {
								testResults.push(`❌ ${inputFile} - FAIL`);
								testResults.push(`   Expected: ${expectedCode.trim()}`);
								testResults.push(`   Got: ${transformedCode.trim()}`);
							}
							total++;
						} catch (error) {
							testResults.push(`❌ ${inputFile} - Error reading files: ${error.message}`);
							total++;
						}
					}
					
					// Display test results
					process.stdout.write(`Test Results for ${recipeDir}:\n`);
					testResults.forEach(result => process.stdout.write(`${result}\n`));
					process.stdout.write(`\n${passed}/${total} tests passed\n\n`);
					
					if (passed !== total) {
						process.stdout.write(`❌ Some tests failed in ${recipeDir}\n\n`);
						process.exit(1);
					} else {
						process.stdout.write(`✅ All tests passed in ${recipeDir}\n\n`);
					}
				} else {
					process.stdout.write(`⚠️  No test files found in ${recipeDir}, skipping validation\n\n`);
				}
			} catch (error) {
				process.stdout.write(`⚠️  No test directory found in ${recipeDir}, skipping validation\n\n`);
			}
		} else if (hasJsFile && jsFile) {
			// For JSSG workflows, use the existing logic
			const transformPath = join(recipeDir, jsFile);
			process.stdout.write(`Running JSSG tests in ${recipeDir}\n\n`);
			const res = spawnSync(
				"npx",
				["-y", "codemod@latest", "jssg", "test", "-l", language, transformPath, recipeDir],
				{ stdio: "inherit" },
			);
			if (res.status !== 0) process.exit(res.status ?? 1);
		} else if (hasShellScripts) {
			// For shell workflows, run the workflow to test execution
			process.stdout.write(`Running shell workflow tests in ${recipeDir}\n\n`);
			const res = spawnSync(
				"npx",
				["-y", "codemod@latest", "workflow", "run", "-w", workflowPath],
				{ cwd: recipeDir, stdio: "inherit" },
			);
			if (res.status !== 0) {
				process.stdout.write(`❌ Shell workflow execution failed in ${recipeDir}\n\n`);
				process.exit(res.status ?? 1);
			} else {
				process.stdout.write(`✅ Shell workflow executed successfully in ${recipeDir}\n\n`);
			}
		} else {
			process.stdout.write(`⚠️  No supported workflow type found in ${recipeDir}\n\n`);
		}
	}
}

run();


