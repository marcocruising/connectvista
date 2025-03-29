import { format } from 'date-fns';
import { useState } from 'react';
import { Conversation } from '@/types/crm';
import { Card, CardContent } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import TagBadge from './TagBadge';
import { Edit } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

interface ConversationTimelineProps {
  conversations: Conversation[];
  onEditConversation?: (conversation: Conversation) => void;
}

const ConversationTimeline: React.FC<ConversationTimelineProps> = ({ 
  conversations,
  onEditConversation
}) => {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Sort conversations by date (newest first)
  const sortedConversations = [...conversations].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleCardClick = (conversation: Conversation) => {
    navigate(`/conversations/${conversation.id}`);
  };

  return (
    <div className="space-y-6">
      {sortedConversations.map((conversation, index) => (
        <div key={conversation.id} className="relative pl-6 pb-6">
          {/* Timeline connector */}
          {index !== sortedConversations.length - 1 && (
            <div className="absolute left-2 top-3 bottom-0 w-0.5 bg-gray-200"></div>
          )}
          
          {/* Timeline dot */}
          <div className="absolute left-0 top-3 w-4 h-4 rounded-full bg-primary"></div>
          
          {/* Content */}
          <Card 
            className={`transition-all duration-200 ${
              hoveredId === conversation.id 
                ? 'shadow-md ring-1 ring-primary/20 cursor-pointer' 
                : 'hover:shadow-md'
            }`}
            onMouseEnter={() => setHoveredId(conversation.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => handleCardClick(conversation)}
          >
            <CardContent className="pt-6 relative">
              {/* Edit button that appears on hover */}
              {hoveredId === conversation.id && onEditConversation && (
                <div className="absolute top-2 right-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditConversation(conversation);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit conversation</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
              
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium hover:text-blue-600">
                  {conversation.title}
                </h3>
                <span className="text-sm text-gray-500">
                  {format(new Date(conversation.date), 'MMM d, yyyy')}
                </span>
              </div>
              
              {conversation.tags && conversation.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {conversation.tags.map(tag => (
                    <TagBadge key={tag.id} tag={tag} size="sm" />
                  ))}
                </div>
              )}
              
              <p className="text-sm text-gray-700 mb-2">{conversation.summary}</p>
              
              {conversation.nextSteps && (
                <div className="text-sm">
                  <span className="font-medium">Next Steps: </span>
                  {conversation.nextSteps}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default ConversationTimeline; 