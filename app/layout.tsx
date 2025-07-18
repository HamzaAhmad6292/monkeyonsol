// app/layout.tsx
export const metadata = {
  title: "My Site",
  description: "A great site built with Next.js",

  // You can nest openGraph and twitter configs:
  openGraph: {
    title: "My Site",
    description: "A great site built with Next.js",
    images: [
      {
        url: "https://example.com/og-image.jpg",
        alt: "Site preview image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@YourSite",
    creator: "@AuthorHandle",
    title: "My Site",
    description: "A great site built with Next.js",
    images: ["https://example.com/og-image.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
