// app/pdf/page.tsx
'use client';

import { useEffect, useRef } from 'react';

export default function PDFViewerPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      // To refresh in some mobile cases if needed
      iframe.src = iframe.src;
    }
  }, []);

  return (
    <div style={{ height: '100dvh', width: '100vw', overflow: 'hidden', padding: 0, margin: 0 }}>
      <iframe
        ref={iframeRef}
        src="/WhitePaper.pdf"
        title="White Paper PDF"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
      />
    </div>
  );
}
