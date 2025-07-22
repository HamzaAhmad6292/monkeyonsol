// app/pdf/page.tsx
'use client';

export default function PDFViewerPage() {
  const pdfUrl = 'https://monkeyonsol.xyz/WhitePaper.pdf'; // Replace with full URL if deployed

  return (
    <div style={{ height: '100dvh', width: '100vw', overflow: 'hidden', padding: 0, margin: 0 }}>
      <iframe
        src={`https://docs.google.com/gview?url=${pdfUrl}&embedded=true`}
        title="White Paper PDF"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        allowFullScreen
      />
    </div>
  );
}
