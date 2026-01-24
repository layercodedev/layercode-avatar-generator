import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Layercode Avatar Generator",
  description: "Generate stylized 256x256 pixel art avatars",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen p-8">
        <div className="max-w-5xl mx-auto">
          <div className="aqua-window">
            {/* Titlebar */}
            <div className="aqua-titlebar">
              <div className="aqua-traffic-lights">
                <div className="aqua-traffic-light red" />
                <div className="aqua-traffic-light yellow" />
                <div className="aqua-traffic-light green" />
              </div>
              <span className="aqua-titlebar-title">Layercode Avatar Generator</span>
            </div>

            {/* Navigation/Toolbar */}
            <Navigation />

            {/* Content */}
            <div className="aqua-content min-h-[600px]">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
