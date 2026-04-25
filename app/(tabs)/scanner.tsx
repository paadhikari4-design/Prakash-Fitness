import React, { useState, useEffect, useRef } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { 
  StyleSheet, View, Text, TouchableOpacity, ScrollView, 
  Image, TextInput, ActivityIndicator, Alert, Dimensions,
  Platform, Share
} from 'react-native';
import { COLORS } from '@/constants/Colors';
import { 
  Camera, Upload, Search, List, Zap, ChevronLeft, 
  Plus, History, BarChart2, Star, Target, Info,
  Share2, Save, X, Scan, Sparkles
} from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import Animated, { 
  FadeInUp, FadeInRight, FadeInDown, 
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing 
} from 'react-native-reanimated';
import { useWorkout } from '../../context/WorkoutContext';
import { FOOD_DB, FoodItem } from '../../constants/NutritionData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function NutritionScanner() {
  const isFocused = useIsFocused();
  const { updateNutrition } = useWorkout();

  // On web, if not focused, don't render to prevent background bleed
  if (Platform.OS === 'web' && !isFocused) return null;

  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [tab, setTab] = useState<'scan' | 'search' | 'history' | 'planner'>('scan');
  const [portionSize, setPortionSize] = useState(1);
  const [visionMeta, setVisionMeta] = useState<string[]>([]);
  
  // Plate features
  const [plateItems, setPlateItems] = useState<any[]>([]);
  const [showPlateSummary, setShowPlateSummary] = useState(false);

  // Scan line animation
  const scanLinePos = useSharedValue(0);
  
  useEffect(() => {
    if (isCapturing) {
      scanLinePos.value = withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      scanLinePos.value = 0;
    }
  }, [isCapturing]);

  const scanLineStyle = useAnimatedStyle(() => ({
    top: `${scanLinePos.value * 100}%`,
  }));

  // HUD scan animation logic
  useEffect(() => {
    if (isCapturing && !isScanning) {
      const interval = setInterval(() => {
        const metas = ['SURFACE: 98%', 'VOLUME: ±15g', 'THERMAL: OK', 'COLOR: ANALYZING'];
        setVisionMeta(prev => {
          const next = [...prev];
          if (next.length >= 2) next.shift();
          next.push(metas[Math.floor(Math.random() * metas.length)]);
          return next;
        });
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isCapturing, isScanning]);

  const startScanning = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert('Permission needed', 'Camera access is required for scanning');
        return;
      }
    }
    setIsCapturing(true);
    setCapturedImage(null);
    setSelectedFood(null);
  };

  const takePicture = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsScanning(true);
    
    // Simulate AI Analysis
    setTimeout(() => {
      setIsScanning(false);
      setIsCapturing(false);
      const randomFood = FOOD_DB[Math.floor(Math.random() * FOOD_DB.length)];
      setSelectedFood({
        ...randomFood,
        readyMatch: Math.floor(Math.random() * 15) + 85,
        healthScore: Math.floor(Math.random() * 20) + 75
      });
      setCapturedImage('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400');
    }, 2500);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setIsScanning(true);
      setTimeout(() => {
        setIsScanning(false);
        const randomFood = FOOD_DB[Math.floor(Math.random() * FOOD_DB.length)];
        setSelectedFood({
          ...randomFood,
          readyMatch: Math.floor(Math.random() * 10) + 90,
          healthScore: Math.floor(Math.random() * 20) + 70
        });
        setCapturedImage(result.assets[0].uri);
      }, 2000);
    }
  };

  const logToPlate = () => {
    if (selectedFood) {
      const scaledFood = {
        calories: selectedFood.calories * portionSize,
        protein: selectedFood.protein * portionSize,
        carbs: selectedFood.carbs * portionSize,
        fat: selectedFood.fat * portionSize
      };
      
      updateNutrition(scaledFood);
      setPlateItems([...plateItems, { ...selectedFood, portion: portionSize }]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setSelectedFood(null);
      setCapturedImage(null);
      setShowPlateSummary(true);
    }
  };

  const handleShare = async () => {
    if (!selectedFood) return;
    try {
      await Share.share({
        message: `Nutrition for my ${selectedFood.name}: ${Math.round(selectedFood.calories * portionSize)} kcal, ${Math.round(selectedFood.protein * portionSize)}g protein! Scanned with IronPulse AI.`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const renderMacroCard = (label: string, value: number, color: string, unit: string = 'g') => (
    <View style={styles.macroCard}>
      <Text style={[styles.macroValue, { color }]}>{Math.round(value)}{unit}</Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Vision AI</Text>
          <Text style={styles.headerSubtitle}>Real-time Nutrition Scanner</Text>
        </View>
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => setTab('history')}>
          <History size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {[
          { id: 'scan', icon: Scan, label: 'Scan' },
          { id: 'search', icon: Search, label: 'Search' },
          { id: 'planner', icon: Sparkles, label: 'Planner' }
        ].map((t) => (
          <TouchableOpacity 
            key={t.id}
            style={[styles.tabItem, tab === t.id && styles.tabItemActive]}
            onPress={() => setTab(t.id as any)}
          >
            <t.icon size={18} color={tab === t.id ? COLORS.primary : COLORS.textSecondary} />
            <Text style={[styles.tabLabel, tab === t.id && styles.tabLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {tab === 'scan' && (
          <Animated.View entering={FadeInUp}>
            {isCapturing ? (
              <View style={styles.cameraWrapper}>
                {permission?.granted ? (
                  <View style={{ flex: 1 }}>
                    <CameraView style={styles.camera} facing="back">
                      <View style={styles.cameraOverlay}>
                        <View style={styles.scanFrame}>
                          <View style={[styles.corner, styles.tl]} />
                          <View style={[styles.corner, styles.tr]} />
                          <View style={[styles.corner, styles.bl]} />
                          <View style={[styles.corner, styles.br]} />
                          <Animated.View style={[styles.scanLine, scanLineStyle]} />
                        </View>
                        
                        <View style={styles.visionHUD}>
                          {visionMeta.map((m, i) => (
                            <Text key={i} style={styles.visionMetaText}>{m}</Text>
                          ))}
                        </View>
                        
                        <Text style={styles.cameraHint}>Center food in frame</Text>
                      </View>
                    </CameraView>
                    
                    <View style={styles.cameraControls}>
                      <TouchableOpacity 
                        style={styles.closeCamera} 
                        onPress={() => setIsCapturing(false)}
                      >
                        <X size={24} color="#fff" />
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.captureBtn} 
                        onPress={takePicture}
                      >
                        <View style={styles.captureBtnInner} />
                      </TouchableOpacity>
                      
                      <View style={{ width: 44 }} />
                    </View>
                  </View>
                ) : (
                  <View style={styles.noPerms}>
                    <Text style={{ color: '#fff' }}>Accessing Vision Stream...</Text>
                    <ActivityIndicator color={COLORS.primary} style={{ marginTop: 10 }} />
                  </View>
                )}
              </View>
            ) : isScanning ? (
              <View style={styles.scanningStage}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.scanningText}>Deconstructing Molecular Data...</Text>
                <View style={styles.scanningProgress}>
                  <View style={[styles.scanningBar, { width: '65%', backgroundColor: COLORS.primary }]} />
                </View>
              </View>
            ) : selectedFood ? (
              <Animated.View style={styles.resultCard} entering={FadeInDown}>
                <View style={styles.resultHeader}>
                   <View style={[styles.matchBadge, { backgroundColor: COLORS.primaryDim }]}>
                      <Text style={styles.matchText}>{selectedFood.readyMatch}% AI CONFIDENCE</Text>
                   </View>
                   <Text style={styles.matchedBy}>Neural Vision Matrix</Text>
                </View>

                {capturedImage && (
                  <Image source={{ uri: capturedImage }} style={styles.foodPreview} />
                )}

                <View style={styles.mainInfoRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.foodName}>{selectedFood.name}</Text>
                    <View style={styles.portionRow}>
                      {[0.5, 1, 1.5, 2].map(p => (
                        <TouchableOpacity 
                          key={p} 
                          style={[styles.portionBtn, portionSize === p && styles.portionBtnActive]}
                          onPress={() => setPortionSize(p)}
                        >
                          <Text style={[styles.portionBtnText, portionSize === p && styles.portionBtnTextActive]}>
                            {p}x
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  <View style={styles.healthScoreContainer}>
                    <View style={[styles.scoreCircle, { borderColor: COLORS.primary }]}>
                      <Text style={styles.scoreVal}>{selectedFood.healthScore}</Text>
                    </View>
                    <Text style={styles.scoreLabel}>VITAL SCORE</Text>
                  </View>
                </View>

                <View style={styles.macroGrid}>
                  {renderMacroCard('Calories', selectedFood.calories * portionSize, COLORS.text, ' kcal')}
                  {renderMacroCard('Protein', selectedFood.protein * portionSize, '#4ADE80')}
                  {renderMacroCard('Carbs', selectedFood.carbs * portionSize, '#60A5FA')}
                  {renderMacroCard('Fat', selectedFood.fat * portionSize, '#FACC15')}
                </View>

                <View style={styles.insightSection}>
                   <Text style={styles.insightTitle}>IronPulse AI Analysis</Text>
                   <View style={styles.insightRow}>
                      <Zap size={14} color="#F59E0B" />
                      <Text style={styles.insightText}>Metabolic Readiness: <Text style={{ color: '#F59E0B', fontWeight: 'bold' }}>EXCELLENT</Text></Text>
                   </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                  <TouchableOpacity style={[styles.logFullBtn, { flex: 1, backgroundColor: COLORS.primary }]} onPress={logToPlate}>
                    <Plus size={20} color="#fff" />
                    <Text style={styles.logFullText}>Log to Journal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                    <Share2 size={20} color={COLORS.text} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                   style={styles.rescanBtn} 
                   onPress={() => {
                     setSelectedFood(null);
                     setCapturedImage(null);
                     startScanning();
                   }}
                >
                  <Scan size={16} color={COLORS.primary} />
                  <Text style={styles.rescanBtnText}>Scan Something Else</Text>
                </TouchableOpacity>
              </Animated.View>
            ) : (
              <View style={styles.scannerHero}>
                <View style={styles.scanTarget}>
                  <Camera size={60} color={COLORS.primary} strokeWidth={1.5} />
                  <Text style={styles.scanTargetTitle}>Vision Capture</Text>
                  <Text style={styles.scanTargetText}>Point AI at your meal for instant nutrient breakdown</Text>
                </View>
                
                <View style={styles.actionGrid}>
                  <TouchableOpacity style={[styles.actionCard, { borderColor: COLORS.primary, borderWidth: 2 }]} onPress={startScanning}>
                    <View style={[styles.actionIcon, { backgroundColor: COLORS.primaryDim }]}>
                      <Camera size={24} color={COLORS.primary} />
                    </View>
                    <Text style={styles.actionTitle}>Open AI Lens</Text>
                    <Text style={styles.actionSub}>Live identification</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionCard} onPress={pickImage}>
                    <View style={[styles.actionIcon, { backgroundColor: 'rgba(168, 85, 247, 0.1)' }]}>
                      <Upload size={24} color="#A855F7" />
                    </View>
                    <Text style={styles.actionTitle}>Import Data</Text>
                    <Text style={styles.actionSub}>From library</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.tipCard}>
                  <Info size={18} color={COLORS.primary} />
                  <Text style={styles.tipText}>Tip: Use natural lighting for 99.8% precision identification.</Text>
                </View>
              </View>
            )}

            {plateItems.length > 0 && showPlateSummary && !isCapturing && (
               <View style={styles.plateSummary}>
                 <View style={styles.plateHeader}>
                    <Text style={styles.plateTitle}>Active Session Log</Text>
                    <TouchableOpacity onPress={() => { setPlateItems([]); setShowPlateSummary(false); }}>
                      <X size={16} color="#F87171" />
                    </TouchableOpacity>
                 </View>
                 <ScrollView horizontal style={styles.plateScroll}>
                    {plateItems.map((item, i) => (
                      <View key={i} style={styles.platePill}>
                        <Text style={styles.platePillText}>{item.name}</Text>
                      </View>
                    ))}
                 </ScrollView>
               </View>
            )}
          </Animated.View>
        )}

        {tab === 'search' && (
          <View style={styles.searchSection}>
            <View style={styles.searchRow}>
              <TextInput 
                style={styles.searchInput}
                placeholder="Search food database..."
                placeholderTextColor={COLORS.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity style={styles.searchBtn}>
                <Search size={20} color={COLORS.background} />
              </TouchableOpacity>
            </View>

            {searchQuery.length > 0 && (
              <View style={styles.resultsContainer}>
                {FOOD_DB.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).map(food => (
                  <TouchableOpacity 
                    key={food.name} 
                    style={styles.searchResultItem}
                    onPress={() => {
                      setSelectedFood({...food, readyMatch: 100, healthScore: 85});
                      setTab('scan');
                    }}
                  >
                    <View>
                      <Text style={styles.searchResultName}>{food.name}</Text>
                      <Text style={styles.searchResultMacros}>
                        {food.calories} kcal | P: {food.protein}g | C: {food.carbs}g
                      </Text>
                    </View>
                    <Plus size={18} color={COLORS.primary} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {tab === 'planner' && (
          <View style={styles.plannerWrapper}>
            <View style={styles.premiumBox}>
               <Sparkles size={30} color={COLORS.primary} />
               <Text style={styles.premiumTitle}>AI Nutrition Planner</Text>
               <Text style={styles.premiumText}>Your personalized metabolic roadmap is being generated based on your scan history.</Text>
               <TouchableOpacity style={styles.premiumBtn}>
                 <Text style={styles.premiumBtnText}>View My Strategy</Text>
               </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  headerSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  headerIconBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surface,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border
  },
  tabContainer: {
    flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20, gap: 12
  },
  tabItem: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12, borderRadius: 12, backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border
  },
  tabItemActive: { backgroundColor: COLORS.primaryDim, borderColor: COLORS.primary },
  tabLabel: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
  tabLabelActive: { color: COLORS.primary },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  scannerHero: { gap: 20 },
  scanTarget: {
    backgroundColor: COLORS.surface, borderRadius: 24, padding: 30, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed'
  },
  scanTargetTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginTop: 16, marginBottom: 8 },
  scanTargetText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
  actionGrid: { flexDirection: 'row', gap: 16 },
  actionCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: COLORS.border
  },
  actionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  actionTitle: { fontSize: 15, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  actionSub: { fontSize: 11, color: COLORS.textSecondary },
  tipCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.surface,
    padding: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border
  },
  tipText: { flex: 1, fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },
  cameraWrapper: { height: 450, borderRadius: 24, overflow: 'hidden', backgroundColor: '#000' },
  camera: { flex: 1 },
  cameraOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  scanFrame: { width: 220, height: 220, position: 'relative' },
  corner: { position: 'absolute', width: 25, height: 25, borderColor: COLORS.primary },
  tl: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 },
  tr: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 },
  br: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 },
  scanLine: {
    position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary, shadowOpacity: 1, shadowRadius: 10, elevation: 5
  },
  visionHUD: { position: 'absolute', top: 20, left: 20 },
  visionMetaText: { color: COLORS.primary, fontSize: 8, fontWeight: 'bold', fontStyle: 'italic', marginBottom: 2 },
  cameraHint: { color: '#fff', marginTop: 30, fontSize: 14, fontWeight: '600' },
  cameraControls: {
    position: 'absolute', bottom: 30, left: 20, right: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
  },
  closeCamera: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  captureBtn: { width: 70, height: 70, borderRadius: 35, borderWidth: 4, borderColor: '#fff', padding: 4, justifyContent: 'center', alignItems: 'center' },
  captureBtnInner: { width: '100%', height: '100%', borderRadius: 30, backgroundColor: '#fff' },
  noPerms: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scanningStage: {
    height: 400, justifyContent: 'center', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 24, padding: 40
  },
  scanningText: { color: COLORS.text, fontSize: 16, fontWeight: '600', marginTop: 20, marginBottom: 12 },
  scanningProgress: { width: '100%', height: 4, backgroundColor: COLORS.border, borderRadius: 2 },
  scanningBar: { height: '100%' },
  resultCard: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: COLORS.border },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  matchBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  matchText: { color: COLORS.primary, fontSize: 10, fontWeight: 'bold' },
  matchedBy: { color: COLORS.textSecondary, fontSize: 11 },
  foodPreview: { width: '100%', height: 180, borderRadius: 16, marginBottom: 20 },
  mainInfoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  foodName: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  portionRow: { flexDirection: 'row', gap: 6 },
  portionBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: COLORS.background },
  portionBtnActive: { backgroundColor: COLORS.primary },
  portionBtnText: { fontSize: 12, color: COLORS.textSecondary },
  portionBtnTextActive: { color: '#fff', fontWeight: 'bold' },
  healthScoreContainer: { alignItems: 'center' },
  scoreCircle: {
    width: 50, height: 50, borderRadius: 25, borderWidth: 3,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4
  },
  scoreVal: { color: COLORS.text, fontWeight: 'bold', fontSize: 18 },
  scoreLabel: { fontSize: 8, color: COLORS.textSecondary, fontWeight: 'bold' },
  macroGrid: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  macroCard: { flex: 1, backgroundColor: COLORS.background, padding: 12, borderRadius: 16, alignItems: 'center' },
  macroValue: { fontSize: 16, fontWeight: 'bold' },
  macroLabel: { fontSize: 10, color: COLORS.textSecondary, marginTop: 2 },
  insightSection: { backgroundColor: COLORS.background, padding: 12, borderRadius: 12, marginBottom: 15 },
  insightTitle: { fontSize: 12, fontWeight: 'bold', color: COLORS.text, marginBottom: 6 },
  insightRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  insightText: { fontSize: 12, color: COLORS.textSecondary },
  logFullBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 15, gap: 10
  },
  logFullText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  shareBtn: {
    width: 50, height: 50, borderRadius: 15, backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center'
  },
  rescanBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginTop: 15, paddingVertical: 10
  },
  rescanBtnText: { color: COLORS.primary, fontSize: 13, fontWeight: 'bold' },
  plateSummary: { backgroundColor: COLORS.surface, padding: 15, borderRadius: 20, marginTop: 20, borderWidth: 1, borderColor: COLORS.primary },
  plateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  plateTitle: { color: COLORS.primary, fontWeight: 'bold', fontSize: 14 },
  plateScroll: { flexDirection: 'row' },
  platePill: { backgroundColor: COLORS.primaryDim, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 50, marginRight: 8 },
  platePillText: { color: COLORS.primary, fontSize: 11, fontWeight: 'bold' },
  searchSection: { gap: 15 },
  searchRow: { flexDirection: 'row', gap: 10 },
  searchInput: {
    flex: 1, height: 50, backgroundColor: COLORS.surface, borderRadius: 15,
    paddingHorizontal: 15, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border
  },
  searchBtn: {
    width: 50, height: 50, borderRadius: 15, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center'
  },
  resultsContainer: { gap: 10 },
  searchResultItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.surface, padding: 15, borderRadius: 15,
    borderWidth: 1, borderColor: COLORS.border
  },
  searchResultName: { color: COLORS.text, fontWeight: 'bold', fontSize: 15 },
  searchResultMacros: { color: COLORS.textSecondary, fontSize: 12, marginTop: 4 },
  plannerWrapper: { paddingVertical: 20 },
  premiumBox: {
    backgroundColor: COLORS.surface, borderRadius: 30, padding: 30,
    alignItems: 'center', gap: 15, borderWidth: 1, borderColor: COLORS.border
  },
  premiumTitle: { color: COLORS.text, fontSize: 20, fontWeight: 'bold' },
  premiumText: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  premiumBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 30, paddingVertical: 15, borderRadius: 50 },
  premiumBtnText: { color: '#fff', fontWeight: 'bold' },
});
