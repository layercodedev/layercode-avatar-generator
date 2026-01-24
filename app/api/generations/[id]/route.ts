import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const generation = await db.query.generations.findFirst({
      where: (generations, { eq }) => eq(generations.id, parseInt(id)),
    });

    if (!generation) {
      return NextResponse.json({ error: "Generation not found" }, { status: 404 });
    }

    const genVariants = await db.query.variants.findMany({
      where: (variants, { eq }) => eq(variants.generationId, parseInt(id)),
    });

    let teamMember = null;
    if (generation.teamMemberId) {
      teamMember = await db.query.teamMembers.findFirst({
        where: (tm, { eq }) => eq(tm.id, generation.teamMemberId!),
      });
    }

    return NextResponse.json({
      ...generation,
      variants: genVariants,
      teamMember,
    });
  } catch (error) {
    console.error("Error fetching generation:", error);
    return NextResponse.json({ error: "Failed to fetch generation" }, { status: 500 });
  }
}
