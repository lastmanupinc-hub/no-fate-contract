# Sign All Canonical Documents for v1.0.0 Release

$KEYID = "E5C802E139E7A96FBD1831C053E6B751C1708A73"

Write-Host "=== No Fate v1.0.0 Canonical Document Signing ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Export Public Key
Write-Host "Step 1: Exporting public key..." -ForegroundColor Green
gpg --armor --export $KEYID > signatures/no-fate-public-key.asc

if ($?) {
    Write-Host "Public key exported to signatures/no-fate-public-key.asc" -ForegroundColor Green
} else {
    Write-Host "Failed to export public key" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Sign Canonical Documents
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
            Write-Host "  Signed: $doc" -ForegroundColor Green
        } else {
            Write-Host "  Failed to sign: $doc" -ForegroundColor Red
        }
    } else {
        Write-Host "  File not found: $doc" -ForegroundColor Yellow
    }
}

Write-Host ""

# Step 3: Move Signatures
Write-Host "Step 3: Moving signatures to signatures/ directory..." -ForegroundColor Green
Move-Item -Path "*.asc" -Destination "signatures/" -Force -ErrorAction SilentlyContinue
Write-Host "Signatures moved" -ForegroundColor Green
Write-Host ""

# Step 4: Generate Checksums
Write-Host "Step 4: Generating SHA-256 checksums..." -ForegroundColor Green

if (Test-Path "checksums/checksums.txt") {
    Remove-Item "checksums/checksums.txt"
}

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
        Write-Host "  $filename" -ForegroundColor Green
    }
}

Write-Host ""

# Step 5: Verify Signatures
Write-Host "Step 5: Verifying signatures..." -ForegroundColor Green

gpg --verify signatures/no-fate-contract_v1.0.0.md.asc no-fate-contract_v1.0.0.md 2>&1 | Out-Null
if ($?) { Write-Host "  no-fate-contract_v1.0.0.md - Good signature" -ForegroundColor Green }

gpg --verify signatures/Deterministic_Map_of_Law_v1_0_0.md.asc Deterministic_Map_of_Law_v1_0_0.md 2>&1 | Out-Null
if ($?) { Write-Host "  Deterministic_Map_of_Law_v1_0_0.md - Good signature" -ForegroundColor Green }

gpg --verify signatures/The_Boundary_Manifesto.md.asc The_Boundary_Manifesto.md 2>&1 | Out-Null
if ($?) { Write-Host "  The_Boundary_Manifesto.md - Good signature" -ForegroundColor Green }

Write-Host ""

# Summary
Write-Host "=== Signing Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Files created:" -ForegroundColor Green
Write-Host "  - signatures/no-fate-public-key.asc"
Write-Host "  - signatures/no-fate-contract_v1.0.0.md.asc"
Write-Host "  - signatures/no-fate-contract_v1.0.0.pdf.asc"
Write-Host "  - signatures/Deterministic_Map_of_Law_v1_0_0.md.asc"
Write-Host "  - signatures/Deterministic_Map_of_Law_v1_0_0.pdf.asc"
Write-Host "  - signatures/The_Boundary_Manifesto.md.asc"
Write-Host "  - checksums/checksums.txt"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. git add signatures/ checksums/"
Write-Host "  2. git commit -m 'Add GPG signatures for v1.0.0 release'"
Write-Host "  3. git push"
Write-Host "  4. Create GitHub Release v1.0.0"
Write-Host ""
Write-Host "Your public key fingerprint:" -ForegroundColor Cyan
gpg --fingerprint $KEYID
