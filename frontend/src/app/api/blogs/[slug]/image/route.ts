import { NextRequest, NextResponse } from "next/server";
import { BLOG_DIR } from "@/lib/blogs";
import { join } from "path";
import { existsSync, readdirSync } from "fs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const slugDir = join(BLOG_DIR, slug);
  if (!existsSync(slugDir)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const entries = readdirSync(slugDir);
  const imageFile = entries.find((f) => /\.(png|jpg|jpeg|webp)$/i.test(f));
  if (!imageFile) {
    return new NextResponse("No image", { status: 404 });
  }

  const ext = imageFile.split(".").pop()?.toLowerCase();
  const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

  const { readFileSync } = await import("fs");
  const buffer = readFileSync(join(slugDir, imageFile));

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": mime,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
