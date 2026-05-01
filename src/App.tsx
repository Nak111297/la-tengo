import { useEffect, useState, useCallback } from 'react';
import { handleAuthCallback, isAuthenticated } from './lib/spotify';
import { initPlayer } from './lib/spotify-player';
import { useGame } from './lib/useGame';
import Login from './screens/Login';
import Setup from './screens/Setup';
import GenreSelect from './screens/GenreSelect';
import BetTime from './screens/BetTime';
import Playing from './screens/Playing';
import GuessPrompt from './screens/GuessPrompt';
import Reveal from './screens/Reveal';
import ScoreCheck from './screens/ScoreCheck';
import RoundSummary from './screens/RoundSummary';

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [genreError, setGenreError] = useState<string | null>(null);

  const {
    state, timeLeft,
    startGame, selectGenre, betAndPlay,
    playerGotIt, markCorrect, playerDidNotGetIt,
    confirmCorrect, nextRound, skipSong, resetGame,
  } = useGame();

  useEffect(() => {
    (async () => {
      const token = await handleAuthCallback();
      if (token || isAuthenticated()) {
        setAuthed(true);
        initPlayer(() => setPlayerReady(true));
      }
    })();
  }, []);

  const handleGenreSelect = useCallback(async (genre: string) => {
    setLoading(true);
    setGenreError(null);
    const error = await selectGenre(genre);
    setLoading(false);
    if (error) setGenreError(error);
  }, [selectGenre]);

  if (!authed) return <Login />;

  if (!playerReady) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="animate-spin text-4xl">🎵</div>
        <p className="text-zinc-400">Conectando reproductor de Spotify...</p>
        <p className="text-xs text-zinc-600">Asegúrate de tener Spotify abierto en algún dispositivo</p>
      </div>
    );
  }

  const currentTeam = state.teams[state.currentTeamIndex];
  const stealTeam = state.stealTeamIndex !== null ? state.teams[state.stealTeamIndex] : null;

  return (
    <div className="relative min-h-screen bg-zinc-950 text-white">
      {/* Top bar */}
      {state.phase !== 'setup' && (
        <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/90 px-4 py-2 backdrop-blur">
          <span className="text-sm font-bold text-purple-400">🎵 La Tengo</span>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-zinc-500">Ronda {state.round}</span>
            {state.teams.map((t) => (
              <span key={t.id} className="font-bold" style={{ color: t.color }}>
                {t.score}
              </span>
            ))}
            <button onClick={() => { if (confirm('¿Reiniciar partida?')) resetGame(); }} className="text-zinc-600 hover:text-red-400">
              ✕
            </button>
          </div>
        </div>
      )}

      <div className={state.phase !== 'setup' ? 'pt-12' : ''}>
        {state.phase === 'setup' && (
          <Setup onStart={startGame} />
        )}

        {state.phase === 'genre-select' && currentTeam && (
          <>
            <GenreSelect currentTeam={currentTeam} onSelect={handleGenreSelect} loading={loading} />
            {genreError && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
                <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-red-500 p-6 text-center">
                  <p className="text-2xl mb-2">⚠️</p>
                  <p className="text-red-400 font-bold mb-1">Error cargando canciones</p>
                  <p className="text-sm text-zinc-400 mb-4">{genreError}</p>
                  <button onClick={() => setGenreError(null)} className="rounded-xl bg-zinc-700 px-6 py-2 text-sm font-bold">
                    Intentar de nuevo
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {state.phase === 'bet-time' && currentTeam && (
          <BetTime currentTeam={currentTeam} onBet={betAndPlay} />
        )}

        {state.phase === 'playing' && currentTeam && (
          <Playing
            currentTeam={currentTeam}
            betSeconds={state.betSeconds || 30}
            timeLeft={timeLeft}
            stealMode={state.stealMode}
            stealTeam={stealTeam}
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
          />
        )}

        {state.phase === 'reveal' && state.currentTrack && (
          <Reveal
            track={state.currentTrack}
            onCorrect={markCorrect}
            onWrong={playerDidNotGetIt}
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
