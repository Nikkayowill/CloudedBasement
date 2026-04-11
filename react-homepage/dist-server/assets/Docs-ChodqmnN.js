import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { R as ResponsiveNav, F as Footer } from "../entry-server.js";
import "react-dom/server";
import "react-router-dom";
import "react";
import "lucide-react";
const D = {
  bgBase: "#000000",
  bg: "#0a0a0a",
  bgElevated: "#111111",
  bgSurface: "#161616",
  border: "#262626",
  borderFaint: "#1c1c1c",
  text: "#fafafa",
  textSec: "#a1a1a1",
  textMuted: "#525252",
  accent: "#3b82f6",
  accentBg: "rgba(59,130,246,0.1)",
  success: "#22c55e",
  successBg: "rgba(34,197,94,0.1)",
  warning: "#eab308",
  warningBg: "rgba(234,179,8,0.1)",
  danger: "#ef4444",
  dangerBg: "rgba(239,68,68,0.08)"
};
function Shell({ url, children }) {
  return /* @__PURE__ */ jsxs("div", { style: {
    width: "100%",
    background: D.bgBase,
    border: `1px solid ${D.border}`,
    borderRadius: 12,
    overflow: "hidden",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: 12,
    lineHeight: "1.5",
    userSelect: "none",
    boxShadow: "0 8px 32px rgba(0,0,0,0.6)"
  }, children: [
    /* @__PURE__ */ jsxs("div", { style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "10px 14px",
      background: D.bgSurface,
      borderBottom: `1px solid ${D.border}`
    }, children: [
      /* @__PURE__ */ jsx("span", { style: { width: 11, height: 11, borderRadius: "50%", background: "#ef4444", flexShrink: 0 } }),
      /* @__PURE__ */ jsx("span", { style: { width: 11, height: 11, borderRadius: "50%", background: "#f59e0b", flexShrink: 0 } }),
      /* @__PURE__ */ jsx("span", { style: { width: 11, height: 11, borderRadius: "50%", background: "#22c55e", flexShrink: 0 } }),
      /* @__PURE__ */ jsx("div", { style: {
        flex: 1,
        margin: "0 8px",
        padding: "3px 10px",
        background: D.bg,
        border: `1px solid ${D.border}`,
        borderRadius: 6,
        color: D.textMuted,
        fontSize: 10,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        maxWidth: 280
      }, children: url })
    ] }),
    children
  ] });
}
const NAV = [
  { id: "overview", d: "M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-1a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1h-4a1 1 0 01-1-1v-5z" },
  { id: "sites", d: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" },
  { id: "deploy", d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" },
  { id: "dev-tools", d: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" },
  { id: "settings", d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" }
];
function Sidebar({ active }) {
  return /* @__PURE__ */ jsxs("aside", { style: {
    width: 44,
    flexShrink: 0,
    background: D.bgBase,
    borderRight: `1px solid ${D.border}`,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "10px 0",
    gap: 2
  }, children: [
    /* @__PURE__ */ jsx("div", { style: {
      width: 26,
      height: 26,
      borderRadius: "50%",
      background: D.accent,
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 700,
      fontSize: 11,
      marginBottom: 10
    }, children: "A" }),
    NAV.map((item) => {
      const isActive = item.id === active;
      return /* @__PURE__ */ jsx("div", { style: {
        width: 32,
        height: 32,
        borderRadius: 7,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: isActive ? D.accentBg : "transparent",
        color: isActive ? D.accent : D.textMuted
      }, children: /* @__PURE__ */ jsx(
        "svg",
        {
          width: "15",
          height: "15",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "1.6",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          viewBox: "0 0 24 24",
          children: /* @__PURE__ */ jsx("path", { d: item.d })
        }
      ) }, item.id);
    })
  ] });
}
function Card({ children, style }) {
  return /* @__PURE__ */ jsx("div", { style: {
    background: D.bgElevated,
    border: `1px solid ${D.border}`,
    borderRadius: 10,
    padding: "14px 16px",
    ...style
  }, children });
}
function CardHeader({ title, aside }) {
  return /* @__PURE__ */ jsxs("div", { style: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 10,
    borderBottom: `1px solid ${D.borderFaint}`
  }, children: [
    /* @__PURE__ */ jsx("span", { style: { color: D.text, fontWeight: 600, fontSize: 12 }, children: title }),
    aside
  ] });
}
function DataRow({ label, value, valueColor, last }) {
  return /* @__PURE__ */ jsxs("div", { style: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6px 0",
    borderBottom: last ? "none" : `1px solid ${D.borderFaint}`
  }, children: [
    /* @__PURE__ */ jsx("span", { style: { color: D.textMuted, fontSize: 11 }, children: label }),
    /* @__PURE__ */ jsx("span", { style: { color: valueColor || D.textSec, fontSize: 11, fontWeight: 500 }, children: value })
  ] });
}
function Btn({ children, variant = "secondary", style }) {
  const v = {
    primary: { background: D.accent, color: "#fff", border: "none", fontWeight: 600 },
    secondary: { background: D.bgSurface, color: D.textSec, border: `1px solid ${D.border}`, fontWeight: 500 },
    danger: { background: D.dangerBg, color: D.danger, border: `1px solid ${D.danger}30`, fontWeight: 500 }
  }[variant];
  return /* @__PURE__ */ jsx("span", { style: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "5px 11px",
    borderRadius: 6,
    fontSize: 11,
    whiteSpace: "nowrap",
    cursor: "pointer",
    flexShrink: 0,
    ...v,
    ...style
  }, children });
}
function Badge({ children, color = "success" }) {
  const colors = {
    success: { bg: D.successBg, text: D.success },
    warning: { bg: D.warningBg, text: D.warning },
    accent: { bg: D.accentBg, text: D.accent },
    danger: { bg: D.dangerBg, text: D.danger }
  }[color];
  return /* @__PURE__ */ jsx("span", { style: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 99,
    fontSize: 10,
    fontWeight: 600,
    background: colors.bg,
    color: colors.text
  }, children });
}
function InputRow({ placeholder, btnLabel, btnVariant = "primary", hint }) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, alignItems: "center" }, children: [
      /* @__PURE__ */ jsx("div", { style: {
        flex: 1,
        padding: "7px 10px",
        background: D.bg,
        border: `1px solid ${D.border}`,
        borderRadius: 7,
        color: D.textMuted,
        fontSize: 11,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        minWidth: 0
      }, children: placeholder }),
      /* @__PURE__ */ jsx(Btn, { variant: btnVariant, children: btnLabel })
    ] }),
    hint && /* @__PURE__ */ jsx("p", { style: { color: D.textMuted, fontSize: 10, margin: "6px 0 0", lineHeight: 1.5 }, children: hint })
  ] });
}
function DashboardMockup() {
  return /* @__PURE__ */ jsx(Shell, { url: "app.cloudedbasement.com/dashboard", children: /* @__PURE__ */ jsxs("div", { style: { display: "flex", background: D.bg }, children: [
    /* @__PURE__ */ jsx(Sidebar, { active: "overview" }),
    /* @__PURE__ */ jsx("main", { style: { flex: 1, minWidth: 0, padding: "14px 14px" }, children: /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(
        CardHeader,
        {
          title: "basement-core",
          aside: /* @__PURE__ */ jsxs("span", { style: { display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: D.success, fontWeight: 500 }, children: [
            /* @__PURE__ */ jsx("span", { style: {
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: D.success,
              boxShadow: `0 0 6px ${D.success}`,
              display: "inline-block",
              flexShrink: 0
            } }),
            "Online"
          ] })
        }
      ),
      /* @__PURE__ */ jsx(DataRow, { label: "IPv4", value: "143.198.167.42", valueColor: D.accent }),
      /* @__PURE__ */ jsx(DataRow, { label: "Plan", value: "PRO" }),
      /* @__PURE__ */ jsx(DataRow, { label: "Sites", value: "2 / 5", last: true }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, marginTop: 14 }, children: [
        /* @__PURE__ */ jsx(Btn, { variant: "secondary", children: "Restart" }),
        /* @__PURE__ */ jsx(Btn, { variant: "danger", children: "Cancel Plan" })
      ] })
    ] }) })
  ] }) });
}
function DeployMockup() {
  return /* @__PURE__ */ jsx(Shell, { url: "app.cloudedbasement.com/dashboard — Deploy", children: /* @__PURE__ */ jsxs("div", { style: { display: "flex", background: D.bg }, children: [
    /* @__PURE__ */ jsx(Sidebar, { active: "deploy" }),
    /* @__PURE__ */ jsx("main", { style: { flex: 1, minWidth: 0, padding: "14px 14px" }, children: /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { title: "Deploy from Git" }),
      /* @__PURE__ */ jsx(
        InputRow,
        {
          placeholder: "https://github.com/username/repo.git",
          btnLabel: "Deploy",
          hint: "Paste your GitHub repository URL to deploy automatically."
        }
      ),
      /* @__PURE__ */ jsxs("div", { style: { marginTop: 14, paddingTop: 14, borderTop: `1px solid ${D.borderFaint}` }, children: [
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }, children: [
          /* @__PURE__ */ jsx("span", { style: { color: D.text, fontWeight: 600, fontSize: 12 }, children: "Auto-Deploy" }),
          /* @__PURE__ */ jsx(Badge, { color: "success", children: "Enabled" })
        ] }),
        /* @__PURE__ */ jsxs("p", { style: { color: D.textMuted, fontSize: 10, margin: 0, lineHeight: 1.5 }, children: [
          "Push to ",
          /* @__PURE__ */ jsx("code", { style: { color: D.accent, fontFamily: "monospace" }, children: "main" }),
          " to trigger a deploy automatically."
        ] })
      ] })
    ] }) })
  ] }) });
}
const DEMO_DOMAINS = [
  { domain: "myapp.com", ssl: true },
  { domain: "api.myapp.com", ssl: true },
  { domain: "staging.myapp.com", ssl: false }
];
function DomainsMockup() {
  return /* @__PURE__ */ jsx(Shell, { url: "app.cloudedbasement.com/dashboard — Sites", children: /* @__PURE__ */ jsxs("div", { style: { display: "flex", background: D.bg }, children: [
    /* @__PURE__ */ jsx(Sidebar, { active: "sites" }),
    /* @__PURE__ */ jsx("main", { style: { flex: 1, minWidth: 0, padding: "14px 14px" }, children: /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { title: "Your Sites" }),
      /* @__PURE__ */ jsx("div", { style: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }, children: DEMO_DOMAINS.map((d) => /* @__PURE__ */ jsxs("div", { style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 10px",
        background: D.bg,
        border: `1px solid ${D.borderFaint}`,
        borderRadius: 7,
        gap: 8,
        minWidth: 0
      }, children: [
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }, children: [
          /* @__PURE__ */ jsx("span", { style: { fontSize: 12, flexShrink: 0 }, children: d.ssl ? "🔒" : "⚠️" }),
          /* @__PURE__ */ jsxs("div", { style: { minWidth: 0 }, children: [
            /* @__PURE__ */ jsx("div", { style: {
              color: D.text,
              fontWeight: 500,
              fontSize: 11,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }, children: d.domain }),
            /* @__PURE__ */ jsx("div", { style: { color: d.ssl ? D.success : D.warning, fontSize: 10 }, children: d.ssl ? "SSL active" : "Waiting for SSL" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 5, flexShrink: 0 }, children: [
          !d.ssl && /* @__PURE__ */ jsx(Btn, { variant: "secondary", children: "Enable SSL" }),
          /* @__PURE__ */ jsx(Btn, { variant: "danger", children: "Remove" })
        ] })
      ] }, d.domain)) }),
      /* @__PURE__ */ jsx("div", { style: { paddingTop: 12, borderTop: `1px solid ${D.borderFaint}` }, children: /* @__PURE__ */ jsx(
        InputRow,
        {
          placeholder: "yourdomain.com",
          btnLabel: "Add Domain",
          hint: /* @__PURE__ */ jsxs(Fragment, { children: [
            "Point your A record to ",
            /* @__PURE__ */ jsx("code", { style: { color: D.accent, fontFamily: "monospace" }, children: "143.198.167.42" }),
            " first."
          ] })
        }
      ) })
    ] }) })
  ] }) });
}
function BillingMockup() {
  return /* @__PURE__ */ jsx(Shell, { url: "cloudedbasement.com/pay?plan=pro", children: /* @__PURE__ */ jsxs("div", { style: { padding: "16px", maxWidth: 360, margin: "0 auto" }, children: [
    /* @__PURE__ */ jsxs("div", { style: { textAlign: "center", marginBottom: 14 }, children: [
      /* @__PURE__ */ jsx("div", { style: {
        display: "inline-block",
        padding: "3px 12px",
        background: D.accentBg,
        border: `1px solid ${D.accent}40`,
        borderRadius: 99,
        color: D.accent,
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        marginBottom: 8
      }, children: "Monthly Billing" }),
      /* @__PURE__ */ jsx("div", { style: { color: D.text, fontWeight: 700, fontSize: 20, lineHeight: 1 }, children: "Pro" }),
      /* @__PURE__ */ jsx("div", { style: { color: D.textMuted, fontSize: 11, marginTop: 3 }, children: "Best Value · For production apps" })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: {
      background: "rgba(0,0,0,0.3)",
      border: `1px solid ${D.border}`,
      borderRadius: 9,
      padding: "14px 16px",
      marginBottom: 14
    }, children: [
      /* @__PURE__ */ jsxs("div", { style: { textAlign: "center", marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${D.border}` }, children: [
        /* @__PURE__ */ jsxs("div", { style: { color: D.accent, fontWeight: 700, fontSize: 28, lineHeight: 1 }, children: [
          "$35",
          /* @__PURE__ */ jsx("span", { style: { color: D.textMuted, fontSize: 14, fontWeight: 400 }, children: "/month" })
        ] }),
        /* @__PURE__ */ jsx("div", { style: { color: D.textMuted, fontSize: 10, marginTop: 4 }, children: "Early Adopter price · was $60 · locked for life" })
      ] }),
      [
        "Billed monthly starting today",
        "Cancel anytime — no contracts",
        "Instant server activation after payment"
      ].map((item) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 7 }, children: [
        /* @__PURE__ */ jsx("span", { style: { color: D.accent, fontWeight: 700, fontSize: 13, lineHeight: 1, flexShrink: 0, marginTop: 1 }, children: "✓" }),
        /* @__PURE__ */ jsx("span", { style: { color: D.textSec, fontSize: 11, lineHeight: 1.4 }, children: item })
      ] }, item))
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }, children: [
      [
        { label: "Cardholder Name", value: "Alex Johnson", mono: false },
        { label: "Card Number", value: "4242  4242  4242  4242", mono: true }
      ].map((f) => /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { style: { color: D.textSec, fontSize: 11, fontWeight: 600, marginBottom: 5 }, children: f.label }),
        /* @__PURE__ */ jsx("div", { style: {
          padding: "10px 12px",
          background: "rgba(0,0,0,0.4)",
          border: `1px solid #404040`,
          borderRadius: 7,
          color: f.mono ? D.textSec : D.textSec,
          fontSize: 12,
          fontFamily: f.mono ? "monospace" : "inherit",
          letterSpacing: f.mono ? "0.1em" : "normal"
        }, children: f.value })
      ] }, f.label)),
      /* @__PURE__ */ jsx("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }, children: [
        { label: "Expiry Date", value: "12 / 27" },
        { label: "CVC", value: "···" }
      ].map((f) => /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { style: { color: D.textSec, fontSize: 11, fontWeight: 600, marginBottom: 5 }, children: f.label }),
        /* @__PURE__ */ jsx("div", { style: {
          padding: "10px 12px",
          background: "rgba(0,0,0,0.4)",
          border: `1px solid #404040`,
          borderRadius: 7,
          color: D.textSec,
          fontSize: 12,
          fontFamily: "monospace"
        }, children: f.value })
      ] }, f.label)) })
    ] }),
    /* @__PURE__ */ jsx("div", { style: {
      padding: "11px 0",
      background: D.accent,
      borderRadius: 7,
      color: "#fff",
      fontWeight: 700,
      fontSize: 13,
      textAlign: "center",
      marginBottom: 10
    }, children: "Complete Payment" }),
    /* @__PURE__ */ jsx("div", { style: { color: D.textMuted, fontSize: 10, textAlign: "center" }, children: "Powered by Stripe · Secure SSL encryption" })
  ] }) });
}
function SupportMockup() {
  return /* @__PURE__ */ jsx(Shell, { url: "app.cloudedbasement.com/dashboard — Settings", children: /* @__PURE__ */ jsxs("div", { style: { display: "flex", background: D.bg }, children: [
    /* @__PURE__ */ jsx(Sidebar, { active: "settings" }),
    /* @__PURE__ */ jsxs("main", { style: { flex: 1, minWidth: 0, padding: "14px 14px", display: "flex", flexDirection: "column", gap: 10 }, children: [
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(
          CardHeader,
          {
            title: "Server Updates",
            aside: /* @__PURE__ */ jsxs("span", { style: {
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "2px 8px",
              borderRadius: 5,
              background: D.successBg,
              color: D.success,
              fontSize: 10,
              fontWeight: 700
            }, children: [
              /* @__PURE__ */ jsx("svg", { width: "10", height: "10", fill: "none", stroke: D.success, strokeWidth: "2.5", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M5 13l4 4L19 7" }) }),
              "Up to date"
            ] })
          }
        ),
        /* @__PURE__ */ jsx("p", { style: { color: D.textMuted, fontSize: 11, margin: 0, lineHeight: 1.5 }, children: "Your server is running the latest patches and configurations." })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { title: "Submit a Support Ticket" }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: [
          [
            { label: "Subject", value: "Help with custom Nginx config" },
            { label: "Priority", value: "Normal" }
          ].map((f) => /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { style: { color: D.textMuted, fontSize: 10, marginBottom: 4 }, children: f.label }),
            /* @__PURE__ */ jsx("div", { style: {
              padding: "6px 10px",
              background: D.bg,
              border: `1px solid ${D.border}`,
              borderRadius: 6,
              color: f.label === "Priority" ? D.textMuted : D.textSec,
              fontSize: 11
            }, children: f.value })
          ] }, f.label)),
          /* @__PURE__ */ jsx(Btn, { variant: "primary", style: { alignSelf: "flex-start", marginTop: 2 }, children: "Send Ticket" })
        ] })
      ] })
    ] })
  ] }) });
}
const TOC = [
  { id: "intro", label: "Introduction" },
  { id: "getting-started", label: "Getting Started" },
  { id: "dashboard", label: "Dashboard Overview" },
  { id: "features", label: "Key Features" },
  { id: "faq", label: "FAQ & Support" }
];
function Docs() {
  return /* @__PURE__ */ jsx("div", { className: "funnel", children: /* @__PURE__ */ jsx("div", { className: "cb-shell", children: /* @__PURE__ */ jsxs("div", { className: "cb-shell-inner", style: { minHeight: "100vh", display: "flex", flexDirection: "column" }, children: [
    /* @__PURE__ */ jsx(ResponsiveNav, {}),
    /* @__PURE__ */ jsxs("div", { className: "flex", style: { flex: 1 }, children: [
      /* @__PURE__ */ jsx("aside", { className: "hidden md:block w-64 shrink-0 sticky top-0 self-start h-screen overflow-y-auto border-r border-gray-800 bg-[#030608]", children: /* @__PURE__ */ jsxs("div", { className: "py-8 px-5", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-sm font-bold text-white uppercase tracking-wider mb-6", children: "On This Page" }),
        /* @__PURE__ */ jsx("ul", { className: "space-y-1", children: TOC.map(({ id, label }) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: `#${id}`, className: "block py-2 px-3 rounded-sm border-l-2 text-sm no-underline transition-all duration-150 border-transparent text-gray-300 hover:text-white hover:bg-gray-800/30", children: label }) }, id)) })
      ] }) }),
      /* @__PURE__ */ jsxs("main", { className: "flex-1 min-w-0 pt-12 px-8 pb-24 max-w-4xl mx-auto", children: [
        /* @__PURE__ */ jsxs("section", { id: "intro", className: "mb-16 scroll-mt-24", children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-white mb-2", children: "Welcome to Clouded Basement" }),
          /* @__PURE__ */ jsx("p", { className: "text-base text-gray-300 mb-0" })
        ] }),
        /* @__PURE__ */ jsxs("section", { id: "getting-started", className: "mb-16 scroll-mt-24", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-white mb-2", children: "Getting Started" }),
          /* @__PURE__ */ jsxs("ol", { className: "list-decimal list-inside text-base text-gray-300 mb-0 space-y-2", children: [
            /* @__PURE__ */ jsxs("li", { children: [
              /* @__PURE__ */ jsx("b", { children: "Sign up:" }),
              " Click ",
              /* @__PURE__ */ jsx("a", { href: "/register", className: "text-blue-400 underline", children: "Start Free Trial" }),
              " and create your account with your email and password."
            ] }),
            /* @__PURE__ */ jsxs("li", { children: [
              /* @__PURE__ */ jsx("b", { children: "Verify your email:" }),
              " Check your inbox for a confirmation link and follow the instructions to activate your account."
            ] }),
            /* @__PURE__ */ jsxs("li", { children: [
              /* @__PURE__ */ jsx("b", { children: "Log in:" }),
              " Visit ",
              /* @__PURE__ */ jsx("a", { href: "/login", className: "text-blue-400 underline", children: "the login page" }),
              " and enter your credentials."
            ] }),
            /* @__PURE__ */ jsxs("li", { children: [
              /* @__PURE__ */ jsx("b", { children: "Access your dashboard:" }),
              " After logging in, you’ll be taken to your personal dashboard where you can deploy servers, manage domains, and more."
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("section", { id: "dashboard", className: "mb-16 scroll-mt-24", style: { background: "rgba(30,41,59,0.18)", borderTop: "2px solid #334155", borderRadius: 12, padding: "2.5rem 2rem 2rem 2rem" }, children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-white mb-2", children: "Dashboard Overview" }),
          /* @__PURE__ */ jsx("p", { className: "text-base text-gray-300 mb-2", children: "After logging in, you’ll land on your dashboard. This is your control center for all product features:" }),
          /* @__PURE__ */ jsxs("ul", { className: "list-disc list-inside text-base text-gray-300 mb-6 space-y-1 pl-4", children: [
            /* @__PURE__ */ jsx("li", { children: "View and manage your active servers" }),
            /* @__PURE__ */ jsx("li", { children: "Deploy a new server with one click" }),
            /* @__PURE__ */ jsx("li", { children: "Manage domains and SSL certificates" }),
            /* @__PURE__ */ jsx("li", { children: "Monitor usage and billing" }),
            /* @__PURE__ */ jsx("li", { children: "Access support and account settings" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex justify-center mb-2", children: /* @__PURE__ */ jsx(DashboardMockup, {}) })
        ] }),
        /* @__PURE__ */ jsxs("section", { id: "features", className: "mb-16 scroll-mt-24", style: { background: "rgba(17,24,39,0.13)", borderTop: "2px solid #2563eb", borderRadius: 12, padding: "2.5rem 2rem 2rem 2rem" }, children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-white mb-2", children: "Key Features" }),
          /* @__PURE__ */ jsxs("div", { className: "mb-10", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-white mb-1", children: "Deploy a Server" }),
            /* @__PURE__ */ jsxs("p", { className: "text-base text-gray-300 mb-4", children: [
              "Click ",
              /* @__PURE__ */ jsx("b", { children: "Deploy Server" }),
              " on your dashboard. In seconds, your new cloud server is online—fully configured and secured."
            ] }),
            /* @__PURE__ */ jsxs("ul", { className: "list-disc list-inside text-base text-gray-300 mb-4 pl-4", children: [
              /* @__PURE__ */ jsx("li", { children: "Instant provisioning on DigitalOcean" }),
              /* @__PURE__ */ jsx("li", { children: "Automatic OS, web, and database setup" }),
              /* @__PURE__ */ jsx("li", { children: "Firewall and SSL applied by default" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-base text-gray-300 mb-4", children: "Each server is a dedicated Linux VPS. Access SSH, logs, and advanced controls anytime from your dashboard." }),
            /* @__PURE__ */ jsx("div", { className: "flex justify-center mb-2", children: /* @__PURE__ */ jsx(DeployMockup, {}) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mb-10", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-white mb-1", children: "Manage Domains & SSL" }),
            /* @__PURE__ */ jsx("p", { className: "text-base text-gray-300 mb-4", children: "Connect your custom domains in seconds. Add, verify, and launch with automatic SSL—no manual setup required." }),
            /* @__PURE__ */ jsxs("ul", { className: "list-disc list-inside text-base text-gray-300 mb-4 pl-4", children: [
              /* @__PURE__ */ jsx("li", { children: "Add unlimited domains to your account" }),
              /* @__PURE__ */ jsx("li", { children: "Automatic SSL certificate provisioning and renewal" }),
              /* @__PURE__ */ jsx("li", { children: "DNS verification and status at a glance" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-base text-gray-300 mb-4", children: "All domains are secured with HTTPS by default. No extra steps, no extra cost." }),
            /* @__PURE__ */ jsx("div", { className: "flex justify-center mb-2", children: /* @__PURE__ */ jsx(DomainsMockup, {}) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mb-10", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-white mb-1", children: "Billing & Plans" }),
            /* @__PURE__ */ jsx("p", { className: "text-base text-gray-300 mb-4", children: "All plans are flat-rate and billed monthly. Select a plan on the pricing page, then complete checkout securely via Stripe — your server is activated instantly after payment." }),
            /* @__PURE__ */ jsxs("ul", { className: "list-disc list-inside text-base text-gray-300 mb-4 pl-4", children: [
              /* @__PURE__ */ jsx("li", { children: "Basic · $15/mo — 1 vCPU, 1GB RAM, 2 sites" }),
              /* @__PURE__ */ jsx("li", { children: "Pro · $35/mo — 2 vCPU, 2GB RAM, 5 sites" }),
              /* @__PURE__ */ jsx("li", { children: "Premium · $65/mo — 2 vCPU, 4GB RAM, 10 sites" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex justify-center mb-2", children: /* @__PURE__ */ jsx(BillingMockup, {}) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-white mb-1", children: "Support & Settings" }),
            /* @__PURE__ */ jsx("p", { className: "text-base text-gray-300 mb-4", children: "Need help or want to update your account? Everything is accessible from your dashboard." }),
            /* @__PURE__ */ jsxs("ul", { className: "list-disc list-inside text-base text-gray-300 mb-4 pl-4", children: [
              /* @__PURE__ */ jsx("li", { children: "Contact support directly from the help menu" }),
              /* @__PURE__ */ jsx("li", { children: "Update your email, password, and profile details" }),
              /* @__PURE__ */ jsx("li", { children: "Review security settings and recent activity" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex justify-center mb-2", children: /* @__PURE__ */ jsx(SupportMockup, {}) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("section", { id: "faq", className: "mb-16 scroll-mt-24", style: { background: "rgba(30,41,59,0.10)", borderTop: "2px solid #f59e42", borderRadius: 12, padding: "2.5rem 2rem 2rem 2rem" }, children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-white mb-2", children: "FAQ & Support" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-white mb-1", children: "How do I deploy my first server?" }),
              /* @__PURE__ */ jsxs("p", { className: "text-base text-gray-300 mb-0", children: [
                "Log in, click ",
                /* @__PURE__ */ jsx("b", { children: "Deploy Server" }),
                ", and follow the prompts. Your server will be ready in seconds—no technical setup required."
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-white mb-1", children: "Can I use my own domain?" }),
              /* @__PURE__ */ jsx("p", { className: "text-base text-gray-300 mb-0", children: "Yes. Add your custom domain in the dashboard. SSL is provisioned automatically for every domain you connect." })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-white mb-1", children: "How is my server secured?" }),
              /* @__PURE__ */ jsx("p", { className: "text-base text-gray-300 mb-0", children: "All servers are protected with firewalls, automatic security updates, and SSL by default. You can review and adjust security settings in your dashboard." })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-white mb-1", children: "How do I get support?" }),
              /* @__PURE__ */ jsx("p", { className: "text-base text-gray-300 mb-0", children: "Open the help menu in your dashboard to contact support. Our team responds quickly to all inquiries." })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-white mb-1", children: "Can I upgrade or downgrade my plan?" }),
              /* @__PURE__ */ jsx("p", { className: "text-base text-gray-300 mb-0", children: "You can change your plan at any time from the Billing & Plans section. Changes take effect immediately on your next billing cycle." })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-white mb-1", children: "Where can I find my invoices?" }),
              /* @__PURE__ */ jsxs("p", { className: "text-base text-gray-300 mb-0", children: [
                "Invoices are securely generated and stored by Stripe. You can view and download your invoices through the Stripe billing portal or from Stripe-generated links sent to your email after each payment. For direct access, use the ",
                /* @__PURE__ */ jsx("b", { children: "View Invoices" }),
                " link in the Billing & Plans section."
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }),
            "aria-label": "Scroll to top",
            className: "fixed bottom-6 right-6 z-50 bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-gray-400 cursor-pointer",
            style: { display: "none" },
            children: /* @__PURE__ */ jsx("svg", { width: "18", height: "18", fill: "none", stroke: "currentColor", strokeWidth: "2.5", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M5 15l7-7 7 7" }) })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx(Footer, {})
  ] }) }) });
}
export {
  Docs as default
};
