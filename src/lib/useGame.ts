import { useState, useCallback, useRef } from 'react';
import type { GameState, Team, TrackInfo, GameMode, SongSource } from '../types';
import { TEAM_COLORS, SPEED_DURATION } from '../types';
import { calculateScore, calculateSpeedScore } from './scoring';
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
  gameMode: 'knowledge',
  speedPoints: null,
  songSource: 'advanced',
};

export function useGame() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const tracksRef = useRef<TrackInfo[]>([]);
  const trackIndexRef = useRef(0);
  const playedUrisRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameModeRef = useRef<GameMode>('knowledge');
  const songSourceRef = useRef<SongSource>('advanced');
  const timeLeftRef = useRef(0);
  const stealModeRef = useRef(false);

  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const update = useCallback((partial: Partial<GameState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    timerRef.current = null;
    intervalRef.current = null;
    setTimerRunning(false);
  }, []);

  const startCountdown = useCallback((seconds: number, onEnd: () => void) => {
    timeLeftRef.current = seconds;
    setTimeLeft(seconds);
    setTimerRunning(true);
    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = Math.max(seconds - elapsed, 0);
      timeLeftRef.current = remaining;
      setTimeLeft(remaining);
      if (remaining <= 0 && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, 50);
    timerRef.current = setTimeout(onEnd, seconds * 1000);
  }, []);

  const startGame = useCallback((teamNames: string[], maxRounds: number, gameMode: GameMode, songSource: SongSource) => {
    const teams: Team[] = teamNames.map((name, i) => ({
      id: `team-${i}`,
      name,
      color: TEAM_COLORS[i % TEAM_COLORS.length],
      score: 0,
    }));
    gameModeRef.current = gameMode;
    songSourceRef.current = songSource;
    update({ teams, phase: 'genre-select', currentTeamIndex: 0, round: 1, maxRounds, gameMode, songSource });
  }, [update]);

  const selectGenre = useCallback(async (genre: string): Promise<string | null> => {
    clearTimers();
    try {
      const tracks = await loadTracksForGenre(genre, songSourceRef.current);
      if (tracks.length === 0) return 'No se encontraron canciones para ese género.';

      const fresh = tracks.filter(t => !playedUrisRef.current.has(t.uri));
      const pool = fresh.length > 0 ? fresh : tracks;
      tracksRef.current = pool;
      trackIndexRef.current = 0;

      if (gameModeRef.current === 'speed') {
        playedUrisRef.current.add(pool[0].uri);
        update({
          phase: 'playing',
          betSeconds: SPEED_DURATION,
          currentTrack: pool[0],
          currentTrackUri: pool[0].uri,
        });
        await playSong(pool[0].uri);
        startCountdown(SPEED_DURATION, async () => {
          await pauseSong();
          clearTimers();
          setState(prev => ({ ...prev, phase: 'reveal', speedPoints: 0, noneScored: true }));
        });
      } else {
        update({
          phase: 'bet-time',
          currentTrack: pool[0],
          currentTrackUri: pool[0].uri,
        });
      }

      return null;
    } catch (e) {
      return e instanceof Error ? e.message : 'Error desconocido';
    }
  }, [update, clearTimers, startCountdown]);

  const betAndPlay = useCallback(async (seconds: number) => {
    const track = tracksRef.current[trackIndexRef.current];
    if (!track) return;
    playedUrisRef.current.add(track.uri);
    update({ betSeconds: seconds, phase: 'playing' });
    await playSong(track.uri);
    startCountdown(seconds, async () => {
      await pauseSong();
      clearTimers();
      update({ phase: 'guess-prompt' });
    });
  }, [update, clearTimers, startCountdown]);

  const buzzIn = useCallback(async () => {
    await pauseSong();
    clearTimers();
    if (gameModeRef.current === 'speed') {
      const pts = Math.round((timeLeftRef.current / SPEED_DURATION) * 100);
      setState(prev => ({ ...prev, phase: 'guess-prompt', speedPoints: pts }));
    } else {
      update({ phase: 'guess-prompt' });
    }
  }, [clearTimers, update]);

  const playerGotIt = useCallback(() => {
    update({ phase: 'reveal' });
  }, [update]);

  const markCorrect = useCallback(() => {
    update({ phase: 'score-artist' });
  }, [update]);

  const playerDidNotGetIt = useCallback(() => {
    if (gameModeRef.current === 'speed') {
      setState(prev => ({ ...prev, phase: 'reveal', noneScored: true }));
      return;
    }
    setState((prev) => {
      if (prev.stealMode) {
        return { ...prev, phase: 'reveal', stealMode: false, stealTeamIndex: null, noneScored: true };
      }
      const stealIdx = (prev.currentTeamIndex + 1) % prev.teams.length;
      stealModeRef.current = true;
      return { ...prev, stealMode: true, stealTeamIndex: stealIdx, phase: 'playing', betSeconds: 30 };
    });

    if (!stealModeRef.current) {
      const track = tracksRef.current[trackIndexRef.current];
      if (track) {
        stealModeRef.current = true;
        (async () => {
          await playSong(track.uri);
          startCountdown(30, async () => {
            await pauseSong();
            clearTimers();
            setState((prev) => ({ ...prev, phase: 'guess-prompt' }));
          });
        })();
      }
    }
  }, [clearTimers, startCountdown]);

  const noScoreRound = useCallback(() => {
    setState((prev) => ({ ...prev, phase: 'round-summary', noneScored: false }));
  }, []);

  const confirmCorrect = useCallback((gotArtist: boolean, gotSong: boolean) => {
    setState((prev) => {
      const scoringTeamIdx = prev.stealMode ? (prev.stealTeamIndex ?? 0) : prev.currentTeamIndex;
      const pts = prev.gameMode === 'speed'
        ? calculateSpeedScore(prev.speedPoints ?? 0, gotArtist)
        : calculateScore(prev.betSeconds || 30, gotArtist, gotSong, prev.stealMode);
      const teams = prev.teams.map((t, i) =>
        i === scoringTeamIdx ? { ...t, score: t.score + pts } : t,
      );
      return { ...prev, teams, phase: 'round-summary', speedPoints: null };
    });
  }, []);

  const nextRound = useCallback(() => {
    trackIndexRef.current += 1;
    stealModeRef.current = false;
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
    gameModeRef.current = 'knowledge';
    songSourceRef.current = 'advanced';
    stealModeRef.current = false;
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
