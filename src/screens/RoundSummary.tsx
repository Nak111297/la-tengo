import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import type { Team } from '../types';

interface Props {
  teams: Team[];
  round: number;
  roundPoints: Record<string, number>;
  onNext: () => void;
  onEnd: () => void;
  showActions?: boolean;
}

interface RowData {
  team: Team;
  prevScore: number;
  gained: number;
}

// ── Score count-up hook ───────────────────────────────────────────────────────

function useCountUp(from: number, to: number) {
  const [value, setValue] = useState(from);
  const rafRef = useRef(0);

  useEffect(() => {
    if (from === to) return;
    const DELAY = 650, DURATION = 900;
    let startTs: number | null = null;
    const tick = (ts: number) => {
      if (!startTs) startTs = ts;
      const t = Math.min((ts - startTs) / DURATION, 1);
      setValue(Math.round(from + (to - from) * (1 - Math.pow(1 - t, 3))));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    const timeout = setTimeout(() => { rafRef.current = requestAnimationFrame(tick); }, DELAY);
    return () => { clearTimeout(timeout); cancelAnimationFrame(rafRef.current); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return value;
}

// ── Individual team row ───────────────────────────────────────────────────────

interface TeamRowProps {
  row: RowData;
  rank: number;
  isNewLeader: boolean;
  entryIdx: number;
  showLeaderBadge: boolean;
  setRef: (el: HTMLDivElement | null) => void;
}

function TeamRow({ row, rank, isNewLeader, entryIdx, showLeaderBadge, setRef }: TeamRowProps) {
  const displayScore = useCountUp(row.prevScore, row.team.score);
  // anim-card and leader-glow both define `animation`; applying both simultaneously
  // causes leader-glow (later in CSS) to win, so card-in never runs and the card
  // stays at opacity:0. We swap to leader-glow only after card-in completes.
  const [glowing, setGlowing] = useState(false);

  useEffect(() => {
    if (!isNewLeader) return;
    // card-in finishes at ~(entryIdx*75 + 350)ms; glow starts after flip + some buffer
    const t = setTimeout(() => setGlowing(true), 2350);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isLeader = rank === 0;
  const animClass = glowing ? 'leader-glow' : 'anim-card';

  return (
    <div
      ref={setRef}
      className={`${animClass} relative flex items-center justify-between rounded-[20px] px-5 py-4 ${
        isLeader
          ? 'border border-qr-primary/50 bg-qr-card/80 shadow-[0_0_20px_rgba(255,46,136,0.15)]'
          : 'border border-white/10 bg-qr-card/60'
      }`}
      style={glowing ? undefined : { animationDelay: `${entryIdx * 75}ms` }}
    >
      {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
        <span className="w-6 shrink-0 text-center text-sm font-black text-qr-muted">
          {isLeader ? '👑' : `#${rank + 1}`}
        </span>
        <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: row.team.color }} />
        <span className="font-bold text-qr-text truncate">{row.team.name}</span>
        {showLeaderBadge && (
          <span className="new-leader-in shrink-0 rounded-full bg-qr-yellow/20 px-2 py-0.5 text-[10px] font-black text-qr-yellow">
            ¡Nuevo Líder!
          </span>
        )}
      </div>

      {/* Right */}
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

// ── Main component ────────────────────────────────────────────────────────────

export default function RoundSummary({ teams, round, roundPoints, onNext, onEnd, showActions = true }: Props) {
  const [confirmEnd, setConfirmEnd] = useState(false);
  const rowData: RowData[] = teams.map((team) => ({
    team,
    prevScore: team.score - (roundPoints[team.id] ?? 0),
    gained: roundPoints[team.id] ?? 0,
  }));

  // Sort by current scores (final order) and previous scores (entry order)
  const currentSorted = [...rowData].sort((a, b) => b.team.score - a.team.score);
  const prevSorted = [...rowData].sort((a, b) => {
    const d = b.prevScore - a.prevScore;
    return d !== 0 ? d : b.team.score - a.team.score; // tiebreak by current score
  });

  const prevLeaderId = prevSorted[0]?.team.id;
  const currentLeaderId = currentSorted[0]?.team.id;
  const leaderChanged =
    prevLeaderId !== currentLeaderId && Object.keys(roundPoints).length > 0;
  const scoringRows = currentSorted.filter((row) => row.gained > 0);

  // When leader changes: start in previous order, then FLIP to current order.
  // When unchanged: start in current order directly (no flip needed).
  const [flipped, setFlipped] = useState(!leaderChanged);
  const [showLeaderBadge, setShowLeaderBadge] = useState(false);

  // Ref map: team.id → card DOM element (for FLIP position snapshots)
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  // Positions recorded just before the sort state change (FLIP "First" step)
  const snapshots = useRef<Map<string, number> | null>(null);

  const displayOrder = flipped ? currentSorted : prevSorted;

  // ── FLIP trigger ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!leaderChanged) return;

    // Wait for count-up to finish (~1550 ms) then flip
    const flipTimer = setTimeout(() => {
      // Step 1 — First: snapshot current top positions before React re-sorts
      const tops = new Map<string, number>();
      cardRefs.current.forEach((el, id) => {
        tops.set(id, el.getBoundingClientRect().top);
      });
      snapshots.current = tops;

      // Step 2 — Last: update state; React re-renders in new DOM order
      setFlipped(true);
    }, 1600);

    // Badge appears after flip animation completes
    const badgeTimer = setTimeout(() => setShowLeaderBadge(true), 2400);

    return () => { clearTimeout(flipTimer); clearTimeout(badgeTimer); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── FLIP execution (runs after React commits the re-sorted DOM) ─────────────
  // Steps 3+4 — Invert + Play: runs synchronously before the browser paints.
  useLayoutEffect(() => {
    const tops = snapshots.current;
    if (!tops) return;
    snapshots.current = null;

    cardRefs.current.forEach((el, id) => {
      const fromTop = tops.get(id);
      if (fromTop === undefined) return;
      const toTop = el.getBoundingClientRect().top; // new (Last) position
      const delta = fromTop - toTop;
      if (Math.abs(delta) < 1) return;

      // Invert: make card appear at its old visual position
      el.style.transform = `translateY(${delta}px)`;
      el.style.transition = 'none';

      // Force style flush so the browser treats the above as the "from" value
      void el.getBoundingClientRect();

      // Play: animate to final layout position
      el.style.transform = '';
      el.style.transition = 'transform 600ms cubic-bezier(0.34, 1.2, 0.64, 1)';

      el.addEventListener('transitionend', () => { el.style.transition = ''; }, { once: true });
    });
  }, [flipped]);

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
        {scoringRows.length > 0 && (
          <div className="anim-slide-up mb-3 rounded-[24px] border border-qr-green/25 bg-qr-green/10 px-4 py-3 text-center">
            <p className="text-sm font-black text-qr-green">
              {scoringRows.map((row) => `${row.team.name} suma ${row.gained} ${row.gained === 1 ? 'punto' : 'puntos'}`).join(' · ')}
            </p>
          </div>
        )}
        {displayOrder.map((row, i) => {
          // Rank indicator follows the display order (prev ranks before flip, current after)
          const rank = displayOrder.findIndex((r) => r.team.id === row.team.id);
          return (
            <TeamRow
              key={row.team.id}
              row={row}
              rank={rank}
              isNewLeader={leaderChanged && currentLeaderId === row.team.id}
              entryIdx={i}
              showLeaderBadge={showLeaderBadge && leaderChanged && currentLeaderId === row.team.id}
              setRef={(el) => {
                if (el) cardRefs.current.set(row.team.id, el);
                else cardRefs.current.delete(row.team.id);
              }}
            />
          );
        })}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex w-full max-w-sm gap-2">
          <button
            onClick={onNext}
            className="flex-1 rounded-full bg-qr-primary py-4 text-base font-black text-qr-text shadow-[0_0_24px_rgba(255,46,136,0.45)] transition active:scale-95 hover:brightness-110"
          >
            Siguiente ronda →
          </button>
          {confirmEnd ? (
            <>
              <button
                onClick={onEnd}
                className="rounded-full border border-qr-red/50 bg-qr-red/10 px-5 py-4 text-sm font-black text-qr-red transition hover:bg-qr-red/15 active:scale-95"
              >
                ¿Seguro?
              </button>
              <button
                onClick={() => setConfirmEnd(false)}
                className="rounded-full border border-white/15 px-5 py-4 text-sm text-qr-muted transition hover:border-white/30 hover:text-qr-text"
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              onClick={() => setConfirmEnd(true)}
              className="rounded-full border border-white/15 px-6 py-4 text-sm text-qr-muted transition hover:border-qr-red hover:text-qr-red"
            >
              Terminar
            </button>
          )}
        </div>
      )}
    </div>
  );
}
