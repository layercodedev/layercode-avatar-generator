import { NextRequest, NextResponse } from "next/server";
import { generateAvatars } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64, prompt, isPetMode, backgroundColor, count = 6 } = body;

    if (!imageBase64 || !prompt) {
      return NextResponse.json(
        { error: "Missing required fields: imageBase64 and prompt" },
        { status: 400 }
      );
    }

    // Replace background color placeholder in prompt if custom color is provided
    let finalPrompt = prompt;
    if (backgroundColor && backgroundColor !== "#1e2a3a") {
      finalPrompt = prompt.replace(/#1e2a3a/gi, backgroundColor);
    }

    // Generate avatar variants (1-10, default 6)
    const variantCount = Math.min(10, Math.max(1, count));
    const generatedImages = await generateAvatars(imageBase64, finalPrompt, variantCount, isPetMode || false);

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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
