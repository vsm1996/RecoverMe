import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { SessionFeedback, ExerciseFeedback } from './RecoveryFlowTypes';

interface FeedbackSummaryProps {
  userId: number;
  sessionId: string;
  userProfile: any;
  sessionData: any;
  onClose: () => void;
}

export function FeedbackSummary({ userId, sessionId, userProfile, sessionData, onClose }: FeedbackSummaryProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Function to render star rating
  const renderRating = (rating: number, max: number = 5) => {
    return (
      <div className="flex items-center">
        {Array.from({ length: max }).map((_, i) => (
          <svg
            key={i}
            className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-2 text-sm font-medium text-gray-600">{rating} / {max}</span>
      </div>
    );
  };

  // Function to render progress bar with rating
  const renderProgressRating = (label: string, value: number, max: number = 5) => {
    const percentage = (value / max) * 100;
    return (
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-sm text-gray-500">{value} / {max}</span>
        </div>
        <Progress value={percentage} className="h-2" />
      </div>
    );
  };

  // Mock session feedback data (this would normally come from props)
  const mockSessionFeedback: SessionFeedback = {
    sessionId: sessionId,
    userId: userId,
    rating: 4,
    effectiveness: 4,
    difficulty: 3,
    enjoyment: 5,
    feedback: "Great session overall. I felt much better afterward and the exercises were well-explained.",
    completedAt: new Date(),
    exerciseFeedback: sessionData?.exercises?.map((exercise: any) => ({
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      rating: 4,
      difficulty: 3,
      effectiveness: 4,
      feedback: "This was a good exercise for my hip mobility."
    })) || []
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Recovery Session Complete!</CardTitle>
        <CardDescription>
          Great job, {userProfile?.firstName || 'Athlete'}! Here's a summary of your session.
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Session Overview</TabsTrigger>
            <TabsTrigger value="details">Exercise Details</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="overview" className="p-6 pt-2">
          <div className="space-y-6">
            <div className="flex flex-col space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Overall Rating</h3>
                {renderRating(mockSessionFeedback.rating)}
              </div>
              
              <Separator />
              
              <div className="space-y-4 py-2">
                {renderProgressRating("Effectiveness", mockSessionFeedback.effectiveness)}
                {renderProgressRating("Difficulty", mockSessionFeedback.difficulty)}
                {renderProgressRating("Enjoyment", mockSessionFeedback.enjoyment)}
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Your Feedback</h3>
                <p className="text-sm text-gray-600">
                  {mockSessionFeedback.feedback || "No feedback provided."}
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Session Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <span className="ml-2">{Math.round(sessionData?.totalTime / 60)} minutes</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Intensity:</span>
                    <span className="ml-2 capitalize">{sessionData?.intensity}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Focus Areas:</span>
                    <span className="ml-2">{sessionData?.focusAreas?.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Completed:</span>
                    <span className="ml-2">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="details" className="px-6 pt-2 pb-6">
          <div className="mt-4">
            <Accordion type="single" collapsible className="w-full">
              {mockSessionFeedback.exerciseFeedback?.map((exercise, index) => (
                <AccordionItem key={exercise.exerciseId} value={`exercise-${index}`}>
                  <AccordionTrigger className="flex justify-between">
                    <span>{exercise.exerciseName}</span>
                    <div className="flex mr-4">
                      {renderRating(exercise.rating, 5)}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 px-2">
                    <div className="space-y-3 pt-2">
                      {renderProgressRating("Effectiveness", exercise.effectiveness)}
                      {renderProgressRating("Difficulty", exercise.difficulty)}
                    </div>
                    
                    {exercise.feedback && (
                      <div className="pt-2">
                        <h4 className="text-sm font-medium">Comments</h4>
                        <p className="text-sm text-gray-600 mt-1">{exercise.feedback}</p>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </TabsContent>
      </Tabs>
      
      <CardFooter className="flex justify-between">
        <Button onClick={onClose} className="w-full">
          Done
        </Button>
      </CardFooter>
    </Card>
  );
}