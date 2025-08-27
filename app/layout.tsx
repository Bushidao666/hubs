import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontSans, fontMono, fontOrbitron, fontShareTech } from "@/config/fonts";

export const metadata: Metadata = {
  title: {
    default: "Blacksider Hub - Neural Interface",
    template: `%s - Blacksider Hub`,
  },
  description: "Advanced Neural Interface for SaaS Management",
  icons: {
    icon: [
      { url: "/BS%20Vertical%20branco%20SEM%20FUNDO.png", type: "image/png" }
    ],
    apple: [
      { url: "/BS%20Vertical%20branco%20SEM%20FUNDO.png", type: "image/png" }
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "black" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fix SSR cookie hydration for Supabase session cookies
  // Ensura que o Next inclua cabeçalhos Set-Cookie do middleware nas páginas
  return (
    <html suppressHydrationWarning lang="en" className="cyberpunk-dark">
      <head />
      <body
        className={clsx(
          "min-h-screen bg-black text-primary font-sans antialiased overflow-hidden",
          fontSans.variable,
          fontMono.variable,
          fontOrbitron.variable,
          fontShareTech.variable,
        )}
      >
        <Providers>
          <div className="relative h-screen w-screen bg-black">
            <div className="absolute inset-0 grid-background opacity-10" />
            <div className="relative h-full scanline">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
