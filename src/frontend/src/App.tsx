import { Toaster } from "@/components/ui/sonner";
import { Flame, Loader2 } from "lucide-react";
import { Dashboard } from "./components/Dashboard";
import { LoginScreen } from "./components/LoginScreen";
import { ProfileSetupModal } from "./components/ProfileSetupModal";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();

  const showProfileSetup =
    isAuthenticated &&
    !profileLoading &&
    profileFetched &&
    userProfile === null;

  // Show loading while auth is initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Flame className="w-8 h-8 text-primary animate-pulse" />
          <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen />
        <Toaster richColors position="top-center" />
      </>
    );
  }

  // Authenticated but profile loading
  if (isAuthenticated && profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Flame className="w-8 h-8 text-primary animate-pulse" />
          <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Profile setup for first-time users */}
      <ProfileSetupModal open={showProfileSetup} />

      {/* Main app — render regardless so dashboard is ready */}
      {userProfile && <Dashboard userProfile={userProfile} />}

      <Toaster richColors position="top-center" />
    </>
  );
}
