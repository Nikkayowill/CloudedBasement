import { motion } from 'framer-motion';

// ── Framer Motion animated wrappers for the three existing button variants.
// Drop <AnimatedButtons /> anywhere to preview them, or use the individual
// MotionBtn* components directly in place of plain <a>/<button> tags.

// ─────────────────────────────────────────
// Shared spring config
// ─────────────────────────────────────────
const spring = { type: 'spring', stiffness: 400, damping: 22 };

// ─────────────────────────────────────────
// Primary — blue, shimmer-on-hover
// ─────────────────────────────────────────
export function MotionBtnPrimary({ children, href, onClick, className = '', style = {} }) {
  return (
    <motion.a
      href={href}
      onClick={onClick}
      className={`funnel-btn funnel-btn-primary ${className}`}
      style={style}
      whileHover={{ y: -3, scale: 1.03 }}
      whileTap={{ y: 0, scale: 0.97 }}
      transition={spring}
    >
      {children}
    </motion.a>
  );
}

// ─────────────────────────────────────────
// Subtle — faint white fill
// ─────────────────────────────────────────
export function MotionBtnSubtle({ children, href, onClick, className = '', style = {} }) {
  return (
    <motion.a
      href={href}
      onClick={onClick}
      className={`funnel-btn funnel-btn-subtle ${className}`}
      style={style}
      whileHover={{ y: -3, scale: 1.03 }}
      whileTap={{ y: 0, scale: 0.97 }}
      transition={spring}
    >
      {children}
    </motion.a>
  );
}

// ─────────────────────────────────────────
// Ghost — transparent, text only
// ─────────────────────────────────────────
export function MotionBtnGhost({ children, href, onClick, className = '', style = {} }) {
  return (
    <motion.a
      href={href}
      onClick={onClick}
      className={`funnel-btn funnel-btn-ghost ${className}`}
      style={style}
      whileHover={{ y: -3, scale: 1.03 }}
      whileTap={{ y: 0, scale: 0.97 }}
      transition={spring}
    >
      {children}
    </motion.a>
  );
}

// ─────────────────────────────────────────
// Demo grid — shows all 3 variants × 2 sizes
// ─────────────────────────────────────────

// Stagger the grid items in on mount
const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show:  { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 24 } },
};

export default function AnimatedButtons() {
  const buttons = [
    { label: 'Get Started',    variant: 'primary', size: '' },
    { label: 'Documentation',  variant: 'subtle',  size: '' },
    { label: 'Sign in',        variant: 'ghost',   size: '' },
    { label: 'Start Free Trial', variant: 'primary', size: 'sm' },
    { label: 'Read the docs',  variant: 'subtle',  size: 'sm' },
    { label: 'Learn more →',   variant: 'ghost',   size: 'sm' },
  ];

  const sizeStyle = (size) =>
    size === 'sm' ? { padding: '0.375rem 0.875rem', fontSize: '0.875rem' } : {};

  return (
    <section className="cb-section">
      <div className="cb-title-row">
        <p className="funnel-mono text-[11px] font-semibold tracking-widest uppercase text-white/30 mb-2">
          Component preview
        </p>
        <h2 className="funnel-heading-2">Interactive Buttons</h2>
      </div>

      <motion.div
        className="cb-content-pad py-14 grid grid-cols-2 sm:grid-cols-3 gap-4 place-items-center"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        {buttons.map(({ label, variant, size }) => {
          const style = sizeStyle(size);
          const shared = { href: '#', style, key: label };

          if (variant === 'primary') return (
            <motion.div key={label} variants={itemVariants}>
              <MotionBtnPrimary {...shared}>{label}</MotionBtnPrimary>
            </motion.div>
          );
          if (variant === 'subtle') return (
            <motion.div key={label} variants={itemVariants}>
              <MotionBtnSubtle {...shared}>{label}</MotionBtnSubtle>
            </motion.div>
          );
          return (
            <motion.div key={label} variants={itemVariants}>
              <MotionBtnGhost {...shared}>{label}</MotionBtnGhost>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
