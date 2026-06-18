"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

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

interface EmissionChartsProps {
  pieData: PieData[];
  trendData: TrendData[];
}

export default function EmissionCharts({ pieData, trendData }: EmissionChartsProps) {
  const isPieEmpty = pieData.every((d) => d.value === 0);
  const isTrendEmpty = trendData.length === 0;

  return (
    <div className="grid gap-6 md:grid-cols-5">
      {/* Trend Area Chart (3 cols on desktop) */}
      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Emissions Trend</CardTitle>
          <CardDescription>Visual history of your daily and weekly emissions (kg CO₂)</CardDescription>
        </CardHeader>
        <CardContent className="h-80 pt-0">
          {isTrendEmpty ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <p className="text-sm">No activity trend data available yet.</p>
              <p className="text-xs mt-1">Log your first footprint entry to see analytics.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "8px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "#22c55e" }}
                  labelStyle={{ fontWeight: "bold", color: "#94a3b8" }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                  name="Total Emissions"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Breakdown Pie Chart (2 cols on desktop) */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Category Breakdown</CardTitle>
          <CardDescription>Share of carbon footprint across activities</CardDescription>
        </CardHeader>
        <CardContent className="h-80 pt-0 flex flex-col justify-between">
          {isPieEmpty ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <p className="text-sm">No emissions data recorded.</p>
            </div>
          ) : (
            <>
              <div className="h-56">
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [`${value} kg CO₂`, "Emissions"]}
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        border: "none",
                        borderRadius: "8px",
                        color: "#f8fafc",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Custom Legend */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs pb-2">
                {pieData.map((entry, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                      {entry.name}
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white mt-0.5">
                      {entry.value} kg
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
