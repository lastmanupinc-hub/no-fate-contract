#!/usr/bin/env node

import { attest } from './index';
import * as fs from 'fs';
import * as path from 'path';

const args = process.argv.slice(2);

if (args.length < 4) {
  console.error('Usage: avery-attest <bundle.json> <output.json> <emergy.json> <private_key_hex> [--out attestation.json]');
  console.error('  Creates a signed attestation after verification');
  process.exit(1);
}

const bundlePath = path.resolve(args[0]);
const outputPath = path.resolve(args[1]);
const emergyPath = path.resolve(args[2]);
const privateKeyHex = args[3];
const outputFile = args.includes('--out') ? path.resolve(args[args.indexOf('--out') + 1]) : 'attestation.json';

try {
  const bundle = JSON.parse(fs.readFileSync(bundlePath, 'utf8'));
  const output = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
  const emergy = JSON.parse(fs.readFileSync(emergyPath, 'utf8'));
  
  console.error('Verifying and attesting...');
  
  attest(bundle, output, emergy, privateKeyHex, 'Avery').then(attestation => {
    fs.writeFileSync(outputFile, JSON.stringify(attestation, null, 2));
    console.error(`✓ Attestation signed and written to: ${outputFile}`);
    console.log(JSON.stringify(attestation, null, 2));
  }).catch(error => {
    console.error(`✗ Attestation failed: ${error.message}`);
    process.exit(1);
  });
  
} catch (error: any) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
