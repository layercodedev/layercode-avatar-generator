import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { variants, teamMembers } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { isFavorited, setAsOfficial, teamMemberId } = body;

    const variant = await db.query.variants.findFirst({
      where: (variants, { eq }) => eq(variants.id, parseInt(id)),
    });

    if (!variant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    // Update favorite status if provided
    if (typeof isFavorited === "boolean") {
      await db
        .update(variants)
        .set({ isFavorited })
        .where(eq(variants.id, parseInt(id)));
    }

    // Set as official avatar for team member
    if (setAsOfficial && teamMemberId) {
      await db
        .update(teamMembers)
        .set({ officialAvatarId: parseInt(id) })
        .where(eq(teamMembers.id, teamMemberId));
    }

    const updated = await db.query.variants.findFirst({
      where: (variants, { eq }) => eq(variants.id, parseInt(id)),
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating variant:", error);
    return NextResponse.json({ error: "Failed to update variant" }, { status: 500 });
  }
}
