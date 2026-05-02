import type { Team } from '../types';

interface Props {
  currentTeam: Team;
  betSeconds: number;
  timeLeft: number;
  stealMode: boolean;
  stealTeam: Team | null;
  onBuzzIn: () => void;
  onSkip: () => void;
}

export default function Playing({ currentTeam, betSeconds, timeLeft, stealMode, stealTeam, onBuzzIn, onSkip }: Props) {
  const pct = Math.max(0, Math.min(100, (timeLeft / betSeconds) * 100));

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 bg-zinc-950">
      {stealMode ? (
        <div className="text-center">
          <span className="inline-block rounded-full bg-red-500/20 px-3 py-1 text-xs font-black uppercase tracking-widest text-red-400">
            🔥 Robo
          </span>
          <h2 className="mt-2 text-2xl font-black" style={{ color: stealTeam?.color }}>
            {stealTeam?.name}
          </h2>
          <p className="mt-1 text-sm text-zinc-400">puede robar la canción</p>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Escuchando</p>
          <h2 className="mt-1 text-2xl font-black" style={{ color: currentTeam.color }}>
            {currentTeam.name}
          </h2>
        </div>
      )}

      <div className="relative flex h-44 w-44 items-center justify-center">
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="rgb(39 39 42)" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="44"
            fill="none"
            stroke={stealMode ? '#ef4444' : 'rgb(139 92 246)'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${pct * 2.765} 276.5`}
            className="transition-all duration-100"
          />
        </svg>
        <div className="text-center">
          <span className="block text-4xl font-black font-mono text-amber-400">
            {timeLeft.toFixed(1)}
          </span>
          <span className="text-xs text-zinc-500">seg</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <span className="animate-pulse text-fuchsia-400">●</span>
        Reproduciendo...
      </div>

      <button
        onClick={onBuzzIn}
        className="w-full max-w-xs rounded-3xl bg-gradient-to-r from-fuchsia-600 to-violet-600 py-6 text-2xl font-black text-white shadow-xl shadow-fuchsia-900/40 transition active:scale-95 hover:brightness-110"
      >
        ¡Que Rolón!
      </button>

      <button
        onClick={onSkip}
        className="text-sm text-zinc-600 transition hover:text-zinc-400"
      >
        ⏭ Saltar canción
      </button>
    </div>
  );
}
