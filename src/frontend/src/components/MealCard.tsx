import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Clock, Flame, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Meal } from "../backend";
import { useDeleteMeal } from "../hooks/useQueries";

interface MealCardProps {
  meal: Meal;
  index: number;
}

function formatTime(timestampNs: bigint): string {
  const ms = Number(timestampNs / BigInt(1_000_000));
  return new Date(ms).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MealCard({ meal, index }: MealCardProps) {
  const [imgError, setImgError] = useState(false);
  const deleteMutation = useDeleteMeal();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(meal.id);
      toast.success("Meal deleted");
    } catch {
      toast.error("Failed to delete meal");
    }
  };

  const imageUrl = meal.imageFile.getDirectURL();

  return (
    <div
      className="meal-card flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
      data-ocid={`meal_history.item.${index}`}
    >
      {/* Thumbnail */}
      <div className="relative shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted">
        {!imgError ? (
          <img
            src={imageUrl}
            alt={meal.mealName}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Flame className="w-6 h-6 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground truncate text-sm">
          {meal.mealName}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-primary font-bold text-sm">
            {Number(meal.calories).toLocaleString()} kcal
          </span>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {formatTime(meal.timestamp)}
          </span>
        </div>
      </div>

      {/* Delete */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            data-ocid={`meal_history.delete_button.${index}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete meal?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently remove &ldquo;{meal.mealName}&rdquo; from
              your log.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="meal_history.cancel_button"
              className="border-border"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="meal_history.confirm_button"
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
