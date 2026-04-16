import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '@/constants/Colors';
import { PieChart, Utensils, Droplets, Flame, ChevronRight, Plus, Apple, Wheat, Beef } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function NutritionModal() {
  const [waterCups, setWaterCups] = useState(5);
  const calorieGoal = 2500;
  const caloriesConsumed = 1840;
  
  const macros = [
    { label: 'Protein', value: 145, goal: 180, color: '#ef4444', icon: Beef },
    { label: 'Carbs', value: 210, goal: 280, color: '#f59e0b', icon: Wheat },
    { label: 'Fats', value: 52, goal: 70, color: '#10b981', icon: Apple },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Daily Summary Header */}
        <LinearGradient
          colors={[COLORS.primary, '#6d28d9']}
          style={styles.headerCard}
        >
          <View style={styles.headerInfo}>
            <View>
              <Text style={styles.headerTitle}>Daily Nutrition</Text>
              <Text style={styles.headerSubtitle}>Thursday, April 16</Text>
            </View>
            <View style={styles.calBadge}>
              <Flame size={16} color="#fff" />
              <Text style={styles.calBadgeText}>Active</Text>
            </View>
          </View>

          <View style={styles.calMainRow}>
            <View style={styles.calCentral}>
              <Text style={styles.calValue}>{calorieGoal - caloriesConsumed}</Text>
              <Text style={styles.calLabel}>kcal left</Text>
            </View>
            <View style={styles.calStats}>
              <View style={styles.smallStat}>
                <Text style={styles.smallStatValue}>{caloriesConsumed}</Text>
                <Text style={styles.smallStatLabel}>Eaten</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.smallStat}>
                <Text style={styles.smallStatValue}>420</Text>
                <Text style={styles.smallStatLabel}>Burned</Text>
              </View>
            </View>
          </View>

          {/* Calorie Progress Bar */}
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${(caloriesConsumed / calorieGoal) * 100}%` }]} />
          </View>
        </LinearGradient>

        {/* Macro Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Macros</Text>
          <TouchableOpacity>
            <Text style={styles.editBtn}>Adjust Goals</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.macroGrid}>
          {macros.map((macro) => (
            <View key={macro.label} style={styles.macroCard}>
              <View style={[styles.macroIcon, { backgroundColor: macro.color + '20' }]}>
                <macro.icon size={20} color={macro.color} />
              </View>
              <Text style={styles.macroLabel}>{macro.label}</Text>
              <Text style={styles.macroValue}>{macro.value}g</Text>
              <View style={styles.macroProgressBg}>
                <View style={[styles.macroProgressFill, { width: `${(macro.value / macro.goal) * 100}%`, backgroundColor: macro.color }]} />
              </View>
              <Text style={styles.macroGoal}>Goal: {macro.goal}g</Text>
            </View>
          ))}
        </View>

        {/* Water Tracker */}
        <View style={styles.waterCard}>
          <View style={styles.waterInfo}>
            <View style={styles.waterIconBox}>
              <Droplets size={24} color="#3b82f6" />
            </View>
            <View>
              <Text style={styles.waterTitle}>Water Intake</Text>
              <Text style={styles.waterSubtitle}>{waterCups * 250}ml of 2500ml</Text>
            </View>
          </View>
          <View style={styles.waterControls}>
            <TouchableOpacity 
              style={styles.waterBtn} 
              onPress={() => setWaterCups(Math.max(0, waterCups - 1))}
            >
              <Text style={styles.waterBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.waterCount}>{waterCups}</Text>
            <TouchableOpacity 
              style={[styles.waterBtn, styles.waterBtnAdd]} 
              onPress={() => setWaterCups(waterCups + 1)}
            >
              <Plus size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Meals Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Meals</Text>
          <TouchableOpacity style={styles.addMealBtn}>
            <Plus size={16} color={COLORS.primary} />
            <Text style={styles.addMealText}>Add</Text>
          </TouchableOpacity>
        </View>

        {[
          { time: '08:30 AM', name: 'Oatmeal & Protein Whey', cals: 420, macros: 'P: 32g • C: 45g • F: 8g' },
          { time: '12:45 PM', name: 'Grilled Chicken & Quinoa Salad', cals: 650, macros: 'P: 48g • C: 62g • F: 14g' },
          { time: '04:00 PM', name: 'Almonds & Greek Yogurt', cals: 280, macros: 'P: 18g • C: 12g • F: 12g' },
        ].map((meal, idx) => (
          <TouchableOpacity key={idx} style={styles.mealItem}>
            <View style={styles.mealIcon}>
              <Utensils size={18} color={COLORS.textSecondary} />
            </View>
            <View style={styles.mealContent}>
              <View style={styles.mealHeader}>
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.mealCals}>{meal.cals} kcal</Text>
              </View>
              <Text style={styles.mealMacros}>{meal.macros}</Text>
              <Text style={styles.mealTime}>{meal.time}</Text>
            </View>
            <ChevronRight size={18} color={COLORS.border} />
          </TouchableOpacity>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  headerCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 4,
  },
  calBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  calBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  calMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calCentral: {
    alignItems: 'flex-start',
  },
  calValue: {
    color: '#fff',
    fontSize: 42,
    fontWeight: 'bold',
  },
  calLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  calStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  smallStatValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  smallStatLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    textAlign: 'center',
  },
  progressBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  editBtn: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  macroGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  macroCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  macroIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  macroLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 2,
  },
  macroValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  macroProgressBg: {
    height: 4,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 2,
    marginBottom: 6,
  },
  macroProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  macroGoal: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  waterCard: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  waterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  waterIconBox: {
    width: 48,
    height: 48,
    backgroundColor: '#3b82f620',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  waterSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  waterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    padding: 4,
    gap: 12,
  },
  waterBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  waterBtnAdd: {
    backgroundColor: '#3b82f6',
  },
  waterBtnText: {
    fontSize: 20,
    color: COLORS.textSecondary,
  },
  waterCount: {
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  addMealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.primaryDim,
    borderRadius: 10,
  },
  addMealText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mealIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  mealContent: {
    flex: 1,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 10,
  },
  mealName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  mealCals: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  mealMacros: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 2,
  },
  mealTime: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  smallStat: {
    alignItems: 'center',
  },
});
