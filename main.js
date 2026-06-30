gsap.registerPlugin(ScrollTrigger);

const getWindowWidth = () => window.innerWidth;
const getWindowHeight = () => window.innerHeight;
const getRandomNumber = (min, max) => Math.random() * (max - min) + min;
const linearInterpolate = (start, end, factor) => start + (end - start) * factor;

const initNavbarObserver = () => {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
};

const initializeHeroCanvas = () => {
  const canvas = document.getElementById('hero-canvas');
  const context = canvas.getContext('2d');
  let canvasWidth, canvasHeight;
  const particles = [];

  const handleResize = () => {
    canvasWidth = canvas.width = canvas.offsetWidth;
    canvasHeight = canvas.height = canvas.offsetHeight;
  };
  
  handleResize();
  window.addEventListener('resize', handleResize);

  for (let i = 0; i < 60; i++) {
    particles.push({
      x: getRandomNumber(0, canvasWidth),
      y: getRandomNumber(0, canvasHeight),
      r: getRandomNumber(1.5, 4),
      vx: getRandomNumber(-0.15, 0.15),
      vy: getRandomNumber(-0.4, -0.1),
      alpha: getRandomNumber(0.2, 0.7),
      color: Math.random() > 0.5 ? '#fdd835' : '#a5d6a7'
    });
  }

  const renderSunflower = (cx, cy, size) => {
    const petalCount = 16;
    const petalLen = size * 0.52;
    const petalW = size * 0.18;
    
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      context.save();
      context.translate(cx, cy);
      context.rotate(angle);
      const gradient = context.createLinearGradient(0, 0, 0, -petalLen);
      gradient.addColorStop(0, '#f9a825');
      gradient.addColorStop(1, '#fdd835');
      context.fillStyle = gradient;
      context.beginPath();
      context.ellipse(0, -petalLen * 0.55, petalW * 0.5, petalLen * 0.5, 0, 0, Math.PI * 2);
      context.fill();
      context.restore();
    }
    
    const centerGradient = context.createRadialGradient(cx - size*0.08, cy - size*0.08, 0, cx, cy, size * 0.32);
    centerGradient.addColorStop(0, '#6d4c41');
    centerGradient.addColorStop(0.5, '#4e342e');
    centerGradient.addColorStop(1, '#3e2723');
    context.beginPath();
    context.arc(cx, cy, size * 0.32, 0, Math.PI * 2);
    context.fillStyle = centerGradient;
    context.fill();
    
    context.fillStyle = 'rgba(255,255,255,0.07)';
    for (let d = 0; d < 30; d++) {
      const da = getRandomNumber(0, Math.PI * 2);
      const dr = getRandomNumber(0, size * 0.28);
      context.beginPath();
      context.arc(cx + Math.cos(da)*dr, cy + Math.sin(da)*dr, getRandomNumber(1, 2.5), 0, Math.PI*2);
      context.fill();
    }
    
    context.strokeStyle = '#388e3c';
    context.lineWidth = size * 0.07;
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(cx, cy + size * 0.35);
    context.quadraticCurveTo(cx + size * 0.1, cy + size * 1.2, cx + size * 0.05, cy + size * 2.2);
    context.stroke();
    
    context.fillStyle = '#2e7d32';
    [[0.6, -0.4], [-0.5, 0.8]].forEach(([lx, ly]) => {
      context.save();
      context.translate(cx + lx * size * 0.12, cy + size * 0.9 + ly * size * 0.1);
      context.rotate(lx > 0 ? 0.5 : -0.5);
      context.beginPath();
      context.ellipse(0, 0, size * 0.28, size * 0.1, 0, 0, Math.PI * 2);
      context.fill();
      context.restore();
    });
  };

  let sway = 0;
  let animationFrame;

  const animateHero = (timestamp) => {
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    
    particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      if (particle.y < -10) { 
        particle.y = canvasHeight + 10; 
        particle.x = getRandomNumber(0, canvasWidth); 
      }
      context.globalAlpha = particle.alpha;
      context.fillStyle = particle.color;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      context.fill();
    });

    context.globalAlpha = 1;
    sway = Math.sin(timestamp * 0.0006) * 0.025;
    context.save();
    context.translate(canvasWidth / 2, canvasHeight * 0.52);
    context.rotate(sway);
    renderSunflower(0, 0, Math.min(canvasWidth, canvasHeight) * 0.13);
    context.restore();

    animationFrame = requestAnimationFrame(animateHero);
  };

  animationFrame = requestAnimationFrame(animateHero);

  const heroElement = document.getElementById('hero');
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) { cancelAnimationFrame(animationFrame); }
    else { animationFrame = requestAnimationFrame(animateHero); }
  });
  intersectionObserver.observe(heroElement);
};

const initializeSceneAnimation = () => {
  const canvas = document.getElementById('scene-canvas');
  const context = canvas.getContext('2d');
  const stickyContainer = document.getElementById('scene-sticky');
  const machineWrapper = document.getElementById('machine-wrap');
  let canvasWidth, canvasHeight;

  const handleResize = () => {
    canvasWidth = canvas.width = canvas.offsetWidth;
    canvasHeight = canvas.height = canvas.offsetHeight;
  };
  
  handleResize();
  window.addEventListener('resize', handleResize);

  const sunFlowerField = [
    { xFrac: 0.50, yBotFrac: 0.30, sizeFrac: 0.12,  isHero: true },
    { xFrac: 0.04, yBotFrac: 0.30, sizeFrac: 0.065 },
    { xFrac: 0.11, yBotFrac: 0.32, sizeFrac: 0.080 },
    { xFrac: 0.19, yBotFrac: 0.29, sizeFrac: 0.072 },
    { xFrac: 0.27, yBotFrac: 0.31, sizeFrac: 0.060 },
    { xFrac: 0.35, yBotFrac: 0.33, sizeFrac: 0.068 },
    { xFrac: 0.07, yBotFrac: 0.38, sizeFrac: 0.052 },
    { xFrac: 0.15, yBotFrac: 0.40, sizeFrac: 0.058 },
    { xFrac: 0.23, yBotFrac: 0.37, sizeFrac: 0.050 },
    { xFrac: 0.31, yBotFrac: 0.35, sizeFrac: 0.062 },
    { xFrac: 0.96, yBotFrac: 0.30, sizeFrac: 0.065 },
    { xFrac: 0.89, yBotFrac: 0.32, sizeFrac: 0.080 },
    { xFrac: 0.81, yBotFrac: 0.29, sizeFrac: 0.072 },
    { xFrac: 0.73, yBotFrac: 0.31, sizeFrac: 0.060 },
    { xFrac: 0.65, yBotFrac: 0.33, sizeFrac: 0.068 },
    { xFrac: 0.93, yBotFrac: 0.38, sizeFrac: 0.052 },
    { xFrac: 0.85, yBotFrac: 0.40, sizeFrac: 0.058 },
    { xFrac: 0.77, yBotFrac: 0.37, sizeFrac: 0.050 },
    { xFrac: 0.69, yBotFrac: 0.35, sizeFrac: 0.062 },
    { xFrac: 0.43, yBotFrac: 0.36, sizeFrac: 0.055 },
    { xFrac: 0.57, yBotFrac: 0.36, sizeFrac: 0.055 },
  ];

  sunFlowerField.forEach((fieldItem, index) => {
    fieldItem.phase = getRandomNumber(0, Math.PI * 2);
    fieldItem.swayAmp = getRandomNumber(0.018, 0.04);
    fieldItem.swaySpd = getRandomNumber(0.0004, 0.0008);
    fieldItem.alpha = 0;
    fieldItem.scale = fieldItem.isHero ? 1 : 0;
    fieldItem.id = index;
  });

  const seedsArray = [];
  let seedsReleasedState = false;

  const spawnSeedParticle = (sourceFlower) => {
    const startX = sourceFlower.xFrac * canvasWidth;
    const startY = canvasHeight - sourceFlower.yBotFrac * canvasHeight;
    seedsArray.push({
      x: startX, y: startY,
      vx: getRandomNumber(-1.5, 1.5),
      vy: getRandomNumber(-2.5, -1),
      gravity: 0.06,
      alpha: 1,
      r: getRandomNumber(3, 5.5),
      angle: getRandomNumber(0, Math.PI * 2),
      spin: getRandomNumber(-0.08, 0.08),
      done: false,
      tx: null, ty: null,
      phase: 'launch'
    });
  };

  const calculateMachineTarget = () => {
    const wrapRect = machineWrapper.getBoundingClientRect();
    const stickyRect = stickyContainer.getBoundingClientRect();
    return {
      tx: wrapRect.left - stickyRect.left + wrapRect.width * 0.38,
      ty: wrapRect.top - stickyRect.top + wrapRect.height * 0.25
    };
  };

  const drawSceneSunflower = (drawingContext, cx, cy, size, alpha, scale) => {
    if (alpha <= 0.01 || scale <= 0.01) return;
    drawingContext.save();
    drawingContext.globalAlpha = alpha;
    drawingContext.translate(cx, cy);
    drawingContext.scale(scale, scale);

    const petalCount = 14;
    const petalLen = size * 0.5;

    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      drawingContext.save();
      drawingContext.rotate(angle);
      const grad = drawingContext.createLinearGradient(0, 0, 0, -petalLen);
      grad.addColorStop(0, '#f9a825');
      grad.addColorStop(0.6, '#fdd835');
      grad.addColorStop(1, '#fff176');
      drawingContext.fillStyle = grad;
      drawingContext.beginPath();
      drawingContext.ellipse(0, -petalLen * 0.55, size * 0.1, petalLen * 0.5, 0, 0, Math.PI * 2);
      drawingContext.fill();
      drawingContext.restore();
    }

    const centerGrad = drawingContext.createRadialGradient(-size*0.06, -size*0.06, 0, 0, 0, size * 0.3);
    centerGrad.addColorStop(0, '#6d4c41');
    centerGrad.addColorStop(0.7, '#4e342e');
    centerGrad.addColorStop(1, '#3e2723');
    drawingContext.beginPath();
    drawingContext.arc(0, 0, size * 0.3, 0, Math.PI * 2);
    drawingContext.fillStyle = centerGrad;
    drawingContext.fill();

    drawingContext.fillStyle = 'rgba(255,255,255,0.06)';
    for (let d = 0; d < 20; d++) {
      const da = getRandomNumber(0, Math.PI * 2);
      const dr = getRandomNumber(0, size * 0.26);
      drawingContext.beginPath();
      drawingContext.arc(Math.cos(da)*dr, Math.sin(da)*dr, getRandomNumber(1, 2), 0, Math.PI*2);
      drawingContext.fill();
    }

    drawingContext.strokeStyle = '#388e3c';
    drawingContext.lineWidth = Math.max(3, size * 0.08);
    drawingContext.lineCap = 'round';
    drawingContext.beginPath();
    drawingContext.moveTo(0, size * 0.32);
    drawingContext.quadraticCurveTo(size * 0.08, size * 1.3, size * 0.04, size * 2.1);
    drawingContext.stroke();

    drawingContext.fillStyle = '#2e7d32';
    [[1, 0.9, 0.45], [-1, 1.3, -0.4]].forEach(([dir, stemY, ang]) => {
      drawingContext.save();
      drawingContext.translate(dir * size * 0.05, size * stemY);
      drawingContext.rotate(ang);
      drawingContext.beginPath();
      drawingContext.ellipse(0, 0, size * 0.32, size * 0.1, 0, 0, Math.PI * 2);
      drawingContext.fill();
      drawingContext.restore();
    });

    drawingContext.restore();
  };

  let currentProgress = 0;

  const updateScrollScene = (progressAmount) => {
    const heroFlower = sunFlowerField[0];
    if (progressAmount < 0.15) {
      heroFlower.alpha = 1;
      heroFlower.scale = linearInterpolate(1, 0.55, progressAmount / 0.15);
    } else {
      heroFlower.alpha = linearInterpolate(1, 0.3, (progressAmount - 0.15) / 0.15);
      heroFlower.scale = 0.55;
    }

    sunFlowerField.slice(1).forEach((fieldItem, index) => {
      const start = 0.10 + index * 0.022;
      const end = start + 0.08;
      fieldItem.alpha = Math.min(1, Math.max(0, (progressAmount - start) / (end - start)));
      fieldItem.scale = fieldItem.alpha;
    });

    if (progressAmount >= 0.54 && !seedsReleasedState) {
      seedsReleasedState = true;
      sunFlowerField.forEach(fieldItem => {
        const count = fieldItem.isHero ? 6 : 2;
        for (let k = 0; k < count; k++) {
          setTimeout(() => spawnSeedParticle(fieldItem), getRandomNumber(0, 600));
        }
      });
    }

    if (progressAmount >= 0.52) {
      const machineProgress = Math.min(1, (progressAmount - 0.52) / 0.10);
      gsap.set('#machine-wrap', { opacity: machineProgress, y: linearInterpolate(40, 0, machineProgress) });
    } else {
      gsap.set('#machine-wrap', { opacity: 0, y: 40 });
    }

    if (progressAmount >= 0.62) {
      const liquidProgress = Math.min(1, (progressAmount - 0.62) / 0.12);
      document.getElementById('machine-liquid').setAttribute('width', liquidProgress * 96);
      document.getElementById('liquid-dot').setAttribute('opacity', liquidProgress > 0.8 ? (liquidProgress - 0.8) * 5 : 0);
      document.getElementById('smoke-a').setAttribute('opacity', liquidProgress * 0.7);
      document.getElementById('smoke-b').setAttribute('opacity', liquidProgress * 0.5);
    }

    if (progressAmount >= 0.66) {
      const pipeProgress = Math.min(1, (progressAmount - 0.66) / 0.14);
      gsap.set('#pipe-svg', { opacity: pipeProgress });
      document.getElementById('pipe-liquid').setAttribute('width', pipeProgress * 1400);
      document.getElementById('pipe-shine').setAttribute('width', pipeProgress * 1400);
    } else {
      gsap.set('#pipe-svg', { opacity: 0 });
    }

    if (progressAmount >= 0.68) {
      const truckProgress = Math.min(1, (progressAmount - 0.68) / 0.14);
      const rightPx = linearInterpolate(-500, getWindowWidth() * 0.02, truckProgress);
      gsap.set('#truck-wrap', { opacity: truckProgress, right: rightPx });
    } else {
      gsap.set('#truck-wrap', { opacity: 0, right: -500 });
    }

    if (progressAmount >= 0.78) {
      const tankFillProgress = Math.min(1, (progressAmount - 0.78) / 0.10);
      document.getElementById('tank-fill').setAttribute('opacity', tankFillProgress * 0.9);
      document.getElementById('tank-shine').setAttribute('opacity', tankFillProgress * 0.8);
      document.getElementById('tank-label').setAttribute('opacity', tankFillProgress);
      document.getElementById('tank-sub').setAttribute('opacity', tankFillProgress);
    }

    if (progressAmount >= 0.87) {
      const finalProgress = Math.min(1, (progressAmount - 0.87) / 0.13);
      const revealContainer = document.getElementById('final-reveal');
      revealContainer.style.opacity = finalProgress;
      revealContainer.style.pointerEvents = finalProgress > 0.1 ? 'all' : 'none';
      const wordProgress = Math.min(1, (progressAmount - 0.89) / 0.10);
      const tagProgress = Math.min(1, (progressAmount - 0.88) / 0.06);
      const descProgress = Math.min(1, (progressAmount - 0.91) / 0.07);
      const ctaProgress = Math.min(1, (progressAmount - 0.93) / 0.07);
      gsap.set('#final-tag',  { opacity: tagProgress, y: linearInterpolate(20, 0, tagProgress) });
      gsap.set('#final-word', { opacity: wordProgress, scale: linearInterpolate(0.4, 1, wordProgress) });
      gsap.set('#final-desc', { opacity: descProgress });
      gsap.set('#final-cta',  { opacity: ctaProgress });
    } else {
      gsap.set('#final-reveal', { opacity: 0, pointerEvents: 'none' });
    }
  };

  ScrollTrigger.create({
    trigger: '#scene-section',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1.8,
    onUpdate(instance) {
      currentProgress = instance.progress;
      updateScrollScene(currentProgress);
    }
  });

  let machineTargetCoords = null;

  const updateSeedParticles = () => {
    if (!machineTargetCoords && machineWrapper.getBoundingClientRect().width > 0) {
      machineTargetCoords = calculateMachineTarget();
    }
    seedsArray.forEach(seed => {
      if (seed.done) return;
      if (seed.phase === 'launch') {
        seed.vy += seed.gravity;
        seed.x += seed.vx;
        seed.y += seed.vy;
        if (machineTargetCoords && seed.vy > 0.5) {
          seed.phase = 'fly';
        }
      } else if (seed.phase === 'fly' && machineTargetCoords) {
        const dx = machineTargetCoords.tx - seed.x;
        const dy = machineTargetCoords.ty - seed.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 12) {
          seed.done = true;
          seed.alpha = 0;
          return;
        }
        const speed = Math.min(8, dist * 0.07);
        seed.vx = linearInterpolate(seed.vx, (dx / dist) * speed, 0.08);
        seed.vy = linearInterpolate(seed.vy, (dy / dist) * speed, 0.08);
        seed.x += seed.vx;
        seed.y += seed.vy;
        seed.alpha = Math.min(1, dist / 120);
      }
      seed.angle += seed.spin;
    });
  };

  const renderSeedParticles = (drawingContext) => {
    seedsArray.forEach(seed => {
      if (seed.done || seed.alpha <= 0.01) return;
      drawingContext.save();
      drawingContext.globalAlpha = seed.alpha;
      drawingContext.translate(seed.x, seed.y);
      drawingContext.rotate(seed.angle);
      
      const seedGradient = drawingContext.createLinearGradient(-seed.r, -seed.r*1.6, seed.r, seed.r*1.6);
      seedGradient.addColorStop(0, '#6d4c41');
      seedGradient.addColorStop(1, '#3e2723');
      drawingContext.fillStyle = seedGradient;
      drawingContext.shadowColor = 'rgba(253,216,53,0.5)';
      drawingContext.shadowBlur = 6;
      drawingContext.beginPath();
      drawingContext.ellipse(0, 0, seed.r * 0.55, seed.r * 1.1, 0, 0, Math.PI * 2);
      drawingContext.fill();
      drawingContext.restore();
    });
  };

  const animateScene = (timestamp) => {
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    
    sunFlowerField.forEach(fieldItem => {
      const cx = fieldItem.xFrac * canvasWidth;
      const cy = canvasHeight - fieldItem.yBotFrac * canvasHeight;
      const size = (fieldItem.sizeFrac * Math.min(canvasWidth, canvasHeight));
      const sway = Math.sin(timestamp * fieldItem.swaySpd + fieldItem.phase) * fieldItem.swayAmp;
      context.save();
      context.translate(cx, cy + size * 2.1);
      context.rotate(sway);
      context.translate(-cx, -(cy + size * 2.1));
      drawSceneSunflower(context, cx, cy, size, fieldItem.alpha, fieldItem.scale);
      context.restore();
    });

    updateSeedParticles();
    renderSeedParticles(context);

    requestAnimationFrame(animateScene);
  };
  requestAnimationFrame(animateScene);

  let currentGearAngle = 0;
  const animateMachineGears = () => {
    currentGearAngle += 0.8;
    const gearLarge = document.getElementById('gear-big');
    const gearSmall = document.getElementById('gear-small');
    if (gearLarge) gearLarge.style.transform = `rotate(${currentGearAngle}deg)`;
    if (gearSmall) gearSmall.style.transform = `rotate(${-currentGearAngle * 1.5}deg)`;
    requestAnimationFrame(animateMachineGears);
  };
  animateMachineGears();
};

const initializeScrollReveal = () => {
  const elementsToReveal = document.querySelectorAll('.reveal');
  const visibilityObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const delay = Array.from(entry.target.parentElement?.children || [])
          .indexOf(entry.target) * 80;
        setTimeout(() => entry.target.classList.add('visible'), delay);
        visibilityObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  elementsToReveal.forEach(el => visibilityObserver.observe(el));
};

const animateHeroEntrance = () => {
  const timeline = gsap.timeline({ delay: 0.3 });
  timeline.from('.hero-eyebrow', { y: 20, opacity: 0, duration: 0.7, ease: 'power3.out' })
    .from('#hero-heading',  { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out' }, '-=0.4')
    .from('.hero-sub',      { y: 20, opacity: 0, duration: 0.7, ease: 'power3.out' }, '-=0.5')
    .from('#scroll-arrow',  { opacity: 0, duration: 0.6 }, '-=0.2');
};

const initializeModal = () => {
  const modalOverlay = document.getElementById('bio-overlay');
  const modalContainer = document.getElementById('bio-modal');
  const openButton = document.getElementById('modal-open-btn');
  const closeButton1 = document.getElementById('bio-close-btn');
  const closeButton2 = document.getElementById('bio-close-btn-2');

  if (!modalOverlay || !openButton) return;

  let savedBodyScrollY = 0;

  const lockBodyScroll = () => {
    savedBodyScrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedBodyScrollY}px`;
    document.body.style.width = '100%';
  };

  const unlockBodyScroll = () => {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, savedBodyScrollY);
  };

  const openInformationModal = () => {
    modalOverlay.removeAttribute('hidden');
    openButton.setAttribute('aria-expanded', 'true');
    lockBodyScroll();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        modalOverlay.classList.add('bio-open');
      });
    });

    const modalBody = document.getElementById('bio-modal-body');
    if (modalBody) modalBody.scrollTop = 0;

    setTimeout(() => {
      if (closeButton1) closeButton1.focus();
    }, 80);

    setTimeout(animateModalCards, 160);
  };

  const closeInformationModal = () => {
    modalOverlay.classList.remove('bio-open');
    openButton.setAttribute('aria-expanded', 'false');
    unlockBodyScroll();

    const transitionHandler = (event) => {
      if (event.target !== modalOverlay) return;
      modalOverlay.setAttribute('hidden', '');
      modalOverlay.removeEventListener('transitionend', transitionHandler);
    };
    modalOverlay.addEventListener('transitionend', transitionHandler);
    openButton.focus();
  };

  const animateModalCards = () => {
    const cardElements = modalContainer.querySelectorAll('.bio-stat, .bio-card, #bio-motivational');
    cardElements.forEach((element, index) => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(24px)';
      element.style.transition = 'none';
      setTimeout(() => {
        element.style.transition = `opacity 0.5s ease ${index * 65}ms, transform 0.5s cubic-bezier(.16,1,.3,1) ${index * 65}ms`;
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, 20);
    });
  };

  modalOverlay.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const focusableElements = Array.from(
      modalContainer.querySelectorAll('button:not([disabled]), [href], input, [tabindex]:not([tabindex="-1"])')
    ).filter(el => el.offsetParent !== null);
    if (!focusableElements.length) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (event.shiftKey) {
      if (document.activeElement === firstElement) { 
        event.preventDefault(); 
        lastElement.focus(); 
      }
    } else {
      if (document.activeElement === lastElement) { 
        event.preventDefault(); 
        firstElement.focus(); 
      }
    }
  });

  openButton.addEventListener('click', openInformationModal);
  closeButton1.addEventListener('click', closeInformationModal);
  if (closeButton2) closeButton2.addEventListener('click', closeInformationModal);

  modalOverlay.addEventListener('click', (event) => {
    if (event.target === modalOverlay) closeInformationModal();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modalOverlay.classList.contains('bio-open')) {
      closeInformationModal();
    }
  });

  modalOverlay.setAttribute('hidden', '');
};

initNavbarObserver();
initializeHeroCanvas();
initializeSceneAnimation();
initializeScrollReveal();
animateHeroEntrance();
initializeModal();
        
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("sidebar-toggle-btn");
  const closeBtn = document.getElementById("sidebar-close-btn");
  const sidebar = document.getElementById("custom-sidebar");
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");
  const litersInput = document.getElementById("calc-liters");

  let leafletMap = null;

  const pontosBiodieselPR = [
    { coords: [-25.4296, -49.2719], desc: "<strong>Curitiba</strong>" },
    { coords: [-24.9578, -53.4589], desc: "<strong>Cascavel (Coopavel)</strong>" },
    { coords: [-23.4210, -51.9331], desc: "<strong>Maringá (Cocamar)</strong>" },
    { coords: [-24.2834, -53.8392], desc: "<strong>Palotina (C.Vale)</strong>" },
    { coords: [-25.5919, -49.4103], desc: "<strong>Araucária</strong>" }
  ];

  function initParanaMap() {
    if (leafletMap) return;

    leafletMap = L.map('mapa-pr', { attributionControl: false }).setView([-24.6000, -51.5000], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(leafletMap);

    pontosBiodieselPR.forEach(ponto => {
      L.marker(ponto.coords).addTo(leafletMap).bindPopup(ponto.desc);
    });
  }

  function calcularEmissoes() {
    const litros = parseFloat(litersInput.value) || 0;
    const emissaoDiesel = litros * 2.67;
    const emissaoBiodiesel = emissaoDiesel * 0.22;
    const salvo = emissaoDiesel - emissaoBiodiesel;

    document.getElementById("res-diesel").innerText = `${emissaoDiesel.toFixed(1)} kg CO₂`;
    document.getElementById("res-biodiesel").innerText = `${emissaoBiodiesel.toFixed(1)} kg CO₂`;
    document.getElementById("res-saved").innerText = `${salvo.toFixed(1)} kg CO₂`;
  }

  toggleBtn.addEventListener("click", () => {
    sidebar.classList.remove("sidebar-hidden");
    if (document.getElementById("map-tab").classList.contains("active")) {
      setTimeout(() => {
        initParanaMap();
        leafletMap.invalidateSize();
      }, 300);
    }
  });

  closeBtn.addEventListener("click", () => {
    sidebar.classList.add("sidebar-hidden");
  });

  tabButtons.forEach(button => {
    button.addEventListener("click", () => {
      const targetTab = button.getAttribute("data-tab");

      tabButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      tabPanels.forEach(panel => {
        if (panel.id === targetTab) {
          panel.classList.add("active");
          if (targetTab === "map-tab") {
            setTimeout(() => {
              initParanaMap();
              leafletMap.invalidateSize();
            }, 50);
          }
        } else {
          panel.classList.remove("active");
        }
      });
    });
  });

  litersInput.addEventListener("input", calcularEmissoes);
  calcularEmissoes();
});
