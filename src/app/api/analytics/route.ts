import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Generate date ranges for the last 7 days
  const last7Days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    last7Days.push(d);
  }

  const dailyData = await Promise.all(
    last7Days.map(async (dayDate) => {
      const nextDay = new Date(dayDate);
      nextDay.setDate(dayDate.getDate() + 1);

      // Habits completed on this specific day (HabitLog)
      const habitsCompleted = await prisma.habitLog.count({
        where: {
          habit: { userId },
          completed: true,
          date: {
            gte: dayDate,
            lt: nextDay,
          },
        },
      });

      // Goals completed on this specific day
      const goalsCompleted = await prisma.goal.count({
        where: {
          userId,
          completed: true,
          updatedAt: {
            gte: dayDate,
            lt: nextDay,
          },
        },
      });

      const dayLabel = dayDate.toLocaleDateString("en-US", { weekday: "short" });
      const dateString = dayDate.toISOString().split("T")[0]; // YYYY-MM-DD

      // Weigh score: Habits checked count as 10 points each, completed goals count as 30 points each
      const score = habitsCompleted * 10 + goalsCompleted * 30;

      return {
        date: dateString,
        label: dayLabel,
        habits: habitsCompleted,
        goals: goalsCompleted,
        productivity: score,
      };
    })
  );

  // Calendar dates consistency for the current month
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

  const monthLogs = await prisma.habitLog.findMany({
    where: {
      habit: { userId },
      completed: true,
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  });

  const monthGoals = await prisma.goal.findMany({
    where: {
      userId,
      completed: true,
      updatedAt: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  });

  // Aggregate completion weight metrics by YYYY-MM-DD
  const calendarData: Record<string, { habits: number; goals: number; score: number }> = {};

  monthLogs.forEach((log) => {
    const key = log.date.toISOString().split("T")[0];
    if (!calendarData[key]) {
      calendarData[key] = { habits: 0, goals: 0, score: 0 };
    }
    calendarData[key].habits += 1;
    calendarData[key].score += 1;
  });

  monthGoals.forEach((goal) => {
    const key = goal.updatedAt.toISOString().split("T")[0];
    if (!calendarData[key]) {
      calendarData[key] = { habits: 0, goals: 0, score: 0 };
    }
    calendarData[key].goals += 1;
    calendarData[key].score += 3; // goals carry slightly more weight
  });

  return NextResponse.json({
    dailyData,
    calendarData,
  });
}
