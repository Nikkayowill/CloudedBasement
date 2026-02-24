import { useEffect } from 'react';
import Lenis from 'lenis';

export default function LenisScroll() {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, smoothWheel: true, smoothTouch: false });
    let raf;
    function loop(time) {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => {
      lenis.destroy();
      cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
