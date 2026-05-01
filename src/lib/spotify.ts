const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '';
const REDIRECT_URI = 'https://la-tengo-jpha.vercel.app';
const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-modify-playback-state',
  'user-read-playback-state',
].join(' ');

function generateRandom(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  return crypto.subtle.digest('SHA-256', encoder.encode(plain));
}

function base64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = '';
  bytes.forEach((b) => (str += String.fromCharCode(b)));
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function redirectToSpotifyAuth(): Promise<void> {
  const verifier = generateRandom(64);
  const challenge = base64url(await sha256(verifier));
  localStorage.setItem('spotify_verifier', verifier);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: challenge,
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params}`;
}

export async function handleAuthCallback(): Promise<string | null> {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (!code) return null;

  const verifier = localStorage.getItem('spotify_verifier');
  if (!verifier) return null;

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: verifier,
  });

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) return null;

  const data = await res.json();
  localStorage.setItem('spotify_token', data.access_token);
  localStorage.setItem('spotify_refresh', data.refresh_token);
  localStorage.setItem('spotify_expires', String(Date.now() + data.expires_in * 1000));
  localStorage.removeItem('spotify_verifier');

  window.history.replaceState({}, '', '/');
  return data.access_token;
}

export async function refreshToken(): Promise<string | null> {
  const refresh = localStorage.getItem('spotify_refresh');
  if (!refresh) return null;

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'refresh_token',
    refresh_token: refresh,
  });

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) return null;

  const data = await res.json();
  localStorage.setItem('spotify_token', data.access_token);
  if (data.refresh_token) localStorage.setItem('spotify_refresh', data.refresh_token);
  localStorage.setItem('spotify_expires', String(Date.now() + data.expires_in * 1000));
  return data.access_token;
}

export async function getToken(): Promise<string | null> {
  const token = localStorage.getItem('spotify_token');
  const expires = Number(localStorage.getItem('spotify_expires') || 0);

  if (token && Date.now() < expires - 60000) return token;
  return refreshToken();
}

export function clearAuth(): void {
  localStorage.removeItem('spotify_token');
  localStorage.removeItem('spotify_refresh');
  localStorage.removeItem('spotify_expires');
  localStorage.removeItem('spotify_verifier');
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('spotify_token');
}
