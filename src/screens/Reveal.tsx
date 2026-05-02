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
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center bg-zinc-950">
      <style>{`
        @keyframes reveal-in {
          0%   { transform: scale(0.88) translateY(14px); opacity: 0; }
          100% { transform: scale(1)    translateY(0);    opacity: 1; }
        }
        @keyframes art-in {
          0%   { transform: scale(0.7) rotate(-4deg); opacity: 0; }
          60%  { transform: scale(1.05) rotate(1deg); opacity: 1; }
          100% { transform: scale(1)   rotate(0deg);  opacity: 1; }
        }
        .anim-reveal-card { animation: reveal-in 0.45s cubic-bezier(0.34, 1.2, 0.64, 1) forwards; }
        .anim-art         { animation: art-in    0.5s cubic-bezier(0.34, 1.3, 0.64, 1) 0.1s forwards; opacity: 0; }
      `}</style>

      <p className="text-sm text-zinc-500">
        {noneScored ? '😬 Nadie la supo — esta era la canción' : '🔒 Solo el jugador que adivinó debe ver esto'}
      </p>

      <div className="anim-reveal-card w-full max-w-sm rounded-3xl border-2 border-amber-500/60 bg-zinc-900 p-6 shadow-xl shadow-amber-900/20">
        {track.albumArt ? (
          <img
            src={track.albumArt}
            alt="Album art"
            className="anim-art mx-auto mb-4 h-40 w-40 rounded-2xl object-cover shadow-lg"
          />
        ) : (
          <div className="anim-art mx-auto mb-4 flex h-40 w-40 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-600 to-violet-700 text-5xl shadow-lg">
            🎵
          </div>
        )}
        <h2 className="text-2xl font-black text-white">{track.name}</h2>
        <p className="mt-1 text-lg text-zinc-300">{track.artist}</p>
        <p className="mt-1 text-sm text-zinc-500">{track.album} · {track.year}</p>
      </div>

      {noneScored ? (
        <button
          onClick={onNoScore}
          className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 py-4 text-base font-bold transition hover:bg-zinc-800 active:scale-95"
        >
          Siguiente ronda →
        </button>
      ) : (
        <div className="flex w-full max-w-sm flex-col gap-3">
          <button
            onClick={onCorrect}
            className="rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 py-4 text-lg font-black text-white shadow-lg shadow-green-900/30 transition active:scale-95 hover:brightness-110"
          >
            ✅ ¡Correcto!
          </button>
          <button
            onClick={onWrong}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 py-4 text-base font-bold text-zinc-300 transition hover:border-red-500 hover:text-red-400 active:scale-95"
          >
            ❌ Incorrecto
          </button>
        </div>
      )}
    </div>
  );
}
