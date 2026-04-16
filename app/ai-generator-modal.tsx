import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, ActivityIndicator } from 'react-native';
import { COLORS } from '@/constants/Colors';
import { Sparkles, X, Activity, Droplets, Flame, BrainCircuit } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { EXERCISE_DATA } from '@/app/(tabs)/library';
import { useWorkout, Exercise } from '@/context/WorkoutContext';

export default function AIGeneratorModal() {
  const router = useRouter();
  const { setExercises, setWorkoutTime } = useWorkout();

  const [fatigue, setFatigue] = useState(5);
  const [goal, setGoal] = useState<'Hypertrophy' | 'Fat Loss' | 'Strength'>('Hypertrophy');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateWorkout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsGenerating(true);

    // Simulate AI generation time
    setTimeout(() => {
      let selectedExercises: any[] = [];

      // Basic AI Logic based on Fatigue and Goal
      if (fatigue > 7) {
        // High fatigue: easy machines, isolation, low volume
        selectedExercises = EXERCISE_DATA.filter(e => e.target !== 'Legs' && e.target !== 'Back').slice(0, 3);
      } else {
        // Low fatigue: Compound movements based on goal
        if (goal === 'Strength') {
          selectedExercises = EXERCISE_DATA.filter(e => ['Barbell Bench Press', 'Barbell Squat', 'Barbell Deadlift', 'Pull Up'].includes(e.name));
        } else if (goal === 'Fat Loss') {
          selectedExercises = EXERCISE_DATA.filter(e => ['Kettlebell Swing', 'Walking Lunge', 'Dumbbell Romanian Deadlift'].includes(e.name) || e.target === 'Core');
        } else {
          selectedExercises = EXERCISE_DATA.slice(Math.floor(Math.random() * 5), Math.floor(Math.random() * 5) + 4);
        }
      }

      // Ensure we have something
      if (selectedExercises.length === 0) selectedExercises = EXERCISE_DATA.slice(0, 4);

      // Convert to WorkoutContext format
      const generatedWorkout: Exercise[] = selectedExercises.map(ex => ({
        id: Math.random().toString(),
        name: ex.name,
        sets: [
          { id: Math.random().toString(), reps: goal === 'Strength' ? "5" : goal === 'Fat Loss' ? "15" : "10", weight: "0", done: false },
          { id: Math.random().toString(), reps: goal === 'Strength' ? "5" : goal === 'Fat Loss' ? "15" : "10", weight: "0", done: false },
          { id: Math.random().toString(), reps: goal === 'Strength' ? "5" : goal === 'Fat Loss' ? "15" : "10", weight: "0", done: false }
        ]
      }));

      setIsGenerating(false);
      setExercises(generatedWorkout);
      setWorkoutTime(0);
      router.back();
      router.push('/track');
    }, 1500);
  };

  const FatigueOption = ({ level, label, icon }: any) => {
    const isSelected = fatigue === level;
    return (
      <TouchableOpacity
        style={[styles.fatigueOption, isSelected && styles.fatigueOptionSelected]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setFatigue(level);
        }}
        activeOpacity={0.7}
      >
        {icon}
        <Text style={[styles.fatigueLabel, isSelected && styles.fatigueLabelSelected]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const GoalOption = ({ currentGoal, label }: any) => {
    const isSelected = goal === currentGoal;
    return (
      <TouchableOpacity
        style={[styles.goalOption, isSelected && styles.goalOptionSelected]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setGoal(currentGoal);
        }}
        activeOpacity={0.7}
      >
        <Text style={[styles.goalLabel, isSelected && styles.goalLabelSelected]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <BrainCircuit color={COLORS.primary} size={24} />
          <Text style={styles.title}>AI Algorithm</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <X color={COLORS.textSecondary} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {isGenerating ? (
          <View style={styles.generatingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginBottom: 20 }} />
            <Text style={styles.generatingTitle}>Analyzing bio-feedback...</Text>
            <Text style={styles.generatingSub}>Constructing optimal routine</Text>
          </View>
        ) : (
          <>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.1)', 'rgba(110, 89, 255, 0.05)']}
              style={styles.banner}
            >
              <Text style={styles.bannerText}>
                Let the AI build today's routine based on your current physical state.
              </Text>
            </LinearGradient>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Current Fatigue Level</Text>
              <View style={styles.fatigueRow}>
                <FatigueOption level={3} label="Fresh" icon={<Sparkles size={20} color={fatigue === 3 ? COLORS.background : COLORS.primary} />} />
                <FatigueOption level={5} label="Normal" icon={<Activity size={20} color={fatigue === 5 ? COLORS.background : '#4ADE80'} />} />
                <FatigueOption level={8} label="Exhausted" icon={<Droplets size={20} color={fatigue === 8 ? COLORS.background : '#F87171'} />} />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Primary Goal</Text>
              <View style={styles.goalRow}>
                <GoalOption currentGoal="Hypertrophy" label="Muscle Gain" />
                <GoalOption currentGoal="Strength" label="Raw Strength" />
                <GoalOption currentGoal="Fat Loss" label="Fat Loss" />
              </View>
            </View>

            <TouchableOpacity
              style={styles.generateBtn}
              onPress={generateWorkout}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#8b5cf6', '#6d28d9']}
                style={styles.generateBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Sparkles size={20} color={COLORS.background} />
                <Text style={styles.generateBtnText}>Generate Custom Workout</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  banner: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    marginBottom: 24,
  },
  bannerText: {
    color: COLORS.primary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  fatigueRow: {
    flexDirection: 'row',
    gap: 12,
  },
  fatigueOption: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  fatigueOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  fatigueLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  fatigueLabelSelected: {
    color: COLORS.background,
  },
  goalRow: {
    flexDirection: 'column',
    gap: 12,
  },
  goalOption: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  goalOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  goalLabel: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  goalLabelSelected: {
    color: COLORS.primary,
  },
  generateBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 20,
  },
  generateBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
  },
  generateBtnText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  generatingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  generatingTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  generatingSub: {
    color: COLORS.textSecondary,
    fontSize: 14,
  }
});
