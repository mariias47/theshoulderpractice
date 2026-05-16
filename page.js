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


/* ── SCROLL REVEAL ───────────────────────────────────────────── */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');

    // Stagger journey steps
    entry.target.querySelectorAll('.journey-step').forEach((step, i) => {
      setTimeout(() => step.classList.add('visible'), 80 + i * 100);
    });

    revealObs.unobserve(entry.target);
  });
}, { threshold: 0.08, rootMargin: '0px 0px -48px 0px' });

document.querySelectorAll('.scroll-reveal, .journey-step').forEach(el => revealObs.observe(el));


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


/* ── CONDITIONS DIAGRAM (conditions.html only) ───────────────── */
const conditionsData = {
  shoulder: {
    bgId: 'cond-bg-shoulder',
    conditions: [
      'Rotator cuff tear',
      'Frozen shoulder',
      'Shoulder instability & dislocation',
      'AC joint injury',
      'Labral tear (SLAP)',
      'Shoulder arthritis',
      'Fractures',
      'Failed previous surgery'
    ]
  },
  elbow: {
    bgId: 'cond-bg-elbow',
    conditions: [
      'Tennis elbow (lateral epicondylitis)',
      'Golfer\'s elbow (medial epicondylitis)',
      'Elbow arthritis',
      'Olecranon bursitis',
      'Cubital tunnel syndrome',
      'Elbow stiffness & contracture'
    ]
  },
  wrist: {
    bgId: 'cond-bg-wrist',
    conditions: [
      'Carpal tunnel syndrome',
      'De Quervain\'s tenosynovitis',
      'Trigger finger',
      'Wrist arthritis',
      'Scaphoid fracture',
      'Ganglion cysts'
    ]
  }
};

const conditionsList = document.getElementById('conditions-list');
const conditionTabs  = document.querySelectorAll('.condition-tab');

if (conditionsList && conditionTabs.length) {
  let activeRegion = 'shoulder';

  function renderConditions(region) {
    const data = conditionsData[region];
    if (!data) return;

    conditionsList.classList.add('fading');

    setTimeout(() => {
      conditionsList.innerHTML = data.conditions
        .map(c => `<div class="condition-item" tabindex="0">${c}</div>`)
        .join('');

      // Background swap
      document.querySelectorAll('.conditions-bg').forEach(bg => bg.classList.remove('active'));
      const activeBg = document.getElementById(data.bgId);
      if (activeBg) activeBg.classList.add('active');

      conditionsList.classList.remove('fading');

      // Click to select
      conditionsList.querySelectorAll('.condition-item').forEach(item => {
        item.addEventListener('click', () => {
          conditionsList.querySelectorAll('.condition-item').forEach(i => i.classList.remove('selected'));
          item.classList.add('selected');
        });
        item.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            item.click();
          }
        });
      });
    }, 180);
  }

  conditionTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const region = tab.dataset.region;
      if (region === activeRegion) return;

      conditionTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeRegion = region;
      renderConditions(region);
    });
  });

  renderConditions(activeRegion);
}
