"use client";

import * as React from "react";
import dynamicImport from "next/dynamic";

const EmissionCharts = dynamicImport(
  () => import("@/components/charts/EmissionCharts"),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-6 md:grid-cols-5 animate-pulse">
        <div className="md:col-span-3 h-80 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
        <div className="md:col-span-2 h-80 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
      </div>
    ),
  }
);

interface PieData {
  name: string;
  value: number;
  color: string;
}

interface TrendData {
  date: string;
  total: number;
  transport: number;
  food: number;
  electricity: number;
}

interface DashboardChartsProps {
  pieData: PieData[];
  trendData: TrendData[];
}

export default function DashboardCharts({ pieData, trendData }: DashboardChartsProps) {
  return <EmissionCharts pieData={pieData} trendData={trendData} />;
}
