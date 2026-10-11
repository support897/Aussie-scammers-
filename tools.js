// Home tools: Check a name, and Tick what happened to you.
(function () {
  "use strict";

  /* ---------- Check a name ---------- */
  var NAMES = [
    { name: 'Valeria Hackett', note: 'The name on her Facebook profile and Messenger chats.', target: '#names', link: 'See the photos' },
    { name: 'Valeria Hacket', note: 'The spelling used most in the warning post of 30 June 2025.', target: '#names', link: 'See the photos' },
    { name: 'Valeria Hojem', note: 'Named in the rental report.', target: '#story-5', link: 'Go to Story 5' },
    { name: 'Valery Hojem', note: 'The name on the RightPaw profile.', target: '#story-6', link: 'Go to Story 6' },
    { name: 'Valeria Ramos', note: 'Another name she has used.', target: '#names', link: 'See the names page list' },
    { name: 'Val Ramos', note: 'The name on the Facebook profile shared with this page in October 2026.', target: '#names', link: 'See the photos' },
    { name: 'Colchon Hackett', note: 'The name the mattress seller had saved in his phone.', target: '#story-3', link: 'Go to Story 3' },
    { name: 'Zaira Gallardo', note: 'Named with Valeria Hojem in the rental report.', target: '#story-5', link: 'Go to Story 5' },
    { name: 'Joshua Hacket', note: "Valeria's husband, named in Story 1 and on the QCAT paper.", target: '#story-1', link: 'Go to Story 1' },
    { name: 'Joshua Hackett', note: "Valeria's husband, named in Story 1 and on the QCAT paper.", target: '#story-1', link: 'Go to Story 1' },
    { name: 'Joshua J. Hackett', note: 'The full name on the QCAT paper.', target: '#story-1', link: 'Go to Story 1' }
  ];

  function tokens(s) {
    return s.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean);
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  var input = document.getElementById('nameCheck');
  var answer = document.getElementById('nameAnswer');
  if (input && answer) {
    input.addEventListener('input', function () {
      var q = tokens(input.value);
      answer.innerHTML = '';
      if (!q.length) return;
      var hits = NAMES.filter(function (e) {
        var et = tokens(e.name);
        return q.every(function (t) { return et.indexOf(t) !== -1; });
      });
      if (!hits.length) {
        answer.appendChild(el('p', null, 'That name is not on this page\u2019s list. That does not mean the person is safe. Read the stories, and if this person scammed you, you can name them on the other scammers wall.'));
        var a = el('a', null, 'Go to the other scammers wall');
        a.href = '#other';
        var p = el('p');
        p.appendChild(a);
        answer.appendChild(p);
        return;
      }
      answer.appendChild(el('p', null, 'Yes. This name is on the list:'));
      hits.forEach(function (e) {
        var hit = el('div', 'hit');
        hit.appendChild(el('strong', null, e.name));
        hit.appendChild(el('p', null, e.note));
        var link = el('a', null, e.link);
        link.href = e.target;
        var lp = el('p');
        lp.appendChild(link);
        hit.appendChild(lp);
        answer.appendChild(hit);
      });
    });
  }

  /* ---------- Tick what happened to you ---------- */
  var boxes = document.querySelectorAll('.tick-box');
  var tickAnswer = document.getElementById('tickAnswer');
  if (boxes.length && tickAnswer) {
    boxes.forEach(function (b) {
      b.addEventListener('change', function () {
        var any = Array.prototype.some.call(boxes, function (x) { return x.checked; });
        tickAnswer.hidden = !any;
      });
    });
  }
})();
