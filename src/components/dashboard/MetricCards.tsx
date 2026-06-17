import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { getCarbonLevel } from "@/lib/calculations";
import { Car, Utensils, Zap, Calendar, Target, Shield, ArrowUpRight } from "lucide-react";
import { cn } from "@/utils/cn";

interface MetricCardsProps {
  stats: {
    totalEmission: number;
    transportEmission: number;
    foodEmission: number;
    electricityEmission: number;
    weeklyAverage: number;
    monthlyGoal: number;
    monthlyTotal: number;
    entryCount: number;
  };
}

export default function MetricCards({ stats }: MetricCardsProps) {
  const carbonStatus = getCarbonLevel(stats.totalEmission);
  const goalPercent = Math.min(
    Math.round((stats.monthlyTotal / (stats.monthlyGoal || 150)) * 100),
    100
  );

  const goalStatusColor =
    stats.monthlyTotal > stats.monthlyGoal
      ? "text-rose-600 dark:text-rose-400"
      : goalPercent > 80
      ? "text-amber-500 dark:text-amber-400"
      : "text-emerald-600 dark:text-emerald-400";

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Carbon Status Card (Hero Card) */}
      <Card className={cn("relative overflow-hidden md:col-span-2", carbonStatus.bg, "border", carbonStatus.border)}>
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full opacity-10 bg-current" />
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-slate-800 dark:text-slate-200 font-medium text-sm">
            Current Carbon Status
          </CardTitle>
          <span className={cn("px-3 py-1 text-xs font-semibold rounded-full border", carbonStatus.badge)}>
            {carbonStatus.level}
          </span>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {stats.totalEmission.toLocaleString()}
            </span>
            <span className="text-sm font-semibold text-slate-500">kg CO₂</span>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 font-medium">
            {carbonStatus.description}
          </p>
          <div className="mt-4 flex items-center space-x-2 text-xs text-slate-500">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>Rating is based on your latest footprint entry.</span>
          </div>
        </CardContent>
      </Card>

      {/* Goal Progress Card */}
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Monthly Target Goal
          </CardTitle>
          <Target className="w-5 h-5 text-slate-400" />
        </CardHeader>
        <CardContent className="pt-2">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-bold text-slate-950 dark:text-white">
                {stats.monthlyTotal.toLocaleString()}
              </span>
              <span className="text-sm text-slate-500">/ {stats.monthlyGoal} kg CO₂</span>
            </div>
            <span className={cn("text-sm font-bold", goalStatusColor)}>
              {goalPercent}%
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                stats.monthlyTotal > stats.monthlyGoal
                  ? "bg-rose-500"
                  : goalPercent > 80
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              )}
              style={{ width: `${goalPercent}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {stats.monthlyTotal > stats.monthlyGoal
              ? "Goal exceeded. Take eco steps to reduce your footprint."
              : `You have ${Math.max(0, stats.monthlyGoal - stats.monthlyTotal).toLocaleString()} kg remaining this month.`}
          </p>
        </CardContent>
      </Card>

      {/* Category Card: Transportation */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Transportation
          </CardTitle>
          <div className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-lg">
            <Car className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats.transportEmission.toLocaleString()} <span className="text-xs font-normal text-slate-500">kg</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-500">
            <span>
              {stats.totalEmission > 0
                ? `${Math.round((stats.transportEmission / stats.totalEmission) * 100)}% of total`
                : "0% of total"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Category Card: Food */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Food Choices
          </CardTitle>
          <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-lg">
            <Utensils className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats.foodEmission.toLocaleString()} <span className="text-xs font-normal text-slate-500">kg</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-500">
            <span>
              {stats.totalEmission > 0
                ? `${Math.round((stats.foodEmission / stats.totalEmission) * 100)}% of total`
                : "0% of total"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Category Card: Electricity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Electricity
          </CardTitle>
          <div className="p-2 bg-purple-50 dark:bg-purple-950/40 rounded-lg">
            <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats.electricityEmission.toLocaleString()} <span className="text-xs font-normal text-slate-500">kg</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-500">
            <span>
              {stats.totalEmission > 0
                ? `${Math.round((stats.electricityEmission / stats.totalEmission) * 100)}% of total`
                : "0% of total"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Category Card: Weekly Average */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Weekly Average
          </CardTitle>
          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg">
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats.weeklyAverage.toLocaleString()} <span className="text-xs font-normal text-slate-500">kg</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-500">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500 mr-1" />
            <span>From {stats.entryCount} total entries</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
