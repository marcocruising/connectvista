import React from 'react';

interface HighlightTextProps {
  text: string;
  query: string;
}

const HighlightText: React.FC<HighlightTextProps> = ({ text, query }) => {
  if (!query.trim() || !text) return <span>{text}</span>;
  
  try {
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() 
            ? <span key={i} className="bg-yellow-100 dark:bg-yellow-800 rounded px-0.5">{part}</span> 
            : part
        )}
      </span>
    );
  } catch (e) {
    // In case of regex errors, just return the original text
    return <span>{text}</span>;
  }
};

export default HighlightText; 