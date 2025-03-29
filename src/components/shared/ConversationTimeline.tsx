import { format } from 'date-fns';
import { Conversation } from '@/types/crm';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import TagBadge from './TagBadge';

interface ConversationTimelineProps {
  conversations: Conversation[];
}

const ConversationTimeline: React.FC<ConversationTimelineProps> = ({ conversations }) => {
  // Sort conversations by date (newest first)
  const sortedConversations = [...conversations].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

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
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-2">
                <Link to={`/conversations/${conversation.id}`} className="font-medium hover:text-blue-600">
                  {conversation.title}
                </Link>
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