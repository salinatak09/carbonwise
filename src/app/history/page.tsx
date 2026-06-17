import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import Footprint from "@/models/Footprint";
import HistoryClient from "@/components/history/HistoryClient";
import { deleteFootprintAction } from "@/app/actions/footprint";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  await dbConnect();

  // Fetch all footprints for the user, sorted descending by date
  const rawEntries = await Footprint.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  // Map database documents to clean serializable types for client consumption
  const entries = rawEntries.map((e: any) => ({
    _id: e._id.toString(),
    userId: e.userId.toString(),
    carKm: e.carKm || 0,
    busKm: e.busKm || 0,
    trainKm: e.trainKm || 0,
    bikeKm: e.bikeKm || 0,
    beefMeals: e.beefMeals || 0,
    chickenMeals: e.chickenMeals || 0,
    vegMeals: e.vegMeals || 0,
    electricityUsage: e.electricityUsage || 0,
    transportEmission: e.transportEmission || 0,
    foodEmission: e.foodEmission || 0,
    electricityEmission: e.electricityEmission || 0,
    totalEmission: e.totalEmission || 0,
    createdAt: e.createdAt instanceof Date ? e.createdAt.toISOString() : new Date(e.createdAt).toISOString(),
  }));

  // Server action handler to pass to client component
  async function handleDelete(id: string) {
    "use server";
    return deleteFootprintAction(id);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Historical Tracking</h1>
        <p className="text-slate-500 mt-1">
          Review, filter, and audit your historical sustainability records and export reports.
        </p>
      </div>

      <HistoryClient entries={entries} onDeleteEntry={handleDelete} />
    </div>
  );
}
