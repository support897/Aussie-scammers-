// "Same happened to me" buttons: one tap per story on this device.
// The count on the button comes from /api/me-too.
(function () {
  var btns = document.querySelectorAll('[data-metoo]');
  if (!btns.length) return;
  var tapped = {};
  try { tapped = JSON.parse(window.localStorage.getItem('metoo') || '{}'); } catch (e) { tapped = {}; }

  function label(btn, count) {
    var base = 'Same happened to me';
    btn.textContent = count > 0 ? base + ' (' + count + ')' : base;
  }
  btns.forEach(function (btn) {
    var id = btn.getAttribute('data-metoo');
    if (tapped[id]) { btn.disabled = true; btn.textContent = 'You tapped: same happened to me'; }
    btn.addEventListener('click', function () {
      if (tapped[id]) return;
      tapped[id] = true;
      try { window.localStorage.setItem('metoo', JSON.stringify(tapped)); } catch (e) {}
      btn.disabled = true;
      btn.textContent = 'You tapped: same happened to me';
      fetch('/api/me-too', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ story: id }) })
        .then(function (r) { return r.json(); })
        .then(function (d) { if (d && typeof d.count === 'number') btn.textContent = 'You tapped: same happened to me (' + d.count + ')'; })
        .catch(function () {});
    });
  });
  fetch('/api/me-too').then(function (r) { return r.json(); }).then(function (d) {
    var counts = (d && d.counts) || {};
    btns.forEach(function (btn) {
      var id = btn.getAttribute('data-metoo');
      if (!tapped[id]) label(btn, counts[id] || 0);
      else if (counts[id]) btn.textContent = 'You tapped: same happened to me (' + counts[id] + ')';
    });
  }).catch(function () {});
})();
