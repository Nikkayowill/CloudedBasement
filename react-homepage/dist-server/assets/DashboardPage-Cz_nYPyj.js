import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useCallback, useEffect, useRef } from "react";
const PLAN_COLORS = {
  premium: { bg: "rgba(45,167,223,0.22)", color: "#7fd6ff" },
  pro: { bg: "rgba(45,167,223,0.16)", color: "#5cc8f3" },
  basic: { bg: "rgba(255,255,255,0.06)", color: "#a1a1a1" }
};
function Sidebar({ nav, active, onNav, userEmail, plan, open, onToggle, csrfToken }) {
  const initial = userEmail ? userEmail.charAt(0).toUpperCase() : "?";
  const planStyle = PLAN_COLORS[plan?.toLowerCase()] ?? PLAN_COLORS.basic;
  return /* @__PURE__ */ jsxs(
    "aside",
    {
      className: "dash-sidebar",
      id: "dash-sidebar",
      "data-open": open ? "true" : "false",
      children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            id: "dash-sidebar-hamburger",
            onClick: onToggle,
            "aria-label": open ? "Collapse sidebar" : "Expand sidebar",
            "aria-controls": "dash-sidebar-inner",
            "aria-expanded": open,
            className: "dash-sidebar-hamburger w-full shrink-0 items-center justify-start px-3.5 py-3 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
            children: /* @__PURE__ */ jsx("svg", { width: 18, height: 18, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 6h16M4 12h16M4 18h16" }) })
          }
        ),
        /* @__PURE__ */ jsx("div", { id: "dash-sidebar-inner", className: "dash-sidebar-inner flex min-h-0 flex-1 flex-col", children: /* @__PURE__ */ jsx(
          SidebarInner,
          {
            nav,
            active,
            onNav,
            userEmail,
            initial,
            plan,
            planStyle,
            csrfToken
          }
        ) })
      ]
    }
  );
}
function SidebarInner({ nav, active, onNav, userEmail, initial, plan, planStyle, csrfToken }) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("nav", { className: "flex-1 px-0 py-1.5", children: nav.map((item) => {
      const isActive = item.id === active;
      let label = item.label;
      if (item.id === "sites") label = "Domains";
      if (item.id === "deploy") label = "Deployments";
      return /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => onNav(item.id),
          className: `group flex w-full items-center gap-2.5 whitespace-nowrap border-l-2 px-4 py-[0.58rem] text-left text-[0.8125rem] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${isActive ? "border-white bg-black text-white" : "border-transparent text-[rgba(161,161,161,0.85)] hover:bg-white/4 hover:text-white"}`,
          children: [
            /* @__PURE__ */ jsx(
              "span",
              {
                className: `flex shrink-0 items-center justify-center transition-opacity duration-150 ${isActive ? "opacity-100 text-white" : "opacity-60 text-[rgba(161,161,161,0.9)] group-hover:opacity-100 group-hover:text-white"}`,
                children: item.icon
              }
            ),
            /* @__PURE__ */ jsx("span", { className: isActive ? "font-medium" : "font-normal", children: label })
          ]
        },
        item.id
      );
    }) }),
    /* @__PURE__ */ jsxs("div", { className: "border-t-faint px-4 py-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "flex h-7 w-7 shrink-0 items-center justify-center text-[0.6875rem] font-bold text-black",
            style: { background: "#2DA7DF" },
            children: initial
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("div", { className: "truncate text-[0.6875rem] text-[rgba(250,250,250,0.85)]", children: userEmail }),
          /* @__PURE__ */ jsx(
            "span",
            {
              className: "inline-block px-1.5 py-[0.12rem] text-[0.56rem] font-semibold uppercase tracking-[0.06em]",
              style: { background: planStyle.bg, color: planStyle.color },
              children: plan ?? "basic"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-2 flex gap-4 text-[0.6875rem]", children: [
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "/docs",
            className: "text-[rgba(120,120,120,1)] no-underline transition-colors duration-150 hover:text-[#2DA7DF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2DA7DF]/70",
            children: "Docs"
          }
        ),
        /* @__PURE__ */ jsxs("form", { method: "POST", action: "/logout", style: { display: "inline" }, children: [
          /* @__PURE__ */ jsx("input", { type: "hidden", name: "_csrf", value: csrfToken || "" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              className: "text-red-500 no-underline bg-transparent border-none p-0 m-0",
              style: { background: "none", border: "none", padding: 0, margin: 0 },
              children: "Logout"
            }
          )
        ] })
      ] })
    ] })
  ] });
}
function metricColor(val) {
  if (val === null) return "#525252";
  if (val >= 85) return "#ef4444";
  if (val >= 60) return "#eab308";
  return "#22c55e";
}
function MetricTile({ label, value, unit = "%", showBar = true }) {
  const isAvailable = value !== null;
  const color = showBar ? metricColor(value) : "#60a5fa";
  return /* @__PURE__ */ jsxs("div", { style: {
    background: "#111111",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "0.625rem",
    padding: "0.875rem 1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.375rem",
    minWidth: 0
  }, children: [
    /* @__PURE__ */ jsx("span", { style: { fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#525252" }, children: label }),
    /* @__PURE__ */ jsx("span", { style: {
      fontSize: "1.375rem",
      fontWeight: 700,
      lineHeight: 1,
      fontFamily: "JetBrains Mono, monospace",
      color: isAvailable ? color : "#525252"
    }, children: isAvailable ? `${value}${unit}` : "—" }),
    showBar && /* @__PURE__ */ jsx("div", { style: { height: "3px", background: "rgba(255,255,255,0.05)", borderRadius: 99, overflow: "hidden", marginTop: "0.25rem" }, children: /* @__PURE__ */ jsx("div", { style: {
      height: "100%",
      width: isAvailable ? `${Math.min(value, 100)}%` : "0%",
      background: color,
      borderRadius: 99,
      transition: "width 0.6s ease, background 0.3s ease",
      boxShadow: isAvailable && value >= 60 ? `0 0 6px ${color}60` : "none"
    } }) })
  ] });
}
function MetricsSkeleton() {
  return /* @__PURE__ */ jsx("div", { className: "metrics-grid", style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.625rem", marginBottom: "1.25rem" }, children: [0, 1, 2, 3].map((i) => /* @__PURE__ */ jsxs("div", { style: {
    background: "#111111",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "0.625rem",
    padding: "0.875rem 1rem",
    height: "5rem"
  }, children: [
    /* @__PURE__ */ jsx("div", { style: { height: "0.5rem", width: "40%", background: "rgba(255,255,255,0.06)", borderRadius: 4, marginBottom: "0.625rem", animation: "pulse 1.5s ease-in-out infinite" } }),
    /* @__PURE__ */ jsx("div", { style: { height: "1.25rem", width: "55%", background: "rgba(255,255,255,0.04)", borderRadius: 4 } }),
    /* @__PURE__ */ jsx("style", { children: `@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }` })
  ] }, i)) });
}
function MetricsGrid() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/metrics", { credentials: "same-origin" });
      const json = await res.json();
      setData(json);
    } catch {
      setData({ available: false });
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
    const id = setInterval(load, 3e4);
    return () => clearInterval(id);
  }, [load]);
  if (loading) return /* @__PURE__ */ jsx(MetricsSkeleton, {});
  if (!data?.available) return null;
  return /* @__PURE__ */ jsxs("div", { style: { marginBottom: "1.25rem" }, children: [
    /* @__PURE__ */ jsx("style", { children: `
        @media (max-width: 520px) { .metrics-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      ` }),
    /* @__PURE__ */ jsxs("div", { className: "metrics-grid", style: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "0.625rem"
    }, children: [
      /* @__PURE__ */ jsx(MetricTile, { label: "CPU", value: data.cpu, unit: "%", showBar: true }),
      /* @__PURE__ */ jsx(MetricTile, { label: "Memory", value: data.memory, unit: "%", showBar: true }),
      /* @__PURE__ */ jsx(MetricTile, { label: "Disk", value: data.disk, unit: "%", showBar: true }),
      /* @__PURE__ */ jsx(MetricTile, { label: "Uptime", value: data.uptime, unit: "", showBar: false })
    ] })
  ] });
}
function SectionHeader$5({ title }) {
  return /* @__PURE__ */ jsx("div", { className: "border-b-faint", style: { padding: "1.5rem 1.5rem 1rem" }, children: /* @__PURE__ */ jsx("h2", { style: { fontSize: "0.8125rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--dash-text-muted, #525252)" }, children: title }) });
}
function DataRow({ label, value, valueStyle }) {
  return /* @__PURE__ */ jsxs("div", { style: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0.6875rem 0",
    borderBottom: "1px solid rgba(255,255,255,0.04)"
  }, children: [
    /* @__PURE__ */ jsx("span", { style: { fontSize: "0.8125rem", color: "var(--dash-text-secondary, #a1a1a1)" }, children: label }),
    /* @__PURE__ */ jsx("span", { style: { fontSize: "0.8125rem", color: "var(--dash-text-primary, #fafafa)", fontFamily: "JetBrains Mono, monospace", ...valueStyle }, children: value })
  ] });
}
function StatusBadge$1({ status }) {
  const map = {
    running: { dot: "#22c55e", label: "Online" },
    provisioning: { dot: "#eab308", label: "Provisioning" },
    off: { dot: "#ef4444", label: "Offline" }
  };
  const s = map[status] ?? map.off;
  return /* @__PURE__ */ jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: "0.4rem" }, children: [
    /* @__PURE__ */ jsx("span", { style: {
      width: "0.5rem",
      height: "0.5rem",
      borderRadius: "50%",
      background: s.dot,
      boxShadow: status === "running" ? `0 0 0 3px rgba(34,197,94,0.15)` : "none"
    } }),
    /* @__PURE__ */ jsx("span", { style: { fontSize: "0.75rem", color: s.dot }, children: s.label })
  ] });
}
const CTAbtn = { padding: "0.25rem 0.625rem", borderRadius: "0.3125rem", background: "transparent", border: "1px solid rgba(59,130,246,0.35)", color: "#60a5fa", fontSize: "0.6875rem", fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap", textDecoration: "none" };
function GetStartedCard({ data, onNav }) {
  const domainCount = data.domains?.length ?? 0;
  const steps = [
    {
      id: "account",
      label: "Create your account",
      done: true
    },
    {
      id: "email",
      label: "Confirm your email",
      done: !!data.emailConfirmed,
      cta: !data.emailConfirmed ? { label: "Resend confirmation", href: "/resend-confirmation" } : void 0,
      extra: !data.emailConfirmed ? /* @__PURE__ */ jsxs("div", { style: { color: "#facc15", fontSize: "0.75rem", marginTop: 4 }, children: [
        "Please check your inbox and click the link to verify your email before continuing.",
        /* @__PURE__ */ jsx("br", {}),
        data.userEmail && data.userEmail.trim() ? /* @__PURE__ */ jsxs("span", { style: { color: "#a1a1a1" }, children: [
          "Email: ",
          /* @__PURE__ */ jsx("b", { children: data.userEmail })
        ] }) : /* @__PURE__ */ jsx("span", { style: { color: "#a1a1a1" }, children: "Email not provided" })
      ] }) : null
    },
    {
      id: "payment",
      label: "Choose a plan",
      done: !!(data.hasPaid || data.hasServer || data.isProvisioning),
      cta: data.emailConfirmed ? { label: "Choose a plan", href: "/pay" } : void 0,
      hidden: !data.emailConfirmed
    },
    {
      id: "deploy",
      label: "Deploy your first app",
      done: (data.siteCount ?? 0) > 0,
      cta: { label: "Deploy now", onClick: () => onNav?.("deploy") }
    },
    {
      id: "domain",
      label: "Add a custom domain",
      done: domainCount > 0,
      cta: { label: "Add domain", onClick: () => onNav?.("sites") }
    }
  ];
  const visibleSteps = steps.filter((s) => !s.hidden);
  const doneCount = visibleSteps.filter((s) => s.done).length;
  if (doneCount === visibleSteps.length) {
    return /* @__PURE__ */ jsxs("div", { style: {
      border: "1px solid rgba(34,197,94,0.18)",
      borderRadius: "0.625rem",
      marginBottom: "1.25rem",
      background: "rgba(34,197,94,0.07)",
      color: "#22c55e",
      padding: "1.5rem 1.25rem",
      textAlign: "center",
      fontWeight: 500,
      fontSize: "1.05rem",
      letterSpacing: "0.01em",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "0.5rem"
    }, children: [
      /* @__PURE__ */ jsxs("svg", { width: "32", height: "32", viewBox: "0 0 20 20", fill: "none", style: { marginBottom: 6 }, children: [
        /* @__PURE__ */ jsx("circle", { cx: "10", cy: "10", r: "9", stroke: "#22c55e", strokeWidth: "2", fill: "rgba(34,197,94,0.08)" }),
        /* @__PURE__ */ jsx("path", { d: "M6 10.5l2.5 2.5L14 8", stroke: "#22c55e", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" })
      ] }),
      "Your server is ready!",
      /* @__PURE__ */ jsx("div", { style: { color: "#a1a1a1", fontWeight: 400, fontSize: "0.95rem", marginTop: 2 }, children: "Welcome to your dashboard. You can now deploy apps, manage domains, and explore all features." })
    ] });
  }
  const activeIdx = visibleSteps.findIndex((s) => !s.done);
  const pct = Math.round(doneCount / visibleSteps.length * 100);
  return /* @__PURE__ */ jsxs("div", { style: { border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.625rem", marginBottom: "1.25rem", overflow: "hidden" }, children: [
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.875rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }, children: [
      /* @__PURE__ */ jsx("span", { style: { fontSize: "0.8125rem", fontWeight: 600, color: "var(--dash-text-primary, #fafafa)" }, children: "Get Started" }),
      /* @__PURE__ */ jsxs("span", { style: { fontSize: "0.6875rem", color: "var(--dash-text-muted, #525252)", fontVariantNumeric: "tabular-nums" }, children: [
        doneCount,
        " / ",
        visibleSteps.length,
        " complete"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { style: { height: "2px", background: "rgba(255,255,255,0.05)" }, children: /* @__PURE__ */ jsx("div", { style: { height: "100%", width: `${pct}%`, background: "#3b82f6", transition: "width 0.4s ease" } }) }),
    /* @__PURE__ */ jsx("div", { style: { padding: "0.5rem 1.25rem 0.75rem" }, children: visibleSteps.map((step, i) => {
      const isActive = i === activeIdx;
      return /* @__PURE__ */ jsxs("div", { style: {
        display: "flex",
        gap: "0.75rem",
        padding: "0.5rem 0",
        borderBottom: i < visibleSteps.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
        flexDirection: "column",
        alignItems: "flex-start"
      }, children: [
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", width: "100%", gap: "0.75rem" }, children: [
          step.done ? /* @__PURE__ */ jsxs("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", style: { flexShrink: 0, color: "#22c55e" }, children: [
            /* @__PURE__ */ jsx("circle", { cx: "8", cy: "8", r: "7.25", stroke: "currentColor", strokeWidth: "1.5", fill: "rgba(34,197,94,0.1)" }),
            /* @__PURE__ */ jsx("path", { d: "M5 8l2.5 2.5L11 6", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" })
          ] }) : isActive ? /* @__PURE__ */ jsx("span", { style: { width: "1rem", height: "1rem", borderRadius: "50%", border: "2px solid #3b82f6", flexShrink: 0, display: "inline-block" } }) : /* @__PURE__ */ jsx("span", { style: { width: "1rem", height: "1rem", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.12)", flexShrink: 0, display: "inline-block" } }),
          /* @__PURE__ */ jsx("span", { style: {
            flex: 1,
            fontSize: "0.8125rem",
            color: step.done ? "var(--dash-text-muted, #525252)" : isActive ? "var(--dash-text-primary, #fafafa)" : "var(--dash-text-secondary, #a1a1a1)"
          }, children: step.label }),
          isActive && step.cta && (step.cta.href ? /* @__PURE__ */ jsxs("a", { href: step.cta.href, style: CTAbtn, children: [
            step.cta.label,
            " →"
          ] }) : /* @__PURE__ */ jsxs("button", { onClick: step.cta.onClick, style: CTAbtn, children: [
            step.cta.label,
            " →"
          ] }))
        ] }),
        step.extra && isActive && /* @__PURE__ */ jsx("div", { style: { marginLeft: 28 }, children: step.extra })
      ] }, step.id);
    }) })
  ] });
}
function UptimeSummaryCard({ uptimeStatus }) {
  if (!uptimeStatus || Object.keys(uptimeStatus).length === 0) return null;
  const entries = Object.entries(uptimeStatus);
  const downSites = entries.filter(([, v]) => v.status === "down");
  const allUp = downSites.length === 0;
  return /* @__PURE__ */ jsxs("div", { style: {
    border: `1px solid ${allUp ? "rgba(34,197,94,0.18)" : "rgba(239,68,68,0.25)"}`,
    borderRadius: "0.625rem",
    marginBottom: "1.25rem",
    overflow: "hidden"
  }, children: [
    /* @__PURE__ */ jsxs("div", { style: {
      display: "flex",
      alignItems: "center",
      gap: "0.625rem",
      padding: "0.75rem 1.25rem",
      borderBottom: entries.length > 0 && !allUp ? "1px solid rgba(255,255,255,0.05)" : "none",
      background: allUp ? "rgba(34,197,94,0.04)" : "rgba(239,68,68,0.04)"
    }, children: [
      /* @__PURE__ */ jsx("span", { style: {
        width: "0.5rem",
        height: "0.5rem",
        borderRadius: "50%",
        flexShrink: 0,
        background: allUp ? "#22c55e" : "#ef4444"
      } }),
      /* @__PURE__ */ jsx("span", { style: { fontSize: "0.8125rem", fontWeight: 500, color: allUp ? "#22c55e" : "#f87171" }, children: allUp ? `All sites operational (${entries.length})` : `${downSites.length} site${downSites.length > 1 ? "s" : ""} down` })
    ] }),
    !allUp && downSites.map(([url]) => /* @__PURE__ */ jsxs("div", { style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0.5rem 1.25rem",
      borderBottom: "1px solid rgba(255,255,255,0.04)"
    }, children: [
      /* @__PURE__ */ jsx("span", { style: { fontSize: "0.75rem", color: "#f87171", fontFamily: "JetBrains Mono, monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: url }),
      /* @__PURE__ */ jsx("span", { style: { fontSize: "0.6875rem", color: "#ef4444", flexShrink: 0, marginLeft: "0.5rem" }, children: "down" })
    ] }, url))
  ] });
}
function OverviewSection({ data, onNav }) {
  const {
    hasServer,
    isProvisioning,
    hasPaid,
    trialAvailable,
    serverStatus,
    serverName,
    ipAddress,
    ipv6Address,
    plan,
    siteCount,
    siteLimit,
    csrfToken,
    uptimeStatus = {}
  } = data;
  const atLimit = siteCount >= siteLimit;
  return /* @__PURE__ */ jsxs("section", { children: [
    /* @__PURE__ */ jsx(SectionHeader$5, { title: "Overview" }),
    /* @__PURE__ */ jsxs("div", { style: { padding: "1.5rem" }, children: [
      /* @__PURE__ */ jsx(GetStartedCard, { data, onNav }),
      !hasServer && !isProvisioning && /* @__PURE__ */ jsxs("div", { style: {
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "0.625rem",
        padding: "2.5rem 1.5rem",
        textAlign: "center"
      }, children: [
        /* @__PURE__ */ jsx("p", { style: { fontSize: "0.9375rem", fontWeight: 500, color: "var(--dash-text-secondary, #a1a1a1)", marginBottom: "0.375rem" }, children: "No server yet" }),
        /* @__PURE__ */ jsx("p", { style: { fontSize: "0.8125rem", color: "var(--dash-text-muted, #525252)" }, children: hasPaid ? "Server is being provisioned — contact support if this takes more than 5 minutes." : trialAvailable ? "Start your free trial to get a server." : "Purchase a plan to deploy your first app." }),
        !hasPaid && /* @__PURE__ */ jsx("a", { href: "/pay", style: {
          display: "inline-block",
          marginTop: "1.25rem",
          padding: "0.5rem 1.25rem",
          borderRadius: "0.375rem",
          background: "#2563eb",
          color: "#fff",
          fontSize: "0.8125rem",
          fontWeight: 500,
          textDecoration: "none"
        }, children: trialAvailable ? "Start Free Trial" : "View Plans" })
      ] }),
      isProvisioning && !hasServer && /* @__PURE__ */ jsxs("div", { style: {
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "0.625rem",
        padding: "3rem 1.5rem",
        textAlign: "center"
      }, children: [
        /* @__PURE__ */ jsx("div", { style: {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "3rem",
          height: "3rem",
          borderRadius: "50%",
          background: "rgba(59,130,246,0.1)",
          marginBottom: "1rem"
        }, children: /* @__PURE__ */ jsxs(
          "svg",
          {
            style: { width: "1.5rem", height: "1.5rem", color: "#3b82f6", animation: "spin 1s linear infinite" },
            fill: "none",
            viewBox: "0 0 24 24",
            children: [
              /* @__PURE__ */ jsx("style", { children: `@keyframes spin { to { transform: rotate(360deg); } }` }),
              /* @__PURE__ */ jsx("circle", { style: { opacity: 0.25 }, cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
              /* @__PURE__ */ jsx("path", { style: { opacity: 0.75 }, fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
            ]
          }
        ) }),
        /* @__PURE__ */ jsx("p", { style: { fontSize: "0.9375rem", fontWeight: 500, color: "var(--dash-text-primary, #fafafa)", marginBottom: "0.375rem" }, children: "Setting up your server…" }),
        /* @__PURE__ */ jsx("p", { style: { fontSize: "0.8125rem", color: "var(--dash-text-secondary, #a1a1a1)" }, children: "Usually takes 2–3 minutes. This page will refresh automatically." })
      ] }),
      hasServer && serverStatus === "running" && /* @__PURE__ */ jsx(MetricsGrid, {}),
      hasServer && /* @__PURE__ */ jsx(UptimeSummaryCard, { uptimeStatus }),
      (hasServer || isProvisioning && hasServer) && /* @__PURE__ */ jsxs("div", { style: { border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.625rem" }, children: [
        /* @__PURE__ */ jsxs("div", { style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 1.25rem",
          borderBottom: "1px solid rgba(255,255,255,0.06)"
        }, children: [
          /* @__PURE__ */ jsx(StatusBadge$1, { status: serverStatus }),
          /* @__PURE__ */ jsx("span", { style: { fontSize: "0.8125rem", fontWeight: 500, color: "var(--dash-text-secondary, #a1a1a1)", fontFamily: "JetBrains Mono, monospace" }, children: serverName })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { padding: "0 1.25rem" }, children: [
          /* @__PURE__ */ jsx(DataRow, { label: "IPv4", value: ipAddress, valueStyle: { color: "#60a5fa" } }),
          ipv6Address && /* @__PURE__ */ jsx(DataRow, { label: "IPv6", value: ipv6Address, valueStyle: { fontSize: "0.6875rem" } }),
          /* @__PURE__ */ jsx(DataRow, { label: "Plan", value: plan?.toUpperCase() }),
          /* @__PURE__ */ jsx(
            DataRow,
            {
              label: "Sites",
              value: `${siteCount} / ${siteLimit}`,
              valueStyle: atLimit ? { color: "#ef4444" } : {}
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { style: {
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
          padding: "1rem 1.25rem",
          borderTop: "1px solid rgba(255,255,255,0.06)"
        }, children: [
          /* @__PURE__ */ jsxs("form", { action: "/server-action", method: "POST", children: [
            /* @__PURE__ */ jsx("input", { type: "hidden", name: "_csrf", value: csrfToken }),
            /* @__PURE__ */ jsx("input", { type: "hidden", name: "action", value: "restart" }),
            /* @__PURE__ */ jsx("button", { type: "submit", style: {
              padding: "0.4375rem 0.875rem",
              borderRadius: "0.375rem",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "var(--dash-text-secondary, #a1a1a1)",
              fontSize: "0.8125rem",
              cursor: "pointer",
              fontWeight: 500
            }, children: "Restart" })
          ] }),
          /* @__PURE__ */ jsxs(
            "form",
            {
              action: "/delete-server",
              method: "POST",
              onSubmit: (e) => {
                if (!window.confirm("This will cancel your plan and delete the server. Are you sure?")) e.preventDefault();
              },
              children: [
                /* @__PURE__ */ jsx("input", { type: "hidden", name: "_csrf", value: csrfToken }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "submit",
                    style: {
                      padding: "0.4375rem 0.875rem",
                      borderRadius: "0.375rem",
                      background: "transparent",
                      border: "1px solid rgba(239,68,68,0.3)",
                      color: "#f87171",
                      fontSize: "0.8125rem",
                      cursor: "pointer",
                      fontWeight: 500
                    },
                    children: "Cancel Plan"
                  }
                )
              ]
            }
          )
        ] })
      ] })
    ] })
  ] });
}
function SectionHeader$4({ title }) {
  return /* @__PURE__ */ jsx("div", { className: "border-b-faint", style: { padding: "1.5rem 1.5rem 1rem" }, children: /* @__PURE__ */ jsx("h2", { style: { fontSize: "0.8125rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--dash-text-muted, #525252)" }, children: title === "Sites" ? "Domains" : title }) });
}
function DomainRow({ domain, csrfToken, hasServer }) {
  return /* @__PURE__ */ jsxs("div", { style: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0.75rem 1.25rem",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    gap: "1rem",
    flexWrap: "wrap"
  }, children: [
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.625rem", minWidth: 0 }, children: [
      /* @__PURE__ */ jsx("span", { style: { fontSize: "0.75rem", flexShrink: 0 }, children: domain.ssl_enabled ? "🔒" : "⚠️" }),
      /* @__PURE__ */ jsxs("div", { style: { minWidth: 0 }, children: [
        /* @__PURE__ */ jsx(
          "a",
          {
            href: `${domain.ssl_enabled ? "https" : "http"}://${domain.domain}`,
            target: "_blank",
            rel: "noreferrer",
            style: {
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--dash-text-primary, #fafafa)",
              textDecoration: "none",
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            },
            children: domain.domain
          }
        ),
        /* @__PURE__ */ jsx("span", { style: { fontSize: "0.6875rem", color: domain.ssl_enabled ? "#4ade80" : "#facc15" }, children: domain.ssl_enabled ? "SSL active" : "Waiting for SSL" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "0.5rem", flexShrink: 0 }, children: [
      !domain.ssl_enabled && hasServer && /* @__PURE__ */ jsxs("form", { action: "/enable-ssl", method: "POST", children: [
        /* @__PURE__ */ jsx("input", { type: "hidden", name: "_csrf", value: csrfToken }),
        /* @__PURE__ */ jsx("input", { type: "hidden", name: "domain", value: domain.domain }),
        /* @__PURE__ */ jsx("button", { type: "submit", style: {
          padding: "0.3125rem 0.625rem",
          borderRadius: "0.3125rem",
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "var(--dash-text-secondary, #a1a1a1)",
          fontSize: "0.6875rem",
          cursor: "pointer"
        }, children: "Enable SSL" })
      ] }),
      /* @__PURE__ */ jsxs(
        "form",
        {
          action: "/delete-domain",
          method: "POST",
          onSubmit: (e) => {
            if (!window.confirm("Remove this domain?")) e.preventDefault();
          },
          children: [
            /* @__PURE__ */ jsx("input", { type: "hidden", name: "_csrf", value: csrfToken }),
            /* @__PURE__ */ jsx("input", { type: "hidden", name: "domain_id", value: domain.id }),
            /* @__PURE__ */ jsx("button", { type: "submit", style: {
              padding: "0.3125rem 0.625rem",
              borderRadius: "0.3125rem",
              background: "transparent",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#f87171",
              fontSize: "0.6875rem",
              cursor: "pointer"
            }, children: "Remove" })
          ]
        }
      )
    ] })
  ] });
}
function SitesSection({ data }) {
  const { domains = [], hasServer, csrfToken } = data;
  const [domainInput, setDomainInput] = useState("");
  return /* @__PURE__ */ jsxs("section", { children: [
    /* @__PURE__ */ jsx(SectionHeader$4, { title: "Domains" }),
    /* @__PURE__ */ jsxs("div", { style: { padding: "1.5rem" }, children: [
      domains.length > 0 ? /* @__PURE__ */ jsx("div", { style: { border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.625rem", marginBottom: "1.25rem", overflow: "hidden" }, children: domains.map((d) => /* @__PURE__ */ jsx(DomainRow, { domain: d, csrfToken, hasServer }, d.id)) }) : /* @__PURE__ */ jsx("div", { style: {
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "0.625rem",
        padding: "2.5rem 1.5rem",
        textAlign: "center",
        marginBottom: "1.25rem"
      }, children: /* @__PURE__ */ jsx("p", { style: { fontSize: "0.875rem", color: "var(--dash-text-muted, #525252)" }, children: "No custom domains yet" }) }),
      hasServer && /* @__PURE__ */ jsxs("form", { action: "/add-domain", method: "POST", children: [
        /* @__PURE__ */ jsx("input", { type: "hidden", name: "_csrf", value: csrfToken }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "0.625rem", flexWrap: "wrap" }, children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              name: "domain",
              placeholder: "yourdomain.com",
              value: domainInput,
              onChange: (e) => setDomainInput(e.target.value),
              required: true,
              style: {
                flex: 1,
                minWidth: "12rem",
                padding: "0.5rem 0.875rem",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "0.375rem",
                color: "var(--dash-text-primary, #fafafa)",
                fontSize: "0.875rem",
                outline: "none"
              }
            }
          ),
          /* @__PURE__ */ jsx("button", { type: "submit", style: {
            padding: "0.5rem 1.125rem",
            background: "#2563eb",
            border: "none",
            borderRadius: "0.375rem",
            color: "#fff",
            fontSize: "0.875rem",
            fontWeight: 500,
            cursor: "pointer"
          }, children: "Add Domain" })
        ] })
      ] })
    ] })
  ] });
}
function SectionHeader$3({ title }) {
  return /* @__PURE__ */ jsx("div", { className: "border-b-faint", style: { padding: "1.5rem 1.5rem 1rem" }, children: /* @__PURE__ */ jsx("h2", { style: { fontSize: "0.8125rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--dash-text-muted, #525252)" }, children: title }) });
}
const STATUS = {
  success: { color: "#22c55e", label: "Deployed" },
  failed: { color: "#ef4444", label: "Failed" },
  deploying: { color: "#eab308", label: "Deploying…" },
  pending: { color: "#eab308", label: "Pending…" }
};
const PREVIEW_COLOR = "#a78bfa";
function StatusBadge({ status }) {
  const s = STATUS[status] ?? { color: "#525252", label: status ?? "Unknown" };
  return /* @__PURE__ */ jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: "0.375rem", flexShrink: 0 }, children: [
    /* @__PURE__ */ jsx("span", { style: { width: "0.4375rem", height: "0.4375rem", borderRadius: "50%", background: s.color, flexShrink: 0 } }),
    /* @__PURE__ */ jsx("span", { style: { fontSize: "0.6875rem", color: s.color }, children: s.label })
  ] });
}
function repoName(gitUrl = "") {
  return gitUrl.split("/").pop().replace(/\.git$/, "") || gitUrl;
}
function formatDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString(void 0, { month: "short", day: "numeric", year: "numeric" });
}
function AiDiagnosis({ text }) {
  const [open, setOpen] = useState(false);
  return /* @__PURE__ */ jsxs("div", { style: {
    margin: "0.5rem 1.25rem 0.75rem",
    borderRadius: "0.375rem",
    border: "1px solid rgba(239,68,68,0.2)",
    background: "rgba(239,68,68,0.04)",
    overflow: "hidden"
  }, children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setOpen((o) => !o),
        style: {
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.5rem 0.75rem",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left"
        },
        children: [
          /* @__PURE__ */ jsx("span", { style: { fontSize: "0.75rem", color: "#f87171" }, children: "✦" }),
          /* @__PURE__ */ jsx("span", { style: { fontSize: "0.6875rem", fontWeight: 600, color: "#fca5a5", letterSpacing: "0.04em" }, children: "AI Diagnosis" }),
          /* @__PURE__ */ jsx("span", { style: { marginLeft: "auto", fontSize: "0.625rem", color: "#f87171", opacity: 0.7 }, children: open ? "▲" : "▼" })
        ]
      }
    ),
    open && /* @__PURE__ */ jsx("div", { style: { padding: "0 0.75rem 0.75rem" }, children: /* @__PURE__ */ jsx("p", { style: {
      fontSize: "0.8125rem",
      color: "#fecaca",
      lineHeight: 1.6,
      margin: 0,
      whiteSpace: "pre-wrap"
    }, children: text }) })
  ] });
}
function BuildLog({ depId, initialStatus, initialOutput }) {
  const isLive = initialStatus === "pending" || initialStatus === "deploying";
  const [open, setOpen] = useState(isLive);
  const [output, setOutput] = useState(initialOutput || "");
  const [status, setStatus] = useState(initialStatus);
  const bottomRef = useRef(null);
  const intervalRef = useRef(null);
  useEffect(() => {
    if (status !== "pending" && status !== "deploying") return;
    intervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/deployment-status/${depId}`, { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        setOutput(data.output || "");
        setStatus(data.status);
        if (data.status !== "pending" && data.status !== "deploying") {
          clearInterval(intervalRef.current);
        }
      } catch (_) {
      }
    }, 2e3);
    return () => clearInterval(intervalRef.current);
  }, [depId, status]);
  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [output, open]);
  if (!output) return null;
  const isRunning = status === "pending" || status === "deploying";
  return /* @__PURE__ */ jsxs("div", { style: { borderTop: "1px solid rgba(255,255,255,0.04)" }, children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setOpen((o) => !o),
        style: {
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.4rem 1.25rem",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left"
        },
        children: [
          isRunning && /* @__PURE__ */ jsx("span", { style: {
            width: "0.4375rem",
            height: "0.4375rem",
            borderRadius: "50%",
            background: "#eab308",
            flexShrink: 0,
            animation: "cb-pulse 1.2s ease-in-out infinite"
          } }),
          /* @__PURE__ */ jsx("span", { style: { fontSize: "0.6875rem", fontWeight: 600, color: "#6b7280", letterSpacing: "0.04em" }, children: isRunning ? "Build log (live)" : "Build log" }),
          /* @__PURE__ */ jsx("span", { style: { marginLeft: "auto", fontSize: "0.625rem", color: "#4b5563" }, children: open ? "▲" : "▼" })
        ]
      }
    ),
    open && /* @__PURE__ */ jsx("div", { style: {
      margin: "0 1.25rem 0.75rem",
      borderRadius: "0.375rem",
      background: "#0a0a0a",
      border: "1px solid rgba(255,255,255,0.07)",
      overflow: "hidden"
    }, children: /* @__PURE__ */ jsxs("pre", { style: {
      margin: 0,
      padding: "0.75rem 1rem",
      fontSize: "0.6875rem",
      lineHeight: 1.6,
      color: "#d1d5db",
      fontFamily: "JetBrains Mono, monospace",
      whiteSpace: "pre-wrap",
      wordBreak: "break-all",
      maxHeight: "18rem",
      overflowY: "auto"
    }, children: [
      output,
      /* @__PURE__ */ jsx("span", { ref: bottomRef })
    ] }) })
  ] });
}
function DeploymentRow({ dep, csrfToken, isLatest, uptimeStatus }) {
  const [confirming, setConfirming] = useState(false);
  const name = repoName(dep.git_url);
  const subdomainUrl = dep.subdomain ? `https://${dep.subdomain}.cloudedbasement.ca` : null;
  return /* @__PURE__ */ jsxs("div", { style: { borderBottom: "1px solid rgba(255,255,255,0.04)" }, children: [
    /* @__PURE__ */ jsxs("div", { style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0.75rem 1.25rem",
      gap: "1rem",
      flexWrap: "wrap"
    }, children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "0.1875rem", minWidth: 0 }, children: [
        /* @__PURE__ */ jsx("span", { style: {
          fontSize: "0.875rem",
          fontWeight: 500,
          color: "var(--dash-text-primary, #fafafa)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontFamily: "JetBrains Mono, monospace"
        }, children: name }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }, children: [
          dep.is_preview && /* @__PURE__ */ jsx("span", { style: {
            fontSize: "0.625rem",
            fontWeight: 600,
            letterSpacing: "0.05em",
            padding: "0.1rem 0.4rem",
            borderRadius: "0.25rem",
            background: "rgba(167,139,250,0.12)",
            border: `1px solid rgba(167,139,250,0.3)`,
            color: PREVIEW_COLOR,
            textTransform: "uppercase"
          }, children: "Preview" }),
          dep.branch && /* @__PURE__ */ jsx("span", { style: { fontSize: "0.6875rem", color: dep.is_preview ? PREVIEW_COLOR : "var(--dash-text-muted, #525252)", fontFamily: "JetBrains Mono, monospace" }, children: dep.branch }),
          dep.subdomain && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs(
              "a",
              {
                href: subdomainUrl,
                target: "_blank",
                rel: "noreferrer",
                style: { fontSize: "0.6875rem", color: dep.is_preview ? PREVIEW_COLOR : "#60a5fa", textDecoration: "none", fontFamily: "JetBrains Mono, monospace" },
                children: [
                  dep.subdomain,
                  ".cloudedbasement.ca ↗"
                ]
              }
            ),
            dep.status === "success" && /* @__PURE__ */ jsx(UptimeDot, { url: subdomainUrl, uptimeStatus })
          ] }),
          /* @__PURE__ */ jsx("span", { style: { fontSize: "0.6875rem", color: "var(--dash-text-muted, #525252)" }, children: formatDate(dep.deployed_at || dep.created_at) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.625rem", flexShrink: 0 }, children: [
        /* @__PURE__ */ jsx(StatusBadge, { status: dep.status }),
        /* @__PURE__ */ jsxs("form", { action: "/deploy", method: "POST", children: [
          /* @__PURE__ */ jsx("input", { type: "hidden", name: "_csrf", value: csrfToken }),
          /* @__PURE__ */ jsx("input", { type: "hidden", name: "git_url", value: dep.git_url }),
          /* @__PURE__ */ jsx("button", { type: "submit", style: {
            padding: "0.3125rem 0.625rem",
            borderRadius: "0.3125rem",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "var(--dash-text-secondary, #a1a1a1)",
            fontSize: "0.6875rem",
            cursor: "pointer",
            whiteSpace: "nowrap"
          }, children: "Redeploy" })
        ] }),
        !isLatest && dep.status === "success" && dep.commit_sha && /* @__PURE__ */ jsxs("form", { action: "/rollback", method: "POST", children: [
          /* @__PURE__ */ jsx("input", { type: "hidden", name: "_csrf", value: csrfToken }),
          /* @__PURE__ */ jsx("input", { type: "hidden", name: "deploymentId", value: dep.id }),
          /* @__PURE__ */ jsx("button", { type: "submit", title: `Roll back to ${dep.commit_sha.slice(0, 7)}`, style: {
            padding: "0.3125rem 0.625rem",
            borderRadius: "0.3125rem",
            background: "transparent",
            border: "1px solid rgba(251,191,36,0.3)",
            color: "#fbbf24",
            fontSize: "0.6875rem",
            cursor: "pointer",
            whiteSpace: "nowrap"
          }, children: "↩ Rollback" })
        ] }),
        !confirming ? /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setConfirming(true),
            style: {
              padding: "0.3125rem 0.625rem",
              borderRadius: "0.3125rem",
              background: "transparent",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#f87171",
              fontSize: "0.6875rem",
              cursor: "pointer",
              whiteSpace: "nowrap"
            },
            children: "Delete"
          }
        ) : /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "0.375rem", alignItems: "center" }, children: [
          /* @__PURE__ */ jsx("span", { style: { fontSize: "0.6875rem", color: "#f87171" }, children: "Sure?" }),
          /* @__PURE__ */ jsxs("form", { action: "/delete-deployment", method: "POST", children: [
            /* @__PURE__ */ jsx("input", { type: "hidden", name: "_csrf", value: csrfToken }),
            /* @__PURE__ */ jsx("input", { type: "hidden", name: "deploymentId", value: dep.id }),
            /* @__PURE__ */ jsx("button", { type: "submit", style: {
              padding: "0.25rem 0.5rem",
              borderRadius: "0.25rem",
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.4)",
              color: "#f87171",
              fontSize: "0.6875rem",
              cursor: "pointer"
            }, children: "Yes" })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setConfirming(false),
              style: {
                padding: "0.25rem 0.5rem",
                borderRadius: "0.25rem",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "var(--dash-text-muted, #525252)",
                fontSize: "0.6875rem",
                cursor: "pointer"
              },
              children: "No"
            }
          )
        ] })
      ] })
    ] }),
    dep.status === "failed" && dep.ai_diagnosis && /* @__PURE__ */ jsx(AiDiagnosis, { text: dep.ai_diagnosis }),
    /* @__PURE__ */ jsx(BuildLog, { depId: dep.id, initialStatus: dep.status, initialOutput: dep.output })
  ] });
}
function UptimeDot({ url, uptimeStatus }) {
  if (!uptimeStatus || !url) return null;
  const entry = uptimeStatus[url];
  if (!entry) return null;
  const isUp = entry.status === "up";
  return /* @__PURE__ */ jsxs("span", { title: isUp ? "Site is up" : `Down since ${entry.down_since ? new Date(entry.down_since).toLocaleString() : "unknown"}`, style: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.3rem",
    flexShrink: 0
  }, children: [
    /* @__PURE__ */ jsx("span", { style: {
      width: "0.4375rem",
      height: "0.4375rem",
      borderRadius: "50%",
      flexShrink: 0,
      background: isUp ? "#22c55e" : "#ef4444",
      boxShadow: isUp ? "0 0 0 2px rgba(34,197,94,0.2)" : "0 0 0 2px rgba(239,68,68,0.2)"
    } }),
    /* @__PURE__ */ jsx("span", { style: { fontSize: "0.625rem", color: isUp ? "#22c55e" : "#ef4444" }, children: isUp ? "up" : "down" })
  ] });
}
function DeploySection({ data }) {
  const { deployments = [], csrfToken, hasServer, siteCount = 0, siteLimit = 2, uptimeStatus = {} } = data;
  const [gitUrl, setGitUrl] = useState("");
  const atLimit = siteCount >= siteLimit;
  if (!hasServer) {
    return /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx(SectionHeader$3, { title: "Deploy" }),
      /* @__PURE__ */ jsx("div", { style: { padding: "1.5rem" }, children: /* @__PURE__ */ jsxs("div", { style: {
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "0.625rem",
        padding: "2.5rem 1.5rem",
        textAlign: "center"
      }, children: [
        /* @__PURE__ */ jsx("p", { style: { fontSize: "0.9375rem", fontWeight: 500, color: "var(--dash-text-secondary, #a1a1a1)", marginBottom: "0.375rem" }, children: "No server yet" }),
        /* @__PURE__ */ jsx("p", { style: { fontSize: "0.8125rem", color: "var(--dash-text-muted, #525252)", marginBottom: "1.25rem" }, children: "You need an active server to deploy apps." }),
        /* @__PURE__ */ jsx("a", { href: "/pay", style: {
          display: "inline-block",
          padding: "0.5rem 1.25rem",
          borderRadius: "0.375rem",
          background: "#2563eb",
          color: "#fff",
          fontSize: "0.8125rem",
          fontWeight: 500,
          textDecoration: "none"
        }, children: "Get a Server" })
      ] }) })
    ] });
  }
  return /* @__PURE__ */ jsxs("section", { children: [
    /* @__PURE__ */ jsx(SectionHeader$3, { title: "Deploy" }),
    /* @__PURE__ */ jsxs("div", { style: { padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }, children: [
      /* @__PURE__ */ jsxs("div", { style: { border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.625rem", overflow: "hidden" }, children: [
        /* @__PURE__ */ jsxs("div", { style: { padding: "1rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }, children: [
          /* @__PURE__ */ jsx("p", { style: { fontSize: "0.8125rem", fontWeight: 500, color: "var(--dash-text-primary, #fafafa)", marginBottom: "0.25rem" }, children: "Deploy from Git" }),
          /* @__PURE__ */ jsx("p", { style: { fontSize: "0.75rem", color: "var(--dash-text-muted, #525252)" }, children: "Supports GitHub, GitLab, and Bitbucket public repositories." })
        ] }),
        /* @__PURE__ */ jsx("div", { style: { padding: "1rem 1.25rem" }, children: atLimit ? /* @__PURE__ */ jsxs("div", { style: {
          padding: "0.75rem 1rem",
          borderRadius: "0.375rem",
          background: "rgba(239,68,68,0.06)",
          border: "1px solid rgba(239,68,68,0.2)",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem"
        }, children: [
          /* @__PURE__ */ jsxs("span", { style: { fontSize: "0.8125rem", color: "#fca5a5" }, children: [
            "Site limit reached (",
            siteCount,
            "/",
            siteLimit,
            "). Upgrade your plan or delete a site to deploy a new one."
          ] }),
          /* @__PURE__ */ jsx("a", { href: "/pay", style: {
            flexShrink: 0,
            fontSize: "0.75rem",
            fontWeight: 500,
            color: "#60a5fa",
            textDecoration: "none",
            whiteSpace: "nowrap"
          }, children: "Upgrade →" })
        ] }) : /* @__PURE__ */ jsxs("form", { action: "/deploy", method: "POST", children: [
          /* @__PURE__ */ jsx("input", { type: "hidden", name: "_csrf", value: csrfToken }),
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "0.625rem", flexWrap: "wrap" }, children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "url",
                name: "git_url",
                value: gitUrl,
                onChange: (e) => setGitUrl(e.target.value),
                placeholder: "https://github.com/username/repo",
                required: true,
                style: {
                  flex: 1,
                  minWidth: "14rem",
                  padding: "0.5rem 0.875rem",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "0.375rem",
                  color: "var(--dash-text-primary, #fafafa)",
                  fontSize: "0.875rem",
                  outline: "none",
                  fontFamily: "JetBrains Mono, monospace"
                },
                onFocus: (e) => {
                  e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)";
                },
                onBlur: (e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                }
              }
            ),
            /* @__PURE__ */ jsx("button", { type: "submit", style: {
              padding: "0.5rem 1.125rem",
              background: "#2563eb",
              border: "none",
              borderRadius: "0.375rem",
              color: "#fff",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
              whiteSpace: "nowrap"
            }, children: "Deploy" })
          ] }),
          /* @__PURE__ */ jsxs("p", { style: { marginTop: "0.5rem", fontSize: "0.6875rem", color: "var(--dash-text-muted, #525252)" }, children: [
            "Deploying an existing repo will trigger a redeploy. ",
            siteCount,
            "/",
            siteLimit,
            " sites used."
          ] })
        ] }) })
      ] }),
      deployments.length > 0 ? /* @__PURE__ */ jsxs("div", { style: { border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.625rem", overflow: "hidden" }, children: [
        /* @__PURE__ */ jsx("div", { style: { padding: "0.75rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }, children: /* @__PURE__ */ jsx("span", { style: { fontSize: "0.75rem", fontWeight: 500, color: "var(--dash-text-muted, #525252)", letterSpacing: "0.04em", textTransform: "uppercase" }, children: "Deployments" }) }),
        deployments.map((dep, idx) => /* @__PURE__ */ jsx(DeploymentRow, { dep, csrfToken, isLatest: idx === 0, uptimeStatus }, dep.id))
      ] }) : /* @__PURE__ */ jsx("div", { style: {
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "0.625rem",
        padding: "2rem 1.5rem",
        textAlign: "center"
      }, children: /* @__PURE__ */ jsx("p", { style: { fontSize: "0.8125rem", color: "var(--dash-text-muted, #525252)" }, children: "No deployments yet. Deploy your first app above." }) })
    ] })
  ] });
}
function SectionHeader$2({ title }) {
  return /* @__PURE__ */ jsx("div", { className: "border-b-faint", style: { padding: "1.5rem 1.5rem 1rem" }, children: /* @__PURE__ */ jsx("h2", { style: { fontSize: "0.8125rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--dash-text-muted, #525252)" }, children: title }) });
}
const MONO = { fontFamily: "JetBrains Mono, monospace" };
function CardLabel({ children }) {
  return /* @__PURE__ */ jsx("p", { style: { fontSize: "0.6875rem", color: "var(--dash-text-muted, #525252)", marginBottom: "0.3125rem" }, children });
}
function CredRow({ label, value, masked, onCopy }) {
  const display = masked ? "••••••••••••" : value || "—";
  return /* @__PURE__ */ jsxs("div", { style: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0.5rem 0",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    gap: "0.75rem",
    flexWrap: "wrap"
  }, children: [
    /* @__PURE__ */ jsxs("div", { style: { minWidth: 0 }, children: [
      /* @__PURE__ */ jsx(CardLabel, { children: label }),
      /* @__PURE__ */ jsx("span", { style: {
        fontSize: "0.8125rem",
        color: masked ? "var(--dash-text-muted, #525252)" : "var(--dash-text-primary, #fafafa)",
        ...MONO,
        wordBreak: "break-all"
      }, children: display })
    ] }),
    !masked && value && /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => onCopy(value),
        style: {
          flexShrink: 0,
          padding: "0.25rem 0.625rem",
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "0.25rem",
          color: "var(--dash-text-secondary, #a1a1a1)",
          fontSize: "0.6875rem",
          cursor: "pointer",
          whiteSpace: "nowrap"
        },
        children: "Copy"
      }
    )
  ] });
}
function CopyButton({ text, label = "Copy" }) {
  const [copied, setCopied] = useState(false);
  function handle() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }
  return /* @__PURE__ */ jsx("button", { onClick: handle, style: {
    flexShrink: 0,
    padding: "0.3125rem 0.75rem",
    borderRadius: "0.3125rem",
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.12)",
    color: copied ? "#4ade80" : "var(--dash-text-secondary, #a1a1a1)",
    fontSize: "0.6875rem",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "color 0.15s"
  }, children: copied ? "Copied!" : label });
}
function CardShell$2({ title, badge, children }) {
  return /* @__PURE__ */ jsxs("div", { style: { border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.625rem", overflow: "hidden" }, children: [
    /* @__PURE__ */ jsxs("div", { style: {
      display: "flex",
      alignItems: "center",
      gap: "0.625rem",
      padding: "0.875rem 1.25rem",
      borderBottom: "1px solid rgba(255,255,255,0.05)"
    }, children: [
      /* @__PURE__ */ jsx("span", { style: { fontSize: "0.8125rem", fontWeight: 500, color: "var(--dash-text-primary, #fafafa)" }, children: title }),
      badge && /* @__PURE__ */ jsx("span", { style: {
        fontSize: "0.5625rem",
        fontWeight: 600,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        padding: "0.1rem 0.4rem",
        borderRadius: "0.2rem",
        background: "rgba(34,197,94,0.12)",
        color: "#4ade80"
      }, children: badge })
    ] }),
    /* @__PURE__ */ jsx("div", { style: { padding: "0.75rem 1.25rem" }, children })
  ] });
}
function DevToolsSection({ data }) {
  const { hasServer, sshUsername, ipAddress, postgresInstalled, mongodbInstalled } = data;
  const [creds, setCreds] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [revealed, setRevealed] = useState(false);
  async function reveal() {
    if (creds) {
      setRevealed(true);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/credentials?type=all", { credentials: "same-origin" });
      if (!r.ok) throw new Error(`${r.status}`);
      setCreds(await r.json());
      setRevealed(true);
    } catch {
      setError("Could not load credentials. Try again.");
    } finally {
      setLoading(false);
    }
  }
  async function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        if (typeof window.showToast === "function") window.showToast("Copied!");
        return true;
      } catch (err) {
        if (typeof window.showToastError === "function") window.showToastError("Copy failed");
      }
    }
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (success) {
        if (typeof window.showToast === "function") window.showToast("Copied!");
        return true;
      } else {
        if (typeof window.showToastError === "function") window.showToastError("Copy failed");
      }
    } catch (err) {
      if (typeof window.showToastError === "function") window.showToastError("Copy failed");
    }
    return false;
  }
  if (!hasServer) {
    return /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx(SectionHeader$2, { title: "Dev Tools" }),
      /* @__PURE__ */ jsx("div", { style: { padding: "1.5rem" }, children: /* @__PURE__ */ jsxs("div", { style: {
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "0.625rem",
        padding: "2.5rem 1.5rem",
        textAlign: "center"
      }, children: [
        /* @__PURE__ */ jsx("p", { style: { fontSize: "0.9375rem", fontWeight: 500, color: "var(--dash-text-secondary, #a1a1a1)", marginBottom: "0.375rem" }, children: "No server yet" }),
        /* @__PURE__ */ jsx("p", { style: { fontSize: "0.8125rem", color: "var(--dash-text-muted, #525252)", marginBottom: "1.25rem" }, children: "SSH access, database credentials, and environment tools appear here once your server is provisioned." }),
        /* @__PURE__ */ jsx("a", { href: "/pay", style: {
          display: "inline-block",
          padding: "0.5rem 1.25rem",
          borderRadius: "0.375rem",
          background: "#2563eb",
          color: "#fff",
          fontSize: "0.8125rem",
          fontWeight: 500,
          textDecoration: "none"
        }, children: "Get a Server" })
      ] }) })
    ] });
  }
  const sshCommand = `ssh ${sshUsername || "root"}@${ipAddress}`;
  return /* @__PURE__ */ jsxs("section", { children: [
    /* @__PURE__ */ jsx(SectionHeader$2, { title: "Dev Tools" }),
    /* @__PURE__ */ jsxs("div", { style: { padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }, children: [
      !revealed && /* @__PURE__ */ jsxs("div", { style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.875rem 1.25rem",
        gap: "1rem",
        flexWrap: "wrap",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "0.625rem",
        background: "rgba(255,255,255,0.02)"
      }, children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { style: { fontSize: "0.8125rem", fontWeight: 500, color: "var(--dash-text-primary, #fafafa)", marginBottom: "0.1875rem" }, children: "Credentials are hidden" }),
          /* @__PURE__ */ jsx("p", { style: { fontSize: "0.75rem", color: "var(--dash-text-muted, #525252)" }, children: "Click reveal to load your SSH and database credentials securely." })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: reveal,
            disabled: loading,
            style: {
              flexShrink: 0,
              padding: "0.4375rem 1rem",
              background: "rgba(59,130,246,0.12)",
              border: "1px solid rgba(59,130,246,0.3)",
              borderRadius: "0.375rem",
              color: "#60a5fa",
              fontSize: "0.8125rem",
              fontWeight: 500,
              cursor: loading ? "wait" : "pointer"
            },
            children: loading ? "Loading…" : "Reveal Credentials"
          }
        )
      ] }),
      error && /* @__PURE__ */ jsx("p", { style: { fontSize: "0.8125rem", color: "#f87171", padding: "0 0.25rem" }, children: error }),
      /* @__PURE__ */ jsxs(CardShell$2, { title: "SSH Access", badge: "Active", children: [
        /* @__PURE__ */ jsx(CredRow, { label: "Username", value: sshUsername || "root", masked: false, onCopy: copy }),
        /* @__PURE__ */ jsx(CredRow, { label: "Host / IP", value: ipAddress, masked: false, onCopy: copy }),
        /* @__PURE__ */ jsx(
          CredRow,
          {
            label: "Password",
            value: revealed ? creds?.ssh?.password : null,
            masked: !revealed || !creds?.ssh?.password,
            onCopy: copy
          }
        ),
        /* @__PURE__ */ jsxs("div", { style: { marginTop: "0.75rem", display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }, children: [
          /* @__PURE__ */ jsx("code", { style: {
            flex: 1,
            minWidth: "12rem",
            fontSize: "0.75rem",
            padding: "0.5rem 0.75rem",
            background: "rgba(0,0,0,0.35)",
            borderRadius: "0.3125rem",
            color: "#a3e635",
            ...MONO,
            wordBreak: "break-all"
          }, children: sshCommand }),
          /* @__PURE__ */ jsx(CopyButton, { text: sshCommand, label: "Copy Command" })
        ] })
      ] }),
      postgresInstalled && /* @__PURE__ */ jsxs(CardShell$2, { title: "PostgreSQL", badge: "Installed", children: [
        /* @__PURE__ */ jsx(CredRow, { label: "Host", value: revealed ? creds?.postgres?.host : null, masked: !revealed, onCopy: copy }),
        /* @__PURE__ */ jsx(CredRow, { label: "Port", value: "5432", masked: false, onCopy: copy }),
        /* @__PURE__ */ jsx(CredRow, { label: "Database", value: revealed ? creds?.postgres?.database : null, masked: !revealed, onCopy: copy }),
        /* @__PURE__ */ jsx(CredRow, { label: "Username", value: revealed ? creds?.postgres?.username : null, masked: !revealed, onCopy: copy }),
        /* @__PURE__ */ jsx(CredRow, { label: "Password", value: revealed ? creds?.postgres?.password : null, masked: !revealed, onCopy: copy }),
        revealed && creds?.postgres?.connectionString && /* @__PURE__ */ jsxs("div", { style: { marginTop: "0.75rem" }, children: [
          /* @__PURE__ */ jsx(CardLabel, { children: "Connection String" }),
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "0.5rem", alignItems: "flex-start", flexWrap: "wrap" }, children: [
            /* @__PURE__ */ jsx("code", { style: {
              flex: 1,
              minWidth: "10rem",
              fontSize: "0.6875rem",
              padding: "0.5rem 0.75rem",
              background: "rgba(0,0,0,0.35)",
              borderRadius: "0.3125rem",
              color: "#a3e635",
              ...MONO,
              wordBreak: "break-all"
            }, children: creds.postgres.connectionString }),
            /* @__PURE__ */ jsx(CopyButton, { text: creds.postgres.connectionString, label: "Copy" })
          ] })
        ] })
      ] }),
      mongodbInstalled && /* @__PURE__ */ jsxs(CardShell$2, { title: "MongoDB", badge: "Installed", children: [
        /* @__PURE__ */ jsx(CredRow, { label: "Host", value: revealed ? creds?.mongodb?.host : null, masked: !revealed, onCopy: copy }),
        /* @__PURE__ */ jsx(CredRow, { label: "Port", value: "27017", masked: false, onCopy: copy }),
        /* @__PURE__ */ jsx(CredRow, { label: "Database", value: revealed ? creds?.mongodb?.database : null, masked: !revealed, onCopy: copy }),
        /* @__PURE__ */ jsx(CredRow, { label: "Username", value: revealed ? creds?.mongodb?.username : null, masked: !revealed, onCopy: copy }),
        /* @__PURE__ */ jsx(CredRow, { label: "Password", value: revealed ? creds?.mongodb?.password : null, masked: !revealed, onCopy: copy }),
        revealed && creds?.mongodb?.connectionString && /* @__PURE__ */ jsxs("div", { style: { marginTop: "0.75rem" }, children: [
          /* @__PURE__ */ jsx(CardLabel, { children: "Connection String" }),
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "0.5rem", alignItems: "flex-start", flexWrap: "wrap" }, children: [
            /* @__PURE__ */ jsx("code", { style: {
              flex: 1,
              minWidth: "10rem",
              fontSize: "0.6875rem",
              padding: "0.5rem 0.75rem",
              background: "rgba(0,0,0,0.35)",
              borderRadius: "0.3125rem",
              color: "#a3e635",
              ...MONO,
              wordBreak: "break-all"
            }, children: creds.mongodb.connectionString }),
            /* @__PURE__ */ jsx(CopyButton, { text: creds.mongodb.connectionString, label: "Copy" })
          ] })
        ] })
      ] }),
      !postgresInstalled && !mongodbInstalled && /* @__PURE__ */ jsx("div", { style: {
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "0.625rem",
        padding: "1.25rem",
        textAlign: "center"
      }, children: /* @__PURE__ */ jsxs("p", { style: { fontSize: "0.8125rem", color: "var(--dash-text-muted, #525252)" }, children: [
        "No managed databases installed.",
        " ",
        /* @__PURE__ */ jsx("a", { href: "/old-dashboard#section-dev-tools", style: { color: "#60a5fa", textDecoration: "none" }, children: "Set one up in the classic view →" })
      ] }) })
    ] })
  ] });
}
function SectionHeader$1({ title }) {
  return /* @__PURE__ */ jsx("div", { className: "border-b-faint", style: { padding: "1.5rem 1.5rem 1rem" }, children: /* @__PURE__ */ jsx("h2", { style: { fontSize: "0.8125rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--dash-text-muted, #525252)" }, children: title }) });
}
function CardShell$1({ title, subtitle, children }) {
  return /* @__PURE__ */ jsxs("div", { style: { border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.625rem", overflow: "hidden" }, children: [
    /* @__PURE__ */ jsxs("div", { style: { padding: "0.875rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }, children: [
      /* @__PURE__ */ jsx("span", { style: { fontSize: "0.8125rem", fontWeight: 500, color: "var(--dash-text-primary, #fafafa)" }, children: title }),
      subtitle && /* @__PURE__ */ jsx("p", { style: { fontSize: "0.75rem", color: "var(--dash-text-muted, #525252)", marginTop: "0.1875rem" }, children: subtitle })
    ] }),
    /* @__PURE__ */ jsx("div", { style: { padding: "1rem 1.25rem" }, children })
  ] });
}
function MaskedValue({ value }) {
  const [shown, setShown] = useState(false);
  return /* @__PURE__ */ jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: "0.5rem" }, children: [
    /* @__PURE__ */ jsx("span", { style: {
      fontFamily: "JetBrains Mono, monospace",
      fontSize: "0.8125rem",
      color: shown ? "var(--dash-text-primary, #fafafa)" : "var(--dash-text-muted, #525252)",
      wordBreak: "break-all"
    }, children: shown ? value : "••••••••" }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setShown((s) => !s),
        style: {
          padding: "0.125rem 0.5rem",
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "0.25rem",
          color: "var(--dash-text-muted, #525252)",
          fontSize: "0.625rem",
          cursor: "pointer",
          whiteSpace: "nowrap",
          flexShrink: 0
        },
        children: shown ? "Hide" : "Show"
      }
    )
  ] });
}
function EnvSection({ data }) {
  const { hasServer, csrfToken } = data;
  const [envVars, setEnvVars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [newKey, setNewKey] = useState("");
  const [newVal, setNewVal] = useState("");
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  useEffect(() => {
    if (!hasServer) return;
    setLoading(true);
    fetch("/api/env-vars", { credentials: "same-origin" }).then((r) => r.ok ? r.json() : Promise.reject(r.status)).then((d) => setEnvVars(d.envVars || [])).catch(() => setApiError("Failed to load environment variables.")).finally(() => setLoading(false));
  }, [hasServer]);
  async function handleAdd(e) {
    e.preventDefault();
    setFormErr(null);
    const key = newKey.trim().toUpperCase();
    const val = newVal;
    if (!key) return setFormErr("Key is required.");
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) return setFormErr("Key must start with a letter or underscore and contain only letters, numbers, and underscores.");
    setSaving(true);
    try {
      const r = await fetch("/api/env-vars", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
        body: JSON.stringify({ key, value: val })
      });
      const d = await r.json();
      if (!r.ok) return setFormErr(d.error || "Failed to save.");
      setEnvVars((prev) => {
        const idx = prev.findIndex((v) => v.key === d.envVar.key);
        return idx >= 0 ? prev.map((v, i) => i === idx ? d.envVar : v) : [...prev, d.envVar].sort((a, b) => a.key.localeCompare(b.key));
      });
      setNewKey("");
      setNewVal("");
    } catch {
      setFormErr("Network error. Try again.");
    } finally {
      setSaving(false);
    }
  }
  async function handleDelete(id) {
    setDeletingId(id);
    try {
      const r = await fetch(`/api/env-vars/${id}`, {
        method: "DELETE",
        credentials: "same-origin",
        headers: { "x-csrf-token": csrfToken }
      });
      if (r.ok) {
        setEnvVars((prev) => prev.filter((v) => v.id !== id));
      } else {
        const errText = await r.text();
        console.error("Failed to delete env var:", r.status, errText);
        setApiError("Failed to delete environment variable.");
        if (typeof window.showToastError === "function") window.showToastError("Failed to delete environment variable.");
      }
    } catch (err) {
      console.error("Error deleting env var:", err);
      setApiError("Network error. Try again.");
      if (typeof window.showToastError === "function") window.showToastError("Network error. Try again.");
    } finally {
      setDeletingId(null);
    }
  }
  if (!hasServer) {
    return /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx(SectionHeader$1, { title: "Environment Variables" }),
      /* @__PURE__ */ jsx("div", { style: { padding: "1.5rem" }, children: /* @__PURE__ */ jsxs("div", { style: {
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "0.625rem",
        padding: "2.5rem 1.5rem",
        textAlign: "center"
      }, children: [
        /* @__PURE__ */ jsx("p", { style: { fontSize: "0.9375rem", fontWeight: 500, color: "var(--dash-text-secondary, #a1a1a1)", marginBottom: "0.375rem" }, children: "No server yet" }),
        /* @__PURE__ */ jsx("p", { style: { fontSize: "0.8125rem", color: "var(--dash-text-muted, #525252)", marginBottom: "1.25rem" }, children: "Environment variables are injected into your deployments at build time." }),
        /* @__PURE__ */ jsx("a", { href: "/pay", style: {
          display: "inline-block",
          padding: "0.5rem 1.25rem",
          borderRadius: "0.375rem",
          background: "#2563eb",
          color: "#fff",
          fontSize: "0.8125rem",
          fontWeight: 500,
          textDecoration: "none"
        }, children: "Get a Server" })
      ] }) })
    ] });
  }
  return /* @__PURE__ */ jsxs("section", { children: [
    /* @__PURE__ */ jsx(SectionHeader$1, { title: "Environment Variables" }),
    /* @__PURE__ */ jsxs("div", { style: { padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }, children: [
      /* @__PURE__ */ jsxs("div", { style: {
        padding: "0.75rem 1rem",
        borderRadius: "0.5rem",
        background: "rgba(59,130,246,0.06)",
        border: "1px solid rgba(59,130,246,0.15)",
        fontSize: "0.8125rem",
        color: "var(--dash-text-secondary, #a1a1a1)",
        lineHeight: 1.5
      }, children: [
        "These variables are injected into your server's ",
        /* @__PURE__ */ jsx("code", { style: { fontFamily: "JetBrains Mono, monospace", color: "#60a5fa" }, children: ".env" }),
        " file on every deploy. Changes take effect on the next deployment."
      ] }),
      /* @__PURE__ */ jsxs(CardShell$1, { title: "Current Variables", subtitle: loading ? "Loading…" : `${envVars.length} variable${envVars.length !== 1 ? "s" : ""} set`, children: [
        apiError && /* @__PURE__ */ jsx("p", { style: { fontSize: "0.8125rem", color: "#f87171", marginBottom: "0.75rem" }, children: apiError }),
        !loading && envVars.length === 0 && !apiError && /* @__PURE__ */ jsx("p", { style: { fontSize: "0.8125rem", color: "var(--dash-text-muted, #525252)", textAlign: "center", padding: "1rem 0" }, children: "No variables set yet. Add one below." }),
        envVars.map((v) => /* @__PURE__ */ jsxs("div", { style: {
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: "0.5625rem 0",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          flexWrap: "wrap"
        }, children: [
          /* @__PURE__ */ jsx("span", { style: {
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "0.8125rem",
            color: "#a3e635",
            flexShrink: 0,
            minWidth: "8rem"
          }, children: v.key }),
          /* @__PURE__ */ jsx("span", { style: { flex: 1, minWidth: 0 }, children: /* @__PURE__ */ jsx(MaskedValue, { value: v.value }) }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleDelete(v.id),
              disabled: deletingId === v.id,
              style: {
                flexShrink: 0,
                padding: "0.1875rem 0.5rem",
                background: "transparent",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: "0.25rem",
                color: "#f87171",
                fontSize: "0.6875rem",
                cursor: deletingId === v.id ? "wait" : "pointer"
              },
              children: deletingId === v.id ? "…" : "Remove"
            }
          )
        ] }, v.id))
      ] }),
      /* @__PURE__ */ jsx(CardShell$1, { title: "Add / Update Variable", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleAdd, style: { display: "flex", flexDirection: "column", gap: "0.75rem" }, children: [
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "0.75rem", flexWrap: "wrap" }, children: [
          /* @__PURE__ */ jsxs("div", { style: { flex: "1 1 10rem", minWidth: 0 }, children: [
            /* @__PURE__ */ jsx("label", { style: { display: "block", fontSize: "0.6875rem", color: "var(--dash-text-muted, #525252)", marginBottom: "0.3125rem" }, children: "KEY" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                value: newKey,
                onChange: (e) => setNewKey(e.target.value),
                placeholder: "DATABASE_URL",
                autoCapitalize: "characters",
                style: {
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "0.375rem",
                  color: "var(--dash-text-primary, #fafafa)",
                  fontSize: "0.8125rem",
                  fontFamily: "JetBrains Mono, monospace",
                  outline: "none",
                  boxSizing: "border-box"
                }
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { style: { flex: "2 1 14rem", minWidth: 0 }, children: [
            /* @__PURE__ */ jsx("label", { style: { display: "block", fontSize: "0.6875rem", color: "var(--dash-text-muted, #525252)", marginBottom: "0.3125rem" }, children: "VALUE" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                value: newVal,
                onChange: (e) => setNewVal(e.target.value),
                placeholder: "postgres://user:pass@host/db",
                style: {
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "0.375rem",
                  color: "var(--dash-text-primary, #fafafa)",
                  fontSize: "0.8125rem",
                  fontFamily: "JetBrains Mono, monospace",
                  outline: "none",
                  boxSizing: "border-box"
                }
              }
            )
          ] })
        ] }),
        formErr && /* @__PURE__ */ jsx("p", { style: { fontSize: "0.8125rem", color: "#f87171", margin: 0 }, children: formErr }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: saving,
              style: {
                padding: "0.4375rem 1rem",
                borderRadius: "0.375rem",
                background: saving ? "rgba(59,130,246,0.4)" : "rgba(59,130,246,0.15)",
                border: "1px solid rgba(59,130,246,0.35)",
                color: "#60a5fa",
                fontSize: "0.8125rem",
                fontWeight: 500,
                cursor: saving ? "wait" : "pointer"
              },
              children: saving ? "Saving…" : "Save Variable"
            }
          ),
          /* @__PURE__ */ jsx("span", { style: { marginLeft: "0.75rem", fontSize: "0.75rem", color: "var(--dash-text-muted, #525252)" }, children: "If the key already exists, the value will be updated." })
        ] })
      ] }) })
    ] })
  ] });
}
function SectionHeader({ title }) {
  return /* @__PURE__ */ jsx("div", { className: "border-b-faint", style: { padding: "1.5rem 1.5rem 1rem" }, children: /* @__PURE__ */ jsx("h2", { style: { fontSize: "0.8125rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--dash-text-muted, #525252)" }, children: title }) });
}
function CardShell({ title, children }) {
  return /* @__PURE__ */ jsxs("div", { style: { border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.625rem", overflow: "hidden" }, children: [
    /* @__PURE__ */ jsx("div", { style: { padding: "0.875rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }, children: /* @__PURE__ */ jsx("span", { style: { fontSize: "0.8125rem", fontWeight: 500, color: "var(--dash-text-primary, #fafafa)" }, children: title }) }),
    /* @__PURE__ */ jsx("div", { style: { padding: "1.25rem" }, children })
  ] });
}
const inputStyle = {
  width: "100%",
  padding: "0.5rem 0.875rem",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "0.375rem",
  color: "var(--dash-text-primary, #fafafa)",
  fontSize: "0.875rem",
  outline: "none",
  boxSizing: "border-box"
};
const labelStyle = {
  display: "block",
  fontSize: "0.75rem",
  color: "var(--dash-text-secondary, #a1a1a1)",
  marginBottom: "0.375rem"
};
function InlineAlert({ type, message }) {
  const isSuccess = type === "success";
  return /* @__PURE__ */ jsx("div", { style: {
    padding: "0.625rem 0.875rem",
    borderRadius: "0.375rem",
    background: isSuccess ? "rgba(34,197,94,0.07)" : "rgba(239,68,68,0.07)",
    border: `1px solid ${isSuccess ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
    color: isSuccess ? "#86efac" : "#fca5a5",
    fontSize: "0.8125rem"
  }, children: message });
}
function ChangePasswordCard({ csrfToken }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSub] = useState(false);
  const [result, setResult] = useState(null);
  async function submit(e) {
    e.preventDefault();
    if (next !== confirm) {
      setResult({ type: "error", message: "New passwords do not match." });
      return;
    }
    if (next.length < 8) {
      setResult({ type: "error", message: "New password must be at least 8 characters." });
      return;
    }
    setSub(true);
    setResult(null);
    try {
      const body = new URLSearchParams({ _csrf: csrfToken, currentPassword: current, newPassword: next });
      const r = await fetch("/change-password", { method: "POST", credentials: "same-origin", body });
      const json = await r.json();
      if (json.success) {
        setResult({ type: "success", message: json.message || "Password changed successfully." });
        setCurrent("");
        setNext("");
        setConfirm("");
      } else {
        setResult({ type: "error", message: json.error || json.message || "Failed to change password." });
      }
    } catch {
      setResult({ type: "error", message: "Network error. Please try again." });
    } finally {
      setSub(false);
    }
  }
  return /* @__PURE__ */ jsx(CardShell, { title: "Change Password", children: /* @__PURE__ */ jsxs("form", { onSubmit: submit, style: { display: "flex", flexDirection: "column", gap: "0.875rem" }, children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { style: labelStyle, children: "Current password" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "password",
          value: current,
          onChange: (e) => setCurrent(e.target.value),
          required: true,
          autoComplete: "current-password",
          style: inputStyle,
          onFocus: (e) => {
            e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)";
          },
          onBlur: (e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { style: labelStyle, children: "New password" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "password",
          value: next,
          onChange: (e) => setNext(e.target.value),
          required: true,
          minLength: 8,
          autoComplete: "new-password",
          style: inputStyle,
          onFocus: (e) => {
            e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)";
          },
          onBlur: (e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { style: labelStyle, children: "Confirm new password" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "password",
          value: confirm,
          onChange: (e) => setConfirm(e.target.value),
          required: true,
          minLength: 8,
          autoComplete: "new-password",
          style: inputStyle,
          onFocus: (e) => {
            e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)";
          },
          onBlur: (e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
          }
        }
      )
    ] }),
    result && /* @__PURE__ */ jsx(InlineAlert, { type: result.type, message: result.message }),
    /* @__PURE__ */ jsx("button", { type: "submit", disabled: submitting, style: {
      alignSelf: "flex-start",
      padding: "0.5rem 1.125rem",
      background: "#2563eb",
      border: "none",
      borderRadius: "0.375rem",
      color: "#fff",
      fontSize: "0.875rem",
      fontWeight: 500,
      cursor: submitting ? "wait" : "pointer",
      opacity: submitting ? 0.7 : 1
    }, children: submitting ? "Saving…" : "Update Password" })
  ] }) });
}
function SupportTicketCard({ csrfToken }) {
  const [subject, setSubject] = useState("");
  const [description, setDesc] = useState("");
  const [priority, setPriority] = useState("normal");
  const [submitting, setSub] = useState(false);
  const [result, setResult] = useState(null);
  async function submit(e) {
    e.preventDefault();
    setSub(true);
    setResult(null);
    try {
      const body = new URLSearchParams({ _csrf: csrfToken, subject, description, priority });
      const r = await fetch("/submit-ticket", { method: "POST", credentials: "same-origin", body });
      const json = await r.json();
      if (json.success) {
        setResult({ type: "success", message: `Ticket #${json.ticketId} submitted. We'll be in touch shortly.` });
        setSubject("");
        setDesc("");
        setPriority("normal");
      } else {
        setResult({ type: "error", message: json.error || "Failed to submit ticket." });
      }
    } catch {
      setResult({ type: "error", message: "Network error. Please try again." });
    } finally {
      setSub(false);
    }
  }
  return /* @__PURE__ */ jsx(CardShell, { title: "Submit Support Ticket", children: /* @__PURE__ */ jsxs("form", { onSubmit: submit, style: { display: "flex", flexDirection: "column", gap: "0.875rem" }, children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { style: labelStyle, children: "Subject" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          value: subject,
          onChange: (e) => setSubject(e.target.value),
          required: true,
          placeholder: "Briefly describe your issue",
          style: inputStyle,
          onFocus: (e) => {
            e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)";
          },
          onBlur: (e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { style: labelStyle, children: "Description" }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          value: description,
          onChange: (e) => setDesc(e.target.value),
          required: true,
          rows: 5,
          placeholder: "Include any error messages, steps to reproduce, or context that might help.",
          style: { ...inputStyle, resize: "vertical", minHeight: "7rem", lineHeight: 1.5 },
          onFocus: (e) => {
            e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)";
          },
          onBlur: (e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { style: labelStyle, children: "Priority" }),
      /* @__PURE__ */ jsxs("select", { value: priority, onChange: (e) => setPriority(e.target.value), style: {
        ...inputStyle,
        cursor: "pointer",
        backgroundImage: "none"
      }, children: [
        /* @__PURE__ */ jsx("option", { value: "normal", children: "Normal" }),
        /* @__PURE__ */ jsx("option", { value: "high", children: "High" }),
        /* @__PURE__ */ jsx("option", { value: "urgent", children: "Urgent" })
      ] })
    ] }),
    result && /* @__PURE__ */ jsx(InlineAlert, { type: result.type, message: result.message }),
    /* @__PURE__ */ jsx("button", { type: "submit", disabled: submitting, style: {
      alignSelf: "flex-start",
      padding: "0.5rem 1.125rem",
      background: "#2563eb",
      border: "none",
      borderRadius: "0.375rem",
      color: "#fff",
      fontSize: "0.875rem",
      fontWeight: 500,
      cursor: submitting ? "wait" : "pointer",
      opacity: submitting ? 0.7 : 1
    }, children: submitting ? "Submitting…" : "Submit Ticket" })
  ] }) });
}
const PLANS = [
  { id: "basic", name: "Basic", monthly: 15, yearly: 162, siteLimit: 2, features: ["1 GB RAM", "1 vCPU", "25 GB Storage"] },
  { id: "pro", name: "Pro", monthly: 35, yearly: 378, siteLimit: 5, features: ["2 GB RAM", "2 vCPUs", "60 GB Storage"] },
  { id: "premium", name: "Premium", monthly: 65, yearly: 702, siteLimit: 10, features: ["4 GB RAM", "2 vCPUs", "80 GB Storage"] }
];
function PlanCard({ data }) {
  const { plan: currentPlan, paymentInterval, siteCount, siteLimit, hasServer, csrfToken } = data;
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(null);
  if (!hasServer) return null;
  async function handleUpgrade(planId) {
    setStatus(null);
    setLoading(planId);
    try {
      const r = await fetch("/upgrade-plan", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
        body: JSON.stringify({ plan: planId })
      });
      const d = await r.json();
      if (!r.ok) {
        setStatus({ type: "error", message: d.error || "Failed to update plan." });
      } else {
        setStatus({ type: "success", message: `Plan updated to ${PLANS.find((p) => p.id === planId)?.name}. Your billing has been adjusted with proration.` });
        setTimeout(() => window.location.reload(), 2e3);
      }
    } catch {
      setStatus({ type: "error", message: "Network error. Please try again." });
    } finally {
      setLoading(null);
    }
  }
  const intervalLabel = paymentInterval === "yearly" ? "/yr" : "/mo";
  return /* @__PURE__ */ jsxs(CardShell, { title: "Plan", children: [
    /* @__PURE__ */ jsxs("div", { style: {
      display: "flex",
      alignItems: "center",
      gap: "0.625rem",
      marginBottom: "1.25rem",
      padding: "0.75rem 1rem",
      background: "rgba(255,255,255,0.03)",
      borderRadius: "0.5rem",
      border: "1px solid rgba(255,255,255,0.07)"
    }, children: [
      /* @__PURE__ */ jsx("span", { style: { fontSize: "0.8125rem", color: "var(--dash-text-secondary, #a1a1a1)" }, children: "Current plan:" }),
      /* @__PURE__ */ jsx("span", { style: {
        fontSize: "0.75rem",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        padding: "0.125rem 0.5rem",
        borderRadius: "0.25rem",
        background: "rgba(59,130,246,0.12)",
        color: "#60a5fa"
      }, children: PLANS.find((p) => p.id === currentPlan)?.name ?? currentPlan }),
      /* @__PURE__ */ jsxs("span", { style: { fontSize: "0.75rem", color: "var(--dash-text-muted, #525252)", marginLeft: "auto" }, children: [
        siteCount,
        " / ",
        siteLimit,
        " sites used · billed ",
        paymentInterval
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: "0.75rem", flexWrap: "wrap" }, children: PLANS.map((p) => {
      const currentPlanIndex = PLANS.findIndex((x) => x.id === currentPlan);
      const targetPlanIndex = PLANS.findIndex((x) => x.id === p.id);
      const isCurrent = p.id === currentPlan;
      const isUpgrade = currentPlanIndex === -1 || targetPlanIndex > currentPlanIndex;
      const wouldExceed = siteCount > p.siteLimit;
      const isLoading = loading === p.id;
      const price = paymentInterval === "yearly" ? p.yearly : p.monthly;
      return /* @__PURE__ */ jsxs("div", { style: {
        flex: "1 1 9rem",
        minWidth: "9rem",
        border: isCurrent ? "1px solid rgba(59,130,246,0.35)" : "1px solid rgba(255,255,255,0.07)",
        borderRadius: "0.5rem",
        padding: "1rem",
        background: isCurrent ? "rgba(59,130,246,0.05)" : "transparent",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem"
      }, children: [
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
          /* @__PURE__ */ jsx("span", { style: { fontSize: "0.8125rem", fontWeight: 600, color: "var(--dash-text-primary, #fafafa)" }, children: p.name }),
          isCurrent && /* @__PURE__ */ jsx("span", { style: { fontSize: "0.5625rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", padding: "0.125rem 0.375rem", borderRadius: "0.2rem", background: "rgba(59,130,246,0.2)", color: "#60a5fa" }, children: "Current" })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { fontSize: "1rem", fontWeight: 700, color: "var(--dash-text-primary, #fafafa)" }, children: [
          "$",
          price,
          /* @__PURE__ */ jsx("span", { style: { fontSize: "0.75rem", fontWeight: 400, color: "var(--dash-text-muted, #525252)" }, children: intervalLabel })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { fontSize: "0.75rem", color: "var(--dash-text-muted, #525252)", lineHeight: 1.5 }, children: [
          p.features.map((f) => /* @__PURE__ */ jsx("div", { children: f }, f)),
          /* @__PURE__ */ jsxs("div", { children: [
            p.siteLimit,
            " sites"
          ] })
        ] }),
        !isCurrent && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => handleUpgrade(p.id),
            disabled: !!loading || wouldExceed,
            title: wouldExceed ? `Remove ${siteCount - p.siteLimit} site(s) first` : void 0,
            style: {
              marginTop: "0.25rem",
              padding: "0.375rem 0.75rem",
              borderRadius: "0.3125rem",
              fontSize: "0.75rem",
              fontWeight: 500,
              cursor: loading || wouldExceed ? wouldExceed ? "not-allowed" : "wait" : "pointer",
              background: isUpgrade ? "rgba(59,130,246,0.12)" : "transparent",
              border: isUpgrade ? "1px solid rgba(59,130,246,0.3)" : "1px solid rgba(255,255,255,0.1)",
              color: isUpgrade ? "#60a5fa" : wouldExceed ? "var(--dash-text-muted, #525252)" : "var(--dash-text-secondary, #a1a1a1)",
              opacity: wouldExceed ? 0.5 : 1
            },
            children: isLoading ? "Updating…" : isUpgrade ? "Upgrade" : "Downgrade"
          }
        )
      ] }, p.id);
    }) }),
    status && /* @__PURE__ */ jsx("div", { style: { marginTop: "1rem" }, children: /* @__PURE__ */ jsx(InlineAlert, { type: status.type, message: status.message }) }),
    /* @__PURE__ */ jsx("p", { style: { marginTop: "0.875rem", fontSize: "0.75rem", color: "var(--dash-text-muted, #525252)" }, children: "Upgrades and downgrades are prorated — you'll only pay the difference for the remaining billing period." })
  ] });
}
function SettingsSection({ data }) {
  const { csrfToken } = data;
  return /* @__PURE__ */ jsxs("section", { children: [
    /* @__PURE__ */ jsx(SectionHeader, { title: "Settings" }),
    /* @__PURE__ */ jsxs("div", { style: { padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }, children: [
      /* @__PURE__ */ jsx(PlanCard, { data }),
      /* @__PURE__ */ jsx(ChangePasswordCard, { csrfToken }),
      /* @__PURE__ */ jsx(SupportTicketCard, { csrfToken })
    ] })
  ] });
}
const NAV = [
  {
    id: "overview",
    label: "Overview",
    icon: /* @__PURE__ */ jsx("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", width: 15, height: 15, children: /* @__PURE__ */ jsx(
      "path",
      {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 1.5,
        d: "M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-1a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1h-4a1 1 0 01-1-1v-5z"
      }
    ) })
  },
  {
    id: "sites",
    label: "Sites",
    icon: /* @__PURE__ */ jsx("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", width: 15, height: 15, children: /* @__PURE__ */ jsx(
      "path",
      {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 1.5,
        d: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
      }
    ) })
  },
  {
    id: "deploy",
    label: "Deploy",
    icon: /* @__PURE__ */ jsx("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", width: 15, height: 15, children: /* @__PURE__ */ jsx(
      "path",
      {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 1.5,
        d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
      }
    ) })
  },
  {
    id: "dev-tools",
    label: "Dev Tools",
    icon: /* @__PURE__ */ jsx("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", width: 15, height: 15, children: /* @__PURE__ */ jsx(
      "path",
      {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 1.5,
        d: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
      }
    ) })
  },
  {
    id: "env",
    label: "Env Vars",
    icon: /* @__PURE__ */ jsx("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", width: 15, height: 15, children: /* @__PURE__ */ jsx(
      "path",
      {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 1.5,
        d: "M7 21l10-18M3 9h18M3 15h18"
      }
    ) })
  },
  {
    id: "settings",
    label: "Settings",
    icon: /* @__PURE__ */ jsxs("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", width: 15, height: 15, children: [
      /* @__PURE__ */ jsx(
        "path",
        {
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: 1.5,
          d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        }
      ),
      /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" })
    ] })
  }
];
const SECTIONS = {
  overview: OverviewSection,
  sites: SitesSection,
  deploy: DeploySection,
  "dev-tools": DevToolsSection,
  env: EnvSection,
  settings: SettingsSection
};
function DashboardLayout({ data, flashSuccess, flashError }) {
  const [active, setActive] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [localFlashSuccess, setLocalFlashSuccess] = useState(flashSuccess || null);
  const [localFlashError, setLocalFlashError] = useState(flashError || null);
  const ActiveSection = SECTIONS[active] ?? OverviewSection;
  const handleDismissSuccess = () => {
    setLocalFlashSuccess(null);
    window.history.replaceState({}, "", "/dashboard");
  };
  const handleDismissError = () => {
    setLocalFlashError(null);
    window.history.replaceState({}, "", "/dashboard");
  };
  return /* @__PURE__ */ jsx("div", { className: "cb-dashboard-root", children: /* @__PURE__ */ jsx("div", { className: "cb-shell", children: /* @__PURE__ */ jsxs("div", { className: "cb-shell-inner min-h-screen flex flex-col", children: [
    /* @__PURE__ */ jsx("header", { className: "cb-dashboard-header", children: /* @__PURE__ */ jsx("a", { href: "/dashboard", "aria-label": "Clouded Basement Home", className: "flex items-center", children: /* @__PURE__ */ jsx("img", { src: "/CB-logo-icon.svg", alt: "Clouded Basement Logo", className: "h-12 w-auto max-w-[220px]" }) }) }),
    /* @__PURE__ */ jsxs("div", { className: "cb-dashboard-body", children: [
      /* @__PURE__ */ jsx(
        Sidebar,
        {
          nav: NAV,
          active,
          onNav: setActive,
          userEmail: data.userEmail,
          plan: data.plan,
          open: sidebarOpen,
          onToggle: () => setSidebarOpen((o) => !o),
          csrfToken: data.csrfToken
        }
      ),
      /* @__PURE__ */ jsxs("main", { className: "cb-dashboard-main", children: [
        (localFlashSuccess || localFlashError) && /* @__PURE__ */ jsxs("div", { className: "cb-flash-wrap", children: [
          localFlashSuccess && /* @__PURE__ */ jsxs("div", { style: {
            background: "rgba(34,197,94,0.07)",
            border: "1px solid rgba(34,197,94,0.2)",
            borderRadius: "0.5rem",
            padding: "0.625rem 1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            color: "#86efac",
            fontSize: "0.8125rem",
            marginBottom: "0.5rem"
          }, children: [
            /* @__PURE__ */ jsx("span", { style: { flex: 1 }, children: localFlashSuccess }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handleDismissSuccess,
                "aria-label": "Dismiss notification",
                style: { background: "none", border: "none", color: "inherit", cursor: "pointer" },
                children: "x"
              }
            )
          ] }),
          localFlashError && /* @__PURE__ */ jsxs("div", { style: {
            background: "rgba(239,68,68,0.07)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: "0.5rem",
            padding: "0.625rem 1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            color: "#fca5a5",
            fontSize: "0.8125rem",
            marginBottom: "0.5rem"
          }, children: [
            /* @__PURE__ */ jsx("span", { style: { flex: 1 }, children: localFlashError }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handleDismissError,
                "aria-label": "Dismiss notification",
                style: { background: "none", border: "none", color: "inherit", cursor: "pointer" },
                children: "x"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx(ActiveSection, { data, onNav: setActive })
      ] })
    ] })
  ] }) }) });
}
function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const apiQuery = new URLSearchParams();
    if (urlParams.get("demo")) apiQuery.set("demo", urlParams.get("demo"));
    if (urlParams.get("state")) apiQuery.set("state", urlParams.get("state"));
    if (urlParams.get("demoPlan")) apiQuery.set("demoPlan", urlParams.get("demoPlan"));
    const apiUrl = "/api/dashboard" + (apiQuery.toString() ? "?" + apiQuery.toString() : "");
    fetch(apiUrl, { credentials: "same-origin" }).then((r) => {
      if (r.status === 401 || r.status === 302) {
        window.location.href = "/login";
        return null;
      }
      const ct = r.headers.get("content-type") || "";
      if (r.ok && !ct.includes("application/json")) {
        window.location.href = "/login";
        return null;
      }
      if (!r.ok) throw new Error(`Dashboard API error (${r.status}) - is Express running and restarted?`);
      return r.json();
    }).then((json) => {
      if (json) setData(json);
    }).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);
  const params = new URLSearchParams(window.location.search);
  const flashSuccess = params.get("success") || "";
  const flashError = params.get("error") || "";
  if (loading) return /* @__PURE__ */ jsx("div", { className: "cb-screen-state", children: /* @__PURE__ */ jsx("span", { style: { color: "var(--dash-text-muted, #525252)", fontSize: "0.875rem" }, children: "Loading..." }) });
  if (error) return /* @__PURE__ */ jsx("div", { className: "cb-screen-state", children: /* @__PURE__ */ jsx("span", { style: { color: "var(--dash-danger, #ef4444)", fontSize: "0.875rem" }, children: error }) });
  return /* @__PURE__ */ jsx(DashboardLayout, { data, flashSuccess, flashError });
}
export {
  DashboardPage as default
};
