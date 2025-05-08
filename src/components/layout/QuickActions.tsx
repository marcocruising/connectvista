import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { IndividualForm } from '@/components/forms/IndividualForm';
import { CompanyForm } from '@/components/forms/CompanyForm';
import { ConversationForm } from '@/components/forms/ConversationForm';
import { toast } from 'sonner';

type ActionType = 'individual' | 'company' | 'conversation' | null;

export const useQuickActions = () => {
  const [activeAction, setActiveAction] = useState<ActionType>(null);

  const openAction = (action: ActionType) => {
    setActiveAction(action);
  };

  const closeAction = () => {
    setActiveAction(null);
  };

  return {
    activeAction,
    openAction,
    closeAction
  };
};

const actionTitles = {
  individual: 'Add Individual',
  company: 'Add Company',
  conversation: 'Add Conversation'
};

const actionDescriptions = {
  individual: 'Add a new contact to your CRM',
  company: 'Add a new company to your CRM',
  conversation: 'Log a new conversation with a contact or company'
};

interface QuickActionsProps {
  activeAction: ActionType;
  closeAction: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ 
  activeAction, 
  closeAction 
}) => {
  const handleSuccess = () => {
    const action = activeAction || '';
    toast.success(`${action.charAt(0).toUpperCase() + action.slice(1)} added successfully`);
    closeAction();
  };

  return (
    <Dialog open={activeAction !== null} onOpenChange={(open) => !open && closeAction()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {activeAction ? actionTitles[activeAction] : ''}
          </DialogTitle>
          <DialogDescription>
            {activeAction ? actionDescriptions[activeAction] : ''}
          </DialogDescription>
        </DialogHeader>

        {activeAction === 'individual' && (
          <IndividualForm onSuccess={handleSuccess} bucketId={"REPLACE_WITH_REAL_BUCKET_ID"} />
        )}
        
        {activeAction === 'company' && (
          <CompanyForm onSuccess={handleSuccess} />
        )}
        
        {activeAction === 'conversation' && (
          <ConversationForm onSuccess={handleSuccess} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuickActions; 