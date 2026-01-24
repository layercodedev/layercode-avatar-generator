"use client";

import { useState, useEffect, useCallback } from "react";
import { GenerationCard } from "@/components/GenerationCard";

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
  createdAt: Date;
  variants: Variant[];
  teamMember: TeamMember | null;
}

export default function HistoryPage() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [search, setSearch] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [selectedTeamMember, setSelectedTeamMember] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const loadGenerations = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (favoritesOnly) params.set("favoritesOnly", "true");
    if (selectedTeamMember) params.set("teamMemberId", selectedTeamMember);

    const res = await fetch(`/api/generations?${params}`);
    const data = await res.json();
    setGenerations(data);
    setIsLoading(false);
  }, [search, favoritesOnly, selectedTeamMember]);

  const loadTeamMembers = useCallback(async () => {
    const res = await fetch("/api/team");
    const data = await res.json();
    setTeamMembers(data);
  }, []);

  useEffect(() => {
    loadGenerations();
    loadTeamMembers();
  }, [loadGenerations, loadTeamMembers]);

  const handleDelete = async (id: number) => {
    await fetch(`/api/generations?id=${id}`, { method: "DELETE" });
    loadGenerations();
  };

  return (
    <div className="space-y-5">
      <h1 className="aqua-label text-lg">Generation History</h1>

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
