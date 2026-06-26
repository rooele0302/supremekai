/**
 * Contact Tic-Tac-Toe
 * When the contact section scrolls into view, particles fly in to draw the
 * grid, then a game plays out automatically where X wins on a diagonal.
 */
(function () {
  const canvas = document.getElementById('game-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height, centerX, centerY;
  let particles = [];
  let started = false;
  let formProgress = 0;
  let gridFormed = false;
  let gameTime = 0;
  let lastTime = 0;

  // Board geometry (recomputed on resize)
  let boardSize, cell, boardX, boardY;

  const PARTICLE_COUNT = 160;

  // Sequence of moves — X wins on the 0,4,8 diagonal
  const moves = [
    { pos: 0, player: 'X' },
    { pos: 1, player: 'O' },
    { pos: 4, player: 'X' },
    { pos: 2, player: 'O' },
    { pos: 8, player: 'X' },
  ];
  const winLine = [0, 4, 8];

  const MOVE_INTERVAL = 0.65; // seconds between moves
  const MARK_DRAW = 0.45;     // seconds to draw a mark
  const WIN_DELAY = 0.4;      // pause before win line draws

  function computeBoard() {
    boardSize = Math.min(width, height) * 0.62;
    cell = boardSize / 3;
    boardX = centerX - boardSize / 2;
    boardY = centerY - boardSize / 2;
  }

  function resize() {
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
    width = canvas.width;
    height = canvas.height;
    centerX = width / 2;
    centerY = height / 2;
    computeBoard();
  }

  function cellCenter(pos) {
    const row = Math.floor(pos / 3);
    const col = pos % 3;
    return {
      x: boardX + col * cell + cell / 2,
      y: boardY + row * cell + cell / 2,
    };
  }

  // Distribute particle targets along the 4 grid lines
  function gridTarget(i, count) {
    const per = count / 4;
    const line = Math.floor(i / per);
    const t = (i % per) / per;
    if (line === 0) return { x: boardX + cell, y: boardY + t * boardSize };       // vertical 1
    if (line === 1) return { x: boardX + 2 * cell, y: boardY + t * boardSize };   // vertical 2
    if (line === 2) return { x: boardX + t * boardSize, y: boardY + cell };       // horizontal 1
    return { x: boardX + t * boardSize, y: boardY + 2 * cell };                   // horizontal 2
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const edge = Math.floor(Math.random() * 4);
      let sx, sy;
      if (edge === 0) { sx = Math.random() * width; sy = -20; }
      else if (edge === 1) { sx = width + 20; sy = Math.random() * height; }
      else if (edge === 2) { sx = Math.random() * width; sy = height + 20; }
      else { sx = -20; sy = Math.random() * height; }

      const target = gridTarget(i, PARTICLE_COUNT);
      particles.push({
        x: sx, y: sy,
        startX: sx, startY: sy,
        gx: target.x, gy: target.y,
        size: 1.2 + Math.random() * 2,
        delay: Math.random() * 0.35,
      });
    }
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function drawMarkX(c, progress) {
    const r = cell * 0.28;
    ctx.strokeStyle = '#00ff41';
    ctx.shadowColor = '#00ff41';
    ctx.shadowBlur = 12;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    // First stroke (top-left -> bottom-right): progress 0..0.5
    const p1 = Math.min(progress / 0.5, 1);
    ctx.beginPath();
    ctx.moveTo(c.x - r, c.y - r);
    ctx.lineTo(c.x - r + 2 * r * p1, c.y - r + 2 * r * p1);
    ctx.stroke();

    // Second stroke (top-right -> bottom-left): progress 0.5..1
    if (progress > 0.5) {
      const p2 = Math.min((progress - 0.5) / 0.5, 1);
      ctx.beginPath();
      ctx.moveTo(c.x + r, c.y - r);
      ctx.lineTo(c.x + r - 2 * r * p2, c.y - r + 2 * r * p2);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }

  function drawMarkO(c, progress) {
    const r = cell * 0.26;
    ctx.strokeStyle = '#00ffff';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 10;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(c.x, c.y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function draw(now) {
    const dt = lastTime ? (now - lastTime) / 1000 : 0;
    lastTime = now;

    ctx.clearRect(0, 0, width, height);

    // 1) Particles converge into grid
    if (formProgress < 1) formProgress += 0.01;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const local = Math.max(0, (formProgress - p.delay) / (1 - p.delay));
      const t = easeInOutCubic(Math.min(local, 1));
      p.x = p.startX + (p.gx - p.startX) * t;
      p.y = p.startY + (p.gy - p.startY) * t;

      if (t >= 1) {
        p.x = p.gx + Math.sin(now * 0.001 + i) * 1.2;
        p.y = p.gy + Math.cos(now * 0.0008 + i * 0.5) * 1.2;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 255, 65, ${0.35 + t * 0.55})`;
      ctx.shadowColor = '#00ff41';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    if (formProgress >= 1 && !gridFormed) gridFormed = true;

    // 2) Play out the game
    if (gridFormed) {
      gameTime += dt;

      for (let m = 0; m < moves.length; m++) {
        const moveStart = m * MOVE_INTERVAL;
        if (gameTime < moveStart) continue;
        const progress = Math.min((gameTime - moveStart) / MARK_DRAW, 1);
        const c = cellCenter(moves[m].pos);
        if (moves[m].player === 'X') drawMarkX(c, progress);
        else drawMarkO(c, progress);
      }

      // 3) Winning line
      const allMovesDone = (moves.length - 1) * MOVE_INTERVAL + MARK_DRAW;
      const winStart = allMovesDone + WIN_DELAY;
      if (gameTime > winStart) {
        const wp = Math.min((gameTime - winStart) / 0.6, 1);
        const a = cellCenter(winLine[0]);
        const b = cellCenter(winLine[winLine.length - 1]);
        const pulse = 0.6 + Math.sin(now * 0.006) * 0.4;

        ctx.strokeStyle = `rgba(57, 255, 20, ${pulse})`;
        ctx.shadowColor = '#39ff14';
        ctx.shadowBlur = 20;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(a.x + (b.x - a.x) * wp, a.y + (b.y - a.y) * wp);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // "X WINS" label
        if (wp >= 1) {
          ctx.globalAlpha = Math.min((gameTime - winStart - 0.6) / 0.5, 1);
          ctx.fillStyle = '#39ff14';
          ctx.font = "700 1.4rem 'Orbitron', sans-serif";
          ctx.textAlign = 'center';
          ctx.shadowColor = '#39ff14';
          ctx.shadowBlur = 15;
          ctx.fillText('X WINS', centerX, boardY - 20);
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
        }
      }
    }

    requestAnimationFrame(draw);
  }

  function start() {
    if (started) return;
    started = true;
    resize();
    initParticles();
    formProgress = 0;
    gridFormed = false;
    gameTime = 0;
    lastTime = 0;
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => {
    if (!started) return;
    resize();
    particles.forEach((p, i) => {
      const target = gridTarget(i, PARTICLE_COUNT);
      p.gx = target.x;
      p.gy = target.y;
    });
  });

  // Trigger when contact section enters view
  window.addEventListener('portfolio-enter', () => {
    const contact = document.getElementById('contact');
    if (!contact) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            start();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(contact);
  });
})();
