import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { P as PageLayout } from "./PageLayout-DGkWIC32.js";
import "../entry-server.js";
import "react-dom/server";
import "lucide-react";
function GoogleIcon() {
  return /* @__PURE__ */ jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx("path", { fill: "#4285F4", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }),
    /* @__PURE__ */ jsx("path", { fill: "#34A853", d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" }),
    /* @__PURE__ */ jsx("path", { fill: "#FBBC05", d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" }),
    /* @__PURE__ */ jsx("path", { fill: "#EA4335", d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" })
  ] });
}
const inputStyle = {
  width: "100%",
  padding: "0.625rem 0.875rem",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "0.375rem",
  color: "#f5f5f5",
  fontSize: "0.875rem",
  outline: "none",
  transition: "border-color 150ms",
  boxSizing: "border-box"
};
function Flash({ type, children }) {
  const styles = {
    success: { bg: "rgba(34,197,94,0.07)", border: "rgba(34,197,94,0.2)", color: "#86efac" },
    warning: { bg: "rgba(234,179,8,0.07)", border: "rgba(234,179,8,0.2)", color: "#fde047" },
    error: { bg: "rgba(239,68,68,0.07)", border: "rgba(239,68,68,0.2)", color: "#fca5a5" },
    info: { bg: "rgba(45,167,223,0.07)", border: "rgba(45,167,223,0.2)", color: "#7fd6ff" }
  };
  const s = styles[type] ?? styles.info;
  return /* @__PURE__ */ jsx("div", { style: {
    background: s.bg,
    border: `1px solid ${s.border}`,
    borderRadius: "0.375rem",
    padding: "0.625rem 0.875rem",
    marginBottom: "1rem",
    fontSize: "0.8125rem",
    color: s.color,
    lineHeight: 1.5
  }, children });
}
function Login() {
  const [searchParams] = useSearchParams();
  const [csrf, setCsrf] = useState("");
  const error = searchParams.get("error") || "";
  const success = searchParams.get("message") || searchParams.get("success") || "";
  const warning = searchParams.get("warning") || "";
  const email = searchParams.get("email") || "";
  const showResend = error && error.toLowerCase().includes("confirm your email") && email;
  useEffect(() => {
    fetch("/api/csrf-token", { credentials: "include" }).then((r) => r.json()).then((d) => setCsrf(d.csrfToken)).catch(() => {
    });
  }, []);
  return /* @__PURE__ */ jsxs(PageLayout, { children: [
    /* @__PURE__ */ jsxs("div", { className: "cb-title-row", children: [
      /* @__PURE__ */ jsx("p", { style: { fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2DA7DF", marginBottom: "0.5rem" }, children: "Welcome back" }),
      /* @__PURE__ */ jsx("h1", { style: { fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 700, color: "#f5f5f5", margin: 0 }, children: "Sign in to your account" })
    ] }),
    /* @__PURE__ */ jsx("div", { style: { padding: "clamp(2rem, 5vw, 3.5rem) var(--cb-content-pad)", display: "flex", justifyContent: "center" }, children: /* @__PURE__ */ jsxs("div", { style: { maxWidth: "26rem", width: "100%" }, children: [
      success && /* @__PURE__ */ jsx(Flash, { type: "success", children: success }),
      warning && /* @__PURE__ */ jsx(Flash, { type: "warning", children: warning }),
      error && /* @__PURE__ */ jsx(Flash, { type: "error", children: error }),
      showResend && /* @__PURE__ */ jsx(Flash, { type: "info", children: /* @__PURE__ */ jsx(
        "a",
        {
          href: `/resend-confirmation?email=${encodeURIComponent(email)}`,
          style: { color: "#7fd6ff", textDecoration: "underline" },
          children: "Resend confirmation email"
        }
      ) }),
      /* @__PURE__ */ jsxs("div", { style: {
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "0.5rem",
        overflow: "hidden"
      }, children: [
        /* @__PURE__ */ jsxs("form", { method: "POST", action: "/login", style: { padding: "1.75rem" }, children: [
          /* @__PURE__ */ jsx("input", { type: "hidden", name: "_csrf", value: csrf }),
          /* @__PURE__ */ jsxs("div", { style: { marginBottom: "1.125rem" }, children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "login-email", style: { display: "block", fontSize: "0.75rem", fontWeight: 500, color: "#9ca3af", marginBottom: "0.4rem" }, children: "Email" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                id: "login-email",
                type: "email",
                name: "email",
                required: true,
                defaultValue: email,
                style: inputStyle,
                onFocus: (e) => {
                  e.target.style.borderColor = "rgba(45,167,223,0.5)";
                },
                onBlur: (e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.1)";
                }
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { style: { marginBottom: "1.5rem" }, children: [
            /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.4rem" }, children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "login-password", style: { fontSize: "0.75rem", fontWeight: 500, color: "#9ca3af" }, children: "Password" }),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "/forgot-password",
                  style: { fontSize: "0.6875rem", color: "#2DA7DF", textDecoration: "none" },
                  onMouseEnter: (e) => {
                    e.target.style.color = "#7fd6ff";
                  },
                  onMouseLeave: (e) => {
                    e.target.style.color = "#2DA7DF";
                  },
                  children: "Forgot?"
                }
              )
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                id: "login-password",
                type: "password",
                name: "password",
                required: true,
                style: inputStyle,
                onFocus: (e) => {
                  e.target.style.borderColor = "rgba(45,167,223,0.5)";
                },
                onBlur: (e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.1)";
                }
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: !csrf,
              style: {
                width: "100%",
                padding: "0.625rem",
                background: csrf ? "#2DA7DF" : "rgba(45,167,223,0.3)",
                border: "none",
                borderRadius: "0.375rem",
                color: "#fff",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: csrf ? "pointer" : "not-allowed",
                transition: "background 150ms"
              },
              children: "Sign in"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", padding: "0 1.75rem", margin: "0 0 1.25rem" }, children: [
          /* @__PURE__ */ jsx("div", { style: { flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" } }),
          /* @__PURE__ */ jsx("span", { style: { padding: "0 0.875rem", fontSize: "0.6875rem", color: "#4b5563" }, children: "or" }),
          /* @__PURE__ */ jsx("div", { style: { flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" } })
        ] }),
        /* @__PURE__ */ jsx("div", { style: { padding: "0 1.75rem 1.75rem" }, children: /* @__PURE__ */ jsxs(
          "a",
          {
            href: "/auth/google",
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.625rem",
              padding: "0.6rem",
              background: "#fff",
              border: "none",
              borderRadius: "0.375rem",
              color: "#111",
              fontSize: "0.875rem",
              fontWeight: 500,
              textDecoration: "none",
              transition: "background 150ms"
            },
            onMouseEnter: (e) => {
              e.currentTarget.style.background = "#f3f4f6";
            },
            onMouseLeave: (e) => {
              e.currentTarget.style.background = "#fff";
            },
            children: [
              /* @__PURE__ */ jsx(GoogleIcon, {}),
              "Continue with Google"
            ]
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs("p", { style: { marginTop: "1.25rem", fontSize: "0.8125rem", color: "#6b7280", textAlign: "center" }, children: [
        "Don't have an account?",
        " ",
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "/register",
            style: { color: "#2DA7DF", textDecoration: "none", fontWeight: 500 },
            onMouseEnter: (e) => {
              e.target.style.color = "#7fd6ff";
            },
            onMouseLeave: (e) => {
              e.target.style.color = "#2DA7DF";
            },
            children: "Create one free"
          }
        )
      ] })
    ] }) })
  ] });
}
export {
  Login as default
};
