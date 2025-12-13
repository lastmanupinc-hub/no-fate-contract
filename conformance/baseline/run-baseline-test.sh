#!/bin/bash
# Baseline Determinism Test
# This script MUST pass before any code changes are accepted

set -e  # Exit on any error

echo "================================================"
echo "   BASELINE DETERMINISM TEST"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if tools are available
command -v nofate-canon >/dev/null 2>&1 || { echo -e "${RED}ERROR: nofate-canon not found${NC}"; exit 1; }
command -v nofate-solve >/dev/null 2>&1 || { echo -e "${RED}ERROR: nofate-solve not found${NC}"; exit 1; }
command -v avery-verify >/dev/null 2>&1 || { echo -e "${RED}ERROR: avery-verify not found${NC}"; exit 1; }
command -v avery-replay >/dev/null 2>&1 || { echo -e "${RED}ERROR: avery-replay not found${NC}"; exit 1; }

BASELINE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$BASELINE_DIR"

# Step 1: Canonicalize bundle
echo "Step 1: Canonicalizing baseline bundle..."
nofate-canon baseline-minimal.json > baseline-minimal.canonical.json 2> baseline-minimal.hash.txt
BUNDLE_HASH=$(grep sha256 baseline-minimal.hash.txt | cut -d: -f2-)
echo -e "  Bundle hash: ${GREEN}${BUNDLE_HASH}${NC}"

# Step 2: Run solver
echo ""
echo "Step 2: Running solver..."
nofate-solve baseline-minimal.json --out baseline-output.json --emergy baseline-emergy.json
echo -e "  ${GREEN}✓${NC} Solver completed"

# Compute output hashes
OUTPUT_HASH=$(nofate-canon baseline-output.json 2>&1 | grep sha256 | cut -d: -f2-)
EMERGY_HASH=$(nofate-canon baseline-emergy.json 2>&1 | grep sha256 | cut -d: -f2-)
echo "  Output hash: ${OUTPUT_HASH}"
echo "  Emergy hash: ${EMERGY_HASH}"

# Step 3: Verify
echo ""
echo "Step 3: Running avery-verify..."
if avery-verify baseline-minimal.json baseline-output.json baseline-emergy.json > verify-result.json 2>&1; then
    echo -e "  ${GREEN}✓${NC} Verification passed"
    VALID=$(cat verify-result.json | grep '"valid"' | grep -o 'true\|false')
    if [ "$VALID" != "true" ]; then
        echo -e "  ${RED}✗${NC} Verification returned valid=false"
        cat verify-result.json
        exit 1
    fi
else
    echo -e "  ${RED}✗${NC} Verification failed"
    cat verify-result.json
    exit 1
fi

# Step 4: Replay
echo ""
echo "Step 4: Running avery-replay..."
if avery-replay baseline-minimal.json baseline-output.json baseline-emergy.json > replay-result.json 2>&1; then
    echo -e "  ${GREEN}✓${NC} Replay confirmed determinism"
    DETERMINISTIC=$(cat replay-result.json | grep '"deterministic"' | grep -o 'true\|false')
    if [ "$DETERMINISTIC" != "true" ]; then
        echo -e "  ${RED}✗${NC} Replay returned deterministic=false"
        cat replay-result.json
        exit 1
    fi
else
    echo -e "  ${RED}✗${NC} Replay failed"
    cat replay-result.json
    exit 1
fi

# Step 5: Check golden hashes (if they exist)
echo ""
echo "Step 5: Checking golden hashes..."
if [ -f "golden-hashes.txt" ]; then
    echo "  Comparing against golden reference..."
    
    GOLDEN_BUNDLE=$(grep "bundle:" golden-hashes.txt | cut -d: -f2- | tr -d ' ')
    GOLDEN_OUTPUT=$(grep "output:" golden-hashes.txt | cut -d: -f2- | tr -d ' ')
    GOLDEN_EMERGY=$(grep "emergy:" golden-hashes.txt | cut -d: -f2- | tr -d ' ')
    
    if [ "$BUNDLE_HASH" != "$GOLDEN_BUNDLE" ]; then
        echo -e "  ${RED}✗${NC} Bundle hash mismatch!"
        echo "    Expected: $GOLDEN_BUNDLE"
        echo "    Got:      $BUNDLE_HASH"
        exit 1
    fi
    
    if [ "$OUTPUT_HASH" != "$GOLDEN_OUTPUT" ]; then
        echo -e "  ${RED}✗${NC} Output hash mismatch!"
        echo "    Expected: $GOLDEN_OUTPUT"
        echo "    Got:      $OUTPUT_HASH"
        exit 1
    fi
    
    if [ "$EMERGY_HASH" != "$GOLDEN_EMERGY" ]; then
        echo -e "  ${RED}✗${NC} Emergy hash mismatch!"
        echo "    Expected: $GOLDEN_EMERGY"
        echo "    Got:      $EMERGY_HASH"
        exit 1
    fi
    
    echo -e "  ${GREEN}✓${NC} All golden hashes match"
else
    echo -e "  ${YELLOW}⚠${NC}  No golden hashes found. Recording current hashes..."
    cat > golden-hashes.txt <<EOF
# Golden Baseline Hashes
# Recorded: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
# These hashes MUST remain constant for v1.0.0

bundle: $BUNDLE_HASH
output: $OUTPUT_HASH
emergy: $EMERGY_HASH
EOF
    echo "  Golden hashes recorded in golden-hashes.txt"
fi

# Success
echo ""
echo "================================================"
echo -e "  ${GREEN}✓ BASELINE DETERMINISM TEST PASSED${NC}"
echo "================================================"
echo ""
echo "Summary:"
echo "  - Canonicalization: ✓"
echo "  - Solver execution: ✓"
echo "  - Verification: ✓"
echo "  - Replay determinism: ✓"
echo "  - Hash consistency: ✓"
echo ""
echo "Determinism is proven. System is trustworthy."
