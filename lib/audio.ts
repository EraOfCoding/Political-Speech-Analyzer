// Audio utility functions
// Note: YouTube audio extraction is now in youtube-server.ts

export async function convertFileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
