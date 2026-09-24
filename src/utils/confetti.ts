/**
 * 轻量级全屏庆祝撒花与星光动画（纯 Canvas 实现，零外部依赖，流畅 60fps）
 */
export function fireConfetti(durationMs = 2800) {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }
  const context = ctx;

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const onResize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', onResize);

  // 温柔护眼的家庭庆祝配色：暖金、雾霾蓝、暖杏、嫩芽绿、柔鹅黄、珊瑚金
  const colors = ['#E2B258', '#5B8EA6', '#D98867', '#7BB07B', '#E5C475', '#EAA78A', '#80A896'];

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    rotation: number;
    rotationSpeed: number;
    type: 'rect' | 'circle' | 'star';
    opacity: number;
  }

  const particles: Particle[] = [];
  const count = 120;

  for (let i = 0; i < count; i++) {
    const speed = Math.random() * 12 + 6;
    particles.push({
      x: width * (0.3 + Math.random() * 0.4),
      y: height * 0.7,
      vx: (Math.random() - 0.5) * 14,
      vy: -speed,
      size: Math.random() * 8 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      type: Math.random() > 0.4 ? 'rect' : Math.random() > 0.5 ? 'circle' : 'star',
      opacity: 1,
    });
  }

  const startTime = performance.now();
  let animationFrameId: number;

  function render(now: number) {
    const elapsed = now - startTime;
    const progress = elapsed / durationMs;

    if (progress >= 1) {
      window.removeEventListener('resize', onResize);
      canvas.remove();
      return;
    }

    context.clearRect(0, 0, width, height);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // 重力
      p.vx *= 0.985; // 空气阻力
      p.rotation += p.rotationSpeed;

      // 渐隐效果
      if (progress > 0.6) {
        p.opacity = Math.max(0, 1 - (progress - 0.6) / 0.4);
      }

      context.save();
      context.translate(p.x, p.y);
      context.rotate((p.rotation * Math.PI) / 180);
      context.globalAlpha = p.opacity;
      context.fillStyle = p.color;

      if (p.type === 'rect') {
        context.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      } else if (p.type === 'circle') {
        context.beginPath();
        context.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        context.fill();
      } else {
        // 小星星
        context.beginPath();
        for (let s = 0; s < 5; s++) {
          context.lineTo(Math.cos(((18 + s * 72) * Math.PI) / 180) * p.size * 0.7, -Math.sin(((18 + s * 72) * Math.PI) / 180) * p.size * 0.7);
          context.lineTo(Math.cos(((54 + s * 72) * Math.PI) / 180) * (p.size * 0.35), -Math.sin(((54 + s * 72) * Math.PI) / 180) * (p.size * 0.35));
        }
        context.closePath();
        context.fill();
      }

      context.restore();
    }

    animationFrameId = requestAnimationFrame(render);
  }

  animationFrameId = requestAnimationFrame(render);
}
