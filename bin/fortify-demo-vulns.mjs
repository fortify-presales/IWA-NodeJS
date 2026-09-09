#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');

const changeReviewDemos = new Map([
  ['cwe-89-username-lookup', {
    title: 'CWE-89 SQL injection in username lookup',
    patch: 'demo-patches/fortify-change-review/cwe-89-username-lookup.patch',
  }],
  ['cwe-918-newsletter-template', {
    title: 'CWE-918 SSRF in newsletter template fetch',
    patch: 'demo-patches/fortify-change-review/cwe-918-newsletter-template.patch',
  }],
]);

const remediationDemos = new Map([
  ['route-visible-sqli-ssrf', {
    title: 'Route-visible SQL injection and SSRF targets for Fortify Remediation Aviator',
    patch: 'demo-patches/fortify-remediate/route-visible-sqli-ssrf.patch',
  }],
]);

function runGit(args, options = {}) {
  return spawnSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: options.stdio ?? 'pipe',
  });
}

function requireGitRepo() {
  const result = runGit(['rev-parse', '--show-toplevel']);
  if (result.status !== 0 || path.resolve(result.stdout.trim()) !== repoRoot) {
    throw new Error('Run this command from the IWA-NodeJS git repository.');
  }
}

function parseArgs(argv) {
  const parsed = { command: argv[0] ?? 'help', demo: 'all', force: false };
  for (let index = 1; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--force') {
      parsed.force = true;
    } else if (arg === '--demo') {
      parsed.demo = argv[index + 1] ?? '';
      index += 1;
    } else if (arg.startsWith('--demo=')) {
      parsed.demo = arg.slice('--demo='.length);
    }
  }
  return parsed;
}

function selectedDemos(demoSet, demoId) {
  if (demoId === 'all') return [...demoSet.entries()];
  const demoIds = demoId.split(',').map((id) => id.trim());
  if (demoIds.some((id) => !id)) {
    throw new Error('Demo IDs must be comma-separated with no empty values.');
  }
  return demoIds.map((id) => {
    const demo = demoSet.get(id);
    if (!demo) throw new Error(`Unknown demo '${id}'. Run 'list' to see available demos.`);
    return [id, demo];
  });
}

function patchPath(demo) {
  return path.resolve(repoRoot, demo.patch);
}

function patchTargets(demo) {
  const contents = fs.readFileSync(patchPath(demo), 'utf8');
  return [...contents.matchAll(/^\+\+\+ b\/(.+)$/gm)].map(match => match[1]);
}

function ensureCleanTargets(demo, demoId, force) {
  if (force) return;
  const modified = patchTargets(demo).filter((target) => runGit(['diff', '--quiet', '--', target]).status !== 0);
  if (modified.length > 0) {
    throw new Error(`Refusing to modify local changes for ${demoId}: ${modified.join(', ')}. Re-run with --force to override this guard.`);
  }
}

function checkPatch(demo, reverse = false) {
  const args = ['apply', '--check', '--whitespace=nowarn'];
  if (reverse) args.push('--reverse');
  args.push(demo.patch);
  return runGit(args);
}

function applyPatch(demo) {
  const result = runGit(['apply', '--whitespace=nowarn', demo.patch], { stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`git apply failed for ${demo.patch}`);
}

function reversePatch(demo) {
  const result = runGit(['apply', '--reverse', '--whitespace=nowarn', demo.patch], { stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`git apply --reverse failed for ${demo.patch}`);
}

function list() {
  console.log('Change-review patch demos:');
  for (const [id, demo] of changeReviewDemos) {
    console.log(`  ${id}: ${demo.title}`);
  }
  console.log('\nFortify-remediate branch patch demos:');
  for (const [id, demo] of remediationDemos) {
    console.log(`  ${id}: ${demo.title}`);
  }
  console.log('\nRemediation demo route anchors after applying and committing the patch:');
  console.log('  GET  /api/v3/remediation-demo/sql-injection?username=admin');
  console.log('  POST /api/v3/remediation-demo/ssrf { "templateUrl": "http://169.254.169.254/latest/meta-data/" }');
}

function apply(demoSet, demoId, force) {
  for (const [id, demo] of selectedDemos(demoSet, demoId)) {
    ensureCleanTargets(demo, id, force);
    const check = checkPatch(demo);
    if (check.status !== 0) throw new Error(`Patch is not applicable for ${id}. It may already be applied.\n${check.stderr}`);
    applyPatch(demo);
    console.log(`Applied ${id}`);
  }
}

function revert(demoSet, demoId) {
  for (const [id, demo] of selectedDemos(demoSet, demoId)) {
    const check = checkPatch(demo, true);
    if (check.status !== 0) throw new Error(`Patch is not reversible for ${id}. It may not be applied.\n${check.stderr}`);
    reversePatch(demo);
    console.log(`Reverted ${id}`);
  }
}

function status(demoSet) {
  for (const [id, demo] of demoSet) {
    const canApply = checkPatch(demo).status === 0;
    const canRevert = checkPatch(demo, true).status === 0;
    const state = canRevert ? 'applied' : canApply ? 'available' : 'conflict';
    console.log(`${id}: ${state}`);
  }
}

function usage() {
  console.log(`Usage:
  node bin/fortify-demo-vulns.mjs list
  node bin/fortify-demo-vulns.mjs status
  node bin/fortify-demo-vulns.mjs apply --demo <id[,id...]|all> [--force]
  node bin/fortify-demo-vulns.mjs revert --demo <id[,id...]|all>
  node bin/fortify-demo-vulns.mjs status-remediate
  node bin/fortify-demo-vulns.mjs apply-remediate --demo <id[,id...]|all> [--force]
  node bin/fortify-demo-vulns.mjs revert-remediate --demo <id[,id...]|all>`);
}

try {
  requireGitRepo();
  const args = parseArgs(process.argv.slice(2));
  if (args.command === 'list') list();
  else if (args.command === 'status') status(changeReviewDemos);
  else if (args.command === 'apply') apply(changeReviewDemos, args.demo, args.force);
  else if (args.command === 'revert') revert(changeReviewDemos, args.demo);
  else if (args.command === 'status-remediate') status(remediationDemos);
  else if (args.command === 'apply-remediate') apply(remediationDemos, args.demo, args.force);
  else if (args.command === 'revert-remediate') revert(remediationDemos, args.demo);
  else usage();
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
}