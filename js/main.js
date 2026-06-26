/**
 * Main Portfolio Logic
 * - Typing animation
 * - Scroll reveal
 * - Stat counter animation
 * - Active nav link tracking
 * - Mobile nav toggle
 */
(function () {
  // ==================== TYPING ANIMATION ====================
  const phrases = [
    'Software Engineer',
    'Cybersecurity Professional',
    'Cloud Engineer',
    'Machine Learning Enthusiast',
    'Full-Stack Developer',
    'Technical Support Specialist',
  ];

  let phraseIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  const typedEl = document.getElementById('typed-text');

  function type() {
    if (!typedEl) return;
    const current = phrases[phraseIdx];

    if (isDeleting) {
      typedEl.textContent = current.substring(0, charIdx - 1);
      charIdx--;
    } else {
      typedEl.textContent = current.substring(0, charIdx + 1);
      charIdx++;
    }

    let delay = isDeleting ? 40 : 80;

    if (!isDeleting && charIdx === current.length) {
      delay = 2000;
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      delay = 500;
    }

    setTimeout(type, delay);
  }

  // ==================== SCROLL REVEAL ====================
  function setupReveal() {
    const reveals = document.querySelectorAll(
      '.section-inner, .timeline-item, .project-card, .skill-category, .edu-card, .contact-card, .stat-item'
    );
    reveals.forEach((el) => el.classList.add('reveal'));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    reveals.forEach((el) => observer.observe(el));
  }

  // ==================== STAT COUNTER ====================
  function animateCounters() {
    const counters = document.querySelectorAll('.stat-number[data-target]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.dataset.target);
            const duration = 2000;
            const start = performance.now();

            const suffix = el.dataset.suffix || '';

            function update(now) {
              const progress = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              el.textContent = Math.floor(eased * target).toLocaleString();

              if (progress < 1) {
                requestAnimationFrame(update);
              } else {
                el.textContent = target.toLocaleString() + suffix;
              }
            }

            requestAnimationFrame(update);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((c) => observer.observe(c));
  }

  // ==================== ACTIVE NAV TRACKING ====================
  function setupNavTracking() {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-links a');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach((link) => {
              link.classList.toggle('active', link.getAttribute('data-section') === id);
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    sections.forEach((s) => observer.observe(s));
  }

  // ==================== HIDE NAV ON SCROLL ====================
  function setupNavHide() {
    const nav = document.getElementById('cyber-nav');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
      const currentScroll = window.scrollY;
      if (currentScroll > lastScroll && currentScroll > 100) {
        nav.classList.add('hidden-nav');
      } else {
        nav.classList.remove('hidden-nav');
      }
      lastScroll = currentScroll;
    });
  }

  // ==================== MOBILE TOGGLE ====================
  function setupMobileNav() {
    const toggle = document.getElementById('nav-toggle');
    const links = document.querySelector('.nav-links');

    if (toggle && links) {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        links.classList.toggle('open');
      });

      links.querySelectorAll('a').forEach((a) => {
        a.addEventListener('click', () => {
          toggle.classList.remove('active');
          links.classList.remove('open');
        });
      });
    }
  }

  // ==================== SMOOTH SCROLL ====================
  function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ==================== INIT ====================
  window.addEventListener('portfolio-enter', () => {
    setTimeout(() => {
      type();
      setupReveal();
      animateCounters();
      setupNavTracking();
      setupNavHide();
      setupMobileNav();
      setupSmoothScroll();
    }, 300);
  });
})();
