"use client";

import { useEffect, useState } from "react";
import { FiPlus, FiTrash2, FiCheck, FiAward, FiCalendar } from "react-icons/fi";

interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
}

interface HabitItem {
  id: string;
  name: string;
  streak: number;
  completedToday: boolean;
  logs?: HabitLog[];
}

export default function Habits() {
  const [habits, setHabits] = useState<HabitItem[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadHabits() {
    try {
      const res = await fetch("/api/habits");
      const data = await res.json();
      if (Array.isArray(data)) {
        setHabits(data);
      }
    } catch (err) {
      console.error("Failed to load habits:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadHabits();
  }, []);

  async function addHabit() {
    if (!name) return;

    try {
      await fetch("/api/habits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name })
      });
      setName("");
      loadHabits();
    } catch (err) {
      console.error("Failed to add habit:", err);
    }
  }

  async function completeHabit(id: string) {
    try {
      await fetch("/api/habits", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id })
      });
      loadHabits();
    } catch (err) {
      console.error("Failed to complete habit:", err);
    }
  }

  async function deleteHabit(id: string) {
    if (!confirm("Are you sure you want to delete this habit? All log history will be permanently removed.")) {
      return;
    }

    try {
      await fetch(`/api/habits?id=${id}`, {
        method: "DELETE"
      });
      loadHabits();
    } catch (err) {
      console.error("Failed to delete habit:", err);
    }
  }

  // Calculate trailing 7 days
  const last7Days: Date[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    last7Days.push(d);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-zinc-900 dark:border-zinc-50"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">Habits 🔥</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium">
          Form long-term routines by tracking daily completions and building streaks.
        </p>
      </div>

      {/* Add Habit Widget Form */}
      <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex flex-col sm:flex-row gap-3">
        <input
          className="flex-1 border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-650 text-zinc-900 dark:text-zinc-50"
          placeholder="What routine do you want to build today?"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addHabit()}
        />
        <button
          onClick={addHabit}
          className="bg-zinc-900 hover:bg-zinc-850 dark:bg-zinc-50 dark:hover:bg-zinc-100 text-white dark:text-black font-semibold text-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <FiPlus className="w-4 h-4" />
          Add Habit
        </button>
      </div>

      {/* Habits Grid list */}
      {habits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {habits.map((habit) => (
            <div 
              key={habit.id}
              className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-sm flex flex-col justify-between hover:shadow-md transition duration-200"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-zinc-855 dark:text-zinc-100">{habit.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/10 shadow-sm">
                      🔥 Streak: {habit.streak} days
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer"
                  title="Delete habit"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>

              {/* 7-Day Consistency Tracker Dot Matrix */}
              <div className="mt-6 border-t border-b border-zinc-100 dark:border-zinc-900 py-4">
                <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <FiCalendar className="w-3.5 h-3.5" />
                  7-Day Consistency
                </p>
                <div className="flex justify-between items-center gap-2 px-1">
                  {last7Days.map((d, index) => {
                    const dateStr = d.toISOString().split("T")[0];
                    const wasCompleted = habit.logs?.some(
                      log => log.date.split("T")[0] === dateStr && log.completed
                    );
                    const dayLabel = d.toLocaleDateString("en-US", { weekday: "narrow" });
                    const isToday = index === 6;

                    return (
                      <div key={dateStr} className="flex flex-col items-center gap-1">
                        <span className={`text-[10px] font-bold ${isToday ? "text-blue-500 font-extrabold" : "text-zinc-400 dark:text-zinc-500"}`}>
                          {dayLabel}
                        </span>
                        <div 
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                            wasCompleted
                              ? "bg-emerald-500 text-white"
                              : "bg-zinc-100 dark:bg-zinc-900 text-zinc-350 dark:text-zinc-700"
                          }`}
                          title={`${d.toLocaleDateString()}: ${wasCompleted ? "Completed" : "Missed"}`}
                        >
                          {wasCompleted && <FiCheck className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Check-in Button */}
              <div className="mt-6">
                <button
                  disabled={habit.completedToday}
                  onClick={() => completeHabit(habit.id)}
                  className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    habit.completedToday
                      ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900/30"
                      : "bg-zinc-900 hover:bg-zinc-850 dark:bg-zinc-50 dark:hover:bg-zinc-100 text-white dark:text-black shadow-sm cursor-pointer"
                  }`}
                >
                  {habit.completedToday ? (
                    <>
                      <FiCheck className="w-4 h-4" />
                      Done for Today
                    </>
                  ) : (
                    <>
                      <FiAward className="w-4 h-4" />
                      Mark Completed Today
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-850 text-zinc-400 dark:text-zinc-500 font-medium">
          No habits configured. Enter a routine in the box above to get started!
        </div>
      )}
    </div>
  );
}