// Grading script.
import { run } from 'node:test';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const reveal = process.argv.includes('--reveal');

function readFromBranch(file) {
  for (const ref of ['origin/facilitator', 'facilitator']) {
    try {
      return execFileSync('git', ['show', `${ref}:${file}`], {
        cwd: root,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
    } catch {}
  }
  console.error('Scoring data not found. Run: git fetch origin facilitator:facilitator');
  process.exit(1);
}

const dir = mkdtempSync(join(tmpdir(), 'burger-score-'));
const file = join(dir, 'acceptance.test.js');
writeFileSync(file, readFromBranch('acceptance.test.js'));
process.env.BURGER_ROOT = root;

const results = [];
const stream = run({ files: [file], concurrency: 1 });

stream.on('data', (event) => {
  if (event.type !== 'test:pass' && event.type !== 'test:fail') return;
  if (event.data.nesting !== 0 || event.data.details?.type === 'suite') return;
  results.push({ name: event.data.name, passed: event.type === 'test:pass' });
});

stream.on('end', () => {
  rmSync(dir, { recursive: true, force: true });
  const passed = results.filter((r) => r.passed).length;

  if (reveal) {
    for (const r of results) console.log(`${r.passed ? '✔' : '✘'} ${r.name}`);
    console.log('');
  }
  console.log(`Score: ${passed}/${results.length}`);
});
