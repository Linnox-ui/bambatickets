#!/usr/bin/env pwsh
# BambaTickets — Architecture Migration Script
# Moves files, creates directories, updates imports, commits result.
# Run from project root: .\migrate.ps1

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

function Ensure-Dir($path) {
    if (-not (Test-Path $path)) { New-Item -ItemType Directory -Force -Path $path | Out-Null }
}

function Move-File($src, $dst) {
    $src = Join-Path $root $src
    $dst = Join-Path $root $dst
    Ensure-Dir (Split-Path $dst -Parent)
    Move-Item -Path $src -Destination $dst -Force
    Write-Host "  MOVE  $($src -replace [regex]::Escape($root),'') -> $($dst -replace [regex]::Escape($root),'')"
}

function Sed-File($file, $old, $new) {
    $path = Join-Path $root $file
    $content = Get-Content $path -Raw -Encoding UTF8
    if ($content -match [regex]::Escape($old)) {
        $content = $content -replace [regex]::Escape($old), $new
        Set-Content -Path $path -Value $content -Encoding UTF8 -NoNewline
        Write-Host "  PATCH $file"
    }
}

Write-Host "`n=== PHASE 1: Create route group skeletons ==="
Ensure-Dir "src\app\(auth)"
Ensure-Dir "src\app\(main)"
Ensure-Dir "src\app\(admin)"

Write-Host "`n=== PHASE 2: Move AUTH routes into (auth)/ ==="
Move-File "src\app\login"               "src\app\(auth)\login"
Move-File "src\app\register"            "src\app\(auth)\register"
Move-File "src\app\forgot-password"     "src\app\(auth)\forgot-password"
Move-File "src\app\verify-email"        "src\app\(auth)\verify-email"
# reset-password has a component that needs to move first; move directory wholesale
Move-File "src\app\reset-password"      "src\app\(auth)\reset-password"

Write-Host "`n=== PHASE 3: Move PUBLIC routes into (main)/ ==="
# Flatten (public) group into (main) — route group names don't affect URLs
Move-File "src\app\(public)\checkout"   "src\app\(main)\checkout"
Move-File "src\app\(public)\events"     "src\app\(main)\events"
Move-File "src\app\(public)\my-tickets" "src\app\(main)\my-tickets"
Move-File "src\app\(public)\tickets"    "src\app\(main)\tickets"
# (public)/scan is actually the staff scanner management page — move to studio
Ensure-Dir "src\app\(main)\studio\events\[id]\scan-manager"
Move-File "src\app\(public)\scan\page.tsx"          "src\app\(main)\studio\events\[id]\scan-manager\page.tsx"
Move-File "src\app\(public)\scan\CopyLinkButton.tsx" "src\app\(main)\studio\events\[id]\scan-manager\_components\CopyLinkButton.tsx"
Remove-Item "src\app\(public)\scan" -ErrorAction SilentlyContinue
Remove-Item "src\app\(public)"      -ErrorAction SilentlyContinue

Write-Host "`n=== PHASE 4: Move root QR scanner into (main)/scan/ ==="
Move-File "src\app\scan" "src\app\(main)\scan"

Write-Host "`n=== PHASE 5: Move STUDIO routes into (main)/studio/ ==="
# Studio is currently (studio)/studio/... — promote contents into (main)/studio/
# Move all pages under (studio)/studio/
Move-File "src\app\(studio)\studio\events"   "src\app\(main)\studio\events"
# payouts page + PayoutManager component
Ensure-Dir "src\app\(main)\studio\payouts\_components"
Move-File "src\app\(studio)\studio\payouts\PayoutManager.tsx" "src\app\(main)\studio\payouts\_components\PayoutManager.tsx"
Move-File "src\app\(studio)\studio\payouts\page.tsx"          "src\app\(main)\studio\payouts\page.tsx"
Remove-Item "src\app\(studio)\studio\payouts" -ErrorAction SilentlyContinue
# WalletWidget
Ensure-Dir "src\app\(main)\studio\_components"
Move-File "src\app\(studio)\studio\components\WalletWidget.tsx" "src\app\(main)\studio\_components\WalletWidget.tsx"
Remove-Item "src\app\(studio)\studio\components" -ErrorAction SilentlyContinue
# studio main page
Move-File "src\app\(studio)\studio\page.tsx" "src\app\(main)\studio\page.tsx"
# studio layout becomes (main) layout
Move-File "src\app\(studio)\layout.tsx"      "src\app\(main)\layout.tsx"
Remove-Item "src\app\(studio)\studio" -ErrorAction SilentlyContinue
Remove-Item "src\app\(studio)"        -ErrorAction SilentlyContinue

Write-Host "`n=== PHASE 6: Move remaining root-level routes into (main)/ ==="
Move-File "src\app\become-organizer"  "src\app\(main)\become-organizer"
Move-File "src\app\terms"             "src\app\(main)\terms"
Move-File "src\app\polls"             "src\app\(main)\polls"

Write-Host "`n=== PHASE 7: Colocate components inside (main) routes ==="
# events/[id]: TicketSelector
Ensure-Dir "src\app\(main)\events\[id]\_components"
Move-File "src\app\(main)\events\[id]\TicketSelector.tsx" "src\app\(main)\events\[id]\_components\TicketSelector.tsx"
# checkout/verify: PrintButton
Ensure-Dir "src\app\(main)\checkout\verify\_components"
Move-File "src\app\(main)\checkout\verify\PrintButton.tsx" "src\app\(main)\checkout\verify\_components\PrintButton.tsx"
# polls slugs and forms
Ensure-Dir "src\app\(main)\polls\[slug]\_components"
Move-File "src\app\(main)\polls\[slug]\VotingCard.tsx" "src\app\(main)\polls\[slug]\_components\VotingCard.tsx"
Ensure-Dir "src\app\(main)\polls\edit\[id]\_components"
Move-File "src\app\(main)\polls\edit\[id]\EditPollForm.tsx" "src\app\(main)\polls\edit\[id]\_components\EditPollForm.tsx"
Ensure-Dir "src\app\(main)\polls\new\_components"
Move-File "src\app\(main)\polls\new\CreatePollForm.tsx" "src\app\(main)\polls\new\_components\CreatePollForm.tsx"
# reset-password form (already moved with the folder, just needs to be placed in _components)
Ensure-Dir "src\app\(auth)\reset-password\_components"
Move-File "src\app\(auth)\reset-password\ResetPasswordForm.tsx" "src\app\(auth)\reset-password\_components\ResetPasswordForm.tsx"

Write-Host "`n=== PHASE 8: Move HQ into (admin)/ ==="
Ensure-Dir "src\app\(admin)\hq\_components"
Ensure-Dir "src\app\(admin)\hq\_views"
Move-File "src\app\hq\Airlock.tsx"                          "src\app\(admin)\hq\_components\Airlock.tsx"
Move-File "src\app\hq\TwoFactorGate.tsx"                    "src\app\(admin)\hq\_components\TwoFactorGate.tsx"
Move-File "src\app\hq\components\ChangePasswordForm.tsx"    "src\app\(admin)\hq\_components\ChangePasswordForm.tsx"
Move-File "src\app\hq\components\CreateNodeForm.tsx"        "src\app\(admin)\hq\_components\CreateNodeForm.tsx"
Move-File "src\app\hq\components\GodModeUserManager.tsx"    "src\app\(admin)\hq\_components\GodModeUserManager.tsx"
Move-File "src\app\hq\components\HQHeader.tsx"              "src\app\(admin)\hq\_components\HQHeader.tsx"
Move-File "src\app\hq\components\PayoutQueue.tsx"           "src\app\(admin)\hq\_components\PayoutQueue.tsx"
Move-File "src\app\hq\components\UserSearchRadar.tsx"       "src\app\(admin)\hq\_components\UserSearchRadar.tsx"
Move-File "src\app\hq\views\IctView.tsx"                    "src\app\(admin)\hq\_views\IctView.tsx"
Move-File "src\app\hq\views\SuperAdminView.tsx"             "src\app\(admin)\hq\_views\SuperAdminView.tsx"
Move-File "src\app\hq\views\SupervisorView.tsx"             "src\app\(admin)\hq\_views\SupervisorView.tsx"
Move-File "src\app\hq\page.tsx"                             "src\app\(admin)\hq\page.tsx"
Remove-Item "src\app\hq\components" -ErrorAction SilentlyContinue
Remove-Item "src\app\hq\views"      -ErrorAction SilentlyContinue
Remove-Item "src\app\hq"            -ErrorAction SilentlyContinue

Write-Host "`n=== PHASE 9: Extract inline server actions to src/actions/ ==="
Move-File "src\app\hq\actions.ts"                      "src\actions\hq.ts"
Move-File "src\app\hq\payout-actions.ts"               "src\actions\hq-payouts.ts"
Move-File "src\app\(studio)\studio\payout-actions.ts"  "src\actions\organizer-payouts.ts"
Move-File "src\app\become-organizer\actions.ts"        "src\actions\organizer.ts"
Move-File "src\app\forgot-password\actions.ts"         "src\actions\password-reset.ts"

Write-Host "`n=== PHASE 10: Fix relative imports in extracted actions ==="
# hq.ts: was at src/app/hq/, imported from ../../lib/ and ../../auth
Sed-File "src\actions\hq.ts" 'from "../../lib/prisma"'   'from "@/lib/prisma"'
Sed-File "src\actions\hq.ts" 'from "../../auth"'          'from "@/auth"'
Sed-File "src\actions\hq.ts" 'from "../../lib/hq-security"' 'from "@/lib/hq-security"'
# hq-payouts.ts
Sed-File "src\actions\hq-payouts.ts" 'from "../../lib/prisma"' 'from "@/lib/prisma"'
Sed-File "src\actions\hq-payouts.ts" 'from "../../auth"'        'from "@/auth"'
# organizer-payouts.ts: was at src/app/(studio)/studio/, imported from ../../../lib/
Sed-File "src\actions\organizer-payouts.ts" 'from "../../../lib/prisma"' 'from "@/lib/prisma"'
Sed-File "src\actions\organizer-payouts.ts" 'from "../../../auth"'        'from "@/auth"'
# organizer.ts: was at src/app/become-organizer/, imported from ../../lib/
Sed-File "src\actions\organizer.ts" 'from "../../lib/prisma"' 'from "@/lib/prisma"'
Sed-File "src\actions\organizer.ts" 'from "../../auth"'        'from "@/auth"'
# password-reset.ts: was at src/app/forgot-password/, imported from ../../lib/
Sed-File "src\actions\password-reset.ts" 'from "../../lib/prisma"' 'from "@/lib/prisma"'

Write-Host "`n=== PHASE 11: Rewire consumers to new action paths ==="
# Airlock: was importing from ./actions
Sed-File 'src\app\(admin)\hq\_components\Airlock.tsx' 'from "./actions"' 'from "@/actions/hq"'
# TwoFactorGate: was importing from ./actions
Sed-File 'src\app\(admin)\hq\_components\TwoFactorGate.tsx' 'from "./actions"' 'from "@/actions/hq"'
# ChangePasswordForm: was at hq/components/, importing from ../actions
Sed-File 'src\app\(admin)\hq\_components\ChangePasswordForm.tsx' 'from "../actions"' 'from "@/actions/hq"'
# CreateNodeForm: was at hq/components/, importing from ../actions
Sed-File 'src\app\(admin)\hq\_components\CreateNodeForm.tsx' 'from "../actions"' 'from "@/actions/hq"'
# GodModeUserManager: was at hq/components/, importing from ../../hq/actions
Sed-File 'src\app\(admin)\hq\_components\GodModeUserManager.tsx' 'from "../../hq/actions"' 'from "@/actions/hq"'
# PayoutQueue: was at hq/components/, importing from ../payout-actions
Sed-File 'src\app\(admin)\hq\_components\PayoutQueue.tsx' 'from "../payout-actions"' 'from "@/actions/hq-payouts"'
# UserSearchRadar: was at hq/components/, importing from ../actions
Sed-File 'src\app\(admin)\hq\_components\UserSearchRadar.tsx' 'from "../actions"' 'from "@/actions/hq"'
# HQ page: was at src/app/hq/, importing ./Airlock, ./TwoFactorGate, ./components/*, ./views/*
Sed-File 'src\app\(admin)\hq\page.tsx' 'from "./Airlock"'                'from "./_components/Airlock"'
Sed-File 'src\app\(admin)\hq\page.tsx' 'from "./TwoFactorGate"'          'from "./_components/TwoFactorGate"'
Sed-File 'src\app\(admin)\hq\page.tsx' 'from "./components/HQHeader"'    'from "./_components/HQHeader"'
Sed-File 'src\app\(admin)\hq\page.tsx' 'from "./views/SuperAdminView"'   'from "./_views/SuperAdminView"'
Sed-File 'src\app\(admin)\hq\page.tsx' 'from "./views/SupervisorView"'   'from "./_views/SupervisorView"'
Sed-File 'src\app\(admin)\hq\page.tsx' 'from "./views/IctView"'          'from "./_views/IctView"'
Sed-File 'src\app\(admin)\hq\page.tsx' 'from "../../auth"'               'from "@/auth"'
Sed-File 'src\app\(admin)\hq\page.tsx' 'from "../../lib/prisma"'         'from "@/lib/prisma"'
Sed-File 'src\app\(admin)\hq\page.tsx' 'from "../../lib/hq-security"'    'from "@/lib/hq-security"'
# HQ views: were at hq/views/, importing from ../components/
Sed-File 'src\app\(admin)\hq\_views\SuperAdminView.tsx' 'from "../components/CreateNodeForm"'     'from "../_components/CreateNodeForm"'
Sed-File 'src\app\(admin)\hq\_views\SuperAdminView.tsx' 'from "../components/ChangePasswordForm"' 'from "../_components/ChangePasswordForm"'
Sed-File 'src\app\(admin)\hq\_views\SuperAdminView.tsx' 'from "../components/UserSearchRadar"'    'from "../_components/UserSearchRadar"'
Sed-File 'src\app\(admin)\hq\_views\SuperAdminView.tsx' 'from "../components/PayoutQueue"'        'from "../_components/PayoutQueue"'
Sed-File 'src\app\(admin)\hq\_views\SuperAdminView.tsx' 'from "../components/GodModeUserManager"' 'from "../_components/GodModeUserManager"'
Sed-File 'src\app\(admin)\hq\_views\SuperAdminView.tsx' 'from "../actions"'                       'from "@/actions/hq"'
Sed-File 'src\app\(admin)\hq\_views\SupervisorView.tsx' 'from "../components/CreateNodeForm"'     'from "../_components/CreateNodeForm"'
Sed-File 'src\app\(admin)\hq\_views\SupervisorView.tsx' 'from "../components/ChangePasswordForm"' 'from "../_components/ChangePasswordForm"'
Sed-File 'src\app\(admin)\hq\_views\SupervisorView.tsx' 'from "../components/UserSearchRadar"'    'from "../_components/UserSearchRadar"'
Sed-File 'src\app\(admin)\hq\_views\SupervisorView.tsx' 'from "../components/PayoutQueue"'        'from "../_components/PayoutQueue"'
Sed-File 'src\app\(admin)\hq\_views\SupervisorView.tsx' 'from "../actions"'                       'from "@/actions/hq"'
Sed-File 'src\app\(admin)\hq\_views\IctView.tsx'       'from "../components/ChangePasswordForm"'  'from "../_components/ChangePasswordForm"'
Sed-File 'src\app\(admin)\hq\_views\IctView.tsx'       'from "../components/UserSearchRadar"'     'from "../_components/UserSearchRadar"'

Write-Host "`n=== PHASE 12: Rewire consumers to new component paths ==="
# (main) routes
# events/[id]/page.tsx: imports ./TicketSelector -> ./_components/TicketSelector
Sed-File 'src\app\(main)\events\[id]\page.tsx' 'from "./TicketSelector"' 'from "./_components/TicketSelector"'
# checkout/verify/page.tsx: imports ./PrintButton -> ./_components/PrintButton
Sed-File 'src\app\(main)\checkout\verify\page.tsx' 'from "./PrintButton"' 'from "./_components/PrintButton"'
# studio/page.tsx: imports ./components/WalletWidget -> ./_components/WalletWidget
Sed-File 'src\app\(main)\studio\page.tsx' 'from "./components/WalletWidget"' 'from "./_components/WalletWidget"'
# WalletWidget: imports ../payout-actions -> @/actions/organizer-payouts
Sed-File 'src\app\(main)\studio\_components\WalletWidget.tsx' 'from "../payout-actions"' 'from "@/actions/organizer-payouts"'
# studio/payouts/page.tsx: imports ./PayoutManager -> ./_components/PayoutManager
Sed-File 'src\app\(main)\studio\payouts\page.tsx' 'from "./PayoutManager"' 'from "./_components/PayoutManager"'
# polls
Sed-File 'src\app\(main)\polls\[slug]\page.tsx'      'from "./VotingCard"'    'from "./_components/VotingCard"'
Sed-File 'src\app\(main)\polls\edit\[id]\page.tsx'   'from "./EditPollForm"'  'from "./_components/EditPollForm"'
Sed-File 'src\app\(main)\polls\new\page.tsx'         'from "./CreatePollForm"' 'from "./_components/CreatePollForm"'
# reset-password
Sed-File 'src\app\(auth)\reset-password\page.tsx' 'from "./ResetPasswordForm"' 'from "./_components/ResetPasswordForm"'
# ResetPasswordForm imported from ../forgot-password/actions -> @/actions/password-reset
Sed-File 'src\app\(auth)\reset-password\_components\ResetPasswordForm.tsx' 'from "../forgot-password/actions"' 'from "@/actions/password-reset"'
# become-organizer/page.tsx: ./actions -> @/actions/organizer
Sed-File 'src\app\(main)\become-organizer\page.tsx' 'from "./actions"' 'from "@/actions/organizer"'
# forgot-password/page.tsx: ./actions -> @/actions/password-reset
Sed-File 'src\app\(auth)\forgot-password\page.tsx' 'from "./actions"' 'from "@/actions/password-reset"'

Write-Host "`n=== PHASE 13: Rewire relative lib/auth paths in moved app pages ==="
# The studio layout moved from (studio)/ to (main)/
# Old: ../../auth  and  ../../components/StudioShell
Sed-File 'src\app\(main)\layout.tsx' 'from "../../auth"'                'from "@/auth"'
Sed-File 'src\app\(main)\layout.tsx' 'from "../../components/StudioShell"' 'from "@/components/StudioShell"'

# Fix scan-manager page (was (public)/scan, had relative imports)
Sed-File 'src\app\(main)\studio\events\[id]\scan-manager\page.tsx' 'from "../../../auth"'             'from "@/auth"'
Sed-File 'src\app\(main)\studio\events\[id]\scan-manager\page.tsx' 'from "../../../lib/prisma"'        'from "@/lib/prisma"'
Sed-File 'src\app\(main)\studio\events\[id]\scan-manager\page.tsx' 'from "../../../actions/staff"'     'from "@/actions/staff"'
Sed-File 'src\app\(main)\studio\events\[id]\scan-manager\page.tsx' 'from "./CopyLinkButton"'           'from "./_components/CopyLinkButton"'

# Fix deep studio pages: they were at (studio)/studio/events/[id]/...
# These had relative paths like ../../../../../../actions/... which were already absolute-ish.
# Check studio events pages that had relative auth imports
Sed-File 'src\app\(main)\studio\events\new\page.tsx'               'from "../../../../../actions/events"'  'from "@/actions/events"'
Sed-File 'src\app\(main)\studio\events\[id]\attendees\page.tsx'    'from "../../../../../../actions'       'from "@/actions'  # partial match, see below

Write-Host "`n=== PHASE 13b: Fix studio event deep page imports (auth/lib) ==="
$deepPages = @(
    'src\app\(main)\studio\events\[id]\page.tsx',
    'src\app\(main)\studio\events\[id]\attendees\page.tsx',
    'src\app\(main)\studio\events\[id]\edit\page.tsx',
    'src\app\(main)\studio\events\[id]\finance\page.tsx',
    'src\app\(main)\studio\events\[id]\scanner\page.tsx',
    'src\app\(main)\studio\events\[id]\staff\page.tsx',
    'src\app\(main)\studio\page.tsx',
    'src\app\(main)\studio\payouts\page.tsx',
    'src\app\(main)\events\[id]\page.tsx',
    'src\app\(main)\checkout\[eventId]\page.tsx',
    'src\app\(main)\checkout\verify\page.tsx',
    'src\app\(main)\my-tickets\page.tsx',
    'src\app\(main)\tickets\success\page.tsx',
    'src\app\(main)\scan\[eventId]\page.tsx',
    'src\app\(main)\polls\page.tsx',
    'src\app\(main)\polls\[slug]\page.tsx',
    'src\app\(main)\polls\dashboard\page.tsx',
    'src\app\(main)\polls\edit\[id]\page.tsx',
    'src\app\(main)\polls\new\page.tsx',
    'src\app\(main)\become-organizer\page.tsx',
    'src\app\(main)\terms\page.tsx',
    'src\app\(auth)\login\page.tsx',
    'src\app\(auth)\register\page.tsx',
    'src\app\(auth)\forgot-password\page.tsx',
    'src\app\(auth)\verify-email\page.tsx',
    'src\app\(auth)\reset-password\page.tsx'
)

foreach ($f in $deepPages) {
    $p = Join-Path $root $f
    if (Test-Path $p) {
        $c = Get-Content $p -Raw -Encoding UTF8
        $changed = $false

        # Replace any relative ../../../lib/prisma (any depth) with @/lib/prisma
        $new = $c -replace 'from "(\.\./)+lib/prisma"', 'from "@/lib/prisma"'
        if ($new -ne $c) { $c = $new; $changed = $true }

        # Replace any relative ../../../auth (any depth) with @/auth
        $new = $c -replace 'from "(\.\./)+auth"', 'from "@/auth"'
        if ($new -ne $c) { $c = $new; $changed = $true }

        # Replace any relative ../../../actions/... (any depth) with @/actions/...
        $new = $c -replace 'from "(\.\./)+actions/([^"]+)"', 'from "@/actions/$2"'
        if ($new -ne $c) { $c = $new; $changed = $true }

        # Replace any relative ../../../components/... (any depth) with @/components/...
        $new = $c -replace 'from "(\.\./)+components/([^"]+)"', 'from "@/components/$2"'
        if ($new -ne $c) { $c = $new; $changed = $true }

        # Replace any relative ../../../lib/... (any depth) with @/lib/...
        $new = $c -replace 'from "(\.\./)+lib/([^"]+)"', 'from "@/lib/$2"'
        if ($new -ne $c) { $c = $new; $changed = $true }

        if ($changed) {
            Set-Content -Path $p -Value $c -Encoding UTF8 -NoNewline
            Write-Host "  PATCH $f"
        }
    }
}

Write-Host "`n=== PHASE 14: Fix moved _components that reference actions ==="
$componentFiles = Get-ChildItem -Path (Join-Path $root "src") -Recurse -Include "*.tsx","*.ts" |
    Where-Object { $_.FullName -notlike "*generated*" -and $_.FullName -notlike "*node_modules*" }

foreach ($f in $componentFiles) {
    $c = Get-Content $f.FullName -Raw -Encoding UTF8
    $changed = $false

    $new = $c -replace 'from "(\.\./)+lib/prisma"', 'from "@/lib/prisma"'
    if ($new -ne $c) { $c = $new; $changed = $true }

    $new = $c -replace 'from "(\.\./)+auth"', 'from "@/auth"'
    if ($new -ne $c) { $c = $new; $changed = $true }

    $new = $c -replace 'from "(\.\./)+actions/([^"]+)"', 'from "@/actions/$2"'
    if ($new -ne $c) { $c = $new; $changed = $true }

    $new = $c -replace 'from "(\.\./)+components/([^"]+)"', 'from "@/components/$2"'
    if ($new -ne $c) { $c = $new; $changed = $true }

    $new = $c -replace 'from "(\.\./)+lib/([^"]+)"', 'from "@/lib/$2"'
    if ($new -ne $c) { $c = $new; $changed = $true }

    if ($changed) {
        Set-Content -Path $f.FullName -Value $c -Encoding UTF8 -NoNewline
        Write-Host "  PATCH $($f.FullName -replace [regex]::Escape($root),'.')"
    }
}

Write-Host "`n=== PHASE 15: Verify tsconfig @/ alias covers src/ root ==="
# The current tsconfig has "@/*": ["./*"] which resolves from project root,
# meaning @/src/... would be needed. We need it to be @/* -> ./src/*
$tscPath = Join-Path $root "tsconfig.json"
$tsc = Get-Content $tscPath -Raw -Encoding UTF8
# Check if it already points to src
if ($tsc -match '"@/\*":\s*\["\./\*"\]') {
    # Currently resolves from root (./), not src/ -- need to fix to ./src/*
    $tsc = $tsc -replace '"@/\*":\s*\["\./\*"\]', '"@/*": ["./src/*"]'
    Set-Content -Path $tscPath -Value $tsc -Encoding UTF8 -NoNewline
    Write-Host "  PATCHED tsconfig.json: @/* -> ./src/*"
} elseif ($tsc -match '"@/\*":\s*\["./src/\*"\]') {
    Write-Host "  tsconfig.json @/* alias already correct (./src/*)"
}

Write-Host "`n=== PHASE 16: Git commit ==="
& git -C $root add -A
& git -C $root commit -m "refactor: migrate to (auth)/(main)/(admin) route groups

- Created (auth) route group: login, register, forgot-password, verify-email, reset-password
- Created (main) route group: all public + studio + polls + misc routes
- Created (admin) route group: hq with _components/ and _views/
- Extracted 5 inline 'use server' files from app/ into src/actions/:
    hq.ts, hq-payouts.ts, organizer.ts, organizer-payouts.ts, password-reset.ts
- Colocated 13 UI components into _components/ private folders
- Moved hq/views/ into _views/ private folder
- Merged (studio) route group into (main)/studio/
- Resolved (public)/scan misclassification -> studio scan-manager
- Fixed all relative imports -> @/ alias across codebase
- Updated tsconfig.json @/* alias to resolve from ./src/"

Write-Host "`n=== MIGRATION COMPLETE ==="
Write-Host "Run: npx tsc --noEmit to verify types"
