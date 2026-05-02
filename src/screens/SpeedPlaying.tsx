import type { Team } from '../types';
import { SPEED_DURATION } from '../types';

interface Props {
  currentTeam: Team;
  timeLeft: number;
  onBuzzIn: () => void;
  onSkip: () => void;
}

export default function SpeedPlaying({ currentTeam, timeLeft, onBuzzIn, onSkip }: Props) {
  const pct = Math.max(0, Math.min(100, (timeLeft / SPEED_DURATION) * 100));
  const currentScore = Math.round(pct);
  const strokeLen = 276.5;
  const ringColor = `hsl(${pct * 0.3}, 90%, 55%)`;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 bg-zinc-950">
      <div className="text-center">
        <span className="inline-block rounded-full bg-orange-500/20 px-3 py-1 text-xs font-black uppercase tracking-widest text-orange-400">
          ⚡ Speed
        </span>
        <h2 className="mt-2 text-2xl font-black" style={{ color: currentTeam.color }}>
          {currentTeam.name}
        </h2>
      </div>

      <div className="relative flex h-52 w-52 items-center justify-center">
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="rgb(39 39 42)" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="44"
            fill="none"
            stroke={ringColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${pct * (strokeLen / 100)} ${strokeLen}`}
            className="transition-all duration-100"
          />
        </svg>
        <div className="text-center">
          <span
            className="block text-6xl font-black font-mono tabular-nums transition-colors duration-100"
            style={{ color: ringColor }}
          >
            {currentScore}
          </span>
          <span className="text-sm text-zinc-500">pts posibles</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <span className="animate-pulse text-orange-400">●</span>
        Reproduciendo
      </div>

      <button
        onClick={onBuzzIn}
        className="w-full max-w-xs rounded-3xl bg-gradient-to-r from-orange-500 to-amber-500 py-6 text-2xl font-black text-black shadow-xl shadow-orange-900/40 transition active:scale-95 hover:brightness-110"
      >
        ¡Que Rolón!
      </button>

      <button
        onClick={onSkip}
        className="rounded-2xl border border-zinc-800 px-8 py-3 text-sm font-bold text-zinc-400 transition hover:border-zinc-600 hover:text-white active:scale-95"
      >
        ⏭ Saltar canción
      </button>
    </div>
  );
}
