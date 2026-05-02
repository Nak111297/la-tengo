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
    confirmCorrect, nextRound, skipSong, resetGame,
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
      <DevicePicker
        onSelect={(id) => { selectDevice(id); setPlayerReady(true); }}
      />
    );
  }

  const currentTeam = state.teams[state.currentTeamIndex];
  const stealTeam = state.stealTeamIndex !== null ? state.teams[state.stealTeamIndex] : null;
  const isSpeed = state.gameMode === 'speed';

  return (
    <div className="relative min-h-screen bg-zinc-950 text-white">
      {/* Top bar */}
      {state.phase !== 'setup' && (
        <div className="fixed left-0 right-0 top-0 z-40 border-b border-zinc-900 bg-zinc-950/95 backdrop-blur">
          <div className="flex items-center justify-between gap-2 px-3 py-2">
            <div className="flex items-center gap-2 shrink-0">
              <span className="bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-sm font-black text-transparent">
                Que Rolón
              </span>
              {isSpeed && (
                <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-[10px] font-bold text-orange-400">⚡</span>
              )}
              {debugMode && (
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">🛠 DEBUG</span>
              )}
              <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-bold text-zinc-400">
                {state.round}/{state.maxRounds}
              </span>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              {state.teams.map((t, idx) => {
                const isActive = idx === state.currentTeamIndex;
                return (
                  <span
                    key={t.id}
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-black transition ${
                      isActive ? 'ring-1' : ''
                    }`}
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
                className="text-zinc-600 hover:text-red-400 transition px-1 text-sm"
                aria-label="Reiniciar partida"
              >
                ✕
              </button>
              <button
                onClick={reconnectSpotify}
                className="text-zinc-600 hover:text-green-400 transition px-1 text-sm"
                title="Reconectar Spotify"
              >
                ↺
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
          <div className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-900 p-6 text-center">
            <p className="text-3xl mb-3">⚠️</p>
            <p className="text-lg font-black text-white mb-1">¿Reiniciar partida?</p>
            <p className="text-sm text-zinc-400 mb-5">Se pierden todos los puntos.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmReset(false)}
                className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 py-3 text-sm font-bold text-zinc-300 transition hover:border-zinc-600"
              >
                Cancelar
              </button>
              <button
                onClick={() => { setConfirmReset(false); setDebugMode(false); resetGame(); }}
                className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-black text-white transition hover:bg-red-500 active:scale-95"
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
              <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3 rounded-3xl border border-zinc-800 bg-zinc-900 px-8 py-6">
                  <div className="h-10 w-10 rounded-full border-4 border-zinc-800 border-t-fuchsia-500 animate-spin" />
                  <p className="text-sm font-bold text-zinc-300">Buscando canción...</p>
                  <p className="text-xs text-zinc-500">Spotify a veces tarda</p>
                </div>
              </div>
            )}
            {genreError && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
                <div className="w-full max-w-sm rounded-3xl border border-red-800 bg-zinc-900 p-6 text-center">
                  <p className="text-3xl mb-3">⚠️</p>
                  <p className="text-red-400 font-black text-lg mb-1">Error cargando canción</p>
                  <p className="text-sm text-zinc-400 mb-5">{genreError}</p>
                  <button
                    onClick={() => setGenreError(null)}
                    className="rounded-xl bg-zinc-800 px-6 py-3 text-sm font-bold transition hover:bg-zinc-700"
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
          />
        )}

        {state.phase === 'round-summary' && (
          <RoundSummary
            teams={state.teams}
            round={state.round}
            onNext={nextRound}
            onEnd={resetGame}
          />
        )}
      </div>
    </div>
  );
}
