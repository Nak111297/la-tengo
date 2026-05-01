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

const GENRE_ARTISTS: Record<string, string[]> = {
  'EDM': [
    'Martin Garrix','Avicii','Calvin Harris','David Guetta','Marshmello','Zedd','Tiësto',
    'Deadmau5','Skrillex','Diplo','Kygo','The Chainsmokers','Daft Punk','Swedish House Mafia',
    'Hardwell','Afrojack','Armin van Buuren','Disclosure','Flume','Illenium','Alan Walker',
    'Odesza','Alesso','Felix Jaehn','Robin Schulz','Gryffin','Galantis','Don Diablo',
    'Nicky Romero','W&W','Dimitri Vegas','Lost Frequencies','Kungs','Topic','R3HAB',
  ],
  'Pop Latino': [
    'Shakira','Enrique Iglesias','Luis Fonsi','Ricky Martin','Carlos Vives','Juanes',
    'Marc Anthony','Jennifer Lopez','Gloria Estefan','Paulina Rubio','Thalía','Chayanne',
    'Juan Luis Guerra','Alejandro Fernández','Ricardo Arjona','Franco De Vita','Alejandro Sanz',
    'Pablo Alborán','Miguel Bosé','Diego Torres','Sin Bandera','Ha*Ash','Jesse & Joy','Reik',
    'Camila','Natalia Lafourcade','Mon Laferte','Los Ángeles Azules','Maná','Banda MS',
    'Christian Nodal','Calibre 50','La Arrolladora','Intocable','Los Tigres del Norte',
  ],
  'Reggaetón': [
    'Bad Bunny','J Balvin','Daddy Yankee','Maluma','Ozuna','Karol G','Nicky Jam',
    'Anuel AA','Farruko','Wisin','Yandel','Don Omar','Zion & Lennox','Arcángel',
    'De La Ghetto','Myke Towers','Jhay Cortez','Lunay','Sech','Rauw Alejandro',
    'Justin Quiles','El Alfa','Eladio Carrión','Gente de Zona','Alexis & Fido',
    'Plan B','Bryant Myers','Mora','Jhoni the Voice','Ñengo Flow',
    'Lenny Tavárez','Dalex','Noriel','Nio Garcia','Casper Magico',
  ],
  'Rock en Español': [
    'Maná','Soda Stereo','Juanes','Café Tacvba','Los Fabulosos Cadillacs','Molotov',
    'La Oreja de Van Gogh','Gustavo Cerati','Jarabe de Palo','Hombres G',
    'Los Enanitos Verdes','Divididos','Caifanes','Los Bunkers','Aterciopelados',
    'Bacilos','Fito Páez','Charly García','Andrés Calamaro','Bersuit Vergarabat',
    'La Renga','Héroe de Leyenda','Enrique Bunbury','Miranda!','Los Auténticos Decadentes',
    'El Tri','Patricio Rey','Heroes del Silencio','Los Rodríguez','Serú Girán',
    'Rata Blanca','Vilma Palma e Vampiros','Zoé','Kinky','Porter',
  ],
  'Pop Internacional': [
    'Ariana Grande','Taylor Swift','Ed Sheeran','Bruno Mars','Dua Lipa','The Weeknd',
    'Billie Eilish','Harry Styles','Adele','Beyoncé','Katy Perry','Lady Gaga',
    'Selena Gomez','Justin Bieber','Miley Cyrus','Sam Smith','Lizzo','Olivia Rodrigo',
    'SZA','Charlie Puth','Shawn Mendes','Camila Cabello','Halsey','Post Malone',
    'Coldplay','Maroon 5','OneRepublic','Jason Mraz','Hozier','Lewis Capaldi',
    'Doja Cat','Sabrina Carpenter','Chappell Roan','Gracie Abrams','Benson Boone',
  ],
  '2000s Hits': [
    'Usher','Rihanna','Justin Timberlake','Nelly','Beyoncé','Shakira','Alicia Keys',
    'Destiny\'s Child','Kelly Clarkson','Nelly Furtado','Fergie','Gwen Stefani',
    'Amy Winehouse','Coldplay','The Black Eyed Peas','Linkin Park','Eminem','50 Cent',
    'Kanye West','Jay-Z','Avril Lavigne','Pink','Maroon 5','Natasha Bedingfield',
    'James Blunt','Nickelback','Fall Out Boy','Paramore','My Chemical Romance','OutKast',
    'T.I.','Lil Jon','Ciara','Sean Paul','Ludacris',
  ],
  'Fiesta / Party': [
    'Pitbull','Flo Rida','Black Eyed Peas','LMFAO','Daddy Yankee','Gloria Estefan',
    'Marc Anthony','Celia Cruz','Shakira','Jennifer Lopez','Don Omar','Enrique Iglesias',
    'Sean Paul','Rihanna','Bruno Mars','Dua Lipa','Daft Punk','Pharrell Williams',
    'Robin Thicke','Nicki Minaj','DJ Snake','Major Lazer','Diplo','Bad Bunny',
    'J Balvin','Maluma','Karol G','Becky G','Anitta','Ozuna',
    'Clean Bandit','Disclosure','Mark Ronson','Lizzo','Cardi B',
  ],
  'Hip Hop': [
    'Drake','Kendrick Lamar','Eminem','Jay-Z','Lil Wayne','Post Malone','Cardi B',
    'Nicki Minaj','Travis Scott','J. Cole','21 Savage','Future','Migos','A$AP Rocky',
    'Tyler the Creator','Childish Gambino','Chance the Rapper','Big Sean','Meek Mill',
    'Lil Uzi Vert','Gunna','Young Thug','Lil Baby','DaBaby','Roddy Ricch',
    'Polo G','Jack Harlow','Kid Cudi','Logic','Mac Miller',
    'Wiz Khalifa','Snoop Dogg','Ice Cube','2Pac','Notorious B.I.G.',
  ],
  'R&B': [
    'Beyoncé','Rihanna','Usher','Alicia Keys','John Legend','The Weeknd','Mary J. Blige',
    'Ne-Yo','Chris Brown','Frank Ocean','Miguel','H.E.R.','Jhené Aiko','SZA',
    'Normani','Tinashe','Ella Mai','Summer Walker','Brent Faiyaz','Daniel Caesar',
    'Lucky Daye','Giveon','6LACK','Khalid','Kehlani','Jorja Smith',
    'Victoria Monét','Ari Lennox','Teyana Taylor','Ciara','Trey Songz',
    'Tank','Monica','Brandy','Maxwell','D\'Angelo',
  ],
  '80s Hits': [
    'Michael Jackson','Madonna','Prince','Whitney Houston','Cyndi Lauper','George Michael',
    'a-ha','Duran Duran','Bon Jovi','Bruce Springsteen','The Police','U2',
    'Depeche Mode','New Order','The Cure','Tears for Fears','Wham!','Culture Club',
    'Rick Springfield','Pat Benatar','Fleetwood Mac','Toto','Hall & Oates',
    'Lionel Richie','Phil Collins','Peter Gabriel','Dire Straits','R.E.M.',
    'Talking Heads','Simple Minds','The Bangles','Eurythmics','Billy Joel',
    'Elton John','David Bowie',
  ],
  '90s Hits': [
    'Backstreet Boys','Britney Spears','Spice Girls','Nirvana','Mariah Carey','TLC',
    'No Doubt','Destiny\'s Child','Boyz II Men','Whitney Houston','Celine Dion',
    'Alanis Morissette','Sheryl Crow','Ace of Base','Roxette','Savage Garden',
    'Aqua','Brandy','Monica','N\'Sync','98 Degrees','Barenaked Ladies',
    'Matchbox Twenty','Third Eye Blind','Counting Crows','Goo Goo Dolls',
    'Smashing Pumpkins','Pearl Jam','Soundgarden','Green Day','Oasis',
    'R. Kelly','Aaliyah','En Vogue','SWV','Toni Braxton',
  ],
};

export async function loadTracksForGenre(genre: string): Promise<TrackInfo[]> {
  const token = await getToken();
  if (!token) throw new Error('No Spotify token');

  const allArtists = GENRE_ARTISTS[genre];
  if (!allArtists) throw new Error(`Género no configurado: ${genre}`);

  // Pick 3 different random artists — 3 parallel requests is safe from rate limiting
  const picked = shuffleArray(allArtists).slice(0, 3);

  type RawTrack = {
    uri: string; name: string; popularity: number;
    artists: { name: string }[];
    album: { name: string; images: { url: string }[]; release_date: string };
  };

  const pages = await Promise.all(
    picked.map(artist =>
      fetch(
        `https://api.spotify.com/v1/search?${new URLSearchParams({ q: artist, type: 'track' })}`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
        .then(r => r.ok ? r.json() : { tracks: { items: [] } })
        .catch(() => ({ tracks: { items: [] } })),
    ),
  );

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

  const top = all.sort((a, b) => b.popularity - a.popularity).slice(0, 30);
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
