import { useState } from 'react';
import { redirectToSpotifyAuth } from '../lib/spotify';
import { PLAYABLE_GENRES } from '../types';
import Brand from '../components/Brand';

export default function Login() {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');
  const connect = async () => {
    setConnecting(true);
    setError('');
    try {
      await redirectToSpotifyAuth();
    } catch {
      setError('No pudimos conectar. Intentá de nuevo.');
      setConnecting(false);
    }
  };

  return (
    <main className="welcome">
      <header className="site-header">
        <Brand />
        <a className="quiet-link" href="#como-jugar">
          Cómo se juega <span aria-hidden="true">↗</span>
        </a>
      </header>
      <section className="welcome-hero" aria-labelledby="welcome-title">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="status-dot" /> EL PLAN DE HOY: MÚSICA Y AMIGOS
          </p>
          <h1 id="welcome-title">
            Esa canción.
            <br />
            Vos <em>la tenés.</em>
          </h1>
          <p className="hero-description">
            Unos segundos, una canción y la gloria de decir
            <br className="desktop-break" /> “¡yo la sabía!”. Armá tu equipo y
            que suene el juego.
          </p>
          <button
            onClick={connect}
            disabled={connecting}
            className="spotify-button"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 fill-current shrink-0"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            {connecting ? 'Conectando…' : 'Conectar con Spotify'}
            <span aria-hidden="true">→</span>
          </button>
          <p className="connection-note">
            Spotify Premium · Solo quien organiza se conecta
          </p>
          {error && (
            <p role="alert" className="text-sm text-qr-red mt-3">
              {error}
            </p>
          )}
          <div className="hero-facts">
            <span>
              <strong>2–8</strong> equipos
            </span>
            <span>
              <strong>{PLAYABLE_GENRES.length}</strong> géneros
            </span>
            <span>
              <strong>2</strong> modos de juego
            </span>
          </div>
        </div>
        <div className="record-scene" aria-hidden="true">
          <div className="record-orbit" />
          <div className="record-sticker">
            DALE PLAY
            <br />A LA NOCHE ↗
          </div>
          <div className="vinyl">
            <div className="vinyl-label">
              <span>QUE ROLÓN · VOL. 01</span>
              <strong>
                ¿La
                <br />
                tenés?
              </strong>
              <i />
              <small>LADO A · BUENOS MOMENTOS</small>
            </div>
          </div>
          <div className="song-ticket">
            <span className="ticket-icon">♪</span>
            <div>
              <small>EL RETO</small>
              <strong>Reconocela en 3 segundos.</strong>
            </div>
            <span className="ticket-bars">▂▅▃▇▅</span>
          </div>
          <span className="scene-star">✳</span>
        </div>
      </section>
      <section
        id="como-jugar"
        className="how-section"
        aria-labelledby="how-title"
      >
        <div className="how-heading">
          <p className="eyebrow">POCAS REGLAS. MUCHOS ROLONES.</p>
          <h2 id="how-title">Tu próxima noche empieza así.</h2>
        </div>
        <ol className="how-steps">
          <li>
            <span className="step-number">01</span>
            <div>
              <h3>Reuní a tu gente</h3>
              <p>Conectá Spotify y armá de 2 a 8 equipos.</p>
            </div>
          </li>
          <li>
            <span className="step-number">02</span>
            <div>
              <h3>Elegí tu reto</h3>
              <p>Apostá segundos o competí por responder primero.</p>
            </div>
          </li>
          <li>
            <span className="step-number">03</span>
            <div>
              <h3>Gritá “¡la tengo!”</h3>
              <p>Adiviná la canción y el artista. Sumá puntos.</p>
            </div>
          </li>
        </ol>
      </section>
      <footer className="welcome-footer">
        <span>Hecho para cantar, competir y repetir.</span>
        <span>Una buena canción siempre une.</span>
      </footer>
    </main>
  );
}
