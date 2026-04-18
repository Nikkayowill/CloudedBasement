import { jsx, jsxs } from "react/jsx-runtime";
import { R as ResponsiveNav, F as Footer } from "../entry-server.js";
import "react-dom/server";
import "react-router-dom";
import "react";
import "lucide-react";
const TOC = [
  { id: "intro", label: "Introduction" },
  { id: "getting-started", label: "Getting Started" },
  { id: "overview", label: "Overview" },
  { id: "deployments", label: "Deployments" },
  { id: "domains", label: "Domains" },
  { id: "env-vars", label: "Environment Variables" },
  { id: "dev-tools", label: "Dev Tools" },
  { id: "api-keys", label: "API Keys" },
  { id: "settings", label: "Settings" },
  { id: "faq", label: "FAQ & Support" }
];
const h2Style = { fontSize: "1.0625rem", fontWeight: 700, color: "#f5f5f5", marginBottom: "0.5rem", marginTop: 0 };
const h3Style = { fontSize: "0.9375rem", fontWeight: 600, color: "#e5e7eb", marginBottom: "0.375rem", marginTop: 0 };
const pStyle = { fontSize: "0.9rem", color: "#9ca3af", lineHeight: 1.7, margin: "0 0 0.875rem 0" };
const ulStyle = { fontSize: "0.9rem", color: "#9ca3af", lineHeight: 1.7, margin: "0 0 0.875rem 0", paddingLeft: "1.25rem" };
const codeStyle = { fontFamily: "JetBrains Mono, monospace", fontSize: "0.8125rem", color: "#7fd6ff", background: "rgba(45,167,223,0.08)", padding: "0.1rem 0.35rem", borderRadius: "0.2rem" };
function Badge({ children, color = "#60a5fa", bg = "rgba(59,130,246,0.12)" }) {
  return /* @__PURE__ */ jsx("span", { style: {
    display: "inline-block",
    padding: "0.15rem 0.5rem",
    borderRadius: "0.25rem",
    fontSize: "0.6875rem",
    fontWeight: 600,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    background: bg,
    color
  }, children });
}
function InfoBox({ children }) {
  return /* @__PURE__ */ jsx("div", { style: {
    padding: "0.875rem 1rem",
    borderRadius: "0.5rem",
    marginBottom: "1rem",
    background: "rgba(59,130,246,0.06)",
    border: "1px solid rgba(59,130,246,0.18)",
    fontSize: "0.875rem",
    color: "#93c5fd",
    lineHeight: 1.6
  }, children });
}
function WarnBox({ children }) {
  return /* @__PURE__ */ jsx("div", { style: {
    padding: "0.875rem 1rem",
    borderRadius: "0.5rem",
    marginBottom: "1rem",
    background: "rgba(251,191,36,0.05)",
    border: "1px solid rgba(251,191,36,0.2)",
    fontSize: "0.875rem",
    color: "#fde68a",
    lineHeight: 1.6
  }, children });
}
function Section({ id, title, children }) {
  return /* @__PURE__ */ jsxs("section", { id, className: "mb-16 scroll-mt-24", children: [
    /* @__PURE__ */ jsx("h2", { style: h2Style, children: title }),
    /* @__PURE__ */ jsx("div", { style: { height: "1px", background: "rgba(255,255,255,0.07)", marginBottom: "1.25rem" } }),
    children
  ] });
}
function Docs() {
  return /* @__PURE__ */ jsx("div", { className: "funnel", children: /* @__PURE__ */ jsx("div", { className: "cb-shell", children: /* @__PURE__ */ jsxs("div", { className: "cb-shell-inner", style: { minHeight: "100vh", display: "flex", flexDirection: "column" }, children: [
    /* @__PURE__ */ jsx(ResponsiveNav, {}),
    /* @__PURE__ */ jsxs("div", { className: "flex", style: { flex: 1 }, children: [
      /* @__PURE__ */ jsx("aside", { className: "hidden md:block w-56 shrink-0 sticky top-0 self-start h-screen overflow-y-auto border-r border-gray-800 bg-[#030608]", children: /* @__PURE__ */ jsxs("div", { className: "py-8 px-5", children: [
        /* @__PURE__ */ jsx("p", { style: { fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#525252", marginBottom: "0.875rem" }, children: "On This Page" }),
        /* @__PURE__ */ jsx("ul", { style: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.125rem" }, children: TOC.map(({ id, label }) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
          "a",
          {
            href: `#${id}`,
            style: {
              display: "block",
              padding: "0.3rem 0.625rem",
              borderLeft: "2px solid transparent",
              fontSize: "0.8125rem",
              color: "#6b7280",
              textDecoration: "none",
              transition: "color 150ms, border-color 150ms"
            },
            onMouseEnter: (e) => {
              e.currentTarget.style.color = "#e5e7eb";
              e.currentTarget.style.borderLeftColor = "rgba(255,255,255,0.2)";
            },
            onMouseLeave: (e) => {
              e.currentTarget.style.color = "#6b7280";
              e.currentTarget.style.borderLeftColor = "transparent";
            },
            children: label
          }
        ) }, id)) })
      ] }) }),
      /* @__PURE__ */ jsxs("main", { style: { flex: 1, minWidth: 0, paddingTop: "3rem", paddingBottom: "6rem", paddingLeft: "2.5rem", paddingRight: "2.5rem", maxWidth: "52rem", margin: "0 auto" }, children: [
        /* @__PURE__ */ jsxs(Section, { id: "intro", title: "Welcome to Clouded Basement", children: [
          /* @__PURE__ */ jsx("p", { style: pStyle, children: "Clouded Basement is a managed cloud hosting platform that lets you deploy web apps, manage custom domains, and monitor your server — all from a single dashboard. No DevOps experience required." }),
          /* @__PURE__ */ jsx("p", { style: pStyle, children: "This page documents every section of the user dashboard so you know exactly what each control does." })
        ] }),
        /* @__PURE__ */ jsxs(Section, { id: "getting-started", title: "Getting Started", children: [
          /* @__PURE__ */ jsx("p", { style: pStyle, children: "Follow these steps to go from sign-up to your first live deployment:" }),
          /* @__PURE__ */ jsxs("ol", { style: { ...ulStyle, listStyle: "decimal" }, children: [
            /* @__PURE__ */ jsxs("li", { style: { marginBottom: "0.5rem" }, children: [
              /* @__PURE__ */ jsx("b", { style: { color: "#e5e7eb" }, children: "Create an account" }),
              " — visit ",
              /* @__PURE__ */ jsx("a", { href: "/register", style: { color: "#60a5fa" }, children: "Start Free Trial" }),
              " and register with your email and password, or continue with Google."
            ] }),
            /* @__PURE__ */ jsxs("li", { style: { marginBottom: "0.5rem" }, children: [
              /* @__PURE__ */ jsx("b", { style: { color: "#e5e7eb" }, children: "Confirm your email" }),
              " — check your inbox for a verification link and click it to activate your account."
            ] }),
            /* @__PURE__ */ jsxs("li", { style: { marginBottom: "0.5rem" }, children: [
              /* @__PURE__ */ jsx("b", { style: { color: "#e5e7eb" }, children: "Choose a plan" }),
              " — select Basic, Pro, or Premium on the ",
              /* @__PURE__ */ jsx("a", { href: "/pricing", style: { color: "#60a5fa" }, children: "pricing page" }),
              " and complete checkout via Stripe. Your server begins provisioning immediately."
            ] }),
            /* @__PURE__ */ jsxs("li", { style: { marginBottom: "0.5rem" }, children: [
              /* @__PURE__ */ jsx("b", { style: { color: "#e5e7eb" }, children: "Wait 2–3 minutes" }),
              " — your dedicated Linux VPS is being configured on DigitalOcean. The dashboard will update automatically."
            ] }),
            /* @__PURE__ */ jsxs("li", { children: [
              /* @__PURE__ */ jsx("b", { style: { color: "#e5e7eb" }, children: "Deploy your first app" }),
              " — paste a public Git URL and click Deploy. Your app is live within seconds."
            ] })
          ] }),
          /* @__PURE__ */ jsxs(InfoBox, { children: [
            "The ",
            /* @__PURE__ */ jsx("b", { children: "Get Started" }),
            " checklist on your Overview page tracks your progress through these steps and highlights the next action."
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Section, { id: "overview", title: "Overview", children: [
          /* @__PURE__ */ jsx("p", { style: pStyle, children: "The Overview is your dashboard's home screen. It surfaces your server's current state, live resource metrics, uptime status, and a getting-started checklist in one place." }),
          /* @__PURE__ */ jsx("h3", { style: h3Style, children: "Get Started checklist" }),
          /* @__PURE__ */ jsx("p", { style: pStyle, children: "A step-by-step card that tracks setup progress: account created → email confirmed → plan chosen → first app deployed → custom domain added. Each step shows a CTA button pointing to the next action. Once all steps are complete the card is replaced with a confirmation banner." }),
          /* @__PURE__ */ jsx("h3", { style: h3Style, children: "Live metrics" }),
          /* @__PURE__ */ jsxs("p", { style: pStyle, children: [
            "Four real-time tiles — ",
            /* @__PURE__ */ jsx("b", { children: "CPU" }),
            ", ",
            /* @__PURE__ */ jsx("b", { children: "Memory" }),
            ", ",
            /* @__PURE__ */ jsx("b", { children: "Disk" }),
            ", and ",
            /* @__PURE__ */ jsx("b", { children: "Uptime" }),
            " — pulled from your server every 30 seconds via the DigitalOcean API. Color coding tells you at a glance whether resources are healthy (green), under load (yellow), or critical (red). Metrics only appear when your server is online."
          ] }),
          /* @__PURE__ */ jsx("h3", { style: h3Style, children: "Uptime summary" }),
          /* @__PURE__ */ jsx("p", { style: pStyle, children: `A card that shows whether all your deployed sites are responding. If every site is up you'll see a green "All sites operational" banner. If any site goes down, it's listed by URL with a red status. Hover the uptime dot next to a deployment URL for a timestamp of when it went down.` }),
          /* @__PURE__ */ jsx("h3", { style: h3Style, children: "Server card" }),
          /* @__PURE__ */ jsx("p", { style: pStyle, children: "Displays your server's name, status badge (Online / Provisioning / Offline), IPv4 address, IPv6 address (if assigned), current plan, and how many sites you've used out of your plan's limit." }),
          /* @__PURE__ */ jsx("p", { style: pStyle, children: "Two actions are available:" }),
          /* @__PURE__ */ jsxs("ul", { style: ulStyle, children: [
            /* @__PURE__ */ jsxs("li", { children: [
              /* @__PURE__ */ jsx("b", { style: { color: "#e5e7eb" }, children: "Restart" }),
              " — sends a graceful restart to the server. Use this to pick up config changes or recover from a hung process."
            ] }),
            /* @__PURE__ */ jsxs("li", { children: [
              /* @__PURE__ */ jsx("b", { style: { color: "#ef4444" }, children: "Cancel Plan" }),
              " — cancels your Stripe subscription and permanently deletes the server and all its data. This is irreversible."
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Section, { id: "deployments", title: "Deployments", children: [
          /* @__PURE__ */ jsx("p", { style: pStyle, children: "The Deployments section is where you push code to your server. It supports any public repository on GitHub, GitLab, or Bitbucket." }),
          /* @__PURE__ */ jsx("h3", { style: h3Style, children: "Deploying an app" }),
          /* @__PURE__ */ jsxs("p", { style: pStyle, children: [
            "Paste a public Git URL (e.g. ",
            /* @__PURE__ */ jsx("code", { style: codeStyle, children: "https://github.com/you/my-app" }),
            ") into the deploy field and click ",
            /* @__PURE__ */ jsx("b", { children: "Deploy" }),
            ". The server clones the repo, installs dependencies, runs your build command, and starts your app — all automatically. Each deployment gets a unique ",
            /* @__PURE__ */ jsx("code", { style: codeStyle, children: "*.cloudedbasement.ca" }),
            " subdomain so you can access it immediately without a custom domain."
          ] }),
          /* @__PURE__ */ jsxs(InfoBox, { children: [
            "Deploying the same Git URL again triggers a ",
            /* @__PURE__ */ jsx("b", { children: "redeploy" }),
            " — it pulls the latest commit on the default branch and restarts the app."
          ] }),
          /* @__PURE__ */ jsx(WarnBox, { children: "You can only deploy up to your plan's site limit. Basic = 2 sites, Pro = 5, Premium = 10. The form will show an upgrade prompt if you've reached the limit." }),
          /* @__PURE__ */ jsx("h3", { style: h3Style, children: "Deployment list" }),
          /* @__PURE__ */ jsx("p", { style: pStyle, children: "Each row in the list shows:" }),
          /* @__PURE__ */ jsxs("ul", { style: ulStyle, children: [
            /* @__PURE__ */ jsxs("li", { children: [
              /* @__PURE__ */ jsx("b", { style: { color: "#e5e7eb" }, children: "Repo name" }),
              " — extracted from the Git URL."
            ] }),
            /* @__PURE__ */ jsxs("li", { children: [
              /* @__PURE__ */ jsx("b", { style: { color: "#e5e7eb" }, children: "Branch" }),
              " — the branch that was deployed."
            ] }),
            /* @__PURE__ */ jsxs("li", { children: [
              /* @__PURE__ */ jsx("b", { style: { color: "#a78bfa" }, children: "Preview badge" }),
              " — shown on non-default-branch deployments."
            ] }),
            /* @__PURE__ */ jsxs("li", { children: [
              /* @__PURE__ */ jsx("b", { style: { color: "#e5e7eb" }, children: "Subdomain link" }),
              " — a live link to the deployed app on ",
              /* @__PURE__ */ jsx("code", { style: codeStyle, children: "*.cloudedbasement.ca" }),
              ", with an uptime dot."
            ] }),
            /* @__PURE__ */ jsxs("li", { children: [
              /* @__PURE__ */ jsx("b", { style: { color: "#e5e7eb" }, children: "Status badge" }),
              " — Deployed (green), Deploying (yellow), Failed (red), or Pending (yellow)."
            ] }),
            /* @__PURE__ */ jsxs("li", { children: [
              /* @__PURE__ */ jsx("b", { style: { color: "#e5e7eb" }, children: "Deploy date" }),
              "."
            ] })
          ] }),
          /* @__PURE__ */ jsx("h3", { style: h3Style, children: "Actions per deployment" }),
          /* @__PURE__ */ jsxs("ul", { style: ulStyle, children: [
            /* @__PURE__ */ jsxs("li", { children: [
              /* @__PURE__ */ jsx("b", { style: { color: "#e5e7eb" }, children: "Redeploy" }),
              " — re-runs the deployment pipeline for this repo using the latest commit."
            ] }),
            /* @__PURE__ */ jsxs("li", { children: [
              /* @__PURE__ */ jsx("b", { style: { color: "#fbbf24" }, children: "Rollback" }),
              " — reverts to the exact commit SHA of a previous successful deployment. Only available on past deployments that aren't the latest."
            ] }),
            /* @__PURE__ */ jsxs("li", { children: [
              /* @__PURE__ */ jsx("b", { style: { color: "#f87171" }, children: "Delete" }),
              " — removes the deployment from your server and frees up a site slot. A confirmation step prevents accidental deletion."
            ] })
          ] }),
          /* @__PURE__ */ jsx("h3", { style: h3Style, children: "Build log" }),
          /* @__PURE__ */ jsxs("p", { style: pStyle, children: [
            "Every deployment has a collapsible ",
            /* @__PURE__ */ jsx("b", { children: "Build log" }),
            " showing the raw output from the deployment pipeline. While a deploy is in progress the log streams live and auto-scrolls. Click the log toggle to expand or collapse it."
          ] }),
          /* @__PURE__ */ jsx("h3", { style: h3Style, children: "AI Diagnosis" }),
          /* @__PURE__ */ jsxs("p", { style: pStyle, children: [
            "When a deployment fails, an ",
            /* @__PURE__ */ jsx(Badge, { color: "#fca5a5", bg: "rgba(239,68,68,0.08)", children: "AI Diagnosis" }),
            " section appears beneath the status badge. Click it to expand a plain-English explanation of what went wrong and how to fix it, generated automatically from your build log."
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Section, { id: "domains", title: "Domains", children: [
          /* @__PURE__ */ jsx("p", { style: pStyle, children: "The Domains section lets you connect custom domains to your server. Once added, your domain will point to your server's IP and SSL will be provisioned automatically." }),
          /* @__PURE__ */ jsx("h3", { style: h3Style, children: "Adding a domain" }),
          /* @__PURE__ */ jsxs("p", { style: pStyle, children: [
            "Type your domain (e.g. ",
            /* @__PURE__ */ jsx("code", { style: codeStyle, children: "yourdomain.com" }),
            ") into the input and click ",
            /* @__PURE__ */ jsx("b", { children: "Add Domain" }),
            ". Before adding, point your domain's DNS A record to your server's IPv4 address shown on the Overview. DNS propagation can take a few minutes."
          ] }),
          /* @__PURE__ */ jsx("h3", { style: h3Style, children: "SSL status" }),
          /* @__PURE__ */ jsxs("p", { style: pStyle, children: [
            "Each domain shows a lock icon and an ",
            /* @__PURE__ */ jsx("b", { style: { color: "#4ade80" }, children: "SSL active" }),
            " label once a certificate has been issued, or a warning icon and ",
            /* @__PURE__ */ jsx("b", { style: { color: "#facc15" }, children: "Waiting for SSL" }),
            " if it's still pending. SSL is provisioned via Let's Encrypt and renews automatically."
          ] }),
          /* @__PURE__ */ jsxs("p", { style: pStyle, children: [
            'If SSL is stuck on "Waiting", use the ',
            /* @__PURE__ */ jsx("b", { children: "Enable SSL" }),
            " button to manually retry. Make sure your DNS A record is correctly pointed at your server IP first — SSL provisioning will fail if it can't reach your domain."
          ] }),
          /* @__PURE__ */ jsx("h3", { style: h3Style, children: "Removing a domain" }),
          /* @__PURE__ */ jsxs("p", { style: pStyle, children: [
            "Click ",
            /* @__PURE__ */ jsx("b", { style: { color: "#f87171" }, children: "Remove" }),
            " next to a domain to delete it from your account. The domain will no longer be served by your server."
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Section, { id: "env-vars", title: "Environment Variables", children: [
          /* @__PURE__ */ jsxs("p", { style: pStyle, children: [
            "Environment variables are key-value pairs that get injected into your server's ",
            /* @__PURE__ */ jsx("code", { style: codeStyle, children: ".env" }),
            " file on every deployment. Use them to store secrets like API keys, database connection strings, and third-party tokens — never hardcode these in your repo."
          ] }),
          /* @__PURE__ */ jsx("h3", { style: h3Style, children: "Adding a variable" }),
          /* @__PURE__ */ jsxs("p", { style: pStyle, children: [
            "Enter a key (e.g. ",
            /* @__PURE__ */ jsx("code", { style: codeStyle, children: "DATABASE_URL" }),
            ") and a value, then click ",
            /* @__PURE__ */ jsx("b", { children: "Save Variable" }),
            ". Keys are automatically uppercased and must start with a letter or underscore, containing only letters, numbers, and underscores. If a key already exists its value will be updated."
          ] }),
          /* @__PURE__ */ jsxs(WarnBox, { children: [
            "Changes to environment variables take effect on the ",
            /* @__PURE__ */ jsx("b", { children: "next deployment" }),
            ". Redeploy your app after saving a new or updated variable for it to be picked up."
          ] }),
          /* @__PURE__ */ jsx("h3", { style: h3Style, children: "Viewing values" }),
          /* @__PURE__ */ jsxs("p", { style: pStyle, children: [
            "Values are masked by default (shown as ••••••••). Click ",
            /* @__PURE__ */ jsx("b", { children: "Show" }),
            " next to a variable to reveal it in-place."
          ] }),
          /* @__PURE__ */ jsx("h3", { style: h3Style, children: "Removing a variable" }),
          /* @__PURE__ */ jsxs("p", { style: pStyle, children: [
            "Click ",
            /* @__PURE__ */ jsx("b", { style: { color: "#f87171" }, children: "Remove" }),
            " to permanently delete a variable. Redeploy your app afterward — the variable will no longer be present in the next deploy's environment."
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Section, { id: "dev-tools", title: "Dev Tools", children: [
          /* @__PURE__ */ jsx("p", { style: pStyle, children: "Dev Tools gives you direct access to your server's infrastructure credentials — SSH, PostgreSQL, and MongoDB. All credentials are hidden by default and must be explicitly revealed." }),
          /* @__PURE__ */ jsx("h3", { style: h3Style, children: "Revealing credentials" }),
          /* @__PURE__ */ jsxs("p", { style: pStyle, children: [
            "Click ",
            /* @__PURE__ */ jsx("b", { children: "Reveal Credentials" }),
            " to securely fetch your credentials from the server. They are never stored in the browser — refreshing the page hides them again."
          ] }),
          /* @__PURE__ */ jsx("h3", { style: h3Style, children: "SSH access" }),
          /* @__PURE__ */ jsxs("p", { style: pStyle, children: [
            "Connects you directly to your Linux VPS. The card shows your SSH username, server IP, and password (revealed on demand). A ready-to-use ",
            /* @__PURE__ */ jsx("code", { style: codeStyle, children: "ssh user@ip" }),
            " command is displayed with a one-click copy button. Use this for manual debugging, file inspection, or running commands directly on the server."
          ] }),
          /* @__PURE__ */ jsx("h3", { style: h3Style, children: "PostgreSQL" }),
          /* @__PURE__ */ jsxs("p", { style: pStyle, children: [
            "Shows your managed PostgreSQL credentials — host, port (",
            /* @__PURE__ */ jsx("code", { style: codeStyle, children: "5432" }),
            "), database name, username, password, and a full connection string. Only visible if PostgreSQL is installed on your server. Copy the connection string directly into your app's ",
            /* @__PURE__ */ jsx("code", { style: codeStyle, children: "DATABASE_URL" }),
            " environment variable."
          ] }),
          /* @__PURE__ */ jsx("h3", { style: h3Style, children: "MongoDB" }),
          /* @__PURE__ */ jsxs("p", { style: pStyle, children: [
            "Shows your managed MongoDB credentials — host, port (",
            /* @__PURE__ */ jsx("code", { style: codeStyle, children: "27017" }),
            "), database name, username, password, and connection string. Only visible if MongoDB is installed on your server."
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Section, { id: "api-keys", title: "API Keys", children: [
          /* @__PURE__ */ jsx("p", { style: pStyle, children: "API keys let you trigger deployments programmatically from CI/CD pipelines, scripts, or automation tools — without needing to log in." }),
          /* @__PURE__ */ jsx("h3", { style: h3Style, children: "Creating a key" }),
          /* @__PURE__ */ jsxs("p", { style: pStyle, children: [
            "Click ",
            /* @__PURE__ */ jsx("b", { children: "+ New key" }),
            ", give it a descriptive name (e.g. ",
            /* @__PURE__ */ jsx("code", { style: codeStyle, children: "CI/CD pipeline" }),
            "), and select one or more scopes:"
          ] }),
          /* @__PURE__ */ jsxs("ul", { style: ulStyle, children: [
            /* @__PURE__ */ jsxs("li", { children: [
              /* @__PURE__ */ jsx(Badge, { color: "#7fd6ff", bg: "rgba(45,167,223,0.12)", children: "deploy" }),
              " — allows triggering deployments via the API."
            ] }),
            /* @__PURE__ */ jsxs("li", { children: [
              /* @__PURE__ */ jsx(Badge, { color: "#86efac", bg: "rgba(34,197,94,0.10)", children: "read" }),
              " — allows reading deployment status and server info."
            ] })
          ] }),
          /* @__PURE__ */ jsxs(WarnBox, { children: [
            "Copy your key immediately after creation — it is shown ",
            /* @__PURE__ */ jsx("b", { children: "only once" }),
            " and cannot be recovered. If you lose it, revoke the old key and create a new one."
          ] }),
          /* @__PURE__ */ jsx("h3", { style: h3Style, children: "Using a key" }),
          /* @__PURE__ */ jsxs("p", { style: pStyle, children: [
            "Send requests with an ",
            /* @__PURE__ */ jsx("code", { style: codeStyle, children: "Authorization: Bearer cbk_<your_key>" }),
            " header. Example — trigger a deployment:"
          ] }),
          /* @__PURE__ */ jsx("pre", { style: {
            margin: "0 0 1rem",
            padding: "0.875rem 1rem",
            background: "#0a0a0a",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "0.5rem",
            fontSize: "0.75rem",
            color: "#9ca3af",
            fontFamily: "JetBrains Mono, monospace",
            whiteSpace: "pre-wrap",
            lineHeight: 1.6,
            overflowX: "auto"
          }, children: `curl -X POST https://cloudedbasement.ca/api/deploy \\
  -H "Authorization: Bearer cbk_<your_key>" \\
  -H "Content-Type: application/json" \\
  -d '{"git_url":"https://github.com/you/your-repo"}'` }),
          /* @__PURE__ */ jsx("h3", { style: h3Style, children: "Managing keys" }),
          /* @__PURE__ */ jsxs("p", { style: pStyle, children: [
            "Each key in the list shows its name, a prefix of the key value, its scopes, creation date, and last-used date. To permanently disable a key, click ",
            /* @__PURE__ */ jsx("b", { style: { color: "#f87171" }, children: "Revoke" }),
            ". Revoked keys stop working immediately and cannot be un-revoked."
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Section, { id: "settings", title: "Settings", children: [
          /* @__PURE__ */ jsx("p", { style: pStyle, children: "The Settings section covers plan management, password changes, and support." }),
          /* @__PURE__ */ jsx("h3", { style: h3Style, children: "Plan" }),
          /* @__PURE__ */ jsxs("p", { style: pStyle, children: [
            "Displays your current plan and site usage, with cards for Basic ($15/mo), Pro ($35/mo), and Premium ($65/mo). Click ",
            /* @__PURE__ */ jsx("b", { children: "Upgrade" }),
            " or ",
            /* @__PURE__ */ jsx("b", { children: "Downgrade" }),
            " to switch plans instantly. Changes are prorated — you're only charged or credited the difference for the remaining billing period."
          ] }),
          /* @__PURE__ */ jsx("p", { style: pStyle, children: "Plan specs at a glance:" }),
          /* @__PURE__ */ jsxs("ul", { style: ulStyle, children: [
            /* @__PURE__ */ jsxs("li", { children: [
              /* @__PURE__ */ jsx("b", { style: { color: "#e5e7eb" }, children: "Basic" }),
              " — 1 vCPU · 1 GB RAM · 25 GB storage · 2 sites"
            ] }),
            /* @__PURE__ */ jsxs("li", { children: [
              /* @__PURE__ */ jsx("b", { style: { color: "#e5e7eb" }, children: "Pro" }),
              " — 2 vCPU · 2 GB RAM · 60 GB storage · 5 sites"
            ] }),
            /* @__PURE__ */ jsxs("li", { children: [
              /* @__PURE__ */ jsx("b", { style: { color: "#e5e7eb" }, children: "Premium" }),
              " — 2 vCPU · 4 GB RAM · 80 GB storage · 10 sites"
            ] })
          ] }),
          /* @__PURE__ */ jsx(InfoBox, { children: "You can't downgrade to a plan whose site limit is lower than your current site count. Delete unused deployments first." }),
          /* @__PURE__ */ jsx("h3", { style: h3Style, children: "Change Password" }),
          /* @__PURE__ */ jsx("p", { style: pStyle, children: "Enter your current password and a new password (minimum 8 characters) to update your login credentials. This does not affect your session — you stay logged in after changing your password." }),
          /* @__PURE__ */ jsx("h3", { style: h3Style, children: "Submit Support Ticket" }),
          /* @__PURE__ */ jsx("p", { style: pStyle, children: "Fill in a subject, a description of your issue, and a priority (Normal, High, or Urgent). Our team will respond by email. For fastest response, include any error messages and the steps to reproduce the problem." })
        ] }),
        /* @__PURE__ */ jsx(Section, { id: "faq", title: "FAQ & Support", children: [
          {
            q: "How do I deploy my first app?",
            a: "Go to the Deployments section, paste a public GitHub/GitLab/Bitbucket URL, and click Deploy. Your app is live within seconds on a *.cloudedbasement.ca subdomain."
          },
          {
            q: "My deployment failed — what do I do?",
            a: "Expand the Build log on the failed deployment row to see the raw output. If AI Diagnosis is available, read its suggestion first. Common causes are missing environment variables, an incorrect build command, or a dependency that requires a native library."
          },
          {
            q: "How do I use my own domain?",
            a: "First, point your domain's DNS A record to your server's IPv4 address (shown on the Overview). Then go to Domains, type your domain, and click Add Domain. SSL is provisioned automatically within a few minutes."
          },
          {
            q: "How do I pass secrets to my app?",
            a: "Add them as Environment Variables in the dashboard. They are injected into your server's .env file on every deploy. Never commit secrets to your Git repo."
          },
          {
            q: "My server metrics show high CPU/memory — what should I do?",
            a: "Check the Build log for a runaway deploy process. If the issue persists, try restarting the server from the Overview page. If resources are consistently under pressure, consider upgrading your plan in Settings."
          },
          {
            q: "Can I roll back a broken deployment?",
            a: "Yes. In the Deployments section, find a previous successful deployment in the list and click Rollback. This re-deploys the exact commit SHA from that deployment."
          },
          {
            q: "How do I connect to my database externally?",
            a: "Go to Dev Tools, click Reveal Credentials, and copy the connection string for PostgreSQL or MongoDB. Use it as your DATABASE_URL environment variable, or paste it into your local database client."
          },
          {
            q: "How is my server secured?",
            a: "All servers are protected with a UFW firewall, automatic OS security updates, and HTTPS by default. SSH access requires a password that is only visible through the Dev Tools panel."
          },
          {
            q: "How do I get support?",
            a: "Submit a ticket from the Settings section of your dashboard. For urgent issues, set the priority to Urgent — we respond to those first."
          }
        ].map(({ q, a }) => /* @__PURE__ */ jsxs("div", { style: { marginBottom: "1.25rem" }, children: [
          /* @__PURE__ */ jsx("h3", { style: { ...h3Style, marginBottom: "0.25rem" }, children: q }),
          /* @__PURE__ */ jsx("p", { style: { ...pStyle, marginBottom: 0 }, children: a })
        ] }, q)) })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Footer, {})
  ] }) }) });
}
export {
  Docs as default
};
