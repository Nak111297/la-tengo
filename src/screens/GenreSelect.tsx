import type { CSSProperties } from 'react';
import { GENRES, GENRE_ICONS, GENRE_LABELS, RANDOM_GENRE } from '../types';
import type { Team } from '../types';

interface Props {
  currentTeam: Team;
  onSelect: (genre: string) => void;
  loading: boolean;
  gameMode?: 'knowledge' | 'speed';
}
const ACCENTS = [
  '#faa6bf',
  '#ffbc85',
  '#b6a4ff',
  '#f6dd79',
  '#83d8b8',
  '#a5bbfa',
];

export default function GenreSelect({
  currentTeam,
  onSelect,
  loading,
  gameMode,
}: Props) {
  return (
    <main className="genre-page" aria-busy={loading}>
      <div className="turn-label">
        <span style={{ background: currentTeam.color }} />
        <span>
          Turno de <strong>{currentTeam.name}</strong>
        </span>
      </div>
      <div className="genre-heading">
        <div>
          <p className="eyebrow">QUE SUENE LO TUYO</p>
          <h1>¿Qué vamos a escuchar?</h1>
          <p>
            {gameMode === 'speed'
              ? 'Elegí un género. La canción empieza al instante: todos pueden responder.'
              : 'Elegí un género y después apostá cuántos segundos necesitás.'}
          </p>
        </div>
        <span className="genre-count">{GENRES.length - 1} géneros + azar</span>
      </div>
      <div className="genre-grid">
        {GENRES.map((genre, index) => (
          <button
            key={genre}
            onClick={() => onSelect(genre)}
            disabled={loading}
            className={`genre-card ${genre === RANDOM_GENRE ? 'genre-random' : ''}`}
            style={
              {
                '--genre-accent': ACCENTS[index % ACCENTS.length],
              } as CSSProperties
            }
          >
            <span className="genre-card-top">
              <span className="genre-icon" aria-hidden="true">
                {GENRE_ICONS[genre] ?? '🎵'}
              </span>
              <span className="genre-arrow" aria-hidden="true">
                ↗
              </span>
            </span>
            <strong>{GENRE_LABELS[genre] ?? genre}</strong>
            <span className="genre-subtitle">
              {genre === RANDOM_GENRE
                ? 'Dejá que la suerte elija'
                : 'Dale play al reto'}
            </span>
          </button>
        ))}
      </div>
      {loading && (
        <p role="status" className="text-center text-qr-primary mt-6">
          Buscando tu próxima canción…
        </p>
      )}
    </main>
  );
}
