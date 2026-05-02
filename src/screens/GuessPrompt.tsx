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
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 text-center bg-zinc-950">
      <div>
        {stealMode && (
          <span className="mb-3 inline-block rounded-full bg-red-500/20 px-3 py-1 text-xs font-black uppercase tracking-widest text-red-400">
            🔥 Robo
          </span>
        )}
        {isSpeed && speedPoints != null && (
          <div className="mb-3">
            <span className="inline-block rounded-full bg-orange-500/20 px-4 py-1 text-sm font-black text-orange-400">
              ⚡ {speedPoints} pts bloqueados
            </span>
          </div>
        )}
        <h2 className="text-3xl font-black" style={{ color: team?.color }}>
          {team?.name}
        </h2>
        <p className="mt-2 text-lg text-zinc-300">
          {isSpeed ? '¿La tenés?' : '⏱ ¡Tiempo! ¿Alguien la tiene?'}
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-3">
        <button
          onClick={onGotIt}
          className="rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 py-5 text-xl font-black text-white shadow-lg shadow-green-900/30 transition active:scale-95 hover:brightness-110"
        >
          ✅ ¡La tengo!
        </button>

        {!isSpeed && (
          <p className="text-xs text-zinc-600">
            El jugador que adivinó toma el teléfono para ver la respuesta
          </p>
        )}

        <button
          onClick={onDidNotGetIt}
          className="rounded-2xl border border-zinc-800 bg-zinc-900 py-4 text-base font-bold text-zinc-300 transition hover:border-red-500 hover:text-red-400 active:scale-95"
        >
          ❌ No la tengo
        </button>

        <button
          onClick={onSkip}
          className="py-2 text-sm text-zinc-600 hover:text-zinc-400"
        >
          ⏭ Saltar
        </button>
      </div>
    </div>
  );
}
