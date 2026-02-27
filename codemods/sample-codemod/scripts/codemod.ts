import type { Edit, SgNode, SgRoot } from "codemod:ast-grep";
import type TSX from "codemod:ast-grep/langs/tsx";
import { useMetricAtom } from "codemod:metrics";

// Cardinalities:
//   change-type: "hoisted" | "skipped-closure"
//   component-form: "arrow" | "function-decl"

const hoistedMetric = useMetricAtom("react-hoist-nested-components");

/** Intrinsic HTML/SVG elements - not variable references */
const INTRINSIC_ELEMENTS = new Set([
	"a", "abbr", "address", "area", "article", "aside", "audio", "b", "base",
	"bdi", "bdo", "blockquote", "body", "br", "button", "canvas", "caption",
	"cite", "code", "col", "colgroup", "data", "datalist", "dd", "del", "details",
	"dfn", "dialog", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption",
	"figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head",
	"header", "hgroup", "hr", "html", "i", "iframe", "img", "input", "ins", "kbd",
	"label", "legend", "li", "link", "main", "map", "mark", "menu", "meta", "meter",
	"nav", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param",
	"picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "section",
	"select", "slot", "small", "source", "span", "strong", "style", "sub", "summary",
	"sup", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead",
	"time", "title", "tr", "track", "u", "ul", "var", "video", "wbr",
	"svg", "path", "circle", "rect", "line", "ellipse", "polyline", "polygon",
	"g", "defs", "use", "stop", "linearGradient", "radialGradient",
]);

function isReactComponent(node: SgNode<TSX>): boolean {
	if (node.is("function_declaration")) {
	return node.has({ rule: { kind: "jsx_element" } }) ||
		node.has({ rule: { kind: "jsx_self_closing_element" } });
	}
	if (node.is("arrow_function") || node.is("function")) {
	return node.has({ rule: { kind: "jsx_element" } }) ||
		node.has({ rule: { kind: "jsx_self_closing_element" } });
	}
	return false;
}

function getComponentNode(declOrStmt: SgNode<TSX>): SgNode<TSX> | null {
	if (declOrStmt.is("function_declaration") && isReactComponent(declOrStmt)) {
		return declOrStmt;
	}
	if (declOrStmt.is("lexical_declaration") || declOrStmt.is("variable_declaration")) {
		const declarators = declOrStmt.findAll({
			rule: { kind: "variable_declarator" },
		});
		for (const d of declarators) {
			const init = d.field("value");
			if (init && (init.is("arrow_function") || init.is("function")) && isReactComponent(init)) {
				return init;
			}
		}
	}
	return null;
}

function getComponentName(declOrStmt: SgNode<TSX>): string | null {
	if (declOrStmt.is("function_declaration")) {
		const name = declOrStmt.field("name");
		return name?.text() ?? null;
	}
	if (declOrStmt.is("lexical_declaration") || declOrStmt.is("variable_declaration")) {
		const declarators = declOrStmt.findAll({
			rule: {
				kind: "variable_declarator",
				has: { kind: "identifier" },
			},
		});
		for (const d of declarators) {
			const init = d.field("value");
			if (init && (init.is("arrow_function") || init.is("function")) && isReactComponent(init)) {
				const name = d.field("name");
				if (name?.is("identifier")) return name.text();
			}
		}
	}
	return null;
}

/** Returns the statement or declaration node that defines the nested component (for removal) */
function getEnclosingStatement(innerComponent: SgNode<TSX>): SgNode<TSX> {
	let node: SgNode<TSX> | null = innerComponent;
	while (node) {
		if (node.is("statement_block") || node.is("program")) break;
		if (node.is("function_declaration") || node.is("lexical_declaration") || node.is("variable_declaration")) {
			return node;
		}
		node = node.parent();
	}
	return innerComponent;
}

/** Collect names declared in a scope (params, variable declarators) */
function getOuterScopeBindings(outerComponent: SgNode<TSX>): Set<string> {
	const bindings = new Set<string>();
	// Params
	const params = outerComponent.field("parameters");
	if (params) {
		for (const p of params.findAll({ rule: { kind: "identifier" } })) {
			bindings.add(p.text());
		}
	}
	// Local declarations in outer body
	const body = outerComponent.field("body");
	if (body) {
		for (const decl of body.findAll({
			rule: {
				any: [
					{ kind: "variable_declarator" },
					{ kind: "function_declaration" },
				],
			},
		})) {
			if (decl.is("variable_declarator")) {
				const name = decl.field("name");
				if (name?.is("identifier")) bindings.add(name.text());
				// array_pattern [a, b]
				if (name?.is("array_pattern")) {
					for (const id of name.findAll({ rule: { kind: "identifier" } })) {
						bindings.add(id.text());
					}
				}
			}
			if (decl.is("function_declaration")) {
				const name = decl.field("name");
				if (name?.is("identifier")) bindings.add(name.text());
			}
		}
	}
	return bindings;
}

/** Check if node A is a descendant of (or equal to) node B */
function isInside(node: SgNode<TSX>, ancestor: SgNode<TSX>): boolean {
	let current: SgNode<TSX> | null = node;
	while (current) {
		if (current.id() === ancestor.id()) return true;
		current = current.parent();
	}
	return false;
}

/** Collect identifier nodes in inner component that could reference outer scope (excluding params, intrinsics, property names) */
function getInnerReferencedIdentifierNodes(innerComponent: SgNode<TSX>): SgNode<TSX>[] {
	const innerParams = new Set<string>();
	const params = innerComponent.field("parameters");
	if (params) {
		for (const p of params.findAll({ rule: { kind: "identifier" } })) {
			innerParams.add(p.text());
		}
	}
	const nodes: SgNode<TSX>[] = [];
	for (const id of innerComponent.findAll({ rule: { kind: "identifier" } })) {
		const name = id.text();
		if (innerParams.has(name)) continue;
		if (INTRINSIC_ELEMENTS.has(name)) continue;
		const parent = id.parent();
		if (parent?.is("member_expression") && parent.field("property")?.id() === id.id()) continue;
		nodes.push(id);
	}
	return nodes;
}

/** Check if inner component references outer scope (closure-dependent) using semantic analysis */
function hasClosureDependency(
	innerComponent: SgNode<TSX>,
	outerComponent: SgNode<TSX>,
	innerName: string,
): boolean {
	const outerBindings = getOuterScopeBindings(outerComponent);
	outerBindings.delete(innerName); // Self-reference is safe to hoist
	const identifierNodes = getInnerReferencedIdentifierNodes(innerComponent);
	for (const idNode of identifierNodes) {
		const name = idNode.text();
		const def = idNode.definition();
		if (def === null) {
			// Semantic analysis couldn't resolve (e.g. globals) — conservative fallback to name check
			if (outerBindings.has(name)) return true;
			continue;
		}
		if (def.kind === "import" || def.kind === "external") {
			// Defined elsewhere — not a closure dependency on outer scope
			continue;
		}
		// def.kind === "local" — check if definition is in outer scope (inside outer, outside inner)
		if (isInside(def.node, outerComponent) && !isInside(def.node, innerComponent)) return true;
	}
	return false;
}

function findOuterComponent(innerStatement: SgNode<TSX>): SgNode<TSX> | null {
	let node: SgNode<TSX> | null = innerStatement.parent();
	while (node) {
		if (node.is("program")) return null;
		if (node.is("function_declaration") && isReactComponent(node)) return node;
		if (node.is("arrow_function") || node.is("function")) {
			if (isReactComponent(node)) return node;
		}
		node = node.parent();
	}
	return null;
}

async function transform(root: SgRoot<TSX>): Promise<string | null> {
	const rootNode = root.root();
	const program = rootNode;
	const edits: Edit[] = [];

	// Find nested components: function decl or const/let = arrow/function inside another component
	const functionDecls = program.findAll({
		rule: {
			kind: "function_declaration",
			inside: { kind: "statement_block" },
		},
	});

	const lexicalDecls = program.findAll({
		rule: {
			kind: "lexical_declaration",
			inside: { kind: "statement_block" },
		},
	});

	const candidates: Array<{ node: SgNode<TSX>; outer: SgNode<TSX> }> = [];

	for (const decl of functionDecls) {
		if (!isReactComponent(decl)) continue;
		const outer = findOuterComponent(decl);
		if (outer) candidates.push({ node: decl, outer });
	}

	for (const decl of lexicalDecls) {
		const component = getComponentNode(decl);
		if (!component) continue;
		const outer = findOuterComponent(decl);
		if (outer) candidates.push({ node: decl, outer });
	}

	// Process innermost first (by position end, descending) so edits don't shift
	candidates.sort((a, b) => {
		const aEnd = a.node.range().end.index;
		const bEnd = b.node.range().end.index;
		return bEnd - aEnd;
	});

	for (const { node: declOrStmt, outer } of candidates) {
		const component = declOrStmt.is("function_declaration") ? declOrStmt : getComponentNode(declOrStmt);
		if (!component) continue;

		const name = getComponentName(declOrStmt);
		if (!name) continue;

		const closureDependent = hasClosureDependency(component, outer, name);

		if (closureDependent) {
			hoistedMetric.increment({ "change-type": "skipped-closure", "file": root.filename() });
			// Add a flag comment above the nested component (preserve indentation)
			const stmt = getEnclosingStatement(component);
			const start = stmt.range().start.index;
			const before = rootNode.text().slice(0, start);
			const lineStart = before.lastIndexOf("\n") + 1;
			const indent = rootNode.text().slice(lineStart, start).match(/^\s*/)?.[0] ?? "";
			edits.push({
				startPos: lineStart,
				endPos: lineStart,
				insertedText: `${indent}// codemod: closure-dependent — hoist manually and pass outer vars as props\n`,
			});
			continue;
		}

		// Safe to hoist - insert before the outer component's declaration
		const stmt = getEnclosingStatement(component);
		let componentText = stmt.text();
		// Strip one level of leading indent (component was nested inside another)
		componentText = componentText.replace(/^\s+/, "");
		if (stmt.is("function_declaration")) {
			// Reduce body indent by one tab/level for each line
			componentText = componentText.replace(/\n(\t)/g, "\n");
		}
		const outerStmt = getEnclosingStatement(outer);
		const outerStart = outerStmt.range().start.index;
		// function_declaration needs no trailing semicolon; const/let already has one
		const textToInsert = stmt.is("function_declaration")
			? `${componentText}\n\n`
			: (componentText.endsWith(";") ? `${componentText}\n\n` : `${componentText};\n\n`);

		edits.push({
			startPos: outerStart,
			endPos: outerStart,
			insertedText: textToInsert,
		});
		// Remove statement and the newline after it (up to but not including next statement's indent)
		const stmtRange = stmt.range();
		const nextStmt = stmt.next();
		const removalEnd = nextStmt
			? nextStmt.range().start.index
			: stmtRange.end.index;
		edits.push({
			startPos: stmtRange.start.index,
			endPos: removalEnd,
			insertedText: "",
		});

		const form = declOrStmt.is("function_declaration") ? "function-decl" : "arrow";
		hoistedMetric.increment({ "change-type": "hoisted", "component-form": form, "file": root.filename() });
	}

	if (edits.length === 0) return null;
	return rootNode.commitEdits(edits);
}

export default transform;
