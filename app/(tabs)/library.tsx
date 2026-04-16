import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { COLORS } from '@/constants/Colors';
import { Search, Filter, Dumbbell, ChevronDown, ChevronUp, Activity } from 'lucide-react-native';

// Enable LayoutAnimation for accordion on Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const CATEGORIES = ['All', 'Chest', 'Back', 'Legs', 'Core', 'Shoulders', 'Arms', 'Full Body', 'Cardio'];

export const EXERCISE_DATA = [
  // CHEST
  { id: 'c1', name: 'Barbell Bench Press', category: 'Chest', equipment: 'Barbell', target: 'Pectorals, Triceps, Anterior Deltoids', benefit: 'The foundational compound movement for building upper body pushing strength and massive chest volume.', instructions: 'Lie on a flat bench. Grip the bar slightly wider than shoulder-width. Lower the bar to your mid-chest, then press it back up explosively.', mechanics: 'Compound' },
  { id: 'c2', name: 'Incline Dumbbell Press', category: 'Chest', equipment: 'Dumbbell', target: 'Upper Pectorals, Anterior Deltoids', benefit: 'Isolates the upper portion of the chest to build a well-rounded, aesthetic pectoral shelf.', instructions: 'Set a bench to a 30-45 degree incline. Press the dumbbells upward and together, then lower them until you feel a deep stretch in your upper chest.', mechanics: 'Compound' },
  { id: 'c3', name: 'Cable Crossover', category: 'Chest', equipment: 'Cable', target: 'Inner Pectorals, Lower Pectorals', benefit: 'Provides constant tension throughout the entire range of motion, creating excellent hypertrophy and muscle connection.', instructions: 'Stand between two high-cable pulleys. Pull the handles down and together in front of you, squeezing your chest at the bottom before slowly returning to the start.', mechanics: 'Isolation' },
  { id: 'c4', name: 'Push-Ups', category: 'Chest', equipment: 'Bodyweight', target: 'Pectorals, Triceps, Core', benefit: 'Fundamental bodyweight movement that builds pushing strength and trains core stabilization simultaneously.', instructions: 'Start in a plank position. Lower your body until your chest nearly touches the floor, keeping your elbows tucked at a 45-degree angle, then push back up.', mechanics: 'Compound' },
  { id: 'c5', name: 'Machine Pec Deck', category: 'Chest', equipment: 'Machine', target: 'Pectorals (Sternal Head)', benefit: 'Removes stability requirements so you can purely isolate and push the chest muscles to failure safely.', instructions: 'Sit at the machine with arms out and elbows slightly bent. Squeeze the pads or handles together in front of your chest, hold for a second, then control the release.', mechanics: 'Isolation' },

  // BACK
  { id: 'b1', name: 'Deadlift', category: 'Back', equipment: 'Barbell', target: 'Erector Spinae, Glutes, Hamstrings, Lats', benefit: 'The ultimate test of raw strength. Builds massive posterior chain power, core stability, and overall body thickness.', instructions: 'Stand with the bar over your mid-foot. Hinge at the hips, grip the bar, brace your core, and drive through the floor to stand up straight. Return the bar to the ground under control.', mechanics: 'Compound' },
  { id: 'b2', name: 'Pull-up', category: 'Back', equipment: 'Bodyweight', target: 'Latissimus Dorsi, Biceps, Rhomboids', benefit: 'The gold standard for vertical pulling. Dramatically increases back width and overall upper body control.', instructions: 'Hang from a bar wide grip. Pull your shoulder blades down and back, driving your elbows to the floor until your chin clears the bar. Lower slowly.', mechanics: 'Compound' },
  { id: 'b3', name: 'Seated Cable Row', category: 'Back', equipment: 'Cable', target: 'Rhomboids, Lats, Trapezius', benefit: 'Develops back thickness and postural strength without putting excessive load on the lower back.', instructions: 'Sit with a slight bend in your knees. Keep your torso upright and pull the handle to your abdomen, squeezing your shoulder blades together. Do not lean back excessively.', mechanics: 'Compound' },
  { id: 'b4', name: 'Lat Pulldown', category: 'Back', equipment: 'Cable', target: 'Latissimus Dorsi, Biceps', benefit: 'An excellent alternative to pull-ups that allows for strict, controlled isolation of the lat width.', instructions: 'Grip the wide bar and sit down. Pull the bar down to your upper chest by driving your elbows down and back, then slowly let the bar return to the top.', mechanics: 'Compound' },
  { id: 'b5', name: 'Barbell Bent Over Row', category: 'Back', equipment: 'Barbell', target: 'Mid-Back, Lats, Rhomboids', benefit: 'Builds incredible raw pulling power and thickness across the entire upper and mid back.', instructions: 'Hinge at the hips until your torso is nearly parallel to the floor. Pull the barbell toward your belly button, squeezing your back, then slowly lower it back down.', mechanics: 'Compound' },
  { id: 'b6', name: 'T-Bar Row', category: 'Back', equipment: 'Machine/Bar', target: 'Mid-Back, Trapezius, Lats', benefit: 'Focuses heavily on back thickness, allowing heavier loads to be moved with more stability.', instructions: 'Straddle the bar and hinge forward. Grip the handles and pull the weight up to your chest, driving the elbows back. Squeeze your back and lower under control.', mechanics: 'Compound' },

  // LEGS
  { id: 'l1', name: 'Barbell Back Squat', category: 'Legs', equipment: 'Barbell', target: 'Quadriceps, Glutes, Core', benefit: 'The king of all leg exercises. Maximizes total leg development, central nervous system taxing, and anabolic hormone release.', instructions: 'Rest the bar on your traps. Keep your chest up and core braced. Break at the hips and knees simultaneously, squatting until thighs are parallel to the floor or lower, then stand up explosively.', mechanics: 'Compound' },
  { id: 'l2', name: 'Romanian Deadlift (RDL)', category: 'Legs', equipment: 'Barbell/Dumbbell', target: 'Hamstrings, Glutes', benefit: 'Actively stretches the hamstrings under loads, heavily recruiting your glutes and preventing knee injuries.', instructions: 'Hold a barbell with a shoulder-width grip. Keep your legs slightly bent and hinge at the hips, pushing your glutes back until you feel a deep stretch in the hamstrings. Squeeze glutes to return to standing.', mechanics: 'Compound' },
  { id: 'l3', name: 'Bulgarian Split Squat', category: 'Legs', equipment: 'Dumbbell', target: 'Quadriceps, Glutes', benefit: 'Crucial for fixing muscular imbalances between left and right legs while demanding intense core stabilization.', instructions: 'Stand facing away from a bench, resting one foot on it behind you. Hold dumbbells and lower your hips until your front thigh is parallel to the floor. Drive through the front heel to stand up.', mechanics: 'Compound' },
  { id: 'l4', name: 'Leg Press', category: 'Legs', equipment: 'Machine', target: 'Quadriceps, Glutes, Hamstrings', benefit: 'Allows you to push extreme tonnage with your lower body safely without spinal loading.', instructions: 'Sit in the machine and place feet shoulder-width apart on the sled. Unrack the weight and lower it until your knees are at 90 degrees, then press the weight back up without locking out your knees.', mechanics: 'Compound' },
  { id: 'l5', name: 'Leg Extensions', category: 'Legs', equipment: 'Machine', target: 'Quadriceps (Rectus Femoris)', benefit: 'Perfect for completely isolating the quads and achieving an intense burn and pump for hypertrophy.', instructions: 'Sit on the machine with the pad resting on your lower shins. Flex your quads to extend your legs fully straight, hold the contraction for a second, then slowly lower.', mechanics: 'Isolation' },
  { id: 'l6', name: 'Seated Calf Raises', category: 'Legs', equipment: 'Machine', target: 'Soleus (Calves)', benefit: 'Targets the soleus muscle specifically, adding width and girth to the lower leg profile.', instructions: 'Sit on the machine, placing the balls of your feet on the platform and lowering your heels to stretch the calves. Press up onto your toes as high as possible, then return to the stretched position.', mechanics: 'Isolation' },

  // SHOULDERS
  { id: 's1', name: 'Overhead Press', category: 'Shoulders', equipment: 'Barbell', target: 'Anterior Deltoids, Triceps', benefit: 'Builds explosive vertical pushing power, broad shoulders, and reinforces core bracing capacity.', instructions: 'Unrack the bar across your front delts. Brace your core and glutes, and press the bar straight up overhead, pushing your head through the "window" at the top.', mechanics: 'Compound' },
  { id: 's2', name: 'Lateral Raises', category: 'Shoulders', equipment: 'Dumbbell', target: 'Lateral Deltoids', benefit: 'Creates the highly sought-after "boulder shoulder" 3D aesthetic by isolating the middle head of the deltoid.', instructions: 'Stand with a dumbbell in each hand. Keep a slight bend in your elbows and raise the weights out to the side until your arms are parallel to the floor. Lower under control.', mechanics: 'Isolation' },
  { id: 's3', name: 'Face Pulls', category: 'Shoulders', equipment: 'Cable', target: 'Rear Deltoids, Rotator Cuff', benefit: 'Essential for shoulder health and posture, perfectly countering all the heavy pressing movements.', instructions: 'Attach a rope to a cable set at face height. Pull the rope towards your face, splitting the rope and driving your elbows out and back. Squeeze your rear delts and slowly return.', mechanics: 'Isolation' },
  { id: 's4', name: 'Arnold Press', category: 'Shoulders', equipment: 'Dumbbell', target: 'Anterior & Lateral Deltoids', benefit: 'Increases range of motion and hits multiple shoulder heads through its unique rotational movement.', instructions: 'Sit with dumbbells held in front of your face, palms facing you. As you press the weights overhead, rotate your wrists so your palms face forward at the top of the movement.', mechanics: 'Compound' },

  // ARMS
  { id: 'a1', name: 'Barbell Bicep Curl', category: 'Arms', equipment: 'Barbell', target: 'Biceps Brachii', benefit: 'The most efficient way to overload the biceps with maximum weight for peak arm hypertrophy.', instructions: 'Hold a barbell with an underhand grip, hands shoulder-width apart. Keep your elbows pinned to your sides and curl the bar up to your chest, then lower it slowly.', mechanics: 'Isolation' },
  { id: 'a2', name: 'Tricep Rope Pushdown', category: 'Arms', equipment: 'Cable', target: 'Triceps (Lateral & Medial Heads)', benefit: 'Keeps constant tension on the triceps to build horseshoe thickness and improve bench press lockout.', instructions: 'Hold a rope attachment on a high pulley. Pin your elbows to your sides and press the rope down, spreading the ends at the bottom to maximize the triceps contraction.', mechanics: 'Isolation' },
  { id: 'a3', name: 'Hammer Curls', category: 'Arms', equipment: 'Dumbbell', target: 'Brachialis, Brachioradialis', benefit: 'Develops forearm size and pushes the bicep up by growing the underlying brachialis muscle.', instructions: 'Hold dumbbells with a neutral grip (palms facing each other). Keeping elbows stationary, curl the weights up toward your shoulders, then lower them slowly.', mechanics: 'Isolation' },
  { id: 'a4', name: 'Skull Crushers', category: 'Arms', equipment: 'EZ Bar', target: 'Triceps (Long Head)', benefit: 'Deeply stretches the tricep long head for maximum muscle fiber recruitment and arm size.', instructions: 'Lie on a bench holding an EZ bar. Keep your upper arms stationary and bend your elbows to lower the bar toward your forehead or slightly behind your head. Press back up to the start.', mechanics: 'Isolation' },
  { id: 'a5', name: 'Preacher Curls', category: 'Arms', equipment: 'EZ Bar/Machine', target: 'Biceps (Short Head)', benefit: 'Strictly isolates the bicep by removing all momentum, creating an intense peak contraction.', instructions: 'Sit at a preacher bench with your triceps resting on the pad. Curl the weight fully up, squeeze, and lower slowly until your arms are almost completely straight.', mechanics: 'Isolation' },

  // CORE
  { id: 'co1', name: 'Hanging Leg Raises', category: 'Core', equipment: 'Bodyweight', target: 'Lower Abs, Hip Flexors', benefit: 'Intensely targets the elusive lower abdominals while improving grip strength and shoulder mobility.', instructions: 'Hang from a pull-up bar. Keeping your legs straight (or bent, for a regression), raise your toes toward the bar until your hips tilt slightly upward. Lower slowly, avoiding swinging.', mechanics: 'Compound' },
  { id: 'co2', name: 'Russian Twists', category: 'Core', equipment: 'Medicine Ball/Plate', target: 'Obliques, Core', benefit: 'Builds rotational core strength and carves out the V-taper of the abdominal wall.', instructions: 'Sit on the floor with knees bent and feet slightly elevated. Hold a weight with both hands, lean back slightly, and rotate your torso side to side, touching the weight to the floor.', mechanics: 'Isolation' },
  { id: 'co3', name: 'Plank', category: 'Core', equipment: 'Bodyweight', target: 'Transverse Abdominis', benefit: 'Builds deep core endurance and postural strength that translates directly into heavy compound lifts.', instructions: 'Support your body on your forearms and toes in a straight line from head to heels. Brace your core tightly and hold this position without letting your hips sag.', mechanics: 'Isometric' },
  { id: 'co4', name: 'Cable Crunches', category: 'Core', equipment: 'Cable', target: 'Rectus Abdominis (Upper Abs)', benefit: 'Allows you to add progressive overload (weight) directly to your crunch for thicker abdominal blocks.', instructions: 'Kneel in front of a high cable pulley holding a rope behind your neck. Crunch down using your abs, bringing your elbows toward your knees. Squeeze and slowly return to the top.', mechanics: 'Isolation' },

  // FULL BODY / CARDIO
  { id: 'f1', name: 'Kettlebell Swing', category: 'Full Body', equipment: 'Kettlebell', target: 'Glutes, Hamstrings, Core, Back', benefit: 'Melds cardio and resistance training. Builds extreme explosive hip power and burns high calories quickly.', instructions: 'Stand with feet shoulder-width apart holding a kettlebell. Hinge at the hips, let the bell swing between your legs, then violently thrust your hips forward to swing the bell to chest height.', mechanics: 'Compound' },
  { id: 'f2', name: 'Rowing Machine', category: 'Cardio', equipment: 'Machine', target: 'Back, Legs, Core, Cardiovascular', benefit: 'A low-impact, high-intensity cardio option that engages 86% of your body\'s muscles per stroke.', instructions: 'Sit on the rower, strap in your feet, and grip the handle. Push powerfully with your legs, lean back slightly, then pull the handle to your abdomen. Reverse the motion smoothly.', mechanics: 'Compound' },
  { id: 'f3', name: 'Burpees', category: 'Full Body', equipment: 'Bodyweight', target: 'Chest, Quads, Core, Cardio', benefit: 'The ultimate functional conditioning movement that spikes heart rate and builds muscular endurance everywhere.', instructions: 'From a standing position, drop into a squat, kick your feet back into a plank, do a push-up, jump your feet back to the squat position, and explosively jump straight up into the air.', mechanics: 'Compound' },
  { id: 'f4', name: 'Assault Bike', category: 'Cardio', equipment: 'Machine', target: 'Full Body, Cardiovascular', benefit: 'Scales infinitely with your effort level, making it perfect for grueling HIIT and VO2 max improvement.', instructions: 'Sit on the bike and forcefully push and pull the handles while simultaneously pedaling as hard as possible for intervals or distance.', mechanics: 'Compound' },
  { id: 'f5', name: 'Farmers Walk', category: 'Full Body', equipment: 'Dumbbell/Kettlebell', target: 'Forearms, Traps, Core, Legs', benefit: 'Builds terrifyingly strong grip, traps, and core stability through heavy, loaded carries.', instructions: 'Pick up two heavy dumbbells or kettlebells. Keep your chest tall, shoulders pulled back and down, and core locked as you walk forward with quick, controlled steps.', mechanics: 'Compound' }
];

export default function LibraryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredExercises = useMemo(() => {
    return EXERCISE_DATA.filter((exercise) => {
      const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            exercise.target.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || exercise.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.headerArea}>
        <View style={styles.searchBar}>
          <Search size={20} color={COLORS.textSecondary} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search exercises, muscles..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Filter size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Category Pills */}
      <View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <TouchableOpacity 
                key={cat} 
                style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                onPress={() => {
                  setActiveCategory(cat);
                  setExpandedId(null);
                }}
              >
                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Exercise List */}
      <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
        <Text style={styles.resultsText}>
          {filteredExercises.length} {filteredExercises.length === 1 ? 'Exercise' : 'Exercises'} Found
        </Text>

        {filteredExercises.map((exercise) => {
          const isExpanded = expandedId === exercise.id;
          
          return (
            <TouchableOpacity 
              key={exercise.id} 
              style={[styles.exerciseCard, isExpanded && styles.exerciseCardExpanded]}
              onPress={() => toggleExpand(exercise.id)}
              activeOpacity={0.9}
            >
              <View style={styles.cardMainRow}>
                <View style={styles.iconBox}>
                  <Dumbbell size={24} color={isExpanded ? COLORS.background : COLORS.primary} />
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseDetails}>{exercise.category} • {exercise.equipment}</Text>
                </View>
                <View style={styles.expandIcon}>
                  {isExpanded ? (
                    <ChevronUp size={20} color={COLORS.textSecondary} />
                  ) : (
                    <ChevronDown size={20} color={COLORS.textSecondary} />
                  )}
                </View>
              </View>

              {/* Accordion Detail View */}
              {isExpanded && (
                <View style={styles.expandedDetails}>
                  <View style={styles.detailDivider} />
                  
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Target Muscles</Text>
                    <Text style={styles.detailValue}>{exercise.target}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Primary Benefit</Text>
                    <Text style={styles.detailValue}>{exercise.benefit}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>How To Perform</Text>
                    <Text style={styles.detailValue}>{(exercise as any).instructions || 'Detailed instructions coming soon.'}</Text>
                  </View>

                  <View style={styles.tagRow}>
                    <View style={styles.infoTag}>
                      <Activity size={14} color={COLORS.background} />
                      <Text style={styles.infoTagText}>{exercise.mechanics}</Text>
                    </View>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {filteredExercises.length === 0 && (
          <View style={styles.emptyState}>
            <Dumbbell size={48} color={COLORS.border} />
            <Text style={styles.emptyStateTitle}>No exercises found</Text>
            <Text style={styles.emptyStateSubtext}>Try adjusting your search or filters.</Text>
          </View>
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
  headerArea: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    marginLeft: 12,
    fontSize: 16,
  },
  filterBtn: {
    width: 56,
    height: 56,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  categoriesContainer: {
    marginBottom: 8,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  categoryTextActive: {
    color: COLORS.background,
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  resultsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
    fontWeight: '500',
  },
  exerciseCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  exerciseCardExpanded: {
    borderColor: COLORS.primaryDim,
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseInfo: {
    marginLeft: 16,
    flex: 1,
    justifyContent: 'center',
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  exerciseDetails: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  expandIcon: {
    padding: 8,
  },
  expandedDetails: {
    marginTop: 16,
  },
  detailDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 16,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
  },
  tagRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  infoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  infoTagText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
