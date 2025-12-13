#!/usr/bin/env node

/**
 * Genesis Authority Key Generator
 * 
 * Generates Ed25519 keypair for No-Fate Governance System genesis.
 * Signs governance_genesis.json to establish root of trust.
 * 
 * CRITICAL: This key is the root of all governance authority.
 * Compromise of this key compromises entire governance system.
 */

const { generateKeyPairSync } = require('crypto');
const fs = require('fs');
const path = require('path');

// Ed25519 key generation
function generateGenesisKeypair() {
  console.log('Generating Ed25519 keypair for Governance Authority...');
  
  const { publicKey, privateKey } = generateKeyPairSync('ed25519', {
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });
  
  return { publicKey, privateKey };
}

// Extract public key hex for key_id
function publicKeyToHex(publicKeyPem) {
  // Remove PEM headers and decode base64
  const base64 = publicKeyPem
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    .replace(/\s/g, '');
  
  const buffer = Buffer.from(base64, 'base64');
  // Ed25519 public key is last 32 bytes of SPKI encoding
  const publicKeyBytes = buffer.slice(-32);
  return publicKeyBytes.toString('hex');
}

// Canonicalize JSON (simple implementation - production should use JCS RFC 8785)
function canonicalize(obj) {
  // Sort keys recursively
  if (Array.isArray(obj)) {
    return obj.map(canonicalize);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj)
      .sort()
      .reduce((result, key) => {
        result[key] = canonicalize(obj[key]);
        return result;
      }, {});
  }
  return obj;
}

// Compute SHA-256 hash
function sha256(data) {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Sign genesis artifact
function signGenesisArtifact(genesisPath, privateKey, publicKeyHex) {
  console.log('Loading governance_genesis.json...');
  
  const genesis = JSON.parse(fs.readFileSync(genesisPath, 'utf8'));
  
  // Update key_id with actual public key
  const keyId = `ed25519:${publicKeyHex}`;
  genesis.initial_authority_keys[0].key_id = keyId;
  genesis.genesis_signature.signed_by = keyId;
  
  // Remove signature fields temporarily for canonical hash
  const signatureBlock = genesis.genesis_signature;
  delete genesis.genesis_signature;
  
  // Canonicalize and hash
  const canonical = JSON.stringify(canonicalize(genesis), null, 2);
  const canonicalHash = sha256(canonical);
  
  console.log(`Canonical hash: sha256:${canonicalHash}`);
  
  // Sign canonical hash using Ed25519
  const crypto = require('crypto');
  
  // For Ed25519, we sign the data directly (not a hash of it)
  const signature = crypto.sign(null, Buffer.from(canonical), {
    key: privateKey,
    format: 'pem',
    type: 'pkcs8'
  }).toString('hex');
  
  console.log(`Signature: ${signature.substring(0, 32)}... (truncated)`);
  
  // Restore signature block with actual values
  genesis.genesis_signature = {
    ...signatureBlock,
    signed_by: keyId,
    signature: signature,
    canonical_hash: `sha256:${canonicalHash}`,
    signed_at: new Date().toISOString()
  };
  
  return genesis;
}

// Main execution
function main() {
  console.log('=== No-Fate Governance Genesis Key Generation ===\n');
  
  const genesisPath = path.join(__dirname, '..', 'governance', 'governance_genesis.json');
  const keysDir = path.join(__dirname, '..', 'governance', 'keys');
  
  // Create keys directory
  if (!fs.existsSync(keysDir)) {
    fs.mkdirSync(keysDir, { recursive: true });
  }
  
  // Generate keypair
  const { publicKey, privateKey } = generateGenesisKeypair();
  const publicKeyHex = publicKeyToHex(publicKey);
  
  console.log(`\nPublic Key (hex): ${publicKeyHex}`);
  console.log(`Key ID: ed25519:${publicKeyHex}\n`);
  
  // Save keys (PRIVATE KEY - MUST BE SECURED)
  const privateKeyPath = path.join(keysDir, 'genesis-governance-authority.private.pem');
  const publicKeyPath = path.join(keysDir, 'genesis-governance-authority.public.pem');
  
  fs.writeFileSync(privateKeyPath, privateKey, { mode: 0o600 });
  fs.writeFileSync(publicKeyPath, publicKey, { mode: 0o644 });
  
  console.log('Keys saved:');
  console.log(`  Private: ${privateKeyPath} (chmod 600)`);
  console.log(`  Public:  ${publicKeyPath}\n`);
  
  console.log('⚠️  CRITICAL: Secure the private key immediately!');
  console.log('⚠️  In production: Store in HSM or secure key vault.\n');
  
  // Sign genesis artifact
  const signedGenesis = signGenesisArtifact(genesisPath, privateKey, publicKeyHex);
  
  // Save signed genesis
  const signedGenesisPath = path.join(__dirname, '..', 'governance', 'governance_genesis.signed.json');
  fs.writeFileSync(signedGenesisPath, JSON.stringify(signedGenesis, null, 2));
  
  console.log(`\nSigned genesis artifact: ${signedGenesisPath}`);
  console.log('\n=== Genesis Key Generation Complete ===');
  console.log('\nNext steps:');
  console.log('1. Verify signature: node scripts/verify-genesis.js');
  console.log('2. Bind artifacts to governance: node scripts/bind-artifacts.js');
  console.log('3. Run governance replay test: node scripts/replay-governance.js');
}

// Execute if run directly
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  }
}

module.exports = { generateGenesisKeypair, signGenesisArtifact };
