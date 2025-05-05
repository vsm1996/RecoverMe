import OpenAI from "openai";
import { apiCache, CACHE_TTL } from './cache';
import { storage } from './storage';
import dotenv from 'dotenv';
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Track API rate limits to avoid exceeding quotas
const rateLimitWindows: Record<string, number[]> = {
  '1m': [], // 1-minute window
  '1h': [], // 1-hour window
};

// Check if we're within rate limits
function checkRateLimit(): boolean {
  const now = Date.now();

  // Clean up expired timestamps
  rateLimitWindows['1m'] = rateLimitWindows['1m'].filter(time => now - time < 60 * 1000);
  rateLimitWindows['1h'] = rateLimitWindows['1h'].filter(time => now - time < 60 * 60 * 1000);

  // Check if we're within limits
  const minute_limit = 10; // 10 requests per minute
  const hour_limit = 100;  // 100 requests per hour

  if (rateLimitWindows['1m'].length >= minute_limit ||
    rateLimitWindows['1h'].length >= hour_limit) {
    return false;
  }

  // Add current timestamp to both windows
  rateLimitWindows['1m'].push(now);
  rateLimitWindows['1h'].push(now);

  return true;
}

// Fallback recovery plan generation when AI is unavailable
async function generateFallbackRecoveryPlan(userData: any): Promise<{
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
  const { focusAreas = ['full_body'], timeAvailable = 15, intensity = 'moderate' } = userData;

  const title = `${focusAreas.includes('full_body')
    ? 'Full Body'
    : focusAreas.map((f: string) => f.charAt(0).toUpperCase() + f.slice(1)).join(' & ')
    } ${intensity.charAt(0).toUpperCase() + intensity.slice(1)
    } Recovery`;

  const description = `A ${intensity} intensity recovery session targeting ${focusAreas.includes('full_body')
    ? 'your entire body'
    : focusAreas.map((f: string) => f.replace('_', ' ')).join(' and ')
    }. This ${timeAvailable}-minute recovery flow will help improve mobility, reduce soreness, and enhance your performance.`;

  // Determine task count based on time available
  let taskCount = 4; // Default
  if (timeAvailable <= 10) taskCount = 3;
  else if (timeAvailable <= 20) taskCount = 4;
  else if (timeAvailable <= 30) taskCount = 5;
  else if (timeAvailable <= 45) taskCount = 6;
  else taskCount = 7;

  const tasks: Array<{
    title: string;
    description: string;
    category: string;
    duration: number;
    isCompleted: boolean;
  }> = [];

  try {
    // Try to get exercises from the database
    const mobilityExercises = await storage.getExercisesByCategory('mobility');
    const recoveryExercises = await storage.getExercisesByCategory('recovery');
    const strengthExercises = await storage.getExercisesByCategory('strength');

    // If we have exercises in the database, use them
    if (mobilityExercises.length > 0 || recoveryExercises.length > 0 || strengthExercises.length > 0) {
      console.log("Using exercises from database for fallback plan");

      // Map user focus areas to target muscles
      const targetMuscleMapping: Record<string, string[]> = {
        'full_body': ['core', 'glutes', 'hamstrings', 'quads', 'shoulders', 'lower_back', 'upper_back', 'neck'],
        'upper_body': ['shoulders', 'upper_back', 'chest', 'biceps', 'triceps', 'wrists', 'forearms'],
        'lower_body': ['glutes', 'hamstrings', 'quads', 'calves', 'ankles', 'hip_flexors', 'adductors'],
        'back': ['lower_back', 'upper_back', 'spine'],
        'shoulders': ['shoulders', 'rear_delts', 'rotator_cuff'],
        'hips': ['hips', 'glutes', 'hip_flexors'],
        'legs': ['quads', 'hamstrings', 'calves', 'adductors']
      };

      // Helper function to safely check if an array includes an item
      const safeIncludes = (arr: any[] | null | undefined, item: any) => {
        return Array.isArray(arr) && arr.includes(item);
      };

      // Helper function to safely check if any item in array1 is in array2
      const safeOverlap = (arr1: any[] | null | undefined, arr2: any[] | null | undefined) => {
        if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
        return arr1.some(item => arr2.includes(item));
      };

      // Helper function to safely get array length
      const safeLength = (arr: any[] | null | undefined) => {
        return Array.isArray(arr) ? arr.length : 0;
      };

      // Combine all exercises
      let allExercises = [...mobilityExercises, ...recoveryExercises, ...strengthExercises];

      // Filter by equipment if provided
      if (userData.equipment && userData.equipment.length > 0 && !userData.equipment.includes('none')) {
        const equipment = userData.equipment.filter((eq: string) => eq !== 'none');
        const filteredByEquipment = allExercises.filter(ex =>
          safeOverlap(ex.equipmentRequired, equipment) ||
          safeLength(ex.equipmentRequired) === 0
        );

        // Use filtered list if we found matches, otherwise use all
        if (filteredByEquipment.length > 0) {
          allExercises = filteredByEquipment;
        }
      }

      // Filter by target areas if not full body
      if (!focusAreas.includes('full_body')) {
        const targetMuscles = focusAreas.flatMap((area: string) => targetMuscleMapping[area] || []);
        if (targetMuscles.length > 0) {
          const filteredByTarget = allExercises.filter(ex =>
            safeOverlap(ex.targetMuscles, targetMuscles)
          );

          // Use filtered list if we found matches
          if (filteredByTarget.length >= 3) {
            allExercises = filteredByTarget;
          }
        }
      }

      // Keep beginner exercises for light intensity
      if (intensity === 'light') {
        const beginnerExercises = allExercises.filter(ex => ex.difficultyLevel === 'beginner');
        if (beginnerExercises.length >= 3) {
          allExercises = beginnerExercises;
        }
      }

      // Add more intermediate/advanced exercises for intense sessions
      if (intensity === 'intense') {
        // Prioritize but don't limit to advanced exercises
        allExercises.sort((a, b) => {
          if (a.difficultyLevel === 'advanced' && b.difficultyLevel !== 'advanced') return -1;
          if (a.difficultyLevel !== 'advanced' && b.difficultyLevel === 'advanced') return 1;
          if (a.difficultyLevel === 'intermediate' && b.difficultyLevel === 'beginner') return -1;
          if (a.difficultyLevel === 'beginner' && b.difficultyLevel === 'intermediate') return 1;
          return 0;
        });
      }

      // Shuffle exercises to get variety
      allExercises = allExercises.sort(() => Math.random() - 0.5);

      // Initial warm-up exercise (no meditation/breathing)
      tasks.push({
        title: "Dynamic Warm-Up",
        description: "Perform a series of gentle movements to prepare your body: arm circles, leg swings, torso rotations, and gentle neck rolls. Perform each movement for 15-20 seconds.",
        category: "mobility",
        duration: 2,
        isCompleted: false
      });

      // Add exercises from our database
      const remainingTasks = taskCount - 1; // Account for start task only
      const exercisesToAdd = allExercises.slice(0, remainingTasks);

      for (const exercise of exercisesToAdd) {
        // Check if instructions exists either as an array or a property
        const instructionsText = Array.isArray(exercise.instructions) ?
          exercise.instructions.join('. ') :
          (typeof exercise.instructions === 'string' ? exercise.instructions : '');

        const instructions = instructionsText ?
          instructionsText :
          `Perform ${exercise.name} focusing on proper form and controlled movement.`;

        tasks.push({
          title: exercise.name,
          description: `${exercise.description || ''}. ${instructions} Adjust intensity as needed based on your recovery needs.`,
          category: exercise.category || 'recovery',
          duration: Math.floor(timeAvailable / taskCount),
          isCompleted: false
        });
      }
    } else {
      // Use default fallback exercises if database has none
      console.log("No exercises in database, using hardcoded fallback tasks");

      // Initial warm-up exercise (no meditation/breathing)
      tasks.push({
        title: "Dynamic Warm-Up",
        description: "Perform a series of gentle movements to prepare your body: arm circles, leg swings, torso rotations, and gentle neck rolls. Perform each movement for 15-20 seconds.",
        category: "mobility",
        duration: 2,
        isCompleted: false
      });

      // Add focused recovery exercises based on areas
      if (focusAreas.includes('upper_body') || focusAreas.includes('full_body')) {
        tasks.push({
          title: "Shoulder & Chest Release",
          description: "Perform arm circles forward and backward. Then, clasp hands behind back for a gentle chest stretch. Hold each stretch for 20-30 seconds.",
          category: "stretching",
          duration: Math.floor(timeAvailable / taskCount),
          isCompleted: false
        });
      }

      if (focusAreas.includes('lower_body') || focusAreas.includes('full_body') || focusAreas.includes('legs')) {
        tasks.push({
          title: "Lower Body Recovery",
          description: "Perform gentle hamstring stretches, quad stretches, and calf stretches. Hold each position for 30 seconds and repeat on both sides.",
          category: "stretching",
          duration: Math.floor(timeAvailable / taskCount),
          isCompleted: false
        });
      }

      if (focusAreas.includes('back') || focusAreas.includes('full_body')) {
        tasks.push({
          title: "Back Mobility Flow",
          description: "Perform cat-cow stretches, gentle spinal twists, and child's pose. Move slowly with controlled movement to improve spinal mobility.",
          category: "mobility",
          duration: Math.floor(timeAvailable / taskCount),
          isCompleted: false
        });
      }

      if (focusAreas.includes('shoulders') || focusAreas.includes('upper_body') || focusAreas.includes('full_body')) {
        tasks.push({
          title: "Shoulder Mobility Routine",
          description: "Perform shoulder rolls, arm circles, and shoulder stretches. Move slowly through each motion focusing on proper technique.",
          category: "mobility",
          duration: Math.floor(timeAvailable / taskCount),
          isCompleted: false
        });
      }

      if (focusAreas.includes('hips') || focusAreas.includes('lower_body') || focusAreas.includes('full_body')) {
        tasks.push({
          title: "Hip Mobility",
          description: "Perform hip circles, lateral lunges, and hip flexor stretches. Move through a full range of motion on each exercise.",
          category: "mobility",
          duration: Math.floor(timeAvailable / taskCount),
          isCompleted: false
        });
      }

      // Cool-down exercise
      tasks.push({
        title: "Cool-Down Stretches",
        description: "Perform a series of static stretches for all major muscle groups. Hold each position for 30 seconds, focusing on proper form and gentle intensity.",
        category: "stretching",
        duration: 2,
        isCompleted: false
      });
    }
  } catch (error) {
    console.error("Error getting exercises from database:", error);

    // If there's an error with database, use default exercises
    console.log("Error accessing database, using default exercises");

    // Initial warm-up exercise (no meditation/breathing)
    tasks.push({
      title: "Dynamic Warm-Up",
      description: "Perform a series of gentle movements to prepare your body: arm circles, leg swings, torso rotations, and gentle neck rolls. Perform each movement for 15-20 seconds.",
      category: "mobility",
      duration: 2,
      isCompleted: false
    });

    // Add focused recovery exercises based on areas
    if (focusAreas.includes('upper_body') || focusAreas.includes('full_body')) {
      tasks.push({
        title: "Shoulder & Chest Release",
        description: "Perform arm circles forward and backward. Then, clasp hands behind back for a gentle chest stretch. Hold each stretch for 20-30 seconds.",
        category: "stretching",
        duration: Math.floor(timeAvailable / taskCount),
        isCompleted: false
      });
    }

    // Cool-down exercise
    tasks.push({
      title: "Cool-Down Stretches",
      description: "Perform a series of static stretches for all major muscle groups. Hold each position for 30 seconds, focusing on proper form and gentle intensity.",
      category: "stretching",
      duration: 2,
      isCompleted: false
    });
  }

  // Adjust task list length based on available time
  while (tasks.length > taskCount + 1) {
    // Remove tasks from the middle (keep first and last)
    tasks.splice(Math.floor(tasks.length / 2), 1);
  }

  // Adjust durations to match total time
  const totalTaskTime = tasks.reduce((sum, task) => sum + task.duration, 0);
  if (totalTaskTime < timeAvailable) {
    // Distribute extra time among tasks
    const extraTime = timeAvailable - totalTaskTime;
    const tasksToAddTime = Math.min(tasks.length, extraTime);
    for (let i = 0; i < tasksToAddTime; i++) {
      tasks[i].duration += 1;
    }
  }

  return {
    title,
    description,
    tasks
  };
}

// Generate recovery recommendations based on user data
export async function generateRecoveryRecommendation(userData: {
  userId: number;
  soreness: Record<string, number>;
  metrics?: any;
  plans?: any[];
  intensity?: 'light' | 'moderate' | 'intense';
}): Promise<{
  recommendations: string[];
  focusAreas: string[];
}> {
  try {
    // Create a cache key from input parameters
    const cacheKey = {
      userId: userData.userId,
      soreness: userData.soreness,
      function: 'generateRecoveryRecommendation'
    };

    // Check if we have a cached response
    const cachedResponse = apiCache.get<{ recommendations: string[]; focusAreas: string[] }>(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Determine if we can use the API (rate limits, quota)
    const canUseApi = checkRateLimit();
    if (!canUseApi) {
      // Fallback to local recommendation logic
      console.log("Rate limit reached, using fallback recommendation generator");

      // Simple fallback logic based on soreness
      const results: {
        recommendations: string[];
        focusAreas: string[];
      } = {
        recommendations: [],
        focusAreas: []
      };

      // Add recommendations based on soreness levels
      for (const [area, level] of Object.entries(userData.soreness || {})) {
        if (level > 7) {
          results.recommendations.push(`Your ${area.replace('_', ' ')} soreness is high. Focus on gentle recovery techniques today.`);
          results.focusAreas.push(area);
        } else if (level > 4) {
          results.recommendations.push(`Moderate ${area.replace('_', ' ')} soreness detected. Include targeted mobility exercises.`);
          results.focusAreas.push(area);
        }
      }

      // Default recommendation if none found
      if (results.recommendations.length === 0) {
        results.recommendations.push('Focus on full-body mobility work to maintain movement quality and prevent soreness.');
        results.focusAreas.push('full_body');
      }

      // Cache the result
      apiCache.set(cacheKey, results, CACHE_TTL.RECOVERY_RECOMMENDATION);

      return results;
    }

    // Generate completion with OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert sports recovery coach analyzing athlete data to provide targeted recommendations."
        },
        {
          role: "user",
          content: `Based on the following athlete data, provide 2-3 specific recovery recommendations and suggest key focus areas for recovery work.
          
          Athlete Data:
          - Soreness Map: ${Object.entries(userData.soreness || {}).map(([area, level]) => `${area.replace('_', ' ')}: ${level}/10`).join(', ')}
          - Recovery Intensity Preference: ${userData.intensity || 'moderate'}
          
          Respond with JSON in this format:
          {
            "recommendations": ["recommendation 1", "recommendation 2"],
            "focusAreas": ["area1", "area2"]
          }
          
          The focusAreas should be from this list only: full_body, upper_body, lower_body, back, shoulders, hips, legs
          `
        }
      ],
      response_format: { type: "json_object" },
    });

    // Extract and format the recommendations
    const result = JSON.parse(response.choices[0].message.content || "{}");

    // Ensure we have the right structure
    const formattedResult = {
      recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
      focusAreas: Array.isArray(result.focusAreas) ? result.focusAreas : []
    };

    // Fallback if we got empty results
    if (formattedResult.recommendations.length === 0 || formattedResult.focusAreas.length === 0) {
      formattedResult.recommendations.push('Focus on full-body mobility work to maintain movement quality and prevent soreness.');
      formattedResult.focusAreas.push('full_body');
    }

    // Cache the result
    apiCache.set(cacheKey, formattedResult, CACHE_TTL.RECOVERY_RECOMMENDATION);

    return formattedResult;
  } catch (error) {
    console.error("Error generating recovery recommendations:", error);

    // Fallback recommendations
    return {
      recommendations: ['Focus on full-body mobility work to maintain movement quality and prevent soreness.'],
      focusAreas: ['full_body']
    };
  }
}

// Generate detailed recovery plan
export async function generateRecoveryPlan(userData: {
  userId: number;
  sportType?: string;
  timeAvailable: number;
  focusAreas: string[];
  intensity: string;
  equipment: string[];
  injuries?: Array<{ bodyPart: string; description: string; }>;
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
    // Create a cache key from the input parameters
    const cacheKey = {
      userId: userData.userId,
      timeAvailable: userData.timeAvailable,
      focusAreas: userData.focusAreas.sort().join(','),
      intensity: userData.intensity,
      equipment: userData.equipment.sort().join(','),
      function: 'generateRecoveryPlan'
    };

    // Check if we have a cached response
    const cachedResponse = apiCache.get<{
      title: string;
      description: string;
      tasks: Array<{
        title: string;
        description: string;
        category: string;
        duration: number;
        isCompleted: boolean;
      }>;
    }>(cacheKey);

    if (cachedResponse) {
      return cachedResponse;
    }

    try {
      // Fetch relevant exercises from the database
      let exercisesByCategory: Record<string, Array<any>> = {};

      // Map user focus areas to target muscles
      const targetMuscleMapping: Record<string, string[]> = {
        'full_body': ['core', 'glutes', 'hamstrings', 'quads', 'shoulders', 'lower_back', 'upper_back', 'neck'],
        'upper_body': ['shoulders', 'upper_back', 'chest', 'biceps', 'triceps', 'wrists', 'forearms'],
        'lower_body': ['glutes', 'hamstrings', 'quads', 'calves', 'ankles', 'hip_flexors', 'adductors'],
        'back': ['lower_back', 'upper_back', 'spine'],
        'shoulders': ['shoulders', 'rear_delts', 'rotator_cuff'],
        'hips': ['hips', 'glutes', 'hip_flexors'],
        'legs': ['quads', 'hamstrings', 'calves', 'adductors']
      };

      // Convert equipment format to match database
      const normalizedEquipment = userData.equipment.map(eq => eq.replace(/^foam_/, '')).filter(eq => eq !== 'none');

      // Get equipment-appropriate exercises
      let availableExercises = [];

      // Fetch recovery exercises
      const recoveryExercises = await storage.getExercisesByCategory('recovery');
      availableExercises.push(...recoveryExercises);
      exercisesByCategory.recovery = recoveryExercises;

      // Fetch mobility exercises
      const mobilityExercises = await storage.getExercisesByCategory('mobility');
      availableExercises.push(...mobilityExercises);
      exercisesByCategory.mobility = mobilityExercises;

      // Fetch strength exercises
      const strengthExercises = await storage.getExercisesByCategory('strength');
      availableExercises.push(...strengthExercises);
      exercisesByCategory.strength = strengthExercises;

      console.log(`Found ${availableExercises.length} total exercises`);

      // Helper function to safely check if an array includes an item
      const safeIncludes = (arr: any[] | null | undefined, item: any) => {
        return Array.isArray(arr) && arr.includes(item);
      };

      // Helper function to safely check if any item in array1 is in array2
      const safeOverlap = (arr1: any[] | null | undefined, arr2: any[] | null | undefined) => {
        if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
        return arr1.some(item => arr2.includes(item));
      };

      // Helper function to safely get array length
      const safeLength = (arr: any[] | null | undefined) => {
        return Array.isArray(arr) ? arr.length : 0;
      };

      // Filter exercises by equipment if equipment specified
      if (normalizedEquipment.length > 0) {
        const equipmentFilteredExercises = availableExercises.filter(exercise =>
          safeOverlap(exercise.equipmentRequired, normalizedEquipment) ||
          safeLength(exercise.equipmentRequired) === 0
        );

        // If we found exercises matching equipment, use those
        if (equipmentFilteredExercises.length > 0) {
          availableExercises = equipmentFilteredExercises;
        }
        // Otherwise fall back to exercises that don't require equipment
        else {
          availableExercises = availableExercises.filter(ex =>
            safeLength(ex.equipmentRequired) === 0 ||
            safeIncludes(ex.equipmentRequired, 'none')
          );
        }
      }

      console.log(`After equipment filtering: ${availableExercises.length} exercises`);

      // Filter exercises by target areas
      const targetMuscles = userData.focusAreas.flatMap((area: string) => targetMuscleMapping[area] || []);

      let targetAreaExercises = availableExercises;
      if (targetMuscles.length > 0 && !userData.focusAreas.includes('full_body')) {
        targetAreaExercises = availableExercises.filter(exercise =>
          safeOverlap(exercise.targetMuscles, targetMuscles)
        );

        // Fall back to all exercises if we don't have enough target-specific ones
        if (targetAreaExercises.length < 3) {
          targetAreaExercises = availableExercises;
        }
      }

      console.log(`After target area filtering: ${targetAreaExercises.length} exercises`);

      // Use OpenAI to create a structured plan with our available exercises
      const exercisesList = targetAreaExercises.map(ex => ({
        id: ex.id,
        name: ex.name,
        category: ex.category,
        equipment: ex.equipmentRequired,
        targetMuscles: ex.targetMuscles,
        difficulty: ex.difficultyLevel,
        description: ex.description
      }));

      const prompt = `Create a personalized recovery plan for an athlete with the following details:
      
  Sport Type: ${userData.sportType}
  Time Available: ${userData.timeAvailable} minutes
  Focus Areas: ${userData.focusAreas.join(', ')}
  Intensity Level: ${userData.intensity}
  Equipment Available: ${userData.equipment.join(', ')}
  Injuries: ${userData.injuries ? userData.injuries.map(i => `${i.bodyPart} - ${i.description}`).join(', ') : 'None reported'}
  
  Soreness Areas:
  ${Object.entries(userData.soreness || {}).map(([area, level]) => `${area}: ${level}/10`).join('\n')}
  
  Here are exercises available in our database that match the athlete's criteria:
  ${JSON.stringify(exercisesList.slice(0, 20))}
  
  Create a recovery flow session using these exercises from our database. For each exercise, include the exercise name exactly as written and its ID.
  
  Provide a JSON response in this format:
  {
    "title": "Recovery Plan Title",
    "description": "Brief overview of the recovery plan",
    "tasks": [
      {
        "title": "Exercise Name", 
        "exerciseId": 123,
        "description": "Instructions for the exercise",
        "category": "One of: stretching, mobility, recovery, strength",
        "duration": 5, // Time in minutes (should sum to timeAvailable)
        "isCompleted": false
      }
      // More tasks...
    ]
  }
  
  The plan should include 4-7 exercises depending on the available time.
  IMPORTANT: Focus EXCLUSIVELY on physical recovery exercises such as stretching, mobility work, and gentle strength exercises.
  Do NOT include any meditation, mindfulness, or breathing exercises - the plan should only contain physical movement exercises.
  Ensure the total duration equals the time available.
  Include exercises from our database wherever possible, using their exact names and IDs.
  `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const planData = JSON.parse(response.choices[0].message.content || "{}");

      // Process the response to supplement with full exercise data if needed
      const tasks = (planData.tasks || []).map((task: {
        title: string;
        exerciseId?: number;
        description: string;
        category: string;
        duration: number;
        isCompleted: boolean;
      }) => {
        // If task has an exerciseId, find the corresponding exercise
        if (task.exerciseId) {
          const matchingExercise = availableExercises.find(ex => ex.id === task.exerciseId);
          if (matchingExercise) {
            // Check if instructions exists either as an array or a property
            const instructionsText = Array.isArray(matchingExercise.instructions) ?
              matchingExercise.instructions.join('. ') :
              (typeof matchingExercise.instructions === 'string' ? matchingExercise.instructions : '');

            const instructions = instructionsText || '';

            const detailedDescription = instructions ?
              `${matchingExercise.description || ''}. ${instructions}` :
              (task.description || matchingExercise.description);

            return {
              ...task,
              title: matchingExercise.name, // Ensure we use the exact name
              description: detailedDescription,
              category: matchingExercise.category || task.category,
              isCompleted: false
            };
          }
        }
        return task;
      });

      const result = {
        title: planData.title || "Recovery Plan",
        description: planData.description || "Personalized recovery plan for optimal performance",
        tasks: tasks,
      };

      // Cache the result
      apiCache.set(cacheKey, result, CACHE_TTL.RECOVERY_PLAN);

      return result;
    } catch (apiError) {
      // If OpenAI API fails (due to rate limit, quota, etc.), use fallback
      console.log("OpenAI API error, using fallback generator:", apiError);
      return generateFallbackRecoveryPlan(userData);
    }
  } catch (error: any) {
    console.error("Error generating recovery plan:", error);
    // Use fallback mechanism instead of throwing error
    console.log("Critical error in recovery plan generation, using fallback");
    return generateFallbackRecoveryPlan(userData);
  }
}

// Analyze movement from image
export async function analyzeMovement(base64Image: string): Promise<any> {
  try {
    const imageType = base64Image.substring(0, 50).includes('data:image') ? 'url' : 'base64';

    // Create a cache key from the image hash 
    const imageHash = base64Image.length.toString() + base64Image.substring(0, 100) + base64Image.substring(base64Image.length - 100);
    const cacheKey = {
      imageHash,
      function: 'analyzeMovement'
    };

    // Check if we have a cached response
    const cachedResponse = apiCache.get<any>(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Determine if we can use the API (rate limits, quota)
    const canUseApi = checkRateLimit();
    if (!canUseApi) {
      // Fallback to local movement analysis logic
      console.log("Rate limit reached, using fallback movement analysis");

      return {
        quality: 'fair',
        feedback: [
          "Your movement appears to be functional, but there may be room for improvement.",
          "Focus on maintaining neutral spine alignment during exercises.",
          "Consider working on your shoulder and hip mobility."
        ],
        suggestions: [
          "Add hip mobility drills to your warm-up routine.",
          "Include thoracic spine mobility exercises in your recovery sessions."
        ]
      };
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert movement analyst who can assess posture, mobility, and movement quality from images. Focus on providing evidence-based, practical feedback."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image of my movement/posture and provide feedback on quality, potential issues, and recommendations for improvement. Format your response as JSON with these keys: 'quality' (excellent/good/fair/poor), 'feedback' (array of 2-3 observations), 'suggestions' (array of 2-3 improvement recommendations)"
            },
            {
              type: "image_url",
              image_url: {
                url: imageType === 'url' ? base64Image : `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    // Cache the result
    apiCache.set(cacheKey, result, CACHE_TTL.MOVEMENT_ANALYSIS);

    return result;
  } catch (error) {
    console.error("Error analyzing movement:", error);

    // Fallback response
    return {
      quality: 'fair',
      feedback: [
        "Unable to analyze image properly. Please try again with a clearer image.",
        "Ensure adequate lighting and that your full form is visible in the frame."
      ],
      suggestions: [
        "Try uploading a different image where your form is clearly visible.",
        "Consider seeking in-person movement assessment from a qualified professional."
      ]
    };
  }
}

// Analyze session feedback and provide insights
export async function analyzeFeedback(feedbackData: {
  userId: number;
  sessionFeedback: Array<{
    sessionId: string;
    rating: number;
    effectiveness: number;
    difficulty: number;
    enjoyment: number;
    feedback?: string;
    completedAt: string;
    exercises: Array<{
      name: string;
      rating: number;
      difficulty: number;
      effectiveness: number;
      feedback?: string;
    }>;
  }>;
}): Promise<{
  insights: string[];
  recommendations: string[];
}> {
  try {
    // Create a cache key from the input parameters
    const cacheKey = {
      userId: feedbackData.userId,
      sessionCount: feedbackData.sessionFeedback.length,
      lastSessionTimestamp: feedbackData.sessionFeedback[0]?.completedAt,
      function: 'analyzeFeedback'
    };

    // Check if we have a cached response
    const cachedResponse = apiCache.get<{
      insights: string[];
      recommendations: string[];
    }>(cacheKey);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Determine if we can use the API (rate limits, quota)
    const canUseApi = checkRateLimit();
    if (!canUseApi) {
      // Fallback to local feedback analysis logic
      console.log("Rate limit reached, using fallback feedback analysis");

      return {
        insights: [
          "Your feedback shows you're making progress with your recovery routine.",
          "You seem to respond well to moderate-intensity exercises."
        ],
        recommendations: [
          "Continue with your current recovery plan and track your progress.",
          "Try varying your exercise selection to prevent plateaus."
        ]
      };
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert recovery coach analyzing feedback data to provide personalized insights and recommendations."
        },
        {
          role: "user",
          content: `Based on the following athlete feedback data, provide insights and recommendations:
          
          Feedback data:
          ${JSON.stringify(feedbackData.sessionFeedback, null, 2)}
          
          Respond with JSON in this format:
          {
            "insights": ["insight 1", "insight 2", "insight 3"],
            "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
          }
          
          Insights should be observations about patterns in the data.
          Recommendations should be actionable advice based on the feedback patterns.
          `
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    // Cache the result
    apiCache.set(cacheKey, result, CACHE_TTL.FEEDBACK_ANALYSIS);

    return result;
  } catch (error) {
    console.error("Error analyzing feedback:", error);

    // Fallback response
    return {
      insights: [
        "You've been consistent with your recovery sessions.",
        "Your feedback helps us improve your future recovery plans."
      ],
      recommendations: [
        "Continue with your current recovery routine and provide feedback.",
        "Consider trying different exercise variations to find what works best for you."
      ]
    };
  }
}