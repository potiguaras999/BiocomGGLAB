let audioCtx: AudioContext | null = null;
let muted = false;

function getCtx(): AudioContext | null {
  if (muted || typeof window === 'undefined') return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    try {
      audioCtx = new Ctx();
    } catch {
      return null;
    }
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function setSoundMuted(value: boolean): void {
  muted = value;
}

export function isSoundMuted(): boolean {
  return muted;
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  gainValue = 0.08,
  delay = 0
): void {
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(gainValue, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

export function playPop(): void {
  playTone(520, 0.08, 'triangle', 0.06);
}

export function playSuccess(): void {
  playTone(523.25, 0.12, 'triangle', 0.08, 0);
  playTone(659.25, 0.16, 'triangle', 0.08, 0.07);
}

export function playError(): void {
  playTone(210, 0.14, 'sawtooth', 0.05, 0);
  playTone(165, 0.18, 'sawtooth', 0.05, 0.08);
}

export function playVictory(): void {
  playTone(523.25, 0.12, 'triangle', 0.09, 0);
  playTone(659.25, 0.12, 'triangle', 0.09, 0.09);
  playTone(783.99, 0.14, 'triangle', 0.09, 0.18);
  playTone(1046.5, 0.28, 'triangle', 0.1, 0.27);
}

export function playDamage(): void {
  playTone(140, 0.16, 'square', 0.06, 0);
}
