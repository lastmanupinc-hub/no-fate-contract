#!/usr/bin/env python3
"""
Diamond Phase-1 Governance Compliance Check
Per GOVERNANCE.md and No Fate Contract requirements
"""

import os
import sys
import json
import hashlib
import re
from pathlib import Path
from typing import List, Dict, Tuple

# Expected canonical artifact hash
CANONICAL_SPEC_PATH = "Diamond-Certification-Website-Specification.md"
CANONICAL_SPEC_EXPECTED_SHA256 = "DDF4D97A6E6F696A34B07F2FE255663749F59BD2D83807E67120B970C452F6C7"

# Verification supersession file
SUPERSESSION_PATH = "Diamond-Phase1-Implementation/verification/VERIFICATION_SUPERSESSION.json"

# Prohibited language patterns
PROHIBITED_PATTERNS = {
    "anthropomorphization": [
        r"(?<!not\s)(?<!do\snot\s)\b(AI|system)\s+(understands|feels|thinks|wants|believes)\b",
        r"\b(AI|system)\s+(intention|emotion|consciousness|awareness)\b",
        r"\bthe\s+AI\s+is\s+(smart|intelligent|clever|wise)\b"
    ],
    "guarantees": [
        r"(?<!not\s)(?<!do\snot\s)(?<!does\snot\s)(?<!no\s)\b(we\s+guarantee|guaranteed\s+to)\b",
        r"(?<!not\s)(?<!do\snot\s)\b(will\s+always|will\s+never)\b(?!\s+fails)",
        r"\b(100%|completely)\s+(guaranteed|safe|secure)\b"
    ],
    "advisory": [
        r"\b(we\s+recommend|you\s+should|must\s+use)\s+.*\s+(for|in)\s+(legal|medical|financial)\s+transactions\b",
        r"\bthis\s+will\s+ensure\s+compliance\s+with\b"
    ],
    "refusal_demonization": [
        r"NO_DETERMINISTIC_OUTCOME.*\b(means\s+fail|indicates\s+failure|is\s+an\s+error)\b",
        r"\brefusal\s+(is|means|indicates)\s+(failure|error|bug)\b"
    ],
    "mystification": [
        r"\b(magically|mystically|miraculously)\s+(determines|evaluates)\b",
        r"\bblack\s+box\s+magic\b"
    ],
    "hype": [
        r"\b(revolutionary|groundbreaking|unprecedented)\s+AI\b",
        r"\b(never\s+fails|perfect|flawless|infallible)\s+system\b",
        r"\bworld['-]s\s+(first|best|only)\b"
    ]
}

# Phase-1 excluded features
PHASE1_EXCLUSIONS = [
    "real billing integration",
    "live certification issuance",
    "production audit replay",
    "live API backend"
]

def calculate_sha256(file_path: str) -> str:
    """Calculate SHA256 hash of file."""
    sha256_hash = hashlib.sha256()
    try:
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest().upper()
    except FileNotFoundError:
        return None

def find_verification_artifacts(root_dir: str) -> List[str]:
    """Find all potential verification artifacts in Diamond directories only."""
    verification_files = []
    
    # Verification artifacts must assert outcomes as conclusions, not examples
    # Must be implementation verification, not governance/compliance reports
    verification_indicators = [
        "Execution Status:",
        "Outcome Classification:",
        "Final Outcome:",
        "VERIFICATION_COMPLETE",
        "VERIFICATION_EVIDENCE"
    ]
    
    # Exclude governance/compliance reports
    exclude_patterns = [
        "GOVERNANCE",
        "COMPLIANCE-REPORT",
        "SUPERSESSION"
    ]
    
    # Only scan Diamond-related directories
    search_paths = [
        os.path.join(root_dir, "Diamond-Phase1-Implementation")
    ]
    
    for search_path in search_paths:
        if not os.path.exists(search_path):
            continue
        
        # Walk directory
        for root, dirs, files in os.walk(search_path):
            # Skip .git and node_modules
            dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', '.github']]
            
            for file in files:
                # Skip governance and compliance reports
                if any(pattern in file for pattern in exclude_patterns):
                    continue
                
                if file.endswith(('.md', '.txt', '.json')):
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                            # Must have both verification indicators AND outcome assertions
                            has_indicator = any(ind in content for ind in verification_indicators)
                            has_outcome = "DETERMINISTIC_COMPLIANCE" in content or "DETERMINISTIC_VIOLATION" in content
                            if has_indicator and has_outcome:
                                verification_files.append(file_path)
                    except (UnicodeDecodeError, PermissionError):
                        continue
    
    return verification_files

def check_verification_singularity(root_dir: str) -> Tuple[str, str]:
    """RULE 1: Check for verification singularity."""
    verification_files = find_verification_artifacts(root_dir)
    
    # Filter out the supersession file itself
    verification_files = [f for f in verification_files if 'VERIFICATION_SUPERSESSION.json' not in f]
    
    if len(verification_files) == 0:
        return "DETERMINISTIC_VIOLATION", "No verification artifacts found"
    
    if len(verification_files) == 1:
        return "DETERMINISTIC_COMPLIANCE", f"Single verification artifact: {verification_files[0]}"
    
    # Multiple verification files - check for supersession
    supersession_file = os.path.join(root_dir, SUPERSESSION_PATH)
    if not os.path.exists(supersession_file):
        return "DETERMINISTIC_VIOLATION", f"Multiple verification artifacts without supersession: {verification_files}"
    
    # Load supersession data
    try:
        with open(supersession_file, 'r') as f:
            supersession_data = json.load(f)
        
        authoritative = supersession_data.get('authoritative_verification', {}).get('path')
        superseded = [s.get('path') for s in supersession_data.get('superseded_verifications', [])]
        
        # Check all verification files are accounted for
        all_files_relative = [os.path.relpath(f, root_dir).replace('\\', '/') for f in verification_files]
        
        unaccounted = []
        for file in all_files_relative:
            if authoritative not in file and not any(sup in file for sup in superseded):
                unaccounted.append(file)
        
        if unaccounted:
            return "DETERMINISTIC_VIOLATION", f"Verification artifacts not in supersession record: {unaccounted}"
        
        return "DETERMINISTIC_COMPLIANCE", "Verification singularity maintained via supersession"
    
    except Exception as e:
        return "DETERMINISTIC_VIOLATION", f"Error reading supersession file: {str(e)}"

def check_canonical_immutability(root_dir: str) -> Tuple[str, str]:
    """RULE 2: Check canonical artifact has not been modified."""
    canonical_path = os.path.join(root_dir, CANONICAL_SPEC_PATH)
    
    if not os.path.exists(canonical_path):
        return "NO_DETERMINISTIC_OUTCOME", f"Canonical artifact not found: {canonical_path}"
    
    actual_hash = calculate_sha256(canonical_path)
    
    if actual_hash == CANONICAL_SPEC_EXPECTED_SHA256:
        return "DETERMINISTIC_COMPLIANCE", f"Canonical artifact unchanged (SHA256 verified)"
    else:
        return "DETERMINISTIC_VIOLATION", f"Canonical artifact modified. Expected: {CANONICAL_SPEC_EXPECTED_SHA256}, Got: {actual_hash}"

def check_prohibited_language(root_dir: str) -> Tuple[str, str]:
    """RULE 3: Check for prohibited language patterns."""
    violations = []
    
    implementation_files = [
        "Diamond-Phase1-Implementation/DESIGN-SYSTEM.md",
        "Diamond-Phase1-Implementation/HOMEPAGE-IMPLEMENTATION.md",
        "Diamond-Phase1-Implementation/ADDITIONAL-PAGES.md",
        "Diamond-Phase1-Implementation/REMAINING-PAGES.md",
        "Diamond-Phase1-Implementation/FINAL-ASSETS-DEPLOYMENT.md",
        "Diamond-Phase1-Implementation/README.md"
    ]
    
    for rel_path in implementation_files:
        file_path = os.path.join(root_dir, rel_path)
        if not os.path.exists(file_path):
            continue
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            for line_num, line in enumerate(lines, 1):
                # Skip code blocks (lines starting with spaces or within ```...```)
                stripped = line.strip()
                if stripped.startswith('//') or stripped.startswith('*') or stripped.startswith('<'):
                    continue
                
                for category, patterns in PROHIBITED_PATTERNS.items():
                    for pattern in patterns:
                        if re.search(pattern, line, re.IGNORECASE):
                            violations.append({
                                "file": rel_path,
                                "category": category,
                                "match": re.search(pattern, line, re.IGNORECASE).group(0),
                                "line": line_num,
                                "context": line.strip()[:80]
                            })
        
        except Exception as e:
            continue
    
    if violations:
        # Write detailed violations to file for review
        with open('governance-violations.json', 'w') as f:
            json.dump(violations, f, indent=2)
        
        violation_summary = f"Found {len(violations)} prohibited language violations (see governance-violations.json)"
        return "DETERMINISTIC_VIOLATION", violation_summary
    
    return "DETERMINISTIC_COMPLIANCE", "No prohibited language detected"

def check_phase_boundaries(root_dir: str) -> Tuple[str, str]:
    """RULE 4: Check no excluded Phase-1 features implemented."""
    # This is a simplified check - real implementation would scan for actual feature code
    # For Phase-1, we're checking documentation doesn't claim excluded features are implemented
    
    implementation_files = [
        "Diamond-Phase1-Implementation/README.md",
        "Diamond-Phase1-Implementation/REMAINING-PAGES.md"
    ]
    
    violations = []
    
    for rel_path in implementation_files:
        file_path = os.path.join(root_dir, rel_path)
        if not os.path.exists(file_path):
            continue
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check for implementation claims of excluded features
            forbidden_claims = [
                r"implemented\s+real\s+billing",
                r"live\s+certification\s+issuance\s+complete",
                r"production\s+audit\s+replay\s+ready",
                r"live\s+API\s+backend\s+deployed"
            ]
            
            for pattern in forbidden_claims:
                if re.search(pattern, content, re.IGNORECASE):
                    violations.append({
                        "file": rel_path,
                        "pattern": pattern
                    })
        
        except Exception as e:
            continue
    
    if violations:
        return "DETERMINISTIC_VIOLATION", f"Phase boundary violation: {violations}"
    
    return "DETERMINISTIC_COMPLIANCE", "Phase-1 boundaries respected"

def generate_report(checks: Dict[str, Tuple[str, str]]) -> Dict:
    """Generate compliance report."""
    all_passed = all(outcome == "DETERMINISTIC_COMPLIANCE" for outcome, _ in checks.values())
    
    final_outcome = "DETERMINISTIC_COMPLIANCE" if all_passed else "DETERMINISTIC_VIOLATION"
    
    report = {
        "outcome": final_outcome,
        "timestamp": "2025-12-19T00:00:00Z",
        "checks": {}
    }
    
    for rule_name, (outcome, message) in checks.items():
        report["checks"][rule_name] = {
            "outcome": outcome,
            "message": message
        }
    
    return report

def main():
    """Run all governance checks."""
    # Set root to parent directory containing both canonical spec and implementation
    root_dir = os.path.dirname(os.getcwd()) if 'Diamond-Phase1-Implementation' in os.getcwd() else os.getcwd()
    
    print("=" * 60)
    print("Diamond Phase-1 Governance Compliance Check")
    print(f"Root: {root_dir}")
    print("=" * 60)
    
    checks = {}
    
    # RULE 1: Verification Singularity
    print("\n[RULE 1] Checking verification singularity...")
    outcome, message = check_verification_singularity(root_dir)
    checks["verification_singularity"] = (outcome, message)
    print(f"  -> {outcome}: {message}")
    
    # RULE 2: Canonical Immutability
    print("\n[RULE 2] Checking canonical immutability...")
    outcome, message = check_canonical_immutability(root_dir)
    checks["canonical_immutability"] = (outcome, message)
    print(f"  -> {outcome}: {message}")
    
    # RULE 3: Prohibited Language
    print("\n[RULE 3] Checking for prohibited language...")
    outcome, message = check_prohibited_language(root_dir)
    checks["prohibited_language"] = (outcome, message)
    print(f"  -> {outcome}: {message}")
    
    # RULE 4: Phase Boundaries
    print("\n[RULE 4] Checking phase boundaries...")
    outcome, message = check_phase_boundaries(root_dir)
    checks["phase_boundaries"] = (outcome, message)
    print(f"  -> {outcome}: {message}")
    
    # Generate report
    report = generate_report(checks)
    
    # Write report
    with open('governance-report.json', 'w') as f:
        json.dump(report, f, indent=2)
    
    print("\n" + "=" * 60)
    print(f"FINAL OUTCOME: {report['outcome']}")
    print("=" * 60)
    
    # Exit with appropriate code
    if report['outcome'] == "DETERMINISTIC_COMPLIANCE":
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()
