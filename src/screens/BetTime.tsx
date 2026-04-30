import { BET_OPTIONS } from '../types';
import type { Team } from '../types';

interface Props {
  currentTeam: Team;
  onBet: (seconds: number) => void;
}

export default function BetTime({ currentTeam, onBet }: Props) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <div className="text-center">
        <p className="text-sm text-zinc-400">Turno de</p>
        <h2 className="text-2xl font-black" style={{ color: currentTeam.color }}>
          {currentTeam.name}
        </h2>
      </div>

      <h3 className="text-xl font-bold">¿Cuánto tiempo apuestas?</h3>

      <div className="flex w-full max-w-sm flex-col gap-3">
        {BET_OPTIONS.map((opt) => (
          <button
            key={opt.seconds}
            onClick={() => onBet(opt.seconds)}
            className="flex items-center justify-between rounded-2xl border border-zinc-700 bg-zinc-900 px-6 py-5 transition hover:border-purple-500"
          >
            <span className="text-2xl font-black">{opt.label}</span>
            <span className="rounded-full bg-amber-500/20 px-3 py-1 text-lg font-bold text-amber-400">
              {opt.points} pts
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
