/* The engine: opens each card at 00:00 on the visitor's clock, plays the intro, and cycles the cards on tap.
   Nothing here needs editing. Test links:  index.html?preview=2026-11-15   or   ?preview=2026-11-13T23:59:50   (add &intro=0 to skip the intro) */
(function () {
  'use strict';

  var params = new URLSearchParams(location.search);
  var META = window.NOTE_META, CARDS = window.CARDS, TEXT = window.INTRO;

  /* ---- clock (a preview link only shifts the clock, it never skips the lock) ---- */
  function when(s, hh) {
    var m = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/.exec(s || '');
    if (!m) return null;
    var d = new Date(+m[1], +m[2] - 1, +m[3], m[4] === undefined ? hh : +m[4], +(m[5] || 0), +(m[6] || 0));
    return isNaN(d) ? null : d;
  }
  var preview = when(params.get('preview'), 12);
  var offset = preview ? preview.getTime() - Date.now() : 0;
  function now() { return Date.now() + offset; }
  var at = CARDS.map(function (c) { return when(c.unlock, 0).getTime(); });

  function openList() {                       // indexes of the cards that are open now, oldest first
    var t = now(), out = [];
    for (var i = 0; i < CARDS.length; i++) if (t >= at[i]) out.push(i);
    return out;
  }

  /* ---- dom helpers ---- */
  var slot = document.getElementById('slot'), intro = document.getElementById('intro'),
      introText = document.getElementById('introText'), hint = document.getElementById('hint');
  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function rich(parent, text) {               // *words* -> italics
    text.split(/(\*[^*]+\*)/).forEach(function (part) {
      if (!part) return;
      if (part.charAt(0) === '*') parent.appendChild(h('em', '', part.slice(1, -1)));
      else parent.appendChild(document.createTextNode(part));
    });
  }

  /* ---- sizing: the note is scaled to fit the screen, its text scales with it ---- */
  var current = null;                         // { el, meta }
  function fit() {
    if (!current) return;
    var m = current.meta, W = window.innerWidth, H = window.innerHeight;
    var s = Math.min((W - 44) / m.pw, (H - 70) / m.ph);
    s = Math.max(.74, Math.min(1.25, s));
    current.el.style.setProperty('--s', s.toFixed(4));
  }
  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', fit);

  function buildNote(i) {
    var locked = i < 0, card = locked ? null : CARDS[i];
    var meta = META[locked ? 'paper' : card.note];
    var el = h('article', 'note' + (locked ? ' locked' : ''));
    el.style.setProperty('--pw', meta.pw); el.style.setProperty('--ph', meta.ph);
    el.style.setProperty('--tilt', (locked ? -.9 : card.tilt) + 'deg');
    var img = h('img', 'paper'); img.alt = ''; img.decoding = 'async';
    img.src = 'img/note-' + (locked ? 'paper' : card.note) + '.webp';
    img.style.left = (-meta.ml / meta.pw * 100) + '%'; img.style.top = (-meta.mt / meta.ph * 100) + '%';
    img.style.width = (meta.imgw / meta.pw * 100) + '%'; img.style.height = (meta.imgh / meta.ph * 100) + '%';
    var ink = h('div', 'ink'), inn = h('div', 'in'); ink.appendChild(inn);
    if (locked) {
      var cd = h('p', 'count'); cd.id = 'count';
      inn.appendChild(h('p', 'date', 'Opens ' + CARDS[0].date));
      inn.appendChild(h('h1', 'title', 'Not yet'));
      inn.appendChild(cd);
    } else {
      ink.style.setProperty('--tsize', card.sizes.title + 'cqw'); ink.style.setProperty('--bsize', card.sizes.text + 'cqw');
      inn.appendChild(h('p', 'date', card.date));
      inn.appendChild(h('h1', 'title', card.title));
      var body = h('div', 'body');
      card.body.forEach(function (t) { var p = h('p'); rich(p, t); body.appendChild(p); });
      inn.appendChild(body);
    }
    el.appendChild(img); el.appendChild(ink);
    var btn = h('button', 'hit'); btn.type = 'button';
    btn.setAttribute('aria-label', locked ? 'Not open yet' : (openList().length > 1 ? 'Card for ' + card.date + '. Tap for another card' : 'Card for ' + card.date));
    if (!locked) btn.addEventListener('click', onTap); else btn.tabIndex = -1;
    el.appendChild(btn);
    return { el: el, meta: meta, index: i, img: img, hit: btn };
  }
  function mount(i) {
    current = buildNote(i);
    slot.replaceChildren(current.el);
    fit();
    return current.el;
  }
  function addAnim(el, cls, ms, done) {
    el.classList.add(cls);
    setTimeout(function () { el.classList.remove(cls); if (done) done(); }, ms);
  }
  function countdown() {
    var c = document.getElementById('count'); if (!c) return;
    var ms = at[0] - now(); if (ms < 0) ms = 0;
    var s = Math.floor(ms / 1000), p = function (n) { return String(n).padStart(2, '0'); };
    var d = Math.floor(s / 86400);
    c.textContent = (d ? d + (d === 1 ? ' day ' : ' days ') : '') + p(Math.floor(s % 86400 / 3600)) + ':' + p(Math.floor(s % 3600 / 60)) + ':' + p(s % 60);
  }

  /* ---- what a tap does ---- */
  var busy = false, tapped = false;
  function onTap() {
    if (busy) return;
    tapped = true; hint.classList.remove('show');
    var list = openList();
    if (list.length < 2) {                    // only one card exists: the note shakes, nothing else happens
      busy = true; addAnim(current.el, 'shake', 600, function () { busy = false; });
      return;
    }
    var order = list.slice().reverse();       // newest, then back through the older ones, then round again
    var next = order[(order.indexOf(current.index) + 1) % order.length];
    swapTo(next);
  }
  function swapTo(i) {
    busy = true;
    var hadFocus = document.activeElement === current.hit;      // keep keyboard focus on the new note
    addAnim(current.el, 'peel', 300, function () {
      var el = mount(i); if (hadFocus) current.hit.focus({ preventScroll: true });
      addAnim(el, 'settle', 560, function () { busy = false; });
    });
  }

  /* ---- intro, then the newest card fades in ---- */
  var introRunning = false;
  function playIntro(list, skip) {
    var newest = list[list.length - 1];
    function reveal() {
      var el = mount(newest);
      addAnim(el, 'arrive', 1000, function () { busy = false; showHint(); });
    }
    if (skip) { busy = true; reveal(); return; }
    introRunning = true; busy = true;
    introText.textContent = list.length === CARDS.length ? TEXT.last : (list.length === 1 ? TEXT.first : TEXT.later);
    intro.hidden = false; intro.classList.remove('out');
    void intro.offsetWidth;
    intro.classList.add('in');
    var timer = setTimeout(end, 2900), over = false;
    function end() {
      if (over) return; over = true; clearTimeout(timer);
      intro.removeEventListener('click', end);
      intro.classList.add('out'); introRunning = false;
      reveal();
      setTimeout(function () { intro.hidden = true; intro.classList.remove('in', 'out'); }, 1100);
    }
    intro.addEventListener('click', end);
  }
  function showHint() {
    if (tapped || openList().length < 2) return;
    hint.hidden = false; void hint.offsetWidth;
    setTimeout(function () { if (!tapped) hint.classList.add('show'); }, 1500);
  }

  /* ---- the clock keeps running: cards open by themselves at midnight ---- */
  var known = 0, ready = false, introOff = params.get('intro') === '0';
  function tick() {
    if (!ready) return;
    var list = openList();
    if (list.length === 0) { countdown(); return; }
    if (list.length === known || busy || introRunning) return;
    var before = known; known = list.length;
    if (before === 0) playIntro(list, false);                   // she was waiting on the locked note
    else { tapped = false; swapTo(list[list.length - 1]); showHint(); }
  }
  setInterval(tick, 1000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) tick(); });

  /* ---- start: wait for the fonts and the first paper, so nothing pops in half-loaded ---- */
  function start() {
    var list = openList(); known = list.length; ready = true;
    if (!list.length) { mount(-1); countdown(); return; }
    var first = new Image(); first.src = 'img/note-' + CARDS[list[list.length - 1]].note + '.webp';
    var go = function () { playIntro(list, introOff); setTimeout(preloadRest, 1500); };
    var decoded = first.decode ? first.decode().catch(function () {}) : Promise.resolve();
    Promise.race([decoded, new Promise(function (r) { setTimeout(r, 4000); })]).then(go);
  }
  function preloadRest() { openList().forEach(function (i) { new Image().src = 'img/note-' + CARDS[i].note + '.webp'; }); }
  var fontsReady = (document.fonts && document.fonts.load)
    ? Promise.all([document.fonts.load('48px "Instrument Serif"'), document.fonts.load('italic 20px "Instrument Serif"'), document.fonts.load('13px "DM Mono"')]).catch(function () {})
    : Promise.resolve();
  Promise.race([fontsReady, new Promise(function (r) { setTimeout(r, 3000); })]).then(start);
})();
