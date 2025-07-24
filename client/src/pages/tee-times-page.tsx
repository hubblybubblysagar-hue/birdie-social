import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AppHeader } from '@/components/ui/app-header';
import { BottomNav } from '@/components/ui/bottom-nav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { TeeTimeWithCourse } from '@/client/src/types';
import { Course } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';
import { Calendar, MapPin, Star, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function TeeTimesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [teeDate, setTeeDate] = useState<string>('');
  const [invitedUsers, setInvitedUsers] = useState<number[]>([]);
  const [courseSearchQuery, setCourseSearchQuery] = useState('');
  
  // Fetch tee times
  const { data: teeTimes = [], isLoading: teeTimesLoading } = useQuery<TeeTimeWithCourse[]>({
    queryKey: ['/api/tee-times'],
  });
  
  // Fetch courses
  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ['/api/courses'],
  });
  
  // Create tee time mutation
  const createTeeTimeMutation = useMutation({
    mutationFn: async (data: { courseId: number, date: string, participants: number[] }) => {
      const res = await apiRequest('POST', '/api/tee-times', {
        ...data,
        status: 'pending'
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Tee time created!",
        description: "Your tee time has been scheduled.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tee-times'] });
      
      // Reset form
      setSelectedCourseId(null);
      setTeeDate('');
      setInvitedUsers([]);
    },
    onError: (error) => {
      toast({
        title: "Failed to create tee time",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handle tee time creation
  const handleCreateTeeTime = () => {
    if (!selectedCourseId || !teeDate) {
      toast({
        title: "Missing information",
        description: "Please select a course and date",
        variant: "destructive",
      });
      return;
    }
    
    createTeeTimeMutation.mutate({
      courseId: selectedCourseId,
      date: teeDate,
      participants: invitedUsers
    });
  };
  
  // Helper to remove a player from invitations
  const removeInvitedPlayer = (playerId: number) => {
    setInvitedUsers(invitedUsers.filter(id => id !== playerId));
  };
  
  // Filter courses based on search query
  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(courseSearchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader title="Tee Times" />
      
      <div className="pt-16 pb-20">
        <div className="p-4">
          <h2 className="text-2xl font-montserrat font-bold text-primary mb-4">Tee Times</h2>
          
          {/* Upcoming Tee Times */}
          <div className="mb-6">
            <Card className="mb-4">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-montserrat font-bold">Upcoming Tee Times</h3>
                  <Button variant="link" className="text-sm text-primary font-medium p-0">View All</Button>
                </div>
                
                {teeTimesLoading ? (
                  <div className="py-8 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading your tee times...</p>
                  </div>
                ) : teeTimes.length > 0 ? (
                  teeTimes.map(teeTime => (
                    <div key={teeTime.id} className="bg-gray-100 rounded-lg p-3 mb-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{teeTime.course?.name}</h4>
                          <p className="text-sm text-gray-500">
                            {new Date(teeTime.date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              month: 'short', 
                              day: 'numeric' 
                            })} • {new Date(teeTime.date).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit',
                              hour12: true 
                            })}
                          </p>
                        </div>
                        <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
                          {teeTime.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                        </span>
                      </div>
                      <div className="flex items-center mt-3">
                        <div className="flex -space-x-2 mr-3">
                          {teeTime.participants && teeTime.participants.slice(0, 2).map((participantId, index) => (
                            <div key={participantId} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                              <div className="w-full h-full bg-secondary text-white flex items-center justify-center">
                                {participantId}
                              </div>
                            </div>
                          ))}
                          {teeTime.participants && teeTime.participants.length > 2 && (
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-sm">
                              <span>+{teeTime.participants.length - 2}</span>
                            </div>
                          )}
                        </div>
                        <Button variant="link" className="text-primary text-sm p-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                          </svg>
                          Chat
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <Calendar className="h-8 w-8 text-gray-400" />
                    </div>
                    <h4 className="font-medium text-gray-700 mb-1">No Upcoming Tee Times</h4>
                    <p className="text-sm text-gray-500 mb-4">Book your first round or accept an invitation</p>
                    <Button variant="link" className="text-primary font-medium">Find Players</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Book a New Tee Time */}
          <div className="mb-6">
            <h3 className="font-montserrat font-bold mb-3">Book a New Tee Time</h3>
            
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Select Course</label>
                  <div className="relative">
                    <Input
                      value={courseSearchQuery}
                      onChange={(e) => setCourseSearchQuery(e.target.value)}
                      className="w-full p-3 pr-10 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Search for courses"
                    />
                    <span className="absolute right-3 top-3 text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </div>
                  
                  {courseSearchQuery && (
                    <div className="mt-2 border rounded-lg max-h-40 overflow-y-auto">
                      {filteredCourses.map(course => (
                        <div 
                          key={course.id}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setSelectedCourseId(course.id);
                            setCourseSearchQuery(course.name);
                          }}
                        >
                          {course.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Date</label>
                  <Input
                    type="datetime-local"
                    value={teeDate}
                    onChange={(e) => setTeeDate(e.target.value)}
                    className="w-full p-3 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Invite Players</label>
                  {/* This would typically be populated with actual players from matches */}
                  <div className="flex items-center mb-3 bg-gray-100 p-3 rounded-lg">
                    <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                      <div className="w-full h-full bg-secondary text-white flex items-center justify-center">
                        S
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Sample Player</h4>
                      <p className="text-xs text-gray-500">8 Handicap • Intermediate</p>
                    </div>
                    <button 
                      onClick={() => removeInvitedPlayer(1)}
                      className="text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <Button variant="link" className="flex items-center text-primary font-medium p-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add More Players
                  </Button>
                </div>
                
                <Button
                  onClick={handleCreateTeeTime}
                  disabled={createTeeTimeMutation.isPending || !selectedCourseId || !teeDate}
                  className="w-full py-3 bg-primary text-white rounded-full font-medium shadow-md hover:bg-opacity-90 transition"
                >
                  {createTeeTimeMutation.isPending ? "Checking..." : "Check Available Times"}
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Popular Courses Nearby */}
          <div>
            <h3 className="font-montserrat font-bold mb-3">Popular Courses Nearby</h3>
            
            <div className="space-y-3">
              {coursesLoading ? (
                <div className="py-8 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading courses...</p>
                </div>
              ) : (
                courses.slice(0, 3).map(course => (
                  <Card key={course.id} className="overflow-hidden">
                    <div className="relative">
                      <img 
                        src={course.imageUrl || "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=500&h=200"} 
                        alt={course.name} 
                        className="w-full h-32 object-cover" 
                      />
                      <div className="absolute top-3 right-3 bg-white bg-opacity-90 rounded-lg px-2 py-1">
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-500 mr-1" />
                          <span className="text-xs font-medium">{course.rating || 4.5}</span>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <h4 className="font-montserrat font-bold">{course.name}</h4>
                      <p className="text-sm text-gray-500 mb-2">
                        <MapPin className="h-3 w-3 inline-block mr-1" />
                        {course.location}
                      </p>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm font-medium text-primary">From ${course.priceRange || '120'}</span>
                          <span className="text-xs text-gray-500"> / player</span>
                        </div>
                        <Button
                          onClick={() => {
                            setSelectedCourseId(course.id);
                            setCourseSearchQuery(course.name);
                          }}
                          size="sm"
                          className="px-4 py-1.5 bg-primary text-white text-sm rounded-lg font-medium"
                        >
                          Book Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}
