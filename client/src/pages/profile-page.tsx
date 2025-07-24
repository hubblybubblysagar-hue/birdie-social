import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { AppHeader } from '@/components/ui/app-header';
import { BottomNav } from '@/components/ui/bottom-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { PostWithUserAndCourse } from '@/client/src/types';
import { Profile } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';
import { Settings, MapPin, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Fetch user profile
  const { data: profile } = useQuery<Profile>({
    queryKey: ['/api/profile'],
    enabled: !!user,
  });
  
  // Fetch user posts
  const { data: posts = [] } = useQuery<PostWithUserAndCourse[]>({
    queryKey: ['/api/users', user?.id, 'posts'],
    enabled: !!user,
  });
  
  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  // Calculate stats
  const stats = {
    matches: 24, // In a real app, these would be calculated from actual data
    rounds: posts.length,
    courses: [...new Set(posts.filter(post => post.courseId).map(post => post.courseId))].length,
  };
  
  // Favorite courses (derived from posts)
  const courseCounts = posts
    .filter(post => post.courseId && post.course)
    .reduce((acc, post) => {
      const courseId = post.courseId!;
      if (!acc[courseId]) {
        acc[courseId] = {
          course: post.course!,
          count: 0,
          bestScore: post.score || Infinity,
        };
      }
      acc[courseId].count += 1;
      if (post.score && post.score < acc[courseId].bestScore) {
        acc[courseId].bestScore = post.score;
      }
      return acc;
    }, {} as Record<number, { course: NonNullable<PostWithUserAndCourse['course']>, count: number, bestScore: number }>);
  
  const favoriteCourses = Object.values(courseCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 2);
  
  // Recent rounds
  const recentRounds = posts
    .filter(post => post.courseId && post.course && post.score)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 2)
    .map(post => ({
      courseName: post.course!.name,
      score: post.score!,
      date: post.playedDate || post.createdAt,
    }));
  
  // Calculate golf stats
  const golfStats = {
    handicap: user?.handicap || 12.4,
    avgScore: posts.filter(post => post.score).reduce((sum, post) => sum + (post.score || 0), 0) / 
      (posts.filter(post => post.score).length || 1),
    bestRound: posts.filter(post => post.score).reduce((best, post) => 
      Math.min(best, post.score || Infinity), Infinity),
    roundsThisYear: posts.filter(post => 
      post.createdAt && new Date(post.createdAt).getFullYear() === new Date().getFullYear()
    ).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader title="Profile" />
      
      <div className="pt-16 pb-20">
        <div className="relative mb-4">
          <div className="h-36 bg-gradient-to-r from-primary to-secondary"></div>
          <div className="absolute top-24 left-0 right-0 flex justify-center">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-white overflow-hidden">
              <img 
                src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.fullName || 'User'}&background=random`} 
                alt={user?.fullName || 'Profile'} 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
          <div className="absolute top-2 right-2">
            <button className="bg-white bg-opacity-80 rounded-full w-10 h-10 flex items-center justify-center text-gray-700">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="text-center mt-16 px-4 mb-6">
          <h2 className="text-xl font-montserrat font-bold">{user?.fullName}</h2>
          <p className="text-gray-500 text-sm">
            {user?.handicap ? `${user.handicap} Handicap` : ''} 
            {user?.handicap && user?.skillLevel ? ' • ' : ''}
            {user?.skillLevel || ''}
          </p>
          <div className="flex justify-center space-x-4 mt-2">
            <div className="text-center">
              <p className="font-bold">{stats.matches}</p>
              <p className="text-xs text-gray-500">Matches</p>
            </div>
            <div className="text-center">
              <p className="font-bold">{stats.rounds}</p>
              <p className="text-xs text-gray-500">Rounds</p>
            </div>
            <div className="text-center">
              <p className="font-bold">{stats.courses}</p>
              <p className="text-xs text-gray-500">Courses</p>
            </div>
          </div>
        </div>
        
        <Card className="rounded-t-xl">
          <CardContent className="pt-6">
            <div className="border-b border-gray-200 pb-4 mb-4">
              <Button
                variant="outline"
                className="w-full py-3 border border-primary text-primary rounded-lg font-medium hover:bg-primary hover:bg-opacity-5 transition"
                onClick={() => navigate('/onboarding')}
              >
                Edit Profile
              </Button>
            </div>
            
            <div className="border-b border-gray-200 pb-4 mb-4">
              <h3 className="font-montserrat font-bold mb-3">About Me</h3>
              <p className="text-gray-700">{user?.bio || 'No bio provided yet.'}</p>
            </div>
            
            <div className="border-b border-gray-200 pb-4 mb-4">
              <h3 className="font-montserrat font-bold mb-3">Golf Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-100 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Handicap</p>
                  <p className="text-xl font-bold text-primary">{golfStats.handicap}</p>
                </div>
                <div className="bg-gray-100 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Avg. Score</p>
                  <p className="text-xl font-bold text-primary">{Math.round(golfStats.avgScore)}</p>
                </div>
                <div className="bg-gray-100 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Best Round</p>
                  <p className="text-xl font-bold text-primary">
                    {golfStats.bestRound === Infinity ? 'N/A' : golfStats.bestRound}
                  </p>
                </div>
                <div className="bg-gray-100 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Rounds in {new Date().getFullYear()}</p>
                  <p className="text-xl font-bold text-primary">{golfStats.roundsThisYear}</p>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-montserrat font-bold">Favorite Courses</h3>
                <Button variant="link" className="text-sm text-primary font-medium p-0">View All</Button>
              </div>
              <div className="space-y-3">
                {favoriteCourses.length > 0 ? (
                  favoriteCourses.map(({ course, count, bestScore }) => (
                    <div key={course.id} className="bg-gray-100 rounded-lg p-3 flex items-center">
                      <div className="w-14 h-14 rounded-lg overflow-hidden mr-3">
                        <img 
                          src={course.imageUrl || `https://via.placeholder.com/80?text=${encodeURIComponent(course.name)}`} 
                          alt={course.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{course.name}</h4>
                        <p className="text-xs text-gray-500">Played {count} times</p>
                      </div>
                      {bestScore !== Infinity && (
                        <span className="text-xs bg-primary bg-opacity-10 text-primary px-2 py-1 rounded-full">
                          Best: {bestScore}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="bg-gray-100 rounded-lg p-6 text-center">
                    <p className="text-gray-500">You haven't played any courses yet.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-montserrat font-bold">Recent Rounds</h3>
                <Button variant="link" className="text-sm text-primary font-medium p-0">View All</Button>
              </div>
              <div className="space-y-3">
                {recentRounds.length > 0 ? (
                  recentRounds.map((round, index) => (
                    <div key={index} className="bg-gray-100 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium">{round.courseName}</h4>
                        <span className="text-xs bg-primary bg-opacity-10 text-primary px-2 py-1 rounded-full">
                          {round.score}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(round.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="bg-gray-100 rounded-lg p-6 text-center">
                    <p className="text-gray-500">No rounds recorded yet.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="bg-yellow-50 rounded-xl p-4 mb-3">
                <div className="flex items-start">
                  <div className="mr-3 bg-yellow-500 text-white rounded-full w-10 h-10 flex items-center justify-center">
                    <Crown className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-montserrat font-bold text-yellow-600 mb-1">Upgrade to Premium</h3>
                    <p className="text-sm text-gray-700 mb-3">Get unlimited matches, see who's interested in playing with you, and access exclusive discounts.</p>
                    <Button
                      onClick={() => navigate('/premium')}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-yellow-600 transition"
                    >
                      See Benefits
                    </Button>
                  </div>
                </div>
              </div>
              
              <Button
                variant="outline"
                className="w-full mt-4 text-red-500 border-red-500 hover:bg-red-50"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <BottomNav />
    </div>
  );
}
