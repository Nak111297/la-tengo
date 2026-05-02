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
        <p className="text-xs font-bold uppercase tracking-widest text-qr-muted">Ronda {round}</p>
        <h2 className="mt-1 font-display text-3xl font-bold bg-gradient-to-r from-qr-primary to-qr-cyan bg-clip-text text-transparent">
          Marcador
        </h2>
      </div>

      <div className="w-full max-w-sm space-y-2">
        {sorted.map((team, i) => (
          <div
            key={team.id}
            className={`anim-card flex items-center justify-between rounded-[24px] px-5 py-4 ${
              i === 0
                ? 'border border-qr-primary/50 bg-qr-card/80 shadow-[0_0_20px_rgba(255,46,136,0.15)]'
                : 'border border-white/10 bg-qr-card/60'
            }`}
            style={{ animationDelay: `${i * 75}ms` }}
          >
            <div className="flex items-center gap-3">
              <span className="w-6 text-center text-sm font-black text-qr-muted">
                {i === 0 ? '👑' : `#${i + 1}`}
              </span>
              <span className="h-3 w-3 rounded-full" style={{ background: team.color }} />
              <span className="font-bold text-qr-text">{team.name}</span>
            </div>
            <span
              className="font-display text-2xl font-bold text-qr-yellow"
              style={i === 0 ? { textShadow: '0 0 16px rgba(255,210,63,0.5)' } : undefined}
            >
              {team.score}
            </span>
          </div>
        ))}
      </div>

      <div className="flex w-full max-w-sm gap-2">
        <button
          onClick={onNext}
          className="flex-1 rounded-full bg-qr-primary py-4 text-base font-black text-qr-text shadow-[0_0_24px_rgba(255,46,136,0.45)] transition active:scale-95 hover:brightness-110"
        >
          Siguiente ronda →
        </button>
        <button
          onClick={onEnd}
          className="rounded-full border border-white/15 px-5 py-4 text-sm text-qr-muted transition hover:border-qr-red hover:text-qr-red"
        >
          Terminar
        </button>
      </div>
    </div>
  );
}
