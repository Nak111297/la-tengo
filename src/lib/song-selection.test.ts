import { describe, test, expect, vi, beforeEach } from 'vitest';
import { loadTracksForGenre } from './spotify-player';
import { markPlayed, resetGenre } from './play-history';
import type { TrackInfo } from '../types';

vi.mock('./spotify', () => ({ getToken: async () => 'fake-token' }));

// Spotify devuelve un URI estable por canción, para poder detectar repeticiones.
function uriFor(query: string): string {
  const track = /track:"([^"]+)"/.exec(query)?.[1] ?? query;
  const artist = /artist:"([^"]+)"/.exec(query)?.[1] ?? '';
  const slug = (v: string) => v.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `spotify:track:${slug(artist)}-${slug(track)}`;
}

const GENRES = ['Pop Latino', 'Reggaetón', 'Hip Hop'];

beforeEach(() => {
  GENRES.forEach(resetGenre);
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

// Una partida: cada ronda elige un tema y lo marca como sonado, igual que useGame.
async function playGame(genre: string, rounds: number): Promise<TrackInfo[]> {
  const picked: TrackInfo[] = [];
  for (let i = 0; i < rounds; i++) {
    const [track] = await loadTracksForGenre(genre, 'advanced');
    markPlayed(genre, track);
    picked.push(track);
  }
  return picked;
}

describe('selección de canciones', () => {
  test('no repite dentro de una misma partida', async () => {
    const picked = await playGame('Pop Latino', 40);
    expect(new Set(picked.map(t => t.uri)).size).toBe(40);
  });

  test('una partida nueva no repite lo que ya sonó en la anterior', async () => {
    const primera = await playGame('Pop Latino', 30);
    const segunda = await playGame('Pop Latino', 30);

    const yaSonaron = new Set(primera.map(t => t.uri));
    const repetidas = segunda.filter(t => yaSonaron.has(t.uri));
    expect(repetidas).toEqual([]);
    expect(new Set([...primera, ...segunda].map(t => t.uri)).size).toBe(60);
  });

  test('solo se reinicia cuando el género se agotó por completo', async () => {
    // Reggaetón tiene 121 temas: recién en la ronda 122 puede repetir.
    const primerCiclo = await playGame('Reggaetón', 121);
    expect(new Set(primerCiclo.map(t => t.uri)).size).toBe(121);

    // Agotado el género, el historial se reinicia solo y vuelve a sonar todo.
    const segundoCiclo = await playGame('Reggaetón', 121);
    expect(new Set(segundoCiclo.map(t => t.uri)).size).toBe(121);
  });

  test('el reinicio es por género: agotar uno no borra el historial de otro', async () => {
    const hipHop = await playGame('Hip Hop', 20);
    await playGame('Reggaetón', 130); // agota y reinicia Reggaetón

    const siguiente = await playGame('Hip Hop', 20);
    const yaSonaron = new Set(hipHop.map(t => t.uri));
    expect(siguiente.filter(t => yaSonaron.has(t.uri))).toEqual([]);
  });
});
