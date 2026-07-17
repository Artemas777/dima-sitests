(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------------
     Nav: background on scroll
  --------------------------------------------------------------------- */
  var nav = document.getElementById('nav');
  function onScrollNav() {
    if (window.scrollY > 24) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  /* ---------------------------------------------------------------------
     Mobile menu
  --------------------------------------------------------------------- */
  var burger = document.getElementById('burger');
  var navLinks = document.getElementById('navLinks');

  burger.addEventListener('click', function () {
    var isOpen = navLinks.classList.toggle('open');
    burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  document.querySelectorAll('[data-nav-link]').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------------------------------------------------------------------
     Scroll reveal
  --------------------------------------------------------------------- */
  var revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------------------------------------------------------------------
     Stat counters (count up once visible)
  --------------------------------------------------------------------- */
  var counters = document.querySelectorAll('.stat-num');

  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var duration = 1400;
    var start = null;

    if (reduceMotion) {
      el.textContent = target;
      return;
    }

    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var counterIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            counterIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach(function (el) { counterIO.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------------------------------------------------------------------
     Hero card: cursor-reactive 3D tilt + shine follow
  --------------------------------------------------------------------- */
  var cardStage = document.getElementById('cardStage');
  var glassCard = document.getElementById('glassCard');

  if (cardStage && glassCard && !reduceMotion && window.matchMedia('(hover: hover)').matches) {
    var bounds = null;

    function updateBounds() {
      bounds = cardStage.getBoundingClientRect();
    }
    updateBounds();
    window.addEventListener('resize', updateBounds);

    cardStage.addEventListener('mousemove', function (e) {
      if (!bounds) updateBounds();
      var px = (e.clientX - bounds.left) / bounds.width;   // 0..1
      var py = (e.clientY - bounds.top) / bounds.height;   // 0..1
      var rx = (py - 0.5) * -14;
      var ry = (px - 0.5) * 18;
      glassCard.style.transform = 'rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) scale(1.02)';
    });

    cardStage.addEventListener('mouseleave', function () {
      glassCard.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
    });
  }

  /* ---------------------------------------------------------------------
     Ambient cursor glow (desktop only)
  --------------------------------------------------------------------- */
  var cursorGlow = document.getElementById('cursorGlow');
  if (cursorGlow && window.matchMedia('(hover: hover)').matches && !reduceMotion) {
    window.addEventListener('mousemove', function (e) {
      cursorGlow.style.setProperty('--x', e.clientX + 'px');
      cursorGlow.style.setProperty('--y', e.clientY + 'px');
    });
  } else if (cursorGlow) {
    cursorGlow.style.display = 'none';
  }

  /* ---------------------------------------------------------------------
     Product card glow follows pointer
  --------------------------------------------------------------------- */
  if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.product-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var mx = ((e.clientX - rect.left) / rect.width) * 100;
        var my = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mx', mx + '%');
        card.style.setProperty('--my', my + '%');
      });
    });
  }

  /* ---------------------------------------------------------------------
     FAQ accordion
  --------------------------------------------------------------------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var question = item.querySelector('.faq-question');
    var answer = item.querySelector('.faq-answer');

    question.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');

      document.querySelectorAll('.faq-item.open').forEach(function (openItem) {
        if (openItem !== item) {
          openItem.classList.remove('open');
          openItem.querySelector('.faq-answer').style.maxHeight = null;
        }
      });

      if (isOpen) {
        item.classList.remove('open');
        answer.style.maxHeight = null;
      } else {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

})();
