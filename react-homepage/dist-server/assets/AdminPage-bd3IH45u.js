import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect, useCallback } from "react";
const MONO = { fontFamily: "JetBrains Mono, monospace" };
function fmt(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString(void 0, { month: "short", day: "numeric", year: "numeric" });
}
function Badge({ children, color = "#a1a1a1", bg = "rgba(255,255,255,0.06)" }) {
  return /* @__PURE__ */ jsx("span", { style: {
    display: "inline-block",
    padding: "0.15rem 0.5rem",
    borderRadius: "0.25rem",
    fontSize: "0.625rem",
    fontWeight: 700,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    background: bg,
    color,
    whiteSpace: "nowrap"
  }, children });
}
const STATUS_BADGE = {
  running: /* @__PURE__ */ jsx(Badge, { color: "#22c55e", bg: "rgba(34,197,94,0.10)", children: "running" }),
  provisioning: /* @__PURE__ */ jsx(Badge, { color: "#eab308", bg: "rgba(234,179,8,0.10)", children: "provisioning" }),
  deleted: /* @__PURE__ */ jsx(Badge, { color: "#525252", bg: "rgba(255,255,255,0.04)", children: "deleted" }),
  failed: /* @__PURE__ */ jsx(Badge, { color: "#ef4444", bg: "rgba(239,68,68,0.10)", children: "failed" }),
  success: /* @__PURE__ */ jsx(Badge, { color: "#22c55e", bg: "rgba(34,197,94,0.10)", children: "deployed" }),
  deploying: /* @__PURE__ */ jsx(Badge, { color: "#eab308", bg: "rgba(234,179,8,0.10)", children: "deploying" }),
  pending: /* @__PURE__ */ jsx(Badge, { color: "#eab308", bg: "rgba(234,179,8,0.10)", children: "pending" }),
  succeeded: /* @__PURE__ */ jsx(Badge, { color: "#22c55e", bg: "rgba(34,197,94,0.10)", children: "succeeded" }),
  admin: /* @__PURE__ */ jsx(Badge, { color: "#f87171", bg: "rgba(239,68,68,0.10)", children: "admin" }),
  user: /* @__PURE__ */ jsx(Badge, { color: "#525252", bg: "rgba(255,255,255,0.06)", children: "user" })
};
function statusBadge(val) {
  return STATUS_BADGE[val] ?? /* @__PURE__ */ jsx(Badge, { children: val ?? "—" });
}
function SectionHeader({ title }) {
  return /* @__PURE__ */ jsx("div", { className: "border-b-faint", style: { padding: "1.5rem 1.5rem 1rem" }, children: /* @__PURE__ */ jsx("h2", { style: { fontSize: "0.8125rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--dash-text-muted, #525252)" }, children: title }) });
}
function Table({ cols, rows }) {
  return /* @__PURE__ */ jsx("div", { style: { overflowX: "auto" }, children: /* @__PURE__ */ jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }, children: [
    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { children: cols.map((c) => /* @__PURE__ */ jsx("th", { style: {
      padding: "0.5rem 0.75rem",
      textAlign: "left",
      fontSize: "0.6875rem",
      fontWeight: 600,
      letterSpacing: "0.05em",
      textTransform: "uppercase",
      color: "var(--dash-text-muted, #525252)",
      borderBottom: "1px solid rgba(255,255,255,0.06)"
    }, children: c }, c)) }) }),
    /* @__PURE__ */ jsx("tbody", { children: rows.map((cells, i) => /* @__PURE__ */ jsx("tr", { style: { borderBottom: "1px solid rgba(255,255,255,0.04)" }, children: cells.map((cell, j) => /* @__PURE__ */ jsx("td", { style: { padding: "0.625rem 0.75rem", verticalAlign: "middle", color: "var(--dash-text-secondary, #a1a1a1)" }, children: cell }, j)) }, i)) })
  ] }) });
}
function ActionBtn({ label, onClick, danger, disabled }) {
  return /* @__PURE__ */ jsx(
    "button",
    {
      onClick,
      disabled,
      style: {
        padding: "0.25rem 0.625rem",
        borderRadius: "0.3125rem",
        background: "transparent",
        border: danger ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(255,255,255,0.12)",
        color: danger ? "#f87171" : "var(--dash-text-secondary, #a1a1a1)",
        fontSize: "0.6875rem",
        cursor: disabled ? "wait" : "pointer",
        whiteSpace: "nowrap",
        opacity: disabled ? 0.6 : 1
      },
      children: label
    }
  );
}
function StatCard({ label, value, color }) {
  return /* @__PURE__ */ jsxs("div", { style: {
    background: "#111111",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "0.625rem",
    padding: "1rem 1.25rem"
  }, children: [
    /* @__PURE__ */ jsx("div", { style: { fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#525252", marginBottom: "0.375rem" }, children: label }),
    /* @__PURE__ */ jsx("div", { style: { fontSize: "1.5rem", fontWeight: 700, color: color || "#fafafa", ...MONO }, children: value })
  ] });
}
function StatsSection({ data }) {
  const users = data?.users || [];
  const servers = data?.servers || [];
  const domains = data?.domains || [];
  const payments = data?.payments || [];
  const running = servers.filter((s) => s.status === "running").length;
  const revenue = (payments.filter((p) => p.status === "succeeded").reduce((s, p) => s + (p.amount || 0), 0) / 100).toFixed(0);
  return /* @__PURE__ */ jsxs("section", { children: [
    /* @__PURE__ */ jsx(SectionHeader, { title: "Stats" }),
    /* @__PURE__ */ jsxs("div", { style: { padding: "1.5rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(10rem, 1fr))", gap: "0.75rem" }, children: [
      /* @__PURE__ */ jsx(StatCard, { label: "Users", value: users.length, color: "#7fd6ff" }),
      /* @__PURE__ */ jsx(StatCard, { label: "Servers", value: `${running} / ${servers.length}`, color: "#4ade80" }),
      /* @__PURE__ */ jsx(StatCard, { label: "Domains", value: domains.length, color: "#c084fc" }),
      /* @__PURE__ */ jsx(StatCard, { label: "Revenue", value: `$${revenue}`, color: "#fbbf24" })
    ] })
  ] });
}
function PendingSection({ data }) {
  const { pendingRequests = [] } = data;
  if (!pendingRequests.length) {
    return /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx(SectionHeader, { title: "Pending Requests" }),
      /* @__PURE__ */ jsx("div", { style: { padding: "2.5rem 1.5rem", textAlign: "center" }, children: /* @__PURE__ */ jsx("p", { style: { fontSize: "0.875rem", color: "var(--dash-text-muted, #525252)" }, children: "No pending requests." }) })
    ] });
  }
  return /* @__PURE__ */ jsxs("section", { children: [
    /* @__PURE__ */ jsx(SectionHeader, { title: `Pending Requests (${pendingRequests.length})` }),
    /* @__PURE__ */ jsx("div", { style: { padding: "1rem 1.5rem" }, children: /* @__PURE__ */ jsx("div", { style: { border: "1px solid rgba(249,115,22,0.25)", borderRadius: "0.625rem", overflow: "hidden" }, children: /* @__PURE__ */ jsx(
      Table,
      {
        cols: ["Customer", "Details", "Status", "Date", "Action"],
        rows: pendingRequests.map((r) => {
          const details = (r.description || "").split("\n").reduce((acc, line) => {
            const idx = line.indexOf(": ");
            if (idx >= 0) {
              const k = line.slice(0, idx).trim();
              const v = line.slice(idx + 2).trim();
              if (k) acc[k] = v;
            }
            return acc;
          }, {});
          return [
            /* @__PURE__ */ jsx("span", { style: { color: "var(--dash-text-primary, #fafafa)", ...MONO, fontSize: "0.75rem" }, children: r.customer_email }),
            /* @__PURE__ */ jsxs("span", { style: { color: "var(--dash-text-muted, #525252)", fontSize: "0.75rem" }, children: [
              /* @__PURE__ */ jsx("span", { style: { color: "#7fd6ff" }, children: details.Region || "N/A" }),
              " · ",
              details["Server Name"] || "Default"
            ] }),
            /* @__PURE__ */ jsx(Badge, { color: "#fb923c", bg: "rgba(249,115,22,0.1)", children: r.status }),
            /* @__PURE__ */ jsx("span", { style: { color: "var(--dash-text-muted, #525252)", fontSize: "0.6875rem" }, children: fmt(r.created_at) }),
            /* @__PURE__ */ jsx("a", { href: "https://cloud.digitalocean.com/droplets/new", target: "_blank", rel: "noreferrer", style: { color: "#7fd6ff", fontSize: "0.6875rem", fontWeight: 600, textDecoration: "none" }, children: "Provision →" })
          ];
        })
      }
    ) }) })
  ] });
}
function UsersSection({ data, onAction }) {
  const { users, csrfToken } = data;
  const [loading, setLoading] = useState(null);
  async function deleteUser(id, email) {
    if (!confirm(`Delete user ${email}? This cannot be undone.`)) return;
    setLoading(id);
    try {
      const r = await fetch(`/admin/delete-user/${id}`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `_csrf=${encodeURIComponent(csrfToken)}`
      });
      if (r.ok || r.redirected) {
        onAction("User deleted");
      } else {
        alert("Failed to delete user.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setLoading(null);
    }
  }
  return /* @__PURE__ */ jsxs("section", { children: [
    /* @__PURE__ */ jsx(SectionHeader, { title: `Users (${users.length})` }),
    /* @__PURE__ */ jsx("div", { style: { padding: "1rem 1.5rem" }, children: /* @__PURE__ */ jsx("div", { style: { border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.625rem", overflow: "hidden" }, children: /* @__PURE__ */ jsx(
      Table,
      {
        cols: ["Email", "Role", "Confirmed", "Created", "Action"],
        rows: users.map((u) => [
          /* @__PURE__ */ jsx("span", { style: { color: "var(--dash-text-primary, #fafafa)", fontSize: "0.8125rem" }, children: u.email }),
          statusBadge(u.role),
          u.email_confirmed ? /* @__PURE__ */ jsx("span", { style: { color: "#4ade80", fontSize: "0.75rem" }, children: "✓ Yes" }) : /* @__PURE__ */ jsx("span", { style: { color: "#f87171", fontSize: "0.75rem" }, children: "✗ No" }),
          /* @__PURE__ */ jsx("span", { style: { ...MONO, fontSize: "0.6875rem", color: "var(--dash-text-muted, #525252)" }, children: fmt(u.created_at) }),
          /* @__PURE__ */ jsx(ActionBtn, { label: loading === u.id ? "Deleting…" : "Delete", danger: true, disabled: loading === u.id, onClick: () => deleteUser(u.id, u.email) })
        ])
      }
    ) }) })
  ] });
}
function ServersSection({ data, onAction }) {
  const { servers, csrfToken } = data;
  const [loading, setLoading] = useState(null);
  async function post(url, serverId, confirmMsg) {
    if (!confirm(confirmMsg)) return;
    setLoading(serverId);
    try {
      const r = await fetch(url, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `_csrf=${encodeURIComponent(csrfToken)}`
      });
      if (r.ok || r.redirected) {
        onAction("Done.");
      } else {
        alert("Action failed.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setLoading(null);
    }
  }
  return /* @__PURE__ */ jsxs("section", { children: [
    /* @__PURE__ */ jsx(SectionHeader, { title: `Servers (${servers.length})` }),
    /* @__PURE__ */ jsx("div", { style: { padding: "1rem 1.5rem" }, children: /* @__PURE__ */ jsx("div", { style: { border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.625rem", overflow: "hidden" }, children: /* @__PURE__ */ jsx(
      Table,
      {
        cols: ["ID", "Owner", "Plan", "Status", "IP", "Created", "Actions"],
        rows: servers.map((s) => [
          /* @__PURE__ */ jsxs("span", { style: { ...MONO, fontSize: "0.6875rem", color: "var(--dash-text-muted, #525252)" }, children: [
            "#",
            s.id
          ] }),
          /* @__PURE__ */ jsx("span", { style: { fontSize: "0.8125rem", color: "var(--dash-text-primary, #fafafa)" }, children: s.owner_email || "—" }),
          /* @__PURE__ */ jsx(Badge, { color: "#60a5fa", bg: "rgba(59,130,246,0.12)", children: s.plan }),
          statusBadge(s.status),
          /* @__PURE__ */ jsx("span", { style: { ...MONO, fontSize: "0.6875rem", color: "#7fd6ff" }, children: s.ip_address || "—" }),
          /* @__PURE__ */ jsx("span", { style: { ...MONO, fontSize: "0.6875rem", color: "var(--dash-text-muted, #525252)" }, children: fmt(s.created_at) }),
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "0.375rem" }, children: [
            s.status === "provisioning" && /* @__PURE__ */ jsx(
              ActionBtn,
              {
                label: loading === s.id ? "…" : "Cancel",
                disabled: loading === s.id,
                onClick: () => post(`/admin/cancel-provisioning/${s.id}`, s.id, "Cancel provisioning for this server?")
              }
            ),
            s.status === "deleted" && /* @__PURE__ */ jsx(
              ActionBtn,
              {
                label: loading === s.id ? "…" : "Remove Record",
                disabled: loading === s.id,
                onClick: () => post(`/admin/delete-server/${s.id}`, s.id, `Remove server record #${s.id}?`)
              }
            ),
            s.status !== "deleted" && /* @__PURE__ */ jsx(
              ActionBtn,
              {
                label: loading === s.id ? "…" : "Destroy",
                danger: true,
                disabled: loading === s.id,
                onClick: () => post(`/admin/destroy-droplet/${s.id}`, s.id, `DESTROY droplet for server #${s.id}? This deletes the droplet from DigitalOcean. Cannot be undone.`)
              }
            )
          ] })
        ])
      }
    ) }) })
  ] });
}
function DomainsSection({ data }) {
  const { domains } = data;
  return /* @__PURE__ */ jsxs("section", { children: [
    /* @__PURE__ */ jsx(SectionHeader, { title: `Domains (${domains.length})` }),
    /* @__PURE__ */ jsx("div", { style: { padding: "1rem 1.5rem" }, children: /* @__PURE__ */ jsx("div", { style: { border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.625rem", overflow: "hidden" }, children: /* @__PURE__ */ jsx(
      Table,
      {
        cols: ["Domain", "SSL", "Expires", "Created"],
        rows: domains.map((d) => [
          /* @__PURE__ */ jsx("span", { style: { ...MONO, fontSize: "0.8125rem", color: "var(--dash-text-primary, #fafafa)" }, children: d.domain }),
          d.ssl_enabled ? /* @__PURE__ */ jsx(Badge, { color: "#4ade80", bg: "rgba(34,197,94,0.10)", children: "Active" }) : /* @__PURE__ */ jsx("span", { style: { color: "var(--dash-text-muted, #525252)", fontSize: "0.75rem" }, children: "—" }),
          /* @__PURE__ */ jsx("span", { style: { ...MONO, fontSize: "0.6875rem", color: "var(--dash-text-muted, #525252)" }, children: d.ssl_expires_at ? fmt(d.ssl_expires_at) : "—" }),
          /* @__PURE__ */ jsx("span", { style: { ...MONO, fontSize: "0.6875rem", color: "var(--dash-text-muted, #525252)" }, children: fmt(d.created_at) })
        ])
      }
    ) }) })
  ] });
}
function DeploymentsSection({ data }) {
  const { deployments } = data;
  return /* @__PURE__ */ jsxs("section", { children: [
    /* @__PURE__ */ jsx(SectionHeader, { title: `Deployments (${deployments.length})` }),
    /* @__PURE__ */ jsx("div", { style: { padding: "1rem 1.5rem" }, children: /* @__PURE__ */ jsx("div", { style: { border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.625rem", overflow: "hidden" }, children: /* @__PURE__ */ jsx(
      Table,
      {
        cols: ["ID", "Owner", "Repo", "Status", "Deployed"],
        rows: deployments.map((d) => [
          /* @__PURE__ */ jsxs("span", { style: { ...MONO, fontSize: "0.6875rem", color: "var(--dash-text-muted, #525252)" }, children: [
            "#",
            d.id
          ] }),
          /* @__PURE__ */ jsx("span", { style: { fontSize: "0.8125rem", color: "var(--dash-text-primary, #fafafa)" }, children: d.owner_email || "—" }),
          /* @__PURE__ */ jsx("span", { style: { ...MONO, fontSize: "0.6875rem", color: "var(--dash-text-secondary, #a1a1a1)", maxWidth: "14rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }, children: d.git_url?.replace("https://github.com/", "") || "—" }),
          statusBadge(d.status),
          /* @__PURE__ */ jsx("span", { style: { ...MONO, fontSize: "0.6875rem", color: "var(--dash-text-muted, #525252)" }, children: fmt(d.deployed_at) })
        ])
      }
    ) }) })
  ] });
}
function PaymentsSection({ data }) {
  const { payments } = data;
  return /* @__PURE__ */ jsxs("section", { children: [
    /* @__PURE__ */ jsx(SectionHeader, { title: `Payments (${payments.length})` }),
    /* @__PURE__ */ jsx("div", { style: { padding: "1rem 1.5rem" }, children: /* @__PURE__ */ jsx("div", { style: { border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.625rem", overflow: "hidden" }, children: /* @__PURE__ */ jsx(
      Table,
      {
        cols: ["ID", "Customer", "Plan", "Amount", "Status", "Date"],
        rows: payments.map((p) => [
          /* @__PURE__ */ jsxs("span", { style: { ...MONO, fontSize: "0.6875rem", color: "var(--dash-text-muted, #525252)" }, children: [
            "#",
            p.id
          ] }),
          /* @__PURE__ */ jsx("span", { style: { fontSize: "0.8125rem", color: "var(--dash-text-primary, #fafafa)" }, children: p.customer_email || "—" }),
          /* @__PURE__ */ jsx(Badge, { color: "#60a5fa", bg: "rgba(59,130,246,0.12)", children: p.plan }),
          /* @__PURE__ */ jsxs("span", { style: { ...MONO, fontSize: "0.875rem", fontWeight: 700, color: "#fbbf24" }, children: [
            "$",
            ((p.amount || 0) / 100).toFixed(2)
          ] }),
          statusBadge(p.status),
          /* @__PURE__ */ jsx("span", { style: { ...MONO, fontSize: "0.6875rem", color: "var(--dash-text-muted, #525252)" }, children: fmt(p.created_at) })
        ])
      }
    ) }) })
  ] });
}
function AuditLogSection() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 50;
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    fetch(`/admin/audit-log/data?limit=${limit}&offset=${offset}`, { credentials: "same-origin" }).then(async (r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    }).then((d) => {
      if (!active) return;
      setRows(d.entries || []);
      setTotal(d.total || 0);
    }).catch((err) => {
      if (!active) return;
      setError(err.message || "Failed to load audit log");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [offset]);
  return /* @__PURE__ */ jsxs("section", { children: [
    /* @__PURE__ */ jsx(SectionHeader, { title: "Audit Log" }),
    /* @__PURE__ */ jsx("div", { style: { padding: "1rem 1.5rem" }, children: /* @__PURE__ */ jsx("div", { style: { border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.625rem", overflow: "hidden" }, children: loading ? /* @__PURE__ */ jsx("div", { style: { padding: "1rem", fontSize: "0.8125rem", color: "var(--dash-text-muted, #525252)" }, children: "Loading audit events…" }) : error ? /* @__PURE__ */ jsx("div", { style: { padding: "1rem", fontSize: "0.8125rem", color: "#f87171" }, children: error }) : rows.length === 0 ? /* @__PURE__ */ jsx("div", { style: { padding: "1rem", fontSize: "0.8125rem", color: "var(--dash-text-muted, #525252)" }, children: "No audit events found." }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        Table,
        {
          cols: ["Time", "Admin", "Action", "Target", "Old Value", "New Value"],
          rows: rows.map((r) => [
            /* @__PURE__ */ jsx("span", { style: { ...MONO, fontSize: "0.6875rem", color: "var(--dash-text-muted, #525252)" }, children: fmt(r.created_at) }),
            /* @__PURE__ */ jsx("span", { style: { fontSize: "0.75rem", color: "var(--dash-text-primary, #fafafa)" }, children: r.admin_email || "—" }),
            /* @__PURE__ */ jsx("span", { style: { fontSize: "0.75rem", color: "#60a5fa" }, children: r.action || "—" }),
            /* @__PURE__ */ jsx("span", { style: { fontSize: "0.75rem" }, children: r.target_email || "—" }),
            /* @__PURE__ */ jsx("span", { style: { ...MONO, fontSize: "0.6875rem", maxWidth: "14rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }, children: r.old_value || "—" }),
            /* @__PURE__ */ jsx("span", { style: { ...MONO, fontSize: "0.6875rem", maxWidth: "14rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }, children: r.new_value || "—" })
          ])
        }
      ),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.06)" }, children: [
        /* @__PURE__ */ jsxs("span", { style: { fontSize: "0.6875rem", color: "var(--dash-text-muted, #525252)" }, children: [
          "Showing ",
          offset + 1,
          "-",
          Math.min(offset + rows.length, total),
          " of ",
          total
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "0.5rem" }, children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setOffset(Math.max(0, offset - limit)),
              disabled: offset === 0,
              style: { padding: "0.25rem 0.625rem", borderRadius: "0.3125rem", background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "var(--dash-text-secondary, #a1a1a1)", fontSize: "0.6875rem", cursor: offset === 0 ? "not-allowed" : "pointer", opacity: offset === 0 ? 0.5 : 1 },
              children: "Previous"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setOffset(offset + limit),
              disabled: offset + rows.length >= total,
              style: { padding: "0.25rem 0.625rem", borderRadius: "0.3125rem", background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "var(--dash-text-secondary, #a1a1a1)", fontSize: "0.6875rem", cursor: offset + rows.length >= total ? "not-allowed" : "pointer", opacity: offset + rows.length >= total ? 0.5 : 1 },
              children: "Next"
            }
          )
        ] })
      ] })
    ] }) }) })
  ] });
}
const EVENT_COLORS = {
  LOGIN_FAILED: "#f87171",
  LOGIN_SUCCESS: "#4ade80",
  "2FA_FAILED": "#fbbf24",
  PASSWORD_RESET_REQUESTED: "#60a5fa",
  PASSWORD_RESET_COMPLETED: "#34d399",
  API_KEY_ROTATED: "#a78bfa",
  REGISTER_SUCCESS: "#22d3ee",
  REGISTER_FAILED: "#fb7185"
};
function fmtHour(ts) {
  if (!ts) return "-";
  const d = new Date(ts);
  return `${d.toLocaleDateString(void 0, { month: "short", day: "numeric" })} ${d.toLocaleTimeString(void 0, { hour: "numeric" })}`;
}
function buildTotalTrend(trendRows) {
  const byHour = /* @__PURE__ */ new Map();
  for (const row of trendRows || []) {
    const key = new Date(row.hour).toISOString();
    const prev = byHour.get(key) || 0;
    byHour.set(key, prev + Number(row.count || 0));
  }
  return Array.from(byHour.entries()).sort((a, b) => new Date(a[0]) - new Date(b[0])).map(([hour, count]) => ({ hour, count }));
}
function TrendChart({ points }) {
  const width = 680;
  const height = 220;
  const padX = 40;
  const padTop = 18;
  const padBottom = 34;
  const plotW = width - padX * 2;
  const plotH = height - padTop - padBottom;
  const maxY = Math.max(1, ...points.map((p) => p.count || 0));
  const coords = points.map((p, i) => {
    const x = padX + (points.length <= 1 ? 0 : i / (points.length - 1) * plotW);
    const y = padTop + (1 - (p.count || 0) / maxY) * plotH;
    return { x, y, count: p.count || 0, hour: p.hour };
  });
  const linePath = coords.length ? coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`).join(" ") : "";
  const areaPath = coords.length ? `${linePath} L ${coords[coords.length - 1].x.toFixed(2)} ${(padTop + plotH).toFixed(2)} L ${coords[0].x.toFixed(2)} ${(padTop + plotH).toFixed(2)} Z` : "";
  const yTicks = 4;
  const yLines = Array.from({ length: yTicks + 1 }, (_, i) => {
    const value = Math.round(maxY * (yTicks - i) / yTicks);
    const y = padTop + i / yTicks * plotH;
    return { y, value };
  });
  const first = points[0];
  const middle = points[Math.floor(points.length / 2)];
  const last = points[points.length - 1];
  return /* @__PURE__ */ jsx("div", { style: { overflowX: "auto" }, children: /* @__PURE__ */ jsxs("svg", { viewBox: `0 0 ${width} ${height}`, style: { width: "100%", minWidth: "32rem", height: "auto", display: "block" }, role: "img", "aria-label": "Security event trend chart", children: [
    /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "security-trend-fill", x1: "0", y1: "0", x2: "0", y2: "1", children: [
      /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "rgba(59,130,246,0.35)" }),
      /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "rgba(59,130,246,0.04)" })
    ] }) }),
    yLines.map((tick) => /* @__PURE__ */ jsxs("g", { children: [
      /* @__PURE__ */ jsx("line", { x1: padX, y1: tick.y, x2: width - padX, y2: tick.y, stroke: "rgba(255,255,255,0.08)", strokeWidth: "1" }),
      /* @__PURE__ */ jsx("text", { x: padX - 8, y: tick.y + 4, textAnchor: "end", fill: "var(--dash-text-muted, #525252)", fontSize: "10", children: tick.value })
    ] }, `y-${tick.y}`)),
    /* @__PURE__ */ jsx("line", { x1: padX, y1: padTop + plotH, x2: width - padX, y2: padTop + plotH, stroke: "rgba(255,255,255,0.16)", strokeWidth: "1.2" }),
    /* @__PURE__ */ jsx("line", { x1: padX, y1: padTop, x2: padX, y2: padTop + plotH, stroke: "rgba(255,255,255,0.16)", strokeWidth: "1.2" }),
    coords.length > 1 && /* @__PURE__ */ jsx("path", { d: areaPath, fill: "url(#security-trend-fill)" }),
    coords.length > 1 && /* @__PURE__ */ jsx("path", { d: linePath, fill: "none", stroke: "#60a5fa", strokeWidth: "2", strokeLinejoin: "round", strokeLinecap: "round" }),
    coords.map((c, idx) => /* @__PURE__ */ jsx("circle", { cx: c.x, cy: c.y, r: "2.5", fill: "#93c5fd" }, `${c.hour}-${c.count}-${idx}`)),
    first && /* @__PURE__ */ jsx("text", { x: padX, y: height - 10, fill: "var(--dash-text-muted, #525252)", fontSize: "10", textAnchor: "start", children: fmtHour(first.hour) }),
    middle && middle !== first && middle !== last && /* @__PURE__ */ jsx("text", { x: padX + plotW / 2, y: height - 10, fill: "var(--dash-text-muted, #525252)", fontSize: "10", textAnchor: "middle", children: fmtHour(middle.hour) }),
    last && last !== first && /* @__PURE__ */ jsx("text", { x: width - padX, y: height - 10, fill: "var(--dash-text-muted, #525252)", fontSize: "10", textAnchor: "end", children: fmtHour(last.hour) })
  ] }) });
}
function SecurityAnalyticsSection() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [eventType, setEventType] = useState("");
  const [windowHours, setWindowHours] = useState(24);
  const [eventData, setEventData] = useState(null);
  const [thresholdData, setThresholdData] = useState(null);
  const isMountedRef = useRef(true);
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  const loadSecurity = useCallback((signal) => {
    if (isMountedRef.current) {
      setLoading(true);
      setError("");
    }
    const params = new URLSearchParams();
    params.set("window_hours", String(windowHours));
    if (eventType) params.set("event_type", eventType);
    Promise.all([
      fetch(`/admin/security-events/analytics?${params.toString()}`, { credentials: "same-origin", signal }),
      fetch("/admin/security/analytics", { credentials: "same-origin", signal })
    ]).then(async ([eventsRes, thresholdsRes]) => {
      if (eventsRes.status === 401 || eventsRes.status === 403) {
        window.location.href = "/login";
        return null;
      }
      if (thresholdsRes.status === 401 || thresholdsRes.status === 403) {
        window.location.href = "/login";
        return null;
      }
      if (!eventsRes.ok) throw new Error(`Security events API error (${eventsRes.status})`);
      if (!thresholdsRes.ok) throw new Error(`Security thresholds API error (${thresholdsRes.status})`);
      const [eventsJson, thresholdsJson] = await Promise.all([eventsRes.json(), thresholdsRes.json()]);
      return { eventsJson, thresholdsJson };
    }).then((payload) => {
      if (!payload || !isMountedRef.current) return;
      setEventData(payload.eventsJson);
      setThresholdData(payload.thresholdsJson);
    }).catch((e) => {
      if (!isMountedRef.current || e?.name === "AbortError") return;
      setError(e.message || "Failed to load security analytics");
    }).finally(() => {
      if (isMountedRef.current) setLoading(false);
    });
  }, [windowHours, eventType]);
  useEffect(() => {
    const controller = new AbortController();
    loadSecurity(controller.signal);
    return () => controller.abort();
  }, [loadSecurity]);
  const trend = buildTotalTrend(eventData?.trend || []);
  const aggregates = eventData?.aggregates || { total_events: 0, unique_ips: 0, unique_users: 0, by_event_type: [] };
  const triggered = thresholdData?.triggered_thresholds || [];
  const severityCounts = thresholdData?.counts?.by_severity || { high: 0, medium: 0, low: 0 };
  return /* @__PURE__ */ jsxs("section", { children: [
    /* @__PURE__ */ jsx(SectionHeader, { title: "Security Analytics" }),
    /* @__PURE__ */ jsxs("div", { style: { padding: "1rem 1.5rem 1.5rem" }, children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexWrap: "wrap", gap: "0.625rem", marginBottom: "0.875rem", alignItems: "center" }, children: [
        /* @__PURE__ */ jsx("label", { style: { fontSize: "0.6875rem", color: "var(--dash-text-muted, #525252)", textTransform: "uppercase", letterSpacing: "0.05em" }, children: "Window" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: windowHours,
            onChange: (e) => setWindowHours(Number(e.target.value) || 24),
            style: { background: "#0f0f0f", color: "#fafafa", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "0.375rem", padding: "0.35rem 0.5rem", fontSize: "0.75rem" },
            children: [
              /* @__PURE__ */ jsx("option", { value: 1, children: "1 hour" }),
              /* @__PURE__ */ jsx("option", { value: 6, children: "6 hours" }),
              /* @__PURE__ */ jsx("option", { value: 24, children: "24 hours" }),
              /* @__PURE__ */ jsx("option", { value: 72, children: "72 hours" }),
              /* @__PURE__ */ jsx("option", { value: 168, children: "7 days" })
            ]
          }
        ),
        /* @__PURE__ */ jsx("label", { style: { fontSize: "0.6875rem", color: "var(--dash-text-muted, #525252)", textTransform: "uppercase", letterSpacing: "0.05em", marginLeft: "0.5rem" }, children: "Event" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: eventType,
            onChange: (e) => setEventType(e.target.value),
            style: { background: "#0f0f0f", color: "#fafafa", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "0.375rem", padding: "0.35rem 0.5rem", fontSize: "0.75rem" },
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "All events" }),
              /* @__PURE__ */ jsx("option", { value: "LOGIN_FAILED", children: "LOGIN_FAILED" }),
              /* @__PURE__ */ jsx("option", { value: "LOGIN_SUCCESS", children: "LOGIN_SUCCESS" }),
              /* @__PURE__ */ jsx("option", { value: "2FA_FAILED", children: "2FA_FAILED" }),
              /* @__PURE__ */ jsx("option", { value: "PASSWORD_RESET_REQUESTED", children: "PASSWORD_RESET_REQUESTED" }),
              /* @__PURE__ */ jsx("option", { value: "PASSWORD_RESET_COMPLETED", children: "PASSWORD_RESET_COMPLETED" }),
              /* @__PURE__ */ jsx("option", { value: "API_KEY_ROTATED", children: "API_KEY_ROTATED" }),
              /* @__PURE__ */ jsx("option", { value: "REGISTER_SUCCESS", children: "REGISTER_SUCCESS" }),
              /* @__PURE__ */ jsx("option", { value: "REGISTER_FAILED", children: "REGISTER_FAILED" })
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: loadSecurity,
            style: { marginLeft: "auto", padding: "0.35rem 0.625rem", borderRadius: "0.375rem", background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "var(--dash-text-secondary, #a1a1a1)", fontSize: "0.75rem", cursor: "pointer" },
            children: "Refresh"
          }
        )
      ] }),
      loading ? /* @__PURE__ */ jsx("div", { style: { padding: "1rem", fontSize: "0.8125rem", color: "var(--dash-text-muted, #525252)" }, children: "Loading security analytics..." }) : error ? /* @__PURE__ */ jsx("div", { style: { padding: "1rem", fontSize: "0.8125rem", color: "#f87171" }, children: error }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(10rem, 1fr))", gap: "0.75rem", marginBottom: "0.875rem" }, children: [
          /* @__PURE__ */ jsx(StatCard, { label: "Total Events", value: aggregates.total_events, color: "#7fd6ff" }),
          /* @__PURE__ */ jsx(StatCard, { label: "Unique IPs", value: aggregates.unique_ips, color: "#4ade80" }),
          /* @__PURE__ */ jsx(StatCard, { label: "Unique Users", value: aggregates.unique_users, color: "#fbbf24" }),
          /* @__PURE__ */ jsx(StatCard, { label: "Triggered Alerts", value: thresholdData?.counts?.total_triggered || 0, color: "#f87171" })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.625rem", padding: "0.875rem 0.875rem 0.5rem", marginBottom: "0.875rem" }, children: [
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "0.5rem" }, children: [
            /* @__PURE__ */ jsx("h3", { style: { margin: 0, fontSize: "0.8125rem", color: "var(--dash-text-primary, #fafafa)", letterSpacing: "0.04em", textTransform: "uppercase" }, children: "Event Volume Trend" }),
            /* @__PURE__ */ jsx("span", { style: { fontSize: "0.6875rem", color: "var(--dash-text-muted, #525252)" }, children: "Y: event count · X: time" })
          ] }),
          trend.length === 0 ? /* @__PURE__ */ jsx("div", { style: { padding: "0.875rem 0.25rem", fontSize: "0.75rem", color: "var(--dash-text-muted, #525252)" }, children: "No trend data for current filters." }) : /* @__PURE__ */ jsx(TrendChart, { points: trend })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(18rem, 1fr))", gap: "0.875rem", marginBottom: "0.875rem" }, children: [
          /* @__PURE__ */ jsxs("div", { style: { border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.625rem", overflow: "hidden" }, children: [
            /* @__PURE__ */ jsx("div", { style: { padding: "0.625rem 0.75rem", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--dash-text-muted, #525252)" }, children: "Event Type Breakdown" }),
            /* @__PURE__ */ jsx(
              Table,
              {
                cols: ["Type", "Count"],
                rows: (aggregates.by_event_type || []).map((row) => [
                  /* @__PURE__ */ jsx(Badge, { color: EVENT_COLORS[row.event_type] || "#a1a1a1", bg: "rgba(255,255,255,0.06)", children: row.event_type }),
                  /* @__PURE__ */ jsx("span", { style: { ...MONO }, children: row.count })
                ])
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { style: { border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.625rem", overflow: "hidden" }, children: [
            /* @__PURE__ */ jsx("div", { style: { padding: "0.625rem 0.75rem", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--dash-text-muted, #525252)" }, children: "Triggered Thresholds" }),
            triggered.length === 0 ? /* @__PURE__ */ jsx("div", { style: { padding: "0.875rem 0.75rem", fontSize: "0.75rem", color: "var(--dash-text-muted, #525252)" }, children: "No active threshold triggers." }) : /* @__PURE__ */ jsx(
              Table,
              {
                cols: ["Signal", "Offender", "Count", "Severity"],
                rows: triggered.slice(0, 10).map((row) => [
                  /* @__PURE__ */ jsx("span", { style: { ...MONO, fontSize: "0.6875rem" }, children: row.signal }),
                  /* @__PURE__ */ jsx("span", { style: { ...MONO, fontSize: "0.6875rem" }, children: row.offender || "global" }),
                  /* @__PURE__ */ jsx("span", { style: { ...MONO, fontSize: "0.6875rem" }, children: row.count }),
                  /* @__PURE__ */ jsx(
                    Badge,
                    {
                      color: row.severity === "high" ? "#f87171" : row.severity === "medium" ? "#fbbf24" : "#60a5fa",
                      bg: row.severity === "high" ? "rgba(239,68,68,0.1)" : row.severity === "medium" ? "rgba(234,179,8,0.12)" : "rgba(59,130,246,0.12)",
                      children: row.severity
                    }
                  )
                ])
              }
            ),
            /* @__PURE__ */ jsxs("div", { style: { padding: "0.625rem 0.75rem", borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: "0.6875rem", color: "var(--dash-text-muted, #525252)" }, children: [
              "High: ",
              severityCounts.high || 0,
              " · Medium: ",
              severityCounts.medium || 0,
              " · Low: ",
              severityCounts.low || 0
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.625rem", overflow: "hidden" }, children: [
          /* @__PURE__ */ jsx("div", { style: { padding: "0.625rem 0.75rem", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--dash-text-muted, #525252)" }, children: "Recent Security Events" }),
          /* @__PURE__ */ jsx(
            Table,
            {
              cols: ["Time", "Type", "IP", "Email", "User ID"],
              rows: (eventData?.recent_events || []).slice(0, 20).map((row) => [
                /* @__PURE__ */ jsx("span", { style: { ...MONO, fontSize: "0.6875rem" }, children: fmtHour(row.created_at) }),
                /* @__PURE__ */ jsx(Badge, { color: EVENT_COLORS[row.event_type] || "#a1a1a1", bg: "rgba(255,255,255,0.06)", children: row.event_type }),
                /* @__PURE__ */ jsx("span", { style: { ...MONO, fontSize: "0.6875rem" }, children: row.ip_address || "-" }),
                /* @__PURE__ */ jsx("span", { style: { ...MONO, fontSize: "0.6875rem" }, children: row.email || "-" }),
                /* @__PURE__ */ jsx("span", { style: { ...MONO, fontSize: "0.6875rem" }, children: row.user_id || "-" })
              ])
            }
          )
        ] })
      ] })
    ] })
  ] });
}
function buildNav(pendingCount) {
  return [
    {
      id: "stats",
      label: "Stats",
      icon: /* @__PURE__ */ jsx("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", width: 15, height: 15, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" }) })
    },
    {
      id: "pending",
      label: pendingCount > 0 ? `Pending (${pendingCount})` : "Pending",
      badge: pendingCount,
      icon: /* @__PURE__ */ jsx("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", width: 15, height: 15, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }) })
    },
    {
      id: "users",
      label: "Users",
      icon: /* @__PURE__ */ jsx("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", width: 15, height: 15, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" }) })
    },
    {
      id: "servers",
      label: "Servers",
      icon: /* @__PURE__ */ jsx("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", width: 15, height: 15, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" }) })
    },
    {
      id: "domains",
      label: "Domains",
      icon: /* @__PURE__ */ jsx("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", width: 15, height: 15, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" }) })
    },
    {
      id: "deployments",
      label: "Deployments",
      icon: /* @__PURE__ */ jsx("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", width: 15, height: 15, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" }) })
    },
    {
      id: "payments",
      label: "Payments",
      icon: /* @__PURE__ */ jsx("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", width: 15, height: 15, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" }) })
    },
    {
      id: "security",
      label: "Security",
      icon: /* @__PURE__ */ jsx("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", width: 15, height: 15, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M12 3l7 3v6c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V6l7-3zm0 5v4m0 4h.01" }) })
    },
    {
      id: "audit",
      label: "Audit Log",
      icon: /* @__PURE__ */ jsx("svg", { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", width: 15, height: 15, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M9 12h6m-6 4h6M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z" }) })
    }
  ];
}
function AdminSidebar({ nav, active, onNav, open, onToggle }) {
  return /* @__PURE__ */ jsxs("aside", { className: "dash-sidebar", id: "dash-sidebar", "data-open": open ? "true" : "false", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        id: "dash-sidebar-hamburger",
        onClick: onToggle,
        "aria-label": open ? "Collapse sidebar" : "Expand sidebar",
        className: "dash-sidebar-hamburger w-full shrink-0 items-center justify-start px-3.5 py-3 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
        children: /* @__PURE__ */ jsx("svg", { width: 18, height: 18, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 6h16M4 12h16M4 18h16" }) })
      }
    ),
    /* @__PURE__ */ jsxs("div", { id: "dash-sidebar-inner", className: "dash-sidebar-inner flex min-h-0 flex-1 flex-col", children: [
      /* @__PURE__ */ jsx("nav", { className: "flex-1 px-0 py-1.5", children: nav.map((item) => {
        const isActive = item.id === active;
        const hasBadge = item.badge > 0;
        return /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => onNav(item.id),
            className: `group flex w-full items-center gap-2.5 whitespace-nowrap border-l-2 px-4 py-[0.58rem] text-left text-[0.8125rem] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${isActive ? "border-white bg-black text-white" : hasBadge ? "border-transparent text-[rgba(251,146,60,0.9)] hover:bg-white/4 hover:text-orange-400" : "border-transparent text-[rgba(161,161,161,0.85)] hover:bg-white/4 hover:text-white"}`,
            children: [
              /* @__PURE__ */ jsx("span", { className: `flex shrink-0 items-center justify-center transition-opacity duration-150 ${isActive ? "opacity-100 text-white" : "opacity-60 group-hover:opacity-100"}`, children: item.icon }),
              /* @__PURE__ */ jsx("span", { className: isActive ? "font-medium" : "font-normal", children: item.label }),
              hasBadge && !isActive && /* @__PURE__ */ jsx("span", { style: { marginLeft: "auto", fontSize: "0.5625rem", fontWeight: 700, padding: "0.1rem 0.35rem", borderRadius: "0.25rem", background: "rgba(249,115,22,0.15)", color: "#fb923c" }, children: item.badge })
            ]
          },
          item.id
        );
      }) }),
      /* @__PURE__ */ jsxs("div", { className: "border-t-faint px-4 py-3", children: [
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.75rem" }, children: [
          /* @__PURE__ */ jsx("div", { style: { width: "1.75rem", height: "1.75rem", borderRadius: "0.25rem", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }, children: /* @__PURE__ */ jsx("svg", { width: 12, height: 12, fill: "currentColor", viewBox: "0 0 20 20", style: { color: "#f87171" }, children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z", clipRule: "evenodd" }) }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { style: { fontSize: "0.6875rem", color: "var(--dash-text-primary, #fafafa)", fontWeight: 500 }, children: "Admin Panel" }),
            /* @__PURE__ */ jsx("div", { style: { fontSize: "0.5625rem", color: "#f87171", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }, children: "Full Access" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexWrap: "wrap", gap: "0.5rem 1rem" }, children: [
          /* @__PURE__ */ jsx("a", { href: "/admin/updates", style: { fontSize: "0.6875rem", color: "#fb923c", textDecoration: "none" }, children: "Updates" }),
          /* @__PURE__ */ jsx("a", { href: "/dashboard?demo=true&demoPlan=pro", style: { fontSize: "0.6875rem", color: "rgba(120,120,120,1)", textDecoration: "none" }, children: "Demo" }),
          /* @__PURE__ */ jsx("a", { href: "https://cloud.digitalocean.com/droplets", target: "_blank", rel: "noreferrer", style: { fontSize: "0.6875rem", color: "rgba(120,120,120,1)", textDecoration: "none" }, children: "DO" }),
          /* @__PURE__ */ jsx("a", { href: "https://dashboard.stripe.com", target: "_blank", rel: "noreferrer", style: { fontSize: "0.6875rem", color: "rgba(120,120,120,1)", textDecoration: "none" }, children: "Stripe" }),
          /* @__PURE__ */ jsx("a", { href: "/dashboard", style: { fontSize: "0.6875rem", color: "rgba(120,120,120,1)", textDecoration: "none" }, children: "Dashboard" })
        ] })
      ] })
    ] })
  ] });
}
const SECTIONS = { stats: StatsSection, pending: PendingSection, users: UsersSection, servers: ServersSection, domains: DomainsSection, deployments: DeploymentsSection, payments: PaymentsSection, security: SecurityAnalyticsSection, audit: AuditLogSection };
function AdminPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [active, setActive] = useState("stats");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);
  const load = useCallback(() => {
    setLoading(true);
    fetch("/admin/data", { credentials: "same-origin" }).then((r) => {
      if (r.status === 401 || r.status === 403) {
        window.location.href = "/login";
        return null;
      }
      if (!r.ok) throw new Error(`Admin API error (${r.status})`);
      return r.json();
    }).then((d) => {
      if (d) setData(d);
    }).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  function onAction(msg) {
    setToast(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, 3e3);
    load();
  }
  if (loading) return /* @__PURE__ */ jsx("div", { className: "cb-screen-state", children: /* @__PURE__ */ jsx("span", { style: { color: "var(--dash-text-muted, #525252)", fontSize: "0.875rem" }, children: "Loading…" }) });
  if (error) return /* @__PURE__ */ jsx("div", { className: "cb-screen-state", children: /* @__PURE__ */ jsx("span", { style: { color: "var(--dash-danger, #ef4444)", fontSize: "0.875rem" }, children: error }) });
  const nav = buildNav(data?.pendingRequests?.length ?? 0);
  const ActiveSection = SECTIONS[active] ?? StatsSection;
  return /* @__PURE__ */ jsx("div", { className: "cb-dashboard-root", children: /* @__PURE__ */ jsx("div", { className: "cb-shell", children: /* @__PURE__ */ jsxs("div", { className: "cb-shell-inner min-h-screen flex flex-col", children: [
    /* @__PURE__ */ jsx("header", { className: "cb-dashboard-header", children: /* @__PURE__ */ jsx("a", { href: "/admin", "aria-label": "Admin Dashboard", className: "flex items-center", children: /* @__PURE__ */ jsx("img", { src: "/CB-logo-icon.svg", alt: "Clouded Basement", className: "h-12 w-auto max-w-55" }) }) }),
    /* @__PURE__ */ jsxs("div", { className: "cb-dashboard-body", children: [
      /* @__PURE__ */ jsx(AdminSidebar, { nav, active, onNav: setActive, open: sidebarOpen, onToggle: () => setSidebarOpen((o) => !o) }),
      /* @__PURE__ */ jsxs("main", { className: "cb-dashboard-main", children: [
        toast && /* @__PURE__ */ jsx("div", { style: {
          background: "rgba(34,197,94,0.07)",
          border: "1px solid rgba(34,197,94,0.2)",
          borderRadius: "0.5rem",
          padding: "0.625rem 1rem",
          marginBottom: "1rem",
          color: "#86efac",
          fontSize: "0.8125rem"
        }, children: toast }),
        /* @__PURE__ */ jsx(ActiveSection, { data, onAction })
      ] })
    ] })
  ] }) }) });
}
export {
  AdminPage as default
};
