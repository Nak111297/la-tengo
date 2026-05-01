import { useState } from 'react';
import { TEAM_COLORS } from '../types';

interface Props {
  onStart: (teamNames: string[], maxRounds: number) => void;
}

const ROUND_OPTIONS = [5, 8, 10, 15, 20];

export default function Setup({ onStart }: Props) {
  const [teams, setTeams] = useState(['', '']);
  const [maxRounds, setMaxRounds] = useState(10);

  const addTeam = () => {
    if (teams.length < 8) setTeams([...teams, '']);
  };

  const removeTeam = (idx: number) => {
    if (teams.length > 2) setTeams(teams.filter((_, i) => i !== idx));
  };

  const canStart = teams.every((t) => t.trim().length > 0);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <div className="text-center">
        <h1 className="text-3xl font-black text-purple-500">🎮 Nueva partida</h1>
        <p className="mt-1 text-sm text-zinc-400">Agrega los equipos</p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        {teams.map((name, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="h-5 w-5 shrink-0 rounded-full" style={{ background: TEAM_COLORS[i % TEAM_COLORS.length] }} />
            <input
              value={name}
              onChange={(e) => {
                const updated = [...teams];
                updated[i] = e.target.value;
                setTeams(updated);
              }}
              placeholder={`Equipo ${i + 1}`}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-lg placeholder:text-zinc-600"
            />
            {teams.length > 2 && (
              <button onClick={() => removeTeam(i)} className="text-red-400 text-xl">✕</button>
            )}
          </div>
        ))}

        {teams.length < 8 && (
          <button onClick={addTeam} className="w-full py-2 text-sm text-purple-400 hover:underline">
            + Agregar equipo
          </button>
        )}
      </div>

      <div className="w-full max-w-sm">
        <p className="mb-2 text-sm text-zinc-400">Rondas</p>
        <div className="flex gap-2">
          {ROUND_OPTIONS.map(n => (
            <button
              key={n}
              onClick={() => setMaxRounds(n)}
              className={`flex-1 rounded-xl py-3 text-sm font-bold transition ${
                maxRounds === n
                  ? 'bg-purple-600 text-white'
                  : 'border border-zinc-700 text-zinc-400 hover:border-purple-500'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onStart(teams.map((t) => t.trim()), maxRounds)}
        disabled={!canStart}
        className="w-full max-w-sm rounded-2xl bg-purple-600 py-4 text-lg font-bold text-white transition hover:bg-purple-500 disabled:opacity-40"
      >
        Comenzar
      </button>
    </div>
  );
}
