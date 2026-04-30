import { redirectToSpotifyAuth } from '../lib/spotify';

export default function Login() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 text-center">
      <div>
        <h1 className="text-5xl font-black text-purple-500">🎵 La Tengo</h1>
        <p className="mt-2 text-lg text-zinc-400">Adivina la canción antes que todos</p>
      </div>

      <button
        onClick={redirectToSpotifyAuth}
        className="rounded-2xl bg-green-500 px-8 py-4 text-lg font-bold text-black transition hover:bg-green-400"
      >
        Conectar con Spotify
      </button>

      <p className="max-w-xs text-sm text-zinc-500">
        Necesitas Spotify Premium para jugar. Solo el host necesita conectarse.
      </p>
    </div>
  );
}
