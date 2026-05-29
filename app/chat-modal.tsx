import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '@/constants/Colors';
import { useWorkout, Exercise } from '@/context/WorkoutContext';
import { 
  X, Send, Sparkles, Activity, Droplets, Flame, Brain, 
  Dumbbell, MessageSquare, ChevronRight, CheckCircle2, RefreshCw 
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { EXERCISE_DATA } from './(tabs)/library';

type Message = {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  statusCard?: {
    type: 'readiness' | 'nutrition' | 'workout' | 'general';
    title: string;
    details: string[];
    actionLabel?: string;
    onAction?: () => void;
  };
};

const QUICK_PROMPTS = [
  { id: '1', label: '📊 How is my recovery today?', icon: '⚡' },
  { id: '2', label: '🥗 Suggest a high-protein recipe', icon: '🍗' },
  { id: '3', label: '💪 Suggest a workout routine', icon: '🏋️‍♂️' },
  { id: '4', label: '🔥 Check my calorie budget', icon: '🍎' },
];

export default function ChatModal() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const { 
    readinessScore, habits, nutrition, userProfile, 
    history, setExercises, setWorkoutTime, intensityCategory 
  } = useWorkout();

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  // Initialize with greeting
  useEffect(() => {
    const name = userProfile?.displayName || 'Athlete';
    const initialGreeting = `Hello ${name}! ⚡ I am Prakash AI, your elite athletic assistant.\n\nI have reviewed your physical biometric inputs for today. You currently have a Readiness Score of **${readinessScore}% (${intensityCategory})**.\n\nHow can I optimize your training, nutrition, or recovery schedule today?`;
    
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: initialGreeting,
        timestamp: new Date(),
        statusCard: {
          type: 'readiness',
          title: `Daily Readiness Dashboard`,
          details: [
            `Readiness Score: ${readinessScore}%`,
            `Status: ${intensityCategory}`,
            `Sleep Tracked: ${habits?.sleepHours || 0} hrs`,
            `Active Steps: ${habits?.steps || 0} steps`,
            `Hydration: ${habits?.waterGlasses || 0} / 8 glasses`
          ]
        }
      }
    ]);
  }, [userProfile, readinessScore, intensityCategory]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    scrollToBottom();

    // AI thinking effect
    setTimeout(() => {
      const response = generateAIResponse(textToSend);
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
      scrollToBottom();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1500);
  };

  const generateWorkoutRoutine = (): { workout: Exercise[]; text: string } => {
    // Determine target based on profile goal
    const goal = userProfile?.primaryGoal || 'Muscle Gain';
    let targetGroup = 'Chest';
    
    if (goal.includes('Fat Loss')) {
      targetGroup = 'Legs';
    } else if (goal.includes('General')) {
      targetGroup = 'Back';
    }

    const matchedExercises = EXERCISE_DATA.filter(e => e.target === targetGroup || e.target === 'Core').slice(0, 3);
    
    const routineExercises: Exercise[] = matchedExercises.map(ex => ({
      id: Math.random().toString(),
      name: ex.name,
      sets: [
        { id: Math.random().toString(), weight: '135', reps: '10', done: false },
        { id: Math.random().toString(), weight: '135', reps: '10', done: false },
        { id: Math.random().toString(), weight: '135', reps: '10', done: false }
      ]
    }));

    const text = `Based on your profile goal (${goal}) and today's readiness score of ${readinessScore}%, I have generated an optimal high-performance routine focused on **${targetGroup} & Core**.\n\n🏋️‍♂️ **Workout Plan:**\n${matchedExercises.map((e, idx) => `${idx + 1}. ${e.name} (3 Sets x 10 Reps)`).join('\n')}\n\nWould you like me to automatically load this routine directly into your active tracker screen?`;

    return { workout: routineExercises, text };
  };

  const loadWorkoutIntoTracker = (workout: Exercise[]) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setExercises(workout);
    setWorkoutTime(0);
    router.back();
    router.push('/track');
  };

  const generateAIResponse = (userText: string): Message => {
    const text = userText.toLowerCase();
    const id = Date.now().toString();

    // 1. Recovery & Readiness Query
    if (text.includes('recovery') || text.includes('readiness') || text.includes('sleep') || text.includes('steps') || text.includes('water')) {
      let advice = '';
      if (readinessScore >= 75) {
        advice = '🔥 **CNS Readiness is Optimal!** Your recovery markers (sleep, hydration, movement) are excellent. Today is the perfect day to target a new Personal Record (PR) or push heavy compound lifts!';
      } else if (readinessScore >= 50) {
        advice = '⚡ **Moderate Recovery Status.** You have stable bio-feedback, but there is room to improve hydration or sleep depth. Train at medium intensity; focus on hypertrophy with controlled, clean repetitions.';
      } else {
        advice = '⚠️ **High CNS Fatigue Alert.** Your recovery scores are low. I highly recommend an active recovery session (mobility/stretching) or a complete rest day to prevent overtraining and injury.';
      }

      return {
        id,
        sender: 'ai',
        text: `Here is your detailed recovery analysis for today:\n\n${advice}\n\nKeep focusing on meeting your recovery metrics consistently!`,
        timestamp: new Date(),
        statusCard: {
          type: 'readiness',
          title: `Biometric Breakdown`,
          details: [
            `• Readiness Score: ${readinessScore}%`,
            `• Intensity Limit: ${intensityCategory}`,
            `• Rest Captured: ${habits?.sleepHours || 0} / ${userProfile?.goals?.sleep || 8} hrs`,
            `• Daily Activity: ${habits?.steps || 0} / ${userProfile?.goals?.steps || 10000} steps`,
            `• Water Intake: ${habits?.waterGlasses || 0} / ${userProfile?.goals?.water || 8} glasses`
          ]
        }
      };
    }

    // 2. Workout Routine Query
    if (text.includes('workout') || text.includes('routine') || text.includes('exercise') || text.includes('train')) {
      const { workout, text: routineText } = generateWorkoutRoutine();
      return {
        id,
        sender: 'ai',
        text: routineText,
        timestamp: new Date(),
        statusCard: {
          type: 'workout',
          title: `Generated AI Routine`,
          details: workout.map(ex => `⚡ ${ex.name} - 3 Sets`),
          actionLabel: `⚡ Load Routine to Tracker`,
          onAction: () => loadWorkoutIntoTracker(workout)
        }
      };
    }

    // 3. Nutrition & Calorie budget Query
    if (text.includes('calorie') || text.includes('nutrition') || text.includes('recipe') || text.includes('food') || text.includes('meal') || text.includes('protein')) {
      const budget = userProfile?.goals?.calories || 2500;
      const consumed = nutrition?.calories || 0;
      const left = budget - consumed;

      let recipeAdvice = '';
      if (text.includes('recipe') || text.includes('protein')) {
        recipeAdvice = `\n\n💡 **Recommended Premium Recipe (High-Protein):**\n` +
          `• **Prakash Power Plate:** 200g Grilled Chicken Breast, 150g cooked Jasmine Rice, 80g steamed Broccoli.\n` +
          `• **Macros:** ~550 kcal (52g Protein, 48g Carbs, 10g Fats).\n` +
          `• *Tip:* Drizzle with high-quality olive oil and fresh lemon juice for optimal micro-nutrient absorption!`;
      }

      return {
        id,
        sender: 'ai',
        text: `Based on your goal to manage body composition, here is your real-time nutrition budget analysis:${recipeAdvice}`,
        timestamp: new Date(),
        statusCard: {
          type: 'nutrition',
          title: `Macro & Calorie Balance`,
          details: [
            `• Target Budget: ${budget} kcal`,
            `• Consumed Today: ${consumed} kcal`,
            `• Remaining Allowance: ${left} kcal`,
            `• Protein Ingested: ${nutrition?.protein || 0}g / ${userProfile?.goals?.protein || 180}g`,
            `• Carbs Ingested: ${nutrition?.carbs || 0}g / ${userProfile?.goals?.carbs || 250}g`,
            `• Fats Ingested: ${nutrition?.fat || 0}g / ${userProfile?.goals?.fat || 70}g`
          ]
        }
      };
    }

    // 4. Default dynamic fallback
    const goal = userProfile?.primaryGoal || 'Athletic Performance';
    return {
      id,
      sender: 'ai',
      text: `I understand! Let's optimize your strategy for **${goal}**.\n\nCould you tell me more about your specific goal for today? You can ask me to:\n\n• Analyze your readiness indices\n• Generate a dynamic high-performance workout\n• Give you macro-balanced recipe suggestions`,
      timestamp: new Date(),
    };
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <LinearGradient
          colors={['#18181b', '#09090b']}
          style={styles.header}
        >
          <View style={styles.headerLeft}>
            <View style={styles.aiAvatar}>
              <Brain size={24} color={COLORS.primary} />
              <View style={styles.onlineBadge} />
            </View>
            <View>
              <View style={styles.titleRow}>
                <Text style={styles.headerTitle}>Prakash AI</Text>
                <View style={styles.sparkleBadge}>
                  <Sparkles size={10} color="#fff" />
                  <Text style={styles.sparkleBadgeText}>PRO</Text>
                </View>
              </View>
              <Text style={styles.headerSubtitle}>Elite Fitness Intelligence</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <X size={22} color={COLORS.text} />
          </TouchableOpacity>
        </LinearGradient>

        {/* Message Panel */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatArea}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                msg.sender === 'user' ? styles.userRow : styles.aiRow
              ]}
            >
              {msg.sender === 'ai' && (
                <View style={styles.smallAvatar}>
                  <Brain size={14} color={COLORS.primary} />
                </View>
              )}

              <View style={styles.bubbleContainer}>
                <View
                  style={[
                    styles.bubble,
                    msg.sender === 'user' ? styles.userBubble : styles.aiBubble
                  ]}
                >
                  <Text
                    style={[
                      styles.bubbleText,
                      msg.sender === 'user' ? styles.userBubbleText : styles.aiBubbleText
                    ]}
                  >
                    {msg.text}
                  </Text>
                </View>

                {/* Status card integration */}
                {msg.statusCard && (
                  <View style={styles.statusCard}>
                    <LinearGradient
                      colors={
                        msg.statusCard.type === 'readiness'
                          ? ['rgba(139, 92, 246, 0.12)', 'rgba(217, 70, 239, 0.05)']
                          : msg.statusCard.type === 'nutrition'
                          ? ['rgba(16, 185, 129, 0.12)', 'rgba(5, 150, 105, 0.05)']
                          : ['rgba(59, 130, 246, 0.12)', 'rgba(29, 78, 216, 0.05)']
                      }
                      style={styles.statusCardInner}
                    >
                      <View style={styles.statusHeader}>
                        {msg.statusCard.type === 'readiness' && <Activity size={16} color={COLORS.primary} />}
                        {msg.statusCard.type === 'nutrition' && <Flame size={16} color="#10b981" />}
                        {msg.statusCard.type === 'workout' && <Dumbbell size={16} color="#3b82f6" />}
                        <Text style={styles.statusCardTitle}>{msg.statusCard.title}</Text>
                      </View>
                      
                      <View style={styles.statusCardLines}>
                        {msg.statusCard.details.map((line, idx) => (
                          <Text key={idx} style={styles.statusCardLineText}>
                            {line}
                          </Text>
                        ))}
                      </View>

                      {msg.statusCard.actionLabel && msg.statusCard.onAction && (
                        <TouchableOpacity 
                          style={styles.cardActionBtn} 
                          onPress={msg.statusCard.onAction}
                        >
                          <Text style={styles.cardActionBtnText}>
                            {msg.statusCard.actionLabel}
                          </Text>
                          <ChevronRight size={14} color={COLORS.background} />
                        </TouchableOpacity>
                      )}
                    </LinearGradient>
                  </View>
                )}
              </View>
            </View>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <View style={[styles.messageRow, styles.aiRow]}>
              <View style={styles.smallAvatar}>
                <Brain size={14} color={COLORS.primary} />
              </View>
              <View style={[styles.bubble, styles.aiBubble, styles.typingBubble]}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.typingText}>Prakash AI is crafting strategy...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick Prompts */}
        <View style={styles.quickPromptsSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.quickPromptsList}
          >
            {QUICK_PROMPTS.map((prompt) => (
              <TouchableOpacity
                key={prompt.id}
                style={styles.promptChip}
                onPress={() => handleSend(prompt.label)}
              >
                <Text style={styles.promptIcon}>{prompt.icon}</Text>
                <Text style={styles.promptLabel}>{prompt.label.replace(/^[^\s]+\s/, '')}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Ask Prakash AI anything..."
            placeholderTextColor={COLORS.textSecondary}
            onSubmitEditing={() => handleSend(input)}
            returnKeyType="send"
          />
          <TouchableOpacity 
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={() => handleSend(input)}
            disabled={!input.trim()}
          >
            <Send size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: 'bold',
  },
  sparkleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    gap: 2,
  },
  sparkleBadgeText: {
    color: COLORS.background,
    fontSize: 8,
    fontWeight: '900',
  },
  headerSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: 20,
    paddingBottom: 40,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 20,
    maxWidth: '85%',
  },
  userRow: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  aiRow: {
    alignSelf: 'flex-start',
    gap: 8,
  },
  smallAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  bubbleContainer: {
    gap: 8,
  },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
  },
  typingText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userBubbleText: {
    color: '#fff',
  },
  aiBubbleText: {
    color: COLORS.text,
  },
  // Status Cards
  statusCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    width: 280,
  },
  statusCardInner: {
    padding: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statusCardTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusCardLines: {
    gap: 6,
    marginBottom: 12,
  },
  statusCardLineText: {
    color: COLORS.textSecondary,
    fontSize: 12.5,
    lineHeight: 18,
  },
  cardActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.text,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  cardActionBtnText: {
    color: COLORS.background,
    fontSize: 12.5,
    fontWeight: 'bold',
  },
  // Quick Prompts list
  quickPromptsSection: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surfaceDark,
  },
  quickPromptsList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  promptIcon: {
    fontSize: 14,
  },
  promptLabel: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  // Input bar
  inputBar: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: '#09090b',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
    gap: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  }
});
