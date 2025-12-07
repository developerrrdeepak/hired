'use client';

import { UniversalAIChat } from '@/components/universal-ai-chat';
import { PageHeader } from '@/components/page-header';

export default function AIAssistantPage() {
  return (
    <div className="flex-1 space-y-6 py-6 p-4 md:p-8 pt-6">
      <PageHeader
        title="Universal AI Assistant"
        description="Your intelligent companion for coding, debugging, and recruitment tasks."
      />
      <div className="flex justify-center">
        <div className="w-full max-w-5xl">
          <UniversalAIChat />
        </div>
      </div>
    </div>
  );
}
