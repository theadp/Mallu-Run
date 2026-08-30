/**
 * UIManager - Coordinates all screen states, HUD updates, modal dialogs, and button events
 */
class UIManager {
  constructor() {
    this.currentScreen = 'screen-main-menu';
    this.screens = [
      'screen-main-menu',
      'screen-level-select',
      'screen-how-to-play',
      'screen-settings',
      'screen-pause',
      'screen-game-over',
      'screen-level-complete',
      'screen-final-victory'
    ];

    this.funnyQuotes = [
      '“Ayyyoo! Caught in the monsoon!”',
      '“Ente Daivame! The flood was faster!”',
      '“Ottakkulla running aano mone?!”',
      '“Vellam keri mone! Better luck next run!”',
      '“Heavy rain caught you off guard!”'
    ];

    this.bindEvents();
    this.refreshSettingsUI();
    this.refreshLevelSelectUI();
    this.updateMenuStats();
  }

  showScreen(screenId) {
    this.screens.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        if (id === screenId) {
          el.classList.remove('hidden');
          el.classList.add('active');
        } else {
          el.classList.add('hidden');
          el.classList.remove('active');
        }
      }
    });
    this.currentScreen = screenId;

    // Toggle HUD visibility
    const hud = document.getElementById('hud-overlay');
    if (hud) {
      if (screenId === null) {
        hud.classList.remove('hidden');
      } else if (screenId === 'screen-pause' || screenId === 'screen-game-over' || screenId === 'screen-level-complete') {
        hud.classList.remove('hidden'); // Keep HUD visible behind modal
      } else {
        hud.classList.add('hidden');
      }
    }
  }

  hideAllScreens() {
    this.screens.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.add('hidden');
        el.classList.remove('active');
      }
    });
    const hud = document.getElementById('hud-overlay');
    if (hud) hud.classList.remove('hidden');
    this.currentScreen = null;
  }

  bindEvents() {
    // 1. Main Menu Buttons
    document.getElementById('btn-menu-play')?.addEventListener('click', () => {
      window.audio.playButtonClick();
      window.game.startLevel(1);
    });

    document.getElementById('btn-menu-levels')?.addEventListener('click', () => {
      window.audio.playButtonClick();
      this.refreshLevelSelectUI();
      this.showScreen('screen-level-select');
    });

    document.getElementById('btn-menu-how')?.addEventListener('click', () => {
      window.audio.playButtonClick();
      this.showScreen('screen-how-to-play');
    });

    document.getElementById('btn-menu-settings')?.addEventListener('click', () => {
      window.audio.playButtonClick();
      this.refreshSettingsUI();
      this.showScreen('screen-settings');
    });

    // 2. Back Buttons
    document.getElementById('btn-levels-back')?.addEventListener('click', () => {
      window.audio.playButtonClick();
      this.updateMenuStats();
      this.showScreen('screen-main-menu');
    });

    document.getElementById('btn-how-back')?.addEventListener('click', () => {
      window.audio.playButtonClick();
      this.showScreen('screen-main-menu');
    });

    document.getElementById('btn-settings-back')?.addEventListener('click', () => {
      window.audio.playButtonClick();
      this.showScreen('screen-main-menu');
    });

    // 3. Level Select Play Buttons
    document.querySelectorAll('.play-level-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const lvl = parseInt(e.target.getAttribute('data-level'), 10);
        if (window.storage.isLevelUnlocked(lvl)) {
          window.audio.playButtonClick();
          window.game.startLevel(lvl);
        }
      });
    });

    // 4. Settings Controls
    document.getElementById('btn-toggle-sfx')?.addEventListener('click', (e) => {
      const cur = window.storage.getSetting('sfx');
      window.audio.setSfxEnabled(!cur);
      e.target.textContent = !cur ? 'ON' : 'OFF';
      e.target.classList.toggle('off', cur);
      window.audio.playButtonClick();
    });

    document.getElementById('btn-toggle-bgm')?.addEventListener('click', (e) => {
      const cur = window.storage.getSetting('bgm');
      window.audio.setBgmEnabled(!cur);
      e.target.textContent = !cur ? 'ON' : 'OFF';
      e.target.classList.toggle('off', cur);
      window.audio.playButtonClick();
    });

    document.getElementById('slider-volume')?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) / 100;
      window.audio.setMasterVolume(val);
    });

    document.getElementById('btn-toggle-crt')?.addEventListener('click', (e) => {
      const cur = window.storage.getSetting('crt');
      const next = !cur;
      window.storage.setSetting('crt', next);
      e.target.textContent = next ? 'ON' : 'OFF';
      e.target.classList.toggle('off', !next);
      document.getElementById('crt-overlay')?.classList.toggle('disabled', !next);
      window.audio.playButtonClick();
    });

    document.getElementById('btn-reset-progress')?.addEventListener('click', () => {
      if (confirm('Reset all level progress, best scores, and star ratings?')) {
        window.storage.resetProgress();
        this.refreshLevelSelectUI();
        this.refreshSettingsUI();
        this.updateMenuStats();
        alert('Progress reset to defaults.');
      }
    });

    // 5. Pause Buttons
    document.getElementById('btn-pause-hud')?.addEventListener('click', () => {
      window.audio.playButtonClick();
      window.game.togglePause();
    });

    document.getElementById('btn-pause-resume')?.addEventListener('click', () => {
      window.audio.playButtonClick();
      window.game.togglePause();
    });

    document.getElementById('btn-pause-restart')?.addEventListener('click', () => {
      window.audio.playButtonClick();
      window.game.restartCurrentLevel();
    });

    document.getElementById('btn-pause-levels')?.addEventListener('click', () => {
      window.audio.playButtonClick();
      window.game.returnToMenu();
      this.refreshLevelSelectUI();
      this.showScreen('screen-level-select');
    });

    document.getElementById('btn-pause-menu')?.addEventListener('click', () => {
      window.audio.playButtonClick();
      window.game.returnToMenu();
      this.updateMenuStats();
      this.showScreen('screen-main-menu');
    });

    // 6. Game Over Buttons
    document.getElementById('btn-go-retry')?.addEventListener('click', () => {
      window.audio.playButtonClick();
      window.game.restartCurrentLevel();
    });

    document.getElementById('btn-go-levels')?.addEventListener('click', () => {
      window.audio.playButtonClick();
      window.game.returnToMenu();
      this.refreshLevelSelectUI();
      this.showScreen('screen-level-select');
    });

    document.getElementById('btn-go-menu')?.addEventListener('click', () => {
      window.audio.playButtonClick();
      window.game.returnToMenu();
      this.updateMenuStats();
      this.showScreen('screen-main-menu');
    });

    // 7. Level Complete Buttons
    document.getElementById('btn-lc-next')?.addEventListener('click', () => {
      window.audio.playButtonClick();
      const nextLvl = window.game.levelManager.currentLevel + 1;
      if (nextLvl <= 3) {
        window.game.startLevel(nextLvl);
      } else {
        window.game.state = 'FINAL_VICTORY';
        this.showFinalVictory(
          window.game.totalGameScore,
          window.game.totalGameCoins,
          window.game.player.x,
          window.game.totalGameTime
        );
      }
    });

    document.getElementById('btn-lc-retry')?.addEventListener('click', () => {
      window.audio.playButtonClick();
      window.game.restartCurrentLevel();
    });

    document.getElementById('btn-lc-menu')?.addEventListener('click', () => {
      window.audio.playButtonClick();
      window.game.returnToMenu();
      this.updateMenuStats();
      this.showScreen('screen-main-menu');
    });

    // 8. Final Victory Buttons
    document.getElementById('btn-fv-playagain')?.addEventListener('click', () => {
      window.audio.playButtonClick();
      window.game.startLevel(1);
    });

    document.getElementById('btn-fv-menu')?.addEventListener('click', () => {
      window.audio.playButtonClick();
      window.game.returnToMenu();
      this.updateMenuStats();
      this.showScreen('screen-main-menu');
    });
  }

  updateMenuStats() {
    const el = document.getElementById('menu-best-score');
    if (el) {
      el.textContent = (window.storage.data.totalBestScore || 0).toString().padStart(5, '0');
    }
  }

  refreshSettingsUI() {
    const sfx = window.storage.getSetting('sfx');
    const bgm = window.storage.getSetting('bgm');
    const vol = window.storage.getSetting('volume');
    const crt = window.storage.getSetting('crt');

    const btnSfx = document.getElementById('btn-toggle-sfx');
    if (btnSfx) {
      btnSfx.textContent = sfx ? 'ON' : 'OFF';
      btnSfx.classList.toggle('off', !sfx);
    }

    const btnBgm = document.getElementById('btn-toggle-bgm');
    if (btnBgm) {
      btnBgm.textContent = bgm ? 'ON' : 'OFF';
      btnBgm.classList.toggle('off', !bgm);
    }

    const sliderVol = document.getElementById('slider-volume');
    if (sliderVol) {
      sliderVol.value = Math.round(vol * 100);
    }

    const btnCrt = document.getElementById('btn-toggle-crt');
    if (btnCrt) {
      btnCrt.textContent = crt ? 'ON' : 'OFF';
      btnCrt.classList.toggle('off', !crt);
    }
    document.getElementById('crt-overlay')?.classList.toggle('disabled', !crt);
  }

  refreshLevelSelectUI() {
    const unlockedMax = window.storage.data.unlockedLevels;

    for (let lvl = 1; lvl <= 3; lvl++) {
      const card = document.getElementById(`level-card-${lvl}`);
      const starsEl = document.getElementById(`stars-lvl-${lvl}`);
      const bestEl = document.getElementById(`best-lvl-${lvl}`);
      const isUnlocked = lvl <= unlockedMax;

      if (card) {
        card.classList.toggle('unlocked', isUnlocked);
        card.classList.toggle('locked', !isUnlocked);

        const btn = card.querySelector('.play-level-btn');
        if (btn) {
          btn.disabled = !isUnlocked;
          btn.textContent = isUnlocked ? 'START' : 'LOCKED 🔒';
        }
      }

      if (starsEl) {
        const sCount = window.storage.getLevelStars(lvl);
        starsEl.textContent = '★'.repeat(sCount) + '☆'.repeat(3 - sCount);
      }

      if (bestEl) {
        const bScore = window.storage.getLevelBestScore(lvl);
        bestEl.textContent = isUnlocked ? `Best: ${bScore}` : 'Best: -';
      }
    }
  }

  updateHUD(player, weather, distance, maxDistance, coins, levelName) {
    // 1. Health Hearts
    const hearts = document.querySelectorAll('#hud-hearts .heart');
    hearts.forEach((h, idx) => {
      if (idx < player.health) {
        h.classList.remove('lost');
        h.classList.add('active');
      } else {
        h.classList.add('lost');
        h.classList.remove('active');
      }
    });

    // 2. Monsoon Gauge
    const stageNameEl = document.getElementById('monsoon-status-text');
    const gaugeFillEl = document.getElementById('monsoon-gauge-fill');
    if (stageNameEl) {
      stageNameEl.textContent = weather.stageNames[weather.stage];
    }
    if (gaugeFillEl) {
      gaugeFillEl.className = `monsoon-gauge-fill stage-${weather.stage}`;
    }

    // 3. Coins
    const coinEl = document.getElementById('hud-coin-count');
    if (coinEl) {
      coinEl.textContent = coins.toString().padStart(3, '0');
    }

    // 4. Distance & Level Name
    const distEl = document.getElementById('hud-distance-val');
    const lvlNameEl = document.getElementById('hud-level-name-tag');
    if (distEl) distEl.textContent = `${Math.floor(distance)}m`;
    if (lvlNameEl) lvlNameEl.textContent = levelName;

    // Progress bar runner marker
    const pct = Math.min(100, Math.max(0, (distance / maxDistance) * 100));
    const fillEl = document.getElementById('progress-fill');
    const runnerEl = document.getElementById('progress-runner-icon');
    if (fillEl) fillEl.style.width = `${pct}%`;
    if (runnerEl) runnerEl.style.left = `${pct}%`;

    // 5. Flood Warning (Level 4 / Stage 4)
    const floodWarn = document.getElementById('hud-flood-warning');
    if (floodWarn) {
      floodWarn.classList.toggle('hidden', weather.stage < 4);
    }
  }

  showGameOver(level, distance, coins, score, bestScore) {
    const quote = this.funnyQuotes[Math.floor(Math.random() * this.funnyQuotes.length)];
    document.getElementById('game-over-quote').textContent = quote;
    document.getElementById('go-stat-level').textContent = `Level ${level}`;
    document.getElementById('go-stat-distance').textContent = `${Math.floor(distance)} m`;
    document.getElementById('go-stat-coins').textContent = coins;
    document.getElementById('go-stat-score').textContent = score;
    document.getElementById('go-stat-best').textContent = bestScore;

    this.showScreen('screen-game-over');
  }

  showLevelComplete(distance, coins, timeSec, score, stars) {
    const timeFormatted = `${Math.floor(timeSec / 60).toString().padStart(2, '0')}:${Math.floor(timeSec % 60).toString().padStart(2, '0')}`;

    document.getElementById('lc-stat-distance').textContent = `${Math.floor(distance)} m`;
    document.getElementById('lc-stat-coins').textContent = coins;
    document.getElementById('lc-stat-time').textContent = timeFormatted;
    document.getElementById('lc-stat-score').textContent = score;

    const starsContainer = document.getElementById('lc-stars-container');
    if (starsContainer) {
      starsContainer.innerHTML = '';
      for (let i = 1; i <= 3; i++) {
        const s = document.createElement('span');
        s.className = `awarded-star star-${i}`;
        s.textContent = i <= stars ? '⭐' : '☆';
        starsContainer.appendChild(s);
      }
    }

    this.showScreen('screen-level-complete');
  }

  showFinalVictory(totalScore, totalCoins, totalDist, totalTimeSec) {
    const timeFormatted = `${Math.floor(totalTimeSec / 60).toString().padStart(2, '0')}:${Math.floor(totalTimeSec % 60).toString().padStart(2, '0')}`;

    document.getElementById('fv-stat-score').textContent = totalScore.toString().padStart(5, '0');
    document.getElementById('fv-stat-coins').textContent = totalCoins.toString().padStart(3, '0');
    document.getElementById('fv-stat-distance').textContent = `${Math.floor(totalDist)} m`;
    document.getElementById('fv-stat-time').textContent = timeFormatted;

    this.showScreen('screen-final-victory');
  }
}

// Global UI instance
window.ui = new UIManager();
