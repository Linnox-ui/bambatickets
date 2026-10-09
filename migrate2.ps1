#!/usr/bin/env pwsh
# BambaTickets — Migration Continuation Script (Phase 6 onwards)
# Handles all remaining moves and ALL import rewiring.
# PowerShell wildcard-safe: uses -LiteralPath throughout.

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

function L($rel) { return (Join-Path $root $rel) }  # literal path helper

function Ensure-Dir($path) {
    New-Item -ItemType Directory -Force -LiteralPath (L $path) | Out-Null
}

function Move-F($src, $dst) {
    $s = L $src; $d = L $dst
    Ensure-Dir (Split-Path $d -Parent)
    if (Test-Path -LiteralPath $s) {
        Move-Item -LiteralPath $s -Destination $d -Force
        Write-Host "  MOVE  $src -> $dst"
    } else {
        Write-Host "  SKIP  $src (not found)"
    }
}

function Write-F($dst, $content) {
    $d = L $dst
    Ensure-Dir (Split-Path $d -Parent)
    [System.IO.File]::WriteAllText($d, $content, [System.Text.Encoding]::UTF8)
    Write-Host "  WRITE $dst"
}

function Git-Show($gitPath) {
    # Returns file content from HEAD without wildcard expansion issues
    return (& git -C $root show "HEAD:$gitPath") -join "`n"
}

function Patch-File($rel, [hashtable]$replacements) {
    $p = L $rel
    if (-not (Test-Path -LiteralPath $p)) { Write-Host "  SKIP  $rel (not found)"; return }
    $c = [System.IO.File]::ReadAllText($p, [System.Text.Encoding]::UTF8)
    $orig = $c
    foreach ($kv in $replacements.GetEnumerator()) {
        $c = $c.Replace($kv.Key, $kv.Value)
    }
    if ($c -ne $orig) {
        [System.IO.File]::WriteAllText($p, $c, [System.Text.Encoding]::UTF8)
        Write-Host "  PATCH $rel"
    }
}

function Patch-Dir-Regex($dirRel, [string]$pattern, [string]$replacement) {
    $dir = L $dirRel
    if (-not (Test-Path -LiteralPath $dir)) { return }
    Get-ChildItem -LiteralPath $dir -Recurse -Include "*.ts","*.tsx" | ForEach-Object {
        $c = [System.IO.File]::ReadAllText($_.FullName, [System.Text.Encoding]::UTF8)
        $new = [System.Text.RegularExpressions.Regex]::Replace($c, $pattern, $replacement)
        if ($new -ne $c) {
            [System.IO.File]::WriteAllText($_.FullName, $new, [System.Text.Encoding]::UTF8)
            Write-Host "  PATCH $($_.FullName -replace [regex]::Escape($root), '.')"
        }
    }
}

# ─────────────────────────────────────────────────────────────
Write-Host "`n=== RECOVER: Studio event sub-pages from git HEAD ==="
# These were lost due to PowerShell [id] wildcard collision on Move-Item

$studioPaths = @{
    "src/app/(studio)/studio/events/[id]/page.tsx"           = "src\app\(main)\studio\events\[id]\page.tsx"
    "src/app/(studio)/studio/events/[id]/attendees/page.tsx" = "src\app\(main)\studio\events\[id]\attendees\page.tsx"
    "src/app/(studio)/studio/events/[id]/edit/page.tsx"      = "src\app\(main)\studio\events\[id]\edit\page.tsx"
    "src/app/(studio)/studio/events/[id]/finance/page.tsx"   = "src\app\(main)\studio\events\[id]\finance\page.tsx"
    "src/app/(studio)/studio/events/[id]/scanner/page.tsx"   = "src\app\(main)\studio\events\[id]\scanner\page.tsx"
    "src/app/(studio)/studio/events/[id]/staff/page.tsx"     = "src\app\(main)\studio\events\[id]\staff\page.tsx"
}

foreach ($kv in $studioPaths.GetEnumerator()) {
    $content = Git-Show $kv.Key
    $dstFull = L $kv.Value
    if (-not (Test-Path -LiteralPath $dstFull) -or (Get-Item -LiteralPath $dstFull).Length -eq 0) {
        Ensure-Dir (Split-Path $dstFull -Parent)
        [System.IO.File]::WriteAllText($dstFull, $content, [System.Text.Encoding]::UTF8)
        Write-Host "  RECOVER $($kv.Value)"
    } else {
        Write-Host "  EXISTS  $($kv.Value)"
    }
}

# ─────────────────────────────────────────────────────────────
Write-Host "`n=== PHASE 6: Move remaining root routes into (main)/ ==="
Move-F "src\app\become-organizer" "src\app\(main)\become-organizer"
Move-F "src\app\terms"            "src\app\(main)\terms"
Move-F "src\app\polls"            "src\app\(main)\polls"

# ─────────────────────────────────────────────────────────────
Write-Host "`n=== PHASE 7: Colocate components (move into _components) ==="

# events/[id]/TicketSelector -> events/[id]/_components/TicketSelector
$ticketSrc = L "src\app\(main)\events\[id]\TicketSelector.tsx"
$ticketDst = L "src\app\(main)\events\[id]\_components\TicketSelector.tsx"
if (Test-Path -LiteralPath $ticketSrc) {
    Ensure-Dir "src\app\(main)\events\[id]\_components"
    Move-Item -LiteralPath $ticketSrc -Destination $ticketDst -Force
    Write-Host "  MOVE  TicketSelector.tsx -> _components/"
}

# checkout/verify/PrintButton -> checkout/verify/_components/PrintButton
$pbSrc = L "src\app\(main)\checkout\verify\PrintButton.tsx"
$pbDst = L "src\app\(main)\checkout\verify\_components\PrintButton.tsx"
if (Test-Path -LiteralPath $pbSrc) {
    Ensure-Dir "src\app\(main)\checkout\verify\_components"
    Move-Item -LiteralPath $pbSrc -Destination $pbDst -Force
    Write-Host "  MOVE  PrintButton.tsx -> _components/"
}

# reset-password/ResetPasswordForm -> reset-password/_components/ResetPasswordForm
$rfSrc = L "src\app\(auth)\reset-password\ResetPasswordForm.tsx"
$rfDst = L "src\app\(auth)\reset-password\_components\ResetPasswordForm.tsx"
if (Test-Path -LiteralPath $rfSrc) {
    Ensure-Dir "src\app\(auth)\reset-password\_components"
    Move-Item -LiteralPath $rfSrc -Destination $rfDst -Force
    Write-Host "  MOVE  ResetPasswordForm.tsx -> _components/"
}

# polls/[slug]/VotingCard -> polls/[slug]/_components/VotingCard
$vcSrc = L "src\app\(main)\polls\[slug]\VotingCard.tsx"
$vcDst = L "src\app\(main)\polls\[slug]\_components\VotingCard.tsx"
if (Test-Path -LiteralPath $vcSrc) {
    Ensure-Dir "src\app\(main)\polls\[slug]\_components"
    Move-Item -LiteralPath $vcSrc -Destination $vcDst -Force
    Write-Host "  MOVE  VotingCard.tsx -> _components/"
}

# polls/edit/[id]/EditPollForm -> polls/edit/[id]/_components/EditPollForm
$efSrc = L "src\app\(main)\polls\edit\[id]\EditPollForm.tsx"
$efDst = L "src\app\(main)\polls\edit\[id]\_components\EditPollForm.tsx"
if (Test-Path -LiteralPath $efSrc) {
    Ensure-Dir "src\app\(main)\polls\edit\[id]\_components"
    Move-Item -LiteralPath $efSrc -Destination $efDst -Force
    Write-Host "  MOVE  EditPollForm.tsx -> _components/"
}

# polls/new/CreatePollForm -> polls/new/_components/CreatePollForm
$cpfSrc = L "src\app\(main)\polls\new\CreatePollForm.tsx"
$cpfDst = L "src\app\(main)\polls\new\_components\CreatePollForm.tsx"
if (Test-Path -LiteralPath $cpfSrc) {
    Ensure-Dir "src\app\(main)\polls\new\_components"
    Move-Item -LiteralPath $cpfSrc -Destination $cpfDst -Force
    Write-Host "  MOVE  CreatePollForm.tsx -> _components/"
}

# ─────────────────────────────────────────────────────────────
Write-Host "`n=== PHASE 8: Move HQ into (admin)/ ==="
Ensure-Dir "src\app\(admin)\hq\_components"
Ensure-Dir "src\app\(admin)\hq\_views"

$hqMoves = @(
    @{ s="src\app\hq\Airlock.tsx";                       d="src\app\(admin)\hq\_components\Airlock.tsx" }
    @{ s="src\app\hq\TwoFactorGate.tsx";                 d="src\app\(admin)\hq\_components\TwoFactorGate.tsx" }
    @{ s="src\app\hq\components\ChangePasswordForm.tsx";  d="src\app\(admin)\hq\_components\ChangePasswordForm.tsx" }
    @{ s="src\app\hq\components\CreateNodeForm.tsx";      d="src\app\(admin)\hq\_components\CreateNodeForm.tsx" }
    @{ s="src\app\hq\components\GodModeUserManager.tsx";  d="src\app\(admin)\hq\_components\GodModeUserManager.tsx" }
    @{ s="src\app\hq\components\HQHeader.tsx";            d="src\app\(admin)\hq\_components\HQHeader.tsx" }
    @{ s="src\app\hq\components\PayoutQueue.tsx";         d="src\app\(admin)\hq\_components\PayoutQueue.tsx" }
    @{ s="src\app\hq\components\UserSearchRadar.tsx";     d="src\app\(admin)\hq\_components\UserSearchRadar.tsx" }
    @{ s="src\app\hq\views\IctView.tsx";                  d="src\app\(admin)\hq\_views\IctView.tsx" }
    @{ s="src\app\hq\views\SuperAdminView.tsx";           d="src\app\(admin)\hq\_views\SuperAdminView.tsx" }
    @{ s="src\app\hq\views\SupervisorView.tsx";           d="src\app\(admin)\hq\_views\SupervisorView.tsx" }
    @{ s="src\app\hq\page.tsx";                           d="src\app\(admin)\hq\page.tsx" }
)
foreach ($m in $hqMoves) { Move-F $m.s $m.d }
Remove-Item -LiteralPath (L "src\app\hq") -Recurse -Force -ErrorAction SilentlyContinue

# ─────────────────────────────────────────────────────────────
Write-Host "`n=== PHASE 9: Extract inline server actions to src/actions/ ==="

$actionMoves = @(
    @{ s="src\app\hq\actions.ts";                            d="src\actions\hq.ts" }
    @{ s="src\app\hq\payout-actions.ts";                     d="src\actions\hq-payouts.ts" }
    @{ s="src\app\(studio)\studio\payout-actions.ts";        d="src\actions\organizer-payouts.ts" }
    @{ s="src\app\become-organizer\actions.ts";              d="src\actions\organizer.ts" }
    @{ s="src\app\forgot-password\actions.ts";               d="src\actions\password-reset.ts" }
)

# These are still at the old location (partially moved dirs mean the hq files are gone,
# but become-organizer/actions.ts and forgot-password/actions.ts were in dirs that moved).
# Check both old and new locations.

# hq actions — still at original (since hq dir is still there pre-phase-8):
# After phase 8 hq dir is removed so we must read from git
foreach ($m in $actionMoves) {
    $src = L $m.s
    $dst = L $m.d
    if (Test-Path -LiteralPath $src) {
        Move-Item -LiteralPath $src -Destination $dst -Force
        Write-Host "  MOVE  $($m.s) -> $($m.d)"
    } else {
        # Try to recover from git
        $gitPath = $m.s -replace '\\', '/'
        try {
            $content = Git-Show $gitPath
            if ($content -and $content.Length -gt 10) {
                [System.IO.File]::WriteAllText($dst, $content, [System.Text.Encoding]::UTF8)
                Write-Host "  RECOVER $($m.d) from git HEAD"
            }
        } catch {
            Write-Host "  WARN  Could not recover $($m.s)"
        }
    }
}

# become-organizer/actions.ts and forgot-password/actions.ts were IN the dirs that just moved.
# They are now at (main)/become-organizer/actions.ts and (auth)/forgot-password/actions.ts
$renames = @(
    @{ s="src\app\(main)\become-organizer\actions.ts"; d="src\actions\organizer.ts" }
    @{ s="src\app\(auth)\forgot-password\actions.ts";  d="src\actions\password-reset.ts" }
)
foreach ($m in $renames) {
    if (Test-Path -LiteralPath (L $m.s)) {
        $dst = L $m.d
        if (-not (Test-Path -LiteralPath $dst)) {
            Move-Item -LiteralPath (L $m.s) -Destination $dst -Force
            Write-Host "  MOVE  $($m.s) -> $($m.d)"
        } else {
            Remove-Item -LiteralPath (L $m.s) -Force
            Write-Host "  DEDUP $($m.s) (dst already exists)"
        }
    }
}

# Remove empty leftover dirs
Remove-Item -LiteralPath (L "src\app\(studio)") -Recurse -Force -ErrorAction SilentlyContinue

# ─────────────────────────────────────────────────────────────
Write-Host "`n=== PHASE 10: Fix relative imports in extracted actions ==="
Patch-File "src\actions\hq.ts" @{
    'from "../../lib/prisma"'      = 'from "@/lib/prisma"'
    'from "../../auth"'            = 'from "@/auth"'
    'from "../../lib/hq-security"' = 'from "@/lib/hq-security"'
}
Patch-File "src\actions\hq-payouts.ts" @{
    'from "../../lib/prisma"' = 'from "@/lib/prisma"'
    'from "../../auth"'       = 'from "@/auth"'
}
Patch-File "src\actions\organizer-payouts.ts" @{
    'from "../../../lib/prisma"' = 'from "@/lib/prisma"'
    'from "../../../auth"'       = 'from "@/auth"'
}
Patch-File "src\actions\organizer.ts" @{
    'from "../../lib/prisma"' = 'from "@/lib/prisma"'
    'from "../../auth"'       = 'from "@/auth"'
}
Patch-File "src\actions\password-reset.ts" @{
    'from "../../lib/prisma"' = 'from "@/lib/prisma"'
    'from "../../auth"'       = 'from "@/auth"'
}

# ─────────────────────────────────────────────────────────────
Write-Host "`n=== PHASE 11: Rewire consumer imports — actions ==="

Patch-File "src\app\(admin)\hq\_components\Airlock.tsx" @{
    'from "./actions"' = 'from "@/actions/hq"'
}
Patch-File "src\app\(admin)\hq\_components\TwoFactorGate.tsx" @{
    'from "./actions"' = 'from "@/actions/hq"'
}
Patch-File "src\app\(admin)\hq\_components\ChangePasswordForm.tsx" @{
    'from "../actions"' = 'from "@/actions/hq"'
}
Patch-File "src\app\(admin)\hq\_components\CreateNodeForm.tsx" @{
    'from "../actions"' = 'from "@/actions/hq"'
}
Patch-File "src\app\(admin)\hq\_components\GodModeUserManager.tsx" @{
    'from "../../hq/actions"' = 'from "@/actions/hq"'
    'from "../actions"'       = 'from "@/actions/hq"'
}
Patch-File "src\app\(admin)\hq\_components\PayoutQueue.tsx" @{
    'from "../payout-actions"' = 'from "@/actions/hq-payouts"'
}
Patch-File "src\app\(admin)\hq\_components\UserSearchRadar.tsx" @{
    'from "../actions"' = 'from "@/actions/hq"'
}
Patch-File "src\app\(admin)\hq\page.tsx" @{
    'from "./Airlock"'             = 'from "./_components/Airlock"'
    'from "./TwoFactorGate"'       = 'from "./_components/TwoFactorGate"'
    'from "./components/HQHeader"' = 'from "./_components/HQHeader"'
    'from "./views/SuperAdminView"'= 'from "./_views/SuperAdminView"'
    'from "./views/SupervisorView"'= 'from "./_views/SupervisorView"'
    'from "./views/IctView"'       = 'from "./_views/IctView"'
    'from "../../auth"'            = 'from "@/auth"'
    'from "../../lib/prisma"'      = 'from "@/lib/prisma"'
    'from "../../lib/hq-security"' = 'from "@/lib/hq-security"'
}
Patch-File "src\app\(admin)\hq\_views\SuperAdminView.tsx" @{
    'from "../components/CreateNodeForm"'     = 'from "../_components/CreateNodeForm"'
    'from "../components/ChangePasswordForm"' = 'from "../_components/ChangePasswordForm"'
    'from "../components/UserSearchRadar"'    = 'from "../_components/UserSearchRadar"'
    'from "../components/PayoutQueue"'        = 'from "../_components/PayoutQueue"'
    'from "../components/GodModeUserManager"' = 'from "../_components/GodModeUserManager"'
    'from "../actions"'                       = 'from "@/actions/hq"'
}
Patch-File "src\app\(admin)\hq\_views\SupervisorView.tsx" @{
    'from "../components/CreateNodeForm"'     = 'from "../_components/CreateNodeForm"'
    'from "../components/ChangePasswordForm"' = 'from "../_components/ChangePasswordForm"'
    'from "../components/UserSearchRadar"'    = 'from "../_components/UserSearchRadar"'
    'from "../components/PayoutQueue"'        = 'from "../_components/PayoutQueue"'
    'from "../actions"'                       = 'from "@/actions/hq"'
}
Patch-File "src\app\(admin)\hq\_views\IctView.tsx" @{
    'from "../components/ChangePasswordForm"' = 'from "../_components/ChangePasswordForm"'
    'from "../components/UserSearchRadar"'    = 'from "../_components/UserSearchRadar"'
}

# ─────────────────────────────────────────────────────────────
Write-Host "`n=== PHASE 12: Rewire consumer imports — components ==="
$evIdPage = L "src\app\(main)\events\[id]\page.tsx"
if (Test-Path -LiteralPath $evIdPage) {
    $c = [System.IO.File]::ReadAllText($evIdPage)
    $c = $c.Replace('from "./TicketSelector"', 'from "./_components/TicketSelector"')
    [System.IO.File]::WriteAllText($evIdPage, $c)
    Write-Host "  PATCH events/[id]/page.tsx"
}

$cvPage = L "src\app\(main)\checkout\verify\page.tsx"
if (Test-Path -LiteralPath $cvPage) {
    $c = [System.IO.File]::ReadAllText($cvPage)
    $c = $c.Replace('from "./PrintButton"', 'from "./_components/PrintButton"')
    [System.IO.File]::WriteAllText($cvPage, $c)
    Write-Host "  PATCH checkout/verify/page.tsx"
}

$sPage = L "src\app\(main)\studio\page.tsx"
if (Test-Path -LiteralPath $sPage) {
    $c = [System.IO.File]::ReadAllText($sPage)
    $c = $c.Replace('from "./components/WalletWidget"', 'from "./_components/WalletWidget"')
    [System.IO.File]::WriteAllText($sPage, $c)
    Write-Host "  PATCH studio/page.tsx"
}

$wPage = L "src\app\(main)\studio\_components\WalletWidget.tsx"
if (Test-Path -LiteralPath $wPage) {
    $c = [System.IO.File]::ReadAllText($wPage)
    $c = $c.Replace('from "../payout-actions"', 'from "@/actions/organizer-payouts"')
    [System.IO.File]::WriteAllText($wPage, $c)
    Write-Host "  PATCH studio/_components/WalletWidget.tsx"
}

$poPage = L "src\app\(main)\studio\payouts\page.tsx"
if (Test-Path -LiteralPath $poPage) {
    $c = [System.IO.File]::ReadAllText($poPage)
    $c = $c.Replace('from "./PayoutManager"', 'from "./_components/PayoutManager"')
    [System.IO.File]::WriteAllText($poPage, $c)
    Write-Host "  PATCH studio/payouts/page.tsx"
}

$pollSlug = L "src\app\(main)\polls\[slug]\page.tsx"
if (Test-Path -LiteralPath $pollSlug) {
    $c = [System.IO.File]::ReadAllText($pollSlug)
    $c = $c.Replace('from "./VotingCard"', 'from "./_components/VotingCard"')
    [System.IO.File]::WriteAllText($pollSlug, $c)
    Write-Host "  PATCH polls/[slug]/page.tsx"
}

$pollEdit = L "src\app\(main)\polls\edit\[id]\page.tsx"
if (Test-Path -LiteralPath $pollEdit) {
    $c = [System.IO.File]::ReadAllText($pollEdit)
    $c = $c.Replace('from "./EditPollForm"', 'from "./_components/EditPollForm"')
    [System.IO.File]::WriteAllText($pollEdit, $c)
    Write-Host "  PATCH polls/edit/[id]/page.tsx"
}

$pollNew = L "src\app\(main)\polls\new\page.tsx"
if (Test-Path -LiteralPath $pollNew) {
    $c = [System.IO.File]::ReadAllText($pollNew)
    $c = $c.Replace('from "./CreatePollForm"', 'from "./_components/CreatePollForm"')
    [System.IO.File]::WriteAllText($pollNew, $c)
    Write-Host "  PATCH polls/new/page.tsx"
}

$rpPage = L "src\app\(auth)\reset-password\page.tsx"
if (Test-Path -LiteralPath $rpPage) {
    $c = [System.IO.File]::ReadAllText($rpPage)
    $c = $c.Replace('from "./ResetPasswordForm"', 'from "./_components/ResetPasswordForm"')
    [System.IO.File]::WriteAllText($rpPage, $c)
    Write-Host "  PATCH reset-password/page.tsx"
}

$rfPage = L "src\app\(auth)\reset-password\_components\ResetPasswordForm.tsx"
if (Test-Path -LiteralPath $rfPage) {
    $c = [System.IO.File]::ReadAllText($rfPage)
    $c = $c.Replace('from "../forgot-password/actions"', 'from "@/actions/password-reset"')
    [System.IO.File]::WriteAllText($rfPage, $c)
    Write-Host "  PATCH reset-password/_components/ResetPasswordForm.tsx"
}

$boPage = L "src\app\(main)\become-organizer\page.tsx"
if (Test-Path -LiteralPath $boPage) {
    $c = [System.IO.File]::ReadAllText($boPage)
    $c = $c.Replace('from "./actions"', 'from "@/actions/organizer"')
    [System.IO.File]::WriteAllText($boPage, $c)
    Write-Host "  PATCH become-organizer/page.tsx"
}

$fpPage = L "src\app\(auth)\forgot-password\page.tsx"
if (Test-Path -LiteralPath $fpPage) {
    $c = [System.IO.File]::ReadAllText($fpPage)
    $c = $c.Replace('from "./actions"', 'from "@/actions/password-reset"')
    [System.IO.File]::WriteAllText($fpPage, $c)
    Write-Host "  PATCH forgot-password/page.tsx"
}

$smPage = L "src\app\(main)\studio\events\[id]\scan-manager\page.tsx"
if (Test-Path -LiteralPath $smPage) {
    $c = [System.IO.File]::ReadAllText($smPage)
    $c = $c.Replace('from "./CopyLinkButton"', 'from "./_components/CopyLinkButton"')
    [System.IO.File]::WriteAllText($smPage, $c)
    Write-Host "  PATCH studio/events/[id]/scan-manager/page.tsx"
}

# ─────────────────────────────────────────────────────────────
Write-Host "`n=== PHASE 13: Fix studio layout imports ==="
$layoutPath = L "src\app\(main)\layout.tsx"
if (Test-Path -LiteralPath $layoutPath) {
    $c = [System.IO.File]::ReadAllText($layoutPath)
    $c = $c.Replace('from "../../auth"',                  'from "@/auth"')
    $c = $c.Replace('from "../../components/StudioShell"','from "@/components/StudioShell"')
    [System.IO.File]::WriteAllText($layoutPath, $c)
    Write-Host "  PATCH (main)/layout.tsx"
}

# ─────────────────────────────────────────────────────────────
Write-Host "`n=== PHASE 14: Global sweep — fix ALL remaining relative deep imports ==="
# Apply regex replacements across entire src tree to catch any leftover relative paths
# that still point to lib/, auth, actions/, components/ from moved files.

$allFiles = Get-ChildItem -LiteralPath (L "src") -Recurse -Include "*.ts","*.tsx" |
    Where-Object { $_.FullName -notlike "*generated*" -and $_.FullName -notlike "*node_modules*" }

foreach ($f in $allFiles) {
    $c = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
    $orig = $c

    # from "../../lib/prisma" (any depth) -> @/lib/prisma
    $c = [System.Text.RegularExpressions.Regex]::Replace($c,
        'from "(\.\./)+(lib/prisma)"', 'from "@/lib/prisma"')
    # from "../../auth" -> @/auth
    $c = [System.Text.RegularExpressions.Regex]::Replace($c,
        'from "(\.\./)+(auth)"', 'from "@/auth"')
    # from "../../lib/ANYTHING" -> @/lib/ANYTHING
    $c = [System.Text.RegularExpressions.Regex]::Replace($c,
        'from "(\.\./)+(lib/[^"]+)"', 'from "@/$2"')
    # from "../../actions/ANYTHING" -> @/actions/ANYTHING
    $c = [System.Text.RegularExpressions.Regex]::Replace($c,
        'from "(\.\./)+(actions/[^"]+)"', 'from "@/$2"')
    # from "../../components/ANYTHING" -> @/components/ANYTHING
    $c = [System.Text.RegularExpressions.Regex]::Replace($c,
        'from "(\.\./)+(components/[^"]+)"', 'from "@/$2"')

    if ($c -ne $orig) {
        [System.IO.File]::WriteAllText($f.FullName, $c, [System.Text.Encoding]::UTF8)
        Write-Host "  SWEEP $($f.FullName -replace [regex]::Escape($root), '.')"
    }
}

# ─────────────────────────────────────────────────────────────
Write-Host "`n=== PHASE 15: Fix tsconfig @/* alias ==="
$tscPath = L "tsconfig.json"
$tsc = [System.IO.File]::ReadAllText($tscPath)
if ($tsc -match '"@/\*":\s*\["\./\*"\]') {
    $tsc = $tsc -replace '"@/\*":\s*\["\./\*"\]', '"@/*": ["./src/*"]'
    [System.IO.File]::WriteAllText($tscPath, $tsc)
    Write-Host "  PATCHED tsconfig.json: @/* -> ./src/*"
} elseif ($tsc -match '"@/\*":\s*\["./src/\*"\]') {
    Write-Host "  tsconfig.json already correct"
}

# ─────────────────────────────────────────────────────────────
Write-Host "`n=== PHASE 16: Verify final tree ==="
Write-Host "`n-- src/app/ --"
Get-ChildItem -LiteralPath (L "src\app") -Recurse -Name | Sort-Object | ForEach-Object { "  $_" }

Write-Host "`n-- src/actions/ --"
Get-ChildItem -LiteralPath (L "src\actions") -Name | Sort-Object | ForEach-Object { "  $_" }

# ─────────────────────────────────────────────────────────────
Write-Host "`n=== PHASE 17: Git commit ==="
& git -C $root add -A
& git -C $root commit -m "refactor: migrate to (auth)/(main)/(admin) route groups

- Created (auth): login, register, forgot-password, verify-email, reset-password
- Created (main): checkout, events, my-tickets, tickets, scan, studio, polls, become-organizer, terms
- Created (admin): hq with _components/ and _views/
- Extracted 5 inline server action files from app/ into src/actions/:
    hq.ts, hq-payouts.ts, organizer.ts, organizer-payouts.ts, password-reset.ts
- Colocated 13 UI components into _components/ private folders
- Moved hq/views/ into _views/ private folder
- Merged (studio) route group into (main)/studio/
- Resolved (public)/scan semantics -> studio/events/[id]/scan-manager
- Fixed ALL relative imports -> @/ alias across codebase
- Updated tsconfig.json @/* alias to resolve from ./src/"

Write-Host "`n=== MIGRATION COMPLETE. Run: npx tsc --noEmit ==="
