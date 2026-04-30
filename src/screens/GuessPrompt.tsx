import type { Team } from '../types';

interface Props {
  currentTeam: Team;
  stealMode: boolean;
  stealTeam: Team | null;
  onGotIt: () => void;
  onDidNotGetIt: () => void;
  onSkip: () => void;
}

export default function GuessPrompt({ currentTeam, stealMode, stealTeam, onGotIt, onDidNotGetIt, onSkip }: Props) {
  const team = stealMode ? stealTeam : currentTeam;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 text-center">
      <div>
        {stealMode && <p className="mb-2 text-sm font-bold text-red-400">🔥 ROBO</p>}
        <h2 className="text-2xl font-black" style={{ color: team?.color }}>
          {team?.name}
        </h2>
        <p className="mt-2 text-lg text-zinc-300">
          ⏱️ ¡Tiempo! ¿Alguien la tiene?
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-3">
        <button
          onClick={onGotIt}
          className="rounded-2xl bg-green-600 py-5 text-xl font-black text-white transition hover:bg-green-500"
        >
          ✅ ¡La tengo!
        </button>
        <p className="text-xs text-zinc-500">
          El jugador que adivinó toma el teléfono para ver la respuesta
        </p>

        <button
          onClick={onDidNotGetIt}
          className="rounded-2xl border border-zinc-700 bg-zinc-900 py-4 text-lg font-bold transition hover:border-red-500"
        >
          ❌ Nadie la tiene
        </button>

        <button
          onClick={onSkip}
          className="py-2 text-sm text-zinc-500 hover:text-zinc-300"
        >
          ⏭ Saltar
        </button>
      </div>
    </div>
  );
}
