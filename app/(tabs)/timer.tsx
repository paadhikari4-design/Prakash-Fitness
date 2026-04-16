import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { COLORS } from '@/constants/Colors';
import { Play, Square, RotateCcw, Plus, Minus } from 'lucide-react-native';

import { useWorkout } from '@/context/WorkoutContext';

export default function TimerScreen() {
  const { timeLeft, setTimeLeft, initialTime, setInitialTime, isTimerActive, setIsTimerActive } = useWorkout();

  const presets = [
    { label: '30s Rest', time: 30 },
    { label: '1m Rest', time: 60 },
    { label: '90s Rest', time: 90 },
    { label: '2m Rest', time: 120 },
    { label: '3m Power', time: 180 },
    { label: '5m Break', time: 300 },
    { label: 'Boxing Round', time: 180 },
    { label: 'Tabata (20s)', time: 20 },
  ];

  const toggleTimer = () => {
    setIsTimerActive(!isTimerActive);
  };

  const resetTimer = () => {
    setIsTimerActive(false);
    setTimeLeft(initialTime);
  };

  const setPreset = (seconds: number) => {
    setIsTimerActive(false);
    setInitialTime(seconds);
    setTimeLeft(seconds);
  };

  const adjustTime = (seconds: number) => {
    if (timeLeft + seconds >= 0) {
      const newTime = timeLeft + seconds;
      setTimeLeft(newTime);
      setInitialTime(newTime);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.clockWrapper}>
        <View style={styles.progressCircle}>
          <Text style={styles.timeText}>{formatTime(timeLeft)}</Text>
          <Text style={styles.timeSubtext}>
            {isTimerActive ? 'Tracking...' : 'Paused'}
          </Text>
        </View>

        <View style={styles.adjustControls}>
          <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustTime(-15)}>
            <Minus size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.adjustText}>Custom</Text>
          <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustTime(15)}>
            <Plus size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.controlBtn} onPress={resetTimer}>
          <RotateCcw size={24} color={COLORS.text} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.mainBtn, isTimerActive && styles.mainBtnActive]} 
          onPress={toggleTimer}
          activeOpacity={0.8}
        >
          {isTimerActive ? (
             <Square size={32} color={COLORS.background} />
          ) : (
             <Play size={32} color={COLORS.background} style={{ marginLeft: 4 }} />
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlBtn} onPress={() => adjustTime(30)}>
          <Text style={styles.controlBtnText}>+30s</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.presetsWrapper}>
        <Text style={styles.presetTitle}>Templates</Text>
        <ScrollView contentContainerStyle={styles.presetsGrid} showsVerticalScrollIndicator={false}>
          {presets.map((preset) => (
            <TouchableOpacity 
              key={preset.label} 
              style={[
                styles.presetBtn, 
                initialTime === preset.time && styles.presetBtnActive
              ]}
              onPress={() => setPreset(preset.time)}
            >
              <Text style={[
                styles.presetText,
                initialTime === preset.time && styles.presetTextActive
              ]}>
                {preset.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  clockWrapper: {
    alignItems: 'center',
    marginVertical: 40,
  },
  progressCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 8,
    borderColor: COLORS.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopColor: COLORS.primary,
    borderRightColor: COLORS.primary,
    transform: [{ rotate: '-45deg' }],
  },
  timeText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: COLORS.text,
    transform: [{ rotate: '45deg' }],
    fontVariant: ['tabular-nums'],
  },
  timeSubtext: {
    fontSize: 16,
    color: COLORS.primary,
    transform: [{ rotate: '45deg' }],
    marginTop: -8,
  },
  adjustControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 16,
  },
  adjustBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  adjustText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 40,
  },
  controlBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  controlBtnText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  mainBtn: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainBtnActive: {
    backgroundColor: '#ff4444',
  },
  presetsWrapper: {
    flex: 1,
  },
  presetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 20,
  },
  presetBtn: {
    width: '48%',
    backgroundColor: COLORS.surface,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presetBtnActive: {
    backgroundColor: COLORS.primaryDim,
    borderColor: COLORS.primary,
  },
  presetText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '500',
  },
  presetTextActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});
