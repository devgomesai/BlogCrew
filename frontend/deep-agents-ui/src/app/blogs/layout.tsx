import type { ReactNode } from "react";
import "./blog.css";

export default function BlogsLayout({ children }: { children: ReactNode }) {
  return <div className="blog-shell">{children}</div>;
}
