/* ── NAVBAR: always solid bg; box-shadow only on scroll ─────── */
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


/* ── SCROLL REVEAL + VALUE CARD STAGGER ─────────────────────── */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    entry.target.classList.add('visible');

    // Stagger value cards inside the revealed section
    entry.target.querySelectorAll('.value-card').forEach((card, i) => {
      setTimeout(() => card.classList.add('visible'), 80 + i * 120);
    });

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
  h.classList.add('heading-blur-in');
  headingObs.observe(h);
});
