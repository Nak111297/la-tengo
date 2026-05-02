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
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 bg-zinc-950">
      <style>{`
        @keyframes card-in {
          0%   { transform: translateY(18px) scale(0.96); opacity: 0; }
          100% { transform: translateY(0)    scale(1);    opacity: 1; }
        }
        .card-in { animation: card-in 0.35s cubic-bezier(0.25, 0.8, 0.25, 1) forwards; opacity: 0; }
      `}</style>

      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Ronda {round}</p>
        <h2 className="mt-1 text-3xl font-black bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
          Marcador
        </h2>
      </div>

      <div className="w-full max-w-sm space-y-2">
        {sorted.map((team, i) => (
          <div
            key={team.id}
            className={`card-in flex items-center justify-between rounded-2xl px-5 py-4 ${
              i === 0 ? 'border-2 border-amber-500/60 bg-zinc-900' : 'border border-zinc-800 bg-zinc-900'
            }`}
            style={{ animationDelay: `${i * 75}ms` }}
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

      <div className="flex w-full max-w-sm gap-2">
        <button
          onClick={onNext}
          className="flex-1 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-violet-600 py-4 text-base font-black text-white shadow-lg shadow-fuchsia-900/30 transition active:scale-95 hover:brightness-110"
        >
          Siguiente ronda →
        </button>
        <button
          onClick={onEnd}
          className="rounded-2xl border border-zinc-800 px-4 py-4 text-sm text-zinc-500 transition hover:border-red-800 hover:text-red-400"
        >
          Terminar
        </button>
      </div>
    </div>
  );
}
