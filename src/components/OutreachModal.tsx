'use client';

import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { SponsorMatch, QuizAnswers, PodcastInfo } from '@/types';
import { generateEmailTemplates, getEmailSubject, EmailDraft } from '@/lib/templates';

interface OutreachModalProps {
  isOpen: boolean;
  onClose: () => void;
  sponsor: SponsorMatch;
  quizAnswers: QuizAnswers;
  podcastInfo: PodcastInfo;
  onSend: () => void;
}

export function OutreachModal({
  isOpen,
  onClose,
  sponsor,
  quizAnswers,
  podcastInfo,
  onSend,
}: OutreachModalProps) {
  const [drafts, setDrafts] = useState<EmailDraft[]>([]);
  const [selectedDraftId, setSelectedDraftId] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const emailDrafts = generateEmailTemplates(sponsor, quizAnswers, podcastInfo);
      setDrafts(emailDrafts);
      setSelectedDraftId(emailDrafts[0]?.id || '');
    }
  }, [isOpen, sponsor, quizAnswers, podcastInfo]);

  const updateDraft = (id: string, content: string) => {
    setDrafts((prev) =>
      prev.map((draft) => (draft.id === id ? { ...draft, content } : draft))
    );
  };

  const selectedDraft = drafts.find((d) => d.id === selectedDraftId);
  const currentMessage = selectedDraft?.content || '';

  const handleSend = () => {
    const subject = encodeURIComponent(getEmailSubject(sponsor, podcastInfo));
    const body = encodeURIComponent(currentMessage);
    window.open(`mailto:${sponsor.email}?subject=${subject}&body=${body}`);
    onSend();
    onClose();
  };

  const title = `Email ${sponsor.contactName} at ${sponsor.brandName}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="xl">
      <div className="space-y-4">
        <div className="text-sm text-gray-400">
          Choose a template and edit your email. Clicking Send will open your email client.
        </div>

        <div className="space-y-4">
          {/* Tab buttons */}
          <div className="flex gap-2 border-b border-[var(--border)]">
            {drafts.map((draft) => (
              <button
                key={draft.id}
                onClick={() => setSelectedDraftId(draft.id)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  selectedDraftId === draft.id
                    ? 'border-[var(--primary)] text-[var(--primary)]'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {draft.name}
              </button>
            ))}
          </div>

          {/* Dual draft panels */}
          <div className="grid grid-cols-2 gap-4">
            {drafts.map((draft) => (
              <div key={draft.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-300">
                    {draft.name}
                  </span>
                  {selectedDraftId === draft.id && (
                    <span className="text-xs bg-[var(--primary)]/20 text-[var(--primary)] px-2 py-0.5 rounded">
                      Selected
                    </span>
                  )}
                </div>
                <textarea
                  value={draft.content}
                  onChange={(e) => updateDraft(draft.id, e.target.value)}
                  onClick={() => setSelectedDraftId(draft.id)}
                  className={`w-full h-64 p-3 text-sm border rounded-xl bg-[var(--background)] resize-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-colors ${
                    selectedDraftId === draft.id
                      ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]'
                      : 'border-[var(--border)]'
                  }`}
                  placeholder="Write your message..."
                />
                <div className="text-xs text-gray-500">
                  {draft.content.length} characters
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-gray-400">
            {selectedDraft ? `Sending: ${selectedDraft.name} template` : ''}
          </span>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:bg-[var(--background)] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!currentMessage.trim()}
              className="px-6 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Send Email
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
