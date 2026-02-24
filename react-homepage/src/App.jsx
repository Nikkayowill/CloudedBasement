import { useEffect } from 'react';
import LenisScroll from './components/LenisScroll';
import HomePage from './HomePage';

function App() {
  // Scroll reveal: add .revealed when elements enter the viewport
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    document
      .querySelectorAll('.reveal, .reveal-scale, .reveal-stagger')
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <LenisScroll />
      <HomePage />
    </>
  );
}

export default App;
