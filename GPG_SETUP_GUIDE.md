# GPG Signing Setup for No Fate Ecosystem

This guide walks you through creating GPG signatures for canonical documents.

---

## Step 1: Generate Your GPG Key

Open PowerShell and run:

```powershell
gpg --full-generate-key
```

**When prompted, select:**
- Key type: `RSA and RSA`
- Key size: `4096` bits
- Expiration: `0` (no expiration) or `2y` (2 years)
- Name: Your steward identity
- Email: Your GitHub or project email
- Comment: `No Fate Ecosystem`

---

## Step 2: Get Your Key ID

After key creation, list your keys:

```powershell
gpg --list-keys
```

**You'll see output like:**
```
pub   rsa4096 2025-12-11 [SC]
      ABCD1234EF567890123456789ABCDEF123456789
uid           [ultimate] Your Name (No Fate Ecosystem) <your@email.com>
sub   rsa4096 2025-12-11 [E]
```

The long hex string (40 characters) is your **KEYID**.

---

## Step 3: Export Your Public Key

Replace `<KEYID>` with your actual key ID:

```powershell
gpg --armor --export <KEYID> > signatures/no-fate-public-key.asc
```

This creates a public key file that users will use to verify your signatures.

---

## Step 4: Sign All Canonical Documents

Run these commands to create detached signatures:

```powershell
# Sign the Contract
gpg --armor --detach-sign no-fate-contract_v1.0.0.md
gpg --armor --detach-sign no-fate-contract_v1.0.0.pdf

# Sign the Map of Law
gpg --armor --detach-sign Deterministic_Map_of_Law_v1_0_0.md
gpg --armor --detach-sign Deterministic_Map_of_Law_v1_0_0.pdf

# Sign the Boundary Manifesto
gpg --armor --detach-sign The_Boundary_Manifesto.md
```

This creates `.asc` signature files for each document.

---

## Step 5: Move Signatures to Correct Location

```powershell
Move-Item *.asc signatures/
```

---

## Step 6: Generate Complete Checksums

```powershell
# Generate checksums for all canonical documents
Get-FileHash -Algorithm SHA256 no-fate-contract_v1.0.0.md | Select-Object Hash, @{Name="Path";Expression={Split-Path $_.Path -Leaf}} | Format-Table -HideTableHeaders | Out-File -Append checksums/checksums.txt
Get-FileHash -Algorithm SHA256 no-fate-contract_v1.0.0.pdf | Select-Object Hash, @{Name="Path";Expression={Split-Path $_.Path -Leaf}} | Format-Table -HideTableHeaders | Out-File -Append checksums/checksums.txt
Get-FileHash -Algorithm SHA256 Deterministic_Map_of_Law_v1_0_0.md | Select-Object Hash, @{Name="Path";Expression={Split-Path $_.Path -Leaf}} | Format-Table -HideTableHeaders | Out-File -Append checksums/checksums.txt
Get-FileHash -Algorithm SHA256 Deterministic_Map_of_Law_v1_0_0.pdf | Select-Object Hash, @{Name="Path";Expression={Split-Path $_.Path -Leaf}} | Format-Table -HideTableHeaders | Out-File -Append checksums/checksums.txt
Get-FileHash -Algorithm SHA256 The_Boundary_Manifesto.md | Select-Object Hash, @{Name="Path";Expression={Split-Path $_.Path -Leaf}} | Format-Table -HideTableHeaders | Out-File -Append checksums/checksums.txt
Get-FileHash -Algorithm SHA256 signatures/no-fate-public-key.asc | Select-Object Hash, @{Name="Path";Expression={Split-Path $_.Path -Leaf}} | Format-Table -HideTableHeaders | Out-File -Append checksums/checksums.txt
```

---

## Step 7: Verify Your Signatures Work

Test verification with:

```powershell
gpg --verify signatures/no-fate-contract_v1.0.0.md.asc no-fate-contract_v1.0.0.md
```

You should see:
```
gpg: Good signature from "Your Name (No Fate Ecosystem) <your@email.com>"
```

---

## Step 8: Commit Everything to Repository

```powershell
git add signatures/*.asc checksums/checksums.txt
git commit -m "Add GPG signatures and public key for v1.0.0 canonical release"
git push
```

---

## Step 9: Publish GitHub Release v1.0.0

Now you can create the release with:
- All canonical documents (MD + PDF)
- All signatures (.asc files)
- Public key (no-fate-public-key.asc)
- Checksums (checksums.txt)

---

## Files to Attach to v1.0.0 Release:

1. `no-fate-contract_v1.0.0.md`
2. `no-fate-contract_v1.0.0.pdf`
3. `no-fate-contract_v1.0.0.md.asc` (signature)
4. `no-fate-contract_v1.0.0.pdf.asc` (signature)
5. `Deterministic_Map_of_Law_v1_0_0.md`
6. `Deterministic_Map_of_Law_v1_0_0.pdf`
7. `Deterministic_Map_of_Law_v1_0_0.md.asc` (signature)
8. `Deterministic_Map_of_Law_v1_0_0.pdf.asc` (signature)
9. `The_Boundary_Manifesto.md`
10. `The_Boundary_Manifesto.md.asc` (signature)
11. `no-fate-public-key.asc` (public key)
12. `checksums.txt` (all hashes)

---

## User Verification Instructions

Users can verify your documents with:

```bash
# 1. Import your public key
gpg --import no-fate-public-key.asc

# 2. Verify a document
gpg --verify no-fate-contract_v1.0.0.md.asc no-fate-contract_v1.0.0.md

# 3. Verify checksums
sha256sum -c checksums.txt
```

---

## Security Notes

- **Keep your private key secure** - Never commit it to the repository
- **Backup your private key** - Store it securely offline
- **Document your key fingerprint** - Include it on your website
- **Consider key expiration** - 2 years is recommended for active projects
- **Publish your public key on keyservers** - `gpg --send-keys <KEYID>`

---

**Status:** Ready to execute after GPG key generation
**Next Step:** Run the commands above in PowerShell
