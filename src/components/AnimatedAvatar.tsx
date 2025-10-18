import React from 'react';

interface AnimatedAvatarProps {
  src?: string;
  alt?: string;
  className?: string;
}

const AnimatedAvatar: React.FC<AnimatedAvatarProps> = ({ 
  src, 
  alt = "Avatar", 
  className = "" 
}) => {
  return (
    <div className={`w-10 h-10 rounded-full overflow-hidden ${className}`}>
      <img 
        src={src || "/placeholder.svg"} 
        alt={alt}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default AnimatedAvatar;