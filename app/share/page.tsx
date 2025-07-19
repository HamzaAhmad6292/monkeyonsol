import type { Metadata } from 'next'

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { [key: string]: string | string[] | undefined }
}): Promise<Metadata> {
  const imageUrl = Array.isArray(searchParams.image) 
    ? searchParams.image[0] 
    : searchParams.image

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
    title: 'Monkey Art',
    description: 'Check out this amazing monkey art creation!',
    openGraph: imageUrl ? {
      images: [
        {
          url: `/api/og?image=${encodeURIComponent(imageUrl)}`,
          width: 1200,
          height: 630,
        },
      ],
    } : undefined,
    twitter: imageUrl ? {
      card: 'summary_large_image',
      images: [
        {
          url: `/api/og?image=${encodeURIComponent(imageUrl)}`,
          width: 1200,
          height: 630,
          alt: 'Monkey Art Creation',
        },
      ],
    } : undefined,
  }
}

export default function SharePage({
  searchParams,
}: {
  searchParams: { image?: string | string[] }
}) {
  const imageUrl = Array.isArray(searchParams.image) 
    ? searchParams.image[0] 
    : searchParams.image

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {imageUrl ? (
        <div className="max-w-2xl w-full">
          <img 
            src={imageUrl} 
            alt="Monkey Art" 
            className="w-full h-auto rounded-lg shadow-xl"
          />
        </div>
      ) : (
        <p>No image found</p>
      )}
    </div>
  )
}