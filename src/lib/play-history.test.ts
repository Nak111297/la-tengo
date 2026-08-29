import { describe, test, expect, vi, beforeEach } from 'vitest';
import type { TrackInfo } from '../types';

// En Node no existe localStorage, así que estos tests lo simulan para cubrir el
// camino real del navegador (el resto de la suite ejercita el respaldo en
// memoria). vi.resetModules() vuelve a cargar el módulo desde cero, que es lo
// que pasa al refrescar la página o abrir la app de nuevo.

function fakeStorage() {
  const data = new Map<string, string>();
  return {
    store: data,
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => { data.set(k, v); },
    removeItem: (k: string) => { data.delete(k); },
  };
}

const track = (uri: string): TrackInfo => ({
  uri, name: `n-${uri}`, artist: `a-${uri}`, album: '', albumArt: '', year: 2000,
});

async function freshModule() {
  vi.resetModules();
  return await import('./play-history');
}

describe('historial persistente', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  test('lo que sonó sobrevive a recargar la app', async () => {
    const storage = fakeStorage();
    vi.stubGlobal('localStorage', storage);

    const first = await freshModule();
    first.markPlayed('Pop Latino', track('spotify:track:uno'));

    // Nueva instancia de la app, mismo navegador.
    const afterReload = await freshModule();
    expect(afterReload.isPlayed('Pop Latino', afterReload.uriToken('spotify:track:uno'))).toBe(true);

    const catalogue = [track('spotify:track:uno'), track('spotify:track:dos')];
    const pool = afterReload.unplayedOrReset('Pop Latino', catalogue, t => [afterReload.uriToken(t.uri)]);
    expect(pool.map(t => t.uri)).toEqual(['spotify:track:dos']);
  });

  test('al agotar el género se limpia el registro guardado', async () => {
    const storage = fakeStorage();
    vi.stubGlobal('localStorage', storage);

    const history = await freshModule();
    const catalogue = [track('spotify:track:uno'), track('spotify:track:dos')];
    catalogue.forEach(t => history.markPlayed('Reggaetón', t));

    const pool = history.unplayedOrReset('Reggaetón', catalogue, t => [history.uriToken(t.uri)]);
    expect(pool).toHaveLength(2); // vuelve el catálogo completo
    expect(history.isPlayed('Reggaetón', history.uriToken('spotify:track:uno'))).toBe(false);
  });

  test('si localStorage falla el juego sigue, solo pierde la persistencia', async () => {
    vi.stubGlobal('localStorage', {
      getItem: () => { throw new Error('bloqueado'); },
      setItem: () => { throw new Error('bloqueado'); },
    });

    const history = await freshModule();
    expect(() => history.markPlayed('Hip Hop', track('spotify:track:uno'))).not.toThrow();
    expect(history.isPlayed('Hip Hop', history.uriToken('spotify:track:uno'))).toBe(true);
  });
});
