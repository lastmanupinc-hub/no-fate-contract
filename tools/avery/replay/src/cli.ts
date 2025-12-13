#!/usr/bin/env node

import { replay } from './index';
import * as fs from 'fs';
import * as path from 'path';

const args = process.argv.slice(2);

if (args.length < 3) {
  console.error('Usage: avery-replay <bundle.json> <output.json> <emergy.json>');
  console.error('  Re-runs solver and verifies byte-identical outputs');
  process.exit(1);
}

const bundlePath = path.resolve(args[0]);
const outputPath = path.resolve(args[1]);
const emergyPath = path.resolve(args[2]);

try {
  const bundle = JSON.parse(fs.readFileSync(bundlePath, 'utf8'));
  const expectedOutput = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
  const expectedEmergy = JSON.parse(fs.readFileSync(emergyPath, 'utf8'));
  
  console.error('Replaying computation...');
  const result = replay(bundle, expectedOutput, expectedEmergy);
  
  if (result.deterministic) {
    console.error('✓ Replay confirmed: outputs are byte-identical');
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  } else {
    console.error('✗ Replay failed: outputs differ');
    console.error('Differences:');
    result.differences.forEach(diff => console.error(`  - ${diff}`));
    process.exit(1);
  }
  
} catch (error: any) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
