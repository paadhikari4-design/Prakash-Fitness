import React, { useState } from 'react';
import {
  StyleSheet, View, Text, ScrollView, TouchableOpacity, Platform
} from 'react-native';
import { COLORS } from '@/constants/Colors';
import { useWorkout } from '@/context/WorkoutContext';
import { Trophy, Users, Zap, Flame, Target, Star, Award, ChevronRight, CheckCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

// ── Mock friends leaderboard data ────────────────────────────────
const MOCK_FRIENDS = [
  { rank: 1, name: 'Alex R.', workouts: 28, volume: '142k', streak: 14, you: false },
  { rank: 2, name: 'Jordan B.', workouts: 24, volume: '128k', streak: 10, you: false },
  { rank: 3, name: 'You', workouts: 0, volume: '0k', streak: 0, you: true },
  { rank: 4, name: 'Sam T.', workouts: 18, volume: '91k', streak: 5, you: false },
  { rank: 5, name: 'Casey M.', workouts: 12, volume: '67k', streak: 3, you: false },
];

const CHALLENGES = [
  {
    id: 'c1',
    title: '7-Day Streak Challenge',
    desc: 'Complete a workout every day for 7 consecutive days.',
    reward: '🔥 Inferno Badge',
    progress: 4,
    total: 7,
    color: '#ff9f43',
    participants: 312,
  },
  {
    id: 'c2',
    title: '100k Volume Week',
    desc: 'Lift 100,000 total lbs across all workouts this week.',
    reward: '💪 Iron Badge',
    progress: 62,
    total: 100,
    color: COLORS.primary,
    participants: 197,
  },
  {
    id: 'c3',
    title: 'Early Bird Month',
    desc: 'Log 10 morning workouts before 8am this month.',
    reward: '🌅 Dawn Badge',
    progress: 3,
    total: 10,
    color: '#f59e0b',
    participants: 544,
  },
];

type LeaderboardMetric = 'workouts' | 'volume' | 'streak';

export default function SocialScreen() {
  const { history } = useWorkout();
  const [metric, setMetric] = useState<LeaderboardMetric>('workouts');
  const [joinedChallenges, setJoinedChallenges] = useState<string[]>([]);

  // Merge real data for "You" row
  const myWorkouts = history.length;
  const myVolume = history.reduce((sum, h) => sum + (parseInt(h.volume.replace(/[^0-9]/g, '')) || 0), 0);
  const myStreak = Math.min(Math.floor(myWorkouts / 1.5) + 1, 35);

  const leaderboard = MOCK_FRIENDS.map(f =>
    f.you
      ? { ...f, workouts: myWorkouts, volume: `${(myVolume / 1000).toFixed(0)}k`, streak: myStreak }
      : f
  ).sort((a, b) => {
    if (metric === 'workouts') return b.workouts - a.workouts;
    if (metric === 'streak') return b.streak - a.streak;
    return parseInt(b.volume) - parseInt(a.volume);
  }).map((f, i) => ({ ...f, rank: i + 1 }));

  const rankColors = ['#f59e0b', '#a1a1aa', '#cd7c39'];

  const toggleJoin = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setJoinedChallenges(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <LinearGradient colors={['rgba(139,92,246,0.2)', 'transparent']} style={styles.heroBanner}>
        <Trophy size={36} color="#f59e0b" />
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={styles.heroTitle}>Competition Mode</Text>
          <Text style={styles.heroSub}>Compete with friends. Win badges. Stay consistent.</Text>
        </View>
      </LinearGradient>

      {/* Leaderboard */}
      <Text style={styles.sectionTitle}>🏆 Leaderboard</Text>
      <View style={styles.metricRow}>
        {(['workouts', 'volume', 'streak'] as LeaderboardMetric[]).map(m => (
          <TouchableOpacity
            key={m}
            style={[styles.metricPill, metric === m && styles.metricPillActive]}
            onPress={() => setMetric(m)}
          >
            <Text style={[styles.metricText, metric === m && styles.metricTextActive]}>
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.leaderboardCard}>
        {leaderboard.map((friend, idx) => (
          <View
            key={friend.name}
            style={[
              styles.leaderRow,
              friend.you && styles.leaderRowYou,
              idx < leaderboard.length - 1 && styles.leaderRowBorder
            ]}
          >
            <View style={styles.rankBadge}>
              {friend.rank <= 3 ? (
                <Star size={16} color={rankColors[friend.rank - 1]} fill={rankColors[friend.rank - 1]} />
              ) : (
                <Text style={styles.rankNum}>{friend.rank}</Text>
              )}
            </View>
            <Text style={[styles.friendName, friend.you && { color: COLORS.primary, fontWeight: '800' }]}>
              {friend.name}{friend.you ? ' (You)' : ''}
            </Text>
            <View style={styles.friendStats}>
              <Text style={styles.friendStatVal}>
                {metric === 'workouts' ? `${friend.workouts} wkts` :
                  metric === 'volume' ? friend.volume :
                    `${friend.streak} days`}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Group Challenges */}
      <Text style={[styles.sectionTitle, { marginTop: 28 }]}>⚡ Group Challenges</Text>

      {CHALLENGES.map(ch => {
        const joined = joinedChallenges.includes(ch.id);
        return (
          <View key={ch.id} style={styles.challengeCard}>
            <View style={styles.challengeHeader}>
              <Text style={styles.challengeTitle}>{ch.title}</Text>
              <Text style={styles.challengeReward}>{ch.reward}</Text>
            </View>
            <Text style={styles.challengeDesc}>{ch.desc}</Text>

            {/* Progress bar */}
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, {
                width: `${(ch.progress / ch.total) * 100}%` as any,
                backgroundColor: ch.color
              }]} />
            </View>
            <View style={styles.challengeFooter}>
              <Text style={styles.challengeParticipants}>
                <Users size={12} color={COLORS.textSecondary} /> {ch.participants} participants
              </Text>
              <Text style={styles.challengeProgress}>{ch.progress}/{ch.total}</Text>
            </View>

            <TouchableOpacity
              style={[styles.joinBtn, joined && styles.joinBtnActive, { borderColor: ch.color }]}
              onPress={() => toggleJoin(ch.id)}
            >
              {joined && <CheckCircle size={16} color={ch.color} />}
              <Text style={[styles.joinBtnText, { color: joined ? ch.color : COLORS.textSecondary }]}>
                {joined ? 'Joined!' : 'Join Challenge'}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}

      {/* My Achievements */}
      <Text style={[styles.sectionTitle, { marginTop: 28 }]}>🎖 My Achievements</Text>
      <View style={styles.badgeRow}>
        {[
          { icon: '🔥', label: 'First Streak', earned: myStreak >= 1 },
          { icon: '💪', label: '5 Workouts', earned: myWorkouts >= 5 },
          { icon: '🏋️', label: '10 Workouts', earned: myWorkouts >= 10 },
          { icon: '⚡', label: 'Early Adopter', earned: true },
        ].map(b => (
          <View key={b.label} style={[styles.badge, !b.earned && styles.badgeLocked]}>
            <Text style={styles.badgeIcon}>{b.earned ? b.icon : '🔒'}</Text>
            <Text style={[styles.badgeLabel, !b.earned && { color: COLORS.textSecondary }]}>{b.label}</Text>
          </View>
        ))}
      </View>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20 },
  heroBanner: {
    flexDirection: 'row', alignItems: 'center', padding: 20,
    borderRadius: 20, marginBottom: 28, borderWidth: 1, borderColor: COLORS.border,
  },
  heroTitle: { color: COLORS.text, fontSize: 20, fontWeight: 'bold' },
  heroSub: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: 'bold', marginBottom: 14 },
  metricRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  metricPill: {
    flex: 1, paddingVertical: 8, alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  metricPillActive: { backgroundColor: COLORS.primaryDim, borderColor: COLORS.primary },
  metricText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  metricTextActive: { color: COLORS.primary },
  leaderboardCard: {
    backgroundColor: COLORS.surface, borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden',
  },
  leaderRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  leaderRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  leaderRowYou: { backgroundColor: COLORS.primaryDim },
  rankBadge: { width: 28, alignItems: 'center' },
  rankNum: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '700' },
  friendName: { flex: 1, color: COLORS.text, fontSize: 15, fontWeight: '600' },
  friendStats: {},
  friendStatVal: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
  challengeCard: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 12,
  },
  challengeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  challengeTitle: { color: COLORS.text, fontSize: 15, fontWeight: 'bold', flex: 1 },
  challengeReward: { color: COLORS.textSecondary, fontSize: 12 },
  challengeDesc: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 18, marginBottom: 12 },
  progressTrack: { height: 6, backgroundColor: COLORS.surfaceLight, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 3 },
  challengeFooter: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  challengeParticipants: { color: COLORS.textSecondary, fontSize: 12 },
  challengeProgress: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  joinBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: 10, borderWidth: 1,
  },
  joinBtnActive: { backgroundColor: 'rgba(139,92,246,0.08)' },
  joinBtnText: { fontSize: 14, fontWeight: '600' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badge: {
    width: '47%', alignItems: 'center', paddingVertical: 18,
    backgroundColor: COLORS.surface, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, gap: 6,
  },
  badgeLocked: { opacity: 0.45 },
  badgeIcon: { fontSize: 30 },
  badgeLabel: { color: COLORS.text, fontSize: 12, fontWeight: '600', textAlign: 'center' },
});
