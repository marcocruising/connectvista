import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { RemindersPanel } from '@/components/shared/RemindersPanel';
import { Card } from '@/components/ui/card';

const Reminders: React.FC = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Reminders"
        description="Keep track of your follow-ups and upcoming tasks"
      />
      
      <Card className="p-6">
        <RemindersPanel />
      </Card>
    </div>
  );
};

export default Reminders; 