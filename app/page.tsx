"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ImageUpload } from "@/components/ImageUpload";
import { PromptEditor } from "@/components/PromptEditor";
import { VariantGrid } from "@/components/VariantGrid";
import { ColorPicker } from "@/components/ColorPicker";

interface Prompt {
  id: number;
  name: string;
  content: string;
  isDefault: boolean;
  isPetMode: boolean;
}

interface Variant {
  id: number;
  imageData: string;
  isFavorited: boolean;
}

interface TeamMember {
  id: number;
  name: string;
}

interface Generation {
  id: number;
  originalImage: string;
  promptUsed: string;
  teamMemberId: number | null;
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentGeneration, setCurrentGeneration] = useState<Generation | null>(null);

  // Load prompts and team members
  useEffect(() => {
    loadPrompts();
    loadTeamMembers();
  }, []);

  // Load generation if ID is provided
  useEffect(() => {
    if (generationId) {
      loadGeneration(parseInt(generationId));
    }
  }, [generationId]);

  const loadPrompts = async () => {
    const res = await fetch("/api/prompts");
    const data = await res.json();
    setPrompts(data);
  };

  const loadTeamMembers = async () => {
    const res = await fetch("/api/team");
    const data = await res.json();
    setTeamMembers(data);
  };

  const loadGeneration = async (id: number) => {
    const res = await fetch(`/api/generations/${id}`);
    const data = await res.json();
    setCurrentGeneration(data);
    setImageBase64(data.originalImage);
    setPrompt(data.promptUsed);
    setVariants(data.variants);
    setSelectedTeamMember(data.teamMemberId);
  };

  const handleSavePrompt = async (name: string, content: string) => {
    await fetch("/api/prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, content }),
    });
    loadPrompts();
  };

  const handleGenerate = async () => {
    if (!imageBase64 || !prompt) return;

    setIsGenerating(true);
    setVariants([]);
    setSelectedVariant(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          prompt,
          teamMemberId: selectedTeamMember,
          isPetMode,
          backgroundColor,
        }),
      });

      const data = await res.json();

      if (data.error) {
        alert(`Generation failed: ${data.error}`);
        return;
      }

      setVariants(data.variants);
      setCurrentGeneration(data.generation);
    } catch {
      alert("Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleFavorite = async (variant: Variant) => {
    await fetch(`/api/variants/${variant.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorited: !variant.isFavorited }),
    });

    setVariants(
      variants.map((v) =>
        v.id === variant.id ? { ...v, isFavorited: !v.isFavorited } : v
      )
    );
  };

  const handleSetOfficial = async (variant: Variant) => {
    if (!selectedTeamMember) return;

    await fetch(`/api/variants/${variant.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        setAsOfficial: true,
        teamMemberId: selectedTeamMember,
      }),
    });

    alert("Avatar set as official!");
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
            isPetMode ? "Generate 6 Pet Variants 🐾" : "Generate 6 Variants"
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
              <p className="text-gray-600">Generating 6 avatar variants...</p>
              <p className="text-xs text-gray-400">This may take a minute</p>
            </div>
          </div>
        ) : variants.length > 0 ? (
          <VariantGrid
            variants={variants}
            onSelect={setSelectedVariant}
            onToggleFavorite={handleToggleFavorite}
            onSetOfficial={handleSetOfficial}
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
