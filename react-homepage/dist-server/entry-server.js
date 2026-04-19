import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { renderToString } from "react-dom/server";
import { Routes, Route, StaticRouter } from "react-router-dom";
import { useEffect, useState, useRef, lazy, Suspense } from "react";
import { SearchIcon, XIcon, MenuIcon, GitBranchIcon, DatabaseIcon, LockIcon, TerminalIcon, ArchiveIcon, CodeIcon, LayersIcon, GlobeIcon, ChevronDownIcon } from "lucide-react";
function LenisScroll() {
  useEffect(() => {
    let lenis, raf;
    import("lenis").then(({ default: Lenis }) => {
      lenis = new Lenis({ duration: 1.2, smoothWheel: true, smoothTouch: false });
      function loop(time) {
        lenis.raf(time);
        raf = requestAnimationFrame(loop);
      }
      raf = requestAnimationFrame(loop);
    });
    return () => {
      if (lenis) lenis.destroy();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
const searchIndex = [
  // Features
  { section: "Features", title: "Deploy in minutes", body: "Push your code and your app goes live in seconds.", href: "/#features" },
  { section: "Features", title: "GitHub auto-deploy", body: "Every push to main triggers a fresh build and deploy.", href: "/#features" },
  { section: "Features", title: "Managed infrastructure", body: "We handle OS updates, patches, and scaling.", href: "/#features" },
  { section: "Features", title: "Secure by default", body: "HTTPS on every site, isolated containers, built-in firewall.", href: "/#features" },
  // Pricing
  { section: "Pricing", title: "Basic — $15/mo", body: "1 GB RAM, 25 GB SSD, 2 sites, GitHub auto-deploy.", href: "/pay?plan=basic&interval=monthly" },
  { section: "Pricing", title: "Pro — $35/mo", body: "2 GB RAM, 50 GB SSD, 5 sites, daily backups.", href: "/pay?plan=pro&interval=monthly" },
  { section: "Pricing", title: "Premium — $55/mo", body: "4 GB RAM, 80 GB SSD, 10 sites, daily backups, 2FA.", href: "/pay?plan=premium&interval=monthly" },
  // FAQ
  { section: "FAQ", title: "What is Clouded Basement?", body: "A managed Node.js hosting platform.", href: "/#faq" },
  { section: "FAQ", title: "How do I deploy my first app?", body: "Connect your GitHub repo and push to main.", href: "/#faq" },
  { section: "FAQ", title: "Do you support custom domains?", body: "Yes, with automatic HTTPS on every plan.", href: "/#faq" },
  { section: "FAQ", title: "What frameworks are supported?", body: "Express, Fastify, NestJS, Next.js, Remix, and more.", href: "/#faq" },
  { section: "FAQ", title: "Can I cancel anytime?", body: "No contracts. Cancel from your dashboard anytime.", href: "/#faq" },
  // Navigation
  { section: "Navigation", title: "Dashboard", body: "Go to your app dashboard.", href: "/dashboard" },
  { section: "Navigation", title: "Sign up", body: "Create a new Clouded Basement account.", href: "/register" },
  { section: "Navigation", title: "Log in", body: "Sign in to your account.", href: "/login" },
  { section: "Navigation", title: "Pricing", body: "View all pricing plans and features.", href: "/pricing" },
  { section: "Navigation", title: "Docs", body: "Read the documentation and guides.", href: "/docs" }
];
function scoreItem(item, query) {
  const q = query.toLowerCase();
  const title = item.title.toLowerCase();
  const body = item.body.toLowerCase();
  if (title === q) return 3;
  if (title.startsWith(q)) return 2;
  if (title.includes(q) || body.includes(q)) return 1;
  return 0;
}
function useSearch(query) {
  const [results, setResults] = useState([]);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!query || query.length < 2) {
        setResults([]);
        return;
      }
      const scored = searchIndex.map((item) => ({ ...item, _score: scoreItem(item, query) })).filter((item) => item._score > 0).sort((a, b) => b._score - a._score);
      const groups = {};
      scored.forEach((item) => {
        if (!groups[item.section]) groups[item.section] = [];
        if (groups[item.section].length < 4) groups[item.section].push(item);
      });
      setResults(
        Object.entries(groups).map(([section, items]) => ({ section, items }))
      );
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);
  return results;
}
function SearchOverlay({ onClose }) {
  const [query, setQuery] = useState("");
  const results = useSearch(query);
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef(null);
  const flat = results.flatMap((g) => g.items);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  useEffect(() => {
    setCursor(0);
  }, [query]);
  function handleKey(e) {
    if (flat.length === 0) return;
    if (e.key === "Escape") {
      onClose();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, flat.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    }
    if (e.key === "Enter" && flat[cursor]) {
      window.location.href = flat[cursor].href;
      onClose();
    }
  }
  return /* @__PURE__ */ jsxs(
    "div",
    {
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      },
      onClick: (e) => {
        if (e.target === e.currentTarget) onClose();
      },
      children: [
        /* @__PURE__ */ jsxs("div", { style: {
          background: "#18181b",
          border: "1px solid #60a5fa",
          borderRadius: "999px",
          minWidth: "320px",
          maxWidth: "360px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
          padding: "0.5rem 1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem"
        }, children: [
          /* @__PURE__ */ jsxs("svg", { width: "22", height: "22", fill: "none", stroke: "#60a5fa", strokeWidth: "2", viewBox: "0 0 24 24", children: [
            /* @__PURE__ */ jsx("circle", { cx: "11", cy: "11", r: "8" }),
            /* @__PURE__ */ jsx("path", { d: "m21 21-4.35-4.35" })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              ref: inputRef,
              value: query,
              onChange: (e) => setQuery(e.target.value),
              onKeyDown: handleKey,
              placeholder: "Search…",
              style: {
                flex: 1,
                background: "none",
                border: "none",
                outline: "none",
                color: "#fff",
                fontSize: "1rem",
                fontFamily: "inherit"
              }
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: onClose,
              style: { background: "none", border: "none", color: "#60a5fa", fontSize: "1.2rem", cursor: "pointer" },
              "aria-label": "Close search",
              children: "×"
            }
          )
        ] }),
        query.length >= 2 && results.length > 0 && /* @__PURE__ */ jsx("div", { style: {
          position: "absolute",
          top: "calc(50% + 32px)",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#18181b",
          border: "1px solid #60a5fa",
          borderRadius: "12px",
          minWidth: "320px",
          maxWidth: "360px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
          padding: "0.5rem 0",
          zIndex: 1e4
        }, children: results.flatMap((group) => group.items).map((item, idx) => /* @__PURE__ */ jsx(
          "a",
          {
            href: item.href,
            onClick: onClose,
            style: {
              display: "block",
              padding: "0.5rem 1rem",
              textDecoration: "none",
              color: "#e5e7eb",
              fontSize: "0.95rem",
              background: idx === cursor ? "rgba(96,165,250,0.08)" : "transparent",
              borderLeft: idx === cursor ? "2px solid #60a5fa" : "2px solid transparent",
              transition: "background 100ms"
            },
            children: item.title
          },
          item.title
        )) })
      ]
    }
  );
}
function ResponsiveNav() {
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    fetch("/api/auth/status", { credentials: "same-origin" }).then((r) => r.json()).then((d) => setLoggedIn(d.loggedIn)).catch(() => {
    });
  }, []);
  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      if (y < 80) {
        setVisible(true);
      } else {
        setVisible(y < lastY.current);
      }
      lastY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("nav", { style: {
      position: "sticky",
      top: 0,
      zIndex: mobileOpen ? 1200 : 50,
      opacity: visible ? 1 : 0,
      pointerEvents: visible ? "auto" : "none",
      transition: "opacity 280ms ease",
      background: "rgba(22,23,29,0.88)",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      borderBottom: "1px solid rgba(255,255,255,0.07)"
    }, children: [
      /* @__PURE__ */ jsxs("div", { style: {
        display: "flex",
        alignItems: "center",
        height: "3.5rem",
        padding: "0 var(--cb-content-pad)",
        position: "relative"
      }, children: [
        /* @__PURE__ */ jsx("a", { href: "/", style: {
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
          height: "3.5rem",
          textDecoration: "none"
        }, children: /* @__PURE__ */ jsx(
          "img",
          {
            src: "/CB-logo-icon.svg",
            alt: "Clouded Basement",
            style: { height: "2rem", width: "auto", display: "block" }
          }
        ) }),
        /* @__PURE__ */ jsx("div", { className: "hidden md:flex", style: {
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          alignItems: "center",
          gap: "2rem"
        }, children: [
          { label: "Features", href: "/#features" },
          { label: "Pricing", href: "/#pricing" },
          { label: "Docs", href: "/docs" }
        ].map((link) => /* @__PURE__ */ jsx(
          "a",
          {
            href: link.href,
            style: { color: "#9ca3af", textDecoration: "none", fontSize: "0.875rem", transition: "color 150ms" },
            onMouseEnter: (e) => {
              e.target.style.color = "#fff";
            },
            onMouseLeave: (e) => {
              e.target.style.color = "#9ca3af";
            },
            children: link.label
          },
          link.label
        )) }),
        /* @__PURE__ */ jsxs("div", { style: { marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.75rem" }, children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setSearchOpen(true),
              style: {
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "none",
                border: "none",
                color: "#9ca3af",
                cursor: "pointer",
                padding: "0.25rem",
                transition: "color 150ms"
              },
              onMouseEnter: (e) => {
                e.currentTarget.style.color = "#fff";
              },
              onMouseLeave: (e) => {
                e.currentTarget.style.color = "#9ca3af";
              },
              "aria-label": "Open search",
              children: /* @__PURE__ */ jsx(SearchIcon, { size: 18 })
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "hidden md:flex", style: { gap: "0.75rem" }, children: loggedIn ? /* @__PURE__ */ jsx(
            "a",
            {
              href: "/dashboard",
              className: "funnel-btn funnel-btn-primary",
              style: { padding: "0.375rem 0.875rem", fontSize: "0.875rem" },
              children: "Dashboard"
            }
          ) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(
              "a",
              {
                href: "/login",
                className: "funnel-btn funnel-btn-ghost",
                style: { padding: "0.375rem 0.875rem", fontSize: "0.875rem" },
                children: "Sign in"
              }
            ),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: "/register",
                className: "funnel-btn funnel-btn-primary",
                style: { padding: "0.375rem 0.875rem", fontSize: "0.875rem" },
                children: "Start free trial"
              }
            )
          ] }) }),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "md:hidden",
              onClick: () => setMobileOpen((o) => !o),
              style: { background: "none", border: "none", color: "#9ca3af", cursor: "pointer", padding: "0.25rem" },
              "aria-label": "Toggle menu",
              children: mobileOpen ? /* @__PURE__ */ jsx(XIcon, { size: 22 }) : /* @__PURE__ */ jsx(MenuIcon, { size: 22 })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "md:hidden", style: {
        position: "fixed",
        inset: 0,
        zIndex: 1300,
        minHeight: "100dvh",
        overflowY: "auto",
        background: "rgba(3,6,8,0.985)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "flex-start",
        transition: "opacity 250ms",
        opacity: mobileOpen ? 1 : 0,
        pointerEvents: mobileOpen ? "auto" : "none"
      }, children: [
        /* @__PURE__ */ jsxs("div", { style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 1.25rem",
          borderBottom: "1px solid rgba(255,255,255,0.08)"
        }, children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: "/CB-logo-icon.svg",
              alt: "Clouded Basement",
              style: { height: "1.6rem", width: "auto", display: "block" }
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setMobileOpen(false),
              style: {
                width: "2.25rem",
                height: "2.25rem",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.16)",
                background: "rgba(255,255,255,0.04)",
                color: "#d1d5db",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer"
              },
              "aria-label": "Close menu",
              children: /* @__PURE__ */ jsx(XIcon, { size: 18 })
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { style: { padding: "1.15rem 1.25rem 0.75rem", display: "flex", flexDirection: "column" }, children: [
          { label: "Features", href: "/#features" },
          { label: "Pricing", href: "/#pricing" },
          { label: "Docs", href: "/docs" }
        ].map((link) => /* @__PURE__ */ jsx(
          "a",
          {
            href: link.href,
            onClick: () => setMobileOpen(false),
            style: {
              color: "#e5e7eb",
              textDecoration: "none",
              fontSize: "1.125rem",
              fontWeight: 500,
              padding: "0.9rem 0.1rem",
              borderBottom: "1px solid rgba(255,255,255,0.08)"
            },
            children: link.label
          },
          link.label
        )) }),
        /* @__PURE__ */ jsx("div", { style: { padding: "0.9rem 1.25rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.65rem" }, children: loggedIn ? /* @__PURE__ */ jsx(
          "a",
          {
            href: "/dashboard",
            onClick: () => setMobileOpen(false),
            className: "funnel-btn funnel-btn-primary",
            style: { width: "100%", justifyContent: "center" },
            children: "Dashboard"
          }
        ) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(
            "a",
            {
              href: "/login",
              onClick: () => setMobileOpen(false),
              className: "funnel-btn funnel-btn-ghost",
              style: { width: "100%", justifyContent: "center" },
              children: "Sign in"
            }
          ),
          /* @__PURE__ */ jsx(
            "a",
            {
              href: "/register",
              onClick: () => setMobileOpen(false),
              className: "funnel-btn funnel-btn-primary",
              style: { width: "100%", justifyContent: "center" },
              children: "Start free trial"
            }
          )
        ] }) })
      ] })
    ] }),
    searchOpen && /* @__PURE__ */ jsx(SearchOverlay, { onClose: () => setSearchOpen(false) })
  ] });
}
const PALETTE = {
  green: "#a6e3a1",
  blue: "#89b4fa",
  gray: "#585b70",
  dim: "#45475a",
  text: "#cdd6f4",
  red: "#f38ba8",
  yellow: "#f9e2af"
};
const LINES = [
  { type: "cmd", prompt: { user: "alex", host: "vps-prod", dir: "~" }, text: "bash deploy.sh" },
  { type: "out", text: "[1/5] Pulling latest code...", color: PALETTE.dim },
  { type: "out", text: "  ✓ Already up to date.", color: PALETTE.green },
  { type: "out", text: "[2/5] Installing dependencies...", color: PALETTE.dim },
  { type: "out", text: "  npm warn deprecated inflight@1.0.6", color: PALETTE.yellow },
  { type: "out", text: "  npm warn deprecated rimraf@2.7.1", color: PALETTE.yellow },
  { type: "out", text: "  added 847 packages in 41s", color: PALETTE.dim },
  { type: "out", text: "[3/5] Building application...", color: PALETTE.dim },
  { type: "out", text: "  ✗ FATAL ERROR: CALL_AND_RETRY_LAST", color: PALETTE.red },
  { type: "out", text: "    JavaScript heap out of memory", color: PALETTE.red },
  { type: "out", text: "  Retrying with --max-old-space-size=512...", color: PALETTE.yellow },
  { type: "out", text: "  ✗ Build failed. Exit code 1", color: PALETTE.red },
  { type: "out", text: "[4/5] Reloading nginx...", color: PALETTE.dim },
  { type: "out", text: '  ✗ [emerg] unknown directive "ssl_stapling"', color: PALETTE.red },
  { type: "out", text: "    /etc/nginx/sites-enabled/myapp.conf:23", color: PALETTE.dim },
  { type: "out", text: "[5/5] Renewing SSL certificate...", color: PALETTE.dim },
  { type: "out", text: "  ✗ Challenge failed for myapp.com", color: PALETTE.red },
  { type: "out", text: "    Port 80 in use — is nginx running?", color: PALETTE.yellow },
  { type: "out", text: "", color: PALETTE.dim },
  { type: "out", text: "❌ Deploy failed. See /var/log/deploy.log", color: PALETTE.red },
  { type: "cmd", prompt: { user: "alex", host: "vps-prod", dir: "~" }, text: "", final: true }
];
function rand(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
function TerminalCard$1() {
  const [lines, setLines] = useState(LINES.map(() => ({ text: "", done: false })));
  const [activeIdx, setActiveIdx] = useState(-1);
  const [blink, setBlink] = useState(true);
  const cancelled = useRef(false);
  useEffect(() => {
    cancelled.current = false;
    let timer;
    async function run() {
      await new Promise((r) => {
        timer = setTimeout(r, 500);
      });
      for (let i = 0; i < LINES.length; i++) {
        if (cancelled.current) return;
        const full = LINES[i].text;
        setActiveIdx(i);
        for (let c = 0; c <= full.length; c++) {
          if (cancelled.current) return;
          const delay = LINES[i].type === "cmd" ? rand(40, 90) : rand(12, 40);
          await new Promise((r) => {
            timer = setTimeout(r, delay);
          });
          setLines((prev) => {
            const next = [...prev];
            next[i] = { text: full.slice(0, c), done: false };
            return next;
          });
        }
        setLines((prev) => {
          const next = [...prev];
          next[i] = { ...next[i], done: true };
          return next;
        });
        const pause = LINES[i].type === "cmd" ? 350 : 60;
        await new Promise((r) => {
          timer = setTimeout(r, pause);
        });
      }
    }
    run();
    return () => {
      cancelled.current = true;
      clearTimeout(timer);
    };
  }, []);
  useEffect(() => {
    const t = setInterval(() => setBlink((v) => !v), 530);
    return () => clearInterval(t);
  }, []);
  const showCursorOnLine = (i) => {
    if (i !== activeIdx) return false;
    return !lines[i]?.done || LINES[i]?.final;
  };
  return /* @__PURE__ */ jsxs("div", { style: {
    background: "#11111b",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "0.75rem",
    width: "100%",
    maxWidth: "440px",
    overflow: "hidden",
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
    fontSize: "12px",
    lineHeight: "1.6"
  }, children: [
    /* @__PURE__ */ jsxs("div", { style: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      padding: "10px 14px",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      background: "rgba(255,255,255,0.02)"
    }, children: [
      /* @__PURE__ */ jsx("span", { style: { width: 10, height: 10, borderRadius: "50%", background: PALETTE.red, flexShrink: 0 } }),
      /* @__PURE__ */ jsx("span", { style: { width: 10, height: 10, borderRadius: "50%", background: PALETTE.yellow, flexShrink: 0 } }),
      /* @__PURE__ */ jsx("span", { style: { width: 10, height: 10, borderRadius: "50%", background: PALETTE.green, flexShrink: 0 } }),
      /* @__PURE__ */ jsx("span", { style: { marginLeft: 8, fontSize: 10, color: PALETTE.gray }, children: "vps-prod — bash" })
    ] }),
    /* @__PURE__ */ jsx("div", { style: { padding: "14px 16px" }, children: LINES.map((spec, i) => {
      const line = lines[i] || { text: "" };
      const isCmd = spec.type === "cmd";
      const color = isCmd ? PALETTE.text : spec.color || PALETTE.text;
      return /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexWrap: "wrap", marginBottom: "1px", minHeight: "1.4em" }, children: [
        isCmd && /* @__PURE__ */ jsxs("span", { style: { marginRight: 4, flexShrink: 0, whiteSpace: "nowrap" }, children: [
          /* @__PURE__ */ jsxs("span", { style: { color: PALETTE.green }, children: [
            spec.prompt.user,
            "@",
            spec.prompt.host
          ] }),
          /* @__PURE__ */ jsx("span", { style: { color: PALETTE.gray }, children: ":" }),
          /* @__PURE__ */ jsx("span", { style: { color: PALETTE.blue }, children: spec.prompt.dir }),
          /* @__PURE__ */ jsx("span", { style: { color: PALETTE.gray }, children: " $ " })
        ] }),
        /* @__PURE__ */ jsxs("span", { style: { color, wordBreak: "break-all" }, children: [
          line.text,
          showCursorOnLine(i) && /* @__PURE__ */ jsx("span", { style: {
            display: "inline-block",
            width: 7,
            height: "0.85em",
            background: PALETTE.text,
            verticalAlign: "-0.08em",
            marginLeft: 1,
            opacity: blink ? 1 : 0
          } })
        ] })
      ] }, i);
    }) })
  ] });
}
function HeroSection() {
  return /* @__PURE__ */ jsxs("section", { children: [
    /* @__PURE__ */ jsxs("div", { className: "cb-split cb-split-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "cb-content-pad pt-20 pb-28 md:pt-32 md:pb-32 flex flex-col items-center md:items-start text-center md:text-left relative", children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src: "/CB-last-final.svg",
            alt: "Clouded Basement Logo",
            className: "absolute left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0 top-8 md:top-8 w-[14rem] h-[14rem] md:w-[18rem] md:h-[18rem] drop-shadow-lg pointer-events-none select-none",
            draggable: "false",
            style: { userSelect: "none" }
          }
        ),
        /* @__PURE__ */ jsxs("h1", { className: "funnel-heading-1 mb-6 relative z-10 mt-22 md:mt-36", children: [
          "Managed VPS hosting.",
          " ",
          /* @__PURE__ */ jsx("span", { className: "hidden md:inline", children: " Your code. Fully automated deploys." }),
          /* @__PURE__ */ jsxs("span", { className: "md:hidden", children: [
            /* @__PURE__ */ jsx("br", {}),
            "Your code. Fully automated deploys."
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "funnel-body mb-8 max-w-[30rem]", children: "Launch a developer-friendly cloud server with GitHub deploys, WordPress support, free SSL, and full root access in minutes." }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-3 justify-center items-center md:justify-start md:items-start", children: [
          /* @__PURE__ */ jsx("a", { href: "/register", className: "funnel-btn funnel-btn-primary", children: "Start Free Trial" }),
          /* @__PURE__ */ jsx("a", { href: "/docs", className: "funnel-btn funnel-btn-subtle", children: "Documentation" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "cb-content-pad pt-20 pb-28 md:pt-28 md:pb-32 flex flex-col items-center justify-center gap-4", children: [
        /* @__PURE__ */ jsx(TerminalCard$1, {}),
        /* @__PURE__ */ jsx("p", { className: "funnel-mono text-[11px] text-center text-white/20", children: "automate the server work. keep shipping product." })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "border-t-faint cb-content-pad py-5 flex justify-center", children: /* @__PURE__ */ jsxs("ul", { className: "funnel-mono text-[11px] flex flex-row flex-wrap justify-center items-center gap-4 md:gap-10 w-full text-center text-white/30", children: [
      /* @__PURE__ */ jsx("li", { children: "-> GitHub auto-deploy" }),
      /* @__PURE__ */ jsx("li", { children: "-> WordPress-ready VPS" }),
      /* @__PURE__ */ jsx("li", { children: "-> Full SSH and root control" })
    ] }) })
  ] });
}
const TERM_BG = "#0a0a0a";
const TERM_BORDER = "#262626";
const ERROR_LINES = [
  {
    cmd: "sudo nginx -t",
    lines: [
      { text: 'nginx: [emerg] unknown directive "proxy_passs"', color: "#f87171" },
      { text: "nginx: configuration file test failed", color: "#f87171" }
    ]
  },
  {
    cmd: "sudo certbot --nginx -d myapp.com",
    lines: [
      { text: "DNS problem: NXDOMAIN looking up A for myapp.com", color: "#f87171" },
      { text: "check DNS A record or wait for propagation", color: "#6b7280" }
    ]
  },
  {
    cmd: "sudo systemctl status myapp",
    lines: [
      { text: "- myapp.service - failed", color: "#f87171" },
      { text: "Error: EADDRINUSE: port 3000 already in use", color: "#6b7280" }
    ]
  },
  {
    cmd: "sudo ufw status",
    lines: [{ text: "Status: inactive  (port 22 open to world)", color: "#facc15" }]
  }
];
function TerminalCard() {
  return /* @__PURE__ */ jsxs("div", { style: {
    width: "100%",
    maxWidth: "28rem",
    background: "#111111",
    border: `1px solid ${TERM_BORDER}`,
    borderRadius: "0.625rem",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
  }, children: [
    /* @__PURE__ */ jsxs("div", { style: {
      padding: "0.5rem 0.875rem",
      background: "#0d0d0d",
      borderBottom: `1px solid ${TERM_BORDER}`,
      display: "flex",
      alignItems: "center",
      gap: "0.375rem"
    }, children: [
      /* @__PURE__ */ jsx("span", { style: { width: "9px", height: "9px", borderRadius: "50%", background: "#ef4444", opacity: 0.8 } }),
      /* @__PURE__ */ jsx("span", { style: { width: "9px", height: "9px", borderRadius: "50%", background: "#eab308", opacity: 0.8 } }),
      /* @__PURE__ */ jsx("span", { style: { width: "9px", height: "9px", borderRadius: "50%", background: "#22c55e", opacity: 0.8 } }),
      /* @__PURE__ */ jsx("span", { style: { marginLeft: "0.5rem", color: "#525252", fontSize: "0.6875rem" }, children: "deploy@vps:~$" })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: {
      padding: "0.75rem 1rem",
      fontFamily: "monospace",
      fontSize: "0.6875rem",
      lineHeight: 1.7,
      background: TERM_BG
    }, children: [
      ERROR_LINES.map((block, i) => /* @__PURE__ */ jsxs("div", { style: { marginTop: i > 0 ? "0.5rem" : 0 }, children: [
        /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("span", { style: { color: "#4ade80" }, children: "$" }),
          " ",
          /* @__PURE__ */ jsx("span", { style: { color: "#d1d5db" }, children: block.cmd })
        ] }),
        block.lines.map((line) => /* @__PURE__ */ jsx("p", { style: { color: line.color, paddingLeft: "0.5rem" }, children: line.text }, line.text))
      ] }, block.cmd)),
      /* @__PURE__ */ jsxs("div", { style: { marginTop: "0.5rem" }, children: [
        /* @__PURE__ */ jsx("span", { style: { color: "#4ade80" }, children: "$" }),
        /* @__PURE__ */ jsx("span", { style: {
          display: "inline-block",
          width: "6px",
          height: "12px",
          background: "#d1d5db",
          marginLeft: "4px",
          verticalAlign: "middle",
          animation: "pulse 1s ease-in-out infinite"
        } })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { style: {
      borderTop: `1px solid ${TERM_BORDER}`,
      padding: "0.5rem 1rem",
      textAlign: "center"
    }, children: /* @__PURE__ */ jsx("p", { style: { fontSize: "0.6875rem", color: "#525252", fontStyle: "italic" }, children: "Shipping should not require weekend DevOps work." }) })
  ] });
}
function ProblemFrame() {
  return /* @__PURE__ */ jsxs("section", { children: [
    /* @__PURE__ */ jsx("div", { className: "cb-title-row", children: /* @__PURE__ */ jsxs("div", { className: "text-center mb-10", children: [
      /* @__PURE__ */ jsx("p", { className: "text-brand text-lg font-semibold mb-4", children: "The hidden cost of DIY cloud hosting" }),
      /* @__PURE__ */ jsx("h2", { className: "text-3xl md:text-4xl font-bold mb-5 text-white", children: "Build your product, not your server stack." })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "cb-split cb-split-2", children: [
      /* @__PURE__ */ jsx("div", { className: "cb-content-pad py-12 flex flex-col justify-center items-center", children: /* @__PURE__ */ jsxs("div", { className: "max-w-xl w-full", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-base md:text-lg text-gray-200 mb-4 lg:text-left text-center", children: [
          "Most launches slow down on infrastructure tasks, not product work.",
          /* @__PURE__ */ jsx("br", {}),
          "SSL setup, reverse proxies, deploy pipelines, and server patching can drain weeks from small teams."
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-base md:text-lg text-gray-300 mb-4 lg:text-left text-center", children: [
          "Serverless can be limiting for full-stack apps and WordPress.",
          /* @__PURE__ */ jsx("br", {}),
          "Raw VPS hosting gives control, but leaves setup and maintenance on you."
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-base md:text-lg text-gray-400 lg:text-left text-center", children: [
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-brand", children: "Clouded Basement gives you both:" }),
          " managed VPS automation with full server control, so startups and developers can ship faster."
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "cb-content-pad py-12 flex items-center justify-center", children: /* @__PURE__ */ jsx(TerminalCard, {}) })
    ] })
  ] });
}
const BG = "#0a0a0a";
const CARD = "#111111";
const BORDER = "#262626";
const TEXT = "#fafafa";
const MUTED = "#a1a1a1";
const DIM = "#525252";
const ACCENT = "#3b82f6";
const STEPS = [
  {
    n: "01",
    title: "Connect your Git repository",
    body: "Paste your GitHub repo URL, choose your branch, and start deploy. We handle server setup, dependencies, and web server configuration."
  },
  {
    n: "02",
    title: "Automate cloud server deploys",
    body: "Watch real-time build logs while your app installs and boots. Enable auto-deploy once and every push ships to your managed VPS."
  },
  {
    n: "03",
    title: "Go live with full control",
    body: "Your app is online. Add domains, enable SSL, host WordPress, and manage everything from one dashboard with full SSH and root access."
  }
];
function DeployPanel() {
  return /* @__PURE__ */ jsxs("div", { style: { padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.875rem" }, children: [
    /* @__PURE__ */ jsx("p", { style: { fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: DIM }, children: "Git-based deployment" }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "0.5rem" }, children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          readOnly: true,
          value: "https://github.com/alex/my-saas-app.git",
          style: {
            flex: 1,
            padding: "0.5rem 0.75rem",
            minWidth: 0,
            background: BG,
            border: `1px solid ${BORDER}`,
            borderRadius: "0.375rem",
            color: MUTED,
            fontSize: "0.6875rem",
            fontFamily: "monospace",
            outline: "none"
          }
        }
      ),
      /* @__PURE__ */ jsx("button", { style: {
        padding: "0.5rem 1rem",
        flexShrink: 0,
        background: ACCENT,
        border: "none",
        borderRadius: "0.375rem",
        color: "#fff",
        fontSize: "0.75rem",
        fontWeight: 600,
        cursor: "default"
      }, children: "Deploy" })
    ] }),
    /* @__PURE__ */ jsx("p", { style: { fontSize: "0.6875rem", color: DIM }, children: "Works with GitHub, GitLab, and Bitbucket." })
  ] });
}
const LOG_LINES = [
  { text: "$ git clone https://github.com/alex/my-saas-app", color: DIM },
  { text: "Cloning into 'my-saas-app'...", color: MUTED },
  { text: "$ npm install", color: DIM },
  { text: "added 312 packages in 4.2s", color: MUTED },
  { text: "$ npm start", color: DIM },
  { text: "Server listening on port 3000", color: MUTED },
  { text: "App deployed successfully", color: "#4ade80" }
];
function LogsPanel() {
  return /* @__PURE__ */ jsxs("div", { style: { padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.875rem" }, children: [
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.5rem" }, children: [
      /* @__PURE__ */ jsx("div", { style: { width: "7px", height: "7px", borderRadius: "50%", background: ACCENT, boxShadow: `0 0 5px ${ACCENT}` } }),
      /* @__PURE__ */ jsx("p", { style: { fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: DIM }, children: "Deploying managed VPS app" })
    ] }),
    /* @__PURE__ */ jsx("div", { style: {
      background: BG,
      border: `1px solid ${BORDER}`,
      borderRadius: "0.375rem",
      padding: "0.75rem",
      fontFamily: "monospace",
      fontSize: "0.6875rem",
      lineHeight: 1.8,
      display: "flex",
      flexDirection: "column"
    }, children: LOG_LINES.map((line, i) => /* @__PURE__ */ jsx("span", { style: { color: line.color }, children: line.text }, i)) })
  ] });
}
function LivePanel() {
  const rowStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.45rem 0",
    borderBottom: `1px solid ${BORDER}`
  };
  return /* @__PURE__ */ jsxs("div", { style: { padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.875rem" }, children: [
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.375rem" }, children: [
        /* @__PURE__ */ jsx("span", { style: { width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e" } }),
        /* @__PURE__ */ jsx("span", { style: { fontSize: "0.6875rem", color: "#22c55e", fontWeight: 600 }, children: "Online" })
      ] }),
      /* @__PURE__ */ jsx("span", { style: { fontSize: "0.6875rem", color: DIM }, children: "my-saas-app" })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { borderTop: `1px solid ${BORDER}` }, children: [
      /* @__PURE__ */ jsxs("div", { style: rowStyle, children: [
        /* @__PURE__ */ jsx("span", { style: { fontSize: "0.6875rem", color: DIM }, children: "IPv4" }),
        /* @__PURE__ */ jsx("span", { style: { fontSize: "0.75rem", color: ACCENT, fontFamily: "monospace" }, children: "143.198.x.x" })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: rowStyle, children: [
        /* @__PURE__ */ jsx("span", { style: { fontSize: "0.6875rem", color: DIM }, children: "Plan" }),
        /* @__PURE__ */ jsx("span", { style: { fontSize: "0.75rem", color: TEXT }, children: "PRO" })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { ...rowStyle, borderBottom: "none" }, children: [
        /* @__PURE__ */ jsx("span", { style: { fontSize: "0.6875rem", color: DIM }, children: "Sites" }),
        /* @__PURE__ */ jsx("span", { style: { fontSize: "0.75rem", color: TEXT }, children: "1 / 5" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: {
      background: BG,
      border: `1px solid ${BORDER}`,
      borderRadius: "0.375rem",
      padding: "0.5rem 0.75rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }, children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "0.375rem" }, children: [
        /* @__PURE__ */ jsx("span", { style: { fontSize: "0.6875rem" }, children: "SSL" }),
        /* @__PURE__ */ jsx("span", { style: { fontSize: "0.75rem", color: TEXT }, children: "myapp.com" })
      ] }),
      /* @__PURE__ */ jsx("span", { style: { fontSize: "0.625rem", color: "#22c55e", fontWeight: 600 }, children: "SSL active" })
    ] })
  ] });
}
const PANELS = [DeployPanel, LogsPanel, LivePanel];
function PanelChrome({ activeIdx }) {
  const Panel = PANELS[activeIdx];
  return /* @__PURE__ */ jsxs("div", { style: {
    width: "100%",
    maxWidth: "28rem",
    background: CARD,
    border: `1px solid ${BORDER}`,
    borderRadius: "0.625rem",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
  }, children: [
    /* @__PURE__ */ jsxs("div", { style: {
      padding: "0.5rem 0.875rem",
      background: "#0d0d0d",
      borderBottom: `1px solid ${BORDER}`,
      display: "flex",
      alignItems: "center",
      gap: "0.375rem"
    }, children: [
      [0, 1, 2].map((i) => /* @__PURE__ */ jsx("span", { style: { width: "9px", height: "9px", borderRadius: "50%", background: "#3a3a3a" } }, i)),
      /* @__PURE__ */ jsx("span", { style: { marginLeft: "0.5rem", color: DIM, fontSize: "0.6875rem" }, children: "dashboard.cloudedbasement.ca" })
    ] }),
    /* @__PURE__ */ jsx(Panel, {})
  ] });
}
function HowItWorks() {
  const [active, setActive] = useState(0);
  const sectionRef = useRef(null);
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      if (window.innerWidth < 768) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const sectionH = sectionRef.current.offsetHeight;
      const vh = window.innerHeight;
      const scrolled = -rect.top;
      const scrollable = sectionH - vh;
      if (scrollable <= 0) return;
      const progress = Math.max(0, Math.min(1, scrolled / scrollable));
      const step = Math.min(STEPS.length - 1, Math.floor(progress * STEPS.length));
      setActive(step);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return /* @__PURE__ */ jsx("section", { ref: sectionRef, className: "hiw-section", children: /* @__PURE__ */ jsxs("div", { className: "hiw-sticky border-b-faint", style: { display: "flex", flexDirection: "column" }, children: [
    /* @__PURE__ */ jsxs("div", { className: "pt-14 px-10 pb-10 border-b-dim shrink-0", children: [
      /* @__PURE__ */ jsx("p", { className: "funnel-kicker mb-3", children: "How it works" }),
      /* @__PURE__ */ jsx("h2", { className: "funnel-heading-2", children: "Three steps to automated cloud hosting" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2", style: { flex: 1, minHeight: 0 }, children: [
      /* @__PURE__ */ jsx("div", { className: "border-r-faint py-8 px-10 flex flex-col justify-center", children: STEPS.map((step, i) => {
        const isActive = active === i;
        return /* @__PURE__ */ jsxs(
          "div",
          {
            onClick: () => setActive(i),
            className: `flex gap-5 py-8 cursor-pointer${i < STEPS.length - 1 ? " border-b-dim" : ""}`,
            style: {
              opacity: isActive ? 1 : 0.35,
              transition: "opacity 400ms ease"
            },
            children: [
              /* @__PURE__ */ jsx("div", { style: {
                width: "2.25rem",
                height: "2.25rem",
                borderRadius: "50%",
                flexShrink: 0,
                border: isActive ? `1px solid ${ACCENT}` : "1px solid rgba(255,255,255,0.1)",
                background: isActive ? `${ACCENT}18` : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.6875rem",
                fontWeight: 700,
                color: isActive ? ACCENT : DIM,
                transition: "all 400ms ease"
              }, children: step.n }),
              /* @__PURE__ */ jsxs("div", { style: { paddingTop: "0.3rem" }, children: [
                /* @__PURE__ */ jsx("h3", { className: "funnel-heading-3 mb-2", children: step.title }),
                /* @__PURE__ */ jsx("p", { className: "funnel-body-sm text-gray-500", children: step.body })
              ] })
            ]
          },
          step.n
        );
      }) }),
      /* @__PURE__ */ jsx("div", { className: "py-8 px-10 flex items-center justify-center", children: /* @__PURE__ */ jsx(PanelChrome, { activeIdx: active }) })
    ] })
  ] }) });
}
function SectionTitle({ text1, text2, text3 }) {
  return /* @__PURE__ */ jsxs("div", { className: "text-center mb-16 reveal", children: [
    text1 && /* @__PURE__ */ jsx("p", { className: "funnel-kicker mb-4", children: text1 }),
    text2 && /* @__PURE__ */ jsx("h2", { className: "funnel-heading-2 mb-5", children: text2 }),
    text3 && /* @__PURE__ */ jsx("p", { className: "funnel-body max-w-xl mx-auto", children: text3 })
  ] });
}
const LOGOS = [
  { name: "Stripe", color: "#635BFF", svg: "/stripe-svgrepo-com.svg" },
  { name: "DigitalOcean", color: "#0080FF", svg: "/digital-ocean-svgrepo-com.svg" },
  { name: "SendGrid", color: "#1A82E2", svg: "/sendgrid-icon-svgrepo-com.svg" },
  { name: "Gmail", color: "#EA4335", svg: "/google-gmail-svgrepo-com.svg" },
  { name: "Google", color: "#4285F4", svg: "/google-icon-logo-svgrepo-com.svg" },
  { name: "React", color: "#61DAFB", svg: "/react-javascript-js-framework-facebook-svgrepo-com.svg" }
];
const TRACK = [...LOGOS, ...LOGOS];
function IntegrationsCarousel() {
  return /* @__PURE__ */ jsx(
    "div",
    {
      style: {
        overflow: "hidden",
        width: "100%",
        maskImage: "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)"
      },
      children: /* @__PURE__ */ jsx(
        "div",
        {
          style: {
            display: "flex",
            width: "max-content",
            animation: "cb-carousel 20s linear infinite"
          },
          children: TRACK.map((logo, i) => /* @__PURE__ */ jsx(
            "div",
            {
              style: { padding: "0 2.5rem", flexShrink: 0, display: "flex", alignItems: "center" },
              children: logo.svg ? /* @__PURE__ */ jsx(
                "img",
                {
                  src: logo.svg,
                  alt: logo.name,
                  style: { height: "1.5rem", width: "auto", opacity: 0.75 }
                }
              ) : /* @__PURE__ */ jsx(
                "span",
                {
                  style: {
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontWeight: 600,
                    fontSize: "0.9375rem",
                    color: logo.color,
                    opacity: 0.65,
                    letterSpacing: "-0.01em",
                    whiteSpace: "nowrap"
                  },
                  children: logo.name
                }
              )
            },
            i
          ))
        }
      )
    }
  );
}
const featuresData = [
  {
    Icon: GitBranchIcon,
    title: "GitHub auto-deploys",
    body: "Connect your repository once and push to deploy automatically. Ideal for teams that want fast, repeatable releases on managed VPS hosting."
  },
  {
    Icon: DatabaseIcon,
    title: "One-click databases",
    body: "Install PostgreSQL or MongoDB from your dashboard with ready-to-use credentials and connection strings. No manual server setup required."
  },
  {
    Icon: LockIcon,
    title: "Automatic SSL and domains",
    body: "Point DNS and go live with automatic Let's Encrypt SSL. Host multiple domains on one managed cloud server without certificate busywork."
  },
  {
    Icon: TerminalIcon,
    title: "Full root access",
    body: "Use SSH and root access to install any runtime, package, or service. You keep full VPS control while automation handles routine ops."
  },
  {
    Icon: ArchiveIcon,
    title: "Automatic backups",
    body: "Get scheduled snapshots with one-click restore, so production apps and client websites stay protected when releases go wrong."
  },
  {
    Icon: CodeIcon,
    title: "Developer-ready runtimes",
    body: "Run Node.js, Python, Go, Rust, and popular Linux web frameworks on the same server. Perfect for startup MVPs and growing SaaS apps."
  },
  {
    Icon: LayersIcon,
    title: "Multi-site VPS hosting",
    body: "Host multiple projects, client apps, or WordPress sites on one server with isolated domain routing and automated SSL."
  },
  {
    Icon: GlobeIcon,
    title: "No vendor lock-in",
    body: "Your stack runs on standard Ubuntu infrastructure, so you can migrate anytime without rewriting your app for a proprietary platform."
  }
];
function FeatureCell({ Icon, title, body }) {
  return /* @__PURE__ */ jsxs("div", { className: "p-10", children: [
    /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-md flex items-center justify-center text-blue-400 mb-5 bg-blue-400/10", children: /* @__PURE__ */ jsx(Icon, { size: 16, strokeWidth: 1.75 }) }),
    /* @__PURE__ */ jsx("h3", { className: "funnel-heading-3 mb-2", children: title }),
    /* @__PURE__ */ jsx("p", { className: "funnel-body-sm", children: body })
  ] });
}
function Features() {
  return /* @__PURE__ */ jsxs("section", { id: "features", children: [
    /* @__PURE__ */ jsx("div", { className: "cb-title-row", children: /* @__PURE__ */ jsx(
      SectionTitle,
      {
        text1: "What you get",
        text2: "Managed VPS hosting features built for startups, agencies, and developers."
      }
    ) }),
    /* @__PURE__ */ jsx("div", { className: "cb-grid-cells cb-grid-cells--features", children: featuresData.map((feat) => /* @__PURE__ */ jsx(FeatureCell, { ...feat }, feat.title)) }),
    /* @__PURE__ */ jsxs("div", { className: "border-t-dim pt-6 pb-5", children: [
      /* @__PURE__ */ jsx("p", { className: "funnel-mono text-[11px] font-semibold tracking-widest uppercase text-center mb-4 text-white/30", children: "Automation-ready integrations" }),
      /* @__PURE__ */ jsx(IntegrationsCarousel, {})
    ] })
  ] });
}
const CELL_BORDER = "0.5px solid rgba(255,255,255,0.07)";
const ROWS = [
  { label: "Your own server", us: true, vercel: false, render: "~", raw: "check*" },
  { label: "Deploy from Git", us: true, vercel: true, render: true, raw: false },
  { label: "Full SSH / root", us: true, vercel: false, render: false, raw: true },
  { label: "SSL & domains", us: true, vercel: true, render: true, raw: false },
  { label: "Databases included", us: true, vercel: false, render: "~", raw: false },
  { label: "Multi-site hosting", us: true, vercel: false, render: false, raw: false },
  { label: "Predictable pricing", us: true, vercel: false, render: "~", raw: true },
  { label: "No vendor lock-in", us: true, vercel: false, render: "~", raw: true }
];
function CellValue({ val }) {
  if (val === true) return /* @__PURE__ */ jsx("span", { style: { color: "#4ade80", fontWeight: 700 }, children: "✓" });
  if (val === false) return /* @__PURE__ */ jsx("span", { style: { color: "#525252" }, children: "✗" });
  if (val === "~") return /* @__PURE__ */ jsx("span", { style: { color: "#facc15" }, children: "~" });
  if (val === "check*") return /* @__PURE__ */ jsx("span", { style: { color: "#a1a1a1" }, children: "✓*" });
  return /* @__PURE__ */ jsx("span", { style: { color: "#a1a1a1" }, children: val });
}
function ComparisonTable() {
  const headerStyle = {
    padding: "0.75rem 1rem",
    fontSize: "0.6875rem",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    textAlign: "center",
    color: "#a1a1a1"
  };
  const cellStyle = {
    padding: "0.75rem 1rem",
    fontSize: "0.8125rem",
    textAlign: "center",
    borderTop: CELL_BORDER
  };
  return /* @__PURE__ */ jsx("div", { className: "reveal", style: { overflowX: "auto" }, children: /* @__PURE__ */ jsxs("table", { style: { width: "100%", maxWidth: "52rem", margin: "0 auto", borderCollapse: "collapse" }, children: [
    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
      /* @__PURE__ */ jsx("th", { style: { ...headerStyle, textAlign: "left", minWidth: "10rem" } }),
      /* @__PURE__ */ jsxs("th", { style: { ...headerStyle, background: "rgba(59,130,246,0.06)", borderRadius: "0.5rem 0.5rem 0 0", minWidth: "7rem" }, children: [
        "Clouded",
        /* @__PURE__ */ jsx("br", {}),
        "Basement"
      ] }),
      /* @__PURE__ */ jsxs("th", { style: { ...headerStyle, minWidth: "7rem" }, children: [
        "Vercel /",
        /* @__PURE__ */ jsx("br", {}),
        "Netlify"
      ] }),
      /* @__PURE__ */ jsx("th", { style: { ...headerStyle, minWidth: "5rem" }, children: "Render" }),
      /* @__PURE__ */ jsxs("th", { style: { ...headerStyle, minWidth: "5rem" }, children: [
        "Raw",
        /* @__PURE__ */ jsx("br", {}),
        "VPS"
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("tbody", { children: ROWS.map((row) => /* @__PURE__ */ jsxs("tr", { children: [
      /* @__PURE__ */ jsx("td", { style: {
        ...cellStyle,
        textAlign: "left",
        fontWeight: 500,
        color: "#d1d5db",
        fontSize: "0.8125rem"
      }, children: row.label }),
      /* @__PURE__ */ jsx("td", { style: { ...cellStyle, background: "rgba(59,130,246,0.06)" }, children: /* @__PURE__ */ jsx(CellValue, { val: row.us }) }),
      /* @__PURE__ */ jsx("td", { style: cellStyle, children: /* @__PURE__ */ jsx(CellValue, { val: row.vercel }) }),
      /* @__PURE__ */ jsx("td", { style: cellStyle, children: /* @__PURE__ */ jsx(CellValue, { val: row.render }) }),
      /* @__PURE__ */ jsx("td", { style: cellStyle, children: /* @__PURE__ */ jsx(CellValue, { val: row.raw }) })
    ] }, row.label)) })
  ] }) });
}
function WhyChooseUs() {
  return /* @__PURE__ */ jsxs("section", { id: "compare", children: [
    /* @__PURE__ */ jsx("div", { className: "cb-title-row", children: /* @__PURE__ */ jsx(
      SectionTitle,
      {
        text1: "Why teams choose Clouded Basement",
        text2: "Managed VPS automation with real server ownership."
      }
    ) }),
    /* @__PURE__ */ jsx("div", { className: "cb-content-pad py-10", children: /* @__PURE__ */ jsx(ComparisonTable, {}) }),
    /* @__PURE__ */ jsxs("div", { className: "border-t-dim cb-content-pad py-8 text-center", children: [
      /* @__PURE__ */ jsx("p", { className: "funnel-body reveal max-w-[40rem] mx-auto text-[#9ca3af]", children: "Your apps run on a real Ubuntu VPS with tools developers already trust: Nginx, PM2, SSH, and Let's Encrypt. You get managed operations, but keep full control and portability." }),
      /* @__PURE__ */ jsxs("p", { className: "funnel-body-sm reveal mt-5 text-[#6b7280]", children: [
        "Plans start at ",
        /* @__PURE__ */ jsx("strong", { className: "text-[#e5e7eb]", children: "$15/month" }),
        " with a ",
        /* @__PURE__ */ jsx("strong", { className: "text-[#e5e7eb]", children: "3-day free trial" }),
        " and no credit card required."
      ] })
    ] })
  ] });
}
const pricingData = [
  {
    id: "basic",
    name: "Basic",
    desc: "Managed VPS for side projects and early startup builds",
    monthly: { price: "$15", period: "/mo" },
    yearly: { price: "$162", period: "/yr", perMonth: "$13.50" },
    features: [
      "1 GB RAM - 1 vCPU",
      "25 GB NVMe SSD - 1 TB bandwidth",
      "2 custom domains",
      "GitHub auto-deploy",
      "Free SSL and SSH access",
      "Email support"
    ]
  },
  {
    id: "pro",
    name: "Pro",
    desc: "Developer-friendly cloud hosting for production apps",
    monthly: { price: "$35", period: "/mo" },
    yearly: { price: "$378", period: "/yr", perMonth: "$31.50" },
    features: [
      "2 GB RAM - 2 vCPUs",
      "60 GB NVMe SSD - 3 TB bandwidth",
      "5 custom domains",
      "GitHub auto-deploy",
      "Free SSL and SSH access"
    ],
    adds: [
      "Weekly automatic backups",
      "Priority support (12 hr)"
    ],
    popular: true
  },
  {
    id: "premium",
    name: "Premium",
    desc: "Automated cloud servers for high-growth teams and agencies",
    monthly: { price: "$65", period: "/mo" },
    yearly: { price: "$702", period: "/yr", perMonth: "$58.50" },
    features: [
      "4 GB RAM - 2 vCPUs",
      "80 GB NVMe SSD - 4 TB bandwidth",
      "10 custom domains",
      "GitHub auto-deploy",
      "Free SSL and SSH access"
    ],
    adds: [
      "Daily automatic backups",
      "Direct developer support"
    ]
  }
];
function PricingCell({ id, name, desc, monthly, yearly, features, adds, popular, interval }) {
  const active = interval === "yearly" ? yearly : monthly;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "py-12 px-8 flex flex-col relative",
      style: { background: popular ? "rgba(37,99,235,0.04)" : "transparent" },
      children: [
        popular && /* @__PURE__ */ jsx("span", { className: "funnel-badge", children: "Most Popular" }),
        /* @__PURE__ */ jsx("h3", { className: "funnel-heading-3 mb-1", children: name }),
        /* @__PURE__ */ jsx("p", { className: "funnel-body-sm mb-5 text-gray-500", children: desc }),
        /* @__PURE__ */ jsxs("p", { className: "mb-1", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[2.5rem] font-bold tracking-[-0.03em] leading-none text-white", children: active.price }),
          /* @__PURE__ */ jsx("span", { className: "funnel-body-sm text-gray-500 ml-1", children: active.period })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-600 mb-6 min-h-5", children: interval === "yearly" ? /* @__PURE__ */ jsxs("span", { className: "text-green-400", children: [
          active.perMonth,
          "/mo - 2 months free"
        ] }) : "3-day free trial" }),
        /* @__PURE__ */ jsxs("ul", { className: "flex flex-col gap-2 mb-8 flex-1", children: [
          features.map((f) => /* @__PURE__ */ jsxs("li", { className: `funnel-body-sm flex items-center gap-2${popular ? " text-gray-300" : ""}`, children: [
            /* @__PURE__ */ jsx("span", { className: "text-green-400 text-[9px] shrink-0", children: "●" }),
            f
          ] }, f)),
          adds && adds.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-2 pt-1.5 pb-0.5", children: [
              /* @__PURE__ */ jsx("div", { className: "flex-1 h-px bg-white/10" }),
              /* @__PURE__ */ jsx("span", { className: "text-[0.625rem] font-semibold tracking-[0.08em] uppercase text-white/20 whitespace-nowrap", children: "also includes" }),
              /* @__PURE__ */ jsx("div", { className: "flex-1 h-px bg-white/10" })
            ] }),
            adds.map((f) => /* @__PURE__ */ jsxs("li", { className: "funnel-body-sm flex items-center gap-2 text-blue-300", children: [
              /* @__PURE__ */ jsx("span", { className: "text-blue-400 text-[9px] shrink-0", children: "●" }),
              f
            ] }, f))
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: `/pay?plan=${id}&interval=${interval}`,
            className: `funnel-btn ${popular ? "funnel-btn-primary" : "funnel-btn-subtle"} w-full text-center`,
            children: name
          }
        )
      ]
    }
  );
}
function NewPricing() {
  const [interval, setInterval2] = useState("monthly");
  return /* @__PURE__ */ jsxs("section", { id: "pricing", children: [
    /* @__PURE__ */ jsxs("div", { className: "cb-title-row", children: [
      /* @__PURE__ */ jsx(
        SectionTitle,
        {
          text1: "Pricing",
          text2: "Managed VPS plans with predictable pricing.",
          text3: "Choose automated cloud hosting built for developers, startups, and small business websites."
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "flex justify-center mt-8", children: /* @__PURE__ */ jsx("div", { className: "inline-flex items-center rounded-lg overflow-hidden border-dim bg-white/[0.02]", children: ["monthly", "yearly"].map((opt) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setInterval2(opt),
          className: "py-2 px-5 text-[0.8125rem] font-medium border-none cursor-pointer flex items-center gap-2",
          style: {
            background: interval === opt ? "rgba(255,255,255,0.07)" : "transparent",
            color: interval === opt ? "#fff" : "#6b7280",
            transition: "background 150ms ease, color 150ms ease"
          },
          children: opt === "monthly" ? "Monthly" : /* @__PURE__ */ jsxs(Fragment, { children: [
            "Yearly",
            /* @__PURE__ */ jsx("span", { className: "text-[0.625rem] font-bold tracking-[0.05em] py-0.5 px-1.5 rounded text-green-400 bg-green-400/15", children: "SAVE 10%" })
          ] })
        },
        opt
      )) }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "cb-grid-cells cb-grid-cells--pricing", children: pricingData.map((plan) => /* @__PURE__ */ jsx(
      PricingCell,
      {
        ...plan,
        interval
      },
      plan.id
    )) }),
    /* @__PURE__ */ jsx("div", { className: "border-t-dim py-4 px-10 text-center", children: /* @__PURE__ */ jsxs("p", { className: "funnel-body-sm text-gray-600", children: [
      "No contracts. Keep full server control.",
      " ",
      /* @__PURE__ */ jsx("a", { href: "/pricing", className: "text-blue-400 underline", children: "Compare all managed VPS features ->" })
    ] }) })
  ] });
}
const faqsData = [
  {
    q: "What is Clouded Basement?",
    a: "Clouded Basement is managed VPS hosting for developers, startups, and small businesses. You get a real Ubuntu cloud server with automation for deploys, SSL, and maintenance."
  },
  {
    q: "How do I deploy my first app?",
    a: "Create your server, connect your GitHub repo, and push to your main branch. Your app is built and deployed automatically with live logs in the dashboard."
  },
  {
    q: "Can I host WordPress and custom apps on the same server?",
    a: "Yes. You can run WordPress, Node.js, Python, and other Linux web apps on one managed VPS with full server control and domain-level SSL."
  },
  {
    q: "Do I get database support?",
    a: "Yes. Install PostgreSQL or MongoDB in one click from the dashboard. We generate credentials and provide ready-to-use connection details."
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. There are no long-term contracts and no platform lock-in. Cancel anytime from your dashboard, and your trial starts with no credit card required."
  }
];
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return /* @__PURE__ */ jsxs("div", { className: "border-t-dim", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setOpen((o) => !o),
        className: "w-full flex items-center justify-between gap-4 py-5 bg-transparent border-none cursor-pointer text-left",
        children: [
          /* @__PURE__ */ jsx("span", { className: "funnel-heading-3 font-medium", children: q }),
          /* @__PURE__ */ jsx(
            ChevronDownIcon,
            {
              size: 18,
              className: "shrink-0 text-gray-500",
              style: {
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 250ms ease"
              }
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { style: {
      overflow: "hidden",
      maxHeight: open ? "20rem" : "0",
      transition: "max-height 300ms ease"
    }, children: /* @__PURE__ */ jsx("p", { className: "funnel-body pb-5", children: a }) })
  ] });
}
function FaqSection() {
  return /* @__PURE__ */ jsxs("section", { id: "faq", children: [
    /* @__PURE__ */ jsx("div", { className: "cb-title-row", children: /* @__PURE__ */ jsx(
      SectionTitle,
      {
        text1: "FAQ",
        text2: "Managed VPS hosting questions",
        text3: "Clear answers for developers, startups, and small businesses moving to automated cloud hosting."
      }
    ) }),
    /* @__PURE__ */ jsx("div", { className: "pt-16 px-10 pb-28 max-w-2xl mx-auto", children: /* @__PURE__ */ jsxs("div", { className: "reveal", children: [
      faqsData.map((item) => /* @__PURE__ */ jsx(FaqItem, { ...item }, item.q)),
      /* @__PURE__ */ jsx("div", { className: "border-t-dim" })
    ] }) })
  ] });
}
function CTASection() {
  return /* @__PURE__ */ jsx("section", { className: "relative flex flex-col items-center justify-center min-h-[32rem] overflow-hidden bg-transparent", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center relative", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl p-10 backdrop-blur-md bg-opacity-40 rounded-xl z-0" }),
    /* @__PURE__ */ jsxs("div", { className: "relative z-10 p-10 w-full max-w-xl text-center", children: [
      /* @__PURE__ */ jsx("p", { className: "funnel-kicker mb-5", children: "Deploy now" }),
      /* @__PURE__ */ jsx("h2", { className: "funnel-heading-2 mb-6", children: "Launch your managed VPS today." }),
      /* @__PURE__ */ jsx("p", { className: "mb-10", children: "Get automated cloud hosting with GitHub deploys, WordPress support, and full server control. Start your 3-day free trial." }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center items-center", children: [
        /* @__PURE__ */ jsx("a", { href: "/register", className: "funnel-btn funnel-btn-primary", children: "Start Free Trial" }),
        /* @__PURE__ */ jsx("a", { href: "/docs", className: "funnel-btn funnel-btn-subtle", children: "Read Documentation" })
      ] })
    ] })
  ] }) });
}
const LINKS = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Docs", href: "/docs" },
    { label: "Compare", href: "/compare" },
    { label: "Is this safe?", href: "/is-this-safe" }
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" }
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" }
  ]
};
function Footer() {
  return /* @__PURE__ */ jsxs("footer", { className: "funnel-footer", children: [
    /* @__PURE__ */ jsxs("div", { className: "funnel-footer-grid mb-10", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("a", { href: "/", style: { display: "inline-block", marginBottom: "0.875rem" }, children: /* @__PURE__ */ jsx(
          "img",
          {
            src: "/Minimalist%20Logo%20Suite%20for%20Clouded%20Basement.png",
            alt: "Clouded Basement",
            style: { height: "1.75rem", width: "auto" }
          }
        ) }),
        /* @__PURE__ */ jsx("p", { className: "funnel-body-sm", style: { maxWidth: "16rem" }, children: "Managed VPS hosting with cloud automation for developers, startups, and growing businesses." })
      ] }),
      Object.entries(LINKS).map(([group, links]) => /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { style: {
          fontSize: "0.75rem",
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#4b5563",
          marginBottom: "1rem"
        }, children: group }),
        /* @__PURE__ */ jsx("ul", { style: { display: "flex", flexDirection: "column", gap: "0.625rem" }, children: links.map((link) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: link.href, className: "funnel-body-sm", style: { color: "#6b7280", textDecoration: "none" }, children: link.label }) }, link.label)) })
      ] }, group))
    ] }),
    /* @__PURE__ */ jsxs("div", { style: {
      borderTop: "1px solid rgba(255,255,255,0.07)",
      paddingTop: "1.5rem",
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "0.75rem"
    }, children: [
      /* @__PURE__ */ jsxs("p", { className: "funnel-body-sm", style: { color: "#4b5563" }, children: [
        "© ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " Clouded Basement. All rights reserved."
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "1.5rem" }, children: [
        /* @__PURE__ */ jsx("a", { href: "/privacy", className: "funnel-body-sm", style: { color: "#4b5563", textDecoration: "none" }, children: "Privacy" }),
        /* @__PURE__ */ jsx("a", { href: "/terms", className: "funnel-body-sm", style: { color: "#4b5563", textDecoration: "none" }, children: "Terms" })
      ] })
    ] })
  ] });
}
function HomePage() {
  return /* @__PURE__ */ jsx("div", { className: "funnel", children: /* @__PURE__ */ jsx("div", { className: "cb-shell", children: /* @__PURE__ */ jsxs("div", { className: "cb-shell-inner", children: [
    /* @__PURE__ */ jsx(ResponsiveNav, {}),
    /* @__PURE__ */ jsxs("main", { children: [
      /* @__PURE__ */ jsx("div", { className: "cb-section", children: /* @__PURE__ */ jsx(HeroSection, {}) }),
      /* @__PURE__ */ jsx("div", { className: "cb-section", children: /* @__PURE__ */ jsx(ProblemFrame, {}) }),
      /* @__PURE__ */ jsx("div", { className: "cb-section", children: /* @__PURE__ */ jsx(HowItWorks, {}) }),
      /* @__PURE__ */ jsx("div", { className: "cb-section", children: /* @__PURE__ */ jsx(Features, {}) }),
      /* @__PURE__ */ jsx("div", { className: "cb-section", children: /* @__PURE__ */ jsx(WhyChooseUs, {}) }),
      /* @__PURE__ */ jsx("div", { className: "cb-section", children: /* @__PURE__ */ jsx(NewPricing, {}) }),
      /* @__PURE__ */ jsx("div", { className: "cb-section", children: /* @__PURE__ */ jsx(FaqSection, {}) }),
      /* @__PURE__ */ jsx("div", { className: "cb-section", children: /* @__PURE__ */ jsx(CTASection, {}) })
    ] }),
    /* @__PURE__ */ jsx(Footer, {})
  ] }) }) });
}
const DashboardPage = lazy(() => import("./assets/DashboardPage--2HQBxsa.js"));
const AdminPage = lazy(() => import("./assets/AdminPage-bd3IH45u.js"));
const AdminUpdatesPage = lazy(() => import("./assets/AdminUpdatesPage-DnY9iKkz.js"));
const About = lazy(() => import("./assets/About-COLVXPnX.js"));
const Compare = lazy(() => import("./assets/Compare-BvaYsUZG.js"));
const Contact = lazy(() => import("./assets/Contact-DGk-0rMT.js"));
const Docs = lazy(() => import("./assets/Docs-ClW3rnAn.js"));
const Faq = lazy(() => import("./assets/Faq-D0aFlNPc.js"));
const Login = lazy(() => import("./assets/Login-DrUFe9l2.js"));
const Pricing = lazy(() => import("./assets/Pricing-tq7efVER.js"));
const Privacy = lazy(() => import("./assets/Privacy-DK81Pm53.js"));
const Register = lazy(() => import("./assets/Register-D_EC9MDw.js"));
const Safety = lazy(() => import("./assets/Safety-BNJLC9p1.js"));
const Terms = lazy(() => import("./assets/Terms-B_VfDbsH.js"));
function HomeWrapper() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal, .reveal-scale, .reveal-stagger").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(LenisScroll, {}),
    /* @__PURE__ */ jsx(HomePage, {})
  ] });
}
function App() {
  return /* @__PURE__ */ jsxs(Routes, { children: [
    /* @__PURE__ */ jsx(Route, { path: "/", element: /* @__PURE__ */ jsx(HomeWrapper, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "/about", element: /* @__PURE__ */ jsx(Suspense, { fallback: null, children: /* @__PURE__ */ jsx(About, {}) }) }),
    /* @__PURE__ */ jsx(Route, { path: "/compare", element: /* @__PURE__ */ jsx(Suspense, { fallback: null, children: /* @__PURE__ */ jsx(Compare, {}) }) }),
    /* @__PURE__ */ jsx(Route, { path: "/contact", element: /* @__PURE__ */ jsx(Suspense, { fallback: null, children: /* @__PURE__ */ jsx(Contact, {}) }) }),
    /* @__PURE__ */ jsx(Route, { path: "/docs", element: /* @__PURE__ */ jsx(Suspense, { fallback: null, children: /* @__PURE__ */ jsx(Docs, {}) }) }),
    /* @__PURE__ */ jsx(Route, { path: "/faq", element: /* @__PURE__ */ jsx(Suspense, { fallback: null, children: /* @__PURE__ */ jsx(Faq, {}) }) }),
    /* @__PURE__ */ jsx(Route, { path: "/login", element: /* @__PURE__ */ jsx(Suspense, { fallback: null, children: /* @__PURE__ */ jsx(Login, {}) }) }),
    /* @__PURE__ */ jsx(Route, { path: "/pricing", element: /* @__PURE__ */ jsx(Suspense, { fallback: null, children: /* @__PURE__ */ jsx(Pricing, {}) }) }),
    /* @__PURE__ */ jsx(Route, { path: "/privacy", element: /* @__PURE__ */ jsx(Suspense, { fallback: null, children: /* @__PURE__ */ jsx(Privacy, {}) }) }),
    /* @__PURE__ */ jsx(Route, { path: "/register", element: /* @__PURE__ */ jsx(Suspense, { fallback: null, children: /* @__PURE__ */ jsx(Register, {}) }) }),
    /* @__PURE__ */ jsx(Route, { path: "/is-this-safe", element: /* @__PURE__ */ jsx(Suspense, { fallback: null, children: /* @__PURE__ */ jsx(Safety, {}) }) }),
    /* @__PURE__ */ jsx(Route, { path: "/terms", element: /* @__PURE__ */ jsx(Suspense, { fallback: null, children: /* @__PURE__ */ jsx(Terms, {}) }) }),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/dashboard",
        element: /* @__PURE__ */ jsx(Suspense, { fallback: null, children: /* @__PURE__ */ jsx(DashboardPage, {}) })
      }
    ),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/admin",
        element: /* @__PURE__ */ jsx(Suspense, { fallback: null, children: /* @__PURE__ */ jsx(AdminPage, {}) })
      }
    ),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/admin/updates",
        element: /* @__PURE__ */ jsx(Suspense, { fallback: null, children: /* @__PURE__ */ jsx(AdminUpdatesPage, {}) })
      }
    )
  ] });
}
function render(url) {
  return renderToString(
    /* @__PURE__ */ jsx(StaticRouter, { location: url, children: /* @__PURE__ */ jsx(App, {}) })
  );
}
export {
  Footer as F,
  ResponsiveNav as R,
  render
};
