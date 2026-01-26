"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  getTeamMembers,
  addTeamMember,
  updateTeamMember,
  deleteTeamMember,
  getVariantById,
  type TeamMember,
  type Variant,
} from "@/lib/storage";

interface TeamMemberWithAvatar extends TeamMember {
  officialAvatar: Variant | null;
}

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMemberWithAvatar[]>([]);
  const [newMemberName, setNewMemberName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadTeamMembers = useCallback(() => {
    setIsLoading(true);
    const members = getTeamMembers();
    const membersWithAvatars = members.map((member) => ({
      ...member,
      officialAvatar: member.officialAvatarId
        ? getVariantById(member.officialAvatarId)
        : null,
    }));
    setTeamMembers(membersWithAvatars);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadTeamMembers();
  }, [loadTeamMembers]);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    addTeamMember(newMemberName.trim());
    setNewMemberName("");
    loadTeamMembers();
  };

  const handleEditMember = (id: number) => {
    if (!editingName.trim()) return;

    updateTeamMember(id, { name: editingName.trim() });
    setEditingId(null);
    setEditingName("");
    loadTeamMembers();
  };

  const handleDeleteMember = (id: number) => {
    if (!confirm("Delete this team member? Their generations will be kept.")) return;

    deleteTeamMember(id);
    loadTeamMembers();
  };

  const startEditing = (member: TeamMember) => {
    setEditingId(member.id);
    setEditingName(member.name);
  };

  return (
    <div className="space-y-5">
      <h1 className="aqua-label text-lg">Team Members</h1>

      {/* Add new member */}
      <form onSubmit={handleAddMember} className="aqua-panel">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="New team member name..."
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            className="aqua-input flex-1"
          />
          <button
            type="submit"
            disabled={!newMemberName.trim()}
            className={`aqua-button ${newMemberName.trim() ? "aqua-button-primary" : ""}`}
          >
            Add Member
          </button>
        </div>
      </form>

      {/* Team members list */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="aqua-spinner" />
        </div>
      ) : teamMembers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="aqua-card p-4 flex items-center gap-4"
            >
              {/* Avatar */}
              <div className="w-16 h-16 rounded overflow-hidden bg-gradient-to-b from-gray-100 to-gray-200 border border-gray-300 flex-shrink-0 shadow-inner">
                {member.officialAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`data:image/png;base64,${member.officialAvatar.imageData}`}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-bold">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Info and actions */}
              <div className="flex-1 min-w-0">
                {editingId === member.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleEditMember(member.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="aqua-input flex-1 py-1"
                      autoFocus
                    />
                    <button
                      onClick={() => handleEditMember(member.id)}
                      className="aqua-button aqua-button-primary p-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="aqua-button p-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="font-medium text-gray-800 truncate">{member.name}</h3>
                    <div className="flex gap-3 mt-2">
                      <button
                        onClick={() => startEditing(member)}
                        className="text-xs text-gray-500 hover:text-gray-800 transition-colors"
                      >
                        Edit
                      </button>
                      <Link
                        href={`/history?teamMemberId=${member.id}`}
                        className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        View generations
                      </Link>
                      <button
                        onClick={() => handleDeleteMember(member.id)}
                        className="text-xs text-red-500 hover:text-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="aqua-panel flex items-center justify-center h-64">
          <p className="text-gray-500">No team members yet. Add one above!</p>
        </div>
      )}
    </div>
  );
}
