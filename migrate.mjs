#!/usr/bin/env node
// BambaTickets — Architecture Migration (Phase 6 onwards)
// Run from project root: node migrate.mjs
// Handles: remaining file moves, component colocation, action extraction,
//          import rewiring, tsconfig fix, git commit.
// Uses fs with explicit literalPath-style operations (no glob expansion).

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const root = process.cwd();
const log = (msg) => console.log(msg);

// ── Helpers ───────────────────────────────────────────────────────────────────

function p(...parts) {
  return path.join(root, ...parts);
}

function ensureDir(rel) {
  fs.mkdirSync(p(rel), { recursive: true });
}

function moveFile(src, dst) {
  const s = p(src), d = p(dst);
  if (!fs.existsSync(s)) { log(`  SKIP  ${src} (not found)`); return; }
  fs.mkdirSync(path.dirname(d), { recursive: true });
  fs.renameSync(s, d);
  log(`  MOVE  ${src} -> ${dst}`);
}

function gitShow(gitPath) {
  // gitPath uses forward slashes
  return execSync(`git show HEAD:"${gitPath}"`, { encoding: "utf8" });
}

function writeFile(rel, content) {
  const dest = p(rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, content, "utf8");
  log(`  WRITE ${rel}`);
}

function readFile(rel) {
  const fp = p(rel);
  if (!fs.existsSync(fp)) return null;
  return fs.readFileSync(fp, "utf8");
}

function patchFile(rel, replacements) {
  const fp = p(rel);
  if (!fs.existsSync(fp)) { log(`  SKIP  ${rel} (not found)`); return; }
  let c = fs.readFileSync(fp, "utf8");
  const orig = c;
  for (const [from, to] of replacements) {
    c = c.split(from).join(to);
  }
  if (c !== orig) {
    fs.writeFileSync(fp, c, "utf8");
    log(`  PATCH ${rel}`);
  }
}

function removeDir(rel) {
  const fp = p(rel);
  if (fs.existsSync(fp)) {
    fs.rmSync(fp, { recursive: true, force: true });
    log(`  RM    ${rel}`);
  }
}

// ── Sweep entire src tree with regex ─────────────────────────────────────────
function sweepImports(dirRel) {
  const dirPath = p(dirRel);
  if (!fs.existsSync(dirPath)) return;
  const walk = (d) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === "generated") continue;
        walk(full);
      } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
        let c = fs.readFileSync(full, "utf8");
        const orig = c;
        // (../)+lib/prisma -> @/lib/prisma
        c = c.replace(/from "(\.\.\/)+lib\/prisma"/g, 'from "@/lib/prisma"');
        // (../)+auth -> @/auth
        c = c.replace(/from "(\.\.\/)+auth"/g, 'from "@/auth"');
        // (../)+lib/xxx -> @/lib/xxx
        c = c.replace(/from "(\.\.\/)+lib\/([^"]+)"/g, 'from "@/lib/$2"');
        // (../)+actions/xxx -> @/actions/xxx
        c = c.replace(/from "(\.\.\/)+actions\/([^"]+)"/g, 'from "@/actions/$2"');
        // (../)+components/xxx -> @/components/xxx
        c = c.replace(/from "(\.\.\/)+components\/([^"]+)"/g, 'from "@/components/$2"');
        if (c !== orig) {
          fs.writeFileSync(full, c, "utf8");
          log(`  SWEEP ${full.replace(root, ".")}`);
        }
      }
    }
  };
  walk(dirPath);
}

// ─────────────────────────────────────────────────────────────────────────────
log("\n=== RECOVER: Studio event sub-pages from git HEAD ===");
const studioPages = {
  "src/app/(studio)/studio/events/[id]/page.tsx":
    "src/app/(main)/studio/events/[id]/page.tsx",
  "src/app/(studio)/studio/events/[id]/attendees/page.tsx":
    "src/app/(main)/studio/events/[id]/attendees/page.tsx",
  "src/app/(studio)/studio/events/[id]/edit/page.tsx":
    "src/app/(main)/studio/events/[id]/edit/page.tsx",
  "src/app/(studio)/studio/events/[id]/finance/page.tsx":
    "src/app/(main)/studio/events/[id]/finance/page.tsx",
  "src/app/(studio)/studio/events/[id]/scanner/page.tsx":
    "src/app/(main)/studio/events/[id]/scanner/page.tsx",
  "src/app/(studio)/studio/events/[id]/staff/page.tsx":
    "src/app/(main)/studio/events/[id]/staff/page.tsx",
};

for (const [gitPath, dstRel] of Object.entries(studioPages)) {
  const dstFull = p(dstRel);
  if (!fs.existsSync(dstFull) || fs.statSync(dstFull).size === 0) {
    try {
      const content = gitShow(gitPath);
      fs.mkdirSync(path.dirname(dstFull), { recursive: true });
      fs.writeFileSync(dstFull, content, "utf8");
      log(`  RECOVER ${dstRel}`);
    } catch (e) {
      log(`  WARN could not recover ${gitPath}: ${e.message}`);
    }
  } else {
    log(`  EXISTS  ${dstRel}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
log("\n=== PHASE 6: Move remaining root routes into (main)/ ===");
moveFile("src/app/become-organizer", "src/app/(main)/become-organizer");
moveFile("src/app/terms",            "src/app/(main)/terms");
moveFile("src/app/polls",            "src/app/(main)/polls");

// ─────────────────────────────────────────────────────────────────────────────
log("\n=== PHASE 7: Colocate components into _components/ ===");

// events/[id]/TicketSelector.tsx -> events/[id]/_components/TicketSelector.tsx
moveFile(
  "src/app/(main)/events/[id]/TicketSelector.tsx",
  "src/app/(main)/events/[id]/_components/TicketSelector.tsx"
);
// checkout/verify/PrintButton.tsx -> checkout/verify/_components/PrintButton.tsx
moveFile(
  "src/app/(main)/checkout/verify/PrintButton.tsx",
  "src/app/(main)/checkout/verify/_components/PrintButton.tsx"
);
// reset-password/ResetPasswordForm.tsx -> reset-password/_components/ResetPasswordForm.tsx
moveFile(
  "src/app/(auth)/reset-password/ResetPasswordForm.tsx",
  "src/app/(auth)/reset-password/_components/ResetPasswordForm.tsx"
);
// polls/[slug]/VotingCard.tsx -> polls/[slug]/_components/VotingCard.tsx
moveFile(
  "src/app/(main)/polls/[slug]/VotingCard.tsx",
  "src/app/(main)/polls/[slug]/_components/VotingCard.tsx"
);
// polls/edit/[id]/EditPollForm.tsx -> polls/edit/[id]/_components/EditPollForm.tsx
moveFile(
  "src/app/(main)/polls/edit/[id]/EditPollForm.tsx",
  "src/app/(main)/polls/edit/[id]/_components/EditPollForm.tsx"
);
// polls/new/CreatePollForm.tsx -> polls/new/_components/CreatePollForm.tsx
moveFile(
  "src/app/(main)/polls/new/CreatePollForm.tsx",
  "src/app/(main)/polls/new/_components/CreatePollForm.tsx"
);

// ─────────────────────────────────────────────────────────────────────────────
log("\n=== PHASE 8: Move HQ into (admin)/ ===");
ensureDir("src/app/(admin)/hq/_components");
ensureDir("src/app/(admin)/hq/_views");

const hqMoves = [
  ["src/app/hq/Airlock.tsx",                      "src/app/(admin)/hq/_components/Airlock.tsx"],
  ["src/app/hq/TwoFactorGate.tsx",                "src/app/(admin)/hq/_components/TwoFactorGate.tsx"],
  ["src/app/hq/components/ChangePasswordForm.tsx", "src/app/(admin)/hq/_components/ChangePasswordForm.tsx"],
  ["src/app/hq/components/CreateNodeForm.tsx",     "src/app/(admin)/hq/_components/CreateNodeForm.tsx"],
  ["src/app/hq/components/GodModeUserManager.tsx", "src/app/(admin)/hq/_components/GodModeUserManager.tsx"],
  ["src/app/hq/components/HQHeader.tsx",           "src/app/(admin)/hq/_components/HQHeader.tsx"],
  ["src/app/hq/components/PayoutQueue.tsx",        "src/app/(admin)/hq/_components/PayoutQueue.tsx"],
  ["src/app/hq/components/UserSearchRadar.tsx",    "src/app/(admin)/hq/_components/UserSearchRadar.tsx"],
  ["src/app/hq/views/IctView.tsx",                 "src/app/(admin)/hq/_views/IctView.tsx"],
  ["src/app/hq/views/SuperAdminView.tsx",          "src/app/(admin)/hq/_views/SuperAdminView.tsx"],
  ["src/app/hq/views/SupervisorView.tsx",          "src/app/(admin)/hq/_views/SupervisorView.tsx"],
  ["src/app/hq/page.tsx",                          "src/app/(admin)/hq/page.tsx"],
];
for (const [s, d] of hqMoves) moveFile(s, d);
removeDir("src/app/hq");

// ─────────────────────────────────────────────────────────────────────────────
log("\n=== PHASE 9: Extract inline server actions to src/actions/ ===");

// hq actions: hq dir just got deleted, recover from git
const actionExtracts = [
  ["src/app/hq/actions.ts",                          "src/actions/hq.ts"],
  ["src/app/hq/payout-actions.ts",                   "src/actions/hq-payouts.ts"],
  ["src/app/(studio)/studio/payout-actions.ts",       "src/actions/organizer-payouts.ts"],
  ["src/app/become-organizer/actions.ts",             "src/actions/organizer.ts"],
  ["src/app/forgot-password/actions.ts",              "src/actions/password-reset.ts"],
];

for (const [gitPath, dstRel] of actionExtracts) {
  const dstFull = p(dstRel);
  if (fs.existsSync(dstFull)) { log(`  EXISTS ${dstRel}`); continue; }
  // Try current filesystem first (some may still exist in new locations)
  const alts = [
    p(gitPath),
    p(gitPath.replace("src/app/become-organizer/", "src/app/(main)/become-organizer/")),
    p(gitPath.replace("src/app/forgot-password/", "src/app/(auth)/forgot-password/")),
  ];
  let found = false;
  for (const alt of alts) {
    if (fs.existsSync(alt)) {
      fs.mkdirSync(path.dirname(dstFull), { recursive: true });
      fs.renameSync(alt, dstFull);
      log(`  MOVE  ${alt.replace(root, ".")} -> ${dstRel}`);
      found = true;
      break;
    }
  }
  if (!found) {
    try {
      const content = gitShow(gitPath);
      fs.mkdirSync(path.dirname(dstFull), { recursive: true });
      fs.writeFileSync(dstFull, content, "utf8");
      log(`  RECOVER ${dstRel} from git HEAD`);
    } catch (e) {
      log(`  WARN could not recover ${gitPath}`);
    }
  }
}

// Remove now-empty studio leftover
removeDir("src/app/(studio)");

// ─────────────────────────────────────────────────────────────────────────────
log("\n=== PHASE 10: Fix relative imports in extracted actions ===");

patchFile("src/actions/hq.ts", [
  ['from "../../lib/prisma"',      'from "@/lib/prisma"'],
  ['from "../../auth"',            'from "@/auth"'],
  ['from "../../lib/hq-security"', 'from "@/lib/hq-security"'],
]);
patchFile("src/actions/hq-payouts.ts", [
  ['from "../../lib/prisma"', 'from "@/lib/prisma"'],
  ['from "../../auth"',       'from "@/auth"'],
]);
patchFile("src/actions/organizer-payouts.ts", [
  ['from "../../../lib/prisma"', 'from "@/lib/prisma"'],
  ['from "../../../auth"',       'from "@/auth"'],
]);
patchFile("src/actions/organizer.ts", [
  ['from "../../lib/prisma"', 'from "@/lib/prisma"'],
  ['from "../../auth"',       'from "@/auth"'],
]);
patchFile("src/actions/password-reset.ts", [
  ['from "../../lib/prisma"', 'from "@/lib/prisma"'],
  ['from "../../auth"',       'from "@/auth"'],
]);

// ─────────────────────────────────────────────────────────────────────────────
log("\n=== PHASE 11: Rewire HQ consumer imports ===");

patchFile("src/app/(admin)/hq/_components/Airlock.tsx", [
  ['from "./actions"', 'from "@/actions/hq"'],
]);
patchFile("src/app/(admin)/hq/_components/TwoFactorGate.tsx", [
  ['from "./actions"', 'from "@/actions/hq"'],
]);
patchFile("src/app/(admin)/hq/_components/ChangePasswordForm.tsx", [
  ['from "../actions"', 'from "@/actions/hq"'],
]);
patchFile("src/app/(admin)/hq/_components/CreateNodeForm.tsx", [
  ['from "../actions"', 'from "@/actions/hq"'],
]);
patchFile("src/app/(admin)/hq/_components/GodModeUserManager.tsx", [
  ['from "../../hq/actions"', 'from "@/actions/hq"'],
  ['from "../actions"',       'from "@/actions/hq"'],
]);
patchFile("src/app/(admin)/hq/_components/PayoutQueue.tsx", [
  ['from "../payout-actions"', 'from "@/actions/hq-payouts"'],
]);
patchFile("src/app/(admin)/hq/_components/UserSearchRadar.tsx", [
  ['from "../actions"', 'from "@/actions/hq"'],
]);
patchFile("src/app/(admin)/hq/page.tsx", [
  ['from "./Airlock"',             'from "./_components/Airlock"'],
  ['from "./TwoFactorGate"',       'from "./_components/TwoFactorGate"'],
  ['from "./components/HQHeader"', 'from "./_components/HQHeader"'],
  ['from "./views/SuperAdminView"','from "./_views/SuperAdminView"'],
  ['from "./views/SupervisorView"','from "./_views/SupervisorView"'],
  ['from "./views/IctView"',       'from "./_views/IctView"'],
  ['from "../../auth"',            'from "@/auth"'],
  ['from "../../lib/prisma"',      'from "@/lib/prisma"'],
  ['from "../../lib/hq-security"', 'from "@/lib/hq-security"'],
]);
patchFile("src/app/(admin)/hq/_views/SuperAdminView.tsx", [
  ['from "../components/CreateNodeForm"',     'from "../_components/CreateNodeForm"'],
  ['from "../components/ChangePasswordForm"', 'from "../_components/ChangePasswordForm"'],
  ['from "../components/UserSearchRadar"',    'from "../_components/UserSearchRadar"'],
  ['from "../components/PayoutQueue"',        'from "../_components/PayoutQueue"'],
  ['from "../components/GodModeUserManager"', 'from "../_components/GodModeUserManager"'],
  ['from "../actions"',                       'from "@/actions/hq"'],
]);
patchFile("src/app/(admin)/hq/_views/SupervisorView.tsx", [
  ['from "../components/CreateNodeForm"',     'from "../_components/CreateNodeForm"'],
  ['from "../components/ChangePasswordForm"', 'from "../_components/ChangePasswordForm"'],
  ['from "../components/UserSearchRadar"',    'from "../_components/UserSearchRadar"'],
  ['from "../components/PayoutQueue"',        'from "../_components/PayoutQueue"'],
  ['from "../actions"',                       'from "@/actions/hq"'],
]);
patchFile("src/app/(admin)/hq/_views/IctView.tsx", [
  ['from "../components/ChangePasswordForm"', 'from "../_components/ChangePasswordForm"'],
  ['from "../components/UserSearchRadar"',    'from "../_components/UserSearchRadar"'],
]);

// ─────────────────────────────────────────────────────────────────────────────
log("\n=== PHASE 12: Rewire component colocation imports ===");

patchFile("src/app/(main)/events/[id]/page.tsx", [
  ['from "./TicketSelector"', 'from "./_components/TicketSelector"'],
]);
patchFile("src/app/(main)/checkout/verify/page.tsx", [
  ['from "./PrintButton"', 'from "./_components/PrintButton"'],
]);
patchFile("src/app/(main)/studio/page.tsx", [
  ['from "./components/WalletWidget"', 'from "./_components/WalletWidget"'],
]);
patchFile("src/app/(main)/studio/_components/WalletWidget.tsx", [
  ['from "../payout-actions"', 'from "@/actions/organizer-payouts"'],
]);
patchFile("src/app/(main)/studio/payouts/page.tsx", [
  ['from "./PayoutManager"', 'from "./_components/PayoutManager"'],
]);
patchFile("src/app/(main)/polls/[slug]/page.tsx", [
  ['from "./VotingCard"', 'from "./_components/VotingCard"'],
]);
patchFile("src/app/(main)/polls/edit/[id]/page.tsx", [
  ['from "./EditPollForm"', 'from "./_components/EditPollForm"'],
]);
patchFile("src/app/(main)/polls/new/page.tsx", [
  ['from "./CreatePollForm"', 'from "./_components/CreatePollForm"'],
]);
patchFile("src/app/(auth)/reset-password/page.tsx", [
  ['from "./ResetPasswordForm"', 'from "./_components/ResetPasswordForm"'],
]);
patchFile("src/app/(auth)/reset-password/_components/ResetPasswordForm.tsx", [
  ['from "../forgot-password/actions"', 'from "@/actions/password-reset"'],
]);
patchFile("src/app/(main)/become-organizer/page.tsx", [
  ['from "./actions"', 'from "@/actions/organizer"'],
]);
patchFile("src/app/(auth)/forgot-password/page.tsx", [
  ['from "./actions"', 'from "@/actions/password-reset"'],
]);
patchFile("src/app/(main)/studio/events/[id]/scan-manager/page.tsx", [
  ['from "./CopyLinkButton"', 'from "./_components/CopyLinkButton"'],
]);

// ─────────────────────────────────────────────────────────────────────────────
log("\n=== PHASE 13: Fix studio layout ===");
patchFile("src/app/(main)/layout.tsx", [
  ['from "../../auth"',                  'from "@/auth"'],
  ['from "../../components/StudioShell"','from "@/components/StudioShell"'],
]);

// ─────────────────────────────────────────────────────────────────────────────
log("\n=== PHASE 14: Global sweep — all remaining relative imports ===");
sweepImports("src");

// ─────────────────────────────────────────────────────────────────────────────
log("\n=== PHASE 15: Fix tsconfig @/* alias ===");
const tscPath = p("tsconfig.json");
let tsc = fs.readFileSync(tscPath, "utf8");
if (tsc.includes('"@/*": ["./*"]')) {
  tsc = tsc.replace('"@/*": ["./*"]', '"@/*": ["./src/*"]');
  fs.writeFileSync(tscPath, tsc, "utf8");
  log("  PATCHED tsconfig.json: @/* -> ./src/*");
} else if (tsc.includes('"@/*": ["./src/*"]')) {
  log("  tsconfig.json already correct");
} else {
  log("  WARN: could not locate @/* alias in tsconfig.json");
}

// ─────────────────────────────────────────────────────────────────────────────
log("\n=== PHASE 16: Final structure verification ===");
function tree(dir, indent = "") {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a,b)=>a.name.localeCompare(b.name))) {
    if (["node_modules",".next","generated"].includes(entry.name)) continue;
    log(`${indent}${entry.isDirectory() ? "📁" : "📄"} ${entry.name}`);
    if (entry.isDirectory()) tree(path.join(dir, entry.name), indent + "  ");
  }
}
log("\nsrc/app/");
tree(p("src/app"));
log("\nsrc/actions/");
tree(p("src/actions"));

// ─────────────────────────────────────────────────────────────────────────────
log("\n=== PHASE 17: Git commit ===");
execSync("git add -A", { cwd: root, stdio: "inherit" });
execSync(
  `git commit -m "refactor: migrate to (auth)/(main)/(admin) route groups

- (auth): login, register, forgot-password, verify-email, reset-password
- (main): checkout, events, my-tickets, tickets, scan, studio, polls, become-organizer, terms
- (admin): hq with _components/ and _views/ private folders
- Extracted 5 inline server actions from app/ into src/actions/:
    hq.ts, hq-payouts.ts, organizer.ts, organizer-payouts.ts, password-reset.ts
- Colocated 13 UI components into _components/ private folders
- Merged (studio) route group into (main)/studio/
- Resolved scan route semantics: staff manager -> studio/events/[id]/scan-manager
- Fixed ALL relative imports to use @/ alias throughout
- Updated tsconfig.json @/* -> ./src/*"`,
  { cwd: root, stdio: "inherit" }
);

log("\n=== DONE. Now run: npx tsc --noEmit ===");
