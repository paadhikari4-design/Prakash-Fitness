import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '@/constants/Colors';
import { Play, History, Timer as TimerIcon, Dumbbell, ChevronRight, TrendingUp, User, Activity, Sparkles, Droplets, Moon, Footprints, AlertTriangle, Zap, Utensils } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useWorkout } from '@/context/WorkoutContext';
import { EXERCISE_DATA } from './library';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

export default function DashboardScreen() {
  const router = useRouter();
  const { 
    history, exercises, workoutTime, timeLeft, isTimerActive, bodyEntries, userProfile, getAIGuidance 
  } = useWorkout();

  // ── Habit Tracker State ──────────────────────────────────────────
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [sleepHours, setSleepHours] = useState(0);
  const [steps, setSteps] = useState(0);

  // ── Overtraining / Health Risk Detection ─────────────────────────
  const detectOvertraining = () => {
    if (history.length < 4) return null;
    // Check if last 4 workouts were logged within 4 consecutive days
    const recentDates = history.slice(0, 5).map(h => h.date);
    const highVolumeDays = history
      .slice(0, 5)
      .filter(h => (parseInt((h.volume || '').replace(/[^0-9]/g, '')) || 0) > 8000);
    if (highVolumeDays.length >= 4) {
      return 'Overtraining Detected: You have logged 4+ high-volume sessions without rest. CNS fatigue risk is high. Take a rest day today.';
    }
    if (history.length >= 5) {
      return 'High Training Load: You have trained 5+ sessions this week. Consider active recovery or deload to prevent injury.';
    }
    return null;
  };
  const healthAlert = detectOvertraining();

  // ── Readiness Score ───────────────────────────────────────────────
  const calculateReadiness = () => {
    let trainingScore = 60;
    const recentLogs = history.slice(0, 5).map(h => h.date);
    const uniqueDays = new Set(recentLogs);
    if (uniqueDays.size >= 4) trainingScore = 20; // Overtraining risk
    else if (uniqueDays.size === 3) trainingScore = 40; // Moderate fatigue
    
    const sleepFactor = Math.min(sleepHours, 8) / 8; 
    const waterFactor = Math.min(waterGlasses, 8) / 8; 
    
    return Math.round(trainingScore + (sleepFactor * 20) + (waterFactor * 20) || 50); // Fallback to 50
  };
  
  const readinessScore = calculateReadiness();
  let readinessColor = '#10b981'; // green/optimal
  let readinessText = 'Optimal to Train';
  if (readinessScore < 70) { readinessColor = '#f59e0b'; readinessText = 'Moderate Fatigue'; }
  if (readinessScore < 50) { readinessColor = '#ef4444'; readinessText = 'High CNS Fatigue. Consider Rest.'; }

  const Widget = ({ title, icon, value, subtext, onPress, primary = false }: any) => {
    const handlePress = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    };

    if (primary) {
      return (
        <TouchableOpacity 
          style={{ width: '47%' }} 
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <LinearGradient 
            colors={['#8b5cf6', '#6d28d9']} 
            style={[styles.widget, { width: '100%', borderColor: 'transparent' }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.widgetHeader}>
              <View style={[styles.iconContainer, styles.iconContainerPrimary]}>
                {icon}
              </View>
              <ChevronRight size={20} color={COLORS.background} />
            </View>
            <View style={styles.widgetBody}>
              <Text style={[styles.widgetValue, { color: COLORS.background }]}>{value}</Text>
              <Text style={[styles.widgetSubtext, { color: 'rgba(255,255,255,0.7)' }]}>{subtext}</Text>
            </View>
            <Text style={[styles.widgetTitle, { color: COLORS.background }]}>{title}</Text>
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity 
        style={styles.widget} 
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.widgetHeader}>
          <View style={styles.iconContainer}>
            {icon}
          </View>
          <ChevronRight size={20} color={COLORS.textSecondary} />
        </View>
        <View style={styles.widgetBody}>
          <Text style={styles.widgetValue}>{value}</Text>
          <Text style={styles.widgetSubtext}>{subtext}</Text>
        </View>
        <Text style={styles.widgetTitle}>{title}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.brandRow}>
        <Activity size={20} color={COLORS.primary} strokeWidth={3} />
        <Text style={styles.brandName}>PRAKASH FITNESS</Text>
      </View>

      <View style={styles.topHeader}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.username}>{userProfile?.displayName || 'Athlete'} 👋</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileBtn} 
          onPress={() => router.push('/profile-modal')}
        >
          <User size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Readiness Score Card */}
      <View style={[styles.readinessCard, { borderColor: readinessColor }]}>
        <View style={styles.readinessHeader}>
          <Zap size={20} color={readinessColor} fill={readinessColor} />
          <Text style={[styles.readinessTitle, { color: readinessColor }]}>Daily Readiness Score</Text>
        </View>
        <View style={styles.readinessBody}>
          <Text style={styles.readinessValue}>{readinessScore}%</Text>
          <Text style={styles.readinessSubtext}>{readinessText}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={{ marginBottom: 24 }} 
        activeOpacity={0.8}
        onPress={() => router.push('/ai-generator-modal')}
      >
        <LinearGradient 
          colors={['#8b5cf6', '#6d28d9']} 
          style={styles.aiGeneratorBtn}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.aiGeneratorContent}>
            <Sparkles size={24} color={COLORS.background} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.aiGeneratorTitle}>Generate AI Routine</Text>
              <Text style={styles.aiGeneratorSub}>Adaptive workout based on fatigue</Text>
            </View>
            <ChevronRight size={20} color={'rgba(255,255,255,0.7)'} />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* AI Nutrition Scanner */}
      <TouchableOpacity 
        style={{ marginBottom: 24 }} 
        activeOpacity={0.8}
        onPress={() => router.push('/modal')}
      >
        <LinearGradient 
          colors={['#10b981', '#059669']} 
          style={styles.aiGeneratorBtn}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.aiGeneratorContent}>
            <Activity size={24} color={COLORS.background} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.aiGeneratorTitle}>AI Nutrition Scanner</Text>
              <Text style={styles.aiGeneratorSub}>Upload food for macro estimation</Text>
            </View>
            <ChevronRight size={20} color={'rgba(255,255,255,0.7)'} />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      
      <View style={styles.grid}>
        <Widget 
          title="Active Workout"
          icon={<Play size={24} color={exercises.length > 0 ? COLORS.background : COLORS.primary} />}
          value={exercises.length > 0 ? (exercises[0]?.name || "Custom Workout") : "Ready to Train"}
          subtext={exercises.length > 0 ? `Running • ${Math.floor(workoutTime / 60)}m` : "Tap to start track"}
          primary={exercises.length > 0}
          onPress={() => router.push('/track')}
        />
        <Widget 
          title="Recent History"
          icon={<History size={24} color={COLORS.primary} />}
          value={history.length > 0 ? history[0].title : "No Workouts"}
          subtext={history.length > 0 ? `${history[0].date.split(',')[0]} • ${history[0].duration}` : "Log your first session"}
          onPress={() => router.push('/history')}
        />
        <Widget 
          title="Quick Timer"
          icon={<TimerIcon size={24} color={COLORS.primary} />}
          value={`${Math.floor(timeLeft / 60).toString().padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`}
          subtext={isTimerActive ? "Running..." : "Tap to set timer"}
          onPress={() => router.push('/timer')}
        />
        <Widget 
          title="Exercise Library"
          icon={<Dumbbell size={24} color={COLORS.primary} />}
          value={`${EXERCISE_DATA.length} Moves`}
          subtext="Comprehensive DB"
          onPress={() => router.push('/library')}
        />
      </View>

      {/* Personal Progress Widget - Full Width */}
      <TouchableOpacity 
        style={styles.progressWidget}
        activeOpacity={0.8}
        onPress={() => router.push('/progress-modal')}
      >
        <View style={styles.progressWidgetHeader}>
          <View style={styles.progressIconWrap}>
            <TrendingUp size={22} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.progressWidgetTitle}>Personal Progress</Text>
            <Text style={styles.progressWidgetSub}>
              {bodyEntries.length > 0 
                ? `${bodyEntries.length} entries • Last: ${bodyEntries[0].date}` 
                : 'Track weight, temp, photos & analytics'}
            </Text>
          </View>
          <ChevronRight size={20} color={COLORS.textSecondary} />
        </View>
        {bodyEntries.length > 0 && bodyEntries[0].weight && (
          <View style={styles.progressPreview}>
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>{bodyEntries[0].weight}</Text>
              <Text style={styles.progressStatLabel}>lbs</Text>
            </View>
            {bodyEntries.length > 1 && bodyEntries[1].weight && (
              <View style={styles.progressDelta}>
                <Text style={{ 
                  color: (bodyEntries[0].weight! - bodyEntries[1].weight!) > 0 ? '#ff6b6b' : COLORS.primary, 
                  fontSize: 13, fontWeight: '700' 
                }}>
                  {(bodyEntries[0].weight! - bodyEntries[1].weight!) > 0 ? '▲' : '▼'}
                  {Math.abs(bodyEntries[0].weight! - bodyEntries[1].weight!).toFixed(1)} lbs
                </Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>

      {/* ── Health Risk Alert ────────────────────────────────────────── */}
      {healthAlert && (
        <View style={styles.healthAlertBanner}>
          <AlertTriangle size={20} color="#ef4444" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.healthAlertTitle}>⚠️ Health Risk Alert</Text>
            <Text style={styles.healthAlertText}>{healthAlert}</Text>
          </View>
        </View>
      )}
      {/* ── Daily Nutrition Summary ─────────────────────────────────── */}
      <TouchableOpacity 
        style={styles.nutritionCard}
        activeOpacity={0.8}
        onPress={() => router.push('/modal')}
      >
        <LinearGradient
          colors={['rgba(16, 185, 129, 0.1)', 'rgba(5, 150, 105, 0.05)']}
          style={styles.nutritionCardInner}
        >
          <View style={styles.nutritionHeader}>
            <View style={styles.nutritionIconBox}>
              <Utensils size={20} color="#10b981" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.nutritionTitle}>Daily Nutrition</Text>
              <Text style={styles.nutritionSub}>1,840 / 2,500 kcal consumed</Text>
            </View>
            <ChevronRight size={18} color={COLORS.textSecondary} />
          </View>
          
          <View style={styles.macroRowSmall}>
            <View style={styles.macroPillSmall}>
              <Text style={[styles.macroPillLabel, { color: '#ef4444' }]}>P</Text>
              <Text style={styles.macroPillValue}>145g</Text>
            </View>
            <View style={styles.macroPillSmall}>
              <Text style={[styles.macroPillLabel, { color: '#f59e0b' }]}>C</Text>
              <Text style={styles.macroPillValue}>210g</Text>
            </View>
            <View style={styles.macroPillSmall}>
              <Text style={[styles.macroPillLabel, { color: '#10b981' }]}>F</Text>
              <Text style={styles.macroPillValue}>52g</Text>
            </View>
          </View>

          <View style={styles.nutritionProgressBg}>
            <View style={[styles.nutritionProgressFill, { width: '73.6%' }]} />
          </View>
        </LinearGradient>
      </TouchableOpacity>

    <View style={styles.section}>
        <View style={styles.habitHeader}>
          <Text style={styles.sectionTitle}>Today's Recovery</Text>
          <View style={styles.habitScoreBadge}>
            <Text style={styles.habitScoreText}>{readinessScore}% Score</Text>
          </View>
        </View>

        <View style={styles.habitGrid}>
          {/* Water */}
          <View style={styles.habitCard}>
            <Droplets size={22} color="#3b82f6" />
            <Text style={styles.habitValue}>{waterGlasses}/8</Text>
            <Text style={styles.habitLabel}>Glasses</Text>
            <View style={styles.habitBtns}>
              <TouchableOpacity style={styles.habitBtn}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setWaterGlasses(Math.max(0, waterGlasses - 1)); }}>
                <Text style={styles.habitBtnText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.habitBtn, styles.habitBtnAdd]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setWaterGlasses(Math.min(8, waterGlasses + 1)); }}>
                <Text style={[styles.habitBtnText, { color: COLORS.background }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sleep */}
          <View style={styles.habitCard}>
            <Moon size={22} color="#8b5cf6" />
            <Text style={styles.habitValue}>{sleepHours}h</Text>
            <Text style={styles.habitLabel}>Sleep</Text>
            <View style={styles.habitBtns}>
              <TouchableOpacity style={styles.habitBtn}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSleepHours(Math.max(0, sleepHours - 1)); }}>
                <Text style={styles.habitBtnText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.habitBtn, styles.habitBtnAdd]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSleepHours(Math.min(12, sleepHours + 1)); }}>
                <Text style={[styles.habitBtnText, { color: COLORS.background }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Steps */}
          <View style={styles.habitCard}>
            <Footprints size={22} color="#10b981" />
            <Text style={styles.habitValue}>{(steps / 1000).toFixed(1)}k</Text>
            <Text style={styles.habitLabel}>Steps</Text>
            <View style={styles.habitBtns}>
              <TouchableOpacity style={styles.habitBtn}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSteps(Math.max(0, steps - 1000)); }}>
                <Text style={styles.habitBtnText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.habitBtn, styles.habitBtnAdd]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSteps(Math.min(20000, steps + 1000)); }}>
                <Text style={[styles.habitBtnText, { color: COLORS.background }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Habit Tip */}
        <View style={styles.habitTip}>
          <Text style={styles.habitTipText}>
            {readinessScore >= 80 ? '🌟 Excellent recovery day! Your body is primed for tomorrow.' :
              readinessScore >= 50 ? '💧 Drink more water and aim for 8h sleep to boost your recovery.' :
                '📈 Track water, sleep and rest daily to improve your readiness score.'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weekly Goal</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{Math.min(history.length, 5)} / 5 Workouts</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min(history.length / 5 * 100, 100)}%` as any }]} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  greeting: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  username: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    marginTop: 8,
  },
  brandName: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  aiCard: {
    backgroundColor: 'rgba(110, 89, 255, 0.1)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(110, 89, 255, 0.2)',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  aiTitle: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  aiReason: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  aiRecommendationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  aiRecLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  aiRecValue: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  nutritionCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  nutritionCardInner: {
    padding: 16,
  },
  nutritionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  nutritionIconBox: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nutritionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  nutritionSub: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  macroRowSmall: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  macroPillSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  macroPillLabel: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  macroPillValue: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  nutritionProgressBg: {
    height: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  nutritionProgressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  aiStartBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  aiStartText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 13,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  readinessCard: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderLeftWidth: 4,
    marginBottom: 24,
  },
  readinessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  readinessTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  readinessBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  readinessValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  readinessSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  profileBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  widget: {
    width: '47%',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  widgetPrimary: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerPrimary: {
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  widgetBody: {
    marginBottom: 12,
  },
  widgetValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  widgetSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  widgetTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  // Progress Widget
  progressWidget: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  progressWidgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  progressIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressWidgetTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressWidgetSub: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  aiGeneratorBtn: {
    borderRadius: 20,
    marginTop: 8,
  },
  aiGeneratorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  aiGeneratorTitle: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  aiGeneratorSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  progressPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  progressStat: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  progressStatValue: {
    color: COLORS.primary,
    fontSize: 28,
    fontWeight: 'bold',
  },
  progressStatLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  progressDelta: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  // Health Alert
  healthAlertBanner: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: 'rgba(239,68,68,0.12)', borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: '#ef4444', marginBottom: 20,
  },
  healthAlertTitle: { color: '#ef4444', fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  healthAlertText: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 18 },
  // Habit Tracker
  habitHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  habitScoreBadge: {
    backgroundColor: COLORS.primaryDim, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20,
  },
  habitScoreText: { color: COLORS.primary, fontSize: 12, fontWeight: 'bold' },
  habitGrid: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  habitCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 16, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, gap: 6,
  },
  habitValue: { color: COLORS.text, fontSize: 18, fontWeight: 'bold' },
  habitLabel: { color: COLORS.textSecondary, fontSize: 11 },
  habitBtns: { flexDirection: 'row', gap: 6, marginTop: 4 },
  habitBtn: {
    width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.surfaceLight, borderWidth: 1, borderColor: COLORS.border,
  },
  habitBtnAdd: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  habitBtnText: { color: COLORS.text, fontSize: 16, fontWeight: 'bold', lineHeight: 20 },
  habitTip: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  habitTipText: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 20 },
});
