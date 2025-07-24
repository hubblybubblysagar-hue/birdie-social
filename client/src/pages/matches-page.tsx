import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AppHeader } from '@/components/ui/app-header';
import { BottomNav } from '@/components/ui/bottom-nav';
import { TabView } from '@/components/ui/tab-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { MatchWithUser, MessageWithUser } from '@/client/src/types';
import { ArrowLeft, Calendar, Send, User } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function MatchesPage() {
  const { user } = useAuth();
  const [activeChat, setActiveChat] = useState<MatchWithUser | null>(null);
  const [messageText, setMessageText] = useState('');
  
  // Fetch matches
  const { data: matches = [], isLoading: matchesLoading } = useQuery<MatchWithUser[]>({
    queryKey: ['/api/matches'],
  });
  
  // Fetch messages for active chat
  const { data: messages = [], isLoading: messagesLoading } = useQuery<MessageWithUser[]>({
    queryKey: ['/api/matches', activeChat?.id, 'messages'],
    enabled: !!activeChat,
  });
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { matchId: number, content: string }) => {
      const res = await apiRequest('POST', `/api/matches/${data.matchId}/messages`, { content: data.content });
      return res.json();
    },
    onSuccess: () => {
      // Clear message input and refetch messages
      setMessageText('');
      queryClient.invalidateQueries({ queryKey: ['/api/matches', activeChat?.id, 'messages'] });
    }
  });
  
  const handleSendMessage = () => {
    if (!activeChat || !messageText.trim()) return;
    
    sendMessageMutation.mutate({
      matchId: activeChat.id,
      content: messageText.trim()
    });
  };
  
  // View for the matches list
  const renderMatchesList = () => (
    <div className="p-4">
      <div className="grid grid-cols-2 gap-4">
        {matches.length > 0 ? (
          matches.map((match) => (
            <div key={match.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="relative">
                <img 
                  src={match.otherUser?.profilePicture || `https://ui-avatars.com/api/?name=${match.otherUser?.fullName || 'User'}`} 
                  alt="Match profile" 
                  className="w-full h-36 object-cover" 
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                  <h3 className="text-white font-medium">
                    {match.otherUser?.fullName}, {match.otherUser?.age}
                  </h3>
                </div>
              </div>
              <div className="p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-500">
                    Matched {new Date(match.matchedAt).toLocaleDateString()}
                  </span>
                  {match.otherUser?.handicap !== undefined && (
                    <span className="inline-block bg-secondary bg-opacity-10 text-primary text-xs px-2 py-0.5 rounded-full">
                      {match.otherUser.handicap} Handicap
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setActiveChat(match)}
                    className="flex-1 py-2 bg-primary text-white text-sm rounded-lg font-medium"
                  >
                    Message
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 py-2 border border-primary text-primary text-sm rounded-lg font-medium"
                  >
                    Tee Time
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : matchesLoading ? (
          <div className="col-span-2 py-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Loading your matches...</p>
          </div>
        ) : (
          <div className="col-span-2 py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">No Matches Yet</h3>
            <p className="text-gray-500 mb-4">Start swiping to find golf partners!</p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="text-primary bg-transparent hover:bg-primary hover:bg-opacity-5"
            >
              Go to Home
            </Button>
          </div>
        )}
      </div>
    </div>
  );
  
  // View for active chat
  const renderChat = () => (
    <div className="absolute inset-0 bg-white z-40 pt-16 pb-20">
      {/* Chat Header */}
      <div className="border-b border-gray-200 p-4 flex items-center">
        <button 
          onClick={() => setActiveChat(null)}
          className="mr-3 text-gray-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
            <img 
              src={activeChat?.otherUser?.profilePicture || `https://ui-avatars.com/api/?name=${activeChat?.otherUser?.fullName || 'User'}`} 
              alt="Chat with" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <h3 className="font-medium">{activeChat?.otherUser?.fullName}</h3>
            <p className="text-xs text-gray-500">Online now</p>
          </div>
        </div>
        <div className="ml-auto">
          <button className="text-primary">
            <Calendar className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="p-4 h-[calc(100vh-180px)] overflow-y-auto">
        <div className="text-center mb-6">
          <span className="inline-block bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">Today</span>
        </div>
        
        {messagesLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'} mb-4`}
            >
              <div
                className={`${
                  message.senderId === user?.id
                    ? 'bg-primary text-white rounded-lg rounded-tr-none'
                    : 'bg-gray-100 text-gray-700 rounded-lg rounded-tl-none'
                } p-3 max-w-[80%]`}
              >
                <p>{message.content}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No messages yet. Say hello!</p>
          </div>
        )}
      </div>
      
      {/* Chat Input */}
      <div className="absolute bottom-20 left-0 right-0 border-t border-gray-200 bg-white p-3">
        <div className="flex items-center">
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="flex-1 py-2 px-4 bg-gray-100 rounded-full focus:outline-none"
            placeholder="Type a message..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <button 
            onClick={handleSendMessage}
            disabled={sendMessageMutation.isPending || !messageText.trim()}
            className={`ml-3 ${
              sendMessageMutation.isPending || !messageText.trim() 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-primary cursor-pointer'
            }`}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader title="Matches" />
      
      <div className="pt-16 pb-20">
        <TabView
          tabs={[
            { id: "matches", label: "Matches", icon: <User /> },
            { id: "messages", label: "Messages", icon: <User /> }
          ]}
        >
          {renderMatchesList()}
          {renderMatchesList()} {/* Same content for both tabs in MVP */}
        </TabView>
      </div>
      
      {/* Show chat interface if a chat is active */}
      {activeChat && renderChat()}
      
      <BottomNav />
    </div>
  );
}
