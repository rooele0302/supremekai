/**
 * Matrix Digital Rain - Entrance Animation
 * Creates the classic green falling code effect on a canvas.
 */
(function () {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let columns, drops;
  const FONT_SIZE = 16;
  const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF<>{}[]|/\\=+*&^%$#@!';

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    columns = Math.floor(canvas.width / FONT_SIZE);
    drops = Array.from({ length: columns }, () => Math.random() * -100);
  }

  function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < columns; i++) {
      const char = CHARS[Math.floor(Math.random() * CHARS.length)];
      const x = i * FONT_SIZE;
      const y = drops[i] * FONT_SIZE;

      // Head character is brighter
      const brightness = Math.random();
      if (brightness > 0.95) {
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#00ff41';
        ctx.shadowBlur = 15;
      } else if (brightness > 0.8) {
        ctx.fillStyle = '#00ff41';
        ctx.shadowColor = '#00ff41';
        ctx.shadowBlur = 8;
      } else {
        ctx.fillStyle = `rgba(0, 255, 65, ${0.3 + Math.random() * 0.5})`;
        ctx.shadowBlur = 0;
      }

      ctx.font = `${FONT_SIZE}px 'Share Tech Mono', monospace`;
      ctx.fillText(char, x, y);
      ctx.shadowBlur = 0;

      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  resize();
  window.addEventListener('resize', resize);

  let animId;
  function animate() {
    draw();
    animId = requestAnimationFrame(animate);
  }
  animate();

  // Entrance transition logic
  const entrance = document.getElementById('matrix-entrance');
  const portfolio = document.getElementById('portfolio');
  const enterBtn = document.getElementById('enter-btn');

  function enterSite() {
    if (entrance.classList.contains('exit')) return;
    entrance.classList.add('exit');

    setTimeout(() => {
      cancelAnimationFrame(animId);
      entrance.style.display = 'none';
      portfolio.classList.remove('hidden');
      portfolio.style.opacity = '0';
      requestAnimationFrame(() => {
        portfolio.style.transition = 'opacity 1s ease';
        portfolio.style.opacity = '1';
      });
      window.dispatchEvent(new Event('portfolio-enter'));
    }, 1200);
  }

  enterBtn.addEventListener('click', enterSite);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') enterSite();
  });
})();
