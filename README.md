# La Tengo — Adivina la cancion antes que todos

Turn-based music guessing party game powered by Spotify. Teams pick a genre, bet how many seconds they need to identify the song, and compete for points.

## Setup

### 1. Create a Spotify App

1. Go to https://developer.spotify.com/dashboard
2. Create a new app
3. Set redirect URI to `http://localhost:5173`
4. Copy the Client ID

### 2. Run the app

```bash
cp .env.example .env
# Edit .env with your Spotify Client ID

npm install
npm run dev
```

Open http://localhost:5173 on your phone or computer.

**Requirement:** The host needs Spotify Premium for the Web Playback SDK.

## How to Play

1. Connect with Spotify (host only)
2. Create teams (2-8)
3. Each turn:
   - Current team picks a **genre**
   - Team **bets** how many seconds they need (3s=5pts, 5s=4pts, 10s=3pts, 30s=2pts)
   - Song plays for that duration, then stops
   - If someone guesses: they pick up the phone, see the answer, confirm if correct
   - **Bonus:** +1 for getting the artist, +1 for the song name
   - If wrong: other team gets a **steal** attempt (30 seconds, 1 base point)
4. Highest score wins

## Scoring

| Bet | Base Points |
|-----|-------------|
| 3 seconds | 5 |
| 5 seconds | 4 |
| 10 seconds | 3 |
| 30 seconds | 2 |

- Artist correct: +1 bonus
- Song name correct: +1 bonus
- Steal: 1 base point + bonuses

## Tech Stack

- Vite + React + TypeScript
- Tailwind CSS
- Spotify Web Playback SDK (playback control)
- Spotify Web API (playlist/track search)
- PKCE auth flow (no backend needed)

## Project Structure

```
src/
  App.tsx              # Main router/state machine
  types.ts             # All TypeScript types
  lib/
    spotify.ts         # OAuth PKCE auth
    spotify-player.ts  # Web Playback SDK + API calls
    scoring.ts         # Point calculation
    scoring.test.ts    # Unit tests
    useGame.ts         # Game state hook
  screens/
    Login.tsx          # Spotify connect
    Setup.tsx          # Team creation
    GenreSelect.tsx    # Genre picker
    BetTime.tsx        # Time bet selection
    Playing.tsx        # Countdown timer
    GuessPrompt.tsx    # "Did someone guess it?"
    Reveal.tsx         # Show answer
    ScoreCheck.tsx     # Award bonuses
    RoundSummary.tsx   # Scoreboard
```

## Commands

```bash
npm run dev          # Dev server
npm run build        # Production build
npx vitest run       # Run tests
```

## Known Limitations

- Requires Spotify Premium on the host device
- Playlist selection is based on Spotify search — results vary
- No persistent storage (game resets on refresh)
- Single-device only (no remote player joining)

## Roadmap

- [ ] localStorage persistence for game state
- [ ] Custom playlist URL input
- [ ] PWA support for mobile install
- [ ] Sound effects and animations
- [ ] Remote player joining via QR code
- [ ] Game history and statistics
