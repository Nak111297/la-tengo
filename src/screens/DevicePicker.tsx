import { useState, useEffect } from 'react';
import { getDevices } from '../lib/spotify-player';

interface SpotifyDevice {
  id: string;
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

interface Props {
  onSelect: (deviceId: string) => void;
}

export default function DevicePicker({ onSelect }: Props) {
  const [devices, setDevices] = useState<SpotifyDevice[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const list = await getDevices();
    setDevices(list);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6">
      <div className="text-center">
        <div className="mb-4 text-5xl">🔊</div>
        <h2 className="text-2xl font-display font-bold text-qr-text">¿Dónde suena la música?</h2>
        <p className="mt-2 text-sm text-qr-muted">
          Abrí Spotify en el dispositivo que vas a usar
        </p>
      </div>

      <div className="w-full max-w-sm space-y-2">
        {loading ? (
          <div className="py-8 text-center text-qr-muted text-sm animate-pulse">
            Buscando dispositivos...
          </div>
        ) : devices.length === 0 ? (
          <div className="rounded-[24px] border border-white/10 bg-qr-card/80 p-6 text-center text-sm text-qr-muted">
            No se encontraron dispositivos.<br />
            <span className="text-qr-text/60">Abrí Spotify en tu celular o computadora.</span>
          </div>
        ) : (
          devices.map(d => (
            <button
              key={d.id}
              onClick={() => onSelect(d.id)}
              className="flex w-full items-center gap-4 rounded-[20px] border border-white/10 bg-qr-card/60 px-5 py-4 text-left transition hover:border-qr-primary/50 hover:bg-qr-card active:scale-95"
            >
              <span className="text-2xl">{DEVICE_ICON[d.type] ?? '🔈'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-qr-text truncate">{d.name}</p>
                <p className="text-xs text-qr-muted">{d.type}{d.is_active ? ' · activo' : ''}</p>
              </div>
              {d.is_active && (
                <span className="h-2 w-2 rounded-full bg-qr-green shrink-0" />
              )}
            </button>
          ))
        )}
      </div>

      <button
        onClick={refresh}
        className="rounded-full border border-white/15 px-6 py-2 text-sm font-bold text-qr-muted transition hover:border-qr-cyan hover:text-qr-cyan"
      >
        ↺ Actualizar lista
      </button>
    </div>
  );
}
