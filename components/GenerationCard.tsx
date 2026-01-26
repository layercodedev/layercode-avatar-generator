"use client";

import Link from "next/link";
import { format } from "date-fns";
import { type Generation, type Variant, type TeamMember } from "@/lib/storage";

interface GenerationWithDetails extends Generation {
  variants: Variant[];
  teamMember: TeamMember | null;
}

interface GenerationCardProps {
  generation: GenerationWithDetails;
  onDelete?: (id: number) => void;
}

export function GenerationCard({ generation, onDelete }: GenerationCardProps) {
  const favoriteCount = generation.variants.filter((v) => v.isFavorited).length;
  const previewVariants = generation.variants.slice(0, 4);

  return (
    <div className="aqua-card hover:shadow-lg transition-shadow">
      <Link href={`/?generationId=${generation.id}`}>
        <div className="p-3">
          {/* Preview grid */}
          <div className="grid grid-cols-4 gap-1 mb-3">
            {previewVariants.map((variant) => (
              <div key={variant.id} className="relative aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`data:image/png;base64,${variant.imageData}`}
                  alt=""
                  className="w-full h-full object-cover rounded"
                />
                {variant.isFavorited && (
                  <div className="absolute top-0.5 right-0.5 text-yellow-500 drop-shadow">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Info */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {format(new Date(generation.createdAt), "MMM d, yyyy h:mm a")}
              </span>
              {favoriteCount > 0 && (
                <span className="text-xs text-yellow-600 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {favoriteCount}
                </span>
              )}
            </div>
            {generation.teamMember && (
              <p className="text-sm text-blue-600 font-medium">{generation.teamMember.name}</p>
            )}
            <p className="text-xs text-gray-400 truncate">{generation.promptUsed}</p>
          </div>
        </div>
      </Link>

      {onDelete && (
        <div className="px-3 pb-3 border-t border-gray-100 pt-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              if (confirm("Delete this generation?")) {
                onDelete(generation.id);
              }
            }}
            className="text-xs text-red-500 hover:text-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
