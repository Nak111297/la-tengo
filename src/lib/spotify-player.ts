import { getToken } from './spotify';
import type { TrackInfo } from '../types';

let player: Spotify.Player | null = null;
let deviceId: string | null = null;
let playerReady = false;
let onReadyCallback: (() => void) | null = null;

export function initPlayer(onReady: () => void): void {
  onReadyCallback = onReady;

  if (document.getElementById('spotify-sdk')) {
    if (playerReady) onReady();
    return;
  }

  const script = document.createElement('script');
  script.id = 'spotify-sdk';
  script.src = 'https://sdk.scdn.co/spotify-player.js';
  document.body.appendChild(script);

  (window as unknown as Record<string, unknown>).onSpotifyWebPlaybackSDKReady = () => {
    createPlayer();
  };
}

async function createPlayer(): Promise<void> {
  const token = await getToken();
  if (!token) return;

  player = new Spotify.Player({
    name: 'La Tengo',
    getOAuthToken: async (cb) => {
      const t = await getToken();
      cb(t || '');
    },
    volume: 0.8,
  });

  player.addListener('ready', ({ device_id }) => {
    deviceId = device_id;
    playerReady = true;
    onReadyCallback?.();
  });

  player.addListener('not_ready', () => {
    playerReady = false;
  });

  player.connect();
}

export function isPlayerReady(): boolean {
  return playerReady;
}

const GENRE_PLAYLIST_QUERIES: Record<string, string> = {
  'Pop Latino': 'pop latino hits',
  'Reggaetón': 'reggaeton hits',
  'Rock en Español': 'rock en español clasicos',
  'Pop Internacional': 'global top hits pop',
  '2000s Hits': '2000s throwback hits',
  'Fiesta / Party': 'fiesta latina party',
  'Hip Hop': 'hip hop hits',
  'R&B': 'r&b hits',
  '80s Hits': '80s greatest hits',
  '90s Hits': '90s hits throwback',
};

export async function loadTracksForGenre(genre: string): Promise<TrackInfo[]> {
  const token = await getToken();
  if (!token) throw new Error('No Spotify token');

  const query = GENRE_PLAYLIST_QUERIES[genre] || genre;
  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&limit=5`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Spotify search failed: ${res.status} ${JSON.stringify(err)}`);
  }
  const data = await res.json();

  const playlists = data.playlists?.items || [];
  if (playlists.length === 0) return [];

  const playlist = playlists[Math.floor(Math.random() * Math.min(3, playlists.length))];

  const tracksRes = await fetch(
    `https://api.spotify.com/v1/playlists/${playlist.id}/tracks?limit=50`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!tracksRes.ok) return [];
  const tracksData = await tracksRes.json();

  const tracks: TrackInfo[] = (tracksData.items || [])
    .filter((item: { track: { uri: string } | null }) => item.track && item.track.uri)
    .map((item: { track: { uri: string; name: string; artists: { name: string }[]; album: { name: string; images: { url: string }[]; release_date: string } } }) => ({
      uri: item.track.uri,
      name: item.track.name,
      artist: item.track.artists.map((a: { name: string }) => a.name).join(', '),
      album: item.track.album.name,
      albumArt: item.track.album.images[0]?.url || '',
      year: parseInt(item.track.album.release_date?.substring(0, 4) || '0', 10),
    }));

  return shuffleArray(tracks);
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function playSong(trackUri: string): Promise<void> {
  const token = await getToken();
  if (!token || !deviceId) return;

  await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uris: [trackUri], position_ms: 0 }),
  });
}

export async function pauseSong(): Promise<void> {
  const token = await getToken();
  if (!token || !deviceId) return;

  await fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function setVolume(pct: number): Promise<void> {
  const token = await getToken();
  if (!token || !deviceId) return;

  await fetch(
    `https://api.spotify.com/v1/me/player/volume?volume_percent=${Math.round(pct)}&device_id=${deviceId}`,
    { method: 'PUT', headers: { Authorization: `Bearer ${token}` } },
  );
}

export function disconnectPlayer(): void {
  player?.disconnect();
  player = null;
  deviceId = null;
  playerReady = false;
}
