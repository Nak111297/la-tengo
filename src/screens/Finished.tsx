import type { Team } from '../types';

interface Props {
  teams: Team[];
  onNewGame: () => void;
}

export default function Finished({ teams, onNewGame }: Props) {
  const sorted = [...teams].sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 text-center bg-zinc-950">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 text-4xl shadow-lg shadow-amber-900/40">
          🏆
        </div>
        <h2 className="text-4xl font-black text-white">¡Fin del juego!</h2>
        <p className="text-lg font-bold" style={{ color: winner.color }}>
          Gana {winner.name}
        </p>
      </div>

      <div className="w-full max-w-sm space-y-2">
        {sorted.map((team, i) => (
          <div
            key={team.id}
            className={`flex items-center justify-between rounded-2xl px-5 py-4 ${
              i === 0
                ? 'border-2 border-amber-500/60 bg-zinc-900 shadow-lg shadow-amber-900/10'
                : 'border border-zinc-800 bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-6 text-center text-sm font-black text-zinc-600">
                {i === 0 ? '👑' : `#${i + 1}`}
              </span>
              <span className="h-3 w-3 rounded-full" style={{ background: team.color }} />
              <span className="font-bold text-white">{team.name}</span>
            </div>
            <span className="text-2xl font-black text-amber-400">{team.score}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onNewGame}
        className="w-full max-w-sm rounded-2xl bg-gradient-to-r from-fuchsia-600 to-violet-600 py-4 text-lg font-black text-white shadow-lg shadow-fuchsia-900/30 transition active:scale-95 hover:brightness-110"
      >
        Nueva partida
      </button>
    </div>
  );
}
