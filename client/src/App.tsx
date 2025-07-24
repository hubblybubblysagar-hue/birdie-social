import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import OnboardingPage from "@/pages/onboarding-page";
import HomePage from "@/pages/home-page";
import MatchesPage from "@/pages/matches-page";
import TeeTimesPage from "@/pages/tee-times-page";
import FeedPage from "@/pages/feed-page";
import ProfilePage from "@/pages/profile-page";
import PremiumPage from "@/pages/premium-page";
import { ProtectedRoute } from "./lib/protected-route";
import { useAuth, AuthProvider } from "./hooks/use-auth";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

function Router() {
  const { user } = useAuth();
  const hasProfile = !!user?.fullName;

  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/onboarding" component={OnboardingPage} />
      <ProtectedRoute 
        path="/" 
        component={hasProfile ? HomePage : OnboardingPage} 
      />
      <ProtectedRoute path="/matches" component={MatchesPage} />
      <ProtectedRoute path="/tee-times" component={TeeTimesPage} />
      <ProtectedRoute path="/feed" component={FeedPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/premium" component={PremiumPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
