// Home page extras: the counting numbers and the View more story breaks.
(function () {
  "use strict";

  function fmt(v, kind) {
    if (kind === 'money') return '$' + v.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (kind === 'money0') return '$' + Math.round(v).toLocaleString('en-AU');
    return Math.round(v).toLocaleString('en-AU');
  }

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function countUp(elm) {
    var target = parseFloat(elm.getAttribute('data-count'));
    var kind = elm.getAttribute('data-kind') || '';
    if (isNaN(target)) return;
    var run = (elm._run || 0) + 1;
    elm._run = run;
    if (reduced) { elm.textContent = fmt(target, kind); return; }
    var start = null;
    var dur = 1600;
    function step(ts) {
      if (elm._run !== run) return;
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      elm.textContent = fmt(target * eased, kind);
      if (p < 1) requestAnimationFrame(step);
      else elm.textContent = fmt(target, kind);
    }
    requestAnimationFrame(step);
  }

  // The numbers climb only while a person is looking at them, and they
  // climb again every time the block comes back into view. Nothing runs
  // on page load alone: the person has to scroll first.
  var stats = document.querySelector('.stats');
  var userScrolled = false;
  var statsInView = false;

  function runStats() {
    if (!stats) return;
    stats.querySelectorAll('[data-count]').forEach(countUp);
  }

  window.addEventListener('scroll', function () {
    if (!userScrolled) {
      userScrolled = true;
      if (statsInView) runStats();
    }
  }, { passive: true });

  if (stats && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          statsInView = true;
          if (userScrolled) runStats();
        } else {
          statsInView = false;
          stats.querySelectorAll('[data-count]').forEach(function (el) { el._run = (el._run || 0) + 1; });
        }
      });
    }, { threshold: 0.35 });
    io.observe(stats);
  } else if (stats) {
    var wasIn = false;
    window.addEventListener('scroll', function () {
      var r = stats.getBoundingClientRect();
      var inView = r.top < window.innerHeight && r.bottom > 0;
      statsInView = inView;
      if (inView && !wasIn && userScrolled) runStats();
      wasIn = inView;
    }, { passive: true });
  }

  // The stories number grows with the live walls
  var storyNum = document.getElementById('statStories');
  if (storyNum) {
    var base = 7;
    Promise.all([
      fetch('/api/stories?category=hackett').then(function (r) { return r.json(); }).catch(function () { return {}; }),
      fetch('/api/stories?category=other').then(function (r) { return r.json(); }).catch(function () { return {}; })
    ]).then(function (res) {
      var extra = 0;
      res.forEach(function (d) { if (d && Array.isArray(d.stories)) extra += d.stories.length; });
      storyNum.setAttribute('data-count', String(base + extra));
      if (statsInView && userScrolled) countUp(storyNum);
    });
  }

})();

  /* View more: the second half of each home story opens in place */
  document.querySelectorAll('.story-full .story-body').forEach(function (body) {
    var blocks = Array.prototype.slice.call(body.children);
    if (blocks.length < 5) return;
    var weights = blocks.map(function (b) {
      return b.tagName === 'FIGURE' ? 400 : Math.max(60, (b.textContent || '').trim().length);
    });
    var total = weights.reduce(function (a, b) { return a + b; }, 0);
    var acc = 0, split = -1;
    for (var i = 0; i < blocks.length; i++) {
      acc += weights[i];
      if (acc >= total / 2) { split = i + 1; break; }
    }
    if (split < 2 || split >= blocks.length) return;
    var wrap = document.createElement('div');
    wrap.className = 'more-wrap';
    wrap.hidden = true;
    blocks.slice(split).forEach(function (b) { wrap.appendChild(b); });
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'more-btn';
    btn.textContent = 'View more';
    btn.addEventListener('click', function () {
      wrap.hidden = false;
      btn.remove();
    });
    body.appendChild(btn);
    body.appendChild(wrap);
  });
