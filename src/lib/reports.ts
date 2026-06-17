import { dbConnect } from "./mongodb";
import Footprint from "@/models/Footprint";
import Report, { IReport } from "@/models/Report";
import { generateSustainabilityInsights } from "./gemini";
import mongoose from "mongoose";

/**
 * Returns ISO week identifier (e.g. "2026-25")
 */
export function getWeekIdentifier(dateInput: Date = new Date()): string {
  const date = new Date(dateInput.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  // January 4 is always in week 1.
  const week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and calculate number of weeks.
  const diff = (date.getTime() - week1.getTime()) / 86400000;
  const weekNo = 1 + Math.round((diff - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${date.getFullYear()}-${String(weekNo).padStart(2, "0")}`;
}

export interface WeeklyMetrics {
  weeklyAverage: number;
  highestEmissionDay: { date: string; amount: number };
  lowestEmissionDay: { date: string; amount: number };
  mostImpactfulCategory: "Transportation" | "Food Choices" | "Electricity" | "None";
  categoryPercentages: { transport: number; food: number; electricity: number };
  wowChange: number; // Week-over-week change percentage (negative is improvement)
  hasPreviousWeek: boolean;
}

export async function generateWeeklyReport(userId: string, weekId: string): Promise<IReport> {
  await dbConnect();

  // Find user's footprints for the current week
  // ISO week starts on Monday, ends on Sunday.
  const year = parseInt(weekId.split("-")[0]);
  const week = parseInt(weekId.split("-")[1]);
  
  // Calculate start and end date for this weekId
  // Simple approximation:
  const simpleDate = new Date(year, 0, 1 + (week - 1) * 7);
  const dayOfWeek = simpleDate.getDay();
  const startOfWeek = new Date(simpleDate);
  // Adjust to Monday
  startOfWeek.setDate(simpleDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7); // Exclusive end

  const currentWeekFootprints = await Footprint.find({
    userId,
    createdAt: { $gte: startOfWeek, $lt: endOfWeek },
  }).sort({ createdAt: 1 });

  // Get previous week's footprints for comparison
  const startOfPrevWeek = new Date(startOfWeek);
  startOfPrevWeek.setDate(startOfWeek.getDate() - 7);
  const endOfPrevWeek = new Date(startOfWeek);

  const prevWeekFootprints = await Footprint.find({
    userId,
    createdAt: { $gte: startOfPrevWeek, $lt: endOfPrevWeek },
  });

  // Calculate Metrics
  const metrics = calculateMetricsForReport(currentWeekFootprints, prevWeekFootprints);

  // Formulate the summary statement
  let summary = `Your average weekly footprint was ${metrics.weeklyAverage} kg CO₂. `;
  if (metrics.mostImpactfulCategory !== "None") {
    const categoryName = metrics.mostImpactfulCategory === "Transportation" ? "transportation" : metrics.mostImpactfulCategory === "Food Choices" ? "food choices" : "electricity";
    const pct = Math.round(
      metrics.mostImpactfulCategory === "Transportation"
        ? metrics.categoryPercentages.transport
        : metrics.mostImpactfulCategory === "Food Choices"
        ? metrics.categoryPercentages.food
        : metrics.categoryPercentages.electricity
    );
    summary += `${metrics.mostImpactfulCategory} contributed ${pct}% of your emissions. `;
  }

  if (metrics.hasPreviousWeek) {
    if (metrics.wowChange < 0) {
      summary += `Your footprint improved by ${Math.abs(metrics.wowChange)}% compared to last week.`;
    } else if (metrics.wowChange > 0) {
      summary += `Your footprint increased by ${metrics.wowChange}% compared to last week.`;
    } else {
      summary += `Your footprint remained unchanged compared to last week.`;
    }
  } else {
    summary += `Track consistently next week to view your week-over-week performance comparison.`;
  }

  // Generate recommendations
  // Use Gemini to generate recommendations if we have data, or get standard ones
  let recommendations = [
    "Log your footprints daily to maintain high awareness of your emissions.",
    "Target your largest emission source by swapping a ride or a meal this week.",
    "Review your monthly electricity bill and target a 5% saving in appliances usage.",
  ];

  try {
    if (currentWeekFootprints.length > 0) {
      // Create a mock analysis using the same parameters we pass to the AI Coach
      const totalT = currentWeekFootprints.reduce((sum, f) => sum + f.transportEmission, 0);
      const totalF = currentWeekFootprints.reduce((sum, f) => sum + f.foodEmission, 0);
      const totalE = currentWeekFootprints.reduce((sum, f) => sum + f.electricityEmission, 0);
      const total = totalT + totalF + totalE;

      const aiData = {
        totalEmission: total,
        transportEmission: totalT,
        foodEmission: totalF,
        electricityEmission: totalE,
        carKm: currentWeekFootprints.reduce((sum, f) => sum + f.carKm, 0),
        busKm: currentWeekFootprints.reduce((sum, f) => sum + f.busKm, 0),
        trainKm: currentWeekFootprints.reduce((sum, f) => sum + f.trainKm, 0),
        bikeKm: currentWeekFootprints.reduce((sum, f) => sum + f.bikeKm, 0),
        beefMeals: currentWeekFootprints.reduce((sum, f) => sum + f.beefMeals, 0),
        chickenMeals: currentWeekFootprints.reduce((sum, f) => sum + f.chickenMeals, 0),
        vegMeals: currentWeekFootprints.reduce((sum, f) => sum + f.vegMeals, 0),
        electricityUsage: currentWeekFootprints.reduce((sum, f) => sum + f.electricityUsage, 0),
      };

      const aiResponse = await generateSustainabilityInsights(aiData);
      if (aiResponse && aiResponse.recommendations) {
        recommendations = aiResponse.recommendations.slice(0, 4);
      }
    }
  } catch (err) {
    console.error("Gemini failed for weekly report, using rule-based list:", err);
  }

  // Save the report to database (update or create)
  const report = await Report.findOneAndUpdate(
    { userId, weekIdentifier: weekId },
    {
      userId: new mongoose.Types.ObjectId(userId),
      weekIdentifier: weekId,
      summary,
      recommendations,
      generatedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  return report;
}

export function calculateMetricsForReport(currentWeek: any[], prevWeek: any[]): WeeklyMetrics {
  const hasCurrent = currentWeek.length > 0;
  const hasPrevious = prevWeek.length > 0;

  // 1. Weekly average
  const totalCurrEmission = currentWeek.reduce((sum, f) => sum + f.totalEmission, 0);
  const weeklyAverage = hasCurrent ? Math.round((totalCurrEmission / currentWeek.length) * 100) / 100 : 0;

  // 2. Highest / Lowest day
  let highestEmissionDay = { date: "No data", amount: 0 };
  let lowestEmissionDay = { date: "No data", amount: 0 };

  if (hasCurrent) {
    let maxItem = currentWeek[0];
    let minItem = currentWeek[0];

    currentWeek.forEach((item) => {
      if (item.totalEmission > maxItem.totalEmission) maxItem = item;
      if (item.totalEmission < minItem.totalEmission) minItem = item;
    });

    highestEmissionDay = {
      date: new Date(maxItem.createdAt).toLocaleDateString("en-IN", { weekday: "long" }),
      amount: maxItem.totalEmission,
    };
    lowestEmissionDay = {
      date: new Date(minItem.createdAt).toLocaleDateString("en-IN", { weekday: "long" }),
      amount: minItem.totalEmission,
    };
  }

  // 3. Category percentages and most impactful category
  const totalT = currentWeek.reduce((sum, f) => sum + f.transportEmission, 0);
  const totalF = currentWeek.reduce((sum, f) => sum + f.foodEmission, 0);
  const totalE = currentWeek.reduce((sum, f) => sum + f.electricityEmission, 0);
  const totalSum = totalT + totalF + totalE || 1;

  const categoryPercentages = {
    transport: (totalT / totalSum) * 100,
    food: (totalF / totalSum) * 100,
    electricity: (totalE / totalSum) * 100,
  };

  let mostImpactfulCategory: "Transportation" | "Food Choices" | "Electricity" | "None" = "None";
  if (hasCurrent) {
    if (totalT >= totalF && totalT >= totalE) mostImpactfulCategory = "Transportation";
    else if (totalE >= totalT && totalE >= totalF) mostImpactfulCategory = "Electricity";
    else mostImpactfulCategory = "Food Choices";
  }

  // 4. Week-over-week change
  const totalPrevEmission = prevWeek.reduce((sum, f) => sum + f.totalEmission, 0);
  const prevAverage = hasPrevious ? totalPrevEmission / prevWeek.length : 0;

  let wowChange = 0;
  if (hasPrevious && prevAverage > 0) {
    wowChange = Math.round(((weeklyAverage - prevAverage) / prevAverage) * 100);
  }

  return {
    weeklyAverage,
    highestEmissionDay,
    lowestEmissionDay,
    mostImpactfulCategory,
    categoryPercentages,
    wowChange,
    hasPreviousWeek: hasPrevious && prevAverage > 0,
  };
}
