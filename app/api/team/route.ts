import { NextRequest, NextResponse } from "next/server";
import { db, initializeDatabase } from "@/lib/db";
import { teamMembers, generations } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    await initializeDatabase();
    const members = await db.query.teamMembers.findMany({
      orderBy: [desc(teamMembers.createdAt)],
    });

    // Get official avatar data for each member
    const membersWithAvatars = await Promise.all(
      members.map(async (member) => {
        let officialAvatar = null;
        if (member.officialAvatarId) {
          officialAvatar = await db.query.variants.findFirst({
            where: (variants, { eq }) => eq(variants.id, member.officialAvatarId!),
          });
        }
        return { ...member, officialAvatar };
      })
    );

    return NextResponse.json(membersWithAvatars);
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "Missing required field: name" }, { status: 400 });
    }

    const [member] = await db
      .insert(teamMembers)
      .values({ name })
      .returning();

    return NextResponse.json(member);
  } catch (error) {
    console.error("Error creating team member:", error);
    return NextResponse.json({ error: "Failed to create team member" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name } = body;

    if (!id || !name) {
      return NextResponse.json(
        { error: "Missing required fields: id and name" },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(teamMembers)
      .set({ name })
      .where(eq(teamMembers.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating team member:", error);
    return NextResponse.json({ error: "Failed to update team member" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing required parameter: id" }, { status: 400 });
    }

    // Clear team member assignment from generations
    await db
      .update(generations)
      .set({ teamMemberId: null })
      .where(eq(generations.teamMemberId, parseInt(id)));

    await db.delete(teamMembers).where(eq(teamMembers.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting team member:", error);
    return NextResponse.json({ error: "Failed to delete team member" }, { status: 500 });
  }
}
