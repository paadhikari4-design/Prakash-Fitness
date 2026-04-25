import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS } from '@/constants/Colors';
import { Check, Plus, Trash2, Play, Activity, Mic, MicOff, Ghost, Camera, Copy, Search } from 'lucide-react-native';
import { useWorkout, WorkoutSession, Exercise, Routine } from '@/context/WorkoutContext';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { EXERCISE_DATA } from '@/app/(tabs)/library'; // Import shared library

export default function TrackScreen() {
  const { history, addWorkout, exercises, setExercises, workoutTime, setWorkoutTime, routines, userProfile } = useWorkout();
  const [voiceMode, setVoiceMode] = useState(false);
  const [activeExerciseSearchId, setActiveExerciseSearchId] = useState<string | null>(null);
  const router = useRouter();

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const addExercise = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: '',
      sets: [{ id: Date.now().toString(), weight: '', reps: '', done: false }],
    };
    setExercises([...exercises, newExercise]);
  };

  const speak = (text: string) => {
    if (Platform.OS === 'web' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1; // energetic
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleVoiceMode = () => {
    const newState = !voiceMode;
    setVoiceMode(newState);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (newState) {
      speak("Voice Mode activated. I'll read your sets and advance automatically after a break.");
    } else {
      speak("Voice Mode deactivated.");
    }
  };

  const getGhostSet = (exerciseName: string, setIndex: number) => {
    if (!exerciseName) return null;
    for (let i = 0; i < history.length; i++) {
        // history is sorted newest to oldest presumably, or oldest to newest?
        // Wait, history appends new sessions so history[history.length - 1] is newest.
    }
    for (let i = history.length - 1; i >= 0; i--) {
      const match = history[i].exercises.find(e => e.name.toLowerCase().trim() === exerciseName.toLowerCase().trim());
      if (match && match.sets[setIndex]) {
        const s = match.sets[setIndex];
        if (s.weight && s.reps) return `${s.weight} lbs × ${s.reps}`;
      }
    }
    return null;
  };

  const startRoutine = (routine: Routine) => {
    // Generate new IDs for everything to ensure they are unique and fresh for this session
    const freshExercises: Exercise[] = routine.exercises.map(ex => ({
      ...ex,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      sets: ex.sets.map(s => ({
        ...s,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        done: false // Ensure all sets are marked as not done initially
      }))
    }));
    setExercises(freshExercises);
  };

  const removeExercise = (exerciseId: string) => {
    setExercises(exercises.filter(e => e.id !== exerciseId));
  };

  const updateExerciseName = (exerciseId: string, name: string) => {
    setExercises(exercises.map(e => (e.id === exerciseId ? { ...e, name } : e)));
  };

  const addSet = (exerciseId: string) => {
    setExercises(exercises.map(e => {
      if (e.id !== exerciseId) return e;
      const lastSet = e.sets[e.sets.length - 1];
      return {
        ...e,
        sets: [...e.sets, { 
          id: Date.now().toString(), 
          weight: lastSet ? lastSet.weight : '', 
          reps: lastSet ? lastSet.reps : '', 
          done: false 
        }],
      };
    }));
  };

  const cloneSet = (exerciseId: string, setIndex: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExercises(exercises.map(e => {
      if (e.id !== exerciseId) return e;
      const targetSet = e.sets[setIndex];
      const newSet = {
        ...targetSet,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
        done: false
      };
      const newSets = [...e.sets];
      newSets.splice(setIndex + 1, 0, newSet);
      return { ...e, sets: newSets };
    }));
  };

  const updateSet = (exerciseId: string, setId: string, field: 'weight' | 'reps', value: string) => {
    setExercises(exercises.map(e => {
      if (e.id !== exerciseId) return e;
      return {
        ...e,
        sets: e.sets.map(s => (s.id === setId ? { ...s, [field]: value } : s)),
      };
    }));
  };

  const toggleSetDone = (exerciseId: string, setId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    let nextSetText = '';

    setExercises(exercises.map(e => {
      if (e.id !== exerciseId) return e;
      
      const setIdx = e.sets.findIndex(s => s.id === setId);
      const isFinishing = !e.sets[setIdx].done;

      if (voiceMode && isFinishing) {
        if (setIdx + 1 < e.sets.length) {
          nextSetText = `Good set! Rest up. Next is Set ${setIdx + 2} of ${e.name || 'this exercise'}.`;
        } else {
          nextSetText = `Well done! You finished ${e.name || 'this exercise'}.`;
        }
      }

      return {
        ...e,
        sets: e.sets.map(s => (s.id === setId ? { ...s, done: !s.done } : s)),
      };
    }));

    if (nextSetText) {
      // Small timeout so the haptic check happens before speaking
      setTimeout(() => speak(nextSetText), 800);
    }
  };

  const finishWorkout = () => {
    if (exercises.length === 0) {
      Alert.alert('Empty Workout', 'Add some exercises before finishing!');
      return;
    }

    let totalVolume = 0;
    exercises.forEach(e => {
      e.sets.forEach(s => {
        if (s.done && s.weight && s.reps) {
          totalVolume += (parseInt(s.weight) || 0) * (parseInt(s.reps) || 0);
        }
      });
    });

    const session: WorkoutSession = {
      id: Date.now().toString(),
      title: exercises[0]?.name || 'Custom Workout',
      date: new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', weekday: 'short', month: 'short', day: 'numeric' }),
      duration: formatTime(workoutTime),
      volume: `${totalVolume.toLocaleString()} lbs`,
      prs: 0,
      exercises: [...exercises], // Save current exercises with their final set data
    };

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Finish Workout', 
      'Great job! Your workout has been saved.',
      [{ 
        text: 'OK', 
        onPress: () => {
          addWorkout(session);
        }
      }]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text style={styles.workoutTitle}>Active Workout</Text>
          <TouchableOpacity onPress={toggleVoiceMode} style={[styles.voiceBtn, voiceMode && styles.voiceBtnActive]}>
            {voiceMode ? <Mic size={20} color={COLORS.background} /> : <MicOff size={20} color={COLORS.textSecondary} />}
          </TouchableOpacity>
        </View>
        <Text style={styles.workoutTime}>{formatTime(workoutTime)}</Text>
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {exercises.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Ready to crush it?</Text>
              <Text style={styles.emptyStateSubtext}>Choose a preset or add an exercise to get started.</Text>
            </View>

            <Text style={styles.sectionTitle}>Presets & Routines</Text>
            <View style={styles.routinesGrid}>
              {routines.map((routine) => (
                <TouchableOpacity 
                  key={routine.id} 
                  style={styles.routineCard}
                  onPress={() => startRoutine(routine)}
                >
                  <View style={styles.routineIconContainer}>
                    <Activity size={24} color={COLORS.primary} />
                  </View>
                  <View style={styles.routineInfo}>
                    <Text style={styles.routineName}>{routine.name}</Text>
                    <Text style={styles.routineMeta}>{routine.exercises.length} Exercises</Text>
                  </View>
                  <Play size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          exercises.map((exercise) => (
            <View key={exercise.id} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <TextInput
                  style={styles.exerciseNameInput}
                  placeholder="Exercise Name..."
                  placeholderTextColor={COLORS.textSecondary}
                  value={exercise.name}
                  onChangeText={(text) => {
                    updateExerciseName(exercise.id, text);
                    setActiveExerciseSearchId(text ? exercise.id : null);
                  }}
                  onFocus={() => setActiveExerciseSearchId(exercise.name ? exercise.id : null)}
                  onBlur={() => setTimeout(() => setActiveExerciseSearchId(null), 200)}
                />
                <TouchableOpacity onPress={() => removeExercise(exercise.id)} style={styles.deleteBtn}>
                  <Trash2 size={20} color="#ff4444" />
                </TouchableOpacity>
              </View>

              {activeExerciseSearchId === exercise.id && exercise.name.length > 0 && (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  style={styles.suggestionRow}
                  contentContainerStyle={{ paddingHorizontal: 4 }}
                >
                  {EXERCISE_DATA.filter(ex => ex.name.toLowerCase().includes(exercise.name.toLowerCase()))
                    .slice(0, 8)
                    .map(suggestion => (
                      <TouchableOpacity 
                        key={suggestion.id} 
                        style={styles.suggestionBadge}
                        onPress={() => {
                          updateExerciseName(exercise.id, suggestion.name);
                          setActiveExerciseSearchId(null);
                        }}
                      >
                        <Text style={styles.suggestionText}>{suggestion.name}</Text>
                      </TouchableOpacity>
                    ))
                  }
                </ScrollView>
              )}

              <View style={styles.setListHeader}>
                <Text style={[styles.setColumnText, { width: 40 }]}>Set</Text>
                <Text style={[styles.setColumnText, { flex: 1 }]}>lbs</Text>
                <Text style={[styles.setColumnText, { flex: 1 }]}>Reps</Text>
                <Text style={[styles.setColumnText, { width: 40 }]}></Text>
              </View>

              {exercise.sets.map((set, index) => {
                const ghostData = getGhostSet(exercise.name, index);
                
                return (
                  <View key={set.id} style={{ marginBottom: 12 }}>
                    <View style={[styles.setRow, set.done && styles.setRowDone]}>
                      <Text style={styles.setNumber}>{index + 1}</Text>
                      
                      <View style={styles.inputCell}>
                        <TextInput
                          style={styles.inputValue}
                          keyboardType="numeric"
                          placeholder="-"
                          placeholderTextColor={COLORS.textSecondary}
                          value={set.weight}
                          onChangeText={(val) => updateSet(exercise.id, set.id, 'weight', val)}
                          editable={!set.done}
                        />
                      </View>
                      
                      <View style={styles.inputCell}>
                        <TextInput
                          style={styles.inputValue}
                          keyboardType="numeric"
                          placeholder="-"
                          placeholderTextColor={COLORS.textSecondary}
                          value={set.reps}
                          onChangeText={(val) => updateSet(exercise.id, set.id, 'reps', val)}
                          editable={!set.done}
                        />
                      </View>

                      <TouchableOpacity 
                        style={[styles.checkBtn, set.done && styles.checkBtnDone]}
                        onPress={() => toggleSetDone(exercise.id, set.id)}
                      >
                        <Check size={16} color={set.done ? COLORS.background : COLORS.textSecondary} />
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={styles.cloneBtn}
                        onPress={() => cloneSet(exercise.id, index)}
                      >
                        <Copy size={16} color={COLORS.primary} />
                      </TouchableOpacity>
                    </View>
                    
                    {ghostData && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, paddingLeft: 40, gap: 6 }}>
                        <Ghost size={14} color={COLORS.textSecondary} />
                        <Text style={{ color: COLORS.textSecondary, fontSize: 12 }}>Past: {ghostData}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
              
              <TouchableOpacity style={styles.addSetBtn} onPress={() => addSet(exercise.id)}>
                <Plus size={16} color={COLORS.primary} />
                <Text style={styles.addSetText}>Add Set</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        <TouchableOpacity style={styles.addExerciseBtn} onPress={addExercise}>
          <Plus size={20} color={COLORS.background} />
          <Text style={styles.addExerciseBtnText}>Add Exercise</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={{ width: '100%' }} onPress={finishWorkout} activeOpacity={0.8}>
          <LinearGradient 
            colors={['#8b5cf6', '#6d28d9']} 
            style={[styles.finishBtn, { borderColor: 'transparent' }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={[styles.finishBtnText, { color: COLORS.background }]}>Finish Workout</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.hyperScanFab} 
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push('/(tabs)/scanner');
        }}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#10b981', '#059669']}
          style={styles.hyperScanInner}
        >
          <Camera size={28} color="#fff" />
          <View style={styles.hyperScanBadge}>
            <Text style={styles.hyperScanBadgeText}>AI</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </KeyboardAvoidingView>
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
  workoutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  workoutTime: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyStateContainer: {
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginTop: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
    marginTop: 8,
  },
  routinesGrid: {
    gap: 12,
  },
  routineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  routineIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  routineInfo: {
    flex: 1,
  },
  routineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  routineMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
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
  },
  voiceBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  voiceBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  addExerciseBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  addExerciseBtnText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  exerciseCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  exerciseNameInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  deleteBtn: {
    padding: 8,
  },
  setListHeader: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  setColumnText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
  },
  setRowDone: {
    backgroundColor: 'rgba(0, 255, 157, 0.05)',
    borderWidth: 1,
    borderColor: COLORS.primaryDim,
  },
  setNumber: {
    width: 40,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  inputCell: {
    flex: 1,
    backgroundColor: COLORS.surface,
    marginHorizontal: 4,
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
  },
  inputValue: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
    textAlign: 'center',
  },
  checkBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  checkBtnDone: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  addSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  addSetText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background, // Match container exactly to prevent safe area gap
  },
  finishBtn: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  finishBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  suggestionRow: {
    marginBottom: 12,
    marginTop: -4,
  },
  suggestionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceLight,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  suggestionText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '500',
  },
  cloneBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(110, 89, 255, 0.2)',
  },
  hyperScanFab: {
    position: 'absolute',
    bottom: 90, // Higher than tab bar
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  hyperScanInner: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hyperScanBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#000',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  hyperScanBadgeText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
