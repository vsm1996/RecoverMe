import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Profile from "@/pages/profile";
import RecoveryPlan from "@/pages/recovery-plan";
import Progress from "@/pages/progress";
import TestFeedback from "@/pages/test-feedback";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import React, { useState, useEffect } from "react";

function Router() {
  const [location] = useLocation();
  
  // Check if we're on the mobile view and need to adjust padding for the bottom navigation
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <DefaultLayout isMobile={isMobile}>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/plan" component={RecoveryPlan} />
        <Route path="/progress" component={Progress} />
        <Route path="/profile" component={Profile} />
        <Route path="/test-feedback" component={TestFeedback} />
        <Route component={NotFound} />
      </Switch>
    </DefaultLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
