import React, { useState } from 'react';
import {
  StyleSheet, View, Text, ScrollView, TouchableOpacity, Platform, Modal, TextInput, Alert
} from 'react-native';
import { COLORS } from '@/constants/Colors';
import { useWorkout } from '@/context/WorkoutContext';
import { Trophy, Users, Zap, Flame, Target, Star, Award, ChevronRight, CheckCircle, UserPlus, Search, X } from 'lucide-react-native';
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
  const { history, userProfile } = useWorkout();
  const [activeSocialTab, setActiveSocialTab] = useState<'circle' | 'global'>('circle');
  const [metric, setMetric] = useState<LeaderboardMetric>('workouts');
  const [joinedChallenges, setJoinedChallenges] = useState<string[]>([]);
  
  // Friends State (Simulated)
  const [friends, setFriends] = useState<any[]>([]);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendIdInput, setFriendIdInput] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Merge real data for "You" row
  const myWorkouts = history.length;
  const myVolume = history.reduce((sum, h) => sum + (parseInt(h.volume.replace(/[^0-9]/g, '')) || 0), 0);
  const myStreak = Math.min(Math.floor(myWorkouts / 1.5) + 1, 35);

  const activeLeaderboardSource = activeSocialTab === 'circle' ? [ ...friends, { rank: 0, name: userProfile?.displayName || 'You', workouts: 0, volume: '0k', streak: 0, you: true } ] : MOCK_FRIENDS;

  const leaderboard = activeLeaderboardSource.map(f =>
    f.you
      ? { ...f, workouts: myWorkouts, volume: `${(myVolume / 1000).toFixed(0)}k`, streak: myStreak }
      : f
  ).sort((a, b) => {
    if (metric === 'workouts') return b.workouts - a.workouts;
    if (metric === 'streak') return b.streak - a.streak;
    return parseInt(b.volume) - parseInt(a.volume);
  }).map((f, i) => ({ ...f, rank: i + 1 }));

  const rankColors = ['#f59e0b', '#a1a1aa', '#cd7c39'];

  const handleAddFriend = () => {
    if (!friendIdInput.trim()) return;
    setIsAdding(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Simulate finding a friend after 1s
    setTimeout(() => {
      const newFriend = {
        rank: 0,
        name: friendIdInput.length > 5 ? friendIdInput.substring(0, 8) : 'Fitness Hero',
        workouts: Math.floor(Math.random() * 20) + 10,
        volume: `${Math.floor(Math.random() * 50) + 50}k`,
        streak: Math.floor(Math.random() * 7) + 3,
        you: false
      };
      setFriends([...friends, newFriend]);
      setIsAdding(false);
      setShowAddFriend(false);
      setFriendIdInput('');
      Alert.alert('Friend Added! 🤝', `${newFriend.name} is now in your competition circle.`);
    }, 1200);
  };

  const toggleJoin = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setJoinedChallenges((prev: string[]) =>
      prev.includes(id) ? prev.filter((c: string) => c !== id) : [...prev, id]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.topActions}>
        <TouchableOpacity style={styles.addFriendBtn} onPress={() => setShowAddFriend(true)}>
          <UserPlus size={18} color="#fff" />
          <Text style={styles.addFriendText}>Add Friends</Text>
        </TouchableOpacity>
      </View>

      <LinearGradient colors={['rgba(139,92,246,0.2)', 'transparent']} style={styles.heroBanner}>
        <Trophy size={36} color="#f59e0b" />
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={styles.heroTitle}>Competition Mode</Text>
          <Text style={styles.heroSub}>{activeSocialTab === 'circle' ? 'You vs. Your Friends' : 'Global Athlete Leaderboard'}</Text>
        </View>
      </LinearGradient>

      {/* Tab Switcher */}
      <View style={styles.tabRow}>
        <TouchableOpacity 
          style={[styles.socialTab, activeSocialTab === 'circle' && styles.socialTabActive]} 
          onPress={() => setActiveSocialTab('circle')}
        >
          <Users size={16} color={activeSocialTab === 'circle' ? COLORS.primary : COLORS.textSecondary} />
          <Text style={[styles.socialTabText, activeSocialTab === 'circle' && styles.socialTabTextActive]}>My Circle</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.socialTab, activeSocialTab === 'global' && styles.socialTabActive]} 
          onPress={() => setActiveSocialTab('global')}
        >
          <Target size={16} color={activeSocialTab === 'global' ? COLORS.primary : COLORS.textSecondary} />
          <Text style={[styles.socialTabText, activeSocialTab === 'global' && styles.socialTabTextActive]}>Global</Text>
        </TouchableOpacity>
      </View>

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
        {leaderboard.length > 1 || activeSocialTab === 'global' ? (
          leaderboard.map((friend, idx) => (
            <View
              key={friend.name + friend.rank}
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
          ))
        ) : (
          <View style={styles.emptyCircle}>
            <Users size={48} color={COLORS.border} />
            <Text style={styles.emptyCircleTitle}>Your Circle is Empty</Text>
            <Text style={styles.emptyCircleSub}>Add friends to start a competition and see how you stack up!</Text>
            <TouchableOpacity style={styles.emptyAddBtn} onPress={() => setShowAddFriend(true)}>
              <Text style={styles.emptyAddBtnText}>Add First Friend</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Add Friend Modal */}
      <Modal visible={showAddFriend} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add to My Circle</Text>
              <TouchableOpacity onPress={() => setShowAddFriend(false)}>
                <X size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSub}>Enter your friend's Unique Athlete ID or Username to compete.</Text>
            
            <TextInput
              style={styles.inviteInput}
              placeholder="e.g. AlexTrainer99"
              placeholderTextColor={COLORS.textSecondary}
              value={friendIdInput}
              onChangeText={setFriendIdInput}
              autoFocus
            />

            <TouchableOpacity 
              style={[styles.confirmAddBtn, !friendIdInput.trim() && { opacity: 0.5 }]} 
              onPress={handleAddFriend}
              disabled={isAdding || !friendIdInput.trim()}
            >
              <Text style={styles.confirmAddBtnText}>{isAdding ? 'Searching...' : 'Send Competition Invite'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  topActions: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 16 },
  addFriendBtn: { 
    flexDirection: 'row', alignItems: 'center', gap: 8, 
    backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 
  },
  addFriendText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  heroBanner: {
    flexDirection: 'row', alignItems: 'center', padding: 20,
    borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border,
  },
  heroTitle: { color: COLORS.text, fontSize: 20, fontWeight: 'bold' },
  heroSub: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },
  tabRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  socialTab: { 
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12, backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border 
  },
  socialTabActive: { backgroundColor: COLORS.primaryDim, borderColor: COLORS.primary },
  socialTabText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' },
  socialTabTextActive: { color: COLORS.primary },
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
    borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden', minHeight: 120,
  },
  emptyCircle: { alignItems: 'center', padding: 32, gap: 12 },
  emptyCircleTitle: { color: COLORS.text, fontSize: 18, fontWeight: 'bold' },
  emptyCircleSub: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  emptyAddBtn: { backgroundColor: COLORS.primaryDim, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginTop: 4 },
  emptyAddBtnText: { color: COLORS.primary, fontWeight: 'bold' },
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.background, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { color: COLORS.text, fontSize: 22, fontWeight: 'bold' },
  modalSub: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 20, lineHeight: 20 },
  inviteInput: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, color: COLORS.text, fontSize: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 20 },
  confirmAddBtn: { backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  confirmAddBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
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
