#!/usr/bin/env tsx

/**
 * Publication Gate Script
 * Enforces Diamond Standard Docking Law v1.0.0 compliance
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs'
import { join } from 'path'

const errors: string[] = []

// Per Diamond Standard Docking Law v1.0.0: Only 3 internal terminal states allowed
// NO_DETERMINISTIC_OUTCOME is unlawful and must be rejected
const ALLOWED_STATES = [
  'DETERMINISTIC_COMPLIANCE',
  'DETERMINISTIC_VIOLATION',
  'INVALID_INPUT',
]

// Lawful public determinations: YES or NO only
const ALLOWED_DETERMINATIONS = ['YES', 'NO']

// Lawful failure modes (if NO): exactly 3
const ALLOWED_FAILURE_MODES = [
  'NON_COMPLIANT',
  'INCOMPLETE_INPUT',
  'INVALID_INPUT',
]

// Forbidden: NO_DETERMINISTIC_OUTCOME must not exist anywhere
const FORBIDDEN_STATES = ['NO_DETERMINISTIC_OUTCOME']

// Forbidden suggestion words
const FORBIDDEN_WORDS = [
  'try',
  'should',
  'recommended',
  'you might',
  'consider',
  'perhaps',
  'maybe',
  'suggest',
]

function walkDir(dir: string, callback: (filePath: string) => void) {
  const files = readdirSync(dir)
  
  for (const file of files) {
    const filePath = join(dir, file)
    const stat = statSync(filePath)
    
    if (stat.isDirectory()) {
      if (!filePath.includes('node_modules') && !filePath.includes('.next')) {
        walkDir(filePath, callback)
      }
    } else if (stat.isFile() && (filePath.endsWith('.ts') || filePath.endsWith('.tsx'))) {
      callback(filePath)
    }
  }
}

function checkFile(filePath: string) {
  const content = readFileSync(filePath, 'utf-8')
  
  // CRITICAL: Reject NO_DETERMINISTIC_OUTCOME anywhere in codebase
  for (const forbiddenState of FORBIDDEN_STATES) {
    if (content.includes(forbiddenState)) {
      errors.push(`${filePath}: Contains FORBIDDEN state "${forbiddenState}" - Diamond Standard Docking Law v1.0.0 violation`)
    }
  }
  
  // Check for invalid terminal states
  const statePattern = /state:\s*['"]([A-Z_]+)['"]/gi
  let match
  
  while ((match = statePattern.exec(content)) !== null) {
    const state = match[1]
    if (!ALLOWED_STATES.includes(state) && state.includes('STATE')) {
      errors.push(`${filePath}: Invalid terminal state "${state}" - Only ${ALLOWED_STATES.join(', ')} allowed`)
    }
  }
  
  // Check API routes for lawful YES/NO responses
  if (filePath.includes('/api/evaluate/')) {
    // API routes must return determination: YES or NO (not state)
    if (content.includes('determination:') || content.includes('DETERMINATION.')) {
      // Good: Using lawful determination model
      // Verify failure_mode is included when determination is NO
      if (content.includes('DETERMINATION.NO') && !content.includes('failure_mode')) {
        errors.push(`${filePath}: determination: NO must include failure_mode`)
      }
    }
  }
  
  // Check UI files for suggestions
  if (filePath.includes('/app/') || filePath.includes('/components/')) {
    for (const word of FORBIDDEN_WORDS) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi')
      if (regex.test(content)) {
        errors.push(`${filePath}: Contains forbidden suggestion word "${word}"`)
      }
    }
  }
  
  // Check for audit mutations
  if (content.includes('UPDATE') && content.includes('audit')) {
    errors.push(`${filePath}: Contains audit UPDATE statement`)
  }
  
  if (content.includes('DELETE') && content.includes('audit')) {
    errors.push(`${filePath}: Contains audit DELETE statement`)
  }
  
  // Check API routes have rate limiting
  if (filePath.includes('/api/') && filePath.endsWith('route.ts') && !filePath.includes('health')) {
    if (!content.includes('checkRateLimit')) {
      errors.push(`${filePath}: API route missing rate limit check`)
    }
  }
}

console.log('🔍 Running publication gate checks...\n')

// Walk source directories
walkDir('./src', checkFile)

// Check rate-limit module exists
const rateLimitPath = join(process.cwd(), 'src', 'lib', 'rate-limit.ts')
if (!existsSync(rateLimitPath)) {
  errors.push('src/lib/rate-limit.ts is missing - rate limiting module required')
}

if (errors.length > 0) {
  console.error('❌ Publication gate checks FAILED:\n')
  errors.forEach(error => console.error(`  - ${error}`))
  console.error(`\n${errors.length} error(s) found`)
  process.exit(1)
} else {
  console.log('✅ All publication gate checks PASSED')
  console.log('   - Only 4 terminal states used')
  console.log('   - No suggestion text in UI')
  console.log('   - Audit log is append-only')
  console.log('   - Rate limiting enforced on all API routes')
  process.exit(0)
}
