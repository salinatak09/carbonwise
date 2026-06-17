import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";
import Footprint from "@/models/Footprint";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Award, Calendar, CheckCircle2, Goal, Info, Leaf, Mail, ShieldAlert, Sparkles, User as UserIcon } from "lucide-react";
import { updateMonthlyGoalAction } from "@/app/actions/footprint";
import { cn } from "@/utils/cn";

export const dynamic = "force-dynamic";

interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  await dbConnect();

  // Fetch current user and footprints
  const user = await User.findById(session.user.id).lean();
  if (!user) {
    redirect("/");
  }

  const footprints = await Footprint.find({ userId: session.user.id })
    .sort({ createdAt: 1 })
    .lean();

  // 1. Stats Calculations
  const totalEntries = footprints.length;
  const totalEmissionsSum = footprints.reduce((sum, f) => sum + f.totalEmission, 0);
  const averageEmissions = totalEntries > 0 ? Math.round((totalEmissionsSum / totalEntries) * 100) / 100 : 0;
  
  // Member since date
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
    : "Recently";

  // 2. Achievements (Eco Badges) Check
  // Green Starter: Tracked First entry
  const hasGreenStarter = totalEntries >= 1;

  // Tracked First Week: entries span at least 7 days
  let hasTrackedFirstWeek = false;
  if (totalEntries >= 2) {
    const firstDate = new Date(footprints[0].createdAt).getTime();
    const lastDate = new Date(footprints[totalEntries - 1].createdAt).getTime();
    const spanDays = (lastDate - firstDate) / (1000 * 60 * 60 * 24);
    hasTrackedFirstWeek = spanDays >= 7;
  }

  // Low Carbon Week: Logged at least one entry under 50 kg CO2
  const hasLowCarbonWeek = footprints.some((f) => f.totalEmission <= 50);

  // Sustainable Commuter: Logged a commute with train/bike and NO car usage
  const hasSustainableCommuter = footprints.some(
    (f) => (f.trainKm > 0 || f.bikeKm > 0) && f.carKm === 0
  );

  // Eco Champion: Has 5 or more entries under 50 kg CO2
  const greenEntriesCount = footprints.filter((f) => f.totalEmission <= 50).length;
  const hasEcoChampion = greenEntriesCount >= 5;

  const badges: BadgeDefinition[] = [
    {
      id: "green_starter",
      name: "Green Starter",
      description: "Logged your first carbon footprint entry.",
      icon: <Sparkles className="w-6 h-6" />,
      color: "text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50",
      bg: "bg-emerald-50 dark:bg-emerald-950/20",
    },
    {
      id: "tracked_first_week",
      name: "Tracked First Week",
      description: "Recorded sustainability logs spanning a week.",
      icon: <Calendar className="w-6 h-6" />,
      color: "text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50",
      bg: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      id: "low_carbon_week",
      name: "Low Carbon Week",
      description: "Logged a footprint of 50 kg CO₂ or less.",
      icon: <Leaf className="w-6 h-6" />,
      color: "text-green-600 dark:text-green-400 border-green-200 dark:border-green-900/50",
      bg: "bg-green-50 dark:bg-green-950/20",
    },
    {
      id: "sustainable_commuter",
      name: "Sustainable Commuter",
      description: "Commuted by bike or train with zero car use.",
      icon: <Award className="w-6 h-6" />,
      color: "text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
      bg: "bg-amber-50 dark:bg-amber-950/20",
    },
    {
      id: "eco_champion",
      name: "Eco Champion",
      description: "Logged 5 or more high-efficiency Green days.",
      icon: <CheckCircle2 className="w-6 h-6" />,
      color: "text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/50",
      bg: "bg-purple-50 dark:bg-purple-950/20",
    },
  ];

  // Unlocked status mapping
  const unlockedMap: Record<string, boolean> = {
    green_starter: hasGreenStarter,
    tracked_first_week: hasTrackedFirstWeek,
    low_carbon_week: hasLowCarbonWeek,
    sustainable_commuter: hasSustainableCommuter,
    eco_champion: hasEcoChampion,
  };

  const unlockedCount = Object.values(unlockedMap).filter(Boolean).length;

  // Server action callback inside Profile Page
  async function handleUpdateGoal(formData: FormData) {
    "use server";
    const goalVal = parseInt(formData.get("monthlyGoal") as string);
    await updateMonthlyGoalAction(goalVal);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">User Profile</h1>
        <p className="text-slate-500 mt-1">Manage your sustainability goals and view your eco accomplishments.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* User Card */}
        <Card className="flex flex-col items-center text-center p-8 bg-gradient-to-b from-white to-slate-50/30 dark:from-slate-900 dark:to-slate-800/20">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-500/10 mb-4 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-12 h-12 text-slate-400" />
            )}
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h2>
          
          <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
            <Mail className="w-4 h-4 text-slate-400" />
            <span>{user.email}</span>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 w-full flex items-center justify-center gap-2 text-xs text-slate-400">
            <Calendar className="w-4 h-4" />
            <span>Member since {memberSince}</span>
          </div>
        </Card>

        {/* Profile Stats Grid */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Carbon Profile Statistics</CardTitle>
            <CardDescription>Aggregate metrics compiled from your historical footprint records.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3 pt-2">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
              <span className="block text-xs text-slate-500 font-medium">Total Entries</span>
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 block">
                {totalEntries}
              </span>
              <span className="text-[10px] text-slate-400">Footprints tracked</span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
              <span className="block text-xs text-slate-500 font-medium">Average Footprint</span>
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 block">
                {averageEmissions} <span className="text-xs font-normal">kg</span>
              </span>
              <span className="text-[10px] text-slate-400">CO₂ per activity entry</span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
              <span className="block text-xs text-slate-500 font-medium">Unlocked Badges</span>
              <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">
                {unlockedCount} <span className="text-xs font-normal text-slate-500">/ 5</span>
              </span>
              <span className="text-[10px] text-slate-400">Achievements earned</span>
            </div>
          </CardContent>

          {/* Goal update form */}
          <CardContent className="border-t border-slate-100 dark:border-slate-800 mt-4 pt-6">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
              <Goal className="w-4 h-4 text-emerald-500" />
              Adjust Sustainability Goals
            </h4>
            <form action={handleUpdateGoal} className="flex flex-col sm:flex-row items-end gap-3 max-w-md">
              <div className="flex-1 w-full">
                <label htmlFor="monthlyGoal" className="text-xs font-medium text-slate-500 mb-1 block">
                  Monthly Target Footprint (kg CO₂)
                </label>
                <input
                  type="number"
                  id="monthlyGoal"
                  name="monthlyGoal"
                  defaultValue={user.monthlyGoal || 150}
                  className="block w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-white font-medium"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2 text-sm font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 transition duration-150 cursor-pointer"
              >
                Update Goal
              </button>
            </form>
          </CardContent>
        </Card>

        {/* Eco Badges Achievements */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-1.5">
              <Award className="w-5 h-5 text-emerald-500" />
              Sustainability Badges
            </CardTitle>
            <CardDescription>
              Unlock achievements by maintaining low emissions and building eco-friendly daily habits.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5 pt-2">
            {badges.map((badge) => {
              const isUnlocked = unlockedMap[badge.id];
              return (
                <div
                  key={badge.id}
                  className={cn(
                    "flex flex-col items-center text-center p-6 rounded-2xl border transition duration-200",
                    isUnlocked
                      ? cn("border-slate-100 shadow-sm", badge.bg)
                      : "bg-slate-50/50 dark:bg-slate-900/10 border-slate-100 dark:border-slate-800 opacity-50 select-none"
                  )}
                >
                  <div
                    className={cn(
                      "p-3 rounded-xl border mb-3",
                      isUnlocked
                        ? badge.color
                        : "text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900"
                    )}
                  >
                    {badge.icon}
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {badge.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-[150px] leading-relaxed">
                    {badge.description}
                  </p>
                  
                  {/* Status Indicator */}
                  <span
                    className={cn(
                      "mt-4 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider",
                      isUnlocked
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                        : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    )}
                  >
                    {isUnlocked ? "Unlocked" : "Locked"}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
