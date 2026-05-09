import { GENRES, GENRE_ICONS, GENRE_LABELS } from '../types';
import type { Team } from '../types';

interface Props {
  currentTeam: Team;
  onSelect: (genre: string) => void;
  loading: boolean;
  gameMode?: 'knowledge' | 'speed';
}

export default function GenreSelect({ currentTeam, onSelect, loading, gameMode }: Props) {
  return (
    <div className="flex min-h-screen flex-col items-center gap-6 px-4 pt-16 pb-8">
      <div
        className="w-full max-w-sm rounded-[24px] border px-5 py-4 text-center"
        style={{ borderColor: `${currentTeam.color}55`, background: `${currentTeam.color}14` }}
      >
        <p className="text-xs font-bold uppercase tracking-widest text-qr-muted">Turno de</p>
        <h2 className="mt-1 font-display text-3xl font-bold" style={{ color: currentTeam.color }}>
          {currentTeam.name}
        </h2>
        {gameMode === 'speed' && (
          <p className="mt-1 text-xs font-bold text-qr-yellow">⚡ Modo Velocidad · la canción empieza al instante</p>
        )}
      </div>

      <p className="text-sm font-bold text-qr-muted">Elige el género</p>

      <div className={`grid w-full max-w-sm grid-cols-2 gap-2 ${loading ? 'opacity-40 pointer-events-none' : ''}`}>
        {GENRES.map((genre) => (
          <button
            key={genre}
            onClick={() => onSelect(genre)}
            disabled={loading}
            className="flex min-h-[68px] items-center gap-2 rounded-[20px] border border-white/10 bg-qr-card/70 px-4 py-3 text-sm font-bold text-qr-text transition hover:border-qr-primary/50 hover:bg-qr-card active:scale-95 disabled:opacity-40 text-left"
          >
            <span className="text-xl">{GENRE_ICONS[genre] ?? '🎵'}</span>
            <span className="leading-tight">{GENRE_LABELS[genre] ?? genre}</span>
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-qr-primary">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
            <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="animate-pulse">Cargando canción...</span>
        </div>
      )}
    </div>
  );
}
