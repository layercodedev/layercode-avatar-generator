import OpenAI, { toFile } from "openai";
import sharp from "sharp";
import fs from "fs";
import path from "path";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Cache for style reference image
let styleReferenceBuffer: Buffer | null = null;

async function getStyleReference(): Promise<Buffer> {
  if (!styleReferenceBuffer) {
    // Try filesystem first (works locally), then fetch from URL (works on Vercel)
    const localPath = path.join(process.cwd(), "public", "style-reference.png");

    try {
      const rawBuffer = fs.readFileSync(localPath);
      styleReferenceBuffer = await sharp(rawBuffer)
        .resize(1024, 1024, { fit: "cover" })
        .png()
        .toBuffer();
    } catch {
      // Fallback: fetch from deployed URL
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "https://avatar-app-tau.vercel.app";
      const response = await fetch(`${baseUrl}/style-reference.png`);
      const arrayBuffer = await response.arrayBuffer();
      const rawBuffer = Buffer.from(arrayBuffer);
      styleReferenceBuffer = await sharp(rawBuffer)
        .resize(1024, 1024, { fit: "cover" })
        .png()
        .toBuffer();
    }
  }
  return styleReferenceBuffer;
}

export async function generateAvatars(
  imageBase64: string,
  prompt: string,
  count: number = 6,
  isPetMode: boolean = false,
  exemplarImages: string[] = []
): Promise<string[]> {
  const results: string[] = [];

  // Strip data URL prefix if present
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

  // Convert base64 to buffer and convert to PNG using sharp
  const inputBuffer = Buffer.from(base64Data, "base64");
  const subjectBuffer = await sharp(inputBuffer)
    .resize(1024, 1024, { fit: "cover" })
    .png()
    .toBuffer();

  // Get the style reference image (only needed for non-pet mode)
  const styleBuffer = isPetMode ? null : await getStyleReference();

  // Process exemplar images (limit to 3)
  const exemplarBuffers: Buffer[] = [];
  for (const exemplarBase64 of exemplarImages.slice(0, 3)) {
    const exemplarData = exemplarBase64.replace(/^data:image\/\w+;base64,/, "");
    const exemplarBuffer = await sharp(Buffer.from(exemplarData, "base64"))
      .resize(1024, 1024, { fit: "cover" })
      .png()
      .toBuffer();
    exemplarBuffers.push(exemplarBuffer);
  }

  // Generate images in parallel using gpt-image-1
  const promises = Array.from({ length: count }, async () => {
    // Create fresh file objects for each request
    const subjectFile = await toFile(subjectBuffer, "subject.png", { type: "image/png" });

    let imageInput;
    if (isPetMode) {
      // Pet mode: only use the subject image (the pet photo)
      imageInput = subjectFile;
    } else {
      // Normal mode: use style reference, exemplars, and subject
      const styleFile = await toFile(styleBuffer!, "style-reference.png", { type: "image/png" });

      // Build array: style reference first, then exemplars, then subject
      const imageArray = [styleFile];

      // Add exemplar files
      for (let i = 0; i < exemplarBuffers.length; i++) {
        const exemplarFile = await toFile(exemplarBuffers[i], `exemplar-${i + 1}.png`, { type: "image/png" });
        imageArray.push(exemplarFile);
      }

      imageArray.push(subjectFile);
      imageInput = imageArray;
    }

    const response = await openai.images.edit({
      model: "gpt-image-1",
      image: imageInput,
      prompt: prompt,
      size: "1024x1024",
      quality: "high",
      input_fidelity: "high",
    });

    const b64 = response.data?.[0]?.b64_json;
    if (b64) {
      return b64;
    }
    throw new Error("No image data returned");
  });

  const settledResults = await Promise.allSettled(promises);

  for (const result of settledResults) {
    if (result.status === "fulfilled") {
      results.push(result.value);
    } else {
      console.error("Generation failed:", result.reason);
    }
  }

  return results;
}
