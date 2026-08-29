import type { TrackInfo } from '../types';

// ---------------------------------------------------------------------------
// Historial persistente de lo que ya sonó, guardado por género.
//
// A diferencia de un filtro de partida, este sobrevive al refresh y a empezar
// un juego nuevo: un género se reinicia SOLO cuando se agotó por completo. Así
// una segunda partida arranca donde quedó la anterior en vez de volver a los
// mismos temas de siempre.
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'qr_played_history_v1';

type History = Record<string, string[]>;

// Respaldo en memoria para cuando localStorage no está disponible (modo
// privado, cuota llena): el juego sigue igual, solo pierde la persistencia.
let memoryFallback: History = {};
let useMemory = false;

function read(): History {
  if (useMemory) return memoryFallback;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as History : {};
  } catch {
    useMemory = true;
    return memoryFallback;
  }
}

function write(history: History): void {
  memoryFallback = history;
  if (useMemory) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // Cuota llena o storage bloqueado: se sigue en memoria.
    useMemory = true;
  }
}

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

// Cada canción se guarda bajo tres etiquetas porque cada camino de búsqueda
// identifica lo que encontró de forma distinta: el catálogo curado por
// artista+título, los playlists y las búsquedas por URI, y la rotación por
// artista por artista.
export function songToken(artist: string, name: string): string {
  return `s:${normalize(artist)}::${normalize(name)}`;
}

export function artistToken(artist: string): string {
  return `a:${normalize(artist)}`;
}

export function uriToken(uri: string): string {
  return `u:${uri}`;
}

export function markPlayed(genre: string, track: TrackInfo): void {
  const history = read();
  const tokens = new Set(history[genre] ?? []);
  tokens.add(uriToken(track.uri));
  tokens.add(songToken(track.artist, track.name));
  tokens.add(artistToken(track.artist));
  history[genre] = [...tokens];
  write(history);
}

/**
 * Marca un artista del catálogo como ya usado. Se necesita aparte de markPlayed
 * porque el nombre que devuelve Spotify no siempre coincide con el de la lista
 * (colaboraciones, "Los Enanitos Verdes" vs "Enanitos Verdes"), y si no
 * coincide la rotación por artista nunca se agotaría.
 */
export function markPlayedArtist(genre: string, artist: string): void {
  const history = read();
  const tokens = new Set(history[genre] ?? []);
  tokens.add(artistToken(artist));
  history[genre] = [...tokens];
  write(history);
}

export function resetGenre(genre: string): void {
  const history = read();
  delete history[genre];
  write(history);
}

export function isPlayed(genre: string, token: string): boolean {
  return (read()[genre] ?? []).includes(token);
}

/**
 * Lo que todavía no sonó en el género. Si ya sonó TODO, borra el historial del
 * género y devuelve la lista completa — ese es el único momento en que se
 * reinicia. Usar solo con el catálogo completo de un género.
 */
export function unplayedOrReset<T>(
  genre: string,
  items: readonly T[],
  tokensOf: (item: T) => string[],
): T[] {
  if (items.length === 0) return [];

  const played = new Set(read()[genre] ?? []);
  if (played.size === 0) return [...items];

  const unplayed = items.filter(item => !tokensOf(item).some(token => played.has(token)));
  if (unplayed.length > 0) return unplayed;

  resetGenre(genre);
  return [...items];
}

/**
 * Igual que unplayedOrReset pero NO reinicia el género al quedarse sin opciones.
 * Para sub-listas (los temas de un artista puntual): que un artista se quede
 * sin canciones nuevas no significa que el género entero se haya agotado.
 */
export function preferUnplayed<T>(
  genre: string,
  items: readonly T[],
  tokensOf: (item: T) => string[],
): T[] {
  const played = new Set(read()[genre] ?? []);
  if (played.size === 0) return [...items];

  const unplayed = items.filter(item => !tokensOf(item).some(token => played.has(token)));
  return unplayed.length > 0 ? unplayed : [...items];
}
