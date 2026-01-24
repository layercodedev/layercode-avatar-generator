import OpenAI, { toFile } from "openai";
import sharp from "sharp";
import fs from "fs";
import path from "path";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Load the style reference image once at startup
const styleReferencePath = path.join(process.cwd(), "..", "Aidan hifi.png");
let styleReferenceBuffer: Buffer | null = null;

async function getStyleReference(): Promise<Buffer> {
  if (!styleReferenceBuffer) {
    const rawBuffer = fs.readFileSync(styleReferencePath);
    styleReferenceBuffer = await sharp(rawBuffer)
      .resize(1024, 1024, { fit: "cover" })
      .png()
      .toBuffer();
  }
  return styleReferenceBuffer;
}

export async function generateAvatars(
  imageBase64: string,
  prompt: string,
  count: number = 6,
  isPetMode: boolean = false
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

  // Generate images in parallel using gpt-image-1
  const promises = Array.from({ length: count }, async () => {
    // Create fresh file objects for each request
    const subjectFile = await toFile(subjectBuffer, "subject.png", { type: "image/png" });

    let imageInput;
    if (isPetMode) {
      // Pet mode: only use the subject image (the pet photo)
      imageInput = subjectFile;
    } else {
      // Normal mode: use both style reference and subject
      const styleFile = await toFile(styleBuffer!, "style-reference.png", { type: "image/png" });
      imageInput = [styleFile, subjectFile];
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
