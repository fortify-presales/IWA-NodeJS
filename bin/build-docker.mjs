#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const registry = process.env.NEXUS_REPO_NPM || 'https://registry.npmjs.org/';
const args = [
  'buildx', 'build', '--load',
  '--build-arg', `NEXUS_REPO_NPM=${registry}`,
];

if (process.env.NEXUS_REPO_AUTH) {
  args.push('--secret', 'id=nexus_repo_auth,env=NEXUS_REPO_AUTH');
}
args.push('-t', 'iwa-nodejs', '.');

const result = spawnSync('docker', args, { stdio: 'inherit' });
if (result.error) {
  console.error(`Docker build could not start: ${result.error.message}`);
}
process.exit(result.status ?? 1);