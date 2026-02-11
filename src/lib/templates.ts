import { SponsorMatch, QuizAnswers, PodcastInfo } from '@/types';

export interface EmailDraft {
  id: string;
  name: string;
  content: string;
}

export function generateEmailTemplates(
  sponsor: SponsorMatch,
  quizAnswers: QuizAnswers,
  podcastInfo: PodcastInfo
): EmailDraft[] {
  const audienceDesc = quizAnswers.listenerType
    ?.replace('-', ' ')
    .replace('founders', 'founders and executives')
    .replace('parents', 'parents and caregivers')
    .replace('creators', 'creators and influencers')
    .replace('curious', 'curious generalists') || 'engaged listeners';

  const formal: EmailDraft = {
    id: 'formal',
    name: 'Professional',
    content: `Hi ${sponsor.contactName},

I'm the host of ${podcastInfo.podcastName}, and I believe there's a strong alignment between ${sponsor.brandName} and my audience.

${podcastInfo.description ? `About my show: ${podcastInfo.description}\n\n` : ''}My podcast focuses on ${quizAnswers.category?.replace('-', ' ')} content with a ${quizAnswers.tone?.replace('-', ' ')} tone. We release episodes ${quizAnswers.releaseFrequency} and have built an engaged audience of ${audienceDesc}.

I'd love to explore a sponsorship partnership with ${sponsor.brandName}. ${podcastInfo.hasMediaKit ? 'I have a media kit ready to share.' : ''}

Would you be open to a brief call to discuss?

Best regards,
[Your Name]

Listen: ${podcastInfo.podcastUrl}`,
  };

  const casual: EmailDraft = {
    id: 'casual',
    name: 'Casual',
    content: `Hey ${sponsor.contactName}!

I host ${podcastInfo.podcastName} and I'm a big fan of what ${sponsor.brandName} is doing.

${podcastInfo.description ? `Quick background: ${podcastInfo.description}\n\n` : ''}My show is all about ${quizAnswers.category?.replace('-', ' ')} with a ${quizAnswers.tone?.replace('-', ' ')} vibe. I think your brand would really resonate with my listeners - they're mostly ${audienceDesc} who tune in ${quizAnswers.releaseFrequency}.

Would love to chat about a potential sponsorship. Got 15 minutes this week?

Cheers,
[Your Name]

${podcastInfo.podcastUrl}`,
  };

  return [formal, casual];
}

export function getEmailSubject(
  sponsor: SponsorMatch,
  podcastInfo: PodcastInfo
): string {
  return `Podcast Sponsorship Opportunity - ${podcastInfo.podcastName}`;
}
