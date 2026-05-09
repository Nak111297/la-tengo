import { useState } from 'react';
import type { Team } from '../types';
import { STEAL_POINTS } from '../types';
import { calculateScore, calculateSpeedScore, getBasePoints } from '../lib/scoring';

interface Props {
  teams: Team[];
  currentTeam: Team;
  stealMode: boolean;
  stealTeam: Team | null;
  betSeconds: number;
  onConfirm: (gotArtist: boolean, gotSong: boolean) => void;
  onBack: () => void;
  gameMode?: 'knowledge' | 'speed';
  speedPoints?: number | null;
  speedScoringTeamIndex?: number | null;
}

export default function ScoreCheck({ teams, currentTeam, stealMode, stealTeam, betSeconds, onConfirm, onBack, gameMode, speedPoints, speedScoringTeamIndex }: Props) {
  const [gotArtist, setGotArtist] = useState(false);

  const isSpeed = gameMode === 'speed';
  const scoringTeam = isSpeed && speedScoringTeamIndex != null
    ? teams[speedScoringTeamIndex]
    : (stealMode ? stealTeam : currentTeam);
  const preview = isSpeed
    ? calculateSpeedScore(speedPoints ?? 0, gotArtist)
    : calculateScore(betSeconds, gotArtist, false, stealMode);
  const basePoints = isSpeed ? (speedPoints ?? 0) : (stealMode ? STEAL_POINTS : getBasePoints(betSeconds));
  const songPoints = basePoints;
  const artistPoints = gotArtist ? (isSpeed ? 10 : 1) : 0;
  const bonusPoints = 0;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-qr-muted">Puntos para</p>
        <h2 className="mt-1 font-display text-2xl font-bold" style={{ color: scoringTeam?.color }}>
          {scoringTeam?.name}
        </h2>
        {isSpeed && (
          <p className="mt-1 text-sm text-qr-yellow">⚡ {speedPoints ?? 0} pts de velocidad</p>
        )}
      </div>

      <div className="w-full max-w-sm space-y-3">
        <p className="text-center text-sm text-qr-muted">Marca lo que acertaron</p>

        <ToggleOption
          label="🎤 Artista correcto"
          sublabel={isSpeed ? '+10 pts' : '+1 bonus'}
          checked={gotArtist}
          onChange={setGotArtist}
        />

      </div>

      <div className="w-full max-w-sm rounded-[24px] border border-white/10 bg-qr-card/70 p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-qr-muted">Desglose</p>
        <div className="space-y-2 text-sm">
          <BreakdownRow label={isSpeed ? 'Puntos por velocidad' : 'Puntos base por tiempo'} value={basePoints} muted />
          <BreakdownRow label="Canción correcta" value={songPoints} />
          <BreakdownRow label="Artista correcto" value={artistPoints} />
          <BreakdownRow label="Bonus" value={bonusPoints} />
        </div>
        <div className="mt-4 flex items-end justify-between border-t border-white/10 pt-4">
          <span className="text-xs font-bold uppercase tracking-widest text-qr-muted">Total ronda</span>
          <span className="font-display text-5xl font-bold text-qr-yellow" style={{ textShadow: '0 0 24px rgba(255,210,63,0.45)' }}>
            {preview}
          </span>
        </div>
      </div>

      <button
        onClick={() => onConfirm(gotArtist, false)}
        className="w-full max-w-sm rounded-full bg-qr-primary py-4 text-lg font-black text-qr-text shadow-[0_0_28px_rgba(255,46,136,0.5)] transition active:scale-95 hover:brightness-110"
      >
        Confirmar puntos →
      </button>

      <button
        onClick={onBack}
        className="w-full max-w-sm rounded-full border border-white/15 py-3 text-sm font-bold text-qr-muted transition hover:border-qr-cyan hover:text-qr-cyan active:scale-95"
      >
        Regresar
      </button>

      <div className="w-full max-w-sm rounded-[24px] border border-white/10 bg-qr-card/60 p-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-qr-muted">Marcador</p>
        <div className="space-y-2">
          {teams.map((t) => {
            const projected = t.id === scoringTeam?.id ? t.score + preview : t.score;
            return (
              <div key={t.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: t.color }} />
                  <span className="text-sm" style={{ color: t.color }}>{t.name}</span>
                </div>
                <span className={`font-black ${t.id === scoringTeam?.id ? 'text-qr-yellow' : 'text-qr-muted'}`}>
                  {projected}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BreakdownRow({ label, value, muted = false }: { label: string; value: number; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={muted ? 'text-qr-muted' : 'text-qr-text/85'}>{label}</span>
      <span className={`font-black ${muted ? 'text-qr-muted' : value > 0 ? 'text-qr-green' : 'text-qr-muted'}`}>
        {muted ? value : `+${value}`}
      </span>
    </div>
  );
}

function ToggleOption({ label, sublabel, checked, onChange }: {
  label: string; sublabel: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`flex w-full items-center justify-between rounded-[20px] border px-5 py-4 transition active:scale-95 ${
        checked
          ? 'border-qr-green/50 bg-qr-green/10'
          : 'border-white/10 bg-qr-card/60 hover:border-white/20'
      }`}
    >
      <div className="text-left">
        <div className="font-bold text-qr-text">{label}</div>
        <div className="text-xs text-qr-muted">{sublabel}</div>
      </div>
      <div className={`flex h-8 w-8 items-center justify-center rounded-[10px] border text-xl font-black transition ${
        checked ? 'border-qr-green bg-qr-green text-qr-bg' : 'border-white/20 text-white/25'
      }`}>
        {checked ? '✓' : '○'}
      </div>
    </button>
  );
}
