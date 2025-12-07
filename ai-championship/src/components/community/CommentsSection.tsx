'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Send, MoreVertical, Trash2, Edit2, CornerDownRight, Sparkles, Loader2 } from 'lucide-react';
import { useUserContext } from '@/app/(app)/layout';
import { formatDistanceToNow } from 'date-fns';
import { useFirebase } from '@/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  replies?: Comment[];
}

interface CommentsSectionProps {
  postId: string;
  comments: Comment[];
  onCommentAdded?: () => void;
  postContent?: string; // Passed for AI context
}

export function CommentsSection({ postId, comments, onCommentAdded, postContent }: CommentsSectionProps) {
  const { user, displayName, role } = useUserContext();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

  const handleSubmit = async () => {
    if (!newComment.trim() || !user || !firestore) return;

    setIsSubmitting(true);
    try {
      const comment: Comment = {
        id: crypto.randomUUID(),
        authorId: user.uid,
        authorName: displayName || 'Anonymous',
        content: newComment.trim(),
        createdAt: new Date().toISOString(),
        replies: []
      };

      await updateDoc(doc(firestore, 'posts', postId), {
        comments: arrayUnion(comment),
      });

      setNewComment('');
      setAiSuggestions([]);
      if (onCommentAdded) onCommentAdded();
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (comment: Comment) => {
    if (!user || !firestore) return;
    try {
      await updateDoc(doc(firestore, 'posts', postId), {
        comments: arrayRemove(comment),
      });
      if (onCommentAdded) onCommentAdded();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleEdit = async (oldComment: Comment) => {
    if (!user || !firestore || !editContent.trim()) return;
    try {
      const newComment = { ...oldComment, content: editContent };
      await handleDelete(oldComment);
      await updateDoc(doc(firestore, 'posts', postId), {
        comments: arrayUnion(newComment), 
      });
      setEditingCommentId(null);
      setEditContent('');
      if (onCommentAdded) onCommentAdded();
    } catch (error) {
       console.error('Failed to edit comment:', error);
    }
  };

  const handleGetAISuggestions = async () => {
    if (!postContent) return;
    setIsGeneratingSuggestions(true);
    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'suggest-comments',
          postContent: postContent,
          userRole: role || 'Professional'
        })
      });

      const data = await response.json();
      if (data.success && data.data.suggestions) {
         // The AI might return suggestions in the 'suggestions' field or parsed from the 'answer' text
         // Our current implementation puts text in 'answer' and follow-ups in 'suggestions'
         // For this specific 'suggest-comments' action, let's parse the 'answer' if it's a list,
         // or rely on the fact that we might need to adjust the backend to return a raw array.
         // For now, let's assume the backend 'answer' contains the text.
         
         // A simple heuristic: split by newlines if it looks like a list
         const lines = data.data.answer.split('\n').filter((l: string) => l.trim().length > 0);
         // Clean up numbering (1. , - , etc.)
         const cleaned = lines.map((l: string) => l.replace(/^[\d-]+\.\s*/, '').replace(/"/g, ''));
         setAiSuggestions(cleaned.slice(0, 3));
      } else {
         // Fallback if parsing fails
         setAiSuggestions(["Great post! Thanks for sharing.", "Could you elaborate on this?", "This is very insightful."]);
      }
    } catch (error) {
      console.error('AI Suggestion error', error);
      toast({ variant: 'destructive', title: 'Could not get suggestions', description: 'Please try again.'});
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  return (
    <div className="pt-4 space-y-4">
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
            <Avatar className="w-8 h-8">
              <AvatarFallback>{comment.authorName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 bg-muted/50 p-3 rounded-lg relative group border hover:border-border/80 transition-colors">
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-sm">{comment.authorName}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
              </div>
              
              {editingCommentId === comment.id ? (
                <div className="flex flex-col gap-2 mt-2">
                  <Input 
                    value={editContent} 
                    onChange={(e) => setEditContent(e.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => setEditingCommentId(null)}>Cancel</Button>
                    <Button size="sm" onClick={() => handleEdit(comment)}>Save</Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm">{comment.content}</p>
              )}

              {user?.uid === comment.authorId && !editingCommentId && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setEditingCommentId(comment.id);
                        setEditContent(comment.content);
                      }}>
                        <Edit2 className="h-3 w-3 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(comment)}>
                        <Trash2 className="h-3 w-3 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {aiSuggestions.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {aiSuggestions.map((suggestion, idx) => (
              <Button 
                key={idx} 
                variant="outline" 
                size="sm" 
                className="text-xs h-auto py-1 whitespace-normal text-left"
                onClick={() => setNewComment(suggestion)}
              >
                <Sparkles className="w-3 h-3 mr-1 text-purple-500 flex-shrink-0" />
                {suggestion}
              </Button>
            ))}
          </div>
        )}
        
        <div className="flex gap-2 items-center">
          <Avatar className="w-8 h-8">
            <AvatarFallback>{displayName?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 flex gap-2">
             <div className="relative flex-1">
               <Input
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                disabled={isSubmitting}
                className="pr-8"
              />
               <Button 
                  size="icon" 
                  variant="ghost" 
                  className="absolute right-1 top-1 h-7 w-7 text-purple-500 hover:text-purple-600 hover:bg-purple-50"
                  onClick={handleGetAISuggestions}
                  disabled={isGeneratingSuggestions || !postContent}
                  title="Get AI Suggestions"
                >
                  {isGeneratingSuggestions ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
               </Button>
             </div>
            <Button size="icon" onClick={handleSubmit} disabled={isSubmitting || !newComment.trim()}>
              {isSubmitting ? <CornerDownRight className="h-4 w-4 animate-pulse" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
