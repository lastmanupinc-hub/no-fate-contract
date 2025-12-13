const fs = require('fs');
const path = require('path');
const { solve } = require('@nofate/solve');
const { verify } = require('@nofate/avery-verify');
const { replay } = require('@nofate/avery-replay');
const { canonicalize } = require('@nofate/canon');

// Test vector directories
const VECTORS_DIR = path.join(__dirname, '..', 'vectors');
const EXPECTED_DIR = path.join(__dirname, '..', 'expected');

// Find all test vectors
const testFiles = fs.readdirSync(VECTORS_DIR).filter(f => f.endsWith('.json'));

console.log(`Running ${testFiles.length} conformance tests...\n`);

let passed = 0;
let failed = 0;

for (const testFile of testFiles) {
  const testId = testFile.replace('.json', '');
  console.log(`Test: ${testId}`);
  
  try {
    // Load test vector
    const bundlePath = path.join(VECTORS_DIR, testFile);
    const bundle = JSON.parse(fs.readFileSync(bundlePath, 'utf8'));
    
    // Load expected outputs
    const expectedOutputPath = path.join(EXPECTED_DIR, `${testId}-output.json`);
    const expectedEmergyPath = path.join(EXPECTED_DIR, `${testId}-emergy.json`);
    
    if (!fs.existsSync(expectedOutputPath)) {
      console.log(`  ⚠️  No expected output found (${expectedOutputPath})`);
      console.log(`  💡 Run: nofate-solve ${bundlePath} --out ${expectedOutputPath} --emergy ${expectedEmergyPath}\n`);
      continue;
    }
    
    const expectedOutput = JSON.parse(fs.readFileSync(expectedOutputPath, 'utf8'));
    const expectedEmergy = fs.existsSync(expectedEmergyPath) 
      ? JSON.parse(fs.readFileSync(expectedEmergyPath, 'utf8'))
      : null;
    
    // Run solver
    const solveResult = solve(bundle);
    const actualOutput = solveResult.output;
    const actualEmergy = solveResult.emergy;
    
    // Compare outputs via hash
    const expectedOutputCanonical = canonicalize(expectedOutput);
    const actualOutputCanonical = canonicalize(actualOutput);
    
    if (expectedOutputCanonical.hash !== actualOutputCanonical.hash) {
      console.log(`  ❌ FAILED: Output hash mismatch`);
      console.log(`     Expected: sha256:${expectedOutputCanonical.hash}`);
      console.log(`     Actual:   sha256:${actualOutputCanonical.hash}`);
      failed++;
    } else {
      console.log(`  ✅ PASSED: Output matches expected`);
      
      // If emergy exists, verify it
      if (expectedEmergy) {
        const verifyResult = verify(bundle, actualOutput, actualEmergy);
        if (verifyResult.valid) {
          console.log(`  ✅ Emergy verification passed`);
        } else {
          console.log(`  ⚠️  Emergy verification failed: ${verifyResult.errors.join(', ')}`);
        }
        
        // Replay test
        const replayResult = replay(bundle, expectedOutput, expectedEmergy);
        if (replayResult.deterministic) {
          console.log(`  ✅ Replay confirmed (deterministic)`);
        } else {
          console.log(`  ⚠️  Replay failed: ${replayResult.differences.join(', ')}`);
        }
      }
      
      passed++;
    }
    
  } catch (error) {
    console.log(`  ❌ ERROR: ${error.message}`);
    failed++;
  }
  
  console.log('');
}

console.log(`\nResults: ${passed} passed, ${failed} failed (${testFiles.length} total)`);
process.exit(failed > 0 ? 1 : 0);
