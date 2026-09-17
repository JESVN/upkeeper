#!/usr/bin/env node
/**
 * Word-ceiling gate — [docs/AGENTS.md](../docs/AGENTS.md#word-budgets) owns the
 * ceilings, this script only counts and compares.
 *
 * Counting rule (from that section): western text by whitespace, each CJK
 * character as 0.6 of a word. What is excluded so the number tracks prose and
 * not markup: fenced-code delimiters, link targets, HTML comments and tags,
 * inline backticks, and tokens left with no letter or digit after the CJK
 * characters are removed — a table's pipes and rules are structure, not words.
 * Code *inside* a fence is counted, because a command costs a reader the same
 * either way.
 *
 * The ceilings are parsed out of the table in docs/AGENTS.md, so raising one is
 * a one-line documentation change and cannot drift from this script. A row's
 * label maps to files by the rules in `resolveLabel`; a row that matches no
 * file is reported rather than passed silently.
 *
 * Run: pnpm run doc-budgets
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BUDGETS_DOC = "docs/AGENTS.md";
const HEADROOM_WARN = 0.95; // ≥5% headroom under a satisfied ceiling

// CJK ideographs, kana, hangul, CJK punctuation, and fullwidth forms.
const CJK =
  /[\u3000-\u303f\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\ufe30-\ufe4f\uff00-\uffef\uac00-\ud7af]/gu;

const SKIP_DIRS = new Set([
  ".git",
  "_recon",
  "dist",
  "node_modules",
  "target",
  "gen",
]);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(join(dir, entry.name), out);
    } else if (entry.isFile()) {
      out.push(relative(ROOT, join(dir, entry.name)).split(sep).join("/"));
    }
  }
  return out;
}

function readCeilings() {
  const text = readFileSync(join(ROOT, BUDGETS_DOC), "utf8");
  const section = text.split(/^## Word budgets$/m)[1];
  if (section === undefined) {
    fail(`no "## Word budgets" section in ${BUDGETS_DOC}`);
  }
  const rows = [];
  const table = section.split("\n").filter((line) => line.startsWith("|"));
  if (table.length === 0) fail(`no ceiling table in ${BUDGETS_DOC}`);
  for (const line of table) {
    const cells = line.split("|").map((cell) => cell.trim());
    const [, label, ceiling] = cells;
    if (label === undefined || label === "" || /^-+$/.test(label.replace(/[\s:]/g, ""))) continue;
    const digits = ceiling.match(/[\d][\d,_]*/);
    const value = digits === null ? Number.NaN : Number(digits[0].replace(/[,_]/g, ""));
    if (!Number.isFinite(value)) {
      if (/^document$/i.test(label)) continue; // header row
      fail(`unreadable ceiling "${ceiling}" in ${BUDGETS_DOC}`);
    }
    rows.push({ label, ceiling: value });
  }
  if (rows.length === 0) fail(`no ceiling rows in ${BUDGETS_DOC}`);
  return rows;
}

const backticked = (label) => [...label.matchAll(/`([^`]+)`/g)].map((m) => m[1]);

/**
 * A label maps to files by shape, not by a second hand-written table:
 *   - "Skill"            → .agents/skills/<name>/SKILL.md, all of them or one named
 *   - "Subtree `X`"      → every file named X not already claimed by a literal row
 *   - a backticked path  → that path, literal
 */
function resolveLabel(label, claimed) {
  const tokens = backticked(label);
  if (/skill/i.test(label)) {
    const named = tokens.find((token) => !token.includes("/"));
    const files = allFiles.filter((file) => file.endsWith("/SKILL.md"));
    return named === undefined
      ? files
      : files.filter((file) => dirname(file).endsWith(`/${named}`));
  }
  const subtree = /subtree/i.test(label);
  const literals = tokens.filter((token) => token.includes("/") || token.endsWith(".md"));
  if (!subtree) {
    return literals.filter((file) => {
      if (allFiles.includes(file)) return true;
      fail(`${BUDGETS_DOC} budgets "${file}", which does not exist`);
    });
  }
  return tokens
    .filter((token) => !token.includes("/"))
    .flatMap((name) => allFiles.filter((file) => file.endsWith(`/${name}`) && !claimed.has(file)));
}

function countWords(source) {
  const text = source
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/```[a-z]*\n/gi, " ")
    .replace(/```/g, " ")
    .replace(/\]\([^)\s]*\)/g, "]")
    .replace(/<\/?[a-z][^>]*>/gi, " ")
    .replace(/`/g, "");
  const cjk = text.match(CJK) ?? [];
  const rest = text.replace(CJK, " ");
  const western = rest
    .split(/\s+/)
    .filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
  return cjk.length * 0.6 + western;
}

function fail(message) {
  console.error(`doc-budgets: ${message}`);
  process.exit(1);
}

const allFiles = walk(ROOT);
const ceilings = readCeilings();

// A file belongs to its most specific row: a literal path beats a named skill,
// a named skill beats the whole skill directory, and both beat a subtree rule.
// Ceilings are matched in that order and printed in the document's own order.
const priority = (label) => {
  if (/skill/i.test(label)) {
    return backticked(label).some((token) => !token.includes("/")) ? 1 : 2;
  }
  if (/subtree/i.test(label)) return 3;
  return 0;
};
const ordered = ceilings
  .map((row, index) => ({ ...row, index, priority: priority(row.label) }))
  .sort((a, b) => a.priority - b.priority || a.index - b.index);

const claimed = new Set();
for (const row of ordered) {
  row.files = resolveLabel(row.label, claimed);
  for (const file of row.files) claimed.add(file);
}

let failed = false;
let warned = false;
console.log("ceiling   count  headroom  file");
for (const { label, ceiling, files } of ordered.sort((a, b) => a.index - b.index)) {
  if (files.length === 0) {
    console.log(`  ${String(ceiling).padStart(5)}       –         –  (no file matches "${label}")`);
    failed = true;
    continue;
  }
  for (const file of files.sort()) {
    const words = countWords(readFileSync(join(ROOT, file), "utf8"));
    const ratio = words / ceiling;
    const over = words > ceiling;
    const tight = !over && ratio > HEADROOM_WARN;
    if (over) failed = true;
    if (tight) warned = true;
    const mark = over ? "OVER" : tight ? "TIGHT" : "ok";
    console.log(
      `  ${String(ceiling).padStart(5)}  ${words.toFixed(0).padStart(6)}  ` +
        `${((1 - ratio) * 100).toFixed(0).padStart(7)}%  ${file}  ${mark}`,
    );
  }
}

const unbudgeted = allFiles.filter(
  (file) => file.endsWith(".md") && !claimed.has(file) && !file.includes("/notes/"),
);
if (unbudgeted.length > 0) {
  console.log("\nnot covered by a ceiling (information only):");
  for (const file of unbudgeted.sort()) console.log(`  ${file}`);
}

if (failed) {
  console.log("\ndoc-budgets: FAIL — relocate, condense, or raise the ceiling in docs/AGENTS.md");
  process.exit(1);
}
console.log(
  warned
    ? "\ndoc-budgets: PASS with a ceiling under 5% headroom — plan a condense"
    : "\ndoc-budgets: PASS",
);
