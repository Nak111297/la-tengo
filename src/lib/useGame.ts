import { useState, useCallback, useRef } from 'react';
import type { GameState, Team, TrackInfo } from '../types';
import { TEAM_COLORS } from '../types';
import { calculateScore } from './scoring';
import { loadTracksForGenre, playSong, pauseSong } from './spotify-player';

const INITIAL_STATE: GameState = {
  teams: [],
  currentTeamIndex: 0,
  round: 1,
  maxRounds: 10,
  phase: 'setup',
  currentTrackUri: null,
  currentTrack: null,
  betSeconds: null,
  stealMode: false,
  stealTeamIndex: null,
  noneScored: false,
};

export function useGame() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const tracksRef = useRef<TrackInfo[]>([]);
  const trackIndexRef = useRef(0);
  const playedUrisRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const update = useCallback((partial: Partial<GameState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  const startGame = useCallback((teamNames: string[], maxRounds: number) => {
    const teams: Team[] = teamNames.map((name, i) => ({
      id: `team-${i}`,
      name,
      color: TEAM_COLORS[i % TEAM_COLORS.length],
      score: 0,
    }));
    update({ teams, phase: 'genre-select', currentTeamIndex: 0, round: 1, maxRounds });
  }, [update]);

  const selectGenre = useCallback(async (genre: string): Promise<string | null> => {
    try {
      const tracks = await loadTracksForGenre(genre);
      if (tracks.length === 0) return 'No se encontraron canciones para ese género.';

      const fresh = tracks.filter(t => !playedUrisRef.current.has(t.uri));
      const pool = fresh.length > 0 ? fresh : tracks; // reset if all already played
      tracksRef.current = pool;
      trackIndexRef.current = 0;

      update({
        phase: 'bet-time',
        currentTrack: pool[0],
        currentTrackUri: pool[0].uri,
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

    playedUrisRef.current.add(track.uri);
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

  const buzzIn = useCallback(async () => {
    await pauseSong();
    clearTimers();
    update({ phase: 'guess-prompt' });
  }, [clearTimers, update]);

  const playerGotIt = useCallback(() => {
    update({ phase: 'reveal' });
  }, [update]);

  const markCorrect = useCallback(() => {
    update({ phase: 'score-artist' });
  }, [update]);

  const playerDidNotGetIt = useCallback(() => {
    setState((prev) => {
      if (prev.stealMode) {
        // Nobody got it — show song reveal before moving on
        return { ...prev, phase: 'reveal', stealMode: false, stealTeamIndex: null, noneScored: true };
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

  const noScoreRound = useCallback(() => {
    setState((prev) => ({ ...prev, phase: 'round-summary', noneScored: false }));
  }, []);

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
      const nextRoundNum = prev.round + 1;
      if (nextRoundNum > prev.maxRounds) {
        return { ...prev, phase: 'finished', stealMode: false, stealTeamIndex: null, noneScored: false };
      }
      if (trackIndexRef.current >= tracksRef.current.length) {
        return { ...prev, round: nextRoundNum, phase: 'genre-select', stealMode: false, stealTeamIndex: null, noneScored: false };
      }
      const nextTeam = (prev.currentTeamIndex + 1) % prev.teams.length;
      const nextTrack = tracksRef.current[trackIndexRef.current];
      return {
        ...prev,
        currentTeamIndex: nextTeam,
        round: nextRoundNum,
        phase: 'genre-select',
        currentTrack: nextTrack,
        currentTrackUri: nextTrack.uri,
        betSeconds: null,
        stealMode: false,
        stealTeamIndex: null,
        noneScored: false,
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
    playedUrisRef.current.clear();
    setState(INITIAL_STATE);
  }, [clearTimers]);

  return {
    state,
    timerRunning,
    timeLeft,
    startGame,
    selectGenre,
    betAndPlay,
    buzzIn,
    playerGotIt,
    noScoreRound,
    markCorrect,
    playerDidNotGetIt,
    confirmCorrect,
    nextRound,
    skipSong,
    resetGame,
  };
}
