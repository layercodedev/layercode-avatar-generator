import { NextRequest, NextResponse } from "next/server";
import { generateAvatars } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64, prompt, isPetMode, backgroundColor, count = 6, exemplarImages = [] } = body;

    if (!imageBase64 || !prompt) {
      return NextResponse.json(
        { error: "Missing required fields: imageBase64 and prompt" },
        { status: 400 }
      );
    }

    // Replace background color placeholder in prompt if custom color is provided
    let finalPrompt = prompt;
    if (backgroundColor && backgroundColor !== "#E6E6E6") {
      finalPrompt = prompt.replace(/#E6E6E6/gi, backgroundColor);
    }

    // Add exemplar context to prompt if exemplars are provided
    if (exemplarImages.length > 0 && !isPetMode) {
      const n = exemplarImages.length;
      const exemplarNote = `

REFERENCE IMAGES:
You are provided with ${n} style reference image${n === 1 ? "" : "s"} (images 1-${n}) that demonstrate the desired output style, followed by the subject photo (image ${n + 1}) whose likeness to capture.

Match the consistent visual style shown across the reference images. Capture the likeness of the person in the subject photo.`;
      finalPrompt = finalPrompt + exemplarNote;
    }

    // Generate avatar variants (1-10, default 6)
    const variantCount = Math.min(10, Math.max(1, count));
    const generatedImages = await generateAvatars(
      imageBase64,
      finalPrompt,
      variantCount,
      isPetMode || false,
      exemplarImages as string[]
    );

    if (generatedImages.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate any images" },
        { status: 500 }
      );
    }

    // Return just the generated images - client handles storage
    return NextResponse.json({
      images: generatedImages,
      promptUsed: finalPrompt,
    });
  } catch (error) {
    console.error("Generation error:", error);
    const errorMessage = error instanceof Error
      ? `${error.message}${error.stack ? ` | Stack: ${error.stack.slice(0, 500)}` : ""}`
      : "Generation failed";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
