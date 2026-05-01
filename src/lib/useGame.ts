import { useState, useCallback, useRef } from 'react';
import type { GameState, Team, TrackInfo } from '../types';
import { TEAM_COLORS } from '../types';
import { calculateScore } from './scoring';
import { loadTracksForGenre, playSong, pauseSong } from './spotify-player';

const INITIAL_STATE: GameState = {
  teams: [],
  currentTeamIndex: 0,
  round: 1,
  phase: 'setup',
  currentTrackUri: null,
  currentTrack: null,
  betSeconds: null,
  stealMode: false,
  stealTeamIndex: null,
};

export function useGame() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const tracksRef = useRef<TrackInfo[]>([]);
  const trackIndexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const update = useCallback((partial: Partial<GameState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  const startGame = useCallback((teamNames: string[]) => {
    const teams: Team[] = teamNames.map((name, i) => ({
      id: `team-${i}`,
      name,
      color: TEAM_COLORS[i % TEAM_COLORS.length],
      score: 0,
    }));
    update({ teams, phase: 'genre-select', currentTeamIndex: 0, round: 1 });
  }, [update]);

  const selectGenre = useCallback(async (genre: string): Promise<string | null> => {
    try {
      const tracks = await loadTracksForGenre(genre);
      if (tracks.length === 0) return 'No se encontraron canciones para ese género.';
      tracksRef.current = tracks;
      trackIndexRef.current = 0;
      update({
        phase: 'bet-time',
        currentTrack: tracks[0],
        currentTrackUri: tracks[0].uri,
      });
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : 'Error desconocido';
    }
  }, [update]);

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    timerRef.current = null;
    intervalRef.current = null;
    setTimerRunning(false);
  }, []);

  const betAndPlay = useCallback(async (seconds: number) => {
    const track = tracksRef.current[trackIndexRef.current];
    if (!track) return;

    update({ betSeconds: seconds, phase: 'playing' });
    await playSong(track.uri);

    setTimeLeft(seconds);
    setTimerRunning(true);

    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = Math.max(seconds - elapsed, 0);
      setTimeLeft(remaining);
      if (remaining <= 0 && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, 50);

    timerRef.current = setTimeout(async () => {
      await pauseSong();
      clearTimers();
      update({ phase: 'guess-prompt' });
    }, seconds * 1000);
  }, [update, clearTimers]);

  const playerGotIt = useCallback(() => {
    update({ phase: 'reveal' });
  }, [update]);

  const markCorrect = useCallback(() => {
    update({ phase: 'score-artist' });
  }, [update]);

  const playerDidNotGetIt = useCallback(() => {
    setState((prev) => {
      if (prev.stealMode) {
        return { ...prev, phase: 'genre-select', stealMode: false, stealTeamIndex: null };
      }
      const stealIdx = (prev.currentTeamIndex + 1) % prev.teams.length;
      return { ...prev, stealMode: true, stealTeamIndex: stealIdx, phase: 'playing', betSeconds: 30 };
    });

    if (!state.stealMode) {
      const track = tracksRef.current[trackIndexRef.current];
      if (track) {
        (async () => {
          await playSong(track.uri);
          setTimeLeft(30);
          setTimerRunning(true);

          const startTime = Date.now();
          intervalRef.current = setInterval(() => {
            const elapsed = (Date.now() - startTime) / 1000;
            const remaining = Math.max(30 - elapsed, 0);
            setTimeLeft(remaining);
            if (remaining <= 0 && intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          }, 50);

          timerRef.current = setTimeout(async () => {
            await pauseSong();
            clearTimers();
            setState((prev) => ({ ...prev, phase: 'guess-prompt' }));
          }, 30000);
        })();
      }
    }
  }, [state.stealMode, clearTimers]);

  const confirmCorrect = useCallback((gotArtist: boolean, gotSong: boolean) => {
    setState((prev) => {
      const scoringTeamIdx = prev.stealMode ? (prev.stealTeamIndex ?? 0) : prev.currentTeamIndex;
      const pts = calculateScore(prev.betSeconds || 30, gotArtist, gotSong, prev.stealMode);

      const teams = prev.teams.map((t, i) =>
        i === scoringTeamIdx ? { ...t, score: t.score + pts } : t,
      );

      return {
        ...prev,
        teams,
        phase: 'round-summary',
      };
    });
  }, []);

  const nextRound = useCallback(() => {
    trackIndexRef.current += 1;
    setState((prev) => {
      if (trackIndexRef.current >= tracksRef.current.length) {
        return { ...prev, phase: 'genre-select', stealMode: false, stealTeamIndex: null };
      }

      const nextTeam = (prev.currentTeamIndex + 1) % prev.teams.length;
      const nextTrack = tracksRef.current[trackIndexRef.current];

      return {
        ...prev,
        currentTeamIndex: nextTeam,
        round: prev.round + 1,
        phase: 'genre-select',
        currentTrack: nextTrack,
        currentTrackUri: nextTrack.uri,
        betSeconds: null,
        stealMode: false,
        stealTeamIndex: null,
      };
    });
  }, []);

  const skipSong = useCallback(async () => {
    await pauseSong();
    clearTimers();
    nextRound();
  }, [clearTimers, nextRound]);

  const resetGame = useCallback(() => {
    clearTimers();
    setState(INITIAL_STATE);
  }, [clearTimers]);

  return {
    state,
    timerRunning,
    timeLeft,
    startGame,
    selectGenre,
    betAndPlay,
    playerGotIt,
    markCorrect,
    playerDidNotGetIt,
    confirmCorrect,
    nextRound,
    skipSong,
    resetGame,
  };
}
