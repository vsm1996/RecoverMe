import { apiRequest } from "./queryClient";

export type Exercise = {
  id: string;
  name: string;
  duration: number; // in seconds
  description: string;
  instruction: string;
  equipment?: string[];
  imageUrl?: string; // URL to pose image
};

export type RecoverySession = {
  id: string;
  title: string;
  exercises: Exercise[];
  totalTime: number; // in seconds
  intensity: 'light' | 'moderate' | 'intense';
  focusAreas: string[];
  equipment: string[];
};

export type RecoveryPreferences = {
  duration: number; // in minutes
  intensity: 'light' | 'moderate' | 'intense';
  focusAreas: string[];
  equipment: string[];
};

export type SessionFeedback = {
  sessionId: string;
  userId: number;
  rating: number;
  effectiveness: number;
  difficulty: number;
  enjoyment: number;
  feedback?: string;
  completedAt?: Date;
  exerciseFeedback?: ExerciseFeedback[];
};

export type ExerciseFeedback = {
  exerciseId: string;
  exerciseName: string;
  rating: number;
  difficulty: number;
  effectiveness: number;
  feedback?: string;
};

/**
 * Generate a personalized recovery flow session based on user preferences
 */
export async function generateRecoveryFlow(userId: number, preferences: RecoveryPreferences): Promise<RecoverySession> {
  const response = await apiRequest(`/api/ai/recovery-plan`, {
    method: 'POST',
    body: JSON.stringify({ userId, preferences }),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate recovery flow');
  }
  
  return await response.json();
}

/**
 * Submit feedback for a completed recovery session
 */
export async function submitSessionFeedback(feedback: SessionFeedback): Promise<{ id: number }> {
  const response = await apiRequest(`/api/session-feedback`, {
    method: 'POST',
    body: JSON.stringify(feedback),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to submit session feedback');
  }
  
  return await response.json();
}

/**
 * Submit feedback for a specific exercise in a recovery session
 */
export async function submitExerciseFeedback(sessionFeedbackId: number, feedback: ExerciseFeedback): Promise<{ id: number }> {
  const response = await apiRequest(`/api/exercise-feedback`, {
    method: 'POST',
    body: JSON.stringify({
      sessionFeedbackId,
      ...feedback
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to submit exercise feedback');
  }
  
  return await response.json();
}

/**
 * Submit feedback for multiple exercises in a batch
 */
export async function submitExerciseFeedbackBatch(
  sessionFeedbackId: number, 
  exerciseFeedback: ExerciseFeedback[]
): Promise<{ id: number }[]> {
  const response = await apiRequest(`/api/exercise-feedback/batch`, {
    method: 'POST',
    body: JSON.stringify({
      sessionFeedbackId,
      exercises: exerciseFeedback
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to submit exercise feedback batch');
  }
  
  return await response.json();
}

/**
 * Get all feedback for a specific session
 */
export async function getSessionFeedback(sessionId: string): Promise<SessionFeedback> {
  const response = await apiRequest(`/api/session-feedback/${sessionId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to get session feedback');
  }
  
  return await response.json();
}

/**
 * Get all feedback sessions for a user
 */
export async function getUserSessionFeedback(userId: number): Promise<SessionFeedback[]> {
  const response = await apiRequest(`/api/users/${userId}/session-feedback`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to get user session feedback');
  }
  
  return await response.json();
}

export default {
  generateRecoveryFlow,
  submitSessionFeedback,
  submitExerciseFeedback,
  submitExerciseFeedbackBatch,
  getSessionFeedback,
  getUserSessionFeedback
};