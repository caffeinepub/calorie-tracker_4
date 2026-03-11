import { useState } from "react";

const STORAGE_KEY = "calorieGoal";
const DEFAULT_GOAL = 2000;

export function useCalorieGoal() {
  const [goal, setGoalState] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = Number.parseInt(stored, 10);
      if (!Number.isNaN(parsed) && parsed > 0) return parsed;
    }
    return DEFAULT_GOAL;
  });

  const setGoal = (newGoal: number) => {
    localStorage.setItem(STORAGE_KEY, String(newGoal));
    setGoalState(newGoal);
  };

  return { goal, setGoal };
}
