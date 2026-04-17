import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '@/services/firebase';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { NotificationService } from '@/services/NotificationService';
import { 
  collection, query, onSnapshot, addDoc, 
  serverTimestamp, orderBy, doc, setDoc, updateDoc 
} from 'firebase/firestore';

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

  userProfile: UserProfile | null;
  updateDisplayName: (name: string) => Promise<void>;
  getAIGuidance: () => { muscle: string; recommendation: string; reason: string } | null;
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

  // Auth state
  const [userId, setUserId] = useState<string | null>(null);

  // Auth Effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        signInAnonymously(auth);
      }
    });

    // Initialize Service Workers & Messaging
    NotificationService.registerServiceWorkers();
    
    return unsubscribe;
  }, []);

  // Sync History
  useEffect(() => {
    if (!userId) return;
    const q = query(
      collection(db, 'users', userId, 'workouts'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WorkoutSession[];
      setHistory(data);
    });
    return unsubscribe;
  }, [userId]);

  // Sync Body Entries
  useEffect(() => {
    if (!userId) return;
    const q = query(
      collection(db, 'users', userId, 'body_entries'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BodyEntry[];
      setBodyEntries(data);
    });
    return unsubscribe;
  }, [userId]);

  // Sync User Profile
  useEffect(() => {
    if (!userId) return;
    const docRef = doc(db, 'users', userId, 'profile', 'main');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserProfile(docSnap.data() as UserProfile);
      } else {
        // Initialize profile if not found
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
      setWorkoutTime(0); // Reset if exercises are cleared manually without finish
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
      // Removed alert here, wait to trigger it in UI or leave it silent globally to prevent annoying popups everywhere
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

      // Superpower: Push Notification on Completion
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

  const updateDisplayName = async (name: string) => {
    if (!userId) return;
    try {
      const docRef = doc(db, 'users', userId, 'profile', 'main');
      await setDoc(docRef, { displayName: name }, { merge: true });
    } catch (e) {
      console.error("Error updating display name: ", e);
    }
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

    // Analyze last 10 workouts
    history.slice(0, 10).forEach(session => {
      session.exercises.forEach(ex => {
        const muscle = muscleMap[ex.name];
        if (muscle && targetCounts[muscle] !== undefined) {
          targetCounts[muscle] += ex.sets.length;
        }
      });
    });

    // Find min
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
        userProfile, updateDisplayName,
        getAIGuidance
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
