import { useRef, useState } from 'react';
import { BET_OPTIONS } from '../types';
import type { Team } from '../types';

interface Props {
  currentTeam: Team;
  onBet: (seconds: number) => void | Promise<void>;
}
const BET_META: Record<number, { risk: string; color: string }> = {
  3: { risk: 'Para los que se la saben', color: '#faa6bf' },
  5: { risk: 'Un poco de instinto', color: '#b6a4ff' },
  10: { risk: 'Dale una vuelta', color: '#f6dd79' },
  30: { risk: 'Escuchá con calma', color: '#83d8b8' },
};

export default function BetTime({ currentTeam, onBet }: Props) {
  const [selectedSeconds, setSelectedSeconds] = useState<number | null>(null);
  const [starting, setStarting] = useState(false);
  const startingRef = useRef(false);
  const start = async () => {
    if (selectedSeconds === null || startingRef.current) return;
    startingRef.current = true;
    setStarting(true);
    try {
      await onBet(selectedSeconds);
    } finally {
      startingRef.current = false;
      setStarting(false);
    }
  };
  return (
    <main className="bet-page">
      <div className="turn-label">
        <span style={{ background: currentTeam.color }} />
        <span>
          Turno de <strong>{currentTeam.name}</strong>
        </span>
      </div>
      <div className="page-intro">
        <p className="eyebrow">CONFIÁ EN TU OÍDO</p>
        <h1>¿En cuántos segundos?</h1>
        <p>Menos tiempo para escuchar. Más puntos por acertar.</p>
      </div>
      <div className="bet-grid">
        {BET_OPTIONS.map((opt) => (
          <button
            key={opt.seconds}
            onClick={() => setSelectedSeconds(opt.seconds)}
            disabled={starting}
            aria-pressed={selectedSeconds === opt.seconds}
            className={`bet-card ${selectedSeconds === opt.seconds ? 'is-selected' : ''}`}
          >
            <span className="bet-card-top">
              <span style={{ color: BET_META[opt.seconds].color }}>
                {BET_META[opt.seconds].risk}
              </span>
              <span className="selection-check" aria-hidden="true">
                {selectedSeconds === opt.seconds ? '✓' : ''}
              </span>
            </span>
            <span className="bet-duration">
              {opt.seconds}
              <small>seg</small>
            </span>
            <span className="bet-points">
              <strong>{opt.points}</strong> puntos base
            </span>
          </button>
        ))}
      </div>
      <p className="bet-bonus">
        Acertá la canción para ganar los puntos base. +1 si también sabés el
        artista.
      </p>
      <button
        className="primary-button bet-start"
        onClick={start}
        disabled={selectedSeconds === null || starting}
      >
        {starting
          ? 'Iniciando…'
          : selectedSeconds === null
            ? 'Elegí el tiempo para continuar'
            : `Escuchar ${selectedSeconds} segundos`}
        <span aria-hidden="true">▶</span>
      </button>
      <p className="start-hint">La música empieza cuando presionás escuchar.</p>
    </main>
  );
}
