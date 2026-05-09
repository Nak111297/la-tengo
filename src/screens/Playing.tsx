import type { Team } from '../types';

interface Props {
  currentTeam: Team;
  betSeconds: number;
  timeLeft: number;
  stealMode: boolean;
  stealTeam: Team | null;
  onBuzzIn: () => void;
  onSkip: () => void;
  sessionCode?: string | null;
  canBuzz?: boolean;
}

const EQ_DELAYS = [0, 0.15, 0.08, 0.22, 0.05];

export default function Playing({ currentTeam, betSeconds, timeLeft, stealMode, stealTeam, onBuzzIn, onSkip, sessionCode, canBuzz = true }: Props) {
  const pct = Math.max(0, Math.min(100, (timeLeft / betSeconds) * 100));
  const ringColor = stealMode ? '#FF4D4D' : '#22D3EE';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      {stealMode ? (
        <div className="text-center">
          <span className="inline-block rounded-full bg-qr-red/20 px-3 py-1 text-xs font-black uppercase tracking-widest text-qr-red">
            🔥 Robo
          </span>
          <h2 className="mt-2 font-display text-2xl font-bold" style={{ color: stealTeam?.color }}>
            {stealTeam?.name}
          </h2>
          <p className="mt-1 text-sm text-qr-muted">puede robar la canción</p>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-qr-muted">Escuchando</p>
          <h2 className="mt-1 font-display text-2xl font-bold" style={{ color: currentTeam.color }}>
            {currentTeam.name}
          </h2>
        </div>
      )}

      <div className="relative flex h-44 w-44 items-center justify-center">
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="44"
            fill="none"
            stroke={ringColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${pct * 2.765} 276.5`}
            style={{ filter: `drop-shadow(0 0 8px ${ringColor}80)`, transition: 'stroke-dasharray 0.1s' }}
          />
        </svg>
        <div className="text-center">
          <span className="block text-4xl font-black font-mono text-qr-yellow" style={{ textShadow: '0 0 20px rgba(255,210,63,0.5)' }}>
            {Math.ceil(timeLeft)}
          </span>
          <span className="text-xs text-qr-muted">seg</span>
        </div>
      </div>

      {/* Equalizer bars */}
      <div className="flex items-center gap-3 text-sm text-qr-muted">
        <div className="flex items-end gap-0.5">
          {EQ_DELAYS.map((delay, i) => (
            <div
              key={i}
              className="w-0.5 rounded-full eq-bar"
              style={{
                height: '16px',
                background: 'linear-gradient(to top, #FF2E88, #22D3EE)',
                animationDelay: `${delay}s`,
              }}
            />
          ))}
        </div>
        Reproduciendo
      </div>

      <button
        onClick={onBuzzIn}
        disabled={!canBuzz}
        className="w-full max-w-xs rounded-full bg-qr-primary py-6 text-2xl font-black text-qr-text shadow-[0_0_32px_rgba(255,46,136,0.55)] transition active:scale-95 hover:brightness-110 disabled:opacity-35 disabled:shadow-none disabled:hover:brightness-100"
      >
        {canBuzz ? '¡Que Rolón!' : 'Esperando turno'}
      </button>

      {sessionCode && (
        <div className="flex flex-col items-center gap-1.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-qr-muted/50">
            Buzzers — escanear para unirse
          </p>
          <div className="rounded-[24px] border border-white/10 bg-qr-card p-1.5">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(window.location.origin + '/buzz?room=' + sessionCode)}&size=96x96&color=e2e8f0&bgcolor=0f0f1a`}
              alt="QR"
              className="h-24 w-24 rounded-lg"
            />
          </div>
          <span className="font-mono text-base font-black tracking-[0.3em] text-qr-cyan">
            {sessionCode}
          </span>
        </div>
      )}

      <button
        onClick={onSkip}
        className="rounded-full border border-white/15 px-8 py-3 text-sm font-bold text-qr-muted transition hover:border-qr-cyan hover:text-qr-cyan active:scale-95"
      >
        ⏭ Saltar canción
      </button>
    </div>
  );
}
