import React from 'react';
import { useCRMStore } from '@/store/crmStore';
import { Button } from '@/components/ui/button';

const TagFilter = () => {
  const { tags, selectedTags, setSelectedTags } = useCRMStore();
  
  const handleTagClick = (tagId: string) => {
    setSelectedTags(
      selectedTags.includes(tagId)
        ? selectedTags.filter(id => id !== tagId)
        : [...selectedTags, tagId]
    );
  };
  
  const clearFilters = () => {
    setSelectedTags([]);
  };
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Filter by Tags</h3>
        {selectedTags.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Clear
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Button
            key={tag.id}
            variant={selectedTags.includes(tag.id) ? "default" : "outline"}
            size="sm"
            onClick={() => handleTagClick(tag.id)}
            style={{
              backgroundColor: selectedTags.includes(tag.id) ? tag.color : 'transparent',
              borderColor: tag.color,
              color: selectedTags.includes(tag.id) ? 'white' : tag.color,
            }}
          >
            {tag.name}
          </Button>
        ))}
        {tags.length === 0 && (
          <p className="text-gray-400 text-sm">No tags available</p>
        )}
      </div>
    </div>
  );
};

export default TagFilter; 