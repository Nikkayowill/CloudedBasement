import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef } from 'react';

// ─── Premium Floating Cloud — layered glass + 3D tilt + multi-bloom
// Design layers (bottom → top):
//   1. Outer haze bloom (large, very soft)
//   2. Inner tight glow (bright core)
//   3. Cloud SVG:
//      a. Rim glow ring (blurred stroke behind shape)
//      b. Dark glossy base fill
//      c. Glass surface gradient
//      d. Specular highlight (top-left bright spot → premium shine)
//      e. Bright rim stroke
//      f. Server rack panel + animated LEDs
//   4. Orbiting particles (with boxShadow glow)
//   5. Ground shadow ellipse (breathes with float)

// ─── Orbiting particle with glow ─────────────────────────────────────────────
function Particle({ radius, sizePx, duration, delay, color }) {
  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: 'absolute',
        width: sizePx,
        height: sizePx,
        borderRadius: '50%',
        background: color,
        top: '50%',
        left: '50%',
        marginTop: -(sizePx / 2),
        marginLeft: -(sizePx / 2),
        boxShadow: `0 0 ${sizePx * 3}px ${sizePx}px ${color}`,
        pointerEvents: 'none',
      }}
      animate={{
        x: [radius, 0, -radius, 0, radius],
        y: [0, -(radius * 0.55), 0, radius * 0.55, 0],
        scale: [1, 1.4, 1, 1.4, 1],
        opacity: [0.4, 1, 0.4, 1, 0.4],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

// ─── Cloud SVG — glassmorphic dark body with server rack interior ─────────────
function CloudBody() {
  const path =
    'M62 118 C36 118 14 99 14 77 C14 58 28 43 47 41 ' +
    'C47 20 65 4 88 4 C104 4 118 13 125 27 ' +
    'C131 17 143 10 157 10 C180 10 199 29 199 52 ' +
    'C199 53 199 54 198 56 C213 59 224 73 224 89 ' +
    'C224 106 212 118 196 118 L62 118Z';

  return (
    <svg
      viewBox="0 0 240 165"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', overflow: 'visible' }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="cg-base" x1="120" y1="4" x2="120" y2="118" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#0d1e3d" />
          <stop offset="100%" stopColor="#060e1f" />
        </linearGradient>
        <linearGradient id="cg-glass" x1="0%" y1="0%" x2="60%" y2="100%">
          <stop offset="0%"   stopColor="#93c5fd" stopOpacity="0.13" />
          <stop offset="45%"  stopColor="#3b82f6" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.01" />
        </linearGradient>
        {/* Specular highlight — the key to a premium glossy look */}
        <radialGradient id="cg-spec" cx="30%" cy="20%" r="38%">
          <stop offset="0%"   stopColor="#ffffff"  stopOpacity="0.22" />
          <stop offset="45%"  stopColor="#bfdbfe"  stopOpacity="0.07" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cg-rack" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#172554" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#0c1a3e" stopOpacity="0.95" />
        </linearGradient>
        <filter id="cg-rimglow" x="-8%" y="-8%" width="116%" height="116%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="cg-ledglow" x="-300%" y="-300%" width="700%" height="700%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <clipPath id="cg-clip"><path d={path} /></clipPath>
        <style>{`
          @keyframes cg-green { 0%,100%{opacity:.55} 50%{opacity:1} }
          @keyframes cg-blue  { 0%,100%{opacity:.4}  50%{opacity:.9} }
          .cg-led-g  { animation: cg-green 2s   ease-in-out          infinite; }
          .cg-led-b1 { animation: cg-blue  3s   ease-in-out 0.6s     infinite; }
          .cg-led-b2 { animation: cg-blue  3.5s ease-in-out 1.2s     infinite; }
        `}</style>
      </defs>

      {/* Rim glow ring — blurred stroke behind shape gives a lit-from-behind halo */}
      <path d={path} fill="none" stroke="rgba(96,165,250,0.55)" strokeWidth="8"
        filter="url(#cg-rimglow)" opacity="0.5" />

      {/* Dark glossy base */}
      <path d={path} fill="url(#cg-base)" />

      {/* Glass surface sheen */}
      <path d={path} fill="url(#cg-glass)" />

      {/* Specular highlight */}
      <path d={path} fill="url(#cg-spec)" />

      {/* Crisp bright rim stroke */}
      <path d={path} fill="none" stroke="rgba(147,197,253,0.4)" strokeWidth="0.85" />

      {/* Server rack panel (clipped inside cloud) */}
      <g clipPath="url(#cg-clip)">
        <rect x="68" y="63" width="122" height="48" rx="4" fill="url(#cg-rack)" />
        <rect x="68" y="63" width="122" height="48" rx="4"
          stroke="rgba(96,165,250,0.22)" strokeWidth="0.75" fill="none" />
        <line x1="68" y1="78" x2="190" y2="78" stroke="rgba(96,165,250,0.14)" strokeWidth="0.5" />
        <line x1="68" y1="93" x2="190" y2="93" stroke="rgba(96,165,250,0.14)" strokeWidth="0.5" />
        {/* Row label bars */}
        <rect x="74" y="68" width="30" height="4" rx="2" fill="rgba(96,165,250,0.18)" />
        <rect x="74" y="83" width="22" height="4" rx="2" fill="rgba(96,165,250,0.12)" />
        <rect x="74" y="97" width="26" height="4" rx="2" fill="rgba(96,165,250,0.09)" />
        {/* Data bars */}
        <rect x="110" y="68" width="52" height="4" rx="2" fill="rgba(37,99,235,0.45)" />
        <rect x="110" y="83" width="34" height="4" rx="2" fill="rgba(37,99,235,0.32)" />
        <rect x="110" y="97" width="44" height="4" rx="2" fill="rgba(37,99,235,0.25)" />
        <rect x="110" y="68" width="52" height="4" rx="2" fill="rgba(96,165,250,0.15)" />
      </g>

      {/* LED indicators — outside clip so glow bleeds over edge */}
      <g filter="url(#cg-ledglow)">
        <circle cx="183" cy="70"  r="2.5" fill="#4ade80" className="cg-led-g"  />
        <circle cx="183" cy="85"  r="2.5" fill="#60a5fa" className="cg-led-b1" />
        <circle cx="183" cy="99"  r="2"   fill="#3b82f6" className="cg-led-b2" />
      </g>

      {/* Subtle cable line */}
      <line x1="128" y1="118" x2="128" y2="142"
        stroke="rgba(96,165,250,0.12)" strokeWidth="0.75" strokeDasharray="3 5" />
    </svg>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function FloatingCloud({ className = '' }) {
  const containerRef = useRef(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  useEffect(() => {
    function onMove(e) {
      const el = containerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      rawX.set((e.clientX - r.left - r.width  / 2) / r.width);
      rawY.set((e.clientY - r.top  - r.height / 2) / r.height);
    }
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [rawX, rawY]);

  const cfg  = { stiffness: 70, damping: 20 };
  const rotX = useSpring(useTransform(rawY, [-1, 1], [ 14, -14]), cfg);
  const rotY = useSpring(useTransform(rawX, [-1, 1], [-16,  16]), cfg);
  const tx   = useSpring(useTransform(rawX, [-1, 1], [-10,  10]), cfg);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '280px' }}
    >
      {/* Bloom layer 1 — wide outer haze */}
      <motion.div aria-hidden="true" style={{
        position: 'absolute',
        width: '460px', height: '280px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(29,78,216,0.22) 0%, rgba(37,99,235,0.1) 35%, transparent 68%)',
        filter: 'blur(55px)',
      }}
        animate={{ scale: [1, 1.07, 1], opacity: [0.55, 1, 0.55] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Bloom layer 2 — tight bright core */}
      <motion.div aria-hidden="true" style={{
        position: 'absolute',
        width: '220px', height: '110px',
        top: '22%',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(96,165,250,0.4) 0%, transparent 70%)',
        filter: 'blur(24px)',
      }}
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Perspective wrapper for 3D tilt */}
      <div style={{ perspective: '900px' }}>
        {/* Float animation — y oscillation */}
        <motion.div
          animate={{ y: [0, -16, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Mouse tilt layer */}
          <motion.div style={{ rotateX: rotX, rotateY: rotY, x: tx, transformStyle: 'preserve-3d' }}>
            <div style={{ width: '310px', height: '185px', position: 'relative' }}>
              <CloudBody />
              <Particle radius={138} sizePx={5}   duration={8}  delay={0}   color="rgba(96,165,250,0.95)" />
              <Particle radius={152} sizePx={3}   duration={13} delay={2.2} color="rgba(74,222,128,0.85)" />
              <Particle radius={122} sizePx={4}   duration={10} delay={4.5} color="rgba(147,197,253,0.75)" />
              <Particle radius={165} sizePx={2.5} duration={17} delay={1}   color="rgba(59,130,246,1)" />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Ground shadow — syncs with float */}
      <motion.div aria-hidden="true" style={{
        position: 'absolute',
        bottom: '8px',
        width: '230px', height: '24px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(29,78,216,0.55) 0%, transparent 70%)',
        filter: 'blur(14px)',
        zIndex: 1,
        x: tx,
      }}
        animate={{ scaleX: [1, 1.12, 1], opacity: [0.35, 0.65, 0.35] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
