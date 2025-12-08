'use client';

import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Plus, X, Image as ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useUserContext } from '@/app/(app)/layout';
import { placeholderImages } from '@/lib/placeholder-images';
import { useFirebase } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';

const MOCK_STORIES = [
  { id: '1', user: 'Sarah Wilson', avatar: placeholderImages[1]?.imageUrl, hasStory: true, viewed: false },
  { id: '2', user: 'Tech Corp', avatar: placeholderImages[2]?.imageUrl, hasStory: true, viewed: false },
  { id: '3', user: 'David Chen', avatar: placeholderImages[3]?.imageUrl, hasStory: true, viewed: true },
  { id: '4', user: 'Innovate Inc', avatar: placeholderImages[4]?.imageUrl, hasStory: true, viewed: false },
];

export function Stories() {
  const { user, displayName, userId } = useUserContext();
  const { storage } = useFirebase();
  const { toast } = useToast();
  const [selectedStory, setSelectedStory] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [storyImage, setStoryImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setStoryImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCreateStory = async () => {
    if (!storyImage || !storage || !userId) return;
    try {
      const file = fileInputRef.current?.files?.[0];
      if (!file) return;
      const storageRef = ref(storage, `stories/${userId}/${Date.now()}.jpg`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      toast({ title: 'Story created!' });
      setShowCreateDialog(false);
      setStoryImage(null);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to create story' });
    }
  };

  return (
    <>
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {/* Create Story */}
        <div className="flex flex-col items-center gap-2 min-w-[70px] cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
          <div className="relative">
            <Avatar className="w-16 h-16 border-2 border-dashed border-gray-300 p-0.5 group-hover:border-primary transition-colors">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback>{displayName?.[0]}</AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1 border-2 border-background">
              <Plus className="w-3 h-3" />
            </div>
          </div>
          <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">Your Story</span>
        </div>

      {/* Viewing Stories */}
      {MOCK_STORIES.map((story) => (
        <div 
          key={story.id} 
          className="flex flex-col items-center gap-2 min-w-[70px] cursor-pointer group"
          onClick={() => setSelectedStory(story)}
        >
          <div className={`p-[2px] rounded-full ${story.viewed ? 'bg-gray-200' : 'bg-gradient-to-tr from-yellow-400 to-purple-600'}`}>
            <Avatar className="w-16 h-16 border-2 border-background">
              <AvatarImage src={story.avatar} />
              <AvatarFallback>{story.user[0]}</AvatarFallback>
            </Avatar>
          </div>
          <span className="text-xs font-medium text-muted-foreground truncate w-full text-center group-hover:text-foreground">
            {story.user.split(' ')[0]}
          </span>
        </div>
      ))}

      </div>

      <Dialog open={!!storyImage} onOpenChange={() => { setStoryImage(null); setShowCreateDialog(false); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Story</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            {storyImage && <img src={storyImage} alt="Story" className="w-full rounded-lg" />}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setStoryImage(null); setShowCreateDialog(false); }}>Cancel</Button>
            <Button onClick={handleCreateStory}>Post Story</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedStory} onOpenChange={() => setSelectedStory(null)}>
        <DialogContent className="sm:max-w-md h-[80vh] p-0 overflow-hidden bg-black text-white border-none">
            <div className="relative h-full w-full flex flex-col">
                <div className="h-1 w-full bg-gray-800 flex gap-1 p-2 top-0 absolute z-10">
                    <div className="h-full bg-white flex-1 rounded-full animate-pulse"></div>
                    <div className="h-full bg-gray-600 flex-1 rounded-full"></div>
                </div>
                
                <div className="p-4 flex items-center justify-between absolute top-4 w-full z-10">
                    <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8 border border-white/20">
                            <AvatarImage src={selectedStory?.avatar} />
                            <AvatarFallback>{selectedStory?.user[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-sm">{selectedStory?.user}</span>
                        <span className="text-xs text-gray-300">• 2h</span>
                    </div>
                    <Button variant="ghost" size="icon" className="text-white" onClick={() => setSelectedStory(null)}>
                        <X className="w-6 h-6" />
                    </Button>
                </div>

                <div className="flex-1 bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
                    {/* Placeholder content for story */}
                    <div className="text-center p-8">
                        <h2 className="text-2xl font-bold mb-4">🚀 Just shipped a new feature!</h2>
                        <p className="text-gray-300">Super excited to share our latest update with the community. #BuildingInPublic</p>
                    </div>
                </div>

                <div className="p-4 absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent">
                    <input 
                        type="text" 
                        placeholder="Send a message..." 
                        className="w-full bg-transparent border border-white/30 rounded-full px-4 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:border-white"
                    />
                </div>
            </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
