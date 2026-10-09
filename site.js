/* One shared script for the whole blog. Plain vanilla JS, nothing external.
   Three small things: a reading-progress line at the top, tap-to-enlarge
   photos, and the Copy link button in the share row. */
(function () {
  "use strict";

  /* Reading progress: the slim peach line grows as you scroll */
  var bar = document.getElementById("progress");
  function setProgress() {
    if (!bar) return;
    var doc = document.documentElement;
    var total = doc.scrollHeight - window.innerHeight;
    var done = window.scrollY || doc.scrollTop || 0;
    var pct = total > 0 ? (done / total) * 100 : 0;
    bar.style.width = pct + "%";
  }
  window.addEventListener("scroll", setProgress, { passive: true });
  window.addEventListener("resize", setProgress);
  setProgress();

  /* Tap / click a photo to see it big; tap anywhere or press Esc to close */
  var overlay = document.createElement("div");
  overlay.className = "lightbox";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-label", "Photo, enlarged");
  var bigImg = document.createElement("img");
  var bigCap = document.createElement("p");
  overlay.appendChild(bigImg);
  overlay.appendChild(bigCap);
  document.body.appendChild(overlay);

  function closePhoto() {
    overlay.classList.remove("open");
    bigImg.removeAttribute("src");
  }
  overlay.addEventListener("click", closePhoto);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closePhoto();
  });

  var photos = document.querySelectorAll(".photo img");
  Array.prototype.forEach.call(photos, function (img) {
    img.setAttribute("tabindex", "0");
    img.setAttribute("title", "Tap to see this photo bigger");
    function openPhoto() {
      bigImg.src = img.currentSrc || img.src;
      bigImg.alt = img.alt || "";
      var fig = img.closest ? img.closest("figure") : null;
      var cap = fig ? fig.querySelector("figcaption") : null;
      bigCap.textContent = cap ? cap.textContent : (img.alt || "");
      overlay.classList.add("open");
    }
    img.addEventListener("click", openPhoto);
    img.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openPhoto();
      }
    });
  });

  /* Copy link button: copies this page's address, then says so */
  var copyEls = document.querySelectorAll(".copy-link");
  Array.prototype.forEach.call(copyEls, function (el) {
    el.addEventListener("click", function () {
      var url = el.getAttribute("data-url") || window.location.href;
      function done() {
        var old = el.textContent;
        el.textContent = "Copied!";
        setTimeout(function () { el.textContent = old; }, 1800);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, function () { fallback(); });
      } else {
        fallback();
      }
      function fallback() {
        var ta = document.createElement("textarea");
        ta.value = url;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); } catch (err) { /* nothing more we can do */ }
        document.body.removeChild(ta);
        done();
      }
    });
  });
})();
