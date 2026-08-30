/**
 * Player - Modern Young Kerala Guy Runner
 * Handles movement physics, jumping, sliding hitbox, animations, health and invulnerability.
 */
class Player {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = 80;
    this.y = 240;
    this.vx = 180;
    this.vy = 0;

    // Speeds & Physics (Smooth, predictable arcade tuning)
    this.baseRunSpeed = 180;
    this.maxSpeed = 240;
    this.minSpeed = 110;
    this.jumpForce = -390;
    this.gravity = 980;

    // Dimensions & Hitboxes
    this.width = 24;
    this.height = 42;
    this.slideWidth = 32;
    this.slideHeight = 18;

    // States
    this.isGrounded = false;
    this.isJumping = false;
    this.isSliding = false;
    this.slideTimer = 0;
    this.maxSlideDuration = 0.6;

    // Health & Invulnerability
    this.maxHealth = 3;
    this.health = 3;
    this.invulnerableTimer = 0;
    this.isDead = false;
    this.isVictorious = false;

    // Animation state
    this.state = 'idle'; // 'idle', 'run', 'jump', 'fall', 'slide', 'hurt', 'victory'
    this.animTimer = 0;
    this.animFrame = 0;

    // Ground reference: road surface baseline
    this.groundY = 240;
  }

  update(dt, input, weather, particleSystem) {
    if (this.isDead) {
      this.vy += this.gravity * dt;
      this.y += this.vy * dt;
      return;
    }

    if (this.isVictorious) {
      this.state = 'victory';
      this.vx = 0;
      this.vy = 0;
      return;
    }

    // 1. Invulnerability timer countdown
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
    }

    // 2. Horizontal Movement (Smooth Forward Runner with Steering)
    let targetSpeed = this.baseRunSpeed;
    if (input.isDown('right')) {
      targetSpeed = this.maxSpeed;
    } else if (input.isDown('left')) {
      targetSpeed = this.minSpeed;
    }

    // Weather wind resistance during storm & flood
    if (weather && weather.stage >= 3) {
      targetSpeed -= weather.wind * 3.5;
    }

    // Slide state friction
    if (this.isSliding) {
      targetSpeed = Math.max(140, targetSpeed * 0.95);
    }

    // Smooth horizontal acceleration
    this.vx += (targetSpeed - this.vx) * Math.min(1, dt * 10);
    this.x += this.vx * dt;

    // 3. Sliding Logic
    if (input.isDown('slide') && this.isGrounded && !this.isSliding) {
      this.isSliding = true;
      this.slideTimer = this.maxSlideDuration;
      window.audio.playSlide();
      if (particleSystem) {
        particleSystem.emitWaterSplash(this.x + 10, this.y + this.height, 4);
      }
    }

    if (this.isSliding) {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0 || !input.isDown('slide')) {
        this.isSliding = false;
      }
    }

    // 4. Jumping Logic
    if (input.justPressed('jump') && this.isGrounded && !this.isSliding) {
      this.vy = this.jumpForce;
      this.isGrounded = false;
      this.isJumping = true;
      window.audio.playJump();
      if (particleSystem) {
        particleSystem.emitWaterSplash(this.x + 10, this.y + this.height, 4);
      }
    }

    // Variable jump height: releasing jump early softens the apex
    if (!input.isDown('jump') && this.vy < -100) {
      this.vy += 650 * dt;
    }

    // 5. Gravity & Vertical Movement
    this.vy += this.gravity * dt;
    this.y += this.vy * dt;

    // Ground Collision (Baseline)
    if (this.y >= this.groundY) {
      this.y = this.groundY;
      this.vy = 0;
      this.isGrounded = true;
      this.isJumping = false;
    } else {
      this.isGrounded = false;
    }

    // 6. Water splash particles while sprinting on wet road
    if (this.isGrounded && particleSystem && weather && weather.stage >= 1) {
      if (Math.random() < (weather.stage * 0.12)) {
        particleSystem.emitWaterSplash(this.x + 8, this.y + this.height, 2);
      }
    }

    // 7. Update Animation State
    this.updateAnimation(dt);
  }

  updateAnimation(dt) {
    if (this.invulnerableTimer > 0.8) {
      this.state = 'hurt';
    } else if (this.isSliding) {
      this.state = 'slide';
    } else if (!this.isGrounded) {
      this.state = this.vy < 0 ? 'jump' : 'fall';
    } else {
      this.state = 'run';
    }

    this.animTimer += dt;
    const frameRate = this.state === 'run' ? 0.08 : 0.15;
    if (this.animTimer >= frameRate) {
      this.animTimer = 0;
      this.animFrame++;
    }
  }

  takeDamage(amount = 1) {
    if (this.invulnerableTimer > 0 || this.isDead || this.isVictorious) return false;

    this.health -= amount;
    this.invulnerableTimer = 1.4; // 1.4 seconds of invulnerability
    window.audio.playHurt();

    if (this.health <= 0) {
      this.health = 0;
      this.isDead = true;
      this.vy = -260; // Death pop
      window.audio.playGameOver();
    }
    return true;
  }

  getHitbox() {
    if (this.isSliding) {
      return {
        x: this.x + 2,
        y: this.y + 24,
        width: this.slideWidth,
        height: this.slideHeight
      };
    }
    return {
      x: this.x + 6,
      y: this.y + 4,
      width: this.width,
      height: this.height - 4
    };
  }

  render(ctx) {
    // Note: Rendered inside camera world transform
    const drawX = Math.floor(this.x);
    const drawY = Math.floor(this.y);

    // Flashing effect during invulnerability
    if (this.invulnerableTimer > 0 && Math.floor(Date.now() / 60) % 2 === 0) {
      return;
    }

    ctx.save();

    // Shadow on ground
    if (this.isGrounded || this.y < this.groundY) {
      const shadowDist = Math.max(0, this.groundY - this.y);
      const shadowAlpha = Math.max(0.1, 0.4 - shadowDist * 0.003);
      const shadowWidth = Math.max(14, this.width - shadowDist * 0.08);

      ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
      ctx.beginPath();
      ctx.ellipse(drawX + 16, Math.floor(this.groundY + 44), shadowWidth, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw sprite from SpriteManager cache
    let sprite = null;
    const pCache = window.sprites.cache.player;

    if (this.state === 'slide') {
      sprite = pCache.slide[0];
    } else if (this.state === 'jump') {
      sprite = pCache.jump[0];
    } else if (this.state === 'fall') {
      sprite = pCache.fall[0];
    } else if (this.state === 'hurt') {
      sprite = pCache.hurt[0];
    } else if (this.state === 'victory') {
      const idx = this.animFrame % pCache.victory.length;
      sprite = pCache.victory[idx];
    } else {
      // Run cycle
      const idx = this.animFrame % pCache.run.length;
      sprite = pCache.run[idx];
    }

    if (sprite) {
      ctx.drawImage(sprite, drawX, drawY);
    }

    ctx.restore();
  }
}
