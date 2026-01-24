"use client";

import { useState, useRef, useEffect } from "react";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

const PRESET_COLORS = [
  "#1e2a3a", // Dark navy (default)
  "#1a1a2e", // Deep purple-black
  "#16213e", // Midnight blue
  "#0f3460", // Ocean blue
  "#2d4059", // Slate blue
  "#3a506b", // Steel blue
  "#1b262c", // Charcoal
  "#222831", // Dark gray
  "#2c3e50", // Wet asphalt
  "#34495e", // Concrete
  "#4a5568", // Cool gray
  "#1f2937", // Gray 800
  "#064e3b", // Emerald dark
  "#1e3a3a", // Teal dark
  "#312e81", // Indigo dark
  "#4c1d95", // Purple dark
];

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(value);
  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update custom color input when value changes externally
  useEffect(() => {
    setCustomColor(value);
  }, [value]);

  const handleCustomColorChange = (newColor: string) => {
    setCustomColor(newColor);
    // Only update if it's a valid hex color
    if (/^#[0-9A-Fa-f]{6}$/.test(newColor)) {
      onChange(newColor);
    }
  };

  return (
    <div className="relative">
      {label && <label className="aqua-label block mb-2">{label}</label>}

      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="aqua-button flex items-center gap-3 w-full justify-between"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-6 h-6 rounded-md border border-gray-300 shadow-inner"
            style={{ backgroundColor: value }}
          />
          <span className="font-mono text-sm">{value.toUpperCase()}</span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={popupRef}
          className="absolute z-50 mt-2 p-4 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200/50 w-72"
          style={{
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200/50">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Background Color
            </span>
            <div
              className="w-8 h-8 rounded-lg border-2 border-white shadow-lg"
              style={{ backgroundColor: value }}
            />
          </div>

          {/* Preset colors grid */}
          <div className="grid grid-cols-8 gap-1.5 mb-4">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => {
                  onChange(color);
                  setCustomColor(color);
                }}
                className={`w-7 h-7 rounded-md transition-all hover:scale-110 ${
                  value.toLowerCase() === color.toLowerCase()
                    ? "ring-2 ring-blue-500 ring-offset-2"
                    : "hover:ring-2 hover:ring-gray-300 hover:ring-offset-1"
                }`}
                style={{ backgroundColor: color }}
                title={color.toUpperCase()}
              />
            ))}
          </div>

          {/* Custom color input */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={customColor}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                placeholder="#1e2a3a"
                className="aqua-input w-full font-mono text-sm pl-10"
                maxLength={7}
              />
              <input
                type="color"
                value={value}
                onChange={(e) => {
                  onChange(e.target.value);
                  setCustomColor(e.target.value);
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded cursor-pointer border-0 p-0"
                style={{
                  appearance: "none",
                  WebkitAppearance: "none",
                }}
              />
            </div>
            <button
              onClick={() => {
                onChange("#1e2a3a");
                setCustomColor("#1e2a3a");
              }}
              className="aqua-button text-xs px-3"
              title="Reset to default"
            >
              Reset
            </button>
          </div>

          {/* Footer hint */}
          <p className="text-xs text-gray-400 mt-3 text-center">
            Click a preset or enter a hex code
          </p>
        </div>
      )}
    </div>
  );
}
