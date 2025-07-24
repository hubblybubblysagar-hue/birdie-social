import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User } from '@shared/schema';
import { useLocation } from 'wouter';

interface MatchNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  matchedUser: User | null;
}

export function MatchNotification({ isOpen, onClose, matchedUser }: MatchNotificationProps) {
  const [, navigate] = useLocation();

  if (!matchedUser) return null;

  const handleSendMessage = () => {
    navigate('/matches');
    onClose();
  };

  const handleContinueBrowsing = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white rounded-xl p-6 max-w-xs w-full text-center">
        <div className="relative mb-6 mt-2">
          <div className="w-20 h-20 rounded-full border-4 border-primary overflow-hidden mx-auto">
            <img 
              src={matchedUser.profilePicture || `https://ui-avatars.com/api/?name=${matchedUser.fullName}&background=random`} 
              alt={`${matchedUser.fullName}'s profile`} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-0 right-0 left-0 mt-16 flex justify-center">
            <div className="animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>
        
        <DialogTitle className="text-2xl font-montserrat font-bold text-primary mb-2">It's a Match!</DialogTitle>
        <DialogDescription className="text-gray-700 mb-6">
          You and {matchedUser.fullName} have both shown interest in playing together
        </DialogDescription>
        
        <div className="space-y-3">
          <Button 
            onClick={handleSendMessage}
            className="w-full py-3 bg-primary text-white rounded-full font-medium shadow-md hover:bg-opacity-90 transition"
          >
            Send Message
          </Button>
          <Button
            onClick={handleContinueBrowsing}
            variant="outline"
            className="w-full py-3 border border-primary text-primary rounded-full font-medium hover:bg-primary hover:bg-opacity-5 transition"
          >
            Continue Browsing
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
