import { Button } from "@/components/ui/button";
import { BarChart3, Camera, Flame, Loader2, Utensils } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function LoginScreen() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === "logging-in";

  const features = [
    { icon: Camera, label: "Photo Logging", desc: "Snap a photo of any meal" },
    { icon: Flame, label: "Calorie Tracking", desc: "Monitor daily intake" },
    { icon: BarChart3, label: "Progress View", desc: "See your meal history" },
    { icon: Utensils, label: "Meal Journal", desc: "Every bite, recorded" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 relative overflow-hidden">
      {/* Atmospheric background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, oklch(0.78 0.19 65 / 0.08) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 80%, oklch(0.72 0.20 55 / 0.05) 0%, transparent 60%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.34, 1.0, 0.64, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 mb-4">
            <Flame className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight">
            Calorie<span className="text-primary">Lens</span>
          </h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Track every meal, fuel every goal.
          </p>
        </div>

        {/* Hero image */}
        <div className="relative rounded-2xl overflow-hidden mb-8 aspect-video">
          <img
            src="/assets/generated/meal-hero.dim_800x600.jpg"
            alt="Healthy meal"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, oklch(0.11 0.012 55 / 0.8) 0%, transparent 60%)",
            }}
          />
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-2 mb-8">
          {features.map(({ icon: Icon, label, desc }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.4 }}
              className="flex items-start gap-2.5 p-3 rounded-xl bg-card border border-border"
            >
              <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center mt-0.5">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Login button */}
        <Button
          onClick={() => login()}
          disabled={isLoggingIn}
          className="w-full h-12 bg-primary text-primary-foreground font-bold text-base rounded-xl hover:opacity-90 transition-opacity"
          data-ocid="auth.primary_button"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            "Sign In to Start Tracking"
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Secure authentication via Internet Identity
        </p>
      </motion.div>
    </div>
  );
}
