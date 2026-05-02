import { useEffect, useState, useCallback } from 'react';
import { handleAuthCallback, isAuthenticated, clearAuth, redirectToSpotifyAuth } from './lib/spotify';
import { selectDevice } from './lib/spotify-player';
import { useGame } from './lib/useGame';
import Login from './screens/Login';
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

  const {
    state, timeLeft,
    startGame, selectGenre, betAndPlay,
    buzzIn, playerGotIt, noScoreRound, markCorrect, playerDidNotGetIt,
    confirmCorrect, nextRound, skipSong, resetGame, finishGame,
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

  const reconnectSpotify = () => {
    clearAuth();
    redirectToSpotifyAuth();
  };

  if (!authed && !debugMode) return <Login />;
  if (!playerReady && !debugMode) {
    return (
      <DevicePicker onSelect={(id) => { selectDevice(id); setPlayerReady(true); }} />
    );
  }

  const currentTeam = state.teams[state.currentTeamIndex];
  const stealTeam = state.stealTeamIndex !== null ? state.teams[state.stealTeamIndex] : null;
  const isSpeed = state.gameMode === 'speed';

  return (
    <div className="relative min-h-screen text-qr-text">
      {/* Top bar */}
      {state.phase !== 'setup' && (
        <div className="fixed left-0 right-0 top-0 z-40 border-b border-white/8 bg-qr-bg/90 backdrop-blur-md">
          <div className="flex items-center justify-between gap-2 px-3 py-2">
            <div className="flex items-center gap-2 shrink-0">
              <img src="/logorolon2.png" alt="Que Rolón" className="h-12 w-auto" />
              {isSpeed && (
                <span className="rounded-full bg-qr-yellow/20 px-2 py-0.5 text-[10px] font-bold text-qr-yellow">⚡</span>
              )}
              {debugMode && (
                <span className="rounded-full bg-qr-yellow/20 px-2 py-0.5 text-[10px] font-bold text-qr-yellow">🛠 DEBUG</span>
              )}
              <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] font-bold text-qr-muted">
                {state.round}/{state.maxRounds}
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
                    {t.score}
                  </span>
                );
              })}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setConfirmReset(true)}
                className="text-qr-muted/60 hover:text-qr-red transition px-1 text-sm"
              >
                ✕
              </button>
              {!debugMode && (
                <button
                  onClick={reconnectSpotify}
                  className="text-qr-muted/60 hover:text-qr-green transition px-1 text-sm"
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
                onClick={() => { setConfirmReset(false); setDebugMode(false); resetGame(); }}
                className="flex-1 rounded-full bg-qr-red py-3 text-sm font-black text-qr-text transition hover:brightness-110 active:scale-95"
              >
                Reiniciar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={state.phase !== 'setup' ? 'pt-11' : ''}>
        {state.phase === 'setup' && (
          <Setup onStart={(t, r, g, s, debug) => { setDebugMode(debug); startGame(t, r, g, s, debug); }} />
        )}

        {state.phase === 'finished' && (
          <Finished teams={state.teams} onNewGame={resetGame} />
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
          <BetTime currentTeam={currentTeam} onBet={betAndPlay} />
        )}

        {state.phase === 'playing' && currentTeam && !isSpeed && (
          <Playing
            currentTeam={currentTeam}
            betSeconds={state.betSeconds || 30}
            timeLeft={timeLeft}
            stealMode={state.stealMode}
            stealTeam={stealTeam}
            onBuzzIn={buzzIn}
            onSkip={skipSong}
          />
        )}

        {state.phase === 'playing' && currentTeam && isSpeed && (
          <SpeedPlaying
            currentTeam={currentTeam}
            timeLeft={timeLeft}
            onBuzzIn={buzzIn}
            onSkip={skipSong}
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
            teams={state.teams}
          />
        )}

        {state.phase === 'reveal' && state.currentTrack && (
          <Reveal
            track={state.currentTrack}
            noneScored={state.noneScored}
            onCorrect={markCorrect}
            onWrong={playerDidNotGetIt}
            onNoScore={noScoreRound}
          />
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
          />
        )}

        {state.phase === 'round-summary' && (
          <RoundSummary
            teams={state.teams}
            round={state.round}
            onNext={nextRound}
            onEnd={finishGame}
          />
        )}
      </div>
    </div>
  );
}
