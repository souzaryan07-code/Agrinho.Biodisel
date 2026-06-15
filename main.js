/* ═══════════════════════════════════════════════════════════
   main.js — Biodiesel Site Animations
   Depends on: GSAP 3 + ScrollTrigger (loaded in HTML)
═══════════════════════════════════════════════════════════ */

gsap.registerPlugin(ScrollTrigger);

/* ═════════════════════════════════
   UTILS
═════════════════════════════════ */
const W = () => window.innerWidth;
const H = () => window.innerHeight;
const rand = (a, b) => Math.random() * (b - a) + a;
const lerp = (a, b, t) => a + (b - a) * t;

/* ═════════════════════════════════
   NAVBAR: scroll class
═════════════════════════════════ */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ═════════════════════════════════
   HERO CANVAS — floating particles + sunflower
═════════════════════════════════ */
(function heroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  const ctx    = canvas.getContext('2d');
  let W2, H2, particles = [];

  function resize() {
    W2 = canvas.width  = canvas.offsetWidth;
    H2 = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // floating pollen particles
  for (let i = 0; i < 60; i++) {
    particles.push({
      x: rand(0, W2), y: rand(0, H2),
      r: rand(1.5, 4),
      vx: rand(-0.15, 0.15), vy: rand(-0.4, -0.1),
      alpha: rand(0.2, 0.7),
      color: Math.random() > 0.5 ? '#fdd835' : '#a5d6a7'
    });
  }

  // hero sunflower drawing
  function drawSunflower(cx, cy, size) {
    const petalCount = 16;
    const petalLen   = size * 0.52;
    const petalW     = size * 0.18;
    // petals
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      const grad = ctx.createLinearGradient(0, 0, 0, -petalLen);
      grad.addColorStop(0, '#f9a825');
      grad.addColorStop(1, '#fdd835');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, -petalLen * 0.55, petalW * 0.5, petalLen * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // center dark disc
    const cgrad = ctx.createRadialGradient(cx - size*0.08, cy - size*0.08, 0, cx, cy, size * 0.32);
    cgrad.addColorStop(0, '#6d4c41');
    cgrad.addColorStop(0.5, '#4e342e');
    cgrad.addColorStop(1, '#3e2723');
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.32, 0, Math.PI * 2);
    ctx.fillStyle = cgrad;
    ctx.fill();
    // seed pattern dots
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    for (let d = 0; d < 30; d++) {
      const da = rand(0, Math.PI * 2);
      const dr = rand(0, size * 0.28);
      ctx.beginPath();
      ctx.arc(cx + Math.cos(da)*dr, cy + Math.sin(da)*dr, rand(1, 2.5), 0, Math.PI*2);
      ctx.fill();
    }
    // stem
    ctx.strokeStyle = '#388e3c';
    ctx.lineWidth   = size * 0.07;
    ctx.lineCap     = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, cy + size * 0.35);
    ctx.quadraticCurveTo(cx + size * 0.1, cy + size * 1.2, cx + size * 0.05, cy + size * 2.2);
    ctx.stroke();
    // leaves
    ctx.fillStyle = '#2e7d32';
    [[0.6, -0.4], [-0.5, 0.8]].forEach(([lx, ly]) => {
      ctx.save();
      ctx.translate(cx + lx * size * 0.12, cy + size * 0.9 + ly * size * 0.1);
      ctx.rotate(lx > 0 ? 0.5 : -0.5);
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.28, size * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  let sway = 0;
  let raf;

  function tick(ts) {
    ctx.clearRect(0, 0, W2, H2);

    // particles
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -10) { p.y = H2 + 10; p.x = rand(0, W2); }
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle   = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;
    sway = Math.sin(ts * 0.0006) * 0.025;
    ctx.save();
    ctx.translate(W2 / 2, H2 * 0.52);
    ctx.rotate(sway);
    drawSunflower(0, 0, Math.min(W2, H2) * 0.13);
    ctx.restore();

    raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);

  // stop when out of view
  const heroEl = document.getElementById('hero');
  const heroObs = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) { cancelAnimationFrame(raf); }
    else { raf = requestAnimationFrame(tick); }
  });
  heroObs.observe(heroEl);
})();

/* ═════════════════════════════════
   SCENE CANVAS — sunflowers + seeds
═════════════════════════════════ */
(function sceneAnimation() {
  const canvas  = document.getElementById('scene-canvas');
  const ctx     = canvas.getContext('2d');
  const section = document.getElementById('scene-section');
  const sticky  = document.getElementById('scene-sticky');
  const macWrap = document.getElementById('machine-wrap');

  let CW, CH;

  function resize() {
    CW = canvas.width  = canvas.offsetWidth;
    CH = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  /* ── Sunflower definitions ──
     Each: {xFrac, yBot (px from bottom), sizeFrac, sway, phase}
  */
  const FIELD = [
    // main hero (center, big)
    { xFrac: 0.50, yBotFrac: 0.30, sizeFrac: 0.12,  isHero: true },
    // left cluster
    { xFrac: 0.04, yBotFrac: 0.30, sizeFrac: 0.065 },
    { xFrac: 0.11, yBotFrac: 0.32, sizeFrac: 0.080 },
    { xFrac: 0.19, yBotFrac: 0.29, sizeFrac: 0.072 },
    { xFrac: 0.27, yBotFrac: 0.31, sizeFrac: 0.060 },
    { xFrac: 0.35, yBotFrac: 0.33, sizeFrac: 0.068 },
    { xFrac: 0.07, yBotFrac: 0.38, sizeFrac: 0.052 },
    { xFrac: 0.15, yBotFrac: 0.40, sizeFrac: 0.058 },
    { xFrac: 0.23, yBotFrac: 0.37, sizeFrac: 0.050 },
    { xFrac: 0.31, yBotFrac: 0.35, sizeFrac: 0.062 },
    // right cluster
    { xFrac: 0.96, yBotFrac: 0.30, sizeFrac: 0.065 },
    { xFrac: 0.89, yBotFrac: 0.32, sizeFrac: 0.080 },
    { xFrac: 0.81, yBotFrac: 0.29, sizeFrac: 0.072 },
    { xFrac: 0.73, yBotFrac: 0.31, sizeFrac: 0.060 },
    { xFrac: 0.65, yBotFrac: 0.33, sizeFrac: 0.068 },
    { xFrac: 0.93, yBotFrac: 0.38, sizeFrac: 0.052 },
    { xFrac: 0.85, yBotFrac: 0.40, sizeFrac: 0.058 },
    { xFrac: 0.77, yBotFrac: 0.37, sizeFrac: 0.050 },
    { xFrac: 0.69, yBotFrac: 0.35, sizeFrac: 0.062 },
    // extras center
    { xFrac: 0.43, yBotFrac: 0.36, sizeFrac: 0.055 },
    { xFrac: 0.57, yBotFrac: 0.36, sizeFrac: 0.055 },
  ];

  // add runtime props
  FIELD.forEach((f, i) => {
    f.phase   = rand(0, Math.PI * 2);
    f.swayAmp = rand(0.018, 0.04);
    f.swaySpd = rand(0.0004, 0.0008);
    f.alpha   = 0;
    f.scale   = f.isHero ? 1 : 0;
    f.id      = i;
  });

  /* ── Seed particles ── */
  const seeds = [];
  let seedsReleased = false;

  function releaseSeed(sf) {
    const x = sf.xFrac * CW;
    const y = CH - sf.yBotFrac * CH;
    seeds.push({
      x, y,
      vx: rand(-1.5, 1.5),
      vy: rand(-2.5, -1),
      gravity: 0.06,
      alpha: 1,
      r: rand(3, 5.5),
      angle: rand(0, Math.PI * 2),
      spin:  rand(-0.08, 0.08),
      done: false,
      tx: null, ty: null, // target set later
      phase: 'launch'
    });
  }

  function setMachineTarget() {
    const rect = macWrap.getBoundingClientRect();
    const sRect = sticky.getBoundingClientRect();
    return {
      tx: rect.left - sRect.left + rect.width * 0.38,
      ty: rect.top  - sRect.top  + rect.height * 0.25
    };
  }

  /* ── Draw one sunflower ── */
  function drawSF(ctx, cx, cy, size, alpha, scale) {
    if (alpha <= 0.01 || scale <= 0.01) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    const petalCount = 14;
    const petalLen   = size * 0.5;

    // petals
    for (let i = 0; i < petalCount; i++) {
      const a = (i / petalCount) * Math.PI * 2;
      ctx.save();
      ctx.rotate(a);
      const g = ctx.createLinearGradient(0, 0, 0, -petalLen);
      g.addColorStop(0, '#f9a825');
      g.addColorStop(0.6, '#fdd835');
      g.addColorStop(1, '#fff176');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(0, -petalLen * 0.55, size * 0.1, petalLen * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // center
    const cg = ctx.createRadialGradient(-size*0.06, -size*0.06, 0, 0, 0, size * 0.3);
    cg.addColorStop(0, '#6d4c41');
    cg.addColorStop(0.7, '#4e342e');
    cg.addColorStop(1, '#3e2723');
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = cg;
    ctx.fill();

    // subtle seed spiral hints
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    for (let d = 0; d < 20; d++) {
      const da = rand(0, Math.PI * 2);
      const dr = rand(0, size * 0.26);
      ctx.beginPath();
      ctx.arc(Math.cos(da)*dr, Math.sin(da)*dr, rand(1, 2), 0, Math.PI*2);
      ctx.fill();
    }

    // stem
    ctx.strokeStyle = '#388e3c';
    ctx.lineWidth   = Math.max(3, size * 0.08);
    ctx.lineCap     = 'round';
    ctx.beginPath();
    ctx.moveTo(0, size * 0.32);
    ctx.quadraticCurveTo(size * 0.08, size * 1.3, size * 0.04, size * 2.1);
    ctx.stroke();

    // 2 leaves
    ctx.fillStyle = '#2e7d32';
    [[1, 0.9, 0.45], [-1, 1.3, -0.4]].forEach(([dir, stemY, ang]) => {
      ctx.save();
      ctx.translate(dir * size * 0.05, size * stemY);
      ctx.rotate(ang);
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.32, size * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    ctx.restore();
  }

  /* ── State driven by scroll progress (0→1) ── */
  let progress = 0;

  // GSAP ScrollTrigger drives `progress`
  ScrollTrigger.create({
    trigger: '#scene-section',
    start: 'top top',
    end:   'bottom bottom',
    scrub: 1.8,
    onUpdate(self) {
      progress = self.progress;
      updateScene(progress);
    }
  });

  function updateScene(p) {
    /* Hero SF: visible from 0, scales out by 0.2 */
    const hero = FIELD[0];
    if (p < 0.15) {
      hero.alpha = 1;
      hero.scale = lerp(1, 0.55, p / 0.15);
    } else {
      hero.alpha = lerp(1, 0.3, (p - 0.15) / 0.15);
      hero.scale = 0.55;
    }

    /* Field SFs: stagger in from p=0.10 to p=0.55 */
    FIELD.slice(1).forEach((f, i) => {
      const start = 0.10 + i * 0.022;
      const end   = start + 0.08;
      f.alpha = Math.min(1, Math.max(0, (p - start) / (end - start)));
      f.scale = f.alpha;
    });

    /* Seeds: release at p=0.55 */
    if (p >= 0.54 && !seedsReleased) {
      seedsReleased = true;
      FIELD.forEach(f => {
        const count = f.isHero ? 6 : 2;
        for (let k = 0; k < count; k++) {
          setTimeout(() => releaseSeed(f), rand(0, 600));
        }
      });
    }

    /* Machine */
    if (p >= 0.52) {
      const mp = Math.min(1, (p - 0.52) / 0.10);
      gsap.set('#machine-wrap', { opacity: mp, y: lerp(40, 0, mp) });
    } else {
      gsap.set('#machine-wrap', { opacity: 0, y: 40 });
    }

    /* Machine liquid */
    if (p >= 0.62) {
      const lp = Math.min(1, (p - 0.62) / 0.12);
      document.getElementById('machine-liquid').setAttribute('width', lp * 96);
      document.getElementById('liquid-dot').setAttribute('opacity', lp > 0.8 ? (lp - 0.8) * 5 : 0);
      document.getElementById('smoke-a').setAttribute('opacity', lp * 0.7);
      document.getElementById('smoke-b').setAttribute('opacity', lp * 0.5);
    }

    /* Pipe */
    if (p >= 0.66) {
      const pp = Math.min(1, (p - 0.66) / 0.14);
      gsap.set('#pipe-svg', { opacity: pp });
      document.getElementById('pipe-liquid').setAttribute('width', pp * 1400);
      document.getElementById('pipe-shine').setAttribute('width', pp * 1400);
    } else {
      gsap.set('#pipe-svg', { opacity: 0 });
    }

    /* Truck */
    if (p >= 0.68) {
      const tp = Math.min(1, (p - 0.68) / 0.14);
      const rightPx = lerp(-500, W() * 0.02, tp);
      gsap.set('#truck-wrap', { opacity: tp, right: rightPx });
    } else {
      gsap.set('#truck-wrap', { opacity: 0, right: -500 });
    }

    /* Tank fill */
    if (p >= 0.78) {
      const tfp = Math.min(1, (p - 0.78) / 0.10);
      document.getElementById('tank-fill').setAttribute('opacity', tfp * 0.9);
      document.getElementById('tank-shine').setAttribute('opacity', tfp * 0.8);
      document.getElementById('tank-label').setAttribute('opacity', tfp);
      document.getElementById('tank-sub').setAttribute('opacity', tfp);
    }

    /* Final reveal */
    if (p >= 0.87) {
      const fp = Math.min(1, (p - 0.87) / 0.13);
      const reveal = document.getElementById('final-reveal');
      reveal.style.opacity       = fp;
      reveal.style.pointerEvents = fp > 0.1 ? 'all' : 'none';
      const fw  = Math.min(1, (p - 0.89) / 0.10);
      const ftg = Math.min(1, (p - 0.88) / 0.06);
      const fd  = Math.min(1, (p - 0.91) / 0.07);
      const fc  = Math.min(1, (p - 0.93) / 0.07);
      gsap.set('#final-tag',  { opacity: ftg, y: lerp(20, 0, ftg) });
      gsap.set('#final-word', { opacity: fw,  scale: lerp(0.4, 1, fw) });
      gsap.set('#final-desc', { opacity: fd });
      gsap.set('#final-cta',  { opacity: fc });
    } else {
      gsap.set('#final-reveal', { opacity: 0, pointerEvents: 'none' });
    }
  }

  /* ── Seed: set target once machine is visible ── */
  let macTarget = null;

  function updateSeeds(ts) {
    if (!macTarget && macWrap.getBoundingClientRect().width > 0) {
      macTarget = setMachineTarget();
    }
    seeds.forEach(s => {
      if (s.done) return;
      if (s.phase === 'launch') {
        s.vy += s.gravity;
        s.x  += s.vx;
        s.y  += s.vy;
        // after 40 frames arc toward machine
        if (macTarget && s.vy > 0.5) {
          s.phase = 'fly';
        }
      } else if (s.phase === 'fly' && macTarget) {
        const dx = macTarget.tx - s.x;
        const dy = macTarget.ty - s.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 12) {
          s.done  = true;
          s.alpha = 0;
          return;
        }
        const spd = Math.min(8, dist * 0.07);
        s.vx = lerp(s.vx, (dx / dist) * spd, 0.08);
        s.vy = lerp(s.vy, (dy / dist) * spd, 0.08);
        s.x += s.vx;
        s.y += s.vy;
        s.alpha = Math.min(1, dist / 120);
      }
      s.angle += s.spin;
    });
  }

  /* ── Main canvas render loop ── */
  function drawSeeds(ctx) {
    seeds.forEach(s => {
      if (s.done || s.alpha <= 0.01) return;
      ctx.save();
      ctx.globalAlpha = s.alpha;
      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);
      // seed shape
      const sg = ctx.createLinearGradient(-s.r, -s.r*1.6, s.r, s.r*1.6);
      sg.addColorStop(0, '#6d4c41');
      sg.addColorStop(1, '#3e2723');
      ctx.fillStyle = sg;
      ctx.shadowColor = 'rgba(253,216,53,0.5)';
      ctx.shadowBlur  = 6;
      ctx.beginPath();
      ctx.ellipse(0, 0, s.r * 0.55, s.r * 1.1, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  let lastTs = 0;
  function render(ts) {
    ctx.clearRect(0, 0, CW, CH);
    const t = ts;

    FIELD.forEach(f => {
      const cx  = f.xFrac * CW;
      const cy  = CH - f.yBotFrac * CH;
      const sz  = (f.sizeFrac * Math.min(CW, CH));
      const sway = Math.sin(t * f.swaySpd + f.phase) * f.swayAmp;
      ctx.save();
      ctx.translate(cx, cy + sz * 2.1);
      ctx.rotate(sway);
      ctx.translate(-cx, -(cy + sz * 2.1));
      drawSF(ctx, cx, cy, sz, f.alpha, f.scale);
      ctx.restore();
    });

    updateSeeds(ts);
    drawSeeds(ctx);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  /* Gear spin (CSS-independent, direct DOM) */
  let gearAngle = 0;
  function spinGears() {
    gearAngle += 0.8;
    const g1 = document.getElementById('gear-big');
    const g2 = document.getElementById('gear-small');
    if (g1) g1.style.transform = `rotate(${gearAngle}deg)`;
    if (g2) g2.style.transform = `rotate(${-gearAngle * 1.5}deg)`;
    requestAnimationFrame(spinGears);
  }
  spinGears();
})();

/* ═════════════════════════════════
   REVEAL ON SCROLL (info sections)
═════════════════════════════════ */
(function revealObserver() {
  const items = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, idx) => {
      if (e.isIntersecting) {
        // stagger children if grid
        const delay = Array.from(e.target.parentElement?.children || [])
          .indexOf(e.target) * 80;
        setTimeout(() => e.target.classList.add('visible'), delay);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  items.forEach(el => obs.observe(el));
})();

/* ═════════════════════════════════
   HERO text entrance
═════════════════════════════════ */
(function heroEntrance() {
  const tl = gsap.timeline({ delay: 0.3 });
  tl.from('.hero-eyebrow', { y: 20, opacity: 0, duration: 0.7, ease: 'power3.out' })
    .from('#hero-heading',  { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out' }, '-=0.4')
    .from('.hero-sub',      { y: 20, opacity: 0, duration: 0.7, ease: 'power3.out' }, '-=0.5')
    .from('#scroll-arrow',  { opacity: 0, duration: 0.6 }, '-=0.2');
})();

/* ═════════════════════════════════════════════════════════
   MODAL — Biodiesel no Paraná
═════════════════════════════════════════════════════════ */
(function bioModal() {
  const overlay   = document.getElementById('bio-overlay');
  const modal     = document.getElementById('bio-modal');
  const openBtn   = document.getElementById('modal-open-btn');
  const closeBtn1 = document.getElementById('bio-close-btn');
  const closeBtn2 = document.getElementById('bio-close-btn-2');

  if (!overlay || !openBtn) return;

  /* ── Bloquear / liberar scroll da página ── */
  let savedScrollY = 0;

  function lockScroll() {
    savedScrollY = window.scrollY;
    document.body.style.overflow   = 'hidden';
    document.body.style.position   = 'fixed';
    document.body.style.top        = `-${savedScrollY}px`;
    document.body.style.width      = '100%';
  }

  function unlockScroll() {
    document.body.style.overflow  = '';
    document.body.style.position  = '';
    document.body.style.top       = '';
    document.body.style.width     = '';
    window.scrollTo(0, savedScrollY);
  }

  /* ── Abrir ── */
  function openModal() {
    overlay.removeAttribute('hidden');
    lockScroll();

    /* dois rAFs garantem que o display mude antes da transição CSS disparar */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.classList.add('bio-open');
      });
    });

    /* rolar o painel interno pro topo */
    const body = document.getElementById('bio-modal-body');
    if (body) body.scrollTop = 0;

    /* foco acessível */
    setTimeout(() => {
      if (closeBtn1) closeBtn1.focus();
    }, 80);

    /* animar os cards em cascata */
    setTimeout(animateCards, 160);
  }

  /* ── Fechar ── */
  function closeModal() {
    overlay.classList.remove('bio-open');
    unlockScroll();

    /* aguarda a transição terminar para ocultar com display:none */
    overlay.addEventListener('transitionend', function handler(e) {
      if (e.target !== overlay) return;
      overlay.setAttribute('hidden', '');
      overlay.removeEventListener('transitionend', handler);
    });

    openBtn.focus();
  }

  /* ── Animar cards em cascata ── */
  function animateCards() {
    const items = modal.querySelectorAll('.bio-stat, .bio-card, #bio-motivational');
    items.forEach((el, i) => {
      el.style.opacity   = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'none';
      setTimeout(() => {
        el.style.transition = `opacity 0.5s ease ${i * 65}ms, transform 0.5s cubic-bezier(.16,1,.3,1) ${i * 65}ms`;
        el.style.opacity   = '1';
        el.style.transform = 'translateY(0)';
      }, 20);
    });
  }

  /* ── Trap de foco (acessibilidade) ── */
  overlay.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    const focusable = Array.from(
      modal.querySelectorAll('button:not([disabled]), [href], input, [tabindex]:not([tabindex="-1"])')
    ).filter(el => el.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  });

  /* ── Eventos ── */
  openBtn.addEventListener('click', openModal);
  closeBtn1.addEventListener('click', closeModal);
  if (closeBtn2) closeBtn2.addEventListener('click', closeModal);

  /* clicar fora do painel (no overlay escuro) fecha */
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeModal();
  });

  /* ESC fecha */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('bio-open')) closeModal();
  });

  /* iniciar oculto */
  overlay.setAttribute('hidden', '');
})();
