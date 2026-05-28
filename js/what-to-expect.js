/* ── PAGE-LEVEL SCROLL SNAP (desktop only) ───────────────────── */
if (window.matchMedia('(min-width: 861px)').matches) {
  document.documentElement.classList.add('wte-snap');
}

/* ── NAVBAR ─────────────────────────────────────────────────── */
const navbar = document.getElementById('navbar');

function updateNavbar() {
  navbar.classList.toggle('scrolled', window.scrollY > 10);
}
window.addEventListener('scroll', updateNavbar, { passive: true });
updateNavbar();


/* ── MOBILE NAV ─────────────────────────────────────────────── */
const hamburger = document.getElementById('nav-hamburger');
const navLinks  = document.getElementById('nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('mobile-open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('mobile-open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', e => {
    if (!navbar.contains(e.target)) {
      navLinks.classList.remove('mobile-open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });
}


/* ── SCROLL REVEAL ───────────────────────────────────────────── */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    revealObs.unobserve(entry.target);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

document.querySelectorAll('.scroll-reveal').forEach(el => revealObs.observe(el));


/* ── HEADING BLUR-IN ─────────────────────────────────────────── */
const headingObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    headingObs.unobserve(entry.target);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -24px 0px' });

document.querySelectorAll('h1, h2, h3').forEach(h => {
  if (h.closest('.wte-step')) return; // step headings are controlled by the scroll observer
  h.classList.add('heading-blur-in');
  headingObs.observe(h);
});


/* ── STICKY STEPS + IMAGE CROSSFADE ──────────────────────────── */
const steps = document.querySelectorAll('.wte-step');
const imgs  = document.querySelectorAll('.wte-img');

function activateStep(index) {
  steps.forEach((s, i) => {
    s.classList.toggle('active', i === index);
    s.classList.toggle('step-next', i === index + 1);
  });
  imgs.forEach((img, i) => img.classList.toggle('active', i === index));
}

const stepObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      activateStep(parseInt(entry.target.dataset.step, 10));
    }
  });
}, { rootMargin: '-40% 0px -40% 0px' });

steps.forEach(step => stepObs.observe(step));
