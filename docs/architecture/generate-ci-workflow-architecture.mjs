import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const elements = [];
let seed = 5000;

const base = (id, type, x, y, width, height, options = {}) => ({
  id,
  type,
  x,
  y,
  width,
  height,
  angle: 0,
  strokeColor: options.strokeColor ?? "#1f2937",
  backgroundColor: options.backgroundColor ?? "transparent",
  fillStyle: "solid",
  strokeWidth: options.strokeWidth ?? 2,
  strokeStyle: options.strokeStyle ?? "solid",
  roughness: options.roughness ?? 1,
  opacity: options.opacity ?? 100,
  groupIds: [],
  frameId: null,
  roundness: type === "rectangle" ? { type: 3 } : null,
  seed: seed++,
  version: 1,
  versionNonce: seed++,
  isDeleted: false,
  boundElements: null,
  updated: 1,
  link: null,
  locked: false,
});

function text(id, x, y, value, options = {}) {
  const fontSize = options.fontSize ?? 16;
  const lines = value.split("\n");
  const width = options.width ?? Math.max(...lines.map((line) => line.length)) * fontSize * 0.56;
  const height = lines.length * fontSize * 1.25;
  elements.push({
    ...base(id, "text", x, y, width, height, {
      strokeColor: options.color ?? "#111827",
      strokeWidth: 1,
    }),
    text: value,
    fontSize,
    fontFamily: options.fontFamily ?? 1,
    textAlign: options.textAlign ?? "left",
    verticalAlign: "top",
    containerId: null,
    originalText: value,
    lineHeight: 1.25,
  });
}

function rect(id, x, y, width, height, options = {}) {
  elements.push(base(id, "rectangle", x, y, width, height, options));
}

function box(id, x, y, width, height, title, body, options = {}) {
  if (typeof body !== "string") {
    options = body ?? {};
    body = "";
  }
  rect(`${id}-shape`, x, y, width, height, {
    backgroundColor: options.fill ?? "#ffffff",
    strokeColor: options.stroke ?? "#374151",
    strokeStyle: options.strokeStyle,
    strokeWidth: options.strokeWidth,
  });
  text(`${id}-title`, x + 16, y + 13, title, {
    fontSize: options.titleSize ?? 19,
    color: options.titleColor ?? "#111827",
    width: width - 32,
  });
  if (body) {
    text(`${id}-body`, x + 16, y + 48, body, {
      fontSize: options.bodySize ?? 14,
      color: options.bodyColor ?? "#374151",
      width: width - 32,
      fontFamily: options.mono ? 3 : 1,
    });
  }
}

function diamond(id, x, y, width, height, title, body, options = {}) {
  elements.push(base(`${id}-shape`, "diamond", x, y, width, height, {
    backgroundColor: options.fill ?? "#fff7ed",
    strokeColor: options.stroke ?? "#c2410c",
  }));
  text(`${id}-title`, x + width * 0.2, y + height * 0.24, title, {
    fontSize: options.titleSize ?? 17,
    color: options.titleColor ?? "#9a3412",
    width: width * 0.6,
    textAlign: "center",
  });
  if (body) {
    text(`${id}-body`, x + width * 0.22, y + height * 0.48, body, {
      fontSize: options.bodySize ?? 12,
      color: "#7c2d12",
      width: width * 0.56,
      textAlign: "center",
    });
  }
}

function arrow(id, x1, y1, x2, y2, label = "", options = {}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  elements.push({
    ...base(id, "arrow", x1, y1, Math.abs(dx), Math.abs(dy), {
      strokeColor: options.color ?? "#374151",
      strokeStyle: options.strokeStyle,
      strokeWidth: options.strokeWidth ?? 2,
    }),
    points: [[0, 0], [dx, dy]],
    lastCommittedPoint: null,
    startBinding: null,
    endBinding: null,
    startArrowhead: null,
    endArrowhead: options.endArrowhead ?? "arrow",
    elbowed: false,
  });
  if (label) {
    text(`${id}-label`, (x1 + x2) / 2 - 60, (y1 + y2) / 2 - 24, label, {
      fontSize: 12,
      color: options.color ?? "#4b5563",
      width: 140,
      textAlign: "center",
    });
  }
}

function lane(id, x, y, width, height, number, title, subtitle, fill) {
  rect(`${id}-frame`, x, y, width, height, {
    backgroundColor: fill,
    strokeColor: "#9ca3af",
    strokeStyle: "dashed",
    strokeWidth: 1,
  });
  text(`${id}-number`, x + 20, y + 16, number, { fontSize: 30, color: "#6b7280" });
  text(`${id}-title`, x + 70, y + 20, title, { fontSize: 24, color: "#111827" });
  text(`${id}-subtitle`, x + 70, y + 55, subtitle, { fontSize: 14, color: "#4b5563", width: width - 100 });
}

text("title", 40, 24, "KairoAI CI/CD Workflow Architecture", { fontSize: 36, color: "#111827" });
text(
  "subtitle",
  42,
  72,
  "Application repositories -> sequential quality gates -> ACR -> Helm branch promotion -> Argo CD -> AKS",
  { fontSize: 17, color: "#4b5563" },
);

box("legend-hard", 3150, 24, 250, 74, "Hard gate", "Failure stops the dependent path", { fill: "#fee2e2", stroke: "#b91c1c", bodySize: 12 });
box("legend-report", 3420, 24, 250, 74, "Report-only", "Publishes evidence; does not block", { fill: "#fef3c7", stroke: "#b45309", bodySize: 12 });
box("legend-gitops", 3690, 24, 250, 74, "GitOps handoff", "Git change becomes desired state", { fill: "#dcfce7", stroke: "#15803d", bodySize: 12 });
box("legend-gap", 3960, 24, 260, 74, "Known gap", "Required but not checked in yet", { fill: "#f3f4f6", stroke: "#6b7280", strokeStyle: "dashed", bodySize: 12 });

lane("source", 40, 130, 760, 760, "01", "Source and pull request", "Short-lived branch convention, automated PR creation, and protected main", "#f9fafb");
lane("quality", 830, 130, 1800, 760, "02", "Sequential PR quality gates", "Backend and dashboard variants converge on SonarCloud and Snyk", "#eff6ff");
lane("test", 2660, 130, 1560, 760, "03", "Merged-main test promotion", "Immutable commit image, ACR push, Helm test values update, and manifest validation", "#f0fdf4");
lane("release", 40, 930, 3000, 830, "04", "Production release and GitOps", "Versioned image promotion and reviewed prod values PR", "#fff7ed");
lane("runtime", 3070, 930, 1150, 830, "05", "Deployment reconciliation", "Argo CD watches desired state and reconciles the production cluster", "#f5f3ff");
lane("controls", 40, 1800, 4180, 600, "06", "Cross-cutting controls", "Credentials, permissions, concurrency, evidence, notifications, and repository coverage", "#f9fafb");

box("developer", 80, 250, 290, 150, "Developer", "Pushes a short-lived branch\nci/** | feature/** | fix/**\nchore/** | test/**", { fill: "#ffffff", stroke: "#111827" });
box("auto-pr", 450, 245, 300, 170, "auto-pr.yml", "Trigger: push to short-lived branch\nCheck for existing open PR\nCreate PR -> main with gh CLI\nToken: AUTO_PR_TOKEN || GITHUB_TOKEN", { fill: "#e0f2fe", stroke: "#0369a1" });
arrow("developer-to-auto", 370, 325, 450, 325, "push");

box("repo-scope", 80, 460, 670, 180, "Repositories using the application pipeline", "10 image repositories: dashboard, API gateway, GitHub, review orchestrator, Terraform runner, security, cost, governance, AI, notification\nreview-worker reuses orchestrator image | kairoai-shared has library-only CI", { fill: "#ffffff", stroke: "#6b7280", bodySize: 13 });
box("branch-protection", 80, 680, 670, 150, "Protected main branch", "PR required | one reviewer approval | no direct push\nPR checks must be visible before merge\nMerge starts the image/test-promotion workflow", { fill: "#fee2e2", stroke: "#b91c1c" });
arrow("auto-to-protection", 600, 415, 410, 680, "PR opened", { color: "#b91c1c" });

box("pr-trigger", 880, 250, 300, 145, "ci.yml trigger", "pull_request: opened\nsynchronize | reopened\nbase branch: main\nPR concurrency cancels stale runs", { fill: "#dbeafe", stroke: "#1d4ed8" });
box("email", 880, 470, 300, 135, "Resolve author email", "Checkout full history\nRead head commit author/email\nFeeds failure notification", { fill: "#ffffff", stroke: "#6b7280" });
arrow("pr-to-email", 1030, 395, 1030, 470, "parallel metadata");
arrow("auto-to-pr", 750, 325, 880, 325, "PR event", { color: "#1d4ed8" });

box("backend-verify", 1230, 205, 410, 245, "Backend verify (Python 3.11)", "checkout fetch-depth: 0\nsetup-python + pip cache\nprivate package Git token mapping\npip install -e .[dev]\nruff check . -> pytest\nDocker build smoke test", { fill: "#ffffff", stroke: "#2563eb", mono: true });
box("frontend-verify", 1230, 500, 410, 225, "Dashboard verify (Node 24)", "checkout fetch-depth: 0\nsetup-node + npm cache\nnpm ci\nnpm run lint -> npm run build\nDocker build smoke test\nNEXT_TELEMETRY_DISABLED=1", { fill: "#ffffff", stroke: "#2563eb", mono: true });
arrow("pr-to-backend", 1180, 315, 1230, 315, "backend");
arrow("pr-to-frontend", 1180, 345, 1230, 610, "dashboard");

box("sonar", 1700, 285, 350, 190, "Reusable SonarCloud", "workflow_call + inherited secrets\nfull Git history\nscan + quality gate status\nproject key / organization / host\nMissing configuration -> SKIPPED", { fill: "#fef3c7", stroke: "#b45309" });
box("snyk", 2110, 285, 350, 190, "Reusable Snyk", "Backend: Python dependencies\nDashboard: npm dependencies\nseverity threshold: HIGH\ncontinue-on-error report mode\nOutput: success/failure/skipped", { fill: "#fef3c7", stroke: "#b45309" });
arrow("backend-to-sonar", 1640, 330, 1700, 350, "needs");
arrow("frontend-to-sonar", 1640, 610, 1700, 410, "needs");
arrow("sonar-to-snyk", 2050, 380, 2110, 380, "only if gate != FAILED");
diamond("pr-decision", 2130, 555, 300, 230, "PR ready?", "verify passed\nquality reports available\nreview approval required", { fill: "#fee2e2", stroke: "#b91c1c" });
arrow("snyk-to-decision", 2285, 475, 2285, 555, "status outputs");
arrow("decision-to-protection", 2130, 670, 750, 755, "required checks + review", { color: "#b91c1c" });

box("merge-trigger", 2710, 245, 300, 170, "ci-build.yaml", "Trigger: PR closed on main\nor workflow_dispatch\nConcurrency does not cancel\nGate currently requires merged=true\nTODO approval/build label disabled", { fill: "#dcfce7", stroke: "#15803d" });
arrow("protection-to-merge", 750, 780, 2710, 360, "approved + merged", { color: "#15803d" });
box("docker-reusable", 3070, 205, 390, 265, "Reusable Docker/ACR workflow", "checkout -> short SHA tag\nvalidate Azure/ACR secrets\nAzure OIDC login (id-token: write)\naz acr login\nDocker build: <sha7> + dev\nTrivy HIGH/CRITICAL SARIF (report)\nupload Security tab -> push both tags", { fill: "#ffffff", stroke: "#15803d", mono: true });
arrow("merge-to-docker", 3010, 330, 3070, 330, "gate passed");
box("acr-test", 3520, 230, 300, 175, "Hub ACR", "acrkairoaihubci.azurecr.io\n/service:<sha7> immutable\n/service:dev moving alias\nOIDC avoids stored Azure password", { fill: "#dbeafe", stroke: "#1d4ed8" });
arrow("docker-to-acr", 3460, 330, 3520, 330, "push");
box("helm-test", 3070, 535, 390, 230, "cd-helm-test.yaml", "Checkout deployments repo @ test\nHELM_REPO_TOKEN\nvalidate envs/dev/<service>.values.yaml\ninstall yq\n.image.tag = <sha7>\ncommit and push as github-actions[bot]", { fill: "#dcfce7", stroke: "#15803d", mono: true });
arrow("docker-to-helm-test", 3265, 470, 3265, 535, "image_tag output");
box("helm-validation-test", 3520, 500, 650, 285, "kairoai-deployments Helm workflow", "Trigger: PR or push to main/test/prod\n1. helm lint charts/kairoai-service\n2. helm template all dev service values\n3. kubeconform -strict -summary\n4. Checkov Kubernetes policy --soft-fail\nSequential job on ubuntu-latest", { fill: "#ffffff", stroke: "#15803d", mono: true });
arrow("helm-test-to-validation", 3460, 650, 3520, 650, "push test branch");
box("test-gap", 3520, 810, 650, 55, "Known gap: no checked-in Argo Application currently watches deployments:test", "", { fill: "#f3f4f6", stroke: "#6b7280", strokeStyle: "dashed", bodySize: 12 });

box("release-trigger", 90, 1050, 360, 180, "Production Release trigger", "GitHub Release: published\nor workflow_dispatch inputs:\nversion | source_image_tag\nupdate_prod_values (default true)\nRelease concurrency never cancels", { fill: "#ffedd5", stroke: "#c2410c" });
box("release-meta", 520, 1035, 430, 215, "Resolve release metadata", "Map repository -> prod values file\nValidate SemVer:\nvX.Y.Z[-alpha|beta|rc.N]\nResolve source image tag (SHA7)\nCreate release/prod tag names\nFail if service mapping is missing", { fill: "#ffffff", stroke: "#c2410c", mono: true });
arrow("release-to-meta", 450, 1140, 520, 1140, "published/dispatch");
box("pull-scan", 1020, 1035, 420, 215, "Pull and release scan", "Azure OIDC -> ACR login\nPull existing immutable <sha7> image\n5 attempts, 15-second backoff\nTrivy HIGH/CRITICAL SARIF\nUpload GitHub security evidence\nNo rebuild: promote tested bytes", { fill: "#fef3c7", stroke: "#b45309", mono: true });
arrow("meta-to-pull", 950, 1140, 1020, 1140, "valid metadata");
arrow("acr-to-pull", 3670, 405, 1230, 1035, "pull tested SHA", { color: "#1d4ed8" });
box("release-tags", 1510, 1035, 420, 235, "Promote ACR tags", "<image>:vX.Y.Z\n<image>:release-vX.Y.Z\n<image>:prod-vX.Y.Z\n<image>:prod-latest\nPush each with 5 retries\nVersion tag is the prod values target", { fill: "#dbeafe", stroke: "#1d4ed8", mono: true });
arrow("pull-to-tags", 1440, 1140, 1510, 1140, "scan evidence");
arrow("tags-to-acr", 1720, 1035, 3670, 405, "retag + push", { color: "#1d4ed8" });
box("prod-values-pr", 2000, 1015, 470, 270, "Open deployments prod PR", "Checkout kairoai-deployments @ prod\nbranch release/<service>/prod-vX.Y.Z\nyq .image.tag = prod-vX.Y.Z\ncommit + force-with-lease push\ncreate or update PR -> prod\nHELM_REPO_TOKEN required", { fill: "#dcfce7", stroke: "#15803d", mono: true });
arrow("tags-to-values", 1930, 1150, 2000, 1150, "update_prod_values=true");
diamond("prod-review", 2540, 1035, 330, 235, "Approve prod PR", "reviewer team\nbranch protection\nHelm validation must pass", { fill: "#fee2e2", stroke: "#b91c1c" });
arrow("values-to-review", 2470, 1150, 2540, 1150, "PR");
box("prod-helm-check", 2020, 1370, 450, 230, "Prod Helm validation", "Same deployment workflow:\nhelm lint -> render dev set\nkubeconform strict\nCheckov Kubernetes report\nRuns on PR and prod push", { fill: "#ffffff", stroke: "#15803d", mono: true });
arrow("values-to-prod-check", 2235, 1285, 2235, 1370, "PR event");
arrow("prod-check-to-review", 2470, 1480, 2705, 1270, "green check");

box("argocd-prod", 3120, 1040, 470, 240, "Argo CD production apps", "Repo: kairoai-deployments\ntargetRevision: prod\nchart: kairoai-service\nvalues: envs/prod/<service>.values.yaml\n12 Applications incl. worker + secrets", { fill: "#ede9fe", stroke: "#6d28d9", mono: true });
arrow("review-to-argocd", 2870, 1150, 3120, 1150, "merge prod", { color: "#6d28d9" });
box("argocd-policy", 3660, 1040, 500, 240, "Reconciliation policy", "automated sync\nselfHeal: true\nprune: false\nCreateNamespace=true\nDesired state is Git, not CI kubectl", { fill: "#ede9fe", stroke: "#6d28d9", mono: true });
arrow("argocd-to-policy", 3590, 1150, 3660, 1150, "watch");
box("aks-prod", 3370, 1380, 520, 230, "Production AKS namespace: kairoai", "Argo renders Helm and reconciles deployments\nPods pull prod-vX.Y.Z from hub ACR\nReadiness/health determines workload availability\nSelf-heal restores declared state", { fill: "#dcfce7", stroke: "#15803d" });
arrow("policy-to-aks", 3910, 1280, 3710, 1380, "sync");
arrow("acr-to-aks", 3820, 405, 3630, 1380, "image pull", { color: "#1d4ed8" });
box("prod-result", 3120, 1650, 1040, 80, "Result: reviewed version tag in Git + immutable image in ACR + continuously reconciled AKS workload", { fill: "#dcfce7", stroke: "#15803d", bodySize: 12 });

box("secrets", 90, 1920, 760, 330, "Required secrets and variables", "Azure/ACR: AZURE_CLIENT_ID, AZURE_TENANT_ID, AZURE_SUBSCRIPTION_ID, ACR_LOGIN_SERVER\nQuality: SONAR_TOKEN, SONAR_PROJECT_KEY, SONAR_ORGANIZATION, SNYK_TOKEN\nGit: KAIROAI_PACKAGE_READ_TOKEN, AUTO_PR_TOKEN, HELM_REPO_TOKEN\nNotify: SLACK_INCOMING_WEBHOOK, SMTP_USERNAME/PASSWORD, MAIL_FROM/MAIL_TO\nUse org secrets where shared; least privilege and selected-repo visibility", { fill: "#ffffff", stroke: "#4b5563", mono: true, bodySize: 13 });
box("permissions", 900, 1920, 700, 330, "Workflow permissions", "PR checks: contents:read, security-events:write\nAuto PR: contents:read, pull-requests:write\nImage/release: contents:read, id-token:write, security-events:write\nProd values PR: token must read/write deployments and PRs\nAzure authentication uses federated OIDC; no ACR password stored", { fill: "#ffffff", stroke: "#4b5563", mono: true, bodySize: 13 });
box("reliability", 1650, 1920, 700, 330, "Reliability and supply-chain controls", "PR concurrency: cancel stale synchronize runs\nMerge/release concurrency: never cancel active promotion\nFail-fast through needs dependencies\nImmutable SHA source -> version aliases; production is not rebuilt\nRelease pull/push retries: 5 x 15s\nPinned action SHAs in release; versioned actions elsewhere", { fill: "#ffffff", stroke: "#4b5563", mono: true, bodySize: 13 });
box("notifications", 2400, 1920, 700, 330, "Failure notification fan-in", "Composite notification-action\nOptional SMTP email to author/team\nSlack incoming webhook with workflow link\nTriggered for verify/quality, image/ACR/Helm, and release failures\nReport links: Actions, SonarCloud, Snyk, SARIF Security tab", { fill: "#fee2e2", stroke: "#b91c1c", bodySize: 13 });
box("evidence", 3150, 1920, 1020, 330, "Gates versus report-only evidence", "Hard gates: lint, unit tests, app build, Docker smoke, secret checks, Azure login, ACR pull/push, Helm file update, Helm lint, kubeconform, PR approval.\nReport-only today: Snyk, Trivy, Checkov Kubernetes; Sonar behavior depends on each reusable workflow output.\nPilot exception: merged-main build gate has approval/build-label checks commented out. Re-enable after pilot.\nKnown deployment gap: test branch receives values updates but no checked-in test Argo Application watches it.", { fill: "#fef3c7", stroke: "#b45309", bodySize: 13 });

arrow("quality-failure", 2280, 785, 2740, 1920, "failure output", { color: "#b91c1c", strokeStyle: "dashed" });
arrow("test-failure", 3260, 765, 2800, 1920, "build/push/Helm failure", { color: "#b91c1c", strokeStyle: "dashed" });
arrow("release-failure", 1720, 1270, 2700, 1920, "release failure", { color: "#b91c1c", strokeStyle: "dashed" });

const diagram = {
  type: "excalidraw",
  version: 2,
  source: "https://excalidraw.com",
  elements,
  appState: {
    gridSize: null,
    viewBackgroundColor: "#ffffff",
  },
  files: {},
};

const output = path.join(path.dirname(fileURLToPath(import.meta.url)), "kairoai-ci-cd-workflow-architecture.excalidraw");
fs.writeFileSync(output, `${JSON.stringify(diagram, null, 2)}\n`, "utf8");
console.log(`Generated ${output} with ${elements.length} elements.`);
