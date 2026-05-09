import { useState } from 'react';
import type { TrackInfo } from '../types';

interface Props {
  track: TrackInfo;
  noneScored?: boolean;
  onCorrect: () => void;
  onWrong: () => void;
  onNoScore: () => void;
}

export default function Reveal({ track, noneScored, onCorrect, onWrong, onNoScore }: Props) {
  const [hideArt, setHideArt] = useState(false);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="text-sm text-qr-muted">
        {noneScored ? '😬 Nadie la supo — esta era la canción' : '🔒 Solo el jugador que adivinó debe ver esto'}
      </p>

      <div
        className="anim-reveal w-full max-w-sm rounded-[28px] border border-qr-primary/30 bg-qr-card/80 backdrop-blur-sm p-6 shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_40px_rgba(255,46,136,0.1)]"
      >
        {track.albumArt ? (
          <img
            src={track.albumArt}
            alt="Album art"
            className={`anim-art mx-auto mb-3 h-36 w-36 rounded-[20px] object-cover shadow-lg transition ${hideArt ? 'blur-md opacity-70' : ''}`}
          />
        ) : (
          <div className="anim-art mx-auto mb-4 flex h-40 w-40 items-center justify-center rounded-[20px] bg-gradient-to-br from-qr-primary to-qr-cyan text-5xl shadow-lg">
            🎵
          </div>
        )}
        {track.albumArt && (
          <button
            onClick={() => setHideArt((value) => !value)}
            className="mb-4 rounded-full border border-white/10 px-3 py-1 text-[10px] font-bold text-qr-muted transition hover:border-white/25 hover:text-qr-text"
          >
            {hideArt ? 'Mostrar carátula' : 'Ocultar carátula'}
          </button>
        )}
        <div className="space-y-3 text-left">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-qr-muted">Canción</p>
            <h2 className="font-display text-2xl font-bold text-qr-text">{track.name}</h2>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-qr-muted">Artista</p>
            <p className="text-lg font-bold text-qr-text/90">{track.artist}</p>
          </div>
          {(track.year || track.album) && (
            <p className="text-sm text-qr-muted">
              {track.year ? `Año: ${track.year}` : ''}{track.year && track.album ? ' · ' : ''}{track.album}
            </p>
          )}
        </div>
      </div>

      {noneScored ? (
        <button
          onClick={onNoScore}
          className="w-full max-w-sm rounded-full border border-white/15 py-4 text-base font-bold text-qr-muted transition hover:border-qr-cyan hover:text-qr-cyan active:scale-95"
        >
          Siguiente ronda →
        </button>
      ) : (
        <div className="flex w-full max-w-sm flex-col gap-3">
          <button
            onClick={onCorrect}
            className="rounded-full bg-qr-green py-4 text-lg font-black text-qr-bg shadow-[0_0_24px_rgba(124,255,107,0.35)] transition active:scale-95 hover:brightness-110"
          >
            ✅ ¡Correcto!
          </button>
          <button
            onClick={onWrong}
            className="rounded-full border-2 border-qr-red/60 py-4 text-base font-bold text-qr-red transition hover:bg-qr-red/10 active:scale-95"
          >
            ❌ Incorrecto
          </button>
        </div>
      )}
    </div>
  );
}
