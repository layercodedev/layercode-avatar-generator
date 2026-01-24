import { NextRequest, NextResponse } from "next/server";
import { db, initializeDatabase } from "@/lib/db";
import { generations, variants } from "@/lib/schema";
import { generateAvatars } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();

    const body = await request.json();
    const { imageBase64, prompt, teamMemberId, isPetMode, backgroundColor } = body;

    if (!imageBase64 || !prompt) {
      return NextResponse.json(
        { error: "Missing required fields: imageBase64 and prompt" },
        { status: 400 }
      );
    }

    // Replace background color placeholder in prompt if custom color is provided
    let finalPrompt = prompt;
    if (backgroundColor && backgroundColor !== "#1e2a3a") {
      // Replace the default background color with the custom one
      finalPrompt = prompt.replace(/#1e2a3a/gi, backgroundColor);
    }

    // Generate 6 avatar variants
    const generatedImages = await generateAvatars(imageBase64, finalPrompt, 6, isPetMode || false);

    if (generatedImages.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate any images" },
        { status: 500 }
      );
    }

    // Save the generation
    const [generation] = await db
      .insert(generations)
      .values({
        originalImage: imageBase64,
        promptUsed: finalPrompt,
        teamMemberId: teamMemberId || null,
      })
      .returning();

    // Save all variants
    const variantRecords = await Promise.all(
      generatedImages.map((imageData) =>
        db
          .insert(variants)
          .values({
            generationId: generation.id,
            imageData,
            isFavorited: false,
          })
          .returning()
      )
    );

    return NextResponse.json({
      generation,
      variants: variantRecords.map((v) => v[0]),
    });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
