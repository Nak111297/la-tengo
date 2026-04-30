import { useState } from 'react';
import type { Team } from '../types';
import { calculateScore } from '../lib/scoring';

interface Props {
  teams: Team[];
  currentTeam: Team;
  stealMode: boolean;
  stealTeam: Team | null;
  betSeconds: number;
  onConfirm: (gotArtist: boolean, gotSong: boolean) => void;
}

export default function ScoreCheck({ teams, currentTeam, stealMode, stealTeam, betSeconds, onConfirm }: Props) {
  const [gotArtist, setGotArtist] = useState(false);
  const [gotSong, setGotSong] = useState(false);

  const scoringTeam = stealMode ? stealTeam : currentTeam;
  const preview = calculateScore(betSeconds, gotArtist, gotSong, stealMode);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <div className="text-center">
        <p className="text-sm text-zinc-400">Puntos para</p>
        <h2 className="text-2xl font-black" style={{ color: scoringTeam?.color }}>
          {scoringTeam?.name}
        </h2>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <p className="text-center text-sm text-zinc-400">
          ¿Qué adivinó correctamente?
        </p>

        <ToggleOption
          label="🎤 Artista correcto"
          sublabel="+1 bonus"
          checked={gotArtist}
          onChange={setGotArtist}
        />

        <ToggleOption
          label="🎵 Nombre de la canción correcto"
          sublabel="+1 bonus"
          checked={gotSong}
          onChange={setGotSong}
        />
      </div>

      <div className="text-center">
        <p className="text-sm text-zinc-400">Total</p>
        <p className="text-5xl font-black text-amber-400">{preview}</p>
        <p className="text-sm text-zinc-500">puntos</p>
      </div>

      <button
        onClick={() => onConfirm(gotArtist, gotSong)}
        className="w-full max-w-sm rounded-2xl bg-purple-600 py-4 text-lg font-bold text-white transition hover:bg-purple-500"
      >
        Confirmar puntos
      </button>

      {/* Mini scoreboard */}
      <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900 p-3">
        <div className="space-y-1 text-sm">
          {teams.map((t) => (
            <div key={t.id} className="flex justify-between">
              <span style={{ color: t.color }}>{t.name}</span>
              <span className="font-bold text-amber-400">
                {t.id === scoringTeam?.id ? t.score + preview : t.score}
              </span>
            </div>
          ))}
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
      className={`flex w-full items-center justify-between rounded-xl border px-5 py-4 transition ${
        checked ? 'border-green-500 bg-green-500/10' : 'border-zinc-700 bg-zinc-900'
      }`}
    >
      <div className="text-left">
        <div className="font-bold">{label}</div>
        <div className="text-xs text-zinc-500">{sublabel}</div>
      </div>
      <div className={`text-2xl ${checked ? 'text-green-400' : 'text-zinc-600'}`}>
        {checked ? '✓' : '○'}
      </div>
    </button>
  );
}
