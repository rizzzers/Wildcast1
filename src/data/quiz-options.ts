export interface QuizOption {
  value: string;
  label: string;
  description?: string;
}

export interface QuizQuestionDef {
  id: string;
  question: string;
  options: QuizOption[];
  multiSelect?: boolean;
}

export const quizQuestions: QuizQuestionDef[] = [
  {
    id: 'category',
    question: 'What best describes your podcast?',
    options: [
      { value: 'tech', label: 'Tech & Startups', description: 'Software, AI, venture capital, founder stories' },
      { value: 'wellness', label: 'Wellness & Health', description: 'Fitness, mental health, nutrition, mindfulness' },
      { value: 'business', label: 'Business & Finance', description: 'Entrepreneurship, investing, careers, leadership' },
      { value: 'pop-culture', label: 'Pop Culture', description: 'Movies, TV, music, celebrity news, trends' },
      { value: 'education', label: 'Education & Learning', description: 'Self-improvement, skills, how-to, academic' },
      { value: 'entertainment', label: 'Entertainment & Comedy', description: 'Comedy, storytelling, true crime, games' },
      { value: 'multi-topic', label: 'Multi-Topic / General', description: 'Variety show covering many subjects' },
    ],
  },
  {
    id: 'audienceSize',
    question: "What's your average audience reach per week?",
    options: [
      { value: 'under-10k', label: 'Under 10,000', description: 'Growing audience, building momentum' },
      { value: 'over-10k', label: '10,000+', description: 'Established audience, ready for sponsors' },
    ],
  },
  {
    id: 'listenerType',
    question: 'Who is your primary listener?',
    multiSelect: true,
    options: [
      { value: 'founders-executives', label: 'Founders & Executives', description: 'Decision makers, high earners' },
      { value: 'parents-caregivers', label: 'Parents & Caregivers', description: 'Family-focused, household buyers' },
      { value: 'creators-influencers', label: 'Creators & Influencers', description: 'Content creators, side hustlers' },
      { value: 'curious-generalists', label: 'Curious Generalists', description: 'Lifelong learners, diverse interests' },
      { value: 'health-fitness-enthusiasts', label: 'Health & Fitness Enthusiasts', description: 'Active lifestyles, wellness-driven spenders' },
      { value: 'young-professionals', label: 'Young Professionals (25–40)', description: 'Career-driven, high purchase intent' },
      { value: 'hobbyists-diy', label: 'Hobbyists & DIY Makers', description: 'Passionate niches, loyal brand advocates' },
    ],
  },
  {
    id: 'tone',
    question: "What's the vibe of your show?",
    options: [
      { value: 'tactical-serious', label: 'Tactical & Serious', description: 'Deep dives, expert analysis, actionable advice' },
      { value: 'relaxed-conversational', label: 'Relaxed & Conversational', description: 'Casual chats, friendly banter, accessible' },
      { value: 'experimental-irreverent', label: 'Experimental & Irreverent', description: 'Edgy, unconventional, boundary-pushing' },
      { value: 'inspiring-heartfelt', label: 'Inspiring & Heartfelt', description: 'Emotional, motivational, personal stories' },
    ],
  },
  {
    id: 'releaseFrequency',
    question: 'How often do you release episodes?',
    options: [
      { value: 'daily', label: 'Daily', description: '5-7 episodes per week' },
      { value: 'weekly', label: 'Weekly', description: '1 episode per week' },
      { value: 'biweekly', label: 'Biweekly', description: '1-2 episodes per month' },
    ],
  },
  {
    id: 'format',
    question: "What's your show format?",
    options: [
      { value: 'solo', label: 'Solo', description: 'Just you, sharing insights' },
      { value: 'interview', label: 'Interview', description: 'Guest conversations' },
      { value: 'panel', label: 'Panel / Co-hosts', description: 'Multiple regular hosts' },
      { value: 'mixed', label: 'Mixed', description: 'Combination of formats' },
    ],
  },
  {
    id: 'primaryGoal',
    question: "What's your primary goal right now?",
    options: [
      { value: 'sponsorships', label: 'Land Sponsorships', description: 'Ready to monetize with brand deals' },
      { value: 'grow-audience', label: 'Grow My Audience', description: 'Focus on reaching more listeners' },
      { value: 'both', label: 'Both', description: 'Grow and monetize simultaneously' },
    ],
  },
];
