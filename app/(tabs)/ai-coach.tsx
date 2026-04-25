import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions, ScrollView } from 'react-native';
import { COLORS } from '@/constants/Colors';
import { Activity, ShieldAlert, Zap, Target, RotateCcw, X, Info, ChevronDown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Types ──────────────────────────────────────────────────────────────────
type FeedbackLevel = 'good' | 'warn' | 'idle';

export default function AICoachScreen() {
  const isFocused = useIsFocused();
  const [status, setStatus] = useState<'idle' | 'loading' | 'running' | 'error' | 'denied'>('idle');

  // Prevent background processing on web
  if (Platform.OS === 'web' && !isFocused) return null;
  const [reps, setReps] = useState(0);
  const [feedback, setFeedback] = useState('Select exercise to start AI tracking');
  const [feedbackLevel, setFeedbackLevel] = useState<FeedbackLevel>('idle');
  const [selectedExercise, setSelectedExercise] = useState('Squat');
  const [fps, setFps] = useState(0);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [showExercises, setShowExercises] = useState(true);

  const videoRef = useRef<any>(null);
  const canvasRef = useRef<any>(null);
  const detectorRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const feedbackRef = useRef(feedback);
  const feedbackLevelRef = useRef<FeedbackLevel>(feedbackLevel);
  const fpsCountRef = useRef(0);
  const fpsTimerRef = useRef(Date.now());

  // States for counters
  const stateRef = useRef<any>({
    squat: 'up',
    pushup: 'up',
    lunge: 'up',
    curl: 'down',
    generic: 'down'
  });

  const EXERCISES = [
    'Squat', 'Push-Up', 'Shoulder Press', 'Bicep Curl', 'Lunge', 'Deadlift', 
    'Lateral Raise', 'Jumping Jacks', 'Burpee', 'Sit-Up'
  ];

  const updateFeedback = (msg: string, lvl: FeedbackLevel = feedbackLevelRef.current) => {
    if (feedbackRef.current !== msg || feedbackLevelRef.current !== lvl) {
      feedbackRef.current = msg;
      feedbackLevelRef.current = lvl;
      setFeedback(msg);
      setFeedbackLevel(lvl);
    }
  };

  useEffect(() => {
    if (!isFocused) {
      stopAll();
    }
    return () => stopAll();
  }, [isFocused]);

  const stopAll = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t: any) => t.stop());
      videoRef.current.srcObject = null;
    }
  };

  const loadModel = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const tfScript = document.createElement('script');
      tfScript.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.10.0/dist/tf.min.js';
      tfScript.onload = () => {
        const poseScript = document.createElement('script');
        poseScript.src = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.1.3/dist/pose-detection.min.js';
        poseScript.onload = async () => {
          try {
            const tf = (window as any).tf;
            const poseDetection = (window as any).poseDetection;
            if (!tf || !poseDetection) { resolve(false); return; }
            
            try {
              await tf.setBackend('webgl');
              await tf.ready();
            } catch (e) {
              console.warn("WebGL backend failed, falling back to CPU", e);
              await tf.setBackend('cpu');
              await tf.ready();
            }

            detectorRef.current = await poseDetection.createDetector(
              poseDetection.SupportedModels.MoveNet,
              { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
            );
            resolve(true);
          } catch { resolve(false); }
        };
        document.head.appendChild(poseScript);
      };
      document.head.appendChild(tfScript);
    });
  };

  const handleStart = async () => {
    if (Platform.OS !== 'web') return;
    setStatus('loading');
    
    if (!navigator?.mediaDevices?.getUserMedia) {
      updateFeedback('Camera API not available in this browser', 'warn');
      setStatus('error');
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
    } catch { setStatus('denied'); return; }

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }

    if (!modelLoaded) {
      const ok = await loadModel();
      if (!ok) { setStatus('error'); return; }
      setModelLoaded(true);
    }

    setStatus('running');
    updateFeedback(`Ready! Center your body.`, 'idle');
    runDetectionLoop();
  };

  const runDetectionLoop = useCallback(async () => {
    if (!isFocused) return;
    if (!detectorRef.current || !videoRef.current || !canvasRef.current) {
      rafRef.current = requestAnimationFrame(runDetectionLoop);
      return;
    }

    const video = videoRef.current;
    if (video.readyState < 2) {
      rafRef.current = requestAnimationFrame(runDetectionLoop);
      return;
    }

    try {
      const poses = await detectorRef.current.estimatePoses(video);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx) {
        rafRef.current = requestAnimationFrame(runDetectionLoop);
        return;
      }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (poses?.length > 0) {
        const kps = poses[0].keypoints;
        drawSkeleton(ctx, kps);
        analyzeForm(kps);
      } else {
        updateFeedback('No person detected. Fit your full body in frame.', 'warn');
      }
    } catch {}

    fpsCountRef.current++;
    const now = Date.now();
    if (now - fpsTimerRef.current >= 1000) {
      setFps(fpsCountRef.current);
      fpsCountRef.current = 0;
      fpsTimerRef.current = now;
    }
    rafRef.current = requestAnimationFrame(runDetectionLoop);
  }, [selectedExercise]);

  const drawSkeleton = (ctx: any, kps: any[]) => {
    const PAIRS = [['left_shoulder','right_shoulder'],['left_shoulder','left_elbow'],['left_elbow','left_wrist'],['right_shoulder','right_elbow'],['right_elbow','right_wrist'],['left_shoulder','left_hip'],['right_shoulder','right_hip'],['left_hip','right_hip'],['left_hip','left_knee'],['left_knee','left_ankle'],['right_hip','right_knee'],['right_knee','right_ankle']];
    const kpMap: any = {};
    kps.forEach(k => { kpMap[k.name] = k; });
    
    ctx.strokeStyle = feedbackLevelRef.current === 'good' ? '#10b981AA' : '#8b5cf6AA';
    ctx.lineWidth = 4;
    PAIRS.forEach(([a, b]) => {
      const A = kpMap[a]; const B = kpMap[b];
      if (A?.score > 0.4 && B?.score > 0.4) {
        ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
      }
    });
    kps.forEach(kp => {
      if (kp.score > 0.4) {
        ctx.beginPath(); ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#fff'; ctx.fill();
        ctx.strokeStyle = '#8b5cf6'; ctx.stroke();
      }
    });
  };

  const calcAngle = (A: any, B: any, C: any) => {
    const rad = Math.atan2(C.y - B.y, C.x - B.x) - Math.atan2(A.y - B.y, A.x - B.x);
    let angle = Math.abs((rad * 180) / Math.PI);
    if (angle > 180) angle = 360 - angle;
    return angle;
  };

  const analyzeForm = (kps: any[]) => {
    const kpMap: any = {};
    kps.forEach(k => { kpMap[k.name] = k; });
    const conf = (n: string) => kpMap[n]?.score > 0.4;

    if (selectedExercise === 'Squat') {
      if (conf('left_hip') && conf('left_knee') && conf('left_ankle')) {
        const angle = calcAngle(kpMap['left_hip'], kpMap['left_knee'], kpMap['left_ankle']);
        if (angle > 160) {
          if (stateRef.current.squat === 'down') setReps(r => r + 1);
          stateRef.current.squat = 'up';
          updateFeedback('Form active. Squat down.', 'idle');
        } else if (angle < 95) {
          stateRef.current.squat = 'down';
          updateFeedback('Great depth! Stand up.', 'good');
        }
      }
    } else if (selectedExercise === 'Push-Up') {
       if (conf('left_shoulder') && conf('left_elbow') && conf('left_wrist')) {
         const angle = calcAngle(kpMap['left_shoulder'], kpMap['left_elbow'], kpMap['left_wrist']);
         if (angle > 160) {
           if (stateRef.current.pushup === 'down') setReps(r => r + 1);
           stateRef.current.pushup = 'up';
           updateFeedback('Lower chest to floor.', 'idle');
         } else if (angle < 90) {
           stateRef.current.pushup = 'down';
           updateFeedback('Push back up!', 'good');
         }
       }
    } else if (selectedExercise === 'Bicep Curl') {
       if (conf('left_shoulder') && conf('left_elbow') && conf('left_wrist')) {
          const angle = calcAngle(kpMap['left_shoulder'], kpMap['left_elbow'], kpMap['left_wrist']);
          if (angle > 160) {
            if (stateRef.current.curl === 'up') setReps(r => r + 1);
            stateRef.current.curl = 'down';
            updateFeedback('Extend fully.', 'idle');
          } else if (angle < 40) {
            stateRef.current.curl = 'up';
            updateFeedback('Squeeze bicep!', 'good');
          }
       }
    } else {
      updateFeedback('Performing ' + selectedExercise, 'idle');
    }
  };

  if (Platform.OS !== 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.errorOverlay}>
          <ShieldAlert size={50} color={COLORS.primary} />
          <Text style={styles.errorText}>WEB BROWSER REQUIRED</Text>
          <Text style={styles.errorSub}>The Vision AI Hub requires high-performance WebGL processing. Please open ironpulse-app-2026.web.app to use the coach.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ── Background Video Layer ── */}
      <View style={styles.visualContainer}>
        {React.createElement('video', {
          ref: videoRef,
          style: { width: '100%', height: '100%', objectFit: 'cover' },
          autoPlay: true, playsInline: true, muted: true,
        })}
        {React.createElement('canvas', {
          ref: canvasRef,
          style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 },
        })}
        
        {/* HUD Elements */}
        {status === 'running' && (
          <View style={styles.hudOverlay} pointerEvents="none">
            <View style={styles.hudTop}>
              <View style={styles.hudBadge}>
                <Text style={styles.hudBadgeText}>{selectedExercise.toUpperCase()}</Text>
              </View>
              <View style={[styles.hudBadge, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
                <Text style={styles.hudBadgeText}>{fps} FPS</Text>
              </View>
            </View>

            <View style={styles.hudCenter}>
              <View style={styles.repCounter}>
                <Text style={styles.repValue}>{reps}</Text>
                <Text style={styles.repLabel}>REPS</Text>
              </View>
            </View>

            <View style={styles.hudBottom}>
              <BlurView intensity={30} tint="dark" style={styles.feedbackHud}>
                <Zap size={18} color={feedbackLevel === 'good' ? '#10b981' : feedbackLevel === 'warn' ? '#f59e0b' : '#fff'} />
                <Text style={styles.feedbackHudText}>{feedback}</Text>
              </BlurView>
            </View>
          </View>
        )}

        {/* Loading / Idle Overlays */}
        {(status === 'idle' || status === 'loading') && (
          <View style={[styles.statusOverlay, { backgroundColor: '#000000AA' }]}>
            {status === 'loading' ? (
              <>
                <Zap size={40} color={COLORS.primary} />
                <Text style={styles.statusTitle}>INITIALIZING AI...</Text>
                <Text style={styles.statusSub}>MoveNet Light v2 is booting up</Text>
              </>
            ) : (
              <>
                <Target size={60} color={COLORS.primary} style={{ marginBottom: 20 }} />
                <TouchableOpacity style={styles.hudStartBtn} onPress={handleStart}>
                  <Text style={styles.hudStartBtnText}>ACTIVATE AI HUB</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>

      {/* ── Controls Bottom Layer ── */}
      <View style={styles.controlsLayer}>
        <View style={styles.controlsHeader}>
          <TouchableOpacity 
            style={styles.selectorBtn} 
            onPress={() => setShowExercises(!showExercises)}
          >
            <View>
              <Text style={styles.selectorLabel}>ACTIVE EXERCISE</Text>
              <Text style={styles.selectorValue}>{selectedExercise}</Text>
            </View>
            <ChevronDown size={20} color={COLORS.textSecondary} style={{ transform: [{ rotate: showExercises ? '180deg' : '0deg' }] }} />
          </TouchableOpacity>

          <View style={styles.actionRow}>
            {status === 'idle' ? (
              <TouchableOpacity style={styles.startExerciseBtn} onPress={handleStart}>
                <Zap size={20} color="#fff" />
                <Text style={styles.startExerciseText}>START</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.circleAction} 
                onPress={() => { setReps(0); }}
              >
                <RotateCcw size={20} color={COLORS.text} />
              </TouchableOpacity>
            )}
            {status === 'running' && (
              <TouchableOpacity 
                style={[styles.circleAction, { backgroundColor: '#ef4444' }]} 
                onPress={() => { stopAll(); setStatus('idle'); }}
              >
                <X size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Persistent/Toggled Exercise List */}
        {showExercises && (
          <View style={styles.exListContainer}>
            <Text style={styles.exListTitle}>Select Movement</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.exList}
              contentContainerStyle={styles.exListContent}
            >
              {EXERCISES.map(ex => (
                <TouchableOpacity
                  key={ex}
                  style={[styles.exPill, selectedExercise === ex && styles.exPillActive]}
                  onPress={() => { setSelectedExercise(ex); }}
                >
                  <Text style={[styles.exPillText, selectedExercise === ex && styles.exPillTextActive]}>{ex}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  visualContainer: { flex: 1, backgroundColor: '#111', overflow: 'hidden' },
  hudOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 10, padding: 25 },
  hudTop: { flexDirection: 'row', justifyContent: 'space-between' },
  hudBadge: { backgroundColor: COLORS.primary + '80', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  hudBadgeText: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  hudCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  repCounter: { alignItems: 'center' },
  repValue: { color: '#fff', fontSize: 110, fontWeight: '900', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 0, height: 4}, textShadowRadius: 10 },
  repLabel: { color: COLORS.primary, fontSize: 18, fontWeight: 'bold', letterSpacing: 5, marginTop: -10 },
  hudBottom: { alignItems: 'center', paddingBottom: 10 },
  feedbackHud: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 20, gap: 12, overflow: 'hidden' },
  feedbackHudText: { color: '#fff', fontSize: 13, fontWeight: '600', maxWidth: SCREEN_WIDTH * 0.7 },
  statusOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 20, alignItems: 'center', justifyContent: 'center' },
  statusTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 15, letterSpacing: 2 },
  statusSub: { color: COLORS.textSecondary, fontSize: 12, marginTop: 5 },
  hudStartBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 40, paddingVertical: 18, borderRadius: 50 },
  hudStartBtnText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 2 },
  controlsLayer: { backgroundColor: '#1a1a1a', paddingBottom: 40, paddingHorizontal: 20, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  controlsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20 },
  selectorBtn: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  selectorLabel: { color: COLORS.textSecondary, fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  selectorValue: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  actionRow: { flexDirection: 'row', gap: 10 },
  circleAction: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#2a2a2a', alignItems: 'center', justifyContent: 'center' },
  exListContainer: { marginTop: 15, paddingBottom: 15 },
  exList: { flexGrow: 0, minHeight: 60 },
  exListContent: { paddingHorizontal: 5, alignItems: 'center', paddingVertical: 5 },
  exPill: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 15, backgroundColor: '#2a2a2a', marginRight: 15, borderWidth: 1, borderColor: '#333', minWidth: 110, alignItems: 'center', justifyContent: 'center' },
  exPillActive: { backgroundColor: COLORS.primaryDim, borderColor: COLORS.primary },
  exPillText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: 'bold' },
  exPillTextActive: { color: COLORS.primary },
  exListTitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  errorOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 15 },
  errorText: { color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  errorSub: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  startExerciseBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startExerciseText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
});
