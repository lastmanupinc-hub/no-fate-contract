#!/usr/bin/env node

import { verify } from './index';
import * as fs from 'fs';
import * as path from 'path';

const args = process.argv.slice(2);

if (args.length < 3) {
  console.error('Usage: avery-verify <bundle.json> <output.json> <emergy.json>');
  console.error('  Verifies that output and emergy are valid for the given bundle');
  process.exit(1);
}

const bundlePath = path.resolve(args[0]);
const outputPath = path.resolve(args[1]);
const emergyPath = path.resolve(args[2]);

try {
  const bundle = JSON.parse(fs.readFileSync(bundlePath, 'utf8'));
  const output = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
  const emergy = JSON.parse(fs.readFileSync(emergyPath, 'utf8'));
  
  console.error('Verifying...');
  const result = verify(bundle, output, emergy);
  
  if (result.valid) {
    console.error('✓ Verification passed');
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  } else {
    console.error('✗ Verification failed');
    console.error('Errors:');
    result.errors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  }
  
} catch (error: any) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
