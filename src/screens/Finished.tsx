import type { Team } from '../types';

interface Props {
  teams: Team[];
  onNewGame: () => void;
}

export default function Finished({ teams, onNewGame }: Props) {
  const sorted = [...teams].sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div>
        <p className="text-5xl">🏆</p>
        <h2 className="mt-2 text-3xl font-black text-amber-400">¡Fin del juego!</h2>
        <p className="mt-1 text-lg font-bold" style={{ color: winner.color }}>
          Gana {winner.name}
        </p>
      </div>

      <div className="w-full max-w-sm space-y-2">
        {sorted.map((team, i) => (
          <div
            key={team.id}
            className={`flex items-center justify-between rounded-xl p-4 ${
              i === 0 ? 'border-2 border-amber-500 bg-zinc-900' : 'border border-zinc-800 bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg font-black text-zinc-500">#{i + 1}</span>
              <span className="h-4 w-4 rounded-full" style={{ background: team.color }} />
              <span className="font-bold">{i === 0 ? '👑 ' : ''}{team.name}</span>
            </div>
            <span className="text-xl font-black text-amber-400">{team.score}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onNewGame}
        className="w-full max-w-sm rounded-2xl bg-purple-600 py-4 text-lg font-bold text-white transition hover:bg-purple-500"
      >
        Nueva partida
      </button>
    </div>
  );
}
