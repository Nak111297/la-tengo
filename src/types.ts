export interface Team {
  id: string;
  name: string;
  color: string;
  score: number;
}

export type GameMode = 'knowledge' | 'speed';
export type SongSource = 'random' | 'advanced';

export interface GameState {
  teams: Team[];
  currentTeamIndex: number;
  round: number;
  maxRounds: number;
  phase: GamePhase;
  currentTrackUri: string | null;
  currentTrack: TrackInfo | null;
  betSeconds: number | null;
  stealMode: boolean;
  stealTeamIndex: number | null;
  noneScored: boolean;
  gameMode: GameMode;
  speedPoints: number | null;
  songSource: SongSource;
}

export type GamePhase =
  | 'setup'
  | 'genre-select'
  | 'bet-time'
  | 'playing'
  | 'guess-prompt'
  | 'reveal'
  | 'score-artist'
  | 'round-summary'
  | 'finished';

export interface TrackInfo {
  uri: string;
  name: string;
  artist: string;
  album: string;
  albumArt: string;
  year: number;
}

export const BET_OPTIONS = [
  { seconds: 3, points: 5, label: '3s' },
  { seconds: 5, points: 4, label: '5s' },
  { seconds: 10, points: 3, label: '10s' },
  { seconds: 30, points: 2, label: '30s' },
] as const;

export const STEAL_POINTS = 1;

export const SPEED_DURATION = 60;

export const GENRES = [
  'EDM',
  'Pop Latino',
  'Reggaetón',
  'Rock en Español',
  'Pop Internacional',
  '2000s Hits',
  'Fiesta / Party',
  'Hip Hop',
  'R&B',
  '80s Hits',
  '90s Hits',
] as const;

export const GENRE_ICONS: Record<string, string> = {
  'EDM': '🎧',
  'Pop Latino': '🌴',
  'Reggaetón': '🔥',
  'Rock en Español': '🎸',
  'Pop Internacional': '⭐',
  '2000s Hits': '💿',
  'Fiesta / Party': '🎉',
  'Hip Hop': '🎤',
  'R&B': '🎵',
  '80s Hits': '📼',
  '90s Hits': '💾',
};

export const TEAM_COLORS = [
  '#ef4444', '#3b82f6', '#22c55e', '#f59e0b',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
];
