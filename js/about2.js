/* ── WMD CARD EXPAND / COLLAPSE ────────────────────────────────── */
(function () {
  'use strict';

  var CONTENT_DELAY = 280;  // ms - wait for card to widen before staggering content in
  var COLLAPSE_WAIT = 180;  // ms - wait for content to fade before shrinking card

  var track = document.querySelector('.wmd-track');
  if (!track) return;

  var cards = Array.from(track.querySelectorAll('.wmd-card'));

  /* ── Stable collapsed card width from CSS clamp(260px, 27vw, 360px) ── */
  function collapsedCardWidth() {
    return Math.min(Math.max(260, window.innerWidth * 0.27), 360);
  }

  /* ── 2×-2.5× the collapsed width, capped at track inner width ── */
  function computeExpandedWidth() {
    var base   = collapsedCardWidth();
    var target = Math.round(base * 2.3);
    var style  = window.getComputedStyle(track);
    var padL   = parseFloat(style.paddingLeft)  || 0;
    var padR   = parseFloat(style.paddingRight) || 0;
    var max    = Math.max(track.offsetWidth - padL - padR, 280);
    return Math.min(target, max);
  }

  /* ── Expand ─────────────────────────────────────────────────── */
  function expandCard(card) {
    // Stable collapsed width - never read from a live DOM measurement that
    // could be mid-transition due to a sibling still animating.
    var collapsedW = collapsedCardWidth();
    var GAP = 20; /* matches track gap in CSS */

    // 1. Lock text column to collapsed content width before the card widens
    card.style.setProperty('--wmd-text-w', (collapsedW - 48) + 'px');

    // 2. Compute and apply expanded width
    var expandedW = computeExpandedWidth();
    track.style.setProperty('--wmd-expanded-w', expandedW + 'px');

    // 3. Move cards so the expanded card's left edge aligns with the section heading.
    //    Preceding cards: translateX(-shift) slides them off-screen left (visual only,
    //    no layout change). The expanded card: margin-left: -shift pulls it left in the
    //    flex layout so it sits at padL. Cards after it are pushed right naturally. ✓
    //    The track itself stays full-width - no clipping on the expanded card's right side.
    var cardIndex = cards.indexOf(card);
    var shift = cardIndex * (collapsedW + GAP);
    cards.forEach(function (c, idx) {
      if (idx < cardIndex) {
        c.style.setProperty('--card-shift', '-' + shift + 'px');
      } else {
        c.style.removeProperty('--card-shift');
      }
    });
    if (shift > 0) {
      card.style.marginLeft = '-' + shift + 'px';
    }

    // 4. Brief scale-pulse on click
    card.classList.add('expanding');
    setTimeout(function () { card.classList.remove('expanding'); }, 520);

    // 5. Expand - card grows rightward; siblings shift naturally via flex
    card.classList.add('expanded');
    card.querySelector('.wmd-toggle').setAttribute('aria-label', 'Close');
    cards.forEach(function (c) { if (c !== card) c.classList.add('wmd-peek'); });

    // 6. Clip overflow so pushed siblings are hidden
    track.classList.add('has-expanded');

    // 7. Stagger content in after card has widened
    setTimeout(function () { card.classList.add('content-visible'); }, CONTENT_DELAY);
  }

  /* ── Collapse ───────────────────────────────────────────────── */
  function collapseCard(card) {
    card.classList.remove('content-visible');
    card.classList.add('collapsing');

    setTimeout(function () {
      card.classList.remove('expanded', 'collapsing');
      card.querySelector('.wmd-toggle').setAttribute('aria-label', 'Expand');
      cards.forEach(function (c) {
        c.classList.remove('wmd-peek');
        c.style.removeProperty('--card-shift'); /* animate preceding cards back */
      });
      card.style.removeProperty('margin-left'); /* animate expanded card back */
      track.classList.remove('has-expanded');
      track.style.removeProperty('--wmd-expanded-w');
      setTimeout(function () { card.style.removeProperty('--wmd-text-w'); }, 480);
    }, COLLAPSE_WAIT);
  }

  /* ── Mobile popup modal ─────────────────────────────────────── */
  function showWmdModal(card) {
    var modal = document.getElementById('wmd-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'wmd-modal';
      modal.className = 'wmd-modal';
      modal.innerHTML =
        '<div class="wmd-modal-backdrop"></div>' +
        '<div class="wmd-modal-sheet">' +
          '<div class="wmd-modal-bg"></div>' +
          '<button class="wmd-modal-close" aria-label="Close">×</button>' +
          '<div class="wmd-modal-content">' +
            '<h3 class="wmd-modal-headline"></h3>' +
            '<p class="wmd-modal-desc"></p>' +
            '<div class="wmd-modal-spotlight">' +
              '<p class="wmd-modal-spotlight-label"></p>' +
              '<p class="wmd-modal-spotlight-quote"></p>' +
            '</div>' +
          '</div>' +
        '</div>';
      document.body.appendChild(modal);
      modal.querySelector('.wmd-modal-backdrop').addEventListener('click', hideWmdModal);
      modal.querySelector('.wmd-modal-close').addEventListener('click', hideWmdModal);
    }

    var bg = window.getComputedStyle(card).backgroundImage;
    modal.querySelector('.wmd-modal-bg').style.backgroundImage = bg;
    var hl  = card.querySelector('.wmd-headline');
    var dc  = card.querySelector('.wmd-exp-desc');
    var lbl = card.querySelector('.wmd-spotlight-label');
    var qt  = card.querySelector('.wmd-spotlight-quote');
    modal.querySelector('.wmd-modal-headline').textContent        = hl  ? hl.textContent  : '';
    modal.querySelector('.wmd-modal-desc').textContent            = dc  ? dc.textContent  : '';
    modal.querySelector('.wmd-modal-spotlight-label').textContent = lbl ? lbl.textContent : '';
    modal.querySelector('.wmd-modal-spotlight-quote').textContent = qt  ? qt.textContent  : '';

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function hideWmdModal() {
    var modal = document.getElementById('wmd-modal');
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  /* ── Wire up buttons ────────────────────────────────────────── */
  var pendingExpand = null; // track the one in-flight delayed expansion

  cards.forEach(function (card) {
    var btn = card.querySelector('.wmd-toggle');
    if (!btn) return;

    // On mobile, use touchend with a distance threshold to distinguish a
    // tap from a scroll. The track's passive touchmove listener can cause
    // the browser to not fire click after a touch, so we bypass click entirely.
    var btnTouchStartX = 0, btnTouchStartY = 0;
    btn.addEventListener('touchstart', function (e) {
      btnTouchStartX = e.touches[0].clientX;
      btnTouchStartY = e.touches[0].clientY;
    }, { passive: true });
    btn.addEventListener('touchend', function (e) {
      if (window.innerWidth > 768) return;
      var dx = e.changedTouches[0].clientX - btnTouchStartX;
      var dy = e.changedTouches[0].clientY - btnTouchStartY;
      if (Math.sqrt(dx * dx + dy * dy) <= 10) {
        e.preventDefault(); // block the subsequent synthetic click
        showWmdModal(card);
      }
    }, { passive: false });

    btn.addEventListener('click', function (e) {
      e.stopPropagation();

      // On mobile the modal is opened via touchend above
      if (window.innerWidth <= 768) return;

      // Always cancel any previously queued expand so rapid clicks
      // never stack up multiple expansions.
      if (pendingExpand !== null) {
        clearTimeout(pendingExpand);
        pendingExpand = null;
      }

      if (card.classList.contains('expanded')) {
        collapseCard(card);
        return;
      }

      var current = track.querySelector('.wmd-card.expanded');
      if (current) {
        collapseCard(current);
        pendingExpand = setTimeout(function () {
          pendingExpand = null;
          expandCard(card);
        }, COLLAPSE_WAIT + 40);
      } else {
        expandCard(card);
      }
    });
  });

  /* ── Re-compute width on resize ─────────────────────────────── */
  window.addEventListener('resize', function () {
    var expandedCard = track.querySelector('.wmd-card.expanded');
    if (expandedCard) {
      track.style.setProperty('--wmd-expanded-w', computeExpandedWidth(expandedCard) + 'px');
    }
  });

})();


/* ── WMD TRACK DRAG SCROLL (collapsed state only) ──────────────── */
(function () {
  'use strict';

  var track = document.querySelector('.wmd-track');
  if (!track) return;

  var isDragging = false, startX = 0, scrollLeft = 0;

  track.addEventListener('mousedown', function (e) {
    if (track.classList.contains('has-expanded')) return;
    isDragging = true;
    startX     = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
    track.classList.add('grabbing');
  });

  ['mouseleave', 'mouseup'].forEach(function (evt) {
    track.addEventListener(evt, function () {
      isDragging = false;
      track.classList.remove('grabbing');
    });
  });

  track.addEventListener('mousemove', function (e) {
    if (!isDragging) return;
    e.preventDefault();
    track.scrollLeft = scrollLeft - (e.pageX - track.offsetLeft - startX) * 1.4;
  });

  /* Touch swipe */
  var touchStartX = 0, touchScrollLeft = 0;
  track.addEventListener('touchstart', function (e) {
    touchStartX     = e.touches[0].clientX;
    touchScrollLeft = track.scrollLeft;
  }, { passive: true });

  track.addEventListener('touchmove', function (e) {
    if (track.classList.contains('has-expanded')) return;
    track.scrollLeft = touchScrollLeft + (touchStartX - e.touches[0].clientX);
  }, { passive: true });

})();


/* ── TEAM CAROUSEL ─────────────────────────────────────────────── */
(function () {
  'use strict';

  const clip  = document.getElementById('team-clip');
  const track = document.getElementById('team-track');
  const prev  = document.getElementById('team-prev');
  const next  = document.getElementById('team-next');
  if (!clip || !track) return;

  function getCardWidth() {
    const card = track.querySelector('.team-card');
    return card ? card.offsetWidth + 20 : 300;
  }

  function updateButtons() {
    if (!prev || !next) return;
    prev.disabled = track.scrollLeft <= 1;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
  }

  if (prev) prev.addEventListener('click', () => track.scrollBy({ left: -getCardWidth(), behavior: 'smooth' }));
  if (next) next.addEventListener('click', () => track.scrollBy({ left:  getCardWidth(), behavior: 'smooth' }));

  track.addEventListener('scroll', updateButtons, { passive: true });

  let isDragging = false, startX = 0, scrollLeft = 0;

  clip.addEventListener('mousedown', e => {
    isDragging = true;
    startX     = e.pageX - clip.offsetLeft;
    scrollLeft = track.scrollLeft;
    clip.classList.add('grabbing');
  });

  ['mouseleave', 'mouseup'].forEach(evt =>
    clip.addEventListener(evt, () => {
      isDragging = false;
      clip.classList.remove('grabbing');
    })
  );

  clip.addEventListener('mousemove', e => {
    if (!isDragging) return;
    e.preventDefault();
    track.scrollLeft = scrollLeft - (e.pageX - clip.offsetLeft - startX) * 1.5;
  });

  let touchStartX = 0, touchScrollLeft = 0;
  track.addEventListener('touchstart', e => {
    touchStartX      = e.touches[0].clientX;
    touchScrollLeft  = track.scrollLeft;
  }, { passive: true });

  track.addEventListener('touchmove', e => {
    track.scrollLeft = touchScrollLeft + (touchStartX - e.touches[0].clientX);
  }, { passive: true });

  updateButtons();
})();


