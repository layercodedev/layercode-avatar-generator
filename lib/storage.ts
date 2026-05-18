// Client-side localStorage storage for prompts + exemplars.
// Variants are kept in React state only (not persisted) to avoid
// localStorage quota issues with large base64 image data.

import { DEFAULT_EXEMPLARS } from "./default-exemplars";

export interface Prompt {
  id: number;
  name: string;
  content: string;
  isDefault: boolean;
  isPetMode: boolean;
  createdAt: Date;
}

export interface Variant {
  id: number;
  generationId: number;
  imageData: string;
  isFavorited: boolean;
  createdAt: Date;
}

export interface Exemplar {
  id: number;
  imageData: string;
  name: string;
  createdAt: Date;
  mimeType?: string;
}

export const DEFAULT_PROMPTS: Omit<Prompt, "id" | "createdAt">[] = [
  {
    name: "Claymation",
    content: `Transform the provided professional headshot into a stylized, flattering claymation avatar inspired by classic British stop-motion character animation.

Create a warm, friendly, premium startup-team avatar that preserves the person's recognizable facial structure, hairstyle, skin tone, expression, and overall personality, while translating them into a handcrafted clay character.

Style direction:
- Stop-motion clay puppet aesthetic
- Soft rounded facial forms
- Slightly oversized expressive eyes
- Subtle handmade clay texture
- Gentle facial asymmetry and sculpted imperfections
- Warm, approachable, intelligent expression
- Polished but not overly glossy
- Professional, founder/team-profile appropriate
- Charming and human, not caricatured or childish

Composition:
- Head-and-shoulders portrait
- Subject facing camera or slightly turned, matching the reference photo
- Centered composition
- Clean silhouette around hair, shoulders, and clothing
- No props unless visible in the original image
- No text, logo, frame, badge, or decorative elements

Background:
- Flat light grey background: #E6E6E6
- Uniform, matte, shadow-free background
- Clear separation between subject and background
- Avoid gradients, textures, scenery, or environmental elements
- Make the background easy to select and replace with a custom colour in an image editor

Lighting:
- Soft studio lighting
- Gentle frontal key light
- Subtle clay-surface highlights
- Minimal harsh shadows
- Clear readable face at small avatar sizes

Clothing:
- Keep the general clothing style and colour from the original headshot
- Simplify fabric into clay-like sculpted forms
- Preserve professional appearance
- Avoid adding new accessories

Output quality:
- High-resolution square image
- Clean edges
- Consistent team-avatar style
- Flattering but still recognizable
- Suitable for website bios, social avatars, and internal team pages

Important constraints:
- Do not make the person look like a plastic toy, porcelain doll, Pixar character, anime character, or realistic photograph
- Do not exaggerate facial features aggressively
- Do not add a smile if the original expression is neutral; instead make the expression subtly warm
- Do not change age, gender presentation, ethnicity, hairstyle, or key identifying features
- Do not include hands unless visible in the reference
- Do not add a custom background colour; keep it flat light grey for later replacement`,
    isDefault: true,
    isPetMode: false,
  },
];

const STORAGE_KEYS = {
  prompts: "avatar-app-prompts",
  exemplars: "avatar-app-exemplars",
  nextId: "avatar-app-next-id",
  promptsVersion: "avatar-app-version",
  exemplarsVersion: "avatar-app-exemplars-version",
};

const PROMPTS_VERSION = 4;
const EXEMPLARS_VERSION = 1;

function checkVersion(versionKey: string, dataKey: string, currentVersion: number): void {
  if (typeof window === "undefined") return;
  const stored = localStorage.getItem(versionKey);
  if (stored !== currentVersion.toString()) {
    localStorage.removeItem(dataKey);
    localStorage.setItem(versionKey, currentVersion.toString());
  }
}

function getNextId(key: string): number {
  if (typeof window === "undefined") return Date.now();
  const ids = JSON.parse(localStorage.getItem(STORAGE_KEYS.nextId) || "{}");
  const nextId = (ids[key] || 0) + 1;
  ids[key] = nextId;
  localStorage.setItem(STORAGE_KEYS.nextId, JSON.stringify(ids));
  return nextId;
}

function getItems<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(key);
  if (!data) return [];
  return JSON.parse(data, (k, v) => {
    if (k === "createdAt" && typeof v === "string") return new Date(v);
    return v;
  });
}

function setItems<T>(key: string, items: T[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(items));
}

// Prompts
export function getPrompts(): Prompt[] {
  checkVersion(STORAGE_KEYS.promptsVersion, STORAGE_KEYS.prompts, PROMPTS_VERSION);
  const stored = getItems<Prompt>(STORAGE_KEYS.prompts);
  if (stored.length === 0) {
    const defaults = DEFAULT_PROMPTS.map((p, i) => ({
      ...p,
      id: i + 1,
      createdAt: new Date(),
    }));
    setItems(STORAGE_KEYS.prompts, defaults);
    return defaults;
  }
  return stored;
}

export function addPrompt(name: string, content: string, isPetMode = false): Prompt {
  const prompts = getPrompts();
  const prompt: Prompt = {
    id: getNextId("prompt"),
    name,
    content,
    isDefault: false,
    isPetMode,
    createdAt: new Date(),
  };
  prompts.push(prompt);
  setItems(STORAGE_KEYS.prompts, prompts);
  return prompt;
}

// Exemplars
export function getExemplars(): Exemplar[] {
  checkVersion(STORAGE_KEYS.exemplarsVersion, STORAGE_KEYS.exemplars, EXEMPLARS_VERSION);
  const stored = getItems<Exemplar>(STORAGE_KEYS.exemplars);
  if (stored.length === 0 && DEFAULT_EXEMPLARS.length > 0) {
    const seeded = DEFAULT_EXEMPLARS.map((e, i) => ({
      id: i + 1,
      imageData: e.imageData,
      mimeType: e.mimeType,
      name: e.name,
      createdAt: new Date(),
    }));
    setItems(STORAGE_KEYS.exemplars, seeded);
    return seeded;
  }
  return stored;
}

export function addExemplar(imageData: string, name: string, mimeType?: string): Exemplar {
  const exemplars = getExemplars();
  const exemplar: Exemplar = {
    id: getNextId("exemplar"),
    imageData,
    name,
    createdAt: new Date(),
    mimeType,
  };
  exemplars.push(exemplar);
  setItems(STORAGE_KEYS.exemplars, exemplars);
  return exemplar;
}
