"use client";

interface GridOverlayProps {
  visible: boolean;
  size?: number;
}

export function GridOverlay({ visible, size = 256 }: GridOverlayProps) {
  if (!visible) return null;

  // Create a 16x16 grid for 256 pixels (each cell = 16 pixels)
  const cellSize = size / 16;

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
        `,
        backgroundSize: `${cellSize}px ${cellSize}px`,
      }}
    />
  );
}
