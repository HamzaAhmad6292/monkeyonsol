// pages/monkey.tsx
"use client"

import { useState } from 'react';

export default function MonkeyOnSol() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#000' }}>
      {!loaded && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%' ,
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
        src="https://keen-griffin-31c725.netlify.app"
        title="Monkey on Sol"
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
