import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { P as PageLayout } from "./PageLayout-DGkWIC32.js";
import "../entry-server.js";
import "react-dom/server";
import "react-router-dom";
import "lucide-react";
function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }
  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");
    try {
      const tokenRes = await fetch("/api/csrf-token", { credentials: "include" });
      if (!tokenRes.ok) {
        setErrorMsg("Failed to fetch CSRF token. Please reload and try again.");
        setStatus("error");
        return;
      }
      const { csrfToken } = await tokenRes.json();
      const res = await fetch("/api/contact", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong. Please try again.");
        setStatus("error");
      } else {
        setStatus("success");
        setForm({ name: "", email: "", message: "" });
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }
  const inputClass = "w-full px-4 py-3 bg-black/40 border border-blue-500/30 rounded text-white placeholder-gray-500 focus:border-blue-500 focus:bg-black/60 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all";
  return /* @__PURE__ */ jsx(PageLayout, { children: /* @__PURE__ */ jsx("section", { className: "funnel-section funnel-bg-solution", children: /* @__PURE__ */ jsxs("div", { className: "funnel-prose", children: [
    /* @__PURE__ */ jsx("h1", { className: "funnel-heading-1 text-center mb-4", children: "Contact Us" }),
    /* @__PURE__ */ jsx("p", { className: "funnel-body text-center mb-12", children: "Get in touch with our team" }),
    status === "success" ? /* @__PURE__ */ jsxs("div", { className: "funnel-card-featured p-8 text-center", children: [
      /* @__PURE__ */ jsx("p", { className: "funnel-heading-3 mb-2", style: { color: "#4ade80" }, children: "Message sent!" }),
      /* @__PURE__ */ jsx("p", { className: "funnel-body", children: "Your message was successfully sent. We'll get back to you soon." }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setStatus("idle"),
          className: "mt-6 px-6 py-2 border border-gray-700 text-gray-300 rounded hover:bg-gray-800 transition text-sm",
          children: "Send another"
        }
      )
    ] }) : /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "funnel-card-featured p-8", children: [
      status === "error" && /* @__PURE__ */ jsx("div", { className: "mb-6 bg-red-950/30 border border-red-500/30 rounded p-4", children: /* @__PURE__ */ jsx("p", { className: "funnel-body-sm", style: { color: "#f87171" }, children: errorMsg }) }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "contact-name", className: "block funnel-body-sm font-medium mb-2", style: { color: "#d1d5db" }, children: "Name" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            id: "contact-name",
            type: "text",
            name: "name",
            required: true,
            value: form.name,
            onChange: handleChange,
            className: inputClass
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "contact-email", className: "block funnel-body-sm font-medium mb-2", style: { color: "#d1d5db" }, children: "Email" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            id: "contact-email",
            type: "email",
            name: "email",
            required: true,
            value: form.email,
            onChange: handleChange,
            className: inputClass
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "contact-message", className: "block funnel-body-sm font-medium mb-2", style: { color: "#d1d5db" }, children: "Message" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            id: "contact-message",
            name: "message",
            required: true,
            rows: 6,
            value: form.message,
            onChange: handleChange,
            className: `${inputClass} resize-y`
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: status === "submitting",
          className: "funnel-btn funnel-btn-primary w-full uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed",
          children: status === "submitting" ? "Sending…" : "Send Message"
        }
      )
    ] })
  ] }) }) });
}
export {
  Contact as default
};
