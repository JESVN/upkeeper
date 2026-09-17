#!/usr/bin/env node
/**
 * Agent Note format gate — [.agents/notes/README.md](../.agents/notes/README.md)
 * defines the path encoding, the header, and the required sections; this script
 * checks a note against them.
 *
 * Checked, per note:
 *   - the path is `{lifecycle}/{class}/YYYY-MM-DD-topic-title.md`, with both
 *     folders from the documented vocabulary and no note outside a class folder;
 *   - `# Agent Note: <title>` is the first line and `Status: <value>` follows it;
 *   - the status agrees with the lifecycle folder, and `rejected` carries its
 *     one-line reason while `archived` carries an `Archived: YYYY-MM-DD` line;
 *   - the sections that body type requires are present as `##` headings.
 *
 * Run: pnpm run notes-format
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const NOTES = ".agents/notes";

const CLASSES = [
  "feature",
  "bug-fix",
  "simplification",
  "architecture",
  "process",
  "testing",
];

const BODIES = {
  proposed: {
    status: /^Status: proposed$/,
    sections: ["Problem", "Proposal", "Alternatives considered", "Acceptance criteria", "Risks"],
  },
  implemented: {
    status: /^Status: implemented$/,
    sections: ["Problem", "Decision", "Alternatives considered", "Consequences", "Verification"],
  },
  rejected: { status: /^Status: rejected — \S/, sections: [] },
  archived: { status: /^Status: \S/, sections: [], archived: true },
};

const NAME = /^\d{4}-\d{2}-\d{2}-[a-z0-9]+([.-][a-z0-9]+)*\.md$/;
const problems = [];
const notes = [];

function visit(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    const rel = relative(ROOT, path).split(sep).join("/");
    if (entry.isDirectory()) {
      visit(path);
    } else if (entry.isFile() && entry.name.endsWith(".md") && entry.name !== "README.md") {
      if (entry.name !== "AGENTS.md") notes.push(rel);
    }
  }
}

visit(join(ROOT, NOTES));

for (const file of notes) {
  const parts = file.split("/");
  const lifecycle = parts[2];
  const noteClass = parts[3];
  const name = parts[4];
  const body = BODIES[lifecycle];

  if (parts.length !== 5) {
    problems.push(`${file}: a note is {lifecycle}/{class}/<file>, not a file at this depth`);
    continue;
  }
  if (body === undefined) {
    problems.push(`${file}: "${lifecycle}" is not one of proposed, implemented, rejected, archived`);
    continue;
  }
  if (!CLASSES.includes(noteClass)) {
    problems.push(`${file}: "${noteClass}" is not one of ${CLASSES.join(", ")}`);
  }
  if (!NAME.test(name)) {
    problems.push(`${file}: the file name is not YYYY-MM-DD-topic-title.md`);
  }

  const lines = readFileSync(join(ROOT, file), "utf8").split("\n");
  const title = lines.findIndex((line) => line.trim() !== "");
  // The header is `# Agent Note: <title>`, a blank line, then `Status: <status>`.
  const status = lines.findIndex((line, index) => index > title && line.trim() !== "");
  if (title === -1 || !/^# Agent Note: \S/.test(lines[title])) {
    problems.push(`${file}: the first line is not "# Agent Note: <title>"`);
  }
  if (status === -1) {
    problems.push(`${file}: no "Status:" line`);
    continue;
  }
  if (!body.status.test(lines[status])) {
    problems.push(`${file}: "${lines[status]}" does not match the ${lifecycle} status`);
  }
  if (lines.slice(title + 1, status).some((line) => line.trim() !== "")) {
    problems.push(`${file}: "Status:" must be the first line after the title`);
  }
  if (body.archived === true && !lines.some((line) => /^Archived: \d{4}-\d{2}-\d{2}$/.test(line))) {
    problems.push(`${file}: an archived note carries "Archived: YYYY-MM-DD"`);
  }

  const headings = new Set(
    lines.filter((line) => line.startsWith("## ")).map((line) => line.slice(3).trim()),
  );
  for (const section of body.sections) {
    if (!headings.has(section)) problems.push(`${file}: missing "## ${section}"`);
  }
}

if (problems.length > 0) {
  console.error(`notes-format: FAIL — ${problems.length} problem(s)`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}
console.log(`notes-format: PASS (${notes.length} notes)`);
