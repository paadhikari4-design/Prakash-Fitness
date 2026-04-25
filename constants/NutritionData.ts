export interface FoodItem {
  id?: string;
  keywords: string[];
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  vitaminC?: number; // mg
  vitaminD?: number; // mcg
  iron?: number;    // mg
  magnesium?: number; // mg
  healthScore: number; // 1-100
  pros: string[];
  cons: string[];
  bestFor?: string[];
  readyMatch?: number;
}

export const FOOD_DB: FoodItem[] = [
  // --- Proteins (Meat & Fish) ---
  { keywords: ['chicken','grilled chicken','breast','fillet'], name: 'Grilled Chicken Breast (200g)', calories: 330, protein: 62, carbs: 0, fat: 7, fiber: 0, sugar: 0, iron: 2, magnesium: 50, healthScore: 92, pros: ['High Protein', 'Lean'], cons: ['Low Fat'], readyMatch: 98, bestFor: ['Muscle Gain'] },
  { keywords: ['steak','beef steak','ribeye','sirloin','beef'], name: 'Beef Sirloin Steak (200g)', calories: 480, protein: 50, carbs: 0, fat: 30, fiber: 0, sugar: 0, iron: 5, magnesium: 40, healthScore: 78, pros: ['Rich in Iron', 'B12 source'], cons: ['High Saturated Fat'], readyMatch: 95 },
  { keywords: ['salmon','grilled salmon','baked salmon','fish'], name: 'Grilled Salmon (180g)', calories: 375, protein: 36, carbs: 0, fat: 25, fiber: 0, sugar: 0, vitaminD: 15, iron: 1.5, healthScore: 95, pros: ['Omega-3 fatty acids', 'Muscle recovery'], cons: ['Calorie Dense'], readyMatch: 92 },
  { keywords: ['tuna','tuna can','canned tuna'], name: 'Canned Tuna in Water (150g)', calories: 160, protein: 38, carbs: 0, fat: 1, fiber: 0, sugar: 0, iron: 2, healthScore: 88, pros: ['Pure Protein', 'Low Calorie'], cons: ['Mercury Concerns'], readyMatch: 96 },
  { keywords: ['turkey','turkey breast'], name: 'Roasted Turkey Breast (200g)', calories: 230, protein: 48, carbs: 0, fat: 3, fiber: 0, sugar: 0, iron: 2, healthScore: 90, pros: ['Ultra Lean', 'Selenium'], cons: ['Dry Texture'], readyMatch: 94 },
  { keywords: ['egg','eggs','scramble','omelette'], name: 'Whole Eggs x3 (scrambled)', calories: 215, protein: 18, carbs: 2, fat: 15, fiber: 0, sugar: 1, vitaminD: 4, iron: 2.5, healthScore: 85, pros: ['Complete Protein', 'Choline'], cons: ['Dietary Cholesterol'], readyMatch: 88 },
  { keywords: ['egg white','egg whites'], name: 'Egg Whites x6', calories: 100, protein: 22, carbs: 1, fat: 0, fiber: 0, sugar: 0, healthScore: 94, pros: ['Purest Protein', 'Zero Fat'], cons: ['Flavorless'], readyMatch: 98 },
  { keywords: ['cod','white fish','tilapia','haddock'], name: 'Baked Cod Fillet (200g)', calories: 190, protein: 40, carbs: 0, fat: 2, fiber: 0, sugar: 0, healthScore: 89, pros: ['Very Low Calorie', 'Iodine'], cons: ['Low Omega-3s'], readyMatch: 90 },
  { keywords: ['shrimp','prawns'], name: 'Cooked Prawns/Shrimp (150g)', calories: 140, protein: 30, carbs: 1, fat: 1.5, fiber: 0, sugar: 0, iron: 1.8, healthScore: 86, pros: ['Iodine', 'Zinc'], cons: ['High Sodium'], readyMatch: 92 },
  { keywords: ['pork','pork chop','loin'], name: 'Grilled Pork Loin (200g)', calories: 410, protein: 42, carbs: 0, fat: 26, fiber: 0, sugar: 0, healthScore: 72, pros: ['Thiamine (B1)', 'Protein'], cons: ['Higher Fat Content'], readyMatch: 85 },

  // --- Plant Based Proteins ---
  { keywords: ['tofu','bean curd'], name: 'Firm Tofu (200g)', calories: 165, protein: 18, carbs: 4, fat: 9, fiber: 2, sugar: 1, iron: 4, magnesium: 70, healthScore: 93, pros: ['Plant-based protein', 'Calcium'], cons: [], readyMatch: 90 },
  { keywords: ['tempeh'], name: 'Tempeh (150g)', calories: 290, protein: 30, carbs: 14, fat: 16, fiber: 8, sugar: 0, iron: 4, healthScore: 94, pros: ['Fermented', 'High Fiber'], cons: [], readyMatch: 92 },
  { keywords: ['lentils','lentil','daal','dal'], name: 'Cooked Lentils (200g)', calories: 230, protein: 18, carbs: 40, fat: 1, fiber: 16, sugar: 4, iron: 6.6, magnesium: 70, healthScore: 98, pros: ['Excellent Fiber', 'Complex Carbs'], cons: [], readyMatch: 95 },
  { keywords: ['chickpeas','hummus','garbanzo'], name: 'Cooked Chickpeas (200g)', calories: 330, protein: 14, carbs: 58, fat: 5, fiber: 14, sugar: 8, iron: 4.5, healthScore: 91, pros: ['Plant-based', 'Folative'], cons: [], readyMatch: 88 },
  { keywords: ['quinoa'], name: 'Cooked Quinoa (200g)', calories: 240, protein: 9, carbs: 44, fat: 4, fiber: 6, sugar: 2, magnesium: 120, healthScore: 96, pros: ['Superfood', 'Manganese'], cons: [], readyMatch: 94 },

  // --- Carbs & Grains ---
  { keywords: ['rice','white rice'], name: 'Steamed White Rice (200g)', calories: 260, protein: 5, carbs: 56, fat: 1, fiber: 1, sugar: 0, healthScore: 65, pros: ['Quick Energy', 'Easy Digest'], cons: ['High Glycemic'], readyMatch: 98 },
  { keywords: ['brown rice'], name: 'Steamed Brown Rice (200g)', calories: 220, protein: 5, carbs: 45, fat: 2, fiber: 4, sugar: 0, magnesium: 80, healthScore: 88, pros: ['Whole Grain', 'B Vitamins'], cons: [], readyMatch: 96 },
  { keywords: ['sweet potato','yam'], name: 'Baked Sweet Potato (200g)', calories: 180, protein: 4, carbs: 42, fat: 0, fiber: 6, sugar: 9, vitaminC: 30, iron: 1.2, healthScore: 96, pros: ['Beta Carotene', 'Fiber'], cons: [], readyMatch: 95 },
  { keywords: ['potato','mashed potatoes','fries'], name: 'Boiled Potato (200g)', calories: 165, protein: 4, carbs: 37, fat: 0, fiber: 4, sugar: 2, vitaminC: 20, healthScore: 82, pros: ['Potassium', 'Satiating'], cons: [], readyMatch: 92 },
  { keywords: ['oatmeal','oats','porridge'], name: 'Steel Cut Oats (80g dry)', calories: 300, protein: 11, carbs: 54, fat: 6, fiber: 8, sugar: 1, iron: 3.5, healthScore: 97, pros: ['Heart Healthy', 'Sustained Energy'], cons: [], readyMatch: 97 },
  { keywords: ['bread','whole wheat','toast'], name: 'Whole Wheat Bread (2 slices)', calories: 160, protein: 8, carbs: 26, fat: 2, fiber: 4, sugar: 3, healthScore: 80, pros: ['Fiber', 'Convenient'], cons: [], readyMatch: 90 },
  { keywords: ['pasta','spaghetti','noodles'], name: 'Pasta (200g cooked)', calories: 320, protein: 12, carbs: 62, fat: 2, fiber: 3, sugar: 2, healthScore: 70, pros: ['Carb loading', 'Thiamine'], cons: [], readyMatch: 94 },

  // --- Fruits ---
  { keywords: ['banana'], name: 'Banana (Large)', calories: 120, protein: 1.5, carbs: 31, fat: 0, fiber: 4, sugar: 15, vitaminC: 10, healthScore: 85, pros: ['Potassium', 'Pre-workout carbs'], cons: [], readyMatch: 99 },
  { keywords: ['apple'], name: 'Apple (Medium)', calories: 95, protein: 0.5, carbs: 25, fat: 0, fiber: 4.5, sugar: 19, vitaminC: 8, healthScore: 90, pros: ['Fiber (Pectin)', 'Hydrating'], cons: [], readyMatch: 98 },
  { keywords: ['blueberries','berries','strawberry'], name: 'Mixed Berries (150g)', calories: 85, protein: 1, carbs: 21, fat: 0, fiber: 6, sugar: 14, vitaminC: 60, healthScore: 99, pros: ['Antioxidants', 'Low Calorie'], cons: [], readyMatch: 95 },
  { keywords: ['avocado'], name: 'Hass Avocado (Half)', calories: 160, protein: 2, carbs: 8, fat: 15, fiber: 7, sugar: 1, vitaminC: 5, magnesium: 30, healthScore: 96, pros: ['Healthy Monounsaturated Fats', 'Fiber'], cons: ['Calorie Dense'], readyMatch: 94 },

  // --- Vegetables ---
  { keywords: ['broccoli'], name: 'Steamed Broccoli (200g)', calories: 70, protein: 6, carbs: 14, fat: 0.5, fiber: 6, sugar: 3, vitaminC: 150, iron: 1.5, healthScore: 100, pros: ['Vitamin C Overload', 'Cancer fighting'], cons: [], readyMatch: 98 },
  { keywords: ['spinach','kale'], name: 'Fresh Spinach (100g)', calories: 23, protein: 3, carbs: 4, fat: 0.5, fiber: 2.2, sugar: 0.4, vitaminC: 30, iron: 2.7, healthScore: 99, pros: ['Vitamin K', 'Magnesium'], cons: [], readyMatch: 97 },
  { keywords: ['carrot','carrots'], name: 'Carrots (100g)', calories: 41, protein: 1, carbs: 10, fat: 0.2, fiber: 3, sugar: 5, healthScore: 94, pros: ['Vitamin A', 'Eye health'], cons: [], readyMatch: 95 },

  // --- Supplements & Performance ---
  { keywords: ['whey','protein powder','whey isolate'], name: 'Whey Protein Isolate (1 scoop)', calories: 120, protein: 26, carbs: 2, fat: 0.5, fiber: 0, sugar: 1, healthScore: 85, pros: ['Rapid Absorption', 'Muscle repair'], cons: ['Processed'], readyMatch: 95 },
  { keywords: ['creatine'], name: 'Creatine Monohydrate (5g)', calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, healthScore: 100, pros: ['ATP Production', 'Increased strength'], cons: [], readyMatch: 100 },
  { keywords: ['bcaa'], name: 'BCAA Powder (7g scoop)', calories: 5, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, healthScore: 78, pros: ['Leucine content', 'Muscle sparing'], cons: [], readyMatch: 80 },
  { keywords: ['casein'], name: 'Micellar Casein (1 scoop)', calories: 120, protein: 24, carbs: 3, fat: 1, fiber: 0, sugar: 1, healthScore: 88, pros: ['Slow digestion', 'Best for pre-bed'], cons: [], readyMatch: 85 },

  // --- Snacks & Treats ---
  { keywords: ['almonds','nuts'], name: 'Raw Almonds (30g)', calories: 175, protein: 6, carbs: 6, fat: 15, fiber: 4, sugar: 1, magnesium: 80, healthScore: 92, pros: ['Healthy fats', 'Vitamin E'], cons: ['Easy to overeat'], readyMatch: 92 },
  { keywords: ['peanut butter','pb'], name: 'Natural Peanut Butter (2 tbsp)', calories: 190, protein: 8, carbs: 6, fat: 16, fiber: 2, sugar: 2, healthScore: 82, pros: ['High energy', 'Protein source'], cons: ['High calorie'], readyMatch: 85 },
  { keywords: ['chocolate','dark chocolate'], name: 'Dark Chocolate 85% (40g)', calories: 230, protein: 3, carbs: 14, fat: 18, fiber: 4, sugar: 6, iron: 4, healthScore: 75, pros: ['Flavonoids', 'Magnesium'], cons: ['Saturated fat'], readyMatch: 80 },
  { keywords: ['pizza','slice'], name: 'Pepperoni Pizza (1 slice)', calories: 310, protein: 14, carbs: 38, fat: 13, fiber: 2, sugar: 5, healthScore: 35, pros: ['Satiating'], cons: ['Ultra Processed', 'High Sodium'], readyMatch: 70 },
  { keywords: ['burger','cheeseburger'], name: 'Fast Food Burger', calories: 550, protein: 28, carbs: 45, fat: 32, fiber: 2, sugar: 10, healthScore: 30, pros: ['Convenient'], cons: ['Trans fats', 'High sodium'], readyMatch: 75 },
];

// --- Fuzzy keyword matching ---
export function findBestMatch(query: string, database: FoodItem[]) {
  const q = query.toLowerCase().trim();
  if (!q) return null;

  let bestScore = 0;
  let bestItem = database[0];

  for (const item of database) {
    for (const kw of item.keywords) {
      if (q === kw) return { ...item, matchConfidence: 100 };
      
      if (kw.startsWith(q)) {
        const score = 0.9 + (q.length / kw.length) * 0.1;
        if (score > bestScore) { bestScore = score; bestItem = item; }
      }

      if (kw.includes(q)) {
        const score = 0.7 + (q.length / kw.length) * 0.2;
        if (score > bestScore) { bestScore = score; bestItem = item; }
      }

      const qWords = q.split(/\s+/);
      const kwWords = kw.split(/\s+/);
      const overlap = qWords.filter(w => kwWords.some(k => k.includes(w) || w.includes(k)));
      if (overlap.length > 0) {
        const score = (overlap.length / Math.max(qWords.length, kwWords.length)) * 0.8;
        if (score > bestScore) { bestScore = score; bestItem = item; }
      }
    }
  }

  return bestScore > 0 ? { ...bestItem, matchConfidence: Math.floor(bestScore * 100) } : null;
}
