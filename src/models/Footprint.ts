import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IFootprint extends Document {
  userId: mongoose.Types.ObjectId;
  carKm: number;
  busKm: number;
  trainKm: number;
  bikeKm: number;
  beefMeals: number;
  chickenMeals: number;
  vegMeals: number;
  electricityUsage: number;
  transportEmission: number;
  foodEmission: number;
  electricityEmission: number;
  totalEmission: number;
  createdAt: Date;
}

const FootprintSchema = new Schema<IFootprint>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    carKm: { type: Number, required: true, default: 0 },
    busKm: { type: Number, required: true, default: 0 },
    trainKm: { type: Number, required: true, default: 0 },
    bikeKm: { type: Number, required: true, default: 0 },
    beefMeals: { type: Number, required: true, default: 0 },
    chickenMeals: { type: Number, required: true, default: 0 },
    vegMeals: { type: Number, required: true, default: 0 },
    electricityUsage: { type: Number, required: true, default: 0 },
    transportEmission: { type: Number, required: true, default: 0 },
    foodEmission: { type: Number, required: true, default: 0 },
    electricityEmission: { type: Number, required: true, default: 0 },
    totalEmission: { type: Number, required: true, default: 0 },
    createdAt: { type: Date, default: Date.now, index: true },
  }
);

const Footprint = models.Footprint || model<IFootprint>("Footprint", FootprintSchema);

export default Footprint;
