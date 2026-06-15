import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import OpenAI from "openai";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { message: "OpenAI API Key not configured. Please add OPENAI_API_KEY to your .env file." },
      { status: 500 }
    );
  }

  const userId = session.user.id;
  const { messages } = await req.json();

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json(
      { message: "Invalid messages payload" },
      { status: 400 }
    );
  }

  try {
    // 1. Fetch user context from database
    const [goals, habits, notes] = await Promise.all([
      prisma.goal.findMany({ where: { userId } }),
      prisma.habit.findMany({ where: { userId } }),
      prisma.note.findMany({ where: { userId } }),
    ]);

    // 2. Format context for the assistant
    const goalsContext = goals
      .map(
        (g) =>
          `- Goal: "${g.title}" | Progress: ${g.progress}% | Completed: ${
            g.completed ? "Yes" : "No"
          }${g.deadline ? ` | Deadline: ${g.deadline.toDateString()}` : ""}`
      )
      .join("\n");

    const habitsContext = habits
      .map(
        (h) =>
          `- Habit: "${h.name}" | Streak: ${h.streak} days | Completed Today: ${
            h.completedToday ? "Yes" : "No"
          }`
      )
      .join("\n");

    const notesContext = notes
      .map((n) => `--- Note Title: "${n.title}" ---\n${n.content}`)
      .join("\n\n");

    const systemPrompt = `You are the Life OS AI Personal Productivity Assistant. You help users organize their life, stay on track with their goals, maintain positive habits, and synthesise notes.

Here is the current state of the user's Life OS:

=== USER GOALS ===
${goalsContext || "No goals defined yet."}

=== USER HABITS ===
${habitsContext || "No habits configured yet."}

=== USER NOTES & WIKIPEDIA ===
${notesContext || "No notes saved yet."}

==================

Your instructions:
- Provide helpful, friendly, actionable, and personalized advice based on their actual goals, habits, and notes.
- Suggest ways they can improve their habits or make progress on their goals.
- If asked about their notes, reference specific content from the notes list above.
- Be encouraging and concise. Keep responses well-structured (use bullet points or bold text where helpful).`;

    // 3. Initialize OpenAI client
    const openai = new OpenAI({ apiKey });

    // 4. Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
    });

    const reply = response.choices[0]?.message;

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("Assistant API Error:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
