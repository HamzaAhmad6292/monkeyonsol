import type { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  { searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const imageUrl = Array.isArray(searchParams.image) 
    ? searchParams.image[0]
    : searchParams.image;

  return {
    title: 'My Monkey Art',
    description: 'Check out this amazing art created with Monkey Picasso!',
    openGraph: {
      images: [imageUrl || '/default-image.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'My Monkey Art',
      description: 'Check out this amazing art created with Monkey Picasso!',
      images: [imageUrl || '/default-image.png'],
    },
  };
}

export default function SharePage({ searchParams }: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const imageUrl = Array.isArray(searchParams.image) 
    ? searchParams.image[0]
    : searchParams.image;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <h1 className="text-3xl font-bold mb-8 text-center">Your Monkey Art</h1>
      
      {imageUrl ? (
        <div className="max-w-2xl w-full bg-white p-6 rounded-xl shadow-lg">
          <img 
            src={imageUrl} 
            alt="Monkey Art" 
            className="w-full h-auto rounded-lg border border-gray-200"
          />
          <div className="mt-6 flex justify-center">
            <a 
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("Check out my monkey art!")}&url=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-full flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              Share on Twitter
            </a>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl text-red-600 mb-4">Image Not Found</h2>
          <p className="text-gray-600">
            Please go back and create your artwork first
          </p>
        </div>
      )}
    </div>
  );
}