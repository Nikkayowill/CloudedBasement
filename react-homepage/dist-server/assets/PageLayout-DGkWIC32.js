import { jsx, jsxs } from "react/jsx-runtime";
import { R as ResponsiveNav, F as Footer } from "../entry-server.js";
function PageLayout({ children, noFooter = false }) {
  return /* @__PURE__ */ jsx("div", { className: "funnel", children: /* @__PURE__ */ jsx("div", { className: "cb-shell", children: /* @__PURE__ */ jsxs("div", { className: "cb-shell-inner", style: { minHeight: "100vh", display: "flex", flexDirection: "column" }, children: [
    /* @__PURE__ */ jsx(ResponsiveNav, {}),
    /* @__PURE__ */ jsx("main", { style: { flex: 1 }, children }),
    !noFooter && /* @__PURE__ */ jsx(Footer, {})
  ] }) }) });
}
export {
  PageLayout as P
};
