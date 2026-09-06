import { useEffect, useState } from 'react';

export default function StealAnnouncement() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timeout = window.setTimeout(() => setVisible(false), 1200);
    return () => window.clearTimeout(timeout);
  }, []);
  if (!visible) return null;
  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-qr-red/90 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-4">
        <span className="text-8xl" aria-hidden="true">
          🔥
        </span>
        <span className="font-display text-6xl font-black text-white">
          ROBO
        </span>
      </div>
    </div>
  );
}
