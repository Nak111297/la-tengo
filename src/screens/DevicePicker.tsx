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
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 bg-zinc-950">
      <div className="text-center">
        <div className="mb-4 text-4xl">🔊</div>
        <h2 className="text-2xl font-black text-white">¿Dónde suena la música?</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Abrí Spotify en el dispositivo que vas a usar y tocalo aquí
        </p>
      </div>

      <div className="w-full max-w-sm space-y-2">
        {loading ? (
          <div className="py-8 text-center text-zinc-500 animate-pulse text-sm">
            Buscando dispositivos...
          </div>
        ) : devices.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center text-sm text-zinc-500">
            No se encontraron dispositivos.<br />
            <span className="text-zinc-400">Abrí Spotify en tu celular o computadora.</span>
          </div>
        ) : (
          devices.map(d => (
            <button
              key={d.id}
              onClick={() => onSelect(d.id)}
              className="flex w-full items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-4 text-left transition hover:border-fuchsia-500 hover:bg-zinc-800 active:scale-95"
            >
              <span className="text-2xl">{DEVICE_ICON[d.type] ?? '🔈'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white truncate">{d.name}</p>
                <p className="text-xs text-zinc-500">{d.type}{d.is_active ? ' · activo' : ''}</p>
              </div>
              {d.is_active && (
                <span className="h-2 w-2 rounded-full bg-green-400 shrink-0" />
              )}
            </button>
          ))
        )}
      </div>

      <button
        onClick={refresh}
        className="rounded-xl border border-zinc-800 px-6 py-2 text-sm text-zinc-500 transition hover:border-zinc-600 hover:text-white"
      >
        ↺ Actualizar lista
      </button>
    </div>
  );
}
