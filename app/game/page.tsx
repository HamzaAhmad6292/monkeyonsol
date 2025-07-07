// app/game/page.tsx or pages/game.tsx (based on your setup)
'use client';

import { useEffect, useState } from 'react';

export default function GamePage() {
  const [isMobile, setIsMobile] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const gameURL = 'https://keen-griffin-31c725.netlify.app';

  useEffect(() => {
    const mobileRegex = /iPhone|iPad|iPod|Android/i;
    const isPhone = mobileRegex.test(navigator.userAgent);

    if (isPhone) {
      setIsMobile(true);
      window.location.href = gameURL; // open in new tab (auto-redirect)
    }
  }, []);

  if (isMobile) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        background: '#000',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem',
      }}>
        Redirecting to game...
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#000' }}>
      {!loaded && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '1.2rem',
            zIndex: 10,
          }}
        >
          Loading Monkey on Sol…
        </div>
      )}
      <iframe
        src={gameURL}
        title="Monkey on Sol"
        allow="fullscreen; autoplay; encrypted-media"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          visibility: loaded ? 'visible' : 'hidden',
        }}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
