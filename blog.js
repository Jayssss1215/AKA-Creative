/* ==========================================================================
   AKA Motions — BLOG behaviour
   Shared by blog/index.html and every article page in blog/.
     1. Page transitions (black curtain), same timing as the rest of the site
     2. Blog index: category tabs filter the article grid (?category=… in URL)
     3. Article: "On this page" contents built from the article's <h2>s
     4. Article: copy-link share button
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- 1. Page transitions ---------- */
  var curtain = document.getElementById("curtain");

  if (curtain) {
    document.querySelectorAll(".anim").forEach(function (el) {
      el.style.animationPlayState = "paused";
    });

    // A short timer (not requestAnimationFrame) so the reveal also runs if the
    // page loads in a background tab - same approach as the other pages.
    setTimeout(function () {
      curtain.style.transition = "opacity 0.35s ease";
      curtain.style.opacity = "0";
      setTimeout(function () {
        document.querySelectorAll(".anim").forEach(function (el) {
          el.style.animationPlayState = "running";
        });
      }, 250);
    }, 50);

    document.querySelectorAll("a[href]").forEach(function (link) {
      link.addEventListener("click", function (e) {
        var href = link.getAttribute("href");
        // Leave new tabs, external sites, email, in-page jumps and modified clicks alone
        if (
          !href ||
          href.charAt(0) === "#" ||
          link.target === "_blank" ||
          /^(https?:|mailto:|tel:)/i.test(href) ||
          link.hasAttribute("download") ||
          e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0
        ) {
          return;
        }
        e.preventDefault();
        curtain.style.transition = "opacity 0.2s ease";
        curtain.style.opacity = "1";
        setTimeout(function () { window.location.href = href; }, 200);
      });
    });
  }

  /* ---------- 2. Blog index: category filter ---------- */
  var tabs = document.querySelectorAll("[data-filter]");
  var cards = document.querySelectorAll(".bcard[data-category]");
  var empty = document.getElementById("gridEmpty");

  function applyFilter(category, updateUrl) {
    var shown = 0;

    tabs.forEach(function (tab) {
      tab.setAttribute("aria-pressed", tab.getAttribute("data-filter") === category ? "true" : "false");
    });

    cards.forEach(function (card) {
      var match = category === "all" || card.getAttribute("data-category") === category;
      card.hidden = !match;
      if (match) shown++;
    });

    if (empty) empty.hidden = shown !== 0;

    if (updateUrl && window.history && history.replaceState) {
      var url = new URL(window.location.href);
      if (category === "all") url.searchParams.delete("category");
      else url.searchParams.set("category", category);
      history.replaceState(null, "", url.pathname + url.search);
    }
  }

  if (tabs.length && cards.length) {
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        applyFilter(tab.getAttribute("data-filter"), true);
      });
    });

    var initial = new URLSearchParams(window.location.search).get("category");
    var known = Array.prototype.some.call(tabs, function (t) { return t.getAttribute("data-filter") === initial; });
    applyFilter(known ? initial : "all", false);
  }

  /* ---------- 3. Article: contents list ---------- */
  var toc = document.getElementById("toc");
  var headings = document.querySelectorAll(".prose h2[id]");

  if (toc && headings.length) {
    var links = [];

    headings.forEach(function (h) {
      var a = document.createElement("a");
      a.href = "#" + h.id;
      a.textContent = h.textContent;
      toc.appendChild(a);
      links.push(a);
    });

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (l) {
            l.classList.toggle("is-active", l.getAttribute("href") === "#" + entry.target.id);
          });
        });
      }, { rootMargin: "0px 0px -70% 0px" });

      headings.forEach(function (h) { observer.observe(h); });
    }
  } else if (toc) {
    var block = toc.closest(".aside-toc");
    if (block) block.hidden = true;
  }

  /* ---------- 4. Article: copy link ---------- */
  document.querySelectorAll("[data-copy-link]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var url = btn.getAttribute("data-copy-link") || window.location.href;
      var done = function () {
        btn.classList.add("is-copied");
        btn.setAttribute("aria-label", "Link copied");
        setTimeout(function () {
          btn.classList.remove("is-copied");
          btn.setAttribute("aria-label", "Copy link");
        }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, function () { window.prompt("Copy this link:", url); });
      } else {
        window.prompt("Copy this link:", url);
      }
    });
  });
})();
