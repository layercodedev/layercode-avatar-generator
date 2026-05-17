"use client";

import { useState } from "react";
import { type Variant } from "@/lib/storage";

interface VariantGridProps {
  variants: Variant[];
  onSelect?: (variant: Variant) => void;
  onToggleFavorite?: (variant: Variant) => void;
  onSetOfficial?: (variant: Variant) => void;
  onSaveAsExemplar?: (variant: Variant) => void;
  selectedId?: number | null;
  teamMemberId?: number | null;
}

export function VariantGrid({
  variants,
  onSelect,
  onToggleFavorite,
  onSetOfficial,
  onSaveAsExemplar,
  selectedId,
  teamMemberId,
}: VariantGridProps) {
  const [lightboxVariant, setLightboxVariant] = useState<Variant | null>(null);

  const handleDownload = (variant: Variant) => {
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${variant.imageData}`;
    link.download = `avatar-${variant.id}.png`;
    link.click();
  };

  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {variants.map((variant) => (
        <div
          key={variant.id}
          className={`
            relative group cursor-pointer transition-all duration-200
            aqua-card
            ${selectedId === variant.id ? "ring-2 ring-blue-500" : "hover:shadow-lg"}
          `}
          onClick={() => setLightboxVariant(variant)}
        >
          <div className="relative aspect-square">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`data:image/png;base64,${variant.imageData}`}
              alt={`Avatar variant ${variant.id}`}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Actions overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            {/* Favorite button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite?.(variant);
              }}
              className={`aqua-button p-2 ${variant.isFavorited ? "!bg-yellow-400" : ""}`}
              title={variant.isFavorited ? "Remove from favorites" : "Add to favorites"}
            >
              <svg className="w-4 h-4" fill={variant.isFavorited ? "#854d0e" : "currentColor"} viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>

            {/* Download button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(variant);
              }}
              className="aqua-button p-2"
              title="Download"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>

            {/* Save as exemplar button */}
            {onSaveAsExemplar && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSaveAsExemplar(variant);
                }}
                className="aqua-button p-2"
                title="Save as exemplar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </button>
            )}

            {/* Set as official button (only if team member is assigned) */}
            {teamMemberId && onSetOfficial && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSetOfficial(variant);
                }}
                className="aqua-button aqua-button-primary p-2"
                title="Set as official avatar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            )}
          </div>

          {/* Favorite indicator */}
          {variant.isFavorited && (
            <div className="absolute top-1 right-1 text-yellow-500 drop-shadow">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>

    {/* Lightbox */}
    {lightboxVariant && (
      <div
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        onClick={() => setLightboxVariant(null)}
      >
        <div className="relative max-w-4xl max-h-[90vh] w-full">
          {/* Close button */}
          <button
            onClick={() => setLightboxVariant(null)}
            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`data:image/png;base64,${lightboxVariant.imageData}`}
            alt={`Avatar variant ${lightboxVariant.id}`}
            className="w-full h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Action buttons */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite?.(lightboxVariant);
              }}
              className={`aqua-button p-3 ${lightboxVariant.isFavorited ? "!bg-yellow-400" : ""}`}
              title={lightboxVariant.isFavorited ? "Remove from favorites" : "Add to favorites"}
            >
              <svg className="w-6 h-6" fill={lightboxVariant.isFavorited ? "#854d0e" : "currentColor"} viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(lightboxVariant);
              }}
              className="aqua-button p-3"
              title="Download"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>

            {onSaveAsExemplar && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSaveAsExemplar(lightboxVariant);
                }}
                className="aqua-button p-3"
                title="Save as exemplar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </button>
            )}

            {teamMemberId && onSetOfficial && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSetOfficial(lightboxVariant);
                }}
                className="aqua-button aqua-button-primary p-3"
                title="Set as official avatar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            )}
          </div>

          {/* Navigation arrows */}
          {variants.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const currentIndex = variants.findIndex(v => v.id === lightboxVariant.id);
                  const prevIndex = (currentIndex - 1 + variants.length) % variants.length;
                  setLightboxVariant(variants[prevIndex]);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const currentIndex = variants.findIndex(v => v.id === lightboxVariant.id);
                  const nextIndex = (currentIndex + 1) % variants.length;
                  setLightboxVariant(variants[nextIndex]);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    )}
    </>
  );
}
