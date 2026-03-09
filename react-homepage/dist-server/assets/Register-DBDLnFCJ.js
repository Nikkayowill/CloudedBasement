import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { R as ResponsiveNav, F as Footer } from "../entry-server.js";
import "react-dom/server";
import "lucide-react";
function GoogleIcon() {
  return /* @__PURE__ */ jsxs("svg", { className: "w-5 h-5", viewBox: "0 0 24 24", children: [
    /* @__PURE__ */ jsx("path", { fill: "#4285F4", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }),
    /* @__PURE__ */ jsx("path", { fill: "#34A853", d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" }),
    /* @__PURE__ */ jsx("path", { fill: "#FBBC05", d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" }),
    /* @__PURE__ */ jsx("path", { fill: "#EA4335", d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" })
  ] });
}
function Register() {
  const [searchParams] = useSearchParams();
  const [csrf, setCsrf] = useState("");
  const [botCode, setBotCode] = useState("");
  const [botInput, setBotInput] = useState("");
  const error = searchParams.get("error") || "";
  const success = searchParams.get("success") || "";
  const email = searchParams.get("email") || "";
  const botCorrect = botInput.length > 0 && botInput === botCode;
  const submitReady = csrf && botCorrect;
  useEffect(() => {
    fetch("/api/csrf-token", { credentials: "include" }).then((r) => r.json()).then((d) => setCsrf(d.csrfToken)).catch(() => {
    });
    fetch("/api/auth/bot-challenge", { credentials: "include" }).then((r) => r.json()).then((d) => setBotCode(d.botCode)).catch(() => {
    });
  }, []);
  const inputClass = "w-full px-4 py-2.5 bg-black/40 border border-blue-500/30 rounded text-white placeholder-gray-500 focus:border-blue-500 focus:bg-black/60 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all";
  const botInputClass = `w-full px-4 py-2.5 bg-black/40 border rounded text-white text-center font-mono text-lg tracking-[0.3em] uppercase placeholder-gray-500 focus:outline-none focus:ring-1 transition-all ${botInput.length === 0 ? "border-red-500/50" : botCorrect ? "border-green-500/50 focus:ring-green-500/50" : "border-red-500/50"}`;
  return /* @__PURE__ */ jsxs("div", { className: "funnel", children: [
    /* @__PURE__ */ jsx(ResponsiveNav, {}),
    /* @__PURE__ */ jsx("main", { className: "pt-14", children: /* @__PURE__ */ jsx("section", { className: "funnel-section funnel-bg-solution", children: /* @__PURE__ */ jsx("div", { className: "funnel-prose", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md mx-auto w-full", children: [
      /* @__PURE__ */ jsx("h1", { className: "funnel-heading-1 text-center mb-8", children: "Create Account" }),
      error && /* @__PURE__ */ jsxs("div", { className: "bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-2.5 rounded mb-5 text-sm flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 shrink-0", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }),
        error
      ] }),
      success && /* @__PURE__ */ jsxs("div", { className: "bg-green-500/10 border border-green-500/30 text-green-300 px-4 py-2.5 rounded mb-5 text-sm flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 shrink-0", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }),
        success
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "funnel-card-featured p-8", children: [
        /* @__PURE__ */ jsxs("form", { method: "POST", action: "/register", className: "space-y-5", children: [
          /* @__PURE__ */ jsx("input", { type: "hidden", name: "_csrf", value: csrf }),
          /* @__PURE__ */ jsx("input", { type: "hidden", name: "fingerprint", value: "" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "reg-email", className: "block funnel-body-sm font-medium mb-1.5", style: { color: "#d1d5db" }, children: "Email" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                id: "reg-email",
                type: "email",
                name: "email",
                required: true,
                defaultValue: email,
                className: inputClass
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "reg-password", className: "block funnel-body-sm font-medium mb-1.5", style: { color: "#d1d5db" }, children: "Password" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                id: "reg-password",
                type: "password",
                name: "password",
                minLength: 8,
                required: true,
                className: inputClass
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "reg-confirm", className: "block funnel-body-sm font-medium mb-1.5", style: { color: "#d1d5db" }, children: "Confirm Password" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                id: "reg-confirm",
                type: "password",
                name: "confirmPassword",
                minLength: 8,
                required: true,
                className: inputClass
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "block funnel-body-sm font-medium mb-1.5", style: { color: "#d1d5db" }, children: "Verify you're human" }),
            /* @__PURE__ */ jsx("p", { className: "funnel-body-sm mb-2", style: { color: "#9ca3af" }, children: "Type this code exactly as shown" }),
            /* @__PURE__ */ jsx("div", { className: "bg-black/60 border border-blue-500/40 rounded px-4 py-3 mb-2 text-center", children: /* @__PURE__ */ jsx("span", { className: "text-2xl font-mono font-bold text-blue-400 tracking-[0.3em]", children: botCode || "······" }) }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                name: "botCode",
                value: botInput,
                onChange: (e) => setBotInput(e.target.value.toUpperCase()),
                required: true,
                maxLength: 6,
                placeholder: "TYPE CODE HERE",
                className: botInputClass
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2.5", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                id: "acceptTerms",
                name: "acceptTerms",
                required: true,
                className: "mt-0.5 w-4 h-4 cursor-pointer accent-blue-500"
              }
            ),
            /* @__PURE__ */ jsxs("label", { htmlFor: "acceptTerms", className: "funnel-body-sm cursor-pointer", style: { color: "#9ca3af" }, children: [
              "I agree to the",
              " ",
              /* @__PURE__ */ jsx("a", { href: "/terms", target: "_blank", rel: "noopener noreferrer", className: "text-blue-400 hover:text-blue-300 underline", children: "Terms of Service" })
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: !submitReady,
              className: "funnel-btn funnel-btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed",
              children: "Register"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center my-5", children: [
          /* @__PURE__ */ jsx("div", { className: "flex-1 border-t border-blue-500/20" }),
          /* @__PURE__ */ jsx("span", { className: "px-4 funnel-body-sm", style: { color: "#6b7280" }, children: "or" }),
          /* @__PURE__ */ jsx("div", { className: "flex-1 border-t border-blue-500/20" })
        ] }),
        /* @__PURE__ */ jsxs(
          "a",
          {
            href: "/auth/google",
            className: "w-full flex items-center justify-center gap-3 py-2.5 bg-white text-gray-800 font-medium rounded hover:bg-gray-100 transition-all",
            children: [
              /* @__PURE__ */ jsx(GoogleIcon, {}),
              "Sign up with Google"
            ]
          }
        ),
        /* @__PURE__ */ jsxs("p", { className: "text-center funnel-body-sm mt-5", style: { color: "#9ca3af" }, children: [
          "Already have an account?",
          " ",
          /* @__PURE__ */ jsx("a", { href: "/login", className: "text-blue-400 hover:text-blue-300 font-medium", children: "Login" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-5 pt-5 border-t border-blue-500/20 text-center", children: /* @__PURE__ */ jsxs("p", { className: "funnel-body-sm", style: { color: "#6b7280" }, children: [
          "By registering, you agree to our",
          " ",
          /* @__PURE__ */ jsx("a", { href: "/terms", className: "text-blue-400 hover:text-blue-300 underline", children: "Terms" }),
          " ",
          "and",
          " ",
          /* @__PURE__ */ jsx("a", { href: "/privacy", className: "text-blue-400 hover:text-blue-300 underline", children: "Privacy Policy" })
        ] }) })
      ] })
    ] }) }) }) }),
    /* @__PURE__ */ jsx(Footer, {})
  ] });
}
export {
  Register as default
};
