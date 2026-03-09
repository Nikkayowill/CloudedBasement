import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { R as ResponsiveNav, F as Footer } from "../entry-server.js";
import "react-dom/server";
import "react-router-dom";
import "lucide-react";
const FAQS = [
  {
    q: "Why wouldn't I just use DigitalOcean directly?",
    a: "DigitalOcean gives you raw infrastructure (Droplets) or a managed app platform. Droplets require you to install and maintain everything yourself — Ubuntu, Nginx, SSL, runtimes, and deployments. The App Platform automates deployments but does not give full server control. Clouded Basement automates provisioning and deployment while giving you full root access to your own server, saving you setup time without losing control."
  },
  {
    q: "Do I actually own my server?",
    a: "Yes. Every VPS is fully yours, with root access and a dedicated IP. You can install anything, modify the configuration, or migrate it elsewhere at any time. Clouded Basement just handles the initial setup and deployment automation."
  },
  {
    q: "What happens if I cancel?",
    a: "You can cancel anytime. Your server stays active until the end of your billing period so you can back up your data or migrate. After that, the server is shut down. No contracts, no cancellation fees."
  },
  {
    q: "How is Clouded Basement different from Heroku or Vercel?",
    a: "Unlike PaaS platforms, Clouded Basement gives you full server control with automated setup and deployment. You avoid vendor lock-in while still enjoying one-click provisioning, SSL, and GitHub deployments."
  }
];
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return /* @__PURE__ */ jsxs("div", { className: "funnel-card overflow-hidden", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        className: "w-full p-6 cursor-pointer hover:bg-white/3 transition-all flex justify-between items-center text-left",
        onClick: () => setOpen((o) => !o),
        "aria-expanded": open,
        children: [
          /* @__PURE__ */ jsx("h3", { className: "funnel-heading-3", children: q }),
          /* @__PURE__ */ jsx("span", { className: `text-2xl text-blue-400 transition-transform duration-300 shrink-0 ml-4 ${open ? "rotate-45" : ""}`, children: "+" })
        ]
      }
    ),
    open && /* @__PURE__ */ jsx("div", { className: "px-6 pb-6", children: /* @__PURE__ */ jsx("p", { className: "funnel-body", children: a }) })
  ] });
}
function Faq() {
  return /* @__PURE__ */ jsxs("div", { className: "funnel", children: [
    /* @__PURE__ */ jsx(ResponsiveNav, {}),
    /* @__PURE__ */ jsx("main", { className: "pt-14", children: /* @__PURE__ */ jsx("section", { className: "funnel-section funnel-bg-process", children: /* @__PURE__ */ jsxs("div", { className: "funnel-prose", children: [
      /* @__PURE__ */ jsx("h1", { className: "funnel-heading-1 text-center mb-4", children: "Frequently Asked Questions" }),
      /* @__PURE__ */ jsx("p", { className: "funnel-body text-center mb-16", children: "Quick answers to common questions" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-4", children: FAQS.map((faq) => /* @__PURE__ */ jsx(FaqItem, { q: faq.q, a: faq.a }, faq.q)) }),
      /* @__PURE__ */ jsxs("div", { className: "funnel-card p-12 text-center mt-8", children: [
        /* @__PURE__ */ jsx("h2", { className: "funnel-heading-2 mb-4", children: "Still Have Questions?" }),
        /* @__PURE__ */ jsx("p", { className: "funnel-body mb-8", children: "Can't find the answer you're looking for? Our support team is here to help." }),
        /* @__PURE__ */ jsx("a", { href: "/contact", className: "funnel-btn funnel-btn-primary uppercase tracking-wider text-sm", children: "Contact Support" })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx(Footer, {})
  ] });
}
export {
  Faq as default
};
