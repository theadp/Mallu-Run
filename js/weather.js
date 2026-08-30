/**
 * WeatherSystem - Dynamic Kerala Monsoon Engine
 * Controls weather stages, rain particles, wind physics, lightning flashes, and flood mechanics.
 */
class WeatherSystem {
  constructor() {
    this.stage = 0; // 0: CLEAR, 1: LIGHT RAIN, 2: HEAVY RAIN, 3: STORM, 4: FLOOD
    this.stageNames = ['CLEAR', 'LIGHT RAIN', 'HEAVY RAIN', 'STORM', 'FLOOD'];

    this.wind = 0; // Horizontal force
    this.rainDensity = 0; // Number of rain streaks
    this.maxRainDrops = 450;
    this.rainDrops = [];

    // Lightning parameters
    this.lightningAlpha = 0;
    this.lightningTimer = 0;
    this.nextLightningTime = 8 + Math.random() * 8;

    // Flood parameters (Level 4 / Extreme)
    this.floodWaterY = 400; // Below screen initially
    this.floodWavePhase = 0;
    this.floodSurgeX = -600; // Flood chase surge approaching from the left

    this.initRainPool();
  }

  initRainPool() {
    this.rainDrops = [];
    for (let i = 0; i < this.maxRainDrops; i++) {
      this.rainDrops.push({
        x: Math.random() * 800,
        y: Math.random() * 400,
        length: 8 + Math.random() * 8,
        speed: 8 + Math.random() * 6,
        alpha: 0.4 + Math.random() * 0.4
      });
    }
  }

  setStage(stage, playerX = 0) {
    const prevStage = this.stage;
    this.stage = Math.max(0, Math.min(4, stage));
    window.audio.updateWeatherStage(this.stage);

    if (prevStage !== 4 && this.stage === 4) {
      // Stage 4 Flood Climax begins!
      this.floodSurgeX = playerX > 0 ? playerX - 350 : -350;
      this.floodWaterY = 360;
    }

    switch (this.stage) {
      case 0: // CLEAR
        this.wind = 0.5;
        this.rainDensity = 0;
        break;
      case 1: // LIGHT RAIN
        this.wind = 1.8;
        this.rainDensity = 90;
        break;
      case 2: // HEAVY RAIN
        this.wind = 3.2;
        this.rainDensity = 220;
        break;
      case 3: // STORM
        this.wind = 5.5;
        this.rainDensity = 380;
        break;
      case 4: // FLOOD / DELUGE
        this.wind = 7.0;
        this.rainDensity = 450;
        break;
    }
  }

  update(dt, camera, isFloodLevel = false, playerX = 0) {
    // 1. Update Rain Particles
    const vw = camera.viewportWidth;
    const vh = camera.viewportHeight;

    for (let i = 0; i < this.rainDensity; i++) {
      const drop = this.rainDrops[i];
      drop.x += (drop.speed * 0.4 + this.wind) * dt * 60;
      drop.y += drop.speed * dt * 60;

      // Wrap around viewport
      if (drop.y > vh + 20) {
        drop.y = -20;
        drop.x = Math.random() * (vw + 200) - 100;
      }
      if (drop.x > vw + 100) {
        drop.x = -50;
      }
    }

    // 2. Lightning Flash Logic (Stages 3 & 4)
    if (this.stage >= 3) {
      this.lightningTimer += dt;
      if (this.lightningTimer >= this.nextLightningTime) {
        this.triggerLightning(camera);
        this.lightningTimer = 0;
        this.nextLightningTime = 4 + Math.random() * 7;
      }
    }

    if (this.lightningAlpha > 0) {
      this.lightningAlpha = Math.max(0, this.lightningAlpha - dt * 4.5);
    }

    // 3. Flood Simulation (For Level 4 / Stage 4 Climax)
    if (isFloodLevel && this.stage === 4) {
      this.floodWavePhase += dt * 5;
      // Rising water baseline
      if (this.floodWaterY > 285) {
        this.floodWaterY -= dt * 3.5;
      }
      // Flood surge chases from left, slowly advancing towards player
      if (this.floodSurgeX < playerX - 180) {
        this.floodSurgeX += dt * 140;
      } else {
        this.floodSurgeX += dt * 85;
      }
    }
  }

  triggerLightning(camera) {
    this.lightningAlpha = 0.95;
    window.audio.playThunder();
    if (camera) {
      camera.shake(0.35, 6);
    }
  }

  // Render Background Sky color according to weather
  renderSky(ctx, width, height) {
    let topCol, botCol;
    switch (this.stage) {
      case 0: // CLEAR (Warm Kerala Tropical Sky)
        topCol = '#4a90e2';
        botCol = '#87ceeb';
        break;
      case 1: // LIGHT RAIN
        topCol = '#34495e';
        botCol = '#5d6d7e';
        break;
      case 2: // HEAVY RAIN
        topCol = '#2c3e50';
        botCol = '#415b76';
        break;
      case 3: // STORM
        topCol = '#1a252f';
        botCol = '#283747';
        break;
      case 4: // FLOOD / EXTREME
        topCol = '#0b1118';
        botCol = '#1b2631';
        break;
    }

    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, topCol);
    grad.addColorStop(1, botCol);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  // Render Rain Streaks & Lightning overlay
  renderForeground(ctx, camera) {
    const vw = camera.viewportWidth;
    const vh = camera.viewportHeight;

    // A. Rain Particles
    if (this.rainDensity > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(174, 214, 241, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < this.rainDensity; i++) {
        const drop = this.rainDrops[i];
        const endX = drop.x + this.wind * 0.8;
        const endY = drop.y + drop.length;
        ctx.moveTo(Math.floor(drop.x), Math.floor(drop.y));
        ctx.lineTo(Math.floor(endX), Math.floor(endY));
      }
      ctx.stroke();
      ctx.restore();
    }

    // B. Lightning Flash Overlay
    if (this.lightningAlpha > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(255, 255, 255, ${this.lightningAlpha})`;
      ctx.fillRect(0, 0, vw, vh);
      ctx.restore();
    }

    // C. Mist / Storm Vignette Overlay
    if (this.stage >= 2) {
      const mistAlpha = this.stage === 2 ? 0.12 : (this.stage === 3 ? 0.22 : 0.35);
      ctx.save();
      ctx.fillStyle = `rgba(18, 30, 49, ${mistAlpha})`;
      ctx.fillRect(0, 0, vw, vh);
      ctx.restore();
    }
  }

  // Render Rising Flood Water (For Level 4)
  renderFloodWater(ctx, camera, groundY = 300) {
    if (this.stage < 4 && this.floodWaterY >= 360) return;

    ctx.save();
    const vw = camera.viewportWidth;
    const vh = camera.viewportHeight;
    const screenWaterY = this.floodWaterY - camera.y;

    // 1. Water Body Gradient
    const waterGrad = ctx.createLinearGradient(0, screenWaterY, 0, vh);
    waterGrad.addColorStop(0, 'rgba(41, 128, 185, 0.85)');
    waterGrad.addColorStop(1, 'rgba(21, 67, 96, 0.95)');

    ctx.fillStyle = waterGrad;
    ctx.beginPath();
    ctx.moveTo(0, vh);
    ctx.lineTo(0, screenWaterY);

    // Animated Pixel Sine Waves
    for (let x = 0; x <= vw; x += 16) {
      const waveY = screenWaterY + Math.sin(x * 0.04 + this.floodWavePhase) * 4;
      ctx.lineTo(x, waveY);
    }
    ctx.lineTo(vw, vh);
    ctx.closePath();
    ctx.fill();

    // 2. White Water Foam Crest
    ctx.fillStyle = 'rgba(235, 245, 251, 0.8)';
    for (let x = 0; x <= vw; x += 16) {
      const waveY = screenWaterY + Math.sin(x * 0.04 + this.floodWavePhase) * 4;
      ctx.fillRect(x, Math.floor(waveY), 16, 2);
    }

    // 3. Flood Surge Wall Chasing From Behind (Left Screen)
    const surgeScreenX = this.floodSurgeX - camera.x;
    if (surgeScreenX > -200 && surgeScreenX < vw) {
      ctx.fillStyle = 'rgba(26, 82, 118, 0.9)';
      ctx.beginPath();
      ctx.moveTo(-100, vh);
      ctx.lineTo(surgeScreenX, vh);
      ctx.quadraticCurveTo(surgeScreenX + 40, screenWaterY - 30, surgeScreenX - 50, -50);
      ctx.lineTo(-100, -50);
      ctx.closePath();
      ctx.fill();

      // Surge Foam
      ctx.fillStyle = '#fff';
      ctx.fillRect(Math.floor(surgeScreenX), Math.floor(screenWaterY - 20), 10, 10);
    }

    ctx.restore();
  }

  reset() {
    this.stage = 0;
    this.wind = 0.5;
    this.rainDensity = 0;
    this.lightningAlpha = 0;
    this.lightningTimer = 0;
    this.floodWaterY = 400;
    this.floodSurgeX = -600;
  }
}
