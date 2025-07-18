// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'crypto';

// In-memory store: id -> image path
const store: Record<string, string> = {};

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ success: false, message: "No file received" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const folderPath = join(process.cwd(), "public", "temp");
  if (!existsSync(folderPath)) mkdirSync(folderPath, { recursive: true });

  const id = randomUUID();
  const fileName = `monkey_${id}.jpg`;
  const filePath = join(folderPath, fileName);

  writeFileSync(filePath, buffer);
  const imageUrl = `/temp/${fileName}`; // Relative path

  // Store mapping for share page
  store[id] = imageUrl;

  return NextResponse.json({ success: true, id, url: imageUrl });
}

// For SharePage to access this in-memory store
export { store };
