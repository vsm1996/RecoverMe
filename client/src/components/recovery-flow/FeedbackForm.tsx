import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from 'zod';
import { SessionFeedback, ExerciseFeedback, RecoverySession } from './RecoveryFlowTypes';
import { Star, Award, BarChart, ThumbsUp, MessageSquare, ArrowLeft, CheckCircle, RotateCcw } from 'lucide-react';

interface FeedbackFormProps {
  userId: number;
  session: RecoverySession;
  onSubmit: (feedback: SessionFeedback) => void;
  onCancel: () => void;
}

const ratingSchema = z.object({
  rating: z.number().min(1).max(5),
  effectiveness: z.number().min(1).max(5),
  difficulty: z.number().min(1).max(5),
  enjoyment: z.number().min(1).max(5),
  feedback: z.string().optional(),
  exerciseFeedback: z.array(
    z.object({
      exerciseId: z.string(),
      exerciseName: z.string(),
      rating: z.number().min(1).max(5),
      difficulty: z.number().min(1).max(5),
      effectiveness: z.number().min(1).max(5),
      feedback: z.string().optional(),
    })
  ).optional(),
});

type RatingFormValues = z.infer<typeof ratingSchema>;

export function FeedbackForm({ userId, session, onSubmit, onCancel }: FeedbackFormProps) {
  const [step, setStep] = useState<'session' | 'exercises'>('session');

  const form = useForm<RatingFormValues>({
    resolver: zodResolver(ratingSchema),
    defaultValues: {
      rating: 3,
      effectiveness: 3,
      difficulty: 3,
      enjoyment: 3,
      feedback: '',
      exerciseFeedback: session.exercises.map(exercise => ({
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        rating: 3,
        difficulty: 3,
        effectiveness: 3,
        feedback: '',
      })),
    },
  });

  const handleSubmit = (values: RatingFormValues) => {
    // Convert form values to SessionFeedback type
    const sessionFeedback: SessionFeedback = {
      sessionId: session.id,
      userId: userId,
      rating: values.rating,
      effectiveness: values.effectiveness,
      difficulty: values.difficulty,
      enjoyment: values.enjoyment,
      feedback: values.feedback,
      completedAt: new Date(),
      exerciseFeedback: values.exerciseFeedback,
    };
    
    onSubmit(sessionFeedback);
  };

  const renderExerciseFeedback = () => {
    return (
      <>
        <CardHeader className="bg-gradient-to-r from-green-600 to-teal-700 text-white">
          <div className="flex items-center mb-2">
            <Dumbbell className="h-5 w-5 mr-2 text-green-200" />
            <CardTitle>Exercise Feedback</CardTitle>
          </div>
          <CardDescription className="text-green-100">
            Help us understand how each exercise worked for you
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="mb-6 bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-xl border border-green-100">
            <div className="flex items-start">
              <div className="bg-green-100 p-2 rounded-full shrink-0 mr-3 text-green-700 mt-1">
                <CheckCircle className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-medium text-green-800 mb-1">Exercise by exercise feedback</h3>
                <p className="text-sm text-green-700">
                  Your input helps our AI learn which exercises work best for your body and recovery needs.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-8">
            {session.exercises.map((exercise, index) => (
              <div key={exercise.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-800 flex items-center">
                    <div className="bg-green-100 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-green-700">
                      {index + 1}
                    </div>
                    {exercise.name}
                  </h3>
                </div>
                
                <div className="p-5 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name={`exerciseFeedback.${index}.rating`}
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="flex items-center text-sm font-medium">
                            <Star className="h-4 w-4 mr-1 text-yellow-500" /> 
                            Rating
                          </FormLabel>
                          <div className="flex items-center space-x-2">
                            <FormControl>
                              <Slider
                                defaultValue={[field.value]}
                                min={1}
                                max={5}
                                step={1}
                                onValueChange={(value) => field.onChange(value[0])}
                                className="z-0"
                              />
                            </FormControl>
                            <div className="w-7 h-7 bg-blue-100 text-blue-700 rounded-full text-center flex items-center justify-center font-medium text-sm">
                              {field.value}
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`exerciseFeedback.${index}.effectiveness`}
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="flex items-center text-sm font-medium">
                            <Award className="h-4 w-4 mr-1 text-green-500" /> 
                            Effectiveness
                          </FormLabel>
                          <div className="flex items-center space-x-2">
                            <FormControl>
                              <Slider
                                defaultValue={[field.value]}
                                min={1}
                                max={5}
                                step={1}
                                onValueChange={(value) => field.onChange(value[0])}
                                className="z-0"
                              />
                            </FormControl>
                            <div className="w-7 h-7 bg-green-100 text-green-700 rounded-full text-center flex items-center justify-center font-medium text-sm">
                              {field.value}
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`exerciseFeedback.${index}.difficulty`}
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="flex items-center text-sm font-medium">
                            <BarChart className="h-4 w-4 mr-1 text-orange-500" /> 
                            Difficulty
                          </FormLabel>
                          <div className="flex items-center space-x-2">
                            <FormControl>
                              <Slider
                                defaultValue={[field.value]}
                                min={1}
                                max={5}
                                step={1}
                                onValueChange={(value) => field.onChange(value[0])}
                                className="z-0"
                              />
                            </FormControl>
                            <div className="w-7 h-7 bg-orange-100 text-orange-700 rounded-full text-center flex items-center justify-center font-medium text-sm">
                              {field.value}
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <FormField
                    control={form.control}
                    name={`exerciseFeedback.${index}.feedback`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-sm font-medium">
                          <MessageSquare className="h-4 w-4 mr-1 text-gray-500" /> 
                          Comments (Optional)
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any specific feedback for this exercise?" 
                            className="resize-none h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
          <Button 
            variant="outline" 
            onClick={() => setStep('session')} 
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Session Feedback
          </Button>
          <Button 
            type="submit" 
            onClick={form.handleSubmit(handleSubmit)}
            className="bg-green-600 hover:bg-green-700 flex items-center"
          >
            Complete Feedback
            <CheckCircle className="h-4 w-4 ml-2" />
          </Button>
        </CardFooter>
      </>
    );
  };

  const renderSessionFeedback = () => {
    return (
      <>
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="flex items-center mb-2">
            <Star className="h-5 w-5 mr-2 text-yellow-300" />
            <CardTitle>Recovery Session Feedback</CardTitle>
          </div>
          <CardDescription className="text-blue-100">
            Share your experience to help improve future recovery sessions
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-8">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-2">
            <h3 className="text-blue-800 font-medium flex items-center mb-2">
              <ThumbsUp className="h-4 w-4 mr-2 text-blue-600" />
              Your feedback powers our AI recommendations
            </h3>
            <p className="text-blue-700 text-sm">
              By sharing your experience, you help our system create better personalized recovery flows that adapt to your needs.
            </p>
          </div>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem className="space-y-2 bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                  <FormLabel className="flex items-center text-base font-medium">
                    <Star className="h-5 w-5 mr-2 text-yellow-500" /> 
                    Overall Rating
                  </FormLabel>
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-3 mb-1 mt-2">
                      <FormControl>
                        <Slider
                          defaultValue={[field.value]}
                          min={1}
                          max={5}
                          step={1}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="z-0"
                        />
                      </FormControl>
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full text-center flex items-center justify-center font-semibold">
                        {field.value}
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 px-1 mt-1">
                      <span>Not great</span>
                      <span>Average</span>
                      <span>Excellent</span>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="effectiveness"
                render={({ field }) => (
                  <FormItem className="space-y-2 bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                    <FormLabel className="flex items-center text-base font-medium">
                      <Award className="h-5 w-5 mr-2 text-green-500" /> 
                      Effectiveness
                    </FormLabel>
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-3 mt-2">
                        <FormControl>
                          <Slider
                            defaultValue={[field.value]}
                            min={1}
                            max={5}
                            step={1}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="z-0"
                          />
                        </FormControl>
                        <div className="w-8 h-8 bg-green-500 text-white rounded-full text-center flex items-center justify-center font-semibold">
                          {field.value}
                        </div>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem className="space-y-2 bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                    <FormLabel className="flex items-center text-base font-medium">
                      <BarChart className="h-5 w-5 mr-2 text-orange-500" /> 
                      Difficulty
                    </FormLabel>
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-3 mt-2">
                        <FormControl>
                          <Slider
                            defaultValue={[field.value]}
                            min={1}
                            max={5}
                            step={1}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="z-0"
                          />
                        </FormControl>
                        <div className="w-8 h-8 bg-orange-500 text-white rounded-full text-center flex items-center justify-center font-semibold">
                          {field.value}
                        </div>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="enjoyment"
                render={({ field }) => (
                  <FormItem className="space-y-2 bg-white rounded-lg p-4 border border-gray-100 shadow-sm md:col-span-2">
                    <FormLabel className="flex items-center text-base font-medium">
                      <ThumbsUp className="h-5 w-5 mr-2 text-blue-500" /> 
                      Enjoyment
                    </FormLabel>
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-3 mt-2">
                        <FormControl>
                          <Slider
                            defaultValue={[field.value]}
                            min={1}
                            max={5}
                            step={1}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="z-0"
                          />
                        </FormControl>
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full text-center flex items-center justify-center font-semibold">
                          {field.value}
                        </div>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                  <FormLabel className="flex items-center text-base font-medium">
                    <MessageSquare className="h-5 w-5 mr-2 text-purple-500" /> 
                    Additional Comments
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Share your thoughts about today's recovery session..." 
                      className="min-h-[100px] mt-2"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500 mt-2">
                    Any specific feedback about what worked well or what could be improved?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-between px-6 py-4 bg-gray-50 border-t border-gray-100">
          <Button variant="outline" onClick={onCancel} className="flex items-center">
            <RotateCcw className="h-4 w-4 mr-2" />
            Skip for now
          </Button>
          <Button onClick={() => setStep('exercises')} className="bg-blue-600 hover:bg-blue-700 flex items-center">
            Next: Exercise Feedback
            <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
          </Button>
        </CardFooter>
      </>
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <Card className="w-full">
          {step === 'session' ? renderSessionFeedback() : renderExerciseFeedback()}
        </Card>
      </form>
    </Form>
  );
}