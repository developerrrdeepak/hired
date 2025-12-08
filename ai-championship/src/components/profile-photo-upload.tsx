'use client';

import { useState, useRef } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from 'firebase/auth'; // Import updateProfile
import { useFirebase } from '@/firebase'; // Import useFirebase
import { doc, updateDoc } from 'firebase/firestore'; // Import firestore functions

// Compress image before upload
async function compressImage(file: File, maxWidth = 800, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Compression failed'));
        }, 'image/jpeg', quality);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

interface ProfilePhotoUploadProps {
  userId: string;
  currentPhotoUrl?: string;
  displayName?: string;
  storage?: any;
  onUploadComplete: (photoUrl: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function ProfilePhotoUpload({
  userId,
  currentPhotoUrl,
  displayName,
  storage: propStorage,
  onUploadComplete,
  size = 'md',
}: ProfilePhotoUploadProps) {
  const [photoPreview, setPhotoPreview] = useState(currentPhotoUrl || '');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Use hook to get auth/firestore just in case we need to update user profile directly too
  const { auth, firestore, storage: hookStorage } = useFirebase();
  const activeStorage = propStorage || hookStorage;

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32',
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!activeStorage) {
        toast({
            title: 'Storage not initialized',
            description: 'Please reload the page.',
            variant: 'destructive',
        });
        return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file (JPG, PNG, etc.)',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);

    // Upload to Firebase Storage
    setUploading(true);
    try {
      // Compress image before upload
      const compressedBlob = await compressImage(file);
      
      const photoRef = ref(activeStorage, `profiles/${userId}/photo_${Date.now()}.jpg`);
      const uploadResult = await uploadBytes(photoRef, compressedBlob);
      const downloadUrl = await getDownloadURL(uploadResult.ref);

      // Update preview with permanent URL
      setPhotoPreview(downloadUrl);
      
      // Attempt to update Firebase Auth Profile directly if user is logged in
      if (auth?.currentUser) {
          try {
             await updateProfile(auth.currentUser, { photoURL: downloadUrl });
          } catch(e) {
             console.warn("Could not update auth profile directly", e);
          }
      }

      // Attempt to update Firestore User Document if possible
      if (firestore) {
          try {
              // Try 'users' collection first, or 'candidates'/'employers' based on your schema
              // Since we don't know exact role here easily without context, we'll try a generic update if path is known
              // But safe to just let onUploadComplete handle the db update if logic resides there.
              // However, let's try updating a common collection if exists.
              const userRef = doc(firestore, 'users', userId);
              await updateDoc(userRef, { photoURL: downloadUrl, updatedAt: new Date().toISOString() }).catch(() => {});
          } catch(e) {
              // Ignore if document doesn't exist
          }
      }
      
      // Notify parent component
      onUploadComplete(downloadUrl);

      toast({
        title: 'Photo uploaded!',
        description: 'Your profile photo has been updated.',
      });

      // Clean up preview URL
      URL.revokeObjectURL(previewUrl);
    } catch (error: any) {
      console.error('Photo upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload photo. Please try again.',
        variant: 'destructive',
      });
      // Revert to original photo on error
      setPhotoPreview(currentPhotoUrl || '');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar className={`${sizeClasses[size]} border-2 border-border`}>
          <AvatarImage src={photoPreview} alt={displayName} />
          <AvatarFallback className="text-2xl">
            {displayName?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
        )}
      </div>
      
      <div className="flex flex-col gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
          disabled={uploading}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Camera className="h-4 w-4 mr-2" />
              Change Photo
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
          JPG, PNG (max 5MB)
        </p>
      </div>
    </div>
  );
}
