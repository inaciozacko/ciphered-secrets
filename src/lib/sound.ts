let ctx: AudioContext | null = null;
function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try { ctx = new (window.AudioContext || (window as any).webkitAudioContext)(); }
    catch { return null; }
  }
  return ctx;
}

function tone(freq: number, duration: number, type: OscillatorType = "square", volume = 0.05) {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
  osc.connect(gain).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + duration);
}

export const sfx = {
  type: () => tone(880 + Math.random() * 200, 0.04, "square", 0.025),
  success: () => {
    tone(660, 0.12, "sine", 0.08);
    setTimeout(() => tone(990, 0.18, "sine", 0.08), 100);
  },
  error: () => tone(160, 0.25, "sawtooth", 0.07),
  click: () => tone(420, 0.05, "triangle", 0.05),
  tick: () => tone(1200, 0.02, "square", 0.015),
};
