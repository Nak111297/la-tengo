import { GENRES, GENRE_ICONS } from '../types';
import type { Team } from '../types';

interface Props {
  currentTeam: Team;
  onSelect: (genre: string) => void;
  loading: boolean;
  gameMode?: 'knowledge' | 'speed';
}

export default function GenreSelect({ currentTeam, onSelect, loading, gameMode }: Props) {
  return (
    <div className="flex min-h-screen flex-col items-center gap-6 px-4 pt-16 pb-8 bg-zinc-950">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Turno de</p>
        <h2 className="mt-1 text-3xl font-black" style={{ color: currentTeam.color }}>
          {currentTeam.name}
        </h2>
        {gameMode === 'speed' && (
          <p className="mt-1 text-xs text-orange-400 font-bold">⚡ Modo Speed · la canción empieza al instante</p>
        )}
      </div>

      <p className="text-sm font-bold text-zinc-400">Elegí el género</p>

      <div className="grid w-full max-w-sm grid-cols-2 gap-2">
        {GENRES.map((genre) => (
          <button
            key={genre}
            onClick={() => onSelect(genre)}
            disabled={loading}
            className="flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-4 text-sm font-bold transition hover:border-fuchsia-500 hover:bg-zinc-800 active:scale-95 disabled:opacity-40 text-left"
          >
            <span className="text-xl">{GENRE_ICONS[genre] ?? '🎵'}</span>
            <span className="leading-tight">{genre}</span>
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-fuchsia-400">
          <span className="animate-spin">⟳</span>
          <span className="animate-pulse">Cargando canción...</span>
        </div>
      )}
    </div>
  );
}
