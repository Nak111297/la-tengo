import { useState } from 'react';
import type { Team } from '../types';
import { calculateScore, calculateSpeedScore } from '../lib/scoring';

interface Props {
  teams: Team[];
  currentTeam: Team;
  stealMode: boolean;
  stealTeam: Team | null;
  betSeconds: number;
  onConfirm: (gotArtist: boolean, gotSong: boolean) => void;
  gameMode?: 'knowledge' | 'speed';
  speedPoints?: number | null;
  speedScoringTeamIndex?: number | null;
}

export default function ScoreCheck({ teams, currentTeam, stealMode, stealTeam, betSeconds, onConfirm, gameMode, speedPoints, speedScoringTeamIndex }: Props) {
  const [gotArtist, setGotArtist] = useState(false);
  const [gotSong, setGotSong] = useState(false);

  const isSpeed = gameMode === 'speed';
  const scoringTeam = isSpeed && speedScoringTeamIndex != null
    ? teams[speedScoringTeamIndex]
    : (stealMode ? stealTeam : currentTeam);
  const preview = isSpeed
    ? calculateSpeedScore(speedPoints ?? 0, gotArtist)
    : calculateScore(betSeconds, gotArtist, gotSong, stealMode);

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
        <p className="text-center text-sm text-qr-muted">¿Qué adivinó?</p>

        <ToggleOption
          label="🎤 Artista correcto"
          sublabel={isSpeed ? '+10 pts' : '+1 bonus'}
          checked={gotArtist}
          onChange={setGotArtist}
        />

        {!isSpeed && (
          <ToggleOption
            label="🎵 Nombre de la canción correcto"
            sublabel="+1 bonus"
            checked={gotSong}
            onChange={setGotSong}
          />
        )}
      </div>

      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-qr-muted">Total</p>
        <p className="font-display text-6xl font-bold text-qr-yellow" style={{ textShadow: '0 0 30px rgba(255,210,63,0.5)' }}>
          {preview}
        </p>
        <p className="text-sm text-qr-muted">puntos</p>
      </div>

      <button
        onClick={() => onConfirm(gotArtist, gotSong)}
        className="w-full max-w-sm rounded-full bg-qr-primary py-4 text-lg font-black text-qr-text shadow-[0_0_28px_rgba(255,46,136,0.5)] transition active:scale-95 hover:brightness-110"
      >
        Confirmar puntos
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
      <div className={`text-2xl font-black transition ${checked ? 'text-qr-green' : 'text-white/20'}`}>
        {checked ? '✓' : '○'}
      </div>
    </button>
  );
}
