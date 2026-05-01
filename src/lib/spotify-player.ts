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

// Fixed Spotify editorial playlist IDs per genre — swap any ID to change the playlist
const GENRE_PLAYLISTS: Record<string, string> = {
  'EDM':               '3vdYDhTPS1399eLUzsrPJE', // EDM test playlist
  'Pop Latino':        '37i9dQZF1DX10zKzsJ2jva', // ¡Viva Latino!
  'Reggaetón':         '37i9dQZF1DXa2PvUpywmrr', // Baila Reggaeton
  'Rock en Español':   '37i9dQZF1DXe2bobNYDtW8', // Rock en Español
  'Pop Internacional': '37i9dQZF1DXcBWIGoYBM5M', // Today's Top Hits
  '2000s Hits':        '37i9dQZF1DX4o1oenSJRJd', // I Love My 00s Pop
  'Fiesta / Party':    '37i9dQZF1DX0HRj9P7NxeE', // Viva la Fiesta
  'Hip Hop':           '37i9dQZF1DX0XUsuxWHRQd', // RapCaviar
  'R&B':               '37i9dQZF1DX4SBhb3fqCJd', // Are & Be
  '80s Hits':          '37i9dQZF1DXb57XD9pUNby', // 80s Party Anthems
  '90s Hits':          '37i9dQZF1DXbTxeAdrVG2l', // 90s Hits
};

export async function loadTracksForGenre(genre: string): Promise<TrackInfo[]> {
  const token = await getToken();
  if (!token) throw new Error('No Spotify token');

  // Verify token works
  const meRes = await fetch('https://api.spotify.com/v1/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!meRes.ok) throw new Error(`Token inválido: ${meRes.status}. Reconecta Spotify (↺).`);

  const playlistId = GENRE_PLAYLISTS[genre];
  if (!playlistId) throw new Error(`No playlist configurado para: ${genre}`);

  const tracksRes = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!tracksRes.ok) {
    const err = await tracksRes.json().catch(() => ({}));
    throw new Error(`Playlist ${playlistId}: ${tracksRes.status} — ${JSON.stringify(err)}`);
  }
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
