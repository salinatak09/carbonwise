"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Sparkles, Zap, Lightbulb, TrendingDown, RefreshCw, AlertCircle } from "lucide-react";
import { CoachInsights } from "@/lib/gemini";
import { cn } from "@/utils/cn";

interface AiCoachCardProps {
  entryCount: number;
}

export default function AiCoachCard({ entryCount }: AiCoachCardProps) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<CoachInsights | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchInsights = async () => {
    if (entryCount === 0) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/insights");
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to load insights");
      }
      const data = await res.json();
      setInsights(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryCount]);

  if (entryCount === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            AI Sustainability Coach
          </CardTitle>
          <CardDescription>Get custom recommendations powered by Google Gemini</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center text-slate-500">
          <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
          <p className="text-sm font-medium">No activity log found.</p>
          <p className="text-xs max-w-sm mt-1">
            Please log your daily transportation, food meals, and electricity details to enable your AI Sustainability Coach.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-emerald-100 dark:border-emerald-950 relative overflow-hidden bg-gradient-to-br from-white to-emerald-50/20 dark:from-slate-900 dark:to-emerald-950/10">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
      
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <Sparkles className="w-5 h-5 text-emerald-500 animate-pulse" />
            AI Sustainability Coach
          </CardTitle>
          <CardDescription>Tailored eco strategies based on your carbon metrics</CardDescription>
        </div>
        <button
          onClick={fetchInsights}
          disabled={loading}
          className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition duration-150 cursor-pointer disabled:opacity-50"
          title="Refresh Insights"
        >
          <RefreshCw className={cn("w-4 h-4 text-slate-500", loading && "animate-spin")} />
        </button>
      </CardHeader>

      <CardContent className="pt-4 space-y-6">
        {loading ? (
          /* SKELETON LOADING STATE */
          <div className="space-y-4 animate-pulse">
            <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-28 bg-slate-100 dark:bg-slate-800 rounded-xl" />
              <div className="h-28 bg-slate-100 dark:bg-slate-800 rounded-xl" />
              <div className="h-28 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full" />
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-5/6" />
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-11/12" />
            </div>
          </div>
        ) : errorMsg ? (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-sm border border-rose-100 dark:border-rose-900/30 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        ) : insights ? (
          /* ACTUAL AI INSIGHTS CONTENT */
          <div className="space-y-6">
            {/* Biggest Source Callout */}
            <div className="p-4 bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-500/10 dark:border-emerald-500/20 rounded-xl">
              <h4 className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                Coach Analysis
              </h4>
              <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                {insights.biggestSource}
              </p>
            </div>

            {/* Structured Insights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
                  <Lightbulb className="w-4 h-4" />
                  Quick Win
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {insights.quickWin}
                </p>
              </div>

              <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 font-bold text-xs uppercase tracking-wider mb-2">
                  <Zap className="w-4 h-4" />
                  Long-Term Habit
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {insights.longTermHabit}
                </p>
              </div>

              <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl">
                <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-400 font-bold text-xs uppercase tracking-wider mb-2">
                  <TrendingDown className="w-4 h-4" />
                  Weekly Strategy
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {insights.weeklyStrategy}
                </p>
              </div>
            </div>

            {/* List of 5 recommendations */}
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">
                Personalized Carbon Reduction Plan
              </h4>
              <ul className="space-y-2.5">
                {insights.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-[10px] flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="leading-relaxed mt-0.5">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <button
              onClick={fetchInsights}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition"
            >
              Generate AI Insights
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
