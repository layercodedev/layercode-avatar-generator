// Client-side localStorage storage for avatar app
// All data persists in the browser only

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

// Default prompts (hardcoded to ensure availability on fresh load)
export const DEFAULT_PROMPTS: Omit<Prompt, "id" | "createdAt">[] = [
  {
    name: "High-Fidelity Digital Portrait",
    content: `Create a stylized digital portrait avatar.

STYLE (copy from image 1 exactly):
Match the EXACT visual style of the first reference image - a clean, modern digital portrait with smooth color regions, soft edges, and a professional tech company aesthetic.

SUBJECT (copy from image 2 exactly):
Recreate the person from the second reference image. Preserve their exact likeness, facial features, hair, expression, and any glasses or facial hair. If they are smiling, the avatar must be smiling.

OUTPUT REQUIREMENTS:
- Match the style, color palette, and rendering technique of image 1 precisely
- The person must be immediately recognizable as the subject from image 2
- Preserve the exact facial expression from image 2
- Head and shoulders composition, centered, matching image 1's framing
- Clean, smooth color transitions - no pixelation, no dithering, no noise
- Professional quality suitable for a company website or LinkedIn

The result should look like it belongs in the same avatar set as image 1.`,
    isDefault: true,
    isPetMode: false,
  },
  {
    name: "Low-Res Pixel Art",
    content: `You are provided with two reference images:
- Image 1 (first image): A HIGH-FIDELITY pixel-art avatar that defines the exact visual style to replicate.
- Image 2 (second image): A photographic portrait of the person whose likeness should be recreated.

TASK: Create a new pixel art portrait that EXACTLY matches the style of image 1, but depicts the person from image 2.

CRITICAL - IMAGE ROLES:
Image 1 = STYLE REFERENCE (copy this style exactly):
- The fine pixel density and resolution
- The color palette and color blocking technique
- The shading approach (flat, blocky)
- The crop, framing, and composition
- The teal-blue background color

Image 2 = LIKENESS REFERENCE (capture this person):
- Facial structure and proportions
- Hair color, style, and hairline
- Eye color and shape
- Any facial hair
- Expression
- Glasses if present

STYLE REQUIREMENTS (match image 1 precisely):
- HIGH-FIDELITY pixel art - fine detail, NOT chunky retro 8-bit style
- Small, detailed pixel blocks that preserve facial features
- Clean color blocking without gradients or smooth blending
- Modern, contemporary pixel art aesthetic
- The output should look like it belongs in the SAME SET as image 1

COLOR PALETTE:
- Match the exact color palette from image 1
- Use the same teal-blue background
- Limited palette (~15-25 colors)
- Professional, modern tech aesthetic

COMPOSITION:
- Head and shoulders crop (match image 1)
- Centered framing
- Face should be similar scale to image 1
- Friendly, approachable expression

DO NOT:
- Make chunky low-resolution 8-bit style pixels
- Use smooth gradients or painterly blending
- Add outlines or cartoon effects
- Introduce colors not in image 1's palette
- Change the background color

The final image must look like it was created by the same artist who made image 1.`,
    isDefault: false,
    isPetMode: false,
  },
  {
    name: "Hi-Fi Pixel Art (No Grid)",
    content: `You are provided with two reference images:
- Image 1 (Style Reference): A pixel-art avatar that defines the exact visual style to replicate.
- Image 2 (Subject Reference): A photographic portrait of the person whose likeness should be recreated.

Both references are mandatory and must be followed precisely.

REFERENCE PRIORITY (critical):
Image 1 controls STYLE only:
- Pixel size
- Resolution feel
- Color blocking
- Shading approach
- Crop and framing

Image 2 controls LIKENESS only:
- Facial structure
- Hairline, hair volume
- Beard / stubble
- Glasses shape
- Expression and proportions

Do not mix these roles. Do not borrow style details from Image 2 or facial details from Image 1.

STYLE RULES (match Image 1 exactly):
- Modern, contemporary pixel art (not retro)
- Square pixels only
- Clean, intentional pixel blocks with hard edges
- No outlines
- ABSOLUTELY NO DITHERING - use solid, flat color regions only
- No gradients or color transitions
- No noise, grain, or texture
- No stippling or dot patterns
- Each pixel block should be a single solid color
- This should look like it belongs in the same set as Image 1

RESOLUTION (non-negotiable):
- Design the portrait on a true 512×512 pixel grid
- Upscale cleanly using nearest-neighbor scaling to 1024×1024
- The final image must visibly read as high-fidelity pixel art
- Pixels should be very small and fine

LIGHTING:
- Flat, soft, front-lit
- Even illumination
- No dramatic shadows or highlights

COLOR PALETTE (match Image 1):
- Use the same limited, muted palette as Image 1
- Do not introduce new hues unless strictly necessary for likeness
- Background: solid dark navy blue (#1e2a3a)
- Total palette: ~12–20 colors maximum
- Professional, modern tech aesthetic

COMPOSITION (match Image 1):
- Crop: head and shoulders
- Framing: centered
- Scale: face size should closely match Image 1
- Expression: friendly, subtle smile (as in Image 2)

PROHIBITIONS (strict):
- No photorealism
- No high-resolution detail
- No painterly blending
- No anti-aliasing
- No soft shading
- No texture or grain
- No AI "fake pixel" effects
- No vector art or cartoon outlines
- No gradients of any kind
- NO DITHERING PATTERNS - no checkerboard mixing, no stippling, no dot patterns
- No color blending through alternating pixels

FINAL QUALITY CHECK:
- The avatar could sit next to Image 1 and look like the same artist made it
- The person is immediately recognizable from Image 2
- The image reads clearly at 512×512 pixels with fine detail
If any check fails, simplify and re-render.`,
    isDefault: false,
    isPetMode: false,
  },
  {
    name: "Ultra Hi-Fi Portrait (ChatGPT Style)",
    content: `Transform this portrait photo into a stylized digital avatar.

STYLE:
Create a high-fidelity digital portrait with a subtle pixelated texture. The style should feel like a premium tech company avatar - clean, modern, and professional. Think of it as a photograph that has been artistically processed with a very fine pixel overlay, not traditional chunky pixel art.

KEY VISUAL CHARACTERISTICS:
- Ultra-fine pixel texture (pixels should be barely visible at normal viewing size)
- Smooth, natural skin tones with subtle color variations
- Realistic hair rendering with fine detail preserved
- Natural shadows and highlights (soft, not flat)
- Professional portrait photography composition
- High color fidelity - rich, vibrant but not oversaturated

SUBJECT:
Capture the exact likeness of the person in the photo:
- Preserve their facial structure, features, and proportions exactly
- Keep their exact expression (if smiling, they must be smiling)
- Maintain glasses, facial hair, and distinctive features
- Natural eye color and shape
- Accurate hair color, style, and texture

BACKGROUND:
- Solid color background: #1e2a3a (dark navy blue)
- Clean, uniform, no gradients or textures
- Professional tech company aesthetic

COMPOSITION:
- Head and shoulders framing
- Centered, looking toward camera
- Similar to a LinkedIn or company website headshot
- Face fills approximately 60-70% of the frame height

QUALITY:
- Output at full 1024x1024 resolution
- The pixel effect should be subtle and refined
- Professional quality suitable for a company about page
- The person should be immediately recognizable

The final result should look like a cohesive set of team avatars you would see on a modern tech startup website - stylized but still clearly representing real people.`,
    isDefault: false,
    isPetMode: false,
  },
  {
    name: "Clean Pixel Art (No Dithering)",
    content: `You are provided with two reference images:
- Image 1 (Style Reference): A pixel-art avatar that defines the exact visual style to replicate.
- Image 2 (Subject Reference): A photographic portrait of the person whose likeness should be recreated.

TASK: Create a clean, crisp pixel art portrait matching Image 1's style, depicting the person from Image 2.

CRITICAL STYLE REQUIREMENT - NO DITHERING:
This is the most important rule. The output must use ONLY solid, flat color blocks:
- Every pixel region must be a single uniform color
- NO checkerboard patterns
- NO stippling or dot patterns
- NO alternating pixel colors to simulate gradients
- NO speckled or noisy color transitions
- Color changes must be sharp, clean edges between solid regions
- Think "color by numbers" - each area is ONE solid color

REFERENCE ROLES:
Image 1 = STYLE (copy exactly):
- Pixel density and size
- Color palette
- Flat shading approach
- Composition and framing

Image 2 = LIKENESS (capture exactly):
- Facial structure and proportions
- Hair color, style, hairline
- Eye color and shape
- Glasses, facial hair
- Expression

STYLE RULES:
- Modern pixel art with small, fine pixels
- Square pixels only
- Hard edges between color regions
- Flat, solid color fills - NO texture within regions
- Limited palette (~12-20 colors maximum)
- No outlines around shapes
- No anti-aliasing

RESOLUTION:
- Design on 512×512 pixel grid
- Upscale with nearest-neighbor to 1024×1024
- Pixels should be crisp and clearly defined

COLOR APPROACH:
- Use solid color blocks only
- Shadows = darker solid color (not dithered blend)
- Highlights = lighter solid color (not dithered blend)
- Background: solid dark navy blue (#1e2a3a)
- Skin tones: 3-4 solid colors max, no blending

LIGHTING:
- Flat, front-lit, even illumination
- Minimal shadows
- No dramatic lighting

COMPOSITION:
- Head and shoulders crop
- Centered framing
- Face fills ~60% of frame height
- Friendly expression

ABSOLUTE PROHIBITIONS:
- NO DITHERING (most important)
- No gradients
- No noise or grain
- No stippling
- No checkerboard color mixing
- No anti-aliasing
- No soft edges
- No photorealism
- No painterly blending

QUALITY CHECK:
Before finalizing, verify:
1. Zoom in - are ALL color regions solid with no dot patterns?
2. Are color transitions sharp edges, not blended?
3. Does it look like classic video game sprite art?
If any dithering is visible, simplify colors and re-render with solid blocks only.`,
    isDefault: false,
    isPetMode: false,
  },
  {
    name: "Pet Mode (Animals)",
    content: `Create a stylized pixel art portrait of the animal in the provided photo.

SUBJECT (from the uploaded photo):
Recreate the animal from the reference photo. Capture their unique features:
- Fur/coat color and pattern
- Eye color and shape
- Ear shape and position
- Facial markings
- Expression and personality

STYLE REQUIREMENTS:
- High-fidelity pixel art (not retro 8-bit)
- Modern, contemporary pixel art aesthetic
- Square pixels only
- Clean, intentional pixel blocks
- No outlines around the subject
- Minimal dithering - prefer solid color blocks
- No gradients or smooth blending
- No noise or texture artifacts

RESOLUTION:
- Design on a true 512×512 pixel grid
- Fine, detailed pixels that preserve the animal's features
- The final image must read clearly as pixel art

LIGHTING:
- Flat, soft, front-lit
- Even illumination across the face
- No dramatic shadows or highlights

COLOR PALETTE:
- Limited, muted palette (~15-25 colors)
- Background: solid dark navy blue (#1e2a3a)
- Use natural fur/coat colors from the photo
- Professional, modern tech aesthetic

COMPOSITION:
- Head and shoulders/chest crop
- Centered framing
- Animal should fill most of the frame
- Capture their personality and expression

PROHIBITIONS:
- No photorealism
- No painterly blending
- No anti-aliasing
- No soft shading
- No texture or grain
- No AI "fake pixel" effects
- No vector art or cartoon outlines
- No gradients of any kind
- No humanizing the animal (clothes, accessories, etc.)

OUTPUT:
A charming, recognizable pixel art portrait of the pet that could sit alongside human avatars in a company team page.`,
    isDefault: false,
    isPetMode: true,
  },
];

const STORAGE_KEYS = {
  teamMembers: "avatar-app-team-members",
  prompts: "avatar-app-prompts",
  generations: "avatar-app-generations",
  variants: "avatar-app-variants",
  nextId: "avatar-app-next-id",
};

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
