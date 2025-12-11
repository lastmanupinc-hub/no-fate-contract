# Sign All Canonical Documents for v1.0.0 Release
# Run this script AFTER generating your GPG key

# Instructions:
# 1. Generate your GPG key first: gpg --full-generate-key
# 2. Get your KEYID: gpg --list-keys
# 3. Replace <KEYID> below with your actual key ID
# 4. Run this script: .\sign-canonical-documents.ps1

# ==========================================
# CONFIGURATION - REPLACE WITH YOUR KEY ID
# ==========================================

$KEYID = "<KEYID>"  # Replace with your GPG key ID

# Check if KEYID is set
if ($KEYID -eq "<KEYID>") {
    Write-Host "ERROR: Please edit this script and replace <KEYID> with your actual GPG key ID" -ForegroundColor Red
    Write-Host "Run 'gpg --list-keys' to find your key ID" -ForegroundColor Yellow
    exit 1
}

Write-Host "=== No Fate v1.0.0 Canonical Document Signing ===" -ForegroundColor Cyan
Write-Host ""

# ==========================================
# STEP 1: Export Public Key
# ==========================================

Write-Host "Step 1: Exporting public key..." -ForegroundColor Green
gpg --armor --export $KEYID > signatures/no-fate-public-key.asc

if ($?) {
    Write-Host "✓ Public key exported to signatures/no-fate-public-key.asc" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to export public key" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ==========================================
# STEP 2: Sign Canonical Documents
# ==========================================

Write-Host "Step 2: Signing canonical documents..." -ForegroundColor Green

$documents = @(
    "no-fate-contract_v1.0.0.md",
    "no-fate-contract_v1.0.0.pdf",
    "Deterministic_Map_of_Law_v1_0_0.md",
    "Deterministic_Map_of_Law_v1_0_0.pdf",
    "The_Boundary_Manifesto.md"
)

foreach ($doc in $documents) {
    if (Test-Path $doc) {
        Write-Host "  Signing $doc..." -ForegroundColor Yellow
        gpg --armor --detach-sign $doc
        
        if ($?) {
            Write-Host "  ✓ Signed: $doc" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Failed to sign: $doc" -ForegroundColor Red
        }
    } else {
        Write-Host "  ⚠ File not found: $doc" -ForegroundColor Yellow
    }
}

Write-Host ""

# ==========================================
# STEP 3: Move Signatures to Directory
# ==========================================

Write-Host "Step 3: Moving signatures to signatures/ directory..." -ForegroundColor Green
Move-Item -Path "*.asc" -Destination "signatures/" -Force -ErrorAction SilentlyContinue
Write-Host "✓ Signatures moved" -ForegroundColor Green
Write-Host ""

# ==========================================
# STEP 4: Generate Checksums
# ==========================================

Write-Host "Step 4: Generating SHA-256 checksums..." -ForegroundColor Green

# Clear existing checksums file
if (Test-Path "checksums/checksums.txt") {
    Remove-Item "checksums/checksums.txt"
}

# Generate checksums for all documents and signatures
$files = @(
    "no-fate-contract_v1.0.0.md",
    "no-fate-contract_v1.0.0.pdf",
    "Deterministic_Map_of_Law_v1_0_0.md",
    "Deterministic_Map_of_Law_v1_0_0.pdf",
    "The_Boundary_Manifesto.md",
    "signatures/no-fate-public-key.asc",
    "signatures/no-fate-contract_v1.0.0.md.asc",
    "signatures/no-fate-contract_v1.0.0.pdf.asc",
    "signatures/Deterministic_Map_of_Law_v1_0_0.md.asc",
    "signatures/Deterministic_Map_of_Law_v1_0_0.pdf.asc",
    "signatures/The_Boundary_Manifesto.md.asc"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $hash = (Get-FileHash -Algorithm SHA256 $file).Hash
        $filename = Split-Path $file -Leaf
        "$hash  $filename" | Out-File -Append -Encoding ASCII checksums/checksums.txt
        Write-Host "  ✓ $filename" -ForegroundColor Green
    }
}

Write-Host ""

# ==========================================
# STEP 5: Verify Signatures
# ==========================================

Write-Host "Step 5: Verifying signatures..." -ForegroundColor Green

$verifyDocs = @(
    @{Doc="no-fate-contract_v1.0.0.md"; Sig="signatures/no-fate-contract_v1.0.0.md.asc"},
    @{Doc="Deterministic_Map_of_Law_v1_0_0.md"; Sig="signatures/Deterministic_Map_of_Law_v1_0_0.md.asc"},
    @{Doc="The_Boundary_Manifesto.md"; Sig="signatures/The_Boundary_Manifesto.md.asc"}
)

foreach ($item in $verifyDocs) {
    Write-Host "  Verifying $($item.Doc)..." -ForegroundColor Yellow
    gpg --verify $item.Sig $item.Doc 2>&1 | Out-Null
    
    if ($?) {
        Write-Host "  ✓ Good signature" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Verification failed" -ForegroundColor Red
    }
}

Write-Host ""

# ==========================================
# SUMMARY
# ==========================================

Write-Host "=== Signing Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Files created:" -ForegroundColor Green
Write-Host "  • signatures/no-fate-public-key.asc"
Write-Host "  • signatures/no-fate-contract_v1.0.0.md.asc"
Write-Host "  • signatures/no-fate-contract_v1.0.0.pdf.asc"
Write-Host "  • signatures/Deterministic_Map_of_Law_v1_0_0.md.asc"
Write-Host "  • signatures/Deterministic_Map_of_Law_v1_0_0.pdf.asc"
Write-Host "  • signatures/The_Boundary_Manifesto.md.asc"
Write-Host "  • checksums/checksums.txt"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Review the signatures in signatures/ directory"
Write-Host "  2. Verify checksums: Get-Content checksums/checksums.txt"
Write-Host "  3. Commit to repository: git add signatures/ checksums/"
Write-Host "  4. Commit: git commit -m 'Add GPG signatures for v1.0.0 release'"
Write-Host "  5. Push: git push"
Write-Host "  6. Create GitHub Release v1.0.0 with all files"
Write-Host ""
Write-Host "Your public key fingerprint:" -ForegroundColor Cyan
gpg --fingerprint $KEYID
