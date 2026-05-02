import { BET_OPTIONS, STEAL_POINTS } from '../types';

export function getBasePoints(betSeconds: number): number {
  const opt = BET_OPTIONS.find((o) => o.seconds === betSeconds);
  return opt ? opt.points : 0;
}

export function calculateScore(
  betSeconds: number,
  gotArtist: boolean,
  gotSong: boolean,
  isSteal: boolean,
): number {
  if (isSteal) {
    let pts = STEAL_POINTS;
    if (gotArtist) pts += 1;
    if (gotSong) pts += 1;
    return pts;
  }
  const base = getBasePoints(betSeconds);
  let bonus = 0;
  if (gotArtist) bonus += 1;
  if (gotSong) bonus += 1;
  return base + bonus;
}

export function calculateSpeedScore(speedPoints: number, gotArtist: boolean): number {
  return speedPoints + (gotArtist ? 10 : 0);
}
