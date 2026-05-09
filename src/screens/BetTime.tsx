import { useState } from 'react';
import { BET_OPTIONS } from '../types';
import type { Team } from '../types';

interface Props {
  currentTeam: Team;
  onBet: (seconds: number) => void;
}

const BET_META: Record<number, { risk: string; color: string; barWidth: string }> = {
  3:  { risk: 'Máximo riesgo', color: '#FF4D4D', barWidth: 'w-full' },
  5:  { risk: 'Arriesgado',   color: '#FF2E88', barWidth: 'w-3/4' },
  10: { risk: 'Cauteloso',    color: '#FFD23F', barWidth: 'w-1/2' },
  30: { risk: 'Sin riesgo',   color: '#7CFF6B', barWidth: 'w-1/4' },
};

export default function BetTime({ currentTeam, onBet }: Props) {
  const [selectedSeconds, setSelectedSeconds] = useState<number | null>(null);

  const chooseBet = (seconds: number) => {
    setSelectedSeconds(seconds);
    onBet(seconds);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-qr-muted">Turno de</p>
        <h2 className="mt-1 font-display text-3xl font-bold" style={{ color: currentTeam.color }}>
          {currentTeam.name}
        </h2>
      </div>

      <div className="text-center">
        <p className="text-xl font-black text-qr-text">¿Cuánto tiempo apuestas?</p>
        <p className="mt-1 text-sm text-qr-muted">Elige cuánto tiempo escucharán antes de responder.</p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-3">
        {BET_OPTIONS.map((opt) => {
          const meta = BET_META[opt.seconds];
          return (
            <button
              key={opt.seconds}
              onClick={() => chooseBet(opt.seconds)}
              className={`group relative overflow-hidden rounded-[28px] border px-6 py-5 transition hover:border-white/20 hover:bg-qr-card active:scale-95 ${
                selectedSeconds === opt.seconds
                  ? 'bg-qr-card shadow-[0_0_22px_rgba(255,255,255,0.08)]'
                  : 'border-white/10 bg-qr-card/60'
              }`}
              style={selectedSeconds === opt.seconds ? { borderColor: currentTeam.color, background: `${currentTeam.color}18` } : undefined}
            >
              <div
                className={`absolute left-0 top-0 h-[3px] ${meta.barWidth}`}
                style={{ background: meta.color }}
              />
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <span className="block text-2xl font-black text-qr-text">{opt.label} → {opt.points} pts</span>
                  <span className="text-xs font-bold" style={{ color: meta.color }}>{meta.risk}</span>
                </div>
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-black ${
                    selectedSeconds === opt.seconds ? 'text-qr-bg' : 'text-white/30'
                  }`}
                  style={selectedSeconds === opt.seconds ? { background: currentTeam.color, borderColor: currentTeam.color } : { borderColor: 'rgba(255,255,255,0.18)' }}
                >
                  {selectedSeconds === opt.seconds ? '✓' : ''}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
