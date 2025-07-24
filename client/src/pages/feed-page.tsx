import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AppHeader } from '@/components/ui/app-header';
import { BottomNav } from '@/components/ui/bottom-nav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { PostWithUserAndCourse } from '@/client/src/types';
import { Course } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';
import { Plus, Heart, MessageSquare, Share2, Camera, Calendar, ClipboardList } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function FeedPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseId, setCourseId] = useState<number | null>(null);
  const [score, setScore] = useState('');
  const [playedDate, setPlayedDate] = useState('');
  
  // Fetch posts
  const { data: posts = [], isLoading: postsLoading } = useQuery<PostWithUserAndCourse[]>({
    queryKey: ['/api/posts'],
  });
  
  // Fetch courses for autocomplete
  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ['/api/courses'],
  });
  
  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (data: { 
      content: string, 
      courseId?: number, 
      score?: number, 
      playedDate?: string 
    }) => {
      const postData = {
        content: data.content,
        ...(data.courseId && { courseId: data.courseId }),
        ...(data.score && { score: parseInt(data.score) }),
        ...(data.playedDate && { playedDate: data.playedDate }),
      };
      
      const res = await apiRequest('POST', '/api/posts', postData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Post created!",
        description: "Your post has been published.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      setCreatePostOpen(false);
      
      // Reset form
      setPostContent('');
      setCourseName('');
      setCourseId(null);
      setScore('');
      setPlayedDate('');
    },
    onError: (error) => {
      toast({
        title: "Failed to create post",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handle post creation
  const handleCreatePost = () => {
    if (!postContent.trim()) {
      toast({
        title: "Missing content",
        description: "Please add some text to your post",
        variant: "destructive",
      });
      return;
    }
    
    createPostMutation.mutate({
      content: postContent,
      courseId: courseId ?? undefined,
      score: score ? parseInt(score) : undefined,
      playedDate: playedDate || undefined,
    });
  };
  
  // Filter courses based on input
  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(courseName.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader title="Feed" />
      
      <div className="pt-16 pb-20">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-montserrat font-bold text-primary">Feed</h2>
            <Button 
              onClick={() => setCreatePostOpen(true)}
              className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shadow-md"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Posts feed */}
          <div className="space-y-6">
            {postsLoading ? (
              <div className="py-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500">Loading posts...</p>
              </div>
            ) : posts.length > 0 ? (
              posts.map(post => (
                <div key={post.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                        <img 
                          src={post.user?.profilePicture || `https://ui-avatars.com/api/?name=${post.user?.fullName || 'User'}`} 
                          alt={post.user?.fullName || 'User'} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div>
                        <h4 className="font-medium">{post.user?.fullName}</h4>
                        <p className="text-xs text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{post.content}</p>
                    
                    {post.imageUrl && (
                      <div className="rounded-lg overflow-hidden mb-3">
                        <img 
                          src={post.imageUrl} 
                          alt="Post" 
                          className="w-full object-cover" 
                        />
                      </div>
                    )}
                    
                    {post.courseId && post.course && (
                      <div className="border border-gray-200 rounded-lg p-3 mb-3">
                        <div className="flex items-center">
                          <div className="text-primary text-lg mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <h5 className="font-medium">{post.course.name}</h5>
                            {post.score && (
                              <p className="text-xs text-primary">Score: {post.score}</p>
                            )}
                            {post.playedDate && (
                              <p className="text-xs text-gray-500">
                                {new Date(post.playedDate).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex space-x-4">
                        <button className="flex items-center text-gray-500">
                          <Heart className="h-4 w-4 mr-1" />
                          <span>24</span>
                        </button>
                        <button className="flex items-center text-gray-500">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          <span>5</span>
                        </button>
                      </div>
                      <button className="text-gray-500">
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                    <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-1">No Posts Yet</h3>
                <p className="text-gray-500 mb-4">Be the first to share your golf experience!</p>
                <Button 
                  onClick={() => setCreatePostOpen(true)}
                  className="bg-primary text-white"
                >
                  Create Post
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Create Post Modal */}
      <Dialog open={createPostOpen} onOpenChange={setCreatePostOpen}>
        <DialogContent className="bg-white rounded-xl w-full max-w-md">
          <DialogHeader>
            <DialogTitle className="font-montserrat font-bold text-primary">Create Post</DialogTitle>
          </DialogHeader>
          
          <div className="p-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                <img 
                  src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.fullName || 'User'}`} 
                  alt={user?.fullName || 'User'} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div>
                <h4 className="font-medium">{user?.fullName}</h4>
                <p className="text-xs text-gray-500">Posting publicly</p>
              </div>
            </div>
            
            <Textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="w-full p-3 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none mb-4"
              placeholder="What's on your mind?"
              rows={4}
            />
            
            <div className="mb-4 border border-dashed border-gray-400 rounded-lg p-6 text-center">
              <Camera className="h-6 w-6 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Add Photos</p>
            </div>
            
            <div className="mb-5">
              <label className="block text-gray-700 text-sm font-medium mb-2">Add Golf Round Details</label>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-8 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary mx-auto" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <Input
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    className="flex-1 p-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Course name"
                  />
                </div>
                
                {courseName && filteredCourses.length > 0 && (
                  <div className="ml-8 border rounded-lg max-h-32 overflow-y-auto">
                    {filteredCourses.map(course => (
                      <div 
                        key={course.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setCourseName(course.name);
                          setCourseId(course.id);
                        }}
                      >
                        {course.name}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center">
                  <div className="w-8 text-center">
                    <ClipboardList className="h-4 w-4 text-primary mx-auto" />
                  </div>
                  <Input
                    type="number"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="flex-1 p-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Your score"
                  />
                </div>
                
                <div className="flex items-center">
                  <div className="w-8 text-center">
                    <Calendar className="h-4 w-4 text-primary mx-auto" />
                  </div>
                  <Input
                    type="date"
                    value={playedDate}
                    onChange={(e) => setPlayedDate(e.target.value)}
                    className="flex-1 p-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                  />
                </div>
              </div>
            </div>
            
            <Button
              onClick={handleCreatePost}
              disabled={createPostMutation.isPending || !postContent.trim()}
              className="w-full py-3 bg-primary text-white rounded-full font-medium shadow-md hover:bg-opacity-90 transition"
            >
              {createPostMutation.isPending ? "Posting..." : "Post"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <BottomNav />
    </div>
  );
}
