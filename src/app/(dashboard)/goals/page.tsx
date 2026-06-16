"use client";

import { useEffect, useState } from "react";
import { FiPlus, FiTrash2, FiClock, FiTarget, FiAlertCircle } from "react-icons/fi";

interface GoalItem {
  id: string;
  title: string;
  description: string | null;
  progress: number;
  completed: boolean;
  deadline: string | null;
}

export default function Goals() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadGoals() {
    try {
      const res = await fetch("/api/goals");
      const data = await res.json();
      if (Array.isArray(data)) {
        setGoals(data);
      }
    } catch (err) {
      console.error("Failed to load goals:", err);
    } finally {
      setLoading(false);
    }
  }

  async function addGoal() {
    if (!title) return;

    try {
      await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          description,
          deadline: deadline || null
        })
      });

      setTitle("");
      setDescription("");
      setDeadline("");
      loadGoals();
    } catch (err) {
      console.error("Failed to add goal:", err);
    }
  }

  async function updateGoal(id: string, progress: number, completed: boolean) {
    let finalProgress = progress;
    // Auto snap progress to 100 if completed is toggled on, or drop it back down if unchecked
    if (completed && progress < 100) {
      finalProgress = 100;
    } else if (!completed && progress === 100) {
      finalProgress = 90;
    }

    // Auto complete if progress reaches 100
    const finalCompleted = finalProgress === 100 ? true : completed;

    try {
      await fetch("/api/goals", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id,
          progress: finalProgress,
          completed: finalCompleted
        })
      });
      loadGoals();
    } catch (err) {
      console.error("Failed to update goal:", err);
    }
  }

  async function deleteGoal(id: string) {
    if (!confirm("Are you sure you want to delete this goal? This action cannot be undone.")) {
      return;
    }

    try {
      await fetch(`/api/goals?id=${id}`, {
        method: "DELETE"
      });
      loadGoals();
    } catch (err) {
      console.error("Failed to delete goal:", err);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadGoals();
  }, []);

  function getDeadlineStatus(deadlineStr: string | null) {
    if (!deadlineStr) return null;
    const deadlineDate = new Date(deadlineStr);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);

    const diffTime = deadlineDate.getTime() - todayDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `Overdue by ${Math.abs(diffDays)}d`, isOverdue: true, isToday: false };
    } else if (diffDays === 0) {
      return { text: "Due today!", isOverdue: false, isToday: true };
    } else {
      return { text: `Due in ${diffDays}d`, isOverdue: false, isToday: false };
    }
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
        <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">Goals 🎯</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium">
          Set targets, log progress, and track your accomplishments.
        </p>
      </div>

      {/* Creation Widget Card Form */}
      <div className="p-6 rounded-2xl border border-[#EADEDF] dark:border-zinc-850 bg-white dark:bg-zinc-950 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-zinc-850 dark:text-zinc-200 uppercase tracking-wider mb-2">Create New Goal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <input
              className="w-full border border-[#EADEDF] dark:border-zinc-800 bg-transparent px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4D1A1E] dark:focus:border-rose-450 text-zinc-900 dark:text-zinc-50 transition-all duration-200"
              placeholder="Goal Title (e.g. Run a Marathon)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="w-full border border-[#EADEDF] dark:border-zinc-800 bg-transparent px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4D1A1E] dark:focus:border-rose-450 text-zinc-900 dark:text-zinc-50 min-h-[90px] transition-all duration-200"
              placeholder="Description & details (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Target Deadline Date</label>
              <input
                type="date"
                className="w-full border border-[#EADEDF] dark:border-zinc-800 bg-transparent px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:border-[#4D1A1E] dark:focus:border-rose-450 text-zinc-900 dark:text-zinc-50 cursor-pointer transition-all duration-200"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
            <button
              onClick={addGoal}
              className="w-full bg-[#4D1A1E] hover:bg-[#5C2429] text-white font-extrabold text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-[#4D1A1E]/10 mt-4 sm:mt-0 active:scale-[0.98] transition-all duration-200"
            >
              <FiPlus className="w-4 h-4" />
              Add Goal Objective
            </button>
          </div>
        </div>
      </div>

      {/* Goals Display List */}
      {goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const deadlineInfo = getDeadlineStatus(goal.deadline);

            return (
              <div 
                key={goal.id}
                className="p-6 rounded-2xl border border-[#EADEDF] dark:border-zinc-850 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-sm flex flex-col justify-between hover:shadow-md transition duration-300"
              >
                <div>
                  {/* Title & Delete Action */}
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-base font-extrabold text-zinc-900 dark:text-white leading-tight">{goal.title}</h3>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="p-2 rounded-xl text-zinc-400 hover:text-[#4D1A1E] dark:hover:text-rose-450 hover:bg-[#FAF0F1] dark:hover:bg-zinc-900 transition cursor-pointer"
                      title="Delete Goal"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Badges Status */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {goal.completed ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#FAF0F1] dark:bg-[#4D1A1E]/10 text-[#4D1A1E] dark:text-rose-400 border border-[#EADEDF] dark:border-[#4D1A1E]/20 shadow-sm">
                        Completed ✅
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-zinc-50 dark:bg-zinc-900 text-zinc-550 dark:text-zinc-400 border border-[#EADEDF] dark:border-zinc-800 shadow-sm">
                        In Progress 🚀
                      </span>
                    )}

                    {/* Deadline visual tag */}
                    {deadlineInfo && (
                      <span 
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                          deadlineInfo.isOverdue
                            ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/10"
                            : deadlineInfo.isToday
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/10"
                            : "bg-[#FAF7F5] dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500 border-[#EADEDF] dark:border-zinc-800"
                        }`}
                      >
                        {deadlineInfo.isOverdue ? (
                          <FiAlertCircle className="w-3 h-3" />
                        ) : (
                          <FiClock className="w-3 h-3" />
                        )}
                        {deadlineInfo.text}
                      </span>
                    )}
                  </div>

                  {/* Description details */}
                  {goal.description && (
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-3.5 leading-relaxed font-bold">
                      {goal.description}
                    </p>
                  )}
                </div>

                {/* Progress Indicators & Snap Controls */}
                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <FiTarget className="w-3.5 h-3.5" />
                        Progress
                      </span>
                      <span>{goal.progress}%</span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={goal.progress}
                      onChange={(e) => updateGoal(
                        goal.id,
                        Number(e.target.value),
                        goal.completed
                      )}
                      className="w-full accent-[#4D1A1E] dark:accent-rose-400 h-1.5 bg-[#F3ECE8] dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Mark Completed Toggle */}
                  <label className="flex items-center gap-2 text-xs font-bold cursor-pointer select-none text-zinc-500 hover:text-[#4D1A1E] dark:text-zinc-400 dark:hover:text-rose-400 transition">
                    <input
                      type="checkbox"
                      checked={goal.completed}
                      onChange={(e) => updateGoal(
                        goal.id,
                        goal.progress,
                        e.target.checked
                      )}
                      className="rounded border-[#D8C6C7] dark:border-zinc-700 text-[#4D1A1E] dark:text-[#4D1A1E] focus:ring-[#4D1A1E] h-4 w-4 cursor-pointer"
                    />
                    Mark Completed Goal
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 rounded-2xl border border-dashed border-[#EADEDF] dark:border-zinc-800 text-zinc-450 dark:text-zinc-550 font-bold text-xs uppercase tracking-wider">
          No objectives configured. Set your first goal in the creation widget above!
        </div>
      )}
    </div>
  );
}