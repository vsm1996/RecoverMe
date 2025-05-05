import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RecoverySession, SessionFeedback } from '@/components/recovery-flow/RecoveryFlowTypes';
import { FeedbackForm } from '@/components/recovery-flow/FeedbackForm';
import { FeedbackSummary } from '@/components/recovery-flow/FeedbackSummary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TestFeedbackPage() {
  const [activeTab, setActiveTab] = useState<string>('form');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);
  const [sessionFeedback, setSessionFeedback] = useState<SessionFeedback | null>(null);
  
  // Mock user and session data for testing
  const mockUser = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    profileImage: null,
    sportType: 'Running',
  };
  
  // Create a mock recovery session for testing
  const mockSession: RecoverySession = {
    id: 'session123',
    title: 'Recovery Flow - Lower Body',
    exercises: [
      {
        id: 'ex1',
        name: 'Hamstring Stretch',
        duration: 60,
        description: 'Gentle stretch for hamstrings',
        instruction: 'Sit on the floor with one leg extended and reach toward your toes',
        equipment: ['mat'],
        imageUrl: 'https://example.com/hamstring.jpg'
      },
      {
        id: 'ex2',
        name: 'Quad Stretch',
        duration: 60,
        description: 'Gentle stretch for quadriceps',
        instruction: 'Stand holding onto something for balance, pull your foot up behind you',
        imageUrl: 'https://example.com/quad.jpg'
      },
      {
        id: 'ex3',
        name: 'Calf Raises',
        duration: 120,
        description: 'Strengthening exercise for calves',
        instruction: 'Stand on a flat surface, raise heels up and lower back down slowly',
      }
    ],
    totalTime: 360, // 6 minutes
    intensity: 'light',
    focusAreas: ['Lower Body', 'Flexibility'],
    equipment: ['mat'],
  };
  
  const handleFeedbackSubmit = (feedback: SessionFeedback) => {
    console.log('Feedback submitted:', feedback);
    setSessionFeedback(feedback);
    setFeedbackSubmitted(true);
    setActiveTab('summary');
    
    // In a real app, we would persist this data using the API
    // submitSessionFeedback(feedback)
    //   .then(response => {
    //     console.log('Feedback saved:', response);
    //     if (feedback.exerciseFeedback && feedback.exerciseFeedback.length > 0) {
    //       return submitExerciseFeedbackBatch(response.id, feedback.exerciseFeedback);
    //     }
    //   })
    //   .then(response => {
    //     console.log('Exercise feedback saved:', response);
    //   })
    //   .catch(error => {
    //     console.error('Error saving feedback:', error);
    //   });
  };
  
  const handleReset = () => {
    setFeedbackSubmitted(false);
    setSessionFeedback(null);
    setActiveTab('form');
  };
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Test Feedback Components</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-[400px] mb-6">
          <TabsTrigger value="form">Feedback Form</TabsTrigger>
          <TabsTrigger value="summary">Feedback Summary</TabsTrigger>
        </TabsList>
        
        <TabsContent value="form">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Test Feedback Form</CardTitle>
            </CardHeader>
            <CardContent>
              <FeedbackForm 
                userId={mockUser.id}
                session={mockSession}
                onSubmit={handleFeedbackSubmit}
                onCancel={() => setActiveTab('summary')}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="summary">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Test Feedback Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {feedbackSubmitted && sessionFeedback ? (
                <FeedbackSummary
                  userId={mockUser.id}
                  sessionId={mockSession.id}
                  userProfile={mockUser}
                  sessionData={mockSession}
                  onClose={handleReset}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="mb-4">No feedback submitted yet. Submit the form first or see a preview.</p>
                  <Button onClick={() => setActiveTab('form')}>Go to Form</Button>
                  <Button 
                    variant="outline" 
                    className="ml-2" 
                    onClick={() => {
                      // Create a sample feedback to preview the summary
                      const previewFeedback: SessionFeedback = {
                        sessionId: mockSession.id,
                        userId: mockUser.id,
                        rating: 4,
                        effectiveness: 4,
                        difficulty: 3,
                        enjoyment: 5,
                        feedback: "Great session! I really enjoyed the exercises.",
                        completedAt: new Date(),
                        exerciseFeedback: mockSession.exercises.map(ex => ({
                          exerciseId: ex.id,
                          exerciseName: ex.name,
                          rating: 4,
                          effectiveness: 4,
                          difficulty: 3,
                          feedback: `Feedback for ${ex.name}`
                        }))
                      };
                      setSessionFeedback(previewFeedback);
                      setFeedbackSubmitted(true);
                    }}
                  >
                    Preview Summary
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}