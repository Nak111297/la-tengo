import { useState } from 'react';
import { TEAM_COLORS } from '../types';
import type { GameMode, SongSource } from '../types';

interface Props {
  onStart: (teamNames: string[], maxRounds: number, gameMode: GameMode, songSource: SongSource, debugMode: boolean) => void;
}

const ROUND_OPTIONS = [5, 8, 10, 15, 20];

export default function Setup({ onStart }: Props) {
  const [teams, setTeams] = useState(['', '']);
  const [maxRounds, setMaxRounds] = useState(10);
  const [gameMode, setGameMode] = useState<GameMode>('knowledge');

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [songSource, setSongSource] = useState<SongSource>('advanced');
  const [debugMode, setDebugMode] = useState(false);

  const addTeam = () => {
    if (teams.length < 8) setTeams([...teams, '']);
  };
  const removeTeam = (idx: number) => {
    if (teams.length > 2) setTeams(teams.filter((_, i) => i !== idx));
  };
  const canStart = teams.every((t) => t.trim().length > 0);

  return (
    <div className="flex min-h-screen flex-col items-center gap-8 px-4 py-10">
      <div className="flex flex-col items-center gap-1">
        <img
          src="/logorolon.png"
          alt="Que Rolón"
          className="w-44 max-w-full select-none drop-shadow-[0_0_24px_rgba(255,46,136,0.35)]"
          draggable={false}
        />
        <p className="text-xs text-qr-muted">Nueva partida</p>
      </div>

      {/* Mode selector */}
      <div className="w-full max-w-sm">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-qr-muted">Modo de juego</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setGameMode('knowledge')}
            className={`flex flex-col items-center gap-2 rounded-[24px] border p-4 transition ${
              gameMode === 'knowledge'
                ? 'border-qr-cyan bg-qr-cyan/10 text-qr-text shadow-[0_0_20px_rgba(34,211,238,0.2)]'
                : 'border-white/10 bg-qr-card/60 text-qr-muted hover:border-white/20'
            }`}
          >
            <span className="text-3xl">🧠</span>
            <span className="font-display font-bold text-base">Knowledge</span>
            <span className="text-center text-xs text-qr-muted leading-tight">Apostá el tiempo, gana puntos por riesgo</span>
          </button>
          <button
            onClick={() => setGameMode('speed')}
            className={`flex flex-col items-center gap-2 rounded-[24px] border p-4 transition ${
              gameMode === 'speed'
                ? 'border-qr-yellow bg-qr-yellow/10 text-qr-text shadow-[0_0_20px_rgba(255,210,63,0.2)]'
                : 'border-white/10 bg-qr-card/60 text-qr-muted hover:border-white/20'
            }`}
          >
            <span className="text-3xl">⚡</span>
            <span className="font-display font-bold text-base">Speed</span>
            <span className="text-center text-xs text-qr-muted leading-tight">Puntaje 100→0, más rápido más puntos</span>
          </button>
        </div>
      </div>

      {/* Teams */}
      <div className="w-full max-w-sm">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-qr-muted">Equipos</p>
        <div className="space-y-2">
          {teams.map((name, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="h-5 w-5 shrink-0 rounded-full shadow" style={{ background: TEAM_COLORS[i % TEAM_COLORS.length] }} />
              <input
                value={name}
                onChange={(e) => {
                  const updated = [...teams];
                  updated[i] = e.target.value;
                  setTeams(updated);
                }}
                placeholder={`Equipo ${i + 1}`}
                className="w-full rounded-[16px] border border-white/10 bg-qr-card/60 px-4 py-3 text-base text-qr-text placeholder:text-qr-muted/50 focus:border-qr-primary/60 focus:outline-none transition"
              />
              {teams.length > 2 && (
                <button onClick={() => removeTeam(i)} className="text-qr-muted/60 hover:text-qr-red text-lg px-1 transition">✕</button>
              )}
            </div>
          ))}
          {teams.length < 8 && (
            <button onClick={addTeam} className="w-full py-2 text-sm text-qr-cyan hover:text-qr-cyan/80 transition">
              + Agregar equipo
            </button>
          )}
        </div>
      </div>

      {/* Rounds */}
      <div className="w-full max-w-sm">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-qr-muted">Rondas</p>
        <div className="flex gap-2">
          {ROUND_OPTIONS.map(n => (
            <button
              key={n}
              onClick={() => setMaxRounds(n)}
              className={`flex-1 rounded-[16px] py-3 text-sm font-bold transition ${
                maxRounds === n
                  ? 'bg-qr-primary text-qr-text shadow-[0_0_20px_rgba(255,46,136,0.4)]'
                  : 'border border-white/10 bg-qr-card/60 text-qr-muted hover:border-white/20'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="w-full max-w-sm">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex w-full items-center justify-between text-xs font-bold uppercase tracking-widest text-qr-muted/60 hover:text-qr-muted transition py-1"
        >
          <span>⚙ Configuración avanzada</span>
          <span className="text-[10px]">{showAdvanced ? '▲' : '▼'}</span>
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-4 rounded-[24px] border border-white/10 bg-qr-card/60 p-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-qr-muted">Origen de canciones</p>
              <div className="grid grid-cols-2 gap-2">
                {(['random', 'advanced'] as const).map((src) => (
                  <button
                    key={src}
                    onClick={() => setSongSource(src)}
                    className={`flex flex-col items-center gap-1 rounded-[16px] border p-3 transition ${
                      songSource === src
                        ? 'border-qr-primary/50 bg-qr-primary/10 text-qr-text'
                        : 'border-white/10 bg-qr-card text-qr-muted hover:border-white/20'
                    }`}
                  >
                    <span className="text-xl">{src === 'random' ? '🎲' : '🎯'}</span>
                    <span className="font-bold text-xs capitalize">{src}</span>
                    <span className="text-center text-[10px] text-qr-muted leading-tight">
                      {src === 'random' ? 'Búsqueda libre por género' : 'Artistas curados por género'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-qr-muted">Desarrollo</p>
              <button
                onClick={() => setDebugMode(!debugMode)}
                className={`flex w-full items-center justify-between rounded-[16px] border p-3 transition ${
                  debugMode ? 'border-qr-yellow/40 bg-qr-yellow/10' : 'border-white/10 bg-qr-card hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">🛠</span>
                  <div className="text-left">
                    <p className={`text-sm font-bold ${debugMode ? 'text-qr-yellow' : 'text-qr-text'}`}>Modo Debug</p>
                    <p className="text-[10px] text-qr-muted leading-tight">Sin Spotify — canciones de prueba</p>
                  </div>
                </div>
                <div className={`h-5 w-9 rounded-full transition-colors ${debugMode ? 'bg-qr-yellow' : 'bg-white/15'}`}>
                  <div className={`mt-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${debugMode ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => onStart(teams.map((t) => t.trim()), maxRounds, gameMode, songSource, debugMode)}
        disabled={!canStart}
        className="w-full max-w-sm rounded-full bg-qr-primary py-4 text-lg font-black text-qr-text shadow-[0_0_28px_rgba(255,46,136,0.5)] transition active:scale-95 hover:brightness-110 disabled:opacity-30 disabled:pointer-events-none glow-pulse"
      >
        {debugMode ? '🛠 Comenzar (Debug)' : 'Comenzar'}
      </button>
    </div>
  );
}
