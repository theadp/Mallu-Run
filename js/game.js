/**
 * Game - Main Game Loop, State Machine, Physics Coordination & Renderer
 */
class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    // Fixed Internal Virtual Resolution for 16-Bit Pixel Art
    this.virtualWidth = 640;
    this.virtualHeight = 360;

    // Subsystems
    this.camera = new Camera(this.virtualWidth, this.virtualHeight);
    this.player = new Player();
    this.weather = new WeatherSystem();
    this.particles = new ParticleSystem(800);
    this.obstacles = new ObstacleManager();
    this.collectibles = new CollectibleManager();
    this.levelManager = new LevelManager();

    // Game States: 'MENU', 'PLAYING', 'PAUSED', 'GAME_OVER', 'LEVEL_COMPLETE', 'FINAL_VICTORY'
    this.state = 'MENU';

    // In-Game Stats
    this.levelCoins = 0;
    this.levelScore = 0;
    this.levelTime = 0;
    this.totalGameTime = 0;
    this.totalGameCoins = 0;
    this.totalGameScore = 0;

    // Timing
    this.lastTime = 0;

    this.setupResize();
  }

  setupResize() {
    const resize = () => {
      // Keep the internal pixel buffer at 640×360; CSS letterboxes it.
      this.canvas.width = this.virtualWidth;
      this.canvas.height = this.virtualHeight;
      this.ctx.imageSmoothingEnabled = false;
    };
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', resize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', resize);
      window.visualViewport.addEventListener('scroll', resize);
    }
    resize();

    document.addEventListener('touchmove', (e) => {
      if (!document.body.classList.contains('is-playing')) return;
      if (e.target.closest && e.target.closest('.ui-screen.active, .menu-content-card, .instructions-scrollable')) {
        return;
      }
      e.preventDefault();
    }, { passive: false });
  }

  startLevel(lvl) {
    this.levelManager.loadLevel(lvl, this.obstacles, this.collectibles, this.weather);
    this.player.reset();
    this.camera.reset();
    this.particles.clear();

    this.levelCoins = 0;
    this.levelScore = 0;
    this.levelTime = 0;

    this.state = 'PLAYING';
    window.ui.hideAllScreens();
    window.input.reset();
    window.audio.startBGM();
  }

  restartCurrentLevel() {
    this.startLevel(this.levelManager.currentLevel);
  }

  returnToMenu() {
    this.state = 'MENU';
    this.particles.clear();
    this.weather.reset();
    window.audio.stopBGM();
    window.ui.updateMenuStats();
    window.ui.showScreen('screen-main-menu');
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      window.ui.showScreen('screen-pause');
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      window.ui.hideAllScreens();
    }
  }

  update(dt) {
    // Check Pause Hotkey
    if (window.input.justPressed('pause')) {
      if (this.state === 'PLAYING' || this.state === 'PAUSED') {
        this.togglePause();
      }
    }

    if (this.state !== 'PLAYING') {
      window.input.endFrame();
      return;
    }

    this.levelTime += dt;
    this.totalGameTime += dt;

    const isFloodLvl = this.levelManager.currentLevel === 3;

    // 1. Update Player Physics
    this.player.update(dt, window.input, this.weather, this.particles);

    // 2. Update Weather Dynamics & Monsoon Meter
    this.levelManager.updateWeatherProgress(this.player.x, this.weather);
    this.weather.update(dt, this.camera, isFloodLvl, this.player.x);

    // 3. Smooth Camera Tracking
    this.camera.follow(this.player, dt, this.levelManager.levelLength);

    // 4. Update Obstacles & Check Collisions
    this.obstacles.update(dt, this.player, this.particles, this.camera);
    this.obstacles.checkCollisions(this.player, this.camera);

    // 5. Update Coins & Collection
    const pickedCoins = this.collectibles.update(dt, this.player, this.particles);
    if (pickedCoins > 0) {
      this.levelCoins += pickedCoins;
      this.levelScore += pickedCoins * 50;
    }

    // Distance Score Progression
    const currentDist = Math.max(0, this.player.x - 80);
    this.levelScore += Math.floor(dt * 15);

    // 6. Update Particle System
    this.particles.update(dt, this.camera, this.player.groundY);

    // 7. Check Level 3 Flood Hazard (Instant Surge Catch)
    if (isFloodLvl && this.weather.stage === 4) {
      if (this.weather.floodSurgeX >= this.player.x - 10) {
        this.player.takeDamage(3);
      }
    }

    // 8. Update HUD
    const lvlCfg = this.levelManager.getLevelConfig(this.levelManager.currentLevel);
    window.ui.updateHUD(
      this.player,
      this.weather,
      currentDist,
      lvlCfg.length,
      this.levelCoins,
      `LVL ${lvlCfg.id}: ${lvlCfg.name}`
    );

    // 9. Check Game Over Condition
    if (this.player.isDead) {
      this.state = 'GAME_OVER';
      const best = Math.max(window.storage.getLevelBestScore(lvlCfg.id), this.levelScore);
      setTimeout(() => {
        window.ui.showGameOver(lvlCfg.id, currentDist, this.levelCoins, this.levelScore, best);
      }, 900);
    }

    // 10. Check Level Complete Condition (Player reaches safe house)
    if (this.player.x >= this.levelManager.finishHouseX && !this.player.isVictorious) {
      this.player.isVictorious = true;
      this.state = 'LEVEL_COMPLETE';
      window.audio.playLevelComplete();

      // Calculate Stars (1 to 3 stars based on score)
      let stars = 1;
      if (this.levelScore >= lvlCfg.starThresholds[2]) stars = 3;
      else if (this.levelScore >= lvlCfg.starThresholds[1]) stars = 2;

      // Persist progress
      window.storage.recordLevelCompletion(
        lvlCfg.id,
        this.levelScore,
        this.levelCoins,
        this.levelTime,
        stars
      );

      this.totalGameCoins += this.levelCoins;
      this.totalGameScore += this.levelScore;

      setTimeout(() => {
        if (lvlCfg.id === 3) {
          window.ui.showFinalVictory(
            this.totalGameScore,
            this.totalGameCoins,
            currentDist,
            this.totalGameTime
          );
        } else {
          window.ui.showLevelComplete(
            currentDist,
            this.levelCoins,
            this.levelTime,
            this.levelScore,
            stars
          );
        }
      }, 900);
    }

    window.input.endFrame();
  }

  render() {
    this.ctx.clearRect(0, 0, this.virtualWidth, this.virtualHeight);

    // 1. Sky Background (Weather Gradient)
    this.weather.renderSky(this.ctx, this.virtualWidth, this.virtualHeight);

    // 2. Far Western Ghats Hills (Screen-space parallax)
    this.levelManager.renderFarBackground(this.ctx, this.camera);

    // 3. Camera World Transform (Translates everything by -camera.x, -camera.y)
    this.camera.applyTransform(this.ctx);

    // World Road & Scenery
    this.levelManager.renderWorld(this.ctx, this.camera);

    // World Coins
    this.collectibles.render(this.ctx, this.camera);

    // World Obstacles & Vehicles
    this.obstacles.render(this.ctx, this.camera);

    // World Player Character
    this.player.render(this.ctx);

    // World Particles (Splashes, Smoke, Sparkles)
    this.particles.render(this.ctx, this.camera);

    // Restore Camera Transform
    this.camera.restoreTransform(this.ctx);

    // 4. Screen-Space Foreground Weather Effects (Rain Particles, Lightning Whiteout, Mist)
    this.weather.renderForeground(this.ctx, this.camera);

    // 5. Rising Floodwater & Waves (Level 4 Deluge)
    this.weather.renderFloodWater(this.ctx, this.camera, this.player.groundY);
  }

  loop(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    const dt = Math.min(0.05, (timestamp - this.lastTime) / 1000);
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }
}

// Global game instance
window.game = new Game();
