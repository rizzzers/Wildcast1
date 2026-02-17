'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Modal } from './Modal';
import { SponsorMatch, QuizAnswers, PodcastInfo } from '@/types';
import { generateEmailTemplates, getEmailSubject, EmailDraft, EmailContext } from '@/lib/templates';

const SAVED_TEMPLATES_KEY = 'wildcast_saved_templates';

interface SavedTemplate {
  id: string;
  name: string;
  content: string; // stored with placeholders
}

function toPlaceholders(text: string, sponsor: SponsorMatch, podcastInfo: PodcastInfo): string {
  let result = text;
  if (sponsor.contactName) result = result.replaceAll(sponsor.contactName, '{{contactName}}');
  if (sponsor.brandName) result = result.replaceAll(sponsor.brandName, '{{brandName}}');
  if (podcastInfo.podcastName) result = result.replaceAll(podcastInfo.podcastName, '{{podcastName}}');
  if (podcastInfo.podcastUrl) result = result.replaceAll(podcastInfo.podcastUrl, '{{podcastUrl}}');
  return result;
}

function fromPlaceholders(text: string, sponsor: SponsorMatch, podcastInfo: PodcastInfo): string {
  return text
    .replaceAll('{{contactName}}', sponsor.contactName)
    .replaceAll('{{brandName}}', sponsor.brandName)
    .replaceAll('{{podcastName}}', podcastInfo.podcastName)
    .replaceAll('{{podcastUrl}}', podcastInfo.podcastUrl);
}

function loadSavedTemplates(): SavedTemplate[] {
  try {
    const raw = localStorage.getItem(SAVED_TEMPLATES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistSavedTemplates(templates: SavedTemplate[]) {
  localStorage.setItem(SAVED_TEMPLATES_KEY, JSON.stringify(templates));
}

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
  const { data: session } = useSession();
  const [drafts, setDrafts] = useState<EmailDraft[]>([]);
  const [selectedDraftId, setSelectedDraftId] = useState<string>('');
  const [emailContext, setEmailContext] = useState<EmailContext | null>(null);
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [saveTemplateName, setSaveTemplateName] = useState('');

  // Load email context from profile when authenticated
  useEffect(() => {
    if (session?.user?.id && !emailContext) {
      fetch('/api/user/profile')
        .then((res) => res.json())
        .then((data) => {
          if (data.emailContext) setEmailContext(data.emailContext);
        })
        .catch(() => {});
    }
  }, [session, emailContext]);

  // Load saved templates from localStorage on mount
  useEffect(() => {
    setSavedTemplates(loadSavedTemplates());
  }, []);

  const buildDrafts = useCallback(() => {
    const builtIn = generateEmailTemplates(sponsor, quizAnswers, podcastInfo, emailContext);
    const saved: EmailDraft[] = savedTemplates.map((t) => ({
      id: `saved-${t.id}`,
      name: t.name,
      content: fromPlaceholders(t.content, sponsor, podcastInfo),
    }));
    return [...builtIn, ...saved];
  }, [sponsor, quizAnswers, podcastInfo, emailContext, savedTemplates]);

  useEffect(() => {
    if (isOpen) {
      const allDrafts = buildDrafts();
      setDrafts(allDrafts);
      setSelectedDraftId(allDrafts[0]?.id || '');
      setShowSaveInput(false);
      setSaveTemplateName('');
    }
  }, [isOpen, buildDrafts]);

  const updateDraft = (id: string, content: string) => {
    setDrafts((prev) =>
      prev.map((draft) => (draft.id === id ? { ...draft, content } : draft))
    );
  };

  const selectedDraft = drafts.find((d) => d.id === selectedDraftId);
  const currentMessage = selectedDraft?.content || '';
  const isSelectedSaved = selectedDraftId.startsWith('saved-');

  const handleSaveTemplate = () => {
    const name = saveTemplateName.trim();
    if (!name || !selectedDraft) return;

    const newTemplate: SavedTemplate = {
      id: Date.now().toString(),
      name,
      content: toPlaceholders(selectedDraft.content, sponsor, podcastInfo),
    };
    const updated = [...savedTemplates, newTemplate];
    setSavedTemplates(updated);
    persistSavedTemplates(updated);

    // Rebuild drafts and select the new one
    const builtIn = generateEmailTemplates(sponsor, quizAnswers, podcastInfo, emailContext);
    const savedDrafts: EmailDraft[] = updated.map((t) => ({
      id: `saved-${t.id}`,
      name: t.name,
      content: fromPlaceholders(t.content, sponsor, podcastInfo),
    }));
    setDrafts([...builtIn, ...savedDrafts]);
    setSelectedDraftId(`saved-${newTemplate.id}`);
    setShowSaveInput(false);
    setSaveTemplateName('');
  };

  const handleDeleteSavedTemplate = (savedId: string) => {
    const updated = savedTemplates.filter((t) => `saved-${t.id}` !== savedId);
    setSavedTemplates(updated);
    persistSavedTemplates(updated);

    const allDrafts = drafts.filter((d) => d.id !== savedId);
    setDrafts(allDrafts);
    if (selectedDraftId === savedId) {
      setSelectedDraftId(allDrafts[0]?.id || '');
    }
  };

  const handleSend = async () => {
    const emailSubject = getEmailSubject(sponsor, podcastInfo);
    const subject = encodeURIComponent(emailSubject);
    const body = encodeURIComponent(currentMessage);
    window.open(`mailto:${sponsor.email}?subject=${subject}&body=${body}`);

    // Persist outreach if authenticated
    if (session?.user?.id) {
      try {
        await fetch('/api/outreach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sponsorId: sponsor.id,
            brandName: sponsor.brandName,
            contactName: sponsor.contactName,
            contactEmail: sponsor.email,
            contactRole: sponsor.role,
            templateUsed: selectedDraftId,
            emailSubject,
            emailContent: currentMessage,
          }),
        });
      } catch (error) {
        console.error('Failed to track outreach:', error);
      }
    }

    onSend();
    onClose();
  };

  const title = `Email ${sponsor.contactName} at ${sponsor.brandName}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="3xl">
      <div className="space-y-4">
        <div className="text-sm text-gray-400">
          Choose a template and edit your email. Clicking Send will open your email client.
        </div>

        <div className="space-y-4">
          {/* Template selector tabs */}
          <div className="flex gap-2 border-b border-[var(--border)] overflow-x-auto">
            {drafts.map((draft) => (
              <button
                key={draft.id}
                onClick={() => setSelectedDraftId(draft.id)}
                className={`group flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
                  selectedDraftId === draft.id
                    ? 'border-[var(--primary)] text-[var(--primary)]'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {draft.name}
                {draft.id.startsWith('saved-') && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSavedTemplate(draft.id);
                    }}
                    className="ml-1 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"
                    title="Delete saved template"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Single large editor for selected draft */}
          {selectedDraft && (
            <div className="space-y-2">
              <textarea
                value={selectedDraft.content}
                onChange={(e) => updateDraft(selectedDraft.id, e.target.value)}
                className="w-full h-[50vh] p-4 text-sm leading-relaxed border border-[var(--border)] rounded-xl bg-[var(--background)] resize-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-colors"
                placeholder="Write your message..."
              />
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  {selectedDraft.content.length} characters
                </div>

                {/* Save template controls */}
                {showSaveInput ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={saveTemplateName}
                      onChange={(e) => setSaveTemplateName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveTemplate()}
                      placeholder="Template name..."
                      autoFocus
                      className="px-3 py-1.5 text-sm border border-[var(--border)] rounded-lg bg-[var(--background)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none"
                    />
                    <button
                      onClick={handleSaveTemplate}
                      disabled={!saveTemplateName.trim()}
                      className="px-3 py-1.5 text-sm bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 rounded-lg font-medium transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => { setShowSaveInput(false); setSaveTemplateName(''); }}
                      className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSaveInput(true)}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    {isSelectedSaved ? 'Save as New Template' : 'Save as Template'}
                  </button>
                )}
              </div>
            </div>
          )}
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
            {sponsor.linkedin && (
              <a
                href={sponsor.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 border border-[var(--border)] hover:bg-[var(--card-hover)] rounded-lg font-medium transition-colors flex items-center gap-2 text-blue-400"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                Connect on LinkedIn
              </a>
            )}
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
