'use client';

import { useState, useEffect } from 'react';

interface FollowButtonProps {
  comicId: string;
  comicName: string;
  comicSlug: string;
  comicThumb: string;
  isFollowing: boolean;
  onFollow: (formData: FormData) => Promise<void>;
}

export default function FollowButton({ 
  comicId, 
  comicName, 
  comicSlug, 
  comicThumb, 
  isFollowing, 
  onFollow 
}: FollowButtonProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [isFollowingState, setIsFollowingState] = useState(isFollowing);

  // Cập nhật state khi prop thay đổi
  useEffect(() => {
    setIsFollowingState(isFollowing);
  }, [isFollowing]);

  // Xử lý hiển thị popup thông báo
  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  };

  // Xử lý khi submit form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await onFollow(formData);
    
    // Hiển thị thông báo và cập nhật state
    const newFollowState = !isFollowingState;
    setIsFollowingState(newFollowState);
    showMessage(newFollowState ? `Đã theo dõi truyện ${comicName}` : `Đã bỏ theo dõi truyện ${comicName}`);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="mt-4">
        <input type="hidden" name="comicId" value={comicId} />
        <input type="hidden" name="comicName" value={comicName} />
        <input type="hidden" name="comicSlug" value={comicSlug} />
        <input type="hidden" name="comicThumb" value={comicThumb} />
        <button
          type="submit"
          className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
            isFollowingState
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isFollowingState ? 'Bỏ theo dõi' : 'Theo dõi'}
        </button>
      </form>

      {/* Popup thông báo */}
      {message && (
        <div className="fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          {message}
        </div>
      )}
    </>
  );
} 