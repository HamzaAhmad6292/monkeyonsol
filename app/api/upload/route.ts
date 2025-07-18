import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ success: false, message: 'No file received' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const fileName = `monkey_${randomUUID()}.png`;
  const filePath = path.join(process.cwd(), 'public', 'temp', fileName);

  fs.writeFileSync(filePath, buffer);

  const imageUrl = `${req.nextUrl.origin}/temp/${fileName}`;

  return NextResponse.json({ success: true, url: imageUrl });
}
