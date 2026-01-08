/**
 * APPLE-STYLE PRODUCT PAGE CLONE - JavaScript
 *
 * This script handles:
 * 1. Sticky navigation transformation on scroll
 * 2. Scroll-driven section pinning
 * 3. Fade-in animations synced to scroll position
 * 4. Smooth scroll behavior
 * 5. Mobile navigation toggle
 * 6. Performance-optimized scroll handlers
 */

(function () {
  "use strict";

  // ===== CONFIGURATION =====
  const config = {
    navScrollThreshold: 50, // Pixels scrolled before nav transforms
    fadeInOffset: 100, // Pixels before element to trigger fade
    scrollSmoothness: 0.1, // Smooth scroll interpolation (lower = smoother)
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches,
  };

  // ===== STATE MANAGEMENT =====
  const state = {
    scrollY: 0,
    lastScrollY: 0,
    ticking: false,
    navOpen: false,
  };

  // ===== DOM ELEMENTS =====
  const nav = document.querySelector(".nav");
  const navLinks = document.querySelector(".nav-links");
  const navToggle = document.querySelector(".nav-toggle");
  const scrollSections = document.querySelectorAll('[data-pin="true"]');
  const fadeElements = document.querySelectorAll('[data-fade="true"]');
  const transformElements = document.querySelectorAll(
    '[data-transform="true"]'
  );
  const visualItems = document.querySelectorAll(".visual-item");

  // ===== UTILITY FUNCTIONS =====

  /**
   * Throttle function to limit how often scroll handler runs
   * Uses requestAnimationFrame for smooth performance
   */
  function throttle(func, limit) {
    let inThrottle;
    return function () {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Check if element is in viewport with offset
   * @param {HTMLElement} element - Element to check
   * @param {number} offset - Offset in pixels (default: 0)
   * @returns {boolean} - True if element is in viewport
   */
  function isInViewport(element, offset = 0) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= -offset &&
      rect.top <=
        (window.innerHeight || document.documentElement.clientHeight) + offset
    );
  }

  /**
   * Get scroll progress for an element (0 to 1)
   * @param {HTMLElement} element - Element to track
   * @returns {number} - Progress from 0 (not scrolled) to 1 (fully scrolled past)
   */
  function getScrollProgress(element) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const elementTop = rect.top;
    const elementHeight = rect.height;

    // Element enters viewport
    if (elementTop > windowHeight) {
      return 0;
    }

    // Element is fully past viewport
    if (elementTop + elementHeight < 0) {
      return 1;
    }

    // Calculate progress while in viewport
    const scrolled = windowHeight - elementTop;
    const total = windowHeight + elementHeight;
    return Math.max(0, Math.min(1, scrolled / total));
  }

  /**
   * Smooth interpolation (easing function)
   * @param {number} start - Start value
   * @param {number} end - End value
   * @param {number} factor - Interpolation factor (0-1)
   * @returns {number} - Interpolated value
   */
  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  // ===== NAVIGATION FUNCTIONS =====

  /**
   * Handle navigation scroll transformation
   * Adds 'scrolled' class when user scrolls past threshold
   */
  function handleNavScroll() {
    const scrollY = window.scrollY || window.pageYOffset;

    if (scrollY > config.navScrollThreshold) {
      nav.classList.add("scrolled");
    } else {
      nav.classList.remove("scrolled");
    }
  }

  /**
   * Toggle mobile navigation menu
   */
  function toggleNav() {
    state.navOpen = !state.navOpen;
    navLinks.classList.toggle("active");
    navToggle.setAttribute("aria-expanded", state.navOpen.toString());

    // Prevent body scroll when nav is open
    if (state.navOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }

  /**
   * Close mobile nav when clicking on a link
   */
  function closeNavOnLinkClick() {
    const links = navLinks.querySelectorAll(".nav-link");
    links.forEach((link) => {
      link.addEventListener("click", () => {
        if (state.navOpen) {
          toggleNav();
        }
      });
    });
  }

  // ===== SCROLL-DRIVEN ANIMATIONS =====

  /**
   * Handle fade-in animations for elements with data-fade attribute
   * Elements fade in when they enter the viewport
   */
  function handleFadeAnimations() {
    if (config.reducedMotion) return;

    fadeElements.forEach((element) => {
      if (isInViewport(element, config.fadeInOffset)) {
        element.classList.add("visible");
      }
    });
  }

  /**
   * Handle transform animations for product showcases
   * Elements transform (scale/translate) as they enter viewport
   */
  function handleTransformAnimations() {
    if (config.reducedMotion) return;

    transformElements.forEach((element) => {
      if (isInViewport(element, config.fadeInOffset)) {
        element.classList.add("visible");
      }
    });
  }

  /**
   * Handle scroll-pinned sections
   * Sections pin to viewport during scroll for Apple-style effect
   * This creates the "sticky" effect where content stays fixed while scrolling
   */
  function handleScrollPinning() {
    if (config.reducedMotion) return;

    scrollSections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const sectionTop = rect.top + window.scrollY;
      const sectionHeight = rect.height;
      const currentScroll = window.scrollY;

      // Calculate when section should be pinned
      // Pin when section enters viewport from top
      if (rect.top <= 0 && rect.bottom > windowHeight) {
        // Section is pinned - apply sticky positioning
        section.style.position = "sticky";
        section.style.top = "0";

        // Calculate scroll progress within pinned section
        const scrollRange = sectionHeight - windowHeight;
        const scrolledInSection = currentScroll - (sectionTop - windowHeight);
        const progress = Math.max(
          0,
          Math.min(1, scrolledInSection / scrollRange)
        );

        // Apply subtle parallax/transform effects based on scroll progress
        const innerContent = section.querySelector(".scroll-section-inner");
        if (innerContent && scrollRange > 0) {
          // Subtle parallax effect - elements move slightly as you scroll
          const parallaxOffset = progress * 30;
          innerContent.style.transform = `translateY(${parallaxOffset}px)`;
        }
      } else {
        // Section is not pinned - use relative positioning
        section.style.position = "relative";
        const innerContent = section.querySelector(".scroll-section-inner");
        if (innerContent) {
          innerContent.style.transform = "";
        }
      }
    });
  }

  /**
   * Handle visual grid items fade-in
   * Staggered animation for visual grid items in dark section
   */
  function handleVisualItems() {
    if (config.reducedMotion) {
      visualItems.forEach((item) => item.classList.add("visible"));
      return;
    }

    const darkSection = document.querySelector(".dark-section");
    if (!darkSection) return;

    if (isInViewport(darkSection, config.fadeInOffset)) {
      visualItems.forEach((item) => {
        item.classList.add("visible");
      });
    }
  }

  // ===== SMOOTH SCROLL ENHANCEMENT =====

  /**
   * Smooth scroll to target position
   * Uses native smooth scroll with fallback for better browser support
   */
  function smoothScrollTo(targetY) {
    if (config.reducedMotion) {
      window.scrollTo(0, targetY);
      return;
    }

    // Use native smooth scroll behavior (already enabled in CSS)
    window.scrollTo({
      top: targetY,
      behavior: "smooth",
    });
  }

  // ===== MAIN SCROLL HANDLER =====

  /**
   * Main scroll handler - coordinates all scroll-based effects
   * Uses requestAnimationFrame for optimal performance
   */
  function onScroll() {
    state.scrollY = window.scrollY || window.pageYOffset;

    // Only run if we're not already processing a frame
    if (!state.ticking) {
      window.requestAnimationFrame(() => {
        handleNavScroll();
        handleFadeAnimations();
        handleTransformAnimations();
        handleScrollPinning();
        handleVisualItems();

        state.ticking = false;
      });

      state.ticking = true;
    }
  }

  // ===== INITIALIZATION =====

  /**
   * Initialize all event listeners and initial states
   */
  function init() {
    // Check for reduced motion preference
    if (config.reducedMotion) {
      console.log("Reduced motion detected - animations disabled");
      // Immediately show all fade elements
      fadeElements.forEach((el) => el.classList.add("visible"));
      transformElements.forEach((el) => el.classList.add("visible"));
    }

    // Navigation toggle
    if (navToggle) {
      navToggle.addEventListener("click", toggleNav);
    }

    // Close nav on link click
    closeNavOnLinkClick();

    // Scroll event listener with throttling
    // Using passive listener for better scroll performance
    window.addEventListener("scroll", throttle(onScroll, 16), {
      passive: true,
    });

    // Initial call to set up initial states
    onScroll();

    // Handle resize events
    window.addEventListener(
      "resize",
      throttle(() => {
        onScroll();
        // Close mobile nav on resize to desktop
        if (window.innerWidth > 768 && state.navOpen) {
          toggleNav();
        }
      }, 250),
      { passive: true }
    );

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        const href = this.getAttribute("href");
        if (href === "#" || href === "#!") return;

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const navHeight = nav ? nav.offsetHeight : 0;
          const targetPosition = target.offsetTop - navHeight;

          smoothScrollTo(targetPosition);
        }
      });
    });

    // Intersection Observer for more efficient fade-in detection
    // This is more performant than scroll-based checks for simple fade-ins
    if ("IntersectionObserver" in window && !config.reducedMotion) {
      const observerOptions = {
        root: null,
        rootMargin: `${config.fadeInOffset}px`,
        threshold: [0, 0.1, 0.5, 1],
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            // Unobserve after animation to improve performance
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      // Observe fade elements
      fadeElements.forEach((el) => observer.observe(el));
      transformElements.forEach((el) => observer.observe(el));
    }

    console.log("Apple-style product page initialized");
  }

  // ===== START APPLICATION =====

  // Wait for DOM to be fully loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    // DOM already loaded
    init();
  }

  // ===== EXPOSE UTILITIES (for debugging if needed) =====
  window.productPageUtils = {
    getScrollProgress,
    isInViewport,
    state,
    config,
  };
})();
