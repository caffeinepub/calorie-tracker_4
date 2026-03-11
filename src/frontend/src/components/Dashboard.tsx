import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Flame,
  Loader2,
  LogOut,
  Plus,
  SlidersHorizontal,
  Utensils,
  UtensilsCrossed,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { UserProfile } from "../backend";
import { useCalorieGoal } from "../hooks/useCalorieGoal";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetAllMeals, useGetDailySummary } from "../hooks/useQueries";
import { CalorieRing } from "./CalorieRing";
import { GoalSettingsDialog } from "./GoalSettingsDialog";
import { LogMealDialog } from "./LogMealDialog";
import { MealCard } from "./MealCard";
import { WeeklyChart } from "./WeeklyChart";

interface DashboardProps {
  userProfile: UserProfile;
}

export function Dashboard({ userProfile }: DashboardProps) {
  const [logMealOpen, setLogMealOpen] = useState(false);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { goal, setGoal } = useCalorieGoal();

  const mealsQuery = useGetAllMeals();
  const summaryQuery = useGetDailySummary();

  const isLoading = mealsQuery.isLoading || summaryQuery.isLoading;
  const isError = mealsQuery.isError || summaryQuery.isError;

  const meals = mealsQuery.data ?? [];
  const totalCalories = summaryQuery.data ? Number(summaryQuery.data[0]) : 0;
  const mealCount = summaryQuery.data ? Number(summaryQuery.data[1]) : 0;

  // Sort newest first
  const sortedMeals = [...meals].sort((a, b) => {
    return Number(b.timestamp - a.timestamp);
  });

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-primary" />
          <span className="font-display font-bold text-lg">
            Calorie<span className="text-primary">Lens</span>
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground hidden sm:block mr-2">
            {userProfile.name}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setGoalDialogOpen(true)}
            className="w-8 h-8 text-muted-foreground hover:text-foreground"
            title="Set calorie goal"
            data-ocid="header.settings_button"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="w-8 h-8 text-muted-foreground hover:text-foreground"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        {/* Loading state */}
        {isLoading && (
          <div
            className="flex flex-col items-center gap-6"
            data-ocid="dashboard.loading_state"
          >
            <Skeleton className="w-44 h-44 rounded-full shimmer" />
            <div className="grid grid-cols-2 gap-3 w-full">
              <Skeleton className="h-20 rounded-xl shimmer" />
              <Skeleton className="h-20 rounded-xl shimmer" />
            </div>
            <div className="space-y-3 w-full">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 rounded-xl shimmer" />
              ))}
            </div>
          </div>
        )}

        {/* Error state */}
        {isError && !isLoading && (
          <div
            className="flex flex-col items-center gap-3 py-12 text-center"
            data-ocid="dashboard.error_state"
          >
            <AlertCircle className="w-12 h-12 text-destructive" />
            <p className="font-semibold">Failed to load data</p>
            <p className="text-sm text-muted-foreground">
              Something went wrong. Please try refreshing the page.
            </p>
            <Button
              variant="outline"
              className="border-border"
              onClick={() => {
                mealsQuery.refetch();
                summaryQuery.refetch();
              }}
            >
              <Loader2 className="w-4 h-4 mr-2" /> Retry
            </Button>
          </div>
        )}

        {!isLoading && !isError && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Calorie ring + summary */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.34, 1.0, 0.64, 1] }}
                className="relative flex flex-col items-center gap-4 py-2"
              >
                {/* Atmospheric glow behind ring */}
                <div
                  className="absolute w-48 h-48 rounded-full pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(circle, oklch(0.78 0.19 65 / 0.10) 0%, transparent 70%)",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                />
                <CalorieRing consumed={totalCalories} goal={goal} size={180} />

                {/* Goal label */}
                <p className="text-xs text-muted-foreground -mt-2">
                  Daily goal: {goal.toLocaleString()} kcal
                </p>
              </motion.div>

              {/* Stats cards */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="grid grid-cols-2 gap-3"
              >
                <div className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Flame className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Today
                    </span>
                  </div>
                  <p className="text-2xl font-bold font-display text-primary">
                    {totalCalories.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">kcal consumed</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Utensils className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Meals
                    </span>
                  </div>
                  <p className="text-2xl font-bold font-display">{mealCount}</p>
                  <p className="text-xs text-muted-foreground">logged today</p>
                </div>
              </motion.div>

              {/* Today / Week tabs */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.4 }}
              >
                <Tabs defaultValue="today">
                  <TabsList className="w-full mb-4">
                    <TabsTrigger
                      value="today"
                      className="flex-1"
                      data-ocid="dashboard.today_tab"
                    >
                      Today
                    </TabsTrigger>
                    <TabsTrigger
                      value="week"
                      className="flex-1"
                      data-ocid="dashboard.week_tab"
                    >
                      This Week
                    </TabsTrigger>
                  </TabsList>

                  {/* Today tab — meal list */}
                  <TabsContent value="today" className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="font-display font-bold text-base">
                        Meal History
                      </h2>
                      <span className="text-xs text-muted-foreground">
                        {meals.length} total
                      </span>
                    </div>

                    {sortedMeals.length === 0 ? (
                      <div
                        className="flex flex-col items-center gap-3 py-12 text-center bg-card border border-dashed border-border rounded-2xl"
                        data-ocid="meal_history.empty_state"
                      >
                        <UtensilsCrossed className="w-10 h-10 text-muted-foreground/40" />
                        <div>
                          <p className="font-semibold text-muted-foreground">
                            No meals logged yet
                          </p>
                          <p className="text-sm text-muted-foreground/60 mt-1">
                            Tap &ldquo;Log Meal&rdquo; to record your first meal
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2" data-ocid="meal_history.list">
                        {sortedMeals.map((meal, i) => (
                          <MealCard key={meal.id} meal={meal} index={i + 1} />
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* Week tab — weekly chart */}
                  <TabsContent value="week">
                    <WeeklyChart meals={meals} goal={goal} />
                  </TabsContent>
                </Tabs>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Log Meal FAB */}
      <div className="sticky bottom-0 bg-gradient-to-t from-background via-background/95 to-transparent p-4 pt-6">
        <Button
          onClick={() => setLogMealOpen(true)}
          className="w-full h-14 bg-primary text-primary-foreground font-bold text-base rounded-2xl shadow-glow hover:opacity-90 active:scale-[0.98] transition-all"
          data-ocid="dashboard.log_meal_button"
        >
          <Plus className="w-5 h-5 mr-2" />
          Log Meal
        </Button>
      </div>

      <LogMealDialog open={logMealOpen} onClose={() => setLogMealOpen(false)} />
      <GoalSettingsDialog
        open={goalDialogOpen}
        onClose={() => setGoalDialogOpen(false)}
        goal={goal}
        onSave={setGoal}
      />
    </div>
  );
}
