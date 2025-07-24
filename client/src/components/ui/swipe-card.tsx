import { useState, useRef, useEffect } from 'react';
import { User } from '@shared/schema';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Star, MapPin } from 'lucide-react';

interface SwipeCardProps {
  profile: User;
  onSwipe: (direction: 'left' | 'right', profile: User) => void;
  isActive: boolean;
}

export function SwipeCard({ profile, onSwipe, isActive }: SwipeCardProps) {
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number>(0);
  const currentX = useRef<number>(0);
  
  const swipeMutation = useMutation({
    mutationFn: async (data: { swipeeId: number, direction: 'left' | 'right' }) => {
      const res = await apiRequest('POST', '/api/swipe', data);
      return res.json();
    },
    onSuccess: (data) => {
      return data;
    }
  });

  const handleSwipe = (dir: 'left' | 'right') => {
    if (!isActive || direction) return;
    
    setDirection(dir);
    
    // Call the API to record the swipe
    swipeMutation.mutate({
      swipeeId: profile.id,
      direction: dir
    });
    
    // Notify parent component
    setTimeout(() => {
      onSwipe(dir, profile);
      setDirection(null);
    }, 300);
  };

  // Touch/mouse event handlers
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isActive || direction) return;
    
    startX.current = 'touches' in e 
      ? e.touches[0].clientX 
      : e.clientX;
    
    document.addEventListener('touchmove', handleTouchMove as any);
    document.addEventListener('touchend', handleTouchEnd as any);
    document.addEventListener('mousemove', handleMouseMove as any);
    document.addEventListener('mouseup', handleMouseUp as any);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!cardRef.current) return;
    
    currentX.current = e.touches[0].clientX;
    const deltaX = currentX.current - startX.current;
    
    cardRef.current.style.transform = `translateX(${deltaX}px) rotate(${deltaX * 0.03}deg)`;
    
    // Change opacity of yes/no indicators based on direction
    if (deltaX > 0) {
      cardRef.current.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.2)';
    } else if (deltaX < 0) {
      cardRef.current.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.2)';
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!cardRef.current) return;
    
    currentX.current = e.clientX;
    const deltaX = currentX.current - startX.current;
    
    cardRef.current.style.transform = `translateX(${deltaX}px) rotate(${deltaX * 0.03}deg)`;
    
    // Change opacity of yes/no indicators based on direction
    if (deltaX > 0) {
      cardRef.current.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.2)';
    } else if (deltaX < 0) {
      cardRef.current.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.2)';
    }
  };

  const handleTouchEnd = () => {
    if (!cardRef.current) return;
    
    document.removeEventListener('touchmove', handleTouchMove as any);
    document.removeEventListener('touchend', handleTouchEnd as any);
    document.removeEventListener('mousemove', handleMouseMove as any);
    document.removeEventListener('mouseup', handleMouseUp as any);
    
    const deltaX = currentX.current - startX.current;
    
    // If swiped far enough, complete the swipe
    if (Math.abs(deltaX) > 100) {
      const swipeDirection = deltaX > 0 ? 'right' : 'left';
      handleSwipe(swipeDirection);
    } else {
      // Reset card position
      cardRef.current.style.transform = '';
      cardRef.current.style.boxShadow = '';
    }
  };

  const handleMouseUp = handleTouchEnd;

  // Reset on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('touchmove', handleTouchMove as any);
      document.removeEventListener('touchend', handleTouchEnd as any);
      document.removeEventListener('mousemove', handleMouseMove as any);
      document.removeEventListener('mouseup', handleMouseUp as any);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={`absolute w-full max-w-sm bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 ${
        direction === 'left' ? 'swipe-left' : direction === 'right' ? 'swipe-right' : ''
      }`}
      style={{
        zIndex: isActive ? 10 : 1,
        transform: direction === 'left' 
          ? 'translateX(-150%) rotate(-15deg)' 
          : direction === 'right' 
          ? 'translateX(150%) rotate(15deg)' 
          : ''
      }}
      onTouchStart={handleTouchStart}
      onMouseDown={handleTouchStart}
    >
      <div className="relative">
        <img 
          src={profile.profilePicture || `https://ui-avatars.com/api/?name=${profile.fullName}&background=random`} 
          alt={`${profile.fullName}'s profile`} 
          className="w-full h-80 object-cover"
        />
        {profile.handicap !== undefined && profile.handicap <= 10 && (
          <div className="absolute top-3 right-3 bg-white bg-opacity-80 rounded-full px-3 py-1 text-sm font-medium text-primary">
            <Star className="h-4 w-4 inline-block text-yellow-500 mr-1" /> Pro
          </div>
        )}
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-xl font-montserrat font-bold">
              {profile.fullName}, {profile.age || 'N/A'}
            </h3>
            <p className="text-sm text-gray-500">
              <MapPin className="h-4 w-4 inline-block mr-1" /> 
              <span>Nearby</span>
            </p>
          </div>
          {profile.handicap !== undefined && (
            <div className="px-3 py-1 bg-secondary bg-opacity-10 rounded-full">
              <span className="text-sm font-medium text-primary">{profile.handicap} Handicap</span>
            </div>
          )}
        </div>
        
        <div className="mb-3">
          {profile.skillLevel && (
            <span className="inline-block bg-primary bg-opacity-10 text-primary text-sm px-3 py-1 rounded-full mr-2 mb-2">
              {profile.skillLevel}
            </span>
          )}
          <span className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full mr-2 mb-2">
            {profile.age && profile.age < 30 ? 'Young Player' : 'Experienced'}
          </span>
        </div>
        
        {profile.bio && (
          <p className="text-gray-700 mb-4">{profile.bio}</p>
        )}
      </div>
    </div>
  );
}
