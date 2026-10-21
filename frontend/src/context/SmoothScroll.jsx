import React, { createContext, useContext, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";
import "../templates/ScrollAnimations.css";

const LenisContext = createContext({
  lenis: null,
  scrollTo: () => {},
});

export const useLenis = () => useContext(LenisContext);

export const SmoothScrollProvider = ({ children }) => {
  const lenisRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    // Check user's motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Initialize Lenis with smooth cinematic momentum
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: !prefersReducedMotion,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.3,
      infinite: false,
    });

    lenisRef.current = lenis;
    window.__lenis = lenis;

    // Single unified animation frame loop
    let rafId = null;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // Global Scroll Reveal Observer for cinematic scroll-triggered animations
    const revealElements = () => {
      const targets = document.querySelectorAll(
        ".reveal-on-scroll:not(.is-revealed), .reveal-stagger:not(.is-revealed)"
      );

      if (targets.length === 0) return;

      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-revealed");
              obs.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: "0px 0px -40px 0px",
        }
      );

      targets.forEach((el) => observer.observe(el));
    };

    revealElements();

    // Listen to resize to recalculate scroll dimensions
    const handleResize = () => {
      lenis.resize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      lenis.destroy();
      lenisRef.current = null;
      window.__lenis = null;
    };
  }, []);

  // Handle route changes and hash navigation smoothly
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    // Recalculate page height on route change
    lenis.resize();

    if (location.hash) {
      // Smooth scroll to target section if hash exists (e.g. #about, #features)
      const target = document.querySelector(location.hash);
      if (target) {
        // Wait slightly for DOM to settle
        setTimeout(() => {
          lenis.scrollTo(target, { offset: -30, duration: 1.2 });
        }, 50);
      }
    } else {
      // Scroll to top on new page navigation
      lenis.scrollTo(0, { immediate: true });
    }

    // Refresh scroll reveal observer for newly mounted route components
    const timer = setTimeout(() => {
      const targets = document.querySelectorAll(
        ".reveal-on-scroll:not(.is-revealed), .reveal-stagger:not(.is-revealed)"
      );

      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-revealed");
              obs.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: "0px 0px -40px 0px",
        }
      );

      targets.forEach((el) => observer.observe(el));
      lenis.resize();
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname, location.hash]);

  const scrollTo = (target, options = {}) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, {
        duration: 1.2,
        ...options,
      });
    } else {
      const el =
        typeof target === "string" ? document.querySelector(target) : target;
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <LenisContext.Provider value={{ lenis: lenisRef.current, scrollTo }}>
      {children}
    </LenisContext.Provider>
  );
};

export default SmoothScrollProvider;
