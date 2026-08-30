/**
 * ObstacleManager - Manages all ground hurdles, low branches, vehicles, and hazards
 */
class ObstacleManager {
  constructor() {
    this.obstacles = [];
  }

  clear() {
    this.obstacles = [];
  }

  add(type, x, y, options = {}) {
    let width = 32;
    let height = 32;
    let vx = options.vx || 0;
    let vy = options.vy || 0;
    let requiresSlide = false;
    let isFalling = options.isFalling || false;

    switch (type) {
      case 'pothole':
        width = 40;
        height = 14;
        break;
      case 'branch':
        width = 44;
        height = 16;
        break;
      case 'rock':
        width = 32;
        height = 22;
        break;
      case 'coconut':
        width = 18;
        height = 18;
        break;
      case 'lowBranch':
        width = 60;
        height = 24;
        requiresSlide = true;
        break;
      case 'crate':
        width = 36;
        height = 20;
        break;
      case 'bus':
        width = 130;
        height = 56;
        vx = options.vx !== undefined ? options.vx : -80;
        break;
      case 'rickshaw':
        width = 66;
        height = 42;
        vx = options.vx !== undefined ? options.vx : -60;
        break;
      case 'motorbike':
        width = 52;
        height = 38;
        vx = options.vx !== undefined ? options.vx : -110;
        break;
      case 'car':
        width = 80;
        height = 40;
        vx = options.vx !== undefined ? options.vx : -90;
        break;
      case 'fallingCoconut':
        width = 18;
        height = 18;
        isFalling = true;
        vy = 0;
        break;
    }

    this.obstacles.push({
      type,
      x,
      y,
      baseY: y,
      width,
      height,
      vx,
      vy,
      requiresSlide,
      isFalling,
      triggered: false,
      active: true,
      passed: false
    });
  }

  update(dt, player, particleSystem, camera) {
    for (let i = 0; i < this.obstacles.length; i++) {
      const obs = this.obstacles[i];
      if (!obs.active) continue;

      // 1. Update vehicle / moving obstacle position
      if (obs.vx !== 0) {
        obs.x += obs.vx * dt;

        // Emit exhaust smoke from vehicles
        if (particleSystem && Math.random() < 0.1) {
          if (obs.type === 'bus' || obs.type === 'rickshaw' || obs.type === 'motorbike') {
            particleSystem.emitExhaust(obs.x + obs.width, obs.y + obs.height - 8);
          }
        }
      }

      // 2. Falling Coconuts / Branches (Triggered when player approaches)
      if (obs.isFalling) {
        if (!obs.triggered && Math.abs(player.x - obs.x) < 180) {
          obs.triggered = true;
        }
        if (obs.triggered) {
          obs.vy += 750 * dt;
          obs.y += obs.vy * dt;
          if (obs.y >= obs.baseY) {
            obs.y = obs.baseY;
            obs.vy = 0;
            obs.isFalling = false;
            if (particleSystem) {
              particleSystem.emitWaterSplash(obs.x + 8, obs.y + 12, 3);
            }
          }
        }
      }

      // 3. Mark obstacle as passed
      if (!obs.passed && player.x > obs.x + obs.width) {
        obs.passed = true;
      }
    }
  }

  // Check collision against player
  checkCollisions(player, camera) {
    const pHitbox = player.getHitbox();

    for (let i = 0; i < this.obstacles.length; i++) {
      const obs = this.obstacles[i];
      if (!obs.active) continue;

      // Check AABB Overlap
      let obsBox = {
        x: obs.x + 4,
        y: obs.y + 2,
        width: obs.width - 8,
        height: obs.height - 4
      };

      // If lowBranch requires slide, check if player is successfully sliding underneath
      if (obs.requiresSlide) {
        if (player.isSliding) {
          // Slide hitbox is low, player safely slides underneath!
          continue;
        }
      }

      const isColliding = (
        pHitbox.x < obsBox.x + obsBox.width &&
        pHitbox.x + pHitbox.width > obsBox.x &&
        pHitbox.y < obsBox.y + obsBox.height &&
        pHitbox.y + pHitbox.height > obsBox.y
      );

      if (isColliding) {
        const hit = player.takeDamage(1);
        if (hit && camera) {
          camera.shake(0.3, 8);
        }
      }
    }
  }

  render(ctx, camera) {
    const spCache = window.sprites.cache;

    for (let i = 0; i < this.obstacles.length; i++) {
      const obs = this.obstacles[i];
      if (!obs.active) continue;

      // World-space culling based on camera view
      if (obs.x < camera.x - 200 || obs.x > camera.x + camera.viewportWidth + 200) {
        continue;
      }

      const drawX = Math.floor(obs.x);
      const drawY = Math.floor(obs.y);

      ctx.save();

      switch (obs.type) {
        case 'pothole':
          if (spCache.obstacles.pothole) {
            ctx.drawImage(spCache.obstacles.pothole, drawX, drawY);
          }
          break;
        case 'branch':
          if (spCache.obstacles.branch) {
            ctx.drawImage(spCache.obstacles.branch, drawX, drawY);
          }
          break;
        case 'lowBranch':
          if (spCache.obstacles.lowBranch) {
            ctx.drawImage(spCache.obstacles.lowBranch, drawX, drawY);
          }
          break;
        case 'rock':
          if (spCache.obstacles.rock) {
            ctx.drawImage(spCache.obstacles.rock, drawX, drawY);
          }
          break;
        case 'coconut':
        case 'fallingCoconut':
          if (spCache.obstacles.coconut) {
            ctx.drawImage(spCache.obstacles.coconut, drawX, drawY);
          }
          break;
        case 'crate':
          if (spCache.obstacles.crate) {
            ctx.drawImage(spCache.obstacles.crate, drawX, drawY);
          }
          break;
        case 'bus':
          if (spCache.vehicles.bus) {
            ctx.drawImage(spCache.vehicles.bus, drawX, drawY);
          }
          break;
        case 'rickshaw':
          if (spCache.vehicles.rickshaw) {
            ctx.drawImage(spCache.vehicles.rickshaw, drawX, drawY);
          }
          break;
        case 'motorbike':
          if (spCache.vehicles.motorbike) {
            ctx.drawImage(spCache.vehicles.motorbike, drawX, drawY);
          }
          break;
        case 'car':
          if (spCache.vehicles.car) {
            ctx.drawImage(spCache.vehicles.car, drawX, drawY);
          }
          break;
      }

      ctx.restore();
    }
  }
}
