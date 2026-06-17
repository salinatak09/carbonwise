import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IReport extends Document {
  userId: mongoose.Types.ObjectId;
  weekIdentifier: string; // Format: YYYY-WW (e.g. 2026-24)
  summary: string;
  recommendations: string[];
  generatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    weekIdentifier: { type: String, required: true },
    summary: { type: String, required: true },
    recommendations: [{ type: String, required: true }],
    generatedAt: { type: Date, default: Date.now, index: true },
  }
);

// Compound index to ensure a user only has one report per week
ReportSchema.index({ userId: 1, weekIdentifier: 1 }, { unique: true });

const Report = models.Report || model<IReport>("Report", ReportSchema);

export default Report;
