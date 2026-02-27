// CloudSVG.jsx
// Simple wrapper for Cloud.svg

export default function CloudSVG({ className = "", style = {} }) {
  return (
    <svg className={className} style={style} width="100%" height="100%" aria-hidden="true">
      {/* Inline SVG or use <image> if SVG is complex */}
      <image href="/dist/Cloud.svg" width="100%" height="100%" />
    </svg>);
}
