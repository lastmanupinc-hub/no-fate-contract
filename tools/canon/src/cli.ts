#!/usr/bin/env node

import { canonicalize } from './index';
import * as fs from 'fs';
import * as path from 'path';

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: nofate-canon <file.json>');
  console.error('  Outputs: canonical JSON (stdout), SHA-256 hash (stderr)');
  process.exit(1);
}

const filePath = path.resolve(args[0]);

try {
  const content = fs.readFileSync(filePath, 'utf8');
  const json = JSON.parse(content);
  
  const result = canonicalize(json);
  
  // Output canonical form to stdout
  process.stdout.write(result.canonical);
  
  // Output hash to stderr for easy capture
  process.stderr.write(`sha256:${result.hash}\n`);
  
} catch (error: any) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
