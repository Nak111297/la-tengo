import type { TrackInfo } from '../types';

interface Props {
  track: TrackInfo;
  noneScored?: boolean;
  onCorrect: () => void;
  onWrong: () => void;
  onNoScore: () => void;
}

export default function Reveal({ track, noneScored, onCorrect, onWrong, onNoScore }: Props) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      {noneScored ? (
        <p className="text-sm text-zinc-400">😬 Nadie la supo — esta era la canción</p>
      ) : (
        <p className="text-sm text-zinc-400">🔒 Solo el jugador que adivinó debe ver esto</p>
      )}

      <div className="w-full max-w-sm rounded-2xl border-2 border-amber-500 bg-zinc-900 p-6">
        {track.albumArt && (
          <img src={track.albumArt} alt="Album art" className="mx-auto mb-4 h-40 w-40 rounded-xl" />
        )}
        <h2 className="text-2xl font-black text-white">{track.name}</h2>
        <p className="mt-1 text-lg text-zinc-300">{track.artist}</p>
        <p className="mt-1 text-sm text-zinc-500">{track.album} · {track.year}</p>
      </div>

      {noneScored ? (
        <button
          onClick={onNoScore}
          className="w-full max-w-sm rounded-2xl bg-zinc-700 py-4 text-lg font-bold text-white transition hover:bg-zinc-600"
        >
          Siguiente ronda
        </button>
      ) : (
        <div className="flex w-full max-w-sm flex-col gap-3">
          <button onClick={onCorrect} className="rounded-2xl bg-green-600 py-4 text-lg font-bold text-white transition hover:bg-green-500">
            ✅ ¡Correcto!
          </button>
          <button onClick={onWrong} className="rounded-2xl border border-zinc-700 bg-zinc-900 py-4 text-lg font-bold transition hover:border-red-500">
            ❌ Incorrecto
          </button>
        </div>
      )}
    </div>
  );
}
