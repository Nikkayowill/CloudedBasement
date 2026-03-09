import { jsxs, jsx } from "react/jsx-runtime";
import { R as ResponsiveNav, F as Footer } from "../entry-server.js";
import "react-dom/server";
import "react-router-dom";
import "react";
import "lucide-react";
const DOC_LINKS = [
  {
    title: "Docs Index",
    body: "Start here for architecture, API, deployment, security, operations, and testing docs.",
    href: "https://github.com/Nikkayowill/server-ui/blob/main/docs/README.md"
  },
  {
    title: "Quickstart",
    body: "Local onboarding for developers.",
    href: "https://github.com/Nikkayowill/server-ui/blob/main/docs/QUICKSTART.md"
  },
  {
    title: "API Reference",
    body: "Routes, webhook endpoints, and guard middleware summary.",
    href: "https://github.com/Nikkayowill/server-ui/blob/main/docs/API-REFERENCE.md"
  },
  {
    title: "Deployment",
    body: "Production deployment runbook and verification checklist.",
    href: "https://github.com/Nikkayowill/server-ui/blob/main/docs/DEPLOYMENT.md"
  }
];
function Docs() {
  return /* @__PURE__ */ jsxs("div", { className: "funnel", children: [
    /* @__PURE__ */ jsx(ResponsiveNav, {}),
    /* @__PURE__ */ jsx("main", { className: "pt-14", children: /* @__PURE__ */ jsx("section", { className: "funnel-section", children: /* @__PURE__ */ jsxs("div", { className: "funnel-wide", children: [
      /* @__PURE__ */ jsx("h1", { className: "funnel-heading-1 mb-4", children: "Documentation" }),
      /* @__PURE__ */ jsx("p", { className: "funnel-body mb-10", children: "Clouded Basement documentation is maintained in-repo and aligned to the current implementation." }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-4 md:grid-cols-2", children: DOC_LINKS.map((link) => /* @__PURE__ */ jsxs(
        "a",
        {
          href: link.href,
          target: "_blank",
          rel: "noopener noreferrer",
          className: "funnel-card block p-6",
          style: { textDecoration: "none" },
          children: [
            /* @__PURE__ */ jsx("h2", { className: "funnel-heading-3 mb-2", children: link.title }),
            /* @__PURE__ */ jsx("p", { className: "funnel-body-sm", children: link.body })
          ]
        },
        link.title
      )) }),
      /* @__PURE__ */ jsxs("div", { className: "mt-10 border border-yellow-700/40 bg-yellow-950/20 rounded-xl p-5", children: [
        /* @__PURE__ */ jsx("h3", { className: "funnel-heading-3 mb-2", style: { color: "#fef08a" }, children: "Important" }),
        /* @__PURE__ */ jsx("p", { className: "funnel-body-sm", style: { color: "#fef9c3" }, children: "Documentation files in this project are source-of-truth. If a feature is not documented there, treat it as unsupported until verified in code." })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx(Footer, {})
  ] });
}
export {
  Docs as default
};
