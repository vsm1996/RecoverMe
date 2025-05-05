import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  insertUserSchema,
  insertRecoveryMetricSchema,
  insertRecoveryPlanSchema,
  insertRecoveryTaskSchema,
  insertMovementAssessmentSchema,
  insertChartDataSchema,
  insertMovementLimitationSchema,
  insertExerciseLibrarySchema,
  insertRecoveryProtocolSchema,
  insertSessionFeedbackSchema,
  insertExerciseFeedbackSchema,
  ExerciseLibrary,
  RecoveryProtocol,
  SessionFeedback,
  ExerciseFeedback,
  InsertExerciseLibrary
} from "@shared/schema";
import { z } from "zod";
import * as openaiService from "./openai";
import { expertRouter } from "./expertRoutes";
import session from "express-session";
import MemoryStore from "memorystore";
import { parse as csvParse } from 'csv-parse';
import { Readable } from 'stream';

console.log("welcome")

export async function registerRoutes(app: Express): Promise<Server> {
  // User Routes
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Don't send the password in the response
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const newUser = await storage.createUser(userData);

      // Don't send the password in the response
      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.patch("/api/users/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    try {
      // Use partial schema for updates
      const updateData = insertUserSchema.partial().parse(req.body);
      const updatedUser = await storage.updateUser(id, updateData);

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't send the password in the response
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Recovery Metrics Routes
  app.get("/api/users/:userId/metrics", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const metrics = await storage.getRecoveryMetricsByUserId(userId);
    res.json(metrics);
  });

  app.get("/api/users/:userId/metrics/latest", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const metrics = await storage.getRecoveryMetricsByUserId(userId);
    if (metrics.length === 0) {
      return res.status(404).json({ message: "No metrics found for user" });
    }

    res.json(metrics[0]); // First one is the latest due to sort in the storage method
  });

  app.post("/api/metrics", async (req: Request, res: Response) => {
    try {
      const metricData = insertRecoveryMetricSchema.parse(req.body);
      const newMetric = await storage.createRecoveryMetric(metricData);
      res.status(201).json(newMetric);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid metric data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create recovery metric" });
    }
  });

  app.patch("/api/metrics/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    try {
      const updateData = insertRecoveryMetricSchema.partial().parse(req.body);
      const updatedMetric = await storage.updateRecoveryMetric(id, updateData);

      if (!updatedMetric) {
        return res.status(404).json({ message: "Metric not found" });
      }

      res.json(updatedMetric);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid metric data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update recovery metric" });
    }
  });

  // Recovery Plans Routes
  app.get("/api/users/:userId/plans", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const plans = await storage.getRecoveryPlansByUserId(userId);
    res.json(plans);
  });

  app.get("/api/users/:userId/plans/current", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const today = new Date();
    const currentPlan = await storage.getRecoveryPlanByDate(userId, today);

    if (!currentPlan) {
      return res.status(404).json({ message: "No current plan found" });
    }

    // Get tasks for this plan
    const tasks = await storage.getRecoveryTasksByPlanId(currentPlan.id);

    res.json({
      ...currentPlan,
      tasks
    });
  });

  app.post("/api/plans", async (req: Request, res: Response) => {
    try {
      const planData = insertRecoveryPlanSchema.parse(req.body);
      const newPlan = await storage.createRecoveryPlan(planData);
      res.status(201).json(newPlan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid plan data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create recovery plan" });
    }
  });

  app.patch("/api/plans/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    try {
      const updateData = insertRecoveryPlanSchema.partial().parse(req.body);
      const updatedPlan = await storage.updateRecoveryPlan(id, updateData);

      if (!updatedPlan) {
        return res.status(404).json({ message: "Plan not found" });
      }

      res.json(updatedPlan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid plan data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update recovery plan" });
    }
  });

  // Recovery Tasks Routes
  app.get("/api/plans/:planId/tasks", async (req: Request, res: Response) => {
    const planId = parseInt(req.params.planId);
    if (isNaN(planId)) {
      return res.status(400).json({ message: "Invalid plan ID format" });
    }

    const tasks = await storage.getRecoveryTasksByPlanId(planId);
    res.json(tasks);
  });

  app.post("/api/tasks", async (req: Request, res: Response) => {
    try {
      const taskData = insertRecoveryTaskSchema.parse(req.body);
      const newTask = await storage.createRecoveryTask(taskData);
      res.status(201).json(newTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create recovery task" });
    }
  });

  app.patch("/api/tasks/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    try {
      const updateData = insertRecoveryTaskSchema.partial().parse(req.body);
      const updatedTask = await storage.updateRecoveryTask(id, updateData);

      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }

      res.json(updatedTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update recovery task" });
    }
  });

  // Movement Assessments Routes
  app.get("/api/users/:userId/assessments", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const assessments = await storage.getMovementAssessmentsByUserId(userId);
    res.json(assessments);
  });

  app.get("/api/users/:userId/assessments/latest", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const assessment = await storage.getLatestMovementAssessment(userId);

    if (!assessment) {
      return res.status(404).json({ message: "No assessments found for user" });
    }

    res.json(assessment);
  });

  app.post("/api/assessments", async (req: Request, res: Response) => {
    try {
      const assessmentData = insertMovementAssessmentSchema.parse(req.body);
      const newAssessment = await storage.createMovementAssessment(assessmentData);
      res.status(201).json(newAssessment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid assessment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create movement assessment" });
    }
  });

  // Chart Data Routes
  app.get("/api/users/:userId/chart-data", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const chartData = await storage.getChartDataByUserId(userId);
    res.json(chartData);
  });

  app.post("/api/chart-data", async (req: Request, res: Response) => {
    try {
      const chartDataEntry = insertChartDataSchema.parse(req.body);
      const newChartData = await storage.createChartData(chartDataEntry);
      res.status(201).json(newChartData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid chart data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create chart data" });
    }
  });

  // AI Recommendation Route
  app.post("/api/ai/recommend", async (req: Request, res: Response) => {
    try {
      const { userData } = req.body;

      if (!userData) {
        return res.status(400).json({ message: "Missing required user data" });
      }

      const recommendation = await openaiService.generateRecoveryRecommendation(userData);

      res.json({ recommendation });
    } catch (error) {
      console.error("AI recommendation error:", error);
      res.status(500).json({ message: "Failed to generate AI recommendation" });
    }
  });

  // Movement Limitations Routes
  app.get("/api/users/:userId/limitations", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID format" });
      }

      const limitations = await storage.getMovementLimitationsByUserId(userId);
      res.json(limitations);
    } catch (error) {
      console.error("Error fetching movement limitations:", error);
      res.status(500).json({ message: "Failed to fetch movement limitations" });
    }
  });

  app.post("/api/limitations", async (req: Request, res: Response) => {
    try {
      const limitationData = insertMovementLimitationSchema.parse(req.body);
      const newLimitation = await storage.createMovementLimitation(limitationData);
      res.status(201).json(newLimitation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid limitation data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create movement limitation" });
    }
  });

  app.patch("/api/limitations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const limitation = await storage.getMovementLimitation(id);
      if (!limitation) {
        return res.status(404).json({ message: "Movement limitation not found" });
      }

      const updateData = insertMovementLimitationSchema.partial().parse(req.body);
      const updatedLimitation = await storage.updateMovementLimitation(id, updateData);

      res.json(updatedLimitation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid limitation data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update movement limitation" });
    }
  });

  // Exercise Library Routes
  app.get("/api/exercises", async (req: Request, res: Response) => {
    try {
      let exercises: ExerciseLibrary[] = [];

      if (req.query.category) {
        exercises = await storage.getExercisesByCategory(req.query.category as string);
      } else if (req.query.equipment) {
        exercises = await storage.getExercisesByEquipment(req.query.equipment as string);
      } else if (req.query.difficulty) {
        exercises = await storage.getExercisesByDifficulty(req.query.difficulty as string);
      } else {
        // Get all exercises
        const recoveryExercises = await storage.getExercisesByCategory("recovery");
        const mobilityExercises = await storage.getExercisesByCategory("mobility");
        const strengthExercises = await storage.getExercisesByCategory("strength");

        exercises = [...recoveryExercises, ...mobilityExercises, ...strengthExercises];
      }

      res.json(exercises);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      res.status(500).json({ message: "Failed to fetch exercises" });
    }
  });

  app.get("/api/exercises/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const exercise = await storage.getExercise(id);
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }

      res.json(exercise);
    } catch (error) {
      console.error("Error fetching exercise:", error);
      res.status(500).json({ message: "Failed to fetch exercise" });
    }
  });



  // Bulk import exercises from CSV
  app.post("/api/exercises/bulk-import", async (req: Request, res: Response) => {
    try {
      const csvData = req.body.csvContent;
      const records: InsertExerciseLibrary[] = [];

      // Parse CSV content
      const parser = csvParse({
        columns: true,
        skip_empty_lines: true,
        delimiter: ',',
      });

      // Process each row
      const processCSV = new Promise<InsertExerciseLibrary[]>((resolve, reject) => {
        Readable.from(csvData).pipe(parser)
          .on('data', (row: any) => {
            // Extract target areas from multiple columns
            const targetAreas: string[] = [];
            if (row.targetArea1) targetAreas.push(row.targetArea1);
            if (row['targetArea 2']) targetAreas.push(row['targetArea 2']);

            // Process instruction fields
            const instructions: string[] = [];
            if (row.instructions) instructions.push(row.instructions);
            if (row.Instructions) instructions.push(row.Instructions);

            // Create exercise object
            const exercise: InsertExerciseLibrary = {
              name: row.name,
              description: row.description,
              category: row.category.toLowerCase(),
              equipmentRequired: row.equipmentRequired ? [row.equipmentRequired] : [],
              targetMuscles: targetAreas,
              difficultyLevel: row.difficultyLevel,
              videoUrl: row.videoUrl || null,
              imageUrl: row.imageUrl || null,
              instructions: instructions,
              alternatives: []
            };
            records.push(exercise);
          })
          .on('end', () => resolve(records))
          .on('error', reject);
      });

      await processCSV;

      // Insert all exercises
      const insertedExercises: ExerciseLibrary[] = [];
      for (const exercise of records) {
        const newExercise = await storage.createExercise(exercise);
        insertedExercises.push(newExercise);
      }

      res.status(201).json({
        message: `Successfully imported ${insertedExercises.length} exercises`,
        exercises: insertedExercises
      });
    } catch (error) {
      console.error("Error importing exercises:", error);
      res.status(500).json({ message: "Failed to import exercises" });
    }
  });

  app.post("/api/exercises", async (req: Request, res: Response) => {
    try {
      const exerciseData = insertExerciseLibrarySchema.parse(req.body);
      const newExercise = await storage.createExercise(exerciseData);
      res.status(201).json(newExercise);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid exercise data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create exercise" });
    }
  });

  app.patch("/api/exercises/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const exercise = await storage.getExercise(id);
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }

      const updateData = insertExerciseLibrarySchema.partial().parse(req.body);
      const updatedExercise = await storage.updateExercise(id, updateData);

      res.json(updatedExercise);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid exercise data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update exercise" });
    }
  });

  // Recovery Protocol Routes
  app.get("/api/protocols", async (req: Request, res: Response) => {
    try {
      let protocols: RecoveryProtocol[] = [];

      if (req.query.targetArea) {
        protocols = await storage.getRecoveryProtocolsByTargetArea(req.query.targetArea as string);
      } else if (req.query.sport) {
        protocols = await storage.getRecoveryProtocolsBySport(req.query.sport as string);
      } else {
        // Get all template protocols
        const runningProtocols = await storage.getRecoveryProtocolsBySport("running");
        const generalProtocols = await storage.getRecoveryProtocolsBySport("general");

        protocols = [...runningProtocols, ...generalProtocols];
      }

      res.json(protocols);
    } catch (error) {
      console.error("Error fetching protocols:", error);
      res.status(500).json({ message: "Failed to fetch protocols" });
    }
  });

  app.get("/api/protocols/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const protocol = await storage.getRecoveryProtocol(id);
      if (!protocol) {
        return res.status(404).json({ message: "Protocol not found" });
      }

      res.json(protocol);
    } catch (error) {
      console.error("Error fetching protocol:", error);
      res.status(500).json({ message: "Failed to fetch protocol" });
    }
  });

  app.post("/api/protocols", async (req: Request, res: Response) => {
    try {
      const protocolData = insertRecoveryProtocolSchema.parse(req.body);
      const newProtocol = await storage.createRecoveryProtocol(protocolData);
      res.status(201).json(newProtocol);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid protocol data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create protocol" });
    }
  });

  app.patch("/api/protocols/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const protocol = await storage.getRecoveryProtocol(id);
      if (!protocol) {
        return res.status(404).json({ message: "Protocol not found" });
      }

      const updateData = insertRecoveryProtocolSchema.partial().parse(req.body);
      const updatedProtocol = await storage.updateRecoveryProtocol(id, updateData);

      res.json(updatedProtocol);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid protocol data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update protocol" });
    }
  });

  // AI-based recovery plan generation
  app.post("/api/ai/recovery-plan", async (req: Request, res: Response) => {
    try {
      console.log("Received recovery plan request:", req.body);

      // Check for userData object first for backward compatibility
      let userData = req.body.userData;

      // If userData is not provided, try to construct it from direct parameters
      if (!userData) {
        const { userId, preferences, equipment, timeAvailable, time, focusAreas, focuses, intensity, injuries, limitations, soreness } = req.body;

        userData = {
          userId: userId || 1,
          sportType: "General", // Default if not provided
          timeAvailable: timeAvailable || time || 15,
          focusAreas: focusAreas || focuses || ["full_body"],
          intensity: intensity || "moderate",
          equipment: equipment || ["none"],
          injuries: injuries || limitations || null,
          soreness: soreness || {}
        };
      }

      // Final validation
      if (!userData) {
        return res.status(400).json({ message: "Missing required user data" });
      }

      console.log("Processed user data for OpenAI:", userData);

      const planData = await openaiService.generateRecoveryPlan(userData);

      // Create a recovery plan
      const currentDate = new Date();
      const plan = await storage.createRecoveryPlan({
        userId: userData.userId,
        date: currentDate.toISOString(),
        aiRecommendation: planData.description,
        isCompleted: false
      });

      // Create tasks based on generated tasks
      const tasks = [];
      for (const task of planData.tasks) {
        const newTask = await storage.createRecoveryTask({
          planId: plan.id,
          title: task.title,
          description: task.description,
          category: task.category,
          duration: task.duration || 15,
          isCompleted: false,
          progress: 0,
          time: "Morning"
        });
        tasks.push(newTask);
      }

      // Format the response as expected by the client
      const session = {
        id: plan.id.toString(),
        title: planData.title || "Recovery Session",
        exercises: tasks.map(task => ({
          id: task.id.toString(),
          name: task.title,
          duration: (task.duration || 0) * 60, // convert minutes to seconds
          description: task.description.split('.')[0] || "Recovery exercise",
          instruction: task.description,
          equipment: userData.equipment
        })),
        totalTime: tasks.reduce((sum, task) => sum + (task.duration || 0), 0) * 60, // total time in seconds
        intensity: userData.intensity,
        focusAreas: userData.focusAreas,
        equipment: userData.equipment
      };

      res.json({
        title: planData.title,
        description: planData.description,
        tasks,
        plan,
        session
      });
    } catch (error) {
      console.error("Error generating AI recovery plan:", error);
      res.status(500).json({ message: "Failed to generate recovery plan" });
    }
  });

  // AI-based movement analysis
  app.post("/api/ai/analyze-movement", async (req: Request, res: Response) => {
    try {
      const { base64Image } = req.body;

      if (!base64Image) {
        return res.status(400).json({ message: "Missing required base64 image data" });
      }

      const analysisResult = await openaiService.analyzeMovement(base64Image);

      // Create a feedback array from the positive and improvement areas
      const feedback = [
        ...analysisResult.positive_feedback.map((message: string) => ({ type: "positive", message })),
        ...analysisResult.improvement_areas.map((message: string) => ({ type: "improvement", message }))
      ];

      // Create a movement assessment
      const assessment = await storage.createMovementAssessment({
        userId: req.body.userId,
        videoUrl: null,
        imageUrl: "data:image/jpeg;base64," + base64Image.substring(0, 100) + "...", // truncated for storage
        feedback,
        analysisResult: {
          overallScore: analysisResult.overall_score,
          shoulderMobility: analysisResult.joint_scores.shoulders,
          hipMobility: analysisResult.joint_scores.hips,
          kneeMobility: analysisResult.joint_scores.knees,
          ankleMobility: analysisResult.joint_scores.ankles,
          recommendations: analysisResult.recommendations
        }
      });

      res.json({
        assessment,
        analysis: analysisResult
      });
    } catch (error) {
      console.error("Error analyzing movement:", error);
      res.status(500).json({ message: "Failed to analyze movement" });
    }
  });

  // Session Feedback Routes
  app.get("/api/users/:userId/session-feedback", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID format" });
      }

      const feedback = await storage.getSessionFeedbackByUserId(userId);
      res.json(feedback);
    } catch (error) {
      console.error("Error fetching session feedback:", error);
      res.status(500).json({ message: "Failed to fetch session feedback" });
    }
  });

  app.get("/api/session-feedback/:sessionId", async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;

      const feedback = await storage.getSessionFeedbackBySessionId(sessionId);
      if (!feedback) {
        return res.status(404).json({ message: "Session feedback not found" });
      }

      // Get the associated exercise feedback
      const exerciseFeedback = await storage.getExerciseFeedbackBySessionFeedbackId(feedback.id);

      res.json({
        ...feedback,
        exerciseFeedback
      });
    } catch (error) {
      console.error("Error fetching session feedback:", error);
      res.status(500).json({ message: "Failed to fetch session feedback" });
    }
  });

  app.post("/api/session-feedback", async (req: Request, res: Response) => {
    try {
      const feedbackData = insertSessionFeedbackSchema.parse(req.body);
      const newFeedback = await storage.createSessionFeedback(feedbackData);
      res.status(201).json(newFeedback);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid feedback data", errors: error.errors });
      }
      console.error("Error creating session feedback:", error);
      res.status(500).json({ message: "Failed to create session feedback" });
    }
  });

  // Exercise Feedback Routes
  app.post("/api/exercise-feedback", async (req: Request, res: Response) => {
    try {
      const feedbackData = insertExerciseFeedbackSchema.parse(req.body);
      const newFeedback = await storage.createExerciseFeedback(feedbackData);
      res.status(201).json(newFeedback);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid exercise feedback data", errors: error.errors });
      }
      console.error("Error creating exercise feedback:", error);
      res.status(500).json({ message: "Failed to create exercise feedback" });
    }
  });

  // Batch create exercise feedback route
  app.post("/api/exercise-feedback/batch", async (req: Request, res: Response) => {
    try {
      const { sessionFeedbackId, exercises } = req.body;

      if (!sessionFeedbackId || !exercises || !Array.isArray(exercises)) {
        return res.status(400).json({ message: "Invalid data format" });
      }

      const feedbackPromises = exercises.map(exercise => {
        const feedbackData = insertExerciseFeedbackSchema.parse({
          sessionFeedbackId,
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          rating: exercise.rating,
          difficulty: exercise.difficulty,
          effectiveness: exercise.effectiveness,
          feedback: exercise.feedback || null
        });

        return storage.createExerciseFeedback(feedbackData);
      });

      const createdFeedback = await Promise.all(feedbackPromises);
      res.status(201).json(createdFeedback);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid exercise feedback data", errors: error.errors });
      }
      console.error("Error creating batch exercise feedback:", error);
      res.status(500).json({ message: "Failed to create exercise feedback batch" });
    }
  });

  // Set up session middleware
  const MemoryStoreInstance = MemoryStore(session);
  app.use(session({
    secret: process.env.SESSION_SECRET || 'recovery-expert-app-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
    store: new MemoryStoreInstance({
      checkPeriod: 86400000 // prune expired entries every 24h
    })
  }));

  // Register expert routes
  app.use('/api/expert', expertRouter);

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to calculate age from date of birth
function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDifference = today.getMonth() - dateOfBirth.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }

  return age;
}
