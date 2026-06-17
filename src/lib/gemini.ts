import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export interface CoachInsights {
  biggestSource: string;
  quickWin: string;
  longTermHabit: string;
  weeklyStrategy: string;
  recommendations: string[];
}

export async function generateSustainabilityInsights(data: {
  totalEmission: number;
  transportEmission: number;
  foodEmission: number;
  electricityEmission: number;
  carKm: number;
  busKm: number;
  trainKm: number;
  bikeKm: number;
  beefMeals: number;
  chickenMeals: number;
  vegMeals: number;
  electricityUsage: number;
}): Promise<CoachInsights> {
  // Mock fallback if API key is not configured or in sandbox
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "placeholder" || GEMINI_API_KEY.includes("YOUR_")) {
    console.warn("GEMINI_API_KEY is not defined. Using mock sustainability insights.");
    return getMockInsights(data);
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    // Use gemini-1.5-flash as it's the standard fast and free model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `
      You are a professional Sustainability & Carbon Reduction Expert.
      Analyze the following carbon footprint profile (units are in kg CO2 unless specified):
      - Total Emissions: ${data.totalEmission} kg CO2
      - Transportation: ${data.transportEmission} kg CO2 (Breakdown: Car: ${data.carKm} km, Bus: ${data.busKm} km, Train: ${data.trainKm} km, Bicycle: ${data.bikeKm} km)
      - Food: ${data.foodEmission} kg CO2 (Breakdown: Beef Meals: ${data.beefMeals}/week, Chicken: ${data.chickenMeals}/week, Veg: ${data.vegMeals}/week)
      - Electricity: ${data.electricityEmission} kg CO2 (Household usage: ${data.electricityUsage} kWh/month)

      Your task is to identify the biggest emission source and generate 5 highly actionable, personalized recommendations.
      Format the response strictly as a JSON object matching this schema:
      {
        "biggestSource": "Single sentence identifying the largest carbon source and its percentage contribution.",
        "quickWin": "One high-impact, easy action to implement today.",
        "longTermHabit": "One habit to build over the next 6 months.",
        "weeklyStrategy": "A simple metric or schedule for this week's reduction.",
        "recommendations": [
          "Recommendation 1 (max 15 words)",
          "Recommendation 2 (max 15 words)",
          "Recommendation 3 (max 15 words)",
          "Recommendation 4 (max 15 words)",
          "Recommendation 5 (max 15 words)"
        ]
      }

      Keep all responses extremely concise, positive, and direct.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text) as CoachInsights;
  } catch (error) {
    console.error("Error generating Gemini insights, falling back to rules-based insights:", error);
    return getMockInsights(data);
  }
}

function getMockInsights(data: {
  totalEmission: number;
  transportEmission: number;
  foodEmission: number;
  electricityEmission: number;
  carKm: number;
  busKm: number;
  trainKm: number;
  bikeKm: number;
  beefMeals: number;
  chickenMeals: number;
  vegMeals: number;
  electricityUsage: number;
}): CoachInsights {
  // Rules-based insights generator for offline development
  const total = data.totalEmission || 1;
  const transportPct = Math.round((data.transportEmission / total) * 100);
  const foodPct = Math.round((data.foodEmission / total) * 100);
  const electPct = Math.round((data.electricityEmission / total) * 100);

  let biggestSource = "Your carbon footprint is well distributed across categories.";
  let quickWin = "Swap one drive a week with walking, cycling, or public transport.";
  let longTermHabit = "Commit to eating plant-based meals at least three days per week.";
  let weeklyStrategy = "Aim for a 10% reduction in electricity usage by turning off standby appliances.";
  const recommendations: string[] = [
    "Switch to LED lighting throughout your household.",
    "Carpool or take public transport for commute routes.",
    "Introduce a Meatless Monday to reduce food emissions.",
    "Unplug devices and power bricks when not in use.",
    "Use smart power strips to prevent phantom load draw.",
  ];

  if (data.transportEmission >= data.foodEmission && data.transportEmission >= data.electricityEmission) {
    biggestSource = `Transportation is your biggest emission contributor at ${transportPct}% of your footprint.`;
    quickWin = "Use a train or bus instead of driving a car for journeys over 5km.";
    longTermHabit = "Adopt cycling or walking for short-distance local errands.";
    weeklyStrategy = "Coordinate grocery trips to reduce duplicate driving runs.";
    recommendations[0] = "Keep tires properly inflated to improve car fuel economy by 3%.";
    recommendations[1] = "Avoid idling the engine while waiting in traffic spots.";
  } else if (data.electricityEmission >= data.transportEmission && data.electricityEmission >= data.foodEmission) {
    biggestSource = `Household electricity is your biggest emission contributor at ${electPct}% of your footprint.`;
    quickWin = "Adjust your air conditioner or heating by 2°C to save immediate power.";
    longTermHabit = "Invest in energy-star certified appliances for long term efficiency.";
    weeklyStrategy = "Dry clothes on a clothesline instead of using a tumble dryer.";
    recommendations[0] = "Clean your AC filters regularly to maintain optimum airflow.";
    recommendations[1] = "Turn off lights and fans in empty rooms immediately.";
  } else if (data.foodEmission >= data.transportEmission && data.foodEmission >= data.electricityEmission) {
    biggestSource = `Your dietary choices represent your biggest emission contributor at ${foodPct}% of your footprint.`;
    quickWin = "Substitute a beef meal with poultry or vegetarian alternatives.";
    longTermHabit = "Transition toward a plant-rich diet to cut food footprint up to 50%.";
    weeklyStrategy = "Buy locally grown, seasonal produce to avoid heavy cargo shipping emissions.";
    recommendations[0] = "Store food properly to minimize household kitchen waste.";
    recommendations[1] = "Compost vegetable peels and kitchen scraps locally.";
  }

  return {
    biggestSource,
    quickWin,
    longTermHabit,
    weeklyStrategy,
    recommendations,
  };
}
