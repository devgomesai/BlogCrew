import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/providers/ThemeProvider";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/devchauhann/fonts@v1.1.0/cdn/v1/css/all.css"
        />
      </head>
      <body
        className="font-sans"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <NuqsAdapter>{children}</NuqsAdapter>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
