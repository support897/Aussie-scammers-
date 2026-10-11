// Live story walls. A page can hold several walls; each wall section has
// data-wall="hackett" or data-wall="other", and its form has the matching
// data-wall-form value. All story text is inserted with textContent.
(function () {
  var API = '/api/stories';

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function renderStory(s) {
    var card = el('article', 'wall-story');
    var head = el('p', 'wall-head');
    head.appendChild(el('strong', null, s.name ? s.name : 'Anonymous'));
    if (s.ts) head.appendChild(document.createTextNode(' · ' + new Date(s.ts).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })));
    card.appendChild(head);
    if (s.scammer) card.appendChild(el('p', 'wall-scammer', 'About: ' + s.scammer));
    if (s.whenText) card.appendChild(el('p', 'wall-when', 'When it happened: ' + s.whenText));
    var body = el('div', 'wall-text');
    String(s.text || '').split(/\n+/).forEach(function (para) {
      if (para.trim()) body.appendChild(el('p', null, para));
    });
    card.appendChild(body);
    if (s.image) {
      var fig = el('figure', 'photo');
      var img = document.createElement('img');
      img.src = (s.image.indexOf('http') === 0 || s.image.indexOf('data:') === 0) ? s.image : '/api/image?path=' + encodeURIComponent(s.image);
      img.alt = 'Photo shared with this story';
      img.loading = 'lazy';
      fig.appendChild(img);
      card.appendChild(fig);
    }
    return card;
  }

  function readImage(file) {
    return new Promise(function (resolve) {
      if (!file) return resolve(null);
      var img = new Image();
      var url = URL.createObjectURL(file);
      img.onload = function () {
        var max = 1200;
        var scale = Math.min(1, max / Math.max(img.width, img.height));
        var c = document.createElement('canvas');
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = function () { URL.revokeObjectURL(url); resolve(null); };
      img.src = url;
    });
  }

  document.querySelectorAll('[data-wall]').forEach(function (wall) {
    var category = wall.getAttribute('data-wall');
    var list = wall.querySelector('.wall-list');
    var form = document.querySelector('[data-wall-form="' + category + '"]');

    function load() {
      fetch(API + '?category=' + encodeURIComponent(category))
        .then(function (r) { return r.json(); })
        .then(function (data) {
          list.innerHTML = '';
          var stories = (data && data.stories) || [];
          if (!stories.length) {
            list.appendChild(el('p', 'wall-empty', 'No reader stories here yet. Yours could be the first, and it could protect the next person.'));
            return;
          }
          stories.forEach(function (s) { list.appendChild(renderStory(s)); });
        })
        .catch(function () {
          list.innerHTML = '';
          list.appendChild(el('p', 'wall-empty', 'The stories could not load just now. Please refresh the page.'));
        });
    }

    if (form) {
      var note = form.querySelector('.form-note');
      form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        var btn = form.querySelector('button[type="submit"]');
        var anonBox = form.querySelector('[name="anonymous"]');
        var payload = {
          category: category,
          text: form.querySelector('[name="text"]').value,
          whenText: form.querySelector('[name="whenText"]') ? form.querySelector('[name="whenText"]').value : '',
          anonymous: anonBox ? anonBox.checked : false,
          name: form.querySelector('[name="name"]') ? form.querySelector('[name="name"]').value : '',
          scammer: form.querySelector('[name="scammer"]') ? form.querySelector('[name="scammer"]').value : '',
          website: form.querySelector('[name="website"]') ? form.querySelector('[name="website"]').value : ''
        };
        var fileInput = form.querySelector('[name="photo"]');
        var file = fileInput && fileInput.files ? fileInput.files[0] : null;
        btn.disabled = true;
        if (note) note.textContent = 'Putting your story up now...';
        readImage(file).then(function (dataUrl) {
          payload.imageDataUrl = dataUrl;
          return fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        }).then(function (r) {
          return r.json().then(function (data) { return { ok: r.ok, data: data }; });
        }).then(function (res) {
          btn.disabled = false;
          if (!res.ok) {
            if (note) note.textContent = (res.data && res.data.error) || 'Something went wrong. Please try again.';
            return;
          }
          form.reset();
          if (note) note.textContent = 'Your story is up. Thank you. It will help the next person.';
          load();
        }).catch(function () {
          btn.disabled = false;
          if (note) note.textContent = 'Something went wrong. Please try again.';
        });
      });
    }

    load();
  });
})();
