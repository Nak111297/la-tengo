import type { Team } from '../types';

interface Props {
  currentTeam: Team;
  stealMode: boolean;
  stealTeam: Team | null;
  onGotIt: (teamIdx?: number) => void;
  onDidNotGetIt: () => void;
  onSkip: () => void;
  gameMode?: 'knowledge' | 'speed';
  speedPoints?: number | null;
  teams?: Team[];
}

export default function GuessPrompt({ currentTeam, stealMode, stealTeam, onGotIt, onDidNotGetIt, onSkip, gameMode, speedPoints, teams }: Props) {
  const team = stealMode ? stealTeam : currentTeam;
  const isSpeed = gameMode === 'speed';

  if (isSpeed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 text-center">
        <div>
          <span className="inline-block rounded-full bg-qr-yellow/20 px-4 py-1.5 text-sm font-black text-qr-yellow mb-3">
            ⚡ {speedPoints ?? 0} pts en juego
          </span>
          <h2 className="font-display text-3xl font-bold text-qr-text">¿Quién lo adivinó?</h2>
          <p className="mt-2 text-sm text-qr-muted">Toca el equipo que dijo el nombre</p>
        </div>

        <div className="w-full max-w-sm flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            {teams?.map((t, i) => (
              <button
                key={t.id}
                onClick={() => onGotIt(i)}
                className="rounded-[20px] border-2 py-5 text-base font-black transition active:scale-95 hover:brightness-110"
                style={{
                  borderColor: t.color,
                  background: `${t.color}22`,
                  color: t.color,
                  boxShadow: `0 0 16px ${t.color}44`,
                }}
              >
                {t.name}
              </button>
            ))}
          </div>

          <button
            onClick={onDidNotGetIt}
            className="rounded-full border-2 border-white/20 py-4 text-base font-bold text-qr-muted transition hover:border-qr-red hover:text-qr-red active:scale-95"
          >
            ❌ Nadie adivinó
          </button>

          <button
            onClick={onSkip}
            className="py-2 text-sm text-qr-muted/60 hover:text-qr-muted transition"
          >
            ⏭ Saltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 text-center">
      <div>
        {stealMode && (
          <span className="mb-3 inline-block rounded-full bg-qr-red/20 px-3 py-1 text-xs font-black uppercase tracking-widest text-qr-red">
            🔥 Robo
          </span>
        )}
        <h2 className="font-display text-3xl font-bold" style={{ color: team?.color }}>
          {team?.name}
        </h2>
        <p className="mt-2 text-lg text-qr-text/80">⏱ ¡Tiempo! ¿La tienen?</p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-3">
        <button
          onClick={() => onGotIt()}
          className="rounded-full bg-qr-green py-5 text-xl font-black text-qr-bg shadow-[0_0_28px_rgba(124,255,107,0.4)] transition active:scale-95 hover:brightness-110"
        >
          ✅ ¡La tengo!
        </button>

        <p className="text-xs text-qr-muted/60">
          El jugador que adivinó toma el teléfono para ver la respuesta
        </p>

        <button
          onClick={onDidNotGetIt}
          className="rounded-full border-2 border-qr-red/60 py-4 text-base font-bold text-qr-red transition hover:bg-qr-red/10 active:scale-95"
        >
          ❌ No la tengo
        </button>

        <button
          onClick={onSkip}
          className="py-2 text-sm text-qr-muted/60 hover:text-qr-muted transition"
        >
          ⏭ Saltar
        </button>
      </div>
    </div>
  );
}
