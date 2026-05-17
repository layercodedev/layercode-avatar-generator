// Client-side localStorage storage for avatar app
// All data persists in the browser only

import { DEFAULT_EXEMPLARS } from "./default-exemplars";

export interface TeamMember {
  id: number;
  name: string;
  officialAvatarId: number | null;
  createdAt: Date;
}

export interface Prompt {
  id: number;
  name: string;
  content: string;
  isDefault: boolean;
  isPetMode: boolean;
  createdAt: Date;
}

export interface Generation {
  id: number;
  originalImage: string;
  promptUsed: string;
  teamMemberId: number | null;
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

// Default prompts (hardcoded to ensure availability on fresh load)
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
  teamMembers: "avatar-app-team-members",
  prompts: "avatar-app-prompts",
  generations: "avatar-app-generations",
  variants: "avatar-app-variants",
  exemplars: "avatar-app-exemplars",
  nextId: "avatar-app-next-id",
  version: "avatar-app-version",
  exemplarsVersion: "avatar-app-exemplars-version",
};

// Bump to force prompts reset on next load
const PROMPTS_VERSION = 4;

// Bump to force exemplars reset on next load
const EXEMPLARS_VERSION = 1;

function checkPromptsVersion(): void {
  if (typeof window === "undefined") return;
  const storedVersion = localStorage.getItem(STORAGE_KEYS.version);
  const currentVersion = PROMPTS_VERSION.toString();

  if (storedVersion !== currentVersion) {
    localStorage.removeItem(STORAGE_KEYS.prompts);
    localStorage.setItem(STORAGE_KEYS.version, currentVersion);
    console.log(`Prompts reset to version ${currentVersion}`);
  }
}

function checkExemplarsVersion(): void {
  if (typeof window === "undefined") return;
  const storedVersion = localStorage.getItem(STORAGE_KEYS.exemplarsVersion);
  const currentVersion = EXEMPLARS_VERSION.toString();

  if (storedVersion !== currentVersion) {
    localStorage.removeItem(STORAGE_KEYS.exemplars);
    localStorage.setItem(STORAGE_KEYS.exemplarsVersion, currentVersion);
    console.log(`Exemplars reset to version ${currentVersion}`);
  }
}

// ID generator
function getNextId(key: string): number {
  if (typeof window === "undefined") return Date.now();
  const ids = JSON.parse(localStorage.getItem(STORAGE_KEYS.nextId) || "{}");
  const nextId = (ids[key] || 0) + 1;
  ids[key] = nextId;
  localStorage.setItem(STORAGE_KEYS.nextId, JSON.stringify(ids));
  return nextId;
}

// Generic storage helpers
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

// Team Members
export function getTeamMembers(): TeamMember[] {
  return getItems<TeamMember>(STORAGE_KEYS.teamMembers);
}

export function addTeamMember(name: string): TeamMember {
  const members = getTeamMembers();
  const member: TeamMember = {
    id: getNextId("teamMember"),
    name,
    officialAvatarId: null,
    createdAt: new Date(),
  };
  members.push(member);
  setItems(STORAGE_KEYS.teamMembers, members);
  return member;
}

export function updateTeamMember(id: number, updates: Partial<TeamMember>): TeamMember | null {
  const members = getTeamMembers();
  const index = members.findIndex((m) => m.id === id);
  if (index === -1) return null;
  members[index] = { ...members[index], ...updates };
  setItems(STORAGE_KEYS.teamMembers, members);
  return members[index];
}

export function deleteTeamMember(id: number): void {
  const members = getTeamMembers().filter((m) => m.id !== id);
  setItems(STORAGE_KEYS.teamMembers, members);
  // Clear team member from generations
  const generations = getGenerations();
  generations.forEach((g) => {
    if (g.teamMemberId === id) g.teamMemberId = null;
  });
  setItems(STORAGE_KEYS.generations, generations);
}

// Prompts
export function getPrompts(): Prompt[] {
  // Check if prompts need to be reset due to version change
  checkPromptsVersion();

  const stored = getItems<Prompt>(STORAGE_KEYS.prompts);
  if (stored.length === 0) {
    // Initialize with default prompts
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

export function updatePrompt(id: number, updates: Partial<Prompt>): Prompt | null {
  const prompts = getPrompts();
  const index = prompts.findIndex((p) => p.id === id);
  if (index === -1) return null;
  prompts[index] = { ...prompts[index], ...updates };
  setItems(STORAGE_KEYS.prompts, prompts);
  return prompts[index];
}

export function deletePrompt(id: number): boolean {
  const prompts = getPrompts();
  const prompt = prompts.find((p) => p.id === id);
  if (prompt?.isDefault) return false; // Can't delete default
  setItems(STORAGE_KEYS.prompts, prompts.filter((p) => p.id !== id));
  return true;
}

// Generations
export function getGenerations(): Generation[] {
  return getItems<Generation>(STORAGE_KEYS.generations);
}

export function addGeneration(originalImage: string, promptUsed: string, teamMemberId: number | null): Generation {
  const generations = getGenerations();
  const generation: Generation = {
    id: getNextId("generation"),
    originalImage,
    promptUsed,
    teamMemberId,
    createdAt: new Date(),
  };
  generations.unshift(generation); // Add to beginning
  setItems(STORAGE_KEYS.generations, generations);
  return generation;
}

export function updateGeneration(id: number, updates: Partial<Generation>): Generation | null {
  const generations = getGenerations();
  const index = generations.findIndex((g) => g.id === id);
  if (index === -1) return null;
  generations[index] = { ...generations[index], ...updates };
  setItems(STORAGE_KEYS.generations, generations);
  return generations[index];
}

export function deleteGeneration(id: number): void {
  setItems(STORAGE_KEYS.generations, getGenerations().filter((g) => g.id !== id));
  setItems(STORAGE_KEYS.variants, getVariants().filter((v) => v.generationId !== id));
}

// Variants
export function getVariants(): Variant[] {
  return getItems<Variant>(STORAGE_KEYS.variants);
}

export function getVariantsByGeneration(generationId: number): Variant[] {
  return getVariants().filter((v) => v.generationId === generationId);
}

export function addVariants(generationId: number, imageDataArray: string[]): Variant[] {
  const variants = getVariants();
  const newVariants = imageDataArray.map((imageData) => ({
    id: getNextId("variant"),
    generationId,
    imageData,
    isFavorited: false,
    createdAt: new Date(),
  }));
  variants.push(...newVariants);
  setItems(STORAGE_KEYS.variants, variants);
  return newVariants;
}

export function updateVariant(id: number, updates: Partial<Variant>): Variant | null {
  const variants = getVariants();
  const index = variants.findIndex((v) => v.id === id);
  if (index === -1) return null;
  variants[index] = { ...variants[index], ...updates };
  setItems(STORAGE_KEYS.variants, variants);
  return variants[index];
}

export function getVariantById(id: number): Variant | null {
  return getVariants().find((v) => v.id === id) || null;
}

// Exemplars
export function getExemplars(): Exemplar[] {
  checkExemplarsVersion();
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

export function deleteExemplar(id: number): void {
  setItems(STORAGE_KEYS.exemplars, getExemplars().filter((e) => e.id !== id));
}

export function getExemplarById(id: number): Exemplar | null {
  return getExemplars().find((e) => e.id === id) || null;
}

// Clear all history (generations and variants)
export function clearAllHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.generations);
  localStorage.removeItem(STORAGE_KEYS.variants);
}

// Clear all exemplars
export function clearAllExemplars(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.exemplars);
}
