import { NextRequest, NextResponse } from "next/server";
import { getBlog } from "@/lib/blogs";

// Read fresh on every request: the workshop preview asks for a post the agent
// wrote seconds ago.
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  // getBlog validates the slug — never join() a URL segment here.
  const blog = getBlog(slug);
  if (!blog) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // imagePath is a server filesystem path; the browser uses the image route.
  const { imagePath: _imagePath, ...publicBlog } = blog;
  return NextResponse.json(publicBlog, {
    headers: { "Cache-Control": "no-store" },
  });
}
