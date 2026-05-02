import { redirectToSpotifyAuth } from '../lib/spotify';

const EQ_HEIGHTS = [0.5, 0.85, 1, 0.65, 0.9, 0.55, 0.8, 0.5];

export default function Login() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-12 px-6 text-center">
      {/* Logo */}
      <div className="flex flex-col items-center">
        <img
          src="/logorolon2.png"
          alt="Que Rolón"
          className="w-[576px] max-w-full select-none drop-shadow-[0_0_40px_rgba(255,46,136,0.4)]"
          draggable={false}
        />
        {/* Equalizer bars */}
        <div className="mt-2 flex items-end gap-1">
          {EQ_HEIGHTS.map((_, i) => (
            <div
              key={i}
              className="w-1 rounded-full eq-bar"
              style={{
                height: '20px',
                background: `linear-gradient(to top, #FF2E88, #22D3EE)`,
                animationDelay: `${i * 0.09}s`,
              }}
            />
          ))}
        </div>
        <p className="mt-3 text-sm text-qr-muted">Adivina la canción antes que todos</p>
      </div>

      <div className="flex flex-col items-center gap-3 w-full max-w-xs">
        <button
          onClick={redirectToSpotifyAuth}
          className="flex w-full items-center justify-center gap-3 rounded-full bg-[#1DB954] px-8 py-4 text-base font-bold text-black shadow-[0_0_28px_rgba(29,185,84,0.45)] transition active:scale-95 hover:brightness-110"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-black shrink-0" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          Conectar con Spotify
        </button>
      </div>

      <p className="max-w-xs text-xs text-qr-muted/60">
        Necesitás Spotify Premium. Solo el host se conecta.
      </p>
    </div>
  );
}
