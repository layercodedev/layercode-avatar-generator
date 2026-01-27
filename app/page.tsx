"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ImageUpload } from "@/components/ImageUpload";
import { PromptEditor } from "@/components/PromptEditor";
import { VariantGrid } from "@/components/VariantGrid";
import { ColorPicker } from "@/components/ColorPicker";
import {
  getPrompts,
  getTeamMembers,
  getGenerations,
  getVariantsByGeneration,
  addGeneration,
  addVariants,
  updateVariant,
  updateTeamMember,
  addPrompt,
  getExemplars,
  addExemplar,
  type Prompt,
  type TeamMember,
  type Variant,
  type Generation,
  type Exemplar,
} from "@/lib/storage";

interface GenerationWithVariants extends Generation {
  variants: Variant[];
}

function HomeContent() {
  const searchParams = useSearchParams();
  const generationId = searchParams.get("generationId");

  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedTeamMember, setSelectedTeamMember] = useState<number | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [isPetMode, setIsPetMode] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("#1e2a3a");
  const [variantCount, setVariantCount] = useState(6);
  const [currentGeneration, setCurrentGeneration] = useState<GenerationWithVariants | null>(null);
  const [exemplars, setExemplars] = useState<Exemplar[]>([]);
  const [selectedExemplarIds, setSelectedExemplarIds] = useState<number[]>([]);

  // Load prompts, team members, and exemplars from localStorage
  useEffect(() => {
    loadPrompts();
    loadTeamMembers();
    loadExemplars();
  }, []);

  // Load generation if ID is provided
  useEffect(() => {
    if (generationId) {
      loadGeneration(parseInt(generationId));
    }
  }, [generationId]);

  const loadPrompts = () => {
    setPrompts(getPrompts());
  };

  const loadTeamMembers = () => {
    setTeamMembers(getTeamMembers());
  };

  const loadExemplars = () => {
    setExemplars(getExemplars());
  };

  const loadGeneration = (id: number) => {
    const generations = getGenerations();
    const gen = generations.find((g) => g.id === id);
    if (gen) {
      const genVariants = getVariantsByGeneration(id);
      setCurrentGeneration({ ...gen, variants: genVariants });
      setImageBase64(gen.originalImage);
      setPrompt(gen.promptUsed);
      setVariants(genVariants);
      setSelectedTeamMember(gen.teamMemberId);
    }
  };

  const handleSavePrompt = (name: string, content: string) => {
    addPrompt(name, content, isPetMode);
    loadPrompts();
  };

  const handleGenerate = async () => {
    if (!imageBase64 || !prompt) return;

    setIsGenerating(true);
    setVariants([]);
    setSelectedVariant(null);

    try {
      // Get selected exemplar image data
      const exemplarImages = selectedExemplarIds
        .map((id) => exemplars.find((e) => e.id === id)?.imageData)
        .filter((data): data is string => !!data);

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

      const data = await res.json();

      if (data.error) {
        alert(`Generation failed: ${data.error}`);
        return;
      }

      // Save to localStorage
      const generation = addGeneration(imageBase64, data.promptUsed, selectedTeamMember);
      const newVariants = addVariants(generation.id, data.images);

      setVariants(newVariants);
      setCurrentGeneration({ ...generation, variants: newVariants });
    } catch {
      alert("Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleFavorite = (variant: Variant) => {
    const updated = updateVariant(variant.id, { isFavorited: !variant.isFavorited });
    if (updated) {
      setVariants(
        variants.map((v) =>
          v.id === variant.id ? { ...v, isFavorited: !v.isFavorited } : v
        )
      );
    }
  };

  const handleSetOfficial = (variant: Variant) => {
    if (!selectedTeamMember) return;

    updateTeamMember(selectedTeamMember, { officialAvatarId: variant.id });
    alert("Avatar set as official!");
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
      // Limit to 3 exemplars
      if (prev.length >= 3) {
        alert("Maximum 3 exemplars allowed");
        return prev;
      }
      return [...prev, id];
    });
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Left column: Upload and settings */}
      <div className="space-y-5">
        <div className="aqua-panel">
          <h2 className="aqua-label text-sm mb-3">
            {isPetMode ? "Upload Pet Photo 🐾" : "Upload Photo"}
          </h2>
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
              onPetModeChange={setIsPetMode}
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

            {exemplars.length > 0 && !isPetMode && (
              <div>
                <label className="aqua-label block mb-2">
                  Style Exemplars ({selectedExemplarIds.length}/3)
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Select up to 3 exemplars to guide style consistency
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
                        src={`data:image/png;base64,${exemplar.imageData}`}
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
                </div>
              </div>
            )}

            <div>
              <label className="aqua-label block mb-2">
                Assign to Team Member
              </label>
              <select
                value={selectedTeamMember || ""}
                onChange={(e) =>
                  setSelectedTeamMember(e.target.value ? Number(e.target.value) : null)
                }
                className="aqua-select w-full"
              >
                <option value="">No team member</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
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
              {isPetMode ? "Generating pet avatars..." : "Generating avatars..."}
            </span>
          ) : (
            isPetMode
              ? `Generate ${variantCount} Pet Variant${variantCount === 1 ? "" : "s"} 🐾`
              : `Generate ${variantCount} Variant${variantCount === 1 ? "" : "s"}`
          )}
        </button>
      </div>

      {/* Right column: Results */}
      <div className="aqua-panel">
        <div className="flex items-center justify-between mb-4">
          <h2 className="aqua-label">Generated Variants</h2>
          {variants.length > 0 && (
            <label className="flex items-center gap-2 text-xs text-gray-600">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="aqua-checkbox"
              />
              Show grid overlay
            </label>
          )}
        </div>

        {isGenerating ? (
          <div className="flex items-center justify-center h-64 bg-white/50 rounded-lg border border-gray-200">
            <div className="text-center space-y-3">
              <div className="aqua-spinner mx-auto" />
              <p className="text-gray-600">Generating {variantCount} avatar variant{variantCount === 1 ? "" : "s"}...</p>
              <p className="text-xs text-gray-400">This may take a minute</p>
            </div>
          </div>
        ) : variants.length > 0 ? (
          <VariantGrid
            variants={variants}
            onSelect={setSelectedVariant}
            onToggleFavorite={handleToggleFavorite}
            onSetOfficial={handleSetOfficial}
            onSaveAsExemplar={handleSaveAsExemplar}
            selectedId={selectedVariant?.id}
            teamMemberId={selectedTeamMember}
            showGrid={showGrid}
          />
        ) : (
          <div className="flex items-center justify-center h-64 bg-white/50 rounded-lg border border-gray-200">
            <p className="text-gray-400">Upload a photo and generate variants</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="text-gray-400">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
