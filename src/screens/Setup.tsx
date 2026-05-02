import { useState } from 'react';
import { TEAM_COLORS } from '../types';
import type { GameMode } from '../types';

interface Props {
  onStart: (teamNames: string[], maxRounds: number, gameMode: GameMode) => void;
}

const ROUND_OPTIONS = [5, 8, 10, 15, 20];

export default function Setup({ onStart }: Props) {
  const [teams, setTeams] = useState(['', '']);
  const [maxRounds, setMaxRounds] = useState(10);
  const [gameMode, setGameMode] = useState<GameMode>('knowledge');

  const addTeam = () => {
    if (teams.length < 8) setTeams([...teams, '']);
  };

  const removeTeam = (idx: number) => {
    if (teams.length > 2) setTeams(teams.filter((_, i) => i !== idx));
  };

  const canStart = teams.every((t) => t.trim().length > 0);

  return (
    <div className="flex min-h-screen flex-col items-center gap-8 px-4 py-10 bg-zinc-950">
      <div className="text-center">
        <h1 className="text-4xl font-black tracking-tight">
          <span className="bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
            Que Rolón
          </span>
        </h1>
        <p className="mt-1 text-sm text-zinc-500">Nueva partida</p>
      </div>

      {/* Mode selector */}
      <div className="w-full max-w-sm">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-500">Modo de juego</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setGameMode('knowledge')}
            className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition ${
              gameMode === 'knowledge'
                ? 'border-violet-500 bg-violet-500/10 text-white'
                : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <span className="text-3xl">🧠</span>
            <span className="font-black">Knowledge</span>
            <span className="text-center text-xs text-zinc-500 leading-tight">Apostá el tiempo, gana puntos por riesgo</span>
          </button>
          <button
            onClick={() => setGameMode('speed')}
            className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition ${
              gameMode === 'speed'
                ? 'border-orange-500 bg-orange-500/10 text-white'
                : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <span className="text-3xl">⚡</span>
            <span className="font-black">Speed</span>
            <span className="text-center text-xs text-zinc-500 leading-tight">Puntaje 100→0, más rápido más puntos</span>
          </button>
        </div>
      </div>

      {/* Teams */}
      <div className="w-full max-w-sm">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-500">Equipos</p>
        <div className="space-y-2">
          {teams.map((name, i) => (
            <div key={i} className="flex items-center gap-2">
              <span
                className="h-5 w-5 shrink-0 rounded-full shadow"
                style={{ background: TEAM_COLORS[i % TEAM_COLORS.length] }}
              />
              <input
                value={name}
                onChange={(e) => {
                  const updated = [...teams];
                  updated[i] = e.target.value;
                  setTeams(updated);
                }}
                placeholder={`Equipo ${i + 1}`}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-base placeholder:text-zinc-600 focus:border-fuchsia-500 focus:outline-none"
              />
              {teams.length > 2 && (
                <button onClick={() => removeTeam(i)} className="text-zinc-600 hover:text-red-400 text-lg px-1">✕</button>
              )}
            </div>
          ))}
          {teams.length < 8 && (
            <button
              onClick={addTeam}
              className="w-full py-2 text-sm text-fuchsia-400 hover:text-fuchsia-300"
            >
              + Agregar equipo
            </button>
          )}
        </div>
      </div>

      {/* Rounds */}
      <div className="w-full max-w-sm">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-500">Rondas</p>
        <div className="flex gap-2">
          {ROUND_OPTIONS.map(n => (
            <button
              key={n}
              onClick={() => setMaxRounds(n)}
              className={`flex-1 rounded-xl py-3 text-sm font-bold transition ${
                maxRounds === n
                  ? 'bg-fuchsia-600 text-white shadow shadow-fuchsia-900/50'
                  : 'border border-zinc-800 text-zinc-400 hover:border-zinc-600'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onStart(teams.map((t) => t.trim()), maxRounds, gameMode)}
        disabled={!canStart}
        className="w-full max-w-sm rounded-2xl bg-gradient-to-r from-fuchsia-600 to-violet-600 py-4 text-lg font-black text-white shadow-lg shadow-fuchsia-900/30 transition active:scale-95 hover:brightness-110 disabled:opacity-30 disabled:pointer-events-none"
      >
        Comenzar
      </button>
    </div>
  );
}
