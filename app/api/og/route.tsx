import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get('image')

  if (!imageUrl) {
    return new Response('Missing image parameter', { status: 400 })
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          background: '#f6f6f6',
          width: '100%',
          height: '100%',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px',
        }}
      >
        <img 
          src={imageUrl} 
          alt="Monkey Art" 
          style={{
            width: '80%',
            height: '80%',
            objectFit: 'contain',
            borderRadius: '20px',
            border: '10px solid white',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}
        />
        <div style={{ fontSize: 40, marginTop: 20 }}>Monkey Picasso Art</div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}