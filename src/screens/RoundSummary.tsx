import type { Team } from '../types';

interface Props {
  teams: Team[];
  round: number;
  onNext: () => void;
  onEnd: () => void;
}

export default function RoundSummary({ teams, round, onNext, onEnd }: Props) {
  const sorted = [...teams].sort((a, b) => b.score - a.score);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <div className="text-center">
        <p className="text-sm text-zinc-400">Después de la ronda {round}</p>
        <h2 className="text-3xl font-black text-purple-500">Marcador</h2>
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

      <div className="flex w-full max-w-sm gap-2">
        <button
          onClick={onNext}
          className="flex-1 rounded-2xl bg-purple-600 py-4 text-lg font-bold text-white transition hover:bg-purple-500"
        >
          Siguiente ronda
        </button>
        <button
          onClick={onEnd}
          className="rounded-2xl border border-zinc-700 px-4 py-4 text-sm text-zinc-400 transition hover:border-red-500"
        >
          Terminar
        </button>
      </div>
    </div>
  );
}
