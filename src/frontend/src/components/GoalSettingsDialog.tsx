import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface GoalSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  goal: number;
  onSave: (newGoal: number) => void;
}

export function GoalSettingsDialog({
  open,
  onClose,
  goal,
  onSave,
}: GoalSettingsDialogProps) {
  const [value, setValue] = useState<string>(String(goal));

  const handleSave = () => {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      onSave(parsed);
      onClose();
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setValue(String(goal));
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm" data-ocid="goal_settings.dialog">
        <DialogHeader>
          <DialogTitle className="font-display">Daily Calorie Goal</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <Label
            htmlFor="calorie-goal-input"
            className="text-sm text-muted-foreground"
          >
            Set your daily target (kcal)
          </Label>
          <Input
            id="calorie-goal-input"
            type="number"
            min={100}
            max={10000}
            step={50}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="text-lg font-semibold font-display h-12"
            data-ocid="goal_settings.input"
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
          <p className="text-xs text-muted-foreground">
            Typical adult range: 1,500–3,000 kcal/day
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              setValue(String(goal));
              onClose();
            }}
            data-ocid="goal_settings.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!value || Number.parseInt(value, 10) <= 0}
            data-ocid="goal_settings.save_button"
          >
            Save Goal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
