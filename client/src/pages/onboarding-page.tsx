import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { AppHeader } from "@/components/ui/app-header";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Form schema for profile setup
const profileSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  age: z.string().min(1, "Age is required").transform(Number),
  skillLevel: z.string().min(1, "Skill level is required"),
  handicap: z.string().optional().transform(val => val ? Number(val) : undefined),
  occupation: z.string().optional(),
  gender: z.string().min(1, "Gender is required"),
  address: z.string().optional(),
  clubMembership: z.string().optional(),
  preferredCourses: z.array(z.string()).optional(),
  bio: z.string().max(150, "Bio cannot exceed 150 characters").optional(),
  availability: z.array(z.string()).optional(),
  profilePicture: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function OnboardingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [profileImage, setProfileImage] = useState<string>("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [courseInput, setCourseInput] = useState<string>("");

  // Weekdays for availability selection
  const weekdays = [
    { code: "Mon", label: "Mon" },
    { code: "Tue", label: "Tue" },
    { code: "Wed", label: "Wed" },
    { code: "Thu", label: "Thu" },
    { code: "Fri", label: "Fri" },
    { code: "Sat", label: "Sat" },
    { code: "Sun", label: "Sun" },
  ];

  // Form setup
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      age: user?.age?.toString() || "",
      skillLevel: user?.skillLevel || "",
      handicap: user?.handicap?.toString() || "",
      occupation: user?.occupation || "",
      gender: user?.gender || "",
      address: user?.address || "",
      clubMembership: user?.clubMembership || "",
      bio: user?.bio || "",
      preferredCourses: [],
      availability: [],
      profilePicture: user?.profilePicture || "",
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (userData: Partial<typeof user>) => {
      const res = await apiRequest("PUT", "/api/user", userData);
      return res.json();
    },
  });

  const createProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      const res = await apiRequest("POST", "/api/profile", profileData);
      return res.json();
    },
  });

  const handleProfileSubmit = async (values: ProfileFormValues) => {
    try {
      // First update the user data
      const userData = {
        fullName: values.fullName,
        age: values.age,
        skillLevel: values.skillLevel,
        handicap: values.handicap,
        occupation: values.occupation,
        gender: values.gender,
        address: values.address,
        clubMembership: values.clubMembership,
        profilePicture: profileImage,
        bio: values.bio,
      };

      await updateUserMutation.mutateAsync(userData);

      // Then create the profile
      const profileData = {
        preferredCourses: selectedCourses,
        availability: selectedDays,
      };

      await createProfileMutation.mutateAsync(profileData);

      toast({
        title: "Profile created!",
        description: "Your profile has been set up successfully.",
      });

      // Navigate to home page
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem setting up your profile.",
        variant: "destructive",
      });
    }
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const addCourse = () => {
    if (courseInput.trim() && !selectedCourses.includes(courseInput.trim())) {
      setSelectedCourses([...selectedCourses, courseInput.trim()]);
      setCourseInput("");
    }
  };

  const removeCourse = (course: string) => {
    setSelectedCourses(selectedCourses.filter(c => c !== course));
  };

  return (
    <div className="min-h-screen pb-20 pt-16 bg-gray-50">
      <AppHeader title="Create Your Profile" showNotifications={false} />

      <div className="px-5 py-4">
        <div className="mb-6">
          <h2 className="text-2xl font-montserrat font-bold text-primary mb-2">Create Your Profile</h2>
          <p className="text-gray-500">Tell us about your golf game to find the perfect partners</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleProfileSubmit)} className="space-y-6">
            <AvatarUpload 
              initialImage={profileImage}
              onImageChange={setProfileImage}
            />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="30" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="skillLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skill Level</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="handicap"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Handicap (Optional)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="12.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="occupation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Occupation (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Software Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St, City, State" {...field} />
                    </FormControl>
                    <FormDescription>
                      Used for finding golfers near you
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clubMembership"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Club Membership (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Pine Valley Golf Club" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="preferredCourses"
                render={() => (
                  <FormItem>
                    <FormLabel>Preferred Courses</FormLabel>
                    <div className="relative">
                      <Input
                        value={courseInput}
                        onChange={(e) => setCourseInput(e.target.value)}
                        placeholder="Search for courses"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addCourse();
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-gray-500"
                        onClick={addCourse}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedCourses.map((course) => (
                        <span
                          key={course}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center"
                        >
                          {course}
                          <button
                            type="button"
                            className="ml-1 text-gray-500"
                            onClick={() => removeCourse(course)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell others about your golf game (max 150 chars)"
                        rows={3}
                        maxLength={150}
                        {...field}
                      />
                    </FormControl>
                    <div className="text-right text-xs text-gray-500 mt-1">
                      {field.value?.length || 0}/150
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="availability"
                render={() => (
                  <FormItem>
                    <FormLabel>Availability</FormLabel>
                    <div className="grid grid-cols-7 gap-1">
                      {weekdays.map((day) => (
                        <div key={day.code} className="text-center">
                          <span className="block text-xs mb-1">{day.label}</span>
                          <button
                            type="button"
                            className={`w-10 h-10 rounded-full border ${
                              selectedDays.includes(day.code)
                                ? "bg-primary text-white border-primary"
                                : "border-gray-400 hover:border-primary"
                            }`}
                            onClick={() => toggleDay(day.code)}
                          ></button>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full py-3 bg-primary text-white rounded-full font-medium shadow-md hover:bg-opacity-90 transition mt-8"
              disabled={updateUserMutation.isPending || createProfileMutation.isPending}
            >
              {updateUserMutation.isPending || createProfileMutation.isPending
                ? "Saving..."
                : "Save & Continue"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
