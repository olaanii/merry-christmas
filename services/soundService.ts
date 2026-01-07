// Simple Web Audio API synthesizer to avoid external assets
const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

const playTone = (freq: number, type: OscillatorType, duration: number, startTime = 0) => {
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioContext.currentTime + startTime);
  
  gain.gain.setValueAtTime(0.1, audioContext.currentTime + startTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + startTime + duration);

  osc.connect(gain);
  gain.connect(audioContext.destination);

  osc.start(audioContext.currentTime + startTime);
  osc.stop(audioContext.currentTime + startTime + duration);
};

export const soundService = {
  playClick: () => playTone(800, 'sine', 0.05),
  playCorrect: () => {
    playTone(600, 'sine', 0.1);
    playTone(1200, 'sine', 0.2, 0.1);
  },
  playWrong: () => {
    playTone(150, 'sawtooth', 0.3);
  },
  playTick: () => playTone(1000, 'square', 0.03),
  playWin: () => {
    [0, 0.2, 0.4].forEach((delay, i) => {
      playTone(440 + (i * 100), 'triangle', 0.3, delay);
    });
  }
};