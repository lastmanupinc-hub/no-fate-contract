#!/usr/bin/env node

import { solve } from './index';
import * as fs from 'fs';
import * as path from 'path';

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: nofate-solve <bundle.json> [--out output.json] [--emergy emergy.json]');
  process.exit(1);
}

const bundlePath = path.resolve(args[0]);
const outputPath = args.includes('--out') ? path.resolve(args[args.indexOf('--out') + 1]) : 'output.json';
const emergyPath = args.includes('--emergy') ? path.resolve(args[args.indexOf('--emergy') + 1]) : 'emergy.json';

try {
  const bundleContent = fs.readFileSync(bundlePath, 'utf8');
  const bundle = JSON.parse(bundleContent);
  
  console.error('Solving...');
  const result = solve(bundle);
  
  // Write output
  fs.writeFileSync(outputPath, JSON.stringify(result.output, null, 2));
  console.error(`Output written to: ${outputPath}`);
  
  // Write emergy
  fs.writeFileSync(emergyPath, JSON.stringify(result.emergy, null, 2));
  console.error(`Emergy written to: ${emergyPath}`);
  
  console.error(`Result: ${result.output.result}`);
  
} catch (error: any) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
