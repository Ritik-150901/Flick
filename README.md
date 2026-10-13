# ⚡ Flick

**Add a class, get an animation.** Flick is a tiny CSS + JS animation library that works like Bootstrap: you don't write any JavaScript, you just put `fx-` classes on your HTML.

- 🎬 Scroll reveal (18 styles), staggered lists
- ✍️ Text effects: letter-by-letter, word-by-word, typewriter, scramble, gradient, glitch, neon…
- 🌄 Parallax: scroll, background, mouse and scroll-linked
- 🖱️ 3D tilt, magnetic buttons, click ripple, flip cards, custom cursor
- 🔁 Looping animations (pulse, bounce, shake, tada…), hover effects, marquee, loaders
- ♿ Respects "reduce motion", no dependencies, ~15 KB unminified

Open **`demo.html`** to see everything running.

---

## 1. Install (30 seconds)

Copy `flick.css` and `flick.js` next to your page and add two lines:

```html
<link rel="stylesheet" href="flick.css">
<script src="flick.js" defer></script>
```

That's it. Flick starts itself automatically.

## 2. Use it

```html
<h1 class="fx-in-up">I slide up when scrolled into view</h1>

<h1 class="fx-chars">I appear letter by letter</h1>

<span class="fx-typewriter" data-fx-words="Designer|Developer|Dreamer"></span>

<div class="fx-parallax" data-fx-speed="0.4">I move at my own speed</div>

<button class="fx-pulse">I pulse forever</button>
```

Everything is combinable: add speed, delay and easing classes to anything.

```html
<div class="fx-in-zoom fx-slow fx-delay-3 fx-ease-bounce">Slow, delayed, bouncy zoom</div>
```

---

## 3. Cheat sheet

### Modifiers (work with every animation)

| Class | What it does |
|---|---|
| `fx-fastest` `fx-fast` `fx-slow` `fx-slower` `fx-slowest` | Speed |
| `fx-delay-1` … `fx-delay-10` | Delay in 100 ms steps |
| `fx-ease-linear` `-in` `-out` `-in-out` `-bounce` `-snappy` | Easing |
| `fx-dist-sm` `fx-dist-lg` `fx-dist-xl` | How far `fx-in-up/down/left/right` travel |
| `fx-once` `fx-twice` `fx-thrice` `fx-infinite` | Repeat count for looping animations |
| `fx-paused` / `fx-hover-pause` | Pause an animation (always / on hover) |

> Put a modifier on a **parent** and every animation inside inherits it.

### Scroll reveal — `fx-in-*`

Plays once when the element scrolls into view.

`fx-in-fade` · `fx-in-up` · `fx-in-down` · `fx-in-left` · `fx-in-right` · `fx-in-zoom` · `fx-in-zoom-out` · `fx-in-flip-x` · `fx-in-flip-y` · `fx-in-rotate` · `fx-in-blur` · `fx-in-bounce` · `fx-in-skew` · `fx-in-drop` · `fx-in-wipe-left` · `fx-in-wipe-right` · `fx-in-wipe-up` · `fx-in-wipe-down`

**Staggered lists** — put `fx-stagger` on the parent and children animate one after another. They get `fx-in-up` automatically:

```html
<ul class="fx-stagger" data-fx-stagger="120" data-fx-effect="zoom">
  <li>One</li>
  <li>Two</li>
  <li>Three</li>
</ul>
```

Extra reveal helpers: `fx-highlight` (marker sweep behind text), `fx-mask` (text slides up out of a hidden line), `fx-reveal` (just adds `.fx-visible` so you can style it yourself).

### Looping attention animations

`fx-pulse` `fx-bounce` `fx-shake` `fx-wobble` `fx-swing` `fx-tada` `fx-float` `fx-spin` `fx-spin-reverse` `fx-heartbeat` `fx-jello` `fx-flash` `fx-rubber` `fx-wiggle` `fx-breathe` `fx-ping` `fx-flip` `fx-glow`

They run immediately and forever. Add `fx-once` to play a single time.

**Trigger on click/hover** without writing JS:

```html
<button data-fx-click="shake">Shake me</button>
<div data-fx-hover="tada">Hover me</div>
```

### Hover effects

`fx-hover-grow` `fx-hover-shrink` `fx-hover-pop` `fx-hover-lift` `fx-hover-tilt` `fx-hover-spin` `fx-hover-glow` `fx-hover-shine` `fx-hover-underline` `fx-hover-fill`

### Text effects

| Class | Result |
|---|---|
| `fx-chars` | Letter by letter reveal |
| `fx-words` | Word by word reveal |
| `fx-text-up` `-fade` `-blur` `-rotate` `-zoom` `-flip` `-drop` `-slide` | Style for `fx-chars` / `fx-words` (default is `up`) |
| `fx-wave` | Letters wave forever (use with `fx-chars`) |
| `fx-rainbow` | Rainbow letters (use with `fx-chars`) |
| `fx-typewriter` | Types text with a blinking cursor |
| `fx-scramble` | Random characters decode into your text |
| `fx-count` | Count up to a number |
| `fx-gradient-text` | Animated gradient colour |
| `fx-shimmer-text` | Loading-style shimmer |
| `fx-neon` | Glowing neon |
| `fx-glitch` | Glitchy RGB split |

**Typewriter**

```html
<!-- types its own text once -->
<span class="fx-typewriter">Hello world</span>

<!-- rotates through words forever -->
<span class="fx-typewriter" data-fx-words="Fast|Simple|Fun"></span>
```
Options: `data-fx-speed="70"` (ms per letter), `data-fx-back-speed="35"`, `data-fx-pause="1600"`, `data-fx-loop="false"`.

**Counter**

```html
<b class="fx-count" data-fx-to="12500" data-fx-suffix="+">0</b>
<b class="fx-count" data-fx-to="4.9" data-fx-decimals="1">0</b>
```
Options: `data-fx-from`, `data-fx-duration` (ms), `data-fx-prefix`, `data-fx-suffix`, `data-fx-decimals`, `data-fx-separator="false"`.

### Parallax & scroll

**Parallax element**

```html
<img class="fx-parallax" data-fx-speed="0.3" src="cloud.png">
<div class="fx-parallax" data-fx-speed="-0.4" data-fx-rotate="30"></div>
```

| Attribute | Meaning |
|---|---|
| `data-fx-speed` | `0.3` = moves slower than the page (feels far away). Negative = faster (feels close). |
| `data-fx-axis` | `y` (default), `x`, or `both` |
| `data-fx-rotate` | Degrees of rotation per screen height scrolled |
| `data-fx-scale` | Scale change per screen height scrolled |

**Parallax background** — give any section a CSS background image (or `data-fx-src="photo.jpg"`):

```html
<section class="fx-parallax-bg" data-fx-speed="0.4" style="background-image:url(hero.jpg); height:500px">
  <h2>Content stays put, background drifts</h2>
</section>
```

**Mouse parallax** — layers follow the cursor:

```html
<div class="fx-mouse">            <!-- add data-fx-global to react to the whole window -->
  <img data-fx-depth="20" src="a.png">
  <img data-fx-depth="-40" src="b.png">   <!-- negative = opposite direction -->
</div>
```

**Scroll-linked** — add `fx-scroll` plus any of these:

`fx-scroll-fade` · `fx-scroll-fade-out` · `fx-scroll-up` · `fx-scroll-left` · `fx-scroll-right` · `fx-scroll-scale` · `fx-scroll-zoom` · `fx-scroll-rotate` · `fx-scroll-rotate-in`

```html
<div class="fx-scroll fx-scroll-scale fx-scroll-fade">Grows and fades in as you scroll</div>
```
`fx-scroll` also exposes `--fx-p`, `--fx-in`, `--fx-out` (0 → 1) so you can build your own effect in CSS:

```css
.my-thing { translate: calc(var(--fx-p) * 300px) 0; }
```

**Scroll progress bar** — `<div class="fx-progress"></div>`

### Interactive

| Class | Result |
|---|---|
| `fx-tilt` (+ `fx-tilt-glare`) | 3D card tilt. `data-fx-max="12"` degrees, `data-fx-scale="1.03"` |
| `fx-magnetic` | Element is pulled toward the cursor. `data-fx-strength="0.35"` |
| `fx-ripple` | Material-style click ripple |
| `fx-flip-card` | Flip on hover (see below) |
| `fx-cursor` on `<body>` | Custom dot + ring cursor |

```html
<div class="fx-flip-card" style="height:200px">
  <div class="fx-flip-inner">
    <div class="fx-flip-front">Front</div>
    <div class="fx-flip-back">Back</div>
  </div>
</div>
```

### Marquee, backgrounds & loaders

```html
<div class="fx-marquee" data-fx-speed="20">
  <span>Logo 1</span><span>Logo 2</span><span>Logo 3</span>
</div>
```
Add `fx-marquee-reverse` to flip direction. It pauses on hover.

`fx-bg-gradient` (animated gradient background) · `fx-skeleton` (loading placeholder) · `fx-spinner`

---

## 4. Data attributes

Fine-tune any animation without touching CSS. Times are in **milliseconds**.

| Attribute | Example | Effect |
|---|---|---|
| `data-fx-delay` | `300` | Delay before starting |
| `data-fx-duration` | `1200` | Duration |
| `data-fx-stagger` | `80` | Gap between letters/words/children |
| `data-fx-distance` | `80` | Pixels travelled by `fx-in-up/down/left/right` |
| `data-fx-ease` | `ease-out` | Any CSS easing |
| `data-fx-repeat` | *(no value)* | Replay the reveal every time it scrolls into view |
| `data-fx-effect` | `zoom` | Effect used by `fx-stagger` children |

---

## 5. JavaScript API (optional)

You never *need* JavaScript, but it's there:

```js
Flick.refresh();                 // after adding new elements to the page
Flick.play('#logo', 'tada');     // play a looping animation once
Flick.play(el, 'shake', function () { console.log('done'); });
Flick.init({ watch: true });     // auto-detect elements added later (SPAs)
```

Configure before the script loads (e.g. to start manually):

```html
<script>window.FlickConfig = { auto: false, rootMargin: '0px 0px -20% 0px' };</script>
<script src="flick.js"></script>
<script>Flick.init();</script>
```

Event fired when an element is revealed:

```js
document.addEventListener('flick:visible', e => console.log(e.target));
```

---

## 6. Customise

Change the look and feel globally with CSS variables:

```css
:root {
  --fx-duration: 1s;        /* entrance speed */
  --fx-loop: 2s;            /* looping speed */
  --fx-distance: 60px;      /* slide distance */
  --fx-ease: cubic-bezier(.22, 1, .36, 1);
  --fx-accent: #14b8a6;     /* glow, progress bar, cursor… */
  --fx-accent-2: #f43f5e;
}
```

---

## 7. Tips & troubleshooting

- **Nothing moves on my element?** Transforms don't work on plain inline elements. Flick fixes `span`, `a`, `em`, `strong` automatically; for anything else add `display:inline-block` (or the `fx-inline-block` class).
- **Don't stack two animations on one element.** `fx-in-up fx-pulse` fights over the same CSS property. Put one on a wrapper instead.
- **Avoid mixing `fx-parallax` or `fx-scroll-*` with `fx-in-*` on the same element** for the same reason; nest them.
- **Flash of unstyled content?** Put `class="fx-js"` on your `<html>` tag so hidden-until-visible styles apply before the script runs.
- **Hidden text for crawlers/screen readers:** split text keeps the full text in `aria-label`, and Flick turns off or shortens animations when the visitor has "reduce motion" turned on.
- **Parallax looks off after images load?** Call `Flick.refresh()` (it also runs automatically on `load` and `resize`).

## 8. Browser support

All modern browsers (Chrome/Edge 104+, Firefox 72+, Safari 14.1+). Parallax and scroll-linked effects rely on the individual `translate` / `rotate` / `scale` CSS properties.

## 9. Files

| File | Purpose |
|---|---|
| `flick.css` | All the animation classes |
| `flick.js` | Auto-start script for scroll reveal, text, parallax, interactions |
| `demo.html` | Live showcase of everything |
| `README.md` | This guide |

## License

MIT — use it anywhere, for anything.
