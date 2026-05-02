import type { Team } from '../types';
import { SPEED_DURATION } from '../types';

interface Props {
  currentTeam: Team;
  timeLeft: number;
  onBuzzIn: () => void;
  onSkip: () => void;
}

const EQ_DELAYS = [0, 0.12, 0.06, 0.18, 0.03, 0.15];

export default function SpeedPlaying({ currentTeam, timeLeft, onBuzzIn, onSkip }: Props) {
  const pct = Math.max(0, Math.min(100, (timeLeft / SPEED_DURATION) * 100));
  const currentScore = Math.round(pct);
  const strokeLen = 276.5;
  // Yellow (hsl 50) → orange (hsl 25) → red (hsl 0) as pct drops
  const ringColor = `hsl(${pct * 0.5}, 95%, 55%)`;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <div className="text-center">
        <span className="inline-block rounded-full bg-qr-yellow/20 px-3 py-1 text-xs font-black uppercase tracking-widest text-qr-yellow">
          ⚡ Speed
        </span>
        <h2 className="mt-2 font-display text-2xl font-bold" style={{ color: currentTeam.color }}>
          {currentTeam.name}
        </h2>
      </div>

      <div className="relative flex h-52 w-52 items-center justify-center">
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="44"
            fill="none"
            stroke={ringColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${pct * (strokeLen / 100)} ${strokeLen}`}
            style={{ filter: `drop-shadow(0 0 10px ${ringColor}90)`, transition: 'all 0.1s' }}
          />
        </svg>
        <div className="text-center">
          <span
            className="block text-6xl font-black font-mono tabular-nums transition-colors duration-100"
            style={{ color: ringColor, textShadow: `0 0 24px ${ringColor}80` }}
          >
            {currentScore}
          </span>
          <span className="text-sm text-qr-muted">pts posibles</span>
        </div>
      </div>

      {/* Equalizer bars */}
      <div className="flex items-center gap-3 text-sm text-qr-muted">
        <div className="flex items-end gap-0.5">
          {EQ_DELAYS.map((delay, i) => (
            <div
              key={i}
              className="w-0.5 rounded-full eq-bar"
              style={{
                height: '16px',
                background: ringColor,
                animationDelay: `${delay}s`,
              }}
            />
          ))}
        </div>
        Reproduciendo
      </div>

      <button
        onClick={onBuzzIn}
        className="w-full max-w-xs rounded-full bg-qr-yellow py-6 text-2xl font-black text-qr-bg shadow-[0_0_32px_rgba(255,210,63,0.5)] transition active:scale-95 hover:brightness-110"
      >
        ¡Que Rolón!
      </button>

      <button
        onClick={onSkip}
        className="rounded-full border border-white/15 px-8 py-3 text-sm font-bold text-qr-muted transition hover:border-qr-cyan hover:text-qr-cyan active:scale-95"
      >
        ⏭ Saltar canción
      </button>
    </div>
  );
}
