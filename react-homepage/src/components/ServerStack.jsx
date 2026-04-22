import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

// ─── Stack data ───────────────────────────────────────────────────────────────
const LAYERS = [
  { id: 'ssl',    label: 'SSL / HTTPS',  sub: 'auto-provisioned cert',   color: '#16a34a', tab1: 'Secures all traffic',   tab2: 'LetsEncrypt auto-renewal' },
  { id: 'deploy', label: 'Git Deploys',  sub: 'push → build → live',     color: '#2563eb', tab1: 'Zero-downtime deploys', tab2: 'CI/CD built-in' },
  { id: 'node',   label: 'Node.js',      sub: 'v20 · ESM · TypeScript',  color: '#0891b2', tab1: 'Modern JS runtime',     tab2: 'TypeScript native' },
  { id: 'db',     label: 'Database',     sub: 'PostgreSQL · MongoDB',    color: '#7c3aed', tab1: 'Managed Postgres',      tab2: 'MongoDB option' },
  { id: 'nginx',  label: 'Nginx',        sub: 'reverse proxy · cache',   color: '#1d4ed8', tab1: 'Smart routing',         tab2: 'Edge caching' },
  { id: 'vps',    label: 'VPS Droplet',  sub: 'DigitalOcean · root SSH', color: '#4f46e5', tab1: 'Full root access',      tab2: 'SSD · IPv6 · backups' },
];

const PULSE_DUR = [2.0, 2.5, 1.9, 2.8, 2.2, 3.1];

const W   = 240;
const H   = 66;
const GAP = 52;

// ─── Single chip (light-mode card) ───────────────────────────────────────────
function Chip({ label, sub, color, zOffset, idx, active, dismissed, entryDelay, tab1, tab2 }) {
  return (
    // Plain div owns the 3D z-position via raw CSS — no FM transform conflict
    <div
      style={{
        position: 'absolute',
        width: W, height: H,
        top: '50%', left: '50%',
        marginLeft: -W / 2,
        marginTop: -H / 12,
        transform: `translateZ(${zOffset}px)`,
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        willChange: 'transform',
      }}
    >
      {/* FM div: entrance fade + active-state scale + dismissed exit */}
      <motion.div
        style={{ width: '100%', height: '100%' }}
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={
          dismissed
            ? { opacity: 0, y: -22, scale: 0.92 }
            : { opacity: 1, scale: active ? 1 : 0.985, y: 0 }
        }
        transition={
          dismissed
            ? { duration: 0.42, ease: [0.4, 0, 1, 1] }
            : {
                opacity: { duration: 0.38, ease: [0.0, 0.0, 0.2, 1], delay: entryDelay },
                scale: { type: 'spring', stiffness: 280, damping: 32, delay: entryDelay },
                y: { type: 'spring', stiffness: 260, damping: 30, delay: entryDelay },
              }
        }
      >
        {/* Chip surface */}
        <div
          style={{
            width: '100%', height: '100%',
            borderRadius: 6,
            background: '#ffffff',
            border: active
              ? `1.5px solid ${color}`
              : '1px solid rgba(0,0,0,0.09)',
            boxShadow: active
              ? `0 0 0 3px ${color}1a, 0 6px 20px rgba(0,0,0,0.12)`
              : '0 1px 3px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.05)',
            opacity: active ? 1 : 0.6,
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            gap: 14,
            position: 'relative',
            overflow: 'hidden',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transition: 'opacity 0.4s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s cubic-bezier(0.4,0,0.2,1), border-color 0.4s cubic-bezier(0.4,0,0.2,1)',
            transform: 'translateZ(0)',
            willChange: 'opacity, box-shadow',
          }}
        >
          {/* Top-edge depth sheen — neutral, visible on white */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(15,23,42,0.04) 0%, rgba(15,23,42,0) 42%)',
              borderRadius: 6,
              pointerEvents: 'none',
            }}
          />

          {/* Left accent bar */}
          <div
            style={{
              width: 3, height: '52%',
              borderRadius: 2,
              flexShrink: 0,
              position: 'relative', zIndex: 1,
              background: active ? color : color + '44',
              transition: 'background 0.35s ease',
            }}
          />

          {/* Label + subtitle */}
          <div style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 1 }}>
            <div
              style={{
                fontSize: '0.9rem', fontWeight: 700,
                color: active ? '#0f172a' : '#64748b',
                fontFamily: 'ui-monospace, "Cascadia Code", monospace',
                letterSpacing: '0.01em', lineHeight: 1.2,
                transition: 'color 0.4s cubic-bezier(0.4,0,0.2,1)',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
              }}
            >
              {label}
            </div>
            <div
              style={{
                fontSize: '0.7rem',
                color: active ? color : 'rgba(0,0,0,0.40)',
                fontFamily: 'ui-monospace, "Cascadia Code", monospace',
                lineHeight: 1.2, marginTop: 3,
                transition: 'color 0.4s cubic-bezier(0.4,0,0.2,1)',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
              }}
            >
              {sub}
            </div>
          </div>

          {/* Status LED — only pulses when active; transitions cleanly when not */}
          <motion.div
            style={{
              width: 8, height: 8,
              borderRadius: '50%',
              background: color,
              flexShrink: 0,
              position: 'relative', zIndex: 1,
            }}
            animate={
              active
                ? { opacity: [0.45, 1, 0.45], scale: [0.85, 1.3, 0.85] }
                : { opacity: 0.25, scale: 1 }
            }
            transition={
              active
                ? { duration: PULSE_DUR[idx] ?? 2.2, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.35, ease: 'easeOut' }
            }
          />
        </div>
      </motion.div>

      {/* Tabs: outside the scale wrapper — not distorted when card compresses */}
      <AnimatePresence>
        {active && (
          <motion.div
            key="tab-left"
            className="cb-stack-tab"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              right: '100%', top: '50%',
              transform: 'translateY(-50%)',
              marginRight: 12,
              background: '#ffffff',
              border: '1px solid rgba(0,0,0,0.08)',
              borderLeft: `2.5px solid ${color}`,
              borderRadius: '4px 2px 2px 4px',
              padding: '5px 10px',
              color: '#1e293b',
              fontSize: '0.7rem', fontWeight: 600,
              fontFamily: 'ui-monospace, monospace',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
              pointerEvents: 'none',
              zIndex: 30,
            }}
          >
            {tab1}
          </motion.div>
        )}
        {active && (
          <motion.div
            key="tab-right"
            className="cb-stack-tab"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: '100%', top: '50%',
              transform: 'translateY(-50%)',
              marginLeft: 12,
              background: '#ffffff',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRight: `2.5px solid ${color}`,
              borderRadius: '2px 4px 4px 2px',
              padding: '5px 10px',
              color: '#1e293b',
              fontSize: '0.7rem', fontWeight: 600,
              fontFamily: 'ui-monospace, monospace',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
              pointerEvents: 'none',
              zIndex: 30,
            }}
          >
            {tab2}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ServerStack({ className = '' }) {
  const ref  = useRef(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const [active, setActive] = useState(0);
  const [dismissed, setDismissed] = useState(() => new Set());
  const dismissedRef = useRef(new Set());
  const [cycleKey, setCycleKey] = useState(0);

  // Cycle: highlight → dismiss → next chip → repeat. Reset when all dismissed.
  useEffect(() => {
    const t = setTimeout(() => {
      dismissedRef.current = new Set([...dismissedRef.current, active]);
      setDismissed(new Set(dismissedRef.current));

      if (dismissedRef.current.size >= LAYERS.length) {
        // Full cycle done — pause then remount chips with staggered bottom-up entry
        setTimeout(() => {
          dismissedRef.current = new Set();
          setDismissed(new Set());
          setCycleKey(k => k + 1);
          setActive(0);
        }, 500);
      } else {
        setActive(a => (a + 1) % LAYERS.length);
      }
    }, 2600);
    return () => clearTimeout(t);
  }, [active]);

  // Mouse tilt — interactive, not ambient
  useEffect(() => {
    function onMove(e) {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      rawX.set((e.clientX - r.left - r.width  / 2) / r.width);
      rawY.set((e.clientY - r.top  - r.height / 2) / r.height);
    }
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [rawX, rawY]);

  const sp   = { stiffness: 60, damping: 24 };
  const dX   = useSpring(useTransform(rawX, [-1, 1], [-6, 6]), sp);
  const dY   = useSpring(useTransform(rawY, [-1, 1], [-5, 5]), sp);
  const rotX = useTransform(dY, v => 50 + v);
  const rotZ = useTransform(dX, v => -35 + v);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '100%',
        height: 'clamp(260px, 36vw, 420px)',
        background: 'transparent',
        touchAction: 'none',
        userSelect: 'none',
        overflow: 'visible',
      }}
    >
      {/* 3D tower — no bloom, no atmosphere, just geometry */}
      <div style={{ perspective: '1100px', perspectiveOrigin: '50% 44%' }}>
        <motion.div
          style={{
            transformStyle: 'preserve-3d',
            rotateX: rotX,
            rotateZ: rotZ,
            width: W, height: H,
            position: 'relative',
          }}
        >
          {LAYERS.map((layer, i) => (
            <Chip
              key={layer.id + '-' + cycleKey}
              {...layer}
              idx={i}
              zOffset={(LAYERS.length - 1 - i) * GAP}
              active={active === i}
              dismissed={dismissed.has(i)}
              entryDelay={i * 0.13}
            />
          ))}
        </motion.div>
      </div>

      {/* Hide tabs on mobile — they'd clip off-screen */}
      <style>{`
        @media (max-width: 640px) { .cb-stack-tab { display: none !important; } }
      `}</style>
    </div>
  );
}

