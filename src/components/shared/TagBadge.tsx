
import React from 'react';
import { Tag } from '@/types/crm';

interface TagBadgeProps {
  tag: Tag;
}

const TagBadge: React.FC<TagBadgeProps> = ({ tag }) => {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white mr-1"
      style={{ backgroundColor: tag.color }}
    >
      {tag.name}
    </span>
  );
};

export default TagBadge;
