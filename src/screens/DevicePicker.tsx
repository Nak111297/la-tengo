import { useState, useEffect, useCallback } from 'react';
import { getDevices } from '../lib/spotify-player';

interface SpotifyDevice {
  id: string | null;
  name: string;
  type: string;
  is_active: boolean;
}

const DEVICE_ICON: Record<string, string> = {
  Smartphone: '📱',
  Computer: '💻',
  Speaker: '🔊',
  TV: '📺',
  CastAudio: '🔊',
  CastVideo: '📺',
};

const DEVICE_LABEL: Record<string, string> = {
  Smartphone: 'Teléfono',
  Computer: 'Computadora',
  Speaker: 'Bocina',
  TV: 'TV',
  CastAudio: 'Bocina',
  CastVideo: 'TV',
};

interface Props {
  onSelect: (deviceId: string | null) => void;
}

export default function DevicePicker({ onSelect }: Props) {
  const [devices, setDevices] = useState<SpotifyDevice[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const list = await getDevices();
    const filtered = list.filter(device => Boolean(device.id) || device.is_active);
    setDevices(filtered);
    setSelectedId((current) => {
      if (current && filtered.some((device) => (device.id ?? 'active') === current)) return current;
      return filtered[0] ? (filtered[0].id ?? 'active') : null;
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(refresh, 0);
    const interval = window.setInterval(refresh, 4000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
    };
  }, [refresh]);

  const handleManualRefresh = () => {
    setLoading(true);
    void refresh();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6">
      <div className="text-center">
        <div className="mb-4 text-5xl">🔊</div>
        <h2 className="text-2xl font-display font-bold text-qr-text">¿Dónde suena la música?</h2>
        <p className="mt-2 text-sm text-qr-muted">
          Abre Spotify, toca play en cualquier canción, y aparecerá acá
        </p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        {loading ? (
          <div className="py-8 text-center text-qr-muted text-sm animate-pulse">
            Buscando dispositivos...
          </div>
        ) : devices.length === 0 ? (
          <>
            <div className="rounded-[24px] border border-white/10 bg-qr-card/80 p-6 text-center text-sm text-qr-muted">
              No encontramos un dispositivo activo.<br />
              <span className="text-qr-text/70">Abre Spotify en el dispositivo que vas a usar y vuelve a intentar.</span>
            </div>
            <button
              onClick={() => onSelect('active')}
              className="w-full rounded-full border border-white/15 py-3 text-sm font-bold text-qr-muted transition hover:border-qr-cyan hover:text-qr-cyan active:scale-95"
            >
              Continuar sin seleccionar
            </button>
          </>
        ) : (
          devices.map(d => (
            <button
              key={d.id ?? `${d.name}-${d.type}-active`}
              onClick={() => setSelectedId(d.id ?? 'active')}
              className={`flex w-full items-center gap-4 rounded-[20px] border px-5 py-4 text-left transition hover:border-qr-primary/50 active:scale-95 ${
                selectedId === (d.id ?? 'active')
                  ? 'border-qr-cyan/70 bg-qr-cyan/10 shadow-[0_0_18px_rgba(34,211,238,0.16)]'
                  : 'border-white/10 bg-qr-card/60 hover:bg-qr-card'
              }`}
            >
              <span className="text-2xl">{DEVICE_ICON[d.type] ?? '🔈'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-qr-text truncate">{d.name}</p>
                <p className="text-xs text-qr-muted">
                  {DEVICE_LABEL[d.type] ?? d.type}{d.is_active ? ' · activo' : ''}{!d.id ? ' · reproducción actual' : ''}
                </p>
              </div>
              {selectedId === (d.id ?? 'active') ? (
                <span className="rounded-full bg-qr-cyan px-2 py-0.5 text-[10px] font-black text-qr-bg">✓</span>
              ) : d.is_active && (
                <span className="rounded-full bg-qr-green/20 px-2 py-0.5 text-[10px] font-bold text-qr-green">activo</span>
              )}
            </button>
          ))
        )}
      </div>

      {devices.length > 0 && !loading && (
        <button
          onClick={() => onSelect(selectedId)}
          disabled={!selectedId}
          className="w-full max-w-sm rounded-full bg-qr-primary py-4 text-base font-black text-qr-text shadow-[0_0_24px_rgba(255,46,136,0.45)] transition hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
        >
          Continuar
        </button>
      )}

      <button
        onClick={handleManualRefresh}
        className="rounded-full border border-white/15 px-6 py-2 text-sm font-bold text-qr-muted transition hover:border-qr-cyan hover:text-qr-cyan"
      >
        ↺ Actualizar dispositivos
      </button>
    </div>
  );
}
