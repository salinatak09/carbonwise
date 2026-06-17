// India-Specific Emission Factors (kg CO2 per unit)
export const EMISSION_FACTORS = {
  transport: {
    car: 0.192,   // per km
    bus: 0.105,   // per km
    train: 0.041, // per km
    bike: 0.0,    // per km
  },
  food: {
    beefMeal: 5.0,      // per meal
    chickenMeal: 1.8,   // per meal
    vegMeal: 0.8,       // per meal
  },
  electricity: {
    kwh: 0.82,          // per kWh
  }
};

export interface FootprintInputs {
  carKm: number;
  busKm: number;
  trainKm: number;
  bikeKm: number;
  beefMeals: number;
  chickenMeals: number;
  vegMeals: number;
  electricityUsage: number;
}

export interface EmissionBreakdown {
  transportEmission: number;
  foodEmission: number;
  electricityEmission: number;
  totalEmission: number;
}

/**
 * Calculates emissions in kg CO2 based on inputs
 */
export function calculateEmissions(inputs: FootprintInputs): EmissionBreakdown {
  const transportEmission =
    (inputs.carKm || 0) * EMISSION_FACTORS.transport.car +
    (inputs.busKm || 0) * EMISSION_FACTORS.transport.bus +
    (inputs.trainKm || 0) * EMISSION_FACTORS.transport.train +
    (inputs.bikeKm || 0) * EMISSION_FACTORS.transport.bike;

  const foodEmission =
    (inputs.beefMeals || 0) * EMISSION_FACTORS.food.beefMeal +
    (inputs.chickenMeals || 0) * EMISSION_FACTORS.food.chickenMeal +
    (inputs.vegMeals || 0) * EMISSION_FACTORS.food.vegMeal;

  // Electricity is entered as monthly kWh.
  // Wait, if users log daily, we can either divide monthly kwh by 30 to make it daily,
  // or log it as a weekly/monthly average.
  // The request says: "Electricity: Monthly electricity consumption (kWh)".
  // When stored in MongoDB, we store the entered `electricityUsage` (monthly kWh)
  // and the calculated `electricityEmission` = `electricityUsage * 0.82`.
  // Let's compute it straight as specified:
  const electricityEmission = (inputs.electricityUsage || 0) * EMISSION_FACTORS.electricity.kwh;

  const totalEmission = transportEmission + foodEmission + electricityEmission;

  return {
    transportEmission: Math.round(transportEmission * 100) / 100,
    foodEmission: Math.round(foodEmission * 100) / 100,
    electricityEmission: Math.round(electricityEmission * 100) / 100,
    totalEmission: Math.round(totalEmission * 100) / 100,
  };
}

export interface CarbonLevel {
  level: "Green" | "Moderate" | "High" | "Critical";
  color: string; // Tailwind color name or class
  bg: string;
  border: string;
  badge: string; // Full CSS class for badge styling
  description: string;
}

/**
 * Categorizes the carbon level based on total emissions in kg CO2
 */
export function getCarbonLevel(totalEmission: number): CarbonLevel {
  if (totalEmission <= 50) {
    return {
      level: "Green",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
      description: "Excellent sustainability performance.",
    };
  } else if (totalEmission <= 150) {
    return {
      level: "Moderate",
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
      badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
      description: "Room for improvement.",
    };
  } else if (totalEmission <= 300) {
    return {
      level: "High",
      color: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-200",
      badge: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      description: "Significant environmental impact.",
    };
  } else {
    return {
      level: "Critical",
      color: "text-rose-600",
      bg: "bg-rose-50",
      border: "border-rose-200",
      badge: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
      description: "Immediate action recommended.",
    };
  }
}
