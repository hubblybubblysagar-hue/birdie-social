import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { User } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { AppHeader } from '@/components/ui/app-header';
import { BottomNav } from '@/components/ui/bottom-nav';
import { SwipeCard } from '@/components/ui/swipe-card';
import { MatchNotification } from '@/components/ui/match-notification';
import { Button } from '@/components/ui/button';
import { X, Heart } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function HomePage() {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchedUser, setMatchedUser] = useState<User | null>(null);
  const [showMatch, setShowMatch] = useState(false);

  // Fetch profiles for swiping
  const { data: profiles = [], isLoading, error } = useQuery<User[]>({
    queryKey: ['/api/profiles'],
    staleTime: 60000, // 1 minute
  });

  // Swipe mutation
  const swipeMutation = useMutation({
    mutationFn: async (data: { swipeeId: number, direction: 'left' | 'right' }) => {
      const res = await apiRequest('POST', '/api/swipe', data);
      return res.json();
    },
    onSuccess: (data) => {
      // If match occurred
      if (data.match) {
        // Find the matched user
        const matchedUser = profiles.find(profile => profile.id === data.match.user2Id);
        if (matchedUser) {
          setMatchedUser(matchedUser);
          setShowMatch(true);
        }
      }
      queryClient.invalidateQueries({ queryKey: ['/api/matches'] });
    }
  });

  const handleSwipe = (direction: 'left' | 'right', profile: User) => {
    swipeMutation.mutate({
      swipeeId: profile.id,
      direction
    });
    
    // Move to next profile
    setCurrentIndex((prevIndex) => {
      if (prevIndex < profiles.length - 1) {
        return prevIndex + 1;
      }
      // If we've swiped through all profiles, return to the start
      return 0;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <div className="pt-16 pb-20">
        <div className="relative h-[70vh] flex items-center justify-center px-4">
          {profiles.length > 0 ? (
            <>
              {/* Show all profiles in a stack, with the current one on top */}
              {profiles.map((profile, index) => (
                <SwipeCard
                  key={profile.id}
                  profile={profile}
                  onSwipe={handleSwipe}
                  isActive={index === currentIndex}
                />
              ))}
              
              {/* Swipe buttons */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-8">
                <Button
                  onClick={() => handleSwipe('left', profiles[currentIndex])}
                  className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center text-red-500 border border-gray-200"
                  variant="ghost"
                >
                  <X className="h-6 w-6" />
                </Button>
                <Button
                  onClick={() => handleSwipe('right', profiles[currentIndex])}
                  className="w-14 h-14 rounded-full bg-primary shadow-lg flex items-center justify-center text-white"
                >
                  <Heart className="h-6 w-6" />
                </Button>
              </div>
            </>
          ) : isLoading ? (
            <div className="text-center">
              <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Loading profiles...</p>
            </div>
          ) : error ? (
            <div className="text-center p-6">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-montserrat font-bold text-gray-700 mb-2">Error Loading Profiles</h3>
              <p className="text-gray-500 mb-6">We couldn't load profiles. Please try again later.</p>
              <Button
                onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/profiles'] })}
                className="py-2 px-6 bg-primary text-white rounded-full font-medium shadow-md hover:bg-opacity-90 transition"
              >
                Retry
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-montserrat font-bold text-gray-700 mb-2">No More Profiles</h3>
              <p className="text-gray-500 mb-6">We've run out of golfers to show you. Check back later or expand your preferences.</p>
              <Button
                className="py-2 px-6 bg-primary text-white rounded-full font-medium shadow-md hover:bg-opacity-90 transition"
              >
                Adjust Preferences
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Match notification dialog */}
      <MatchNotification
        isOpen={showMatch}
        onClose={() => setShowMatch(false)}
        matchedUser={matchedUser}
      />
      
      <BottomNav />
    </div>
  );
}
