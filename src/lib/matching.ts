import { Sponsor, SponsorMatch, QuizAnswers, GrowthPlan } from '@/types';
import { sponsors } from '@/data/sponsors';

export function matchSponsors(answers: QuizAnswers): SponsorMatch[] {
  const matches: SponsorMatch[] = sponsors.map((sponsor) => {
    let score = 0;
    const reasons: string[] = [];

    // Category match (up to 40 points)
    if (answers.category && sponsor.preferredCategories.includes(answers.category)) {
      score += 40;
      reasons.push(`Matches ${answers.category.replace('-', ' ')} category`);
    } else if (answers.category === 'multi-topic') {
      // Multi-topic shows get partial credit
      score += 20;
      reasons.push('Appeals to diverse audiences');
    }

    // Tone match (up to 30 points)
    if (answers.tone && sponsor.preferredTones.includes(answers.tone)) {
      score += 30;
      reasons.push(`${answers.tone.replace('-', ' ')} tone fits brand`);
    }

    // Format match (up to 20 points)
    if (answers.format && sponsor.preferredFormats.includes(answers.format)) {
      score += 20;
      reasons.push(`${answers.format} format aligns`);
    }

    // Listener type bonus (up to 10 points)
    const listenerMatchMap: Record<string, string[]> = {
      'founders-executives': ['Knowledge workers', 'Entrepreneurs', 'Decision makers', 'Team leaders', 'Ambitious professionals'],
      'parents-caregivers': ['Parents', 'Busy families', 'Health-conscious consumers'],
      'creators-influencers': ['Creators', 'Side hustlers', 'Content creators'],
      'curious-generalists': ['Lifelong learners', 'Multitaskers', 'Self-improvement focused'],
      'health-fitness-enthusiasts': ['Athletes', 'Fitness enthusiasts', 'Health-conscious consumers', 'Active lifestyle'],
      'young-professionals': ['Young professionals', 'Career-driven', 'Millennials', 'Ambitious professionals'],
      'hobbyists-diy': ['Hobbyists', 'DIY enthusiasts', 'Makers', 'Craft lovers', 'Home improvers'],
    };

    if (answers.listenerType) {
      const types = Array.isArray(answers.listenerType) ? answers.listenerType : [answers.listenerType];
      const targetListeners = [...new Set(types.flatMap(t => listenerMatchMap[t] || []))];
      const hasMatch = sponsor.audiencePreferences.some((pref) =>
        targetListeners.some((target) => pref.toLowerCase().includes(target.toLowerCase()))
      );
      if (hasMatch) {
        score += 10;
        reasons.push('Audience demographics align');
      }
    }

    // Ensure minimum score for display purposes
    score = Math.max(score, 25);

    return {
      ...sponsor,
      matchScore: Math.min(score, 100),
      matchReasons: reasons.length > 0 ? reasons : ['Broad audience appeal'],
    };
  });

  // Sort by score descending
  return matches.sort((a, b) => b.matchScore - a.matchScore);
}

export function generateGrowthPlan(answers: QuizAnswers): GrowthPlan {
  // Generate cross-promo suggestions based on category
  const crossPromoByCategory: Record<string, string[]> = {
    tech: [
      'Indie Hackers Podcast',
      'The Changelog',
      'Syntax.fm',
      'CodeNewbie',
      'Developer Tea',
    ],
    wellness: [
      'The Model Health Show',
      'Feel Better, Live More',
      'The Mindset Mentor',
      'Optimal Health Daily',
      'The Wellness Mama Podcast',
    ],
    business: [
      'The Tim Ferriss Show',
      'How I Built This',
      'Masters of Scale',
      'The GaryVee Audio Experience',
      'Smart Passive Income',
    ],
    'pop-culture': [
      'Pop Culture Happy Hour',
      'The Watch',
      'Keep It!',
      'Las Culturistas',
      'Culturally Relevant',
    ],
    education: [
      'TED Talks Daily',
      'Hidden Brain',
      'Freakonomics Radio',
      'Stuff You Should Know',
      'Revisionist History',
    ],
    entertainment: [
      'Conan O\'Brien Needs a Friend',
      'WTF with Marc Maron',
      'Armchair Expert',
      'SmartLess',
      'Comedy Bang! Bang!',
    ],
    'multi-topic': [
      'The Joe Rogan Experience',
      'Lex Fridman Podcast',
      'The Daily',
      'Call Her Daddy',
      'On Purpose with Jay Shetty',
    ],
  };

  const guestingByCategory: Record<string, string[]> = {
    tech: [
      'Acquired (larger tech M&A stories)',
      'All-In Podcast (if you have unique insights)',
      'a]6z Podcast (for founders)',
      'This Week in Startups',
    ],
    wellness: [
      'The Doctor\'s Farmacy',
      'The Huberman Lab',
      'Rich Roll Podcast',
      'On Purpose with Jay Shetty',
    ],
    business: [
      'The Knowledge Project',
      'Invest Like the Best',
      'My First Million',
      'The Twenty Minute VC',
    ],
    'pop-culture': [
      'Who? Weekly',
      'Nerdist',
      'The Rewatchables',
      'Still Processing',
    ],
    education: [
      'The Knowledge Project',
      'Making Sense with Sam Harris',
      'EconTalk',
      'The Art of Manliness',
    ],
    entertainment: [
      'ID10T with Chris Hardwick',
      'You Made It Weird',
      'Literally! with Rob Lowe',
      'Fly on the Wall',
    ],
    'multi-topic': [
      'The Jordan Harbinger Show',
      'Impact Theory',
      'The School of Greatness',
      'Kwik Brain',
    ],
  };

  const distributionByFormat: Record<string, string[]> = {
    solo: [
      'Create short-form video clips for TikTok/Reels',
      'Repurpose episodes into newsletter content',
      'Build an email list with episode highlights',
      'Share key insights as Twitter/X threads',
      'Submit to podcast directories and aggregators',
      'Create quote graphics for Instagram',
    ],
    interview: [
      'Ask guests to share on their social channels',
      'Tag guests in promotional posts',
      'Create guest highlight clips',
      'Build relationships with other podcast hosts',
      'Create a guest referral network',
      'Leverage guest audiences through cross-promotion',
    ],
    panel: [
      'Have each host share to their audience',
      'Create debate/discussion highlight clips',
      'Host live recording events',
      'Build community around the panel dynamic',
      'Create spin-off content with individual hosts',
      'Leverage combined social reach',
    ],
    mixed: [
      'Diversify content across platforms',
      'Create format-specific promotion strategies',
      'A/B test which formats drive most growth',
      'Build anticipation for different episode types',
      'Create series within your show',
      'Repurpose content in multiple formats',
    ],
  };

  const category = answers.category || 'multi-topic';
  const format = answers.format || 'mixed';

  return {
    crossPromoShows: crossPromoByCategory[category] || crossPromoByCategory['multi-topic'],
    guestingOpportunities: guestingByCategory[category] || guestingByCategory['multi-topic'],
    distributionStrategies: distributionByFormat[format] || distributionByFormat['mixed'],
  };
}
