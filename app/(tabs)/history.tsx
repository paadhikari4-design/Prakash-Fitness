import { StyleSheet, View, Text, ScrollView, Share, TouchableOpacity } from 'react-native';
import { COLORS } from '@/constants/Colors';
import { Calendar, Clock, Trophy, Share2, Dumbbell } from 'lucide-react-native';
import { useWorkout } from '@/context/WorkoutContext';

const DEMO_HISTORY = [
  {
    id: 'demo1',
    title: 'Barbell Bench Press',
    date: 'Thu, May 22, 5:30 AM',
    duration: '52:14',
    volume: '14,250 lbs',
    prs: 1,
    exercises: [
      { id: 'e1', name: 'Barbell Bench Press', sets: [{ id: 's1', weight: '185', reps: '5', done: true }, { id: 's2', weight: '185', reps: '5', done: true }, { id: 's3', weight: '185', reps: '4', done: true }] },
      { id: 'e2', name: 'Incline Dumbbell Press', sets: [{ id: 's4', weight: '70', reps: '10', done: true }, { id: 's5', weight: '70', reps: '9', done: true }] },
      { id: 'e3', name: 'Cable Crossover', sets: [{ id: 's6', weight: '40', reps: '12', done: true }, { id: 's7', weight: '40', reps: '12', done: true }, { id: 's8', weight: '40', reps: '11', done: true }] },
    ],
  },
  {
    id: 'demo2',
    title: 'Barbell Back Squat',
    date: 'Tue, May 20, 6:00 AM',
    duration: '01:04:30',
    volume: '18,600 lbs',
    prs: 0,
    exercises: [
      { id: 'e4', name: 'Barbell Back Squat', sets: [{ id: 's9', weight: '225', reps: '5', done: true }, { id: 's10', weight: '225', reps: '5', done: true }, { id: 's11', weight: '225', reps: '5', done: true }] },
      { id: 'e5', name: 'Romanian Deadlift (RDL)', sets: [{ id: 's12', weight: '185', reps: '8', done: true }, { id: 's13', weight: '185', reps: '8', done: true }] },
      { id: 'e6', name: 'Leg Press', sets: [{ id: 's14', weight: '350', reps: '10', done: true }, { id: 's15', weight: '350', reps: '10', done: true }, { id: 's16', weight: '350', reps: '8', done: true }] },
      { id: 'e7', name: 'Seated Calf Raises', sets: [{ id: 's17', weight: '90', reps: '15', done: true }, { id: 's18', weight: '90', reps: '15', done: true }] },
    ],
  },
  {
    id: 'demo3',
    title: 'Deadlift',
    date: 'Sun, May 18, 7:15 AM',
    duration: '48:55',
    volume: '21,480 lbs',
    prs: 2,
    exercises: [
      { id: 'e8', name: 'Deadlift', sets: [{ id: 's19', weight: '315', reps: '3', done: true }, { id: 's20', weight: '315', reps: '3', done: true }, { id: 's21', weight: '335', reps: '2', done: true }] },
      { id: 'e9', name: 'Pull-up', sets: [{ id: 's22', weight: '0', reps: '10', done: true }, { id: 's23', weight: '0', reps: '8', done: true }, { id: 's24', weight: '0', reps: '7', done: true }] },
      { id: 'e10', name: 'Barbell Bent Over Row', sets: [{ id: 's25', weight: '155', reps: '8', done: true }, { id: 's26', weight: '155', reps: '8', done: true }] },
    ],
  },
  {
    id: 'demo4',
    title: 'Overhead Press',
    date: 'Fri, May 16, 5:45 AM',
    duration: '43:20',
    volume: '9,870 lbs',
    prs: 0,
    exercises: [
      { id: 'e11', name: 'Overhead Press', sets: [{ id: 's27', weight: '115', reps: '6', done: true }, { id: 's28', weight: '115', reps: '5', done: true }, { id: 's29', weight: '115', reps: '5', done: true }] },
      { id: 'e12', name: 'Arnold Press', sets: [{ id: 's30', weight: '45', reps: '10', done: true }, { id: 's31', weight: '45', reps: '10', done: true }] },
      { id: 'e13', name: 'Lateral Raises', sets: [{ id: 's32', weight: '20', reps: '15', done: true }, { id: 's33', weight: '20', reps: '15', done: true }, { id: 's34', weight: '20', reps: '12', done: true }] },
    ],
  },
  {
    id: 'demo5',
    title: 'Full Body A',
    date: 'Wed, May 14, 6:30 AM',
    duration: '55:10',
    volume: '11,240 lbs',
    prs: 1,
    exercises: [
      { id: 'e14', name: 'Barbell Squat', sets: [{ id: 's35', weight: '185', reps: '8', done: true }, { id: 's36', weight: '185', reps: '8', done: true }] },
      { id: 'e15', name: 'Bench Press', sets: [{ id: 's37', weight: '155', reps: '10', done: true }, { id: 's38', weight: '155', reps: '9', done: true }] },
      { id: 'e16', name: 'Deadlift', sets: [{ id: 's39', weight: '225', reps: '5', done: true }] },
    ],
  },
];

export default function HistoryScreen() {
  const { history } = useWorkout();

  // Use real history if available, otherwise show demo data
  const displayHistory = history.length > 0 ? history : DEMO_HISTORY;
  const isDemo = history.length === 0;

  const handleShare = async (session: any) => {
    try {
      const exSummary = session.exercises.map((e: any) => `- ${e.name}`).join('\n');
      const message = `🔥 Just finished my workout on Prakash Fitness!\n\nWorkout: ${session.title}\nDuration: ${session.duration}\nVolume: ${session.volume}\nExercises:\n${exSummary}\n\nDownload Prakash Fitness to track yours!`;
      await Share.share({ message });
    } catch (error) {
      console.log('Error sharing: ', error);
    }
  };

  const totalVolume = displayHistory.reduce((sum, s) => sum + (parseInt(s.volume.replace(/[^0-9]/g, '')) || 0), 0);
  const totalSets = displayHistory.reduce((sum, s) => sum + s.exercises.reduce((es, e) => es + e.sets.filter(st => st.done).length, 0), 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Training Log</Text>
          <Text style={styles.headerSubtitle}>{displayHistory.length} sessions recorded</Text>
        </View>
        <Dumbbell size={28} color={COLORS.primary} />
      </View>

      {/* Summary Stats */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{displayHistory.length}</Text>
          <Text style={styles.summaryLabel}>Workouts</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{totalSets}</Text>
          <Text style={styles.summaryLabel}>Total Sets</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{(totalVolume / 1000).toFixed(0)}k</Text>
          <Text style={styles.summaryLabel}>Total lbs</Text>
        </View>
      </View>

      {/* Demo badge */}
      {isDemo && (
        <View style={styles.demoBanner}>
          <Text style={styles.demoBannerText}>📊 Sample data — complete a workout to see your real history</Text>
        </View>
      )}

      {displayHistory.map((session) => (

          <View key={session.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{session.title}</Text>
              </View>
              <View style={styles.headerActions}>
                {session.prs > 0 && (
                  <View style={styles.prBadge}>
                    <Trophy size={12} color={COLORS.background} />
                    <Text style={styles.prText}>{session.prs} PR</Text>
                  </View>
                )}
                <TouchableOpacity onPress={() => handleShare(session)} style={styles.shareBtn}>
                  <Share2 size={18} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Calendar size={16} color={COLORS.primary} />
                <Text style={styles.statText}>{session.date}</Text>
              </View>
              <View style={styles.statItem}>
                <Clock size={16} color={COLORS.primary} />
                <Text style={styles.statText}>{session.duration}</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.volumeContainer}>
              <Text style={styles.volumeLabel}>Total Volume</Text>
              <Text style={styles.volumeValue}>{session.volume}</Text>
            </View>

            {session.exercises && session.exercises.length > 0 && (
              <View style={styles.exerciseDetails}>
                <View style={styles.divider} />
                {session.exercises.map((ex, idx) => (
                  <View key={ex.id || idx} style={styles.historyExerciseItem}>
                    <Text style={styles.historyExerciseName}>{ex.name}</Text>
                    <Text style={styles.historyExerciseSets}>
                      {ex.sets.filter(s => s.done).length} sets performed
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  demoBanner: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  demoBannerText: {
    color: COLORS.primary,
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shareBtn: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  prBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  prText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 16,
  },
  volumeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  volumeLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  volumeValue: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  exerciseDetails: {
    marginTop: 16,
  },
  historyExerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  historyExerciseName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    flex: 1,
  },
  historyExerciseSets: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
