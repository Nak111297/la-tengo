import { useState } from 'react';
import Brand from '../components/Brand';
import { TEAM_COLORS } from '../types';
import type { GameMode, SongSource } from '../types';
import { generateRoomCode, isFirebaseReady } from '../lib/firebase';

interface Props {
  onStart: (
    teamNames: string[],
    maxRounds: number,
    gameMode: GameMode,
    songSource: SongSource,
    debugMode: boolean,
    multiphone: boolean,
    previewCode: string | null,
  ) => void;
}

const ROUND_OPTIONS = [5, 8, 10, 15, 20];

export default function Setup({ onStart }: Props) {
  const [teams, setTeams] = useState(['', '']);
  const [maxRounds, setMaxRounds] = useState(10);
  const [gameMode, setGameMode] = useState<GameMode>('knowledge');

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [songSource, setSongSource] = useState<SongSource>('advanced');
  const [debugMode, setDebugMode] = useState(false);
  const [multiphone, setMultiphone] = useState(false);
  const [previewCode, setPreviewCode] = useState<string | null>(null);

  const toggleMultiphone = () => {
    const next = !multiphone;
    setMultiphone(next);
    setPreviewCode(next && isFirebaseReady() ? generateRoomCode() : null);
  };

  const addTeam = () => {
    if (teams.length < 8) setTeams([...teams, '']);
  };
  const removeTeam = (idx: number) => {
    if (teams.length > 2) setTeams(teams.filter((_, i) => i !== idx));
  };
  const canStart = teams.every((t) => t.trim().length > 0);

  return (
    <main className="setup-page">
      <header className="site-header">
        <Brand />
        <span className="header-caption">QUE EMPIECE LO BUENO</span>
      </header>
      <div className="page-intro">
        <p className="eyebrow">NUEVA PARTIDA</p>
        <h1>Armá el plan.</h1>
        <p>Tu gente, sus canciones y un poco de competencia.</p>
      </div>
      <div className="setup-layout">
        <div className="setup-sections">
          <section className="setup-section" aria-labelledby="mode-title">
            <div className="section-title">
              <span className="step-number">01</span>
              <h2 id="mode-title">Elegí cómo jugar</h2>
            </div>
            <div className="mode-grid">
              {(['knowledge', 'speed'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setGameMode(mode)}
                  aria-pressed={gameMode === mode}
                  className={`mode-card ${gameMode === mode ? 'is-selected' : ''}`}
                >
                  <span className="mode-top">
                    <span className="mode-icon" aria-hidden="true">
                      {mode === 'knowledge' ? '◎' : 'ϟ'}
                    </span>
                    <span className="selection-check" aria-hidden="true">
                      {gameMode === mode ? '✓' : ''}
                    </span>
                  </span>
                  <strong>
                    {mode === 'knowledge' ? 'Conocimiento' : 'Velocidad'}
                  </strong>
                  <span>
                    {mode === 'knowledge'
                      ? 'Apostá cuántos segundos necesitás. Menos tiempo, más puntos.'
                      : 'Todos compiten. Respondé primero antes de que bajen los puntos.'}
                  </span>
                  <small>
                    {mode === 'knowledge'
                      ? 'POR TURNOS · 3 A 30 SEGUNDOS'
                      : 'TODOS A LA VEZ · 60 SEGUNDOS'}
                  </small>
                </button>
              ))}
            </div>
          </section>
          <section className="setup-section" aria-labelledby="teams-title">
            <div className="section-title">
              <span className="step-number">02</span>
              <h2 id="teams-title">Presentá a tus equipos</h2>
              <span className="section-count">{teams.length}/8</span>
            </div>
            <div className="team-inputs">
              {teams.map((name, i) => (
                <div key={i} className="team-input-row">
                  <span
                    className="team-number"
                    style={{
                      color: TEAM_COLORS[i % TEAM_COLORS.length],
                      background: `${TEAM_COLORS[i % TEAM_COLORS.length]}16`,
                    }}
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <label className="sr-only" htmlFor={`team-${i}`}>
                    Nombre del equipo {i + 1}
                  </label>
                  <input
                    id={`team-${i}`}
                    value={name}
                    maxLength={24}
                    autoComplete="off"
                    onChange={(e) =>
                      setTeams(
                        teams.map((team, idx) =>
                          idx === i ? e.target.value : team,
                        ),
                      )
                    }
                    placeholder={`Nombre del equipo ${i + 1}`}
                  />
                  {teams.length > 2 && (
                    <button
                      className="icon-button"
                      onClick={() => removeTeam(i)}
                      aria-label={`Eliminar equipo ${i + 1}`}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            {teams.length < 8 && (
              <button className="add-team" onClick={addTeam}>
                + Agregar equipo
              </button>
            )}
          </section>
          <section className="setup-section" aria-labelledby="rounds-title">
            <div className="section-title">
              <span className="step-number">03</span>
              <h2 id="rounds-title">¿Cuántas rondas?</h2>
            </div>
            <div className="round-options">
              {ROUND_OPTIONS.map((n) => (
                <button
                  key={n}
                  aria-pressed={maxRounds === n}
                  onClick={() => setMaxRounds(n)}
                  className={maxRounds === n ? 'is-selected' : ''}
                >
                  {n}
                </button>
              ))}
            </div>
          </section>
          {/* Advanced Settings */}
          <div className="w-full">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              aria-expanded={showAdvanced}
              aria-controls="advanced-settings"
              className="flex w-full items-center justify-between text-xs font-bold uppercase tracking-widest text-qr-muted/60 hover:text-qr-muted transition py-1"
            >
              <span>⚙ Configuración avanzada</span>
              <span className="text-[10px]">{showAdvanced ? '▲' : '▼'}</span>
            </button>

            {showAdvanced && (
              <div
                id="advanced-settings"
                className="mt-4 space-y-4 rounded-[24px] border border-white/10 bg-qr-card/60 p-4"
              >
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-widest text-qr-muted">
                    Origen de canciones
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {(['random', 'advanced'] as const).map((src) => (
                      <button
                        key={src}
                        onClick={() => setSongSource(src)}
                        aria-pressed={songSource === src}
                        className={`flex flex-col items-center gap-1 rounded-[20px] border p-3 transition ${
                          songSource === src
                            ? 'border-qr-primary/50 bg-qr-primary/10 text-qr-text'
                            : 'border-white/10 bg-qr-card text-qr-muted hover:border-white/20'
                        }`}
                      >
                        <span className="text-xl">
                          {src === 'random' ? '🎲' : '🎯'}
                        </span>
                        <span className="font-bold text-xs">
                          {src === 'random' ? 'Aleatorio' : 'Curado'}
                        </span>
                        <span className="text-center text-[10px] text-qr-muted leading-tight">
                          {src === 'random'
                            ? 'Búsqueda libre por género'
                            : 'Canciones curadas por género'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-widest text-qr-muted">
                    Multidispositivo
                  </p>
                  <button
                    onClick={toggleMultiphone}
                    role="switch"
                    aria-checked={multiphone}
                    disabled={!isFirebaseReady()}
                    className={`flex w-full items-center justify-between rounded-[20px] border p-3 transition ${
                      multiphone
                        ? 'border-qr-cyan/40 bg-qr-cyan/10'
                        : 'border-white/10 bg-qr-card hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📱</span>
                      <div className="text-left">
                        <p
                          className={`text-sm font-bold ${multiphone ? 'text-qr-cyan' : 'text-qr-text'}`}
                        >
                          Multiphone
                        </p>
                        <p className="text-[10px] text-qr-muted leading-tight">
                          Otros teléfonos pueden responder
                        </p>
                      </div>
                    </div>
                    <div
                      className={`h-5 w-9 rounded-full transition-colors ${multiphone ? 'bg-qr-cyan' : 'bg-white/15'}`}
                    >
                      <div
                        className={`mt-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${multiphone ? 'translate-x-4' : 'translate-x-0.5'}`}
                      />
                    </div>
                  </button>

                  {/* QR preview — visible as soon as toggle is on */}
                  {multiphone && previewCode && (
                    <div className="mt-3 flex flex-col items-center gap-2 rounded-[16px] border border-qr-cyan/20 bg-qr-bg/60 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-qr-muted/60">
                        Escanear para unirse
                      </p>
                      <div className="rounded-[12px] border border-white/10 bg-qr-card p-1.5">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(window.location.origin + '/buzz?room=' + previewCode)}&size=120x120&color=e2e8f0&bgcolor=0f0f1a`}
                          alt="QR"
                          className="h-28 w-28 rounded-lg"
                        />
                      </div>
                      <span className="font-mono text-xl font-black tracking-[0.3em] text-qr-cyan">
                        {previewCode}
                      </span>
                      <p className="text-[10px] text-qr-muted/50 text-center leading-tight">
                        Los jugadores pueden unirse ahora.
                        <br />
                        La partida empieza cuando presiones Empezar partida.
                      </p>
                    </div>
                  )}

                  {/* Firebase not configured warning */}
                  {!isFirebaseReady() && (
                    <p className="mt-2 text-center text-[10px] text-qr-red/80 leading-tight">
                      Los teléfonos adicionales no están disponibles en esta
                      partida.
                    </p>
                  )}
                </div>

                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-widest text-qr-muted">
                    Desarrollo
                  </p>
                  <button
                    onClick={() => setDebugMode(!debugMode)}
                    role="switch"
                    aria-checked={debugMode}
                    className={`flex w-full items-center justify-between rounded-[20px] border p-3 transition ${
                      debugMode
                        ? 'border-qr-yellow/40 bg-qr-yellow/10'
                        : 'border-white/10 bg-qr-card hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🛠</span>
                      <div className="text-left">
                        <p
                          className={`text-sm font-bold ${debugMode ? 'text-qr-yellow' : 'text-qr-text'}`}
                        >
                          Modo Debug
                        </p>
                        <p className="text-[10px] text-qr-muted leading-tight">
                          Sin Spotify — canciones de prueba
                        </p>
                      </div>
                    </div>
                    <div
                      className={`h-5 w-9 rounded-full transition-colors ${debugMode ? 'bg-qr-yellow' : 'bg-white/15'}`}
                    >
                      <div
                        className={`mt-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${debugMode ? 'translate-x-4' : 'translate-x-0.5'}`}
                      />
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <aside className="game-summary" aria-labelledby="summary-title">
          <p className="eyebrow">TODO LISTO PARA EL PLAY</p>
          <h2 id="summary-title">Tu noche, en resumen.</h2>
          <div className="summary-record" aria-hidden="true">
            ♪
          </div>
          <dl>
            <div>
              <dt>Modo</dt>
              <dd>{gameMode === 'knowledge' ? 'Conocimiento' : 'Velocidad'}</dd>
            </div>
            <div>
              <dt>Equipos</dt>
              <dd>{teams.length}</dd>
            </div>
            <div>
              <dt>Rondas</dt>
              <dd>{maxRounds}</dd>
            </div>
          </dl>
          <p className="summary-tip">
            {gameMode === 'knowledge'
              ? '¿Con solo 3 segundos? Si la acertás, ganás 5 puntos base. Acertar el artista suma 1 punto extra.'
              : 'Arrancás con 100 puntos posibles. Cada segundo cuenta: cuanto antes respondás, más sumás.'}
          </p>
          <button
            className="primary-button"
            onClick={() =>
              onStart(
                teams.map((t) => t.trim()),
                maxRounds,
                gameMode,
                songSource,
                debugMode,
                multiphone,
                previewCode,
              )
            }
            disabled={!canStart}
            aria-describedby="start-hint"
          >
            {debugMode ? 'Empezar partida (Debug)' : 'Empezar partida'}{' '}
            <span aria-hidden="true">→</span>
          </button>
          <p id="start-hint" className="start-hint">
            {canStart
              ? 'Subí el volumen. El resto lo ponen ustedes.'
              : 'Poné un nombre a cada equipo para empezar.'}
          </p>
        </aside>
      </div>
    </main>
  );
}
