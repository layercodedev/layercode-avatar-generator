import { NextRequest, NextResponse } from "next/server";
import { db, initializeDatabase } from "@/lib/db";
import { prompts } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    await initializeDatabase();
    const allPrompts = await db.query.prompts.findMany({
      orderBy: (prompts, { desc }) => [desc(prompts.isDefault), desc(prompts.createdAt)],
    });
    return NextResponse.json(allPrompts);
  } catch (error) {
    console.error("Error fetching prompts:", error);
    return NextResponse.json({ error: "Failed to fetch prompts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    const body = await request.json();
    const { name, content } = body;

    if (!name || !content) {
      return NextResponse.json(
        { error: "Missing required fields: name and content" },
        { status: 400 }
      );
    }

    const [prompt] = await db
      .insert(prompts)
      .values({ name, content, isDefault: false })
      .returning();

    return NextResponse.json(prompt);
  } catch (error) {
    console.error("Error creating prompt:", error);
    return NextResponse.json({ error: "Failed to create prompt" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, content } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing required field: id" }, { status: 400 });
    }

    const [updated] = await db
      .update(prompts)
      .set({ name, content })
      .where(eq(prompts.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating prompt:", error);
    return NextResponse.json({ error: "Failed to update prompt" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing required parameter: id" }, { status: 400 });
    }

    // Don't allow deleting the default prompt
    const prompt = await db.query.prompts.findFirst({
      where: (prompts, { eq }) => eq(prompts.id, parseInt(id)),
    });

    if (prompt?.isDefault) {
      return NextResponse.json({ error: "Cannot delete the default prompt" }, { status: 400 });
    }

    await db.delete(prompts).where(eq(prompts.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting prompt:", error);
    return NextResponse.json({ error: "Failed to delete prompt" }, { status: 500 });
  }
}
