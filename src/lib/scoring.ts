import { BET_OPTIONS, STEAL_POINTS } from '../types';

export function getBasePoints(betSeconds: number): number {
  const opt = BET_OPTIONS.find((o) => o.seconds === betSeconds);
  return opt ? opt.points : 0;
}

export function calculateScore(
  betSeconds: number,
  gotArtist: boolean,
  _gotSong: boolean,  // kept for API compatibility — no longer grants bonus
  isSteal: boolean,
): number {
  if (isSteal) {
    return STEAL_POINTS + (gotArtist ? 1 : 0);
  }
  const base = getBasePoints(betSeconds);
  return base + (gotArtist ? 1 : 0);
}

export function calculateSpeedScore(speedPoints: number, gotArtist: boolean): number {
  return speedPoints + (gotArtist ? 10 : 0);
}
