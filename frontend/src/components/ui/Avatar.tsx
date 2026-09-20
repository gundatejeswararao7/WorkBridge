import React from 'react';

interface AvatarProps {
  url?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ 
  url, 
  name = '', 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
  };

  const getInitials = (str: string) => {
    if (!str) return 'U';
    return str.charAt(0).toUpperCase();
  };

  return (
    <div 
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden bg-indigo-100 flex-shrink-0 ${sizeClasses[size]} ${className}`}
    >
      {url ? (
        <img 
          src={url} 
          alt={name} 
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="font-medium text-indigo-700">
          {getInitials(name)}
        </span>
      )}
    </div>
  );
};
