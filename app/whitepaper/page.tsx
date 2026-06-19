'use client';

import { useEffect, useState } from 'react';

export default function PDFViewerPage() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    // Ensure it's only set on client after hydration
    setPdfUrl(
      'https://monkeyonsol.xyz/WhitePaper.pdf' // Replace with your real domain
    );
  }, []);

  if (!pdfUrl) {
    return <div>Loading...</div>; // Avoid SSR mismatch
  }

  return (
    <div style={{ height: '100dvh', width: '100vw', margin: 0, padding: 0 }}>
      <iframe
        src={`https://docs.google.com/gview?url=${encodeURIComponent(pdfUrl)}&embedded=true`}
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="White Paper PDF"
        allowFullScreen
      />
    </div>
  );
}
