'use client';

import { Consultation } from '@/components/Consultation';

export default function ConsultationPreview() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Consultation quizAnswers={{ category: 'entertainment', format: 'interview', audienceSize: 'under-10k' }} />
    </div>
  );
}
