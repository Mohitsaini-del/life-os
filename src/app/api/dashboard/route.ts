import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const userId = session.user.id;

  try {
    // 1. Fetch Goals
    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // 2. Fetch Habits
    const habits = await prisma.habit.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // 3. Fetch Recent Notes (top 3)
    const recentNotes = await prisma.note.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    const totalNotes = await prisma.note.count({
      where: { userId },
    });

    // Calculate Productivity Score (0 - 100)
    const completedGoals = goals.filter((g) => g.completed).length;
    const completedHabits = habits.filter((h) => h.completedToday).length;

    let score = 0;
    if (goals.length) {
      score += (completedGoals / goals.length) * 50;
    }
    if (habits.length) {
      score += (completedHabits / habits.length) * 50;
    }

    const productivityScore = Math.round(score);

    return NextResponse.json({
      productivityScore,
      goals: {
        total: goals.length,
        completed: completedGoals,
        pending: goals.length - completedGoals,
        list: goals.slice(0, 3), // return top 3 goals
      },
      habits: {
        total: habits.length,
        completedToday: completedHabits,
        pendingToday: habits.length - completedHabits,
        averageStreak: habits.length
          ? Math.round(habits.reduce((acc, h) => acc + h.streak, 0) / habits.length)
          : 0,
        list: habits.slice(0, 3), // return top 3 habits
      },
      notes: {
        total: totalNotes,
        list: recentNotes,
      },
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
