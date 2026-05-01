import { getToken } from './spotify';
import type { TrackInfo } from '../types';

let deviceId: string | null = null;

export interface SpotifyDevice {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
}

export async function getDevices(): Promise<SpotifyDevice[]> {
  const token = await getToken();
  if (!token) return [];
  const res = await fetch('https://api.spotify.com/v1/me/player/devices', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.devices ?? [];
}

export function selectDevice(id: string): void {
  deviceId = id;
}

export function isPlayerReady(): boolean {
  return !!deviceId;
}

const GENRE_QUERIES: Record<string, string> = {
  'EDM':               'genre:edm',
  'Pop Latino':        'genre:latin pop',
  'Reggaetón':         'genre:reggaeton',
  'Rock en Español':   'genre:spanish rock',
  'Pop Internacional': 'genre:pop',
  '2000s Hits':        'genre:pop year:2000-2009',
  'Fiesta / Party':    'genre:latin',
  'Hip Hop':           'genre:hip-hop',
  'R&B':               'genre:r-n-b',
  '80s Hits':          'genre:pop year:1980-1989',
  '90s Hits':          'genre:pop year:1990-1999',
};

export async function loadTracksForGenre(genre: string): Promise<TrackInfo[]> {
  const token = await getToken();
  if (!token) throw new Error('No Spotify token');

  const query = GENRE_QUERIES[genre];
  if (!query) throw new Error(`Género no configurado: ${genre}`);

  // limit param causes 400 — use default (20/page) with offsets
  const offsets = [0, 20, 40, 60, 80, 100, 120, 140, 160, 180];
  const pages = await Promise.all(
    offsets.map(offset =>
      fetch(
        `https://api.spotify.com/v1/search?${new URLSearchParams({ q: query, type: 'track', offset: String(offset) })}`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
        .then(r => r.ok ? r.json() : { tracks: { items: [] } })
        .catch(() => ({ tracks: { items: [] } })),
    ),
  );

  type RawTrack = {
    uri: string; name: string; popularity: number;
    artists: { name: string }[];
    album: { name: string; images: { url: string }[]; release_date: string };
  };

  const seen = new Set<string>();
  const all: (TrackInfo & { popularity: number })[] = [];
  for (const page of pages) {
    for (const t of (page.tracks?.items ?? []) as (RawTrack | null)[]) {
      if (t?.uri && !seen.has(t.uri)) {
        seen.add(t.uri);
        all.push({
          uri: t.uri,
          name: t.name,
          artist: t.artists.map(a => a.name).join(', '),
          album: t.album.name,
          albumArt: t.album.images[0]?.url || '',
          year: parseInt(t.album.release_date?.substring(0, 4) || '0', 10),
          popularity: t.popularity ?? 0,
        });
      }
    }
  }

  if (all.length === 0) throw new Error(`Sin resultados para: ${genre}`);

  const top = all.sort((a, b) => b.popularity - a.popularity).slice(0, 60);
  return shuffleArray(top.map(({ popularity: _p, ...track }) => track));
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
  // Wake/transfer device before playing — keeps mobile Spotify active between rounds
  await fetch('https://api.spotify.com/v1/me/player', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ device_ids: [deviceId], play: false }),
  }).catch(() => {});
  await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
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
