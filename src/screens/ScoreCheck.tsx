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
}

export default function ScoreCheck({ teams, currentTeam, stealMode, stealTeam, betSeconds, onConfirm, gameMode, speedPoints }: Props) {
  const [gotArtist, setGotArtist] = useState(false);
  const [gotSong, setGotSong] = useState(false);

  const scoringTeam = stealMode ? stealTeam : currentTeam;
  const isSpeed = gameMode === 'speed';

  const preview = isSpeed
    ? calculateSpeedScore(speedPoints ?? 0, gotArtist)
    : calculateScore(betSeconds, gotArtist, gotSong, stealMode);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 bg-zinc-950">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Puntos para</p>
        <h2 className="mt-1 text-2xl font-black" style={{ color: scoringTeam?.color }}>
          {scoringTeam?.name}
        </h2>
        {isSpeed && (
          <p className="mt-1 text-sm text-orange-400">⚡ {speedPoints ?? 0} pts de velocidad</p>
        )}
      </div>

      <div className="w-full max-w-sm space-y-3">
        <p className="text-center text-sm text-zinc-400">¿Qué adivinó?</p>

        <ToggleOption
          label="🎤 Artista correcto"
          sublabel={isSpeed ? '+100 pts' : '+1 bonus'}
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
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Total</p>
        <p className="text-6xl font-black text-amber-400">{preview}</p>
        <p className="text-sm text-zinc-500">puntos</p>
      </div>

      <button
        onClick={() => onConfirm(gotArtist, gotSong)}
        className="w-full max-w-sm rounded-2xl bg-gradient-to-r from-fuchsia-600 to-violet-600 py-4 text-lg font-black text-white shadow-lg shadow-fuchsia-900/30 transition active:scale-95 hover:brightness-110"
      >
        Confirmar puntos
      </button>

      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-600">Marcador</p>
        <div className="space-y-2">
          {teams.map((t) => {
            const projected = t.id === scoringTeam?.id ? t.score + preview : t.score;
            return (
              <div key={t.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: t.color }} />
                  <span className="text-sm" style={{ color: t.color }}>{t.name}</span>
                </div>
                <span className={`font-black ${t.id === scoringTeam?.id ? 'text-amber-400' : 'text-zinc-400'}`}>
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
      className={`flex w-full items-center justify-between rounded-2xl border px-5 py-4 transition active:scale-95 ${
        checked ? 'border-emerald-500 bg-emerald-500/10' : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
      }`}
    >
      <div className="text-left">
        <div className="font-bold text-white">{label}</div>
        <div className="text-xs text-zinc-500">{sublabel}</div>
      </div>
      <div className={`text-2xl font-black transition ${checked ? 'text-emerald-400' : 'text-zinc-700'}`}>
        {checked ? '✓' : '○'}
      </div>
    </button>
  );
}
