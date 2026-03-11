import { useCamera } from "@/camera/useCamera";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Camera,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Upload,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useCreateMeal } from "../hooks/useQueries";

type Step = "capture" | "form" | "uploading" | "success";

interface LogMealDialogProps {
  open: boolean;
  onClose: () => void;
}

export function LogMealDialog({ open, onClose }: LogMealDialogProps) {
  const [step, setStep] = useState<Step>("capture");
  const [captureMode, setCaptureMode] = useState<"camera" | "upload" | null>(
    null,
  );
  const [capturedImage, setCapturedImage] = useState<{
    bytes: Uint8Array<ArrayBuffer>;
    mimeType: string;
    previewUrl: string;
  } | null>(null);
  const [mealName, setMealName] = useState("");
  const [calories, setCalories] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createMeal = useCreateMeal();

  const camera = useCamera({
    facingMode: "environment",
    quality: 0.85,
    format: "image/jpeg",
  });

  const handleClose = useCallback(async () => {
    await camera.stopCamera();
    setCaptureMode(null);
    setCapturedImage(null);
    setMealName("");
    setCalories("");
    setStep("capture");
    setUploadProgress(0);
    onClose();
  }, [camera, onClose]);

  const handleStartCamera = async () => {
    setCaptureMode("camera");
    await camera.startCamera();
  };

  const handleCapture = async () => {
    const file = await camera.capturePhoto();
    if (!file) return;
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer) as Uint8Array<ArrayBuffer>;
    const previewUrl = URL.createObjectURL(file);
    setCapturedImage({ bytes, mimeType: file.type, previewUrl });
    await camera.stopCamera();
    setCaptureMode(null);
    setStep("form");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer) as Uint8Array<ArrayBuffer>;
    const previewUrl = URL.createObjectURL(file);
    setCapturedImage({ bytes, mimeType: file.type, previewUrl });
    setStep("form");
  };

  const handleRetake = async () => {
    if (capturedImage?.previewUrl)
      URL.revokeObjectURL(capturedImage.previewUrl);
    setCapturedImage(null);
    setCaptureMode(null);
    setMealName("");
    setCalories("");
    setStep("capture");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!capturedImage || !mealName.trim() || !calories) return;

    const cal = Number.parseInt(calories, 10);
    if (Number.isNaN(cal) || cal <= 0) {
      toast.error("Please enter a valid calorie amount");
      return;
    }

    setStep("uploading");
    setUploadProgress(0);

    try {
      await createMeal.mutateAsync({
        imageBytes: capturedImage.bytes,
        mimeType: capturedImage.mimeType,
        mealName: mealName.trim(),
        calories: BigInt(cal),
        onProgress: (pct) => setUploadProgress(pct),
      });
      setStep("success");
      toast.success("Meal logged!");
      setTimeout(() => handleClose(), 1200);
    } catch {
      toast.error("Failed to save meal. Please try again.");
      setStep("form");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        className="sm:max-w-md bg-card border-border p-0 overflow-hidden"
        data-ocid="log_meal.dialog"
      >
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="font-display text-xl">
            {step === "capture" && "Log a Meal"}
            {step === "form" && "Meal Details"}
            {step === "uploading" && "Saving Meal..."}
            {step === "success" && "Meal Logged!"}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 pt-4">
          <AnimatePresence mode="wait">
            {/* CAPTURE STEP */}
            {step === "capture" && (
              <motion.div
                key="capture"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {captureMode === "camera" ? (
                  <div className="space-y-3">
                    <div
                      className="relative rounded-xl overflow-hidden bg-black"
                      style={{ minHeight: 260 }}
                    >
                      <video
                        ref={camera.videoRef}
                        className="w-full object-cover"
                        style={{ minHeight: 260, maxHeight: 320 }}
                        playsInline
                        muted
                        autoPlay
                      />
                      <canvas
                        ref={camera.canvasRef}
                        style={{ display: "none" }}
                      />
                      {camera.isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                      )}
                      {camera.error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3 p-4">
                          <p className="text-sm text-center text-destructive">
                            {camera.error.message}
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => camera.retry()}
                            className="border-border"
                          >
                            <RefreshCw className="w-4 h-4 mr-2" /> Retry
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 border-border"
                        onClick={() => {
                          camera.stopCamera();
                          setCaptureMode(null);
                        }}
                      >
                        <X className="w-4 h-4 mr-2" /> Cancel
                      </Button>
                      <Button
                        className="flex-1 bg-primary text-primary-foreground font-semibold"
                        onClick={handleCapture}
                        disabled={!camera.isActive || camera.isLoading}
                        data-ocid="log_meal.camera_button"
                      >
                        {camera.isLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Camera className="w-4 h-4 mr-2" />
                        )}
                        Capture
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Take a photo or upload an image of your meal.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={handleStartCamera}
                        data-ocid="log_meal.camera_button"
                        className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed border-border hover:border-primary/60 hover:bg-primary/5 transition-all"
                      >
                        <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
                          <Camera className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-sm font-medium">Use Camera</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        data-ocid="log_meal.upload_button"
                        className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed border-border hover:border-primary/60 hover:bg-primary/5 transition-all"
                      >
                        <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
                          <Upload className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-sm font-medium">
                          Upload Photo
                        </span>
                      </button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>
                )}
              </motion.div>
            )}

            {/* FORM STEP */}
            {step === "form" && capturedImage && (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="relative rounded-xl overflow-hidden aspect-video bg-muted">
                  <img
                    src={capturedImage.previewUrl}
                    alt="Captured meal"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
                    aria-label="Retake photo"
                  >
                    <RefreshCw className="w-4 h-4 text-white" />
                  </button>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="meal-name" className="text-sm font-medium">
                    Meal Name
                  </Label>
                  <Input
                    id="meal-name"
                    placeholder="e.g. Grilled Chicken Bowl"
                    value={mealName}
                    onChange={(e) => setMealName(e.target.value)}
                    className="bg-muted border-border focus:border-primary"
                    data-ocid="log_meal.meal_name_input"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="calories" className="text-sm font-medium">
                    Calories (kcal)
                  </Label>
                  <Input
                    id="calories"
                    type="number"
                    placeholder="e.g. 450"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    className="bg-muted border-border focus:border-primary"
                    data-ocid="log_meal.calories_input"
                    min="1"
                    max="9999"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-border"
                    onClick={handleClose}
                    data-ocid="log_meal.cancel_button"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-primary text-primary-foreground font-semibold"
                    disabled={!mealName.trim() || !calories}
                    data-ocid="log_meal.submit_button"
                  >
                    Save Meal
                  </Button>
                </div>
              </motion.form>
            )}

            {/* UPLOADING STEP */}
            {step === "uploading" && (
              <motion.div
                key="uploading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="py-8 flex flex-col items-center gap-4"
                data-ocid="log_meal.loading_state"
              >
                <div className="relative w-20 h-20">
                  <svg
                    className="w-20 h-20 -rotate-90 ring-glow"
                    viewBox="0 0 80 80"
                    role="img"
                    aria-label={`Upload progress: ${uploadProgress}%`}
                  >
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      fill="none"
                      stroke="oklch(0.22 0.015 55)"
                      strokeWidth="8"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      fill="none"
                      stroke="oklch(0.78 0.19 65)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 32}`}
                      strokeDashoffset={`${
                        2 * Math.PI * 32 * (1 - uploadProgress / 100)
                      }`}
                      style={{ transition: "stroke-dashoffset 0.3s ease" }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-primary">
                    {uploadProgress}%
                  </span>
                </div>
                <div className="text-center">
                  <p className="font-semibold">Saving your meal...</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Uploading photo and storing data
                  </p>
                </div>
              </motion.div>
            )}

            {/* SUCCESS STEP */}
            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 flex flex-col items-center gap-3"
                data-ocid="log_meal.success_state"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <CheckCircle2 className="w-16 h-16 text-success" />
                </motion.div>
                <p className="font-display text-xl font-bold">Meal Logged!</p>
                <p className="text-sm text-muted-foreground">
                  Your meal has been saved successfully.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
