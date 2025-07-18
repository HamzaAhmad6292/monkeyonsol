// app/share/[id]/page.tsx
import { store } from '@/app/api/upload/route';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const imagePath = store[params.id];
  const fullImageUrl = `${"https://monkeyonsol.xyz"}${imagePath}`;

  if (!imagePath) return {};

  return {
    title: "My Monkey Art 🐵🎨",
    description: "Shared with Monkey Canvas Pro",
    openGraph: {
      images: [fullImageUrl],
    },
    twitter: {
      card: "summary_large_image",
      title: "My Monkey Art 🐵🎨",
      description: "Shared with Monkey Canvas Pro",
      images: [fullImageUrl],
    },
  };
}

export default function SharePage({ params }: { params: { id: string } }) {
  const imagePath = store[params.id];

  if (!imagePath) return notFound();

  return (
    <main style={{ textAlign: "center", padding: "2rem" }}>
      <h1>🐵 My Art on Monkey Canvas Pro 🎨</h1>
      <p>This page is meant for sharing on social platforms.</p>
      <img
        src={imagePath}
        alt="Shared Art"
        style={{ maxWidth: "100%", borderRadius: "16px", marginTop: "1rem" }}
      />
    </main>
  );
}
