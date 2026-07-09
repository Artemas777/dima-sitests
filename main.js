"use strict";

/**
 * Dmitry — Banking Consultant Landing
 * Vanilla JS module: navigation, scroll reveals, interactive hero card, FAQ.
 * No external dependencies.
 */

document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  initYear();
  initNavScroll();
  initMobileDrawer();
  initScrollReveal();
  initFaqAccordion();
  initCardInteraction(prefersReducedMotion);
});

/* ------------------------------------------------------------------ */
/* Footer year                                                         */
/* ------------------------------------------------------------------ */
function initYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
}

/* ------------------------------------------------------------------ */
/* Nav: condense on scroll                                             */
/* ------------------------------------------------------------------ */
function initNavScroll() {
  const nav = document.querySelector(".nav");
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ------------------------------------------------------------------ */
/* Mobile drawer menu                                                   */
/* ------------------------------------------------------------------ */
function initMobileDrawer() {
  const toggle = document.querySelector(".mobile-toggle");
  const drawer = document.querySelector(".mobile-drawer");
  const closeBtn = document.querySelector(".mobile-drawer__close");
  if (!toggle || !drawer) return;

  const open = () => {
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    toggle.setAttribute("aria-expanded", "true");
  };
  const close = () => {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", open);
  closeBtn?.addEventListener("click", close);
  drawer.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

/* ------------------------------------------------------------------ */
/* Scroll-triggered reveal animations                                   */
/* ------------------------------------------------------------------ */
function initScrollReveal() {
  const targets = document.querySelectorAll(
    ".reveal, .reveal-scale, .reveal-stagger"
  );
  if (!targets.length) return;

  if (!("IntersectionObserver" in window)) {
    targets.forEach((t) => t.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );

  targets.forEach((t) => observer.observe(t));
}

/* ------------------------------------------------------------------ */
/* FAQ accordion                                                        */
/* ------------------------------------------------------------------ */
function initFaqAccordion() {
  const items = document.querySelectorAll(".faq__item");
  if (!items.length) return;

  items.forEach((item) => {
    const btn = item.querySelector(".faq__q");
    btn.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");
      items.forEach((other) => {
        other.classList.remove("is-open");
        other.querySelector(".faq__q").setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });
}

/* ------------------------------------------------------------------ */
/* Signature hero card: autonomous sway + pointer-reactive tilt         */
/* ------------------------------------------------------------------ */
function initCardInteraction(reducedMotion) {
  const stage = document.querySelector(".hero__stage");
  const card = document.querySelector(".card3d");
  if (!stage || !card) return;

  if (reducedMotion) {
    card.style.transform = "rotateX(4deg) rotateY(-10deg)";
    return;
  }

  const MAX_MOUSE_TILT = 9; // degrees of extra tilt from pointer
  const SWAY_Y = 7; // degrees of autonomous left-right sway
  const SWAY_X = 2.2; // degrees of autonomous up-down sway
  const SWAY_PERIOD = 7200; // ms for one full left-right-left cycle
  const LERP_SPEED = 0.08;

  let targetMouseX = 0; // -1..1
  let targetMouseY = 0; // -1..1
  let currentMouseX = 0;
  let currentMouseY = 0;
  let startTime = performance.now();

  const onPointerMove = (e) => {
    const rect = stage.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width; // 0..1
    const py = (e.clientY - rect.top) / rect.height;
    targetMouseX = px * 2 - 1;
    targetMouseY = py * 2 - 1;

    card.style.setProperty("--mx", `${px * 100}%`);
    card.style.setProperty("--my", `${py * 100}%`);
  };

  const onPointerLeave = () => {
    targetMouseX = 0;
    targetMouseY = 0;
  };

  stage.addEventListener("pointermove", onPointerMove);
  stage.addEventListener("pointerleave", onPointerLeave);

  function frame(now) {
    const t = (now - startTime) / SWAY_PERIOD;
    const swayY = Math.sin(t * Math.PI * 2) * SWAY_Y;
    const swayX = Math.cos(t * Math.PI * 2) * SWAY_X;

    currentMouseX += (targetMouseX - currentMouseX) * LERP_SPEED;
    currentMouseY += (targetMouseY - currentMouseY) * LERP_SPEED;

    const rotateY = swayY + currentMouseX * MAX_MOUSE_TILT;
    const rotateX = -swayX - currentMouseY * MAX_MOUSE_TILT * 0.6;

    card.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
