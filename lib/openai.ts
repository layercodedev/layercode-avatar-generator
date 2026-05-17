import OpenAI, { toFile } from "openai";
import sharp from "sharp";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const MAX_EXEMPLARS = 4;
const MODEL = "gpt-image-2";

export interface PreparedBuffers {
  subjectBuffer: Buffer;
  exemplarBuffers: Buffer[];
}

export async function prepareBuffers(
  imageBase64: string,
  exemplarImages: string[] = []
): Promise<PreparedBuffers> {
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
  const inputBuffer = Buffer.from(base64Data, "base64");
  const subjectBuffer = await sharp(inputBuffer)
    .resize(1024, 1024, { fit: "cover" })
    .png()
    .toBuffer();

  const exemplarBuffers: Buffer[] = [];
  for (const exemplarBase64 of exemplarImages.slice(0, MAX_EXEMPLARS)) {
    const exemplarData = exemplarBase64.replace(/^data:image\/\w+;base64,/, "");
    const exemplarBuffer = await sharp(Buffer.from(exemplarData, "base64"))
      .resize(1024, 1024, { fit: "cover" })
      .png()
      .toBuffer();
    exemplarBuffers.push(exemplarBuffer);
  }

  return { subjectBuffer, exemplarBuffers };
}

export async function generateOneAvatar(
  prompt: string,
  buffers: PreparedBuffers,
  isPetMode: boolean = false
): Promise<string> {
  const { subjectBuffer, exemplarBuffers } = buffers;
  const subjectFile = await toFile(subjectBuffer, "subject.png", { type: "image/png" });

  let imageInput;
  if (isPetMode || exemplarBuffers.length === 0) {
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
    model: MODEL,
    image: imageInput,
    prompt,
    size: "1024x1024",
    quality: "high",
  });

  const b64 = response.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error("No image data returned");
  }
  return b64;
}
