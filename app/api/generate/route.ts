import { NextRequest } from "next/server";
import { prepareBuffers, generateOneAvatar } from "@/lib/openai";

export const maxDuration = 300;

interface RequestBody {
  imageBase64: string;
  prompt: string;
  isPetMode?: boolean;
  backgroundColor?: string;
  count?: number;
  exemplarImages?: string[];
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as RequestBody;
  const { imageBase64, prompt, isPetMode = false, backgroundColor, exemplarImages = [] } = body;
  const count = Math.min(10, Math.max(1, body.count ?? 1));

  if (!imageBase64 || !prompt) {
    return errorResponse("Missing required fields: imageBase64 and prompt", 400);
  }

  // Build the final prompt (background color substitution + exemplar context)
  let finalPrompt = prompt;
  if (backgroundColor && backgroundColor !== "#E6E6E6") {
    finalPrompt = finalPrompt.replace(/#E6E6E6/gi, backgroundColor);
  }
  if (exemplarImages.length > 0 && !isPetMode) {
    const n = exemplarImages.length;
    finalPrompt += `

REFERENCE IMAGES:
You are provided with ${n} style reference image${n === 1 ? "" : "s"} (images 1-${n}) that demonstrate the desired output style, followed by the subject photo (image ${n + 1}) whose likeness to capture.

Match the consistent visual style shown across the reference images. Capture the likeness of the person in the subject photo.`;
  }

  let buffers;
  try {
    buffers = await prepareBuffers(imageBase64, exemplarImages);
  } catch (err) {
    return errorResponse(`Failed to process input images: ${asMessage(err)}`, 400);
  }

  const encoder = new TextEncoder();
  const encode = (obj: unknown) => encoder.encode(JSON.stringify(obj) + "\n");

  const stream = new ReadableStream({
    async start(controller) {
      // First chunk: metadata
      controller.enqueue(encode({ type: "meta", promptUsed: finalPrompt, count }));

      const tasks = Array.from({ length: count }, async (_, i) => {
        try {
          const image = await generateOneAvatar(finalPrompt, buffers, isPetMode);
          controller.enqueue(encode({ type: "image", index: i, image }));
        } catch (err) {
          const message = asMessage(err);
          console.error(`Variant ${i} failed:`, message);
          controller.enqueue(encode({ type: "error", index: i, message }));
        }
      });

      await Promise.all(tasks);
      controller.enqueue(encode({ type: "done" }));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}

function errorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function asMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Unknown error";
}
