import { useState, useCallback, useRef, useEffect } from 'react';
import type { GameState, Team, TrackInfo, GameMode, SongSource } from '../types';
import { TEAM_COLORS, SPEED_DURATION } from '../types';
import { calculateScore, calculateSpeedScore } from './scoring';
import { loadTracksForGenre, playSong, pauseSong } from './spotify-player';
import {
  generateRoomCode,
  createSession,
  subscribeBuzz,
  clearBuzz,
  isFirebaseReady,
} from './firebase';

const DEBUG_TRACKS: TrackInfo[] = [
  { uri: 'debug:1',  name: 'Bohemian Rhapsody',      artist: 'Queen',           album: 'A Night at the Opera',           albumArt: '', year: 1975 },
  { uri: 'debug:2',  name: 'Blinding Lights',         artist: 'The Weeknd',      album: 'After Hours',                    albumArt: '', year: 2020 },
  { uri: 'debug:3',  name: 'Despacito',               artist: 'Luis Fonsi',      album: 'VIDA',                           albumArt: '', year: 2017 },
  { uri: 'debug:4',  name: 'Gasolina',                artist: 'Daddy Yankee',    album: 'Barrio Fino',                    albumArt: '', year: 2004 },
  { uri: 'debug:5',  name: 'Shape of You',            artist: 'Ed Sheeran',      album: '÷',                              albumArt: '', year: 2017 },
  { uri: 'debug:6',  name: 'Thriller',                artist: 'Michael Jackson', album: 'Thriller',                       albumArt: '', year: 1982 },
  { uri: 'debug:7',  name: 'Levels',                  artist: 'Avicii',          album: 'True',                           albumArt: '', year: 2011 },
  { uri: 'debug:8',  name: 'Wannabe',                 artist: 'Spice Girls',     album: 'Spice',                          albumArt: '', year: 1996 },
  { uri: 'debug:9',  name: 'Uptown Funk',             artist: 'Bruno Mars',      album: 'Uptown Special',                 albumArt: '', year: 2014 },
  { uri: 'debug:10', name: 'Humble',                  artist: 'Kendrick Lamar',  album: 'DAMN.',                          albumArt: '', year: 2017 },
  { uri: 'debug:11', name: 'Rayando el Sol',          artist: 'Maná',            album: '¿Dónde Jugarán los Niños?',      albumArt: '', year: 1994 },
  { uri: 'debug:12', name: 'Take On Me',              artist: 'a-ha',            album: 'Hunting High and Low',           albumArt: '', year: 1985 },
  { uri: 'debug:13', name: 'I Gotta Feeling',         artist: 'Black Eyed Peas', album: 'The E.N.D.',                     albumArt: '', year: 2009 },
  { uri: 'debug:14', name: 'Smells Like Teen Spirit', artist: 'Nirvana',         album: 'Nevermind',                      albumArt: '', year: 1991 },
  { uri: 'debug:15', name: 'Rolling in the Deep',     artist: 'Adele',           album: '21',                             albumArt: '', year: 2010 },
  { uri: 'debug:16', name: 'Tusa',                    artist: 'Karol G',         album: 'Ocean',                          albumArt: '', year: 2019 },
  { uri: 'debug:17', name: 'Lose Yourself',           artist: 'Eminem',          album: '8 Mile',                         albumArt: '', year: 2002 },
  { uri: 'debug:18', name: 'Wonderwall',              artist: 'Oasis',           album: "(What's the Story) Morning Glory?", albumArt: '', year: 1995 },
  { uri: 'debug:19', name: 'In the Air Tonight',      artist: 'Phil Collins',    album: 'Face Value',                     albumArt: '', year: 1981 },
  { uri: 'debug:20', name: 'Bad Guy',                 artist: 'Billie Eilish',   album: 'When We All Fall Asleep',        albumArt: '', year: 2019 },
];

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
  speedScoringTeamIndex: null,
  songSource: 'advanced',
  speedEliminatedTeams: [],
  roundPoints: {},
  multiphone: false,
  sessionCode: null,
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
  const debugModeRef = useRef(false);
  const betSecondsRef = useRef(30);
  const savedSpeedTimeRef = useRef(0);
  const playerDidNotGetItRef = useRef<() => void>(() => {});

  // Multiphone refs
  const multiphoneRef = useRef(false);
  const sessionCodeRef = useRef<string | null>(null);
  const phaseRef = useRef<GameState['phase']>('setup');
  const currentTeamIndexRef = useRef(0);
  const speedEliminatedTeamsRef = useRef<number[]>([]);
  const buzzInRef = useRef<(teamIndexOverride?: number) => void>(() => {});

  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [canReplay, setCanReplay] = useState(false);
  const [sessionCode, setSessionCode] = useState<string | null>(null);

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

  const startGame = useCallback((teamNames: string[], maxRounds: number, gameMode: GameMode, songSource: SongSource, debugMode = false, multiphone = false, preGeneratedCode?: string | null) => {
    const teams: Team[] = teamNames.map((name, i) => ({
      id: `team-${i}`,
      name,
      color: TEAM_COLORS[i % TEAM_COLORS.length],
      score: 0,
    }));
    gameModeRef.current = gameMode;
    songSourceRef.current = songSource;
    debugModeRef.current = debugMode;
    multiphoneRef.current = multiphone;

    let code: string | null = null;
    if (multiphone && isFirebaseReady()) {
      code = preGeneratedCode ?? generateRoomCode();
      sessionCodeRef.current = code;
      setSessionCode(code);
      createSession(code, teams.map(t => ({ id: t.id, name: t.name, color: t.color })));
    } else {
      sessionCodeRef.current = null;
      setSessionCode(null);
    }

    update({ teams, phase: 'genre-select', currentTeamIndex: 0, round: 1, maxRounds, gameMode, songSource, multiphone, sessionCode: code });
  }, [update]);

  const selectGenre = useCallback(async (genre: string): Promise<string | null> => {
    clearTimers();
    try {
      let tracks: TrackInfo[];

      if (debugModeRef.current) {
        await new Promise(r => setTimeout(r, 350));
        const fresh = DEBUG_TRACKS.filter(t => !playedUrisRef.current.has(t.uri));
        const pool = fresh.length > 0 ? fresh : DEBUG_TRACKS;
        tracks = [pool[Math.floor(Math.random() * pool.length)]];
      } else {
        tracks = await loadTracksForGenre(genre, songSourceRef.current);
        if (tracks.length === 0) return 'No se encontraron canciones para ese género.';
      }

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
          speedEliminatedTeams: [],
        });
        if (!debugModeRef.current) await playSong(pool[0].uri);
        startCountdown(SPEED_DURATION, () => {
          // Speed mode: don't pause — let the song keep playing until the next one starts
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
    betSecondsRef.current = seconds;
    playedUrisRef.current.add(track.uri);
    update({ betSeconds: seconds, phase: 'playing' });
    if (!debugModeRef.current) await playSong(track.uri);
    startCountdown(seconds, async () => {
      if (!debugModeRef.current) await pauseSong();
      clearTimers();
      setCanReplay(true);
      update({ phase: 'guess-prompt' });
      // 30-second auto-fail timer for knowledge mode
      startCountdown(30, () => {
        clearTimers();
        playerDidNotGetItRef.current();
      });
    });
  }, [update, clearTimers, startCountdown]);

  const buzzIn = useCallback(async (teamIndexOverride?: number) => {
    if (!debugModeRef.current && gameModeRef.current !== 'speed') await pauseSong();
    // Save remaining time before clearing — needed to resume speed countdown on wrong guess
    if (gameModeRef.current === 'speed') {
      savedSpeedTimeRef.current = timeLeftRef.current;
    }
    clearTimers();
    if (gameModeRef.current === 'speed') {
      const pts = Math.round((timeLeftRef.current / SPEED_DURATION) * 100);
      setState(prev => ({
        ...prev,
        currentTeamIndex: teamIndexOverride !== undefined ? teamIndexOverride : prev.currentTeamIndex,
        phase: 'guess-prompt',
        speedPoints: pts,
      }));
    } else {
      // Knowledge: go to guess-prompt, enable replay, start 30s auto-fail timer
      if (!stealModeRef.current) setCanReplay(true);
      setState(prev => ({
        ...prev,
        currentTeamIndex: teamIndexOverride !== undefined ? teamIndexOverride : prev.currentTeamIndex,
        phase: 'guess-prompt',
      }));
      startCountdown(30, () => {
        clearTimers();
        playerDidNotGetItRef.current();
      });
    }
  }, [clearTimers, startCountdown]);

  const replaySong = useCallback(async () => {
    setCanReplay(false);
    clearTimers();
    const track = tracksRef.current[trackIndexRef.current];
    if (!track) return;
    update({ phase: 'playing' });
    if (!debugModeRef.current) await playSong(track.uri);
    startCountdown(betSecondsRef.current, async () => {
      if (!debugModeRef.current) await pauseSong();
      clearTimers();
      setCanReplay(false); // replay already used
      update({ phase: 'guess-prompt' });
      startCountdown(30, () => {
        clearTimers();
        playerDidNotGetItRef.current();
      });
    });
  }, [clearTimers, startCountdown, update]);

  const playerGotIt = useCallback((teamIdx?: number) => {
    // Stop the 30s auto-fail timer — player claimed the answer, timer no longer needed
    clearTimers();
    if (gameModeRef.current === 'speed' && teamIdx !== undefined) {
      setState(prev => ({ ...prev, phase: 'reveal', speedScoringTeamIndex: teamIdx }));
    } else {
      update({ phase: 'reveal' });
    }
  }, [clearTimers, update]);

  const markCorrect = useCallback(() => {
    clearTimers(); // ensure no stale auto-fail timer survives into score-artist
    update({ phase: 'score-artist' });
    // Knowledge mode: replay the song so there's background music during score check
    if (!debugModeRef.current && gameModeRef.current === 'knowledge') {
      const track = tracksRef.current[trackIndexRef.current];
      if (track) playSong(track.uri).catch(() => {});
    }
  }, [clearTimers, update]);

  const playerDidNotGetIt = useCallback(() => {
    // ── Speed mode ───────────────────────────────────────────────────────────
    if (gameModeRef.current === 'speed') {
      const remaining = savedSpeedTimeRef.current;
      let willResume = false;

      setState((prev) => {
        const elimIdx = prev.speedScoringTeamIndex;
        // "Nadie adivinó" (no team selected) → go straight to reveal
        if (elimIdx === null) {
          return { ...prev, phase: 'reveal', noneScored: true, speedPoints: null };
        }
        const newEliminated = [...prev.speedEliminatedTeams, elimIdx];
        const done = remaining <= 0.5 || newEliminated.length >= prev.teams.length;
        if (done) {
          willResume = false;
          return {
            ...prev,
            phase: 'reveal',
            noneScored: true,
            speedScoringTeamIndex: null,
            speedPoints: null,
            speedEliminatedTeams: [],
          };
        }
        willResume = true;
        return {
          ...prev,
          phase: 'playing',
          speedScoringTeamIndex: null,
          speedPoints: null,
          speedEliminatedTeams: newEliminated,
        };
      });

      if (willResume) {
        startCountdown(remaining, () => {
          clearTimers();
          setState((prev) => ({ ...prev, phase: 'reveal', noneScored: true, speedEliminatedTeams: [] }));
        });
      }
      return;
    }

    // ── Knowledge mode ────────────────────────────────────────────────────────
    // Capture steal state BEFORE setState so we know which branch fired
    const wasInStealMode = stealModeRef.current;

    setState((prev) => {
      if (prev.stealMode) {
        // Steal attempt failed → reveal with no score
        return { ...prev, phase: 'reveal', stealMode: false, stealTeamIndex: null, noneScored: true };
      }
      // Main team failed → enter steal mode
      const stealIdx = (prev.currentTeamIndex + 1) % prev.teams.length;
      return { ...prev, stealMode: true, stealTeamIndex: stealIdx, phase: 'playing', betSeconds: 30 };
    });

    if (!wasInStealMode) {
      // Just entered steal mode: play song for 30s listening, then 30s guess timer
      stealModeRef.current = true;
      setCanReplay(false); // steal team gets no replay
      const track = tracksRef.current[trackIndexRef.current];
      if (track) {
        (async () => {
          if (!debugModeRef.current) await playSong(track.uri);
          startCountdown(30, async () => {
            if (!debugModeRef.current) await pauseSong();
            clearTimers();
            update({ phase: 'guess-prompt' });
            // 30s guess timer for the steal team
            startCountdown(30, () => {
              clearTimers();
              stealModeRef.current = false;
              setState((prev) => ({
                ...prev,
                phase: 'reveal',
                stealMode: false,
                stealTeamIndex: null,
                noneScored: true,
              }));
            });
          });
        })();
      }
    } else {
      stealModeRef.current = false;
    }
  }, [clearTimers, startCountdown, update]);

  // Keep refs current every render
  playerDidNotGetItRef.current = playerDidNotGetIt;
  buzzInRef.current = buzzIn;

  // Sync phase / team refs for use inside the Firebase closure
  useEffect(() => { phaseRef.current = state.phase; }, [state.phase]);
  useEffect(() => { currentTeamIndexRef.current = state.currentTeamIndex; }, [state.currentTeamIndex]);
  useEffect(() => { speedEliminatedTeamsRef.current = state.speedEliminatedTeams; }, [state.speedEliminatedTeams]);

  // Firebase buzz listener — active only when multiphone session is live
  useEffect(() => {
    const code = sessionCodeRef.current;
    if (!code) return;
    return subscribeBuzz(code, (teamIndex: number) => {
      // Clear the buzz immediately so next buzz can come through
      clearBuzz(code);
      const phase = phaseRef.current;
      if (phase !== 'playing') return;
      if (gameModeRef.current === 'knowledge') {
        // Only the current team can buzz in knowledge mode
        if (teamIndex === currentTeamIndexRef.current) {
          buzzInRef.current(teamIndex);
        }
      } else {
        // Speed: any non-eliminated team can buzz
        if (!speedEliminatedTeamsRef.current.includes(teamIndex)) {
          buzzInRef.current(teamIndex);
        }
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionCode]);

  const noScoreRound = useCallback(() => {
    clearTimers();
    setState((prev) => ({ ...prev, phase: 'round-summary', noneScored: false, roundPoints: {}, speedEliminatedTeams: [] }));
  }, [clearTimers]);

  const confirmCorrect = useCallback((gotArtist: boolean, gotSong: boolean) => {
    setState((prev) => {
      const scoringTeamIdx = prev.gameMode === 'speed'
        ? (prev.speedScoringTeamIndex ?? prev.currentTeamIndex)
        : (prev.stealMode ? (prev.stealTeamIndex ?? 0) : prev.currentTeamIndex);
      const pts = prev.gameMode === 'speed'
        ? calculateSpeedScore(prev.speedPoints ?? 0, gotArtist)
        : calculateScore(prev.betSeconds || 30, gotArtist, gotSong, prev.stealMode);
      const scoringTeam = prev.teams[scoringTeamIdx];
      const teams = prev.teams.map((t, i) =>
        i === scoringTeamIdx ? { ...t, score: t.score + pts } : t,
      );
      const roundPoints = scoringTeam ? { [scoringTeam.id]: pts } : {};
      return { ...prev, teams, phase: 'round-summary', speedPoints: null, speedScoringTeamIndex: null, roundPoints, speedEliminatedTeams: [] };
    });
  }, []);

  const nextRound = useCallback(() => {
    trackIndexRef.current += 1;
    stealModeRef.current = false;
    setCanReplay(false);
    setState((prev) => {
      const nextRoundNum = prev.round + 1;
      const nextTeam = (prev.currentTeamIndex + 1) % prev.teams.length;
      if (nextRoundNum > prev.maxRounds) {
        return { ...prev, phase: 'finished', stealMode: false, stealTeamIndex: null, noneScored: false, speedEliminatedTeams: [] };
      }
      if (trackIndexRef.current >= tracksRef.current.length) {
        return { ...prev, currentTeamIndex: nextTeam, round: nextRoundNum, phase: 'genre-select', stealMode: false, stealTeamIndex: null, noneScored: false, speedEliminatedTeams: [] };
      }
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
        speedEliminatedTeams: [],
      };
    });
  }, []);

  const skipSong = useCallback(() => {
    // Don't pause — the next song's playSong call takes over automatically
    clearTimers();
    nextRound();
  }, [clearTimers, nextRound]);

  const finishGame = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'finished' }));
  }, []);

  const resetGame = useCallback(() => {
    clearTimers();
    playedUrisRef.current.clear();
    gameModeRef.current = 'knowledge';
    songSourceRef.current = 'advanced';
    debugModeRef.current = false;
    stealModeRef.current = false;
    multiphoneRef.current = false;
    sessionCodeRef.current = null;
    setCanReplay(false);
    setSessionCode(null);
    setState(INITIAL_STATE);
  }, [clearTimers]);

  return {
    state,
    timerRunning,
    timeLeft,
    canReplay,
    sessionCode,
    startGame,
    selectGenre,
    betAndPlay,
    buzzIn,
    replaySong,
    playerGotIt,
    noScoreRound,
    markCorrect,
    playerDidNotGetIt,
    confirmCorrect,
    nextRound,
    skipSong,
    resetGame,
    finishGame,
  };
}
