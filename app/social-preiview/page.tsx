export const metadata = {
  title: 'Social Metadata - Cruip Tutorials',
  description:
    "A guide on how to optimize SEO with static and dynamic metatags using Next.js 13's new Metadata API.",
}

// import Banner from '@/components/banner'

export default function SocialPreviewPage() {
  return (
    <>
      <main className="relative min-h-screen flex flex-col justify-center bg-slate-900 overflow-hidden">
        <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-24">
          <div className="text-center">

            <div className="font-extrabold text-3xl md:text-4xl [text-wrap:balance] bg-clip-text text-transparent bg-gradient-to-r from-slate-200/60 to-50% to-slate-200">Generate Dynamic Open Graph and Twitter Images in Next.js</div>
            <p className="text-lg text-slate-500 mt-4">Share this page on Facebook and Twitter to see the preview image</p>

          </div>
        </div>
      </main>

    </>
  )
}