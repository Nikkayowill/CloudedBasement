import { jsxs, jsx } from "react/jsx-runtime";
import { D as DocLayout } from "./DocLayout-DXgI7s9O.js";
import "react";
import "../entry-server.js";
import "react-dom/server";
import "react-router-dom";
import "lucide-react";
const TOC = [
  { id: "payment", label: "Payment Security" },
  { id: "platform", label: "Platform Security" },
  { id: "infrastructure", label: "Infrastructure" },
  { id: "ownership", label: "Data Ownership & Portability" },
  { id: "transparency", label: "Transparency" },
  { id: "support", label: "Support" }
];
function Safety() {
  return /* @__PURE__ */ jsxs(DocLayout, { toc: TOC, children: [
    /* @__PURE__ */ jsxs("header", { className: "mb-12", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4", children: "Security & Trust" }),
      /* @__PURE__ */ jsx("p", { className: "text-base lg:text-lg text-gray-400 leading-relaxed", children: "How we protect your data, payments, and infrastructure." })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "payment", className: "mb-16 scroll-mt-24", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4", children: "Payment Security" }),
      /* @__PURE__ */ jsxs("p", { className: "text-gray-300 leading-relaxed mb-6", children: [
        "All payment processing is handled by",
        " ",
        /* @__PURE__ */ jsx("a", { href: "https://stripe.com", target: "_blank", rel: "noopener", className: "text-blue-400 hover:text-blue-300 underline", children: "Stripe" }),
        ", a PCI DSS Level 1 certified payment processor trusted by millions of businesses worldwide."
      ] }),
      /* @__PURE__ */ jsx("ul", { className: "space-y-3 text-gray-300", children: [
        { label: "Card data never touches our servers", desc: "— payment information is transmitted directly to Stripe via their secure Elements SDK" },
        { label: "3D Secure authentication", desc: "— supported automatically for cards that require additional verification" },
        { label: "Full refund capability", desc: "— cancel anytime, no hidden fees or long-term contracts" }
      ].map(({ label, desc }) => /* @__PURE__ */ jsxs("li", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: "text-green-400 mt-1", children: "✓" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("strong", { className: "text-white", children: label }),
          desc
        ] })
      ] }, label)) })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "platform", className: "mb-16 scroll-mt-24", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4", children: "Platform Security" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-300 leading-relaxed mb-6", children: "Clouded Basement is built with industry-standard security practices:" }),
      /* @__PURE__ */ jsx("div", { className: "bg-gray-900 rounded-lg p-6 border border-gray-800", children: /* @__PURE__ */ jsx("ul", { className: "space-y-3 text-gray-300", children: [
        { label: "Password hashing", desc: "— all passwords are hashed using bcrypt with per-user salts, making them unreadable even in the event of a data breach" },
        { label: "SQL injection protection", desc: "— all database queries use parameterized statements, preventing malicious input from accessing or modifying data" },
        { label: "CSRF protection", desc: "— all forms include cross-site request forgery tokens, preventing unauthorized actions on your behalf" },
        { label: "Rate limiting", desc: "— authentication and sensitive endpoints are rate-limited to prevent brute-force attacks" },
        { label: "HTTPS everywhere", desc: "— all traffic is encrypted using TLS 1.2+ with valid SSL certificates" },
        { label: "HTTP security headers", desc: "— we use Helmet.js to set secure headers including Content Security Policy, X-Frame-Options, and more" }
      ].map(({ label, desc }) => /* @__PURE__ */ jsxs("li", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: "text-green-400 mt-1", children: "✓" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("strong", { className: "text-white", children: label }),
          desc
        ] })
      ] }, label)) }) }),
      /* @__PURE__ */ jsxs("p", { className: "text-gray-400 text-sm mt-4", children: [
        "For a complete overview, see our",
        " ",
        /* @__PURE__ */ jsx("a", { href: "/docs", className: "text-blue-400 hover:text-blue-300 underline", children: "documentation" }),
        " and",
        " ",
        /* @__PURE__ */ jsx("a", { href: "/privacy", className: "text-blue-400 hover:text-blue-300 underline", children: "privacy policy" }),
        "."
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "infrastructure", className: "mb-16 scroll-mt-24", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4", children: "Infrastructure" }),
      /* @__PURE__ */ jsxs("p", { className: "text-gray-300 leading-relaxed mb-6", children: [
        "Your server runs on",
        " ",
        /* @__PURE__ */ jsx("a", { href: "https://www.digitalocean.com", target: "_blank", rel: "noopener", className: "text-blue-400 hover:text-blue-300 underline", children: "DigitalOcean" }),
        " ",
        "infrastructure — the same cloud platform trusted by companies like GitLab, Slack, and Docker."
      ] }),
      /* @__PURE__ */ jsx("ul", { className: "space-y-3 text-gray-300", children: [
        { label: "Dedicated VPS", desc: "— each customer gets their own isolated virtual private server, not shared hosting" },
        { label: "Ubuntu 22.04 LTS", desc: "— long-term support releases with security updates until 2027" },
        { label: "Automatic SSL", desc: "— Let's Encrypt certificates provisioned and renewed automatically" },
        { label: "Full root access", desc: "— complete control over your server via SSH" }
      ].map(({ label, desc }) => /* @__PURE__ */ jsxs("li", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: "text-green-400 mt-1", children: "✓" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("strong", { className: "text-white", children: label }),
          desc
        ] })
      ] }, label)) })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "ownership", className: "mb-16 scroll-mt-24", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4", children: "Data Ownership & Portability" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-300 leading-relaxed mb-6", children: "Your code and data remain entirely yours. Clouded Basement has no vendor lock-in by design:" }),
      /* @__PURE__ */ jsx("ul", { className: "space-y-3 text-gray-300", children: [
        { label: "Full SSH access", desc: "— export, backup, or migrate your data at any time" },
        { label: "Standard deployment", desc: "— your server uses standard tools (Node.js, systemd, Nginx) with no proprietary configurations" },
        { label: "Business continuity", desc: "— even if Clouded Basement ceased operations, your server would continue running on DigitalOcean with your existing credentials" }
      ].map(({ label, desc }) => /* @__PURE__ */ jsxs("li", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: "text-green-400 mt-1", children: "✓" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("strong", { className: "text-white", children: label }),
          desc
        ] })
      ] }, label)) }),
      /* @__PURE__ */ jsxs("p", { className: "text-gray-400 text-sm mt-4", children: [
        "See our ",
        /* @__PURE__ */ jsx("a", { href: "/terms", className: "text-blue-400 hover:text-blue-300 underline", children: "terms of service" }),
        " for complete details on data ownership and usage rights."
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "transparency", className: "mb-16 scroll-mt-24", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4", children: "Transparency" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-300 leading-relaxed mb-6", children: "Clouded Basement is designed for developers and small teams shipping side projects, MVPs, and production applications. We are not positioned as an enterprise compliance platform:" }),
      /* @__PURE__ */ jsx("div", { className: "bg-yellow-950/20 border-l-4 border-yellow-500 rounded-r-lg p-6 mb-6", children: /* @__PURE__ */ jsx("ul", { className: "space-y-3 text-gray-300", children: [
        "Not suitable for HIPAA, SOC 2, or regulated data that requires specialized compliance certifications",
        "Operated by a solo founder — support is direct and personal, but not 24/7 SLA-backed",
        "New platform — launched in 2026, with an active development roadmap"
      ].map((item) => /* @__PURE__ */ jsxs("li", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: "text-yellow-400 mt-1", children: "•" }),
        /* @__PURE__ */ jsx("div", { children: item })
      ] }, item)) }) }),
      /* @__PURE__ */ jsxs("p", { className: "text-gray-300 leading-relaxed", children: [
        "We believe in being upfront about what we are and aren't. If you have specific compliance requirements, please",
        " ",
        /* @__PURE__ */ jsx("a", { href: "/contact", className: "text-blue-400 hover:text-blue-300 underline", children: "contact us" }),
        " to discuss whether Clouded Basement is the right fit."
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "support", className: "mb-16 scroll-mt-24", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4", children: "Support" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-300 leading-relaxed mb-6", children: "When you contact support, you're communicating directly with the founder who built the platform. Response time is typically within 24 hours for all inquiries." }),
      /* @__PURE__ */ jsx("ul", { className: "space-y-3 text-gray-300", children: [
        "Email support for provisioning, deployment, and configuration issues",
        "Free migration assistance for early adopters moving from other hosts",
        "Dashboard ticket system for tracking ongoing issues"
      ].map((item) => /* @__PURE__ */ jsxs("li", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: "text-green-400 mt-1", children: "✓" }),
        /* @__PURE__ */ jsx("div", { children: item })
      ] }, item)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-4 pt-8 border-t border-gray-800 text-center", children: [
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/pricing",
          className: "inline-block px-8 py-4 text-white bg-blue-600 rounded-lg hover:bg-blue-500 hover:scale-105 hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all font-bold uppercase tracking-wider text-sm",
          children: "View Plans"
        }
      ),
      /* @__PURE__ */ jsxs("p", { className: "text-gray-500 text-sm mt-4", children: [
        "Questions?",
        " ",
        /* @__PURE__ */ jsx("a", { href: "/contact", className: "text-blue-400 hover:text-blue-300 underline", children: "Contact us" }),
        " or review our",
        " ",
        /* @__PURE__ */ jsx("a", { href: "/faq", className: "text-blue-400 hover:text-blue-300 underline", children: "FAQ" }),
        "."
      ] })
    ] })
  ] });
}
export {
  Safety as default
};
