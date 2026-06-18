import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import Footprint from "@/models/Footprint";
import User from "@/models/User";
import MetricCards from "@/components/dashboard/MetricCards";
import TrackingForm from "@/components/forms/TrackingForm";
import AiCoachCard from "@/components/ai/AiCoachCard";
import DashboardCharts from "@/components/dashboard/DashboardCharts";

// Colors for Category Pie Chart
const CATEGORY_COLORS = {
  transport: "#3b82f6", // Blue
  food: "#f59e0b",      // Amber
  electricity: "#8b5cf6", // Purple
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  await dbConnect();

  // Fetch user data for goal reference
  const user = await User.findById(session.user.id).lean();
  if (!user) {
    redirect("/");
  }

  // Fetch all footprints for this user to build statistics
  const footprints = await Footprint.find({ userId: session.user.id })
    .sort({ createdAt: 1 })
    .lean();

  const entryCount = footprints.length;
  const latestEntry = entryCount > 0 ? footprints[entryCount - 1] : null;

  // Calculate stats
  const totalEmission = latestEntry?.totalEmission || 0;
  const transportEmission = latestEntry?.transportEmission || 0;
  const foodEmission = latestEntry?.foodEmission || 0;
  const electricityEmission = latestEntry?.electricityEmission || 0;

  // Weekly Average (mean of all logged entries)
  const totalEmissionsSum = footprints.reduce((sum, f) => sum + f.totalEmission, 0);
  const weeklyAverage = entryCount > 0 ? Math.round((totalEmissionsSum / entryCount) * 100) / 100 : 0;

  // Monthly Cumulative Total (for checking against monthly goal)
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const currentMonthEntries = footprints.filter(
    (f) => new Date(f.createdAt) >= startOfMonth
  );
  const monthlyTotal = Math.round(
    currentMonthEntries.reduce((sum, f) => sum + f.totalEmission, 0) * 100
  ) / 100;

  const dashboardStats = {
    totalEmission,
    transportEmission,
    foodEmission,
    electricityEmission,
    weeklyAverage,
    monthlyGoal: user.monthlyGoal || 150,
    monthlyTotal,
    entryCount,
  };

  // Build chart structures
  const pieData = [
    { name: "Transport", value: transportEmission, color: CATEGORY_COLORS.transport },
    { name: "Food Choice", value: foodEmission, color: CATEGORY_COLORS.food },
    { name: "Electricity", value: electricityEmission, color: CATEGORY_COLORS.electricity },
  ];

  const trendData = footprints.slice(-7).map((f: any) => ({
    date: new Date(f.createdAt).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    }),
    total: f.totalEmission,
    transport: f.transportEmission,
    food: f.foodEmission,
    electricity: f.electricityEmission,
  }));

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Welcome back, {session.user.name || "Eco Friend"}!
        </h1>
        <p className="text-slate-500 mt-1">
          Here is a breakdown of your current environmental footprint and personalized sustainability goals.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <MetricCards stats={dashboardStats} />

      {/* Primary Analytics Charts */}
      <div className="mt-8">
        <DashboardCharts pieData={pieData} trendData={trendData} />
      </div>

      {/* Form Submission & AI Coach Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <TrackingForm />
        </div>
        <div>
          <AiCoachCard entryCount={entryCount} />
        </div>
      </div>
    </div>
  );
}
