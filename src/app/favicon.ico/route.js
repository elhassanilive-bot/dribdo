import { readFile } from "node:fs/promises";
import path from "node:path";

export async function GET() {
  const iconPath = path.join(process.cwd(), "src", "app", "icon.png");
  const iconBuffer = await readFile(iconPath);

  return new Response(iconBuffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
