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

// ---------------------------------------------------------------------------
// Curated song lists — random picked in-app, one Spotify search resolves URI
// ---------------------------------------------------------------------------

type SongEntry = { name: string; artist: string; year: number };

const GENRE_SONGS: Record<string, SongEntry[]> = {
  'EDM': [
    {name:'Levels',                          artist:'Avicii',              year:2011},
    {name:'Wake Me Up',                      artist:'Avicii',              year:2013},
    {name:'Hey Brother',                     artist:'Avicii',              year:2013},
    {name:'Waiting for Love',                artist:'Avicii',              year:2015},
    {name:'The Days',                        artist:'Avicii',              year:2014},
    {name:'Animals',                         artist:'Martin Garrix',       year:2013},
    {name:'In the Name of Love',             artist:'Martin Garrix',       year:2016},
    {name:'Scared to Be Lonely',             artist:'Martin Garrix',       year:2017},
    {name:'Summer',                          artist:'Calvin Harris',       year:2014},
    {name:'Feel So Close',                   artist:'Calvin Harris',       year:2012},
    {name:'This Is What You Came For',       artist:'Calvin Harris',       year:2016},
    {name:'One Kiss',                        artist:'Calvin Harris',       year:2018},
    {name:'My Way',                          artist:'Calvin Harris',       year:2016},
    {name:'Titanium',                        artist:'David Guetta',        year:2011},
    {name:'Sexy Bitch',                      artist:'David Guetta',        year:2009},
    {name:'Memories',                        artist:'David Guetta',        year:2009},
    {name:'When Love Takes Over',            artist:'David Guetta',        year:2009},
    {name:'Without You',                     artist:'David Guetta',        year:2011},
    {name:'Faded',                           artist:'Alan Walker',         year:2015},
    {name:'Alone',                           artist:'Alan Walker',         year:2016},
    {name:'On My Way',                       artist:'Alan Walker',         year:2019},
    {name:'The Spectre',                     artist:'Alan Walker',         year:2017},
    {name:'Closer',                          artist:'The Chainsmokers',    year:2016},
    {name:'Something Just Like This',        artist:'The Chainsmokers',    year:2017},
    {name:'Paris',                           artist:'The Chainsmokers',    year:2017},
    {name:'Roses',                           artist:'The Chainsmokers',    year:2015},
    {name:'Don\'t Let Me Down',              artist:'The Chainsmokers',    year:2016},
    {name:'Clarity',                         artist:'Zedd',                year:2012},
    {name:'The Middle',                      artist:'Zedd',                year:2018},
    {name:'Stay the Night',                  artist:'Zedd',                year:2014},
    {name:'Beautiful Now',                   artist:'Zedd',                year:2015},
    {name:'Alone',                           artist:'Marshmello',          year:2016},
    {name:'Friends',                         artist:'Marshmello',          year:2018},
    {name:'Happier',                         artist:'Marshmello',          year:2018},
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
    {name:'The Business',                    artist:'Tiësto',              year:2020},
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
    {name:'Loca',                            artist:'Shakira',             year:2010},
    {name:'La Tortura',                      artist:'Shakira',             year:2005},
    {name:'Whenever Wherever',               artist:'Shakira',             year:2001},
    {name:'Hero',                            artist:'Enrique Iglesias',    year:2001},
    {name:'Bailamos',                        artist:'Enrique Iglesias',    year:1999},
    {name:'Escape',                          artist:'Enrique Iglesias',    year:2001},
    {name:'Bailando',                        artist:'Enrique Iglesias',    year:2014},
    {name:'El Perdón',                       artist:'Enrique Iglesias',    year:2015},
    {name:'She Wolf',                        artist:'Shakira',             year:2009},
    {name:'La Copa de la Vida',              artist:'Ricky Martin',        year:1998},
    {name:'Livin\' la Vida Loca',            artist:'Ricky Martin',        year:1999},
    {name:'María',                           artist:'Ricky Martin',        year:1995},
    {name:'She Bangs',                       artist:'Ricky Martin',        year:2000},
    {name:'La Bicicleta',                    artist:'Carlos Vives',        year:2016},
    {name:'Caminando por la Luna',           artist:'Carlos Vives',        year:2012},
    {name:'La Camisa Negra',                 artist:'Juanes',              year:2004},
    {name:'Me Enamora',                      artist:'Juanes',              year:2007},
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
    {name:'Te Felicito',                     artist:'Shakira',             year:2022},
    {name:'Ojala',                           artist:'Silvio Rodríguez',    year:1969},
    {name:'No Soy el Aire',                  artist:'Ricardo Arjona',      year:2002},
    {name:'Historia de Taxi',                artist:'Ricardo Arjona',      year:1994},
  ],

  'Reggaetón': [
    {name:'Gasolina',                        artist:'Daddy Yankee',        year:2004},
    {name:'Con Calma',                       artist:'Daddy Yankee',        year:2019},
    {name:'Shaky Shaky',                     artist:'Daddy Yankee',        year:2016},
    {name:'Limbo',                           artist:'Daddy Yankee',        year:2012},
    {name:'Despacito',                       artist:'Luis Fonsi',          year:2017},
    {name:'Mi Gente',                        artist:'J Balvin',            year:2017},
    {name:'Safari',                          artist:'J Balvin',            year:2016},
    {name:'Ay Vamos',                        artist:'J Balvin',            year:2014},
    {name:'Ambiente',                        artist:'J Balvin',            year:2017},
    {name:'Dakiti',                          artist:'Bad Bunny',           year:2020},
    {name:'Tití Me Preguntó',                artist:'Bad Bunny',           year:2022},
    {name:'Me Porto Bonito',                 artist:'Bad Bunny',           year:2022},
    {name:'Efecto',                          artist:'Bad Bunny',           year:2022},
    {name:'Yonaguni',                        artist:'Bad Bunny',           year:2021},
    {name:'Hawái',                           artist:'Maluma',              year:2020},
    {name:'Felices los 4',                   artist:'Maluma',              year:2017},
    {name:'Borró Cassette',                  artist:'Maluma',              year:2016},
    {name:'El Préstamo',                     artist:'Maluma',              year:2017},
    {name:'Corazón',                         artist:'Maluma',              year:2017},
    {name:'Tusa',                            artist:'Karol G',             year:2019},
    {name:'Bichota',                         artist:'Karol G',             year:2020},
    {name:'Provenza',                        artist:'Karol G',             year:2022},
    {name:'Ay Dios Mío!',                    artist:'Karol G',             year:2020},
    {name:'X',                               artist:'Nicky Jam',           year:2017},
    {name:'El Perdón',                       artist:'Nicky Jam',           year:2015},
    {name:'Hasta el Amanecer',               artist:'Nicky Jam',           year:2016},
    {name:'Danza Kuduro',                    artist:'Don Omar',            year:2010},
    {name:'Dutty Love',                      artist:'Don Omar',            year:2012},
    {name:'Ella y Yo',                       artist:'Don Omar',            year:2006},
    {name:'Lento',                           artist:'Zion & Lennox',       year:2010},
    {name:'Pierdo la Cabeza',                artist:'Zion & Lennox',       year:2016},
    {name:'Te Deseo Lo Mejor',               artist:'Ozuna',               year:2017},
    {name:'La Modelo',                       artist:'Ozuna',               year:2017},
    {name:'Taki Taki',                       artist:'DJ Snake',            year:2018},
    {name:'Lean On',                         artist:'Major Lazer',         year:2015},
    {name:'China',                           artist:'Anuel AA',            year:2018},
    {name:'Bubalu',                          artist:'Anuel AA',            year:2018},
    {name:'Secreto',                         artist:'Anuel AA',            year:2019},
    {name:'Pepas',                           artist:'Farruko',             year:2021},
    {name:'Chantaje',                        artist:'Shakira',             year:2016},
    {name:'Sensación del Bloque',            artist:'Wisin & Yandel',      year:2005},
    {name:'Rakata',                          artist:'Wisin & Yandel',      year:2005},
    {name:'Follow the Leader',               artist:'Wisin & Yandel',      year:2012},
    {name:'Bandida',                         artist:'Myke Towers',         year:2020},
    {name:'La Playa',                        artist:'J Balvin',            year:2019},
    {name:'Brb',                             artist:'Bad Bunny',           year:2018},
    {name:'Sola',                            artist:'Anuel AA',            year:2018},
    {name:'Te Boté',                         artist:'Nio Garcia',          year:2018},
    {name:'Informer',                        artist:'Sech',                year:2019},
    {name:'Relación',                        artist:'Sech',                year:2019},
    {name:'Yo Perreo Sola',                  artist:'Bad Bunny',           year:2020},
  ],

  'Rock en Español': [
    {name:'Rayando el Sol',                  artist:'Maná',                year:1994},
    {name:'Oye Mi Amor',                     artist:'Maná',                year:1994},
    {name:'En el Muelle de San Blás',        artist:'Maná',                year:1994},
    {name:'Labios Compartidos',              artist:'Maná',                year:2004},
    {name:'Clavado en un Bar',               artist:'Maná',                year:2011},
    {name:'Cuando los Ángeles Lloran',       artist:'Maná',                year:1994},
    {name:'De Música Ligera',                artist:'Soda Stereo',         year:1990},
    {name:'Persiana Americana',              artist:'Soda Stereo',         year:1987},
    {name:'Ella Usó mi Cabeza como Revólver',artist:'Soda Stereo',         year:1992},
    {name:'Nada Personal',                   artist:'Soda Stereo',         year:1985},
    {name:'La Ciudad de la Furia',           artist:'Soda Stereo',         year:1988},
    {name:'La Camisa Negra',                 artist:'Juanes',              year:2004},
    {name:'Me Enamora',                      artist:'Juanes',              year:2007},
    {name:'A Dios le Pido',                  artist:'Juanes',              year:2002},
    {name:'Fotonovela',                      artist:'Café Tacvba',         year:1994},
    {name:'Las Flores',                      artist:'Café Tacvba',         year:1999},
    {name:'Eres',                            artist:'Café Tacvba',         year:1994},
    {name:'Matador',                         artist:'Los Fabulosos Cadillacs',year:1994},
    {name:'El León',                         artist:'Los Fabulosos Cadillacs',year:1993},
    {name:'Gitana',                          artist:'Los Fabulosos Cadillacs',year:1991},
    {name:'Gimme tha Power',                 artist:'Molotov',             year:1997},
    {name:'Frijolero',                       artist:'Molotov',             year:2003},
    {name:'Estoy Aquí',                      artist:'Shakira',             year:1995},
    {name:'Antología',                       artist:'Shakira',             year:1995},
    {name:'Ojos Así',                        artist:'Shakira',             year:1998},
    {name:'Corazón Partío',                  artist:'Alejandro Sanz',      year:1997},
    {name:'Quisiera Ser',                    artist:'Alejandro Sanz',      year:2000},
    {name:'La Tortura',                      artist:'Alejandro Sanz',      year:2005},
    {name:'No Es lo Mismo',                  artist:'Alejandro Sanz',      year:2003},
    {name:'Quiero',                          artist:'La Oreja de Van Gogh',year:1999},
    {name:'El Runrún',                       artist:'La Oreja de Van Gogh',year:2003},
    {name:'Muñeca de Trapo',                 artist:'La Oreja de Van Gogh',year:2002},
    {name:'Cuéntame al Oído',                artist:'La Oreja de Van Gogh',year:2006},
    {name:'Todo Cambia',                     artist:'Jarabe de Palo',      year:2007},
    {name:'La Flaca',                        artist:'Jarabe de Palo',      year:1996},
    {name:'Depende',                         artist:'Jarabe de Palo',      year:2001},
    {name:'Promiscua',                       artist:'Miranda!',            year:2004},
    {name:'Don',                             artist:'Miranda!',            year:2004},
    {name:'Perfecta',                        artist:'Miranda!',            year:2005},
    {name:'Obsesión',                        artist:'Aventura',            year:2002},
    {name:'Un Poco Loco',                    artist:'Fito Páez',           year:1988},
    {name:'11 y 6',                          artist:'Fito Páez',           year:1988},
    {name:'Tango en Segunda',                artist:'Andrés Calamaro',     year:1997},
    {name:'El Salmón',                       artist:'Andrés Calamaro',     year:1997},
    {name:'Llueve Sobre Mojado',             artist:'Los Enanitos Verdes', year:1992},
    {name:'Lamento Boliviano',               artist:'Los Enanitos Verdes', year:1992},
    {name:'Marciano',                        artist:'Los Enanitos Verdes', year:1989},
    {name:'Entre Caníbales',                 artist:'Fito Páez',           year:1992},
    {name:'El Extraño de Pelo Largo',        artist:'Los Náufragos',       year:1970},
    {name:'Contigo en la Distancia',         artist:'Maldita Vecindad',    year:1991},
  ],

  'Pop Internacional': [
    {name:'Blinding Lights',                 artist:'The Weeknd',          year:2020},
    {name:'Save Your Tears',                 artist:'The Weeknd',          year:2021},
    {name:'Starboy',                         artist:'The Weeknd',          year:2016},
    {name:'Can\'t Feel My Face',             artist:'The Weeknd',          year:2015},
    {name:'Shape of You',                    artist:'Ed Sheeran',          year:2017},
    {name:'Perfect',                         artist:'Ed Sheeran',          year:2017},
    {name:'Thinking Out Loud',               artist:'Ed Sheeran',          year:2014},
    {name:'Photograph',                      artist:'Ed Sheeran',          year:2014},
    {name:'Bad Guy',                         artist:'Billie Eilish',       year:2019},
    {name:'Therefore I Am',                  artist:'Billie Eilish',       year:2020},
    {name:'Happier Than Ever',               artist:'Billie Eilish',       year:2021},
    {name:'Watermelon Sugar',                artist:'Harry Styles',        year:2020},
    {name:'As It Was',                       artist:'Harry Styles',        year:2022},
    {name:'Golden',                          artist:'Harry Styles',        year:2020},
    {name:'Thank U Next',                    artist:'Ariana Grande',       year:2018},
    {name:'7 Rings',                         artist:'Ariana Grande',       year:2019},
    {name:'Into You',                        artist:'Ariana Grande',       year:2016},
    {name:'Problem',                         artist:'Ariana Grande',       year:2014},
    {name:'Levitating',                      artist:'Dua Lipa',            year:2020},
    {name:'Don\'t Start Now',                artist:'Dua Lipa',            year:2019},
    {name:'Physical',                        artist:'Dua Lipa',            year:2020},
    {name:'New Rules',                       artist:'Dua Lipa',            year:2017},
    {name:'Shake It Off',                    artist:'Taylor Swift',        year:2014},
    {name:'Blank Space',                     artist:'Taylor Swift',        year:2014},
    {name:'Bad Blood',                       artist:'Taylor Swift',        year:2015},
    {name:'Love Story',                      artist:'Taylor Swift',        year:2008},
    {name:'Anti-Hero',                       artist:'Taylor Swift',        year:2022},
    {name:'Uptown Funk',                     artist:'Bruno Mars',          year:2014},
    {name:'Just the Way You Are',            artist:'Bruno Mars',          year:2010},
    {name:'That\'s What I Like',             artist:'Bruno Mars',          year:2016},
    {name:'Grenade',                         artist:'Bruno Mars',          year:2010},
    {name:'Rolling in the Deep',             artist:'Adele',               year:2010},
    {name:'Someone Like You',                artist:'Adele',               year:2011},
    {name:'Hello',                           artist:'Adele',               year:2015},
    {name:'Easy On Me',                      artist:'Adele',               year:2021},
    {name:'Roar',                            artist:'Katy Perry',          year:2013},
    {name:'Firework',                        artist:'Katy Perry',          year:2010},
    {name:'Teenage Dream',                   artist:'Katy Perry',          year:2010},
    {name:'Dark Horse',                      artist:'Katy Perry',          year:2013},
    {name:'Poker Face',                      artist:'Lady Gaga',           year:2008},
    {name:'Bad Romance',                     artist:'Lady Gaga',           year:2009},
    {name:'Just Dance',                      artist:'Lady Gaga',           year:2008},
    {name:'Shallow',                         artist:'Lady Gaga',           year:2018},
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
    {name:'Confessions Part II',             artist:'Usher',               year:2004},
    {name:'My Boo',                          artist:'Usher',               year:2004},
    {name:'Umbrella',                        artist:'Rihanna',             year:2007},
    {name:'SOS',                             artist:'Rihanna',             year:2006},
    {name:'Don\'t Stop the Music',           artist:'Rihanna',             year:2007},
    {name:'Disturbia',                       artist:'Rihanna',             year:2008},
    {name:'SexyBack',                        artist:'Justin Timberlake',   year:2006},
    {name:'What Goes Around',                artist:'Justin Timberlake',   year:2006},
    {name:'Cry Me a River',                  artist:'Justin Timberlake',   year:2002},
    {name:'Rock Your Body',                  artist:'Justin Timberlake',   year:2003},
    {name:'Hot in Herre',                    artist:'Nelly',               year:2002},
    {name:'Dilemma',                         artist:'Nelly',               year:2002},
    {name:'Crazy in Love',                   artist:'Beyoncé',             year:2003},
    {name:'Halo',                            artist:'Beyoncé',             year:2008},
    {name:'Irreplaceable',                   artist:'Beyoncé',             year:2006},
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
    {name:'21 Questions',                    artist:'50 Cent',             year:2003},
    {name:'Get Low',                         artist:'Lil Jon',             year:2003},
    {name:'Tom\'s Diner',                    artist:'Suzanne Vega',        year:2002},
    {name:'What\'s Luv?',                    artist:'Fat Joe',             year:2002},
  ],

  'Fiesta / Party': [
    {name:'Give Me Everything',              artist:'Pitbull',             year:2011},
    {name:'International Love',              artist:'Pitbull',             year:2012},
    {name:'Don\'t Stop the Party',           artist:'Pitbull',             year:2012},
    {name:'Feel This Moment',                artist:'Pitbull',             year:2012},
    {name:'Timber',                          artist:'Pitbull',             year:2013},
    {name:'Right Round',                     artist:'Flo Rida',            year:2009},
    {name:'Club Can\'t Handle Me',           artist:'Flo Rida',            year:2010},
    {name:'Good Feeling',                    artist:'Flo Rida',            year:2011},
    {name:'Whistle',                         artist:'Flo Rida',            year:2012},
    {name:'I Gotta Feeling',                 artist:'Black Eyed Peas',     year:2009},
    {name:'Boom Boom Pow',                   artist:'Black Eyed Peas',     year:2009},
    {name:'Tonight (I\'m Lovin\' You)',      artist:'Black Eyed Peas',     year:2010},
    {name:'Party Rock Anthem',               artist:'LMFAO',               year:2011},
    {name:'Sexy and I Know It',              artist:'LMFAO',               year:2011},
    {name:'Shots',                           artist:'LMFAO',               year:2009},
    {name:'Get the Party Started',           artist:'Pink',                year:2001},
    {name:'Gasolina',                        artist:'Daddy Yankee',        year:2004},
    {name:'Limbo',                           artist:'Daddy Yankee',        year:2012},
    {name:'Temperature',                     artist:'Sean Paul',           year:2005},
    {name:'Beautiful Girls',                 artist:'Sean Paul',           year:2007},
    {name:'Shake That Thing',                artist:'Sean Paul',           year:2002},
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
    {name:'Treasure',                        artist:'Bruno Mars',          year:2012},
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
    {name:'Nice for What',                   artist:'Drake',               year:2018},
    {name:'Humble',                          artist:'Kendrick Lamar',      year:2017},
    {name:'LOYALTY.',                        artist:'Kendrick Lamar',      year:2017},
    {name:'Alright',                         artist:'Kendrick Lamar',      year:2015},
    {name:'Swimming Pools',                  artist:'Kendrick Lamar',      year:2012},
    {name:'Lose Yourself',                   artist:'Eminem',              year:2002},
    {name:'Without Me',                      artist:'Eminem',              year:2002},
    {name:'Not Afraid',                      artist:'Eminem',              year:2010},
    {name:'Rap God',                         artist:'Eminem',              year:2013},
    {name:'The Real Slim Shady',             artist:'Eminem',              year:2000},
    {name:'SICKO MODE',                      artist:'Travis Scott',        year:2018},
    {name:'Goosebumps',                      artist:'Travis Scott',        year:2016},
    {name:'antidote',                        artist:'Travis Scott',        year:2015},
    {name:'Rockstar',                        artist:'Post Malone',         year:2017},
    {name:'Congratulations',                 artist:'Post Malone',         year:2016},
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
    {name:'Stir Fry',                        artist:'Migos',               year:2018},
    {name:'Lucid Dreams',                    artist:'Juice WRLD',          year:2018},
    {name:'All Girls Are the Same',          artist:'Juice WRLD',          year:2018},
    {name:'Mo Bamba',                        artist:'Sheck Wes',           year:2017},
    {name:'Thotiana',                        artist:'Blueface',            year:2018},
    {name:'Highest in the Room',             artist:'Travis Scott',        year:2019},
    {name:'Rich Flex',                       artist:'Drake',               year:2022},
  ],

  'R&B': [
    {name:'Crazy in Love',                   artist:'Beyoncé',             year:2003},
    {name:'Halo',                            artist:'Beyoncé',             year:2008},
    {name:'Irreplaceable',                   artist:'Beyoncé',             year:2006},
    {name:'Lemonade',                        artist:'Beyoncé',             year:2016},
    {name:'Formation',                       artist:'Beyoncé',             year:2016},
    {name:'Umbrella',                        artist:'Rihanna',             year:2007},
    {name:'Diamonds',                        artist:'Rihanna',             year:2012},
    {name:'Stay',                            artist:'Rihanna',             year:2012},
    {name:'Love the Way You Lie',            artist:'Rihanna',             year:2010},
    {name:'Yeah!',                           artist:'Usher',               year:2004},
    {name:'Burn',                            artist:'Usher',               year:2004},
    {name:'Nice & Slow',                     artist:'Usher',               year:1997},
    {name:'My Boo',                          artist:'Usher',               year:2004},
    {name:'No One',                          artist:'Alicia Keys',         year:2007},
    {name:'Fallin\'',                        artist:'Alicia Keys',         year:2001},
    {name:'If I Ain\'t Got You',             artist:'Alicia Keys',         year:2003},
    {name:'Empire State of Mind',            artist:'Alicia Keys',         year:2009},
    {name:'All of Me',                       artist:'John Legend',         year:2013},
    {name:'Ordinary People',                 artist:'John Legend',         year:2004},
    {name:'Earned It',                       artist:'The Weeknd',          year:2015},
    {name:'The Hills',                       artist:'The Weeknd',          year:2015},
    {name:'Starboy',                         artist:'The Weeknd',          year:2016},
    {name:'Family Portrait',                 artist:'Pink',                year:2003},
    {name:'Real Love',                       artist:'Mary J. Blige',       year:1992},
    {name:'Be Without You',                  artist:'Mary J. Blige',       year:2005},
    {name:'Miss You',                        artist:'Mary J. Blige',       year:2007},
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

  '80s Hits': [
    {name:'Thriller',                        artist:'Michael Jackson',     year:1982},
    {name:'Billie Jean',                     artist:'Michael Jackson',     year:1982},
    {name:'Beat It',                         artist:'Michael Jackson',     year:1982},
    {name:'Don\'t Stop \'Til You Get Enough',artist:'Michael Jackson',     year:1979},
    {name:'Like a Prayer',                   artist:'Madonna',             year:1989},
    {name:'Material Girl',                   artist:'Madonna',             year:1984},
    {name:'Papa Don\'t Preach',              artist:'Madonna',             year:1986},
    {name:'La Isla Bonita',                  artist:'Madonna',             year:1987},
    {name:'Like a Virgin',                   artist:'Madonna',             year:1984},
    {name:'When Doves Cry',                  artist:'Prince',              year:1984},
    {name:'Kiss',                            artist:'Prince',              year:1986},
    {name:'Purple Rain',                     artist:'Prince',              year:1984},
    {name:'Raspberry Beret',                 artist:'Prince',              year:1985},
    {name:'I Wanna Dance with Somebody',     artist:'Whitney Houston',     year:1987},
    {name:'Greatest Love of All',            artist:'Whitney Houston',     year:1985},
    {name:'Saving All My Love for You',      artist:'Whitney Houston',     year:1985},
    {name:'Girls Just Want to Have Fun',     artist:'Cyndi Lauper',        year:1983},
    {name:'True Colors',                     artist:'Cyndi Lauper',        year:1986},
    {name:'Take On Me',                      artist:'a-ha',                year:1985},
    {name:'The Sun Always Shines on T.V.',   artist:'a-ha',                year:1985},
    {name:'Rio',                             artist:'Duran Duran',         year:1982},
    {name:'Hungry Like the Wolf',            artist:'Duran Duran',         year:1982},
    {name:'Girls on Film',                   artist:'Duran Duran',         year:1981},
    {name:'Livin\' on a Prayer',             artist:'Bon Jovi',            year:1986},
    {name:'You Give Love a Bad Name',        artist:'Bon Jovi',            year:1986},
    {name:'Wanted Dead or Alive',            artist:'Bon Jovi',            year:1986},
    {name:'Born in the U.S.A.',              artist:'Bruce Springsteen',   year:1984},
    {name:'Dancing in the Dark',             artist:'Bruce Springsteen',   year:1984},
    {name:'Every Breath You Take',           artist:'The Police',          year:1983},
    {name:'Roxanne',                         artist:'The Police',          year:1978},
    {name:'Message in a Bottle',             artist:'The Police',          year:1979},
    {name:'With or Without You',             artist:'U2',                  year:1987},
    {name:'Where the Streets Have No Name', artist:'U2',                  year:1987},
    {name:'Sunday Bloody Sunday',            artist:'U2',                  year:1983},
    {name:'Personal Jesus',                  artist:'Depeche Mode',        year:1989},
    {name:'Enjoy the Silence',               artist:'Depeche Mode',        year:1990},
    {name:'People Are People',               artist:'Depeche Mode',        year:1984},
    {name:'Blue Monday',                     artist:'New Order',           year:1983},
    {name:'Bizarre Love Triangle',           artist:'New Order',           year:1986},
    {name:'Don\'t You (Forget About Me)',    artist:'Simple Minds',        year:1985},
    {name:'Everybody Wants to Rule the World',artist:'Tears for Fears',   year:1985},
    {name:'Shout',                           artist:'Tears for Fears',     year:1984},
    {name:'Wake Me Up Before You Go-Go',     artist:'Wham!',               year:1984},
    {name:'Careless Whisper',                artist:'George Michael',      year:1984},
    {name:'Faith',                           artist:'George Michael',      year:1987},
    {name:'Father Figure',                   artist:'George Michael',      year:1987},
    {name:'Against All Odds',                artist:'Phil Collins',        year:1984},
    {name:'In the Air Tonight',              artist:'Phil Collins',        year:1981},
    {name:'Don\'t You Want Me',              artist:'The Human League',    year:1981},
    {name:'Sweet Child O\' Mine',            artist:'Guns N\' Roses',      year:1987},
  ],

  '90s Hits': [
    {name:'...Baby One More Time',           artist:'Britney Spears',      year:1998},
    {name:'Oops!... I Did It Again',         artist:'Britney Spears',      year:2000},
    {name:'I Want It That Way',              artist:'Backstreet Boys',     year:1999},
    {name:'Everybody',                       artist:'Backstreet Boys',     year:1997},
    {name:'As Long as You Love Me',          artist:'Backstreet Boys',     year:1997},
    {name:'Quit Playing Games',              artist:'Backstreet Boys',     year:1996},
    {name:'Wannabe',                         artist:'Spice Girls',         year:1996},
    {name:'Say You\'ll Be There',            artist:'Spice Girls',         year:1996},
    {name:'2 Become 1',                      artist:'Spice Girls',         year:1996},
    {name:'Smells Like Teen Spirit',         artist:'Nirvana',             year:1991},
    {name:'Come as You Are',                 artist:'Nirvana',             year:1992},
    {name:'Heart-Shaped Box',                artist:'Nirvana',             year:1993},
    {name:'Always Be My Baby',               artist:'Mariah Carey',        year:1995},
    {name:'Fantasy',                         artist:'Mariah Carey',        year:1995},
    {name:'Hero',                            artist:'Mariah Carey',        year:1993},
    {name:'Emotions',                        artist:'Mariah Carey',        year:1991},
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
    {name:'Alanis',                          artist:'Alanis Morissette',   year:1995},
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
    {name:'Smooth Criminal',                 artist:'Michael Jackson',     year:1988},
    {name:'Losing My Religion',              artist:'R.E.M.',              year:1991},
    {name:'Limp Bizkit',                     artist:'Nookie',              year:1999},
    {name:'Bye Bye Bye',                     artist:'N\'Sync',             year:2000},
    {name:'Tearin\' Up My Heart',            artist:'N\'Sync',             year:1997},
  ],
};

async function findTrack(song: SongEntry, token: string): Promise<{ result: TrackInfo | null; error: string | null }> {
  // Try song name only first — most reliable; then fallback to song + artist
  const queries = [song.name, `${song.name} ${song.artist}`];
  let lastError = 'none-tried';

  for (const q of queries) {
    try {
      const res = await fetch(
        `https://api.spotify.com/v1/search?${new URLSearchParams({ q, type: 'track' })}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) {
        lastError = `http-${res.status}`;
        continue;
      }
      const data = await res.json();
      const items: Array<{
        uri: string;
        artists: { name: string }[];
        album: { name: string; images: { url: string }[] };
      }> = data.tracks?.items ?? [];
      if (items.length === 0) {
        lastError = 'no-items';
        continue;
      }
      // Prefer a result whose artist contains the expected artist's first word
      const firstName = song.artist.toLowerCase().split(/\s+/)[0];
      const match =
        items.find(t => t.artists.some(a => a.name.toLowerCase().includes(firstName))) ??
        items[0];
      return {
        result: {
          uri: match.uri,
          name: song.name,
          artist: song.artist,
          album: match.album?.name ?? '',
          albumArt: match.album?.images?.[0]?.url ?? '',
          year: song.year,
        },
        error: null,
      };
    } catch (e) {
      lastError = e instanceof Error ? `exception-${e.message}` : 'exception';
      continue;
    }
  }
  return { result: null, error: lastError };
}

export async function loadTracksForGenre(genre: string): Promise<TrackInfo[]> {
  const token = await getToken();
  if (!token) throw new Error('No Spotify token');

  const songs = GENRE_SONGS[genre];
  if (!songs) throw new Error(`Género no configurado: ${genre}`);

  // Pick 5 random songs, resolve sequentially to avoid Spotify dev-mode rate limits
  const picked = shuffleArray([...songs]).slice(0, 5);

  const tracks: TrackInfo[] = [];
  const errs: string[] = [];
  for (const song of picked) {
    const { result, error } = await findTrack(song, token);
    if (result) tracks.push(result);
    else errs.push(`${song.name}: ${error}`);
  }

  if (tracks.length === 0) throw new Error(`No resultados (${genre}). ${errs.join(' | ')}`);
  return tracks;
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
