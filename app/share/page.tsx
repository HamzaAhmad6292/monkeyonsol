import type { Metadata } from 'next'

export const metadataBase = new URL('https://monkeyonsol.xyz')

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { image?: string | string[] }
}): Promise<Metadata> {
  const imageParam = Array.isArray(searchParams.image) 
    ? searchParams.image[0] 
    : searchParams.image
  const imageUrl = imageParam ? decodeURIComponent(imageParam) : null

  if (!imageUrl) {
    return {
      title: 'Monkey Art',
      description: 'Share your monkey art creations',
    }
  }

  const ogImageUrl = new URL(`/api/og?image=${encodeURIComponent(imageUrl)}`, metadataBase)

  return {
    title: 'Monkey Art',
    description: 'Check out this amazing monkey art creation!',
    openGraph: {
      images: [{
        url: ogImageUrl.toString(),
        width: 1200,
        height: 630,
      }]
    },
    twitter: {
      card: 'summary_large_image',
      images: [{
        url: ogImageUrl.toString(),
        width: 1200,
        height: 630,
        alt: 'Monkey Art Creation',
      }]
    }
  }
}