import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity, TextInput,
  Alert, ScrollView, Platform, KeyboardAvoidingView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '@/constants/Colors';
import { useWorkout } from '@/context/WorkoutContext';
import { X, User, Save, LogOut, Trophy, Calendar, Hash, Dna, ChevronRight, CheckCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { auth } from '@/services/firebase';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

// DNA options
const LIFESTYLES = ['Sedentary (Office Job)', 'Lightly Active', 'Moderately Active', 'Very Active'];
const FITNESS_LEVELS = ['Beginner (< 6 months)', 'Intermediate (1-2 years)', 'Advanced (3+ years)', 'Elite Athlete'];
const GOALS = ['Fat Loss', 'Muscle Gain', 'General Fitness', 'Athletic Performance', 'Powerlifting'];

function getDNAInsight(lifestyle: string, level: string, goal: string): string {
  if (!lifestyle || !level || !goal) return 'Complete your DNA profile to unlock personalized coaching.';

  let base = '';
  if (goal === 'Fat Loss') {
    base = 'Your plan should prioritize caloric deficit and metabolic conditioning.';
    if (lifestyle.includes('Sedentary')) base += ' Start with 3 sessions/week of circuit training.';
    else base += ' Incorporate 4-5 sessions mixing HIIT and strength work.';
  } else if (goal === 'Muscle Gain') {
    base = 'Focus on progressive overload with compound lifts.';
    if (level.includes('Beginner')) base += ' 3x/week full body is optimal for your level.';
    else base += ' A push/pull/legs split will maximize hypertrophy.';
  } else if (goal === 'Powerlifting') {
    if (!level.includes('Beginner')) base = 'Run a 5/3/1 or conjugate periodization program 4x/week.';
    else base = 'Learn movement patterns first with 3x5 linear progression on squat, bench and deadlift.';
  } else {
    base = 'A balanced 3-4 day training schedule with mobility work will keep you progressing.';
  }

  return base;
}

export default function ProfileModal() {
  const router = useRouter();
  const { userProfile, updateDisplayName, history } = useWorkout();
  const [nameInput, setNameInput] = useState(userProfile?.displayName || '');
  const [isSaving, setIsSaving] = useState(false);

  // DNA State
  const [activeTab, setActiveTab] = useState<'profile' | 'dna'>('profile');
  const [selectedLifestyle, setSelectedLifestyle] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('');
  const [dnaLocked, setDnaLocked] = useState(false);

  useEffect(() => {
    if (userProfile?.displayName) setNameInput(userProfile.displayName);
  }, [userProfile]);

  const handleSave = async () => {
    if (!nameInput.trim()) {
      Alert.alert('Invalid Name', 'Please enter a display name.');
      return;
    }
    setIsSaving(true);
    await updateDisplayName(nameInput.trim());
    setIsSaving(false);
    Alert.alert('Profile Updated', 'Your changes have been saved.');
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await auth.signOut();
            router.replace('/');
          }
        }
      ]
    );
  };

  const handleLockDNA = () => {
    if (!selectedLifestyle || !selectedLevel || !selectedGoal) {
      Alert.alert('Incomplete Profile', 'Select all three DNA options to lock your profile.');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setDnaLocked(true);
    Alert.alert('🧬 Fitness DNA Locked!', 'Your IronPulse experience is now fully personalized.');
  };

  const insight = getDNAInsight(selectedLifestyle, selectedLevel, selectedGoal);

  return (
    <View style={styles.container}>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <X size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Tab Row */}
        <View style={styles.tabRow}>
          {[
            { key: 'profile', label: 'General', icon: <User size={16} color={activeTab === 'profile' ? COLORS.primary : COLORS.textSecondary} /> },
            { key: 'dna', label: 'Fitness DNA', icon: <Dna size={16} color={activeTab === 'dna' ? COLORS.primary : COLORS.textSecondary} /> },
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

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>

          {/* ─── GENERAL TAB ─── */}
          {activeTab === 'profile' && (
            <>
              <View style={styles.profileCard}>
                <View style={styles.avatarContainer}>
                  <User size={40} color={COLORS.primary} />
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.userIdLabel}>ANONYMOUS ATHLETE</Text>
                  <Text style={styles.userIdValue}>ID: {auth.currentUser?.uid.slice(0, 12)}...</Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>General Settings</Text>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Display Name</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      value={nameInput}
                      onChangeText={setNameInput}
                      placeholder="Enter your name"
                      placeholderTextColor={COLORS.textSecondary}
                    />
                    <TouchableOpacity
                      style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
                      onPress={handleSave}
                      disabled={isSaving}
                    >
                      <Save size={18} color={COLORS.background} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Lifetime Statistics</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statBox}>
                    <Trophy size={20} color="#f59e0b" />
                    <Text style={styles.statValue}>{history.length}</Text>
                    <Text style={styles.statLabel}>Workouts</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Calendar size={20} color={COLORS.primary} />
                    <Text style={styles.statValue}>{userProfile?.joinedDate || 'N/A'}</Text>
                    <Text style={styles.statLabel}>Joined</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Hash size={20} color="#10b981" />
                    <Text style={styles.statValue}>{history.reduce((s, h) => s + h.prs, 0)}</Text>
                    <Text style={styles.statLabel}>PRs Hit</Text>
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                  <LogOut size={20} color="#ef4444" />
                  <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>
                <Text style={styles.accountHint}>
                  You are currently using an anonymous account. Your data is saved in our cloud but linked to this device session.
                </Text>
              </View>
            </>
          )}

          {/* ─── DNA TAB ─── */}
          {activeTab === 'dna' && (
            <>
              <LinearGradient
                colors={['rgba(139,92,246,0.15)', 'rgba(109,40,217,0.1)']}
                style={styles.dnaHero}
              >
                <Dna size={32} color={COLORS.primary} />
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={styles.dnaHeroTitle}>Fitness DNA Engine</Text>
                  <Text style={styles.dnaHeroSub}>Build your unique athletic profile to unlock personalized coaching.</Text>
                </View>
              </LinearGradient>

              {/* Selector: Lifestyle */}
              <Text style={styles.dnaGroupLabel}>🏠 Current Lifestyle</Text>
              <View style={styles.optionGroup}>
                {LIFESTYLES.map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.optionPill, selectedLifestyle === opt && styles.optionPillActive]}
                    onPress={() => { if (!dnaLocked) setSelectedLifestyle(opt); }}
                    disabled={dnaLocked}
                  >
                    {selectedLifestyle === opt && <CheckCircle size={14} color={COLORS.primary} />}
                    <Text style={[styles.optionText, selectedLifestyle === opt && styles.optionTextActive]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Selector: Fitness Level */}
              <Text style={styles.dnaGroupLabel}>💪 Current Fitness Level</Text>
              <View style={styles.optionGroup}>
                {FITNESS_LEVELS.map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.optionPill, selectedLevel === opt && styles.optionPillActive]}
                    onPress={() => { if (!dnaLocked) setSelectedLevel(opt); }}
                    disabled={dnaLocked}
                  >
                    {selectedLevel === opt && <CheckCircle size={14} color={COLORS.primary} />}
                    <Text style={[styles.optionText, selectedLevel === opt && styles.optionTextActive]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Selector: Goal */}
              <Text style={styles.dnaGroupLabel}>🎯 Primary Goal</Text>
              <View style={styles.optionGroup}>
                {GOALS.map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.optionPill, selectedGoal === opt && styles.optionPillActive]}
                    onPress={() => { if (!dnaLocked) setSelectedGoal(opt); }}
                    disabled={dnaLocked}
                  >
                    {selectedGoal === opt && <CheckCircle size={14} color={COLORS.primary} />}
                    <Text style={[styles.optionText, selectedGoal === opt && styles.optionTextActive]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* AI DNA Insight */}
              {(selectedLifestyle || selectedLevel || selectedGoal) && (
                <View style={styles.insightCard}>
                  <Text style={styles.insightLabel}>🧠 AI Coaching Insight</Text>
                  <Text style={styles.insightText}>{insight}</Text>
                </View>
              )}

              {!dnaLocked ? (
                <TouchableOpacity style={styles.lockBtn} onPress={handleLockDNA}>
                  <Dna size={20} color={COLORS.background} />
                  <Text style={styles.lockBtnText}>Lock My Fitness DNA</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.lockedBanner}>
                  <CheckCircle size={20} color="#10b981" />
                  <Text style={styles.lockedText}>Fitness DNA Locked & Active ✅</Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 12,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  tabActive: { backgroundColor: COLORS.primaryDim, borderColor: COLORS.primary },
  tabText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: COLORS.primary },
  content: { flex: 1 },
  scrollContent: { padding: 20 },
  profileCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 24, gap: 16,
  },
  avatarContainer: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: COLORS.primaryDim, alignItems: 'center', justifyContent: 'center',
  },
  profileInfo: { flex: 1 },
  userIdLabel: { color: COLORS.primary, fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  userIdValue: { color: COLORS.textSecondary, fontSize: 13, marginTop: 4 },
  section: { marginBottom: 32 },
  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  inputGroup: { gap: 8 },
  label: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', marginLeft: 4 },
  inputWrapper: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  input: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
    color: COLORS.text, fontSize: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  saveBtn: {
    backgroundColor: COLORS.primary, borderRadius: 12, width: 48, height: 48,
    alignItems: 'center', justifyContent: 'center',
  },
  saveBtnDisabled: { opacity: 0.5 },
  statsGrid: { flexDirection: 'row', gap: 12 },
  statBox: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 16, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, gap: 8,
  },
  statValue: { color: COLORS.text, fontSize: 17, fontWeight: 'bold' },
  statLabel: { color: COLORS.textSecondary, fontSize: 11 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(239,68,68,0.1)', padding: 16, borderRadius: 12,
  },
  logoutText: { color: '#ef4444', fontSize: 16, fontWeight: 'bold' },
  accountHint: { color: COLORS.textSecondary, fontSize: 12, marginTop: 12, lineHeight: 18 },
  // DNA styles
  dnaHero: {
    flexDirection: 'row', alignItems: 'center', padding: 20,
    borderRadius: 20, marginBottom: 24, borderWidth: 1, borderColor: COLORS.border,
  },
  dnaHeroTitle: { color: COLORS.text, fontSize: 18, fontWeight: 'bold' },
  dnaHeroSub: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2, lineHeight: 18 },
  dnaGroupLabel: { color: COLORS.text, fontSize: 15, fontWeight: 'bold', marginBottom: 10, marginTop: 4 },
  optionGroup: { gap: 8, marginBottom: 20 },
  optionPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 16,
    backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  optionPillActive: { backgroundColor: COLORS.primaryDim, borderColor: COLORS.primary },
  optionText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '500' },
  optionTextActive: { color: COLORS.primary, fontWeight: '700' },
  insightCard: {
    backgroundColor: COLORS.surfaceDark, borderRadius: 16, padding: 18,
    borderLeftWidth: 4, borderLeftColor: COLORS.primary, borderWidth: 1, borderColor: COLORS.border,
    marginBottom: 20,
  },
  insightLabel: { color: COLORS.primary, fontSize: 13, fontWeight: 'bold', marginBottom: 8 },
  insightText: { color: COLORS.text, fontSize: 14, lineHeight: 22 },
  lockBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 16, marginBottom: 8,
  },
  lockBtnText: { color: COLORS.background, fontSize: 16, fontWeight: 'bold' },
  lockedBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(16,185,129,0.12)',
    padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#10b981',
  },
  lockedText: { color: '#10b981', fontSize: 15, fontWeight: 'bold' },
});
