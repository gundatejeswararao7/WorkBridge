import React, { useState } from 'react';

interface AvatarProps {
  url?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  url,
  name = '',
  size = 'md',
  className = ''
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-xl',
  };

  const getInitials = (str: string) => {
    if (!str) return 'U';
    const parts = str.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return str.charAt(0).toUpperCase();
  };

  const showImage = url && !imgError;

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 flex-shrink-0 ${sizeClasses[size]} ${className}`}
    >
      {showImage ? (
        <img
          src={url}
          alt={name}
          className="w-full h-full object-cover"
          crossOrigin="anonymous"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="font-semibold text-indigo-700 select-none">
          {getInitials(name)}
        </span>
      )}
    </div>
  );
};
