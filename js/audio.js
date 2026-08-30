/**
 * AudioManager - Web Audio API Procedural Sound Synthesizer & Retro BGM Generator
 */
class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.bgmGain = null;
    this.rainGain = null;
    this.rainSource = null;

    this.sfxEnabled = window.storage.getSetting('sfx');
    this.bgmEnabled = window.storage.getSetting('bgm');
    this.masterVolume = window.storage.getSetting('volume');

    this.isBgmPlaying = false;
    this.bgmTimer = null;
    this.bgmStep = 0;
    this.currentWeatherStage = 0;

    // Initialize on first user interaction
    this.setupUnlock();
  }

  setupUnlock() {
    const unlock = () => {
      this.init();
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    window.addEventListener('click', unlock);
    window.addEventListener('keydown', unlock);
    window.addEventListener('touchstart', unlock);
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // SFX Gain
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxEnabled ? 1 : 0, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // BGM Gain
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(this.bgmEnabled ? 0.45 : 0, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);

      // Rain Ambient Generator
      this.initRainAmbient();

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch (e) {
      console.warn('Web Audio API not supported or error:', e);
    }
  }

  ensureActive() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMasterVolume(val) {
    this.masterVolume = Math.max(0, Math.min(1, val));
    window.storage.setSetting('volume', this.masterVolume);
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
    }
  }

  setSfxEnabled(val) {
    this.sfxEnabled = !!val;
    window.storage.setSetting('sfx', this.sfxEnabled);
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxEnabled ? 1 : 0, this.ctx.currentTime);
    }
  }

  setBgmEnabled(val) {
    this.bgmEnabled = !!val;
    window.storage.setSetting('bgm', this.bgmEnabled);
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(this.bgmEnabled ? 0.45 : 0, this.ctx.currentTime);
    }
    if (!this.bgmEnabled) {
      this.stopBGM();
    } else {
      this.startBGM();
    }
  }

  /* -------------------------------------------------------------
     PROCEDURAL SOUND EFFECTS (SFX)
     ------------------------------------------------------------- */

  playJump() {
    if (!this.sfxEnabled || !this.ctx) return;
    this.ensureActive();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(450, t + 0.12);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  playSlide() {
    if (!this.sfxEnabled || !this.ctx) return;
    this.ensureActive();
    const t = this.ctx.currentTime;

    // Filtered noise swoosh
    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(300, t + 0.18);
    filter.Q.setValueAtTime(3, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
  }

  playCoin() {
    if (!this.sfxEnabled || !this.ctx) return;
    this.ensureActive();
    const t = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    // Cheerful arpeggio: B5 (987Hz) -> E6 (1318Hz)
    osc1.frequency.setValueAtTime(987, t);
    osc1.frequency.setValueAtTime(1318, t + 0.08);

    osc2.frequency.setValueAtTime(987 * 2, t);
    osc2.frequency.setValueAtTime(1318 * 2, t + 0.08);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.setValueAtTime(0.22, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.28);
    osc2.stop(t + 0.28);
  }

  playHurt() {
    if (!this.sfxEnabled || !this.ctx) return;
    this.ensureActive();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.22);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.23);
  }

  playThunder() {
    if (!this.sfxEnabled || !this.ctx) return;
    this.ensureActive();
    const t = this.ctx.currentTime;

    // Sharp initial noise crack followed by low rumble
    const duration = 1.2;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      // Brown noise synthesis
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, t);
    filter.frequency.exponentialRampToValueAtTime(80, t + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
  }

  playLevelComplete() {
    if (!this.sfxEnabled || !this.ctx) return;
    this.ensureActive();
    const t = this.ctx.currentTime;

    // Fanfare chords: C5, E5, G5, C6
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const startTime = t + (idx * 0.12);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.36);
    });
  }

  playGameOver() {
    if (!this.sfxEnabled || !this.ctx) return;
    this.ensureActive();
    const t = this.ctx.currentTime;

    // Sad descending notes: D4 -> C#4 -> C4 -> B3
    const notes = [293.66, 277.18, 261.63, 246.94];
    notes.forEach((freq, idx) => {
      const startTime = t + (idx * 0.18);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.26);
    });
  }

  playButtonClick() {
    if (!this.sfxEnabled || !this.ctx) return;
    this.ensureActive();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.04);

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  /* -------------------------------------------------------------
     RAIN AMBIENT NOISE GENERATOR
     ------------------------------------------------------------- */

  initRainAmbient() {
    if (!this.ctx || this.rainSource) return;

    // 2-second looped pink/white noise buffer for continuous rain
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      data[i] = (b0 + b1 + b2 + white * 0.5362) * 0.12;
    }

    this.rainSource = this.ctx.createBufferSource();
    this.rainSource.buffer = buffer;
    this.rainSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.setValueAtTime(0, this.ctx.currentTime);

    this.rainSource.connect(filter);
    filter.connect(this.rainGain);
    this.rainGain.connect(this.sfxGain);

    this.rainSource.start(0);
  }

  updateWeatherStage(stage) {
    this.currentWeatherStage = stage;
    if (!this.rainGain || !this.ctx) return;
    const targetGains = [0, 0.08, 0.18, 0.32, 0.45]; // stages 0..4
    const gainVal = targetGains[Math.min(stage, 4)] || 0;
    this.rainGain.gain.setTargetAtTime(gainVal, this.ctx.currentTime, 0.5);
  }

  /* -------------------------------------------------------------
     CHIPTUNE RETRO BGM SYNTHESIZER
     ------------------------------------------------------------- */

  startBGM() {
    if (this.isBgmPlaying || !this.bgmEnabled) return;
    this.ensureActive();
    if (!this.ctx) return;

    this.isBgmPlaying = true;
    this.bgmStep = 0;
    this.scheduleBGMStep();
  }

  stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  scheduleBGMStep() {
    if (!this.isBgmPlaying || !this.ctx) return;

    const tempo = this.currentWeatherStage >= 3 ? 140 : 125; // Faster during storm/flood
    const stepDuration = (60 / tempo) / 4; // 16th notes
    const t = this.ctx.currentTime;

    // Upbeat Kerala-inspired pentatonic/folk chiptune melody in D Minor/Major
    const bassNotes = [146.83, 146.83, 174.61, 220.00, 196.00, 196.00, 220.00, 261.63]; // D, D, F, A, G, G, A, C
    const leadNotes = [
      293.66, 0, 329.63, 349.23, 392.00, 0, 440.00, 523.25,
      587.33, 523.25, 440.00, 0, 392.00, 349.23, 329.63, 293.66,
      440.00, 0, 440.00, 523.25, 587.33, 0, 659.25, 587.33,
      523.25, 440.00, 392.00, 349.23, 293.66, 0, 293.66, 0
    ];

    // Bass note trigger (every 4 steps)
    if (this.bgmStep % 4 === 0) {
      const bIdx = (Math.floor(this.bgmStep / 4)) % bassNotes.length;
      const bFreq = bassNotes[bIdx];
      if (bFreq > 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassG = this.ctx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(bFreq / 2, t);
        bassG.gain.setValueAtTime(0.25, t);
        bassG.gain.exponentialRampToValueAtTime(0.01, t + stepDuration * 3.5);

        bassOsc.connect(bassG);
        bassG.connect(this.bgmGain);
        bassOsc.start(t);
        bassOsc.stop(t + stepDuration * 3.6);
      }
    }

    // Lead melody note trigger
    const lIdx = this.bgmStep % leadNotes.length;
    const lFreq = leadNotes[lIdx];
    if (lFreq > 0) {
      const leadOsc = this.ctx.createOscillator();
      const leadG = this.ctx.createGain();
      leadOsc.type = 'square';
      leadOsc.frequency.setValueAtTime(lFreq, t);

      leadG.gain.setValueAtTime(0.08, t);
      leadG.gain.exponentialRampToValueAtTime(0.001, t + stepDuration * 1.8);

      leadOsc.connect(leadG);
      leadG.connect(this.bgmGain);
      leadOsc.start(t);
      leadOsc.stop(t + stepDuration * 1.9);
    }

    // Retro percussion noise tap (on 16th beats)
    if (this.bgmStep % 4 === 2 || this.bgmStep % 8 === 6) {
      const snareOsc = this.ctx.createOscillator();
      const snareG = this.ctx.createGain();
      snareOsc.type = 'sawtooth';
      snareOsc.frequency.setValueAtTime(120, t);
      snareOsc.frequency.exponentialRampToValueAtTime(30, t + 0.05);

      snareG.gain.setValueAtTime(0.07, t);
      snareG.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      snareOsc.connect(snareG);
      snareG.connect(this.bgmGain);
      snareOsc.start(t);
      snareOsc.stop(t + 0.05);
    }

    this.bgmStep++;
    this.bgmTimer = setTimeout(() => {
      this.scheduleBGMStep();
    }, stepDuration * 1000);
  }
}

// Global audio instance
window.audio = new AudioManager();
