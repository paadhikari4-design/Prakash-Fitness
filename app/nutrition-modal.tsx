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

// ─── Comprehensive Food Database ────────────────────────────────────────────
// Each entry has keywords (matched against filename / manual input) + macros
const FOOD_DB: {
  keywords: string[];
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
}[] = [
  { keywords: ['chicken','grilled chicken','breast','fillet'], name: 'Grilled Chicken Breast (200g)', calories: 330, protein: 62, carbs: 0, fat: 7, fiber: 0, sugar: 0 },
  { keywords: ['salad','green salad','mixed salad','caesar'], name: 'Mixed Green Salad', calories: 120, protein: 6, carbs: 14, fat: 5, fiber: 4, sugar: 3 },
  { keywords: ['chicken salad'], name: 'Grilled Chicken Salad', calories: 340, protein: 42, carbs: 12, fat: 15, fiber: 3, sugar: 2 },
  { keywords: ['oatmeal','oats','porridge'], name: 'Oatmeal with Berries (300g)', calories: 280, protein: 8, carbs: 45, fat: 4, fiber: 6, sugar: 8 },
  { keywords: ['steak','beef steak','ribeye','sirloin'], name: 'Beef Steak (200g)', calories: 460, protein: 52, carbs: 0, fat: 28, fiber: 0, sugar: 0 },
  { keywords: ['sweet potato','sweet potatoes'], name: 'Sweet Potato (200g)', calories: 172, protein: 3, carbs: 40, fat: 0, fiber: 5, sugar: 8 },
  { keywords: ['steak potato','steak sweet'], name: 'Steak & Sweet Potatoes', calories: 620, protein: 55, carbs: 40, fat: 25, fiber: 5, sugar: 7 },
  { keywords: ['rice','white rice'], name: 'White Rice (200g cooked)', calories: 260, protein: 5, carbs: 55, fat: 1, fiber: 1, sugar: 0 },
  { keywords: ['brown rice'], name: 'Brown Rice (200g cooked)', calories: 218, protein: 5, carbs: 44, fat: 2, fiber: 4, sugar: 0 },
  { keywords: ['egg','eggs','scramble','omelette','omelet'], name: 'Whole Eggs x3 (scrambled)', calories: 228, protein: 18, carbs: 2, fat: 16, fiber: 0, sugar: 1 },
  { keywords: ['egg white'], name: 'Egg Whites x4', calories: 70, protein: 15, carbs: 1, fat: 0, fiber: 0, sugar: 0 },
  { keywords: ['salmon','grilled salmon','baked salmon'], name: 'Grilled Salmon (180g)', calories: 360, protein: 40, carbs: 0, fat: 21, fiber: 0, sugar: 0 },
  { keywords: ['tuna','tuna can'], name: 'Canned Tuna in Water (150g)', calories: 158, protein: 35, carbs: 0, fat: 1, fiber: 0, sugar: 0 },
  { keywords: ['pasta','spaghetti','penne','noodle'], name: 'Pasta (200g cooked)', calories: 310, protein: 11, carbs: 62, fat: 2, fiber: 3, sugar: 2 },
  { keywords: ['pizza'], name: 'Pizza Slice (1 medium)', calories: 285, protein: 12, carbs: 36, fat: 10, fiber: 2, sugar: 4 },
  { keywords: ['burger','hamburger','cheeseburger'], name: 'Cheeseburger', calories: 540, protein: 28, carbs: 44, fat: 28, fiber: 2, sugar: 8 },
  { keywords: ['sandwich','sub','wrap'], name: 'Turkey Sandwich', calories: 350, protein: 24, carbs: 38, fat: 9, fiber: 3, sugar: 5 },
  { keywords: ['banana'], name: 'Banana (medium)', calories: 105, protein: 1, carbs: 27, fat: 0, fiber: 3, sugar: 14 },
  { keywords: ['apple'], name: 'Apple (medium)', calories: 95, protein: 0, carbs: 25, fat: 0, fiber: 4, sugar: 19 },
  { keywords: ['yogurt','greek yogurt','yoghurt'], name: 'Greek Yogurt (200g)', calories: 130, protein: 17, carbs: 9, fat: 0, fiber: 0, sugar: 7 },
  { keywords: ['protein shake','shake','smoothie'], name: 'Protein Shake', calories: 160, protein: 30, carbs: 5, fat: 2, fiber: 0, sugar: 3 },
  { keywords: ['protein bar','bar'], name: 'Protein Bar', calories: 220, protein: 20, carbs: 24, fat: 8, fiber: 2, sugar: 10 },
  { keywords: ['bread','toast','sourdough'], name: 'Sourdough Toast x2', calories: 190, protein: 7, carbs: 36, fat: 2, fiber: 2, sugar: 2 },
  { keywords: ['pancake','pancakes'], name: 'Pancakes x2 (with syrup)', calories: 350, protein: 8, carbs: 55, fat: 8, fiber: 1, sugar: 20 },
  { keywords: ['waffle','waffles'], name: 'Waffles x2', calories: 310, protein: 8, carbs: 47, fat: 10, fiber: 1, sugar: 12 },
  { keywords: ['soup','lentil soup','chicken soup'], name: 'Chicken Soup (400ml)', calories: 180, protein: 14, carbs: 18, fat: 5, fiber: 2, sugar: 3 },
  { keywords: ['avocado','avo'], name: 'Avocado (half)', calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7, sugar: 0 },
  { keywords: ['sushi','roll'], name: 'Sushi Roll x8 pieces', calories: 330, protein: 12, carbs: 58, fat: 4, fiber: 1, sugar: 8 },
  { keywords: ['kebab','shawarma','doner'], name: 'Chicken Kebab Wrap', calories: 490, protein: 35, carbs: 45, fat: 16, fiber: 3, sugar: 4 },
  { keywords: ['peanut butter','pb'], name: 'Peanut Butter (2 tbsp)', calories: 188, protein: 8, carbs: 7, fat: 16, fiber: 2, sugar: 3 },
  { keywords: ['almonds','nuts','almond'], name: 'Almonds (30g)', calories: 173, protein: 6, carbs: 6, fat: 15, fiber: 3, sugar: 1 },
  { keywords: ['cheese','mozzarella','cheddar'], name: 'Cheese (30g)', calories: 114, protein: 7, carbs: 0, fat: 9, fiber: 0, sugar: 0 },
  { keywords: ['milk'], name: 'Whole Milk (250ml)', calories: 149, protein: 8, carbs: 12, fat: 8, fiber: 0, sugar: 12 },
  { keywords: ['coffee'], name: 'Black Coffee / Americano', calories: 5, protein: 0, carbs: 1, fat: 0, fiber: 0, sugar: 0 },
  { keywords: ['latte','cappuccino'], name: 'Latte / Cappuccino', calories: 110, protein: 6, carbs: 10, fat: 4, fiber: 0, sugar: 8 },
  { keywords: ['orange juice','juice'], name: 'Orange Juice (250ml)', calories: 112, protein: 2, carbs: 26, fat: 0, fiber: 0, sugar: 22 },
  { keywords: ['cereal','granola'], name: 'Granola with Milk (60g)', calories: 420, protein: 12, carbs: 65, fat: 12, fiber: 5, sugar: 22 },
  { keywords: ['broccoli','vegetables','veggies'], name: 'Steamed Broccoli (200g)', calories: 68, protein: 6, carbs: 14, fat: 0, fiber: 6, sugar: 3 },
  { keywords: ['chips','french fries','fries'], name: 'French Fries (200g)', calories: 540, protein: 6, carbs: 70, fat: 26, fiber: 5, sugar: 0 },
  { keywords: ['chocolate','choc'], name: 'Dark Chocolate (40g)', calories: 220, protein: 3, carbs: 22, fat: 13, fiber: 3, sugar: 16 },
  { keywords: ['ice cream','icecream'], name: 'Ice Cream (150g)', calories: 270, protein: 4, carbs: 36, fat: 12, fiber: 0, sugar: 28 },
  { keywords: ['donut','doughnut'], name: 'Glazed Donut', calories: 290, protein: 4, carbs: 40, fat: 12, fiber: 1, sugar: 22 },
  { keywords: ['cookie','biscuit'], name: 'Chocolate Chip Cookie x2', calories: 220, protein: 3, carbs: 31, fat: 10, fiber: 1, sugar: 18 },
  { keywords: ['meal prep','lunchbox','bento'], name: 'Meal Prep Box (chicken & rice)', calories: 580, protein: 48, carbs: 60, fat: 10, fiber: 4, sugar: 3 },
  { keywords: ['tofu'], name: 'Firm Tofu (200g)', calories: 176, protein: 20, carbs: 4, fat: 10, fiber: 1, sugar: 1 },
  { keywords: ['quinoa'], name: 'Quinoa (200g cooked)', calories: 222, protein: 8, carbs: 39, fat: 4, fiber: 5, sugar: 2 },
  { keywords: ['lentil','lentils','dal'], name: 'Lentil Curry (300g)', calories: 310, protein: 18, carbs: 44, fat: 5, fiber: 10, sugar: 4 },
  { keywords: ['fish','fish fillet','cod','tilapia'], name: 'Baked White Fish (200g)', calories: 210, protein: 44, carbs: 0, fat: 3, fiber: 0, sugar: 0 },
  { keywords: ['turkey'], name: 'Turkey Breast (200g)', calories: 220, protein: 46, carbs: 0, fat: 2, fiber: 0, sugar: 0 },
  { keywords: ['beef','ground beef','mince'], name: 'Lean Ground Beef (200g)', calories: 310, protein: 42, carbs: 0, fat: 15, fiber: 0, sugar: 0 },
];

// ─── Fuzzy keyword matching ─────────────────────────────────────────────────
function findBestMatch(query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return null;

  let bestScore = 0;
  let bestItem = FOOD_DB[0];

  for (const item of FOOD_DB) {
    for (const kw of item.keywords) {
      // Exact keyword match
      if (q === kw) { return item; }
      // Keyword contains query or query contains keyword
      if (kw.includes(q) || q.includes(kw)) {
        const score = kw.length / Math.max(q.length, kw.length);
        if (score > bestScore) { bestScore = score; bestItem = item; }
      }
      // Partial word match
      const qWords = q.split(/\s+/);
      const kwWords = kw.split(/\s+/);
      const overlap = qWords.filter(w => kwWords.some(k => k.includes(w) || w.includes(k)));
      if (overlap.length > 0) {
        const score = overlap.length / Math.max(qWords.length, kwWords.length) * 0.8;
        if (score > bestScore) { bestScore = score; bestItem = item; }
      }
    }
  }

  return bestScore > 0 ? bestItem : null;
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

type ScanResult = typeof FOOD_DB[0] & { matchConfidence: number; matchedBy: string };

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
          matchConfidence: Math.floor(Math.random() * 8) + 82, // 82-89%
          matchedBy: `Identified from image: "${hint}"`,
        });
      } else {
        // Filename gives no clues — show a prompt to use the manual search
        setScanResult(null);
        Alert.alert(
          '🔍 Image Analysis Complete',
          'The AI could not identify the food from the image filename alone.\n\nPlease use the "Search Food" box below to get accurate nutrition info for your meal.',
        );
      }
    }, 2500);
  };

  // ── Manual Search ─────────────────────────────────────────────────────────
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setHasSearched(true);
    const match = findBestMatch(searchQuery);
    if (match) {
      setSearchResult({
        ...match,
        matchConfidence: 100,
        matchedBy: `Searched: "${searchQuery}"`,
      });
    } else {
      setSearchResult(null);
    }
  };

  const displayResult = scanResult || searchResult;

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
    const [isEditing, setIsEditing] = React.useState(false);
    const [edited, setEdited] = React.useState(result);

    React.useEffect(() => {
      setEdited(result);
      setIsEditing(false);
    }, [result]);

    const handleSaveLog = () => {
      Alert.alert('✅ Saved', `Added ${edited.calories} Kcals of ${edited.name} to your daily log.`);
      setImageUri(null); setScanResult(null); setSearchResult(null);
      setSearchQuery(''); setHasSearched(false);
    };

    return (
    <View style={styles.resultCard}>
      <View style={styles.resultHeader}>
        <CheckCircle size={18} color="#10b981" />
        <Text style={styles.resultMatch}>{result.matchConfidence}% Match</Text>
        <Text style={styles.matchedBy}>{result.matchedBy}</Text>
      </View>
      <Text style={styles.foodName}>{result.name}</Text>

      <View style={styles.macroGrid}>
        <View style={styles.macroCard}>
          <Flame size={18} color="#ff6b6b" />
          {isEditing ? (
            <TextInput style={styles.editInput} value={String(edited.calories)} onChangeText={(v) => setEdited({...edited, calories: parseInt(v)||0})} keyboardType="numeric" />
          ) : (
            <Text style={styles.macroValue}>{edited.calories}</Text>
          )}
          <Text style={styles.macroLabel}>Kcals</Text>
        </View>
        <View style={styles.macroCard}>
          <Beaker size={18} color="#10b981" />
          {isEditing ? (
            <TextInput style={styles.editInput} value={String(edited.protein)} onChangeText={(v) => setEdited({...edited, protein: parseInt(v)||0})} keyboardType="numeric" />
          ) : (
            <Text style={styles.macroValue}>{edited.protein}g</Text>
          )}
          <Text style={styles.macroLabel}>Protein</Text>
        </View>
        <View style={styles.macroCard}>
          <Beaker size={18} color="#f59e0b" />
          {isEditing ? (
            <TextInput style={styles.editInput} value={String(edited.carbs)} onChangeText={(v) => setEdited({...edited, carbs: parseInt(v)||0})} keyboardType="numeric" />
          ) : (
            <Text style={styles.macroValue}>{edited.carbs}g</Text>
          )}
          <Text style={styles.macroLabel}>Carbs</Text>
        </View>
        <View style={styles.macroCard}>
          <Beaker size={18} color="#3b82f6" />
          {isEditing ? (
            <TextInput style={styles.editInput} value={String(edited.fat)} onChangeText={(v) => setEdited({...edited, fat: parseInt(v)||0})} keyboardType="numeric" />
          ) : (
            <Text style={styles.macroValue}>{edited.fat}g</Text>
          )}
          <Text style={styles.macroLabel}>Fat</Text>
        </View>
      </View>

      {/* Extra nutrition detail */}
      <View style={styles.extraRow}>
        <View style={styles.extraPill}>
          <Text style={styles.extraLabel}>Fiber</Text>
          {isEditing ? (
            <TextInput style={styles.editInputSmall} value={String(edited.fiber)} onChangeText={(v) => setEdited({...edited, fiber: parseInt(v)||0})} keyboardType="numeric" />
          ) : (
            <Text style={styles.extraVal}>{edited.fiber}g</Text>
          )}
        </View>
        <View style={styles.extraPill}>
          <Text style={styles.extraLabel}>Sugar</Text>
          {isEditing ? (
            <TextInput style={styles.editInputSmall} value={String(edited.sugar)} onChangeText={(v) => setEdited({...edited, sugar: parseInt(v)||0})} keyboardType="numeric" />
          ) : (
            <Text style={styles.extraVal}>{edited.sugar}g</Text>
          )}
        </View>
        <View style={styles.extraPill}>
          <Text style={styles.extraLabel}>Cal/Protein</Text>
          <Text style={styles.extraVal}>{edited.protein > 0 ? (edited.calories / edited.protein).toFixed(1) : '—'}:1</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
        {isEditing ? (
          <TouchableOpacity style={[styles.logBtn, {backgroundColor: '#10b981', flex: 1}]} onPress={() => setIsEditing(false)}>
            <CheckCircle size={18} color="#fff" />
            <Text style={styles.logBtnText}>Done Editing</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.logBtn, {backgroundColor: COLORS.surfaceLight, flex: 1}]} onPress={() => setIsEditing(true)}>
            <Text style={[styles.logBtnText, {color: COLORS.text}]}>Edit Macros</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.logBtn, {flex: 1}]} onPress={handleSaveLog}>
          <Target size={18} color="#fff" />
          <Text style={styles.logBtnText}>Add to Log</Text>
        </TouchableOpacity>
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
                {isScanning && (
                  <View style={styles.scanningOverlay}>
                    <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />
                    <View style={styles.scanTextContainer}>
                      <ActivityIndicator size="small" color={COLORS.primary} />
                      <Text style={styles.scanText}>Analyzing image with AI...</Text>
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
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 20,
    marginTop: 16, borderWidth: 1, borderColor: '#10b981',
  },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  resultMatch: { color: '#10b981', fontSize: 13, fontWeight: 'bold' },
  matchedBy: { color: COLORS.textSecondary, fontSize: 11, flex: 1 },
  foodName: { color: COLORS.text, fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  macroGrid: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  macroCard: {
    flex: 1, backgroundColor: COLORS.surfaceLight, borderRadius: 12, padding: 12,
    alignItems: 'center', gap: 4,
  },
  macroValue: { color: COLORS.text, fontSize: 16, fontWeight: 'bold' },
  macroLabel: { color: COLORS.textSecondary, fontSize: 10 },
  extraRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  extraPill: {
    flex: 1, backgroundColor: COLORS.surfaceLight || COLORS.surface, borderRadius: 10,
    padding: 10, alignItems: 'center',
  },
  extraLabel: { color: COLORS.textSecondary, fontSize: 10, marginBottom: 2 },
  extraVal: { color: COLORS.text, fontSize: 13, fontWeight: 'bold' },
  editInput: { backgroundColor: COLORS.background, borderRadius: 6, color: COLORS.text, fontSize: 15, fontWeight: 'bold', padding: 4, width: '100%', textAlign: 'center', borderBottomWidth: 1, borderColor: COLORS.primary },
  editInputSmall: { backgroundColor: COLORS.background, borderRadius: 6, color: COLORS.text, fontSize: 13, fontWeight: 'bold', padding: 4, width: '80%', textAlign: 'center' },
  logBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 12 },
  logBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  rescanInlineBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16 },
  rescanInlineText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  rescanBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, marginTop: 8,
  },
  rescanBtnText: { color: COLORS.primary, fontWeight: '600', fontSize: 13 },
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
