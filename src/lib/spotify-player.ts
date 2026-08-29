import { getToken } from './spotify';
import { EXTRA_GENRE_SONGS_CLASSICS } from './genre-songs-extra-classics';
import { EXTRA_GENRE_SONGS_LATIN } from './genre-songs-extra-latin';
import { EXTRA_GENRE_SONGS_PARTY } from './genre-songs-extra-party';
import { EXTRA_GENRE_SONGS_POP } from './genre-songs-extra-pop';
import type { TrackInfo } from '../types';

type SelectedDeviceId = string | null;

let deviceId: SelectedDeviceId | undefined;

export interface SpotifyDevice {
  id: string | null;
  name: string;
  type: string;
  is_active: boolean;
}

export async function getDevices(): Promise<SpotifyDevice[]> {
  const token = await getToken();
  if (!token) return [];
  const headers = { Authorization: `Bearer ${token}` };
  const [devicesRes, playbackRes] = await Promise.all([
    fetch('https://api.spotify.com/v1/me/player/devices', { headers, cache: 'no-store' }),
    fetch('https://api.spotify.com/v1/me/player', { headers, cache: 'no-store' }),
  ]);

  const devices: SpotifyDevice[] = devicesRes.ok ? (await devicesRes.json()).devices ?? [] : [];
  if (playbackRes.ok && playbackRes.status !== 204) {
    const playback = await playbackRes.json();
    const activeDevice = playback?.device as SpotifyDevice | undefined;
    const hasActiveDevice = activeDevice && (
      activeDevice.id
        ? devices.some(device => device.id === activeDevice.id)
        : devices.some(device => device.is_active && device.name === activeDevice.name && device.type === activeDevice.type)
    );
    if (activeDevice && !hasActiveDevice) {
      devices.unshift(activeDevice);
    }
  }

  return devices;
}

export function selectDevice(id: SelectedDeviceId): void {
  deviceId = id;
}

export function isPlayerReady(): boolean {
  return deviceId !== undefined;
}

// ---------------------------------------------------------------------------
// Curated song lists — random picked in-app, one Spotify search resolves URI
// ---------------------------------------------------------------------------

type SongEntry = { name: string; artist: string; year: number };
type GenreSongs = Record<string, SongEntry[]>;

const BASE_GENRE_SONGS: GenreSongs = {
  'EDM': [
    {name:'Levels',                          artist:'Avicii',              year:2011},
    {name:'Wake Me Up',                      artist:'Avicii',              year:2013},
    {name:'Hey Brother',                     artist:'Avicii',              year:2013},
    {name:'Animals',                         artist:'Martin Garrix',       year:2013},
    {name:'In the Name of Love',             artist:'Martin Garrix',       year:2016},
    {name:'Scared to Be Lonely',             artist:'Martin Garrix',       year:2017},
    {name:'Summer',                          artist:'Calvin Harris',       year:2014},
    {name:'Feel So Close',                   artist:'Calvin Harris',       year:2012},
    {name:'This Is What You Came For',       artist:'Calvin Harris',       year:2016},
    {name:'Titanium',                        artist:'David Guetta',        year:2011},
    {name:'Sexy Bitch',                      artist:'David Guetta',        year:2009},
    {name:'Memories',                        artist:'David Guetta',        year:2009},
    {name:'Faded',                           artist:'Alan Walker',         year:2015},
    {name:'Alone',                           artist:'Alan Walker',         year:2016},
    {name:'How Deep Is Your Love',           artist:'Calvin Harris & Disciples',year:2015},
    {name:'Closer',                          artist:'The Chainsmokers',    year:2016},
    {name:'Something Just Like This',        artist:'The Chainsmokers',    year:2017},
    {name:'Don\'t Let Me Down',              artist:'The Chainsmokers',    year:2016},
    {name:'Clarity',                         artist:'Zedd',                year:2012},
    {name:'Break Free',                      artist:'Ariana Grande & Zedd',year:2014},
    {name:'Stay the Night',                  artist:'Zedd',                year:2014},
    {name:'Beautiful Now',                   artist:'Zedd',                year:2015},
    {name:'Alone',                           artist:'Marshmello',          year:2016},
    {name:'Rather Be',                       artist:'Clean Bandit',        year:2014},
    {name:'Prayer in C',                     artist:'Lilly Wood and The Prick & Robin Schulz',year:2014},
    {name:'Silence',                         artist:'Marshmello',          year:2017},
    {name:'Firestone',                       artist:'Kygo',                year:2014},
    {name:'Stole the Show',                  artist:'Kygo',                year:2015},
    {name:'It Ain\'t Me',                    artist:'Kygo',                year:2017},
    {name:'One More Time',                   artist:'Daft Punk',           year:2000},
    {name:'Get Lucky',                       artist:'Daft Punk',           year:2013},
    {name:'Harder Better Faster Stronger',   artist:'Daft Punk',           year:2001},
    {name:'Lean On',                         artist:'Major Lazer',         year:2015},
    {name:'Cold Water',                      artist:'Major Lazer',         year:2016},
    {name:'Red Lights',                      artist:'Tiësto',              year:2012},
    {name:'Wasted',                          artist:'Tiësto',              year:2014},
    {name:'Save the World',                  artist:'Swedish House Mafia', year:2011},
    {name:'Bangarang',                       artist:'Skrillex',            year:2011},
    {name:'Don\'t You Worry Child',          artist:'Swedish House Mafia', year:2012},
    {name:'Greyhound',                       artist:'Swedish House Mafia', year:2012},
    {name:'Ghost n Stuff',                   artist:'Deadmau5',            year:2008},
  ],

  'Pop Latino': [
    {name:'Despacito',                       artist:'Luis Fonsi',          year:2017},
    {name:'Échame La Culpa',                 artist:'Luis Fonsi',          year:2017},
    {name:'Amor Secreto',                    artist:'Luis Fonsi',          year:2002},
    {name:'Hips Don\'t Lie',                 artist:'Shakira',             year:2006},
    {name:'Waka Waka',                       artist:'Shakira',             year:2010},
    {name:'La Tortura',                      artist:'Shakira',             year:2005},
    {name:'Hero',                            artist:'Enrique Iglesias',    year:2001},
    {name:'Bailamos',                        artist:'Enrique Iglesias',    year:1999},
    {name:'Bailando',                        artist:'Enrique Iglesias',    year:2014},
    {name:'La Copa de la Vida',              artist:'Ricky Martin',        year:1998},
    {name:'Livin\' la Vida Loca',            artist:'Ricky Martin',        year:1999},
    {name:'María',                           artist:'Ricky Martin',        year:1995},
    {name:'La Bicicleta',                    artist:'Carlos Vives',        year:2016},
    {name:'La Camisa Negra',                 artist:'Juanes',              year:2004},
    {name:'A Dios le Pido',                  artist:'Juanes',              year:2002},
    {name:'Ojalá que Llueva Café',           artist:'Juan Luis Guerra',    year:1990},
    {name:'La Bilirrubina',                  artist:'Juan Luis Guerra',    year:1990},
    {name:'Burbujas de Amor',                artist:'Juan Luis Guerra',    year:1990},
    {name:'Vivir Mi Vida',                   artist:'Marc Anthony',        year:2013},
    {name:'Valió la Pena',                   artist:'Marc Anthony',        year:2001},
    {name:'I Need to Know',                  artist:'Marc Anthony',        year:1999},
    {name:'On the Floor',                    artist:'Jennifer Lopez',      year:2011},
    {name:'Let\'s Get Loud',                 artist:'Jennifer Lopez',      year:1999},
    {name:'Amor Amor Amor',                  artist:'Jennifer Lopez',      year:2017},
    {name:'Conga',                           artist:'Gloria Estefan',      year:1985},
    {name:'Get On Your Feet',                artist:'Gloria Estefan',      year:1989},
    {name:'Rhythm Is Gonna Get You',         artist:'Gloria Estefan',      year:1987},
    {name:'Ni Tú ni Yo',                     artist:'Jenni Rivera',        year:2009},
    {name:'Me Gustas Tú',                    artist:'Manu Chao',           year:2001},
    {name:'Amor Prohibido',                  artist:'Selena',              year:1994},
    {name:'Como la Flor',                    artist:'Selena',              year:1992},
    {name:'Bidi Bidi Bom Bom',               artist:'Selena',              year:1994},
    {name:'Quiero Más',                      artist:'Thalia',              year:2003},
    {name:'No Me Enseñaste',                 artist:'Thalia',              year:2001},
    {name:'Te Presumo',                      artist:'Thalia',              year:2009},
    {name:'Nuestro Amor Eterno',             artist:'Chayanne',            year:2000},
    {name:'Me Enamoré de Ti',                artist:'Chayanne',            year:1999},
    {name:'Salomé',                          artist:'Chayanne',            year:1998},
    {name:'Un Verano Sin Ti',                artist:'Bad Bunny',           year:2022},
    {name:'Ojala',                           artist:'Silvio Rodríguez',    year:1969},
    {name:'No Soy el Aire',                  artist:'Ricardo Arjona',      year:2002},
    {name:'Historia de Taxi',                artist:'Ricardo Arjona',      year:1994},
  ],

  'Reggaetón': [
    {name:'Gasolina',                        artist:'Daddy Yankee',        year:2004},
    {name:'Con Calma',                       artist:'Daddy Yankee',        year:2019},
    {name:'Despacito',                       artist:'Luis Fonsi',          year:2017},
    {name:'Mi Gente',                        artist:'J Balvin',            year:2017},
    {name:'Ay Vamos',                        artist:'J Balvin',            year:2014},
    {name:'Dakiti',                          artist:'Bad Bunny',           year:2020},
    {name:'Tití Me Preguntó',                artist:'Bad Bunny',           year:2022},
    {name:'Me Porto Bonito',                 artist:'Bad Bunny',           year:2022},
    {name:'Hawái',                           artist:'Maluma',              year:2020},
    {name:'Felices los 4',                   artist:'Maluma',              year:2017},
    {name:'Borró Cassette',                  artist:'Maluma',              year:2016},
    {name:'Tusa',                            artist:'Karol G',             year:2019},
    {name:'Bichota',                         artist:'Karol G',             year:2020},
    {name:'Provenza',                        artist:'Karol G',             year:2022},
    {name:'X',                               artist:'Nicky Jam',           year:2017},
    {name:'El Perdón',                       artist:'Nicky Jam',           year:2015},
    {name:'Hasta el Amanecer',               artist:'Nicky Jam',           year:2016},
    {name:'Danza Kuduro',                    artist:'Don Omar',            year:2010},
    {name:'Dutty Love',                      artist:'Don Omar',            year:2012},
    {name:'Pierdo la Cabeza',                artist:'Zion & Lennox',       year:2016},
    {name:'La Modelo',                       artist:'Ozuna',               year:2017},
    {name:'Taki Taki',                       artist:'DJ Snake',            year:2018},
    {name:'Lean On',                         artist:'Major Lazer',         year:2015},
    {name:'China',                           artist:'Anuel AA',            year:2018},
    {name:'Secreto',                         artist:'Anuel AA',            year:2019},
    {name:'Pepas',                           artist:'Farruko',             year:2021},
    {name:'Chantaje',                        artist:'Shakira',             year:2016},
    {name:'Rakata',                          artist:'Wisin & Yandel',      year:2005},
    {name:'Bandida',                         artist:'Myke Towers',         year:2020},
    {name:'Te Boté',                         artist:'Nio Garcia',          year:2018},
    {name:'Informer',                        artist:'Sech',                year:2019},
    {name:'Relación',                        artist:'Sech',                year:2019},
  ],

  'Rock en Español': [
    {name:'Rayando el Sol',                  artist:'Maná',                year:1994},
    {name:'En el Muelle de San Blás',        artist:'Maná',                year:1994},
    {name:'De Música Ligera',                artist:'Soda Stereo',         year:1990},
    {name:'Persiana Americana',              artist:'Soda Stereo',         year:1987},
    {name:'La Ciudad de la Furia',           artist:'Soda Stereo',         year:1988},
    {name:'La Camisa Negra',                 artist:'Juanes',              year:2004},
    {name:'Me Enamora',                      artist:'Juanes',              year:2007},
    {name:'A Dios le Pido',                  artist:'Juanes',              year:2002},
    {name:'Eres',                            artist:'Café Tacvba',         year:1994},
    {name:'Matador',                         artist:'Los Fabulosos Cadillacs',year:1994},
    {name:'Gimme tha Power',                 artist:'Molotov',             year:1997},
    {name:'Frijolero',                       artist:'Molotov',             year:2003},
    {name:'Estoy Aquí',                      artist:'Shakira',             year:1995},
    {name:'Antología',                       artist:'Shakira',             year:1995},
    {name:'Ojos Así',                        artist:'Shakira',             year:1998},
    {name:'Corazón Partío',                  artist:'Alejandro Sanz',      year:1997},
    {name:'La Tortura',                      artist:'Alejandro Sanz',      year:2005},
    {name:'No Es lo Mismo',                  artist:'Alejandro Sanz',      year:2003},
    {name:'Cómo Te Atreves',                 artist:'Morat',               year:2016},
    {name:'No Se Va',                        artist:'Morat',               year:2018},
    {name:'Mentirosa',                       artist:'Elefante',            year:2001},
    {name:'Durmiendo con la Luna',           artist:'Elefante',            year:2001},
    {name:'Todo Cambia',                     artist:'Jarabe de Palo',      year:2007},
    {name:'La Flaca',                        artist:'Jarabe de Palo',      year:1996},
    {name:'Depende',                         artist:'Jarabe de Palo',      year:2001},
    {name:'Promiscua',                       artist:'Miranda!',            year:2004},
    {name:'Don',                             artist:'Miranda!',            year:2004},
    {name:'Perfecta',                        artist:'Miranda!',            year:2005},
    {name:'Obsesión',                        artist:'Aventura',            year:2002},
    {name:'11 y 6',                          artist:'Fito Páez',           year:1988},
    {name:'Lamento Boliviano',               artist:'Los Enanitos Verdes', year:1992},
    {name:'El Extraño de Pelo Largo',        artist:'Los Náufragos',       year:1970},
  ],

  'Pop Internacional': [
    {name:'Blinding Lights',                 artist:'The Weeknd',          year:2020},
    {name:'Starboy',                         artist:'The Weeknd',          year:2016},
    {name:'Can\'t Feel My Face',             artist:'The Weeknd',          year:2015},
    {name:'Shape of You',                    artist:'Ed Sheeran',          year:2017},
    {name:'Perfect',                         artist:'Ed Sheeran',          year:2017},
    {name:'Thinking Out Loud',               artist:'Ed Sheeran',          year:2014},
    {name:'Bad Guy',                         artist:'Billie Eilish',       year:2019},
    {name:'Therefore I Am',                  artist:'Billie Eilish',       year:2020},
    {name:'Happier Than Ever',               artist:'Billie Eilish',       year:2021},
    {name:'Watermelon Sugar',                artist:'Harry Styles',        year:2020},
    {name:'As It Was',                       artist:'Harry Styles',        year:2022},
    {name:'Golden',                          artist:'Harry Styles',        year:2020},
    {name:'Thank U Next',                    artist:'Ariana Grande',       year:2018},
    {name:'7 Rings',                         artist:'Ariana Grande',       year:2019},
    {name:'Problem',                         artist:'Ariana Grande',       year:2014},
    {name:'Levitating',                      artist:'Dua Lipa',            year:2020},
    {name:'Don\'t Start Now',                artist:'Dua Lipa',            year:2019},
    {name:'New Rules',                       artist:'Dua Lipa',            year:2017},
    {name:'Shake It Off',                    artist:'Taylor Swift',        year:2014},
    {name:'Blank Space',                     artist:'Taylor Swift',        year:2014},
    {name:'Love Story',                      artist:'Taylor Swift',        year:2008},
    {name:'Uptown Funk',                     artist:'Bruno Mars',          year:2014},
    {name:'Just the Way You Are',            artist:'Bruno Mars',          year:2010},
    {name:'Grenade',                         artist:'Bruno Mars',          year:2010},
    {name:'Rolling in the Deep',             artist:'Adele',               year:2010},
    {name:'Someone Like You',                artist:'Adele',               year:2011},
    {name:'Hello',                           artist:'Adele',               year:2015},
    {name:'Roar',                            artist:'Katy Perry',          year:2013},
    {name:'Firework',                        artist:'Katy Perry',          year:2010},
    {name:'Teenage Dream',                   artist:'Katy Perry',          year:2010},
    {name:'Poker Face',                      artist:'Lady Gaga',           year:2008},
    {name:'Bad Romance',                     artist:'Lady Gaga',           year:2009},
    {name:'Just Dance',                      artist:'Lady Gaga',           year:2008},
    {name:'Flowers',                         artist:'Miley Cyrus',         year:2023},
    {name:'Wrecking Ball',                   artist:'Miley Cyrus',         year:2013},
    {name:'Unstoppable',                     artist:'Sia',                 year:2016},
    {name:'Chandelier',                      artist:'Sia',                 year:2014},
    {name:'Cheap Thrills',                   artist:'Sia',                 year:2016},
    {name:'Stay',                            artist:'Justin Bieber',       year:2021},
    {name:'Love Yourself',                   artist:'Justin Bieber',       year:2015},
    {name:'Sorry',                           artist:'Justin Bieber',       year:2015},
  ],

  '2000s Hits': [
    {name:'Yeah!',                           artist:'Usher',               year:2004},
    {name:'Burn',                            artist:'Usher',               year:2004},
    {name:'My Boo',                          artist:'Usher',               year:2004},
    {name:'Umbrella',                        artist:'Rihanna',             year:2007},
    {name:'Don\'t Stop the Music',           artist:'Rihanna',             year:2007},
    {name:'Disturbia',                       artist:'Rihanna',             year:2008},
    {name:'SexyBack',                        artist:'Justin Timberlake',   year:2006},
    {name:'Cry Me a River',                  artist:'Justin Timberlake',   year:2002},
    {name:'Rock Your Body',                  artist:'Justin Timberlake',   year:2003},
    {name:'Hot in Herre',                    artist:'Nelly',               year:2002},
    {name:'Dilemma',                         artist:'Nelly',               year:2002},
    {name:'Crazy in Love',                   artist:'Beyoncé',             year:2003},
    {name:'Halo',                            artist:'Beyoncé',             year:2008},
    {name:'Single Ladies',                   artist:'Beyoncé',             year:2008},
    {name:'Fallin\'',                        artist:'Alicia Keys',         year:2001},
    {name:'No One',                          artist:'Alicia Keys',         year:2007},
    {name:'If You Had My Love',              artist:'Jennifer Lopez',      year:1999},
    {name:'Jenny from the Block',            artist:'Jennifer Lopez',      year:2002},
    {name:'Say My Name',                     artist:'Destiny\'s Child',    year:1999},
    {name:'Survivor',                        artist:'Destiny\'s Child',    year:2001},
    {name:'Bootylicious',                    artist:'Destiny\'s Child',    year:2001},
    {name:'Since U Been Gone',               artist:'Kelly Clarkson',      year:2004},
    {name:'Breakaway',                       artist:'Kelly Clarkson',      year:2004},
    {name:'Promiscuous',                     artist:'Nelly Furtado',       year:2006},
    {name:'Maneater',                        artist:'Nelly Furtado',       year:2006},
    {name:'Fergalicious',                    artist:'Fergie',              year:2006},
    {name:'Big Girls Don\'t Cry',            artist:'Fergie',              year:2007},
    {name:'Complicated',                     artist:'Avril Lavigne',       year:2002},
    {name:'Sk8er Boi',                       artist:'Avril Lavigne',       year:2002},
    {name:'Girlfriend',                      artist:'Avril Lavigne',       year:2007},
    {name:'Who Knew',                        artist:'Pink',                year:2006},
    {name:'Just Give Me a Reason',           artist:'Pink',                year:2012},
    {name:'Rehab',                           artist:'Amy Winehouse',       year:2006},
    {name:'Valerie',                         artist:'Amy Winehouse',       year:2006},
    {name:'Clocks',                          artist:'Coldplay',            year:2002},
    {name:'The Scientist',                   artist:'Coldplay',            year:2002},
    {name:'Yellow',                          artist:'Coldplay',            year:2000},
    {name:'Harder to Breathe',               artist:'Maroon 5',            year:2002},
    {name:'She Will Be Loved',               artist:'Maroon 5',            year:2004},
    {name:'In the End',                      artist:'Linkin Park',         year:2000},
    {name:'Numb',                            artist:'Linkin Park',         year:2003},
    {name:'Crawling',                        artist:'Linkin Park',         year:2000},
    {name:'In da Club',                      artist:'50 Cent',             year:2003},
    {name:'Get Low',                         artist:'Lil Jon',             year:2003},
    {name:'Tom\'s Diner',                    artist:'Suzanne Vega',        year:2002},
    {name:'What\'s Luv?',                    artist:'Fat Joe',             year:2002},
  ],

  '2010s Hits': [
    {name:'Rolling in the Deep',             artist:'Adele',                year:2010},
    {name:'Someone Like You',                artist:'Adele',                year:2011},
    {name:'Hello',                           artist:'Adele',                year:2015},
    {name:'Firework',                        artist:'Katy Perry',           year:2010},
    {name:'Teenage Dream',                   artist:'Katy Perry',           year:2010},
    {name:'Roar',                            artist:'Katy Perry',           year:2013},
    {name:'Born This Way',                   artist:'Lady Gaga',            year:2011},
    {name:'Shallow',                         artist:'Lady Gaga',            year:2018},
    {name:'Just the Way You Are',            artist:'Bruno Mars',           year:2010},
    {name:'Locked Out of Heaven',            artist:'Bruno Mars',           year:2012},
    {name:'Uptown Funk',                     artist:'Bruno Mars',           year:2014},
    {name:'Moves Like Jagger',               artist:'Maroon 5',             year:2011},
    {name:'Payphone',                        artist:'Maroon 5',             year:2012},
    {name:'Somebody That I Used to Know',    artist:'Gotye',                year:2011},
    {name:'Call Me Maybe',                   artist:'Carly Rae Jepsen',     year:2012},
    {name:'Gangnam Style',                   artist:'PSY',                  year:2012},
    {name:'Radioactive',                     artist:'Imagine Dragons',      year:2012},
    {name:'Demons',                          artist:'Imagine Dragons',      year:2013},
    {name:'Thrift Shop',                     artist:'Macklemore',           year:2012},
    {name:'Blurred Lines',                   artist:'Robin Thicke',         year:2013},
    {name:'Happy',                           artist:'Pharrell Williams',    year:2013},
    {name:'Royals',                          artist:'Lorde',                year:2013},
    {name:'Counting Stars',                  artist:'OneRepublic',          year:2013},
    {name:'Mirrors',                         artist:'Justin Timberlake',    year:2013},
    {name:'Can\'t Stop the Feeling',         artist:'Justin Timberlake',    year:2016},
    {name:'Shake It Off',                    artist:'Taylor Swift',         year:2014},
    {name:'Blank Space',                     artist:'Taylor Swift',         year:2014},
    {name:'Bad Blood',                       artist:'Taylor Swift',         year:2015},
    {name:'Chandelier',                      artist:'Sia',                  year:2014},
    {name:'Cheap Thrills',                   artist:'Sia',                  year:2016},
    {name:'Thinking Out Loud',               artist:'Ed Sheeran',           year:2014},
    {name:'Shape of You',                    artist:'Ed Sheeran',           year:2017},
    {name:'Perfect',                         artist:'Ed Sheeran',           year:2017},
    {name:'Take Me to Church',               artist:'Hozier',               year:2013},
    {name:'Stressed Out',                    artist:'Twenty One Pilots',    year:2015},
    {name:'Ride',                            artist:'Twenty One Pilots',    year:2015},
    {name:'Can\'t Feel My Face',             artist:'The Weeknd',           year:2015},
    {name:'Starboy',                         artist:'The Weeknd',           year:2016},
    {name:'Blinding Lights',                 artist:'The Weeknd',           year:2019},
    {name:'Love Yourself',                   artist:'Justin Bieber',        year:2015},
    {name:'Sorry',                           artist:'Justin Bieber',        year:2015},
    {name:'What Makes You Beautiful',        artist:'One Direction',        year:2011},
    {name:'Story of My Life',                artist:'One Direction',        year:2013},
    {name:'Hotline Bling',                   artist:'Drake',                year:2015},
    {name:'One Dance',                       artist:'Drake',                year:2016},
    {name:"God's Plan",                      artist:'Drake',                year:2018},
    {name:'Humble',                          artist:'Kendrick Lamar',       year:2017},
    {name:'See You Again',                   artist:'Wiz Khalifa',          year:2015},
    {name:'Thank U Next',                    artist:'Ariana Grande',        year:2018},
    {name:'7 Rings',                         artist:'Ariana Grande',        year:2019},
    {name:'New Rules',                       artist:'Dua Lipa',             year:2017},
    {name:'Old Town Road',                   artist:'Lil Nas X',            year:2019},
    {name:'Bad Guy',                         artist:'Billie Eilish',        year:2019},
    {name:'Señorita',                        artist:'Shawn Mendes',         year:2019},
  ],

  'Fiesta / Party': [
    {name:'Give Me Everything',              artist:'Pitbull',             year:2011},
    {name:'Timber',                          artist:'Pitbull',             year:2013},
    {name:'Right Round',                     artist:'Flo Rida',            year:2009},
    {name:'Whistle',                         artist:'Flo Rida',            year:2012},
    {name:'I Gotta Feeling',                 artist:'Black Eyed Peas',     year:2009},
    {name:'Boom Boom Pow',                   artist:'Black Eyed Peas',     year:2009},
    {name:'Party Rock Anthem',               artist:'LMFAO',               year:2011},
    {name:'Sexy and I Know It',              artist:'LMFAO',               year:2011},
    {name:'Shots',                           artist:'LMFAO',               year:2009},
    {name:'Get the Party Started',           artist:'Pink',                year:2001},
    {name:'Gasolina',                        artist:'Daddy Yankee',        year:2004},
    {name:'Temperature',                     artist:'Sean Paul',           year:2005},
    {name:'On the Floor',                    artist:'Jennifer Lopez',      year:2011},
    {name:'Conga',                           artist:'Gloria Estefan',      year:1985},
    {name:'La Bamba',                        artist:'Los Lobos',           year:1987},
    {name:'Jump',                            artist:'Kris Kross',          year:1992},
    {name:'Bailando',                        artist:'Enrique Iglesias',    year:2014},
    {name:'Chantaje',                        artist:'Shakira',             year:2016},
    {name:'Mi Gente',                        artist:'J Balvin',            year:2017},
    {name:'Con Calma',                       artist:'Daddy Yankee',        year:2019},
    {name:'Lean On',                         artist:'Major Lazer',         year:2015},
    {name:'Run the World (Girls)',           artist:'Beyoncé',             year:2011},
    {name:'Sorry',                           artist:'Justin Bieber',       year:2015},
    {name:'Can\'t Stop the Feeling',         artist:'Justin Timberlake',   year:2016},
    {name:'Uptown Funk',                     artist:'Bruno Mars',          year:2014},
    {name:'24K Magic',                       artist:'Bruno Mars',          year:2016},
    {name:'Locked Out of Heaven',            artist:'Bruno Mars',          year:2012},
    {name:'Cheap Thrills',                   artist:'Sia',                 year:2016},
    {name:'Happy',                           artist:'Pharrell Williams',   year:2013},
    {name:'Blurred Lines',                   artist:'Robin Thicke',        year:2013},
    {name:'Turn Me On',                      artist:'David Guetta',        year:2011},
    {name:'Let\'s Groove',                   artist:'Earth Wind & Fire',   year:1981},
    {name:'September',                       artist:'Earth Wind & Fire',   year:1978},
    {name:'We Are Family',                   artist:'Sister Sledge',       year:1979},
    {name:'Taki Taki',                       artist:'DJ Snake',            year:2018},
    {name:'MIA',                             artist:'Bad Bunny',           year:2018},
    {name:'Hawái',                           artist:'Maluma',              year:2020},
    {name:'Tusa',                            artist:'Karol G',             year:2019},
    {name:'Pepas',                           artist:'Farruko',             year:2021},
    {name:'Boom Boom',                       artist:'RedOne',              year:2015},
  ],

  'Hip Hop': [
    {name:'God\'s Plan',                     artist:'Drake',               year:2018},
    {name:'Hotline Bling',                   artist:'Drake',               year:2015},
    {name:'One Dance',                       artist:'Drake',               year:2016},
    {name:'Humble',                          artist:'Kendrick Lamar',      year:2017},
    {name:'Alright',                         artist:'Kendrick Lamar',      year:2015},
    {name:'Lose Yourself',                   artist:'Eminem',              year:2002},
    {name:'Without Me',                      artist:'Eminem',              year:2002},
    {name:'The Real Slim Shady',             artist:'Eminem',              year:2000},
    {name:'SICKO MODE',                      artist:'Travis Scott',        year:2018},
    {name:'Goosebumps',                      artist:'Travis Scott',        year:2016},
    {name:'Rockstar',                        artist:'Post Malone',         year:2017},
    {name:'Sunflower',                       artist:'Post Malone',         year:2018},
    {name:'Circles',                         artist:'Post Malone',         year:2019},
    {name:'Bodak Yellow',                    artist:'Cardi B',             year:2017},
    {name:'I Like It',                       artist:'Cardi B',             year:2018},
    {name:'WAP',                             artist:'Cardi B',             year:2020},
    {name:'Super Bass',                      artist:'Nicki Minaj',         year:2010},
    {name:'Starships',                       artist:'Nicki Minaj',         year:2012},
    {name:'Anaconda',                        artist:'Nicki Minaj',         year:2014},
    {name:'In da Club',                      artist:'50 Cent',             year:2003},
    {name:'Just a Lil Bit',                  artist:'50 Cent',             year:2005},
    {name:'Gold Digger',                     artist:'Kanye West',          year:2005},
    {name:'Stronger',                        artist:'Kanye West',          year:2007},
    {name:'Power',                           artist:'Kanye West',          year:2010},
    {name:'99 Problems',                     artist:'Jay-Z',               year:2003},
    {name:'Empire State of Mind',            artist:'Jay-Z',               year:2009},
    {name:'Lollipop',                        artist:'Lil Wayne',           year:2008},
    {name:'A Milli',                         artist:'Lil Wayne',           year:2008},
    {name:'6 Foot 7 Foot',                   artist:'Lil Wayne',           year:2010},
    {name:'The Box',                         artist:'Roddy Ricch',         year:2019},
    {name:'Essence',                         artist:'Wizkid',              year:2020},
    {name:'Location',                        artist:'Khalid',              year:2017},
    {name:'Young Dumb & Broke',              artist:'Khalid',              year:2017},
    {name:'Magnolia',                        artist:'Playboi Carti',       year:2017},
    {name:'Bad and Boujee',                  artist:'Migos',               year:2016},
    {name:'Walk It Talk It',                 artist:'Migos',               year:2018},
    {name:'Lucid Dreams',                    artist:'Juice WRLD',          year:2018},
    {name:'All Girls Are the Same',          artist:'Juice WRLD',          year:2018},
    {name:'Mo Bamba',                        artist:'Sheck Wes',           year:2017},
    {name:'Thotiana',                        artist:'Blueface',            year:2018},
    {name:'Highest in the Room',             artist:'Travis Scott',        year:2019},
  ],

  'R&B': [
    {name:'Crazy in Love',                   artist:'Beyoncé',             year:2003},
    {name:'Halo',                            artist:'Beyoncé',             year:2008},
    {name:'Irreplaceable',                   artist:'Beyoncé',             year:2006},
    {name:'Umbrella',                        artist:'Rihanna',             year:2007},
    {name:'Diamonds',                        artist:'Rihanna',             year:2012},
    {name:'Stay',                            artist:'Rihanna',             year:2012},
    {name:'Yeah!',                           artist:'Usher',               year:2004},
    {name:'Burn',                            artist:'Usher',               year:2004},
    {name:'No One',                          artist:'Alicia Keys',         year:2007},
    {name:'Fallin\'',                        artist:'Alicia Keys',         year:2001},
    {name:'If I Ain\'t Got You',             artist:'Alicia Keys',         year:2003},
    {name:'All of Me',                       artist:'John Legend',         year:2013},
    {name:'Ordinary People',                 artist:'John Legend',         year:2004},
    {name:'Earned It',                       artist:'The Weeknd',          year:2015},
    {name:'The Hills',                       artist:'The Weeknd',          year:2015},
    {name:'Starboy',                         artist:'The Weeknd',          year:2016},
    {name:'Family Portrait',                 artist:'Pink',                year:2003},
    {name:'Real Love',                       artist:'Mary J. Blige',       year:1992},
    {name:'Be Without You',                  artist:'Mary J. Blige',       year:2005},
    {name:'So Sick',                         artist:'Ne-Yo',               year:2006},
    {name:'Because of You',                  artist:'Ne-Yo',               year:2007},
    {name:'Closer',                          artist:'Ne-Yo',               year:2008},
    {name:'With You',                        artist:'Chris Brown',         year:2007},
    {name:'No Guidance',                     artist:'Chris Brown',         year:2019},
    {name:'Forever',                         artist:'Chris Brown',         year:2008},
    {name:'Thinking About You',              artist:'Frank Ocean',         year:2012},
    {name:'Lost',                            artist:'Frank Ocean',         year:2012},
    {name:'Good Days',                       artist:'SZA',                 year:2021},
    {name:'Kill Bill',                       artist:'SZA',                 year:2022},
    {name:'Love Galore',                     artist:'SZA',                 year:2017},
    {name:'Essence',                         artist:'Wizkid',              year:2020},
    {name:'Location',                        artist:'Khalid',              year:2017},
    {name:'Talk',                            artist:'Khalid',              year:2019},
    {name:'Better',                          artist:'Khalid',              year:2018},
    {name:'Slow Motion',                     artist:'Trey Songz',          year:2009},
    {name:'Can\'t Help Falling in Love',     artist:'Elvis Presley',       year:1961},
    {name:'Say So',                          artist:'Doja Cat',            year:2019},
    {name:'Kiss Me More',                    artist:'Doja Cat',            year:2021},
    {name:'Treat You Better',                artist:'Shawn Mendes',        year:2016},
    {name:'Señorita',                        artist:'Shawn Mendes',        year:2019},
    {name:'Golden',                          artist:'Harry Styles',        year:2020},
    {name:'Creep',                           artist:'Radiohead',           year:1992},
    {name:'Back to Black',                   artist:'Amy Winehouse',       year:2006},
  ],

  'Classic Hits': [
    {name:'Bohemian Rhapsody',               artist:'Queen',               year:1975},
    {name:'Don\'t Stop Me Now',              artist:'Queen',               year:1978},
    {name:'We Will Rock You',                artist:'Queen',               year:1977},
    {name:'Hey Jude',                        artist:'The Beatles',         year:1968},
    {name:'Let It Be',                       artist:'The Beatles',         year:1970},
    {name:'Here Comes the Sun',              artist:'The Beatles',         year:1969},
    {name:'Rocket Man',                      artist:'Elton John',          year:1972},
    {name:'Tiny Dancer',                     artist:'Elton John',          year:1971},
    {name:'Your Song',                       artist:'Elton John',          year:1970},
    {name:'Piano Man',                       artist:'Billy Joel',          year:1973},
    {name:'Uptown Girl',                     artist:'Billy Joel',          year:1983},
    {name:'We Didn\'t Start the Fire',       artist:'Billy Joel',          year:1989},
    {name:'Billie Jean',                     artist:'Michael Jackson',     year:1982},
    {name:'Beat It',                         artist:'Michael Jackson',     year:1982},
    {name:'Thriller',                        artist:'Michael Jackson',     year:1982},
    {name:'Dancing Queen',                   artist:'ABBA',                year:1976},
    {name:'Mamma Mia',                       artist:'ABBA',                year:1975},
    {name:'Waterloo',                        artist:'ABBA',                year:1974},
    {name:'Hotel California',                artist:'Eagles',              year:1976},
    {name:'Take It Easy',                    artist:'Eagles',              year:1972},
    {name:'Life in the Fast Lane',           artist:'Eagles',              year:1976},
    {name:'Dreams',                          artist:'Fleetwood Mac',       year:1977},
    {name:'Go Your Own Way',                 artist:'Fleetwood Mac',       year:1977},
    {name:'The Chain',                       artist:'Fleetwood Mac',       year:1977},
    {name:'Africa',                          artist:'Toto',                year:1982},
    {name:'Rosanna',                         artist:'Toto',                year:1982},
    {name:'Hold the Line',                   artist:'Toto',                year:1978},
    {name:'Down Under',                      artist:'Men at Work',         year:1981},
    {name:'Who Can It Be Now?',              artist:'Men at Work',         year:1981},
    {name:'Stayin\' Alive',                  artist:'Bee Gees',            year:1977},
    {name:'How Deep Is Your Love',           artist:'Bee Gees',            year:1977},
    {name:'More Than a Woman',               artist:'Bee Gees',            year:1977},
    {name:'Sweet Caroline',                  artist:'Neil Diamond',        year:1969},
    {name:'American Pie',                    artist:'Don McLean',          year:1971},
    {name:'Brown Eyed Girl',                 artist:'Van Morrison',        year:1967},
    {name:'Can\'t Help Falling in Love',     artist:'Elvis Presley',       year:1961},
    {name:'Suspicious Minds',                artist:'Elvis Presley',       year:1969},
    {name:'My Girl',                         artist:'The Temptations',     year:1964},
    {name:'Ain\'t No Mountain High Enough',  artist:'Marvin Gaye',         year:1967},
    {name:'I Want You Back',                 artist:'The Jackson 5',       year:1969},
    {name:'Superstition',                    artist:'Stevie Wonder',       year:1972},
    {name:'September',                       artist:'Earth, Wind & Fire',  year:1978},
    {name:'Boogie Wonderland',               artist:'Earth, Wind & Fire',  year:1979},
    {name:'Sweet Home Alabama',              artist:'Lynyrd Skynyrd',      year:1974},
    {name:'Fortunate Son',                   artist:'Creedence Clearwater Revival',year:1969},
    {name:'Have You Ever Seen the Rain',     artist:'Creedence Clearwater Revival',year:1971},
    {name:'Proud Mary',                      artist:'Creedence Clearwater Revival',year:1969},
    {name:'Don\'t Stop Believin\'',          artist:'Journey',             year:1981},
    {name:'Livin\' on a Prayer',             artist:'Bon Jovi',            year:1986},
    {name:'Sweet Child O\' Mine',            artist:'Guns N\' Roses',      year:1987},
    {name:'Every Breath You Take',           artist:'The Police',          year:1983},
    {name:'Roxanne',                         artist:'The Police',          year:1978},
    {name:'Careless Whisper',                artist:'George Michael',      year:1984},
    {name:'Take On Me',                      artist:'a-ha',                year:1985},
    {name:'Girls Just Want to Have Fun',     artist:'Cyndi Lauper',        year:1983},
    {name:'Like a Prayer',                   artist:'Madonna',             year:1989},
    {name:'I Wanna Dance with Somebody',     artist:'Whitney Houston',     year:1987},
    {name:'Purple Rain',                     artist:'Prince',              year:1984},
  ],

  '90s Hits': [
    {name:'...Baby One More Time',           artist:'Britney Spears',      year:1998},
    {name:'Oops!... I Did It Again',         artist:'Britney Spears',      year:2000},
    {name:'I Want It That Way',              artist:'Backstreet Boys',     year:1999},
    {name:'Everybody',                       artist:'Backstreet Boys',     year:1997},
    {name:'As Long as You Love Me',          artist:'Backstreet Boys',     year:1997},
    {name:'Wannabe',                         artist:'Spice Girls',         year:1996},
    {name:'Say You\'ll Be There',            artist:'Spice Girls',         year:1996},
    {name:'2 Become 1',                      artist:'Spice Girls',         year:1996},
    {name:'Smells Like Teen Spirit',         artist:'Nirvana',             year:1991},
    {name:'Come as You Are',                 artist:'Nirvana',             year:1992},
    {name:'Heart-Shaped Box',                artist:'Nirvana',             year:1993},
    {name:'Always Be My Baby',               artist:'Mariah Carey',        year:1995},
    {name:'Fantasy',                         artist:'Mariah Carey',        year:1995},
    {name:'Waterfalls',                      artist:'TLC',                 year:1994},
    {name:'No Scrubs',                       artist:'TLC',                 year:1999},
    {name:'Creep',                           artist:'TLC',                 year:1992},
    {name:'Don\'t Speak',                    artist:'No Doubt',            year:1995},
    {name:'Just a Girl',                     artist:'No Doubt',            year:1995},
    {name:'End of the Road',                 artist:'Boyz II Men',         year:1992},
    {name:'I\'ll Make Love to You',          artist:'Boyz II Men',         year:1994},
    {name:'Motownphilly',                    artist:'Boyz II Men',         year:1991},
    {name:'I Will Always Love You',          artist:'Whitney Houston',     year:1992},
    {name:'My Heart Will Go On',             artist:'Celine Dion',         year:1997},
    {name:'Because You Loved Me',            artist:'Celine Dion',         year:1996},
    {name:'You Oughta Know',                 artist:'Alanis Morissette',   year:1995},
    {name:'Ironic',                          artist:'Alanis Morissette',   year:1995},
    {name:'Hand in My Pocket',               artist:'Alanis Morissette',   year:1995},
    {name:'All I Want for Christmas Is You', artist:'Mariah Carey',        year:1994},
    {name:'Zombie',                          artist:'The Cranberries',     year:1994},
    {name:'Linger',                          artist:'The Cranberries',     year:1993},
    {name:'Wonderwall',                      artist:'Oasis',               year:1995},
    {name:'Champagne Supernova',             artist:'Oasis',               year:1995},
    {name:'Don\'t Look Back in Anger',       artist:'Oasis',               year:1995},
    {name:'Losing My Religion',              artist:'R.E.M.',              year:1991},
    {name:'Everybody Hurts',                 artist:'R.E.M.',              year:1993},
    {name:'Black Hole Sun',                  artist:'Soundgarden',         year:1994},
    {name:'Spoonman',                        artist:'Soundgarden',         year:1994},
    {name:'Jeremy',                          artist:'Pearl Jam',           year:1991},
    {name:'Even Flow',                       artist:'Pearl Jam',           year:1992},
    {name:'Basket Case',                     artist:'Green Day',           year:1994},
    {name:'Good Riddance',                   artist:'Green Day',           year:1997},
    {name:'Nookie',                          artist:'Limp Bizkit',         year:1999},
    {name:'Bye Bye Bye',                     artist:'N\'Sync',             year:2000},
    {name:'Tearin\' Up My Heart',            artist:'N\'Sync',             year:1997},
  ],
};

const EXTRA_GENRE_SONGS: GenreSongs = {
  ...EXTRA_GENRE_SONGS_LATIN,
  ...EXTRA_GENRE_SONGS_POP,
  ...EXTRA_GENRE_SONGS_PARTY,
  ...EXTRA_GENRE_SONGS_CLASSICS,
};

// Cada género se juega en rondas cortas: repetir al mismo artista aburre y hace
// que la ronda dependa de un solo grupo. Máximo 3 temas por artista, y que sean
// los que de verdad pegaron.
const MAX_SONGS_PER_ARTIST = 3;
const MAX_SONGS_PER_GENRE = 200;

function mergeGenreSongs(base: GenreSongs, extras: GenreSongs): GenreSongs {
  const merged: GenreSongs = {};

  for (const [genre, songs] of Object.entries(base)) {
    const seen = new Set<string>();
    const perArtist = new Map<string, number>();
    const combined: SongEntry[] = [];

    for (const song of [...songs, ...(extras[genre] ?? [])]) {
      const key = `${song.name.trim().toLowerCase()}::${song.artist.trim().toLowerCase()}`;
      if (seen.has(key)) continue;

      const artist = song.artist.trim().toLowerCase();
      const count = perArtist.get(artist) ?? 0;
      if (count >= MAX_SONGS_PER_ARTIST) continue;

      seen.add(key);
      perArtist.set(artist, count + 1);
      combined.push(song);
      if (combined.length >= MAX_SONGS_PER_GENRE) break;
    }

    merged[genre] = combined;
  }

  return merged;
}

const GENRE_SONGS = mergeGenreSongs(BASE_GENRE_SONGS, EXTRA_GENRE_SONGS);

// ---------------------------------------------------------------------------
// Curated playlists — random mode pulls a random track from these directly
// (one API call per genre selection, no search needed)
// ---------------------------------------------------------------------------

const GENRE_PLAYLISTS: Record<string, string> = {
  'EDM': '6i1wd59WRuS7xSULXejHb4',
  // Add more genres here as playlists are created:
  // 'Pop Latino': 'PLAYLIST_ID',
};

const GENRE_ARTISTS: Record<string, string[]> = {
  'Rock en Español': [
    'Morat',
    'Los Enanitos Verdes',
    'Jarabe de Palo',
    'Maná',
    'Santana',
    'Elefante',
    'Juanes',
    'Bacilos',
    'Hombres G',
    'La Ley',
    'Zoé',
    'Camila',
    'Reik',
    'Sin Bandera',
    'Café Tacvba',
    'Los Fabulosos Cadillacs',
    'Soda Stereo',
    'Los Prisioneros',
    'Andrés Calamaro',
    'Fito Páez',
    'Molotov',
    'Caramelos de Cianuro',
    'Enjambre',
  ],
  'Indie Latino': [
    'Rawayana',
    'Manuel Medrano',
    'Caloncho',
    'Monsieur Periné',
    'Simon Grossmann',
    'Josean Log',
    'Kevin Johansen',
    'Vicente García',
    'Jorge Drexler',
    'Siddhartha',
    'Alex Ferreira',
    'Lasso',
    'Arnau Griso',
    'Alex Cuba',
  ],
};

// ---------------------------------------------------------------------------
// Track URI cache — avoids re-searching songs already found this browser
// ---------------------------------------------------------------------------

const CACHE_KEY = 'qr_track_cache_v1';

function readCache(): Record<string, TrackInfo> {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}'); }
  catch { return {}; }
}

function getCached(artist: string, name: string): TrackInfo | null {
  return readCache()[`${artist}::${name}`] ?? null;
}

function setCache(artist: string, name: string, track: TrackInfo): void {
  try {
    const c = readCache();
    c[`${artist}::${name}`] = track;
    localStorage.setItem(CACHE_KEY, JSON.stringify(c));
  } catch {
    // Cache is an optimization; playback/search should continue if storage fails.
  }
}

// ---------------------------------------------------------------------------

type SearchTrack = {
  uri: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[]; release_date?: string };
  is_local?: boolean;
};

async function spotifySearch(q: string, token: string, retries = 2): Promise<{ items: SearchTrack[]; error: string | null }> {
  try {
    const res = await fetch(
      `https://api.spotify.com/v1/search?${new URLSearchParams({ q, type: 'track' })}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (res.status === 429) {
      if (retries > 0) {
        const afterHeader = res.headers.get('Retry-After');
        const wait = (afterHeader ? Math.min(parseInt(afterHeader, 10), 60) : 15) * 1000;
        await new Promise(r => setTimeout(r, wait));
        return spotifySearch(q, token, retries - 1);
      }
      return { items: [], error: 'http-429' };
    }
    if (!res.ok) return { items: [], error: `http-${res.status}` };
    const data = await res.json();
    return { items: data.tracks?.items ?? [], error: null };
  } catch (e) {
    return { items: [], error: e instanceof Error ? `exception-${e.message}` : 'exception' };
  }
}

function trackInfoFrom(t: SearchTrack, fallbackYear?: number): TrackInfo {
  const year = t.album?.release_date ? parseInt(t.album.release_date.slice(0, 4), 10) : (fallbackYear ?? 0);
  return {
    uri: t.uri,
    name: t.name,
    artist: t.artists[0]?.name ?? '',
    album: t.album?.name ?? '',
    albumArt: t.album?.images?.[0]?.url ?? '',
    year: isNaN(year) ? 0 : year,
  };
}

function getGenreStartMs(genre: string): number {
  return genre === 'EDM' ? 45000 : 10000;
}

function withGenreStart(track: TrackInfo, genre: string): TrackInfo {
  return { ...track, startMs: getGenreStartMs(genre) };
}

// ---------------------------------------------------------------------------
// Historial de la partida — lo que acaba de sonar no vuelve a salir
// ---------------------------------------------------------------------------

export interface PlayedFilter {
  uris: ReadonlySet<string>;
  songKeys: ReadonlySet<string>;
  artists: ReadonlySet<string>;
}

const NOTHING_PLAYED: PlayedFilter = { uris: new Set(), songKeys: new Set(), artists: new Set() };

function songKey(artist: string, name: string): string {
  return `${normalizeSearchText(artist).trim()}::${normalizeSearchText(name).trim()}`;
}

export function buildPlayedFilter(tracks: Iterable<TrackInfo>): PlayedFilter {
  const uris = new Set<string>();
  const songKeys = new Set<string>();
  const artists = new Set<string>();
  for (const track of tracks) {
    uris.add(track.uri);
    songKeys.add(songKey(track.artist, track.name));
    artists.add(normalizeSearchText(track.artist).trim());
  }
  return { uris, songKeys, artists };
}

// Descarta lo ya usado, pero si TODO se usó devuelve la lista completa: es
// preferible repetir una canción a quedarse sin ronda.
function preferUnused<T>(items: readonly T[], isUsed: (item: T) => boolean): T[] {
  const unused = items.filter(item => !isUsed(item));
  return unused.length > 0 ? unused : [...items];
}

async function findTrackAdvanced(song: SongEntry, token: string): Promise<{ result: TrackInfo | null; error: string | null }> {
  const cached = getCached(song.artist, song.name);
  if (cached) return { result: cached, error: null };

  const q = `track:"${song.name}" artist:"${song.artist}"`;
  const { items, error } = await spotifySearch(q, token);
  if (error) return { result: null, error };
  if (items.length === 0) return { result: null, error: 'no-items' };
  const result: TrackInfo = {
    uri: items[0].uri,
    name: song.name,
    artist: song.artist,
    album: items[0].album?.name ?? '',
    albumArt: items[0].album?.images?.[0]?.url ?? '',
    year: song.year,
  };
  setCache(song.artist, song.name, result);
  return { result, error: null };
}

async function findTrackByGenreKeyword(
  genre: string,
  token: string,
  played: PlayedFilter,
): Promise<{ result: TrackInfo | null; error: string | null }> {
  const { items, error } = await spotifySearch(genre, token);
  if (error) return { result: null, error };
  if (items.length === 0) return { result: null, error: 'no-items' };
  const pool = preferUnused(items, t => played.uris.has(t.uri));
  const pick = pool[Math.floor(Math.random() * pool.length)];
  return { result: trackInfoFrom(pick), error: null };
}

function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

async function findTrackByArtist(
  artist: string,
  token: string,
  played: PlayedFilter,
): Promise<{ result: TrackInfo | null; error: string | null }> {
  const { items, error } = await spotifySearch(`artist:"${artist}"`, token);
  if (error) return { result: null, error };
  const normalizedArtist = normalizeSearchText(artist);
  const valid = items.filter((track) =>
    !track.is_local &&
    typeof track.uri === 'string' &&
    track.uri.startsWith('spotify:track:') &&
    track.artists.some((trackArtist) => normalizeSearchText(trackArtist.name).includes(normalizedArtist)),
  );
  const pool = (valid.length > 0 ? valid : items).slice(0, 10);
  if (pool.length === 0) return { result: null, error: 'no-items' };
  const fresh = preferUnused(pool, t => played.uris.has(t.uri));
  const pick = fresh[Math.floor(Math.random() * fresh.length)];
  return { result: trackInfoFrom(pick), error: null };
}

async function findTrackByGenreArtist(
  genre: string,
  token: string,
  played: PlayedFilter,
): Promise<{ result: TrackInfo | null; error: string | null }> {
  const artists = GENRE_ARTISTS[genre];
  if (!artists) return { result: null, error: 'no-artist-genre' };

  // La lista de artistas es corta, así que primero se rota entre los que aún
  // no salieron; dentro de cada artista se descartan los temas ya jugados.
  const candidates = preferUnused(artists, a => played.artists.has(normalizeSearchText(a).trim()));
  for (const artist of shuffleArray(candidates).slice(0, 5)) {
    const { result, error } = await findTrackByArtist(artist, token, played);
    if (result) return { result, error: null };
    if (error === 'http-429') return { result: null, error };
  }

  return { result: null, error: 'no-items' };
}

// Single call to a curated playlist → random track from up to 100 items
async function findTrackFromPlaylist(
  playlistId: string,
  token: string,
  played: PlayedFilter,
): Promise<{ result: TrackInfo | null; error: string | null }> {
  try {
    const url =
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?` +
      new URLSearchParams({
        fields: 'items(track(uri,name,artists,album,is_local))',
        limit: '100',
      });
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (res.status === 429) return { result: null, error: 'http-429' };
    if (!res.ok) return { result: null, error: `http-${res.status}` };
    const data = await res.json();
    type PlaylistTrack = SearchTrack & { is_local?: boolean };
    const items: Array<{ track: PlaylistTrack | null }> = data.items ?? [];
    const valid = items
      .map((i) => i.track)
      .filter((t): t is SearchTrack =>
        !!t && !t.is_local && typeof t.uri === 'string' && t.uri.startsWith('spotify:track:'),
      );
    if (valid.length === 0) return { result: null, error: 'no-items' };
    const pool = preferUnused(valid, t => played.uris.has(t.uri));
    const pick = pool[Math.floor(Math.random() * pool.length)];
    return { result: trackInfoFrom(pick), error: null };
  } catch (e) {
    return { result: null, error: e instanceof Error ? `exception-${e.message}` : 'exception' };
  }
}

export async function loadTracksForGenre(
  genre: string,
  songSource: 'random' | 'advanced' = 'advanced',
  played: PlayedFilter = NOTHING_PLAYED,
): Promise<TrackInfo[]> {
  const token = await getToken();
  if (!token) throw new Error('No Spotify token');

  const rateLimitMsg = 'Límite de Spotify alcanzado. Espera unos segundos e intenta de nuevo.';
  if (GENRE_ARTISTS[genre]) {
    const { result, error } = await findTrackByGenreArtist(genre, token, played);
    if (result) return [withGenreStart(result, genre)];
    throw new Error(error === 'http-429' ? rateLimitMsg : `No se encontraron canciones para ${genre} (${error})`);
  }

  if (songSource === 'random') {
    // Use the curated playlist for this genre if one is configured
    const playlistId = GENRE_PLAYLISTS[genre];
    if (playlistId) {
      const { result, error } = await findTrackFromPlaylist(playlistId, token, played);
      if (result) return [withGenreStart(result, genre)];
      throw new Error(error === 'http-429' ? rateLimitMsg : `No se encontraron canciones en el playlist de ${genre} (${error})`);
    }
    // Fallback for genres without a playlist: keyword search
    const { result, error } = await findTrackByGenreKeyword(genre, token, played);
    if (result) return [withGenreStart(result, genre)];
    throw new Error(error === 'http-429' ? rateLimitMsg : `No se encontraron canciones para ${genre} (${error})`);
  }

  // advanced: try up to 5 shuffled curated songs; cached ones cost 0 API calls.
  // Se descartan las ya jugadas ANTES de buscar, así no se gastan llamadas a
  // la API en un tema que igual se iba a rechazar.
  const songs = GENRE_SONGS[genre];
  if (!songs) throw new Error(`Género no configurado: ${genre}`);

  const candidates = preferUnused(songs, song => played.songKeys.has(songKey(song.artist, song.name)));
  // Dos canciones distintas del catálogo pueden resolver al mismo URI en
  // Spotify; si eso pasa se guarda como último recurso y se sigue buscando.
  let repeated: TrackInfo | null = null;

  for (const song of shuffleArray([...candidates]).slice(0, 5)) {
    const { result, error } = await findTrackAdvanced(song, token);
    if (error === 'http-429') throw new Error(rateLimitMsg);
    if (!result) continue; // 'no-items' or other error → try next song
    if (!played.uris.has(result.uri)) return [withGenreStart(result, genre)];
    repeated ??= result;
  }

  if (repeated) return [withGenreStart(repeated, genre)];
  throw new Error(`No se encontraron canciones para ${genre}`);
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface PlaybackState {
  is_playing?: boolean;
  item?: { uri?: string } | null;
  device?: { id?: string | null } | null;
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function getPlaybackState(token: string): Promise<PlaybackState | null> {
  const res = await fetch('https://api.spotify.com/v1/me/player', {
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => null);
  if (!res || res.status === 204 || !res.ok) return null;
  return await res.json() as PlaybackState;
}

async function isTrackPlaying(token: string, trackUri: string): Promise<boolean> {
  const playback = await getPlaybackState(token);
  return (
    playback?.is_playing === true &&
    playback.item?.uri === trackUri &&
    (typeof deviceId !== 'string' || deviceId === 'active' || playback.device?.id === deviceId)
  );
}

export async function playSong(trackUri: string, startMs = 0): Promise<boolean> {
  const token = await getToken();
  if (!token || deviceId === undefined) return false;
  const explicitDeviceId = deviceId && deviceId !== 'active' ? deviceId : null;

  const doPlay = () =>
    fetch(`https://api.spotify.com/v1/me/player/play${explicitDeviceId ? `?device_id=${encodeURIComponent(explicitDeviceId)}` : ''}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ uris: [trackUri], position_ms: startMs }),
    }).catch(() => null);

  const transferPlayback = () =>
    explicitDeviceId
      ? fetch('https://api.spotify.com/v1/me/player', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_ids: [explicitDeviceId], play: false }),
      }).catch(() => null)
      : Promise.resolve(null);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const res = await doPlay();
    await wait(attempt === 0 ? 300 : 650);
    if (res?.ok && await isTrackPlaying(token, trackUri)) return true;

    // If the device went inactive or Spotify accepted play without starting,
    // reclaim the selected device and try again.
    await transferPlayback();
    await wait(600);
  }

  // One final plain resume covers the case where Spotify loaded the URI but
  // left playback paused after device transfer.
  await fetch(`https://api.spotify.com/v1/me/player/play${explicitDeviceId ? `?device_id=${encodeURIComponent(explicitDeviceId)}` : ''}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => null);
  await wait(350);
  if (await isTrackPlaying(token, trackUri)) return true;

  const playback = await getPlaybackState(token);
  if (explicitDeviceId && playback?.device?.id !== explicitDeviceId) {
    await fetch('https://api.spotify.com/v1/me/player', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_ids: [explicitDeviceId], play: false }),
    }).catch(() => {});
  }
  return false;
}

export async function pauseSong(): Promise<void> {
  const token = await getToken();
  if (!token || deviceId === undefined) return;
  const explicitDeviceId = deviceId && deviceId !== 'active' ? deviceId : null;
  await fetch(`https://api.spotify.com/v1/me/player/pause${explicitDeviceId ? `?device_id=${encodeURIComponent(explicitDeviceId)}` : ''}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  });
}
