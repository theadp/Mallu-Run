/**
 * LevelManager - Hand-crafted Kerala environments, scenery placement, and obstacle layouts
 * Exactly 3 Playable Levels:
 * 1. Naadu Road (Easy / Tutorial)
 * 2. Monsoon Madness (Medium / Storm Survival)
 * 3. Flood Escape (Final Stage / Deluge Sprint to Reach Home)
 */
class LevelManager {
  constructor() {
    this.currentLevel = 1;
    this.levelLength = 2400;
    this.sceneryElements = [];
    this.finishHouseX = 2260;
    this.groundY = 240;
  }

  getLevelConfig(levelNum) {
    const configs = {
      1: {
        id: 1,
        name: 'NAADU ROAD',
        length: 2400,
        weatherStages: [
          { distance: 0, stage: 0 },    // CLEAR
          { distance: 900, stage: 1 }   // LIGHT RAIN
        ],
        description: 'Village road, coconut palms, puddles & light rain.',
        difficulty: 'EASY',
        starThresholds: [400, 800, 1200]
      },
      2: {
        id: 2,
        name: 'MONSOON MADNESS',
        length: 3000,
        weatherStages: [
          { distance: 0, stage: 1 },    // LIGHT RAIN
          { distance: 1000, stage: 2 },  // HEAVY RAIN
          { distance: 2000, stage: 3 }  // STORM
        ],
        description: 'Rain, wind, puddles & simple storm survival.',
        difficulty: 'MEDIUM',
        starThresholds: [600, 1200, 1800]
      },
      3: {
        id: 3,
        name: 'FLOOD ESCAPE',
        length: 3600,
        weatherStages: [
          { distance: 0, stage: 2 },     // HEAVY RAIN
          { distance: 900, stage: 3 },   // STORM
          { distance: 1900, stage: 4 }   // FLOOD
        ],
        description: 'Deluge surge! Escape the rising floodwater and reach home!',
        difficulty: 'FINAL STAGE',
        starThresholds: [800, 1600, 2400]
      }
    };
    return configs[levelNum] || configs[1];
  }

  loadLevel(levelNum, obstacleManager, collectibleManager, weatherSystem) {
    this.currentLevel = levelNum;
    const config = this.getLevelConfig(levelNum);
    this.levelLength = config.length;
    this.finishHouseX = config.length - 160;

    obstacleManager.clear();
    collectibleManager.clear();
    this.sceneryElements = [];

    // 1. Generate Parallax Scenery (Coconut palms, houses, tea stalls, bus stops, milestone stones, decorative bushes)
    this.generateScenery(config);

    // 2. Generate Handcrafted Obstacles & Coin Arcs
    this.generateLevelContent(levelNum, config, obstacleManager, collectibleManager);

    // 3. Set Initial Weather
    weatherSystem.setStage(config.weatherStages[0].stage);
  }

  generateScenery(config) {
    const len = config.length;
    const gY = this.groundY;

    // Coconut Palms along the route
    for (let x = 60; x < len + 400; x += 220 + Math.random() * 60) {
      this.sceneryElements.push({
        type: 'coconutTree',
        x,
        y: gY - 138,
        layer: 'midground'
      });
    }

    // Traditional Kerala Houses & Tea Shops in background
    for (let x = 280; x < len - 300; x += 600 + Math.random() * 200) {
      const type = Math.random() > 0.45 ? 'keralaHouse' : 'teaShop';
      this.sceneryElements.push({
        type,
        x,
        y: gY - (type === 'keralaHouse' ? 76 : 38),
        layer: 'midground'
      });
    }

    // Bus Stops
    for (let x = 700; x < len - 400; x += 900) {
      this.sceneryElements.push({
        type: 'busStop',
        x,
        y: gY - 28,
        layer: 'foreground'
      });
    }

    // Milestone Stones
    for (let x = 380; x < len; x += 550) {
      this.sceneryElements.push({
        type: 'milestone',
        x,
        y: gY + 12,
        layer: 'foreground'
      });
    }

    // Electric Poles
    for (let x = 160; x < len + 200; x += 360) {
      this.sceneryElements.push({
        type: 'electricPole',
        x,
        y: gY - 118,
        layer: 'midground'
      });
    }

    // Purely Decorative Roadside Green Bushes (VISUAL SCENERY ONLY — ZERO COLLISION)
    for (let x = 120; x < len + 200; x += 220 + Math.random() * 70) {
      this.sceneryElements.push({
        type: 'decorativeBush',
        x,
        y: gY + 16,
        layer: 'midground'
      });
    }
  }

  generateLevelContent(levelNum, config, obsMgr, colMgr) {
    const gY = this.groundY;

    if (levelNum === 1) {
      // LEVEL 1: NAADU ROAD (Absolute Beginner Tutorial — Exactly 5 Obstacles Total)

      // 1. Warmup Section (0–500): NO obstacles, simple comfortable coins
      colMgr.addCoinRow(180, gY - 10, 4);
      colMgr.addCoinRow(360, gY - 10, 4);

      // 2. Obstacle 1 at ~600: ONE Pothole with rainbow jump coin arc
      obsMgr.add('pothole', 600, gY + 28);
      colMgr.addCoinArc(570, gY + 20, 5, 45);

      // 3. Clear Safe Section (600–1100): NO obstacles, run and collect coins
      colMgr.addCoinRow(850, gY - 10, 4);

      // 4. Obstacle 2 at ~1200: ONE Fallen Branch with jump arc
      obsMgr.add('branch', 1200, gY + 24);
      colMgr.addCoinArc(1170, gY + 20, 5, 45);

      // 5. Clear Safe Section (1200–1650): NO obstacles
      colMgr.addCoinRow(1450, gY - 10, 4);

      // 6. Obstacle 3 at ~1750: ONE Low Branch (teaches SLIDE with coins underneath)
      obsMgr.add('lowBranch', 1750, gY - 4);
      colMgr.addCoinRow(1730, gY + 26, 4);

      // 7. Clear Safe Section (1750–2050): NO obstacles
      colMgr.addCoinRow(1920, gY - 10, 4);

      // 8. Obstacle 4 at ~2100: ONE Pothole with jump arc
      obsMgr.add('pothole', 2100, gY + 28);
      colMgr.addCoinArc(2070, gY + 20, 5, 45);

      // 9. Obstacle 5 at ~2250: ONE Low Branch (slide practice)
      obsMgr.add('lowBranch', 2250, gY - 4);
      colMgr.addCoinRow(2230, gY + 26, 3);

      // 10. Arrival Stretch (2250–2400): NO obstacles, finish at Kerala safe house!

    } else if (levelNum === 2) {
      // LEVEL 2: MONSOON MADNESS (Simple Storm Survival — Potholes, Low Branches, Occasional Falling Coconuts)

      // 1. Initial run & coins (0-400)
      colMgr.addCoinRow(180, gY - 10, 4);

      // 2. Obstacle 1: Pothole (~500)
      obsMgr.add('pothole', 500, gY + 28);
      colMgr.addCoinArc(470, gY + 20, 5, 45);

      // 3. Safe Stretch (600-850)
      colMgr.addCoinRow(720, gY - 10, 3);

      // 4. Obstacle 2: Low Branch Slide (~950)
      obsMgr.add('lowBranch', 950, gY - 4);
      colMgr.addCoinRow(930, gY + 26, 4);

      // 5. Safe Stretch (1050-1300)
      colMgr.addCoinRow(1180, gY - 10, 3);

      // 6. Obstacle 3: Falling Coconut (~1400)
      obsMgr.add('fallingCoconut', 1400, gY - 100, { isFalling: true });
      colMgr.addCoinRow(1380, gY - 10, 3);

      // 7. Safe Stretch (1500-1750)
      colMgr.addCoinRow(1620, gY - 10, 3);

      // 8. Obstacle 4: Pothole (~1850)
      obsMgr.add('pothole', 1850, gY + 28);
      colMgr.addCoinArc(1820, gY + 20, 5, 45);

      // 9. Safe Stretch (1950-2200)
      colMgr.addCoinRow(2080, gY - 10, 3);

      // 10. Obstacle 5: Low Branch Slide (~2300)
      obsMgr.add('lowBranch', 2300, gY - 4);
      colMgr.addCoinRow(2280, gY + 26, 4);

      // 11. Obstacle 6: Falling Coconut (~2650)
      obsMgr.add('fallingCoconut', 2650, gY - 100, { isFalling: true });

      // 12. Arrival Stretch (2750-3000): Safe run to Kerala house!
      colMgr.addCoinRow(2780, gY - 10, 4);

    } else if (levelNum === 3) {
      // LEVEL 3: FLOOD ESCAPE (Final Deluge Climax — Converted from old Level 4)

      // 1. Initial run (0-400)
      colMgr.addCoinRow(180, gY - 10, 4);

      // 2. Obstacle 1: Pothole (~500)
      obsMgr.add('pothole', 500, gY + 28);
      colMgr.addCoinArc(470, gY + 20, 5, 45);

      // 3. Safe Stretch (600-800)
      colMgr.addCoinRow(700, gY - 10, 3);

      // 4. Obstacle 2: Low Branch Slide (~900)
      obsMgr.add('lowBranch', 900, gY - 4);
      colMgr.addCoinRow(880, gY + 26, 4);

      // 5. Safe Stretch (1000-1250)
      colMgr.addCoinRow(1120, gY - 10, 3);

      // 6. Obstacle 3: Floating Flood Crate (~1350)
      obsMgr.add('crate', 1350, gY + 22);
      colMgr.addCoinArc(1320, gY + 15, 5, 45);

      // 7. Safe Stretch (1450-1700)
      colMgr.addCoinRow(1580, gY - 10, 3);

      // 8. Obstacle 4: Low Branch Slide (~1800)
      obsMgr.add('lowBranch', 1800, gY - 4);
      colMgr.addCoinRow(1780, gY + 26, 4);

      // --- 1900m: STAGE 4 FLOOD DELUGE SURGE BEGINS! ---

      // 9. Obstacle 5: Floating Crate (~2350)
      obsMgr.add('crate', 2350, gY + 22);
      colMgr.addCoinArc(2320, gY + 15, 5, 45);

      // 10. Obstacle 6: Pothole in flood (~2750)
      obsMgr.add('pothole', 2750, gY + 28);
      colMgr.addCoinArc(2720, gY + 20, 5, 45);

      // 11. Obstacle 7: Low Branch Slide (~3100)
      obsMgr.add('lowBranch', 3100, gY - 4);
      colMgr.addCoinRow(3080, gY + 26, 4);

      // 12. Obstacle 8: Floating Crate (~3350)
      obsMgr.add('crate', 3350, gY + 22);
      colMgr.addCoinArc(3320, gY + 15, 5, 45);

      // 13. Safe Finish Approach (3450-3600): Reaching the safe Kerala house!
      colMgr.addCoinRow(3460, gY - 10, 4);
    }
  }

  updateWeatherProgress(playerX, weatherSystem) {
    const config = this.getLevelConfig(this.currentLevel);
    for (let i = config.weatherStages.length - 1; i >= 0; i--) {
      const ws = config.weatherStages[i];
      if (playerX >= ws.distance) {
        if (weatherSystem.stage !== ws.stage) {
          weatherSystem.setStage(ws.stage, playerX);
        }
        break;
      }
    }
  }

  // Render Far Background Hills (Screen space with subtle parallax)
  renderFarBackground(ctx, camera) {
    ctx.save();
    ctx.fillStyle = '#1b3b2b';
    ctx.beginPath();
    ctx.moveTo(0, camera.viewportHeight);
    const hillParallax = camera.x * 0.12;
    for (let x = 0; x <= camera.viewportWidth + 40; x += 20) {
      const worldX = x + hillParallax;
      const hillY = 160 + Math.sin(worldX * 0.005) * 35 + Math.cos(worldX * 0.012) * 20;
      ctx.lineTo(x, hillY);
    }
    ctx.lineTo(camera.viewportWidth, camera.viewportHeight);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Render World Scenery & Road (Inside camera world transform)
  renderWorld(ctx, camera) {
    const spCache = window.sprites.cache;
    const gY = this.groundY;

    // 1. Midground Scenery (Trees, Houses, Tea Stalls, Electric Poles, Decorative Bushes)
    for (let i = 0; i < this.sceneryElements.length; i++) {
      const el = this.sceneryElements[i];
      if (el.layer !== 'midground') continue;

      if (el.x < camera.x - 200 || el.x > camera.x + camera.viewportWidth + 200) continue;

      const sprite = spCache.env[el.type];
      if (sprite) {
        ctx.drawImage(sprite, Math.floor(el.x), Math.floor(el.y));
      }
    }

    // 2. Road Surface
    const roadY = Math.floor(gY + 42);

    // Asphalt
    ctx.fillStyle = '#3a2e2b';
    ctx.fillRect(0, roadY, this.levelLength + 600, 100);

    // Top Green Grass Curb
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(0, roadY - 4, this.levelLength + 600, 4);

    // Yellow Center Lane Dashes
    ctx.fillStyle = '#f1c40f';
    for (let x = 0; x < this.levelLength + 400; x += 80) {
      ctx.fillRect(x, roadY + 16, 40, 4);
    }

    // 3. Foreground Scenery (Milestones, Bus Stops)
    for (let i = 0; i < this.sceneryElements.length; i++) {
      const el = this.sceneryElements[i];
      if (el.layer !== 'foreground') continue;

      if (el.x < camera.x - 200 || el.x > camera.x + camera.viewportWidth + 200) continue;

      const sprite = spCache.env[el.type];
      if (sprite) {
        ctx.drawImage(sprite, Math.floor(el.x), Math.floor(el.y));
      }
    }

    // 4. Safe Kerala Ancestral House (Clear Finish Point)
    const houseX = Math.floor(this.finishHouseX);
    if (houseX >= camera.x - 250 && houseX <= camera.x + camera.viewportWidth + 250) {
      if (spCache.env.keralaHouse) {
        ctx.drawImage(spCache.env.keralaHouse, houseX, gY - 76);
      }

      // Glowing Welcome Porch Light
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.arc(houseX + 80, gY - 20, 8, 0, Math.PI * 2);
      ctx.fill();

      // "HOME" Finish Banner Sign
      ctx.fillStyle = '#b73e23';
      ctx.fillRect(houseX + 35, gY - 70, 90, 16);
      ctx.fillStyle = '#f1c40f';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillText('🏠 HOME', houseX + 42, gY - 58);
    }
  }
}
