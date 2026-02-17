import { SponsorMatch, QuizAnswers, PodcastInfo } from '@/types';

export interface EmailDraft {
  id: string;
  name: string;
  content: string;
}

export interface EmailContext {
  unique_value_prop?: string | null;
  past_sponsors?: string | null;
  audience_demographics?: string | null;
  notable_guests?: string | null;
  additional_notes?: string | null;
}

export function generateEmailTemplates(
  sponsor: SponsorMatch,
  quizAnswers: QuizAnswers,
  podcastInfo: PodcastInfo,
  emailContext?: EmailContext | null
): EmailDraft[] {
  const listenerTypes = Array.isArray(quizAnswers.listenerType)
    ? quizAnswers.listenerType
    : quizAnswers.listenerType ? [quizAnswers.listenerType] : [];
  const audienceDesc = listenerTypes.length > 0
    ? listenerTypes.map(t => t.replace(/-/g, ' ')).join(', ')
    : 'engaged listeners';

  // Build context paragraphs from email context
  const contextLines: string[] = [];
  if (emailContext?.unique_value_prop) {
    contextLines.push(emailContext.unique_value_prop);
  }
  if (emailContext?.audience_demographics) {
    contextLines.push(`Our audience: ${emailContext.audience_demographics}`);
  }
  if (emailContext?.past_sponsors) {
    contextLines.push(`We've previously worked with ${emailContext.past_sponsors}.`);
  }
  if (emailContext?.notable_guests) {
    contextLines.push(emailContext.notable_guests);
  }
  if (emailContext?.additional_notes) {
    contextLines.push(emailContext.additional_notes);
  }
  const contextBlock = contextLines.length > 0 ? contextLines.join(' ') + '\n\n' : '';

  const formal: EmailDraft = {
    id: 'formal',
    name: 'Professional',
    content: `Hi ${sponsor.contactName},

I'm the host of ${podcastInfo.podcastName}, and I believe there's a strong alignment between ${sponsor.brandName} and my audience.

${podcastInfo.description ? `About my show: ${podcastInfo.description}\n\n` : ''}My podcast focuses on ${quizAnswers.category?.replace('-', ' ')} content with a ${quizAnswers.tone?.replace('-', ' ')} tone. We release episodes ${quizAnswers.releaseFrequency} and have built an engaged audience of ${audienceDesc}.

${contextBlock}I'd love to explore a sponsorship partnership with ${sponsor.brandName}. ${podcastInfo.hasMediaKit ? 'I have a media kit ready to share.' : ''}

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

${contextBlock}Would love to chat about a potential sponsorship. Got 15 minutes this week?

Cheers,
[Your Name]

${podcastInfo.podcastUrl}`,
  };

  const followUp: EmailDraft = {
    id: 'follow-up',
    name: 'Follow-Up',
    content: `Hi ${sponsor.contactName},

I reached out recently about a potential sponsorship between ${sponsor.brandName} and my podcast, ${podcastInfo.podcastName}. I wanted to follow up in case my previous message got buried.

${podcastInfo.description ? `A quick refresher: ${podcastInfo.description}\n\n` : ''}We cover ${quizAnswers.category?.replace('-', ' ')} content for an audience of ${audienceDesc}, and I think there's a natural fit with ${sponsor.brandName}.

${contextBlock}I'd love to find 15 minutes to chat about how we could work together. Would any time this week or next work for you?

Best,
[Your Name]

${podcastInfo.podcastUrl}`,
  };

  const dataDriven: EmailDraft = {
    id: 'data-driven',
    name: 'Value Prop',
    content: `Hi ${sponsor.contactName},

I'm reaching out because I see a strong opportunity for ${sponsor.brandName} to connect with a highly engaged audience through my podcast, ${podcastInfo.podcastName}.

${podcastInfo.description ? `About the show: ${podcastInfo.description}\n\n` : ''}Here's what makes this a great fit:
- Audience: ${audienceDesc} who tune in ${quizAnswers.releaseFrequency}
- Category: ${quizAnswers.category?.replace('-', ' ')} with a ${quizAnswers.tone?.replace('-', ' ')} tone
- Format: ${quizAnswers.format} episodes${podcastInfo.hasMediaKit ? '\n- Full media kit available on request' : ''}

${contextBlock}I'd be happy to share listener demographics, download numbers, and past campaign results. Would you be open to a quick conversation?

Best regards,
[Your Name]

${podcastInfo.podcastUrl}`,
  };

  const linkedInFollowUp: EmailDraft = {
    id: 'linkedin',
    name: 'LinkedIn Follow-Up',
    content: `Hi ${sponsor.contactName},

I recently reached out via email about a potential sponsorship between ${sponsor.brandName} and my podcast, ${podcastInfo.podcastName}. I wanted to connect here as well.

${podcastInfo.description ? `Quick intro: ${podcastInfo.description}\n\n` : ''}My show covers ${quizAnswers.category?.replace('-', ' ')} for an audience of ${audienceDesc}, and I think there's a natural fit with what ${sponsor.brandName} is doing.

Would love to connect and explore how we might work together. Happy to share more details anytime.

Best,
[Your Name]`,
  };

  return [formal, casual, followUp, dataDriven, linkedInFollowUp];
}

export function getEmailSubject(
  sponsor: SponsorMatch,
  podcastInfo: PodcastInfo
): string {
  return `Podcast Sponsorship Opportunity - ${podcastInfo.podcastName}`;
}
