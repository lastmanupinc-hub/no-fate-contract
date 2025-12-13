# Add Email to GPG Key

Write-Host "Adding Jonathan@jonathanarvay.com to GPG key..." -ForegroundColor Cyan
Write-Host ""

# Create command file for GPG
$commands = @"
adduid
Jonathan Arvay
Jonathan@jonathanarvay.com
Deterministic Boundary Framework
save
"@

$commands | & "C:\Program Files (x86)\GnuPG\bin\gpg.exe" --command-fd 0 --edit-key E5C802E139E7A96FBD1831C053E6B751C1708A73

Write-Host ""
Write-Host "Verification - Listing key UIDs:" -ForegroundColor Green
& "C:\Program Files (x86)\GnuPG\bin\gpg.exe" --list-keys E5C802E139E7A96FBD1831C053E6B751C1708A73
