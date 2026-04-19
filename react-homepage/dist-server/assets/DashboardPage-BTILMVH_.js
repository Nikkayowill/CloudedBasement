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
            target: "_blank",
            rel: "noopener noreferrer",
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
      if (!res.ok) {
        setData({ available: false });
        return;
      }
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
function SectionHeader$7({ title }) {
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
      cta: data.emailConfirmed ? { label: "Choose a plan", href: "/pricing" } : void 0,
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
function UpdatesCard({ pendingUpdates = [], updateHistory = [], csrfToken, hasServer }) {
  const [applying, setApplying] = useState(false);
  const [msg, setMsg] = useState(null);
  if (!hasServer || pendingUpdates.length === 0 && updateHistory.length === 0) return null;
  const criticalCount = pendingUpdates.filter((u) => u.is_critical).length;
  async function applyUpdates(e) {
    e.preventDefault();
    if (!window.confirm(`Apply ${pendingUpdates.length} update(s) to your server?`)) return;
    setApplying(true);
    setMsg(null);
    try {
      const body = new URLSearchParams({ _csrf: csrfToken });
      const r = await fetch("/apply-updates", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
      if (!r.ok) {
        let errorText = r.statusText;
        try {
          errorText = await r.text();
        } catch {
        }
        setMsg({ type: "error", text: errorText });
        return;
      }
      const finalUrl = new URL(r.url, window.location.origin);
      const success = finalUrl.searchParams.get("success");
      const warning = finalUrl.searchParams.get("warning");
      const error = finalUrl.searchParams.get("error");
      if (error) setMsg({ type: "error", text: decodeURIComponent(error) });
      else if (warning) setMsg({ type: "warning", text: decodeURIComponent(warning) });
      else setMsg({ type: "success", text: decodeURIComponent(success || "Done.") });
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setApplying(false);
    }
  }
  const msgColor = msg?.type === "error" ? "#ef4444" : msg?.type === "warning" ? "#eab308" : "#22c55e";
  return /* @__PURE__ */ jsxs("div", { style: { border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.625rem", marginBottom: "1.25rem", overflow: "hidden" }, children: [
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.875rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }, children: [
      /* @__PURE__ */ jsx("span", { style: { fontSize: "0.8125rem", fontWeight: 600, color: "var(--dash-text-primary, #fafafa)" }, children: "Server Updates" }),
      pendingUpdates.length > 0 && /* @__PURE__ */ jsxs("span", { style: { fontSize: "0.6875rem", fontWeight: 700, padding: "0.125rem 0.5rem", borderRadius: 999, background: criticalCount > 0 ? "rgba(239,68,68,0.15)" : "rgba(59,130,246,0.15)", color: criticalCount > 0 ? "#f87171" : "#60a5fa" }, children: [
        pendingUpdates.length,
        " available",
        criticalCount > 0 ? ` · ${criticalCount} critical` : ""
      ] })
    ] }),
    pendingUpdates.length > 0 && /* @__PURE__ */ jsxs("div", { style: { padding: "0.75rem 1.25rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }, children: [
      pendingUpdates.slice(0, 5).map((u) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.375rem 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }, children: [
        u.is_critical && /* @__PURE__ */ jsx("span", { style: { fontSize: "0.625rem", fontWeight: 700, padding: "0.1rem 0.35rem", borderRadius: 4, background: "rgba(239,68,68,0.15)", color: "#f87171", flexShrink: 0 }, children: "CRITICAL" }),
        /* @__PURE__ */ jsx("span", { style: { flex: 1, fontSize: "0.8125rem", color: "var(--dash-text-secondary, #a1a1a1)" }, children: u.title }),
        u.version && /* @__PURE__ */ jsxs("span", { style: { fontSize: "0.6875rem", color: "#525252", fontFamily: "JetBrains Mono, monospace" }, children: [
          "v",
          u.version
        ] })
      ] }, u.id)),
      pendingUpdates.length > 5 && /* @__PURE__ */ jsxs("div", { style: { fontSize: "0.75rem", color: "#525252", padding: "0.375rem 0" }, children: [
        "+ ",
        pendingUpdates.length - 5,
        " more"
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { padding: "0.75rem 0" }, children: [
        msg && /* @__PURE__ */ jsx("div", { style: { fontSize: "0.75rem", color: msgColor, marginBottom: "0.5rem" }, children: msg.text }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: applyUpdates,
            disabled: applying,
            style: { padding: "0.4375rem 0.875rem", borderRadius: "0.375rem", background: "#2563eb", border: "none", color: "#fff", fontSize: "0.8125rem", fontWeight: 500, cursor: applying ? "not-allowed" : "pointer", opacity: applying ? 0.7 : 1 },
            children: applying ? "Applying…" : `Apply ${pendingUpdates.length} Update${pendingUpdates.length > 1 ? "s" : ""}`
          }
        )
      ] })
    ] }),
    updateHistory.length > 0 && /* @__PURE__ */ jsx("div", { style: { padding: "0 1.25rem" }, children: updateHistory.slice(0, 5).map((log) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }, children: [
      /* @__PURE__ */ jsx("span", { style: { fontSize: "0.8125rem", color: log.status === "success" ? "var(--dash-text-secondary, #a1a1a1)" : "#f87171" }, children: log.title }),
      /* @__PURE__ */ jsx("span", { style: { fontSize: "0.6875rem", color: log.status === "success" ? "#22c55e" : "#ef4444", fontFamily: "JetBrains Mono, monospace" }, children: log.status })
    ] }, log.id)) })
  ] });
}
const METRICS = [
  { key: "cpu", label: "CPU" },
  { key: "memory", label: "Memory" },
  { key: "disk", label: "Disk" }
];
const DEMO_RULES = [
  { id: 1, metric: "cpu", threshold_pct: 85, state: "armed", triggered_at: null, snoozed_until: null },
  { id: 2, metric: "memory", threshold_pct: 90, state: "triggered", triggered_at: new Date(Date.now() - 5 * 60 * 1e3), snoozed_until: null }
];
const DEMO_HISTORY = [
  { id: 1, metric: "memory", threshold_pct: 90, peak_value: 94.2, event_type: "triggered", channels_notified: ["email", "slack"], dismissed: false, created_at: new Date(Date.now() - 5 * 60 * 1e3) },
  { id: 2, metric: "cpu", threshold_pct: 85, peak_value: 91, event_type: "triggered", channels_notified: ["email"], dismissed: false, created_at: new Date(Date.now() - 3 * 3600 * 1e3) },
  { id: 3, metric: "cpu", threshold_pct: 85, peak_value: 72, event_type: "resolved", channels_notified: [], dismissed: false, created_at: new Date(Date.now() - 3 * 3600 * 1e3 + 10 * 60 * 1e3) }
];
function AlertStateBadge({ state, snoozed_until }) {
  const now = /* @__PURE__ */ new Date();
  const isSnoozed = snoozed_until && new Date(snoozed_until) > now;
  const s = isSnoozed ? { label: "Snoozed", bg: "rgba(234,179,8,0.12)", color: "#fde047", dot: "#eab308" } : state === "triggered" ? { label: "Triggered", bg: "rgba(239,68,68,0.12)", color: "#fca5a5", dot: "#ef4444" } : { label: "Armed", bg: "rgba(34,197,94,0.08)", color: "#86efac", dot: "#22c55e" };
  return /* @__PURE__ */ jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.125rem 0.5rem", borderRadius: 999, background: s.bg }, children: [
    /* @__PURE__ */ jsx("span", { style: {
      width: "0.375rem",
      height: "0.375rem",
      borderRadius: "50%",
      background: s.dot,
      boxShadow: state === "triggered" && !isSnoozed ? `0 0 0 2px rgba(239,68,68,0.25)` : "none"
    } }),
    /* @__PURE__ */ jsx("span", { style: { fontSize: "0.6875rem", fontWeight: 600, color: s.color }, children: s.label })
  ] });
}
function ResourceAlertsCard({ csrfToken, isDemo }) {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(null);
  const [snoozing, setSnoozing] = useState(null);
  const [result, setResult] = useState(null);
  useEffect(() => {
    if (isDemo) {
      setRules(DEMO_RULES);
      setLoading(false);
      return;
    }
    fetch("/api/alert-rules", { credentials: "same-origin" }).then(async (r) => {
      if (!r.ok) throw new Error(`Error ${r.status}`);
      return r.json();
    }).then((d) => setRules(d.rules || [])).catch(() => {
    }).finally(() => setLoading(false));
  }, [isDemo]);
  function ruleFor(metric) {
    return rules.find((r) => r.metric === metric) || null;
  }
  async function save(metric) {
    const pct = parseInt(draft);
    if (isNaN(pct) || pct < 1 || pct > 100) return setResult({ type: "error", message: "Enter a number 1–100." });
    if (isDemo) {
      setRules((prev) => {
        const next = prev.filter((r) => r.metric !== metric);
        return [...next, { id: Date.now(), metric, threshold_pct: pct, state: "armed", triggered_at: null, snoozed_until: null }];
      });
      setEditing(null);
      setDraft("");
      return;
    }
    setSaving(metric);
    setResult(null);
    try {
      const r = await fetch("/api/alert-rules", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
        body: JSON.stringify({ metric, threshold_pct: pct })
      });
      const d = await r.json();
      if (!r.ok) return setResult({ type: "error", message: d.error || "Failed to save." });
      setRules((prev) => {
        const next = prev.filter((r2) => r2.metric !== metric);
        return [...next, d.rule];
      });
      setEditing(null);
      setDraft("");
      setResult({ type: "success", message: `${metric.toUpperCase()} alert set at ${pct}%.` });
    } catch {
      setResult({ type: "error", message: "Network error." });
    } finally {
      setSaving(null);
    }
  }
  async function remove(metric) {
    if (isDemo) {
      setRules((prev) => prev.filter((r) => r.metric !== metric));
      return;
    }
    setSaving(metric);
    setResult(null);
    try {
      const r = await fetch(`/api/alert-rules/${metric}`, { method: "DELETE", credentials: "same-origin", headers: { "x-csrf-token": csrfToken } });
      if (!r.ok) {
        let msg = `Error ${r.status}`;
        try {
          const d = await r.json();
          if (d?.error) msg = d.error;
        } catch {
        }
        return setResult({ type: "error", message: msg });
      }
      setRules((prev) => prev.filter((r2) => r2.metric !== metric));
    } catch {
      setResult({ type: "error", message: "Network error." });
    } finally {
      setSaving(null);
    }
  }
  async function snooze(rule, minutes) {
    if (isDemo) {
      setRules((prev) => prev.map((r) => r.id === rule.id ? { ...r, snoozed_until: new Date(Date.now() + minutes * 60 * 1e3) } : r));
      return;
    }
    setSnoozing(rule.id);
    setResult(null);
    try {
      const r = await fetch(`/api/alert-rules/${rule.id}/snooze`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
        body: JSON.stringify({ minutes })
      });
      const d = await r.json();
      if (!r.ok) return setResult({ type: "error", message: d.error || "Failed to snooze." });
      const snoozedUntil = d.rule?.snoozed_until ?? d.snoozed_until ?? null;
      if (snoozedUntil !== null) setRules((prev) => prev.map((r2) => r2.id === rule.id ? { ...r2, snoozed_until: snoozedUntil } : r2));
      setResult({ type: "success", message: `Snoozed for ${minutes >= 60 ? `${minutes / 60}h` : `${minutes}m`}.` });
    } catch {
      setResult({ type: "error", message: "Network error." });
    } finally {
      setSnoozing(null);
    }
  }
  if (loading) return null;
  return /* @__PURE__ */ jsxs("div", { style: { border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.625rem", overflow: "hidden", marginBottom: "1.25rem" }, children: [
    /* @__PURE__ */ jsxs("div", { style: { padding: "0.875rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
      /* @__PURE__ */ jsx("span", { style: { fontSize: "0.8125rem", fontWeight: 500, color: "var(--dash-text-primary, #fafafa)" }, children: "Resource Alerts" }),
      /* @__PURE__ */ jsx("span", { style: { fontSize: "0.75rem", color: "var(--dash-text-muted, #525252)" }, children: "Email · Slack · Discord" })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { padding: "0.75rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }, children: [
      METRICS.map(({ key, label }) => {
        const rule = ruleFor(key);
        const isSnoozed = rule?.snoozed_until && new Date(rule.snoozed_until) > /* @__PURE__ */ new Date();
        return /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "0.375rem" }, children: [
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }, children: [
            /* @__PURE__ */ jsx("span", { style: { fontSize: "0.8125rem", color: "var(--dash-text-secondary, #a1a1a1)", minWidth: "4rem" }, children: label }),
            editing === key ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  min: "1",
                  max: "100",
                  value: draft,
                  onChange: (e) => setDraft(e.target.value),
                  onKeyDown: (e) => {
                    if (e.key === "Enter") save(key);
                    if (e.key === "Escape") {
                      setEditing(null);
                      setDraft("");
                    }
                  },
                  autoFocus: true,
                  style: { width: "5rem", padding: "0.25rem 0.5rem", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(59,130,246,0.4)", borderRadius: "0.25rem", color: "var(--dash-text-primary, #fafafa)", fontSize: "0.8125rem", fontFamily: "JetBrains Mono, monospace", outline: "none" }
                }
              ),
              /* @__PURE__ */ jsx("span", { style: { fontSize: "0.8125rem", color: "var(--dash-text-muted, #525252)" }, children: "%" }),
              /* @__PURE__ */ jsx("button", { onClick: () => save(key), disabled: !!saving, style: { padding: "0.2rem 0.625rem", background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "0.25rem", color: "#60a5fa", fontSize: "0.75rem", cursor: "pointer" }, children: saving === key ? "…" : "Save" }),
              /* @__PURE__ */ jsx("button", { onClick: () => {
                setEditing(null);
                setDraft("");
              }, style: { padding: "0.2rem 0.5rem", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.25rem", color: "var(--dash-text-muted, #525252)", fontSize: "0.75rem", cursor: "pointer" }, children: "Cancel" })
            ] }) : rule ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsxs("span", { style: { fontSize: "0.8125rem", fontFamily: "JetBrains Mono, monospace", color: metricColor(rule.threshold_pct) }, children: [
                "≥ ",
                rule.threshold_pct,
                "%"
              ] }),
              /* @__PURE__ */ jsx(AlertStateBadge, { state: rule.state, snoozed_until: rule.snoozed_until }),
              /* @__PURE__ */ jsx("button", { onClick: () => {
                setEditing(key);
                setDraft(String(rule.threshold_pct));
              }, style: { padding: "0.2rem 0.5rem", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.25rem", color: "var(--dash-text-secondary, #a1a1a1)", fontSize: "0.75rem", cursor: "pointer" }, children: "Edit" }),
              /* @__PURE__ */ jsx("button", { onClick: () => remove(key), disabled: !!saving, style: { padding: "0.2rem 0.5rem", background: "transparent", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "0.25rem", color: "#f87171", fontSize: "0.75rem", cursor: "pointer" }, children: "Remove" })
            ] }) : /* @__PURE__ */ jsx("button", { onClick: () => {
              setEditing(key);
              setDraft("80");
            }, style: { padding: "0.2rem 0.75rem", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.25rem", color: "var(--dash-text-muted, #525252)", fontSize: "0.75rem", cursor: "pointer" }, children: "+ Set alert" })
          ] }),
          rule && rule.state === "triggered" && !isSnoozed && /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.5rem", marginLeft: "4.75rem", flexWrap: "wrap" }, children: [
            /* @__PURE__ */ jsx("span", { style: { fontSize: "0.6875rem", color: "var(--dash-text-muted, #525252)" }, children: "Snooze:" }),
            [60, 240, 1440].map((mins) => /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => snooze(rule, mins),
                disabled: snoozing === rule.id,
                style: { padding: "0.125rem 0.5rem", background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)", borderRadius: "0.25rem", color: "#fde047", fontSize: "0.6875rem", cursor: "pointer" },
                children: snoozing === rule.id ? "…" : mins >= 1440 ? "24h" : mins >= 60 ? `${mins / 60}h` : `${mins}m`
              },
              mins
            ))
          ] })
        ] }, key);
      }),
      result && /* @__PURE__ */ jsx("p", { style: { fontSize: "0.75rem", color: result.type === "success" ? "#86efac" : "#fca5a5", marginTop: "0.25rem" }, children: result.message })
    ] })
  ] });
}
function AlertHistoryCard({ csrfToken, isDemo }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissing, setDismissing] = useState(null);
  useEffect(() => {
    if (isDemo) {
      setHistory(DEMO_HISTORY);
      setLoading(false);
      return;
    }
    fetch("/api/alert-history", { credentials: "same-origin" }).then(async (r) => {
      if (!r.ok) throw new Error();
      return r.json();
    }).then((d) => setHistory(d.history || [])).catch(() => {
    }).finally(() => setLoading(false));
  }, [isDemo]);
  async function dismiss(id) {
    if (isDemo) {
      setHistory((prev) => prev.map((h) => h.id === id ? { ...h, dismissed: true } : h));
      return;
    }
    setDismissing(id);
    try {
      const r = await fetch(`/api/alert-history/${id}/dismiss`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "x-csrf-token": csrfToken }
      });
      if (r.ok) setHistory((prev) => prev.map((h) => h.id === id ? { ...h, dismissed: true } : h));
    } catch {
    } finally {
      setDismissing(null);
    }
  }
  if (loading || history.length === 0) return null;
  const visible = history.filter((h) => !h.dismissed);
  if (visible.length === 0) return null;
  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 6e4);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }
  return /* @__PURE__ */ jsxs("div", { style: { border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.625rem", overflow: "hidden", marginBottom: "1.25rem" }, children: [
    /* @__PURE__ */ jsxs("div", { style: { padding: "0.875rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
      /* @__PURE__ */ jsx("span", { style: { fontSize: "0.8125rem", fontWeight: 500, color: "var(--dash-text-primary, #fafafa)" }, children: "Alert History" }),
      /* @__PURE__ */ jsx("span", { style: { fontSize: "0.6875rem", color: "var(--dash-text-muted, #525252)" }, children: "Last 30 events" })
    ] }),
    /* @__PURE__ */ jsx("div", { style: { padding: "0.375rem 0" }, children: visible.map((entry) => {
      const isTriggered = entry.event_type === "triggered";
      const channels = (entry.channels_notified || []).filter(Boolean);
      return /* @__PURE__ */ jsxs("div", { style: {
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.5rem 1.25rem",
        borderBottom: "1px solid rgba(255,255,255,0.04)"
      }, children: [
        /* @__PURE__ */ jsx("span", { style: { width: "0.5rem", height: "0.5rem", borderRadius: "50%", flexShrink: 0, background: isTriggered ? "#ef4444" : "#22c55e" } }),
        /* @__PURE__ */ jsxs("span", { style: { fontSize: "0.8125rem", color: "var(--dash-text-secondary, #a1a1a1)", minWidth: "5rem", textTransform: "capitalize" }, children: [
          entry.metric,
          " ",
          isTriggered ? `↑ ${entry.peak_value ?? "—"}%` : `↓ ${entry.peak_value ?? "—"}%`
        ] }),
        /* @__PURE__ */ jsx("span", { style: { fontSize: "0.6875rem", fontWeight: 600, padding: "0.125rem 0.4rem", borderRadius: 4, background: isTriggered ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.1)", color: isTriggered ? "#fca5a5" : "#86efac", flexShrink: 0 }, children: isTriggered ? "Triggered" : "Resolved" }),
        channels.length > 0 && /* @__PURE__ */ jsxs("span", { style: { fontSize: "0.6875rem", color: "var(--dash-text-muted, #525252)", fontFamily: "JetBrains Mono, monospace" }, children: [
          "via ",
          channels.join(", ")
        ] }),
        /* @__PURE__ */ jsx("span", { style: { fontSize: "0.6875rem", color: "var(--dash-text-muted, #525252)", marginLeft: "auto", flexShrink: 0 }, children: timeAgo(entry.created_at) }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => dismiss(entry.id),
            disabled: dismissing === entry.id,
            title: "Dismiss",
            style: { background: "transparent", border: "none", color: "var(--dash-text-muted, #525252)", cursor: "pointer", fontSize: "0.875rem", padding: "0 0.25rem", flexShrink: 0, lineHeight: 1 },
            children: "×"
          }
        )
      ] }, entry.id);
    }) })
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
    uptimeStatus = {},
    pendingUpdates = [],
    updateHistory = []
  } = data;
  const atLimit = siteCount >= siteLimit;
  return /* @__PURE__ */ jsxs("section", { children: [
    /* @__PURE__ */ jsx(SectionHeader$7, { title: "Overview" }),
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
        !hasPaid && /* @__PURE__ */ jsx("a", { href: "/pricing", style: {
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
      hasServer && serverStatus === "running" && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(ResourceAlertsCard, { csrfToken, isDemo: !!data.isDemo }),
        /* @__PURE__ */ jsx(AlertHistoryCard, { csrfToken, isDemo: !!data.isDemo })
      ] }),
      hasServer && /* @__PURE__ */ jsx(UptimeSummaryCard, { uptimeStatus }),
      /* @__PURE__ */ jsx(UpdatesCard, { pendingUpdates, updateHistory, csrfToken, hasServer }),
      (hasServer || isProvisioning) && /* @__PURE__ */ jsxs("div", { style: { border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.625rem" }, children: [
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
function SectionHeader$6({ title }) {
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
    /* @__PURE__ */ jsx(SectionHeader$6, { title: "Domains" }),
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
function SectionHeader$5({ title }) {
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
function formatDate$1(ts) {
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
          /* @__PURE__ */ jsx("span", { style: { fontSize: "0.6875rem", color: "var(--dash-text-muted, #525252)" }, children: formatDate$1(dep.deployed_at || dep.created_at) })
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
  const [startCommand, setStartCommand] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const atLimit = siteCount >= siteLimit;
  if (!hasServer) {
    return /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx(SectionHeader$5, { title: "Deploy" }),
      /* @__PURE__ */ jsx("div", { style: { padding: "1.5rem" }, children: /* @__PURE__ */ jsxs("div", { style: {
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "0.625rem",
        padding: "2.5rem 1.5rem",
        textAlign: "center"
      }, children: [
        /* @__PURE__ */ jsx("p", { style: { fontSize: "0.9375rem", fontWeight: 500, color: "var(--dash-text-secondary, #a1a1a1)", marginBottom: "0.375rem" }, children: "No server yet" }),
        /* @__PURE__ */ jsx("p", { style: { fontSize: "0.8125rem", color: "var(--dash-text-muted, #525252)", marginBottom: "1.25rem" }, children: "You need an active server to deploy apps." }),
        /* @__PURE__ */ jsx("a", { href: "/pricing", style: {
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
    /* @__PURE__ */ jsx(SectionHeader$5, { title: "Deploy" }),
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
          /* @__PURE__ */ jsx("a", { href: "/pricing", style: {
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
          /* @__PURE__ */ jsxs("div", { style: { marginTop: "0.625rem" }, children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => setShowAdvanced((s) => !s),
                style: {
                  background: "none",
                  border: "none",
                  padding: 0,
                  fontSize: "0.6875rem",
                  color: "var(--dash-text-muted, #525252)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem"
                },
                children: [
                  /* @__PURE__ */ jsx("span", { style: { fontSize: "0.5rem" }, children: showAdvanced ? "▲" : "▼" }),
                  "Advanced options"
                ]
              }
            ),
            showAdvanced && /* @__PURE__ */ jsxs("div", { style: { marginTop: "0.625rem" }, children: [
              /* @__PURE__ */ jsxs("label", { style: { display: "block", fontSize: "0.6875rem", color: "var(--dash-text-muted, #525252)", marginBottom: "0.3125rem" }, children: [
                "Custom startup command ",
                /* @__PURE__ */ jsx("span", { style: { color: "var(--dash-text-muted, #525252)", fontWeight: 400 }, children: "(optional — overrides default)" })
              ] }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: startCommand,
                  onChange: (e) => setStartCommand(e.target.value),
                  placeholder: "node server.js  or  npm start",
                  style: {
                    width: "100%",
                    padding: "0.4375rem 0.75rem",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "0.375rem",
                    color: "var(--dash-text-primary, #fafafa)",
                    fontSize: "0.8125rem",
                    outline: "none",
                    fontFamily: "JetBrains Mono, monospace",
                    boxSizing: "border-box"
                  },
                  onFocus: (e) => {
                    e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)";
                  },
                  onBlur: (e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  }
                }
              ),
              /* @__PURE__ */ jsxs("p", { style: { marginTop: "0.3rem", fontSize: "0.6875rem", color: "var(--dash-text-muted, #525252)" }, children: [
                "e.g. ",
                /* @__PURE__ */ jsx("code", { style: { fontFamily: "JetBrains Mono, monospace" }, children: "node dist/server.js" }),
                " or ",
                /* @__PURE__ */ jsx("code", { style: { fontFamily: "JetBrains Mono, monospace" }, children: "gunicorn main:app" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("p", { style: { marginTop: "0.5rem", fontSize: "0.6875rem", color: "var(--dash-text-muted, #525252)" }, children: [
            "Deploying an existing repo will trigger a redeploy. ",
            siteCount,
            "/",
            siteLimit,
            " sites used.",
            /* @__PURE__ */ jsx("input", { type: "hidden", name: "start_command", value: startCommand })
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
function SectionHeader$4({ title }) {
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
function DatabaseSetupCard({ csrfToken, isDemo }) {
  const [busy, setBusy] = useState(null);
  const [result, setResult] = useState(null);
  async function install(dbType) {
    setBusy(dbType);
    setResult(null);
    if (isDemo) {
      await new Promise((r) => setTimeout(r, 1200));
      setBusy(null);
      setResult({ type: "success", message: `${dbType === "postgres" ? "PostgreSQL" : "MongoDB"} installation started. Refresh in 2–3 minutes.` });
      return;
    }
    try {
      const body = new URLSearchParams({ database_type: dbType, _csrf: csrfToken });
      const r = await fetch("/setup-database", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString()
      });
      if (r.redirected || r.ok) {
        setResult({ type: "success", message: `${dbType === "postgres" ? "PostgreSQL" : "MongoDB"} installation started. Refresh in 2–3 minutes.` });
      } else {
        setResult({ type: "error", message: `Server error: ${r.status}` });
      }
    } catch {
      setResult({ type: "error", message: "Network error. Try again." });
    } finally {
      setBusy(null);
    }
  }
  return /* @__PURE__ */ jsxs("div", { style: { border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.625rem", overflow: "hidden" }, children: [
    /* @__PURE__ */ jsxs("div", { style: { padding: "0.875rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }, children: [
      /* @__PURE__ */ jsx("span", { style: { fontSize: "0.8125rem", fontWeight: 500, color: "var(--dash-text-primary, #fafafa)" }, children: "Install a Database" }),
      /* @__PURE__ */ jsx("p", { style: { fontSize: "0.75rem", color: "var(--dash-text-muted, #525252)", marginTop: "0.1875rem" }, children: "One-click installation directly on your server. Credentials are stored securely." })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }, children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "0.75rem", flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => install("postgres"),
            disabled: !!busy,
            style: {
              padding: "0.5rem 1.125rem",
              borderRadius: "0.375rem",
              background: "rgba(59,130,246,0.1)",
              border: "1px solid rgba(59,130,246,0.25)",
              color: "#60a5fa",
              fontSize: "0.8125rem",
              fontWeight: 500,
              cursor: busy ? "wait" : "pointer",
              opacity: busy ? 0.7 : 1
            },
            children: busy === "postgres" ? "Installing…" : "Install PostgreSQL"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => install("mongodb"),
            disabled: !!busy,
            style: {
              padding: "0.5rem 1.125rem",
              borderRadius: "0.375rem",
              background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.2)",
              color: "#86efac",
              fontSize: "0.8125rem",
              fontWeight: 500,
              cursor: busy ? "wait" : "pointer",
              opacity: busy ? 0.7 : 1
            },
            children: busy === "mongodb" ? "Installing…" : "Install MongoDB"
          }
        )
      ] }),
      result && /* @__PURE__ */ jsx("p", { style: { fontSize: "0.8125rem", color: result.type === "success" ? "#86efac" : "#fca5a5", margin: 0, lineHeight: 1.5 }, children: result.message })
    ] })
  ] });
}
function DatabaseBackupCard({ csrfToken, postgresInstalled, mongodbInstalled, isDemo }) {
  const [busy, setBusy] = useState(null);
  const [result, setResult] = useState(null);
  async function runBackup(dbType) {
    setBusy(dbType);
    setResult(null);
    if (isDemo) {
      await new Promise((r) => setTimeout(r, 1200));
      setBusy(null);
      setResult({ type: "success", message: `Backup saved to /root/db-backups/${dbType === "postgres" ? "pg-app_db" : "mongo"}-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.${dbType === "postgres" ? "sql.gz" : "tar.gz"}` });
      return;
    }
    try {
      const r = await fetch("/api/backup-database", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
        body: JSON.stringify({ db_type: dbType })
      });
      let d = null;
      try {
        d = await r.json();
      } catch {
      }
      if (r.ok) {
        if (d?.success) setResult({ type: "success", message: d.message });
        else setResult({ type: "error", message: d?.error || (d ? "Backup failed." : "Invalid response format.") });
      } else {
        setResult({ type: "error", message: d?.error || `Server error: ${r.status}` });
      }
    } catch {
      setResult({ type: "error", message: "Network error." });
    } finally {
      setBusy(null);
    }
  }
  return /* @__PURE__ */ jsxs("div", { style: { border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.625rem", overflow: "hidden" }, children: [
    /* @__PURE__ */ jsxs("div", { style: { padding: "0.875rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }, children: [
      /* @__PURE__ */ jsx("span", { style: { fontSize: "0.8125rem", fontWeight: 500, color: "var(--dash-text-primary, #fafafa)" }, children: "Database Backups" }),
      /* @__PURE__ */ jsxs("p", { style: { fontSize: "0.75rem", color: "var(--dash-text-muted, #525252)", marginTop: "0.1875rem" }, children: [
        "Stored in ",
        /* @__PURE__ */ jsx("code", { style: MONO, children: "/root/db-backups/" }),
        " on your server · 7-day retention"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }, children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "0.75rem", flexWrap: "wrap" }, children: [
        postgresInstalled && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => runBackup("postgres"),
            disabled: !!busy,
            style: {
              padding: "0.5rem 1.125rem",
              borderRadius: "0.375rem",
              background: "rgba(59,130,246,0.1)",
              border: "1px solid rgba(59,130,246,0.25)",
              color: "#60a5fa",
              fontSize: "0.8125rem",
              fontWeight: 500,
              cursor: busy ? "wait" : "pointer",
              opacity: busy ? 0.7 : 1
            },
            children: busy === "postgres" ? "Backing up…" : "Backup PostgreSQL"
          }
        ),
        mongodbInstalled && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => runBackup("mongodb"),
            disabled: !!busy,
            style: {
              padding: "0.5rem 1.125rem",
              borderRadius: "0.375rem",
              background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.2)",
              color: "#86efac",
              fontSize: "0.8125rem",
              fontWeight: 500,
              cursor: busy ? "wait" : "pointer",
              opacity: busy ? 0.7 : 1
            },
            children: busy === "mongodb" ? "Backing up…" : "Backup MongoDB"
          }
        )
      ] }),
      result && /* @__PURE__ */ jsx("p", { style: { fontSize: "0.8125rem", color: result.type === "success" ? "#86efac" : "#fca5a5", margin: 0, lineHeight: 1.5 }, children: result.message }),
      /* @__PURE__ */ jsx("p", { style: { fontSize: "0.75rem", color: "var(--dash-text-muted, #525252)", lineHeight: 1.5 }, children: "Backups also run automatically every 24 hours. A confirmation email is sent on completion." })
    ] })
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
      /* @__PURE__ */ jsx(SectionHeader$4, { title: "Dev Tools" }),
      /* @__PURE__ */ jsx("div", { style: { padding: "1.5rem" }, children: /* @__PURE__ */ jsxs("div", { style: {
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "0.625rem",
        padding: "2.5rem 1.5rem",
        textAlign: "center"
      }, children: [
        /* @__PURE__ */ jsx("p", { style: { fontSize: "0.9375rem", fontWeight: 500, color: "var(--dash-text-secondary, #a1a1a1)", marginBottom: "0.375rem" }, children: "No server yet" }),
        /* @__PURE__ */ jsx("p", { style: { fontSize: "0.8125rem", color: "var(--dash-text-muted, #525252)", marginBottom: "1.25rem" }, children: "SSH access, database credentials, and environment tools appear here once your server is provisioned." }),
        /* @__PURE__ */ jsx("a", { href: "/pricing", style: {
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
    /* @__PURE__ */ jsx(SectionHeader$4, { title: "Dev Tools" }),
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
      !postgresInstalled && !mongodbInstalled && /* @__PURE__ */ jsx(DatabaseSetupCard, { csrfToken: data.csrfToken, isDemo: !!data.isDemo }),
      (postgresInstalled || mongodbInstalled) && /* @__PURE__ */ jsx(
        DatabaseBackupCard,
        {
          csrfToken: data.csrfToken,
          postgresInstalled,
          mongodbInstalled,
          isDemo: !!data.isDemo
        }
      )
    ] })
  ] });
}
function SectionHeader$3({ title }) {
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
function BulkImportCard({ csrfToken, onImported }) {
  const [text, setText] = useState("");
  const [importing, setImp] = useState(false);
  const [progress, setProgress] = useState(null);
  const isMounted = useRef(true);
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  function parseLines(raw) {
    const pairs = [];
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (val.startsWith('"') && val.endsWith('"') || val.startsWith("'") && val.endsWith("'")) {
        val = val.slice(1, -1);
      }
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
      pairs.push({ key: key.toUpperCase(), value: val });
    }
    return pairs;
  }
  async function handleImport(e) {
    e.preventDefault();
    const pairs = parseLines(text);
    if (pairs.length === 0) return;
    setImp(true);
    setProgress({ done: 0, total: pairs.length, errors: 0 });
    const saved = [];
    let errors = 0;
    for (const { key, value } of pairs) {
      try {
        const r = await fetch("/api/env-vars", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
          body: JSON.stringify({ key, value })
        });
        const d = await r.json();
        if (r.ok && d.envVar) saved.push(d.envVar);
        else errors++;
      } catch {
        errors++;
      }
      setProgress((p) => ({ ...p, done: p.done + 1, errors }));
    }
    if (!isMounted.current) return;
    if (saved.length > 0) onImported(saved);
    if (errors === 0) setText("");
    setImp(false);
  }
  const preview = parseLines(text);
  return /* @__PURE__ */ jsx(CardShell$1, { title: "Bulk Import", subtitle: "Paste a .env file to import multiple variables at once", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleImport, style: { display: "flex", flexDirection: "column", gap: "0.875rem" }, children: [
    /* @__PURE__ */ jsx(
      "textarea",
      {
        id: "env-vars-input",
        "aria-label": "Environment variables input",
        value: text,
        onChange: (e) => {
          setText(e.target.value);
          setProgress(null);
        },
        placeholder: "DATABASE_URL=postgres://user:pass@host/db\nREDIS_URL=redis://localhost:6379\nSECRET_KEY=your-secret-here",
        rows: 6,
        style: {
          width: "100%",
          padding: "0.625rem 0.75rem",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "0.375rem",
          color: "var(--dash-text-primary, #fafafa)",
          fontSize: "0.8125rem",
          fontFamily: "JetBrains Mono, monospace",
          outline: "none",
          resize: "vertical",
          minHeight: "7rem",
          lineHeight: 1.6,
          boxSizing: "border-box"
        }
      }
    ),
    text && preview.length > 0 && /* @__PURE__ */ jsxs("p", { style: { fontSize: "0.75rem", color: "var(--dash-text-muted, #525252)" }, children: [
      preview.length,
      " variable",
      preview.length !== 1 ? "s" : "",
      " detected: ",
      preview.slice(0, 5).map((p) => p.key).join(", "),
      preview.length > 5 ? ` +${preview.length - 5} more` : ""
    ] }),
    progress && /* @__PURE__ */ jsx("p", { style: { fontSize: "0.75rem", color: progress.errors > 0 ? "#fca5a5" : "#86efac" }, children: importing ? `Importing… ${progress.done} / ${progress.total}` : `Done — ${progress.done - progress.errors} saved${progress.errors > 0 ? `, ${progress.errors} failed` : ""}.` }),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "submit",
        disabled: importing || preview.length === 0,
        style: {
          alignSelf: "flex-start",
          padding: "0.4375rem 1rem",
          borderRadius: "0.375rem",
          background: importing || preview.length === 0 ? "rgba(59,130,246,0.2)" : "rgba(59,130,246,0.15)",
          border: "1px solid rgba(59,130,246,0.35)",
          color: "#60a5fa",
          fontSize: "0.8125rem",
          fontWeight: 500,
          cursor: importing || preview.length === 0 ? "not-allowed" : "pointer",
          opacity: importing || preview.length === 0 ? 0.6 : 1
        },
        children: importing ? `Importing ${progress?.done}/${progress?.total}…` : `Import ${preview.length > 0 ? preview.length : ""} Variable${preview.length !== 1 ? "s" : ""}`
      }
    )
  ] }) });
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
      /* @__PURE__ */ jsx(SectionHeader$3, { title: "Environment Variables" }),
      /* @__PURE__ */ jsx("div", { style: { padding: "1.5rem" }, children: /* @__PURE__ */ jsxs("div", { style: {
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "0.625rem",
        padding: "2.5rem 1.5rem",
        textAlign: "center"
      }, children: [
        /* @__PURE__ */ jsx("p", { style: { fontSize: "0.9375rem", fontWeight: 500, color: "var(--dash-text-secondary, #a1a1a1)", marginBottom: "0.375rem" }, children: "No server yet" }),
        /* @__PURE__ */ jsx("p", { style: { fontSize: "0.8125rem", color: "var(--dash-text-muted, #525252)", marginBottom: "1.25rem" }, children: "Environment variables are injected into your deployments at build time." }),
        /* @__PURE__ */ jsx("a", { href: "/pricing", style: {
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
    /* @__PURE__ */ jsx(SectionHeader$3, { title: "Environment Variables" }),
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
      /* @__PURE__ */ jsx(BulkImportCard, { csrfToken, onImported: (vars) => {
        setEnvVars((prev) => {
          let updated = [...prev];
          for (const v of vars) {
            const idx = updated.findIndex((x) => x.key === v.key);
            if (idx >= 0) updated[idx] = v;
            else updated.push(v);
          }
          return updated.sort((a, b) => a.key.localeCompare(b.key));
        });
      } }),
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
function SectionHeader$2({ title }) {
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
  const [confirm2, setConfirm] = useState("");
  const [submitting, setSub] = useState(false);
  const [result, setResult] = useState(null);
  async function submit(e) {
    e.preventDefault();
    if (next !== confirm2) {
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
          value: confirm2,
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
function BillingUsageCard() {
  const [loading, setLoading] = useState(true);
  const [unavailableReason, setUnavailableReason] = useState("");
  const [usage, setUsage] = useState(null);
  useEffect(() => {
    let active = true;
    fetch("/api/billing/usage", { credentials: "same-origin" }).then(async (r) => {
      if (!r.ok) {
        if (r.status >= 400) {
          throw new Error("BILLING_UNAVAILABLE");
        }
        throw new Error(`HTTP ${r.status}`);
      }
      return r.json();
    }).then((d) => {
      if (!active) return;
      setUsage(d);
    }).catch((err) => {
      if (!active) return;
      if (err?.message === "BILLING_UNAVAILABLE") {
        setUsage({
          current_plan: null,
          has_subscription: false,
          total_paid_cents: 0,
          monthly_breakdown: [],
          recent_payments: []
        });
        setUnavailableReason("Billing summary is not available yet.");
        return;
      }
      setUsage({
        current_plan: null,
        has_subscription: false,
        total_paid_cents: 0,
        monthly_breakdown: [],
        recent_payments: []
      });
      setUnavailableReason("Billing summary is temporarily unavailable.");
      console.warn("[BILLING] Unable to load billing summary:", err?.message || err);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);
  if (loading) {
    return /* @__PURE__ */ jsx(CardShell, { title: "Billing Snapshot", children: /* @__PURE__ */ jsx("p", { style: { fontSize: "0.8125rem", color: "var(--dash-text-muted, #525252)" }, children: "Loading billing summary…" }) });
  }
  const totalPaid = ((usage?.total_paid_cents || 0) / 100).toFixed(2);
  const recentPayments = usage?.recent_payments || [];
  const monthly = usage?.monthly_breakdown || [];
  const billingLabel = usage?.is_trial ? "Trial" : usage?.has_subscription ? `${usage?.payment_interval === "yearly" ? "Yearly" : "Monthly"} recurring` : "No recurring billing";
  return /* @__PURE__ */ jsxs(CardShell, { title: "Billing Snapshot", children: [
    /* @__PURE__ */ jsxs("div", { style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(10rem, 1fr))",
      gap: "0.75rem",
      marginBottom: "1rem"
    }, children: [
      /* @__PURE__ */ jsxs("div", { style: { padding: "0.75rem", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.5rem" }, children: [
        /* @__PURE__ */ jsx("div", { style: { fontSize: "0.6875rem", color: "var(--dash-text-muted, #525252)", marginBottom: "0.25rem" }, children: "Current plan" }),
        /* @__PURE__ */ jsx("div", { style: { fontSize: "0.875rem", fontWeight: 600, color: "var(--dash-text-primary, #fafafa)", textTransform: "capitalize" }, children: usage?.current_plan || "—" })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { padding: "0.75rem", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.5rem" }, children: [
        /* @__PURE__ */ jsx("div", { style: { fontSize: "0.6875rem", color: "var(--dash-text-muted, #525252)", marginBottom: "0.25rem" }, children: "Total paid" }),
        /* @__PURE__ */ jsxs("div", { style: { fontSize: "0.875rem", fontWeight: 600, color: "#fbbf24" }, children: [
          "$",
          totalPaid
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { padding: "0.75rem", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.5rem" }, children: [
        /* @__PURE__ */ jsx("div", { style: { fontSize: "0.6875rem", color: "var(--dash-text-muted, #525252)", marginBottom: "0.25rem" }, children: "Billing model" }),
        /* @__PURE__ */ jsx("div", { style: { fontSize: "0.875rem", fontWeight: 600, color: usage?.has_subscription ? "#86efac" : "var(--dash-text-secondary, #a1a1a1)" }, children: billingLabel })
      ] })
    ] }),
    /* @__PURE__ */ jsx("p", { style: { fontSize: "0.75rem", color: "var(--dash-text-muted, #525252)", marginBottom: "0.75rem", lineHeight: 1.5 }, children: "This helps you confirm successful charges, detect failed renewals, and view payment history in one place." }),
    unavailableReason && /* @__PURE__ */ jsx("p", { style: { fontSize: "0.75rem", color: "var(--dash-text-muted, #525252)", marginBottom: "0.75rem" }, children: unavailableReason }),
    recentPayments.length > 0 && /* @__PURE__ */ jsxs("div", { style: { marginBottom: "0.75rem" }, children: [
      /* @__PURE__ */ jsx("div", { style: { fontSize: "0.6875rem", color: "var(--dash-text-muted, #525252)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }, children: "Recent payments" }),
      /* @__PURE__ */ jsx("div", { style: { display: "flex", flexDirection: "column", gap: "0.375rem" }, children: recentPayments.slice(0, 5).map((p) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.75rem", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "0.25rem" }, children: [
        /* @__PURE__ */ jsx("span", { style: { color: "var(--dash-text-secondary, #a1a1a1)", textTransform: "capitalize" }, children: p.plan || "plan" }),
        /* @__PURE__ */ jsxs("span", { style: { color: "#fbbf24" }, children: [
          "$",
          ((p.amount || 0) / 100).toFixed(2)
        ] }),
        /* @__PURE__ */ jsx("span", { style: { color: "var(--dash-text-muted, #525252)", textTransform: "capitalize" }, children: p.status || "unknown" })
      ] }, p.id)) })
    ] }),
    monthly.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("div", { style: { fontSize: "0.6875rem", color: "var(--dash-text-muted, #525252)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }, children: "Monthly totals" }),
      /* @__PURE__ */ jsx("div", { style: { display: "flex", flexDirection: "column", gap: "0.25rem" }, children: monthly.slice(0, 4).map((m) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.75rem" }, children: [
        /* @__PURE__ */ jsx("span", { style: { color: "var(--dash-text-secondary, #a1a1a1)" }, children: m.month }),
        /* @__PURE__ */ jsxs("span", { style: { color: "#fbbf24" }, children: [
          "$",
          ((m.total_cents || 0) / 100).toFixed(2)
        ] })
      ] }, m.month)) })
    ] })
  ] });
}
function WebhookCard({ csrfToken, notifyWebhookUrl }) {
  const [url, setUrl] = useState(notifyWebhookUrl || "");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setResult(null);
    try {
      const r = await fetch("/set-notify-webhook", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ _csrf: csrfToken, webhookUrl: url.trim() })
      });
      const json = await r.json();
      if (json.success) setResult({ type: "success", message: json.message });
      else setResult({ type: "error", message: json.error || "Failed to save." });
    } catch {
      setResult({ type: "error", message: "Network error." });
    } finally {
      setSaving(false);
    }
  }
  return /* @__PURE__ */ jsxs(CardShell, { title: "Deploy Notifications", children: [
    /* @__PURE__ */ jsx("p", { style: { fontSize: "0.8125rem", color: "var(--dash-text-secondary, #a1a1a1)", marginBottom: "1rem", lineHeight: 1.5 }, children: "Post a JSON payload to a URL on every deploy success or failure. Works with Slack, Discord, or any custom endpoint." }),
    /* @__PURE__ */ jsxs("form", { onSubmit: save, style: { display: "flex", flexDirection: "column", gap: "0.875rem" }, children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { style: labelStyle, children: "Webhook URL (https:// only)" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "url",
            value: url,
            onChange: (e) => setUrl(e.target.value),
            placeholder: "https://hooks.slack.com/services/…",
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
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "0.625rem" }, children: [
        /* @__PURE__ */ jsx("button", { type: "submit", disabled: saving, style: {
          padding: "0.5rem 1.125rem",
          background: "#2563eb",
          border: "none",
          borderRadius: "0.375rem",
          color: "#fff",
          fontSize: "0.875rem",
          fontWeight: 500,
          cursor: saving ? "wait" : "pointer",
          opacity: saving ? 0.7 : 1
        }, children: saving ? "Saving…" : "Save" }),
        url && /* @__PURE__ */ jsx("button", { type: "button", onClick: () => {
          setUrl("");
          fetch("/set-notify-webhook", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ _csrf: csrfToken, webhookUrl: "" }) }).then((r) => r.json()).then((json) => {
            if (json.success) setResult({ type: "success", message: json.message });
            else setResult({ type: "error", message: json.error || "Failed to remove." });
          }).catch(() => setResult({ type: "error", message: "Network error." }));
        }, style: {
          padding: "0.5rem 1rem",
          background: "transparent",
          border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: "0.375rem",
          color: "#f87171",
          fontSize: "0.875rem",
          cursor: "pointer"
        }, children: "Remove" })
      ] }),
      /* @__PURE__ */ jsxs("p", { style: { fontSize: "0.75rem", color: "var(--dash-text-muted, #525252)", lineHeight: 1.5 }, children: [
        "Payload includes: ",
        /* @__PURE__ */ jsx("code", { style: { fontFamily: "JetBrains Mono, monospace" }, children: "event" }),
        ", ",
        /* @__PURE__ */ jsx("code", { style: { fontFamily: "JetBrains Mono, monospace" }, children: "gitUrl" }),
        ", ",
        /* @__PURE__ */ jsx("code", { style: { fontFamily: "JetBrains Mono, monospace" }, children: "branch" }),
        ", ",
        /* @__PURE__ */ jsx("code", { style: { fontFamily: "JetBrains Mono, monospace" }, children: "subdomain" }),
        ", ",
        /* @__PURE__ */ jsx("code", { style: { fontFamily: "JetBrains Mono, monospace" }, children: "timestamp" })
      ] })
    ] })
  ] });
}
function TwoFACard({ csrfToken, twofaEnabled: initialEnabled }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [phase, setPhase] = useState("idle");
  const [qr, setQr] = useState(null);
  const [secret, setSecret] = useState(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);
  async function startSetup() {
    setBusy(true);
    setResult(null);
    try {
      const r = await fetch("/auth/2fa/setup", { credentials: "same-origin" });
      const d = await r.json();
      if (!r.ok) return setResult({ type: "error", message: d.error || "Failed to generate QR code." });
      setQr(d.qr);
      setSecret(d.secret);
      setPhase("setup");
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch {
      setResult({ type: "error", message: "Network error. Try again." });
    } finally {
      setBusy(false);
    }
  }
  async function verifyCode(e) {
    e.preventDefault();
    if (code.length !== 6) return setResult({ type: "error", message: "Enter the 6-digit code from your authenticator app." });
    setBusy(true);
    setResult(null);
    try {
      const r = await fetch("/auth/2fa/verify", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
        body: JSON.stringify({ code })
      });
      const d = await r.json();
      if (!r.ok || !d.success) return setResult({ type: "error", message: d.error || "Invalid code. Try again." });
      setEnabled(true);
      setPhase("idle");
      setQr(null);
      setSecret(null);
      setCode("");
      setResult({ type: "success", message: "2FA enabled successfully." });
    } catch {
      setResult({ type: "error", message: "Network error. Try again." });
    } finally {
      setBusy(false);
    }
  }
  async function disable() {
    if (!window.confirm("Disable two-factor authentication? Your account will be less secure.")) return;
    setBusy(true);
    setResult(null);
    try {
      const r = await fetch("/auth/2fa/disable", {
        method: "POST",
        credentials: "same-origin",
        headers: { "x-csrf-token": csrfToken }
      });
      const d = await r.json();
      if (!r.ok || !d.success) return setResult({ type: "error", message: d.error || "Failed to disable 2FA." });
      setEnabled(false);
      setResult({ type: "success", message: "2FA disabled." });
    } catch {
      setResult({ type: "error", message: "Network error. Try again." });
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ jsx(CardShell, { title: "Two-Factor Authentication", children: enabled && phase === "idle" ? /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "0.875rem" }, children: [
    /* @__PURE__ */ jsx("div", { style: { display: "flex", alignItems: "center", gap: "0.625rem" }, children: /* @__PURE__ */ jsx("span", { style: { fontSize: "0.8125rem", color: "#86efac", fontWeight: 500 }, children: "✓ 2FA is enabled" }) }),
    /* @__PURE__ */ jsx("p", { style: { fontSize: "0.8125rem", color: "var(--dash-text-secondary, #a1a1a1)", lineHeight: 1.5 }, children: "Your account is protected with a time-based one-time password (TOTP). You'll need your authenticator app each time you log in." }),
    result && /* @__PURE__ */ jsx(InlineAlert, { type: result.type, message: result.message }),
    /* @__PURE__ */ jsx("button", { onClick: disable, disabled: busy, style: {
      alignSelf: "flex-start",
      padding: "0.5rem 1.125rem",
      background: "transparent",
      border: "1px solid rgba(239,68,68,0.35)",
      borderRadius: "0.375rem",
      color: "#f87171",
      fontSize: "0.875rem",
      cursor: busy ? "wait" : "pointer",
      opacity: busy ? 0.7 : 1
    }, children: busy ? "Disabling…" : "Disable 2FA" })
  ] }) : phase === "idle" ? /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "0.875rem" }, children: [
    /* @__PURE__ */ jsx("p", { style: { fontSize: "0.8125rem", color: "var(--dash-text-secondary, #a1a1a1)", lineHeight: 1.5 }, children: "Add an extra layer of security. After enabling, you'll need an authenticator app (Google Authenticator, Authy, etc.) to log in." }),
    result && /* @__PURE__ */ jsx(InlineAlert, { type: result.type, message: result.message }),
    /* @__PURE__ */ jsx("button", { onClick: startSetup, disabled: busy, style: {
      alignSelf: "flex-start",
      padding: "0.5rem 1.125rem",
      background: "#2563eb",
      border: "none",
      borderRadius: "0.375rem",
      color: "#fff",
      fontSize: "0.875rem",
      fontWeight: 500,
      cursor: busy ? "wait" : "pointer",
      opacity: busy ? 0.7 : 1
    }, children: busy ? "Loading…" : "Enable 2FA" })
  ] }) : /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "1rem" }, children: [
    /* @__PURE__ */ jsx("p", { style: { fontSize: "0.8125rem", color: "var(--dash-text-secondary, #a1a1a1)", lineHeight: 1.5 }, children: "Scan this QR code with your authenticator app, then enter the 6-digit code to confirm." }),
    qr && /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.75rem" }, children: [
      /* @__PURE__ */ jsx("img", { src: qr, alt: "2FA QR code", style: { width: "10rem", height: "10rem", borderRadius: "0.5rem" } }),
      secret && /* @__PURE__ */ jsxs("p", { style: { fontSize: "0.75rem", color: "var(--dash-text-muted, #525252)", lineHeight: 1.5 }, children: [
        "Can't scan? Manual key: ",
        /* @__PURE__ */ jsx("code", { style: { fontFamily: "JetBrains Mono, monospace", color: "var(--dash-text-secondary, #a1a1a1)", letterSpacing: "0.05em" }, children: secret })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: verifyCode, style: { display: "flex", flexDirection: "column", gap: "0.75rem" }, children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { style: labelStyle, children: "6-digit code" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            ref: inputRef,
            type: "text",
            inputMode: "numeric",
            pattern: "[0-9]{6}",
            maxLength: 6,
            value: code,
            onChange: (e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6)),
            placeholder: "000000",
            autoComplete: "one-time-code",
            style: { ...inputStyle, maxWidth: "10rem", textAlign: "center", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.2em", fontSize: "1.125rem" }
          }
        )
      ] }),
      result && /* @__PURE__ */ jsx(InlineAlert, { type: result.type, message: result.message }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "0.625rem" }, children: [
        /* @__PURE__ */ jsx("button", { type: "submit", disabled: busy || code.length !== 6, style: {
          padding: "0.5rem 1.125rem",
          background: "#2563eb",
          border: "none",
          borderRadius: "0.375rem",
          color: "#fff",
          fontSize: "0.875rem",
          fontWeight: 500,
          cursor: busy || code.length !== 6 ? "not-allowed" : "pointer",
          opacity: busy || code.length !== 6 ? 0.6 : 1
        }, children: busy ? "Verifying…" : "Verify & Enable" }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => {
          setPhase("idle");
          setCode("");
          setResult(null);
        }, style: {
          padding: "0.5rem 1rem",
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "0.375rem",
          color: "var(--dash-text-secondary, #a1a1a1)",
          fontSize: "0.875rem",
          cursor: "pointer"
        }, children: "Cancel" })
      ] })
    ] })
  ] }) });
}
function NotificationChannelsCard({ csrfToken, slackWebhookUrl, discordWebhookUrl }) {
  const [slack, setSlack] = useState(slackWebhookUrl || "");
  const [discord, setDiscord] = useState(discordWebhookUrl || "");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setResult(null);
    try {
      const r = await fetch("/api/notification-channels", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
        body: JSON.stringify({ slack_webhook_url: slack.trim() || null, discord_webhook_url: discord.trim() || null })
      });
      const d = await r.json();
      if (d.success) setResult({ type: "success", message: "Notification channels saved." });
      else setResult({ type: "error", message: d.error || "Failed to save." });
    } catch {
      setResult({ type: "error", message: "Network error." });
    } finally {
      setSaving(false);
    }
  }
  return /* @__PURE__ */ jsxs(CardShell, { title: "Alert Notifications", children: [
    /* @__PURE__ */ jsx("p", { style: { fontSize: "0.8125rem", color: "var(--dash-text-secondary, #a1a1a1)", marginBottom: "1rem", lineHeight: 1.5 }, children: "Receive resource alerts (CPU, memory, disk) on Slack and Discord in addition to email." }),
    /* @__PURE__ */ jsxs("form", { onSubmit: save, style: { display: "flex", flexDirection: "column", gap: "0.875rem" }, children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { style: labelStyle, children: "Slack Incoming Webhook URL" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "url",
            value: slack,
            onChange: (e) => setSlack(e.target.value),
            placeholder: "https://hooks.slack.com/services/…",
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
        /* @__PURE__ */ jsx("label", { style: labelStyle, children: "Discord Webhook URL" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "url",
            value: discord,
            onChange: (e) => setDiscord(e.target.value),
            placeholder: "https://discord.com/api/webhooks/…",
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
      /* @__PURE__ */ jsx("button", { type: "submit", disabled: saving, style: {
        alignSelf: "flex-start",
        padding: "0.5rem 1.125rem",
        background: "#2563eb",
        border: "none",
        borderRadius: "0.375rem",
        color: "#fff",
        fontSize: "0.875rem",
        fontWeight: 500,
        cursor: saving ? "wait" : "pointer",
        opacity: saving ? 0.7 : 1
      }, children: saving ? "Saving…" : "Save Channels" }),
      /* @__PURE__ */ jsx("p", { style: { fontSize: "0.75rem", color: "var(--dash-text-muted, #525252)", lineHeight: 1.5 }, children: "Leave blank to disable that channel. Alert rules are configured from the Overview tab." })
    ] })
  ] });
}
function SettingsSection({ data }) {
  const { csrfToken, notifyWebhookUrl, slackWebhookUrl, discordWebhookUrl, twofaEnabled } = data;
  return /* @__PURE__ */ jsxs("section", { children: [
    /* @__PURE__ */ jsx(SectionHeader$2, { title: "Settings" }),
    /* @__PURE__ */ jsxs("div", { style: { padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }, children: [
      /* @__PURE__ */ jsx(PlanCard, { data }),
      /* @__PURE__ */ jsx(BillingUsageCard, {}),
      /* @__PURE__ */ jsx(WebhookCard, { csrfToken, notifyWebhookUrl }),
      /* @__PURE__ */ jsx(NotificationChannelsCard, { csrfToken, slackWebhookUrl, discordWebhookUrl }),
      /* @__PURE__ */ jsx(TwoFACard, { csrfToken, twofaEnabled }),
      /* @__PURE__ */ jsx(ChangePasswordCard, { csrfToken }),
      /* @__PURE__ */ jsx(SupportTicketCard, { csrfToken })
    ] })
  ] });
}
function SectionHeader$1({ title }) {
  return /* @__PURE__ */ jsx("div", { className: "border-b-faint", style: { padding: "1.5rem 1.5rem 1rem" }, children: /* @__PURE__ */ jsx("h2", { style: { fontSize: "0.8125rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--dash-text-muted, #525252)" }, children: title }) });
}
function formatDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString(void 0, { month: "short", day: "numeric", year: "numeric" });
}
function ScopeBadge({ scope }) {
  const colors = {
    deploy: { bg: "rgba(45,167,223,0.12)", color: "#7fd6ff" },
    read: { bg: "rgba(34,197,94,0.10)", color: "#86efac" }
  };
  const c = colors[scope] ?? { bg: "rgba(255,255,255,0.06)", color: "#a1a1a1" };
  return /* @__PURE__ */ jsx("span", { style: {
    display: "inline-block",
    padding: "0.1rem 0.45rem",
    borderRadius: "0.25rem",
    fontSize: "0.625rem",
    fontWeight: 600,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    background: c.bg,
    color: c.color,
    marginRight: "0.25rem"
  }, children: scope });
}
function KeyRevealModal({ apiKey: key, onClose }) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  async function copy() {
    if (!navigator?.clipboard?.writeText) {
      try {
        const ta = document.createElement("textarea");
        ta.value = key;
        ta.style.cssText = "position:fixed;opacity:0;pointer-events:none";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        if (ok) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2e3);
        } else {
          setCopyFailed(true);
          setTimeout(() => setCopyFailed(false), 3500);
        }
      } catch {
        setCopyFailed(true);
        setTimeout(() => setCopyFailed(false), 3500);
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2e3);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 3500);
    }
  }
  return /* @__PURE__ */ jsx("div", { style: {
    position: "fixed",
    inset: 0,
    zIndex: 200,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem"
  }, children: /* @__PURE__ */ jsxs("div", { style: {
    background: "#111",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "0.5rem",
    padding: "1.5rem",
    width: "100%",
    maxWidth: "32rem"
  }, children: [
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }, children: [
      /* @__PURE__ */ jsx("span", { style: { fontSize: "0.75rem", color: "#22c55e" }, children: "✓" }),
      /* @__PURE__ */ jsx("span", { style: { fontSize: "0.875rem", fontWeight: 600, color: "#f5f5f5" }, children: "API key created" })
    ] }),
    /* @__PURE__ */ jsx("p", { style: { fontSize: "0.75rem", color: "#9ca3af", marginBottom: "0.75rem", lineHeight: 1.5 }, children: "Copy your key now — it will never be shown again." }),
    /* @__PURE__ */ jsx("div", { style: {
      background: "#0a0a0a",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "0.375rem",
      padding: "0.75rem 1rem",
      fontFamily: "JetBrains Mono, monospace",
      fontSize: "0.75rem",
      color: "#d1d5db",
      wordBreak: "break-all",
      marginBottom: "0.75rem"
    }, children: key }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "0.5rem", justifyContent: "flex-end" }, children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: copy,
          style: {
            padding: "0.4rem 0.875rem",
            borderRadius: "0.375rem",
            border: "1px solid rgba(255,255,255,0.12)",
            background: copied ? "rgba(34,197,94,0.12)" : copyFailed ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.05)",
            color: copied ? "#86efac" : copyFailed ? "#fca5a5" : "#d1d5db",
            fontSize: "0.75rem",
            cursor: "pointer"
          },
          children: copied ? "Copied!" : copyFailed ? "Copy manually" : "Copy key"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onClose,
          style: {
            padding: "0.4rem 0.875rem",
            borderRadius: "0.375rem",
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.04)",
            color: "#9ca3af",
            fontSize: "0.75rem",
            cursor: "pointer"
          },
          children: "Done"
        }
      )
    ] })
  ] }) });
}
function CreateKeyForm({ csrfToken, onCreated }) {
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState(["deploy"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  function toggleScope(s) {
    setScopes(
      (prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }
  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
        body: JSON.stringify({ name, scopes })
      });
      if (!res.ok) {
        let errorMsg = "Failed to create key";
        try {
          const contentType = res.headers.get("content-type");
          if (contentType?.includes("application/json")) {
            const data2 = await res.json();
            errorMsg = data2.error || errorMsg;
          } else {
            const text = await res.text();
            errorMsg = text || errorMsg;
          }
        } catch (parseErr) {
          console.error("Error parsing response:", parseErr);
        }
        setError(errorMsg);
        return;
      }
      const data = await res.json();
      setName("");
      setScopes(["deploy"]);
      onCreated(data);
    } catch (err) {
      setError("Network error — please try again");
      console.error("Request failed:", err);
    } finally {
      setLoading(false);
    }
  }
  return /* @__PURE__ */ jsxs("form", { onSubmit: submit, style: { padding: "1.25rem 1.5rem" }, children: [
    /* @__PURE__ */ jsxs("div", { style: { marginBottom: "0.75rem" }, children: [
      /* @__PURE__ */ jsx("label", { style: { display: "block", fontSize: "0.6875rem", color: "#6b7280", marginBottom: "0.3rem" }, children: "Key name" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          value: name,
          onChange: (e) => setName(e.target.value),
          placeholder: "e.g. CI/CD pipeline",
          maxLength: 100,
          required: true,
          style: {
            width: "100%",
            background: "#0a0a0a",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "0.375rem",
            padding: "0.45rem 0.75rem",
            fontSize: "0.8125rem",
            color: "#f5f5f5",
            outline: "none"
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { marginBottom: "1rem" }, children: [
      /* @__PURE__ */ jsx("label", { style: { display: "block", fontSize: "0.6875rem", color: "#6b7280", marginBottom: "0.4rem" }, children: "Scopes" }),
      /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: "0.75rem" }, children: ["deploy", "read"].map((s) => /* @__PURE__ */ jsxs("label", { style: { display: "flex", alignItems: "center", gap: "0.35rem", cursor: "pointer", fontSize: "0.8125rem", color: scopes.includes(s) ? "#f5f5f5" : "#6b7280" }, children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "checkbox",
            checked: scopes.includes(s),
            onChange: () => toggleScope(s),
            style: { accentColor: "#2DA7DF" }
          }
        ),
        s
      ] }, s)) })
    ] }),
    error && /* @__PURE__ */ jsx("p", { style: { fontSize: "0.75rem", color: "#f87171", marginBottom: "0.5rem" }, children: error }),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "submit",
        disabled: loading || !name.trim() || scopes.length === 0,
        style: {
          padding: "0.45rem 1rem",
          borderRadius: "0.375rem",
          border: "none",
          background: loading ? "rgba(45,167,223,0.5)" : "#2DA7DF",
          color: "#fff",
          fontSize: "0.8125rem",
          fontWeight: 500,
          cursor: loading ? "not-allowed" : "pointer",
          opacity: !name.trim() || scopes.length === 0 ? 0.5 : 1
        },
        children: loading ? "Creating…" : "Create key"
      }
    )
  ] });
}
function KeyRow({ apiKey: k, csrfToken, onRevoked }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function revoke() {
    if (!confirm(`Revoke key "${k.name}"? This cannot be undone.`)) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/keys/${k.id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "x-csrf-token": csrfToken }
      });
      if (!res.ok) {
        let errorMsg = "Failed to revoke key";
        try {
          const contentType = res.headers.get("content-type");
          if (contentType?.includes("application/json")) {
            const data = await res.json();
            errorMsg = data.error || errorMsg;
          } else {
            const text = await res.text();
            errorMsg = text || errorMsg;
          }
        } catch (parseErr) {
          console.error("Error parsing error response:", parseErr);
        }
        setError(errorMsg);
        return;
      }
      setError("");
      onRevoked(k.id);
    } catch (err) {
      setError("Network error — could not revoke key");
      console.error("Revoke failed:", err);
    } finally {
      setLoading(false);
    }
  }
  const expired = k.expires_at && new Date(k.expires_at) < /* @__PURE__ */ new Date();
  return /* @__PURE__ */ jsxs("div", { style: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.875rem 1.5rem",
    borderBottom: "1px solid rgba(255,255,255,0.04)"
  }, children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }, children: [
        /* @__PURE__ */ jsx("span", { style: { fontSize: "0.8125rem", fontWeight: 500, color: "#f5f5f5" }, children: k.name }),
        expired && /* @__PURE__ */ jsx("span", { style: { fontSize: "0.625rem", color: "#ef4444", background: "rgba(239,68,68,0.1)", padding: "0.1rem 0.35rem", borderRadius: "0.25rem" }, children: "EXPIRED" })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.25rem", marginBottom: "0.25rem" }, children: [
        /* @__PURE__ */ jsxs("code", { style: { fontSize: "0.6875rem", color: "#6b7280", fontFamily: "JetBrains Mono, monospace" }, children: [
          k.key_prefix,
          "…"
        ] }),
        /* @__PURE__ */ jsx("span", { style: { color: "rgba(255,255,255,0.15)", fontSize: "0.6875rem" }, children: "·" }),
        (k.scopes || []).map((s) => /* @__PURE__ */ jsx(ScopeBadge, { scope: s }, s))
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { fontSize: "0.6875rem", color: "#4b5563" }, children: [
        "Created ",
        formatDate(k.created_at),
        k.last_used_at ? ` · Last used ${formatDate(k.last_used_at)}` : " · Never used",
        k.expires_at ? ` · Expires ${formatDate(k.expires_at)}` : ""
      ] }),
      error && /* @__PURE__ */ jsx("div", { style: { fontSize: "0.6875rem", color: "#f87171", marginTop: "0.35rem" }, children: error })
    ] }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: revoke,
        disabled: loading,
        style: {
          padding: "0.3rem 0.625rem",
          borderRadius: "0.25rem",
          border: "1px solid rgba(239,68,68,0.25)",
          background: "rgba(239,68,68,0.06)",
          color: "#f87171",
          fontSize: "0.6875rem",
          cursor: loading ? "not-allowed" : "pointer",
          whiteSpace: "nowrap"
        },
        children: loading ? "Revoking…" : "Revoke"
      }
    )
  ] });
}
function ApiKeysSection({ data }) {
  const { csrfToken, apiKeys: initial = [] } = data;
  const [keys, setKeys] = useState(initial);
  const [revealedKey, setRevealedKey] = useState(null);
  const [showForm, setShowForm] = useState(false);
  function handleCreated(result) {
    setRevealedKey(result.key);
    fetch("/api/keys", { credentials: "include" }).then((r) => r.json()).then((d) => setKeys(d.keys || [])).catch(() => {
    });
    setShowForm(false);
  }
  function handleRevoked(id) {
    setKeys((prev) => prev.filter((k) => k.id !== id));
  }
  return /* @__PURE__ */ jsxs("div", { style: { color: "#f5f5f5" }, children: [
    revealedKey && /* @__PURE__ */ jsx(KeyRevealModal, { apiKey: revealedKey, onClose: () => setRevealedKey(null) }),
    /* @__PURE__ */ jsx(SectionHeader$1, { title: "API Keys" }),
    /* @__PURE__ */ jsxs("div", { style: { padding: "1rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }, children: [
      /* @__PURE__ */ jsxs("p", { style: { fontSize: "0.8125rem", color: "#6b7280", margin: 0, lineHeight: 1.5 }, children: [
        "Use API keys to authenticate programmatic deploys (CI/CD, scripts). Send deploys via ",
        /* @__PURE__ */ jsx("code", { style: { fontFamily: "JetBrains Mono, monospace", fontSize: "0.75rem", color: "#9ca3af" }, children: "POST /api/deploy" }),
        " with a",
        " ",
        /* @__PURE__ */ jsx("code", { style: { fontFamily: "JetBrains Mono, monospace", fontSize: "0.75rem", color: "#9ca3af" }, children: "Bearer" }),
        " token."
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setShowForm((v) => !v),
          style: {
            padding: "0.4rem 0.875rem",
            borderRadius: "0.375rem",
            border: "1px solid rgba(45,167,223,0.3)",
            background: showForm ? "rgba(45,167,223,0.06)" : "rgba(45,167,223,0.12)",
            color: "#7fd6ff",
            fontSize: "0.75rem",
            cursor: "pointer",
            whiteSpace: "nowrap",
            flexShrink: 0
          },
          children: showForm ? "Cancel" : "+ New key"
        }
      )
    ] }),
    showForm && /* @__PURE__ */ jsx("div", { style: { borderBottom: "1px solid rgba(255,255,255,0.04)" }, children: /* @__PURE__ */ jsx(CreateKeyForm, { csrfToken, onCreated: handleCreated }) }),
    keys.length === 0 ? /* @__PURE__ */ jsx("div", { style: { padding: "2.5rem 1.5rem", textAlign: "center", color: "#4b5563", fontSize: "0.8125rem" }, children: "No API keys yet. Create one to get started." }) : /* @__PURE__ */ jsx("div", { children: keys.map((k) => /* @__PURE__ */ jsx(KeyRow, { apiKey: k, csrfToken, onRevoked: handleRevoked }, k.id)) }),
    /* @__PURE__ */ jsxs("div", { style: { padding: "1.25rem 1.5rem", borderTop: "1px solid rgba(255,255,255,0.04)" }, children: [
      /* @__PURE__ */ jsx("p", { style: { fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "#4b5563", marginBottom: "0.5rem" }, children: "Usage example" }),
      /* @__PURE__ */ jsx("pre", { style: {
        margin: 0,
        padding: "0.75rem 1rem",
        background: "#0a0a0a",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "0.375rem",
        fontSize: "0.6875rem",
        color: "#9ca3af",
        fontFamily: "JetBrains Mono, monospace",
        whiteSpace: "pre-wrap",
        lineHeight: 1.6
      }, children: `curl -X POST https://cloudedbasement.ca/api/deploy \\
  -H "Authorization: Bearer cbk_<your_key>" \\
  -H "Content-Type: application/json" \\
  -d '{"git_url":"https://github.com/you/your-repo"}'` })
    ] })
  ] });
}
function SectionHeader({ title }) {
  return /* @__PURE__ */ jsx("div", { className: "border-b-faint", style: { padding: "1.5rem 1.5rem 1rem" }, children: /* @__PURE__ */ jsx("h2", { style: { fontSize: "0.8125rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--dash-text-muted, #525252)" }, children: title }) });
}
function repoLabel(gitUrl = "") {
  return gitUrl.split("/").pop().replace(/\.git$/, "") || gitUrl;
}
const DEMO_LINES = [
  { type: "info", text: "Connected — streaming my-saas-app.service" },
  { type: "log", text: "2026-04-16T14:22:01Z basement systemd[1]: Started my-saas-app.service." },
  { type: "log", text: "2026-04-16T14:22:01Z basement node[2814]: Server listening on port 3000" },
  { type: "log", text: "2026-04-16T14:22:02Z basement node[2814]: Database connected" },
  { type: "log", text: "2026-04-16T14:22:15Z basement node[2814]: GET / 200 12ms" },
  { type: "log", text: "2026-04-16T14:22:16Z basement node[2814]: GET /api/health 200 3ms" },
  { type: "log", text: "2026-04-16T14:23:04Z basement node[2814]: POST /api/users 201 45ms" },
  { type: "log", text: "2026-04-16T14:23:44Z basement node[2814]: GET /dashboard 200 8ms" },
  { type: "log", text: "2026-04-16T14:25:11Z basement node[2814]: GET /api/health 200 2ms" }
];
function LogsSection({ data }) {
  const { deployments = [], hasServer, serverStatus, isDemo } = data;
  const successfulDeps = deployments.filter((d) => d.status === "success" && d.git_url);
  const [selectedId, setSelectedId] = useState(() => successfulDeps[0]?.id ?? null);
  const [lines, setLines] = useState([]);
  const [connected, setConnected] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const esRef = useRef(null);
  const bottomRef = useRef(null);
  const autoScroll = useRef(true);
  const demoTimerRef = useRef(null);
  const demoRunningRef = useRef(false);
  const stop = () => {
    if (demoTimerRef.current) {
      clearTimeout(demoTimerRef.current);
      demoTimerRef.current = null;
    }
    demoRunningRef.current = false;
    esRef.current?.close();
    esRef.current = null;
    setStreaming(false);
    setConnected(false);
  };
  const start = () => {
    if (!selectedId) return;
    stop();
    setLines([]);
    setStreaming(true);
    if (isDemo) {
      setConnected(true);
      let i = 0;
      demoRunningRef.current = true;
      const tick = () => {
        if (!demoRunningRef.current) return;
        if (i < DEMO_LINES.length) {
          const line = { ...DEMO_LINES[i], id: Date.now() + i };
          setLines((prev) => [...prev, line]);
          i++;
          esRef.current = { close: () => {
          } };
          demoTimerRef.current = setTimeout(tick, 180);
        } else {
          demoTimerRef.current = null;
        }
      };
      tick();
      return;
    }
    const es = new EventSource(`/logs/stream?deploymentId=${selectedId}`, { withCredentials: true });
    esRef.current = es;
    es.onmessage = (e) => {
      try {
        const { type, text } = JSON.parse(e.data);
        setLines((prev) => [...prev.slice(-2e3), { type, text, id: Date.now() + Math.random() }]);
        if (type === "info" && text.startsWith("Connected")) setConnected(true);
        if (type === "error") {
          setConnected(false);
          setStreaming(false);
        }
      } catch (_) {
      }
    };
    es.onerror = () => {
      setConnected(false);
      setStreaming(false);
      es.close();
    };
  };
  useEffect(() => () => stop(), []);
  useEffect(() => {
    if (autoScroll.current) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);
  const lineColor = (type) => {
    if (type === "error") return "#f87171";
    if (type === "info") return "#60a5fa";
    return "#a1a1a1";
  };
  if (!hasServer || serverStatus !== "running") {
    return /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx(SectionHeader, { title: "Logs" }),
      /* @__PURE__ */ jsx("div", { style: { padding: "3rem 1.5rem", textAlign: "center", color: "var(--dash-text-muted, #525252)", fontSize: "0.8125rem" }, children: "No running server." })
    ] });
  }
  if (successfulDeps.length === 0) {
    return /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx(SectionHeader, { title: "Logs" }),
      /* @__PURE__ */ jsx("div", { style: { padding: "3rem 1.5rem", textAlign: "center", color: "var(--dash-text-muted, #525252)", fontSize: "0.8125rem" }, children: "No successful deployments yet. Deploy an app to stream its logs." })
    ] });
  }
  return /* @__PURE__ */ jsxs("section", { children: [
    /* @__PURE__ */ jsx(SectionHeader, { title: "Logs" }),
    /* @__PURE__ */ jsxs("div", { style: { padding: "1.25rem 1.5rem" }, children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "0.625rem", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsx(
          "select",
          {
            value: selectedId ?? "",
            onChange: (e) => {
              stop();
              setLines([]);
              setSelectedId(Number(e.target.value));
            },
            style: {
              flex: 1,
              minWidth: 0,
              maxWidth: "20rem",
              background: "#111",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "0.375rem",
              color: "#fafafa",
              padding: "0.375rem 0.625rem",
              fontSize: "0.8125rem"
            },
            children: successfulDeps.map((d) => /* @__PURE__ */ jsxs("option", { value: d.id, children: [
              repoLabel(d.git_url),
              d.branch ? ` (${d.branch})` : "",
              d.is_preview ? " [preview]" : ""
            ] }, d.id))
          }
        ),
        !streaming ? /* @__PURE__ */ jsx("button", { onClick: start, style: { padding: "0.375rem 0.875rem", borderRadius: "0.375rem", background: "#2563eb", border: "none", color: "#fff", fontSize: "0.8125rem", fontWeight: 500, cursor: "pointer" }, children: "Stream Logs" }) : /* @__PURE__ */ jsx("button", { onClick: stop, style: { padding: "0.375rem 0.875rem", borderRadius: "0.375rem", background: "transparent", border: "1px solid rgba(239,68,68,0.4)", color: "#f87171", fontSize: "0.8125rem", fontWeight: 500, cursor: "pointer" }, children: "Stop" }),
        /* @__PURE__ */ jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", color: connected ? "#22c55e" : streaming ? "#eab308" : "#525252" }, children: [
          /* @__PURE__ */ jsx("span", { style: { width: "0.4375rem", height: "0.4375rem", borderRadius: "50%", background: "currentColor" } }),
          connected ? "Live" : streaming ? "Connecting…" : "Disconnected"
        ] }),
        lines.length > 0 && /* @__PURE__ */ jsx("button", { onClick: () => setLines([]), style: { marginLeft: "auto", padding: "0.25rem 0.5rem", borderRadius: "0.3125rem", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "#525252", fontSize: "0.6875rem", cursor: "pointer" }, children: "Clear" })
      ] }),
      /* @__PURE__ */ jsxs(
        "div",
        {
          onScroll: (e) => {
            const el = e.currentTarget;
            autoScroll.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
          },
          style: {
            background: "#0a0a0a",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "0.5rem",
            padding: "0.875rem 1rem",
            height: "28rem",
            overflowY: "auto",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "0.75rem",
            lineHeight: 1.6
          },
          children: [
            lines.length === 0 && !streaming && /* @__PURE__ */ jsx("span", { style: { color: "#525252" }, children: 'Select a deployment and click "Stream Logs" to begin.' }),
            lines.length === 0 && streaming && /* @__PURE__ */ jsx("span", { style: { color: "#60a5fa" }, children: "Connecting…" }),
            lines.map((l) => /* @__PURE__ */ jsx("div", { style: { color: lineColor(l.type), wordBreak: "break-all" }, children: l.text }, l.id)),
            /* @__PURE__ */ jsx("div", { ref: bottomRef })
          ]
        }
      )
    ] })
  ] });
}
function SimpleLineChart({ data, label, color, height = 200 }) {
  if (!data || data.length === 0) {
    return /* @__PURE__ */ jsx("div", { style: {
      height: `${height}px`,
      background: "#111111",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "0.625rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#525252",
      fontSize: "0.875rem"
    }, children: "No data available" });
  }
  const values = data.filter((d) => d !== null);
  const minVal = Math.min(...values, 0);
  const maxVal = Math.max(...values, 100);
  const range = maxVal - minVal || 1;
  const width = 500;
  const chartHeight = height;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const span = Math.max(1, data.length - 1);
  const points = data.map((val, i) => {
    if (val === null) return null;
    const x = padding.left + i / span * chartWidth;
    const y = padding.top + chartHeight - (val - minVal) / range * (chartHeight - padding.top - padding.bottom);
    return { x, y };
  }).filter((p) => p !== null);
  const pathData = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  return /* @__PURE__ */ jsxs("div", { style: {
    background: "#111111",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "0.625rem",
    padding: "0.875rem",
    overflow: "auto"
  }, children: [
    /* @__PURE__ */ jsxs("svg", { width: "100%", height: chartHeight, viewBox: `0 0 ${width} ${chartHeight}`, style: { minWidth: "300px" }, children: [
      [0, 0.25, 0.5, 0.75, 1].map((y) => {
        const yPos = padding.top + (1 - y) * (chartHeight - padding.top - padding.bottom);
        const val = Math.round(minVal + y * range);
        return /* @__PURE__ */ jsxs("g", { children: [
          /* @__PURE__ */ jsx("line", { x1: padding.left, y1: yPos, x2: width - padding.right, y2: yPos, stroke: "rgba(255,255,255,0.05)", strokeWidth: "1" }),
          /* @__PURE__ */ jsxs("text", { x: padding.left - 8, y: yPos + 4, fontSize: "11", fill: "#525252", textAnchor: "end", children: [
            val,
            "%"
          ] })
        ] }, `grid-${y}`);
      }),
      pathData && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("path", { d: pathData, stroke: color, strokeWidth: "2", fill: "none" }),
        /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: `grad-${label}`, x1: "0%", y1: "0%", x2: "0%", y2: "100%", children: [
          /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: color, stopOpacity: "0.3" }),
          /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: color, stopOpacity: "0" })
        ] }) }),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: `${pathData} L ${points[points.length - 1].x} ${padding.top + chartHeight - padding.bottom} L ${points[0].x} ${padding.top + chartHeight - padding.bottom} Z`,
            fill: `url(#grad-${label})`
          }
        )
      ] }),
      points.map((p, i) => /* @__PURE__ */ jsx("circle", { cx: p.x, cy: p.y, r: "3", fill: color }, `point-${i}`)),
      /* @__PURE__ */ jsx("line", { x1: padding.left, y1: padding.top + chartHeight - padding.bottom, x2: width - padding.right, y2: padding.top + chartHeight - padding.bottom, stroke: "rgba(255,255,255,0.1)", strokeWidth: "1" })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { fontSize: "0.75rem", color: "#525252", marginTop: "0.5rem", textAlign: "center" }, children: [
      label,
      " — ",
      data.length,
      " data points"
    ] })
  ] });
}
function MetricsHistorySection() {
  const [period, setPeriod] = useState("24h");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emptyReason, setEmptyReason] = useState("");
  const [metrics, setMetrics] = useState({ data: [] });
  useEffect(() => {
    fetchMetricsHistory();
  }, [period]);
  const fetchMetricsHistory = async () => {
    setLoading(true);
    setError("");
    setEmptyReason("");
    try {
      const response = await fetch(`/api/metrics/history?period=${period}`);
      if (!response.ok) {
        let apiError = "";
        try {
          const payload = await response.json();
          apiError = String(payload?.error || "").toLowerCase();
        } catch {
          apiError = "";
        }
        if ((response.status === 400 || response.status === 404) && apiError.includes("no server found")) {
          setMetrics({ data: [] });
          setEmptyReason("Metrics will appear after your first server is provisioned.");
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }
      const result = await response.json();
      setMetrics(result);
    } catch (err) {
      setEmptyReason("Metrics are temporarily unavailable.");
      console.warn("[METRICS HISTORY] Unable to load metrics history:", err?.message || err);
      setMetrics({ data: [] });
    } finally {
      setLoading(false);
    }
  };
  const cpuData = metrics.data?.map((d) => d.cpu) || [];
  const memoryData = metrics.data?.map((d) => d.memory) || [];
  const diskData = metrics.data?.map((d) => d.disk) || [];
  return /* @__PURE__ */ jsxs("div", { style: { padding: "1.5rem 0" }, children: [
    /* @__PURE__ */ jsxs("div", { style: { marginBottom: "1.5rem" }, children: [
      /* @__PURE__ */ jsx("h2", { style: { fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }, children: "Metrics History" }),
      /* @__PURE__ */ jsx("p", { style: { color: "#a0a0a0", fontSize: "0.875rem" }, children: "View CPU, memory, and disk usage trends over time" })
    ] }),
    /* @__PURE__ */ jsx("div", { style: { marginBottom: "1.5rem", display: "flex", gap: "0.5rem" }, children: ["24h", "7d", "30d"].map((p) => /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setPeriod(p),
        style: {
          padding: "0.5rem 1rem",
          background: period === p ? "#3b82f6" : "rgba(255,255,255,0.05)",
          border: `1px solid ${period === p ? "#3b82f6" : "rgba(255,255,255,0.1)"}`,
          color: "#ffffff",
          borderRadius: "0.375rem",
          cursor: "pointer",
          fontSize: "0.875rem",
          fontWeight: 500,
          transition: "all 0.2s"
        },
        onMouseEnter: (e) => {
          if (period !== p) e.target.style.background = "rgba(255,255,255,0.08)";
        },
        onMouseLeave: (e) => {
          if (period !== p) e.target.style.background = "rgba(255,255,255,0.05)";
        },
        children: p.toUpperCase()
      },
      p
    )) }),
    error && /* @__PURE__ */ jsx("div", { style: {
      padding: "0.875rem 1rem",
      background: "rgba(239,68,68,0.1)",
      border: "1px solid rgba(239,68,68,0.3)",
      borderRadius: "0.375rem",
      color: "#fca5a5",
      fontSize: "0.875rem",
      marginBottom: "1.5rem"
    }, children: error }),
    !loading && !error && emptyReason && /* @__PURE__ */ jsx("div", { style: {
      padding: "0.875rem 1rem",
      background: "rgba(59,130,246,0.08)",
      border: "1px solid rgba(59,130,246,0.22)",
      borderRadius: "0.375rem",
      color: "#93c5fd",
      fontSize: "0.875rem",
      marginBottom: "1.5rem"
    }, children: emptyReason }),
    loading && /* @__PURE__ */ jsx("div", { style: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "200px",
      color: "#525252"
    }, children: "Loading metrics..." }),
    !loading && !error && /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }, children: [
      /* @__PURE__ */ jsx(SimpleLineChart, { data: cpuData, label: "CPU Usage", color: "#3b82f6" }),
      /* @__PURE__ */ jsx(SimpleLineChart, { data: memoryData, label: "Memory Usage", color: "#8b5cf6" }),
      /* @__PURE__ */ jsx(SimpleLineChart, { data: diskData, label: "Disk Usage", color: "#ec4899" })
    ] }),
    !loading && !error && metrics.data?.length > 0 && /* @__PURE__ */ jsxs("div", { style: {
      marginTop: "1rem",
      padding: "0.875rem 1rem",
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "0.375rem",
      fontSize: "0.75rem",
      color: "#525252"
    }, children: [
      "Showing ",
      metrics.dataPoints ?? metrics.data?.length ?? 0,
      " data points for the last ",
      period
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
    id: "api-keys",
    label: "API Keys",
    icon: /* @__PURE__ */ jsx("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", width: 15, height: 15, children: /* @__PURE__ */ jsx(
      "path",
      {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 1.5,
        d: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
      }
    ) })
  },
  {
    id: "logs",
    label: "Logs",
    icon: /* @__PURE__ */ jsx("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", width: 15, height: 15, children: /* @__PURE__ */ jsx(
      "path",
      {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 1.5,
        d: "M4 6h16M4 10h16M4 14h10M4 18h6"
      }
    ) })
  },
  {
    id: "metrics",
    label: "Metrics",
    icon: /* @__PURE__ */ jsx("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", width: 15, height: 15, children: /* @__PURE__ */ jsx(
      "path",
      {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: 1.5,
        d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
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
  logs: LogsSection,
  metrics: MetricsHistorySection,
  settings: SettingsSection,
  "api-keys": ApiKeysSection
};
function DashboardLayout({ data, flashSuccess, flashError, flashWarning }) {
  const [active, setActive] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [localFlashSuccess, setLocalFlashSuccess] = useState(flashSuccess || null);
  const [localFlashError, setLocalFlashError] = useState(flashError || null);
  const [localFlashWarning, setLocalFlashWarning] = useState(flashWarning || null);
  const ActiveSection = SECTIONS[active] ?? OverviewSection;
  const handleDismissSuccess = () => {
    setLocalFlashSuccess(null);
    window.history.replaceState({}, "", "/dashboard");
  };
  const handleDismissError = () => {
    setLocalFlashError(null);
    window.history.replaceState({}, "", "/dashboard");
  };
  const handleDismissWarning = () => {
    setLocalFlashWarning(null);
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
        (localFlashSuccess || localFlashError || localFlashWarning) && /* @__PURE__ */ jsxs("div", { className: "cb-flash-wrap", children: [
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
          localFlashWarning && /* @__PURE__ */ jsxs("div", { style: {
            background: "rgba(234,179,8,0.07)",
            border: "1px solid rgba(234,179,8,0.25)",
            borderRadius: "0.5rem",
            padding: "0.625rem 1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            color: "#fde047",
            fontSize: "0.8125rem",
            marginBottom: "0.5rem"
          }, children: [
            /* @__PURE__ */ jsx("span", { style: { flex: 1 }, children: localFlashWarning }),
            /* @__PURE__ */ jsx("button", { onClick: handleDismissWarning, "aria-label": "Dismiss notification", style: { background: "none", border: "none", color: "inherit", cursor: "pointer" }, children: "x" })
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
  const flashWarning = params.get("warning") || "";
  if (loading) return /* @__PURE__ */ jsx("div", { className: "cb-screen-state", children: /* @__PURE__ */ jsx("span", { style: { color: "var(--dash-text-muted, #525252)", fontSize: "0.875rem" }, children: "Loading..." }) });
  if (error) return /* @__PURE__ */ jsx("div", { className: "cb-screen-state", children: /* @__PURE__ */ jsx("span", { style: { color: "var(--dash-danger, #ef4444)", fontSize: "0.875rem" }, children: error }) });
  return /* @__PURE__ */ jsx(DashboardLayout, { data, flashSuccess, flashError, flashWarning });
}
export {
  DashboardPage as default
};
