# Integrity Verification Guide  
## SHA-256 Hash Procedure for Canonical Documents

To verify the integrity of a canonical document:

1. Download the canonical file exactly as stored in the repository:

```powershell
curl -L -o Deterministic_Map_of_Law_v1_0_0.md https://raw.githubusercontent.com/lastmanupinc-hub/no-fate-contract/main/Deterministic_Map_of_Law_v1_0_0.md
```

2. Generate the SHA-256 hash:

On Windows (PowerShell):
```powershell
Get-FileHash -Algorithm SHA256 Deterministic_Map_of_Law_v1_0_0.md | Select-Object -ExpandProperty Hash
```

On Linux/Mac:
```bash
sha256sum Deterministic_Map_of_Law_v1_0_0.md
```

3. Compare the output to the canonical hash published in HASHES.txt in this repository.

4. If the hashes match:
- The document is authentic  
- The version is intact  
- The canonical status is preserved  

5. If hashes differ:
- The file has been modified, corrupted, or tampered with  
- Discard the file  
- Retrieve a clean copy from the repository
