import { jsxs, jsx } from "react/jsx-runtime";
import { R as ResponsiveNav, F as Footer } from "../entry-server.js";
import "react-dom/server";
import "react-router-dom";
import "react";
import "lucide-react";
const TABLE_ROWS = [
  { feature: "Full SSH & root access", basement: "✓", heroku: "✗", render: "✗", railway: "✗", diy: "✓", bClass: "text-green-400", hClass: "text-red-400", rClass: "text-red-400", rwClass: "text-red-400", dClass: "text-green-400" },
  { feature: "Your own dedicated server", basement: "✓", heroku: "✗", render: "✗", railway: "✗", diy: "✓", bClass: "text-green-400", hClass: "text-red-400", rClass: "text-red-400", rwClass: "text-red-400", dClass: "text-green-400" },
  { feature: "Git push to deploy", basement: "✓", heroku: "✓", render: "✓", railway: "✓", diy: "✗", bClass: "text-green-400", hClass: "text-green-400", rClass: "text-green-400", rwClass: "text-green-400", dClass: "text-red-400" },
  { feature: "GitHub auto-deploy", basement: "✓", heroku: "✓", render: "✓", railway: "✓", diy: "✗", bClass: "text-green-400", hClass: "text-green-400", rClass: "text-green-400", rwClass: "text-green-400", dClass: "text-red-400" },
  { feature: "Custom domains", basement: "✓", heroku: "✓", render: "✓", railway: "✓", diy: "Manual", bClass: "text-green-400", hClass: "text-green-400", rClass: "text-green-400", rwClass: "text-green-400", dClass: "text-yellow-400" },
  { feature: "Automatic SSL", basement: "✓", heroku: "✓", render: "✓", railway: "✓", diy: "Manual", bClass: "text-green-400", hClass: "text-green-400", rClass: "text-green-400", rwClass: "text-green-400", dClass: "text-yellow-400" },
  { feature: "One-click database", basement: "✓", heroku: "✓", render: "✓", railway: "✓", diy: "✗", bClass: "text-green-400", hClass: "text-green-400", rClass: "text-green-400", rwClass: "text-green-400", dClass: "text-red-400" },
  { feature: "Environment variables", basement: "✓", heroku: "✓", render: "✓", railway: "✓", diy: "Manual", bClass: "text-green-400", hClass: "text-green-400", rClass: "text-green-400", rwClass: "text-green-400", dClass: "text-yellow-400" },
  { feature: "Managed security updates", basement: "✓", heroku: "✓", render: "✓", railway: "✓", diy: "✗", bClass: "text-green-400", hClass: "text-green-400", rClass: "text-green-400", rwClass: "text-green-400", dClass: "text-red-400" },
  { feature: "No vendor lock-in", basement: "✓", heroku: "✗", render: "✗", railway: "✗", diy: "✓", bClass: "text-green-400", hClass: "text-red-400", rClass: "text-red-400", rwClass: "text-red-400", dClass: "text-green-400" },
  { feature: "Predictable pricing", basement: "✓", heroku: "✓", render: "✓", railway: "Usage", diy: "✓", bClass: "text-green-400", hClass: "text-green-400", rClass: "text-green-400", rwClass: "text-yellow-400", dClass: "text-green-400" },
  { feature: "Free trial (no card)", basement: "3 days", heroku: "✗", render: "Free tier", railway: "Free trial", diy: "✗", bClass: "text-green-400", hClass: "text-red-400", rClass: "text-green-400", rwClass: "text-green-400", dClass: "text-red-400" },
  { feature: "Run any language/framework", basement: "✓", heroku: "Buildpacks", render: "Native + Docker", railway: "Nixpacks", diy: "✓", bClass: "text-green-400", hClass: "text-yellow-400", rClass: "text-yellow-400", rwClass: "text-yellow-400", dClass: "text-green-400" },
  { feature: "Install system packages", basement: "apt-get", heroku: "✗", render: "✗", railway: "✗", diy: "apt-get", bClass: "text-green-400", hClass: "text-red-400", rClass: "text-red-400", rwClass: "text-red-400", dClass: "text-green-400" },
  { feature: "Persistent filesystem", basement: "✓", heroku: "Ephemeral", render: "Ephemeral", railway: "Ephemeral", diy: "✓", bClass: "text-green-400", hClass: "text-red-400", rClass: "text-red-400", rwClass: "text-red-400", dClass: "text-green-400" },
  { feature: "Setup time", basement: "~2 min", heroku: "~5 min", render: "~5 min", railway: "~3 min", diy: "30–60 min", bClass: "text-blue-300", hClass: "", rClass: "", rwClass: "", dClass: "text-yellow-400" }
];
const COMPETITORS = [
  {
    title: "Clouded Basement vs. DIY VPS",
    subtitle: "(DigitalOcean, Linode, Vultr)",
    body: "A DigitalOcean droplet with similar specs (1GB/1vCPU) is $6/mo — but you'll spend hours setting up everything Basement automates. Your time has value.",
    cols: [
      {
        heading: "What you skip with Basement",
        color: "text-blue-400",
        items: ["Setting up Nginx reverse proxy configs", "Configuring Certbot / SSL certificates", "Writing deployment scripts", "Setting up firewall rules (UFW)", "Installing Node.js, Python, Go, Rust", "Managing OS security updates", "Configuring database servers"]
      },
      {
        heading: "What you still get",
        color: "text-blue-400",
        items: ["Full root SSH access to your server", "Install anything with apt-get", "Your own IP address", "Persistent filesystem (not containers)", "Run background processes, cron jobs", "No vendor lock-in — take your server and leave", "Full control over everything"]
      }
    ]
  },
  {
    title: "Clouded Basement vs. Heroku",
    body: "Heroku pioneered push-to-deploy and is well-known, but their free tier was removed in 2022. The cheapest option is the Eco plan at $5/mo (shared pool of 1,000 dyno hours) with 512MB RAM, or the Basic plan at $7/mo per dyno. Add a managed Postgres database and costs climb quickly. You don't get SSH access, you can't install system packages, and your filesystem resets on every deploy.",
    cols: [
      { heading: "Basement advantages", color: "text-green-400", items: ["Full SSH & root access", "Persistent filesystem", "Install any system package", "Multiple sites on one server", "No slug size limits"] },
      { heading: "Heroku advantages", color: "text-purple-400", items: ["Larger ecosystem of add-ons", "Auto-scaling (paid plans)", "Longer track record", "Team collaboration features"] }
    ]
  },
  {
    title: "Clouded Basement vs. Render",
    body: "Render is a solid PaaS with a free tier (512MB, spins down after inactivity). Paid instances start at $7/mo for 512MB RAM (Starter) up to $85/mo for 4GB (Pro). Render supports native runtimes and Docker, and offers SSH access for debugging — but not full root access. You can't install system packages or modify the OS.",
    cols: [
      { heading: "Basement advantages", color: "text-green-400", items: ["Full SSH & root access", "No cold starts — your server is always on", "Run any language natively (install via apt-get)", "Multiple sites on one server", "Persistent disk by default"] },
      { heading: "Render advantages", color: "text-purple-400", items: ["Free tier available", "Static site hosting", "Managed Redis and Postgres", "SSH access for debugging", "Persistent disks available (paid add-on)"] }
    ]
  },
  {
    title: "Clouded Basement vs. Railway",
    body: "Railway has a great developer experience with usage-based pricing (billed per second). They offer a 30-day free trial with $5 in credits (no card required), then a Hobby plan at $5/mo or Pro at $20/mo — both include credits, but you pay for usage beyond that. Costs can spike unpredictably with traffic, and like other PaaS platforms, you're running on shared infrastructure without root access or OS-level control.",
    cols: [
      { heading: "Basement advantages", color: "text-green-400", items: ["Predictable flat pricing (no surprise bills)", "Full SSH & root access", "Dedicated resources (not shared)", "Persistent filesystem", "No usage caps or metering"] },
      { heading: "Railway advantages", color: "text-purple-400", items: ["Pay-per-use (good for low-traffic)", "Slick dashboard UI", "Instant project templates", "Broader community"] }
    ]
  }
];
const BEST_FOR = [
  { icon: "🚀", title: "Solo developers", body: "Ship side projects and SaaS apps on your own server without managing infrastructure." },
  { icon: "💼", title: "Freelancers", body: "Host multiple client projects on one server. Custom domains, SSL, and deployments handled for you." },
  { icon: "🎓", title: "Developers learning DevOps", body: "Get a real server with SSH access, but without the hours of setup. Learn on a working system." }
];
function Compare() {
  return /* @__PURE__ */ jsxs("div", { className: "funnel", children: [
    /* @__PURE__ */ jsx(ResponsiveNav, {}),
    /* @__PURE__ */ jsx("main", { className: "pt-14", children: /* @__PURE__ */ jsx("section", { className: "funnel-section", children: /* @__PURE__ */ jsxs("div", { className: "funnel-wide", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-16", children: [
        /* @__PURE__ */ jsx("h1", { className: "funnel-heading-1 mb-4", children: "How We Compare" }),
        /* @__PURE__ */ jsx("p", { className: "funnel-body max-w-2xl mx-auto", children: "Every platform makes trade-offs. Here's an honest look at where Clouded Basement fits." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "funnel-card-featured p-8 mb-16", children: [
        /* @__PURE__ */ jsx("h2", { className: "funnel-heading-3 mb-4", children: "The short version" }),
        /* @__PURE__ */ jsx("p", { className: "funnel-body mb-4", children: "Platforms like Heroku and Render are convenient but give you a managed container — you don't get SSH, root access, or control over the OS. Raw VPS providers like DigitalOcean give you total control but leave setup, deployment, SSL, and security to you." }),
        /* @__PURE__ */ jsxs("p", { className: "funnel-body", children: [
          /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Clouded Basement gives you both." }),
          " A real Ubuntu server with full root access, plus managed Git deployments, automatic SSL, security updates, and a dashboard to control everything."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-16", children: [
        /* @__PURE__ */ jsx("h2", { className: "funnel-heading-2 text-center mb-8", children: "Feature Comparison" }),
        /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-700", children: [
            /* @__PURE__ */ jsx("th", { className: "text-left py-3 px-4 text-gray-400 font-medium min-w-[180px]", children: "Feature" }),
            /* @__PURE__ */ jsx("th", { className: "text-center py-3 px-4 text-blue-300 font-bold min-w-[120px]", children: "Basement" }),
            /* @__PURE__ */ jsx("th", { className: "text-center py-3 px-4 text-gray-300 font-bold min-w-[120px]", children: "Heroku" }),
            /* @__PURE__ */ jsx("th", { className: "text-center py-3 px-4 text-gray-300 font-bold min-w-[120px]", children: "Render" }),
            /* @__PURE__ */ jsx("th", { className: "text-center py-3 px-4 text-gray-300 font-bold min-w-[120px]", children: "Railway" }),
            /* @__PURE__ */ jsx("th", { className: "text-center py-3 px-4 text-gray-300 font-bold min-w-[120px]", children: "DIY VPS" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "text-gray-300", children: TABLE_ROWS.map((row) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-800", children: [
            /* @__PURE__ */ jsx("td", { className: "py-3 px-4 text-gray-400", children: row.feature }),
            /* @__PURE__ */ jsx("td", { className: `text-center ${row.bClass}`, children: row.basement }),
            /* @__PURE__ */ jsx("td", { className: `text-center ${row.hClass}`, children: row.heroku }),
            /* @__PURE__ */ jsx("td", { className: `text-center ${row.rClass}`, children: row.render }),
            /* @__PURE__ */ jsx("td", { className: `text-center ${row.rwClass}`, children: row.railway }),
            /* @__PURE__ */ jsx("td", { className: `text-center ${row.dClass}`, children: row.diy })
          ] }, row.feature)) })
        ] }) })
      ] }),
      COMPETITORS.map((c) => /* @__PURE__ */ jsxs("div", { className: "mb-16", children: [
        /* @__PURE__ */ jsxs("h2", { className: "funnel-heading-2 mb-6", children: [
          c.title,
          c.subtitle && /* @__PURE__ */ jsxs("span", { className: "funnel-body font-normal", children: [
            " ",
            c.subtitle
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "funnel-card p-6", children: [
          /* @__PURE__ */ jsx("p", { className: "funnel-body mb-4", children: c.body }),
          /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-2 gap-4 mt-4", children: c.cols.map((col) => /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h4", { className: `funnel-body-sm font-bold ${col.color} mb-2`, children: col.heading }),
            /* @__PURE__ */ jsx("ul", { className: "space-y-1 funnel-body-sm", children: col.items.map((item) => /* @__PURE__ */ jsxs("li", { children: [
              "• ",
              item
            ] }, item)) })
          ] }, col.heading)) })
        ] })
      ] }, c.title)),
      /* @__PURE__ */ jsxs("div", { className: "mb-16", children: [
        /* @__PURE__ */ jsx("h2", { className: "funnel-heading-2 text-center mb-8", children: "Who is Basement best for?" }),
        /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-3 gap-6", children: BEST_FOR.map((card) => /* @__PURE__ */ jsxs("div", { className: "funnel-card p-6 text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-3xl mb-3", children: card.icon }),
          /* @__PURE__ */ jsx("h3", { className: "funnel-heading-3 mb-2", children: card.title }),
          /* @__PURE__ */ jsx("p", { className: "funnel-body-sm", children: card.body })
        ] }, card.title)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "funnel-card p-8 mb-16", children: [
        /* @__PURE__ */ jsx("h2", { className: "funnel-heading-3 mb-4", children: "When we're not the right fit" }),
        /* @__PURE__ */ jsx("ul", { className: "space-y-3 funnel-body-sm", children: [
          { label: "Enterprise teams", desc: "needing multi-region, auto-scaling, and team RBAC — look at AWS, GCP, or Render Teams." },
          { label: "Static sites only", desc: "— Vercel, Netlify, or Cloudflare Pages are free and purpose-built for that." },
          { label: "Serverless functions", desc: "— if you don't need a persistent server, Lambda or Cloudflare Workers are better suited." }
        ].map((item) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-yellow-400 mt-0.5", children: "→" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { className: "text-white", children: item.label }),
            " ",
            item.desc
          ] })
        ] }, item.label)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx("h2", { className: "funnel-heading-2 mb-4", children: "Ready to try it?" }),
        /* @__PURE__ */ jsx("p", { className: "funnel-body mb-8", children: "3-day free trial. No credit card. Real server in 2 minutes." }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row justify-center gap-4", children: [
          /* @__PURE__ */ jsxs("a", { href: "/register", className: "funnel-btn funnel-btn-primary", children: [
            "Start Free Trial",
            /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z", clipRule: "evenodd" }) })
          ] }),
          /* @__PURE__ */ jsx("a", { href: "/pricing", className: "funnel-btn funnel-btn-subtle", children: "View Pricing" })
        ] })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx(Footer, {})
  ] });
}
export {
  Compare as default
};
