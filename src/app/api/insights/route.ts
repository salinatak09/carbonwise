import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import Footprint from "@/models/Footprint";
import { generateSustainabilityInsights } from "@/lib/gemini";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Fetch user's latest footprint record
    const latestFootprint = await Footprint.findOne({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    if (!latestFootprint) {
      return NextResponse.json(
        {
          error: "No carbon footprint data found. Please log your activities first.",
        },
        { status: 400 }
      );
    }

    // Call Gemini or fallback
    const insights = await generateSustainabilityInsights({
      totalEmission: latestFootprint.totalEmission,
      transportEmission: latestFootprint.transportEmission,
      foodEmission: latestFootprint.foodEmission,
      electricityEmission: latestFootprint.electricityEmission,
      carKm: latestFootprint.carKm,
      busKm: latestFootprint.busKm,
      trainKm: latestFootprint.trainKm,
      bikeKm: latestFootprint.bikeKm,
      beefMeals: latestFootprint.beefMeals,
      chickenMeals: latestFootprint.chickenMeals,
      vegMeals: latestFootprint.vegMeals,
      electricityUsage: latestFootprint.electricityUsage,
    });

    return NextResponse.json(insights);
  } catch (error: any) {
    console.error("Error fetching insights:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate sustainability insights." },
      { status: 500 }
    );
  }
}
