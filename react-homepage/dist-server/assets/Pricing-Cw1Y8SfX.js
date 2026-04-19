import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { P as PageLayout } from "./PageLayout-DGkWIC32.js";
import { S as SectionTitle } from "../entry-server.js";
import "react-dom/server";
import "react-router-dom";
import "lucide-react";
const PLANS = [
  {
    id: "basic",
    name: "Basic",
    tagline: "Side projects & learning",
    monthly: 15,
    yearly: 162,
    specs: [
      { label: "RAM", value: "1 GB" },
      { label: "CPU", value: "1 vCPU" },
      { label: "Storage", value: "25 GB SSD" },
      { label: "Bandwidth", value: "1 TB/mo" },
      { label: "Sites", value: "2" },
      { label: "Support", value: "Email" }
    ],
    highlight: false
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Production apps & freelancers",
    monthly: 35,
    yearly: 378,
    specs: [
      { label: "RAM", value: "2 GB" },
      { label: "CPU", value: "2 vCPUs" },
      { label: "Storage", value: "60 GB SSD" },
      { label: "Bandwidth", value: "3 TB/mo" },
      { label: "Sites", value: "5" },
      { label: "Support", value: "Priority (12hr)", accent: true },
      { label: "Backups", value: "Weekly", accent: true }
    ],
    highlight: true,
    badge: "BEST VALUE"
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Agencies & high-traffic",
    monthly: 65,
    yearly: 702,
    specs: [
      { label: "RAM", value: "4 GB" },
      { label: "CPU", value: "2 vCPUs" },
      { label: "Storage", value: "80 GB SSD" },
      { label: "Bandwidth", value: "4 TB/mo" },
      { label: "Sites", value: "10" },
      { label: "Support", value: "Direct access", purple: true },
      { label: "Backups", value: "Daily", purple: true }
    ],
    highlight: false
  }
];
const FULL_FEATURES = [
  { label: "SSH & Root Access", basic: true, pro: true, premium: true },
  { label: "Git Deployment", basic: true, pro: true, premium: true },
  { label: "GitHub Auto-Deploy", basic: true, pro: true, premium: true },
  { label: "One-Click Database", basic: true, pro: true, premium: true },
  { label: "Custom Domains", basic: true, pro: true, premium: true },
  { label: "Automatic SSL", basic: true, pro: true, premium: true },
  { label: "Free Subdomain", basic: true, pro: true, premium: true },
  { label: "Environment Variables", basic: true, pro: true, premium: true },
  { label: "Managed Security Updates", basic: true, pro: true, premium: true },
  { label: "Weekly Backups", basic: false, pro: true, premium: true },
  { label: "Daily Backups", basic: false, pro: false, premium: true },
  { label: "Priority Support", basic: false, pro: true, premium: true },
  { label: "Direct Developer Access", basic: false, pro: false, premium: true }
];
const STACK = [
  { icon: "🐧", name: "Ubuntu 22.04", sub: "LTS" },
  { icon: "🟢", name: "Node.js 20", sub: "+ nvm" },
  { icon: "🌐", name: "Nginx", sub: "Web server" },
  { icon: "🔒", name: "Certbot", sub: "Free SSL" },
  { icon: "🐍", name: "Python 3", sub: "+ pip" },
  { icon: "🦀", name: "Rust", sub: "cargo" },
  { icon: "🐹", name: "Go 1.21", sub: "golang" },
  { icon: "🔥", name: "UFW Firewall", sub: "Configured" }
];
function PricingCell({ id, name, tagline, monthly, yearly, specs, highlight, badge, interval }) {
  const price = interval === "yearly" ? (yearly / 12).toFixed(2) : monthly;
  const subline = interval === "yearly" ? /* @__PURE__ */ jsxs("span", { style: { color: "#86efac" }, children: [
    "Billed $",
    yearly,
    "/yr · 2 months free"
  ] }) : "3-day free trial";
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "py-12 px-8 flex flex-col relative",
      style: { background: highlight ? "rgba(37,99,235,0.04)" : "transparent" },
      children: [
        badge && /* @__PURE__ */ jsx("span", { className: "funnel-badge", children: badge }),
        /* @__PURE__ */ jsx("h3", { className: "funnel-heading-3 mb-1", children: name }),
        /* @__PURE__ */ jsx("p", { className: "funnel-body-sm mb-5", style: { color: "#6b7280" }, children: tagline }),
        /* @__PURE__ */ jsxs("p", { className: "mb-1", children: [
          /* @__PURE__ */ jsxs("span", { style: { fontSize: "2.5rem", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1, color: "#fff" }, children: [
            "$",
            price
          ] }),
          /* @__PURE__ */ jsx("span", { className: "funnel-body-sm ml-1", style: { color: "#6b7280" }, children: "/mo" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs mb-6", style: { color: "#4b5563", minHeight: "1.25rem" }, children: subline }),
        /* @__PURE__ */ jsx("ul", { className: "flex flex-col gap-3 mb-8 flex-1", children: specs.map(({ label, value, accent, purple }) => /* @__PURE__ */ jsxs("li", { className: "funnel-body-sm flex justify-between gap-4", children: [
          /* @__PURE__ */ jsx("span", { style: { color: "#6b7280" }, children: label }),
          /* @__PURE__ */ jsx("span", { style: {
            color: purple ? "#c084fc" : accent ? "#93c5fd" : "#fff",
            textAlign: "right"
          }, children: value })
        ] }, label)) }),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: `/checkout?plan=${id}&interval=${interval}`,
            className: `funnel-btn ${highlight ? "funnel-btn-primary" : "funnel-btn-subtle"} w-full`,
            style: { justifyContent: "center" },
            children: "Get Started"
          }
        )
      ]
    }
  );
}
function CheckCell({ value }) {
  if (value === true) return /* @__PURE__ */ jsx("span", { style: { color: "#4ade80" }, children: "✓" });
  if (value === false) return /* @__PURE__ */ jsx("span", { style: { color: "#374151" }, children: "—" });
  return /* @__PURE__ */ jsx("span", { style: { color: "#9ca3af" }, children: value });
}
function Pricing() {
  const [interval, setInterval] = useState("monthly");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [trialStatus, setTrialStatus] = useState({ isLoggedIn: false, trialUsed: false, loaded: false });
  useEffect(() => {
    fetch("/api/pricing/status", { credentials: "include" }).then((r) => {
      if (!r.ok) throw new Error();
      return r.json();
    }).then((data) => setTrialStatus({ ...data, loaded: true })).catch(() => setTrialStatus({ isLoggedIn: false, trialUsed: false, loaded: true }));
  }, []);
  const showTrialBanner = trialStatus.loaded && !trialStatus.trialUsed;
  const trialHref = trialStatus.isLoggedIn ? "/dashboard" : "/register";
  return /* @__PURE__ */ jsxs(PageLayout, { children: [
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsxs("div", { className: "cb-title-row", children: [
        showTrialBanner && /* @__PURE__ */ jsxs("div", { style: {
          padding: "0.875rem 1.25rem",
          marginBottom: "2rem",
          border: "1px solid rgba(59,130,246,0.25)",
          borderRadius: "0.5rem",
          background: "rgba(37,99,235,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem"
        }, children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "funnel-heading-3", style: { marginBottom: "0.25rem" }, children: "Try free for 3 days" }),
            /* @__PURE__ */ jsx("p", { className: "funnel-body-sm", children: "No credit card required. Get a real server instantly." })
          ] }),
          /* @__PURE__ */ jsx("a", { href: trialHref, className: "funnel-btn funnel-btn-primary", style: { padding: "0.5rem 1.25rem" }, children: "Start Free Trial" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "funnel-kicker mb-4", children: "Pricing" }),
        /* @__PURE__ */ jsx("h1", { className: "funnel-heading-1 mb-4", children: "Simple, transparent pricing" }),
        /* @__PURE__ */ jsx("p", { className: "funnel-body mb-2", children: "One server, deploy as many times as you want." }),
        /* @__PURE__ */ jsx("p", { className: "funnel-body-sm mb-8", style: { color: "#60a5fa" }, children: "I update, patch security, and back up your server for you — so you can focus on shipping." }),
        /* @__PURE__ */ jsx("div", { className: "flex justify-center mt-2", children: /* @__PURE__ */ jsx("div", { className: "inline-flex items-center rounded-lg overflow-hidden border-dim", style: { background: "rgba(255,255,255,0.02)" }, children: ["monthly", "yearly"].map((opt) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setInterval(opt),
            className: "py-2 px-5 flex items-center gap-2",
            style: {
              fontSize: "0.8125rem",
              fontWeight: 500,
              background: interval === opt ? "rgba(255,255,255,0.07)" : "transparent",
              color: interval === opt ? "#fff" : "#6b7280",
              border: "none",
              cursor: "pointer",
              transition: "background 150ms ease, color 150ms ease"
            },
            "aria-pressed": interval === opt,
            children: opt === "monthly" ? "Monthly" : /* @__PURE__ */ jsxs(Fragment, { children: [
              "Yearly",
              /* @__PURE__ */ jsx("span", { style: {
                fontSize: "0.625rem",
                fontWeight: 700,
                letterSpacing: "0.05em",
                padding: "0.15rem 0.4rem",
                borderRadius: "0.2rem",
                color: "#4ade80",
                background: "rgba(74,222,128,0.12)"
              }, children: "SAVE 10%" })
            ] })
          },
          opt
        )) }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "cb-grid-cells cb-grid-cells--pricing", children: PLANS.map((plan) => /* @__PURE__ */ jsx(PricingCell, { ...plan, interval }, plan.id)) }),
      /* @__PURE__ */ jsx("div", { className: "border-t-dim py-4 px-10 text-center", children: /* @__PURE__ */ jsxs("p", { className: "funnel-body-sm", style: { color: "#4b5563" }, children: [
        "No contracts. Keep full server control.",
        " ",
        /* @__PURE__ */ jsx("a", { href: "/is-this-safe", style: { color: "#60a5fa", textDecoration: "underline" }, children: "Is Clouded Basement safe?" }),
        " · ",
        /* @__PURE__ */ jsx("a", { href: "/compare", style: { color: "#60a5fa", textDecoration: "underline" }, children: "Compare plans" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("div", { className: "cb-title-row", children: /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setDetailsOpen((o) => !o),
          style: {
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            color: detailsOpen ? "#fff" : "#6b7280",
            transition: "color 150ms"
          },
          "aria-expanded": detailsOpen,
          children: [
            /* @__PURE__ */ jsx("span", { className: "funnel-heading-3", children: "Full feature comparison" }),
            /* @__PURE__ */ jsx(
              "svg",
              {
                style: {
                  width: "1rem",
                  height: "1rem",
                  flexShrink: 0,
                  transform: detailsOpen ? "rotate(180deg)" : "none",
                  transition: "transform 200ms ease"
                },
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24",
                children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" })
              }
            )
          ]
        }
      ) }),
      detailsOpen && /* @__PURE__ */ jsx("div", { className: "cb-content-pad", style: { paddingBlock: "1.5rem", overflowX: "auto" }, children: /* @__PURE__ */ jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { style: { borderBottom: "1px solid rgba(255,255,255,0.07)" }, children: [
          /* @__PURE__ */ jsx("th", { style: { textAlign: "left", padding: "0.75rem 1rem", color: "#6b7280", fontWeight: 500 }, children: "Feature" }),
          /* @__PURE__ */ jsx("th", { style: { textAlign: "center", padding: "0.75rem 1rem", color: "#d1d5db" }, children: "Basic" }),
          /* @__PURE__ */ jsx("th", { style: { textAlign: "center", padding: "0.75rem 1rem", color: "#93c5fd" }, children: "Pro" }),
          /* @__PURE__ */ jsx("th", { style: { textAlign: "center", padding: "0.75rem 1rem", color: "#c084fc" }, children: "Premium" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: FULL_FEATURES.map((f) => /* @__PURE__ */ jsxs("tr", { style: { borderBottom: "1px solid rgba(255,255,255,0.04)" }, children: [
          /* @__PURE__ */ jsx("td", { style: { padding: "0.625rem 1rem", color: "#9ca3af" }, children: f.label }),
          /* @__PURE__ */ jsx("td", { style: { textAlign: "center", padding: "0.625rem 1rem" }, children: /* @__PURE__ */ jsx(CheckCell, { value: f.basic }) }),
          /* @__PURE__ */ jsx("td", { style: { textAlign: "center", padding: "0.625rem 1rem" }, children: /* @__PURE__ */ jsx(CheckCell, { value: f.pro }) }),
          /* @__PURE__ */ jsx("td", { style: { textAlign: "center", padding: "0.625rem 1rem" }, children: /* @__PURE__ */ jsx(CheckCell, { value: f.premium }) })
        ] }, f.label)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("div", { className: "cb-title-row", children: /* @__PURE__ */ jsx(
        SectionTitle,
        {
          text1: "Stack",
          text2: "What's pre-installed",
          text3: "Every server ships with a full developer stack, configured and ready to use."
        }
      ) }),
      /* @__PURE__ */ jsx("div", { className: "cb-grid-cells cb-grid-cells--features", children: STACK.map(({ icon, name, sub }) => /* @__PURE__ */ jsxs("div", { style: { padding: "2rem 1.5rem", textAlign: "center" }, children: [
        /* @__PURE__ */ jsx("div", { style: { fontSize: "1.75rem", marginBottom: "0.625rem" }, children: icon }),
        /* @__PURE__ */ jsx("p", { className: "funnel-heading-3", style: { fontSize: "0.875rem", marginBottom: "0.25rem" }, children: name }),
        /* @__PURE__ */ jsx("p", { className: "funnel-body-sm", style: { color: "#6b7280" }, children: sub })
      ] }, name)) })
    ] })
  ] });
}
export {
  Pricing as default
};
