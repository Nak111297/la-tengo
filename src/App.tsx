import { useEffect, useState, useCallback } from 'react';
import { handleAuthCallback, isAuthenticated, clearAuth, redirectToSpotifyAuth } from './lib/spotify';
import { selectDevice } from './lib/spotify-player';
import { useGame } from './lib/useGame';
import Login from './screens/Login';
import Brand from './components/Brand';
import StealAnnouncement from './components/StealAnnouncement';
import DevicePicker from './screens/DevicePicker';
import Setup from './screens/Setup';
import GenreSelect from './screens/GenreSelect';
import BetTime from './screens/BetTime';
import Playing from './screens/Playing';
import SpeedPlaying from './screens/SpeedPlaying';
import GuessPrompt from './screens/GuessPrompt';
import Reveal from './screens/Reveal';
import ScoreCheck from './screens/ScoreCheck';
import RoundSummary from './screens/RoundSummary';
import Finished from './screens/Finished';

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [genreError, setGenreError] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [hostTeamIndex, setHostTeamIndex] = useState<number | null>(null);
  const [hostAnswerOverrideKey, setHostAnswerOverrideKey] = useState<string | null>(null);

  const {
    state, timeLeft, canReplay, sessionCode,
    startGame, selectGenre, betAndPlay,
    buzzIn, replaySong, playerGotIt, noScoreRound, markCorrect, playerDidNotGetIt,
    confirmCorrect, backToAnswerCheck, nextRound, skipSong, resetGame, finishGame,
    dismissPlaybackError, retryPlayback, replaySameTeams,
  } = useGame();

  useEffect(() => {
    (async () => {
      const token = await handleAuthCallback();
      if (token || isAuthenticated()) setAuthed(true);
    })();
  }, []);

  const handleGenreSelect = useCallback(async (genre: string) => {
    setLoading(true);
    setGenreError(null);
    const error = await selectGenre(genre);
    setLoading(false);
    if (error) setGenreError(error);
  }, [selectGenre]);

  const handleBet = useCallback(async (seconds: number) => {
    setLoading(true);
    await betAndPlay(seconds);
    setLoading(false);
  }, [betAndPlay]);

  const handleRetryPlayback = useCallback(async () => {
    setLoading(true);
    await retryPlayback();
    setLoading(false);
  }, [retryPlayback]);

  const reconnectSpotify = () => {
    clearAuth();
    redirectToSpotifyAuth();
  };

  const chooseSpotifyDevice = (id: string | null) => {
    selectDevice(id);
    setPlayerReady(true);
  };

  if (!authed && !debugMode) return <Login />;
  if (!playerReady && !debugMode) {
    return (
      <DevicePicker onSelect={chooseSpotifyDevice} />
    );
  }

  const currentTeam = state.teams[state.currentTeamIndex];
  const stealTeam = state.stealTeamIndex !== null ? state.teams[state.stealTeamIndex] : null;
  const isSpeed = state.gameMode === 'speed';
  const answerTeamIndex = isSpeed
    ? state.speedScoringTeamIndex
    : (state.stealMode ? state.stealTeamIndex : state.currentTeamIndex);
  const answerTeam = answerTeamIndex !== null ? state.teams[answerTeamIndex] : null;
  const answerOverrideKey = `${state.phase}:${state.currentTrackUri ?? 'none'}:${state.stealMode}:${state.stealTeamIndex ?? 'none'}:${state.speedScoringTeamIndex ?? 'none'}:${state.noneScored}`;
  const hostAnswerOverride = hostAnswerOverrideKey === answerOverrideKey;
  const hostCanSeeAnswer =
    !state.multiphone ||
    state.noneScored ||
    hostAnswerOverride ||
    answerTeamIndex === null ||
    hostTeamIndex === answerTeamIndex;
  const activeListeningTeamIndex = state.stealMode
    ? state.stealTeamIndex
    : state.currentTeamIndex;
  const hostCanBuzzKnowledge =
    !state.multiphone ||
    (activeListeningTeamIndex !== null && hostTeamIndex === activeListeningTeamIndex);
  const hostCanBuzzSpeed =
    !state.multiphone ||
    (hostTeamIndex !== null && hostTeamIndex >= 0 && !state.speedEliminatedTeams.includes(hostTeamIndex));

  if (state.multiphone && state.phase !== 'setup' && hostTeamIndex === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center text-qr-text">
        <div>
          <img src="/logorolon2.png" alt="Que Rolón" className="mx-auto mb-4 h-14 w-auto" />
          <h2 className="font-display text-2xl font-bold">¿Cuál es tu equipo?</h2>
          <p className="mt-2 text-sm text-qr-muted">El host también juega con permisos de equipo.</p>
        </div>
        <div className="flex w-full max-w-sm flex-col gap-3">
          {state.teams.map((team, idx) => (
            <button
              key={team.id}
              onClick={() => setHostTeamIndex(idx)}
              className="flex items-center gap-3 rounded-[20px] border border-white/10 bg-qr-card/60 p-4 text-left transition active:scale-95"
              style={{ borderColor: `${team.color}40` }}
            >
              <span className="h-5 w-5 rounded-full shrink-0" style={{ background: team.color, boxShadow: `0 0 10px ${team.color}80` }} />
              <span className="font-display text-lg font-bold text-qr-text">{team.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-qr-text">
      {/* Top bar */}
      {state.phase !== 'setup' && state.phase !== 'finished' && (
        <div className="fixed left-0 right-0 top-0 z-40 border-b border-white/8 bg-qr-bg/90 backdrop-blur-md">
          <div className="game-topbar">
            <div className="flex items-center gap-2 shrink-0">
              <Brand />
              {isSpeed && (
                <span className="rounded-full bg-qr-yellow/20 px-2 py-0.5 text-[10px] font-bold text-qr-yellow">⚡</span>
              )}
              {debugMode && (
                <span className="rounded-full bg-qr-yellow/20 px-2 py-0.5 text-[10px] font-bold text-qr-yellow">🛠 DEBUG</span>
              )}
              <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] font-bold text-qr-muted">
                Ronda {state.round}/{state.maxRounds}
              </span>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              {state.teams.map((t, idx) => {
                const isActive = idx === state.currentTeamIndex;
                return (
                  <span
                    key={t.id}
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-black transition ${isActive ? 'ring-1' : ''}`}
                    style={{
                      color: t.color,
                      background: isActive ? `${t.color}22` : 'transparent',
                      boxShadow: isActive ? `0 0 0 1px ${t.color}66` : undefined,
                    }}
                  >
                    <span className="score-team-name">{t.name}</span> {t.score}
                  </span>
                );
              })}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setConfirmReset(true)}
                aria-label="Reiniciar partida"
                className="icon-button text-qr-muted hover:text-qr-red"
              >
                ✕
              </button>
              {!debugMode && (
                <button
                  onClick={reconnectSpotify}
                  aria-label="Reconectar Spotify"
                  className="icon-button text-qr-muted hover:text-qr-green"
                  title="Reconectar Spotify"
                >
                  ↺
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reset modal */}
      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
          <div className="w-full max-w-sm rounded-[28px] border border-white/10 bg-qr-card p-6 text-center shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
            <p className="text-3xl mb-3">⚠️</p>
            <p className="font-display text-lg font-bold text-qr-text mb-1">¿Reiniciar partida?</p>
            <p className="text-sm text-qr-muted mb-5">Se pierden todos los puntos.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmReset(false)}
                className="flex-1 rounded-full border border-white/15 py-3 text-sm font-bold text-qr-muted transition hover:border-white/30"
              >
                Cancelar
              </button>
              <button
                onClick={() => { setConfirmReset(false); setDebugMode(false); setHostTeamIndex(null); resetGame(); }}
                className="flex-1 rounded-full bg-qr-red py-3 text-sm font-black text-qr-text transition hover:brightness-110 active:scale-95"
              >
                Reiniciar
              </button>
            </div>
          </div>
        </div>
      )}

      {state.playbackError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
          <div className="w-full max-w-sm rounded-[28px] border border-qr-red/40 bg-qr-card p-6 text-center">
            <p className="text-3xl mb-3">⚠️</p>
            <p className="font-display font-bold text-lg text-qr-red mb-1">Spotify no arrancó</p>
            <p className="text-sm text-qr-muted mb-5">{state.playbackError}</p>
            <div className="flex gap-2">
              <button
                onClick={dismissPlaybackError}
                className="flex-1 rounded-full border border-white/15 py-3 text-sm font-bold text-qr-muted transition hover:border-white/30"
              >
                Cerrar
              </button>
              {!debugMode && (
                <button
                  onClick={() => setPlayerReady(false)}
                  className="flex-1 rounded-full bg-qr-green py-3 text-sm font-black text-qr-bg transition hover:brightness-110 active:scale-95"
                >
                  Elegir dispositivo
                </button>
              )}
              <button
                onClick={handleRetryPlayback}
                className="flex-1 rounded-full bg-qr-cyan py-3 text-sm font-black text-qr-bg transition hover:brightness-110 active:scale-95"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && state.phase === 'playing' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="flex flex-col items-center gap-4 rounded-[28px] border border-white/10 bg-qr-card px-8 py-6 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
            <div className="h-10 w-10 rounded-full border-4 border-white/10 border-t-qr-green animate-spin" />
            <p className="text-sm font-bold text-qr-text">Iniciando Spotify...</p>
          </div>
        </div>
      )}

      {state.stealMode && <StealAnnouncement />}

      <div className={state.phase !== 'setup' && state.phase !== 'finished' ? 'game-content' : ''}>
        {state.phase === 'setup' && (
          <Setup onStart={(t, r, g, s, debug, mp, code) => { setDebugMode(debug); setHostTeamIndex(mp ? null : -1); startGame(t, r, g, s, debug, mp, code); }} />
        )}

        {state.phase === 'finished' && (
          <Finished
            teams={state.teams}
            onNewGame={resetGame}
            onReplaySameTeams={replaySameTeams}
            showReplaySameTeams={state.teams.length > 0}
          />
        )}

        {state.phase === 'genre-select' && currentTeam && (
          <>
            <GenreSelect
              currentTeam={currentTeam}
              onSelect={handleGenreSelect}
              loading={loading}
              gameMode={state.gameMode}
            />
            {loading && !genreError && (
              <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-md">
                <div className="flex flex-col items-center gap-4 rounded-[28px] border border-white/10 bg-qr-card px-8 py-6 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
                  <div className="h-10 w-10 rounded-full border-4 border-white/10 border-t-qr-primary animate-spin" />
                  <p className="text-sm font-bold text-qr-text">Buscando canción...</p>
                  <div className="flex items-end gap-1">
                    {[0, 0.1, 0.05, 0.15, 0.08].map((d, i) => (
                      <div key={i} className="w-0.5 rounded-full eq-bar" style={{ height: '14px', background: 'linear-gradient(to top, #FF2E88, #22D3EE)', animationDelay: `${d}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            {genreError && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
                <div className="w-full max-w-sm rounded-[28px] border border-qr-red/40 bg-qr-card p-6 text-center">
                  <p className="text-3xl mb-3">⚠️</p>
                  <p className="font-display font-bold text-lg text-qr-red mb-1">Error cargando canción</p>
                  <p className="text-sm text-qr-muted mb-5">{genreError}</p>
                  <button
                    onClick={() => setGenreError(null)}
                    className="rounded-full border border-white/15 px-6 py-3 text-sm font-bold text-qr-muted transition hover:border-white/30"
                  >
                    Intentar de nuevo
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {state.phase === 'bet-time' && currentTeam && !isSpeed && (
          <BetTime currentTeam={currentTeam} onBet={handleBet} />
        )}

        {state.phase === 'playing' && currentTeam && !isSpeed && (
          <Playing
            currentTeam={currentTeam}
            betSeconds={state.betSeconds || 30}
            timeLeft={timeLeft}
            stealMode={state.stealMode}
            stealTeam={stealTeam}
            onBuzzIn={() => {
              if (!hostCanBuzzKnowledge) return;
              buzzIn(state.multiphone && hostTeamIndex !== null && hostTeamIndex >= 0 ? hostTeamIndex : undefined);
            }}
            onSkip={skipSong}
            sessionCode={sessionCode}
            canBuzz={hostCanBuzzKnowledge}
          />
        )}

        {state.phase === 'playing' && currentTeam && isSpeed && (
          <SpeedPlaying
            currentTeam={currentTeam}
            timeLeft={timeLeft}
            onBuzzIn={() => {
              if (!hostCanBuzzSpeed) return;
              buzzIn(state.multiphone && hostTeamIndex !== null && hostTeamIndex >= 0 ? hostTeamIndex : undefined);
            }}
            onSkip={skipSong}
            sessionCode={sessionCode}
            canBuzz={hostCanBuzzSpeed}
          />
        )}

        {state.phase === 'guess-prompt' && currentTeam && (
          <GuessPrompt
            currentTeam={currentTeam}
            stealMode={state.stealMode}
            stealTeam={stealTeam}
            onGotIt={playerGotIt}
            onDidNotGetIt={playerDidNotGetIt}
            onSkip={skipSong}
            gameMode={state.gameMode}
            speedPoints={state.speedPoints}
            speedScoringTeamIndex={state.speedScoringTeamIndex}
            teams={state.teams}
            timeLeft={timeLeft}
            canReplay={canReplay}
            onReplay={replaySong}
            speedEliminatedTeams={state.speedEliminatedTeams}
          />
        )}

        {state.phase === 'reveal' && state.currentTrack && (
          hostCanSeeAnswer ? (
            <Reveal
              track={state.currentTrack}
              noneScored={state.noneScored}
              onCorrect={markCorrect}
              onWrong={playerDidNotGetIt}
              onNoScore={noScoreRound}
            />
          ) : (
            <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center">
              <div
                className="rounded-full border px-4 py-1.5 text-sm font-bold"
                style={{ color: answerTeam?.color, borderColor: `${answerTeam?.color}50`, background: `${answerTeam?.color}15` }}
              >
                {answerTeam?.name} está viendo la respuesta
              </div>
              <div className="w-full max-w-sm rounded-[28px] border border-white/10 bg-qr-card/70 p-6">
                <p className="font-display text-xl font-bold text-qr-text">Respuesta oculta</p>
                <p className="mt-2 text-sm text-qr-muted">
                  Como host estás jugando con otro equipo, así que la canción queda escondida hasta que termine este intento.
                </p>
                <button
                  onClick={() => setHostAnswerOverrideKey(answerOverrideKey)}
                  className="mt-5 w-full rounded-full border border-qr-yellow/50 bg-qr-yellow/10 py-3 text-sm font-black text-qr-yellow transition hover:border-qr-yellow hover:bg-qr-yellow/15 active:scale-95"
                >
                  Desocultar respuesta
                </button>
              </div>
            </div>
          )
        )}

        {state.phase === 'score-artist' && currentTeam && (
          <ScoreCheck
            teams={state.teams}
            currentTeam={currentTeam}
            stealMode={state.stealMode}
            stealTeam={stealTeam}
            betSeconds={state.betSeconds || 30}
            onConfirm={confirmCorrect}
            gameMode={state.gameMode}
            speedPoints={state.speedPoints}
            speedScoringTeamIndex={state.speedScoringTeamIndex}
            onBack={backToAnswerCheck}
          />
        )}

        {state.phase === 'round-summary' && (
          <RoundSummary
            teams={state.teams}
            round={state.round}
            roundPoints={state.roundPoints}
            onNext={nextRound}
            onEnd={finishGame}
          />
        )}
      </div>
    </div>
  );
}
