import { GENRES } from '../types';
import type { Team } from '../types';

interface Props {
  currentTeam: Team;
  onSelect: (genre: string) => void;
  loading: boolean;
}

export default function GenreSelect({ currentTeam, onSelect, loading }: Props) {
  return (
    <div className="flex min-h-screen flex-col items-center gap-6 px-4 pt-12">
      <div className="text-center">
        <p className="text-sm text-zinc-400">Turno de</p>
        <h2 className="text-2xl font-black" style={{ color: currentTeam.color }}>
          {currentTeam.name}
        </h2>
      </div>

      <h3 className="text-lg font-bold text-zinc-300">Elige el género</h3>

      <div className="grid w-full max-w-sm grid-cols-2 gap-2">
        {GENRES.map((genre) => (
          <button
            key={genre}
            onClick={() => onSelect(genre)}
            disabled={loading}
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-4 text-sm font-bold transition hover:border-purple-500 hover:bg-zinc-800 disabled:opacity-40"
          >
            {genre}
          </button>
        ))}
      </div>

      {loading && (
        <p className="animate-pulse text-sm text-zinc-400">Cargando canciones...</p>
      )}
    </div>
  );
}
