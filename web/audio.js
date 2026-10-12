/**
 * audio.js
 * Procedural Web Audio API ambient sound generator
 * Synthesizes temple chimes, singing bowl hums, and elemental ritual sound effects.
 */

class MythicAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.ambientInterval = null;
    this.pentatonicFrequencies = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33]; // C Pentatonic
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleAmbient() {
    this.init();
    if (this.isPlaying) {
      this.stopAmbient();
      return false;
    } else {
      this.startAmbient();
      return true;
    }
  }

  startAmbient() {
    this.isPlaying = true;
    this.playDrone();
    this.ambientInterval = setInterval(() => {
      if (Math.random() > 0.4) {
        this.playChime();
      }
    }, 2800);
  }

  stopAmbient() {
    this.isPlaying = false;
    if (this.ambientInterval) {
      clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }
  }

  playDrone() {
    if (!this.ctx || !this.isPlaying) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, this.ctx.currentTime); // Low A

    gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();

    // Fade out after 10s and re-trigger if still active
    setTimeout(() => {
      if (this.ctx && this.isPlaying) {
        gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 3);
        setTimeout(() => {
          try { osc.stop(); } catch(e){}
          if (this.isPlaying) this.playDrone();
        }, 3000);
      }
    }, 8000);
  }

  playChime(freq = null) {
    if (!this.ctx) return;
    const note = freq || this.pentatonicFrequencies[Math.floor(Math.random() * this.pentatonicFrequencies.length)];
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(note, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 3.6);
  }

  playRitualAwakeningSound() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Dramatic ascending chord
    [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      setTimeout(() => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 4.0);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 4.2);
      }, idx * 180);
    });
  }

  playAttackSound(element) {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (element === 'Fire') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.3);
    } else if (element === 'Water') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.linearRampToValueAtTime(600, now + 0.2);
    } else if (element === 'Void') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.4);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.3);
    }

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(now + 0.4);
  }
}

window.mythicAudio = new MythicAudioEngine();
