import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { P as PageLayout } from "./PageLayout-DGkWIC32.js";
import "../entry-server.js";
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
      { label: "Support", value: "Priority (12hr)", valueClass: "text-blue-400" },
      { label: "Backups", value: "Weekly", valueClass: "text-blue-400" }
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
      { label: "Support", value: "Direct access", valueClass: "text-purple-400" },
      { label: "Backups", value: "Daily", valueClass: "text-purple-400" }
    ],
    highlight: false
  }
];
const FULL_FEATURES = [
  { label: "SSH & Root Access", basic: "✓", pro: "✓", premium: "✓" },
  { label: "Git Deployment", basic: "✓", pro: "✓", premium: "✓" },
  { label: "GitHub Auto-Deploy", basic: "✓", pro: "✓", premium: "✓" },
  { label: "One-Click Database", basic: "✓", pro: "✓", premium: "✓" },
  { label: "Custom Domains", basic: "✓", pro: "✓", premium: "✓" },
  { label: "Automatic SSL", basic: "✓", pro: "✓", premium: "✓" },
  { label: "Free Subdomain", basic: "✓", pro: "✓", premium: "✓" },
  { label: "Environment Variables", basic: "✓", pro: "✓", premium: "✓" },
  { label: "Managed Security Updates", basic: "✓", pro: "✓", premium: "✓" },
  { label: "Weekly Backups", basic: "—", pro: "✓", premium: "✓" },
  { label: "Daily Backups", basic: "—", pro: "—", premium: "✓" },
  { label: "Priority Support", basic: "—", pro: "✓", premium: "✓" },
  { label: "Direct Developer Access", basic: "—", pro: "—", premium: "✓" }
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
function Pricing() {
  const [yearly, setYearly] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [trialStatus, setTrialStatus] = useState({ isLoggedIn: false, trialUsed: false, loaded: false });
  useEffect(() => {
    fetch("/api/pricing/status", { credentials: "include" }).then((r) => {
      if (!r.ok) throw new Error("Failed to fetch trial status");
      return r.json();
    }).then((data) => setTrialStatus({ ...data, loaded: true })).catch(() => setTrialStatus({ isLoggedIn: false, trialUsed: false, loaded: true }));
  }, []);
  const showTrialBanner = trialStatus.loaded && !trialStatus.trialUsed;
  const trialHref = trialStatus.isLoggedIn ? "/dashboard" : "/register";
  return /* @__PURE__ */ jsxs(PageLayout, { children: [
    /* @__PURE__ */ jsx("section", { className: "funnel-section funnel-bg-trust", children: /* @__PURE__ */ jsxs("div", { className: "funnel-wide", children: [
      showTrialBanner && /* @__PURE__ */ jsxs("div", { className: "bg-linear-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/40 rounded-xl p-6 text-center mb-12", children: [
        /* @__PURE__ */ jsx("span", { className: "funnel-heading-3 block mb-2", children: "Try Free for 3 Days" }),
        /* @__PURE__ */ jsx("p", { className: "funnel-body-sm mb-4", children: "No credit card required. Get a real server instantly." }),
        /* @__PURE__ */ jsxs("a", { href: trialHref, className: "funnel-btn funnel-btn-primary", children: [
          "Start Free Trial",
          /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z", clipRule: "evenodd" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-12", children: [
        /* @__PURE__ */ jsx("h1", { className: "funnel-heading-1 mb-4", children: "Simple, Transparent Pricing" }),
        /* @__PURE__ */ jsx("p", { className: "funnel-body mb-4", children: "One server, deploy as many times as you want." }),
        /* @__PURE__ */ jsx("p", { className: "funnel-kicker mb-8", style: { color: "#60a5fa" }, children: "I update, add security, and backup your server for you — you can focus on shipping your apps." }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4", children: [
          /* @__PURE__ */ jsx("span", { className: `funnel-body-sm transition-colors ${!yearly ? "text-white" : ""}`, children: "Monthly" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setYearly((y) => !y),
              className: "relative w-16 h-8 bg-gray-700 rounded-full hover:bg-gray-600",
              role: "switch",
              "aria-checked": yearly,
              "aria-label": `Billing period: ${yearly ? "yearly" : "monthly"}`,
              children: /* @__PURE__ */ jsx(
                "div",
                {
                  className: `absolute top-1 w-6 h-6 bg-blue-400 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(96,165,250,0.6)] ${yearly ? "left-8" : "left-1"}`
                }
              )
            }
          ),
          /* @__PURE__ */ jsxs("span", { className: `funnel-body-sm transition-colors ${yearly ? "text-white" : ""}`, children: [
            "Yearly ",
            /* @__PURE__ */ jsx("span", { className: "text-blue-400 font-bold", children: "(Save 10%)" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6", children: PLANS.map((plan) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: `flex flex-col rounded-xl p-6 relative ${plan.highlight ? "funnel-card-featured" : "funnel-card"}`,
          children: [
            plan.badge && /* @__PURE__ */ jsx("div", { className: "funnel-badge", children: plan.badge }),
            /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
              /* @__PURE__ */ jsx("div", { className: "funnel-heading-3 mb-1", children: plan.name }),
              /* @__PURE__ */ jsx("div", { className: "funnel-body-sm", children: plan.tagline })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
              /* @__PURE__ */ jsx("span", { className: "text-4xl font-bold text-white", children: yearly ? `$${(plan.yearly / 12).toFixed(2)}` : `$${plan.monthly}` }),
              /* @__PURE__ */ jsx("span", { className: "funnel-body-sm", children: yearly ? `/mo (billed yearly)` : "/mo" }),
              yearly && /* @__PURE__ */ jsxs("span", { className: "funnel-body-sm block mt-1 text-gray-400", children: [
                "Yearly total: ",
                /* @__PURE__ */ jsxs("span", { className: "font-bold text-white", children: [
                  "$",
                  plan.yearly
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "space-y-3 funnel-body-sm mb-6 flex-1", children: plan.specs.map(({ label, value, valueClass }) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: label }),
              /* @__PURE__ */ jsx("span", { className: valueClass || "text-white", children: value })
            ] }, label)) }),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: `/pay?plan=${plan.id}&interval=${yearly ? "yearly" : "monthly"}`,
                className: plan.highlight ? "funnel-btn funnel-btn-primary w-full justify-center" : "funnel-btn funnel-btn-subtle w-full justify-center",
                children: "Get Started"
              }
            )
          ]
        },
        plan.id
      )) })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "funnel-section", children: /* @__PURE__ */ jsxs("div", { className: "funnel-wide", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setDetailsOpen((o) => !o),
          className: "flex items-center justify-center gap-2 w-full text-gray-400 hover:text-white transition-colors py-4",
          "aria-expanded": detailsOpen,
          "aria-controls": "feature-comparison",
          children: [
            /* @__PURE__ */ jsx("span", { className: "funnel-body-sm font-medium", children: "View full feature comparison" }),
            /* @__PURE__ */ jsx(
              "svg",
              {
                className: `w-4 h-4 transition-transform ${detailsOpen ? "rotate-180" : ""}`,
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24",
                children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" })
              }
            )
          ]
        }
      ),
      detailsOpen && /* @__PURE__ */ jsxs(
        "div",
        {
          id: "feature-comparison",
          role: "region",
          "aria-labelledby": "feature-comparison-heading",
          className: "overflow-x-auto mt-6",
          children: [
            /* @__PURE__ */ jsx("h3", { id: "feature-comparison-heading", className: "sr-only", children: "Feature comparison" }),
            /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
              /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-700", children: [
                /* @__PURE__ */ jsx("th", { className: "text-left py-3 px-4 text-gray-400 font-medium", children: "Feature" }),
                /* @__PURE__ */ jsx("th", { className: "text-center py-3 px-4 text-gray-300", children: "Basic" }),
                /* @__PURE__ */ jsx("th", { className: "text-center py-3 px-4 text-blue-400", children: "Pro" }),
                /* @__PURE__ */ jsx("th", { className: "text-center py-3 px-4 text-purple-400", children: "Premium" })
              ] }) }),
              /* @__PURE__ */ jsx("tbody", { className: "text-gray-300", children: FULL_FEATURES.map((f) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-800", children: [
                /* @__PURE__ */ jsx("td", { className: "py-2 px-4", children: f.label }),
                /* @__PURE__ */ jsx("td", { className: `text-center ${f.basic === "✓" ? "text-green-400" : "text-gray-500"}`, children: f.basic }),
                /* @__PURE__ */ jsx("td", { className: `text-center ${f.pro === "✓" ? "text-green-400" : "text-gray-500"}`, children: f.pro }),
                /* @__PURE__ */ jsx("td", { className: `text-center ${f.premium === "✓" ? "text-green-400" : "text-gray-500"}`, children: f.premium })
              ] }, f.label)) })
            ] })
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "funnel-section funnel-bg-process", children: /* @__PURE__ */ jsxs("div", { className: "funnel-wide", children: [
      /* @__PURE__ */ jsx("h2", { className: "funnel-heading-2 text-center mb-8", children: "What's Pre-Installed" }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3 text-center", children: STACK.map(({ icon, name, sub }) => /* @__PURE__ */ jsxs("div", { className: "funnel-card p-4", children: [
        /* @__PURE__ */ jsx("div", { className: "text-2xl mb-2", children: icon }),
        /* @__PURE__ */ jsx("div", { className: "funnel-heading-3 text-sm", children: name }),
        /* @__PURE__ */ jsx("div", { className: "funnel-body-sm", children: sub })
      ] }, name)) })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "funnel-section", children: /* @__PURE__ */ jsxs("div", { className: "funnel-wide text-center", children: [
      /* @__PURE__ */ jsx("p", { className: "funnel-body mb-4", children: "Questions about security or how this works?" }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6", children: [
        /* @__PURE__ */ jsx("a", { href: "/is-this-safe", className: "funnel-body-sm", style: { color: "#60a5fa", textDecoration: "underline" }, children: "Is Clouded Basement safe?" }),
        /* @__PURE__ */ jsx("span", { className: "hidden sm:inline text-gray-600", children: "·" }),
        /* @__PURE__ */ jsx("a", { href: "/compare", className: "funnel-body-sm", style: { color: "#60a5fa", textDecoration: "underline" }, children: "See how we compare" })
      ] })
    ] }) })
  ] });
}
export {
  Pricing as default
};
