import { useMemo } from 'react';
import type { Team } from '../types';

interface Props {
  teams: Team[];
  onNewGame: () => void;
}

const CONFETTI_COLORS = ['#f59e0b', '#ef4444', '#3b82f6', '#22c55e', '#8b5cf6', '#ec4899', '#f97316', '#fbbf24'];

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
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-8 overflow-hidden px-4 text-center bg-zinc-950">
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(-16px) rotate(0deg);   opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(105vh) rotate(600deg); opacity: 0; }
        }
        @keyframes trophy-pop {
          0%   { transform: scale(0.3) rotate(-12deg); opacity: 0; }
          65%  { transform: scale(1.18) rotate(4deg);  opacity: 1; }
          100% { transform: scale(1)   rotate(0deg);   opacity: 1; }
        }
        @keyframes slide-up-fade {
          0%   { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0);    opacity: 1; }
        }
        @keyframes card-in {
          0%   { transform: translateY(16px) scale(0.96); opacity: 0; }
          100% { transform: translateY(0)    scale(1);    opacity: 1; }
        }
        .confetti-p  { position: absolute; top: -12px; animation: confetti-fall linear forwards; }
        .anim-trophy { animation: trophy-pop    0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .anim-slide  { animation: slide-up-fade 0.4s ease forwards; opacity: 0; }
        .anim-card   { animation: card-in       0.35s cubic-bezier(0.25, 0.8, 0.25, 1) forwards; opacity: 0; }
      `}</style>

      {/* Confetti layer */}
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
        <div className="anim-trophy flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 text-5xl shadow-2xl shadow-amber-900/50">
          🏆
        </div>
        <h2
          className="anim-slide text-4xl font-black text-white"
          style={{ animationDelay: '0.25s' }}
        >
          ¡Fin del juego!
        </h2>
        <p
          className="anim-slide text-2xl font-black"
          style={{ color: winner.color, animationDelay: '0.4s' }}
        >
          🎉 {winner.name} gana
        </p>
      </div>

      {/* Leaderboard */}
      <div className="w-full max-w-sm space-y-2">
        {sorted.map((team, i) => (
          <div
            key={team.id}
            className={`anim-card flex items-center justify-between rounded-2xl px-5 py-4 ${
              i === 0
                ? 'border-2 border-amber-500/60 bg-zinc-900 shadow-lg shadow-amber-900/20'
                : 'border border-zinc-800 bg-zinc-900'
            }`}
            style={{ animationDelay: `${0.55 + i * 0.08}s` }}
          >
            <div className="flex items-center gap-3">
              <span className="w-6 text-center text-sm font-black text-zinc-600">
                {i === 0 ? '👑' : `#${i + 1}`}
              </span>
              <span className="h-3 w-3 rounded-full" style={{ background: team.color }} />
              <span className="font-bold text-white">{team.name}</span>
            </div>
            <span className="text-2xl font-black text-amber-400">{team.score}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onNewGame}
        className="anim-slide w-full max-w-sm rounded-2xl bg-gradient-to-r from-fuchsia-600 to-violet-600 py-4 text-lg font-black text-white shadow-lg shadow-fuchsia-900/30 transition active:scale-95 hover:brightness-110"
        style={{ animationDelay: `${0.55 + sorted.length * 0.08 + 0.1}s` }}
      >
        Nueva partida
      </button>
    </div>
  );
}
