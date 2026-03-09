import { jsxs, jsx } from "react/jsx-runtime";
import { D as DocLayout } from "./DocLayout-Bc_hCDwe.js";
import "react";
import "../entry-server.js";
import "react-dom/server";
import "react-router-dom";
import "lucide-react";
const TOC = [
  { id: "section-1", label: "1. Information We Collect" },
  { id: "section-2", label: "2. How We Use Your Information" },
  { id: "section-3", label: "3. Information Sharing and Disclosure" },
  { id: "section-4", label: "4. Data Security" },
  { id: "section-5", label: "5. Your Rights and Choices" },
  { id: "section-6", label: "6. Data Retention" },
  { id: "section-7", label: "7. Cookies and Tracking" },
  { id: "section-8", label: "8. Third-Party Links" },
  { id: "section-9", label: "9. Children's Privacy" },
  { id: "section-10", label: "10. International Data Transfers" },
  { id: "section-11", label: "11. Changes to This Privacy Policy" },
  { id: "section-12", label: "12. California Privacy Rights" },
  { id: "section-13", label: "13. European Privacy Rights" },
  { id: "section-14", label: "14. Contact Information" }
];
function H2({ children }) {
  return /* @__PURE__ */ jsx("h2", { className: "text-2xl lg:text-3xl font-bold text-white mb-6 pb-3 border-l-4 border-blue-500 pl-4 scroll-mt-24", children });
}
function H3({ children }) {
  return /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-white mb-4", children });
}
function Body({ children }) {
  return /* @__PURE__ */ jsx("p", { className: "text-gray-300 leading-relaxed", children });
}
function Dot({ children }) {
  return /* @__PURE__ */ jsxs("li", { className: "flex gap-3", children: [
    /* @__PURE__ */ jsx("span", { className: "text-blue-400 mt-1", children: "•" }),
    /* @__PURE__ */ jsx("div", { className: "text-gray-300", children })
  ] });
}
function Privacy() {
  return /* @__PURE__ */ jsxs(DocLayout, { toc: TOC, children: [
    /* @__PURE__ */ jsxs("header", { className: "mb-12", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4", children: "Privacy Policy" }),
      /* @__PURE__ */ jsx("p", { className: "text-base lg:text-lg text-gray-400 leading-relaxed", children: "Last Updated: January 26, 2026" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-400 leading-relaxed mt-4", children: 'Clouded Basement Hosting ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services. Please read this policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.' })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "section-1", className: "mb-16 scroll-mt-24", children: [
      /* @__PURE__ */ jsx(H2, { id: "section-1", children: "1. Information We Collect" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(H3, { children: "1.1 Personal Information You Provide" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-300 leading-relaxed mb-4", children: "We collect information that you voluntarily provide to us when you:" }),
          /* @__PURE__ */ jsxs("ul", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxs(Dot, { children: [
              /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Register for an account:" }),
              " Email address and encrypted password"
            ] }),
            /* @__PURE__ */ jsxs(Dot, { children: [
              /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Submit inquiries:" }),
              " Name, email address, phone number (if provided), and message content through our contact form"
            ] }),
            /* @__PURE__ */ jsxs(Dot, { children: [
              /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Make purchases:" }),
              " Billing information including name, address, and payment card details (processed securely by our payment processor, Stripe)"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(H3, { children: "1.2 Automatically Collected Information" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-300 leading-relaxed mb-4", children: "When you access our website, we may automatically collect certain information, including:" }),
          /* @__PURE__ */ jsxs("ul", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxs(Dot, { children: [
              /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Log data:" }),
              " IP address, browser type, operating system, referring URLs, pages viewed, and timestamps"
            ] }),
            /* @__PURE__ */ jsxs(Dot, { children: [
              /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Session data:" }),
              " Authentication tokens stored in cookies to maintain your logged-in state"
            ] }),
            /* @__PURE__ */ jsxs(Dot, { children: [
              /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Device information:" }),
              " Screen resolution, device type, and browser capabilities"
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "section-2", className: "mb-16 scroll-mt-24", children: [
      /* @__PURE__ */ jsx(H2, { id: "section-2", children: "2. How We Use Your Information" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-300 leading-relaxed mb-4", children: "We use the information we collect for legitimate business purposes, including:" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs(Dot, { children: [
          /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Service Delivery:" }),
          " To create and manage your account, process transactions, and deliver the services you request"
        ] }),
        /* @__PURE__ */ jsxs(Dot, { children: [
          /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Communication:" }),
          " To respond to your inquiries, provide customer support, and send transactional emails regarding your account or purchases"
        ] }),
        /* @__PURE__ */ jsxs(Dot, { children: [
          /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Security:" }),
          " To monitor and prevent fraudulent activity, unauthorized access, and other illegal activities"
        ] }),
        /* @__PURE__ */ jsxs(Dot, { children: [
          /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Improvement:" }),
          " To analyze usage patterns, diagnose technical problems, and improve our website functionality and user experience"
        ] }),
        /* @__PURE__ */ jsxs(Dot, { children: [
          /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Legal Compliance:" }),
          " To comply with applicable laws, regulations, legal processes, or enforceable governmental requests"
        ] }),
        /* @__PURE__ */ jsxs(Dot, { children: [
          /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Business Operations:" }),
          " To maintain records for accounting, auditing, and business continuity purposes"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "section-3", className: "mb-16 scroll-mt-24", children: [
      /* @__PURE__ */ jsx(H2, { id: "section-3", children: "3. Information Sharing and Disclosure" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(H3, { children: "3.1 Service Providers" }),
          /* @__PURE__ */ jsxs("ul", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxs(Dot, { children: [
              /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Stripe, Inc.:" }),
              " We use Stripe to process payments. Your payment information is transmitted directly to Stripe and is subject to",
              " ",
              /* @__PURE__ */ jsx("a", { href: "https://stripe.com/privacy", target: "_blank", rel: "noopener", className: "text-blue-400 hover:text-blue-300 underline", children: "Stripe's Privacy Policy" }),
              ". We never store complete payment card information on our servers."
            ] }),
            /* @__PURE__ */ jsxs(Dot, { children: [
              /* @__PURE__ */ jsx("strong", { className: "text-white", children: "DigitalOcean, LLC:" }),
              " Your servers are hosted on DigitalOcean infrastructure. Server IP addresses and usage data may be processed by DigitalOcean in accordance with",
              " ",
              /* @__PURE__ */ jsx("a", { href: "https://www.digitalocean.com/legal/privacy-policy", target: "_blank", rel: "noopener", className: "text-blue-400 hover:text-blue-300 underline", children: "DigitalOcean's Privacy Policy" }),
              "."
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(H3, { children: "3.2 Legal Requirements" }),
          /* @__PURE__ */ jsx(Body, { children: "We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court order, subpoena, or government investigation)." })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(H3, { children: "3.3 Business Transfers" }),
          /* @__PURE__ */ jsx(Body, { children: "In the event of a merger, acquisition, reorganization, bankruptcy, or sale of assets, your information may be transferred as part of that transaction. You will be notified via email and/or prominent notice on our website of any such change in ownership or control." })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(H3, { children: "3.4 Protection of Rights" }),
          /* @__PURE__ */ jsx(Body, { children: "We may disclose information when we believe in good faith that disclosure is necessary to protect our rights, protect your safety or the safety of others, investigate fraud, or respond to a legal request." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "section-4", className: "mb-16 scroll-mt-24", children: [
      /* @__PURE__ */ jsx(H2, { id: "section-4", children: "4. Data Security" }),
      /* @__PURE__ */ jsx("div", { className: "bg-gray-900 rounded-lg p-6 border border-gray-800 mb-6", children: /* @__PURE__ */ jsxs("ul", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs(Dot, { children: [
          /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Encryption:" }),
          " All passwords are hashed using bcrypt with a salt factor of 10, making them irreversible and secure against brute-force attacks"
        ] }),
        /* @__PURE__ */ jsxs(Dot, { children: [
          /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Secure Transmission:" }),
          " We use HTTPS/TLS encryption to protect all data transmitted between your browser and our servers"
        ] }),
        /* @__PURE__ */ jsxs(Dot, { children: [
          /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Session Security:" }),
          " Session cookies are HTTP-only to prevent client-side script access and are configured with secure flags in production"
        ] }),
        /* @__PURE__ */ jsxs(Dot, { children: [
          /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Payment Security:" }),
          " All payment processing is handled by Stripe, a PCI-DSS Level 1 certified service provider. We never store complete payment card information"
        ] }),
        /* @__PURE__ */ jsxs(Dot, { children: [
          /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Database Security:" }),
          " User data is stored in a secured PostgreSQL database with restricted access and regular backups"
        ] }),
        /* @__PURE__ */ jsxs(Dot, { children: [
          /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Access Controls:" }),
          " Administrative access to user data is restricted to authorized personnel only"
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(Body, { children: "However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security." })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "section-5", className: "mb-16 scroll-mt-24", children: [
      /* @__PURE__ */ jsx(H2, { id: "section-5", children: "5. Your Rights and Choices" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(H3, { children: "5.1 Access and Portability" }),
          /* @__PURE__ */ jsx(Body, { children: "You have the right to request access to the personal information we hold about you and to receive that information in a portable format." })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(H3, { children: "5.2 Correction" }),
          /* @__PURE__ */ jsx(Body, { children: "You have the right to request correction of inaccurate or incomplete personal information." })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(H3, { children: "5.3 Deletion" }),
          /* @__PURE__ */ jsx(Body, { children: "You have the right to request deletion of your personal information, subject to certain legal exceptions (e.g., completion of transactions, legal compliance, fraud prevention)." })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(H3, { children: "5.4 Objection and Restriction" }),
          /* @__PURE__ */ jsx(Body, { children: "You have the right to object to or request restriction of certain processing of your personal information." })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(H3, { children: "5.5 Withdrawal of Consent" }),
          /* @__PURE__ */ jsx(Body, { children: "Where processing is based on consent, you have the right to withdraw that consent at any time." })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "bg-blue-950/30 border-l-4 border-blue-500 rounded-r-lg p-6 mt-8", children: /* @__PURE__ */ jsxs("p", { className: "text-gray-300 leading-relaxed", children: [
        "To exercise any of these rights, please contact us through our",
        " ",
        /* @__PURE__ */ jsx("a", { href: "/contact", className: "text-blue-400 hover:text-blue-300 underline", children: "contact form" }),
        ". We will respond to your request within 30 days."
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "section-6", className: "mb-16 scroll-mt-24", children: [
      /* @__PURE__ */ jsx(H2, { id: "section-6", children: "6. Data Retention" }),
      /* @__PURE__ */ jsx(Body, { children: "We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. Account information is retained until you request deletion. Transaction records may be retained for accounting and legal compliance purposes for up to 7 years." })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "section-7", className: "mb-16 scroll-mt-24", children: [
      /* @__PURE__ */ jsx(H2, { id: "section-7", children: "7. Cookies and Tracking Technologies" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(H3, { children: "7.1 Essential Cookies" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-300 leading-relaxed mb-4", children: "We use session cookies that are essential for the operation of our website. These cookies:" }),
          /* @__PURE__ */ jsxs("ul", { className: "space-y-3", children: [
            /* @__PURE__ */ jsx(Dot, { children: "Maintain your login state across pages" }),
            /* @__PURE__ */ jsx(Dot, { children: "Provide CSRF protection for form submissions" }),
            /* @__PURE__ */ jsx(Dot, { children: "Enable secure authentication" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-300 leading-relaxed mt-4", children: "These cookies are strictly necessary for the website to function and cannot be disabled without affecting core functionality." })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(H3, { children: "7.2 Cookie Management" }),
          /* @__PURE__ */ jsx(Body, { children: "You can configure your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "section-8", className: "mb-16 scroll-mt-24", children: [
      /* @__PURE__ */ jsx(H2, { id: "section-8", children: "8. Third-Party Links" }),
      /* @__PURE__ */ jsx(Body, { children: "Our website may contain links to third-party websites or services that are not owned or controlled by Clouded Basement Hosting. We are not responsible for the privacy practices of these third parties. We encourage you to review the privacy policies of every website you visit." })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "section-9", className: "mb-16 scroll-mt-24", children: [
      /* @__PURE__ */ jsx(H2, { id: "section-9", children: "9. Children's Privacy" }),
      /* @__PURE__ */ jsx(Body, { children: "Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately, and we will take steps to delete such information." })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "section-10", className: "mb-16 scroll-mt-24", children: [
      /* @__PURE__ */ jsx(H2, { id: "section-10", children: "10. International Data Transfers" }),
      /* @__PURE__ */ jsx(Body, { children: "Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those of your country. By using our services, you consent to the transfer of your information to these countries." })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "section-11", className: "mb-16 scroll-mt-24", children: [
      /* @__PURE__ */ jsx(H2, { id: "section-11", children: "11. Changes to This Privacy Policy" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-300 leading-relaxed mb-4", children: "We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by:" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-3", children: [
        /* @__PURE__ */ jsx(Dot, { children: 'Posting the updated policy on this page with a new "Last Updated" date' }),
        /* @__PURE__ */ jsx(Dot, { children: "Sending an email notification to the address associated with your account (for material changes)" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-300 leading-relaxed mt-4", children: "Your continued use of our services after any changes indicates your acceptance of the updated policy." })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "section-12", className: "mb-16 scroll-mt-24", children: [
      /* @__PURE__ */ jsx(H2, { id: "section-12", children: "12. California Privacy Rights" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-300 leading-relaxed mb-4", children: "If you are a California resident, you have specific rights under the California Consumer Privacy Act (CCPA):" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-3", children: [
        /* @__PURE__ */ jsx(Dot, { children: "Right to know what personal information is collected, used, shared, or sold" }),
        /* @__PURE__ */ jsx(Dot, { children: "Right to delete personal information held by businesses" }),
        /* @__PURE__ */ jsx(Dot, { children: "Right to opt-out of sale of personal information (note: we do not sell personal information)" }),
        /* @__PURE__ */ jsx(Dot, { children: "Right to non-discrimination for exercising your CCPA rights" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "section-13", className: "mb-16 scroll-mt-24", children: [
      /* @__PURE__ */ jsx(H2, { id: "section-13", children: "13. European Privacy Rights" }),
      /* @__PURE__ */ jsx(Body, { children: "If you are located in the European Economic Area (EEA), you have rights under the General Data Protection Regulation (GDPR), including the right to lodge a complaint with a supervisory authority if you believe our processing of your personal information violates applicable law." })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "section-14", className: "mb-16 scroll-mt-24", children: [
      /* @__PURE__ */ jsx(H2, { id: "section-14", children: "14. Contact Information" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-300 leading-relaxed mb-4", children: "If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs(Dot, { children: [
          /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Email:" }),
          " Via our",
          " ",
          /* @__PURE__ */ jsx("a", { href: "/contact", className: "text-blue-400 hover:text-blue-300 underline", children: "contact form" })
        ] }),
        /* @__PURE__ */ jsxs(Dot, { children: [
          /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Response Time:" }),
          " We aim to respond to all inquiries within 48 hours"
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-12 pt-8 border-t border-gray-800 text-gray-500 text-sm", children: "By using Clouded Basement Hosting services, you acknowledge that you have read and understood this Privacy Policy and agree to its terms." })
    ] })
  ] });
}
export {
  Privacy as default
};
