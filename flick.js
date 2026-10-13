/*!
 * Flick.js v1.0.0 — the JavaScript half of Flick (pairs with flick.css)
 * MIT License
 *
 * Zero config: include the script and every fx-* class just works.
 * Optional:   Flick.init({...})  Flick.refresh()  Flick.play(el, 'shake')
 */
(function (global) {
  'use strict';
  if (typeof document === 'undefined') return;

  var doc = document;
  var html = doc.documentElement;
  var VERSION = '1.0.0';

  var cfg = {
    threshold: 0,                    // IntersectionObserver threshold
    rootMargin: '0px 0px -10% 0px',  // trigger a little before the bottom edge
    watch: false                     // true = auto-detect elements added later
  };

  var reduce = !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var raf = global.requestAnimationFrame || function (f) { return setTimeout(function () { f(Date.now()); }, 16); };

  var io = null, mo = null, bound = false, ticking = false, resizeTimer = null;
  var parallax = [], scrollers = [], bars = [];

  // Add the hook class as early as possible so hidden-until-visible CSS applies.
  html.classList.add('fx-js');
  if (reduce) html.classList.add('fx-reduced');

  /* ---------------------------------------------------------------- helpers */
  function qsa(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function all(sel, ctx) {
    ctx = ctx || doc;
    var list = qsa(sel, ctx);
    if (ctx !== doc && ctx.matches && ctx.matches(sel)) list.unshift(ctx);
    return list;
  }
  function has(el, c) { return el.classList.contains(c); }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function num(el, name, def) {
    var n = parseFloat(el.getAttribute('data-fx-' + name));
    return isNaN(n) ? def : n;
  }
  function once(el, key) {
    var s = el.__fx || (el.__fx = {});
    if (s[key]) return false;
    s[key] = true;
    return true;
  }
  function make(tag, cls) { var e = doc.createElement(tag); e.className = cls; return e; }

  /* --------------------------------------------- data-fx-* -> CSS variables */
  function applyVars(el) {
    if (!once(el, 'vars')) return;
    var map = {
      delay: ['--fx-delay', 'ms'],
      duration: ['--fx-duration', 'ms'],
      stagger: ['--fx-stagger', 'ms'],
      distance: ['--fx-distance', 'px']
    };
    Object.keys(map).forEach(function (k) {
      var v = parseFloat(el.getAttribute('data-fx-' + k));
      if (!isNaN(v)) el.style.setProperty(map[k][0], v + map[k][1]);
    });
    var ease = el.getAttribute('data-fx-ease');
    if (ease) el.style.setProperty('--fx-ease', ease);
  }

  /* ------------------------------------------------------------ text split */
  function split(el, mode) {
    var label = el.textContent.trim();
    el.setAttribute('aria-label', label);
    var idx = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = doc.createDocumentFragment();
          n.nodeValue.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(doc.createTextNode(' ')); return; }
            var w = make('span', 'fx-word');
            w.setAttribute('aria-hidden', 'true');
            if (mode === 'words') {
              w.textContent = part;
              w.style.setProperty('--i', idx++);
            } else {
              Array.from(part).forEach(function (ch) {
                var c = make('span', 'fx-char');
                c.textContent = ch;
                c.style.setProperty('--i', idx++);
                w.appendChild(c);
              });
            }
            frag.appendChild(w);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR' && !has(n, 'fx-word')) {
          walk(n);
        }
      });
    })(el);
  }

  /* ------------------------------------------------------------ typewriter */
  function typewriter(el, delay) {
    if (!once(el, 'typed')) return;
    var raw = el.getAttribute('data-fx-words');
    var list = raw ? raw.split('|') : [el.textContent.trim()];
    el.setAttribute('aria-label', list.join(', '));
    if (reduce) { el.textContent = list[0]; return; }

    var speed = num(el, 'speed', 70);
    var back = num(el, 'back-speed', 35);
    var pause = num(el, 'pause', 1600);
    var loopAttr = el.getAttribute('data-fx-loop');
    var loop = loopAttr !== null ? loopAttr !== 'false' : list.length > 1;

    el.textContent = '';
    var node = doc.createTextNode('');
    el.appendChild(node);

    var i = 0, j = 0, deleting = false;
    function tick() {
      var word = list[i];
      if (!deleting) {
        j++;
        node.nodeValue = word.slice(0, j);
        if (j >= word.length) {
          if (!loop && i === list.length - 1) return;
          deleting = true;
          return setTimeout(tick, pause);
        }
        return setTimeout(tick, speed * (0.6 + Math.random() * 0.8));
      }
      j--;
      node.nodeValue = word.slice(0, j);
      if (j <= 0) {
        deleting = false;
        i = (i + 1) % list.length;
        return setTimeout(tick, 350);
      }
      setTimeout(tick, back);
    }
    setTimeout(tick, delay);
  }

  /* -------------------------------------------------------------- scramble */
  function scramble(el, delay) {
    if (!once(el, 'scr') || reduce) return;
    var finalText = el.textContent;
    var dur = num(el, 'duration', 1200);
    var glyphs = '!<>-_\\/[]{}=+*^?#%&';
    var thr = [];
    for (var i = 0; i < finalText.length; i++) thr.push(i / finalText.length * 0.7 + Math.random() * 0.3);
    el.setAttribute('aria-label', finalText);
    var start = performance.now() + delay;
    (function step(now) {
      var p = clamp((now - start) / dur, 0, 1), out = '';
      for (var k = 0; k < finalText.length; k++) {
        var ch = finalText.charAt(k);
        out += (/\s/.test(ch) || p >= thr[k]) ? ch : glyphs.charAt(Math.floor(Math.random() * glyphs.length));
      }
      el.textContent = out;
      if (p < 1) raf(step); else el.textContent = finalText;
    })(performance.now());
  }

  /* --------------------------------------------------------------- counter */
  function count(el, delay) {
    if (!once(el, 'count')) return;
    var raw = el.textContent.trim();
    var m = raw.match(/^([^\d\-.]*)(-?[\d,]*\.?\d+)(.*)$/);
    var toAttr = el.getAttribute('data-fx-to');
    var to = toAttr !== null ? parseFloat(toAttr) : (m ? parseFloat(m[2].replace(/,/g, '')) : 0);
    var pre = el.getAttribute('data-fx-prefix');
    var suf = el.getAttribute('data-fx-suffix');
    if (pre === null) pre = m ? m[1] : '';
    if (suf === null) suf = m ? m[3] : '';
    var from = num(el, 'from', 0);
    var dur = num(el, 'duration', 2000);
    var dec = el.hasAttribute('data-fx-decimals') ? num(el, 'decimals', 0) : (String(to).split('.')[1] || '').length;
    var group = el.getAttribute('data-fx-separator') !== 'false';

    function fmt(v) {
      return pre + v.toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: group }) + suf;
    }
    el.setAttribute('aria-label', fmt(to));
    if (reduce) { el.textContent = fmt(to); return; }

    var start = performance.now() + delay;
    (function step(now) {
      var t = clamp((now - start) / dur, 0, 1);
      var e = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      el.textContent = fmt(from + (to - from) * e);
      if (t < 1) raf(step);
    })(performance.now());
  }

  /* -------------------------------------------------------------- reveal */
  function reveal(el) {
    el.classList.add('fx-visible');
    if (has(el, 'fx-stagger')) {
      Array.prototype.forEach.call(el.children, function (c) { c.classList.add('fx-visible'); });
    }
    var d = num(el, 'delay', 0);
    if (has(el, 'fx-typewriter')) typewriter(el, d);
    if (has(el, 'fx-scramble')) scramble(el, d);
    if (has(el, 'fx-count')) count(el, d);
    try { el.dispatchEvent(new CustomEvent('flick:visible', { bubbles: true })); } catch (e) { /* old browser */ }
  }

  function hide(el) {
    el.classList.remove('fx-visible');
    if (has(el, 'fx-stagger')) {
      Array.prototype.forEach.call(el.children, function (c) { c.classList.remove('fx-visible'); });
    }
  }

  function onIntersect(entries) {
    entries.forEach(function (e) {
      var el = e.target;
      if (e.isIntersecting) {
        reveal(el);
        if (!el.hasAttribute('data-fx-repeat')) io.unobserve(el);
      } else if (el.hasAttribute('data-fx-repeat')) {
        hide(el);
      }
    });
  }

  /* ----------------------------------------------------- scroll / parallax */
  function measure(it) {
    var s = it.el.style;
    var t = s.translate, r = s.rotate, sc = s.scale;
    var target = it.host || it.el;
    if (!it.host) { s.translate = 'none'; s.rotate = 'none'; s.scale = 'none'; }
    var b = target.getBoundingClientRect();
    if (!it.host) { s.translate = t; s.rotate = r; s.scale = sc; }
    it.top = b.top + global.pageYOffset;
    it.h = b.height;
    if (it.bg) {
      var ext = Math.ceil(Math.abs(it.speed) * (global.innerHeight + it.h) / 2) + 2;
      it.el.style.top = -ext + 'px';
      it.el.style.bottom = -ext + 'px';
    }
  }

  function measureAll() { parallax.concat(scrollers).forEach(measure); }

  function update() {
    ticking = false;
    var sy = global.pageYOffset, vh = global.innerHeight;

    if (!reduce) {
      parallax.forEach(function (it) {
        var top = it.top - sy;
        if (top > vh * 1.5 || top + it.h < -vh * 0.5) return;
        var c = top + it.h / 2 - vh / 2;       // px from viewport centre
        var d = -c * it.speed;                 // + speed = slower, - speed = faster
        var x = 0, y = 0;
        if (it.axis === 'x') x = d; else if (it.axis === 'both') { x = d; y = d; } else y = d;
        it.el.style.translate = x.toFixed(1) + 'px ' + y.toFixed(1) + 'px';
        if (it.rotate) it.el.style.rotate = (-c / vh * it.rotate).toFixed(2) + 'deg';
        if (it.scale) it.el.style.scale = (1 + (-c / vh) * it.scale).toFixed(3);
      });

      scrollers.forEach(function (it) {
        var p = clamp((sy + vh - it.top) / (vh + it.h), 0, 1);
        it.el.style.setProperty('--fx-p', p.toFixed(4));
        it.el.style.setProperty('--fx-in', clamp(p * 2, 0, 1).toFixed(4));
        it.el.style.setProperty('--fx-out', clamp(p * 2 - 1, 0, 1).toFixed(4));
      });
    }

    if (bars.length) {
      var max = html.scrollHeight - vh;
      var v = max > 0 ? clamp(sy / max, 0, 1) : 0;
      bars.forEach(function (b) { b.style.setProperty('--fx-scroll', v.toFixed(4)); });
    }
  }

  function onScroll() {
    if (!ticking) { ticking = true; raf(update); }
  }

  /* ---------------------------------------------------------------- setups */
  function setupBg(el) {
    if (!once(el, 'bg')) return;
    var layer = make('div', 'fx-parallax-layer');
    layer.setAttribute('aria-hidden', 'true');
    var src = el.getAttribute('data-fx-src');
    layer.style.backgroundImage = src ? 'url("' + src + '")' : getComputedStyle(el).backgroundImage;
    el.style.backgroundImage = 'none';
    el.insertBefore(layer, el.firstChild);
    parallax.push({ el: layer, host: el, bg: true, speed: num(el, 'speed', 0.3), axis: 'y', rotate: 0, scale: 0 });
  }

  function setupTilt(el) {
    var max = num(el, 'max', 12);
    var scale = num(el, 'scale', 1.03);
    var glare = null;
    if (has(el, 'fx-tilt-glare')) { glare = make('span', 'fx-tilt-glare-el'); el.appendChild(glare); }
    el.addEventListener('mousemove', function (e) {
      var r = el.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.transform = 'perspective(900px) rotateX(' + ((0.5 - y) * max * 2).toFixed(2) + 'deg) rotateY(' + ((x - 0.5) * max * 2).toFixed(2) + 'deg) scale(' + scale + ')';
      if (glare) {
        glare.style.background = 'radial-gradient(circle at ' + (x * 100) + '% ' + (y * 100) + '%, rgba(255,255,255,.38), transparent 60%)';
        glare.style.opacity = 1;
      }
    });
    el.addEventListener('mouseleave', function () {
      el.style.transform = '';
      if (glare) glare.style.opacity = 0;
    });
  }

  function setupMagnetic(el) {
    var strength = num(el, 'strength', 0.35);
    el.addEventListener('mousemove', function (e) {
      var r = el.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width / 2)) * strength;
      var dy = (e.clientY - (r.top + r.height / 2)) * strength;
      el.style.translate = dx.toFixed(1) + 'px ' + dy.toFixed(1) + 'px';
    });
    el.addEventListener('mouseleave', function () { el.style.translate = ''; });
  }

  function setupRipple(el) {
    el.addEventListener('click', function (e) {
      var r = el.getBoundingClientRect();
      var size = Math.max(r.width, r.height) * 2;
      var x = e.clientX, y = e.clientY;
      if (!x && !y) { x = r.left + r.width / 2; y = r.top + r.height / 2; }
      var dot = make('span', 'fx-ripple-dot');
      dot.style.width = dot.style.height = size + 'px';
      dot.style.left = (x - r.left - size / 2) + 'px';
      dot.style.top = (y - r.top - size / 2) + 'px';
      el.appendChild(dot);
      setTimeout(function () { if (dot.parentNode) dot.parentNode.removeChild(dot); }, 700);
    });
  }

  function setupMouse(box) {
    var layers = qsa('[data-fx-depth]', box);
    var isGlobal = box.hasAttribute('data-fx-global');
    function move(e) {
      var x, y;
      if (isGlobal) {
        x = e.clientX / global.innerWidth - 0.5;
        y = e.clientY / global.innerHeight - 0.5;
      } else {
        var r = box.getBoundingClientRect();
        x = (e.clientX - (r.left + r.width / 2)) / r.width;
        y = (e.clientY - (r.top + r.height / 2)) / r.height;
      }
      layers.forEach(function (l) {
        var d = parseFloat(l.getAttribute('data-fx-depth')) || 10;
        l.style.translate = (-x * d * 2).toFixed(1) + 'px ' + (-y * d * 2).toFixed(1) + 'px';
      });
    }
    function reset() { layers.forEach(function (l) { l.style.translate = ''; }); }
    (isGlobal ? global : box).addEventListener('mousemove', move);
    if (!isGlobal) box.addEventListener('mouseleave', reset);
  }

  function setupCursor() {
    if (!doc.body || !has(doc.body, 'fx-cursor') || !once(doc.body, 'cursor')) return;
    if (!global.matchMedia || !global.matchMedia('(pointer: fine)').matches) return;
    var dot = make('div', 'fx-cursor-dot'), ring = make('div', 'fx-cursor-ring');
    doc.body.appendChild(dot);
    doc.body.appendChild(ring);
    var mx = -100, my = -100, rx = -100, ry = -100;
    global.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
    });
    doc.addEventListener('mouseover', function (e) {
      var hot = e.target.closest && e.target.closest('a, button, [data-fx-cursor]');
      ring.classList.toggle('fx-cursor-active', !!hot);
    });
    (function loop() {
      rx += (mx - rx) * 0.15; ry += (my - ry) * 0.15;
      ring.style.transform = 'translate(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px)';
      raf(loop);
    })();
  }

  /* ------------------------------------------------------------ play (API) */
  function play(target, name, done) {
    var el = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!el || !name) return;
    var cls = 'fx-' + name;
    el.classList.remove(cls);
    void el.offsetWidth; // restart the animation
    el.style.setProperty('--fx-count', '1');
    el.classList.add(cls);
    function end(e) {
      if (e.target !== el) return;
      el.classList.remove(cls);
      el.style.removeProperty('--fx-count');
      el.removeEventListener('animationend', end);
      if (done) done(el);
    }
    el.addEventListener('animationend', end);
  }

  /* ------------------------------------------------------------------ scan */
  var ENTER = '[class*="fx-in-"], .fx-chars, .fx-words, .fx-typewriter, .fx-scramble, .fx-count, .fx-highlight, .fx-mask, .fx-stagger, .fx-reveal';

  function scan(ctx) {
    ctx = ctx || doc;

    all('[data-fx-delay], [data-fx-duration], [data-fx-stagger], [data-fx-distance], [data-fx-ease]', ctx).forEach(applyVars);

    all('.fx-chars', ctx).forEach(function (el) { if (once(el, 'split')) split(el, 'chars'); });
    all('.fx-words', ctx).forEach(function (el) { if (once(el, 'split')) split(el, 'words'); });

    all('.fx-mask', ctx).forEach(function (el) {
      if (!once(el, 'mask')) return;
      var inner = make('span', 'fx-mask-inner');
      while (el.firstChild) inner.appendChild(el.firstChild);
      el.appendChild(inner);
    });

    all('.fx-marquee', ctx).forEach(function (el) {
      if (!once(el, 'marquee')) return;
      var track = el.querySelector('.fx-marquee-track');
      if (!track) {
        track = make('div', 'fx-marquee-track');
        while (el.firstChild) track.appendChild(el.firstChild);
        el.appendChild(track);
      }
      var speed = num(el, 'speed', 0);
      if (speed) el.style.setProperty('--fx-marquee-speed', speed + 's');
      var clone = track.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      el.appendChild(clone);
    });

    all('.fx-glitch', ctx).forEach(function (el) {
      if (!el.hasAttribute('data-text')) el.setAttribute('data-text', el.textContent.trim());
    });

    // stagger: give children incremental delays; the parent is what gets observed
    all('.fx-stagger', ctx).forEach(function (p) {
      if (!once(p, 'stagger')) return;
      var step = num(p, 'stagger', 80);
      var base = num(p, 'delay', 0);
      var effect = p.getAttribute('data-fx-effect') || 'up';
      Array.prototype.forEach.call(p.children, function (c, i) {
        c.__fxChild = true;
        if (!/(^|\s)fx-in-/.test(c.getAttribute('class') || '')) c.classList.add('fx-in-' + effect);
        c.style.setProperty('--fx-delay', (base + i * step) + 'ms');
      });
    });

    // interactions
    all('.fx-tilt', ctx).forEach(function (el) { if (once(el, 'tilt')) setupTilt(el); });
    all('.fx-magnetic', ctx).forEach(function (el) { if (once(el, 'mag')) setupMagnetic(el); });
    all('.fx-ripple', ctx).forEach(function (el) { if (once(el, 'rip')) setupRipple(el); });
    all('.fx-mouse', ctx).forEach(function (el) { if (once(el, 'mouse')) setupMouse(el); });
    all('[data-fx-click]', ctx).forEach(function (el) {
      if (once(el, 'click')) el.addEventListener('click', function () { play(el, el.getAttribute('data-fx-click')); });
    });
    all('[data-fx-hover]', ctx).forEach(function (el) {
      if (once(el, 'hover')) el.addEventListener('mouseenter', function () { play(el, el.getAttribute('data-fx-hover')); });
    });

    // scroll-driven things
    all('.fx-parallax', ctx).forEach(function (el) {
      if (!once(el, 'px')) return;
      parallax.push({
        el: el, speed: num(el, 'speed', 0.3), axis: el.getAttribute('data-fx-axis') || 'y',
        rotate: num(el, 'rotate', 0), scale: num(el, 'scale', 0)
      });
    });
    all('.fx-parallax-bg', ctx).forEach(setupBg);
    all('.fx-scroll', ctx).forEach(function (el) { if (once(el, 'scroll')) scrollers.push({ el: el }); });
    all('.fx-progress', ctx).forEach(function (el) { if (once(el, 'bar')) bars.push(el); });

    // scroll-reveal
    all(ENTER, ctx).forEach(function (el) {
      if (el.__fxChild || !once(el, 'observe')) return;
      if (io) io.observe(el); else reveal(el);
    });
  }

  /* ------------------------------------------------------------ public API */
  function refresh(ctx) {
    scan(ctx || doc);
    measureAll();
    update();
  }

  function init(opts) {
    if (opts) Object.keys(opts).forEach(function (k) { cfg[k] = opts[k]; });

    if (!io && 'IntersectionObserver' in global) {
      io = new IntersectionObserver(onIntersect, { threshold: cfg.threshold, rootMargin: cfg.rootMargin });
    }

    scan(doc);

    if (!bound) {
      bound = true;
      global.addEventListener('scroll', onScroll, { passive: true });
      global.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () { measureAll(); update(); }, 120);
      });
      global.addEventListener('load', function () { measureAll(); update(); });
      if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { measureAll(); update(); });

      if (cfg.watch && global.MutationObserver) {
        var t = null;
        mo = new MutationObserver(function () {
          clearTimeout(t);
          t = setTimeout(function () { refresh(); }, 100);
        });
        mo.observe(doc.body, { childList: true, subtree: true });
      }
      setupCursor();
    }

    measureAll();
    update();
  }

  global.Flick = { version: VERSION, init: init, refresh: refresh, play: play, config: cfg };

  var userCfg = global.FlickConfig || {};
  if (userCfg.auto !== false) {
    if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', function () { init(userCfg); });
    else init(userCfg);
  }
})(typeof window !== 'undefined' ? window : this);
