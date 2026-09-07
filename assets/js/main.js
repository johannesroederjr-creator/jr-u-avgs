/* =============================================================
   Johannes Röder – AVGS-Gründercoach
   main.js – Progressive Enhancement
   -------------------------------------------------------------
   Die Seite ist vollständig ohne JavaScript nutzbar. Dieses
   Skript ergänzt nur Komfort:
   - Burger-Navigation (mobil)
   - Schatten am Header beim Scrollen
   - Scroll-Reveal-Animationen (respektiert prefers-reduced-motion)
   - Hervorhebung des aktiven Navigationspunkts beim Scrollen
   - Origin-Fill-Effekt auf grünen CTA-Buttons (heller Kreis, Farbwechsel)
   - Cookie-Banner mit Google Consent Mode v2; Google Tag Manager nur nach Opt-in
   Es werden keine Tracking-Dienste ohne Einwilligung geladen. Das Kontaktformular wird
   direkt an Formspree übermittelt. Google Tag Manager wird erst nach Opt-in im Cookie-Banner geladen.
   ============================================================= */
(function () {
  'use strict';

  // Signalisiert dem Stylesheet, dass JS aktiv ist. Erst dann
  // werden Reveal-Elemente initial ausgeblendet.
  document.documentElement.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initHeaderState();
    initReveal();
    initScrollSpy();
    initFooterYear();
    initOriginButtons();
    initQuoteExpand();
    initCookieConsent();
  });

  /* ---------------------------------------------------------
     Burger-Navigation
     --------------------------------------------------------- */
  function initNavigation() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('primary-nav');
    if (!toggle || !nav) return;

    function close() {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Menü öffnen');
    }

    function open() {
      nav.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Menü schließen');
    }

    toggle.addEventListener('click', function () {
      if (nav.classList.contains('is-open')) { close(); } else { open(); }
    });

    // Nach Klick auf einen Menüpunkt schließen
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) close();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        close();
        toggle.focus();
      }
    });

    // Beim Wechsel auf Desktop-Breite zurücksetzen
    window.matchMedia('(min-width: 1081px)').addEventListener('change', function (event) {
      if (event.matches) close();
    });
  }

  /* ---------------------------------------------------------
     Header bekommt beim Scrollen eine feine Trennkante
     --------------------------------------------------------- */
  function initHeaderState() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    var ticking = false;
    function update() {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
      ticking = false;
    }
    update();

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
  }

  /* ---------------------------------------------------------
     Scroll-Reveal – dezentes Einfaden beim Scrollen
     --------------------------------------------------------- */
  function initReveal() {
    var items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;

    // Bei reduzierter Bewegung oder fehlender API alles sofort zeigen
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    items.forEach(function (el, index) {
      // Gestaffelte Verzögerung innerhalb einer Gruppe
      var group = el.closest('[data-reveal-group]');
      if (group) {
        var siblings = Array.prototype.slice.call(group.querySelectorAll('[data-reveal]'));
        el.style.setProperty('--reveal-delay', Math.min(siblings.indexOf(el), 5) * 80 + 'ms');
      } else if (el.dataset.reveal === 'delay') {
        el.style.setProperty('--reveal-delay', '120ms');
      }
      observer.observe(el);
      void index;
    });
  }

  /* ---------------------------------------------------------
     Aktiver Navigationspunkt je nach sichtbarer Sektion
     --------------------------------------------------------- */
  function initScrollSpy() {
    var links = Array.prototype.slice.call(
      document.querySelectorAll('.nav__list a[href^="#"], .nav__list a[href*="/#"]')
    );
    if (!links.length || !('IntersectionObserver' in window)) return;

    var map = {};
    links.forEach(function (link) {
      var hash = link.getAttribute('href').split('#')[1];
      if (!hash) return;
      var section = document.getElementById(hash);
      if (section) map[hash] = { link: link, section: section };
    });

    var keys = Object.keys(map);
    if (!keys.length) return;

    var current = null;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        if (current === id) return;
        if (current && map[current]) map[current].link.removeAttribute('aria-current');
        map[id].link.setAttribute('aria-current', 'page');
        current = id;
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    keys.forEach(function (key) { observer.observe(map[key].section); });
  }

  /* ---------------------------------------------------------
     Jahreszahl im Footer aktuell halten
     --------------------------------------------------------- */
  function initFooterYear() {
    var el = document.getElementById('current-year');
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* ---------------------------------------------------------
     Origin-Fill auf grünen Buttons – Kreis vom Zeiger, Text invertiert
     --------------------------------------------------------- */
  function getCoverDiameter(width, height, x, y) {
    return Math.ceil(2 * Math.max(
      Math.hypot(x, y),
      Math.hypot(width - x, y),
      Math.hypot(x, height - y),
      Math.hypot(width - x, height - y)
    ));
  }

  function setButtonOrigin(button, x, y) {
    var rect = button.getBoundingClientRect();
    var size = getCoverDiameter(rect.width, rect.height, x, y);
    button.style.setProperty('--origin-x', x + 'px');
    button.style.setProperty('--origin-y', y + 'px');
    button.style.setProperty('--origin-size', size + 'px');
  }

  function updateOriginFromPointer(button, event) {
    var rect = button.getBoundingClientRect();
    setButtonOrigin(button, event.clientX - rect.left, event.clientY - rect.top);
  }

  function updateOriginFromCenter(button) {
    var rect = button.getBoundingClientRect();
    setButtonOrigin(button, rect.width / 2, rect.height / 2);
  }

  function enhanceOriginButton(button) {
    if (button.classList.contains('btn--origin')) return;

    var fill = document.createElement('span');
    fill.className = 'btn__fill';
    fill.setAttribute('aria-hidden', 'true');

    var label = document.createElement('span');
    label.className = 'btn__label';
    while (button.firstChild) {
      label.appendChild(button.firstChild);
    }

    button.appendChild(fill);
    button.appendChild(label);
    button.classList.add('btn--origin');

    var isDisabled = function () {
      return button.disabled || button.getAttribute('aria-disabled') === 'true';
    };

    var setActive = function (active) {
      button.classList.toggle('is-active', active);
    };

    var setPressed = function (pressed) {
      button.classList.toggle('is-pressed', pressed);
    };

    var remeasure = function () {
      if (!button.classList.contains('is-active')) return;
      var x = parseFloat(button.style.getPropertyValue('--origin-x')) || 0;
      var y = parseFloat(button.style.getPropertyValue('--origin-y')) || 0;
      setButtonOrigin(button, x, y);
    };

    if ('ResizeObserver' in window) {
      var resizeObserver = new ResizeObserver(remeasure);
      resizeObserver.observe(button);
    }

    button.addEventListener('pointerenter', function (event) {
      if (isDisabled()) return;
      updateOriginFromPointer(button, event);
      setActive(true);
    });

    button.addEventListener('pointerleave', function () {
      setActive(false);
      setPressed(false);
    });

    button.addEventListener('pointerdown', function (event) {
      if (isDisabled() || event.button !== 0) return;
      updateOriginFromPointer(button, event);
      setActive(true);
      setPressed(true);
    });

    button.addEventListener('pointerup', function () {
      setPressed(false);
    });

    button.addEventListener('pointercancel', function () {
      setPressed(false);
    });

    button.addEventListener('focus', function (event) {
      if (isDisabled() || event.defaultPrevented) return;
      if (event.target.matches(':focus-visible')) {
        updateOriginFromCenter(button);
        setActive(true);
      }
    });

    button.addEventListener('blur', function () {
      setActive(false);
      setPressed(false);
    });

    button.addEventListener('keydown', function (event) {
      if (isDisabled() || event.repeat) return;
      if (event.key !== ' ' && event.key !== 'Enter') return;
      if (event.key === ' ') event.preventDefault();
      updateOriginFromCenter(button);
      setActive(true);
      setPressed(true);
    });

    button.addEventListener('keyup', function (event) {
      if (event.key !== ' ' && event.key !== 'Enter') return;
      setPressed(false);
      if (!button.matches(':focus-visible')) setActive(false);
    });
  }

  function initOriginButtons() {
    var buttons = document.querySelectorAll('.btn--primary');
    if (!buttons.length) return;
    buttons.forEach(enhanceOriginButton);
  }

  /* ---------------------------------------------------------
     Bewertungen – lange Texte einklappen mit „Weiter lesen“
     --------------------------------------------------------- */
  function initQuoteExpand() {
    var blockquotes = document.querySelectorAll('.quote blockquote');
    if (!blockquotes.length) return;

    blockquotes.forEach(function (blockquote) {
      var paragraph = blockquote.querySelector('p');
      if (!paragraph) return;

      blockquote.classList.add('is-clamped');

      requestAnimationFrame(function () {
        if (paragraph.scrollHeight <= paragraph.clientHeight + 1) {
          blockquote.classList.remove('is-clamped');
          return;
        }

        var toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'quote__toggle';
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = 'Weiter lesen';

        toggle.addEventListener('click', function () {
          var expanded = blockquote.classList.toggle('is-expanded');
          blockquote.classList.toggle('is-clamped', !expanded);
          toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
          toggle.textContent = expanded ? 'Weniger anzeigen' : 'Weiter lesen';
        });

        blockquote.appendChild(toggle);
      });
    });
  }

  /* ---------------------------------------------------------
     Cookie-Einwilligung & Google Tag Manager
     --------------------------------------------------------- */
  function initCookieConsent() {
    var STORAGE_KEY = 'jr_avgs_cookie_consent';
    var CONSENT_VERSION = 1;
    var gtmLoaded = false;
    var bannerEl, modalEl;

    var scriptEl = document.querySelector('script[src*="main.js"]');
    var GTM_ID = scriptEl && scriptEl.getAttribute('data-gtm-id');
    if (GTM_ID) GTM_ID = GTM_ID.trim();

    function getConsent() {
      try {
        var data = localStorage.getItem(STORAGE_KEY);
        if (!data) return null;
        var parsed = JSON.parse(data);
        if (!parsed || parsed.version !== CONSENT_VERSION) return null;
        return parsed;
      } catch (e) {
        return null;
      }
    }

    function saveConsent(consent) {
      try {
        consent.version = CONSENT_VERSION;
        consent.timestamp = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
      } catch (e) { /* silent */ }
    }

    function resetStoredConsent() {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) { /* silent */ }
    }

    function policyUrl() {
      if (scriptEl) {
        var href = scriptEl.getAttribute('data-policy-href');
        if (href) return href;
      }
      return 'cookie-richtlinie.html';
    }

    function updateGoogleConsent(statisticsGranted) {
      if (typeof gtag !== 'function') return;
      gtag('consent', 'update', {
        analytics_storage: statisticsGranted ? 'granted' : 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });
    }

    function loadGtm() {
      if (gtmLoaded || !GTM_ID || GTM_ID.indexOf('GTM-') !== 0) return;
      gtmLoaded = true;
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      var first = document.getElementsByTagName('script')[0];
      var tag = document.createElement('script');
      tag.async = true;
      tag.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(GTM_ID);
      first.parentNode.insertBefore(tag, first);

      if (!document.getElementById('gtm-noscript')) {
        var noscript = document.createElement('noscript');
        noscript.id = 'gtm-noscript';
        var iframe = document.createElement('iframe');
        iframe.src = 'https://www.googletagmanager.com/ns.html?id=' + encodeURIComponent(GTM_ID);
        iframe.height = '0';
        iframe.width = '0';
        iframe.style.display = 'none';
        iframe.style.visibility = 'hidden';
        noscript.appendChild(iframe);
        document.body.insertBefore(noscript, document.body.firstChild);
      }
    }

    function applyStatisticsConsent(granted) {
      updateGoogleConsent(granted);
      if (granted) loadGtm();
    }

    function createBanner() {
      var banner = document.createElement('div');
      banner.className = 'cookie-banner';
      banner.id = 'cookie-banner';
      banner.setAttribute('role', 'dialog');
      banner.setAttribute('aria-label', 'Cookie-Einstellungen');
      banner.innerHTML =
        '<div class="cookie-banner-inner">' +
          '<p class="cookie-banner-text">' +
            'Wir speichern deine Cookie-Einstellungen im Browser. Den Google Tag Manager laden wir ' +
            'nur, wenn du der Kategorie &bdquo;Statistik&ldquo; zustimmst – aktuell ohne Google Analytics. ' +
            '<a href="' + policyUrl() + '">Mehr erfahren</a>' +
          '</p>' +
          '<div class="cookie-banner-actions">' +
            '<button class="cookie-btn cookie-btn-accept" type="button" id="cookie-accept-all">Alle akzeptieren</button>' +
            '<button class="cookie-btn cookie-btn-essential" type="button" id="cookie-essential-only">Nur notwendige</button>' +
            '<button class="cookie-btn cookie-btn-settings" type="button" id="cookie-open-settings">Einstellungen</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(banner);
      return banner;
    }

    function createModal() {
      var overlay = document.createElement('div');
      overlay.className = 'cookie-modal-overlay';
      overlay.id = 'cookie-modal-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', 'Cookie-Einstellungen verwalten');
      overlay.innerHTML =
        '<div class="cookie-modal">' +
          '<h3>Cookie-Einstellungen</h3>' +
          '<p>W&auml;hle aus, welche Cookies du zulassen m&ouml;chtest. Notwendige Cookies sind f&uuml;r den Betrieb der Website erforderlich und k&ouml;nnen nicht deaktiviert werden.</p>' +
          '<div class="cookie-category">' +
            '<div class="cookie-category-header">' +
              '<span class="cookie-category-name">Notwendige Cookies</span>' +
              '<label class="cookie-toggle">' +
                '<input type="checkbox" checked disabled>' +
                '<span class="cookie-toggle-slider"></span>' +
              '</label>' +
            '</div>' +
            '<p class="cookie-category-desc">Speichern deine Cookie-Einstellungen im localStorage deines Browsers. Es werden keine Tracking-Daten erhoben.</p>' +
          '</div>' +
          '<div class="cookie-category">' +
            '<div class="cookie-category-header">' +
              '<span class="cookie-category-name">Statistik (Google Tag Manager)</span>' +
              '<label class="cookie-toggle">' +
                '<input type="checkbox" id="cookie-toggle-statistics">' +
                '<span class="cookie-toggle-slider"></span>' +
              '</label>' +
            '</div>' +
            '<p class="cookie-category-desc">Erlaubt das Laden des Google Tag Managers. Dar&uuml;ber k&ouml;nnen sp&auml;ter Mess-Tags (z.&nbsp;B. Google Analytics) erg&auml;nzt werden. Ohne diese Zustimmung wird kein Tag Manager geladen.</p>' +
          '</div>' +
          '<div class="cookie-modal-actions">' +
            '<button class="cookie-btn cookie-btn-essential" type="button" id="cookie-modal-cancel">Abbrechen</button>' +
            '<button class="cookie-btn cookie-btn-accept" type="button" id="cookie-modal-save">Auswahl speichern</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(overlay);

      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) hideModal();
      });

      return overlay;
    }

    function showBanner() {
      if (!bannerEl) bannerEl = createBanner();
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          bannerEl.classList.add('visible');
        });
      });
      bindBannerEvents();
    }

    function hideBanner() {
      if (bannerEl) bannerEl.classList.remove('visible');
    }

    function showModal() {
      if (!modalEl) modalEl = createModal();
      bindModalEvents();
      var consent = getConsent();
      var toggle = document.getElementById('cookie-toggle-statistics');
      if (toggle) {
        toggle.checked = consent ? !!consent.statistics : false;
      }
      modalEl.classList.add('visible');
    }

    function hideModal() {
      if (modalEl) modalEl.classList.remove('visible');
    }

    function applyConsent(consent) {
      saveConsent(consent);
      applyStatisticsConsent(!!consent.statistics);
      hideBanner();
      hideModal();
      window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: consent }));
    }

    function bindBannerEvents() {
      var acceptBtn = document.getElementById('cookie-accept-all');
      var essentialBtn = document.getElementById('cookie-essential-only');
      var settingsBtn = document.getElementById('cookie-open-settings');

      if (acceptBtn) {
        acceptBtn.onclick = function () {
          applyConsent({ essential: true, statistics: true });
        };
      }
      if (essentialBtn) {
        essentialBtn.onclick = function () {
          applyConsent({ essential: true, statistics: false });
        };
      }
      if (settingsBtn) {
        settingsBtn.onclick = function () {
          showModal();
        };
      }
    }

    function bindModalEvents() {
      var saveBtn = document.getElementById('cookie-modal-save');
      var cancelBtn = document.getElementById('cookie-modal-cancel');

      if (saveBtn) {
        saveBtn.onclick = function () {
          var toggle = document.getElementById('cookie-toggle-statistics');
          applyConsent({ essential: true, statistics: toggle ? toggle.checked : false });
        };
      }
      if (cancelBtn) {
        cancelBtn.onclick = function () {
          hideModal();
        };
      }
    }

    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-cookie-settings]');
      if (!trigger) return;
      e.preventDefault();
      showModal();
    });

    window.CookieConsent = {
      getConsent: getConsent,
      showBanner: showBanner,
      showSettings: showModal,
      hasStatistics: function () {
        var c = getConsent();
        return !!(c && c.statistics === true);
      },
      acceptStatistics: function () {
        var c = getConsent() || { essential: true, statistics: false };
        c.essential = true;
        c.statistics = true;
        applyConsent(c);
      }
    };

    if (/[?&]cookies=reset(?:&|$)/.test(window.location.search)) {
      resetStoredConsent();
    }

    var consent = getConsent();
    if (consent) {
      applyStatisticsConsent(!!consent.statistics);
    } else {
      showBanner();
    }
  }
})();
