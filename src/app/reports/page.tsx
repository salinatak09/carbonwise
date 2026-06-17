import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import Footprint from "@/models/Footprint";
import Report from "@/models/Report";
import { getWeekIdentifier, generateWeeklyReport, calculateMetricsForReport } from "@/lib/reports";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Calendar, BarChart3, TrendingDown, TrendingUp, AlertTriangle, Lightbulb, Compass, Award } from "lucide-react";
import Link from "next/link";
import { cn } from "@/utils/cn";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  await dbConnect();

  // Get current week identifier
  const currentWeekId = getWeekIdentifier();

  // Fetch all footprints to determine if the user has logged any data
  const userFootprints = await Footprint.find({ userId: session.user.id });

  if (userFootprints.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <Card className="p-8">
          <CardContent className="flex flex-col items-center justify-center py-6">
            <BarChart3 className="w-16 h-16 text-slate-300 mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">No Carbon Data Found</h2>
            <p className="text-slate-500 mt-2 max-w-md">
              We cannot compile sustainability reports until you record your daily activities. Click below to log your first footprint!
            </p>
            <Link
              href="/dashboard"
              className="mt-6 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 transition duration-150"
            >
              Start Tracking
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get start and end date for current week to fetch weekly footprints
  const year = parseInt(currentWeekId.split("-")[0]);
  const week = parseInt(currentWeekId.split("-")[1]);
  const simpleDate = new Date(year, 0, 1 + (week - 1) * 7);
  const dayOfWeek = simpleDate.getDay();
  const startOfWeek = new Date(simpleDate);
  startOfWeek.setDate(simpleDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const currentWeekFootprints = await Footprint.find({
    userId: session.user.id,
    createdAt: { $gte: startOfWeek, $lt: endOfWeek },
  });

  const startOfPrevWeek = new Date(startOfWeek);
  startOfPrevWeek.setDate(startOfWeek.getDate() - 7);
  const endOfPrevWeek = new Date(startOfWeek);

  const prevWeekFootprints = await Footprint.find({
    userId: session.user.id,
    createdAt: { $gte: startOfPrevWeek, $lt: endOfPrevWeek },
  });

  // Calculate local metrics
  const metrics = calculateMetricsForReport(currentWeekFootprints, prevWeekFootprints);

  // Retrieve or generate the report
  let report = await Report.findOne({
    userId: session.user.id,
    weekIdentifier: currentWeekId,
  });

  if (!report && currentWeekFootprints.length > 0) {
    report = await generateWeeklyReport(session.user.id, currentWeekId);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Weekly Performance Report</h1>
          <p className="text-slate-500 mt-1">
            Automated environmental audits based on logs from Week {week}, {year}.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-2 text-sm text-slate-500 font-semibold px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <Calendar className="w-4 h-4 text-emerald-500" />
          <span>
            {startOfWeek.toLocaleDateString("en-IN", { month: "short", day: "numeric" })} -{" "}
            {new Date(endOfWeek.getTime() - 1).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>
      </div>

      {currentWeekFootprints.length === 0 ? (
        <Card className="border-amber-100 dark:border-amber-950 bg-amber-50/20 dark:bg-amber-950/10">
          <CardContent className="pt-6 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-800 dark:text-amber-400 text-sm">Insufficient Data for Current Week</h3>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                You haven't logged any entries yet during the current calendar week. We will generate your weekly report as soon as you record your first activity details.
              </p>
              <Link
                href="/dashboard"
                className="mt-3 inline-block px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-md transition"
              >
                Log Activities
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Summary & Insights */}
          <Card className="md:col-span-2 border-emerald-100 dark:border-emerald-950 bg-gradient-to-r from-emerald-50/10 to-transparent">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Performance Summary
              </CardTitle>
              <CardDescription>Overall score audit and footprint distribution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-slate-850 dark:text-slate-200 text-base leading-relaxed font-semibold">
                {report?.summary || "Analyzing metrics..."}
              </div>

              {/* Dynamic stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <span className="block text-xs font-medium text-slate-500">Weekly Average</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">
                    {metrics.weeklyAverage} <span className="text-xs font-normal">kg CO₂</span>
                  </span>
                </div>

                <div>
                  <span className="block text-xs font-medium text-slate-500">Highest Day</span>
                  <span className="text-xl font-bold text-rose-600 dark:text-rose-400">
                    {metrics.highestEmissionDay.amount} <span className="text-xs font-normal">kg</span>
                  </span>
                  <span className="block text-[10px] text-slate-400 font-medium">({metrics.highestEmissionDay.date})</span>
                </div>

                <div>
                  <span className="block text-xs font-medium text-slate-500">Lowest Day</span>
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {metrics.lowestEmissionDay.amount} <span className="text-xs font-normal">kg</span>
                  </span>
                  <span className="block text-[10px] text-slate-400 font-medium">({metrics.lowestEmissionDay.date})</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Week-over-Week Comparison Card */}
          <Card className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Week-over-Week</CardTitle>
              <CardDescription>Comparison with previous week's carbon levels</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-4 text-center">
              {metrics.hasPreviousWeek ? (
                <div className="space-y-3">
                  {metrics.wowChange < 0 ? (
                    <>
                      <div className="inline-flex items-center justify-center p-3 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
                        <TrendingDown className="w-10 h-10" />
                      </div>
                      <div className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
                        {Math.abs(metrics.wowChange)}%
                      </div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        Carbon footprint reduction!
                      </p>
                    </>
                  ) : metrics.wowChange > 0 ? (
                    <>
                      <div className="inline-flex items-center justify-center p-3 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400">
                        <TrendingUp className="w-10 h-10" />
                      </div>
                      <div className="text-4xl font-extrabold text-rose-600 dark:text-rose-400">
                        {metrics.wowChange}%
                      </div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        Increase in emissions this week.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl font-extrabold text-slate-600 dark:text-slate-300">
                        0%
                      </div>
                      <p className="text-sm font-semibold text-slate-600">
                        Your footprint is exactly the same as last week.
                      </p>
                    </>
                  )}
                  <p className="text-xs text-slate-500 max-w-[200px] mx-auto">
                    Based on your average footprint of {metrics.weeklyAverage} kg vs last week's logs.
                  </p>
                </div>
              ) : (
                <div className="text-center text-slate-500 space-y-2 py-4">
                  <BarChart3 className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold">Previous week comparison unavailable.</p>
                  <p className="text-[10px] text-slate-400 max-w-[180px] mx-auto">
                    Keep logging details. A week-over-week performance graph will unlock next week!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actionable Report Recommendations */}
          <Card className="md:col-span-3 border-slate-100 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                Actionable Reduction Recommendations
              </CardTitle>
              <CardDescription>Targeted actions compiled from this week's activities</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {report?.recommendations && report.recommendations.length > 0 ? (
                  report.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="leading-relaxed mt-0.5">{rec}</p>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500 text-xs">Generating recommendations...</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
