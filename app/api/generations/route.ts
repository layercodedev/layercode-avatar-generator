import { NextRequest, NextResponse } from "next/server";
import { db, initializeDatabase } from "@/lib/db";
import { generations, variants } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const favoritesOnly = searchParams.get("favoritesOnly") === "true";
    const teamMemberId = searchParams.get("teamMemberId");

    // Get all generations with their variants and team member info
    let allGenerations = await db.query.generations.findMany({
      orderBy: [desc(generations.createdAt)],
    });

    // Filter by team member if specified
    if (teamMemberId) {
      allGenerations = allGenerations.filter(
        (g) => g.teamMemberId === parseInt(teamMemberId)
      );
    }

    // Search by prompt text
    if (search) {
      allGenerations = allGenerations.filter((g) =>
        g.promptUsed.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Get variants for each generation
    const results = await Promise.all(
      allGenerations.map(async (gen) => {
        let genVariants = await db.query.variants.findMany({
          where: eq(variants.generationId, gen.id),
        });

        // If favorites only, filter generations that have at least one favorite
        if (favoritesOnly) {
          genVariants = genVariants.filter((v) => v.isFavorited);
          if (genVariants.length === 0) return null;
        }

        // Get team member info if assigned
        let teamMember = null;
        if (gen.teamMemberId) {
          teamMember = await db.query.teamMembers.findFirst({
            where: (tm, { eq }) => eq(tm.id, gen.teamMemberId!),
          });
        }

        return {
          ...gen,
          variants: genVariants,
          teamMember,
        };
      })
    );

    return NextResponse.json(results.filter(Boolean));
  } catch (error) {
    console.error("Error fetching generations:", error);
    return NextResponse.json({ error: "Failed to fetch generations" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing required parameter: id" }, { status: 400 });
    }

    // Delete variants first (foreign key constraint)
    await db.delete(variants).where(eq(variants.generationId, parseInt(id)));
    await db.delete(generations).where(eq(generations.id, parseInt(id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting generation:", error);
    return NextResponse.json({ error: "Failed to delete generation" }, { status: 500 });
  }
}
