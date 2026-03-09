import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { R as ResponsiveNav, F as Footer } from "../entry-server.js";
function DocLayout({ toc, children }) {
  const [activeId, setActiveId] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const observerRef = useRef(null);
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );
    toc.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, [toc]);
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = mobileTocOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileTocOpen]);
  const tocLinkClass = (id) => `block py-2 px-3 rounded-sm border-l-2 text-sm no-underline transition-all duration-150 ${activeId === id ? "border-blue-500 text-blue-400 bg-gray-800/60" : "border-transparent text-gray-300 hover:text-white hover:bg-gray-800/30"}`;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "funnel", children: [
      /* @__PURE__ */ jsx(ResponsiveNav, {}),
      /* @__PURE__ */ jsxs("div", { className: "flex pt-14 min-h-[calc(100vh-3.5rem)]", children: [
        /* @__PURE__ */ jsx("aside", { className: "hidden md:block w-64 shrink-0 sticky top-14 self-start h-[calc(100vh-3.5rem)] overflow-y-auto border-r border-gray-800 bg-[#030608]", children: /* @__PURE__ */ jsxs("div", { className: "py-8 px-5", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-bold text-white uppercase tracking-wider mb-6", children: "On This Page" }),
          /* @__PURE__ */ jsx("ul", { className: "space-y-1", children: toc.map(({ id, label }) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: `#${id}`, className: tocLinkClass(id), children: label }) }, id)) })
        ] }) }),
        /* @__PURE__ */ jsx("main", { className: "flex-1 min-w-0 pt-12 px-8 pb-24 max-w-4xl mx-auto", children })
      ] }),
      /* @__PURE__ */ jsx(Footer, {})
    ] }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setMobileTocOpen((o) => !o),
        "aria-label": "Table of contents",
        className: "md:hidden fixed bottom-20 left-4 z-60 bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-gray-400 cursor-pointer",
        children: /* @__PURE__ */ jsx("svg", { width: "20", height: "20", fill: "none", stroke: "currentColor", strokeWidth: "2", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M4 6h16M4 12h10M4 18h16" }) })
      }
    ),
    mobileTocOpen && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 z-55 bg-black/70 backdrop-blur-sm",
        onClick: () => setMobileTocOpen(false)
      }
    ),
    mobileTocOpen && /* @__PURE__ */ jsxs("aside", { className: "fixed inset-y-0 left-0 z-56 w-64 bg-[#030608] border-r border-gray-800 overflow-y-auto pt-20 px-5 pb-8", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-sm font-bold text-white uppercase tracking-wider mb-6", children: "On This Page" }),
      /* @__PURE__ */ jsx("ul", { className: "space-y-1", children: toc.map(({ id, label }) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
        "a",
        {
          href: `#${id}`,
          onClick: () => setMobileTocOpen(false),
          className: tocLinkClass(id),
          children: label
        }
      ) }, id)) })
    ] }),
    showScrollTop && /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }),
        "aria-label": "Scroll to top",
        className: "fixed bottom-6 right-6 z-50 bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-gray-400 cursor-pointer",
        children: /* @__PURE__ */ jsx("svg", { width: "18", height: "18", fill: "none", stroke: "currentColor", strokeWidth: "2.5", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M5 15l7-7 7 7" }) })
      }
    )
  ] });
}
export {
  DocLayout as D
};
