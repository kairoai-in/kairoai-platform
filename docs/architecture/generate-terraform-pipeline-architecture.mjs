import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const elements = [];
let seed = 9000;

const base = (id, type, x, y, width, height, options = {}) => ({
  id, type, x, y, width, height, angle: 0,
  strokeColor: options.strokeColor ?? "#1f2937",
  backgroundColor: options.backgroundColor ?? "transparent",
  fillStyle: "solid", strokeWidth: options.strokeWidth ?? 2,
  strokeStyle: options.strokeStyle ?? "solid", roughness: 1, opacity: 100,
  groupIds: [], frameId: null,
  roundness: type === "rectangle" ? { type: 3 } : null,
  seed: seed++, version: 1, versionNonce: seed++, isDeleted: false,
  boundElements: null, updated: 1, link: null, locked: false,
});

function text(id, x, y, value, options = {}) {
  const fontSize = options.fontSize ?? 15;
  const lines = String(value).split("\n");
  elements.push({
    ...base(id, "text", x, y, options.width ?? Math.max(...lines.map((line) => line.length)) * fontSize * 0.56, lines.length * fontSize * 1.25, { strokeColor: options.color ?? "#111827", strokeWidth: 1 }),
    text: String(value), fontSize, fontFamily: options.mono ? 3 : 1,
    textAlign: options.textAlign ?? "left", verticalAlign: "top",
    containerId: null, originalText: String(value), lineHeight: 1.25,
  });
}

function rect(id, x, y, width, height, options = {}) {
  elements.push(base(id, "rectangle", x, y, width, height, options));
}

function box(id, x, y, width, height, title, body = "", options = {}) {
  rect(`${id}-shape`, x, y, width, height, { backgroundColor: options.fill ?? "#ffffff", strokeColor: options.stroke ?? "#374151", strokeStyle: options.strokeStyle, strokeWidth: options.strokeWidth });
  text(`${id}-title`, x + 15, y + 12, title, { fontSize: options.titleSize ?? 19, color: options.titleColor ?? "#111827", width: width - 30 });
  if (body) text(`${id}-body`, x + 15, y + 47, body, { fontSize: options.bodySize ?? 13, color: options.bodyColor ?? "#374151", width: width - 30, mono: options.mono });
}

function diamond(id, x, y, width, height, title, body = "", options = {}) {
  elements.push(base(`${id}-shape`, "diamond", x, y, width, height, { backgroundColor: options.fill ?? "#fee2e2", strokeColor: options.stroke ?? "#b91c1c" }));
  text(`${id}-title`, x + width * 0.22, y + height * 0.24, title, { fontSize: 17, color: options.titleColor ?? "#991b1b", width: width * 0.56, textAlign: "center" });
  if (body) text(`${id}-body`, x + width * 0.24, y + height * 0.49, body, { fontSize: 11, color: "#7f1d1d", width: width * 0.52, textAlign: "center" });
}

function arrow(id, x1, y1, x2, y2, label = "", options = {}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  elements.push({
    ...base(id, "arrow", x1, y1, Math.abs(dx), Math.abs(dy), { strokeColor: options.color ?? "#374151", strokeStyle: options.strokeStyle, strokeWidth: options.strokeWidth ?? 2 }),
    points: [[0, 0], [dx, dy]], lastCommittedPoint: null,
    startBinding: null, endBinding: null, startArrowhead: null,
    endArrowhead: "arrow", elbowed: false,
  });
  if (label) text(`${id}-label`, (x1 + x2) / 2 - 70, (y1 + y2) / 2 - 24, label, { fontSize: 11, color: options.color ?? "#4b5563", width: 150, textAlign: "center" });
}

function lane(id, x, y, width, height, number, title, subtitle, fill) {
  rect(`${id}-frame`, x, y, width, height, { backgroundColor: fill, strokeColor: "#9ca3af", strokeStyle: "dashed", strokeWidth: 1 });
  text(`${id}-number`, x + 18, y + 15, number, { fontSize: 29, color: "#6b7280" });
  text(`${id}-title`, x + 68, y + 18, title, { fontSize: 23, color: "#111827" });
  text(`${id}-subtitle`, x + 68, y + 53, subtitle, { fontSize: 13, color: "#4b5563", width: width - 95 });
}

text("title", 40, 22, "KairoAI Terraform Pipeline Architecture", { fontSize: 36 });
text("subtitle", 42, 70, "Three protected promotion branches, sequential policy gates, Azure OIDC, isolated remote state, and gated apply", { fontSize: 17, color: "#4b5563" });
box("legend-hard", 3040, 22, 250, 74, "Hard gate", "Stops the dependent path", { fill: "#fee2e2", stroke: "#b91c1c", bodySize: 12 });
box("legend-report", 3310, 22, 250, 74, "Report-only", "Evidence without blocking", { fill: "#fef3c7", stroke: "#b45309", bodySize: 12 });
box("legend-state", 3580, 22, 250, 74, "State boundary", "Separate backend and lock", { fill: "#dbeafe", stroke: "#1d4ed8", bodySize: 12 });
box("legend-identity", 3850, 22, 300, 74, "Identity boundary", "OIDC and least-privilege RBAC", { fill: "#ede9fe", stroke: "#6d28d9", bodySize: 12 });

lane("source", 40, 130, 900, 700, "01", "Branch and environment routing", "One azure/* work branch targets one protected environment branch", "#f9fafb");
lane("pr", 970, 130, 2250, 700, "02", "Terraform PR pipeline", "Sequential and fail-fast: context -> format -> validate -> security -> plan -> OPA", "#eff6ff");
lane("state", 3250, 130, 900, 700, "03", "State and plan evidence", "Hub-owned backend with isolated containers and keys", "#eef2ff");
lane("apply", 40, 870, 2780, 850, "04", "Post-merge apply pipeline", "Closed PR event, explicit gate, fresh plan, environment-scoped execution", "#f0fdf4");
lane("azure", 2850, 870, 1300, 850, "05", "Azure trust and target boundaries", "Federated Entra identity spans the three subscriptions and hub state", "#f5f3ff");
lane("controls", 40, 1760, 4110, 600, "06", "Cross-cutting controls and known gaps", "Permissions, concurrency, notifications, reusable modules, and hardening backlog", "#f9fafb");

box("engineer", 80, 240, 300, 150, "Infrastructure engineer", "Works on retained short-lived branch\nazure/*\nOpens PR into the intended target\nNo direct push to protected branches", { fill: "#ffffff", stroke: "#111827" });
diamond("target", 440, 225, 300, 195, "Choose target", "hub | test | main", { fill: "#fff7ed", stroke: "#c2410c", titleColor: "#9a3412" });
arrow("engineer-target", 380, 315, 440, 315, "PR");
box("mapping", 90, 480, 760, 270, "Branch-to-environment contract", "hub  -> environments/hub -> hub subscription -> apply-hub\ntest -> environments/test -> test subscription -> apply-test\nmain -> environments/prod -> prod subscription -> apply-prod\nmain secondary -> environments/prod-dr (South India)\nUnsupported target branch fails context mapping", { fill: "#ffffff", stroke: "#c2410c", mono: true });
arrow("target-mapping", 590, 420, 480, 480, "base_ref");
box("reviewers", 90, 765, 760, 45, "CODEOWNERS: @kairoai-in/reviewer | one approval | Elzabeth-L / ElzabethOps", "", { fill: "#fee2e2", stroke: "#b91c1c", titleSize: 15 });

box("pr-trigger", 1010, 225, 320, 190, "terraform-pr.yml trigger", "pull_request: opened, synchronize\nreopened, ready_for_review\nbranches: hub, test, main\npaths: tf, tfvars examples, policies,\nTerraform workflows and actions", { fill: "#dbeafe", stroke: "#1d4ed8", mono: true });
arrow("target-pr", 740, 315, 1010, 315, "matching paths", { color: "#1d4ed8" });
box("context", 1380, 235, 270, 170, "1. Context", "Map branch outputs\nenv_name | tf_dir\nsecondary_tf_dir\nsubscription | label | author", { fill: "#ffffff", stroke: "#2563eb", mono: true });
box("fmt", 1700, 235, 260, 170, "2. Format", "Terraform 1.8.5\ncheckout\nterraform fmt\n-check -recursive", { fill: "#ffffff", stroke: "#2563eb", mono: true });
box("validate", 2010, 210, 330, 220, "3. Validate", "terraform init -backend=false\nterraform validate\nmain also validates prod-dr\nNo Azure login or remote state\nrequired before security", { fill: "#ffffff", stroke: "#2563eb", mono: true });
box("checkov", 2390, 225, 300, 190, "4. Checkov", "Install latest Checkov\nscan whole repository\nframework: terraform\nskip .terraform\n--soft-fail (report-only)", { fill: "#fef3c7", stroke: "#b45309", mono: true });
box("plan", 2740, 195, 420, 250, "5. Azure plan", "Azure login with OIDC\nbackend init + state lock\nterraform plan -out=tfplan\nterraform show -json\nmain plans prod then prod-dr\nupload binary + JSON artifacts", { fill: "#ffffff", stroke: "#2563eb", mono: true });
arrow("pr-context", 1330, 315, 1380, 315, "starts");
arrow("context-fmt", 1650, 315, 1700, 315, "needs");
arrow("fmt-validate", 1960, 315, 2010, 315, "needs");
arrow("validate-checkov", 2340, 315, 2390, 315, "needs");
arrow("checkov-plan", 2690, 315, 2740, 315, "needs");

box("policy", 2010, 515, 500, 225, "6. Conftest / OPA policy", "Download plan JSON artifact(s)\nConftest 0.56.0\npolicies/opa/terraform\nTest primary plan JSON\nmain also tests prod-dr plan JSON\nOPA is the current hard policy gate", { fill: "#fee2e2", stroke: "#b91c1c", mono: true });
arrow("plan-policy", 2950, 445, 2450, 515, "artifacts");
box("pr-result", 2570, 535, 590, 170, "PR result", "All dependent jobs are sequential\nFirst failure prevents later stages\nPlan artifacts are review/policy evidence\nThey are NOT reused after merge\nFailure -> Slack/email notification", { fill: "#dcfce7", stroke: "#15803d" });
arrow("policy-result", 2510, 625, 2570, 625, "pass");

box("backend", 3290, 225, 820, 260, "Remote state backend (hub subscription)", "Resource group: rg-kairoai-tfstate-ci\nStorage account: stkairoaitfstateci\nhubtfstate/kairoai/hub/terraform.tfstate\ntesttfstate/kairoai/test/terraform.tfstate\nprodtfstate/kairoai/prod/terraform.tfstate\nprodtfstate/kairoai/prod-dr/terraform.tfstate\nBlob locking prevents concurrent state mutation", { fill: "#dbeafe", stroke: "#1d4ed8", mono: true });
arrow("backend-plan", 3290, 350, 3160, 350, "init/read/lock", { color: "#1d4ed8" });
box("artifacts", 3290, 535, 390, 200, "GitHub plan artifacts", "terraform-plan-hub/test/prod\nterraform-plan-prod-dr\nBinary tfplan + tfplan.json\nFeeds OPA and human evidence\nEphemeral; not an apply contract", { fill: "#ffffff", stroke: "#1d4ed8", mono: true });
box("bootstrap", 3720, 535, 390, 200, "Backend bootstrap", "bootstrap/ creates storage once\nState later migrated remote\nRBAC instead of storage keys\nBlob PE/public lockdown waits for\nprivate CI execution path", { fill: "#fef3c7", stroke: "#b45309", mono: true });
arrow("plan-artifact", 3160, 405, 3480, 535, "upload", { color: "#1d4ed8" });

box("closed-trigger", 90, 980, 350, 190, "terraform-apply.yml", "Trigger: pull_request closed\nbase: hub | test | main\nConcurrency per base branch\ncancel-in-progress: false\nNo apply on open PR", { fill: "#dcfce7", stroke: "#15803d", mono: true });
diamond("apply-gate", 510, 955, 380, 245, "Apply gate", "merged == true\nmatching apply-* label\n>= 1 APPROVED review\nbranch mapping valid", { fill: "#fee2e2", stroke: "#b91c1c" });
arrow("closed-gate", 440, 1075, 510, 1075, "closed event");
box("skip", 520, 1260, 360, 150, "Gate rejected", "Closed without merge -> quiet skip\nMissing label/review -> notification\nshould_apply=false\nNo Azure login or state mutation", { fill: "#f3f4f6", stroke: "#6b7280" });
arrow("gate-skip", 700, 1200, 700, 1260, "no", { color: "#6b7280" });
box("environment", 970, 980, 330, 190, "GitHub Environment", "environment = hub | test | prod\nEnvironment secrets/policies apply\nJob receives mapped subscription\nARM_USE_OIDC=true", { fill: "#ede9fe", stroke: "#6d28d9", mono: true });
arrow("gate-env", 890, 1075, 970, 1075, "yes", { color: "#15803d" });
box("fresh-plan", 1370, 955, 420, 245, "Fresh post-merge plan", "checkout merged target state\nAzure OIDC login\nterraform init remote backend\nterraform plan -out=apply.tfplan\nDoes not trust stale PR artifact\nReflects final merged configuration", { fill: "#ffffff", stroke: "#15803d", mono: true });
arrow("env-plan", 1300, 1075, 1370, 1075, "OIDC");
arrow("state-apply-plan", 3500, 485, 1580, 955, "read + lock", { color: "#1d4ed8" });
box("apply-primary", 1860, 970, 380, 215, "Apply primary root", "terraform apply apply.tfplan\n-input=false -auto-approve\nhub -> hub root\ntest -> test root\nmain -> prod root\nFailure stops immediately", { fill: "#dcfce7", stroke: "#15803d", mono: true });
arrow("plan-primary", 1790, 1075, 1860, 1075, "reviewed gate");
diamond("is-main", 2300, 960, 300, 235, "main branch?", "secondary_tf_dir\n== environments/prod-dr", { fill: "#fff7ed", stroke: "#c2410c", titleColor: "#9a3412" });
arrow("primary-main", 2240, 1075, 2300, 1075, "success");
box("apply-dr", 2330, 1280, 430, 220, "Apply prod-DR second", "Conditional only for main\nseparate backend state key\ninit -> fresh plan -> apply\nSouth India resources\nFailure notifies after prod success\nNo parallel state mutation", { fill: "#dcfce7", stroke: "#15803d", mono: true });
arrow("main-dr", 2450, 1195, 2500, 1280, "yes", { color: "#15803d" });
box("complete", 1370, 1320, 760, 160, "Apply outcome", "hub/test: primary root complete\nmain: prod complete, then prod-DR complete\nTerraform releases backend locks\nApply failure -> Slack/email with workflow URL\nSuccess leaves desired configuration in remote state", { fill: "#dcfce7", stroke: "#15803d" });
arrow("primary-complete", 2050, 1185, 1900, 1320, "hub/test");
arrow("dr-complete", 2330, 1390, 2130, 1390, "main");

box("entra", 2900, 970, 580, 250, "Entra OIDC application", "app-kairoai-terraform-github-actions\nFederated subjects: pull_request\nrefs/heads/hub | test | main\nenvironment:hub | test | prod\nAudience: api://AzureADTokenExchange\nIssuer: token.actions.githubusercontent.com\nNo client secret", { fill: "#ede9fe", stroke: "#6d28d9", mono: true });
arrow("entra-pr", 2900, 1050, 2970, 445, "PR token", { color: "#6d28d9" });
arrow("entra-apply", 2900, 1120, 1790, 1075, "apply token", { color: "#6d28d9" });
box("rbac", 3540, 970, 560, 250, "Azure RBAC", "Contributor: hub/test/prod subscriptions\nStorage Blob Data Contributor:\n  tfstate storage account\nCross-subscription read/write for peering/DNS\nUser Access Administrator only where\nTerraform must create role assignments", { fill: "#ede9fe", stroke: "#6d28d9", mono: true });
arrow("entra-rbac", 3480, 1090, 3540, 1090, "federated principal");
box("subscriptions", 2900, 1290, 1200, 300, "Target subscriptions and roots", "HUB 5b942f88... -> shared networking, DNS, ACR, Front Door, tfstate\nTEST 6b01db76... -> environments/test -> test spoke resources\nPROD a8270be7... -> environments/prod -> Central India primary\nPROD same subscription -> environments/prod-dr -> South India DR\nHub provider alias + hub remote state support cross-subscription DNS/peering", { fill: "#ffffff", stroke: "#6d28d9", mono: true });
arrow("rbac-targets", 3820, 1220, 3650, 1290, "authorized scopes", { color: "#6d28d9" });

box("versions", 90, 1880, 650, 300, "Versions, permissions, and concurrency", "Terraform 1.8.5 | Conftest 0.56.0\nPR permissions: contents:read, id-token:write, pull-requests:read\nApply uses the same minimum GitHub permissions\nPR concurrency cancels stale runs per PR\nApply concurrency serializes each base branch and never cancels\nAzureRM environment variables select the mapped subscription", { fill: "#ffffff", stroke: "#4b5563", mono: true, bodySize: 12 });
box("secrets", 790, 1880, 600, 300, "Secrets and notifications", "Required: AZURE_CLIENT_ID, AZURE_TENANT_ID\nSlack: SLACK_INCOMING_WEBHOOK\nOptional email: SMTP_USERNAME/PASSWORD, MAIL_FROM/MAIL_TO\nComposite notification-action handles:\nPR stage failure | rejected apply gate | apply failure\nNo Azure client secret is stored", { fill: "#fee2e2", stroke: "#b91c1c", mono: true, bodySize: 12 });
box("modules", 1440, 1880, 850, 300, "Reusable Terraform module layer", "naming | resource-group | networking | vnet-peering | private-dns | private-endpoint\nfirewall | ACR | Front Door | App Gateway WAF | AKS | PostgreSQL Flexible\nKey Vault | Service Bus | Monitor | AI Foundry | managed identity | policy\nEnvironment roots compose modules; modules do not own backends or branch logic", { fill: "#ffffff", stroke: "#4b5563", mono: true, bodySize: 12 });
box("gates", 2340, 1880, 780, 300, "Hard gates versus evidence", "HARD: context mapping, fmt, validate, Azure login, backend init, plan, OPA, merge, label, approval, apply\nREPORT-ONLY: Checkov currently uses --soft-fail\nPR plans are review evidence; apply always creates a new plan\nState keys isolate blast radius; branch and apply concurrency prevent overlap", { fill: "#fef3c7", stroke: "#b45309", bodySize: 12 });
box("gaps", 3170, 1880, 920, 300, "Current gaps / next hardening", "Pin Checkov instead of installing latest; remove --soft-fail after backlog closure\nApply workflow triggers on every closed PR to target branches, including docs-only PRs\nAdd plan summary/comment and explicit destructive-change review\nUse private/self-hosted runner before tfstate/Key Vault public lockdown\nReduce User Access Administrator scope or split RBAC bootstrap\nAdd drift detection and scheduled read-only plans", { fill: "#f3f4f6", stroke: "#6b7280", strokeStyle: "dashed", bodySize: 12 });

arrow("pr-failure", 2450, 740, 1050, 1880, "any PR failure", { color: "#b91c1c", strokeStyle: "dashed" });
arrow("gate-failure", 700, 1410, 1050, 1880, "gate warning", { color: "#b91c1c", strokeStyle: "dashed" });
arrow("apply-failure", 2100, 1480, 1100, 1880, "apply failure", { color: "#b91c1c", strokeStyle: "dashed" });

const output = path.join(path.dirname(fileURLToPath(import.meta.url)), "kairoai-terraform-pipeline-architecture.excalidraw");
fs.writeFileSync(output, `${JSON.stringify({ type: "excalidraw", version: 2, source: "https://excalidraw.com", elements, appState: { gridSize: null, viewBackgroundColor: "#ffffff" }, files: {} }, null, 2)}\n`, "utf8");
console.log(`Generated ${output} with ${elements.length} elements.`);
