"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  FiPlus, 
  FiArrowRight, 
  FiCalendar, 
  FiPlay, 
  FiPause, 
  FiRotateCcw, 
  FiBell, 
  FiZap, 
  FiAward, 
  FiCompass 
} from "react-icons/fi";
import { 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell
} from "recharts";

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

interface DashboardData {
  userName?: string;
  goalsCount?: number;
  completedGoalsCount?: number;
  notesCount?: number;
  habitsCount?: number;
  completedHabitsCount?: number;
  productivityScore?: number;
  recentGoals?: Goal[];
  recentHabits?: Habit[];
}

interface DailyMetric {
  date: string;
  label: string;
  habits: number;
  goals: number;
  productivity: number;
}

interface AnalyticsData {
  dailyData: DailyMetric[];
  calendarData: Record<string, { habits: number; goals: number; score: number }>;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Time Tracker state variables
  const [sessionLength, setSessionLength] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const toggleTimer = () => setTimerRunning(!timerRunning);
  const resetTimer = () => {
    setTimerRunning(false);
    setTimeLeft(sessionLength * 60);
  };
  
  const handleSessionSelect = (mins: number) => {
    setTimerRunning(false);
    setSessionLength(mins);
    setTimeLeft(mins * 60);
  };

  async function loadData() {
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      setData(json);

      const analyticsRes = await fetch("/api/analytics");
      const analyticsJson = await analyticsRes.json();
      setAnalytics(analyticsJson);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
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
      // Instantly reload dashboard and analytics data
      loadData();
    } catch (err) {
      console.error("Failed to update habit:", err);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-zinc-900 dark:border-zinc-50"></div>
      </div>
    );
  }

  if (!data) return null;

  // Custom Sparkline Path Generator
  const generateSparkline = (points: number[]) => {
    if (!points || points.length === 0) return "";
    const max = Math.max(...points, 10);
    const width = 120;
    const height = 24;
    const coords = points.map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - (p / max) * height * 0.8 - height * 0.1;
      return `${x},${y}`;
    });
    return `M ${coords.join(" L ")}`;
  };

  const dailyScores = analytics?.dailyData?.map(d => d.productivity) || [20, 40, 30, 70, 50, 80, 87];
  const scoreSparkline = generateSparkline(dailyScores);

  const focusHoursData = [1.5, 2.0, 1.2, 3.0, 2.5, 2.8, 2.6];
  const focusSparkline = generateSparkline(focusHoursData);

  const currentStreak = data.recentHabits?.reduce((max, h) => Math.max(max, h.streak), 0) || 0;

  const scrollToFocusTimer = () => {
    const el = document.getElementById("focus-timer-card");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Calendar dates variables
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  const emptyDays = Array(startDay).fill(null);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const monthName = today.toLocaleDateString("en-US", { month: "long" });

  const progressFraction = timeLeft / (sessionLength * 60);
  const strokeDashoffset = 2 * Math.PI * 54 * (1 - progressFraction);
  const sessionPills = [25, 50, 90];

  const xpData = [
    { name: "Habits", value: (data.completedHabitsCount || 0) * 50 || 50, color: "#4D1A1E" },
    { name: "Goals", value: (data.completedGoalsCount || 0) * 150 || 150, color: "#5C2429" },
    { name: "Focus Hours", value: 120, color: "#8C7A7C" }
  ];

  const habitsRemaining = (data.habitsCount || 0) - (data.completedHabitsCount || 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 text-zinc-900 dark:text-zinc-50">
      {/* Header section (Donezo style) */}
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#EADEDF] dark:border-zinc-850 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            Good morning, Aditya! 🍂
          </h1>
          <p className="text-zinc-400 dark:text-zinc-500 mt-1 text-xs font-bold uppercase tracking-wider">
            Build discipline. Design freedom. {habitsRemaining > 0 ? `You have ${habitsRemaining} habit${habitsRemaining > 1 ? 's' : ''} remaining today.` : "All habits completed today!"}
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button 
            onClick={scrollToFocusTimer}
            className="px-4 py-2 bg-[#4D1A1E] hover:bg-[#5C2429] text-white rounded-xl text-xs font-extrabold active:scale-[0.98] transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <FiPlus className="w-3.5 h-3.5" />
            Focus Mode
          </button>
          <button 
            className="p-2 bg-white dark:bg-zinc-900 border border-[#EADEDF] dark:border-zinc-800 text-zinc-400 hover:text-zinc-600 rounded-xl transition cursor-pointer"
            title="Notifications"
          >
            <FiBell className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Metrics Row (4 Cards) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Daily Score Card */}
        <div className="p-4 rounded-2xl border border-[#EADEDF] dark:border-zinc-850 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between min-h-[125px]">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Daily Score</span>
              <span className="text-2.5xl font-extrabold text-zinc-900 dark:text-white mt-1">{data.productivityScore || 0}%</span>
            </div>
            {/* SVG Circular Progress Ring */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="24" cy="24" r="18" stroke="#F3ECE8" strokeWidth="3.5" fill="transparent" />
                <circle cx="24" cy="24" r="18" stroke="#4D1A1E" strokeWidth="3.5" fill="transparent"
                  strokeDasharray={2 * Math.PI * 18}
                  strokeDashoffset={2 * Math.PI * 18 * (1 - (data.productivityScore || 0) / 100)}
                  strokeLinecap="round" />
              </svg>
              <span className="absolute text-[9px] font-extrabold text-[#4D1A1E] dark:text-rose-450">{data.productivityScore || 0}</span>
            </div>
          </div>
          <div className="flex items-end justify-between mt-3 pt-2 border-t border-[#FAF7F5] dark:border-zinc-900">
            <span className="text-[9px] font-bold text-zinc-400 uppercase">Weekly Trend</span>
            <svg viewBox="0 0 120 24" className="w-24 h-5">
              <path d={scoreSparkline} fill="none" stroke="#4D1A1E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Current Streak Card */}
        <div className="p-4 rounded-2xl border border-[#EADEDF] dark:border-zinc-850 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between min-h-[125px]">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Current Streak</span>
              <span className="text-2.5xl font-extrabold text-[#4D1A1E] dark:text-rose-450 mt-1 flex items-center gap-1.5">
                <FiZap className="w-6 h-6 text-[#4D1A1E] fill-[#4D1A1E]" />
                {currentStreak || 3} Days
              </span>
            </div>
            <div className="p-2 bg-[#FAF0F1] dark:bg-zinc-900 border border-[#EADEDF] dark:border-zinc-800 rounded-xl text-[#4D1A1E] dark:text-rose-400">
              <FiAward className="w-5 h-5" />
            </div>
          </div>
          {/* Last 5 days activity check dots */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#FAF7F5] dark:border-zinc-900">
            <span className="text-[9px] font-bold text-zinc-400 uppercase">Recent consistency</span>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((dayIndex) => (
                <span 
                  key={dayIndex} 
                  className={`w-2.5 h-2.5 rounded-full ${
                    dayIndex <= (currentStreak || 3) 
                      ? "bg-[#4D1A1E] dark:bg-rose-400" 
                      : "bg-[#F3ECE8] dark:bg-zinc-800 border border-[#EADEDF] dark:border-zinc-700"
                  }`} 
                />
              ))}
            </div>
          </div>
        </div>

        {/* Level & XP Card */}
        <div className="p-4 rounded-2xl border border-[#EADEDF] dark:border-zinc-850 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between min-h-[125px]">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Character Level</span>
              <span className="text-2.5xl font-extrabold text-zinc-900 dark:text-white mt-1">Level 23</span>
            </div>
            {/* Hexagon Badge */}
            <div className="relative w-11 h-11 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full fill-[#FAF0F1] dark:fill-zinc-900 stroke-[#4D1A1E] dark:stroke-rose-400 stroke-[7]">
                <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" />
              </svg>
              <span className="relative font-extrabold text-xs text-[#4D1A1E] dark:text-rose-400">23</span>
            </div>
          </div>
          <div className="flex flex-col mt-3 pt-2 border-t border-[#FAF7F5] dark:border-zinc-900">
            <div className="flex items-center justify-between text-[9px] font-bold text-zinc-400">
              <span>PROGRESS</span>
              <span>1,450 / 2,000 XP</span>
            </div>
            <div className="w-full bg-[#F3ECE8] dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1">
              <div className="bg-[#4D1A1E] dark:bg-rose-400 h-full rounded-full" style={{ width: "72.5%" }} />
            </div>
          </div>
        </div>

        {/* Focus Hours Card */}
        <div className="p-4 rounded-2xl border border-[#EADEDF] dark:border-zinc-850 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between min-h-[125px]">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Focus Hours</span>
              <span className="text-2.5xl font-extrabold text-zinc-900 dark:text-white mt-1">2h 40m</span>
            </div>
            <div className="p-2 bg-[#FAF0F1] dark:bg-zinc-900 border border-[#EADEDF] dark:border-zinc-800 rounded-xl text-[#4D1A1E] dark:text-rose-400">
              <FiCompass className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-end justify-between mt-3 pt-2 border-t border-[#FAF7F5] dark:border-zinc-900">
            <span className="text-[9px] font-bold text-zinc-400 uppercase">Focus sessions</span>
            <svg viewBox="0 0 120 24" className="w-24 h-5">
              <path d={focusSparkline} fill="none" stroke="#5C2429" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </section>

      {/* Main Grid: Habits Checklist & Sidebar widgets */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column (2/3 width): Habits Checklist & Focus Goals */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Today's Habits Checklist */}
          <div className="p-5 rounded-2xl border border-[#EADEDF] dark:border-zinc-850 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">Today&apos;s Habits Check-In</h3>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">Click circle to log completions</p>
              </div>
              <Link href="/habits" className="text-[10px] text-[#4D1A1E] dark:text-rose-400 font-extrabold hover:underline flex items-center gap-1">
                Manage Habits <FiArrowRight />
              </Link>
            </div>

            {data.recentHabits && data.recentHabits.length > 0 ? (
              <div className="space-y-2.5">
                {data.recentHabits.map((habit) => (
                  <div key={habit.id} className="flex items-center justify-between p-3 rounded-xl border border-[#EADEDF] dark:border-zinc-850 bg-[#FAF7F5]/30 dark:bg-zinc-900/10 hover:bg-[#FAF7F5]/85 dark:hover:bg-zinc-900/45 transition duration-200">
                    <div className="flex items-center gap-3">
                      <button
                        disabled={habit.completedToday}
                        onClick={() => completeHabit(habit.id)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer ${
                          habit.completedToday
                            ? "bg-[#4D1A1E] border-[#4D1A1E] text-white"
                            : "border-[#D8C6C7] dark:border-zinc-700 hover:border-[#4D1A1E] text-transparent hover:text-[#4D1A1E]"
                        }`}
                      >
                        <span className="text-[10px] font-extrabold">✓</span>
                      </button>
                      <div className="flex flex-col">
                        <span className={`text-xs font-bold ${habit.completedToday ? "line-through text-zinc-400" : "text-zinc-900 dark:text-zinc-50"}`}>
                          {habit.name}
                        </span>
                        <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold mt-0.5 flex items-center gap-1.5">
                          <span>🔥 {habit.streak} day streak</span>
                          <span>•</span>
                          <span>{habit.name.toLowerCase().includes("read") || habit.name.toLowerCase().includes("book") ? "15 mins" : "Daily routine"}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-extrabold text-[#4D1A1E] dark:text-rose-400 bg-[#FAF0F1] dark:bg-[#4D1A1E]/10 px-2.5 py-0.5 rounded-md border border-[#EADEDF] dark:border-[#4D1A1E]/20">
                        +50 XP
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-400 dark:text-zinc-500 font-medium text-xs">
                No active habits set up. Build a daily habit routine to track stats!
              </div>
            )}
          </div>

          {/* Focus Goals List */}
          <div className="p-5 rounded-2xl border border-[#EADEDF] dark:border-zinc-850 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">Focus Objectives</h3>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">Active goals and tracking metrics</p>
              </div>
              <Link href="/goals" className="text-[10px] text-[#4D1A1E] dark:text-rose-400 font-extrabold hover:underline flex items-center gap-1">
                View All Goals <FiArrowRight />
              </Link>
            </div>

            {data.recentGoals && data.recentGoals.length > 0 ? (
              <div className="space-y-3">
                {data.recentGoals.map((goal) => (
                  <div key={goal.id} className="p-3.5 rounded-xl border border-[#EADEDF] dark:border-zinc-850 bg-[#FAF7F5]/30 dark:bg-zinc-900/10 hover:bg-[#FAF7F5]/85 dark:hover:bg-zinc-900/45 transition duration-200">
                    <div className="flex justify-between items-center">
                      <h5 className="font-bold text-xs text-zinc-800 dark:text-zinc-100">{goal.title}</h5>
                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-[#FAF0F1] dark:bg-zinc-900 border border-[#EADEDF] dark:border-zinc-800 text-[#4D1A1E] dark:text-rose-400">
                        {goal.progress}% progress
                      </span>
                    </div>
                    <div className="mt-2.5">
                      <div className="w-full bg-[#F3ECE8] dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#4D1A1E] dark:bg-rose-450 h-full rounded-full transition-all duration-300"
                          style={{ width: `${goal.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-400 dark:text-zinc-500 font-medium text-xs">
                No active focus goals. Add objectives to drive character growth!
              </div>
            )}
          </div>

        </div>

        {/* Right column (1/3 width): Streak dots grid & Pomodoro widget */}
        <div className="space-y-6">
          
          {/* Consistency dots calendar (Github contribution graph mockup) */}
          <div className="p-5 rounded-2xl border border-[#EADEDF] dark:border-zinc-850 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-1.5">
                <FiCalendar className="w-4 h-4 text-[#4D1A1E] dark:text-rose-400" />
                <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-100">{monthName} Streaks</h4>
              </div>
              <div className="flex items-center gap-1 text-[8px] font-bold text-zinc-400">
                <span>Less</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#F3ECE8]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#FAF0F1] border border-[#EADEDF]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#EADEDF]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#4D1A1E]" />
                <span>More</span>
              </div>
            </div>

            <div className="max-w-[240px] mx-auto w-full mt-2">
              {/* Week labels */}
              <div className="grid grid-cols-7 gap-1 text-center text-[8px] font-extrabold text-zinc-400 uppercase tracking-widest mb-1.5">
                <div>Su</div>
                <div>Mo</div>
                <div>Tu</div>
                <div>We</div>
                <div>Th</div>
                <div>Fr</div>
                <div>Sa</div>
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {emptyDays.map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square bg-transparent"></div>
                ))}
                {daysArray.map((day) => {
                  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const dayData = analytics?.calendarData?.[dateStr];
                  const score = dayData?.score || 0;

                  let bgDot = "bg-[#F3ECE8] dark:bg-zinc-900 border border-[#FAF7F5] dark:border-zinc-850 text-zinc-400 hover:border-zinc-300";
                  if (score >= 1 && score < 3) {
                    bgDot = "bg-[#FAF0F1] border border-[#EADEDF] text-[#4D1A1E]/70";
                  } else if (score >= 3 && score < 6) {
                    bgDot = "bg-[#EADEDF] text-[#4D1A1E] font-bold";
                  } else if (score >= 6) {
                    bgDot = "bg-[#4D1A1E] text-white font-bold";
                  }

                  return (
                    <div 
                      key={`day-${day}`} 
                      className={`aspect-square flex items-center justify-center rounded-full text-[8px] transition-all duration-200 cursor-pointer ${bgDot}`}
                      title={`Date: ${dateStr}\nHabits: ${dayData?.habits || 0}\nGoals: ${dayData?.goals || 0}\nScore: ${score}`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Pomodoro Timer widget */}
          <div 
            id="focus-timer-card"
            className="p-5 rounded-2xl border border-[#EADEDF] dark:border-zinc-850 bg-[#FAF7F5] dark:bg-zinc-900/40 text-zinc-900 dark:text-zinc-50 shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2 pl-0.5">
              <div>
                <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-100">Focus Timer</h4>
                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">Conquer distractions</p>
              </div>
              <span className="text-[8px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#FAF0F1] dark:bg-[#4D1A1E]/10 text-[#4D1A1E] dark:text-rose-400 border border-[#EADEDF] dark:border-zinc-800">
                {timerRunning ? "Ticking" : "Ready"}
              </span>
            </div>

            {/* Circular Timer Ring */}
            <div className="flex justify-center items-center py-2 relative">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="72" cy="72" r="54" stroke="#EADEDF" strokeWidth="4.5" fill="transparent" />
                  <circle cx="72" cy="72" r="54" stroke="#4D1A1E" strokeWidth="4.5" fill="transparent"
                    strokeDasharray={2 * Math.PI * 54}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2.5xl font-extrabold tracking-widest font-mono text-zinc-900 dark:text-zinc-50 select-none">
                    {formatTime(timeLeft)}
                  </span>
                  <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                    {timerRunning ? "Focus Session" : "Paused"}
                  </span>
                </div>
              </div>
            </div>

            {/* Session select pills */}
            <div className="flex gap-2 justify-center mt-2">
              {sessionPills.map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleSessionSelect(mins)}
                  className={`px-3 py-1 rounded-full text-[9px] font-extrabold transition-all cursor-pointer ${
                    sessionLength === mins
                      ? "bg-[#4D1A1E] text-white shadow-sm"
                      : "bg-[#F3ECE8] dark:bg-zinc-800 text-[#4D1A1E] dark:text-zinc-300 hover:bg-[#EADEDF]"
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>

            {/* Control buttons */}
            <div className="flex items-center gap-2 w-full mt-4">
              <button
                onClick={toggleTimer}
                className="flex-1 py-2 rounded-xl bg-[#4D1A1E] hover:bg-[#5C2429] text-white text-xs font-bold transition-all active:scale-[0.98] cursor-pointer shadow-sm shadow-[#4D1A1E]/15 flex items-center justify-center gap-1.5"
              >
                {timerRunning ? (
                  <>
                    <FiPause className="w-3.5 h-3.5" /> Pause
                  </>
                ) : (
                  <>
                    <FiPlay className="w-3.5 h-3.5" /> Start Focus
                  </>
                )}
              </button>
              <button
                onClick={resetTimer}
                className="p-2.5 rounded-xl bg-[#F3ECE8] hover:bg-[#EADEDF] dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[#4D1A1E] dark:text-zinc-300 transition-all cursor-pointer"
                title="Reset Timer"
              >
                <FiRotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Row 3: Analytics Graphs & Quote Block */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Weekly Productivity Area Chart */}
        <div className="bg-white dark:bg-zinc-950 border border-[#EADEDF] dark:border-zinc-850 rounded-2xl p-5 shadow-sm flex flex-col justify-between md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Weekly Productivity Activity</h4>
              <p className="text-[10px] text-zinc-450 dark:text-zinc-550 font-medium">Daily weighted completions score</p>
            </div>
            <div className="text-[9px] font-extrabold text-[#4D1A1E] dark:text-rose-450 bg-[#FAF0F1] dark:bg-[#4D1A1E]/10 px-2 py-0.5 rounded-md border border-[#EADEDF] dark:border-[#4D1A1E]/20">
              Last 7 Days
            </div>
          </div>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.dailyData || []} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaBurgundy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4D1A1E" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#4D1A1E" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="label" 
                  stroke="#8C7A7C" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  className="font-bold"
                />
                <YAxis 
                  stroke="#8C7A7C" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  className="font-bold"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "rgba(10, 10, 10, 0.95)", 
                    borderColor: "rgba(100, 100, 110, 0.2)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "11px",
                    fontWeight: "bold"
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="productivity" 
                  name="Daily score" 
                  stroke="#4D1A1E" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#areaBurgundy)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* XP Breakdown Donut Chart */}
        <div className="bg-white dark:bg-zinc-950 border border-[#EADEDF] dark:border-zinc-850 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2.5">XP Breakdown</h4>
            <div className="flex items-center gap-2">
              <div className="w-1/2 h-36 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={xpData}
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={52}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {xpData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(10, 10, 10, 0.95)",
                        borderColor: "rgba(100, 100, 110, 0.2)",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: "10px",
                        fontWeight: "bold"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2 min-w-[120px]">
                {xpData.map((item) => (
                  <div key={item.name} className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200">{item.name}</span>
                    </div>
                    <span className="text-[9px] font-extrabold text-zinc-400 pl-3">{item.value} XP</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Beautiful Quote Block */}
        <div className="bg-[#FAF0F1] dark:bg-[#4D1A1E]/10 border border-[#EADEDF] dark:border-[#4D1A1E]/20 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[160px] md:col-span-3">
          {/* Elegant Leaf SVG Watermark */}
          <svg className="absolute right-4 bottom-2 w-32 h-32 text-[#EADEDF] dark:text-[#4D1A1E]/15 pointer-events-none transform rotate-12" viewBox="0 0 100 100" fill="currentColor">
            <path d="M10,80 Q50,70 60,30 Q63,20 75,10 Q60,30 45,45 Q35,55 10,80" />
            <path d="M40,55 Q50,45 65,42 Q50,52 40,55" />
            <path d="M25,66 Q35,58 50,56 Q35,64 25,66" />
            <path d="M52,43 Q65,30 78,25 Q65,36 52,43" />
          </svg>
          
          <div className="relative z-10 flex-1 flex flex-col justify-center max-w-[80%]">
            <p className="text-sm font-extrabold text-[#4D1A1E] dark:text-rose-350 italic leading-relaxed">
              &ldquo;Design freedom through discipline. Every single daily habit you check off is an active vote for the version of yourself you are building.&rdquo;
            </p>
            <p className="text-[9px] font-extrabold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mt-3.5 pl-0.5">
              — LIFE OS PRINCIPLE
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}