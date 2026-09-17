#!/usr/bin/env node
/**
 * Relative-link gate — every Markdown link and anchor in the repository must
 * resolve ([docs/AGENTS.md](../docs/AGENTS.md#writing-rules): "A link must
 * resolve at the time of the change").
 *
 * Checked: relative file links, image links, and the fragment's agreement with
 * a heading slug or an explicit `id` / `<a name>` in the target file. GitHub's
 * slug rules are reproduced here, including the `-1`, `-2` suffixes for a
 * repeated heading, so a table-of-contents anchor is verified the way the
 * renderer resolves it.
 *
 * Not checked: external URLs (no network access is assumed) and absolute paths.
 *
 * Run: pnpm run check-links
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SKIP_DIRS = new Set([".git", "_recon", "dist", "node_modules", "target", "gen"]);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(join(dir, entry.name), out);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      out.push(relative(ROOT, join(dir, entry.name)).split(sep).join("/"));
    }
  }
  return out;
}

const slugify = (text) =>
  text
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .toLowerCase()
    // GitHub removes punctuation and symbols (an emoji goes too) but keeps the
    // space it occupied, so a heading that starts with one slugs to "-title".
    // Trimming here would disagree with every table of contents in the repo.
    .replace(/[^\p{L}\p{N}\p{M} _-]/gu, "")
    .replace(/ /g, "-");

/** Heading slugs plus explicit anchors, in document order. */
function anchorsOf(file) {
  const anchors = new Set();
  const seen = new Map();
  let inFence = false;
  for (const line of readFileSync(join(ROOT, file), "utf8").split("\n")) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const heading = line.match(/^\s{0,3}#{1,6}\s+(.*?)\s*#*\s*$/);
    if (heading !== null) {
      const base = slugify(heading[1]);
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      anchors.add(count === 0 ? base : `${base}-${count}`);
    }
    for (const explicit of line.matchAll(/\s(?:id|name)="([^"]+)"/g)) {
      anchors.add(explicit[1]);
    }
  }
  return anchors;
}

const anchorCache = new Map();
const links = [];
for (const file of walk(ROOT)) {
  const lines = readFileSync(join(ROOT, file), "utf8").split("\n");
  let inFence = false;
  lines.forEach((line, index) => {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      return;
    }
    if (inFence) return;
    for (const match of line.matchAll(/!?\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
      links.push({ file, line: index + 1, target: match[1] });
    }
  });
}

const problems = [];
for (const { file, line, target } of links) {
  if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith("/")) continue;
  const [rawPath, rawFragment] = target.split("#");
  const path = rawPath === undefined ? "" : rawPath.replace(/^<|>$/g, "");
  const fragment = rawFragment === undefined ? "" : decode(rawFragment);

  let resolved = path === "" ? file : join(dirname(file), path);
  resolved = relative(ROOT, resolve(ROOT, resolved)).split(sep).join("/");

  if (path !== "" && !existsSync(join(ROOT, resolved))) {
    problems.push(`${file}:${line} → ${target} (file does not exist)`);
    continue;
  }
  if (fragment === "") continue;
  if (path !== "" && statSync(join(ROOT, resolved)).isDirectory()) continue;

  if (!anchorCache.has(resolved)) anchorCache.set(resolved, anchorsOf(resolved));
  if (!anchorCache.get(resolved).has(fragment)) {
    problems.push(`${file}:${line} → ${target} (no heading or id produces "#${fragment}")`);
  }
}

function decode(fragment) {
  try {
    return decodeURIComponent(fragment);
  } catch {
    return fragment;
  }
}

if (problems.length > 0) {
  console.error(`check-links: FAIL — ${problems.length} unresolved link(s)`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}
console.log(`check-links: PASS (${links.length} links in ${walk(ROOT).length} files)`);
