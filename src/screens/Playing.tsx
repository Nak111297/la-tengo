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
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      {stealMode ? (
        <div className="text-center">
          <p className="text-sm text-red-400 font-bold">🔥 ROBO</p>
          <h2 className="text-2xl font-black" style={{ color: stealTeam?.color }}>
            {stealTeam?.name} puede robar
          </h2>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-sm text-zinc-400">Escuchando...</p>
          <h2 className="text-xl font-bold" style={{ color: currentTeam.color }}>
            {currentTeam.name}
          </h2>
        </div>
      )}

      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-4 border-zinc-700">
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke="rgb(139 92 246)"
              strokeWidth="6"
              strokeDasharray={`${pct * 2.83} 283`}
              className="transition-all duration-100"
            />
          </svg>
          <span className="text-4xl font-black font-mono text-amber-400">
            {timeLeft.toFixed(1)}
          </span>
        </div>

        <div className="flex h-3 w-48 items-center justify-center">
          <span className="animate-pulse text-sm text-zinc-400">🎵 Reproduciendo...</span>
        </div>
      </div>

      <button
        onClick={onBuzzIn}
        className="rounded-2xl bg-purple-600 px-12 py-5 text-2xl font-black text-white shadow-lg active:scale-95 transition-transform"
      >
        ¡La Tengo!
      </button>

      <button
        onClick={onSkip}
        className="rounded-xl border border-zinc-700 px-6 py-3 text-sm text-zinc-400 transition hover:border-red-500 hover:text-red-400"
      >
        ⏭ Saltar canción
      </button>
    </div>
  );
}
