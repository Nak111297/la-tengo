import { getToken } from './spotify';
import type { TrackInfo } from '../types';

let player: Spotify.Player | null = null;
let deviceId: string | null = null;
let playerReady = false;
let onReadyCallback: (() => void) | null = null;

export function isMobile(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function initPlayer(onReady: () => void): void {
  onReadyCallback = onReady;

  if (isMobile()) {
    connectMobileDevice();
    return;
  }

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

async function connectMobileDevice(): Promise<void> {
  const token = await getToken();
  if (!token) return;

  const res = await fetch('https://api.spotify.com/v1/me/player/devices', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return;

  const data = await res.json();
  const devices: { id: string; is_active: boolean }[] = data.devices ?? [];
  const active = devices.find(d => d.is_active) ?? devices[0];

  if (active?.id) {
    deviceId = active.id;
    playerReady = true;
    onReadyCallback?.();
  }
}

export async function retryMobileConnect(): Promise<boolean> {
  await connectMobileDevice();
  return playerReady;
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

const GENRE_QUERIES: Record<string, string> = {
  'EDM':               'edm electronic dance',
  'Pop Latino':        'pop latino',
  'Reggaetón':         'reggaeton',
  'Rock en Español':   'rock en espanol',
  'Pop Internacional': 'pop hits',
  '2000s Hits':        'pop hits 2000s',
  'Fiesta / Party':    'fiesta party dance',
  'Hip Hop':           'hip hop rap',
  'R&B':               'rnb soul',
  '80s Hits':          '80s hits classic pop',
  '90s Hits':          '90s hits pop',
};

export async function loadTracksForGenre(genre: string): Promise<TrackInfo[]> {
  const token = await getToken();
  if (!token) throw new Error('No Spotify token');

  const query = GENRE_QUERIES[genre];
  if (!query) throw new Error(`Género no configurado: ${genre}`);

  const offsets = [0, 50, 100, 150, 200, 250];
  const pages = await Promise.all(
    offsets.map(offset =>
      fetch(
        `https://api.spotify.com/v1/search?${new URLSearchParams({ q: query, type: 'track', limit: '50', offset: String(offset) })}`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
        .then(r => r.ok ? r.json() : { tracks: { items: [] } })
        .catch(() => ({ tracks: { items: [] } })),
    ),
  );

  type RawTrack = {
    uri: string; name: string;
    artists: { name: string }[];
    album: { name: string; images: { url: string }[]; release_date: string };
  };

  const seen = new Set<string>();
  const tracks: TrackInfo[] = [];
  for (const page of pages) {
    for (const t of (page.tracks?.items ?? []) as (RawTrack | null)[]) {
      if (t?.uri && !seen.has(t.uri)) {
        seen.add(t.uri);
        tracks.push({
          uri: t.uri,
          name: t.name,
          artist: t.artists.map(a => a.name).join(', '),
          album: t.album.name,
          albumArt: t.album.images[0]?.url || '',
          year: parseInt(t.album.release_date?.substring(0, 4) || '0', 10),
        });
      }
    }
  }

  if (tracks.length === 0) throw new Error(`Search "${genre}" (q=${query}): sin resultados`);

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
