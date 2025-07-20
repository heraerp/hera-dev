'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AITutorInterface from '@/components/education/AITutorInterface';
import { ArrowLeft } from 'lucide-react';

// Demo student ID for "Future Business Leader"
const DEMO_STUDENT_ID = '60f7e16a-65c2-4ee9-b206-24110a1b9983';
const DEMO_ORG_ID = '803c33bc-add0-4ad8-8d22-9511a049223a';

export default function AITutorPage() {
  const router = useRouter();

  const handleTopicSelect = (topic: string) => {
    console.log('Selected topic for learning:', topic);
    // Could navigate to a specific topic learning page
    // or trigger additional AI interactions
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Back Navigation */}
      <div className="fixed top-4 left-4 z-40">
        <button
          onClick={() => router.push('/education')}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg border border-white/20 text-white transition-all duration-300"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* AI Tutor Interface */}
      <AITutorInterface 
        studentId={DEMO_STUDENT_ID}
        organizationId={DEMO_ORG_ID}
        onTopicSelect={handleTopicSelect}
      />
    </div>
  );
}