/* ==========================================================================
   AKA — iOS SAFARI / MOBILE BEHAVIOUR FIXES
   --------------------------------------------------------------------------
   Loaded with `defer` on every page.

   Handles:
   1. Inline video playback
   2. Back/forward button (bfcache) restoration
   3. iOS autoplay / Low Power Mode recovery
   4. Home intro animation safety
   5. GSAP ScrollTrigger mobile resize behaviour
   6. Touch video thumbnails / previews

   Desktop behaviour is unchanged.
   ========================================================================== */

(function () {
  "use strict";


  /* ==========================================================================
     HELPERS
  ========================================================================== */

  var mq = function (q) {
    return !!(window.matchMedia && window.matchMedia(q).matches);
  };

  var isIOS =
    (window.CSS &&
      CSS.supports &&
      CSS.supports("-webkit-touch-callout", "none")) ||
    /iP(hone|od|ad)/.test(navigator.platform) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  var isTouch =
    mq("(hover: none) and (pointer: coarse)") || isIOS;


  /*
     Safely call video.play().

     iOS may reject play() when autoplay is blocked. That is expected, so
     don't throw an error that stops the rest of this file.
  */
  function safePlay(video) {
    if (!video) return null;

    try {
      var p = video.play();

      if (p && typeof p.catch === "function") {
        p.catch(function () {
          /*
             Autoplay blocked.

             This is intentionally silent. The video can be retried after
             a user interaction.
          */
        });
      }

      return p;
    } catch (e) {
      return null;
    }
  }


  /*
     Should this decorative video stay still? Set by site.js:
       html.bg-paused     — visitor pressed the background pause button
       html.reduce-motion — visitor's "reduce motion" setting is on
       data-offscreen="1" — the Home hero has been scrolled out of view
  */
  function keepStill(video) {
    var root = document.documentElement;
    if (video.classList.contains("bg-videos") && root.classList.contains("bg-paused")) return true;
    if (video.classList.contains("hero__video") && root.classList.contains("reduce-motion")) return true;
    if (video.getAttribute("data-offscreen") === "1") return true;
    return false;
  }


  /* ==========================================================================
     GLOBAL VIDEO STATE
  ========================================================================== */

  var introVideo = document.getElementById("introVideo");

  /*
     If there is no intro video, ambient videos are immediately allowed
     to play.
  */
  var introDone = !introVideo;

  /*
     Becomes true after the user interacts with the page.

     This is important for iOS Low Power Mode / autoplay restrictions.
  */
  var userInteracted = false;


  /* ==========================================================================
     1. INLINE PLAYBACK
     --------------------------------------------------------------------------
     Without playsinline, iPhone Safari may open videos in its fullscreen
     player.

     Also applies to videos created/modified by scripts.
  ========================================================================== */

 function makeInline(video) {
    if (!video) return;

    /*
       Decorative videos (background, hero, intro, cards) never show controls.
       Videos that should keep their play/pause/volume bar — like the main
       player on project — opt out with data-keep-controls.
    */
    if (!video.hasAttribute("data-keep-controls")) {
      video.controls = false;
      video.removeAttribute("controls");
    }

    video.playsInline = true;

    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
}

  document.querySelectorAll("video").forEach(makeInline);


  /* ==========================================================================
     2. AMBIENT VIDEO RESUME
     --------------------------------------------------------------------------
     Used after:
     - bfcache restoration
     - intro video completion
     - first user interaction
     ========================================================================== */

  function resumeAmbientVideos() {
    /*
       Ambient videos on Home wait until the intro is finished.
    */
    if (!introDone) return;

    document
      .querySelectorAll("video.bg-videos, video.hero__video")
      .forEach(function (video) {

        if (!video.paused) return;
        if (keepStill(video)) return;

        /*
           Make absolutely sure the video remains muted/inline before retrying
           playback. This is important for iOS autoplay.
        */
        video.muted = true;
        video.playsInline = true;

        makeInline(video);

        safePlay(video);
      });
  }


  /* ==========================================================================
     3. iOS LOW POWER MODE / AUTOPLAY RECOVERY
     --------------------------------------------------------------------------
     iOS may block autoplay.

     A user interaction provides a valid opportunity to call video.play().

     We don't try to hide Apple's native play UI. Instead, we make the video
     actually start when iOS permits it.
  ========================================================================== */

  function handleUserInteraction() {

    userInteracted = true;

    /*
       If there is no intro, or the intro has already finished, immediately
       retry ambient videos.
    */
    if (introDone) {
      resumeAmbientVideos();
    }
  }

  if (isTouch) {

    /*
       touchend covers normal iPhone/iPad interaction.
    */
    document.addEventListener(
      "touchend",
      handleUserInteraction,
      {
        passive: true
      }
    );

    /*
       click provides a fallback for accessibility and non-touch activation.
    */
    document.addEventListener(
      "click",
      handleUserInteraction,
      {
        passive: true
      }
    );
  }


  /* ==========================================================================
     4. BACK / FORWARD BUTTON — BFCache
     --------------------------------------------------------------------------
     Safari can restore a page exactly as it was when leaving it.

     If the page was restored from bfcache:
     - remove/fade the transition curtain
     - retry ambient videos
  ========================================================================== */

  window.addEventListener("pageshow", function (e) {

    if (!e.persisted) return;

    var curtain = document.getElementById("curtain");

    if (curtain) {

      curtain.style.transition = "none";
      curtain.style.opacity = "1";

      requestAnimationFrame(function () {

        requestAnimationFrame(function () {

          curtain.style.transition = "opacity 0.35s ease";
          curtain.style.opacity = "0";

        });

      });
    }

    /*
       If Safari restored the page with videos paused, retry them.

       resumeAmbientVideos() itself checks introDone.
    */
    resumeAmbientVideos();
  });


  /* ==========================================================================
     5. HOME — INTRO ANIMATION SAFETY NET
     --------------------------------------------------------------------------
     The Home page waits for the intro video to fire "ended".

     iOS can fail to play the intro because of:
     - autoplay restrictions
     - unsupported video format
     - network failure
     - stalled download
     - Low Power Mode

     This section ensures the page never stays permanently locked.
  ========================================================================== */

  if (introVideo && isTouch) {

    var finished = false;

    var heroVideo =
      document.querySelector("#heroPin .hero__video");


    /* ------------------------------------------------------------------------
       INTRO FINISHED NORMALLY
    ------------------------------------------------------------------------ */

    introVideo.addEventListener("ended", function () {

      if (finished) return;

      finished = true;
      introDone = true;


      /*
         If the user already interacted with the page while the intro was
         playing, iOS now has permission to retry the ambient video.
      */
      if (userInteracted) {
        resumeAmbientVideos();
      }


      /*
         Give the hero video a chance to become visible.

         This also handles the case where the hero video was blocked by
         autoplay and will only start after a later user interaction.
      */
      setTimeout(function () {

        if (!heroVideo || !heroVideo.paused) return;

        if (window.gsap) {

          gsap.to(heroVideo, {
            opacity: 1,
            duration: 0.5,
            ease: "power2.out"
          });

          gsap.to(introVideo, {
            opacity: 0,
            duration: 0.5,
            ease: "power2.out"
          });

        }

      }, 900);

    });


    /* ------------------------------------------------------------------------
       FORCE INTRO COMPLETION
       ------------------------------------------------------------------------ */

    function finishIntro() {

      if (finished) return;

      finished = true;
      introDone = true;

      /*
         Don't manually invoke the original ended handlers with a synthetic
         event unless necessary. Dispatching "ended" keeps existing page
         behaviour intact.
      */
      introVideo.dispatchEvent(
        new Event("ended")
      );
    }


    /* ------------------------------------------------------------------------
       CHECK VIDEO FORMATS
       ------------------------------------------------------------------------ */

    var sources = Array.prototype.slice.call(
      introVideo.querySelectorAll("source")
    );

    var playable = sources.some(function (source) {

      var type = source.getAttribute("type");

      return (
        !type ||
        introVideo.canPlayType(type) !== ""
      );

    });


    /*
       No playable format at all.
    */
    if (sources.length && !playable) {
      finishIntro();
    }


    /* ------------------------------------------------------------------------
       VIDEO ERRORS
       ------------------------------------------------------------------------ */

    introVideo.addEventListener(
      "error",
      finishIntro
    );

    if (sources.length) {

      sources[sources.length - 1].addEventListener(
        "error",
        finishIntro
      );

    }


    /* ------------------------------------------------------------------------
       BACKGROUND VIDEO PERFORMANCE
       ------------------------------------------------------------------------
       While the intro is playing, the background video is completely hidden.

       Pause it so iOS doesn't waste decoder resources.
    ------------------------------------------------------------------------ */

    var bgVideo =
      document.querySelector("video.bg-videos");

    if (bgVideo) {

      bgVideo.pause();

      /*
         Prevent the background video from starting while the intro is active.
      */
      var holdBg = function () {

        if (!introDone) {
          bgVideo.pause();
        } else {
          bgVideo.removeEventListener(
            "play",
            holdBg
          );
        }

      };

      bgVideo.addEventListener(
        "play",
        holdBg
      );


      /*
         When the intro ends, attempt to start the background video.
      */
      introVideo.addEventListener(
        "ended",
        function () {

          bgVideo.muted = true;
          bgVideo.playsInline = true;

          makeInline(bgVideo);

          if (!keepStill(bgVideo)) safePlay(bgVideo);

        }
      );

    }


    /* ------------------------------------------------------------------------
       INITIAL INTRO PLAY ATTEMPT
       ------------------------------------------------------------------------
       Give Safari a little time to initialise the video.
    ------------------------------------------------------------------------ */

    setTimeout(function () {

      if (finished) return;

      if (
        introVideo.paused &&
        introVideo.currentTime < 0.1
      ) {

        var p = introVideo.play();

        if (p && typeof p.catch === "function") {

          p.catch(function () {

            /*
               Autoplay was blocked.

               IMPORTANT:
               Don't immediately finish the intro just because autoplay
               was rejected.

               The user may interact with the page shortly afterwards.
            */

          });

        }

      }

    }, 2500);


    /* ------------------------------------------------------------------------
       INTRO HARD CEILING
       ------------------------------------------------------------------------
       Never allow the page to remain locked indefinitely.
    ------------------------------------------------------------------------ */

    function setIntroCeiling() {

      if (finished) return;

      var duration = introVideo.duration;

      var ms =
        isFinite(duration) && duration > 0
          ? duration * 1000 + 4000
          : 12000;

      setTimeout(function () {

        if (!finished) {
          finishIntro();
        }

      }, ms);

    }


    if (introVideo.readyState >= 1) {

      setIntroCeiling();

    } else {

      introVideo.addEventListener(
        "loadedmetadata",
        setIntroCeiling,
        {
          once: true
        }
      );

      /*
         Absolute fallback.
      */
      setTimeout(function () {

        if (!finished) {
          finishIntro();
        }

      }, 15000);

    }


    /* ------------------------------------------------------------------------
       HERO VIDEO STARTED
       ------------------------------------------------------------------------
       If the hero video only starts after the user's first interaction,
       reveal it here.
    ------------------------------------------------------------------------ */

    if (heroVideo) {

      makeInline(heroVideo);

      heroVideo.addEventListener(
        "playing",
        function () {

          if (!introDone || !window.gsap) return;

          var opacity =
            parseFloat(
              getComputedStyle(heroVideo).opacity
            );

          if (opacity < 1) {

            gsap.to(heroVideo, {
              opacity: 1,
              duration: 0.5,
              ease: "power2.out"
            });

            gsap.to(introVideo, {
              opacity: 0,
              duration: 0.5,
              ease: "power2.out"
            });

          }

        }
      );

    }

  }


  /* ==========================================================================
     6. HOME — GSAP SCROLLTRIGGER
     --------------------------------------------------------------------------
     Prevent Safari's browser toolbar resizing the viewport from constantly
     recalculating the pinned hero.
  ========================================================================== */

  if (
    isTouch &&
    window.ScrollTrigger &&
    typeof ScrollTrigger.config === "function"
  ) {

    ScrollTrigger.config({
      ignoreMobileResize: true
    });

  }


  /* ==========================================================================
     6b. BACKGROUND VIDEO — START AFTER THE PAGE IS VISIBLE
     --------------------------------------------------------------------------
     The moving background (video.bg-videos[data-deferred]) has no autoplay
     and preload="none" in the HTML, so it doesn't compete with the page's
     content while it loads. Its poster (a still frame of the same pattern)
     shows straight away; the video starts once the page has loaded, or after
     2 seconds at the latest, whichever comes first.
  ========================================================================== */

  var deferredBg = document.querySelectorAll("video.bg-videos[data-deferred]");
  var bgStarted = false;

  function startBackgroundVideos() {
    if (bgStarted) return;
    bgStarted = true;

    deferredBg.forEach(function (video) {
      video.muted = true;
      video.preload = "auto";
      makeInline(video);
      if (!keepStill(video)) safePlay(video);
    });
  }

  if (deferredBg.length) {
    if (document.readyState === "complete") {
      startBackgroundVideos();
    } else {
      window.addEventListener("load", startBackgroundVideos, { once: true });
      setTimeout(startBackgroundVideos, 2000);
    }

    /*
       If the first play() was refused (e.g. the page wasn't visible yet),
       try again as soon as it is.
    */
    document.addEventListener("visibilitychange", function () {
      if (!bgStarted || document.hidden) return;
      deferredBg.forEach(function (video) {
        if (video.paused && !keepStill(video)) safePlay(video);
      });
    });
  }


  /* ==========================================================================
     7. TOUCH — VIDEO THUMBNAILS & PREVIEWS
     --------------------------------------------------------------------------
     Card videos:
     - don't preload everything on iOS
     - start playing when sufficiently visible
     - pause/reset when leaving viewport
  ========================================================================== */

  if (
    !isTouch ||
    !("IntersectionObserver" in window)
  ) {
    return;
  }


  var cardVideos =
    Array.prototype.slice.call(
      document.querySelectorAll("video.card_video")
    );


  if (!cardVideos.length) {
    return;
  }


  /* ------------------------------------------------------------------------
     PRIME CARD VIDEO
     ------------------------------------------------------------------------ */

  function prime(video) {

    if (video.__akaPrimed) return;

    video.__akaPrimed = true;

    /*
       Keep iOS from aggressively preloading every card video.
    */
    video.preload = "none";

  }


  /* ------------------------------------------------------------------------
     LOAD / PRIME VIDEOS NEAR VIEWPORT
     ------------------------------------------------------------------------ */

  var primeObserver =
    new IntersectionObserver(
      function (entries) {

        entries.forEach(function (entry) {

          if (!entry.isIntersecting) return;

          prime(entry.target);

          primeObserver.unobserve(
            entry.target
          );

        });

      },
      {
        rootMargin: "300px 0px"
      }
    );


  cardVideos.forEach(function (video) {

    primeObserver.observe(video);

  });


  /* ------------------------------------------------------------------------
     CARD PREVIEWS
     ------------------------------------------------------------------------ */

  var previews =
    cardVideos.filter(function (video) {

      return !!video.closest(
        ".card_media_video"
      );

    });


  if (!previews.length) {
    return;
  }


  var currentlyPlaying = null;


  /* ------------------------------------------------------------------------
     PLAY / PAUSE OBSERVER
     ------------------------------------------------------------------------ */

  var playObserver =
    new IntersectionObserver(
      function (entries) {

        entries.forEach(function (entry) {

          var video = entry.target;


          /* ----------------------------------------------------------------
             ENTERED VIEW
          ---------------------------------------------------------------- */

          if (entry.isIntersecting) {

            /*
               Stop any other card preview.
            */
            if (
              currentlyPlaying &&
              currentlyPlaying !== video
            ) {

              currentlyPlaying.pause();
              currentlyPlaying.currentTime = 0;

            }


            prime(video);

            makeInline(video);

            video.muted = true;


            /*
               Try to play.

               This is allowed to fail on iOS without breaking the page.
            */
            var p = safePlay(video);

            if (p) {
              currentlyPlaying = video;
            }

          }


          /* ----------------------------------------------------------------
             LEFT VIEW
          ---------------------------------------------------------------- */

          else {

            if (!video.paused) {

              video.pause();
              video.currentTime = 0;

            }


            if (currentlyPlaying === video) {
              currentlyPlaying = null;
            }

          }

        });

      },
      {
        threshold: 0.6
      }
    );


  previews.forEach(function (video) {

    playObserver.observe(video);

  });

})();
