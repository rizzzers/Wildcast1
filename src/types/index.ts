export type PodcastCategory =
  | 'tech'
  | 'wellness'
  | 'business'
  | 'pop-culture'
  | 'education'
  | 'entertainment'
  | 'multi-topic';

export type AudienceSize = 'under-10k' | 'over-10k';

export type ListenerType =
  | 'founders-executives'
  | 'parents-caregivers'
  | 'creators-influencers'
  | 'curious-generalists'
  | 'health-fitness-enthusiasts'
  | 'young-professionals'
  | 'hobbyists-diy';

export type PodcastTone =
  | 'tactical-serious'
  | 'relaxed-conversational'
  | 'experimental-irreverent'
  | 'inspiring-heartfelt';

export type ReleaseFrequency = 'daily' | 'weekly' | 'biweekly';

export type PodcastFormat = 'solo' | 'interview' | 'panel' | 'mixed';

export type PrimaryGoal = 'sponsorships' | 'grow-audience' | 'both';

export interface QuizAnswers {
  category?: PodcastCategory;
  audienceSize?: AudienceSize;
  listenerType?: ListenerType | ListenerType[];
  tone?: PodcastTone;
  releaseFrequency?: ReleaseFrequency;
  format?: PodcastFormat;
  primaryGoal?: PrimaryGoal;
}

export interface PodcastInfo {
  email: string;
  podcastName: string;
  podcastUrl: string;
  description: string;
  hasMediaKit: boolean;
}

export interface Sponsor {
  id: string;
  brandName: string;
  description: string;
  contactName: string;
  role: string;
  email: string;
  phone: string;
  linkedin: string;
  category: string;
  budgetRange: string;
  audiencePreferences: string[];
  preferredCategories: PodcastCategory[];
  preferredTones: PodcastTone[];
  preferredFormats: PodcastFormat[];
}

export interface SponsorMatch extends Sponsor {
  matchScore: number;
  matchReasons: string[];
}

export interface GrowthPlan {
  crossPromoShows: string[];
  guestingOpportunities: string[];
  distributionStrategies: string[];
}

export type AppStep = 'landing' | 'quiz' | 'email-gate' | 'results' | 'growth-plan' | 'consultation';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  image?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SurveySubmission {
  id: string;
  user_id: string | null;
  category: string | null;
  audience_size: string | null;
  listener_type: string | null;
  tone: string | null;
  release_frequency: string | null;
  format: string | null;
  primary_goal: string | null;
  email: string | null;
  podcast_name: string | null;
  podcast_url: string | null;
  description: string | null;
  has_media_kit: number;
  created_at: string;
  updated_at: string;
}
