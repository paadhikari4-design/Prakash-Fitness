import { StyleSheet, View, Text, ScrollView, Share, TouchableOpacity } from 'react-native';
import { COLORS } from '@/constants/Colors';
import { Calendar, Clock, Trophy, Share2, Dumbbell } from 'lucide-react-native';
import { useWorkout } from '@/context/WorkoutContext';

export default function HistoryScreen() {
  const { history } = useWorkout();
  
  const handleShare = async (session: any) => {
    try {
      const exSummary = session.exercises.map((e: any) => `- ${e.name}`).join('\n');
      const message = `🔥 Just finished my workout on Prakash Fitness!\n\nWorkout: ${session.title}\nDuration: ${session.duration}\nVolume: ${session.volume}\nExercises:\n${exSummary}\n\nDownload Prakash Fitness to track yours!`;
      await Share.share({ message });
    } catch (error) {
      console.log('Error sharing: ', error);
    }
  };

  const totalVolume = history.reduce((sum, s) => sum + (parseInt(s.volume.replace(/[^0-9]/g, '')) || 0), 0);
  const totalSets = history.reduce((sum, s) => sum + s.exercises.reduce((es, e) => es + e.sets.filter(st => st.done).length, 0), 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Training Log</Text>
          <Text style={styles.headerSubtitle}>{history.length} sessions recorded</Text>
        </View>
        <Dumbbell size={28} color={COLORS.primary} />
      </View>

      {/* Summary Stats */}
      {history.length > 0 && (
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{history.length}</Text>
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
      )}

      {history.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No history yet.</Text>
          <Text style={styles.emptyStateSubtext}>Complete a workout to see it here!</Text>
        </View>
      ) : (
        history.map((session) => (
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
        ))
      )}
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
