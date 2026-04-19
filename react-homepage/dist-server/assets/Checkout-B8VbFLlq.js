import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useRef, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { P as PageLayout } from "./PageLayout-DGkWIC32.js";
import "../entry-server.js";
import "react-dom/server";
import "lucide-react";
const PLAN_CONFIG = {
  basic: { name: "Basic", monthly: 15, yearly: 162, description: "Perfect for side projects", was: 25 },
  pro: { name: "Pro", monthly: 35, yearly: 378, description: "Best Value • For production apps", was: 60 },
  premium: { name: "Premium", monthly: 65, yearly: 702, description: "For serious projects", was: 90 }
};
function loadStripeScript() {
  return new Promise((resolve, reject) => {
    if (window.Stripe) {
      resolve();
      return;
    }
    const existing = document.querySelector('script[src="https://js.stripe.com/v3/"]');
    if (existing) {
      if (window.Stripe || existing.readyState === "complete") {
        resolve();
        return;
      }
      let settled = false;
      const cleanup = () => {
        existing.removeEventListener("load", onLoad);
        existing.removeEventListener("error", onError);
        clearInterval(pollId);
        clearTimeout(timeoutId);
      };
      const onLoad = () => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve();
      };
      const onError = () => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(new Error("Failed to load Stripe script"));
      };
      existing.addEventListener("load", onLoad, { once: true });
      existing.addEventListener("error", onError, { once: true });
      const pollId = setInterval(() => {
        if (window.Stripe) {
          onLoad();
        }
      }, 250);
      const timeoutId = setTimeout(() => {
        if (window.Stripe) {
          onLoad();
          return;
        }
        onError();
      }, 8e3);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Stripe script"));
    document.head.appendChild(script);
  });
}
function Checkout() {
  const [searchParams] = useSearchParams();
  const [csrfToken, setCsrfToken] = useState("");
  const [stripeKey, setStripeKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cardholderName, setCardholderName] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    cardNumber: "",
    cardExpiry: "",
    cardCvc: ""
  });
  const stripeRef = useRef(null);
  const cardNumberRef = useRef(null);
  const cardExpiryRef = useRef(null);
  const cardCvcRef = useRef(null);
  const cardNumberContainerRef = useRef(null);
  const cardExpiryContainerRef = useRef(null);
  const cardCvcContainerRef = useRef(null);
  const validatedPlan = useMemo(() => {
    const requested = searchParams.get("plan");
    return PLAN_CONFIG[requested] ? requested : "basic";
  }, [searchParams]);
  const interval = useMemo(() => {
    const requested = searchParams.get("interval");
    return requested === "yearly" ? "yearly" : "monthly";
  }, [searchParams]);
  const plan = PLAN_CONFIG[validatedPlan];
  const displayPrice = interval === "yearly" ? plan.yearly : plan.monthly;
  const intervalLabel = interval === "yearly" ? "Yearly Billing" : "Monthly Billing";
  const intervalShort = interval === "yearly" ? "/year" : "/month";
  const displayedError = fieldErrors.cardNumber || fieldErrors.cardExpiry || fieldErrors.cardCvc || error;
  useEffect(() => {
    let isMounted = true;
    async function setup() {
      try {
        const [csrfRes, stripeRes] = await Promise.all([
          fetch("/api/csrf-token", { credentials: "include" }),
          fetch("/api/stripe/config", { credentials: "include" })
        ]);
        if (!csrfRes.ok) throw new Error("Failed to initialize checkout form.");
        if (!stripeRes.ok) throw new Error("Failed to load payment configuration.");
        const csrfData = await csrfRes.json();
        const stripeData = await stripeRes.json();
        if (!stripeData.publishableKey) {
          throw new Error("Payment configuration is missing.");
        }
        await loadStripeScript();
        if (!isMounted) return;
        setCsrfToken(csrfData.csrfToken || "");
        setStripeKey(stripeData.publishableKey);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || "Failed to load checkout.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    setup();
    return () => {
      isMounted = false;
    };
  }, []);
  useEffect(() => {
    if (!stripeKey || !window.Stripe) return;
    if (!cardNumberContainerRef.current || !cardExpiryContainerRef.current || !cardCvcContainerRef.current) return;
    if (cardNumberRef.current || cardExpiryRef.current || cardCvcRef.current) return;
    const stripe = window.Stripe(stripeKey);
    const elements = stripe.elements();
    const elementStyle = {
      base: {
        color: "#e0e6f0",
        fontFamily: "JetBrains Mono, monospace",
        fontSize: "16px",
        "::placeholder": { color: "#8892a0" }
      },
      invalid: {
        color: "#ef4444"
      }
    };
    const cardNumber = elements.create("cardNumber", { style: elementStyle });
    const cardExpiry = elements.create("cardExpiry", { style: elementStyle });
    const cardCvc = elements.create("cardCvc", { style: elementStyle });
    cardNumber.mount(cardNumberContainerRef.current);
    cardExpiry.mount(cardExpiryContainerRef.current);
    cardCvc.mount(cardCvcContainerRef.current);
    const onChange = (fieldId, event) => {
      setFieldErrors((prev) => ({
        ...prev,
        [fieldId]: event.error ? event.error.message : ""
      }));
    };
    cardNumber.on("change", (event) => onChange("cardNumber", event));
    cardExpiry.on("change", (event) => onChange("cardExpiry", event));
    cardCvc.on("change", (event) => onChange("cardCvc", event));
    stripeRef.current = stripe;
    cardNumberRef.current = cardNumber;
    cardExpiryRef.current = cardExpiry;
    cardCvcRef.current = cardCvc;
    return () => {
      cardNumber.destroy();
      cardExpiry.destroy();
      cardCvc.destroy();
      cardNumberRef.current = null;
      cardExpiryRef.current = null;
      cardCvcRef.current = null;
      stripeRef.current = null;
    };
  }, [stripeKey]);
  async function onSubmit(e) {
    e.preventDefault();
    if (!stripeRef.current || !cardNumberRef.current) {
      setError("Payment form is not ready yet.");
      return;
    }
    if (!cardholderName.trim()) {
      setError("Cardholder name is required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ plan: validatedPlan, interval, _csrf: csrfToken })
      });
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error("Session expired. Please log in again.");
      }
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to start payment.");
      }
      const { error: stripeError, paymentIntent } = await stripeRef.current.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardNumberRef.current,
          billing_details: {
            name: cardholderName.trim()
          }
        }
      });
      if (stripeError) {
        let message = stripeError.message || "Payment failed.";
        if (stripeError.decline_code === "insufficient_funds") {
          message = "Your card has insufficient funds.";
        } else if (stripeError.decline_code === "card_velocity_exceeded") {
          message = "Your card was declined for too many attempts in a short time.";
        }
        throw new Error(message);
      }
      if (paymentIntent?.status === "succeeded" || paymentIntent?.status === "processing") {
        const params = new URLSearchParams({
          plan: validatedPlan,
          interval
        });
        if (typeof data.subscriptionId === "string" && data.subscriptionId.trim()) {
          params.append("subscription_id", data.subscriptionId.trim());
        }
        window.location.href = `/payment-success?${params.toString()}`;
        return;
      }
      throw new Error(`Payment status: ${paymentIntent?.status || "unknown"}. Please contact support.`);
    } catch (err) {
      setError(err.message || "Payment failed.");
      setSubmitting(false);
    }
  }
  const fieldStyle = {
    width: "100%",
    padding: "0.625rem 0.75rem",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "0.375rem",
    color: "#f5f5f5",
    boxSizing: "border-box",
    outline: "none"
  };
  const stripeFieldStyle = {
    padding: "0.75rem",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "0.375rem"
  };
  const labelStyle = {
    display: "block",
    fontSize: "0.75rem",
    color: "#9ca3af",
    marginBottom: "0.375rem"
  };
  return /* @__PURE__ */ jsx(PageLayout, { children: /* @__PURE__ */ jsxs("section", { children: [
    /* @__PURE__ */ jsx("div", { className: "cb-content-pad", style: { paddingBlock: "1.25rem" }, children: /* @__PURE__ */ jsxs(
      "a",
      {
        href: "/pricing",
        className: "funnel-body-sm",
        style: { color: "#6b7280", display: "inline-flex", alignItems: "center", gap: "0.375rem", textDecoration: "none" },
        children: [
          /* @__PURE__ */ jsx("svg", { width: "12", height: "12", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }),
          "Back to pricing"
        ]
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "cb-split cb-split-2", style: { borderTop: "1px solid var(--cb-line)" }, children: [
      /* @__PURE__ */ jsxs("div", { className: "cb-content-pad", style: { paddingBlock: "3rem" }, children: [
        /* @__PURE__ */ jsx("p", { className: "funnel-kicker mb-6", children: "Order Summary" }),
        /* @__PURE__ */ jsxs("div", { style: { marginBottom: "2rem" }, children: [
          /* @__PURE__ */ jsx("h1", { className: "funnel-heading-2", style: { marginBottom: "0.375rem" }, children: plan.name }),
          /* @__PURE__ */ jsx("p", { className: "funnel-body-sm", style: { color: "#6b7280" }, children: plan.description })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: {
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          padding: "1.25rem 0",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          borderBottom: "1px solid rgba(255,255,255,0.07)"
        }, children: [
          /* @__PURE__ */ jsx("span", { className: "funnel-body-sm", style: { color: "#9ca3af" }, children: intervalLabel }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsxs("span", { style: { fontSize: "2.25rem", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }, children: [
              "$",
              displayPrice
            ] }),
            /* @__PURE__ */ jsx("span", { className: "funnel-body-sm", style: { color: "#6b7280" }, children: intervalShort })
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "funnel-body-sm", style: { marginTop: "1rem", color: interval === "yearly" ? "#86efac" : "#9ca3af" }, children: interval === "yearly" ? "Save 10% with yearly billing." : `Early Adopter price was $${plan.was}, locked for life.` }),
        /* @__PURE__ */ jsx("div", { style: { marginTop: "2rem", padding: "1rem", background: "rgba(255,255,255,0.02)", borderRadius: "0.5rem", border: "1px solid rgba(255,255,255,0.05)" }, children: /* @__PURE__ */ jsxs("p", { className: "funnel-body-sm", style: { color: "#4b5563", display: "flex", alignItems: "center", gap: "0.5rem" }, children: [
          /* @__PURE__ */ jsx("svg", { width: "14", height: "14", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", style: { color: "#4ade80", flexShrink: 0 }, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" }) }),
          "Payments secured by Stripe. We never store card data."
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "cb-content-pad", style: { paddingBlock: "3rem" }, children: [
        /* @__PURE__ */ jsx("p", { className: "funnel-kicker mb-6", children: "Payment Details" }),
        loading && /* @__PURE__ */ jsx("p", { className: "funnel-body-sm", style: { color: "#6b7280" }, children: "Loading checkout..." }),
        !loading && /* @__PURE__ */ jsxs("form", { onSubmit, style: { display: "flex", flexDirection: "column", gap: "1rem" }, children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { style: labelStyle, children: "Cardholder Name" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: cardholderName,
                onChange: (e) => setCardholderName(e.target.value),
                placeholder: "Jane Smith",
                required: true,
                autoComplete: "cc-name",
                style: fieldStyle
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { style: labelStyle, children: "Card Number" }),
            /* @__PURE__ */ jsx("div", { ref: cardNumberContainerRef, style: stripeFieldStyle })
          ] }),
          /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }, children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { style: labelStyle, children: "Expiry" }),
              /* @__PURE__ */ jsx("div", { ref: cardExpiryContainerRef, style: stripeFieldStyle })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { style: labelStyle, children: "CVC" }),
              /* @__PURE__ */ jsx("div", { ref: cardCvcContainerRef, style: stripeFieldStyle })
            ] })
          ] }),
          displayedError && /* @__PURE__ */ jsx("p", { className: "funnel-body-sm", style: { color: "#fca5a5" }, children: displayedError }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: loading || submitting || !csrfToken,
              className: "funnel-btn funnel-btn-primary",
              style: {
                width: "100%",
                justifyContent: "center",
                marginTop: "0.25rem",
                opacity: loading || submitting || !csrfToken ? 0.6 : 1
              },
              children: submitting ? "Processing…" : `Pay $${displayPrice}${intervalShort}`
            }
          ),
          /* @__PURE__ */ jsx("p", { className: "funnel-body-sm", style: { textAlign: "center", color: "#4b5563" }, children: "Powered by Stripe · SSL encrypted" })
        ] })
      ] })
    ] })
  ] }) });
}
export {
  Checkout as default
};
