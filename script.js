(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ */
  /* Loader                                                              */
  /* ------------------------------------------------------------------ */
  const loader = document.getElementById('loader');
  const hideLoader = () => {
    if (!loader) return;
    loader.classList.add('is-hidden');
    setTimeout(() => loader.remove(), 800);
  };
  if (document.readyState === 'complete') {
    setTimeout(hideLoader, 300);
  } else {
    window.addEventListener('load', () => setTimeout(hideLoader, 300));
  }
  // Safety net in case load event is delayed
  setTimeout(hideLoader, 2500);

  /* ------------------------------------------------------------------ */
  /* Sticky nav background on scroll                                    */
  /* ------------------------------------------------------------------ */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (window.scrollY > 12) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------ */
  /* Scroll reveal via IntersectionObserver                             */
  /* ------------------------------------------------------------------ */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i % 4, 3) * 70}ms`;
      io.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ------------------------------------------------------------------ */
  /* FAQ accordion                                                       */
  /* ------------------------------------------------------------------ */
  const triggers = document.querySelectorAll('.accordion__trigger');
  triggers.forEach((trigger) => {
    const panel = trigger.nextElementSibling;
    trigger.addEventListener('click', () => {
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';

      // Close all others (single-open accordion)
      triggers.forEach((t) => {
        if (t !== trigger) {
          t.setAttribute('aria-expanded', 'false');
          t.nextElementSibling.style.maxHeight = null;
        }
      });

      trigger.setAttribute('aria-expanded', String(!isOpen));
      panel.style.maxHeight = isOpen ? null : `${panel.scrollHeight}px`;
    });
  });

  /* ------------------------------------------------------------------ */
  /* Hero card 3D tilt (pointer-driven, gracefully skipped on touch)     */
  /* ------------------------------------------------------------------ */
  const stage = document.getElementById('cardStage');
  const card = document.getElementById('card3d');
  const isTouch = window.matchMedia('(pointer: coarse)').matches;

  if (stage && card && !isTouch && !reduceMotion) {
    let rafId = null;
    let targetX = -14, targetY = 8;
    let currentX = -14, currentY = 8;

    const animate = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      card.style.animation = 'none';
      card.style.transform = `rotateY(${currentX}deg) rotateX(${currentY}deg)`;
      rafId = requestAnimationFrame(animate);
    };

    stage.addEventListener('mouseenter', () => {
      if (!rafId) rafId = requestAnimationFrame(animate);
    });

    stage.addEventListener('mousemove', (e) => {
      const rect = stage.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = -14 + px * 24;
      targetY = 8 - py * 20;
    });

    stage.addEventListener('mouseleave', () => {
      targetX = -14;
      targetY = 8;
      setTimeout(() => {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
          card.style.transform = '';
          card.style.animation = '';
        }
      }, 600);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Subtle scroll parallax on the hero card stage                      */
  /* ------------------------------------------------------------------ */
  const heroStage = document.getElementById('cardStage');
  if (heroStage && !reduceMotion) {
    let ticking = false;
    const applyParallax = () => {
      const y = window.scrollY;
      const offset = Math.min(y * 0.12, 60);
      heroStage.style.transform = `translateY(${offset}px)`;
      ticking = false;
    };
    document.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(applyParallax);
        ticking = true;
      }
    }, { passive: true });
  }

  /* ------------------------------------------------------------------ */
  /* Smooth in-page nav links (fallback for browsers without CSS support)*/
  /* ------------------------------------------------------------------ */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        }
      }
    });
  });
})();
