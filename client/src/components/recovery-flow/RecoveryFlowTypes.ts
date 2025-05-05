// Types for recovery exercises
export type Exercise = {
  id: string;
  name: string;
  duration: number; // in seconds
  description: string;
  instruction: string;
  equipment?: string[];
  imageUrl?: string; // URL to pose image
};

// Types for the recovery session
export type RecoverySession = {
  id: string;
  title: string;
  exercises: Exercise[];
  totalTime: number; // in seconds
  intensity: 'light' | 'moderate' | 'intense';
  focusAreas: string[];
  equipment: string[];
};

// Type for session feedback
export type SessionFeedback = {
  sessionId: string;
  userId: number;
  rating: number;
  effectiveness: number;
  difficulty: number;
  enjoyment: number;
  feedback?: string;
  completedAt: Date;
  exerciseFeedback?: ExerciseFeedback[];
};

// Type for individual exercise feedback
export type ExerciseFeedback = {
  exerciseId: string;
  exerciseName: string;
  rating: number;
  difficulty: number;
  effectiveness: number;
  feedback?: string;
};

export const submitSessionFeedback = async (feedback: SessionFeedback): Promise<{ id: number }> => {
  try {
    const response = await fetch('/api/session-feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedback),
    });
    
    if (!response.ok) {
      throw new Error('Failed to submit session feedback');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error submitting session feedback:', error);
    throw error;
  }
};

export const submitExerciseFeedbackBatch = async (
  sessionFeedbackId: number, 
  feedbackItems: ExerciseFeedback[]
): Promise<{ success: boolean }> => {
  try {
    const response = await fetch('/api/exercise-feedback/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionFeedbackId,
        feedbackItems
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to submit exercise feedback');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error submitting exercise feedback batch:', error);
    throw error;
  }
};