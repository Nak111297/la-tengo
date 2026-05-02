import { useMemo } from 'react';
import type { Team } from '../types';

interface Props {
  teams: Team[];
  onNewGame: () => void;
}

const CONFETTI_COLORS = ['#FF2E88', '#22D3EE', '#FFD23F', '#7CFF6B', '#FF4D4D', '#B8B3D9', '#FF2E88', '#22D3EE'];

export default function Finished({ teams, onNewGame }: Props) {
  const sorted = [...teams].sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  const particles = useMemo(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2.5,
      duration: 2.5 + Math.random() * 2.5,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: 5 + Math.random() * 9,
      isCircle: i % 3 !== 0,
    })), []);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-8 overflow-hidden px-4 text-center">
      {/* Confetti */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="confetti-p"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: p.color,
              borderRadius: p.isCircle ? '50%' : '3px',
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col items-center gap-3">
        <div
          className="anim-trophy flex h-24 w-24 items-center justify-center rounded-[28px] text-5xl"
          style={{
            background: 'linear-gradient(135deg, #FFD23F, #FF2E88)',
            boxShadow: '0 0 40px rgba(255,210,63,0.5), 0 12px 40px rgba(0,0,0,0.4)',
          }}
        >
          🏆
        </div>
        <h2 className="anim-slide-up font-display text-4xl font-bold text-qr-text" style={{ animationDelay: '0.25s' }}>
          ¡Fin del juego!
        </h2>
        <p
          className="anim-slide-up font-display text-2xl font-bold"
          style={{ color: winner.color, animationDelay: '0.4s', textShadow: `0 0 20px ${winner.color}80` }}
        >
          🎉 {winner.name} gana
        </p>
      </div>

      {/* Leaderboard */}
      <div className="w-full max-w-sm space-y-2">
        {sorted.map((team, i) => (
          <div
            key={team.id}
            className={`anim-card flex items-center justify-between rounded-[24px] px-5 py-4 ${
              i === 0
                ? 'border border-qr-primary/50 bg-qr-card/80 shadow-[0_0_24px_rgba(255,46,136,0.2)]'
                : 'border border-white/10 bg-qr-card/60'
            }`}
            style={{ animationDelay: `${0.55 + i * 0.08}s` }}
          >
            <div className="flex items-center gap-3">
              <span className="w-6 text-center text-sm font-black text-qr-muted">
                {i === 0 ? '👑' : `#${i + 1}`}
              </span>
              <span className="h-3 w-3 rounded-full" style={{ background: team.color }} />
              <span className="font-bold text-qr-text">{team.name}</span>
            </div>
            <span className="font-display text-2xl font-bold text-qr-yellow">{team.score}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onNewGame}
        className="anim-slide-up w-full max-w-sm rounded-full bg-qr-primary py-4 text-lg font-black text-qr-text shadow-[0_0_28px_rgba(255,46,136,0.5)] transition active:scale-95 hover:brightness-110"
        style={{ animationDelay: `${0.55 + sorted.length * 0.08 + 0.1}s` }}
      >
        Nueva partida
      </button>
    </div>
  );
}
