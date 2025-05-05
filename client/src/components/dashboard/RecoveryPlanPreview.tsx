import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, Dumbbell, Droplets, Bed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RecoveryTask } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface RecoveryPlanPreviewProps {
  tasks: RecoveryTask[];
  isLoading: boolean;
}

const getIconByCategory = (category: string) => {
  switch (category) {
    case 'strength':
      return <Dumbbell className="text-[#64B5F6]" />;
    case 'nutrition':
      return <Droplets className="text-[#81C784]" />;
    case 'sleep':
      return <Bed className="text-[#FFB74D]" />;
    default:
      return <Dumbbell className="text-[#64B5F6]" />;
  }
};

const getBackgroundColorByCategory = (category: string) => {
  switch (category) {
    case 'strength':
      return 'rgba(100, 181, 246, 0.2)';
    case 'nutrition':
      return 'rgba(129, 199, 132, 0.2)';
    case 'sleep':
      return 'rgba(255, 183, 77, 0.2)';
    default:
      return 'rgba(100, 181, 246, 0.2)';
  }
};

const RecoveryPlanPreview: React.FC<RecoveryPlanPreviewProps> = ({ tasks, isLoading }) => {
  const { toast } = useToast();

  const handleStartTask = async (taskId: number) => {
    try {
      await apiRequest('PATCH', `/api/tasks/${taskId}`, { isCompleted: true });
      toast({
        title: "Task started",
        description: "You've started this recovery task",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not start the task. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="rounded-xl shadow-sm p-6 mb-8">
        <div className="animate-pulse">
          <div className="flex justify-between items-center mb-4">
            <div className="h-7 bg-gray-200 rounded w-1/3"></div>
            <div className="h-5 bg-gray-200 rounded w-24"></div>
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-xl mb-4"></div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl shadow-sm p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-nunito font-semibold text-xl">Your Recovery Plan</h3>
        <Link href="/plan" className="text-[#64B5F6] font-semibold flex items-center">
          <span>View Full Plan</span>
          <ChevronRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
      
      {tasks.length === 0 ? (
        <p className="text-center text-gray-500 py-4">No recovery tasks available.</p>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center p-3 bg-[#F5F5F5] rounded-xl">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center" 
                style={{ backgroundColor: getBackgroundColorByCategory(task.category) }}
              >
                {getIconByCategory(task.category)}
              </div>
              <div className="ml-4 flex-1">
                <h4 className="font-nunito font-semibold">{task.title}</h4>
                <p className="text-sm text-gray-600">
                  {task.duration ? `${task.duration} min - ` : ''}{task.description}
                </p>
              </div>
              {task.progress > 0 ? (
                <div className="w-20">
                  <div className="h-2 rounded-full bg-gray-200">
                    <div 
                      className="h-full rounded-full bg-[#81C784]" 
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <Button 
                  className="py-2 h-8 rounded-xl" 
                  onClick={() => handleStartTask(task.id)}
                  disabled={task.isCompleted}
                >
                  {task.isCompleted ? 'Done' : 'Start'}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default RecoveryPlanPreview;
