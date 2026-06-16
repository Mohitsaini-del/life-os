export default function Home() {
  return (
    <div className="min-h-screen bg-[#FBF9F6] text-zinc-900 flex flex-col justify-between">
      <div className="max-w-5xl mx-auto px-6 py-20 flex-1 flex flex-col justify-center">
        {/* Navigation logo */}
        <div className="flex items-center gap-1.5 mb-10 pl-1 select-none">
          <span className="text-xl font-extrabold tracking-wide text-zinc-900 leading-none">
            LIFE <span className="text-[#4D1A1E]">OS</span>
          </span>
          <span className="text-[9px] text-[#4D1A1E] font-extrabold tracking-widest uppercase bg-[#FAF0F1] border border-[#EADEDF] px-2 py-0.5 rounded">
            v1.0
          </span>
        </div>

        {/* Hero Content */}
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-6.5xl font-extrabold tracking-tight text-zinc-900 leading-[1.1]">
            Build discipline.<br />
            <span className="text-[#4D1A1E]">Design freedom.</span> 🍂
          </h1>
          <p className="mt-6 text-base md:text-lg text-zinc-500 font-bold max-w-xl leading-relaxed">
            A minimalist personal productivity dashboard to manage goals, habits, second-brain notes, and experience AI-guided daily alignment.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="/login"
            className="bg-[#4D1A1E] hover:bg-[#5C2429] text-white px-8 py-3.5 rounded-xl font-extrabold text-sm transition shadow-sm shadow-[#4D1A1E]/15 active:scale-[0.98] use-pointer"
          >
            Get Started
          </a>
          <a
            href="/dashboard"
            className="border border-[#EADEDF] bg-white hover:bg-[#FAF0F1] text-[#4D1A1E] px-8 py-3.5 rounded-xl font-extrabold text-sm transition active:scale-[0.98] use-pointer"
          >
            Dashboard Login
          </a>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-20">
          <div className="border border-[#EADEDF] bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between min-h-[150px]">
            <div>
              <span className="text-2xl">🎯</span>
              <h3 className="text-base font-extrabold text-zinc-900 mt-2.5">Focus Goals</h3>
            </div>
            <p className="text-xs text-zinc-500 font-bold leading-relaxed mt-1">
              Establish targets, track progress milestones, and drive character growth.
            </p>
          </div>

          <div className="border border-[#EADEDF] bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between min-h-[150px]">
            <div>
              <span className="text-2xl">🔥</span>
              <h3 className="text-base font-extrabold text-zinc-900 mt-2.5">Habit Routines</h3>
            </div>
            <p className="text-xs text-zinc-500 font-bold leading-relaxed mt-1">
              Track daily streaks, visual completion heatmaps, and build character level.
            </p>
          </div>

          <div className="border border-[#EADEDF] bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between min-h-[150px]">
            <div>
              <span className="text-2xl">🤖</span>
              <h3 className="text-base font-extrabold text-zinc-900 mt-2.5">AI Insights</h3>
            </div>
            <p className="text-xs text-zinc-500 font-bold leading-relaxed mt-1">
              Generate actionable daily recommendations using a personal AI assistant.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#EADEDF] py-6 text-center text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
        Life OS © {new Date().getFullYear()} • Discipline today, freedom tomorrow.
      </footer>
    </div>
  );
}