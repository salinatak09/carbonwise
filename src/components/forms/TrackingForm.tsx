"use client";

import * as React from "react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { addFootprintAction } from "@/app/actions/footprint";
import { Car, Bus, Train, Bike, Flame, Sparkles, Check, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

interface TrackingFormProps {
  onSuccess?: () => void;
}

type TabType = "transport" | "food" | "electricity";

export default function TrackingForm({ onSuccess }: TrackingFormProps) {
  const [activeTab, setActiveTab] = useState<TabType>("transport");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    carKm: "",
    busKm: "",
    trainKm: "",
    bikeKm: "",
    beefMeals: "",
    chickenMeals: "",
    vegMeals: "",
    electricityUsage: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setFormData((prev) => ({ ...prev, name: value }));
      // Wait, name is a dynamic variable here:
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // Cast properties to numbers, default empty inputs to 0
    const inputs = {
      carKm: parseFloat(formData.carKm) || 0,
      busKm: parseFloat(formData.busKm) || 0,
      trainKm: parseFloat(formData.trainKm) || 0,
      bikeKm: parseFloat(formData.bikeKm) || 0,
      beefMeals: parseFloat(formData.beefMeals) || 0,
      chickenMeals: parseFloat(formData.chickenMeals) || 0,
      vegMeals: parseFloat(formData.vegMeals) || 0,
      electricityUsage: parseFloat(formData.electricityUsage) || 0,
    };

    const result = await addFootprintAction(inputs);

    setIsSubmitting(false);

    if (result.success) {
      setSuccessMsg(`Footprint calculated: ${result.data.totalEmission} kg CO₂! Entry saved.`);
      setFormData({
        carKm: "",
        busKm: "",
        trainKm: "",
        bikeKm: "",
        beefMeals: "",
        chickenMeals: "",
        vegMeals: "",
        electricityUsage: "",
      });
      setActiveTab("transport");
      if (onSuccess) onSuccess();
    } else {
      setErrorMsg(result.error || "An error occurred. Please try again.");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold">
          <Sparkles className="w-5 h-5 text-emerald-500" />
          Track Daily Activities
        </CardTitle>
        <CardDescription>
          Log your activities to calculate your carbon footprint using India-specific emission factors.
        </CardDescription>
      </CardHeader>

      {/* Tabs Selector */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 px-6">
        <button
          type="button"
          onClick={() => setActiveTab("transport")}
          className={cn(
            "flex-1 pb-3 text-sm font-medium border-b-2 transition-all duration-200 focus:outline-none",
            activeTab === "transport"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-700"
          )}
        >
          Transportation
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("food")}
          className={cn(
            "flex-1 pb-3 text-sm font-medium border-b-2 transition-all duration-200 focus:outline-none",
            activeTab === "food"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-700"
          )}
        >
          Food Choices
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("electricity")}
          className={cn(
            "flex-1 pb-3 text-sm font-medium border-b-2 transition-all duration-200 focus:outline-none",
            activeTab === "electricity"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-700"
          )}
        >
          Electricity
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6 space-y-4">
          {/* TRANSPORT TAB */}
          {activeTab === "transport" && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Log Travel Distance (km/day)
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="carKm" className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <Car className="w-4 h-4 text-slate-400" />
                    Car Travel
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="text"
                      id="carKm"
                      name="carKm"
                      value={formData.carKm}
                      onChange={handleChange}
                      placeholder="0"
                      className="block w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-white"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-xs text-slate-400">km/day</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">0.192 kg CO₂ per km</span>
                </div>

                <div>
                  <label htmlFor="busKm" className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <Bus className="w-4 h-4 text-slate-400" />
                    Bus Transit
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="text"
                      id="busKm"
                      name="busKm"
                      value={formData.busKm}
                      onChange={handleChange}
                      placeholder="0"
                      className="block w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-white"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-xs text-slate-400">km/day</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">0.105 kg CO₂ per km</span>
                </div>

                <div>
                  <label htmlFor="trainKm" className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <Train className="w-4 h-4 text-slate-400" />
                    Train Travel
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="text"
                      id="trainKm"
                      name="trainKm"
                      value={formData.trainKm}
                      onChange={handleChange}
                      placeholder="0"
                      className="block w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-white"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-xs text-slate-400">km/day</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">0.041 kg CO₂ per km</span>
                </div>

                <div>
                  <label htmlFor="bikeKm" className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <Bike className="w-4 h-4 text-slate-400" />
                    Bicycle / Walk
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="text"
                      id="bikeKm"
                      name="bikeKm"
                      value={formData.bikeKm}
                      onChange={handleChange}
                      placeholder="0"
                      className="block w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-white"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-xs text-slate-400">km/day</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-500 mt-1 block font-medium">0 kg CO₂ (Zero emission!)</span>
                </div>
              </div>
            </div>
          )}

          {/* FOOD TAB */}
          {activeTab === "food" && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Log Meal Frequency (meals/week)
              </p>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="beefMeals" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Beef Meals
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="text"
                      id="beefMeals"
                      name="beefMeals"
                      value={formData.beefMeals}
                      onChange={handleChange}
                      placeholder="0"
                      className="block w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-white"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-xs text-slate-400">meals/week</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-rose-500 mt-1 block">5.0 kg CO₂ per meal (High impact)</span>
                </div>

                <div>
                  <label htmlFor="chickenMeals" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Chicken & Poultry Meals
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="text"
                      id="chickenMeals"
                      name="chickenMeals"
                      value={formData.chickenMeals}
                      onChange={handleChange}
                      placeholder="0"
                      className="block w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-white"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-xs text-slate-400">meals/week</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-amber-500 mt-1 block">1.8 kg CO₂ per meal</span>
                </div>

                <div>
                  <label htmlFor="vegMeals" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Vegetarian & Vegan Meals
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="text"
                      id="vegMeals"
                      name="vegMeals"
                      value={formData.vegMeals}
                      onChange={handleChange}
                      placeholder="0"
                      className="block w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-white"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-xs text-slate-400">meals/week</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-500 mt-1 block font-medium">0.8 kg CO₂ per meal (Eco-friendly)</span>
                </div>
              </div>
            </div>
          )}

          {/* ELECTRICITY TAB */}
          {activeTab === "electricity" && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Log Household Electricity Consumption
              </p>

              <div>
                <label htmlFor="electricityUsage" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Monthly Power Bill Consumption
                </label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="text"
                    id="electricityUsage"
                    name="electricityUsage"
                    value={formData.electricityUsage}
                    onChange={handleChange}
                    placeholder="0"
                    className="block w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-xs text-slate-400">kWh/month</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">0.82 kg CO₂ per kWh (India-specific grid average)</span>
              </div>

              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/50 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                <Flame className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>
                  Tip: Reducing your electricity usage by just 50 kWh can save approximately 41 kg of CO₂ emissions each month!
                </span>
              </div>
            </div>
          )}

          {/* Messages */}
          {errorMsg && (
            <div className="p-3 text-sm rounded-lg bg-rose-50 border border-rose-100 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 text-sm rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between gap-4">
          {activeTab === "transport" && (
            <button
              type="button"
              onClick={() => setActiveTab("food")}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition duration-150 cursor-pointer"
            >
              Next: Food
            </button>
          )}

          {activeTab === "food" && (
            <div className="flex gap-2 w-full justify-between">
              <button
                type="button"
                onClick={() => setActiveTab("transport")}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition duration-150 cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("electricity")}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition duration-150 cursor-pointer"
              >
                Next: Electricity
              </button>
            </div>
          )}

          {activeTab === "electricity" && (
            <div className="flex gap-2 w-full justify-between">
              <button
                type="button"
                onClick={() => setActiveTab("food")}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition duration-150 cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1 px-5 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 transition duration-150 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  "Calculate Footprint"
                )}
              </button>
            </div>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
