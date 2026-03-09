import { jsxs, jsx } from "react/jsx-runtime";
import { D as DocLayout } from "./DocLayout-Bc_hCDwe.js";
import "react";
import "../entry-server.js";
import "react-dom/server";
import "react-router-dom";
import "lucide-react";
const TOC = [
  { id: "section-1", label: "1. Acceptance of Terms" },
  { id: "section-2", label: "2. Service Description" },
  { id: "section-3", label: "3. Account Registration & Security" },
  { id: "section-4", label: "4. Payment Terms" },
  { id: "section-5", label: "5. Refund Policy" },
  { id: "section-6", label: "6. Acceptable Use & Resource Limits" },
  { id: "section-7", label: "7. Intellectual Property" },
  { id: "section-8", label: "8. Data Privacy & Security" },
  { id: "section-9", label: "9. Service Level and Uptime" },
  { id: "section-10", label: "10. Limitation of Liability" },
  { id: "section-11", label: "11. Indemnification" },
  { id: "section-12", label: "12. Termination" },
  { id: "section-13", label: "13. Modifications to Terms" },
  { id: "section-14", label: "14. Governing Law and Jurisdiction" },
  { id: "section-15", label: "15. Dispute Resolution" },
  { id: "section-16", label: "16. Severability" },
  { id: "section-17", label: "17. Entire Agreement" },
  { id: "section-18", label: "18. Contact Information" }
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
function Terms() {
  return /* @__PURE__ */ jsxs(DocLayout, { toc: TOC, children: [
    /* @__PURE__ */ jsxs("header", { className: "mb-12", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4", children: "Terms of Service" }),
      /* @__PURE__ */ jsx("p", { className: "text-base lg:text-lg text-gray-400 leading-relaxed", children: "Last Updated: January 26, 2026" }),
      /* @__PURE__ */ jsxs("p", { className: "text-gray-400 leading-relaxed mt-4", children: [
        "Welcome to ",
        /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Clouded Basement Hosting" }),
        ' ("we," "us," "our," or "the Company"). These Terms of Service ("Terms") govern your access to and use of our cloud hosting services, including virtual private servers (VPS), domain management, and related services (collectively, the "Services"). By creating an account or using our Services, you agree to be bound by these Terms.'
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "section-1", className: "mb-16 scroll-mt-24", children: [
      /* @__PURE__ */ jsx(H2, { id: "section-1", children: "1. Acceptance of Terms" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-300 leading-relaxed mb-4", children: "By accessing or using our Services, you represent that you:" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-3", children: [
        /* @__PURE__ */ jsx(Dot, { children: "Are at least 18 years of age or the age of majority in your jurisdiction" }),
        /* @__PURE__ */ jsx(Dot, { children: "Have the legal capacity to enter into a binding contract" }),
        /* @__PURE__ */ jsx(Dot, { children: "Agree to comply with all applicable laws and regulations" }),
        /* @__PURE__ */ jsx(Dot, { children: "Have read, understood, and accepted these Terms in their entirety" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-300 leading-relaxed mt-4", children: "If you do not agree to these Terms, you must not use our Services." })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "section-2", className: "mb-16 scroll-mt-24", children: [
      /* @__PURE__ */ jsx(H2, { id: "section-2", children: "2. Service Description" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-300 leading-relaxed mb-4", children: "Clouded Basement Hosting provides cloud infrastructure services including:" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs(Dot, { children: [
          /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Virtual Private Servers (VPS):" }),
          " Ubuntu 22.04 server instances with full SSH root access"
        ] }),
        /* @__PURE__ */ jsxs(Dot, { children: [
          /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Custom Domain Support:" }),
          " Point your domains to your server IP with DNS configuration guidance"
        ] }),
        /* @__PURE__ */ jsxs(Dot, { children: [
          /* @__PURE__ */ jsx("strong", { className: "text-white", children: "SSL Certificates:" }),
          " One-click Let's Encrypt SSL installation for HTTPS"
        ] }),
        /* @__PURE__ */ jsxs(Dot, { children: [
          /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Git Deployment:" }),
          " Automated code deployment from GitHub, GitLab, or Bitbucket repositories"
        ] }),
        /* @__PURE__ */ jsxs(Dot, { children: [
          /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Support Services:" }),
          " Technical assistance via ticketing system"
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-300 leading-relaxed mt-4", children: "Services are provided on a subscription basis with monthly billing cycles. We reserve the right to modify, suspend, or discontinue any aspect of the Services at any time with reasonable notice." })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "section-3", className: "mb-16 scroll-mt-24", children: [
      /* @__PURE__ */ jsx(H2, { id: "section-3", children: "3. Account Registration and Security" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(H3, { children: "3.1 Account Creation" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-300 leading-relaxed mb-4", children: "To use our Services, you must create an account by providing accurate, current, and complete information. You agree to:" }),
          /* @__PURE__ */ jsxs("ul", { className: "space-y-3", children: [
            /* @__PURE__ */ jsx(Dot, { children: "Provide a valid email address for account verification" }),
            /* @__PURE__ */ jsx(Dot, { children: "Create a secure password (minimum 8 characters)" }),
            /* @__PURE__ */ jsx(Dot, { children: "Keep your account information up to date" }),
            /* @__PURE__ */ jsx(Dot, { children: "Accept these Terms of Service during registration" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(H3, { children: "3.2 Account Security" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-300 leading-relaxed mb-4", children: "You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to:" }),
          /* @__PURE__ */ jsxs("ul", { className: "space-y-3", children: [
            /* @__PURE__ */ jsx(Dot, { children: "Immediately notify us of any unauthorized use of your account" }),
            /* @__PURE__ */ jsx(Dot, { children: "Not share your account credentials with any third party" }),
            /* @__PURE__ */ jsx(Dot, { children: "Use strong, unique passwords and enable two-factor authentication when available" }),
            /* @__PURE__ */ jsx(Dot, { children: "Log out of your account at the end of each session when using shared devices" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-300 leading-relaxed mt-4", children: "We are not liable for any loss or damage arising from your failure to protect your account credentials." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "section-4", className: "mb-16 scroll-mt-24", children: [
      /* @__PURE__ */ jsx(H2, { id: "section-4", children: "4. Payment Terms" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(H3, { children: "4.1 Pricing and Billing" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-300 leading-relaxed mb-4", children: "Our Services are offered on a subscription basis with the following terms:" }),
          /* @__PURE__ */ jsxs("ul", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxs(Dot, { children: [
              /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Billing Cycle:" }),
              " Monthly recurring charges"
            ] }),
            /* @__PURE__ */ jsxs(Dot, { children: [
              /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Payment Methods:" }),
              " Credit card, debit card, and other methods accepted through Stripe"
            ] }),
            /* @__PURE__ */ jsxs(Dot, { children: [
              /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Currency:" }),
              " All prices are in Canadian Dollars (CAD) unless otherwise stated"
            ] }),
            /* @__PURE__ */ jsxs(Dot, { children: [
              /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Automatic Renewal:" }),
              " Subscriptions automatically renew at the end of each billing period"
            ] }),
            /* @__PURE__ */ jsxs(Dot, { children: [
              /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Price Changes:" }),
              " We reserve the right to modify pricing with 30 days' advance notice"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(H3, { children: "4.2 Free Trial" }),
          /* @__PURE__ */ jsxs("p", { className: "text-gray-300 leading-relaxed mb-4", children: [
            "New users may be eligible for a ",
            /* @__PURE__ */ jsx("strong", { className: "text-white", children: "3-day free trial" }),
            " of our Basic plan:"
          ] }),
          /* @__PURE__ */ jsxs("ul", { className: "space-y-3", children: [
            /* @__PURE__ */ jsx(Dot, { children: "Trial includes a fully functional server with all Basic plan features" }),
            /* @__PURE__ */ jsx(Dot, { children: "No credit card required to start the trial" }),
            /* @__PURE__ */ jsx(Dot, { children: "One free trial per user (determined by email address)" }),
            /* @__PURE__ */ jsx(Dot, { children: "At the end of 3 days, your server will be suspended unless you subscribe" }),
            /* @__PURE__ */ jsx(Dot, { children: "You can upgrade to a paid plan at any time during the trial" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(H3, { children: "4.3 Payment Processing" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-300 leading-relaxed mb-4", children: "All payments are processed securely through Stripe, Inc. By providing payment information, you:" }),
          /* @__PURE__ */ jsxs("ul", { className: "space-y-3", children: [
            /* @__PURE__ */ jsx(Dot, { children: "Authorize us to charge your payment method for all fees incurred" }),
            /* @__PURE__ */ jsx(Dot, { children: "Agree to Stripe's terms of service and privacy policy" }),
            /* @__PURE__ */ jsx(Dot, { children: "Represent that you have the legal right to use the payment method provided" }),
            /* @__PURE__ */ jsx(Dot, { children: "Understand that we do not store your complete payment card information" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(H3, { children: "4.4 Taxes" }),
          /* @__PURE__ */ jsx(Body, { children: "Prices do not include applicable taxes, duties, or fees. You are responsible for paying all taxes associated with your use of the Services, including but not limited to sales tax, GST/HST, and VAT as required by your jurisdiction." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "section-5", className: "mb-16 scroll-mt-24", children: [
      /* @__PURE__ */ jsx(H2, { id: "section-5", children: "5. Refund Policy" }),
      /* @__PURE__ */ jsxs("p", { className: "text-gray-300 leading-relaxed mb-4", children: [
        "All sales are final. Subscriptions are ",
        /* @__PURE__ */ jsx("strong", { className: "text-white", children: "non-refundable" }),
        " except in the following circumstances:"
      ] }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs(Dot, { children: [
          /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Service Failure:" }),
          " If we are unable to provision your server within 24 hours of payment, you will receive a full automatic refund"
        ] }),
        /* @__PURE__ */ jsxs(Dot, { children: [
          /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Billing Errors:" }),
          " Duplicate charges or billing mistakes will be refunded promptly"
        ] }),
        /* @__PURE__ */ jsxs(Dot, { children: [
          /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Extraordinary Circumstances:" }),
          " Refunds may be issued at our sole discretion for exceptional situations"
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-300 leading-relaxed mt-4", children: "You may cancel your subscription at any time via support ticket. Your service will remain active until the end of your current billing period, but no refund will be issued for unused time." })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "section-6", className: "mb-16 scroll-mt-24", children: [
      /* @__PURE__ */ jsx(H2, { id: "section-6", children: "6. Acceptable Use & Resource Limits" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(H3, { children: "6.1 Prohibited Activities" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-300 leading-relaxed mb-4", children: "You agree to use our Services only for lawful purposes and in compliance with these Terms. Prohibited activities include but are not limited to:" }),
          /* @__PURE__ */ jsx("div", { className: "bg-gray-900 rounded-lg p-6 border border-gray-800", children: /* @__PURE__ */ jsxs("ul", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxs(Dot, { children: [
              /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Illegal Activities:" }),
              " Hosting, distributing, or linking to illegal content or engaging in criminal activity"
            ] }),
            /* @__PURE__ */ jsxs(Dot, { children: [
              /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Malicious Software:" }),
              " Distributing viruses, malware, ransomware, or other harmful code"
            ] }),
            /* @__PURE__ */ jsxs(Dot, { children: [
              /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Spam and Abuse:" }),
              " Sending unsolicited bulk email, phishing attempts, or fraudulent communications"
            ] }),
            /* @__PURE__ */ jsxs(Dot, { children: [
              /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Network Attacks:" }),
              " Port scanning, DDoS attacks, or attempts to compromise other systems"
            ] }),
            /* @__PURE__ */ jsxs(Dot, { children: [
              /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Resource Abuse:" }),
              " Excessive CPU usage (including cryptocurrency mining), bandwidth abuse, or activities that degrade service performance for other users"
            ] }),
            /* @__PURE__ */ jsxs(Dot, { children: [
              /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Intellectual Property Infringement:" }),
              " Hosting pirated software, copyrighted content without authorization, or counterfeit materials"
            ] }),
            /* @__PURE__ */ jsxs(Dot, { children: [
              /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Illegal Adult Content:" }),
              " Child sexual abuse material (CSAM), revenge porn, or other illegal pornographic content"
            ] }),
            /* @__PURE__ */ jsxs(Dot, { children: [
              /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Harassment:" }),
              " Using Services to harass, threaten, stalk, or defame individuals or organizations"
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(H3, { children: "6.2 Resource Limits" }),
          /* @__PURE__ */ jsx(Body, { children: "Each plan includes a dedicated virtual private server with defined resource limits (CPU, memory, storage, bandwidth). Customers are responsible for activity occurring on their server, including usage via SSH or deployed applications." })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(H3, { children: "6.3 Enforcement & Safeguards" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-300 leading-relaxed mb-4", children: "Usage that intentionally or unintentionally exceeds plan limits, violates provider policies, or risks unexpected infrastructure costs may be limited, paused, or suspended at our discretion. When possible, we will attempt to notify customers before taking action." }),
          /* @__PURE__ */ jsx(Body, { children: "We reserve the right to enforce reasonable safeguards to ensure platform stability, cost predictability, and continued service availability." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "section-7", className: "mb-16 scroll-mt-24", children: [
      /* @__PURE__ */ jsx(H2, { id: "section-7", children: "7. Intellectual Property" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(H3, { children: "7.1 Our Intellectual Property" }),
          /* @__PURE__ */ jsx(Body, { children: "The Clouded Basement Hosting brand, including our name, logo, website design, and trademarks, are owned by the Company and protected by copyright and trademark laws. You may not use our branding without written permission." })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(H3, { children: "7.2 Source Code Availability" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-300 leading-relaxed mb-4", children: "The source code for this platform is publicly viewable for educational and transparency purposes. However:" }),
          /* @__PURE__ */ jsxs("ul", { className: "space-y-3", children: [
            /* @__PURE__ */ jsx(Dot, { children: "Viewing and studying the code for learning purposes is permitted" }),
            /* @__PURE__ */ jsx(Dot, { children: 'The "Clouded Basement Hosting" brand name, logo, and associated trademarks remain proprietary' }),
            /* @__PURE__ */ jsx(Dot, { children: "Deploying a competing commercial service using this codebase requires explicit written permission" }),
            /* @__PURE__ */ jsx(Dot, { children: "Contributions to the project may be accepted via GitHub pull requests" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(H3, { children: "7.3 User Content" }),
          /* @__PURE__ */ jsx(Body, { children: "You retain full ownership of all content, data, and applications you deploy on our Services. By using our Services, you grant us a limited license to host, store, and transmit your content solely for the purpose of providing the Services to you." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "section-8", className: "mb-16 scroll-mt-24", children: [
      /* @__PURE__ */ jsx(H2, { id: "section-8", children: "8. Data Privacy and Security" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(H3, { children: "8.1 Data Collection" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-300 leading-relaxed mb-4", children: "We collect and process personal information as described in our Privacy Policy, including:" }),
          /* @__PURE__ */ jsxs("ul", { className: "space-y-3", children: [
            /* @__PURE__ */ jsx(Dot, { children: "Account information (email address, password hash)" }),
            /* @__PURE__ */ jsx(Dot, { children: "Payment information (processed securely through Stripe)" }),
            /* @__PURE__ */ jsx(Dot, { children: "Server deployment details and usage logs" }),
            /* @__PURE__ */ jsx(Dot, { children: "Support ticket communications" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(H3, { children: "8.2 Data Security" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-300 leading-relaxed mb-4", children: "We implement industry-standard security measures to protect your data, including:" }),
          /* @__PURE__ */ jsxs("ul", { className: "space-y-3", children: [
            /* @__PURE__ */ jsx(Dot, { children: "HTTPS encryption for all web traffic" }),
            /* @__PURE__ */ jsx(Dot, { children: "Secure session management with CSRF protection" }),
            /* @__PURE__ */ jsx(Dot, { children: "Encrypted password storage using bcrypt" }),
            /* @__PURE__ */ jsx(Dot, { children: "Regular security audits and updates" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(H3, { children: "8.3 Data Retention" }),
          /* @__PURE__ */ jsx(Body, { children: "We retain your account data for the duration of your active subscription and for a reasonable period thereafter as required by law or for legitimate business purposes. You may request data deletion by contacting support." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "section-9", className: "mb-16 scroll-mt-24", children: [
      /* @__PURE__ */ jsx(H2, { id: "section-9", children: "9. Service Level and Uptime" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-300 leading-relaxed mb-4", children: 'While we strive to provide reliable service, we do not guarantee uninterrupted availability. Our Services are provided on an "as-is" and "as-available" basis. We do not warrant that:' }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-3", children: [
        /* @__PURE__ */ jsx(Dot, { children: "Services will be available 100% of the time without interruption" }),
        /* @__PURE__ */ jsx(Dot, { children: "Services will be error-free or meet your specific requirements" }),
        /* @__PURE__ */ jsx(Dot, { children: "Data transmission will be secure or free from interception" }),
        /* @__PURE__ */ jsx(Dot, { children: "Servers will be immune from attacks, hardware failures, or network issues" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-300 leading-relaxed mt-4", children: "Scheduled maintenance will be announced in advance when possible. We are not liable for downtime, data loss, or service interruptions." })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "section-10", className: "mb-16 scroll-mt-24", children: [
      /* @__PURE__ */ jsx(H2, { id: "section-10", children: "10. Limitation of Liability" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-300 leading-relaxed mb-4", children: "To the maximum extent permitted by law:" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-3", children: [
        /* @__PURE__ */ jsx(Dot, { children: "We are not liable for any indirect, incidental, special, consequential, or punitive damages" }),
        /* @__PURE__ */ jsx(Dot, { children: "Our total liability to you shall not exceed the amount you paid us in the 12 months preceding the claim" }),
        /* @__PURE__ */ jsx(Dot, { children: "We are not responsible for losses resulting from unauthorized access to your account" }),
        /* @__PURE__ */ jsx(Dot, { children: "We are not liable for third-party services, content, or links provided through our platform" }),
        /* @__PURE__ */ jsx(Dot, { children: "We do not guarantee backup or recovery of your data — regular backups are your responsibility" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "section-11", className: "mb-16 scroll-mt-24", children: [
      /* @__PURE__ */ jsx(H2, { id: "section-11", children: "11. Indemnification" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-300 leading-relaxed mb-4", children: "You agree to indemnify, defend, and hold harmless the Company, its officers, directors, employees, and agents from any claims, losses, damages, liabilities, and expenses (including legal fees) arising from:" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-3", children: [
        /* @__PURE__ */ jsx(Dot, { children: "Your use of the Services" }),
        /* @__PURE__ */ jsx(Dot, { children: "Your violation of these Terms" }),
        /* @__PURE__ */ jsx(Dot, { children: "Your violation of any third-party rights, including intellectual property rights" }),
        /* @__PURE__ */ jsx(Dot, { children: "Content or applications you deploy on our infrastructure" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "section-12", className: "mb-16 scroll-mt-24", children: [
      /* @__PURE__ */ jsx(H2, { id: "section-12", children: "12. Termination" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(H3, { children: "12.1 Termination by You" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-300 leading-relaxed mb-4", children: "You may cancel your subscription at any time through your account dashboard. Upon cancellation:" }),
          /* @__PURE__ */ jsxs("ul", { className: "space-y-3", children: [
            /* @__PURE__ */ jsx(Dot, { children: "You will continue to have access until the end of your current billing period" }),
            /* @__PURE__ */ jsx(Dot, { children: "No further charges will be made after the current period ends" }),
            /* @__PURE__ */ jsx(Dot, { children: "Your servers and data may be deleted after 30 days" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(H3, { children: "12.2 Termination by Us" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-300 leading-relaxed mb-4", children: "We reserve the right to suspend or terminate your account immediately without notice if:" }),
          /* @__PURE__ */ jsxs("ul", { className: "space-y-3", children: [
            /* @__PURE__ */ jsx(Dot, { children: "You violate these Terms or our Acceptable Use Policy" }),
            /* @__PURE__ */ jsx(Dot, { children: "Your account is used for fraudulent or illegal activities" }),
            /* @__PURE__ */ jsx(Dot, { children: "Payment fails and remains outstanding after 7 days" }),
            /* @__PURE__ */ jsx(Dot, { children: "You engage in abusive behavior toward our staff or other users" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-300 leading-relaxed mt-4", children: "Termination for cause does not entitle you to a refund. We may delete your data immediately upon termination for violations." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "section-13", className: "mb-16 scroll-mt-24", children: [
      /* @__PURE__ */ jsx(H2, { id: "section-13", children: "13. Modifications to Terms" }),
      /* @__PURE__ */ jsx(Body, { children: "We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting to our website. Continued use of the Services after changes constitutes acceptance of the modified Terms. Material changes will be communicated via email when possible." })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "section-14", className: "mb-16 scroll-mt-24", children: [
      /* @__PURE__ */ jsx(H2, { id: "section-14", children: "14. Governing Law and Jurisdiction" }),
      /* @__PURE__ */ jsxs("p", { className: "text-gray-300 leading-relaxed", children: [
        "These Terms are governed by the laws of the Province of Nova Scotia and the federal laws of Canada applicable therein, without regard to conflict of law principles. Any disputes arising from these Terms or your use of the Services shall be subject to the exclusive jurisdiction of the courts located in ",
        /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Halifax, Nova Scotia, Canada" }),
        "."
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "section-15", className: "mb-16 scroll-mt-24", children: [
      /* @__PURE__ */ jsx(H2, { id: "section-15", children: "15. Dispute Resolution" }),
      /* @__PURE__ */ jsx(Body, { children: "In the event of a dispute, you agree to first attempt to resolve the matter informally by contacting our support team. If the dispute cannot be resolved within 30 days, either party may pursue legal remedies in accordance with Section 14." })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "section-16", className: "mb-16 scroll-mt-24", children: [
      /* @__PURE__ */ jsx(H2, { id: "section-16", children: "16. Severability" }),
      /* @__PURE__ */ jsx(Body, { children: "If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable." })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "section-17", className: "mb-16 scroll-mt-24", children: [
      /* @__PURE__ */ jsx(H2, { id: "section-17", children: "17. Entire Agreement" }),
      /* @__PURE__ */ jsx(Body, { children: "These Terms, together with our Privacy Policy and any supplemental terms for specific Services, constitute the entire agreement between you and Clouded Basement Hosting regarding your use of the Services." })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "section-18", className: "mb-16 scroll-mt-24", children: [
      /* @__PURE__ */ jsx(H2, { id: "section-18", children: "18. Contact Information" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-300 leading-relaxed mb-4", children: "If you have questions about these Terms or need to contact us regarding your account, please reach out:" }),
      /* @__PURE__ */ jsxs("ul", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs(Dot, { children: [
          /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Email:" }),
          " ",
          /* @__PURE__ */ jsx("a", { href: "mailto:support@cloudedbasement.ca", className: "text-blue-400 hover:text-blue-300 underline", children: "support@cloudedbasement.ca" })
        ] }),
        /* @__PURE__ */ jsxs(Dot, { children: [
          /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Support Tickets:" }),
          " Available through your account dashboard"
        ] }),
        /* @__PURE__ */ jsxs(Dot, { children: [
          /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Company Name:" }),
          " Clouded Basement Hosting"
        ] }),
        /* @__PURE__ */ jsxs(Dot, { children: [
          /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Location:" }),
          " Halifax, Nova Scotia, Canada"
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-12 pt-8 border-t border-gray-800 text-gray-500 text-sm", children: "By creating an account or using our Services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service." })
    ] })
  ] });
}
export {
  Terms as default
};
