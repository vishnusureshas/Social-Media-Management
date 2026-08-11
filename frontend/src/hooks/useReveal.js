import { useEffect, useRef } from 'react';

const useReveal = () => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    el.querySelectorAll('.reveal').forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return ref;
};

export default useReveal;
