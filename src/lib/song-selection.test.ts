import { describe, test, expect, vi, beforeEach } from 'vitest';
import { loadTracksForGenre, buildPlayedFilter } from './spotify-player';
import type { TrackInfo } from '../types';

vi.mock('./spotify', () => ({ getToken: async () => 'fake-token' }));

// Spotify devuelve un URI estable por canción, para poder detectar repeticiones.
function uriFor(query: string): string {
  const track = /track:"([^"]+)"/.exec(query)?.[1] ?? query;
  const artist = /artist:"([^"]+)"/.exec(query)?.[1] ?? '';
  const slug = (v: string) => v.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `spotify:track:${slug(artist)}-${slug(track)}`;
}

beforeEach(() => {
  vi.stubGlobal('fetch', async (url: string) => {
    const query = new URL(url).searchParams.get('q') ?? '';
    return {
      ok: true,
      status: 200,
      json: async () => ({
        tracks: {
          items: [{
            uri: uriFor(query),
            name: 'x',
            artists: [{ name: 'x' }],
            album: { name: 'x', images: [], release_date: '2000-01-01' },
          }],
        },
      }),
    };
  });
});

async function playRounds(genre: string, rounds: number): Promise<TrackInfo[]> {
  const picked: TrackInfo[] = [];
  for (let i = 0; i < rounds; i++) {
    const [track] = await loadTracksForGenre(genre, 'advanced', buildPlayedFilter(picked));
    picked.push(track);
  }
  return picked;
}

describe('selección de canciones', () => {
  test('no repite ninguna canción a lo largo de una partida larga', async () => {
    const picked = await playRounds('Pop Latino', 40);
    expect(picked).toHaveLength(40);
    expect(new Set(picked.map(t => t.uri)).size).toBe(40);
  });

  test('sin historial las repeticiones sí ocurren (el filtro es lo que las evita)', async () => {
    const picked: TrackInfo[] = [];
    for (let i = 0; i < 40; i++) {
      const [track] = await loadTracksForGenre('Pop Latino', 'advanced');
      picked.push(track);
    }
    expect(new Set(picked.map(t => t.uri)).size).toBeLessThan(40);
  });

  test('agota el género entero antes de repetir, y luego sigue sonando', async () => {
    // Reggaetón tiene 121 temas: las primeras 121 rondas deben ser todas
    // distintas, y la 122 debe repetir en vez de tirar error.
    const picked = await playRounds('Reggaetón', 130);
    const firstPass = picked.slice(0, 121);
    expect(new Set(firstPass.map(t => t.uri)).size).toBe(121);
    expect(picked).toHaveLength(130);
  });
});
