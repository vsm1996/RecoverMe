import { Request, Response, Router } from "express";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertExpertSchema, 
  insertBiomechanicalAssessmentSchema,
  insertExpertTemplateSchema,
  insertTemplateExerciseSchema,
  insertBiomechanicalExerciseAnalysisSchema,
  insertRecoveryFlowRuleSchema,
  insertUserAssessmentSchema,
} from "@shared/schema";

// Expert authentication middleware
export const requireExpertAuth = (req: Request, res: Response, next: Function) => {
  // Check if user exists and is an expert
  const expertId = req.session?.expertId;
  
  if (!expertId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  // Attach expert to request for later use
  storage.getExpert(expertId)
    .then(expert => {
      if (!expert) {
        return res.status(401).json({ message: "Invalid expert credentials" });
      }
      
      // Don't expose password
      delete (expert as any).password;
      (req as any).expert = expert;
      next();
    })
    .catch(err => {
      console.error("Error in expert auth middleware:", err);
      res.status(500).json({ message: "Internal server error" });
    });
};

// Create router for expert routes
export const expertRouter = Router();

// Expert Authentication
expertRouter.post("/auth/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }
    
    // Find expert by username
    const expert = await storage.getExpertByUsername(username);
    if (!expert) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // In production, use bcrypt to compare passwords
    // For simplicity (demo purposes only), we're comparing directly
    if (expert.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Set session
    if (req.session) {
      req.session.expertId = expert.id;
    }
    
    // Don't return password
    delete (expert as any).password;
    
    res.json(expert);
  } catch (error) {
    console.error("Error in expert login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

expertRouter.post("/auth/logout", (req: Request, res: Response) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  } else {
    res.json({ message: "Logged out successfully" });
  }
});

// Expert Profile
expertRouter.get("/profile", requireExpertAuth, async (req: Request, res: Response) => {
  try {
    const expert = (req as any).expert;
    res.json(expert);
  } catch (error) {
    console.error("Error fetching expert profile:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

expertRouter.patch("/profile", requireExpertAuth, async (req: Request, res: Response) => {
  try {
    const expertId = (req as any).expert.id;
    const updates = req.body;
    
    // Don't allow updating certain fields
    delete updates.id;
    delete updates.createdAt;
    delete updates.isVerified; // Only admins can verify experts
    
    // Ensure password is properly handled
    if (updates.password) {
      // In production, hash password here
    }
    
    const updatedExpert = await storage.updateExpert(expertId, updates);
    
    // Don't expose password
    delete (updatedExpert as any).password;
    
    res.json(updatedExpert);
  } catch (error) {
    console.error("Error updating expert profile:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// Biomechanical Assessments
expertRouter.get("/assessments", requireExpertAuth, async (req: Request, res: Response) => {
  try {
    const expertId = (req as any).expert.id;
    const assessments = await storage.getBiomechanicalAssessmentsByExpertId(expertId);
    res.json(assessments);
  } catch (error) {
    console.error("Error fetching assessments:", error);
    res.status(500).json({ message: "Failed to fetch assessments" });
  }
});

expertRouter.get("/assessments/:id", requireExpertAuth, async (req: Request, res: Response) => {
  try {
    const assessmentId = parseInt(req.params.id);
    if (isNaN(assessmentId)) {
      return res.status(400).json({ message: "Invalid assessment ID" });
    }
    
    const assessment = await storage.getBiomechanicalAssessment(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }
    
    // Verify ownership
    if (assessment.expertId !== (req as any).expert.id) {
      return res.status(403).json({ message: "Not authorized to access this assessment" });
    }
    
    res.json(assessment);
  } catch (error) {
    console.error("Error fetching assessment:", error);
    res.status(500).json({ message: "Failed to fetch assessment" });
  }
});

expertRouter.post("/assessments", requireExpertAuth, async (req: Request, res: Response) => {
  try {
    const expertId = (req as any).expert.id;
    const assessmentData = {
      ...req.body,
      expertId
    };
    
    // Validate assessment data
    const validatedData = insertBiomechanicalAssessmentSchema.parse(assessmentData);
    
    const newAssessment = await storage.createBiomechanicalAssessment(validatedData);
    res.status(201).json(newAssessment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid assessment data", errors: error.errors });
    }
    console.error("Error creating assessment:", error);
    res.status(500).json({ message: "Failed to create assessment" });
  }
});

expertRouter.patch("/assessments/:id", requireExpertAuth, async (req: Request, res: Response) => {
  try {
    const assessmentId = parseInt(req.params.id);
    if (isNaN(assessmentId)) {
      return res.status(400).json({ message: "Invalid assessment ID" });
    }
    
    // Verify ownership
    const assessment = await storage.getBiomechanicalAssessment(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }
    
    if (assessment.expertId !== (req as any).expert.id) {
      return res.status(403).json({ message: "Not authorized to update this assessment" });
    }
    
    const updates = req.body;
    delete updates.id;
    delete updates.expertId; // Don't allow changing ownership
    
    const updatedAssessment = await storage.updateBiomechanicalAssessment(assessmentId, updates);
    res.json(updatedAssessment);
  } catch (error) {
    console.error("Error updating assessment:", error);
    res.status(500).json({ message: "Failed to update assessment" });
  }
});

// Expert Templates
expertRouter.get("/templates", requireExpertAuth, async (req: Request, res: Response) => {
  try {
    const expertId = (req as any).expert.id;
    const templates = await storage.getExpertTemplatesByExpertId(expertId);
    res.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({ message: "Failed to fetch templates" });
  }
});

expertRouter.get("/templates/:id", requireExpertAuth, async (req: Request, res: Response) => {
  try {
    const templateId = parseInt(req.params.id);
    if (isNaN(templateId)) {
      return res.status(400).json({ message: "Invalid template ID" });
    }
    
    const template = await storage.getExpertTemplate(templateId);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    
    // Get template exercises
    const exercises = await storage.getTemplateExercisesByTemplateId(templateId);
    
    res.json({
      ...template,
      exercises
    });
  } catch (error) {
    console.error("Error fetching template:", error);
    res.status(500).json({ message: "Failed to fetch template" });
  }
});

expertRouter.post("/templates", requireExpertAuth, async (req: Request, res: Response) => {
  try {
    const expertId = (req as any).expert.id;
    const { template, exercises } = req.body;
    
    if (!template || !exercises || !Array.isArray(exercises)) {
      return res.status(400).json({ message: "Invalid template data format" });
    }
    
    // Validate template
    const templateData = insertExpertTemplateSchema.parse({
      ...template,
      expertId
    });
    
    // Create template first
    const newTemplate = await storage.createExpertTemplate(templateData);
    
    // Then create all associated exercises
    const exercisePromises = exercises.map((exercise: any) => {
      const exerciseData = insertTemplateExerciseSchema.parse({
        ...exercise,
        templateId: newTemplate.id
      });
      
      return storage.createTemplateExercise(exerciseData);
    });
    
    const createdExercises = await Promise.all(exercisePromises);
    
    res.status(201).json({
      ...newTemplate,
      exercises: createdExercises
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid template data", errors: error.errors });
    }
    console.error("Error creating template:", error);
    res.status(500).json({ message: "Failed to create template" });
  }
});

expertRouter.patch("/templates/:id", requireExpertAuth, async (req: Request, res: Response) => {
  try {
    const templateId = parseInt(req.params.id);
    if (isNaN(templateId)) {
      return res.status(400).json({ message: "Invalid template ID" });
    }
    
    // Verify ownership
    const template = await storage.getExpertTemplate(templateId);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    
    if (template.expertId !== (req as any).expert.id) {
      return res.status(403).json({ message: "Not authorized to update this template" });
    }
    
    const { templateUpdates, exerciseUpdates, newExercises, deleteExerciseIds } = req.body;
    
    // Update template
    if (templateUpdates) {
      delete templateUpdates.id;
      delete templateUpdates.expertId;
      
      await storage.updateExpertTemplate(templateId, templateUpdates);
    }
    
    // Update existing exercises
    if (exerciseUpdates && Array.isArray(exerciseUpdates)) {
      for (const exercise of exerciseUpdates) {
        if (!exercise.id) continue;
        
        const exerciseId = exercise.id;
        delete exercise.id;
        delete exercise.templateId;
        
        await storage.updateTemplateExercise(exerciseId, exercise);
      }
    }
    
    // Add new exercises
    if (newExercises && Array.isArray(newExercises)) {
      for (const exercise of newExercises) {
        const exerciseData = insertTemplateExerciseSchema.parse({
          ...exercise,
          templateId
        });
        
        await storage.createTemplateExercise(exerciseData);
      }
    }
    
    // Delete exercises
    if (deleteExerciseIds && Array.isArray(deleteExerciseIds)) {
      for (const exerciseId of deleteExerciseIds) {
        await storage.deleteTemplateExercise(exerciseId);
      }
    }
    
    // Get updated template with exercises
    const updatedTemplate = await storage.getExpertTemplate(templateId);
    const updatedExercises = await storage.getTemplateExercisesByTemplateId(templateId);
    
    res.json({
      ...updatedTemplate,
      exercises: updatedExercises
    });
  } catch (error) {
    console.error("Error updating template:", error);
    res.status(500).json({ message: "Failed to update template" });
  }
});

// Biomechanical Exercise Analysis
expertRouter.get("/exercise-analyses", requireExpertAuth, async (req: Request, res: Response) => {
  try {
    const expertId = (req as any).expert.id;
    const analyses = await storage.getBiomechanicalExerciseAnalysesByExpertId(expertId);
    res.json(analyses);
  } catch (error) {
    console.error("Error fetching exercise analyses:", error);
    res.status(500).json({ message: "Failed to fetch exercise analyses" });
  }
});

expertRouter.get("/exercise-analyses/:id", requireExpertAuth, async (req: Request, res: Response) => {
  try {
    const analysisId = parseInt(req.params.id);
    if (isNaN(analysisId)) {
      return res.status(400).json({ message: "Invalid analysis ID" });
    }
    
    const analysis = await storage.getBiomechanicalExerciseAnalysis(analysisId);
    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found" });
    }
    
    res.json(analysis);
  } catch (error) {
    console.error("Error fetching exercise analysis:", error);
    res.status(500).json({ message: "Failed to fetch exercise analysis" });
  }
});

expertRouter.post("/exercise-analyses", requireExpertAuth, async (req: Request, res: Response) => {
  try {
    const expertId = (req as any).expert.id;
    const analysisData = {
      ...req.body,
      expertId
    };
    
    // Validate analysis data
    const validatedData = insertBiomechanicalExerciseAnalysisSchema.parse(analysisData);
    
    const newAnalysis = await storage.createBiomechanicalExerciseAnalysis(validatedData);
    res.status(201).json(newAnalysis);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid analysis data", errors: error.errors });
    }
    console.error("Error creating exercise analysis:", error);
    res.status(500).json({ message: "Failed to create exercise analysis" });
  }
});

expertRouter.patch("/exercise-analyses/:id", requireExpertAuth, async (req: Request, res: Response) => {
  try {
    const analysisId = parseInt(req.params.id);
    if (isNaN(analysisId)) {
      return res.status(400).json({ message: "Invalid analysis ID" });
    }
    
    // Verify ownership
    const analysis = await storage.getBiomechanicalExerciseAnalysis(analysisId);
    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found" });
    }
    
    if (analysis.expertId !== (req as any).expert.id) {
      return res.status(403).json({ message: "Not authorized to update this analysis" });
    }
    
    const updates = req.body;
    delete updates.id;
    delete updates.expertId;
    delete updates.exerciseId; // Don't allow changing exercise relationship
    
    const updatedAnalysis = await storage.updateBiomechanicalExerciseAnalysis(analysisId, updates);
    res.json(updatedAnalysis);
  } catch (error) {
    console.error("Error updating exercise analysis:", error);
    res.status(500).json({ message: "Failed to update exercise analysis" });
  }
});

// Recovery Flow Rules
expertRouter.get("/flow-rules", requireExpertAuth, async (req: Request, res: Response) => {
  try {
    const expertId = (req as any).expert.id;
    const rules = await storage.getRecoveryFlowRulesByExpertId(expertId);
    res.json(rules);
  } catch (error) {
    console.error("Error fetching flow rules:", error);
    res.status(500).json({ message: "Failed to fetch flow rules" });
  }
});

expertRouter.get("/flow-rules/:id", requireExpertAuth, async (req: Request, res: Response) => {
  try {
    const ruleId = parseInt(req.params.id);
    if (isNaN(ruleId)) {
      return res.status(400).json({ message: "Invalid rule ID" });
    }
    
    const rule = await storage.getRecoveryFlowRule(ruleId);
    if (!rule) {
      return res.status(404).json({ message: "Rule not found" });
    }
    
    res.json(rule);
  } catch (error) {
    console.error("Error fetching flow rule:", error);
    res.status(500).json({ message: "Failed to fetch flow rule" });
  }
});

expertRouter.post("/flow-rules", requireExpertAuth, async (req: Request, res: Response) => {
  try {
    const expertId = (req as any).expert.id;
    const ruleData = {
      ...req.body,
      expertId
    };
    
    // Validate rule data
    const validatedData = insertRecoveryFlowRuleSchema.parse(ruleData);
    
    const newRule = await storage.createRecoveryFlowRule(validatedData);
    res.status(201).json(newRule);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid rule data", errors: error.errors });
    }
    console.error("Error creating flow rule:", error);
    res.status(500).json({ message: "Failed to create flow rule" });
  }
});

expertRouter.patch("/flow-rules/:id", requireExpertAuth, async (req: Request, res: Response) => {
  try {
    const ruleId = parseInt(req.params.id);
    if (isNaN(ruleId)) {
      return res.status(400).json({ message: "Invalid rule ID" });
    }
    
    // Verify ownership
    const rule = await storage.getRecoveryFlowRule(ruleId);
    if (!rule) {
      return res.status(404).json({ message: "Rule not found" });
    }
    
    if (rule.expertId !== (req as any).expert.id) {
      return res.status(403).json({ message: "Not authorized to update this rule" });
    }
    
    const updates = req.body;
    delete updates.id;
    delete updates.expertId;
    
    const updatedRule = await storage.updateRecoveryFlowRule(ruleId, updates);
    res.json(updatedRule);
  } catch (error) {
    console.error("Error updating flow rule:", error);
    res.status(500).json({ message: "Failed to update flow rule" });
  }
});

// User Assessments
expertRouter.get("/user-assessments", requireExpertAuth, async (req: Request, res: Response) => {
  try {
    const expertId = (req as any).expert.id;
    const assessments = await storage.getUserAssessmentsByExpertId(expertId);
    res.json(assessments);
  } catch (error) {
    console.error("Error fetching user assessments:", error);
    res.status(500).json({ message: "Failed to fetch user assessments" });
  }
});

expertRouter.get("/user-assessments/:id", requireExpertAuth, async (req: Request, res: Response) => {
  try {
    const assessmentId = parseInt(req.params.id);
    if (isNaN(assessmentId)) {
      return res.status(400).json({ message: "Invalid assessment ID" });
    }
    
    const assessment = await storage.getUserAssessment(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }
    
    // Verify ownership
    if (assessment.expertId !== (req as any).expert.id) {
      return res.status(403).json({ message: "Not authorized to access this assessment" });
    }
    
    // Get user details
    const user = await storage.getUser(assessment.userId);
    
    res.json({
      ...assessment,
      user: user ? {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        sportType: user.sportType,
        height: user.height,
        weight: user.weight,
        dateOfBirth: user.dateOfBirth,
        equipmentAccess: user.equipmentAccess,
        experienceLevel: user.experienceLevel,
        recoveryGoals: user.recoveryGoals,
        injuryHistory: user.injuryHistory
      } : null
    });
  } catch (error) {
    console.error("Error fetching user assessment:", error);
    res.status(500).json({ message: "Failed to fetch user assessment" });
  }
});

expertRouter.post("/user-assessments", requireExpertAuth, async (req: Request, res: Response) => {
  try {
    const expertId = (req as any).expert.id;
    const assessmentData = {
      ...req.body,
      expertId
    };
    
    // Validate assessment data
    const validatedData = insertUserAssessmentSchema.parse(assessmentData);
    
    const newAssessment = await storage.createUserAssessment(validatedData);
    res.status(201).json(newAssessment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid assessment data", errors: error.errors });
    }
    console.error("Error creating user assessment:", error);
    res.status(500).json({ message: "Failed to create user assessment" });
  }
});

expertRouter.patch("/user-assessments/:id", requireExpertAuth, async (req: Request, res: Response) => {
  try {
    const assessmentId = parseInt(req.params.id);
    if (isNaN(assessmentId)) {
      return res.status(400).json({ message: "Invalid assessment ID" });
    }
    
    // Verify ownership
    const assessment = await storage.getUserAssessment(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }
    
    if (assessment.expertId !== (req as any).expert.id) {
      return res.status(403).json({ message: "Not authorized to update this assessment" });
    }
    
    const updates = req.body;
    delete updates.id;
    delete updates.expertId;
    delete updates.userId;
    delete updates.assessmentId;
    delete updates.date;
    
    const updatedAssessment = await storage.updateUserAssessment(assessmentId, updates);
    res.json(updatedAssessment);
  } catch (error) {
    console.error("Error updating user assessment:", error);
    res.status(500).json({ message: "Failed to update user assessment" });
  }
});

// Used for exercise library querying with biomechanical filtering
// FOR TESTING ONLY: Temporary endpoint that doesn't require authentication
expertRouter.get("/exercise-search-public", async (req: Request, res: Response) => {
  try {
    const { 
      targetMuscles, 
      category, 
      difficultyLevel, 
      equipment,
      hasAnalysis,
      effectivenessMinScore,
      biomechanicalConcerns,
      limit = 20,
      offset = 0
    } = req.query;
    
    // Prepare filter options
    const filterOptions: {
      targetMuscles?: string[];
      category?: string;
      difficultyLevel?: string;
      equipment?: string[];
      hasAnalysis?: boolean;
      effectivenessMinScore?: number;
      biomechanicalConcerns?: string[];
    } = {};
    
    if (targetMuscles) {
      filterOptions.targetMuscles = Array.isArray(targetMuscles) 
        ? targetMuscles as string[]
        : [targetMuscles as string];
    }
    
    if (category) {
      filterOptions.category = category as string;
    }
    
    if (difficultyLevel) {
      filterOptions.difficultyLevel = difficultyLevel as string;
    }
    
    if (equipment) {
      filterOptions.equipment = Array.isArray(equipment) 
        ? equipment as string[]
        : [equipment as string];
    }
    
    // Biomechanical filter options
    if (hasAnalysis === 'true') {
      filterOptions.hasAnalysis = true;
    }
    
    if (effectivenessMinScore) {
      filterOptions.effectivenessMinScore = parseInt(effectivenessMinScore as string);
    }
    
    if (biomechanicalConcerns) {
      filterOptions.biomechanicalConcerns = Array.isArray(biomechanicalConcerns)
        ? biomechanicalConcerns as string[]
        : [biomechanicalConcerns as string];
    }
    
    // Parse limit/offset
    const parsedLimit = parseInt(limit as string) || 20;
    const parsedOffset = parseInt(offset as string) || 0;
    
    // Get exercises with filter
    const exercises = await storage.searchExercisesWithBiomechanicalData(
      filterOptions,
      parsedLimit,
      parsedOffset
    );
    
    res.json(exercises);
  } catch (error) {
    console.error("Error searching exercises:", error);
    res.status(500).json({ message: "Failed to search exercises" });
  }
});

// Apply a template to create a recovery plan
expertRouter.post("/apply-template/:templateId/user/:userId", requireExpertAuth, async (req: Request, res: Response) => {
  try {
    const templateId = parseInt(req.params.templateId);
    const userId = parseInt(req.params.userId);
    
    if (isNaN(templateId) || isNaN(userId)) {
      return res.status(400).json({ message: "Invalid template ID or user ID" });
    }
    
    // Get template with exercises
    const template = await storage.getExpertTemplate(templateId);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    
    // Verify expert owns this template
    if (template.expertId !== (req as any).expert.id) {
      return res.status(403).json({ message: "Not authorized to use this template" });
    }
    
    // Get user
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Get template exercises
    const templateExercises = await storage.getTemplateExercisesByTemplateId(templateId);
    
    // Create recovery plan
    const plan = await storage.createRecoveryPlan({
      userId,
      date: new Date().toISOString(),
      aiRecommendation: `Expert recovery plan: ${template.name} - ${template.description}`,
      isCompleted: false
    });
    
    // Create tasks from template exercises
    const tasks = [];
    for (const exercise of templateExercises) {
      // Get the exercise details from library
      const exerciseDetails = await storage.getExercise(exercise.exerciseId);
      
      const task = await storage.createRecoveryTask({
        planId: plan.id,
        title: exerciseDetails?.name || `Exercise ${exercise.order}`,
        description: exerciseDetails?.description || "",
        category: exerciseDetails?.category || "expert",
        duration: Math.ceil(exercise.duration / 60), // Convert seconds to minutes
        isCompleted: false,
        progress: 0,
        time: "As scheduled"
      });
      
      tasks.push(task);
    }
    
    // Format the response as expected by the client (similar to AI plan generation)
    const session = {
      id: plan.id.toString(),
      title: template.name,
      exercises: tasks.map(task => ({
        id: task.id.toString(),
        name: task.title,
        duration: (task.duration || 0) * 60, // convert minutes to seconds
        description: task.description.split('.')[0] || "Recovery exercise",
        instruction: task.description,
        equipment: template.equipmentRequired
      })),
      totalTime: tasks.reduce((sum, task) => sum + (task.duration || 0), 0) * 60, // total time in seconds
      intensity: template.difficultyLevel,
      focusAreas: template.targetAreas,
      equipment: template.equipmentRequired
    };
    
    res.json({
      title: template.name,
      description: template.description,
      tasks,
      plan,
      session
    });
  } catch (error) {
    console.error("Error applying template:", error);
    res.status(500).json({ message: "Failed to apply template" });
  }
});

// Expert Dashboard - combined stats
expertRouter.get("/dashboard", requireExpertAuth, async (req: Request, res: Response) => {
  try {
    const expertId = (req as any).expert.id;
    
    // Get counts of various items
    const templatesCount = await storage.getExpertTemplatesCount(expertId);
    const assessmentsCount = await storage.getBiomechanicalAssessmentsCount(expertId);
    const exerciseAnalysesCount = await storage.getBiomechanicalExerciseAnalysesCount(expertId);
    const rulesCount = await storage.getRecoveryFlowRulesCount(expertId);
    const userAssessmentsCount = await storage.getUserAssessmentsCount(expertId);
    
    // Get recent templates
    const recentTemplates = await storage.getRecentExpertTemplates(expertId, 5);
    
    // Get recent user assessments
    const recentUserAssessments = await storage.getRecentUserAssessments(expertId, 5);
    
    // Get effectiveness statistics
    const effectivenessStats = await storage.getExerciseEffectivenessStats(expertId);
    
    res.json({
      counts: {
        templates: templatesCount,
        assessments: assessmentsCount,
        exerciseAnalyses: exerciseAnalysesCount,
        rules: rulesCount,
        userAssessments: userAssessmentsCount
      },
      recentTemplates,
      recentUserAssessments,
      effectivenessStats
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
});