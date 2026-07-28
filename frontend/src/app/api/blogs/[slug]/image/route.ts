import { NextRequest, NextResponse } from "next/server";
import { getBlog } from "@/lib/blogs";
import { readFileSync } from "fs";

const MIME: Record<string, string> = {
  png: "image/png",
  webp: "image/webp",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  // getBlog validates the slug — never join() a URL segment here.
  const blog = getBlog(slug);
  if (!blog?.imagePath || !blog.imageName) {
    return new NextResponse("Not found", { status: 404 });
  }

  const ext = blog.imageName.split(".").pop()?.toLowerCase() ?? "";
  return new NextResponse(readFileSync(blog.imagePath), {
    headers: {
      "Content-Type": MIME[ext] ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
