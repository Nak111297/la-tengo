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
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
      <p className="text-3xl">🎵</p>
      <div className="text-center">
        <h2 className="text-xl font-black text-white">¿Dónde suena la música?</h2>
        <p className="mt-1 text-sm text-zinc-400">Abre Spotify en el dispositivo que quieras usar y tócalo aquí</p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        {loading ? (
          <p className="text-center text-zinc-500 animate-pulse">Buscando dispositivos...</p>
        ) : devices.length === 0 ? (
          <p className="text-center text-zinc-500 text-sm">No se encontraron dispositivos.<br />Abre Spotify en tu teléfono o computadora.</p>
        ) : (
          devices.map(d => (
            <button
              key={d.id}
              onClick={() => onSelect(d.id)}
              className="flex w-full items-center gap-4 rounded-2xl border border-zinc-700 bg-zinc-900 px-5 py-4 text-left transition hover:border-purple-500 active:scale-95"
            >
              <span className="text-2xl">{DEVICE_ICON[d.type] ?? '🔈'}</span>
              <div>
                <p className="font-bold text-white">{d.name}</p>
                <p className="text-xs text-zinc-500">{d.type}{d.is_active ? ' · activo' : ''}</p>
              </div>
            </button>
          ))
        )}
      </div>

      <button
        onClick={refresh}
        className="rounded-xl border border-zinc-700 px-6 py-2 text-sm text-zinc-400 hover:text-white"
      >
        ↺ Actualizar lista
      </button>
    </div>
  );
}
