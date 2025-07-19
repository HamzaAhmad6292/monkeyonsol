import { NextRequest, NextResponse } from 'next/server';
import { BlobClient } from '@vercel/blob';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  try {
    const buf = await req.arrayBuffer();
    const blobClient = new BlobClient();
    // auto‐generates a unique path under “images/…”
    const { path } = await blobClient.upload(new Uint8Array(buf), {
      dir: 'images',
      maxSize: 5_000_000, // 5 MB limit
      contentType: req.headers.get('content-type') || 'application/octet-stream',
    });
    // this is your publicly‐readable URL
    const url = blobClient.getUrl(path);
    return NextResponse.json({ url, path });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
