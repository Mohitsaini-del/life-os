"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiTarget,
  FiCheckSquare,
  FiFileText,
  FiAward,
  FiZap,
  FiCalendar,
  FiArrowRight,
  FiTrendingUp,
} from "react-icons/fi";

interface Goal {
  id: string;
  title: string;
  progress: number;
  completed: boolean;
}

interface Habit {
  id: string;
  name: string;
  streak: number;
  completedToday: boolean;
}

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface DashboardData {
  productivityScore: number;
  goals: {
    total: number;
    completed: number;
    pending: number;
    list: Goal[];
  };
  habits: {
    total: number;
    completedToday: number;
    pendingToday: number;
    averageStreak: number;
    list: Habit[];
  };
  notes: {
    total: number;
    list: Note[];
  };
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        return res.json();
      })
      .then((dashboardData) => {
        setData(dashboardData);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getMotivationalMessage = (score: number) => {
    if (score === 100) return "Outstanding! You've completed all your habits and goals today! 🎉";
    if (score >= 80) return "Amazing job! You're operating at peak efficiency today. 🚀";
    if (score >= 50) return "Great progress! Keep checking off items to raise your score. 👍";
    if (score > 0) return "You've taken the first steps. Keep going, consistency is key! 🌱";
    return "A fresh page awaits. Complete a habit or update a goal to start your progress! ✍️";
  };

  const formatDate = () => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-zinc-900 dark:border-zinc-100 border-t-transparent dark:border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Assembling your workspace...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
        <div className="text-center p-8 max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-250 dark:border-zinc-800 shadow-sm">
          <h3 className="font-bold text-lg text-red-650 dark:text-red-400 mb-2">Error Loading Dashboard</h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">
            We encountered a problem loading your workspace analytics. Make sure you are signed in and database connection is active.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Header Greeting */}
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            {getGreeting()}, Mohit
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1.5 text-sm">
            <FiCalendar className="w-4 h-4 text-zinc-400" />
            {formatDate()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 flex items-center gap-2">
            <FiZap className="w-4.5 h-4.5 text-amber-500 fill-amber-500/20" />
            <span className="text-xs font-bold text-zinc-850 dark:text-zinc-100">
              Avg Streak: {data.habits.averageStreak} days
            </span>
          </div>
        </div>
      </header>

      {/* Main Score & STATS grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productivity Score card */}
        <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-850 to-zinc-950 dark:from-zinc-950 dark:via-zinc-900 dark:to-black text-white rounded-3xl p-8 border border-zinc-850 dark:border-zinc-850 shadow-xl flex flex-col justify-between min-h-[240px]">
          {/* Background overlay design details */}
          <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial from-zinc-800/10 to-transparent pointer-events-none rounded-r-3xl"></div>
          
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-zinc-800 text-zinc-300 border border-zinc-700">
                <FiTrendingUp className="w-3 h-3 text-emerald-400" />
                Productivity Analysis
              </span>
              <h2 className="text-xl font-bold tracking-tight text-zinc-100">Daily Success Metric</h2>
              <p className="text-zinc-400 text-xs max-w-md leading-relaxed">
                {getMotivationalMessage(data.productivityScore)}
              </p>
            </div>
            
            {/* Visual Circular/Compact Score */}
            <div className="relative flex-shrink-0 flex items-center justify-center w-24 h-24 rounded-2xl bg-zinc-850 border border-zinc-800">
              <div className="text-center">
                <span className="block text-3xl font-extrabold tracking-tight text-white">{data.productivityScore}%</span>
                <span className="text-[9px] uppercase tracking-wider font-semibold text-zinc-500">Score</span>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-2">
            <div className="flex justify-between items-end text-xs text-zinc-400 font-semibold">
              <span>Goal & Habit Completion</span>
              <span>{data.productivityScore} / 100</span>
            </div>
            {/* Custom styled double progress bar */}
            <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-850">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 shadow-[0_0_12px_rgba(139,92,246,0.3)] transition-all duration-700 ease-out"
                style={{ width: `${data.productivityScore}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Overview Stats column */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm mb-4">Quick Breakdown</h3>
          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {/* Goals KPI */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <FiTarget className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="block text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Goals</span>
                <span className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200">
                  {data.goals.completed} / {data.goals.total} Completed
                </span>
              </div>
            </div>

            {/* Habits KPI */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <FiCheckSquare className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="block text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Habits</span>
                <span className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200">
                  {data.habits.completedToday} / {data.habits.total} Completed Today
                </span>
              </div>
            </div>

            {/* Notes KPI */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <FiFileText className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="block text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Notes Wikibase</span>
                <span className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200">
                  {data.notes.total} Saved Documents
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Columns: Goals, Habits, Notes details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Active Goals */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[360px]">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-zinc-900 dark:text-zinc-50 text-base flex items-center gap-2">
                <FiTarget className="text-indigo-500 w-5 h-5" />
                Active Goals
              </h3>
              <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold px-2 py-0.5 rounded-full">
                {data.goals.pending} Left
              </span>
            </div>

            <div className="space-y-4 mt-6">
              {data.goals.list.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-zinc-400 italic">No goals defined yet.</p>
                </div>
              ) : (
                data.goals.list.map((goal) => (
                  <div key={goal.id} className="space-y-1.5 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-xs font-bold truncate text-zinc-800 dark:text-zinc-200">
                        {goal.title}
                      </span>
                      <span className="text-[10px] font-semibold text-zinc-400">
                        {goal.progress}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          goal.completed ? "bg-emerald-505 bg-emerald-500" : "bg-indigo-550 bg-indigo-500"
                        }`}
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            href="/goals"
            className="mt-6 flex items-center justify-between text-xs font-bold text-indigo-650 dark:text-indigo-400 hover:opacity-80 transition-opacity pt-4 border-t border-zinc-100 dark:border-zinc-800"
          >
            Manage Goals
            <FiArrowRight />
          </Link>
        </div>

        {/* Column 2: Daily Habits */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[360px]">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-zinc-900 dark:text-zinc-50 text-base flex items-center gap-2">
                <FiCheckSquare className="text-emerald-500 w-5 h-5" />
                Habits & Streaks
              </h3>
              <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-extrabold px-2 py-0.5 rounded-full">
                {data.habits.completedToday} Done
              </span>
            </div>

            <div className="space-y-3 mt-6">
              {data.habits.list.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-zinc-400 italic">No habits configured yet.</p>
                </div>
              ) : (
                data.habits.list.map((habit) => (
                  <div
                    key={habit.id}
                    className="flex justify-between items-center p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20"
                  >
                    <div className="truncate pr-2">
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block truncate">
                        {habit.name}
                      </span>
                      <span className="text-[9px] text-zinc-450 dark:text-zinc-500 font-semibold flex items-center gap-1 mt-0.5">
                        <FiAward className="text-amber-500 w-3 h-3" />
                        {habit.streak} day streak
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        habit.completedToday
                          ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900/30"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-550 border border-transparent"
                      }`}
                    >
                      {habit.completedToday ? "Done" : "Pending"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            href="/habits"
            className="mt-6 flex items-center justify-between text-xs font-bold text-emerald-650 dark:text-emerald-455 hover:opacity-80 transition-opacity pt-4 border-t border-zinc-100 dark:border-zinc-800"
          >
            Track Habits
            <FiArrowRight />
          </Link>
        </div>

        {/* Column 3: Recent Notes */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[360px]">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-zinc-900 dark:text-zinc-50 text-base flex items-center gap-2">
                <FiFileText className="text-amber-500 w-5 h-5" />
                Recent Notes
              </h3>
              <span className="text-[10px] bg-amber-55 dark:bg-amber-950/40 text-amber-600 dark:text-amber-450 font-extrabold px-2 py-0.5 rounded-full">
                {data.notes.total} Docs
              </span>
            </div>

            <div className="space-y-3 mt-6">
              {data.notes.list.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-zinc-400 italic">No notes created yet.</p>
                </div>
              ) : (
                data.notes.list.map((note) => (
                  <div key={note.id} className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 space-y-1">
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block truncate">
                      {note.title || "Untitled Note"}
                    </span>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 line-clamp-1">
                      {note.content || "Empty content"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            href="/notes"
            className="mt-6 flex items-center justify-between text-xs font-bold text-amber-650 dark:text-amber-450 hover:opacity-80 transition-opacity pt-4 border-t border-zinc-100 dark:border-zinc-800"
          >
            Open Notes
            <FiArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
}