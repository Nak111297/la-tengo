import { useState, useEffect, useRef } from 'react';
import { subscribeTeams, subscribeGameState, sendBuzz, pushAction } from '../lib/firebase';
import type { SessionTeam, RemoteGameState } from '../lib/firebase';
import { BET_OPTIONS, GENRES, GENRE_ICONS, SPEED_DURATION } from '../types';
import RoundSummary from './RoundSummary';
import Finished from './Finished';

// ─── Timer hook ───────────────────────────────────────────────────────────────
function useRemoteTimer(gs: RemoteGameState | null) {
  const [timeLeft, setTimeLeft] = useState(0);
  const rafRef = useRef<number | null>(null);
  const timerStartedAt = gs?.timerStartedAt ?? null;
  const timerDuration = gs?.timerDuration ?? null;

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (!timerStartedAt || !timerDuration) {
      rafRef.current = requestAnimationFrame(() => setTimeLeft(0));
      return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }
    const tick = () => {
      const elapsed = (Date.now() - timerStartedAt) / 1000;
      const remaining = Math.max(timerDuration - elapsed, 0);
      setTimeLeft(remaining);
      if (remaining > 0) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [timerStartedAt, timerDuration]);

  return timeLeft;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Scoreboard({ teams, currentIdx, stealIdx, stealMode }: {
  teams: RemoteGameState['teams'];
  currentIdx: number;
  stealIdx: number | null;
  stealMode: boolean;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2 w-full px-2">
      {teams.map((t, i) => {
        const isActive = !stealMode && i === currentIdx;
        const isSteal  = stealMode && i === stealIdx;
        return (
          <div
            key={t.id}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 border transition"
            style={{
              borderColor: (isActive || isSteal) ? t.color : `${t.color}30`,
              background: (isActive || isSteal) ? `${t.color}18` : 'transparent',
              boxShadow: (isActive || isSteal) ? `0 0 12px ${t.color}50` : undefined,
            }}
          >
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: t.color }} />
            <span className="text-sm font-bold" style={{ color: (isActive || isSteal) ? t.color : '#94a3b8' }}>
              {t.name}
            </span>
            <span className="text-sm font-black" style={{ color: (isActive || isSteal) ? '#fff' : '#94a3b8' }}>
              {t.score}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function TimerBar({ timeLeft, total, color = '#FF2E88' }: { timeLeft: number; total: number; color?: string }) {
  const pct = total > 0 ? Math.max(timeLeft / total, 0) : 0;
  const isUrgent = pct < 0.25;
  return (
    <div className="w-full max-w-xs">
      <div className="flex justify-between text-xs font-bold mb-1" style={{ color: isUrgent ? '#FF2E88' : color }}>
        <span>Tiempo</span>
        <span>{Math.ceil(timeLeft)}s</span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct * 100}%`, background: isUrgent ? '#FF2E88' : color }}
        />
      </div>
    </div>
  );
}

function SpeedPointsMeter({ timeLeft }: { timeLeft: number }) {
  const points = Math.max(0, Math.round((timeLeft / SPEED_DURATION) * 100));
  const pct = Math.max(0, Math.min(points, 100));
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs font-bold uppercase tracking-widest text-qr-muted">Puntos en juego</p>
      <div
        className="flex h-28 w-28 items-center justify-center rounded-full border-4"
        style={{
          borderColor: pct < 25 ? '#FF2E88' : '#FFD23F',
          boxShadow: `0 0 26px ${pct < 25 ? '#FF2E8855' : '#FFD23F55'}`,
        }}
      >
        <span className="font-display text-5xl font-black text-qr-yellow tabular-nums">{points}</span>
      </div>
    </div>
  );
}

function ActionBtn({ label, sub, onClick, color, disabled = false }: {
  label: string; sub?: string; onClick: () => void; color: string; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center justify-center gap-1 rounded-[24px] border p-5 w-full transition active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
      style={{ borderColor: `${color}50`, background: `${color}12`, color }}
    >
      <span className="text-base font-black">{label}</span>
      {sub && <span className="text-[10px] text-qr-muted leading-tight text-center">{sub}</span>}
    </button>
  );
}

// ─── Phase views ──────────────────────────────────────────────────────────────

function WaitingView({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="h-8 w-8 rounded-full border-4 border-white/10 border-t-qr-primary animate-spin" />
      <p className="text-sm text-qr-muted text-center">{label}</p>
    </div>
  );
}

function GenreChoiceView({ gs, room, myTeamIdx }: { gs: RemoteGameState; room: string; myTeamIdx: number }) {
  const [done, setDone] = useState(false);
  const isMyTurn = myTeamIdx === gs.currentTeamIndex;
  const currentTeam = gs.teams[gs.currentTeamIndex];

  if (!isMyTurn) {
    return <WaitingView label={`${currentTeam?.name} está eligiendo género...`} />;
  }

  const select = (genre: string) => {
    if (done) return;
    setDone(true);
    pushAction(room, 'select-genre', { teamIndex: myTeamIdx, genre });
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-qr-muted">Tu turno</p>
        <h2 className="mt-1 font-display text-2xl font-bold" style={{ color: currentTeam?.color }}>
          Elegí género
        </h2>
      </div>
      <div className="grid w-full grid-cols-2 gap-2">
        {GENRES.map((genre) => (
          <button
            key={genre}
            onClick={() => select(genre)}
            disabled={done}
            className="flex items-center gap-2 rounded-[18px] border border-white/10 bg-qr-card/60 px-3 py-4 text-left text-sm font-bold text-qr-text transition active:scale-95 disabled:opacity-35"
          >
            <span className="text-lg">{GENRE_ICONS[genre] ?? '🎵'}</span>
            <span className="leading-tight">{genre}</span>
          </button>
        ))}
      </div>
      {done && <p className="text-xs text-qr-muted">Enviado al host…</p>}
    </div>
  );
}

function BetChoiceView({ gs, room, myTeamIdx }: { gs: RemoteGameState; room: string; myTeamIdx: number }) {
  const [done, setDone] = useState(false);
  const isMyTurn = myTeamIdx === gs.currentTeamIndex;
  const currentTeam = gs.teams[gs.currentTeamIndex];

  if (!isMyTurn) {
    return <WaitingView label={`${currentTeam?.name} está apostando tiempo...`} />;
  }

  const bet = (seconds: number) => {
    if (done) return;
    setDone(true);
    pushAction(room, 'bet-time', { teamIndex: myTeamIdx, seconds });
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-qr-muted">Tu turno</p>
        <h2 className="mt-1 font-display text-2xl font-bold" style={{ color: currentTeam?.color }}>
          Apostá tiempo
        </h2>
      </div>
      <div className="flex w-full flex-col gap-3">
        {BET_OPTIONS.map((opt) => (
          <button
            key={opt.seconds}
            onClick={() => bet(opt.seconds)}
            disabled={done}
            className="flex items-center justify-between rounded-[20px] border border-white/10 bg-qr-card/60 px-5 py-4 transition active:scale-95 disabled:opacity-35"
          >
            <span className="text-xl font-black text-qr-text">{opt.label}</span>
            <span className="text-lg font-black text-qr-yellow">{opt.points} pts</span>
          </button>
        ))}
      </div>
      {done && <p className="text-xs text-qr-muted">Enviado al host…</p>}
    </div>
  );
}

function PlayingView({ gs, room, myTeamIdx, timeLeft }: {
  gs: RemoteGameState; room: string; myTeamIdx: number | null; timeLeft: number;
}) {
  const [buzzing, setBuzzing] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const isSpeed = gs.gameMode === 'speed';
  const team = myTeamIdx !== null ? gs.teams[myTeamIdx] : null;
  // Firebase may return [] as null — always treat as array (firebase.ts normalizes, but belt-and-suspenders)
  const eliminated = myTeamIdx !== null && (gs.speedEliminatedTeams ?? []).includes(myTeamIdx);

  // In knowledge mode the active team changes during steal — use stealTeamIndex if in steal mode
  const activeBuzzTeam = gs.stealMode
    ? (gs.stealTeamIndex ?? gs.currentTeamIndex)
    : gs.currentTeamIndex;
  const canBuzz = myTeamIdx !== null && !eliminated && !sent && (
    isSpeed ? true : myTeamIdx === activeBuzzTeam
  );

  const handleBuzz = async () => {
    if (!canBuzz || buzzing || myTeamIdx === null) return;
    setBuzzing(true);
    setErr(null);
    const ok = await sendBuzz(room, myTeamIdx);
    setBuzzing(false);
    if (ok) {
      setSent(true);
      if ('vibrate' in navigator) navigator.vibrate(80);
      setTimeout(() => setSent(false), 2000);
    } else {
      setErr('Alguien llegó primero 😅');
      setTimeout(() => setErr(null), 2000);
    }
  };

  const isWaitingTurn = !isSpeed && myTeamIdx !== null && myTeamIdx !== activeBuzzTeam;

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {isSpeed ? (
        <SpeedPointsMeter timeLeft={timeLeft} />
      ) : (
        <TimerBar
          timeLeft={timeLeft}
          total={gs.timerDuration ?? gs.betSeconds ?? 30}
          color="#22D3EE"
        />
      )}

      {eliminated ? (
        <p className="text-qr-muted text-sm text-center">Eliminado de esta ronda</p>
      ) : isWaitingTurn ? (
        <div className="flex flex-col items-center gap-2 py-6">
          <p className="text-sm font-bold text-qr-muted text-center">
            {gs.stealMode
              ? `Robo de ${gs.teams[activeBuzzTeam]?.name}`
              : `Turno de ${gs.teams[activeBuzzTeam]?.name}`}
          </p>
          <p className="text-xs text-qr-muted/60 text-center">Esperando tu turno para responder</p>
        </div>
      ) : (
        <>
          <button
            onPointerDown={handleBuzz}
            disabled={buzzing || !canBuzz}
            className="h-52 w-52 rounded-full font-black text-2xl leading-tight select-none transition-transform"
            style={{
              background: sent
                ? `radial-gradient(circle, ${team?.color ?? '#FF2E88'}55, ${team?.color ?? '#FF2E88'}20)`
                : `radial-gradient(circle, ${team?.color ?? '#FF2E88'}30, ${team?.color ?? '#FF2E88'}08)`,
              border: `4px solid ${team?.color ?? '#FF2E88'}`,
              color: sent ? '#fff' : (team?.color ?? '#FF2E88'),
              boxShadow: sent
                ? `0 0 60px ${team?.color ?? '#FF2E88'}90, 0 0 120px ${team?.color ?? '#FF2E88'}40`
                : `0 0 28px ${team?.color ?? '#FF2E88'}50`,
              transform: buzzing ? 'scale(0.91)' : 'scale(1)',
            }}
          >
            {sent ? '✓\n¡Enviado!' : buzzing ? '…' : '¡QUE\nROLÓN!'}
          </button>

          {err && <p className="text-sm text-qr-red text-center">{err}</p>}
        </>
      )}
    </div>
  );
}

function GuessPromptView({ gs, room, myTeamIdx, timeLeft }: {
  gs: RemoteGameState; room: string; myTeamIdx: number; timeLeft: number;
}) {
  const [done, setDone] = useState(false);
  const send = (type: string) => {
    if (done) return;
    setDone(true);
    pushAction(room, type, { teamIndex: myTeamIdx });
  };

  const activeTeamIdx = gs.stealMode
    ? (gs.stealTeamIndex ?? gs.currentTeamIndex)
    : gs.currentTeamIndex;
  const team = gs.stealMode
    ? gs.teams[gs.stealTeamIndex ?? 0]
    : gs.teams[gs.currentTeamIndex];
  const isMyTurn = myTeamIdx === activeTeamIdx;

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {gs.gameMode === 'knowledge' && (
        <TimerBar timeLeft={timeLeft} total={gs.timerDuration ?? 30} color="#FFD23F" />
      )}

      <div
        className="rounded-full px-4 py-1.5 text-sm font-bold border"
        style={{ color: team?.color, borderColor: `${team?.color}50`, background: `${team?.color}15` }}
      >
        {gs.stealMode ? `🔥 Robo — ${team?.name}` : team?.name}
      </div>

      <p className="text-qr-muted text-sm text-center">
        {isMyTurn ? 'Decidan antes de que acabe el tiempo' : 'Esperando respuesta'}
      </p>

      {isMyTurn ? (
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <ActionBtn label="Ver respuesta" sub="solo tu equipo" color="#22c55e" onClick={() => send('got-it')} disabled={done} />
          <ActionBtn label="No la tenemos" sub={gs.stealMode ? 'nadie anota' : 'pasa a robo'} color="#FF2E88" onClick={() => send('wrong')} disabled={done} />
        </div>
      ) : (
        <WaitingView
          label={gs.stealMode
            ? `${team?.name} está intentando robar...`
            : `${team?.name} está respondiendo; si falla, ustedes pueden robar.`}
        />
      )}

      {done && <p className="text-xs text-qr-muted">Enviado al host…</p>}
    </div>
  );
}

function RevealView({ gs, room, myTeamIdx }: { gs: RemoteGameState; room: string; myTeamIdx: number }) {
  const [done, setDone] = useState(false);
  const send = (type: string) => {
    if (done) return;
    setDone(true);
    pushAction(room, type, { teamIndex: myTeamIdx });
  };
  const track = gs.currentTrack;
  const activeTeamIdx = gs.stealMode
    ? (gs.stealTeamIndex ?? gs.currentTeamIndex)
    : gs.currentTeamIndex;
  const activeTeam = gs.teams[activeTeamIdx];
  const canSeeAnswer = gs.gameMode !== 'knowledge' || gs.noneScored || myTeamIdx === activeTeamIdx;

  if (!canSeeAnswer) {
    return (
      <div className="flex flex-col items-center gap-5 w-full py-6">
        <div
          className="rounded-full px-4 py-1.5 text-sm font-bold border"
          style={{ color: activeTeam?.color, borderColor: `${activeTeam?.color}50`, background: `${activeTeam?.color}15` }}
        >
          {activeTeam?.name} está viendo la respuesta
        </div>
        <WaitingView label="La canción está oculta para que el robo siga limpio." />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {track && (
        <div className="flex items-center gap-3 rounded-[20px] border border-white/10 bg-qr-card/60 p-3 w-full max-w-xs">
          {track.albumArt && (
            <img src={track.albumArt} alt="" className="h-14 w-14 rounded-[12px] object-cover shrink-0" />
          )}
          <div className="min-w-0">
            <p className="font-black text-qr-text truncate">{track.name}</p>
            <p className="text-sm text-qr-muted truncate">{track.artist}</p>
            {track.year && <p className="text-xs text-qr-muted/60">{track.year}</p>}
          </div>
        </div>
      )}

      {!gs.noneScored && (
        <div className="flex flex-col gap-2 w-full max-w-xs">
          <ActionBtn label="Correcto" color="#22c55e" onClick={() => send('correct')} disabled={done} />
          <div className="grid grid-cols-2 gap-2">
            <ActionBtn label="Incorrecto" color="#FF2E88" onClick={() => send('wrong')} disabled={done} />
            <ActionBtn label="Sin puntos" color="#94a3b8" onClick={() => send('no-score')} disabled={done} />
          </div>
        </div>
      )}

      {gs.noneScored && (
        <ActionBtn label="Nadie anotó" sub="Continuar" color="#94a3b8" onClick={() => send('no-score')} disabled={done} />
      )}

      {done && <p className="text-xs text-qr-muted">Enviado al host…</p>}
    </div>
  );
}

function ScoreArtistView({ gs }: { gs: RemoteGameState }) {
  // The host's ScoreCheck screen handles the got-artist/got-song checkboxes.
  // Remote just shows who is being scored while the host confirms.
  const scoringIdx = gs.gameMode === 'speed'
    ? (gs.speedScoringTeamIndex ?? gs.currentTeamIndex)
    : (gs.stealMode ? (gs.stealTeamIndex ?? 0) : gs.currentTeamIndex);
  const team = gs.teams[scoringIdx];

  return (
    <div className="flex flex-col items-center gap-4 py-6 w-full">
      <p className="text-qr-muted text-sm text-center">El host está verificando la respuesta…</p>
      {team && (
        <div
          className="rounded-full px-5 py-2 border font-bold text-sm"
          style={{ color: team.color, borderColor: `${team.color}50`, background: `${team.color}15` }}
        >
          {team.name}
        </div>
      )}
      {gs.currentTrack && (
        <p className="text-xs text-qr-muted text-center">
          {gs.currentTrack.artist} — {gs.currentTrack.name}
        </p>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Buzz() {
  const params = new URLSearchParams(window.location.search);
  const room = (params.get('room') ?? '').toUpperCase();

  const [teams, setTeams] = useState<SessionTeam[]>([]);
  const [gs, setGs] = useState<RemoteGameState | null>(null);
  const [myTeamIdx, setMyTeamIdx] = useState<number | null>(() => {
    const saved = localStorage.getItem(`buzz-team-${room}`);
    return saved !== null ? parseInt(saved, 10) : null;
  });

  const timeLeft = useRemoteTimer(gs);

  useEffect(() => {
    if (!room) return;
    const unsubTeams = subscribeTeams(room, setTeams);
    const unsubGs = subscribeGameState(room, setGs);
    return () => { unsubTeams(); unsubGs(); };
  }, [room]);

  const pickTeam = (idx: number) => {
    setMyTeamIdx(idx);
    localStorage.setItem(`buzz-team-${room}`, String(idx));
  };

  if (!room) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="text-qr-muted text-center">Código de sala inválido.</p>
      </div>
    );
  }

  const myTeam = myTeamIdx !== null ? (gs?.teams[myTeamIdx] ?? teams[myTeamIdx]) : null;

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 px-4 py-8">
      {/* Header */}
      <div className="flex flex-col items-center gap-2 w-full">
        <div className="flex items-center justify-between w-full max-w-sm">
          <img src="/logorolon2.png" alt="Que Rolón" className="h-10 w-auto" />
          <div className="flex items-center gap-2">
            {myTeam && (
              <button
                onClick={() => { setMyTeamIdx(null); localStorage.removeItem(`buzz-team-${room}`); }}
                className="flex items-center gap-1.5 rounded-full px-3 py-1 border text-xs font-bold transition hover:opacity-80"
                style={{ color: myTeam.color, borderColor: `${myTeam.color}50`, background: `${myTeam.color}15` }}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: myTeam.color }} />
                {myTeam.name}
              </button>
            )}
            <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] font-bold text-qr-muted tracking-widest">
              {room}
            </span>
          </div>
        </div>

        {/* Scoreboard — always visible once game starts */}
        {gs && gs.phase !== 'setup' && gs.teams.length > 0 && (
          <Scoreboard
            teams={gs.teams}
            currentIdx={gs.currentTeamIndex}
            stealIdx={gs.stealTeamIndex}
            stealMode={gs.stealMode}
          />
        )}
      </div>

      {/* Team picker */}
      {myTeamIdx === null && (
        <div className="w-full max-w-sm">
          {teams.length === 0 ? (
            <WaitingView label="Conectando..." />
          ) : (
            <>
              <p className="mb-4 text-center text-sm font-bold uppercase tracking-widest text-qr-muted">
                ¿Cuál es tu equipo?
              </p>
              <div className="flex flex-col gap-3">
                {teams.map((t, idx) => (
                  <button
                    key={t.id}
                    onClick={() => pickTeam(idx)}
                    className="flex items-center gap-3 rounded-[20px] border border-white/10 bg-qr-card/60 p-4 transition active:scale-95"
                    style={{ borderColor: `${t.color}40` }}
                  >
                    <span className="h-5 w-5 rounded-full shrink-0" style={{ background: t.color, boxShadow: `0 0 10px ${t.color}80` }} />
                    <span className="font-display font-bold text-lg text-qr-text">{t.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Phase content */}
      {myTeamIdx !== null && (
        <div className="flex flex-col items-center gap-5 w-full max-w-sm">
          {!gs && <WaitingView label="Esperando que empiece la partida..." />}

          {gs?.phase === 'setup' && <WaitingView label="Esperando que empiece la partida..." />}

          {gs?.phase === 'genre-select' && (
            <GenreChoiceView gs={gs} room={room} myTeamIdx={myTeamIdx} />
          )}

          {gs?.phase === 'bet-time' && (
            <BetChoiceView gs={gs} room={room} myTeamIdx={myTeamIdx} />
          )}

          {gs?.phase === 'playing' && (
            <PlayingView
              key={`pl-${gs.round}-${gs.stealMode ? 'steal' : gs.currentTeamIndex}-${(gs.speedEliminatedTeams ?? []).length}`}
              gs={gs} room={room} myTeamIdx={myTeamIdx} timeLeft={timeLeft}
            />
          )}

          {gs?.phase === 'guess-prompt' && (
            // Key on phase+round so state resets each new prompt
            <GuessPromptView key={`gp-${gs.round}`} gs={gs} room={room} myTeamIdx={myTeamIdx} timeLeft={timeLeft} />
          )}

          {gs?.phase === 'reveal' && (
            <RevealView key={`rv-${gs.round}`} gs={gs} room={room} myTeamIdx={myTeamIdx} />
          )}

          {gs?.phase === 'score-artist' && (
            <ScoreArtistView key={`sa-${gs.round}`} gs={gs} />
          )}

          {gs?.phase === 'round-summary' && (
            <RoundSummary
              key={`rs-${gs.round}`}
              teams={gs.teams}
              round={gs.round}
              roundPoints={gs.roundPoints}
              onNext={() => {}}
              onEnd={() => {}}
              showActions={false}
            />
          )}

          {gs?.phase === 'finished' && (
            <Finished teams={gs.teams} onNewGame={() => {}} showNewGame={false} />
          )}
        </div>
      )}
    </div>
  );
}
