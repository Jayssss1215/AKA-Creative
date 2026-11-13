/* ==========================================================================
   AKA Motions — shared site behaviour (loaded with `defer` on every page)
     1. Menu: one accessible controller for the Home drawer and the phone (☰)
        menu on every other page (keyboard, focus, Escape, screen readers)
     2. Background-animation pause button (remembered across pages)
     3. Reduced motion: honours the visitor's "reduce motion" setting
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

  function store(key, value) {
    try {
      if (value === undefined) return window.localStorage.getItem(key);
      if (value === null) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, value);
    } catch (e) { /* private mode etc. — just don't remember */ }
    return null;
  }

  function safePlay(video) {
    try {
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
    } catch (e) {}
  }

  /* ======================================================================
     1. MENU
     ====================================================================== */
  function makeMenu(button, drawer, backdrop, closeBtn) {
    function focusables() {
      var items = [button];
      drawer.querySelectorAll("a[href], button").forEach(function (el) {
        if (el.offsetParent !== null) items.push(el); // skip links inside a collapsed sub-list
      });
      return items;
    }

    function isOpen() { return drawer.classList.contains("is-open"); }

    function setOpen(open, restoreFocus) {
      drawer.classList.toggle("is-open", open);
      if (backdrop) backdrop.classList.toggle("is-open", open);
      button.setAttribute("aria-expanded", open ? "true" : "false");
      button.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      root.classList.toggle("menu-open", open);

      if (open) {
        drawer.removeAttribute("inert");
        drawer.removeAttribute("aria-hidden");
        var first = drawer.querySelector("a[href]");
        if (first) setTimeout(function () { first.focus(); }, 50);
      } else {
        drawer.setAttribute("inert", "");
        drawer.setAttribute("aria-hidden", "true");
        if (restoreFocus) button.focus();
      }
    }

    // Closed on load: links can't be tabbed to or read out
    setOpen(false, false);

    button.addEventListener("click", function () { setOpen(!isOpen(), true); });
    if (backdrop) backdrop.addEventListener("click", function () { setOpen(false, true); });
    if (closeBtn) closeBtn.addEventListener("click", function () { setOpen(false, true); });

    drawer.querySelectorAll("a[href]").forEach(function (a) {
      a.addEventListener("click", function () { setOpen(false, false); });
    });

    document.addEventListener("keydown", function (e) {
      if (!isOpen()) return;

      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false, true);
        return;
      }

      // Keep Tab / Shift+Tab inside the open menu
      if (e.key === "Tab") {
        var items = focusables();
        var first = items[0];
        var last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (items.indexOf(document.activeElement) === -1) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    return { setOpen: setOpen, isOpen: isOpen };
  }

  // Home page: it already has its own ☰ button and drawer
  var homeButton = document.getElementById("navBurger");
  var homeDrawer = document.getElementById("navDrawer");

  if (homeButton && homeDrawer) {
    homeDrawer.setAttribute("aria-label", "Menu");
    homeDrawer.id = homeDrawer.id || "navDrawer";
    homeButton.setAttribute("aria-controls", homeDrawer.id);
    makeMenu(homeButton, homeDrawer, document.getElementById("navBackdrop"), null);
  } else {
    // Every other page: build a phone menu from the existing header links
    var header = document.querySelector("header.nav");
    var links = header ? header.querySelector(".nav__links") : null;

    if (header && links) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "mnav-toggle";
      button.setAttribute("aria-controls", "siteMenu");
      button.innerHTML = "<span></span><span></span><span></span>";
      header.appendChild(button);

      var backdrop = document.createElement("div");
      backdrop.className = "mnav-backdrop";

      var drawer = document.createElement("nav");
      drawer.className = "mnav-drawer";
      drawer.id = "siteMenu";
      drawer.setAttribute("aria-label", "Menu");

      var close = document.createElement("button");
      close.type = "button";
      close.className = "mnav-close";
      close.setAttribute("aria-label", "Close menu");
      close.innerHTML = "&times;";
      drawer.appendChild(close);

      Array.prototype.forEach.call(links.children, function (el) {
        // Portfolio dropdown: becomes an inline, expandable sub-list in the phone menu
        if (el.classList.contains("nav-dd")) {
          var ddBtn = el.querySelector(".nav-dd__btn");
          var group = document.createElement("div");
          group.className = "mnav-group";
          var subBtn = document.createElement("button");
          subBtn.type = "button";
          subBtn.className = "mnav-sub-toggle" + (ddBtn && ddBtn.classList.contains("active") ? " is-current" : "");
          subBtn.setAttribute("aria-expanded", "false");
          subBtn.setAttribute("aria-controls", "mnavPortfolio");
          subBtn.innerHTML = ddBtn ? ddBtn.innerHTML : "Portfolio";
          var sub = document.createElement("div");
          sub.className = "mnav-sub";
          sub.id = "mnavPortfolio";
          sub.hidden = true;
          el.querySelectorAll(".nav-dd__panel a[href]").forEach(function (a) {
            var c = a.cloneNode(true);
            c.removeAttribute("class");
            c.removeAttribute("style");
            sub.appendChild(c);
          });
          group.appendChild(subBtn);
          group.appendChild(sub);
          drawer.appendChild(group);
          return;
        }
        if (el.matches && el.matches("a[href]")) {
          var copy = el.cloneNode(true);
          copy.removeAttribute("class");
          if (el.classList.contains("active")) copy.setAttribute("aria-current", "page");
          drawer.appendChild(copy);
        }
      });

      document.body.appendChild(backdrop);
      document.body.appendChild(drawer);
      root.classList.add("has-mnav");

      var menu = makeMenu(button, drawer, backdrop, close);

      // Close it if the window is widened past phone size
      var wide = window.matchMedia("(min-width: 768px)");
      var onWide = function () { if (wide.matches && menu.isOpen()) menu.setOpen(false, false); };
      if (wide.addEventListener) wide.addEventListener("change", onWide);
      else if (wide.addListener) wide.addListener(onWide);
    }
  }

  /* ======================================================================
     1b. PORTFOLIO DROPDOWN (desktop header) + expandable sub-list (phone menus)
     ====================================================================== */
  // Phone menus (inner pages and the Home drawer): tap "Portfolio" to expand
  document.querySelectorAll(".mnav-sub-toggle").forEach(function (btn) {
    var sub = document.getElementById(btn.getAttribute("aria-controls"));
    if (!sub) return;
    // Look like the menu's other links, whatever the page's menu style is
    var nav = btn.closest("nav");
    var ref = nav ? nav.querySelector(":scope > a[href]") : null;
    if (ref) {
      var cs = window.getComputedStyle(ref);
      ["fontFamily", "fontSize", "fontWeight", "letterSpacing", "textTransform", "color",
        "paddingTop", "paddingBottom", "borderBottomWidth", "borderBottomStyle", "borderBottomColor"]
        .forEach(function (p) { btn.style[p] = cs[p]; });
    }
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      sub.hidden = !open;
    });
  });

  // Desktop header dropdown
  document.querySelectorAll(".nav-dd").forEach(function (dd) {
    var btn = dd.querySelector(".nav-dd__btn");
    var panel = dd.querySelector(".nav-dd__panel");
    if (!btn || !panel) return;
    var navLinks = dd.parentElement;
    var hoverQuery = window.matchMedia ? window.matchMedia("(hover: hover) and (pointer: fine)") : null;
    var leaveTimer = null;
    var pinned = false;

    // Match the nav links' type exactly (each page styles its nav a little differently)
    function syncLook() {
      var ref = null;
      Array.prototype.some.call(navLinks.querySelectorAll(":scope > a[href]"), function (a) {
        if (!a.classList.contains("active")) { ref = a; return true; }
        return false;
      });
      if (!ref) return;
      var cs = window.getComputedStyle(ref);
      [btn].concat(Array.prototype.slice.call(panel.querySelectorAll("a"))).forEach(function (el) {
        el.style.fontFamily = cs.fontFamily;
        el.style.fontSize = cs.fontSize;
        el.style.fontWeight = cs.fontWeight;
        el.style.letterSpacing = cs.letterSpacing;
        el.style.textTransform = cs.textTransform;
        el.style.setProperty("--dd-color", cs.color);
      });
    }
    syncLook();
    window.addEventListener("resize", syncLook);

    function isOpen() { return dd.classList.contains("is-open"); }
    function setOpen(open) {
      clearTimeout(leaveTimer);
      dd.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      if (!open) pinned = false;
    }
    setOpen(false);

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      if (isOpen() && pinned) { setOpen(false); return; }
      setOpen(true);
      pinned = true;
    });

    dd.addEventListener("mouseenter", function () {
      if (hoverQuery && !hoverQuery.matches) return;
      clearTimeout(leaveTimer);
      if (!isOpen()) setOpen(true);
    });
    dd.addEventListener("mouseleave", function () {
      if (hoverQuery && !hoverQuery.matches) return;
      clearTimeout(leaveTimer);
      leaveTimer = setTimeout(function () { setOpen(false); }, 150);
    });

    document.addEventListener("click", function (e) {
      if (isOpen() && !dd.contains(e.target)) setOpen(false);
    });
    dd.addEventListener("focusout", function (e) {
      if (isOpen() && e.relatedTarget && !dd.contains(e.relatedTarget)) setOpen(false);
    });
    dd.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen()) {
        e.preventDefault();
        setOpen(false);
        btn.focus();
      }
    });
  });

  /* ======================================================================
     2 + 3. BACKGROUND ANIMATION: pause button + reduced motion
     ====================================================================== */
  var bgVideos = document.querySelectorAll("video.bg-videos");
  var heroVideos = document.querySelectorAll("video.hero__video");

  function reduced() { return !!(reduceQuery && reduceQuery.matches); }

  // Saved choice wins; otherwise "reduce motion" visitors start paused
  function bgShouldPause() {
    var saved = store("aka-bg-paused");
    if (saved === "1") return true;
    if (saved === "0") return false;
    return reduced();
  }

  // fromUser: only a deliberate click starts the video here; otherwise ios.js
  // starts it after the page has loaded, as before.
  function applyBg(paused, fromUser) {
    root.classList.toggle("bg-paused", paused);
    bgVideos.forEach(function (v) {
      if (paused) v.pause();
      else if (fromUser) { v.preload = "auto"; safePlay(v); }
    });
    if (toggle) {
      toggle.setAttribute("aria-pressed", paused ? "true" : "false");
      toggle.setAttribute("aria-label", paused ? "Play background animation" : "Pause background animation");
      toggle.title = paused ? "Play background animation" : "Pause background animation";
    }
  }

  var toggle = null;

  if (bgVideos.length) {
    toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "motion-toggle";
    toggle.innerHTML =
      '<svg class="icon-pause" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>' +
      '<svg class="icon-play" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z"/></svg>';
    document.body.appendChild(toggle);

    toggle.addEventListener("click", function () {
      var nowPaused = !root.classList.contains("bg-paused");
      store("aka-bg-paused", nowPaused ? "1" : "0");
      applyBg(nowPaused, true);
    });

    applyBg(bgShouldPause(), false);

    // Other scripts may try to (re)start the background — keep it paused if chosen
    bgVideos.forEach(function (v) {
      v.addEventListener("play", function () {
        if (root.classList.contains("bg-paused")) v.pause();
      });
    });
  }

  // Reduced motion: hero films stay on their still image (visitors can still
  // watch every project film with its own play button)
  function applyReduced() {
    var on = reduced();
    root.classList.toggle("reduce-motion", on);
    if (on) {
      heroVideos.forEach(function (v) {
        v.removeAttribute("autoplay");
        v.pause();
      });
    }
    if (bgVideos.length && store("aka-bg-paused") === null) applyBg(bgShouldPause(), false);
  }

  applyReduced();

  heroVideos.forEach(function (v) {
    v.addEventListener("play", function () {
      if (root.classList.contains("reduce-motion")) v.pause();
    });
  });

  if (reduceQuery) {
    if (reduceQuery.addEventListener) reduceQuery.addEventListener("change", applyReduced);
    else if (reduceQuery.addListener) reduceQuery.addListener(applyReduced);
  }

  /* ======================================================================
     4. KEEP LONG WORDS IN HEADINGS WHOLE
     On narrow screens a long single word (e.g. "Klangkustenler") can be wider
     than the space available, and the browser then breaks it mid-word.
     If that happens, shrink just that heading until its widest word fits.
     Never enlarges anything; does nothing when everything already fits.
     ====================================================================== */
  var FIT_SELECTOR = "h1, h2, h3, .hero__title, .display";

  // Width of the widest word in an element (summing the pieces of a word that
  // has already been broken across lines)
  function widestWord(el) {
    var widest = 0;
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var node;
    while ((node = walker.nextNode())) {
      var re = /\S+/g;
      var m;
      while ((m = re.exec(node.textContent))) {
        var range = document.createRange();
        range.setStart(node, m.index);
        range.setEnd(node, m.index + m[0].length);
        var w = 0;
        var rects = range.getClientRects();
        for (var i = 0; i < rects.length; i++) w += rects[i].width;
        if (w > widest) widest = w;
      }
    }
    return widest;
  }

  // Space the heading actually has (a heading inside a flex row can use the whole row)
  function availableWidth(el) {
    var parent = el.parentElement;
    var box = el;
    if (parent && window.getComputedStyle(parent).display.indexOf("flex") !== -1) box = parent;
    var cs = window.getComputedStyle(box);
    return box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  }

  function fitHeadings() {
    document.querySelectorAll(FIT_SELECTOR).forEach(function (el) {
      if (el.closest(".mnav-drawer, #navDrawer, .visually-hidden")) return;
      if (el.hasAttribute("data-fitted")) {
        el.style.fontSize = "";
        el.removeAttribute("data-fitted");
      }
      var avail = availableWidth(el);
      if (!avail || el.offsetParent === null) return;
      var widest = widestWord(el);
      if (widest > avail + 0.5) {
        var size = parseFloat(window.getComputedStyle(el).fontSize);
        el.style.fontSize = Math.max(14, Math.floor(size * (avail / widest) * 0.98 * 10) / 10) + "px";
        el.setAttribute("data-fitted", "");
      }
    });
  }

  var fitTimer = null;
  var lastFitWidth = window.innerWidth;

  function scheduleFit() {
    clearTimeout(fitTimer);
    fitTimer = setTimeout(fitHeadings, 100);
  }

  fitHeadings();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitHeadings);
  window.addEventListener("load", fitHeadings);
  window.addEventListener("resize", function () {
    // Only width matters (phone toolbars change the height while scrolling)
    if (window.innerWidth === lastFitWidth) return;
    lastFitWidth = window.innerWidth;
    scheduleFit();
  }, { passive: true });
})();
