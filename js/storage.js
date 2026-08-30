/**
 * StorageManager - LocalStorage persistence for Mallu Run
 */
class StorageManager {
  constructor() {
    this.STORAGE_KEY = 'mallu_run_save_v1';
    this.data = this.load();
  }

  getDefaults() {
    return {
      unlockedLevels: 1,
      totalBestScore: 0,
      totalCoins: 0,
      levelStats: {
        1: { bestScore: 0, stars: 0, bestCoins: 0, bestTime: 0 },
        2: { bestScore: 0, stars: 0, bestCoins: 0, bestTime: 0 },
        3: { bestScore: 0, stars: 0, bestCoins: 0, bestTime: 0 }
      },
      settings: {
        sfx: true,
        bgm: true,
        volume: 0.8,
        crt: true
      }
    };
  }

  load() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          ...this.getDefaults(),
          ...parsed,
          levelStats: { ...this.getDefaults().levelStats, ...(parsed.levelStats || {}) },
          settings: { ...this.getDefaults().settings, ...(parsed.settings || {}) }
        };
      }
    } catch (e) {
      console.warn('LocalStorage load failed, using defaults', e);
    }
    return this.getDefaults();
  }

  save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }

  isLevelUnlocked(lvl) {
    return lvl <= this.data.unlockedLevels;
  }

  unlockNextLevel(completedLvl) {
    if (completedLvl >= this.data.unlockedLevels && completedLvl < 3) {
      this.data.unlockedLevels = completedLvl + 1;
      this.save();
    }
  }

  recordLevelCompletion(lvl, score, coins, time, stars) {
    if (!this.data.levelStats[lvl]) {
      this.data.levelStats[lvl] = { bestScore: 0, stars: 0, bestCoins: 0, bestTime: 0 };
    }
    const stat = this.data.levelStats[lvl];
    if (score > stat.bestScore) stat.bestScore = score;
    if (stars > stat.stars) stat.stars = stars;
    if (coins > stat.bestCoins) stat.bestCoins = coins;
    if (stat.bestTime === 0 || time < stat.bestTime) stat.bestTime = time;

    this.data.totalCoins += coins;
    this.recalculateTotalScore();
    this.unlockNextLevel(lvl);
    this.save();
  }

  recalculateTotalScore() {
    let total = 0;
    for (let lvl = 1; lvl <= 3; lvl++) {
      total += (this.data.levelStats[lvl]?.bestScore || 0);
    }
    if (total > this.data.totalBestScore) {
      this.data.totalBestScore = total;
    }
  }

  getLevelStars(lvl) {
    return this.data.levelStats[lvl]?.stars || 0;
  }

  getLevelBestScore(lvl) {
    return this.data.levelStats[lvl]?.bestScore || 0;
  }

  getSetting(key) {
    return this.data.settings[key];
  }

  setSetting(key, value) {
    this.data.settings[key] = value;
    this.save();
  }

  resetProgress() {
    this.data = this.getDefaults();
    this.save();
  }
}

// Global instance
window.storage = new StorageManager();
