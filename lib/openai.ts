import OpenAI, { toFile } from "openai";
import sharp from "sharp";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_EXEMPLARS = 4;

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

  // Process exemplar images from client (style references)
  const exemplarBuffers: Buffer[] = [];
  for (const exemplarBase64 of exemplarImages.slice(0, MAX_EXEMPLARS)) {
    const exemplarData = exemplarBase64.replace(/^data:image\/\w+;base64,/, "");
    const exemplarBuffer = await sharp(Buffer.from(exemplarData, "base64"))
      .resize(1024, 1024, { fit: "cover" })
      .png()
      .toBuffer();
    exemplarBuffers.push(exemplarBuffer);
  }

  // Generate images in parallel using gpt-image-1
  const promises = Array.from({ length: count }, async () => {
    const subjectFile = await toFile(subjectBuffer, "subject.png", { type: "image/png" });

    let imageInput;
    if (isPetMode || exemplarBuffers.length === 0) {
      // No style references: send subject only
      imageInput = subjectFile;
    } else {
      const imageArray = [];
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
