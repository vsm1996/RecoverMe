import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
// For client-side requests, we use server-side API endpoints to access OpenAI

// Basic text analysis for recovery recommendations
export async function generateRecoveryRecommendation(userData: {
  soreness: Record<string, number>;
  heartRate: number | null;
  sleepQuality: number | null;
  activityLevel: number | null;
  sportType: string;
  injuries: { bodyPart: string; description: string; date: string }[] | null;
  equipment: string[] | null;
}): Promise<string> {
  try {
    const response = await fetch('/api/ai/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userData }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const data = await response.json();
    return data.recommendation || "Unable to generate recommendation at this time.";
  } catch (error: any) {
    console.error("Error generating recovery recommendation:", error);
    return "We're experiencing issues with our AI recommendation system. Please try again later.";
  }
}

// Generate a personalized recovery plan
export async function generateRecoveryPlan(userData: {
  userId: number;
  sportType: string;
  timeAvailable: number;
  focusAreas: string[];
  intensity: "light" | "moderate" | "intense";
  equipment: string[];
  injuries: { bodyPart: string; description: string; date: string }[] | null;
  soreness: Record<string, number>;
}): Promise<{
  title: string;
  description: string;
  tasks: Array<{
    title: string;
    description: string;
    category: string;
    duration: number;
    isCompleted: boolean;
  }>;
}> {
  try {
    const response = await fetch('/api/ai/recovery-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userData }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      title: data.title || "Recovery Plan",
      description: data.description || "Personalized recovery plan for optimal performance",
      tasks: data.tasks || [],
    };
  } catch (error: any) {
    console.error("Error generating recovery plan:", error);
    throw new Error("Failed to generate recovery plan. Please try again later.");
  }
}

// Analyze movement from image
export async function analyzeMovement(base64Image: string): Promise<{
  analysis: string;
  feedback: { type: string; message: string }[];
}> {
  try {
    const response = await fetch('/api/ai/analyze-movement', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        imageData: base64Image
      }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const result = await response.json();
    return {
      analysis: result.analysis || "Unable to analyze movement",
      feedback: result.feedback || [],
    };
  } catch (error: any) {
    console.error("Error analyzing movement:", error);
    throw new Error("Failed to analyze movement. Please try again later.");
  }
}

// Analyze session feedback and provide insights
export async function analyzeFeedback(feedbackData: {
  sessionRating: number;
  effectiveness: number;
  difficulty: number;
  enjoyment: number;
  textFeedback: string;
  exerciseFeedback: Array<{
    exerciseName: string;
    rating: number;
    effectiveness: number;
    difficulty: number;
    feedback: string | null;
  }>;
}): Promise<{
  insights: string;
  recommendations: string[];
}> {
  try {
    const response = await fetch('/api/ai/analyze-feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ feedbackData }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const result = await response.json();
    return {
      insights: result.insights || "No insights available",
      recommendations: result.recommendations || [],
    };
  } catch (error: any) {
    console.error("Error analyzing feedback:", error);
    throw new Error("Failed to analyze feedback. Please try again later.");
  }
}

export default {
  generateRecoveryRecommendation,
  generateRecoveryPlan,
  analyzeMovement,
  analyzeFeedback
};