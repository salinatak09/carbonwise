"use server";

import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import Footprint from "@/models/Footprint";
import { calculateEmissions, FootprintInputs } from "@/lib/calculations";
import { revalidatePath } from "next/cache";

export async function addFootprintAction(inputs: FootprintInputs) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized. Please sign in first." };
    }

    // Connect to database
    await dbConnect();

    // Calculate emissions
    const emissions = calculateEmissions(inputs);

    // Create record in DB
    const newFootprint = await Footprint.create({
      userId: session.user.id,
      carKm: Number(inputs.carKm || 0),
      busKm: Number(inputs.busKm || 0),
      trainKm: Number(inputs.trainKm || 0),
      bikeKm: Number(inputs.bikeKm || 0),
      beefMeals: Number(inputs.beefMeals || 0),
      chickenMeals: Number(inputs.chickenMeals || 0),
      vegMeals: Number(inputs.vegMeals || 0),
      electricityUsage: Number(inputs.electricityUsage || 0),
      ...emissions,
    });

    // Revalidate dashboard and history page cache
    revalidatePath("/dashboard");
    revalidatePath("/history");
    revalidatePath("/reports");
    revalidatePath("/profile");

    return { success: true, data: JSON.parse(JSON.stringify(newFootprint)) };
  } catch (error: any) {
    console.error("Error adding footprint entry:", error);
    return { success: false, error: error.message || "Failed to save entry." };
  }
}

export async function updateMonthlyGoalAction(monthlyGoal: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (isNaN(monthlyGoal) || monthlyGoal <= 0) {
      return { success: false, error: "Please enter a valid goal amount." };
    }

    await dbConnect();

    // Update User model
    const User = (await import("@/models/User")).default;
    await User.findByIdAndUpdate(session.user.id, { monthlyGoal });

    revalidatePath("/dashboard");
    revalidatePath("/profile");

    return { success: true, monthlyGoal };
  } catch (error: any) {
    console.error("Error updating monthly goal:", error);
    return { success: false, error: error.message || "Failed to update goal." };
  }
}

export async function deleteFootprintAction(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    await dbConnect();

    // Verify ownership before deleting
    const entry = await Footprint.findOne({ _id: id, userId: session.user.id });
    if (!entry) {
      return { success: false, error: "Record not found or unauthorized." };
    }

    await Footprint.deleteOne({ _id: id });

    revalidatePath("/dashboard");
    revalidatePath("/history");
    revalidatePath("/reports");
    revalidatePath("/profile");

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting footprint:", error);
    return { success: false, error: error.message || "Failed to delete entry." };
  }
}
