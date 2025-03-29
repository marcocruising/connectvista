import React from 'react';
import { Tag } from '@/types/crm';

interface TagBadgeProps {
  tag: Tag;
  size?: 'sm' | 'md' | 'lg';
}

const TagBadge: React.FC<TagBadgeProps> = ({ tag, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full ${sizeClasses[size]} font-medium text-white mr-1`}
      style={{ backgroundColor: tag.color }}
    >
      {tag.name}
    </span>
  );
};

export default TagBadge;
