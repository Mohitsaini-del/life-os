import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  let clientMessages: ChatMessage[] = [];
  try {
    const body = await req.json();
    clientMessages = body.messages || [];
  } catch {
    // No request body passed
  }

  const goals = await prisma.goal.findMany({
    where: {
      userId: session.user.id
    }
  });

  const habits = await prisma.habit.findMany({
    where: {
      userId: session.user.id
    }
  });

  const pendingGoals = goals.filter(g => !g.completed);

  // Check if API key exists and is non-empty
  if (process.env.OPENAI_API_KEY) {
    try {
      const systemMessage = {
        role: "system" as const,
        content: `You are a premium AI life coach and productivity assistant inside the Life OS dashboard. Your job is to help the user achieve their goals and build consistency. Use Markdown layout, bold headers, list items, and emojis to make your responses visually appealing and easy to digest. Keep your advice actionable, supportive, and motivating.
        
Here is the user's current productivity context:
User Name: ${session.user.name || "Productivity User"}

Active Goals:
${pendingGoals.length > 0 
  ? pendingGoals.map(g => `- ${g.title} (Progress: ${g.progress}%)`).join('\n') 
  : "- No pending goals yet."
}

Active Habits:
${habits.length > 0 
  ? habits.map(h => `- ${h.name} (Streak: ${h.streak} days, Completed Today: ${h.completedToday ? "Yes" : "No"})`).join('\n') 
  : "- No habits set up yet."
}`
      };

      const messages: ChatMessage[] = [
        systemMessage,
        ...(clientMessages.length > 0
          ? clientMessages
          : [{ role: "user" as const, content: "Generate my daily action plan." }])
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
      });

      const plan = response.choices[0]?.message?.content;
      if (plan) {
        return NextResponse.json({ plan });
      }
    } catch (error) {
      console.error("OpenAI generation failed, falling back to template:", error);
    }
  }

  // Fallback plan if OpenAI fails or key is missing
  if (clientMessages.length > 0) {
    const lastUserMessage = clientMessages[clientMessages.length - 1]?.content || "";
    const fallbackChatReply = `👋 Hi ${session.user.name || "there"}! I received your message: "${lastUserMessage}".
    
Unfortunately, my OpenAI connection is currently offline because the configured API key has exceeded its quota (Error 429: Insufficient Quota). 

However, I can still scan your Life OS workspace to help you stay focused:
🔥 Active Habits: ${habits.length > 0 ? habits.map(h => `**${h.name}** (🔥 ${h.streak}d streak)`).join(", ") : "None configured yet"}
🎯 Pending Goals: ${pendingGoals.length > 0 ? pendingGoals.map(g => `**${g.title}** (${g.progress}% progress)`).join(", ") : "None configured yet"}

Please check your OpenAI billing details or update the \`OPENAI_API_KEY\` in your \`.env\` file to resume live conversation coaching! 💪`;

    return NextResponse.json({
      plan: fallbackChatReply
    });
  }

  const fallbackPlan = `
Good morning ${session.user.name} 👋

Today's Life OS Plan 🚀 (Fallback Mode)

🎯 Goals:
${pendingGoals.length > 0
  ? pendingGoals.map(g => "- " + g.title).join("\n")
  : "- No pending goals. Add new goals!"
}

🔥 Habits:
${habits.length > 0
  ? habits.map(h => "- " + h.name + " (🔥 " + h.streak + " days)").join("\n")
  : "- Create your first habit!"
}

Focus:
Complete one important task first.
Stay consistent 💪
`;

  return NextResponse.json({
    plan: fallbackPlan
  });
}