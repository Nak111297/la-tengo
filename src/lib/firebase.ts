/**
 * Firebase Realtime Database — REST + Server-Sent Events (no SDK).
 *
 * Required env var: VITE_FIREBASE_DATABASE_URL
 *   e.g. https://your-project-default-rtdb.firebaseio.com
 *
 * Database security rules must allow read/write on /sessions:
 *   { "rules": { "sessions": { "$s": { ".read": true, ".write": true } } } }
 */

const DB_URL = import.meta.env.VITE_FIREBASE_DATABASE_URL as string | undefined;

export function isFirebaseReady(): boolean {
  return !!DB_URL;
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 4 }, () =>
    chars[Math.floor(Math.random() * chars.length)],
  ).join('');
}

export interface SessionTeam {
  id: string;
  name: string;
  color: string;
}

// ── Host helpers ─────────────────────────────────────────────────────────────

export async function createSession(
  code: string,
  teams: SessionTeam[],
): Promise<void> {
  if (!DB_URL) return;
  await fetch(`${DB_URL}/sessions/${code}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teams, activeBuzz: null, createdAt: Date.now() }),
  });
}

export async function clearBuzz(code: string): Promise<void> {
  if (!DB_URL) return;
  await fetch(`${DB_URL}/sessions/${code}/activeBuzz.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: 'null',
  });
}

/** Listen for incoming buzzes on the host. Returns unsubscribe fn. */
export function subscribeBuzz(
  code: string,
  onBuzz: (teamIndex: number) => void,
): () => void {
  if (!DB_URL) return () => {};
  const es = new EventSource(
    `${DB_URL}/sessions/${code}/activeBuzz.json?sse=true`,
  );
  const handle = (e: MessageEvent) => {
    try {
      const payload = JSON.parse(e.data as string) as { data: unknown };
      const val = payload.data;
      if (
        val !== null &&
        typeof (val as Record<string, unknown>).teamIndex === 'number'
      ) {
        onBuzz((val as { teamIndex: number }).teamIndex);
      }
    } catch { /* ignore parse errors */ }
  };
  es.addEventListener('put', handle);
  es.addEventListener('patch', handle);
  return () => es.close();
}

// ── Player helpers ────────────────────────────────────────────────────────────

/** Subscribe to the team list on the /buzz page. */
export function subscribeTeams(
  code: string,
  onChange: (teams: SessionTeam[]) => void,
): () => void {
  if (!DB_URL) return () => {};
  const es = new EventSource(
    `${DB_URL}/sessions/${code}/teams.json?sse=true`,
  );
  const handle = (e: MessageEvent) => {
    try {
      const payload = JSON.parse(e.data as string) as { data: unknown };
      if (Array.isArray(payload.data)) onChange(payload.data as SessionTeam[]);
    } catch { /* ignore */ }
  };
  es.addEventListener('put', handle);
  return () => es.close();
}

/**
 * Send a buzz from a player phone.
 * Returns false if someone already buzzed (first-come wins).
 */
export async function sendBuzz(
  code: string,
  teamIndex: number,
): Promise<boolean> {
  if (!DB_URL) return false;
  const res = await fetch(`${DB_URL}/sessions/${code}/activeBuzz.json`);
  const current = (await res.json()) as unknown;
  if (current !== null) return false;
  await fetch(`${DB_URL}/sessions/${code}/activeBuzz.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamIndex, ts: Date.now() }),
  });
  return true;
}
