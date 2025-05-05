import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';
import { RecoveryMetric } from '@shared/schema';

interface RecoveryOverviewProps {
  metrics: RecoveryMetric | null;
  dailyTip: string;
  isLoading: boolean;
}

const RecoveryOverview: React.FC<RecoveryOverviewProps> = ({ 
  metrics, 
  dailyTip, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <Card className="rounded-xl shadow-sm p-6 mb-8">
        <div className="animate-pulse">
          <div className="h-7 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-28 h-28 rounded-full bg-gray-200 mb-3"></div>
                <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-gray-200 h-20 rounded-xl"></div>
        </div>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card className="rounded-xl shadow-sm p-6 mb-8">
        <h3 className="font-nunito font-semibold text-xl mb-4">Today's Recovery Status</h3>
        <p className="text-center text-gray-500 py-4">No recovery data available yet.</p>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl shadow-sm p-6 mb-8">
      <h3 className="font-nunito font-semibold text-xl mb-4">Today's Recovery Status</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recovery Score */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-[#64B5F6] bg-opacity-10 mb-3">
            <div className="text-3xl font-bold text-[#64B5F6]">{metrics.recoveryScore}%</div>
          </div>
          <h4 className="font-nunito font-semibold">Recovery Score</h4>
          <p className="text-sm text-gray-600">
            {metrics.recoveryScore >= 80 ? 'Excellent recovery' : 
             metrics.recoveryScore >= 70 ? 'Good recovery progress' : 
             metrics.recoveryScore >= 50 ? 'Moderate recovery' : 'Recovery needs attention'}
          </p>
        </div>
        
        {/* Readiness */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-[#81C784] bg-opacity-10 mb-3">
            <div className="text-3xl font-bold text-[#81C784]">{metrics.readinessScore}%</div>
          </div>
          <h4 className="font-nunito font-semibold">Readiness</h4>
          <p className="text-sm text-gray-600">
            {metrics.readinessScore >= 80 ? 'Ready for intense training' : 
             metrics.readinessScore >= 70 ? 'Ready for moderate training' : 
             metrics.readinessScore >= 50 ? 'Light training recommended' : 'Rest recommended'}
          </p>
        </div>
        
        {/* Activity Balance */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-[#FFB74D] bg-opacity-10 mb-3">
            <div className="text-3xl font-bold text-[#FFB74D]">{metrics.balanceScore}%</div>
          </div>
          <h4 className="font-nunito font-semibold">Activity Balance</h4>
          <p className="text-sm text-gray-600">
            {metrics.balanceScore >= 80 ? 'Well balanced' : 
             metrics.balanceScore >= 70 ? 'Mostly balanced' : 
             metrics.balanceScore >= 50 ? 'Slightly unbalanced' : 'Consider more rest today'}
          </p>
        </div>
      </div>
      
      <div className="mt-6 bg-[#F5F5F5] p-4 rounded-xl">
        <div className="flex items-center">
          <div className="flex-shrink-0 text-[#64B5F6] text-xl">
            <Lightbulb className="h-5 w-5" />
          </div>
          <p className="ml-3 text-sm">{dailyTip}</p>
        </div>
      </div>
    </Card>
  );
};

export default RecoveryOverview;
