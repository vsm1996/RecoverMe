import { 
  users, User, InsertUser, 
  recoveryMetrics, RecoveryMetric, InsertRecoveryMetric,
  recoveryPlans, RecoveryPlan, InsertRecoveryPlan,
  recoveryTasks, RecoveryTask, InsertRecoveryTask,
  movementAssessments, MovementAssessment, InsertMovementAssessment,
  chartData, ChartData, InsertChartData,
  movementLimitations, MovementLimitation, InsertMovementLimitation,
  exerciseLibrary, ExerciseLibrary, InsertExerciseLibrary,
  recoveryProtocols, RecoveryProtocol, InsertRecoveryProtocol,
  sessionFeedback, SessionFeedback, InsertSessionFeedback,
  exerciseFeedback, ExerciseFeedback, InsertExerciseFeedback,
  // Expert-related imports
  experts, Expert, InsertExpert,
  biomechanicalAssessments, BiomechanicalAssessment, InsertBiomechanicalAssessment,
  expertTemplates, ExpertTemplate, InsertExpertTemplate,
  templateExercises, TemplateExercise, InsertTemplateExercise,
  biomechanicalExerciseAnalysis, BiomechanicalExerciseAnalysis, InsertBiomechanicalExerciseAnalysis,
  recoveryFlowRules, RecoveryFlowRule, InsertRecoveryFlowRule,
  userAssessments, UserAssessment, InsertUserAssessment
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [createdUser] = await db.insert(users).values(user).returning();
    return createdUser;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(user)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  // Recovery metrics operations
  async getRecoveryMetric(id: number): Promise<RecoveryMetric | undefined> {
    const [metric] = await db
      .select()
      .from(recoveryMetrics)
      .where(eq(recoveryMetrics.id, id));
    return metric || undefined;
  }

  async getRecoveryMetricsByUserId(userId: number): Promise<RecoveryMetric[]> {
    return db
      .select()
      .from(recoveryMetrics)
      .where(eq(recoveryMetrics.userId, userId));
  }

  async getRecoveryMetricsByDate(userId: number, date: Date): Promise<RecoveryMetric | undefined> {
    const dateStr = date.toISOString().split('T')[0]; // Convert to YYYY-MM-DD
    const [metric] = await db
      .select()
      .from(recoveryMetrics)
      .where(
        and(
          eq(recoveryMetrics.userId, userId),
          eq(recoveryMetrics.date, dateStr)
        )
      );
    return metric || undefined;
  }

  async createRecoveryMetric(metric: InsertRecoveryMetric): Promise<RecoveryMetric> {
    const [createdMetric] = await db
      .insert(recoveryMetrics)
      .values(metric)
      .returning();
    return createdMetric;
  }

  async updateRecoveryMetric(id: number, metric: Partial<InsertRecoveryMetric>): Promise<RecoveryMetric | undefined> {
    const [updatedMetric] = await db
      .update(recoveryMetrics)
      .set(metric)
      .where(eq(recoveryMetrics.id, id))
      .returning();
    return updatedMetric || undefined;
  }

  // Recovery plans operations
  async getRecoveryPlan(id: number): Promise<RecoveryPlan | undefined> {
    const [plan] = await db
      .select()
      .from(recoveryPlans)
      .where(eq(recoveryPlans.id, id));
    return plan || undefined;
  }

  async getRecoveryPlansByUserId(userId: number): Promise<RecoveryPlan[]> {
    return db
      .select()
      .from(recoveryPlans)
      .where(eq(recoveryPlans.userId, userId));
  }

  async getRecoveryPlanByDate(userId: number, date: Date): Promise<RecoveryPlan | undefined> {
    const dateStr = date.toISOString().split('T')[0]; // Convert to YYYY-MM-DD
    const [plan] = await db
      .select()
      .from(recoveryPlans)
      .where(
        and(
          eq(recoveryPlans.userId, userId),
          eq(recoveryPlans.date, dateStr)
        )
      );
    return plan || undefined;
  }

  async createRecoveryPlan(plan: InsertRecoveryPlan): Promise<RecoveryPlan> {
    const [createdPlan] = await db
      .insert(recoveryPlans)
      .values(plan)
      .returning();
    return createdPlan;
  }

  async updateRecoveryPlan(id: number, plan: Partial<InsertRecoveryPlan>): Promise<RecoveryPlan | undefined> {
    const [updatedPlan] = await db
      .update(recoveryPlans)
      .set(plan)
      .where(eq(recoveryPlans.id, id))
      .returning();
    return updatedPlan || undefined;
  }

  // Recovery tasks operations
  async getRecoveryTask(id: number): Promise<RecoveryTask | undefined> {
    const [task] = await db
      .select()
      .from(recoveryTasks)
      .where(eq(recoveryTasks.id, id));
    return task || undefined;
  }

  async getRecoveryTasksByPlanId(planId: number): Promise<RecoveryTask[]> {
    return db
      .select()
      .from(recoveryTasks)
      .where(eq(recoveryTasks.planId, planId));
  }

  async createRecoveryTask(task: InsertRecoveryTask): Promise<RecoveryTask> {
    const [createdTask] = await db
      .insert(recoveryTasks)
      .values(task)
      .returning();
    return createdTask;
  }

  async updateRecoveryTask(id: number, task: Partial<InsertRecoveryTask>): Promise<RecoveryTask | undefined> {
    const [updatedTask] = await db
      .update(recoveryTasks)
      .set(task)
      .where(eq(recoveryTasks.id, id))
      .returning();
    return updatedTask || undefined;
  }

  // Movement assessment operations
  async getMovementAssessment(id: number): Promise<MovementAssessment | undefined> {
    const [assessment] = await db
      .select()
      .from(movementAssessments)
      .where(eq(movementAssessments.id, id));
    return assessment || undefined;
  }

  async getMovementAssessmentsByUserId(userId: number): Promise<MovementAssessment[]> {
    return db
      .select()
      .from(movementAssessments)
      .where(eq(movementAssessments.userId, userId));
  }

  async getLatestMovementAssessment(userId: number): Promise<MovementAssessment | undefined> {
    const [assessment] = await db
      .select()
      .from(movementAssessments)
      .where(eq(movementAssessments.userId, userId))
      .orderBy(desc(movementAssessments.date))
      .limit(1);
    return assessment || undefined;
  }

  async createMovementAssessment(assessment: InsertMovementAssessment): Promise<MovementAssessment> {
    const [createdAssessment] = await db
      .insert(movementAssessments)
      .values(assessment)
      .returning();
    return createdAssessment;
  }

  // Chart data operations
  async getChartData(id: number): Promise<ChartData | undefined> {
    const [data] = await db
      .select()
      .from(chartData)
      .where(eq(chartData.id, id));
    return data || undefined;
  }

  async getChartDataByUserId(userId: number): Promise<ChartData[]> {
    return db
      .select()
      .from(chartData)
      .where(eq(chartData.userId, userId));
  }

  async getChartDataByDateRange(userId: number, startDate: Date, endDate: Date): Promise<ChartData[]> {
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    return db
      .select()
      .from(chartData)
      .where(
        and(
          eq(chartData.userId, userId),
          gte(chartData.date, startDateStr),
          lte(chartData.date, endDateStr)
        )
      );
  }

  async createChartData(data: InsertChartData): Promise<ChartData> {
    const [createdData] = await db
      .insert(chartData)
      .values(data)
      .returning();
    return createdData;
  }

  // Movement limitations operations
  async getMovementLimitation(id: number): Promise<MovementLimitation | undefined> {
    const [limitation] = await db
      .select()
      .from(movementLimitations)
      .where(eq(movementLimitations.id, id));
    return limitation || undefined;
  }

  async getMovementLimitationsByUserId(userId: number): Promise<MovementLimitation[]> {
    return db
      .select()
      .from(movementLimitations)
      .where(eq(movementLimitations.userId, userId));
  }

  async createMovementLimitation(limitation: InsertMovementLimitation): Promise<MovementLimitation> {
    const [createdLimitation] = await db
      .insert(movementLimitations)
      .values(limitation)
      .returning();
    return createdLimitation;
  }

  async updateMovementLimitation(id: number, limitation: Partial<InsertMovementLimitation>): Promise<MovementLimitation | undefined> {
    const [updatedLimitation] = await db
      .update(movementLimitations)
      .set(limitation)
      .where(eq(movementLimitations.id, id))
      .returning();
    return updatedLimitation || undefined;
  }

  // Exercise library operations
  async getExercise(id: number): Promise<ExerciseLibrary | undefined> {
    const [exercise] = await db
      .select()
      .from(exerciseLibrary)
      .where(eq(exerciseLibrary.id, id));
    return exercise || undefined;
  }

  async getExercisesByCategory(category: string): Promise<ExerciseLibrary[]> {
    return db
      .select()
      .from(exerciseLibrary)
      .where(eq(exerciseLibrary.category, category));
  }

  async getExercisesByEquipment(equipment: string): Promise<ExerciseLibrary[]> {
    // This is more complex as we need to query an array column
    // We'd need to use SQL like: WHERE 'equipment' = ANY(equipment_required)
    // For simplicity, we'll get all exercises and filter in JS
    const exercises = await db.select().from(exerciseLibrary);
    return exercises.filter(exercise => 
      exercise.equipmentRequired && 
      Array.isArray(exercise.equipmentRequired) &&
      exercise.equipmentRequired.includes(equipment)
    );
  }

  async getExercisesByDifficulty(difficultyLevel: string): Promise<ExerciseLibrary[]> {
    return db
      .select()
      .from(exerciseLibrary)
      .where(eq(exerciseLibrary.difficultyLevel, difficultyLevel));
  }

  async createExercise(exercise: InsertExerciseLibrary): Promise<ExerciseLibrary> {
    const [createdExercise] = await db
      .insert(exerciseLibrary)
      .values(exercise)
      .returning();
    return createdExercise;
  }

  async updateExercise(id: number, exercise: Partial<InsertExerciseLibrary>): Promise<ExerciseLibrary | undefined> {
    const [updatedExercise] = await db
      .update(exerciseLibrary)
      .set(exercise)
      .where(eq(exerciseLibrary.id, id))
      .returning();
    return updatedExercise || undefined;
  }

  // Recovery protocol operations
  async getRecoveryProtocol(id: number): Promise<RecoveryProtocol | undefined> {
    const [protocol] = await db
      .select()
      .from(recoveryProtocols)
      .where(eq(recoveryProtocols.id, id));
    return protocol || undefined;
  }

  async getRecoveryProtocolsByTargetArea(targetArea: string): Promise<RecoveryProtocol[]> {
    // This is more complex as we need to query an array column
    // Similar to getExercisesByEquipment, we'll filter in JS
    const protocols = await db.select().from(recoveryProtocols);
    return protocols.filter(protocol => 
      protocol.targetAreas && 
      Array.isArray(protocol.targetAreas) &&
      protocol.targetAreas.includes(targetArea)
    );
  }

  async getRecoveryProtocolsBySport(sport: string): Promise<RecoveryProtocol[]> {
    // Similar pattern for array filtering
    const protocols = await db.select().from(recoveryProtocols);
    return protocols.filter(protocol => 
      protocol.sportSpecific && 
      Array.isArray(protocol.sportSpecific) &&
      protocol.sportSpecific.includes(sport)
    );
  }

  async createRecoveryProtocol(protocol: InsertRecoveryProtocol): Promise<RecoveryProtocol> {
    const [createdProtocol] = await db
      .insert(recoveryProtocols)
      .values(protocol)
      .returning();
    return createdProtocol;
  }

  async updateRecoveryProtocol(id: number, protocol: Partial<InsertRecoveryProtocol>): Promise<RecoveryProtocol | undefined> {
    const [updatedProtocol] = await db
      .update(recoveryProtocols)
      .set(protocol)
      .where(eq(recoveryProtocols.id, id))
      .returning();
    return updatedProtocol || undefined;
  }

  // Session feedback operations
  async getSessionFeedback(id: number): Promise<SessionFeedback | undefined> {
    const [feedback] = await db
      .select()
      .from(sessionFeedback)
      .where(eq(sessionFeedback.id, id));
    return feedback || undefined;
  }

  async getSessionFeedbackBySessionId(sessionId: string): Promise<SessionFeedback | undefined> {
    const [feedback] = await db
      .select()
      .from(sessionFeedback)
      .where(eq(sessionFeedback.sessionId, sessionId));
    return feedback || undefined;
  }

  async getSessionFeedbackByUserId(userId: number): Promise<SessionFeedback[]> {
    return db
      .select()
      .from(sessionFeedback)
      .where(eq(sessionFeedback.userId, userId))
      .orderBy(desc(sessionFeedback.completedAt));
  }

  async createSessionFeedback(feedback: InsertSessionFeedback): Promise<SessionFeedback> {
    const [createdFeedback] = await db
      .insert(sessionFeedback)
      .values({
        ...feedback,
        completedAt: new Date()
      })
      .returning();
    return createdFeedback;
  }

  // Exercise feedback operations
  async getExerciseFeedback(id: number): Promise<ExerciseFeedback | undefined> {
    const [feedback] = await db
      .select()
      .from(exerciseFeedback)
      .where(eq(exerciseFeedback.id, id));
    return feedback || undefined;
  }

  async getExerciseFeedbackBySessionFeedbackId(sessionFeedbackId: number): Promise<ExerciseFeedback[]> {
    return db
      .select()
      .from(exerciseFeedback)
      .where(eq(exerciseFeedback.sessionFeedbackId, sessionFeedbackId));
  }

  async createExerciseFeedback(feedback: InsertExerciseFeedback): Promise<ExerciseFeedback> {
    const [createdFeedback] = await db
      .insert(exerciseFeedback)
      .values(feedback)
      .returning();
    return createdFeedback;
  }
  
  // Expert operations - searchExercisesWithBiomechanicalData
  async searchExercisesWithBiomechanicalData(
    options: {
      targetMuscles?: string[];
      category?: string;
      difficultyLevel?: string;
      equipment?: string[];
      hasAnalysis?: boolean;
      effectivenessMinScore?: number;
      biomechanicalConcerns?: string[];
    },
    limit: number,
    offset: number
  ): Promise<Array<ExerciseLibrary & { biomechanicalAnalysis?: BiomechanicalExerciseAnalysis }>> {
    // Start by getting all exercises based on basic filters
    let exercisesQuery = db.select().from(exerciseLibrary);
    
    // Apply simple filters
    if (options.category) {
      exercisesQuery = exercisesQuery.where(eq(exerciseLibrary.category, options.category));
    }
    
    if (options.difficultyLevel) {
      exercisesQuery = exercisesQuery.where(eq(exerciseLibrary.difficultyLevel, options.difficultyLevel));
    }
    
    // Fetch exercises
    let exercises = await exercisesQuery;
    
    // Further filter on array fields in JS
    if (options.targetMuscles && options.targetMuscles.length > 0) {
      exercises = exercises.filter(exercise => 
        exercise.targetMuscles && 
        options.targetMuscles?.some(muscle => 
          exercise.targetMuscles?.includes(muscle)
        )
      );
    }
    
    if (options.equipment && options.equipment.length > 0) {
      exercises = exercises.filter(exercise => 
        exercise.equipmentRequired && 
        options.equipment?.some(eq => 
          exercise.equipmentRequired?.includes(eq)
        )
      );
    }
    
    // Get biomechanical analysis data
    let analyses: BiomechanicalExerciseAnalysis[] = [];
    if (options.hasAnalysis || options.effectivenessMinScore !== undefined || options.biomechanicalConcerns) {
      analyses = await db.select().from(biomechanicalExerciseAnalysis);
      
      // Create a map of exerciseId to analysis for faster lookups
      const analysisMap = new Map<number, BiomechanicalExerciseAnalysis>();
      for (const analysis of analyses) {
        analysisMap.set(analysis.exerciseId, analysis);
      }
      
      // Filter exercises based on analyses
      exercises = exercises.filter(exercise => {
        const analysis = analysisMap.get(exercise.id);
        
        // Has analysis filter
        if (options.hasAnalysis && !analysis) {
          return false;
        }
        
        // Effectiveness score filter
        if (options.effectivenessMinScore !== undefined && 
            (!analysis || analysis.effectivenessScore < options.effectivenessMinScore)) {
          return false;
        }
        
        // Biomechanical concerns filter
        if (options.biomechanicalConcerns && options.biomechanicalConcerns.length > 0) {
          if (!analysis || !analysis.contraindications) return false;
          
          const hasConcern = options.biomechanicalConcerns.some(concern => 
            analysis.contraindications?.includes(concern)
          );
          if (!hasConcern) return false;
        }
        
        return true;
      });
    }
    
    // Apply pagination
    const paginatedExercises = exercises.slice(offset, offset + limit);
    
    // Combine exercise data with biomechanical analysis
    return paginatedExercises.map(exercise => {
      const analysis = analyses.find(a => a.exerciseId === exercise.id);
      return {
        ...exercise,
        biomechanicalAnalysis: analysis
      };
    });
  }
  
  // Additional expert operations would go here
}