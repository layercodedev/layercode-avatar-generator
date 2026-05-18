"use client";

import { useState, useEffect } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { PromptEditor } from "@/components/PromptEditor";
import { VariantGrid } from "@/components/VariantGrid";
import { ColorPicker } from "@/components/ColorPicker";
import {
  getPrompts,
  addPrompt,
  getExemplars,
  addExemplar,
  type Prompt,
  type Variant,
  type Exemplar,
} from "@/lib/storage";

let localId = 0;
const nextLocalId = () => ++localId;

export default function HomeContent() {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPetMode] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("#E6E6E6");
  const [variantCount, setVariantCount] = useState(1);
  const [exemplars, setExemplars] = useState<Exemplar[]>([]);
  const [selectedExemplarIds, setSelectedExemplarIds] = useState<number[]>([]);
  const [bannerDismissed, setBannerDismissed] = useState(true);

  // Load prompts and exemplars from localStorage
  useEffect(() => {
    loadPrompts();
    const loaded = getExemplars();
    setExemplars(loaded);
    // Auto-select all default-seeded exemplars on first load
    setSelectedExemplarIds((prev) => {
      if (prev.length > 0) return prev;
      return loaded.slice(0, 4).map((e) => e.id);
    });
    // Show welcome banner unless previously dismissed
    if (typeof window !== "undefined") {
      setBannerDismissed(localStorage.getItem("avatar-app-banner-dismissed") === "1");
      // One-time cleanup of legacy generation/variant storage (no longer persisted)
      localStorage.removeItem("avatar-app-generations");
      localStorage.removeItem("avatar-app-variants");
    }
  }, []);

  const loadPrompts = () => {
    setPrompts(getPrompts());
  };

  const loadExemplars = () => {
    setExemplars(getExemplars());
  };

  const handleSavePrompt = (name: string, content: string) => {
    addPrompt(name, content, false);
    loadPrompts();
  };

  const dismissBanner = () => {
    setBannerDismissed(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("avatar-app-banner-dismissed", "1");
    }
  };

  const handleGenerate = async () => {
    if (!imageBase64 || !prompt) return;

    setIsGenerating(true);
    setVariants([]);
    setSelectedVariant(null);

    const exemplarImages = selectedExemplarIds
      .map((id) => exemplars.find((e) => e.id === id)?.imageData)
      .filter((data): data is string => !!data);

    const generationId = nextLocalId();
    const collected: Variant[] = [];
    const errors: string[] = [];

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          prompt,
          isPetMode,
          backgroundColor,
          count: variantCount,
          exemplarImages,
        }),
      });

      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => "");
        let message = `Request failed (${res.status})`;
        try {
          const parsed = JSON.parse(errText);
          if (parsed?.error) message = parsed.error;
        } catch { /* not json */ }
        throw new Error(message);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          const chunk = JSON.parse(line);

          if (chunk.type === "image") {
            const variant: Variant = {
              id: nextLocalId(),
              generationId,
              imageData: chunk.image,
              isFavorited: false,
              createdAt: new Date(),
            };
            collected.push(variant);
            setVariants([...collected]);
          } else if (chunk.type === "error") {
            errors.push(chunk.message ?? `Variant ${chunk.index} failed`);
          }
        }
      }

      if (collected.length === 0) {
        throw new Error(errors[0] ?? "No images generated");
      }
      if (errors.length > 0) {
        console.warn("Some variants failed:", errors);
      }
    } catch (error) {
      console.error("Generation error:", error);
      alert(`Generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleFavorite = (variant: Variant) => {
    setVariants(
      variants.map((v) =>
        v.id === variant.id ? { ...v, isFavorited: !v.isFavorited } : v
      )
    );
  };

  const handleSaveAsExemplar = (variant: Variant) => {
    const name = window.prompt(`Name this exemplar (e.g., "Clean pixel art", "Good likeness"):`);
    if (!name) return;
    addExemplar(variant.imageData, name);
    loadExemplars();
    alert("Saved as exemplar!");
  };

  const toggleExemplarSelection = (id: number) => {
    setSelectedExemplarIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((eid) => eid !== id);
      }
      if (prev.length >= 4) {
        alert("Maximum 4 exemplars allowed");
        return prev;
      }
      return [...prev, id];
    });
  };

  return (
    <div className="space-y-6">
      {!bannerDismissed && (
        <div className="aqua-panel flex items-start gap-3 bg-blue-50 border-blue-200">
          <div className="flex-1 text-sm text-gray-700">
            <strong className="text-gray-900">Generate your Layercode claymation avatar.</strong>{" "}
            Upload a clean headshot, then hit Generate. Try a few — pick your favorite.
          </div>
          <button
            onClick={dismissBanner}
            className="aqua-button text-xs shrink-0"
            aria-label="Dismiss"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
      {/* Left column: Upload and settings */}
      <div className="space-y-5">
        <div className="aqua-panel">
          <h2 className="aqua-label text-sm mb-3">Upload Photo</h2>
          <ImageUpload onImageSelect={setImageBase64} previewUrl={imageBase64} />
        </div>

        <div className="aqua-panel">
          <h2 className="aqua-label text-sm mb-3">Settings</h2>
          <div className="space-y-4">
            <PromptEditor
              value={prompt}
              onChange={setPrompt}
              prompts={prompts}
              onSavePrompt={handleSavePrompt}
              onLoadPrompts={loadPrompts}
            />

            <ColorPicker
              value={backgroundColor}
              onChange={setBackgroundColor}
              label="Background Color"
            />

            <div>
              <label className="aqua-label block mb-2">
                Variants to Generate
              </label>
              <select
                value={variantCount}
                onChange={(e) => setVariantCount(Number(e.target.value))}
                className="aqua-select w-full"
              >
                <option value={1}>1 variant</option>
                <option value={2}>2 variants</option>
                <option value={3}>3 variants</option>
                <option value={4}>4 variants</option>
                <option value={6}>6 variants</option>
                <option value={8}>8 variants</option>
              </select>
            </div>

            <div>
                <label className="aqua-label block mb-2">
                  Style Exemplars ({selectedExemplarIds.length}/4)
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Upload or select up to 4 exemplars to guide style consistency
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {exemplars.map((exemplar) => (
                    <button
                      key={exemplar.id}
                      onClick={() => toggleExemplarSelection(exemplar.id)}
                      className={`relative aspect-square rounded overflow-hidden border-2 transition-all ${
                        selectedExemplarIds.includes(exemplar.id)
                          ? "border-blue-500 ring-2 ring-blue-300"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      title={exemplar.name}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`data:${exemplar.mimeType ?? "image/png"};base64,${exemplar.imageData}`}
                        alt={exemplar.name}
                        className="w-full h-full object-cover"
                      />
                      {selectedExemplarIds.includes(exemplar.id) && (
                        <div className="absolute top-0.5 right-0.5 bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                          {selectedExemplarIds.indexOf(exemplar.id) + 1}
                        </div>
                      )}
                    </button>
                  ))}
                  {/* Upload button */}
                  <label className="relative aspect-square rounded overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-400 cursor-pointer transition-all flex items-center justify-center bg-gray-50 hover:bg-blue-50">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const base64 = event.target?.result as string;
                          // Strip data URL prefix - handle various formats
                          const imageData = base64.replace(/^data:image\/[^;]+;base64,/, "");
                          if (!imageData || imageData === base64) {
                            alert("Failed to process image. Please try a different file.");
                            return;
                          }
                          // Use filename as name (without extension)
                          const name = file.name.replace(/\.[^.]+$/, "") || `Reference ${Date.now()}`;
                          addExemplar(imageData, name);
                          loadExemplars();
                        };
                        reader.onerror = () => {
                          alert("Failed to read file. Please try again.");
                        };
                        reader.readAsDataURL(file);
                        e.target.value = "";
                      }}
                    />
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </label>
                </div>
              </div>

          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!imageBase64 || !prompt || isGenerating}
          className={`aqua-button w-full py-3 ${
            !imageBase64 || !prompt || isGenerating
              ? ""
              : "aqua-button-primary"
          }`}
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <div className="aqua-spinner w-5 h-5" />
              Generating avatars...
            </span>
          ) : (
            `Generate ${variantCount} Variant${variantCount === 1 ? "" : "s"}`
          )}
        </button>
      </div>

      {/* Right column: Results */}
      <div className="aqua-panel">
        <div className="mb-4">
          <h2 className="aqua-label">Generated Variants</h2>
        </div>

        {isGenerating && variants.length === 0 ? (
          <div className="flex items-center justify-center h-64 bg-white/50 rounded-lg border border-gray-200">
            <div className="text-center space-y-3">
              <div className="aqua-spinner mx-auto" />
              <p className="text-gray-600">Generating {variantCount} avatar variant{variantCount === 1 ? "" : "s"}...</p>
              <p className="text-xs text-gray-400">Each variant takes 30-60 seconds</p>
            </div>
          </div>
        ) : variants.length > 0 ? (
          <VariantGrid
            variants={variants}
            onSelect={setSelectedVariant}
            onToggleFavorite={handleToggleFavorite}
            onSaveAsExemplar={handleSaveAsExemplar}
            selectedId={selectedVariant?.id}
          />
        ) : (
          <div className="flex items-center justify-center h-64 bg-white/50 rounded-lg border border-gray-200">
            <p className="text-gray-400">Upload a photo and generate variants</p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

