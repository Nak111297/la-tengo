import { useState, useEffect } from 'react';
import { subscribeTeams, sendBuzz } from '../lib/firebase';
import type { SessionTeam } from '../lib/firebase';

export default function Buzz() {
  const params = new URLSearchParams(window.location.search);
  const room = (params.get('room') ?? '').toUpperCase();

  const [teams, setTeams] = useState<SessionTeam[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(() => {
    const saved = localStorage.getItem(`buzz-team-${room}`);
    return saved !== null ? parseInt(saved, 10) : null;
  });
  const [buzzing, setBuzzing] = useState(false);
  const [sent, setSent] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!room) return;
    return subscribeTeams(room, setTeams);
  }, [room]);

  useEffect(() => {
    if (!sent) return;
    const t = setTimeout(() => setSent(false), 1500);
    return () => clearTimeout(t);
  }, [sent]);

  const pickTeam = (idx: number) => {
    setSelectedTeam(idx);
    localStorage.setItem(`buzz-team-${room}`, String(idx));
  };

  const handleBuzz = async () => {
    if (selectedTeam === null || buzzing) return;
    setBuzzing(true);
    setErrMsg(null);
    const ok = await sendBuzz(room, selectedTeam);
    setBuzzing(false);
    if (ok) {
      setSent(true);
      if ('vibrate' in navigator) navigator.vibrate(80);
    } else {
      setErrMsg('Alguien llegó primero 😅');
    }
  };

  if (!room) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="text-qr-muted text-center">Código de sala inválido.</p>
      </div>
    );
  }

  const team = selectedTeam !== null ? teams[selectedTeam] : null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6">
      <div className="flex flex-col items-center gap-2">
        <img src="/logorolon2.png" alt="Que Rolón" className="h-14 w-auto" />
        <span className="rounded-full bg-white/8 px-3 py-0.5 text-xs font-bold text-qr-muted tracking-widest">
          Sala {room}
        </span>
      </div>

      {teams.length === 0 ? (
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-4 border-white/10 border-t-qr-primary animate-spin" />
          <p className="text-sm text-qr-muted">Conectando...</p>
        </div>
      ) : selectedTeam === null ? (
        <div className="w-full max-w-sm">
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
                <span
                  className="h-5 w-5 rounded-full flex-shrink-0"
                  style={{ background: t.color, boxShadow: `0 0 10px ${t.color}80` }}
                />
                <span className="font-display font-bold text-lg text-qr-text">
                  {t.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-8 w-full max-w-xs">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5"
            style={{
              background: `${team!.color}20`,
              border: `1px solid ${team!.color}50`,
            }}
          >
            <span
              className="h-3 w-3 rounded-full"
              style={{ background: team!.color }}
            />
            <span className="font-bold text-sm" style={{ color: team!.color }}>
              {team!.name}
            </span>
          </div>

          <button
            onPointerDown={handleBuzz}
            disabled={buzzing}
            className="h-56 w-56 rounded-full font-black text-2xl leading-tight select-none"
            style={{
              background: sent
                ? `radial-gradient(circle, ${team!.color}55, ${team!.color}20)`
                : `radial-gradient(circle, ${team!.color}30, ${team!.color}08)`,
              border: `4px solid ${team!.color}`,
              color: sent ? '#fff' : team!.color,
              boxShadow: sent
                ? `0 0 60px ${team!.color}90, 0 0 120px ${team!.color}40`
                : `0 0 28px ${team!.color}50`,
              transform: buzzing ? 'scale(0.91)' : 'scale(1)',
              transition: 'all 0.15s',
            }}
          >
            {sent ? '✓\n¡Enviado!' : buzzing ? '…' : '¡QUE\nROLÓN!'}
          </button>

          {errMsg && (
            <p className="text-sm text-qr-red text-center">{errMsg}</p>
          )}

          <button
            onClick={() => {
              setSelectedTeam(null);
              setErrMsg(null);
            }}
            className="text-xs text-qr-muted/50 hover:text-qr-muted transition"
          >
            Cambiar equipo
          </button>
        </div>
      )}
    </div>
  );
}
