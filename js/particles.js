/**
 * ParticleSystem - High-performance Object-Pooled Particle Engine
 */
class ParticleSystem {
  constructor(maxParticles = 800) {
    this.maxParticles = maxParticles;
    this.pool = [];
    this.activeParticles = [];

    // Pre-allocate pool
    for (let i = 0; i < maxParticles; i++) {
      this.pool.push({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 2,
        color: '#fff',
        alpha: 1,
        life: 0,
        maxLife: 1,
        type: 'default'
      });
    }
  }

  spawn(type, x, y, vx, vy, color, size, life) {
    let p = this.pool.pop();
    if (!p) {
      p = this.activeParticles.shift();
    }
    if (!p) return;

    p.active = true;
    p.type = type;
    p.x = x;
    p.y = y;
    p.vx = vx;
    p.vy = vy;
    p.color = color;
    p.size = size;
    p.life = life;
    p.maxLife = life;
    p.alpha = 1;

    this.activeParticles.push(p);
  }

  emitCoinSparkles(x, y) {
    const colors = ['#f1c40f', '#f39c12', '#ffffff', '#e67e22'];
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8 + (Math.random() * 0.4 - 0.2);
      const speed = 1.5 + Math.random() * 2.0;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 1.0;
      const col = colors[Math.floor(Math.random() * colors.length)];
      this.spawn('sparkle', x, y, vx, vy, col, 2 + Math.random() * 2, 0.4);
    }
  }

  emitWaterSplash(x, y, count = 4) {
    for (let i = 0; i < count; i++) {
      const vx = (Math.random() - 0.5) * 2.5 - 0.8;
      const vy = -(1.5 + Math.random() * 2.0);
      const col = Math.random() > 0.4 ? 'rgba(116, 185, 255, 0.8)' : 'rgba(255, 255, 255, 0.9)';
      this.spawn('splash', x, y, vx, vy, col, 2, 0.25);
    }
  }

  emitExhaust(x, y) {
    const vx = -(1.5 + Math.random() * 1.5);
    const vy = -(0.2 + Math.random() * 0.5);
    this.spawn('smoke', x, y, vx, vy, 'rgba(149, 165, 166, 0.6)', 3 + Math.random() * 2, 0.5);
  }

  update(dt, camera, groundY = 240) {
    for (let i = this.activeParticles.length - 1; i >= 0; i--) {
      const p = this.activeParticles[i];
      p.life -= dt;

      if (p.life <= 0) {
        p.active = false;
        this.activeParticles.splice(i, 1);
        this.pool.push(p);
        continue;
      }

      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      p.alpha = Math.max(0, p.life / p.maxLife);

      if (p.type === 'splash' || p.type === 'sparkle') {
        p.vy += 0.15;
      } else if (p.type === 'smoke') {
        p.size += dt * 3;
      }
    }
  }

  render(ctx, camera) {
    ctx.save();
    for (let i = 0; i < this.activeParticles.length; i++) {
      const p = this.activeParticles[i];

      // World-space culling
      if (p.x < camera.x - 50 || p.x > camera.x + camera.viewportWidth + 50) {
        continue;
      }

      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
    }
    ctx.restore();
  }

  clear() {
    while (this.activeParticles.length > 0) {
      const p = this.activeParticles.pop();
      p.active = false;
      this.pool.push(p);
    }
  }
}
