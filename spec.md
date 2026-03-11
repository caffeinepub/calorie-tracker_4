# Calorie Tracker

## Current State
- Dashboard shows a calorie ring, today's total/meal count stats, and a meal history list
- Daily goal is hardcoded to 2000 kcal in Dashboard.tsx as `const DAILY_GOAL = 2000`
- Backend has `getAllMeals` (returns all meals with timestamps) and `getDailySummary` (returns today's totals)
- No weekly view exists

## Requested Changes (Diff)

### Add
- **Custom daily calorie goal**: A settings button/icon in the header that opens a dialog to set and save the daily calorie goal. Stored in localStorage so it persists without backend changes.
- **Weekly history view**: A toggle/tabs on the dashboard to switch between "Today" and "Week" views. The week view shows the past 7 days as a bar chart (using Recharts/chart.tsx) with daily calorie totals derived from `getAllMeals` data grouped by day. Highlights days over/under goal.

### Modify
- Dashboard.tsx: Replace hardcoded `DAILY_GOAL = 2000` with value read from localStorage (defaulting to 2000). Wire goal to CalorieRing and goal label.
- Dashboard header: Add a settings (gear) icon button to open the goal-setting dialog.
- Dashboard layout: Add Today/Week tab switcher.

### Remove
- Nothing removed.

## Implementation Plan
1. Create `useCalorieGoal` hook: reads/writes goal to localStorage, defaults to 2000.
2. Create `GoalSettingsDialog` component: input field for goal kcal, save button, cancel button.
3. Create `WeeklyChart` component: uses the existing chart.tsx (Recharts) to show 7-day bar chart of daily calories vs goal line.
4. Update `Dashboard.tsx`: add Today/Week tabs, import and use `useCalorieGoal`, add settings button in header, render `WeeklyChart` in week tab, pass dynamic goal to `CalorieRing`.
