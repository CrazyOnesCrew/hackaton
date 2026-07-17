import type { Metadata } from "next";
import Script from "next/script";
import { Nunito } from "next/font/google";
import "./globals.css";

// Nunito via next/font (self-hosted at build, no layout shift, no extra
// network request) — preferred over a raw Google Fonts <link> CDN.
// Sans redondeada del styleguide; pesos 400/600/700/800.
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "AI-First Project Template — Portal",
  description: "Admin/member portal for the AI-First Project Template.",
};

export const dynamic = "force-dynamic";

// Theme bootstrap script — runs in the <head> before React hydrates so we don't
// flash the light theme on dark-mode users. `beforeInteractive` is the only
// strategy that guarantees the script lands before hydration; in App Router it
// is required to live in the root layout.
const themeBootstrap = `try{var d=localStorage.getItem("template-theme");var k=d?d==="dark":window.matchMedia("(prefers-color-scheme:dark)").matches;if(k)document.documentElement.classList.add("dark")}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${nunito.variable} h-full antialiased`}
    >
      <body className="h-full overflow-hidden">
        <Script id="template-theme-bootstrap" strategy="beforeInteractive">
          {themeBootstrap}
        </Script>
        {children}
      </body>
    </html>
  );
}
