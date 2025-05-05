import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { Camera, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const profileFormSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  sportType: z.string().min(1, 'Please select a sport'),
  height: z.coerce.number().min(1, 'Height must be greater than 0'),
  weight: z.coerce.number().min(1, 'Weight must be greater than 0'),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const Profile: React.FC = () => {
  const { toast } = useToast();
  const userId = 1; // This would come from authentication

  const { data: user, isLoading } = useQuery({
    queryKey: [`/api/users/${userId}`],
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      sportType: '',
      height: 0,
      weight: 0,
    },
  });

  // Update form values when user data is loaded
  React.useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        sportType: user.sportType,
        height: user.height || 0,
        weight: user.weight || 0,
      });
    }
  }, [user, form]);

  const updateProfileMutation = useMutation({
    mutationFn: (values: ProfileFormValues) => {
      return apiRequest('PATCH', `/api/users/${userId}`, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (values: ProfileFormValues) => {
    updateProfileMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <h2 className="font-nunito font-bold text-2xl mb-6">Profile Settings</h2>
        <Card className="rounded-xl shadow-sm mb-6">
          <CardContent className="pt-6">
            <div className="animate-pulse">
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-gray-200 mb-3"></div>
                <div className="h-6 bg-gray-200 rounded w-32"></div>
              </div>
              
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-24"></div>
                    <div className="h-10 bg-gray-200 rounded w-full"></div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-end">
                <div className="h-10 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="font-nunito font-bold text-2xl mb-6">Profile Settings</h2>
      
      <Card className="rounded-xl shadow-sm mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="relative mb-3">
              <img 
                src={user?.profileImageUrl || "https://via.placeholder.com/96"} 
                alt="Profile" 
                className="w-24 h-24 rounded-full object-cover"
              />
              <Button 
                size="sm" 
                className="absolute bottom-0 right-0 rounded-full p-2 bg-[#64B5F6]"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <h3 className="font-nunito font-semibold text-lg">{user?.firstName} {user?.lastName}</h3>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input className="rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last name</FormLabel>
                      <FormControl>
                        <Input className="rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input className="rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="sportType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sport</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select sport" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Running">Running</SelectItem>
                        <SelectItem value="Swimming">Swimming</SelectItem>
                        <SelectItem value="Cycling">Cycling</SelectItem>
                        <SelectItem value="Basketball">Basketball</SelectItem>
                        <SelectItem value="Soccer">Soccer</SelectItem>
                        <SelectItem value="Tennis">Tennis</SelectItem>
                        <SelectItem value="CrossFit">CrossFit</SelectItem>
                        <SelectItem value="Weightlifting">Weightlifting</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height (cm)</FormLabel>
                      <FormControl>
                        <Input type="number" className="rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" className="rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  className="rounded-xl bg-[#64B5F6]"
                  disabled={updateProfileMutation.isPending}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
