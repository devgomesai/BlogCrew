import Link from "next/link";
import { getAllBlogs } from "@/lib/blogs";

export function BlogGlimpse() {
  const blogs = getAllBlogs().slice(0, 3);
  if (blogs.length === 0) return null;

  return (
    <div className="landing-glimpse">
      {blogs.map((blog) => (
        <Link key={blog.slug} href={`/blogs/${blog.slug}`} className="landing-glimpse__card">
          <div className={`landing-glimpse__media${blog.hasImage ? "" : " landing-glimpse__media--empty"}`}>
            {blog.hasImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/api/blogs/${blog.slug}/image`} alt={blog.title} />
            )}
          </div>
          <span className="landing-glimpse__title">{blog.title}</span>
        </Link>
      ))}
    </div>
  );
}
