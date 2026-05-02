import type { Team } from '../types';

interface Props {
  currentTeam: Team;
  stealMode: boolean;
  stealTeam: Team | null;
  onGotIt: () => void;
  onDidNotGetIt: () => void;
  onSkip: () => void;
  gameMode?: 'knowledge' | 'speed';
  speedPoints?: number | null;
}

export default function GuessPrompt({ currentTeam, stealMode, stealTeam, onGotIt, onDidNotGetIt, onSkip, gameMode, speedPoints }: Props) {
  const team = stealMode ? stealTeam : currentTeam;
  const isSpeed = gameMode === 'speed';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 text-center">
      <div>
        {stealMode && (
          <span className="mb-3 inline-block rounded-full bg-qr-red/20 px-3 py-1 text-xs font-black uppercase tracking-widest text-qr-red">
            🔥 Robo
          </span>
        )}
        {isSpeed && speedPoints != null && (
          <div className="mb-3">
            <span className="inline-block rounded-full bg-qr-yellow/20 px-4 py-1 text-sm font-black text-qr-yellow">
              ⚡ {speedPoints} pts bloqueados
            </span>
          </div>
        )}
        <h2 className="font-display text-3xl font-bold" style={{ color: team?.color }}>
          {team?.name}
        </h2>
        <p className="mt-2 text-lg text-qr-text/80">
          {isSpeed ? '¿La tenés?' : '⏱ ¡Tiempo! ¿Alguien la tiene?'}
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-3">
        <button
          onClick={onGotIt}
          className="rounded-full bg-qr-green py-5 text-xl font-black text-qr-bg shadow-[0_0_28px_rgba(124,255,107,0.4)] transition active:scale-95 hover:brightness-110"
        >
          ✅ ¡La tengo!
        </button>

        {!isSpeed && (
          <p className="text-xs text-qr-muted/60">
            El jugador que adivinó toma el teléfono para ver la respuesta
          </p>
        )}

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
