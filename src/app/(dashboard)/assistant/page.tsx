"use client";

import { useState, useEffect, useRef } from "react";
import { FiCpu, FiSend, FiCompass, FiZap, FiMessageSquare } from "react-icons/fi";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Assistant() {
  const [plan, setPlan] = useState("");
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to the bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

  async function generatePlan() {
    setLoadingPlan(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST"
      });
      const data = await res.json();
      setPlan(data.plan);
    } catch (err) {
      console.error("Failed to generate plan:", err);
    } finally {
      setLoadingPlan(false);
    }
  }

  async function sendChatMessage(overrideText?: string) {
    const textToSend = overrideText || inputMessage;
    if (!textToSend.trim() || chatLoading) return;

    // Clear input
    if (!overrideText) {
      setInputMessage("");
    }

    const newMessages: Message[] = [...messages, { role: "user", content: textToSend }];
    setMessages(newMessages);
    setChatLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: newMessages
        })
      });
      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.plan }]);
    } catch (err) {
      console.error("Failed to send chat message:", err);
    } finally {
      setChatLoading(false);
    }
  }

  const suggestionChips = [
    "Give me some motivation! 🌟",
    "How do I focus better today? 🧠",
    "Help me plan my habits. 📅"
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-3">
          <FiCpu className="text-indigo-500" />
          AI Life Assistant 🤖
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium">
          Your personal productivity coach. Generate daily action plans and chat about targets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Daily Planner Generator (4 columns span) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
                <FiZap className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-base font-bold text-zinc-805 dark:text-zinc-100">Daily Action Plan</h4>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">Synthesize targets into focus metrics</p>
              </div>
            </div>

            <button
              onClick={generatePlan}
              disabled={loadingPlan}
              className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-850 dark:bg-zinc-50 dark:hover:bg-zinc-100 text-white dark:text-black font-semibold text-sm rounded-xl transition cursor-pointer shadow-sm flex items-center justify-center gap-2"
            >
              {loadingPlan ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white dark:border-black border-t-transparent"></div>
                  Formulating Plan...
                </>
              ) : (
                "Generate My Day 🚀"
              )}
            </button>

            {plan && (
              <div className="mt-5 p-6 rounded-xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/40 text-sm font-medium text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {plan}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Coach Chat Workspace (7 columns span) */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex flex-col h-[650px] overflow-hidden">
            {/* Chat Title Pane */}
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/20 flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                <FiMessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">Coach Conversation</h4>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Dynamic context enabled</p>
              </div>
            </div>

            {/* Chat message threads box */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length > 0 ? (
                messages.map((m, index) => (
                  <div 
                    key={index}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div 
                      className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                        m.role === "user"
                          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black font-semibold rounded-br-none"
                          : "bg-zinc-50 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-305 border border-zinc-100 dark:border-zinc-900 rounded-bl-none font-medium"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-zinc-400 dark:text-zinc-500 space-y-3 font-medium">
                  <FiCompass className="w-10 h-10 stroke-[1.5] text-zinc-300 dark:text-zinc-700" />
                  <p className="text-sm">Ask your AI coach for custom scheduling, habit reviews, or guidance.</p>
                </div>
              )}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-2xl rounded-bl-none border border-zinc-100 dark:border-zinc-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-650 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-650 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-650 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef}></div>
            </div>

            {/* Quick Suggestion chips */}
            {messages.length === 0 && (
              <div className="px-6 py-3 bg-zinc-50/50 dark:bg-zinc-950/20 border-t border-zinc-100 dark:border-zinc-900 flex flex-wrap gap-2">
                {suggestionChips.map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => sendChatMessage(chip)}
                    className="px-3.5 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-200 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer transition"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Message input elements */}
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-900 flex gap-2">
              <input
                className="flex-1 border border-zinc-200 dark:border-zinc-800 bg-transparent px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-650 text-zinc-900 dark:text-zinc-50"
                placeholder="Type your message to AI Life Coach..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                disabled={chatLoading}
              />
              <button
                disabled={chatLoading || !inputMessage.trim()}
                onClick={() => sendChatMessage()}
                className="p-3.5 bg-zinc-900 hover:bg-zinc-850 dark:bg-zinc-50 dark:hover:bg-zinc-100 text-white dark:text-black rounded-xl transition cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <FiSend className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}