import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '@/services/firebase';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { NotificationService } from '@/services/NotificationService';
import { 
  collection, query, onSnapshot, addDoc, 
  serverTimestamp, orderBy, doc, setDoc, updateDoc 
} from 'firebase/firestore';
import { 
  calculateRecoveryScore, 
  calculateRecoveryModifier, 
  getIntensityCategory,
  RecoveryFactors
} from '@/services/ai-engine';

export type WorkoutSet = {
  id: string;
  weight: string;
  reps: string;
  done: boolean;
};

export type Exercise = {
  id: string;
  name: string;
  sets: WorkoutSet[];
};

export type WorkoutSession = {
  id: string;
  title: string;
  date: string;
  duration: string;
  volume: string;
  prs: number;
  exercises: Exercise[];
};

export type Routine = {
  id: string;
  name: string;
  exercises: Exercise[];
};

export type BodyEntry = {
  id: string;
  date: string;
  weight?: number;  // in lbs/kg
  bodyTemp?: number; // in °F
};

export type ProgressPhoto = {
  id: string;
  uri: string;
  date: string;
  note?: string;
};

export type UserProfile = {
  displayName: string;
  joinedDate: string;
  totalWorkouts: number;
  lifestyle?: string;
  fitnessLevel?: string;
  primaryGoal?: string;
  dnaLocked?: boolean;
  goals?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    water: number; // glasses
    sleep: number; // hours
    steps: number;
  };
};

export type DailyHabits = {
  id: string;
  date: string;
  waterGlasses: number;
  sleepHours: number;
  steps: number;
};

export type NutritionLog = {
  id: string;
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type WorkoutContextType = {
  // History
  history: WorkoutSession[];
  addWorkout: (session: WorkoutSession) => void;

  // Active Workout
  exercises: Exercise[];
  setExercises: React.Dispatch<React.SetStateAction<Exercise[]>>;
  workoutTime: number;
  setWorkoutTime: React.Dispatch<React.SetStateAction<number>>;
  
  // Routines
  routines: Routine[];

  // Timer
  timeLeft: number;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  initialTime: number;
  setInitialTime: React.Dispatch<React.SetStateAction<number>>;
  isTimerActive: boolean;
  setIsTimerActive: React.Dispatch<React.SetStateAction<boolean>>;

  // Progress Tracking
  bodyEntries: BodyEntry[];
  addBodyEntry: (entry: BodyEntry) => void;
  progressPhotos: ProgressPhoto[];
  addProgressPhoto: (photo: ProgressPhoto) => void;

  // Habits & Nutrition
  habits: DailyHabits | null;
  updateHabits: (habits: Partial<DailyHabits>) => void;
  nutrition: NutritionLog | null;
  updateNutrition: (nutrition: Partial<NutritionLog>) => void;

  userProfile: UserProfile | null;
  updateDisplayName: (name: string) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  getAIGuidance: () => { muscle: string; recommendation: string; reason: string } | null;
  readinessScore: number;
  recoveryModifier: number;
  intensityCategory: string;
};

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  // History state
  const [history, setHistory] = useState<WorkoutSession[]>([]);

  // Track state
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workoutTime, setWorkoutTime] = useState(0);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(90);
  const [initialTime, setInitialTime] = useState(90);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Progress Tracking state
  const [bodyEntries, setBodyEntries] = useState<BodyEntry[]>([]);
  const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>([]);
  
  // Profile state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Habits & Nutrition state
  const [habits, setHabits] = useState<DailyHabits | null>(null);
  const [nutrition, setNutrition] = useState<NutritionLog | null>(null);

  const readinessScore = calculateRecoveryScore({
    waterGlasses: habits?.waterGlasses || 0,
    sleepHours: habits?.sleepHours || 0,
    steps: habits?.steps || 0
  });

  const recoveryModifier = calculateRecoveryModifier(readinessScore);
  const intensityCategory = getIntensityCategory(readinessScore);

  const today = new Date().toISOString().split('T')[0];

  // Auth state
  const [userId, setUserId] = useState<string | null>(null);

  // Auth Effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        signInAnonymously(auth).catch((err) => {
          console.error("Firebase Auth initialization failed. Please enable Anonymous Auth in the Firebase Console.", err);
        });
      }
    });

    // Initialize Service Workers & Messaging
    NotificationService.registerServiceWorkers();
    
    return unsubscribe;
  }, []);

  // Sync Data
  useEffect(() => {
    if (!userId) return;

    const unsubHistory = onSnapshot(query(collection(db, 'users', userId, 'workouts'), orderBy('createdAt', 'desc')), (snapshot) => {
      setHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkoutSession)));
    });

    const unsubBody = onSnapshot(query(collection(db, 'users', userId, 'body'), orderBy('date', 'desc')), (snapshot) => {
      setBodyEntries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BodyEntry)));
    });

    const unsubHabits = onSnapshot(doc(db, 'users', userId, 'habits', today), (snapshot) => {
      if (snapshot.exists()) {
        setHabits({ id: snapshot.id, ...snapshot.data() } as DailyHabits);
      } else {
        setHabits({ id: today, date: today, waterGlasses: 0, sleepHours: 0, steps: 0 });
      }
    });

    const unsubNutrition = onSnapshot(doc(db, 'users', userId, 'nutrition', today), (snapshot) => {
      if (snapshot.exists()) {
        setNutrition({ id: snapshot.id, ...snapshot.data() } as NutritionLog);
      } else {
        setNutrition({ id: today, date: today, calories: 0, protein: 0, carbs: 0, fat: 0 });
      }
    });

    return () => {
      unsubHistory();
      unsubBody();
      unsubHabits();
      unsubNutrition();
    };
  }, [userId, today]);

  // Sync User Profile
  useEffect(() => {
    if (!userId) return;
    const docRef = doc(db, 'users', userId, 'profile', 'main');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const profileData = docSnap.data();
        setUserProfile({
          displayName: profileData.displayName || 'Athlete',
          joinedDate: profileData.joinedDate || new Date().toLocaleDateString(),
          totalWorkouts: profileData.totalWorkouts || 0,
          lifestyle: profileData.lifestyle || '',
          fitnessLevel: profileData.fitnessLevel || '',
          primaryGoal: profileData.primaryGoal || '',
          dnaLocked: profileData.dnaLocked || false,
          goals: profileData.goals || {
            calories: 2500,
            protein: 180,
            carbs: 250,
            fat: 70,
            water: 8,
            sleep: 8,
            steps: 10000
          }
        });
      } else {
        const initialProfile: UserProfile = {
          displayName: 'New Athlete',
          joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          totalWorkouts: 0
        };
        setDoc(docRef, initialProfile);
        setUserProfile(initialProfile);
      }
    });
    return unsubscribe;
  }, [userId]);

  // Routines state
  const [routines] = useState<Routine[]>([
    {
      id: '1',
      name: 'Full Body A',
      exercises: [
        { 
          id: 'fb1', name: 'Barbell Squat', 
          sets: [{ id: 's1', weight: '135', reps: '10', done: false }, { id: 's2', weight: '135', reps: '10', done: false }] 
        },
        { 
          id: 'fb2', name: 'Bench Press', 
          sets: [{ id: 's3', weight: '95', reps: '10', done: false }, { id: 's4', weight: '95', reps: '10', done: false }] 
        },
        { 
          id: 'fb3', name: 'Deadlift', 
          sets: [{ id: 's5', weight: '185', reps: '5', done: false }] 
        },
      ]
    },
    {
      id: '2',
      name: 'Push Day',
      exercises: [
        { 
          id: 'p1', name: 'Overhead Press', 
          sets: [{ id: 'ps1', weight: '65', reps: '10', done: false }, { id: 'ps2', weight: '65', reps: '10', done: false }] 
        },
        { 
          id: 'p2', name: 'Incline Bench', 
          sets: [{ id: 'ps3', weight: '85', reps: '10', done: false }] 
        },
        { 
          id: 'p3', name: 'Tricep Pushdowns', 
          sets: [{ id: 'ps4', weight: '40', reps: '12', done: false }] 
        },
      ]
    },
    {
      id: '3',
      name: 'Legs & Core',
      exercises: [
        { 
          id: 'l1', name: 'Leg Press', 
          sets: [{ id: 'ls1', weight: '200', reps: '12', done: false }] 
        },
        { 
          id: 'l2', name: 'Lunges', 
          sets: [{ id: 'ls2', weight: '30', reps: '10', done: false }] 
        },
        { 
          id: 'l3', name: 'Plank', 
          sets: [{ id: 'ls3', weight: '0', reps: '60s', done: false }] 
        },
      ]
    }
  ]);

  // Global Workout Timer
  useEffect(() => {
    let timer: any;
    if (exercises.length > 0) {
      timer = setInterval(() => {
        setWorkoutTime((prev) => prev + 1);
      }, 1000);
    } else {
      setWorkoutTime(0);
    }
    return () => clearInterval(timer);
  }, [exercises.length]);

  // Global Rest Timer
  useEffect(() => {
    let interval: any = null;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerActive) {
      setIsTimerActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  const addWorkout = async (session: WorkoutSession) => {
    if (!userId) return;
    try {
      await addDoc(collection(db, 'users', userId, 'workouts'), {
        ...session,
        createdAt: serverTimestamp()
      });
      setExercises([]);
      setWorkoutTime(0);

      NotificationService.sendLocalNotification(
        "Workout Logged! 🔥",
        `Great job on "${session.title}". Vol: ${session.volume}`
      );
    } catch (e) {
      console.error("Error adding workout: ", e);
    }
  };

  const addBodyEntry = async (entry: BodyEntry) => {
    if (!userId) return;
    try {
      await addDoc(collection(db, 'users', userId, 'body_entries'), {
        ...entry,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Error adding body entry: ", e);
    }
  };

  const addProgressPhoto = async (photo: ProgressPhoto) => {
    if (!userId) return;
    try {
      await addDoc(collection(db, 'users', userId, 'photos'), {
        ...photo,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Error adding photo: ", e);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!userId) return;
    try {
      const docRef = doc(db, 'users', userId, 'profile', 'main');
      await setDoc(docRef, updates, { merge: true });
    } catch (e) {
      console.error('Error updating profile:', e);
    }
  };

  const updateDisplayName = async (name: string) => {
    await updateProfile({ displayName: name });
  };

  const updateHabits = async (newHabits: Partial<DailyHabits>) => {
    if (!auth.currentUser) return;
    const habitsRef = doc(db, 'users', auth.currentUser.uid, 'habits', today);
    await setDoc(habitsRef, { ...newHabits, date: today }, { merge: true });
  };

  const updateNutrition = async (newNutrition: Partial<NutritionLog>) => {
    if (!auth.currentUser) return;
    const nutritionRef = doc(db, 'users', auth.currentUser.uid, 'nutrition', today);
    
    const updated = {
      calories: (nutrition?.calories || 0) + (newNutrition.calories || 0),
      protein: (nutrition?.protein || 0) + (newNutrition.protein || 0),
      carbs: (nutrition?.carbs || 0) + (newNutrition.carbs || 0),
      fat: (nutrition?.fat || 0) + (newNutrition.fat || 0),
      date: today
    };

    await setDoc(nutritionRef, updated, { merge: true });
  };

  const getAIGuidance = () => {
    if (history.length === 0) return null;

    const muscleMap: { [key: string]: string } = {
      'Bench Press': 'Chest',
      'Incline Bench': 'Chest',
      'Barbell Squat': 'Legs',
      'Leg Press': 'Legs',
      'Deadlift': 'Back/Legs',
      'Overhead Press': 'Shoulders',
      'Tricep Pushdowns': 'Arms',
      'Lunges': 'Legs',
      'Plank': 'Core'
    };

    const suggestions: { [key: string]: string } = {
      'Chest': 'Dumbbell Flys',
      'Legs': 'Bulgarian Split Squats',
      'Back/Legs': 'Lat Pulldowns',
      'Shoulders': 'Lateral Raises',
      'Arms': 'Bicep Curls',
      'Core': 'Hanging Leg Raises'
    };

    const targetCounts: { [key: string]: number } = {
      'Chest': 0, 'Legs': 0, 'Back/Legs': 0, 'Shoulders': 0, 'Arms': 0, 'Core': 0
    };

    history.slice(0, 10).forEach(session => {
      session.exercises.forEach(ex => {
        const muscle = muscleMap[ex.name];
        if (muscle && targetCounts[muscle] !== undefined) {
          targetCounts[muscle] += ex.sets.length;
        }
      });
    });

    let minMuscle = 'Chest';
    let minCount = Infinity;
    Object.keys(targetCounts).forEach(m => {
      if (targetCounts[m] < minCount) {
        minCount = targetCounts[m];
        minMuscle = m;
      }
    });

    return {
      muscle: minMuscle,
      recommendation: suggestions[minMuscle] || 'Mixed Cardio',
      reason: `You target ${minMuscle} the least in your recent logs.`
    };
  };

  return (
    <WorkoutContext.Provider 
      value={{ 
        history, addWorkout,
        exercises, setExercises, workoutTime, setWorkoutTime,
        routines,
        timeLeft, setTimeLeft, initialTime, setInitialTime, isTimerActive, setIsTimerActive,
        bodyEntries, addBodyEntry, progressPhotos, addProgressPhoto,
        userProfile,
        updateDisplayName,
        updateProfile,
        getAIGuidance,
        habits,
        updateHabits,
        nutrition,
        updateNutrition,
        readinessScore,
        recoveryModifier,
        intensityCategory
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
}
