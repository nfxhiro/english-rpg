// DQ-style chiptune BGM + SFX — Web Audio API

const BPM = 168;
const B = 60 / BPM; // seconds per beat

const F: Record<string, number> = {
  B2: 123.47,
  C3: 130.81, D3: 146.83, Eb3: 155.56, E3: 164.81, Fs3: 185.00, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, Db4: 277.18, D4: 293.66, Eb4: 311.13, E4: 329.63, F4: 349.23, Fs4: 369.99,
  G4: 392.00, A4: 440.00, Bb4: 466.16, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, Fs5: 739.99, G5: 783.99, A5: 880.00, Bb5: 932.33, B5: 987.77,
  C6: 1046.50,
};

type Note = [number, number]; // [Hz, beats]  Hz=0 → rest

// ── Battle BGM: 8-bar loop, E minor, march feel ──────────────────────────────
const BATTLE_MELODY: Note[] = [
  // Bar 1 — ascending E minor scale run
  [F.E5, .5], [F.Fs5, .5], [F.G5, .5], [F.A5, .5],
  [F.B5, .5], [F.A5, .5], [F.G5, .5], [F.Fs5, .5],
  // Bar 2
  [F.E5, 1], [0, .5], [F.B4, .5], [F.C5, .5], [F.D5, .5], [F.E5, .5], [F.Fs5, .5],
  // Bar 3 — descending
  [F.G5, .5], [F.Fs5, .5], [F.E5, .5], [F.D5, .5],
  [F.C5, .5], [F.B4, .5], [F.A4, .5], [F.G4, .5],
  // Bar 4 — cadence
  [F.Fs4, 1], [F.E4, 1], [0, 2],
  // Bar 5 — Em arpeggio
  [F.E5, .5], [F.G5, .5], [F.B5, .5], [F.G5, .5],
  [F.E5, .5], [F.G5, .5], [F.B5, .5], [F.G5, .5],
  // Bar 6 — Am figure with ascending fill
  [F.A5, .5], [F.Fs5, .5], [F.A5, .5], [F.Fs5, .5],
  [F.D5, .5], [F.E5, .5], [F.Fs5, .5], [F.G5, .5],
  // Bar 7 — descending resolution
  [F.A5, 1], [F.G5, .5], [F.Fs5, .5], [F.E5, .5], [F.D5, .5], [F.C5, .5], [F.B4, .5],
  // Bar 8 — resolve to Em root
  [F.E5, 2], [0, 2],
];

const BATTLE_BASS: Note[] = [
  // Bars 1–2: Em arpeggios
  [F.E3, .5], [F.B3, .5], [F.E4, .5], [F.B3, .5],
  [F.E3, .5], [F.B3, .5], [F.E4, .5], [F.B3, .5],
  [F.E3, .5], [F.B3, .5], [F.G3, .5], [F.B3, .5],
  [F.E3, .5], [F.B3, .5], [F.E4, .5], [F.B3, .5],
  // Bars 3–4: Am → B
  [F.A3, .5], [F.E4, .5], [F.A3, .5], [F.E4, .5],
  [F.A3, .5], [F.E4, .5], [F.A3, .5], [F.E4, .5],
  [F.B3, .5], [F.Fs3, .5], [F.B3, .5], [F.Fs3, .5],
  [F.B2, .5], [F.Fs3, .5], [F.B3, .5], [F.Fs3, .5],
  // Bars 5–6: Em → Am/D
  [F.E3, .5], [F.G3, .5], [F.B3, .5], [F.G3, .5],
  [F.E3, .5], [F.G3, .5], [F.B3, .5], [F.G3, .5],
  [F.A3, .5], [F.E4, .5], [F.A3, .5], [F.E4, .5],
  [F.D3, .5], [F.A3, .5], [F.D4, .5], [F.A3, .5],
  // Bars 7–8: Am → Em resolve
  [F.A3, .5], [F.E4, .5], [F.A3, .5], [F.E4, .5],
  [F.B3, .5], [F.Fs3, .5], [F.B3, .5], [F.Fs3, .5],
  [F.E3, .5], [F.B3, .5], [F.E3, .5], [F.B3, .5],
  [F.E3, .5], [F.B3, .5], [F.E3, .5], [F.B3, .5],
];

// ── Victory fanfare (DQ-inspired) ────────────────────────────────────────────
const VICTORY_FANFARE: Note[] = [
  [F.G5, .5], [F.G5, .5], [F.G5, .5], [F.G5, .5],
  [F.A5, .5], [F.Bb5, .5], [F.A5, .5], [F.G5, .5],
  [F.Bb5, 1.5], [F.G5, 1.5],
  [0, .5],
];

// ── Game-over jingle (descending, somber) ────────────────────────────────────
const GAME_OVER_JINGLE: Note[] = [
  [F.G4, .5], [F.Fs4, .5], [F.F4, .5], [F.E4, .5],
  [F.Eb4, 1.5], [0, .5],
  [F.D4, .5], [F.Db4, .5], [F.C4, .5],
  [F.B3, 2.5],
  [0, 1],
];

// ── SFX: durations in seconds (not beats) ────────────────────────────────────
type SfxNote = { hz: number; t: number; dur: number };

// Attack hit — bright ascending Em arpeggio
const HIT_SFX: SfxNote[] = [
  { hz: F.E5,  t: 0.000, dur: 0.045 },
  { hz: F.A5,  t: 0.040, dur: 0.045 },
  { hz: F.C6,  t: 0.080, dur: 0.110 },
];

// Miss / player damage — heavy descending thud
const MISS_SFX: SfxNote[] = [
  { hz: F.G3,  t: 0.000, dur: 0.065 },
  { hz: F.Eb3, t: 0.055, dur: 0.075 },
  { hz: F.C3,  t: 0.120, dur: 0.160 },
];

// Pack open — ascending anticipation sweep
const PACK_OPEN_SFX: SfxNote[] = [
  { hz: F.E4,  t: 0.000, dur: 0.10 },
  { hz: F.A4,  t: 0.080, dur: 0.10 },
  { hz: F.C5,  t: 0.160, dur: 0.10 },
  { hz: F.E5,  t: 0.240, dur: 0.10 },
  { hz: F.A5,  t: 0.320, dur: 0.18 },
];

// Card reveal: N — simple ding
const REVEAL_N_SFX: SfxNote[] = [
  { hz: F.E5,  t: 0.000, dur: 0.16 },
];

// Card reveal: R — bright two-note
const REVEAL_R_SFX: SfxNote[] = [
  { hz: F.G5,  t: 0.000, dur: 0.08 },
  { hz: F.C6,  t: 0.070, dur: 0.18 },
];

// Card reveal: SR — ascending fanfare
const REVEAL_SR_SFX: SfxNote[] = [
  { hz: F.C5,  t: 0.000, dur: 0.07 },
  { hz: F.E5,  t: 0.060, dur: 0.07 },
  { hz: F.G5,  t: 0.120, dur: 0.07 },
  { hz: F.C6,  t: 0.180, dur: 0.26 },
];

// Card reveal: UR — grand chord hit + extended ascending fanfare
const REVEAL_UR_SFX: SfxNote[] = [
  // Opening chord (full triad)
  { hz: F.C5,  t: 0.000, dur: 0.70 },
  { hz: F.E5,  t: 0.000, dur: 0.70 },
  { hz: F.G5,  t: 0.000, dur: 0.70 },
  { hz: F.C6,  t: 0.000, dur: 0.70 },
  // Ascending fanfare arpeggio
  { hz: F.G5,  t: 0.080, dur: 0.07 },
  { hz: F.A5,  t: 0.160, dur: 0.07 },
  { hz: F.B5,  t: 0.240, dur: 0.07 },
  { hz: F.C6,  t: 0.320, dur: 0.12 },
  // Second flourish
  { hz: F.A5,  t: 0.460, dur: 0.07 },
  { hz: F.B5,  t: 0.540, dur: 0.07 },
  { hz: F.C6,  t: 0.620, dur: 0.55 },
];

// Card reveal: SSR — chord hit + DQ-style fanfare
const REVEAL_SSR_SFX: SfxNote[] = [
  // Chord hit
  { hz: F.C5,  t: 0.000, dur: 0.50 },
  { hz: F.E5,  t: 0.000, dur: 0.50 },
  { hz: F.G5,  t: 0.000, dur: 0.50 },
  // Fanfare arpeggio
  { hz: F.G5,  t: 0.100, dur: 0.08 },
  { hz: F.A5,  t: 0.180, dur: 0.08 },
  { hz: F.Bb5, t: 0.260, dur: 0.14 },
  { hz: F.A5,  t: 0.400, dur: 0.08 },
  { hz: F.G5,  t: 0.480, dur: 0.08 },
  { hz: F.Bb5, t: 0.560, dur: 0.38 },
];

// 10-pack next card — quick flip
const CARD_FLIP_SFX: SfxNote[] = [
  { hz: F.B3,  t: 0.000, dur: 0.05 },
  { hz: F.E4,  t: 0.040, dur: 0.09 },
];

// ── Player ───────────────────────────────────────────────────────────────────
class BgmPlayer {
  // BGM state
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private loopTimer: ReturnType<typeof setTimeout> | null = null;
  private _playing = false;

  // Global enabled flag — gates both BGM and SFX
  private _enabled = true;

  // SFX state
  private sfxCtx: AudioContext | null = null;
  private sfxMaster: GainNode | null = null;

  private ensureCtx() {
    if (!this.ctx || this.ctx.state === "closed") {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = 1;
      this.master.connect(this.ctx.destination);
    }
    return { ctx: this.ctx, master: this.master! };
  }

  private ensureSfxCtx() {
    if (!this.sfxCtx || this.sfxCtx.state === "closed") {
      this.sfxCtx = new AudioContext();
      this.sfxMaster = this.sfxCtx.createGain();
      this.sfxMaster.gain.value = 0.85;
      this.sfxMaster.connect(this.sfxCtx.destination);
    }
    if (this.sfxCtx.state === "suspended") this.sfxCtx.resume();
    return { ctx: this.sfxCtx, master: this.sfxMaster! };
  }

  private seq(
    ctx: AudioContext,
    dest: AudioNode,
    notes: Note[],
    t0: number,
    type: OscillatorType,
    vol: number
  ): number {
    let t = t0;
    for (const [hz, beats] of notes) {
      const d = beats * B;
      if (hz > 0) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.value = hz;
        g.gain.setValueAtTime(vol, t);
        g.gain.setValueAtTime(vol * 0.8, t + d * 0.72);
        g.gain.linearRampToValueAtTime(0, t + d * 0.93);
        osc.connect(g);
        g.connect(dest);
        osc.start(t);
        osc.stop(t + d);
      }
      t += d;
    }
    return t;
  }

  private sfxPlay(sfx: SfxNote[], vol: number) {
    if (!this._enabled) return;
    try {
      const { ctx, master } = this.ensureSfxCtx();
      const t0 = ctx.currentTime + 0.01;
      for (const { hz, t, dur } of sfx) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "square";
        osc.frequency.value = hz;
        const start = t0 + t;
        g.gain.setValueAtTime(vol, start);
        g.gain.linearRampToValueAtTime(0, start + dur * 0.88);
        osc.connect(g);
        g.connect(master);
        osc.start(start);
        osc.stop(start + dur);
      }
    } catch {
      // AudioContext not available (SSR, browser block, etc.)
    }
  }

  private loop(t0: number) {
    const { ctx, master } = this.ensureCtx();
    if (ctx.state === "suspended") ctx.resume();
    const safeT0 = Math.max(t0, ctx.currentTime + 0.04);
    const t1 = this.seq(ctx, master, BATTLE_MELODY, safeT0, "square", 0.055);
    this.seq(ctx, master, BATTLE_BASS, safeT0, "triangle", 0.07);
    const msLeft = (t1 - ctx.currentTime) * 1000 - 280;
    this.loopTimer = setTimeout(() => {
      if (this._playing) this.loop(t1);
    }, Math.max(0, msLeft));
  }

  get isPlaying() {
    return this._playing;
  }

  playBattle() {
    if (!this._enabled) return;
    if (this._playing) return;
    this._playing = true;
    const { ctx } = this.ensureCtx();
    if (ctx.state === "suspended") ctx.resume();
    this.loop(ctx.currentTime + 0.08);
  }

  stopBattle() {
    this._playing = false;
    if (this.loopTimer !== null) {
      clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
      this.master = null;
    }
  }

  playVictory() {
    this.stopBattle();
    if (!this._enabled) return;
    const { ctx, master } = this.ensureCtx();
    if (ctx.state === "suspended") ctx.resume();
    this.seq(ctx, master, VICTORY_FANFARE, ctx.currentTime + 0.05, "square", 0.09);
  }

  playGameOver() {
    this.stopBattle();
    if (!this._enabled) return;
    const { ctx, master } = this.ensureCtx();
    if (ctx.state === "suspended") ctx.resume();
    this.seq(ctx, master, GAME_OVER_JINGLE, ctx.currentTime + 0.05, "square", 0.07);
  }

  enable(v: boolean) {
    this._enabled = v;
    if (!v) this.stopBattle();
  }

  // ── Sound effects ───────────────────────────────────────────────────────────

  /** 正解/攻撃SE — 明るい上昇アルペジオ */
  playSfxHit() {
    this.sfxPlay(HIT_SFX, 0.12);
  }

  /** 誤答/ダメージSE — 低く重い下降音 */
  playSfxMiss() {
    this.sfxPlay(MISS_SFX, 0.13);
  }

  /** パック開封SE — 上昇スウィープ */
  playSfxPackOpen() {
    this.sfxPlay(PACK_OPEN_SFX, 0.09);
  }

  /** カード公開SE — レアリティ別 */
  playSfxReveal(rarity: "N" | "R" | "SR" | "SSR" | "UR" | "SAR") {
    const map = { N: REVEAL_N_SFX, R: REVEAL_R_SFX, SR: REVEAL_SR_SFX, SSR: REVEAL_SSR_SFX, UR: REVEAL_UR_SFX, SAR: REVEAL_UR_SFX };
    this.sfxPlay(map[rarity], 0.11);
  }

  /** 10連カードめくりSE */
  playSfxCardFlip() {
    this.sfxPlay(CARD_FLIP_SFX, 0.08);
  }

  setVolume(v: number) {
    if (this.master) this.master.gain.value = Math.max(0, Math.min(1, v));
  }
}

export const bgmPlayer = new BgmPlayer();

export const BGM_ENABLED_STORAGE_KEY = "bgmEnabled";
export const BGM_ENABLED_CHANGE_EVENT = "eikenQuestBgmEnabledChange";

export function getStoredBgmEnabled() {
  if (typeof window === "undefined") return true;

  const stored = localStorage.getItem(BGM_ENABLED_STORAGE_KEY);
  return stored === null ? true : stored !== "false";
}

export function setStoredBgmEnabled(enabled: boolean) {
  if (typeof window !== "undefined") {
    localStorage.setItem(BGM_ENABLED_STORAGE_KEY, String(enabled));
    window.dispatchEvent(
      new CustomEvent(BGM_ENABLED_CHANGE_EVENT, { detail: enabled })
    );
  }

  bgmPlayer.enable(enabled);
}

export function subscribeToBgmEnabledChange(onChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const handleChange = () => onChange();
  window.addEventListener(BGM_ENABLED_CHANGE_EVENT, handleChange);
  window.addEventListener("storage", handleChange);

  return () => {
    window.removeEventListener(BGM_ENABLED_CHANGE_EVENT, handleChange);
    window.removeEventListener("storage", handleChange);
  };
}
