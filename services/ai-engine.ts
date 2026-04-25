export const RECOVERY_WEIGHTS = {
  water: 0.4,
  sleep: 0.35,
  steps: 0.25
};

export const RECOVERY_THRESHOLDS = {
  high: 70,
  moderate: 40
};

export const PROGRESSIVE_OVERLOAD_DELTA = 0.025; // 2.5%

export type RecoveryFactors = {
  waterGlasses: number;
  sleepHours: number;
  steps: number;
};

/**
 * Calculates the recovery score R(t) based on bio-feedback.
 * Formula: R(t) = 100 * [0.4 * W(t) + 0.35 * S(t) + 0.25 * H(t)]
 */
export const calculateRecoveryScore = (factors: RecoveryFactors): number => {
  const w = Math.min(factors.waterGlasses / 8, 1);
  const s = Math.min(factors.sleepHours / 8, 1);
  const h = Math.min(factors.steps / 10000, 1);

  const score = 100 * (
    RECOVERY_WEIGHTS.water * w + 
    RECOVERY_WEIGHTS.sleep * s + 
    RECOVERY_WEIGHTS.steps * h
  );

  return Math.round(score);
};

/**
 * Calculates the recovery modifier f(R) for volume scaling.
 * Formula: f(R) = 0.5 + R/100
 */
export const calculateRecoveryModifier = (readinessScore: number): number => {
  return 0.5 + (readinessScore / 100);
};

/**
 * Calculates progressive overload weight.
 * Formula: w_n+1 = w_n * (1 + delta)
 */
export const calculateOverloadWeight = (currentWeight: number): number => {
  return currentWeight * (1 + PROGRESSIVE_OVERLOAD_DELTA);
};

/**
 * Determines training intensity category based on recovery score.
 */
export const getIntensityCategory = (score: number) => {
  if (score >= RECOVERY_THRESHOLDS.high) return 'HIGH INTENSITY';
  if (score >= RECOVERY_THRESHOLDS.moderate) return 'MODERATE';
  return 'REST DAY';
};
