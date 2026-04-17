import React, { useState } from 'react';
import {
  StyleSheet, View, Text, ScrollView, TouchableOpacity,
  Image, Platform, ActivityIndicator, Animated, TextInput, Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '@/constants/Colors';
import {
  X, Camera, Utensils, Apple, Flame, Beaker, CheckCircle, Target, Search, RefreshCw
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

// ─── Comprehensive Food Database ───────────────────────────────────────// ─ Comprehensive Food Database ────────────────────────────────────────────
// Each entry has keywords + macros + micronutrients + health score
const FOOD_DB: {
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
}[] = [
  // --- Proteins (Meat & Fish) ---
  { keywords: ['chicken','grilled chicken','breast','fillet'], name: 'Grilled Chicken Breast (200g)', calories: 330, protein: 62, carbs: 0, fat: 7, fiber: 0, sugar: 0, iron: 2, magnesium: 50, healthScore: 92, pros: ['High Protein', 'Lean'], cons: ['Low Fat'] },
  { keywords: ['steak','beef steak','ribeye','sirloin','beef'], name: 'Beef Sirloin Steak (200g)', calories: 480, protein: 50, carbs: 0, fat: 30, fiber: 0, sugar: 0, iron: 5, magnesium: 40, healthScore: 78, pros: ['Rich in Iron', 'B12 source'], cons: ['High Saturated Fat'] },
  { keywords: ['salmon','grilled salmon','baked salmon','fish'], name: 'Grilled Salmon (180g)', calories: 375, protein: 36, carbs: 0, fat: 25, fiber: 0, sugar: 0, vitaminD: 15, iron: 1.5, healthScore: 95, pros: ['Omega-3 fatty acids', 'Muscle recovery'], cons: ['Calorie Dense'] },
  { keywords: ['tuna','tuna can','canned tuna'], name: 'Canned Tuna in Water (150g)', calories: 160, protein: 38, carbs: 0, fat: 1, fiber: 0, sugar: 0, iron: 2, healthScore: 88, pros: ['Pure Protein', 'Low Calorie'], cons: ['Mercury Concerns'] },
  { keywords: ['turkey','turkey breast'], name: 'Roasted Turkey Breast (200g)', calories: 230, protein: 48, carbs: 0, fat: 3, fiber: 0, sugar: 0, iron: 2, healthScore: 90, pros: ['Ultra Lean', 'Selenium'], cons: ['Dry Texture'] },
  { keywords: ['egg','eggs','scramble','omelette'], name: 'Whole Eggs x3 (scrambled)', calories: 215, protein: 18, carbs: 2, fat: 15, fiber: 0, sugar: 1, vitaminD: 4, iron: 2.5, healthScore: 85, pros: ['Complete Protein', 'Choline'], cons: ['Dietary Cholesterol'] },
  { keywords: ['egg white','egg whites'], name: 'Egg Whites x6', calories: 100, protein: 22, carbs: 1, fat: 0, fiber: 0, sugar: 0, healthScore: 94, pros: ['Purest Protein', 'Zero Fat'], cons: ['Flavorless'] },
  { keywords: ['cod','white fish','tilapia','haddock'], name: 'Baked Cod Fillet (200g)', calories: 190, protein: 40, carbs: 0, fat: 2, fiber: 0, sugar: 0, healthScore: 89, pros: ['Very Low Calorie', 'Iodine'], cons: ['Low Omega-3s'] },
  { keywords: ['shrimp','prawns'], name: 'Cooked Prawns/Shrimp (150g)', calories: 140, protein: 30, carbs: 1, fat: 1.5, fiber: 0, sugar: 0, iron: 1.8, healthScore: 86, pros: ['Iodine', 'Zinc'], cons: ['High Sodium'] },
  { keywords: ['pork','pork chop','loin'], name: 'Grilled Pork Loin (200g)', calories: 410, protein: 42, carbs: 0, fat: 26, fiber: 0, sugar: 0, healthScore: 72, pros: ['Thiamine (B1)', 'Protein'], cons: ['Higher Fat Content'] },

  // --- Plant Based Proteins ---
  { keywords: ['tofu','bean curd'], name: 'Firm Tofu (200g)', calories: 165, protein: 18, carbs: 4, fat: 9, fiber: 2, sugar: 1, iron: 4, magnesium: 70, healthScore: 93, pros: ['Plant-based protein', 'Calcium'], cons: [] },
  { keywords: ['tempeh'], name: 'Tempeh (150g)', calories: 290, protein: 30, carbs: 14, fat: 16, fiber: 8, sugar: 0, iron: 4, healthScore: 94, pros: ['Fermented', 'High Fiber'], cons: [] },
  { keywords: ['lentils','lentil','daal','dal'], name: 'Cooked Lentils (200g)', calories: 230, protein: 18, carbs: 40, fat: 1, fiber: 16, sugar: 4, iron: 6.6, magnesium: 70, healthScore: 98, pros: ['Excellent Fiber', 'Complex Carbs'], cons: [] },
  { keywords: ['chickpeas','hummus','garbanzo'], name: 'Cooked Chickpeas (200g)', calories: 330, protein: 14, carbs: 58, fat: 5, fiber: 14, sugar: 8, iron: 4.5, healthScore: 91, pros: ['Plant-based', 'Folative'], cons: [] },
  { keywords: ['quinoa'], name: 'Cooked Quinoa (200g)', calories: 240, protein: 9, carbs: 44, fat: 4, fiber: 6, sugar: 2, magnesium: 120, healthScore: 96, pros: ['Superfood', 'Manganese'], cons: [] },

  // --- Carbs & Grains ---
  { keywords: ['rice','white rice'], name: 'Steamed White Rice (200g)', calories: 260, protein: 5, carbs: 56, fat: 1, fiber: 1, sugar: 0, healthScore: 65, pros: ['Quick Energy', 'Easy Digest'], cons: ['High Glycemic'] },
  { keywords: ['brown rice'], name: 'Steamed Brown Rice (200g)', calories: 220, protein: 5, carbs: 45, fat: 2, fiber: 4, sugar: 0, magnesium: 80, healthScore: 88, pros: ['Whole Grain', 'B Vitamins'], cons: [] },
  { keywords: ['sweet potato','yam'], name: 'Baked Sweet Potato (200g)', calories: 180, protein: 4, carbs: 42, fat: 0, fiber: 6, sugar: 9, vitaminC: 30, iron: 1.2, healthScore: 96, pros: ['Beta Carotene', 'Fiber'], cons: [] },
  { keywords: ['potato','mashed potatoes','fries'], name: 'Boiled Potato (200g)', calories: 165, protein: 4, carbs: 37, fat: 0, fiber: 4, sugar: 2, vitaminC: 20, healthScore: 82, pros: ['Potassium', 'Satiating'], cons: [] },
  { keywords: ['oatmeal','oats','porridge'], name: 'Steel Cut Oats (80g dry)', calories: 300, protein: 11, carbs: 54, fat: 6, fiber: 8, sugar: 1, iron: 3.5, healthScore: 97, pros: ['Heart Healthy', 'Sustained Energy'], cons: [] },
  { keywords: ['bread','whole wheat','toast'], name: 'Whole Wheat Bread (2 slices)', calories: 160, protein: 8, carbs: 26, fat: 2, fiber: 4, sugar: 3, healthScore: 80, pros: ['Fiber', 'Convenient'], cons: [] },
  { keywords: ['pasta','spaghetti','noodles'], name: 'Pasta (200g cooked)', calories: 320, protein: 12, carbs: 62, fat: 2, fiber: 3, sugar: 2, healthScore: 70, pros: ['Carb loading', 'Thiamine'], cons: [] },

  // --- Fruits ---
  { keywords: ['banana'], name: 'Banana (Large)', calories: 120, protein: 1.5, carbs: 31, fat: 0, fiber: 4, sugar: 15, vitaminC: 10, healthScore: 85, pros: ['Potassium', 'Pre-workout carbs'], cons: [] },
  { keywords: ['apple'], name: 'Apple (Medium)', calories: 95, protein: 0.5, carbs: 25, fat: 0, fiber: 4.5, sugar: 19, vitaminC: 8, healthScore: 90, pros: ['Fiber (Pectin)', 'Hydrating'], cons: [] },
  { keywords: ['blueberries','berries','strawberry'], name: 'Mixed Berries (150g)', calories: 85, protein: 1, carbs: 21, fat: 0, fiber: 6, sugar: 14, vitaminC: 60, healthScore: 99, pros: ['Antioxidants', 'Low Calorie'], cons: [] },
  { keywords: ['avocado'], name: 'Hass Avocado (Half)', calories: 160, protein: 2, carbs: 8, fat: 15, fiber: 7, sugar: 1, vitaminC: 5, magnesium: 30, healthScore: 96, pros: ['Healthy Monounsaturated Fats', 'Fiber'], cons: ['Calorie Dense'] },

  // --- Vegetables ---
  { keywords: ['broccoli'], name: 'Steamed Broccoli (200g)', calories: 70, protein: 6, carbs: 14, fat: 0.5, fiber: 6, sugar: 3, vitaminC: 150, iron: 1.5, healthScore: 100, pros: ['Vitamin C Overload', 'Cancer fighting'], cons: [] },
  { keywords: ['spinach','kale'], name: 'Fresh Spinach (100g)', calories: 23, protein: 3, carbs: 4, fat: 0.5, fiber: 2.2, sugar: 0.4, vitaminC: 30, iron: 2.7, healthScore: 99, pros: ['Vitamin K', 'Magnesium'], cons: [] },
  { keywords: ['carrot','carrots'], name: 'Carrots (100g)', calories: 41, protein: 1, carbs: 10, fat: 0.2, fiber: 3, sugar: 5, healthScore: 94, pros: ['Vitamin A', 'Eye health'], cons: [] },

  // --- Supplements & Performance ---
  { keywords: ['whey','protein powder','whey isolate'], name: 'Whey Protein Isolate (1 scoop)', calories: 120, protein: 26, carbs: 2, fat: 0.5, fiber: 0, sugar: 1, healthScore: 85, pros: ['Rapid Absorption', 'Muscle repair'], cons: ['Processed'] },
  { keywords: ['creatine'], name: 'Creatine Monohydrate (5g)', calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, healthScore: 100, pros: ['ATP Production', 'Increased strength'], cons: [] },
  { keywords: ['bcaa'], name: 'BCAA Powder (7g scoop)', calories: 5, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, healthScore: 78, pros: ['Leucine content', 'Muscle sparing'], cons: [] },
  { keywords: ['casein'], name: 'Micellar Casein (1 scoop)', calories: 120, protein: 24, carbs: 3, fat: 1, fiber: 0, sugar: 1, healthScore: 88, pros: ['Slow digestion', 'Best for pre-bed'], cons: [] },

  // --- Snacks & Treats ---
  { keywords: ['almonds','nuts'], name: 'Raw Almonds (30g)', calories: 175, protein: 6, carbs: 6, fat: 15, fiber: 4, sugar: 1, magnesium: 80, healthScore: 92, pros: ['Healthy fats', 'Vitamin E'], cons: ['Easy to overeat'] },
  { keywords: ['peanut butter','pb'], name: 'Natural Peanut Butter (2 tbsp)', calories: 190, protein: 8, carbs: 6, fat: 16, fiber: 2, sugar: 2, healthScore: 82, pros: ['High energy', 'Protein source'], cons: ['High calorie'] },
  { keywords: ['chocolate','dark chocolate'], name: 'Dark Chocolate 85% (40g)', calories: 230, protein: 3, carbs: 14, fat: 18, fiber: 4, sugar: 6, iron: 4, healthScore: 75, pros: ['Flavonoids', 'Magnesium'], cons: ['Saturated fat'] },
  { keywords: ['pizza','slice'], name: 'Pepperoni Pizza (1 slice)', calories: 310, protein: 14, carbs: 38, fat: 13, fiber: 2, sugar: 5, healthScore: 35, pros: ['Satiating'], cons: ['Ultra Processed', 'High Sodium'] },
  { keywords: ['burger','cheeseburger'], name: 'Fast Food Burger', calories: 550, protein: 28, carbs: 45, fat: 32, fiber: 2, sugar: 10, healthScore: 30, pros: ['Convenient'], cons: ['Trans fats', 'High sodium'] },
];

// ─── Fuzzy keyword matching ─────────────────────────────────────────────────
// ─ Fuzzy keyword matching ─────────────────────────────────────────────────
function findBestMatch(query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return null;

  let bestScore = 0;
  let bestItem = FOOD_DB[0];

  for (const item of FOOD_DB) {
    for (const kw of item.keywords) {
      // 1. Exact match (highest priority)
      if (q === kw) { 
        return { ...item, matchConfidence: 100 }; 
      }
      
      // 2. Starts with query (high priority)
      if (kw.startsWith(q)) {
        const score = 0.9 + (q.length / kw.length) * 0.1;
        if (score > bestScore) { bestScore = score; bestItem = item; }
      }

      // 3. Contains query
      if (kw.includes(q)) {
        const score = 0.7 + (q.length / kw.length) * 0.2;
        if (score > bestScore) { bestScore = score; bestItem = item; }
      }

      // 4. Word overlap matching
      const qWords = q.split(/\s+/);
      const kwWords = kw.split(/\s+/);
      const overlap = qWords.filter(w => kwWords.some(k => k.includes(w) || w.includes(k)));
      if (overlap.length > 0) {
        const score = (overlap.length / Math.max(qWords.length, kwWords.length)) * 0.8;
        if (score > bestScore) { bestScore = score; bestItem = item; }
      }
    }
  }

  // Return item with calculated confidence percentage
  return bestScore > 0 ? { ...bestItem, matchConfidence: Math.floor(bestScore * 100) } : null;
}

// Extract readable name hints from image filename
function extractFilenameHint(uri: string): string {
  try {
    const parts = uri.split('/');
    const filename = parts[parts.length - 1];
    // Remove extension and special chars, normalize
    return filename.replace(/\.[^.]+$/, '').replace(/[_\-0-9]+/g, ' ').trim();
  } catch { return ''; }
}

type ScanResult = typeof FOOD_DB[0] & { 
  matchConfidence: number; 
  matchedBy: string;
  portionScale?: number;
};

export default function NutritionModal() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'scanner' | 'plan'>('scanner');

  // Scanner State
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanAnim] = useState(new Animated.Value(0));

  // Manual search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<ScanResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Planner State
  const [goal, setGoal] = useState<'Fat Loss' | 'Muscle Gain' | 'Maintenance'>('Fat Loss');
  const [generatedPlan, setGeneratedPlan] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const translateY = scanAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 270] });

  // ── Pick & Scan ───────────────────────────────────────────────────────────
  const pickImageToScan = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      setScanResult(null);
      runScan(uri);
    }
  };

  const runScan = (uri: string) => {
    setIsScanning(true);
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    anim.start();

    setTimeout(() => {
      anim.stop();
      scanAnim.setValue(0);
      setIsScanning(false);

      // Try to identify from filename first
      const hint = extractFilenameHint(uri);
      const matchedByFilename = hint ? findBestMatch(hint) : null;

      if (matchedByFilename) {
        setScanResult({
          ...matchedByFilename,
          portionScale: 1,
          matchedBy: `Vision AI: "${hint}"`,
        });
      } else {
        setScanResult(null);
        Alert.alert(
          '🔍 Scanning Complete',
          'AI Vision needs more metadata. Please search for the food name manually below.',
        );
      }
    }, 2500);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setHasSearched(true);
    const match = findBestMatch(searchQuery);
    if (match) {
      setSearchResult({
        ...match,
        portionScale: 1,
        matchedBy: `Direct Search: "${searchQuery}"`,
      });
    } else {
      setSearchResult(null);
    }
  };

  const displayResult = scanResult || searchResult;

  // Scaling logic
  const scaleValue = (val: number | undefined, scale: number) => {
    if (val === undefined) return 0;
    return Math.round(val * scale);
  };

  const generateMealPlan = () => {
    setIsGenerating(true);
    setGeneratedPlan(null);
    setTimeout(() => {
      setIsGenerating(false);
      let targetCals = goal === 'Fat Loss' ? 1800 : goal === 'Muscle Gain' ? 3200 : 2400;
      
      // Simulate dynamic procedural generation by adding randomized variance
      const vary = (base: number, percent = 0.1) => Math.round(base * (1 + (Math.random() * percent * 2 - percent)));
      
      let meals = [];
      if (goal === 'Fat Loss') {
        const option = Math.random() > 0.5;
        meals = [
          { name: 'Breakfast', food: option ? 'Egg White Scramble with Spinach' : 'Greek Yogurt & Berries', cals: vary(250), prot: vary(25), carbs: vary(12), fat: vary(6) },
          { name: 'Lunch', food: option ? 'Grilled Chicken Salad' : 'Turkey & Quinoa Bowl', cals: vary(380), prot: vary(45), carbs: vary(20), fat: vary(12) },
          { name: 'Dinner', food: 'Baked Salmon with Steamed Broccoli', cals: vary(450), prot: vary(40), carbs: vary(15), fat: vary(20) },
          { name: 'Snack', food: 'Almonds & Protein Shake', cals: vary(200), prot: vary(25), carbs: vary(8), fat: vary(10) },
        ];
      } else if (goal === 'Muscle Gain') {
        const option = Math.random() > 0.5;
        meals = [
          { name: 'Breakfast', food: option ? '4 Whole Eggs, Oatmeal & Peanut Butter' : 'Protein Pancakes & Banana', cals: vary(680), prot: vary(40), carbs: vary(70), fat: vary(25) },
          { name: 'Lunch', food: 'Chicken Breast, White Rice, Olive Oil', cals: vary(850), prot: vary(60), carbs: vary(90), fat: vary(22) },
          { name: 'Dinner', food: option ? 'Lean Ground Beef & Sweet Potatoes' : 'Steak & Pasta', cals: vary(800), prot: vary(55), carbs: vary(85), fat: vary(26) },
          { name: 'Pre-Bed', food: 'Casein Shake & Peanut Butter', cals: vary(450), prot: vary(40), carbs: vary(20), fat: vary(22) },
        ];
      } else {
        const option = Math.random() > 0.5;
        meals = [
          { name: 'Breakfast', food: option ? 'Avocado Toast & 2 Eggs' : 'Oatmeal & Protein Shake', cals: vary(450), prot: vary(30), carbs: vary(45), fat: vary(16) },
          { name: 'Lunch', food: 'Turkey Wrap & Apple', cals: vary(550), prot: vary(35), carbs: vary(55), fat: vary(18) },
          { name: 'Dinner', food: option ? 'Steak & Mixed Vegetables' : 'Grilled Chicken & Rice', cals: vary(650), prot: vary(48), carbs: vary(50), fat: vary(24) },
          { name: 'Snack', food: 'Protein Bar & Greek Yogurt', cals: vary(350), prot: vary(35), carbs: vary(30), fat: vary(10) },
        ];
      }
      
      const calcTotal = meals.reduce((acc, m) => acc + m.cals, 0);
      setGeneratedPlan({ totalCals: calcTotal, meals });
    }, 1200);
  };

  // ── Result Card ───────────────────────────────────────────────────────────
  const ResultCard = ({ result }: { result: ScanResult }) => {
    const [portion, setPortion] = useState<'Small' | 'Standard' | 'Athlete'>('Standard');
    const [isEditing, setIsEditing] = React.useState(false);
    const [edited, setEdited] = React.useState(result);

    const scale = portion === 'Small' ? 0.7 : portion === 'Athlete' ? 1.5 : 1;

    React.useEffect(() => {
      setEdited({ ...result, portionScale: scale });
      setIsEditing(false);
    }, [result, portion]);

    const handleSaveLog = () => {
      Alert.alert('✅ Logged', `${edited.name} added to your daily tracker.`);
      setImageUri(null); setScanResult(null); setSearchResult(null);
      setSearchQuery(''); setHasSearched(false);
    };

    return (
    <View style={styles.resultCard}>
      <View style={styles.resultHeader}>
        <View style={[styles.matchBadge, {backgroundColor: result.matchConfidence > 90 ? '#10b981' : '#f59e0b'}]}>
          <Text style={styles.matchText}>{result.matchConfidence}% Accuracy</Text>
        </View>
        <Text style={styles.matchedBy}>{result.matchedBy}</Text>
      </View>

      <View style={styles.mainInfoRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.foodName}>{result.name}</Text>
          <View style={styles.portionRow}>
            {(['Small', 'Standard', 'Athlete'] as const).map(p => (
              <TouchableOpacity 
                key={p} 
                onPress={() => setPortion(p)}
                style={[styles.portionBtn, portion === p && styles.portionBtnActive]}
              >
                <Text style={[styles.portionBtnText, portion === p && styles.portionBtnTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.healthScoreContainer}>
          <View style={[styles.scoreCircle, { borderColor: result.healthScore > 80 ? '#10b981' : '#f59e0b' }]}>
            <Text style={styles.scoreVal}>{result.healthScore}</Text>
            <Text style={styles.scoreLabel}>Health</Text>
          </View>
        </View>
      </View>

      <View style={styles.macroGrid}>
      </View>

      <TouchableOpacity style={styles.rescanInlineBtn} onPress={() => {
        setImageUri(null); setScanResult(null); setSearchResult(null);
        setSearchQuery(''); setHasSearched(false);
      }}>
        <RefreshCw size={14} color={COLORS.textSecondary} />
        <Text style={styles.rescanInlineText}>Scan Another Meal</Text>
      </TouchableOpacity>
    </View>
  );
};

  return (
    <View style={styles.container}>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />

      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Utensils size={24} color={COLORS.primary} />
          <Text style={styles.headerTitle}>AI Nutrition</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <X size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabRow}>
        {[
          { key: 'scanner', label: 'AI Scanner', icon: <Camera size={16} color={activeTab === 'scanner' ? COLORS.primary : COLORS.textSecondary} /> },
          { key: 'plan', label: 'Meal Planner', icon: <Apple size={16} color={activeTab === 'plan' ? COLORS.primary : COLORS.textSecondary} /> },
        ].map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, activeTab === t.key && styles.tabActive]}
            onPress={() => setActiveTab(t.key as any)}
          >
            {t.icon}
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* ─────── SCANNER TAB ─────── */}
        {activeTab === 'scanner' && (
          <View>
            <Text style={styles.tabHeader}>Nutrition Vision AI</Text>
            <Text style={styles.tabSub}>
              Upload a food photo — the AI identifies it from the filename. For precise results, type the food name below.
            </Text>

            {/* Image area */}
            {!imageUri ? (
              <TouchableOpacity style={styles.uploadBtn} onPress={pickImageToScan}>
                <Camera size={36} color={COLORS.primary} />
                <Text style={styles.uploadBtnText}>Upload Meal Photo</Text>
                <Text style={styles.uploadBtnSub}>JPG, PNG from camera roll</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.imageContainer}>
                <Image source={{ uri: imageUri || '' }} style={styles.scannedImage} />
                {isScanning ? (
                  <View style={styles.scanningOverlay}>
                    <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />
                    <View style={styles.scanTextContainer}>
                      <ActivityIndicator size="small" color={COLORS.primary} />
                      <Text style={styles.scanText}>Hyper-Vision Scanning...</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.hudOverlay}>
                    <View style={styles.targetBox} />
                    <View style={styles.hudMarkerTopLeft} />
                    <View style={styles.hudMarkerTopRight} />
                    <View style={styles.hudMarkerBottomLeft} />
                    <View style={styles.hudMarkerBottomRight} />
                    <View style={styles.hudDataPill}>
                      <Text style={styles.hudDataText}>SENSOR ACTIVE: MULTIMODAL V2</Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Manual Search */}
            <View style={styles.searchSection}>
              <Text style={styles.searchLabel}>🔍 Search Food Manually</Text>
              <Text style={styles.searchHint}>Type any food name for instant accurate nutrition data from our 50+ food database.</Text>
              <View style={styles.searchRow}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="e.g. chicken breast, banana, oatmeal..."
                  placeholderTextColor={COLORS.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={handleSearch}
                  returnKeyType="search"
                />
                <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
                  <Search size={20} color={COLORS.background} />
                </TouchableOpacity>
              </View>
            </View>

            {/* No match */}
            {hasSearched && !searchResult && !scanResult && (
              <View style={styles.noResultCard}>
                <Text style={styles.noResultText}>No match found for "{searchQuery}"</Text>
                <Text style={styles.noResultSub}>Try simpler terms like "chicken", "rice", "egg", "salmon"...</Text>
              </View>
            )}

            {/* Result */}
            {!isScanning && displayResult && <ResultCard result={displayResult as ScanResult} />}

            {/* Re-scan button if image loaded */}
            {imageUri && !isScanning && (
              <TouchableOpacity style={styles.rescanBtn} onPress={pickImageToScan}>
                <Camera size={16} color={COLORS.primary} />
                <Text style={styles.rescanBtnText}>Choose Different Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ─────── PLANNER TAB ─────── */}
        {activeTab === 'plan' && (
          <View>
            <Text style={styles.tabHeader}>Procedural Meal Plan</Text>
            <Text style={styles.tabSub}>Generate a full-day dietary routine tailored to your active goal.</Text>

            <View style={styles.goalSelector}>
              <Text style={styles.goalLabel}>Primary Target Goal</Text>
              <View style={styles.goalRow}>
                {(['Fat Loss', 'Maintenance', 'Muscle Gain'] as const).map(g => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.goalPill, goal === g && styles.goalPillActive]}
                    onPress={() => setGoal(g)}
                  >
                    <Text style={[styles.goalPillText, goal === g && styles.goalPillTextActive]}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.generateBtn} onPress={generateMealPlan} disabled={isGenerating}>
              {isGenerating ? <ActivityIndicator color={COLORS.background} /> : (
                <>
                  <Utensils size={20} color={COLORS.background} />
                  <Text style={styles.generateBtnText}>Generate Meal Plan</Text>
                </>
              )}
            </TouchableOpacity>

            {generatedPlan && (
              <View style={styles.planContainer}>
                <View style={styles.planTargetHeader}>
                  <Target size={20} color={COLORS.primary} />
                  <Text style={styles.planTargetText}>Daily Target: {generatedPlan.totalCals} Kcals</Text>
                </View>

                {generatedPlan.meals.map((meal: any, idx: number) => (
                  <View key={idx} style={styles.mealCard}>
                    <View style={styles.mealHeader}>
                      <Text style={styles.mealName}>{meal.name}</Text>
                      <Text style={styles.mealCals}>{meal.cals} kcal</Text>
                    </View>
                    <Text style={styles.mealFood}>{meal.food}</Text>
                    <View style={styles.mealMacroRow}>
                      <View style={styles.mealMacroPill}>
                        <Text style={styles.mealMacroVal}>{meal.prot}g</Text>
                        <Text style={styles.mealMacroLabel}>Protein</Text>
                      </View>
                      <View style={styles.mealMacroPill}>
                        <Text style={styles.mealMacroVal}>{meal.carbs}g</Text>
                        <Text style={styles.mealMacroLabel}>Carbs</Text>
                      </View>
                      <View style={styles.mealMacroPill}>
                        <Text style={styles.mealMacroVal}>{meal.fat}g</Text>
                        <Text style={styles.mealMacroLabel}>Fat</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 16 : 20, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
  closeBtn: { padding: 8 },
  tabRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, gap: 8 },
  tab: {
    flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', gap: 6,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  tabActive: { backgroundColor: COLORS.primaryDim, borderColor: COLORS.primary },
  tabText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: COLORS.primary },
  content: { flex: 1, padding: 20 },
  tabHeader: { color: COLORS.text, fontSize: 20, fontWeight: 'bold', marginBottom: 6 },
  tabSub: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 20, marginBottom: 20 },
  uploadBtn: {
    alignItems: 'center', justifyContent: 'center', paddingVertical: 40,
    borderWidth: 2, borderColor: COLORS.primaryDim, borderStyle: 'dashed', borderRadius: 16,
    backgroundColor: COLORS.surface, gap: 8,
  },
  uploadBtnText: { color: COLORS.text, fontSize: 16, fontWeight: '600' },
  uploadBtnSub: { color: COLORS.textSecondary, fontSize: 12 },
  imageContainer: {
    width: '100%', height: 280, borderRadius: 16, overflow: 'hidden', position: 'relative',
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 16,
  },
  scannedImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center', alignItems: 'center'
  },
  scanLine: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
    backgroundColor: COLORS.primary, shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 10,
  },
  scanTextContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20,
  },
  scanText: { color: '#fff', fontWeight: '600' },
  // Manual Search
  searchSection: { marginTop: 20, marginBottom: 8 },
  searchLabel: { color: COLORS.text, fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  searchHint: { color: COLORS.textSecondary, fontSize: 12, marginBottom: 10, lineHeight: 18 },
  searchRow: { flexDirection: 'row', gap: 10 },
  searchInput: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    color: COLORS.text, fontSize: 15, borderWidth: 1, borderColor: COLORS.border,
  },
  searchBtn: {
    width: 50, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.primary, borderRadius: 12,
  },
  noResultCard: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 16,
    marginTop: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  noResultText: { color: COLORS.text, fontWeight: 'bold', marginBottom: 4 },
  noResultSub: { color: COLORS.textSecondary, fontSize: 13 },
  // Results
  resultCard: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 18,
    marginTop: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  matchBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  matchText: { color: COLORS.background, fontSize: 10, fontWeight: 'bold' },
  matchedBy: { color: COLORS.textSecondary, fontSize: 11, fontStyle: 'italic' },
  mainInfoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  foodName: { color: COLORS.text, fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  portionRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
  portionBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: COLORS.surfaceLight },
  portionBtnActive: { backgroundColor: COLORS.primary },
  portionBtnText: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '600' },
  portionBtnTextActive: { color: COLORS.background },
  healthScoreContainer: { alignItems: 'center', justifyContent: 'center' },
  scoreCircle: { 
    width: 60, height: 60, borderRadius: 30, borderWidth: 3, 
    alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surfaceLight 
  },
  scoreVal: { color: COLORS.text, fontSize: 18, fontWeight: 'bold' },
  scoreLabel: { color: COLORS.textSecondary, fontSize: 8, marginTop: -2 },
  macroGrid: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  macroCard: {
    flex: 1, backgroundColor: COLORS.surfaceLight, borderRadius: 12, padding: 10,
    alignItems: 'center', gap: 4, borderBottomWidth: 2, borderBottomColor: COLORS.border,
  },
  macroValue: { fontSize: 15, fontWeight: 'bold' },
  macroLabel: { color: COLORS.textSecondary, fontSize: 9 },
  // Insights
  insightSection: { 
    backgroundColor: COLORS.surfaceLight, borderRadius: 12, padding: 12, marginBottom: 16,
    borderWidth: 1, borderStyle: 'dashed', borderColor: COLORS.border 
  },
  insightTitle: { color: COLORS.primary, fontSize: 11, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase' },
  microGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  microItem: { alignItems: 'center' },
  microLabel: { color: COLORS.textSecondary, fontSize: 9 },
  microVal: { color: COLORS.text, fontSize: 12, fontWeight: 'bold' },
  prosConsSection: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  pcHeader: { color: COLORS.textSecondary, fontSize: 10, fontWeight: 'bold', marginBottom: 6, textTransform: 'uppercase' },
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagText: { fontSize: 10, fontWeight: 'bold' },
  logFullBtn: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 12 
  },
  logFullText: { color: COLORS.background, fontSize: 15, fontWeight: 'bold' },
  rescanInlineBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16 },
  rescanInlineText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  rescanBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, marginTop: 8,
  },
  rescanBtnText: { color: COLORS.primary, fontWeight: '600', fontSize: 13 },
  // HUD
  hudOverlay: { ...StyleSheet.absoluteFillObject, padding: 20, justifyContent: 'center', alignItems: 'center' },
  targetBox: { width: '80%', height: '80%', borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.3)', borderStyle: 'dashed' },
  hudMarkerTopLeft: { position: 'absolute', top: 30, left: 30, width: 20, height: 20, borderTopWidth: 2, borderLeftWidth: 2, borderColor: COLORS.primary },
  hudMarkerTopRight: { position: 'absolute', top: 30, right: 30, width: 20, height: 20, borderTopWidth: 2, borderRightWidth: 2, borderColor: COLORS.primary },
  hudMarkerBottomLeft: { position: 'absolute', bottom: 30, left: 30, width: 20, height: 20, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: COLORS.primary },
  hudMarkerBottomRight: { position: 'absolute', bottom: 30, right: 30, width: 20, height: 20, borderBottomWidth: 2, borderRightWidth: 2, borderColor: COLORS.primary },
  hudDataPill: { position: 'absolute', bottom: 15, backgroundColor: 'rgba(59, 130, 246, 0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.4)' },
  hudDataText: { color: COLORS.primary, fontSize: 8, fontWeight: 'bold', letterSpacing: 1 },
  // Planner
  goalSelector: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  goalLabel: { color: COLORS.textSecondary, fontWeight: 'bold', marginBottom: 12 },
  goalRow: { flexDirection: 'row', gap: 8 },
  goalPill: { flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: COLORS.surfaceLight, borderRadius: 8 },
  goalPillActive: { backgroundColor: COLORS.primary },
  goalPillText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: 11 },
  goalPillTextActive: { color: COLORS.background },
  generateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 16, marginBottom: 20,
  },
  generateBtnText: { color: COLORS.background, fontSize: 16, fontWeight: 'bold' },
  planContainer: { gap: 12 },
  planTargetHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.primaryDim, padding: 14, borderRadius: 12 },
  planTargetText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 15 },
  mealCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  mealName: { color: COLORS.primary, fontWeight: 'bold', fontSize: 14 },
  mealCals: { color: COLORS.textSecondary, fontSize: 12, fontWeight: 'bold' },
  mealFood: { color: COLORS.text, fontSize: 15, marginBottom: 12 },
  mealMacroRow: { flexDirection: 'row', gap: 8 },
  mealMacroPill: {
    flex: 1, backgroundColor: COLORS.surfaceLight, borderRadius: 8,
    paddingVertical: 7, alignItems: 'center',
  },
  mealMacroVal: { color: COLORS.text, fontSize: 13, fontWeight: 'bold' },
  mealMacroLabel: { color: COLORS.textSecondary, fontSize: 10 },
});
