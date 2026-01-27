"use client";

import { useState, useEffect, useCallback } from "react";
import { GenerationCard } from "@/components/GenerationCard";
import {
  getGenerations,
  getTeamMembers,
  getVariantsByGeneration,
  deleteGeneration,
  clearAllHistory,
  type Generation,
  type TeamMember,
  type Variant,
} from "@/lib/storage";

interface GenerationWithDetails extends Generation {
  variants: Variant[];
  teamMember: TeamMember | null;
}

export default function HistoryPage() {
  const [generations, setGenerations] = useState<GenerationWithDetails[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [search, setSearch] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [selectedTeamMember, setSelectedTeamMember] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const loadGenerations = useCallback(() => {
    setIsLoading(true);
    const allTeamMembers = getTeamMembers();
    let allGenerations = getGenerations();

    // Filter by team member
    if (selectedTeamMember) {
      allGenerations = allGenerations.filter(
        (g) => g.teamMemberId === parseInt(selectedTeamMember)
      );
    }

    // Search by prompt text
    if (search) {
      allGenerations = allGenerations.filter((g) =>
        g.promptUsed.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Build generation details with variants and team member
    let results: GenerationWithDetails[] = allGenerations.map((gen) => {
      const variants = getVariantsByGeneration(gen.id);
      const teamMember = gen.teamMemberId
        ? allTeamMembers.find((tm) => tm.id === gen.teamMemberId) || null
        : null;
      return { ...gen, variants, teamMember };
    });

    // Filter favorites only
    if (favoritesOnly) {
      results = results
        .map((gen) => ({
          ...gen,
          variants: gen.variants.filter((v) => v.isFavorited),
        }))
        .filter((gen) => gen.variants.length > 0);
    }

    setGenerations(results);
    setTeamMembers(allTeamMembers);
    setIsLoading(false);
  }, [search, favoritesOnly, selectedTeamMember]);

  useEffect(() => {
    loadGenerations();
  }, [loadGenerations]);

  const handleDelete = (id: number) => {
    deleteGeneration(id);
    loadGenerations();
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to delete ALL generation history? This cannot be undone.")) {
      clearAllHistory();
      loadGenerations();
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="aqua-label text-lg">Generation History</h1>
        {generations.length > 0 && (
          <button
            onClick={handleClearAll}
            className="aqua-button text-red-600 text-sm"
          >
            Clear All History
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="aqua-panel">
        <div className="flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="Search prompts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="aqua-input w-64"
          />

          <select
            value={selectedTeamMember}
            onChange={(e) => setSelectedTeamMember(e.target.value)}
            className="aqua-select"
          >
            <option value="">All team members</option>
            {teamMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={favoritesOnly}
              onChange={(e) => setFavoritesOnly(e.target.checked)}
              className="aqua-checkbox"
            />
            Favorites only
          </label>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="aqua-spinner" />
        </div>
      ) : generations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {generations.map((generation) => (
            <GenerationCard
              key={generation.id}
              generation={generation}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="aqua-panel flex items-center justify-center h-64">
          <p className="text-gray-500">
            {search || favoritesOnly || selectedTeamMember
              ? "No generations match your filters"
              : "No generations yet. Go create some avatars!"}
          </p>
        </div>
      )}
    </div>
  );
}
