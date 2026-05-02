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
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-qr-muted">Turno de</p>
        <h2 className="mt-1 font-display text-3xl font-bold" style={{ color: currentTeam.color }}>
          {currentTeam.name}
        </h2>
      </div>

      <div className="text-center">
        <p className="text-xl font-black text-qr-text">¿Cuánto tiempo apostás?</p>
        <p className="mt-1 text-sm text-qr-muted">Menos tiempo = más puntos si adivinás</p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-3">
        {BET_OPTIONS.map((opt) => {
          const meta = BET_META[opt.seconds];
          return (
            <button
              key={opt.seconds}
              onClick={() => onBet(opt.seconds)}
              className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-qr-card/60 px-6 py-5 transition hover:border-white/20 hover:bg-qr-card active:scale-95"
            >
              <div
                className={`absolute left-0 top-0 h-0.5 ${meta.barWidth}`}
                style={{ background: meta.color }}
              />
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <span className="block text-2xl font-black text-qr-text">{opt.label}</span>
                  <span className="text-xs font-bold" style={{ color: meta.color }}>{meta.risk}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-2xl font-black text-qr-yellow">{opt.points}</span>
                  <span className="text-xs text-qr-muted">pts base</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
