import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';

import RecoveryOverview from '@/components/dashboard/RecoveryOverview';
import RecoveryPlanPreview from '@/components/dashboard/RecoveryPlanPreview';
import RecoveryMetrics from '@/components/dashboard/RecoveryMetrics';
import AIInsights from '@/components/dashboard/AIInsights';
import FormAssessment from '@/components/dashboard/FormAssessment';
import RecoveryFlowModal from '@/components/modals/RecoveryFlowModal';
import RecoveryFlowSession, { RecoverySession } from '@/components/recovery-flow/RecoveryFlowSession';
import { generateRecoveryFlow } from '@/lib/recoveryFlowService';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Define type for recovery preferences
type RecoveryPreferences = {
  equipment: string[];
  time: number;
  focuses: string[];
  intensity: 'light' | 'moderate' | 'intense';
};

const Dashboard: React.FC = () => {
  const { toast } = useToast();
  const userId = 1; // In a real app, this would come from authentication

  // State for recovery flow
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [activeSession, setActiveSession] = useState<RecoverySession | null>(null);
  const [isGeneratingSession, setIsGeneratingSession] = useState(false);

  // Get user data
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: [`/api/users/${userId}`],
  });

  // Get latest recovery metrics
  const { data: metrics, isLoading: isMetricsLoading } = useQuery({
    queryKey: [`/api/users/${userId}/metrics/latest`],
  });

  // Get current recovery plan with tasks
  const { data: plan, isLoading: isPlanLoading } = useQuery({
    queryKey: [`/api/users/${userId}/plans/current`],
  });

  // Get chart data
  const { data: chartData, isLoading: isChartLoading } = useQuery({
    queryKey: [`/api/users/${userId}/chart-data`],
  });

  // Get latest movement assessment
  const { data: assessment, isLoading: isAssessmentLoading } = useQuery({
    queryKey: [`/api/users/${userId}/assessments/latest`],
  });

  // Mutation for refreshing recovery plan
  const refreshPlanMutation = useMutation({
    mutationFn: async () => {
      if (!metrics) {
        throw new Error("No metrics available");
      }

      const aiRecommendation = await apiRequest('POST', '/api/ai/recommend', {
        userId,
        metrics
      });

      return apiRequest('POST', '/api/plans', {
        userId,
        date: new Date(),
        aiRecommendation: aiRecommendation.recommendation,
        isCompleted: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/plans/current`] });
      toast({
        title: "Recovery plan updated",
        description: "Your personalized recovery plan has been refreshed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update recovery plan. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleStartFlow = async (preferences: RecoveryPreferences) => {
    try {
      setIsGeneratingSession(true);
      setShowRecoveryModal(false);
      
      // First try the API endpoint (which might use OpenAI)
      try {
        const response = await fetch('/api/ai/recovery-plan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: 1,
            equipment: preferences.equipment,
            duration: preferences.time,
            focusAreas: preferences.focuses,
            intensity: preferences.intensity,
            limitations: []
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.session) {
            setActiveSession(data.session);
            return;
          }
        }
      } catch (apiError) {
        console.log('API endpoint failed, using local generation');
      }
      
      // If API call fails, use our local generation method
      const session = await generateRecoveryFlow(userId, {
        duration: preferences.time,
        intensity: preferences.intensity as 'light' | 'moderate' | 'intense',
        focusAreas: preferences.focuses,
        equipment: preferences.equipment
      });
      setActiveSession(session);
      
      toast({
        title: "Recovery Flow Ready",
        description: `Your ${preferences.intensity} intensity recovery flow has been created.`,
      });
    } catch (error) {
      console.error('Error generating recovery plan:', error);
      toast({
        title: "Error",
        description: "Could not generate recovery flow. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSession(false);
    }
  };

  const handleSessionComplete = () => {
    setActiveSession(null);
    toast({
      title: "Recovery Complete",
      description: "Great job completing your recovery session!",
    });
  };
  
  const handleSessionBack = () => {
    setActiveSession(null);
  };

  const handleRefreshPlan = () => {
    refreshPlanMutation.mutate({ userId: 1 });
  };

  // If we're generating a session, show a loading screen
  if (isGeneratingSession) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Creating Your Recovery Flow</h2>
          <p className="text-gray-600">Generating a personalized session based on your selections...</p>
        </div>
      </div>
    );
  }
  
  // If an active session exists, show the recovery flow session
  if (activeSession) {
    return (
      <RecoveryFlowSession
        session={activeSession}
        onComplete={handleSessionComplete}
        onBack={handleSessionBack}
      />
    );
  }

  // Otherwise, show the dashboard
  return (
    <div id="dashboard">
      {/* Hero Recovery Flow Banner - Most Prominent Feature */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 mb-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-no-repeat bg-right-top opacity-10" style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTQ5LjY1NiAyOTYuMTU2QzY2Ljk5NyAyOTYuMTU2IDAgMjI5LjE1OCAwIDE0Ni41QzAgNjMuODQgNjYuOTk3LTMuMTU4IDE0OS42NTYtMy4xNThDMjMyLjMxNi0zLjE1OCAyOTkuMzEzIDYzLjg0IDI5OS4zMTMgMTQ2LjVDMjk5LjMxMyAyMjkuMTU4IDIzMi4zMTYgMjk2LjE1NiAxNDkuNjU2IDI5Ni4xNTZaIiBmaWxsPSIjZmZmIiAvPjwvc3ZnPg==')" }}></div>
        <div className="flex flex-col lg:flex-row justify-between items-center relative z-10">
          <div className="lg:max-w-2xl">
            <div className="flex items-center">
              <span className="bg-white rounded-full p-1 mr-3">
                <div className="bg-blue-600 rounded-full h-4 w-4"></div>
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-2 py-1 rounded">Personalized Recovery Sessions</span>
            </div>
            
            <h1 className="font-nunito font-bold text-3xl md:text-4xl mt-4 mb-2">
              Your Personalized Recovery Flow
            </h1>
            <p className="text-white/90 text-lg mb-6 max-w-lg">
              Create a customized recovery session based on your body's needs, available equipment, and time constraints.
            </p>
            <div className="flex flex-wrap gap-3 mb-8 md:mb-0">
              <Button 
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 font-bold shadow-lg"
                onClick={() => setShowRecoveryModal(true)}
              >
                Start Recovery Flow
              </Button>
              <Button 
                variant="outline"
                size="lg" 
                className="border-white text-white hover:bg-white/10"
                disabled={refreshPlanMutation.isPending}
                onClick={handleRefreshPlan}
              >
                <RefreshCw className="mr-2 h-4 w-4" /> 
                {refreshPlanMutation.isPending ? 'Updating...' : 'Update Recovery Plan'}
              </Button>
            </div>
          </div>
          
          <div className="hidden lg:block bg-white/20 p-4 rounded-xl backdrop-blur-sm mt-4 lg:mt-0">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center bg-white/20 p-3 rounded-lg">
                <div className="h-8 w-8 mr-3 flex items-center justify-center bg-white rounded-full text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div className="text-white">
                  <p className="text-xs opacity-90">Duration</p>
                  <p className="font-bold">5-60 minutes</p>
                </div>
              </div>
              <div className="flex items-center bg-white/20 p-3 rounded-lg">
                <div className="h-8 w-8 mr-3 flex items-center justify-center bg-white rounded-full text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
                </div>
                <div className="text-white">
                  <p className="text-xs opacity-90">Intensity</p>
                  <p className="font-bold">Customizable</p>
                </div>
              </div>
              <div className="flex items-center bg-white/20 p-3 rounded-lg">
                <div className="h-8 w-8 mr-3 flex items-center justify-center bg-white rounded-full text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
                </div>
                <div className="text-white">
                  <p className="text-xs opacity-90">Target Areas</p>
                  <p className="font-bold">Full or Specific</p>
                </div>
              </div>
              <div className="flex items-center bg-white/20 p-3 rounded-lg">
                <div className="h-8 w-8 mr-3 flex items-center justify-center bg-white rounded-full text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 18h8"/><path d="M3 22l3-3 3 3"/><path d="M18 9V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2"/><rect x="8" y="2" width="8" height="2" rx="1"/><path d="M18 14v4"/><path d="M12 14l6 6"/><path d="M12 20l6-6"/></svg>
                </div>
                <div className="text-white">
                  <p className="text-xs opacity-90">Equipment</p>
                  <p className="font-bold">Optional</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="font-nunito font-bold text-2xl">
            Dashboard for <span>{isUserLoading ? '...' : user?.firstName}</span>
          </h2>
          <p className="text-gray-600">Track, manage, and optimize your recovery journey</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recovery Plan Preview - Larger and more prominent */}
        <div className="lg:col-span-2">
          <RecoveryPlanPreview 
            tasks={plan?.tasks || []} 
            isLoading={isPlanLoading} 
          />
        </div>

        {/* Recovery Overview - Side by side with Metrics */}
        <div>
          <RecoveryOverview 
            metrics={metrics} 
            dailyTip={metrics?.notes || "Your muscle soreness is higher than usual. Consider focusing on stretching and mobility exercises today."} 
            isLoading={isMetricsLoading} 
          />
        </div>

        {/* Recovery Metrics - Side by side with Overview */}
        <div>
          <RecoveryMetrics 
            chartData={chartData?.[0] || null}
            heartRate={metrics?.heartRate || 0}
            sleepQuality={metrics?.sleepQuality || 0}
            activityLevel={metrics?.activityLevel || 'Unknown'}
            isLoading={isMetricsLoading || isChartLoading}
          />
        </div>

        {/* AI Insights - Full width for prominence */}
        <div className="lg:col-span-2">
          <AIInsights 
            personalizedInsight={plan?.aiRecommendation || "Based on your recent training intensity and sleep patterns, I recommend focusing on mobility work today. Your right shoulder shows signs of tension that could benefit from targeted stretching."}
            isLoading={isPlanLoading}
          />
        </div>

        {/* Form Assessment - Full width at bottom */}
        <div className="lg:col-span-2">
          <FormAssessment 
            assessment={assessment} 
            isLoading={isAssessmentLoading} 
          />
        </div>
      </div>

      {/* Secondary Recovery Flow CTA */}
      <div className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg p-6 my-6 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-10" style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSIjZmZmIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDIwQzAgOC45NTQgOC45NTQgMCAyMCAwczIwIDguOTU0IDIwIDIwLTguOTU0IDIwLTIwIDIwUzAgMzEuMDQ2IDAgMjB6bTQgMGMwIDguODM3IDcuMTYzIDE2IDE2IDE2czE2LTcuMTYzIDE2LTE2UzI4LjgzNyA0IDIwIDQgNCAxMS4xNjMgNCAyMHoiLz48L2c+PC9zdmc+Cg==')" }}></div>
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-3">Ready for your personalized recovery session?</h3>
          <p className="mb-4">Design a recovery flow that's perfectly tailored to your needs</p>
          <Button 
            className="bg-white text-blue-500 hover:bg-blue-50 font-semibold"
            onClick={() => setShowRecoveryModal(true)}
          >
            Create Recovery Flow
          </Button>
        </div>
      </div>

      {/* Recovery Flow Modal */}
      <RecoveryFlowModal
        isOpen={showRecoveryModal}
        onClose={() => setShowRecoveryModal(false)}
        onStartFlow={(preferences) => {
          console.log("Starting flow with preferences:", preferences);
          handleStartFlow(preferences);
        }}
        currentSoreness={metrics?.soreness}
      />
    </div>
  );
};

export default Dashboard;