import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Play, Utensils } from 'lucide-react';

interface AIInsightsProps {
  personalizedInsight: string;
  isLoading: boolean;
}

const AIInsights: React.FC<AIInsightsProps> = ({ personalizedInsight, isLoading }) => {
  const handleAskAboutRecovery = () => {
    // This would open a conversation with the AI
    console.log("Ask about recovery clicked");
  };

  if (isLoading) {
    return (
      <Card className="rounded-xl shadow-sm p-6 mb-8">
        <div className="animate-pulse">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-200"></div>
            <div className="h-7 bg-gray-200 rounded w-1/3 ml-3"></div>
          </div>
          <div className="h-32 bg-gray-200 rounded-xl mb-6"></div>
          <div className="h-7 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-20 bg-gray-200 rounded-xl"></div>
            <div className="h-20 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl shadow-sm p-6 mb-8">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-full bg-[#64B5F6] bg-opacity-10 flex items-center justify-center">
          <Brain className="h-5 w-5 text-[#64B5F6]" />
        </div>
        <h3 className="font-nunito font-semibold text-xl ml-3">AI Recovery Coach</h3>
      </div>
      
      <div className="p-4 bg-[#64B5F6] bg-opacity-5 rounded-xl">
        <p className="text-[#424242] mb-3">
          {personalizedInsight || "No insights available at the moment. Check back later for personalized recommendations."}
        </p>
        
        <div className="flex flex-wrap gap-3 mt-4">
          <Button 
            variant="outline"
            className="border border-[#64B5F6] text-[#64B5F6] bg-white text-sm py-2"
          >
            View Shoulder Mobility Protocol
          </Button>
          <Button 
            variant="outline"
            className="border border-gray-300 text-[#424242] bg-white text-sm py-2"
            onClick={handleAskAboutRecovery}
          >
            Ask About Recovery
          </Button>
        </div>
      </div>
      
      <div className="mt-6">
        <h4 className="font-nunito font-semibold mb-3">Recommended Resources</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center p-3 bg-[#F5F5F5] rounded-xl">
            <div className="w-12 h-12 rounded-xl bg-[#81C784] bg-opacity-20 flex items-center justify-center">
              <Play className="h-5 w-5 text-[#81C784]" />
            </div>
            <div className="ml-3">
              <h5 className="font-nunito font-semibold text-sm">Recovery Meditation</h5>
              <p className="text-xs text-gray-600">10 min • Guided Session</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-[#F5F5F5] rounded-xl">
            <div className="w-12 h-12 rounded-xl bg-[#FFB74D] bg-opacity-20 flex items-center justify-center">
              <Utensils className="h-5 w-5 text-[#FFB74D]" />
            </div>
            <div className="ml-3">
              <h5 className="font-nunito font-semibold text-sm">Nutrition Plan</h5>
              <p className="text-xs text-gray-600">Anti-inflammatory foods</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AIInsights;
