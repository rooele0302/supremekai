/**
 * Light Speed Entrance
 * A green dot follows the cursor. On click, it bursts into a hyperspace
 * warp — streaks of light accelerating outward — then launches into the site.
 */
(function () {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height, centerX, centerY;
  let animId;
  let phase = 'waiting'; // waiting -> warp -> done
  let warpTime = 0;

  // Cursor-following dot
  let dot = { x: 0, y: 0, tx: 0, ty: 0 };
  let pulseTime = 0;

  // Warp star streaks
  let stars = [];
  const STAR_COUNT = 400;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    width = canvas.width;
    height = canvas.height;
    centerX = width / 2;
    centerY = height / 2;
  }

  function initStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      stars.push({
        angle,
        dist: Math.random() * 30,        // start near center
        speed: 4 + Math.random() * 10,
        len: 0,
        size: 0.6 + Math.random() * 1.6,
        hue: Math.random() > 0.3 ? 'green' : 'white',
      });
    }
  }

  function drawWaiting() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    // Smoothly follow cursor
    dot.x += (dot.tx - dot.x) * 0.12;
    dot.y += (dot.ty - dot.y) * 0.12;

    pulseTime += 0.04;
    const scale = 1 + Math.sin(pulseTime * 2) * 0.25;
    const radius = 7 * scale;

    // Trailing glow toward center (hint of the portal)
    const glow = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, radius * 6);
    glow.addColorStop(0, 'rgba(0, 255, 65, 0.45)');
    glow.addColorStop(1, 'rgba(0, 255, 65, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, radius * 6, 0, Math.PI * 2);
    ctx.fill();

    // Core dot
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#00ff41';
    ctx.shadowColor = '#00ff41';
    ctx.shadowBlur = 25;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function drawWarp() {
    warpTime += 0.016;

    // Acceleration curve — slow build then explosive
    const accel = Math.pow(warpTime / 1.6, 2.2);

    // Motion blur fade
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(0, 0, width, height);

    const maxDim = Math.max(width, height);

    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      s.dist += s.speed * (1 + accel * 12);
      s.len = s.speed * (1 + accel * 18);

      const x1 = centerX + Math.cos(s.angle) * s.dist;
      const y1 = centerY + Math.sin(s.angle) * s.dist;
      const x2 = centerX + Math.cos(s.angle) * (s.dist - s.len);
      const y2 = centerY + Math.sin(s.angle) * (s.dist - s.len);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      const alpha = Math.min(1, 0.3 + accel);
      ctx.strokeStyle = s.hue === 'white'
        ? `rgba(220, 255, 220, ${alpha})`
        : `rgba(0, 255, 65, ${alpha})`;
      ctx.lineWidth = s.size * (1 + accel * 1.5);
      ctx.stroke();

      // Recycle stars that fly off screen
      if (s.dist > maxDim) {
        s.dist = Math.random() * 20;
        s.angle = Math.random() * Math.PI * 2;
      }
    }

    // Soft burst of color near the end (no blinding white flash)
    if (warpTime > 1.0) {
      const f = Math.min(1, (warpTime - 1.0) / 0.6);
      const burst = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, Math.max(width, height) * 0.7
      );
      burst.addColorStop(0, `rgba(80, 255, 140, ${0.45 * f})`);
      burst.addColorStop(0.35, `rgba(0, 220, 160, ${0.3 * f})`);
      burst.addColorStop(0.7, `rgba(0, 150, 200, ${0.15 * f})`);
      burst.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = burst;
      ctx.fillRect(0, 0, width, height);
    }
  }

  function animate() {
    if (phase === 'waiting') drawWaiting();
    else if (phase === 'warp') drawWarp();
    animId = requestAnimationFrame(animate);
  }

  resize();
  window.addEventListener('resize', resize);

  // Init dot at center
  dot.x = dot.tx = centerX;
  dot.y = dot.ty = centerY;

  // Track cursor
  window.addEventListener('mousemove', (e) => {
    if (phase !== 'waiting') return;
    dot.tx = e.clientX;
    dot.ty = e.clientY;
  });

  animate();

  // Entrance logic
  const entrance = document.getElementById('matrix-entrance');
  const portfolio = document.getElementById('portfolio');
  const enterBtn = document.getElementById('enter-btn');

  function enterSite() {
    if (phase !== 'waiting') return;
    phase = 'warp';
    warpTime = 0;
    initStars();

    // Hide overlay text instantly-ish
    const overlay = document.getElementById('matrix-overlay');
    overlay.style.transition = 'opacity 0.3s ease';
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';

    // Light-speed jump lasts ~1.6s, then reveal site
    setTimeout(() => {
      cancelAnimationFrame(animId);
      phase = 'done';
      entrance.style.transition = 'opacity 0.5s ease';
      entrance.style.opacity = '0';

      setTimeout(() => {
        entrance.style.display = 'none';
        portfolio.classList.remove('hidden');
        portfolio.style.opacity = '0';
        requestAnimationFrame(() => {
          portfolio.style.transition = 'opacity 0.8s ease';
          portfolio.style.opacity = '1';
        });
        window.dispatchEvent(new Event('portfolio-enter'));
      }, 500);
    }, 1600);
  }

  enterBtn.addEventListener('click', enterSite);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') enterSite();
  });
})();
