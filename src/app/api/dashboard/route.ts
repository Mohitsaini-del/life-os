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

  const goalsCount = await prisma.goal.count({
    where: { userId }
  });

  const completedGoalsCount = await prisma.goal.count({
    where: { userId, completed: true }
  });

  const notesCount = await prisma.note.count({
    where: { userId }
  });

  const habitsCount = await prisma.habit.count({
    where: { userId }
  });

  const completedHabitsCount = await prisma.habit.count({
    where: { userId, completedToday: true }
  });

  // Calculate productivity score
  let productivityScore = 0;
  if (goalsCount) {
    productivityScore += (completedGoalsCount / goalsCount) * 50;
  }
  if (habitsCount) {
    productivityScore += (completedHabitsCount / habitsCount) * 50;
  }
  productivityScore = Math.round(productivityScore);

  const recentGoals = await prisma.goal.findMany({
    where: { userId, completed: false },
    orderBy: { updatedAt: "desc" },
    take: 3
  });

  const recentHabits = await prisma.habit.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 3
  });

  return NextResponse.json({
    userName: session.user.name || "User",
    goalsCount,
    completedGoalsCount,
    notesCount,
    habitsCount,
    completedHabitsCount,
    productivityScore,
    recentGoals,
    recentHabits
  });
}