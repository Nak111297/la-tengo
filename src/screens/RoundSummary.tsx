import { useState, useEffect, useRef } from 'react';
import type { Team } from '../types';

interface Props {
  teams: Team[];
  round: number;
  roundPoints: Record<string, number>;
  onNext: () => void;
  onEnd: () => void;
}

interface RowData {
  team: Team;
  prevScore: number;
  gained: number;
  rank: number;
  isNewLeader: boolean;
}

// ── Individual animated team row ──────────────────────────────────────────────

function TeamRow({ row, idx }: { row: RowData; idx: number }) {
  const [displayScore, setDisplayScore] = useState(row.prevScore);
  const rafRef = useRef(0);

  useEffect(() => {
    if (row.gained === 0) {
      setDisplayScore(row.team.score);
      return;
    }
    const DELAY = 650;
    const DURATION = 900;
    const from = row.prevScore;
    const to = row.team.score;
    let startTs: number | null = null;

    const animate = (ts: number) => {
      if (!startTs) startTs = ts;
      const t = Math.min((ts - startTs) / DURATION, 1);
      const eased = 1 - Math.pow(1 - t, 3); // cubic ease-out
      setDisplayScore(Math.round(from + (to - from) * eased));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    const timeout = setTimeout(() => {
      rafRef.current = requestAnimationFrame(animate);
    }, DELAY);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLeader = row.rank === 0;

  return (
    <div
      className={`anim-card relative flex items-center justify-between rounded-[24px] px-5 py-4 ${
        isLeader
          ? `border border-qr-primary/50 bg-qr-card/80 shadow-[0_0_20px_rgba(255,46,136,0.15)] ${row.isNewLeader ? 'leader-glow' : ''}`
          : 'border border-white/10 bg-qr-card/60'
      }`}
      style={{ animationDelay: `${idx * 75}ms` }}
    >
      {/* Left side */}
      <div className="flex items-center gap-3 min-w-0">
        <span className="w-6 shrink-0 text-center text-sm font-black text-qr-muted">
          {isLeader ? '👑' : `#${row.rank + 1}`}
        </span>
        <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: row.team.color }} />
        <span className="font-bold text-qr-text truncate">{row.team.name}</span>
        {row.isNewLeader && (
          <span
            className="new-leader-in shrink-0 rounded-full bg-qr-yellow/20 px-2 py-0.5 text-[10px] font-black text-qr-yellow"
            style={{ animationDelay: '1550ms' }}
          >
            ¡Nuevo Líder!
          </span>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 shrink-0">
        {row.gained > 0 && (
          <span
            className="pts-badge rounded-full bg-qr-green/20 px-2 py-0.5 text-xs font-black text-qr-green"
            style={{ animationDelay: '600ms' }}
          >
            +{row.gained}
          </span>
        )}
        <span
          className="font-display text-2xl font-bold tabular-nums"
          style={
            isLeader
              ? { color: '#FFD23F', textShadow: '0 0 16px rgba(255,210,63,0.5)' }
              : { color: '#F8F7FF' }
          }
        >
          {displayScore}
        </span>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function RoundSummary({ teams, round, roundPoints, onNext, onEnd }: Props) {
  // Build row data
  const withPrev = teams.map((team) => ({
    team,
    prevScore: team.score - (roundPoints[team.id] ?? 0),
    gained: roundPoints[team.id] ?? 0,
  }));

  // Sort by current score descending
  const sorted = [...withPrev].sort((a, b) => b.team.score - a.team.score);

  // Determine if there's a new leader this round
  const prevLeaderId = [...withPrev].sort((a, b) => b.prevScore - a.prevScore)[0]?.team.id;
  const currentLeaderId = sorted[0]?.team.id;
  const leaderChanged = prevLeaderId !== currentLeaderId && Object.keys(roundPoints).length > 0;

  const rows: RowData[] = sorted.map((row, rank) => ({
    ...row,
    rank,
    isNewLeader: leaderChanged && rank === 0,
  }));

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-10">
      {/* Header */}
      <div className="text-center anim-slide-up">
        <p className="text-xs font-bold uppercase tracking-widest text-qr-muted">Ronda {round}</p>
        <h2 className="mt-1 font-display text-3xl font-bold bg-gradient-to-r from-qr-primary to-qr-cyan bg-clip-text text-transparent">
          Marcador
        </h2>
      </div>

      {/* Leaderboard */}
      <div className="w-full max-w-sm space-y-2">
        {rows.map((row, i) => (
          <TeamRow key={row.team.id} row={row} idx={i} />
        ))}
      </div>

      {/* Actions */}
      <div className="flex w-full max-w-sm gap-2">
        <button
          onClick={onNext}
          className="flex-1 rounded-full bg-qr-primary py-4 text-base font-black text-qr-text shadow-[0_0_24px_rgba(255,46,136,0.45)] transition active:scale-95 hover:brightness-110"
        >
          Siguiente ronda →
        </button>
        <button
          onClick={onEnd}
          className="rounded-full border border-white/15 px-5 py-4 text-sm text-qr-muted transition hover:border-qr-red hover:text-qr-red"
        >
          Terminar
        </button>
      </div>
    </div>
  );
}
