/**
 * Removes console.* calls from source files using the TypeScript AST.
 */
import fs from "fs";
import path from "path";
import ts from "typescript";

const CONSOLE_METHODS = new Set([
  "log",
  "debug",
  "info",
  "warn",
  "error",
  "trace",
  "dir",
  "dirxml",
  "table",
  "group",
  "groupCollapsed",
  "groupEnd",
  "time",
  "timeEnd",
  "timeLog",
  "assert",
  "count",
  "clear",
  "profile",
  "profileEnd",
]);

const SRC_DIR = path.resolve("src");
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx"]);

function isConsoleAccess(node) {
  return (
    ts.isPropertyAccessExpression(node) &&
    ts.isIdentifier(node.expression) &&
    node.expression.text === "console" &&
    ts.isIdentifier(node.name) &&
    CONSOLE_METHODS.has(node.name.text)
  );
}

function isConsoleCall(node) {
  return ts.isCallExpression(node) && isConsoleAccess(node.expression);
}

function walkDir(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(full, files);
    } else if (EXTENSIONS.has(path.extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

function getScriptKind(filePath) {
  const ext = path.extname(filePath);
  if (ext === ".tsx") return ts.ScriptKind.TSX;
  if (ext === ".ts") return ts.ScriptKind.TS;
  if (ext === ".jsx") return ts.ScriptKind.JSX;
  return ts.ScriptKind.JS;
}

function processFile(filePath) {
  const original = fs.readFileSync(filePath, "utf8");
  const sourceFile = ts.createSourceFile(
    filePath,
    original,
    ts.ScriptTarget.Latest,
    true,
    getScriptKind(filePath),
  );

  const replacements = [];

  function addReplacement(start, end, text) {
    replacements.push({ start, end, text });
  }

  function visit(node) {
    // .catch(console.error) -> .catch(() => {})
    if (ts.isCallExpression(node)) {
      const expr = node.expression;
      if (
        ts.isPropertyAccessExpression(expr) &&
        expr.name.text === "catch" &&
        node.arguments.length === 1 &&
        isConsoleAccess(node.arguments[0])
      ) {
        const arg = node.arguments[0];
        addReplacement(arg.getStart(sourceFile), arg.getEnd(), "() => {}");
      }
    }

    if (isConsoleCall(node)) {
      const parent = node.parent;

      if (ts.isExpressionStatement(parent) && parent.expression === node) {
        let start = parent.getStart(sourceFile);
        let end = parent.getEnd();
        // Include trailing newline when the statement is on its own line
        if (original[end] === "\n") end += 1;
        if (original[end] === "\r") end += 1;
        addReplacement(start, end, "");
        ts.forEachChild(node, visit);
        return;
      }

      if (ts.isAwaitExpression(parent) && ts.isExpressionStatement(parent.parent)) {
        const stmt = parent.parent;
        let start = stmt.getStart(sourceFile);
        let end = stmt.getEnd();
        if (original[end] === "\n") end += 1;
        if (original[end] === "\r") end += 1;
        addReplacement(start, end, "");
        ts.forEachChild(node, visit);
        return;
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  if (replacements.length === 0) return 0;

  replacements.sort((a, b) => b.start - a.start);
  let result = original;
  for (const { start, end, text } of replacements) {
    result = result.slice(0, start) + text + result.slice(end);
  }

  // Collapse 3+ consecutive blank lines to 2
  result = result.replace(/\n{4,}/g, "\n\n\n");

  fs.writeFileSync(filePath, result, "utf8");
  return replacements.length;
}

const files = walkDir(SRC_DIR);
let total = 0;
let fileCount = 0;

for (const file of files) {
  const count = processFile(file);
  if (count > 0) {
    total += count;
    fileCount += 1;
    console.log(`  ${path.relative(process.cwd(), file)}: ${count}`);
  }
}

console.log(`\nDone: ${total} replacement(s) in ${fileCount} file(s).`);
