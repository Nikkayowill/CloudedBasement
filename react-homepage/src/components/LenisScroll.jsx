import { useEffect } from 'react';

// Dynamic import keeps Lenis out of the server bundle entirely.
// useEffect never runs during SSR, so this is safe.
export default function LenisScroll() {
  useEffect(() => {
    let lenis, raf;

    import('lenis').then(({ default: Lenis }) => {
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
