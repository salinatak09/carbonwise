"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Calendar, Search, Download, Trash2, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { getCarbonLevel } from "@/lib/calculations";
import { cn } from "@/utils/cn";

interface HistoryEntry {
  _id: string;
  totalEmission: number;
  transportEmission: number;
  foodEmission: number;
  electricityEmission: number;
  carKm: number;
  busKm: number;
  trainKm: number;
  bikeKm: number;
  beefMeals: number;
  chickenMeals: number;
  vegMeals: number;
  electricityUsage: number;
  createdAt: string;
}

interface HistoryClientProps {
  entries: HistoryEntry[];
  onDeleteEntry?: (id: string) => Promise<any>;
}

export default function HistoryClient({ entries, onDeleteEntry }: HistoryClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "transport" | "food" | "electricity">("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter & Sort Logic
  const filteredEntries = useMemo(() => {
    let result = [...entries];

    // Search filter (searches by date string or values)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((entry) => {
        const dateStr = new Date(entry.createdAt).toLocaleDateString().toLowerCase();
        return (
          dateStr.includes(term) ||
          entry.totalEmission.toString().includes(term) ||
          getCarbonLevel(entry.totalEmission).level.toLowerCase().includes(term)
        );
      });
    }

    // Category threshold filter (where that category was > 0)
    if (categoryFilter !== "all") {
      result = result.filter((entry) => {
        if (categoryFilter === "transport") return entry.transportEmission > 0;
        if (categoryFilter === "food") return entry.foodEmission > 0;
        if (categoryFilter === "electricity") return entry.electricityEmission > 0;
        return true;
      });
    }

    // Date range filter
    if (dateRange.start) {
      const start = new Date(dateRange.start);
      result = result.filter((entry) => new Date(entry.createdAt) >= start);
    }
    if (dateRange.end) {
      const end = new Date(dateRange.end);
      end.setHours(23, 59, 59, 999); // include the end day fully
      result = result.filter((entry) => new Date(entry.createdAt) <= end);
    }

    // Sort by Date
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [entries, searchTerm, categoryFilter, dateRange, sortOrder]);

  // Paginated data
  const paginatedEntries = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredEntries.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredEntries, currentPage]);

  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage) || 1;

  // CSV Export Utility
  const handleExportCsv = () => {
    if (filteredEntries.length === 0) return;

    const headers = [
      "Date",
      "Total Emission (kg CO2)",
      "Transport Emission (kg)",
      "Food Emission (kg)",
      "Electricity Emission (kg)",
      "Car Travel (km)",
      "Bus Travel (km)",
      "Train Travel (km)",
      "Bike Travel (km)",
      "Beef Meals",
      "Chicken Meals",
      "Veg Meals",
      "Electricity Usage (kWh)",
    ];

    const rows = filteredEntries.map((entry) => [
      new Date(entry.createdAt).toLocaleDateString(),
      entry.totalEmission,
      entry.transportEmission,
      entry.foodEmission,
      entry.electricityEmission,
      entry.carKm,
      entry.busKm,
      entry.trainKm,
      entry.bikeKm,
      entry.beefMeals,
      entry.chickenMeals,
      entry.vegMeals,
      entry.electricityUsage,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CarbonWise_Footprint_History_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSort = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6">
      {/* FILTERS & SEARCH CONTAINER */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by date, carbon level, total emission..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-white"
              />
            </div>

            {/* Category dropdown */}
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none text-slate-900 dark:text-white"
              >
                <option value="all">All Categories</option>
                <option value="transport">Has Transportation</option>
                <option value="food">Has Food Meals</option>
                <option value="electricity">Has Electricity</option>
              </select>

              {/* Date Inputs */}
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => {
                    setDateRange((prev) => ({ ...prev, start: e.target.value }));
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-2.5 py-1.5 text-xs focus:border-emerald-500 focus:outline-none text-slate-900 dark:text-white"
                  placeholder="Start date"
                />
                <span className="text-slate-400 text-xs">to</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => {
                    setDateRange((prev) => ({ ...prev, end: e.target.value }));
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-2.5 py-1.5 text-xs focus:border-emerald-500 focus:outline-none text-slate-900 dark:text-white"
                  placeholder="End date"
                />
              </div>

              {/* Export CSV Button */}
              <button
                onClick={handleExportCsv}
                disabled={filteredEntries.length === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 transition duration-150 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                CSV Export
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FOOTPRINT TABLE CARD */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Footprint Records</CardTitle>
              <CardDescription>
                Showing {filteredEntries.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, filteredEntries.length)} of {filteredEntries.length} entries
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {filteredEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Calendar className="w-10 h-10 text-slate-300 mb-2" />
              <p className="text-sm font-medium">No carbon records found matching filters.</p>
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th
                    onClick={toggleSort}
                    className="p-4 font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none transition"
                  >
                    <div className="flex items-center gap-1">
                      Date
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="p-4 font-semibold">Carbon Status</th>
                  <th className="p-4 font-semibold">Total Emission</th>
                  <th className="p-4 font-semibold hidden md:table-cell">Transportation</th>
                  <th className="p-4 font-semibold hidden md:table-cell">Food Choices</th>
                  <th className="p-4 font-semibold hidden md:table-cell">Electricity</th>
                  {onDeleteEntry && <th className="p-4 font-semibold text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedEntries.map((entry) => {
                  const carbonStatus = getCarbonLevel(entry.totalEmission);
                  return (
                    <tr
                      key={entry._id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition duration-150"
                    >
                      {/* Date */}
                      <td className="p-4 font-medium text-slate-900 dark:text-white">
                        {new Date(entry.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      {/* Carbon Status Badge */}
                      <td className="p-4">
                        <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border", carbonStatus.badge)}>
                          {carbonStatus.level}
                        </span>
                      </td>

                      {/* Total Emission */}
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        {entry.totalEmission.toLocaleString()} kg CO₂
                      </td>

                      {/* Transport Breakdown */}
                      <td className="p-4 text-xs text-slate-500 hidden md:table-cell">
                        {entry.transportEmission > 0 ? (
                          <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {entry.transportEmission} kg
                            </span>
                            <span className="block text-[10px]">
                              {entry.carKm > 0 && `Car: ${entry.carKm}km `}
                              {entry.busKm > 0 && `Bus: ${entry.busKm}km `}
                              {entry.trainKm > 0 && `Train: ${entry.trainKm}km`}
                            </span>
                          </div>
                        ) : (
                          "0 kg"
                        )}
                      </td>

                      {/* Food Breakdown */}
                      <td className="p-4 text-xs text-slate-500 hidden md:table-cell">
                        {entry.foodEmission > 0 ? (
                          <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {entry.foodEmission} kg
                            </span>
                            <span className="block text-[10px]">
                              {entry.beefMeals > 0 && `Beef: ${entry.beefMeals} `}
                              {entry.chickenMeals > 0 && `Chicken: ${entry.chickenMeals} `}
                              {entry.vegMeals > 0 && `Veg: ${entry.vegMeals}`}
                            </span>
                          </div>
                        ) : (
                          "0 kg"
                        )}
                      </td>

                      {/* Electricity Breakdown */}
                      <td className="p-4 text-xs text-slate-500 hidden md:table-cell">
                        {entry.electricityEmission > 0 ? (
                          <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {entry.electricityEmission} kg
                            </span>
                            <span className="block text-[10px]">Usage: {entry.electricityUsage} kWh</span>
                          </div>
                        ) : (
                          "0 kg"
                        )}
                      </td>

                      {/* Actions */}
                      {onDeleteEntry && (
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this log entry?")) {
                                onDeleteEntry(entry._id);
                              }
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
                            title="Delete Entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>

        {/* PAGINATION FOOTER */}
        {filteredEntries.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
