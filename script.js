/* ── NAVBAR: transparent → solid on scroll ─────────────────── */
const navbar = document.getElementById('navbar');
const hero   = document.querySelector('.hero');

function updateNavbar() {
  const threshold = hero ? hero.offsetHeight * 0.55 : 300;
  navbar.classList.toggle('scrolled', window.scrollY > threshold);
}

window.addEventListener('scroll', updateNavbar, { passive: true });
updateNavbar(); // run on load in case page starts mid-scroll



/* ── MOBILE NAV ────────────────────────────────────────────── */
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

  // Close on outside click
  document.addEventListener('click', e => {
    if (!navbar.contains(e.target)) {
      navLinks.classList.remove('mobile-open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });
}


/* ── EXPERTISE TABS ────────────────────────────────────────── */
const expertiseData = {
  shoulder: {
    bgId: 'exp-shoulder',
    text: [
      'We specialise in diagnosing and treating a wide range of shoulder conditions, including arthritis, instability, rotator cuff injuries, labral tears, frozen shoulder, fractures and failed previous surgeries.',
      "Whether you're dealing with pain, impingement, tendon issues or complex surgical cases, we offer expert care to restore function and relieve discomfort."
    ]
  },
  arm: {
    bgId: 'exp-arm',
    text: [
      "We specialise in arm and elbow surgeries for conditions like tennis elbow, golfer's elbow, instability, arthritis, fractures, tendon injuries, and nerve entrapment.",
      'Using advanced techniques, we focus on restoring function and reducing pain, helping you move freely again.'
    ]
  },
  wrist: {
    bgId: 'exp-wrist',
    text: [
      "We specialise in wrist and hand conditions including carpal tunnel syndrome, trigger finger, De Quervain's tenosynovitis, fractures, arthritis, and ligament injuries.",
      'Our surgeons use the latest minimally invasive techniques to relieve pain and restore full hand function, helping you return to everyday life.'
    ]
  }
};

let activeTab = 'shoulder';

function switchTab(tab) {
  if (tab === activeTab) return;

  // Swap background image
  document.getElementById(expertiseData[activeTab].bgId).classList.remove('active');
  document.getElementById(expertiseData[tab].bgId).classList.add('active');

  // Update buttons
  document.querySelectorAll('.exp-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });

  // Fade out → swap content → fade in (opacity only, no layout shift)
  const desc = document.getElementById('exp-desc');
  desc.classList.add('fading');

  setTimeout(() => {
    desc.innerHTML = expertiseData[tab].text.map(p => `<p>${p}</p>`).join('');
    // Force reflow so transition triggers properly
    desc.offsetHeight; // eslint-disable-line no-unused-expressions
    desc.classList.remove('fading');
  }, 250);

  activeTab = tab;
}

document.querySelectorAll('.exp-tab').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});


/* ── CAROUSELS ─────────────────────────────────────────────── */
function setupCarousel(trackId, clipId, prevId, nextId) {
  const track = document.getElementById(trackId);
  const clip  = document.getElementById(clipId);
  const prev  = document.getElementById(prevId);
  const next  = document.getElementById(nextId);
  if (!track) return;

  function cardStep() {
    const card = track.firstElementChild;
    const gap  = parseFloat(getComputedStyle(track).gap) || 24;
    return (card ? card.offsetWidth : 300) + gap;
  }

  function updateButtons() {
    const atStart = track.scrollLeft <= 2;
    const atEnd   = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
    if (prev) prev.disabled = atStart;
    if (next) next.disabled = atEnd;
  }

  prev?.addEventListener('click', () => track.scrollBy({ left: -cardStep(), behavior: 'smooth' }));
  next?.addEventListener('click', () => track.scrollBy({ left:  cardStep(), behavior: 'smooth' }));
  track.addEventListener('scroll', updateButtons, { passive: true });
  window.addEventListener('resize', updateButtons, { passive: true });

  // Prev is always disabled at start (scrollLeft = 0).
  if (prev) prev.disabled = true;
  requestAnimationFrame(updateButtons);

  // Pointer drag
  if (!clip) return;
  let startX = 0, startScroll = 0, dragging = false;

  clip.addEventListener('pointerdown', e => {
    if (e.target.closest('button, a')) return;
    dragging    = true;
    startX      = e.clientX;
    startScroll = track.scrollLeft;
    clip.classList.add('grabbing');
    track.style.scrollBehavior = 'auto';
    clip.setPointerCapture(e.pointerId);
  });

  clip.addEventListener('pointermove', e => {
    if (!dragging) return;
    track.scrollLeft = startScroll - (e.clientX - startX);
  });

  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    clip.classList.remove('grabbing');
    track.style.scrollBehavior = 'smooth';
    updateButtons();
  };

  clip.addEventListener('pointerup',     endDrag);
  clip.addEventListener('pointercancel', endDrag);
}

setupCarousel('team-track',      'team-clip', 'team-prev', 'team-next');
setupCarousel('locations-track', 'loc-clip',  'loc-prev',  'loc-next');


/* ── SCROLL REVEAL ─────────────────────────────────────────── */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    entry.target.classList.add('visible');

    // Stagger service cards
    entry.target.querySelectorAll('.service').forEach((svc, i) => {
      setTimeout(() => svc.classList.add('visible'), 80 + i * 120);
    });

    revealObs.unobserve(entry.target);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

document.querySelectorAll('.scroll-reveal').forEach(el => revealObs.observe(el));


/* ── BIO MODAL ─────────────────────────────────────────────── */
const bioData = {
  1: {
    name: 'Mr Carlos Cobiella',
    sub: 'Consultant Orthopaedic Surgeon · Founder, The Shoulder Practice',
    paras: [
      'Mr Cobiella has been at the forefront of upper limb surgery in the United Kingdom for over 25 years. Trained at The Royal National Orthopaedic Hospital, he has held Consultant post at University College Hospital London throughout his career, developing a practice recognised for its management of the most complex shoulder, elbow and wrist cases.',
      'He is regularly referred sportsmen from Premiership football and rugby clubs, Olympic and international level athletes from the English Institute of Sports, UK Athletics and the PGA. He was part of the medical team at the London 2012 Olympics, has served as the NFL\'s Upper Limb Surgeon in Europe for over 14 years and is the shoulder surgeon for the London Underground. Well known musicians and artists, including Oscar winning actors and film makers have trusted his professional ability. He regularly sees individuals referred after failed surgery elsewhere — many travelling internationally for his care. He is known as much for his judgement about when not to operate as for his technical skill when surgery is the right answer.',
      'Beyond his clinical work, Mr Cobiella has dedicated significant effort to training the next generation of upper limb surgeons. He is part of international study groups that are developing innovative techniques for the treatment of instability and rotator cuff disease. He organises the London Shoulder Meeting annually and is a member of faculty in numerous courses in Arthroscopic and Sports Injury Surgery, both national and international. Several of his former Fellows now hold consultant posts across the United Kingdom.',
      'The Shoulder Practice was founded as a formal expression of that philosophy: a place where exceptional care and exceptional training exist side by side.'
    ],
    interests: [
      'Shoulder and elbow sports injuries',
      'Rotator cuff disease',
      'Shoulder instability and dislocations',
      'Frozen shoulder',
      'Tennis and golfer\'s elbow',
      'Upper limb fractures',
      'Arthritis'
    ],
    appointments: [
      'Hospital of St John & St Elizabeth',
      'Princess Grace Hospital',
      'The London Clinic',
      'ISEH'
    ],
    note: 'All major insurers accepted. Please contact the practice for confirmation.'
  },
  2: {
    name: 'Mr Simon Lambert',
    sub: 'Consultant Orthopaedic & Elbow Surgeon, University College Hospitals London',
    para: 'Mr Lambert is a highly experienced consultant specialising in complex shoulder and elbow conditions, particularly difficult or previously treated cases. He is known for managing challenging problems and helping patients who require advanced or revision surgery.',
    bullets: [
      'Specialist in complex and revision shoulder & elbow surgery',
      'Expertise in joint replacement, rotator cuff problems, instability, and post-traumatic conditions',
      'Consultant at University College Hospitals London, helping develop a leading specialist referral centre',
      'Extensive experience treating complex cases referred from other surgeons and hospitals',
      'Former consultant at the Royal National Orthopaedic Hospital and University Hospital Southampton',
      'Internationally recognised, with specialist training including fellowships in Switzerland',
      'Focus on restoring function and reducing pain, even in difficult or long-standing conditions',
      'Actively involved in research, teaching, and improving surgical techniques'
    ]
  },
  3: {
    name: 'Mr Jae Rhee',
    sub: 'Consultant Orthopaedic Shoulder & Elbow Surgeon, Princess Royal Hospital, Shrewsbury',
    para: 'Mr Rhee is a consultant orthopaedic surgeon specialising in shoulder and upper limb conditions. He focuses on providing high-quality, personalised care using modern techniques to support recovery and return to activity.',
    bullets: [
      'Specialist in shoulder and upper limb conditions, including sports injuries, wrist and hand problems',
      'Expert in minimally invasive (keyhole/arthroscopic) surgery and shoulder joint replacement',
      'Trained in London with advanced fellowships in shoulder & elbow and hand & wrist surgery',
      'Consultant since 2014, leading development of the upper limb service at Princess Royal Hospital',
      'Treats elite and professional athletes, including work with Saracens F.C. and international sports organisations',
      'Works closely with high-performance centres such as the English Institute of Sport',
      'Actively involved in teaching, research, and surgical training',
      'Committed to tailored, patient-centred care using the latest techniques for optimal recovery'
    ]
  },
  4: {
    name: 'Mr Dimitrios Karadaglis',
    sub: 'Consultant Orthopaedic Shoulder & Elbow Surgeon, Queen Elizabeth Hospital, London',
    para: 'Mr Karadaglis is a consultant orthopaedic surgeon specialising in shoulder, elbow, and upper limb conditions, with particular expertise in trauma and sports injuries. He focuses on delivering personalised treatment to help patients return to normal activity as quickly as possible.',
    bullets: [
      'Specialist in shoulder, elbow, and upper limb conditions, including trauma and sports injuries',
      'Expert in minimally invasive (keyhole) surgery as well as complex open procedures when needed',
      'Advanced training in London and internationally, including at the Massachusetts General Hospital (Harvard Shoulder Institute)',
      'Consultant since 2009; currently Trauma Lead at Queen Elizabeth Hospital, London',
      'Extensive experience managing fractures, soft tissue injuries, and arthritis, including shoulder replacement surgery',
      'Works closely with physiotherapists to support full and faster rehabilitation',
      'Strong focus on tailored, patient-centred care and tracking outcomes to improve results',
      'Actively involved in teaching and training surgeons'
    ]
  }
  /* PLACEHOLDER: Additional surgeon bios to be added by practice owner */
};

const bioBackdrop = document.getElementById('bio-backdrop');
const bioClose    = document.getElementById('bio-close');
const bioName     = document.getElementById('bio-name');
const bioSub      = document.getElementById('bio-sub');
const bioContent  = document.getElementById('bio-content');

function openBio(id) {
  const d = bioData[id];
  if (!d) return;

  bioName.textContent = d.name;
  bioSub.textContent  = d.sub;

  let html = '';

  // Multiple paragraphs (rich bio) or single paragraph
  if (d.paras) {
    html += d.paras.map(p => `<p class="bio-para">${p}</p>`).join('');
  } else if (d.para) {
    html += `<p class="bio-para">${d.para}</p>`;
  }

  // Specialist interests
  if (d.interests && d.interests.length) {
    html += `<p class="bio-section-heading">Specialist interests</p>`;
    html += `<ul class="bio-list">${d.interests.map(i => `<li>${i}</li>`).join('')}</ul>`;
  }

  // Bullet list (standard bio format)
  if (d.bullets && d.bullets.length) {
    html += `<ul class="bio-list">${d.bullets.map(b => `<li>${b}</li>`).join('')}</ul>`;
  }

  // Appointments
  if (d.appointments && d.appointments.length) {
    html += `<p class="bio-section-heading">Appointments</p>`;
    html += `<ul class="bio-list">${d.appointments.map(a => `<li>${a}</li>`).join('')}</ul>`;
  }

  // Note (insurers etc.)
  if (d.note) {
    html += `<p class="bio-note">${d.note}</p>`;
  }

  bioContent.innerHTML = html;
  bioBackdrop.setAttribute('aria-hidden', 'false');
  bioBackdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeBio() {
  bioBackdrop.classList.remove('open');
  bioBackdrop.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

document.querySelectorAll('[data-doctor]').forEach(btn => {
  btn.addEventListener('click', () => openBio(btn.dataset.doctor));
});

bioClose.addEventListener('click', closeBio);

bioBackdrop.addEventListener('click', e => {
  if (e.target === bioBackdrop) closeBio();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeBio();
});


/* ── HEADING BLUR-IN ───────────────────────────────────────── */
const headingObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    headingObs.unobserve(entry.target);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -24px 0px' });

document.querySelectorAll('h1, h2, h3').forEach(h => {
  if (h.closest('.hero-content')) return; // skip hero — already animated
  h.classList.add('heading-blur-in');
  headingObs.observe(h);
});
