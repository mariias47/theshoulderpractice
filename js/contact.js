/* ── NAVBAR scroll state ─────────────────────────────────────── */
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


/* ── CONTACT FORM ────────────────────────────────────────────── */
const form = document.getElementById('contact-form');

if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();

    const fields = form.querySelectorAll('input[required], textarea[required]');
    let valid = true;

    fields.forEach(field => {
      if (!field.value.trim()) {
        valid = false;
        field.setAttribute('aria-invalid', 'true');
      } else {
        field.removeAttribute('aria-invalid');
      }
    });

    if (!valid) return;

    const submitBtn = form.querySelector('.contact-submit');
    submitBtn.textContent = 'Sent!';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';
  });

  /* Clear aria-invalid on input */
  form.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('input', () => field.removeAttribute('aria-invalid'));
  });
}
