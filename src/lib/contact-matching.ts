import { QuizAnswers } from '@/types';
import { getDb } from './db';

export interface ContactMatch {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  description: string;
  industries: string;
  linkedin: string;
  website: string;
  tags: string;
  matchScore: number;
  matchReasons: string[];
}

interface DbContact {
  id: string;
  first_name: string;
  last_name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  description: string;
  industries: string;
  linkedin: string;
  website: string;
  tags: string;
  region: string;
  city: string;
  state: string;
}

// Map quiz categories to industry/description keywords
const categoryKeywords: Record<string, string[]> = {
  'tech': ['software', 'technology', 'computer', 'internet', 'digital', 'mobile', 'cloud', 'data', 'hardware', 'electronics', 'saas', 'app', 'ai', 'programming', 'it consulting', 'search engine', 'telecommunications', 'cybersecurity'],
  'wellness': ['health', 'fitness', 'wellness', 'nutrition', 'vitamin', 'supplement', 'personal care', 'cosmetic', 'beauty', 'pharmaceutical', 'medical', 'therapy', 'skincare', 'skin care', 'hair care', 'hair growth', 'grooming', 'toiletries', 'perfume', 'menstrual'],
  'business': ['banking', 'financial', 'investment', 'insurance', 'consulting', 'accounting', 'management', 'real estate', 'credit', 'mortgage', 'brokerage', 'asset', 'law firm', 'service business', 'supply chain'],
  'pop-culture': ['entertainment', 'media', 'broadcasting', 'music', 'television', 'radio', 'streaming', 'social media', 'fashion', 'apparel', 'clothing', 'shoe', 'accessories', 'jewelry', 'watches', 'direct-to-consumer'],
  'education': ['education', 'training', 'learning', 'publishing', 'academic', 'school', 'university', 'non-profit', 'nonprofit', 'charitable', 'children', 'montessori'],
  'entertainment': ['entertainment', 'gaming', 'sports', 'broadcasting', 'streaming', 'media', 'music', 'comedy', 'gambling', 'events', 'sports team', 'football', 'promotions', 'video', 'television', 'radio', 'video game', 'golf'],
  'multi-topic': ['retailer', 'consumer', 'food', 'beverage', 'restaurant', 'online retailer', 'department store', 'mass retailer', 'packaged goods', 'home goods', 'subscription', 'direct-to-consumer'],
};

// Map listener types to relevant industry keywords
const listenerKeywords: Record<string, string[]> = {
  'founders-executives': ['software', 'financial', 'consulting', 'technology', 'investment', 'management', 'banking', 'saas', 'supply chain', 'cybersecurity'],
  'parents-caregivers': ['consumer', 'food', 'home', 'children', 'infant', 'family', 'health care', 'packaged goods', 'baby', 'mother', 'toy', 'montessori'],
  'creators-influencers': ['social media', 'influencer', 'content', 'creator', 'digital', 'app', 'online retailer', 'direct-to-consumer', 'fashion', 'beauty', 'apparel'],
  'curious-generalists': ['education', 'media', 'entertainment', 'publishing', 'retailer', 'consumer', 'food', 'beverage'],
  'health-fitness-enthusiasts': ['health', 'fitness', 'wellness', 'nutrition', 'supplement', 'sports', 'vitamin', 'personal care', 'grooming', 'athletic'],
  'young-professionals': ['financial', 'career', 'software', 'fashion', 'apparel', 'streaming', 'subscription', 'direct-to-consumer', 'fintech'],
  'hobbyists-diy': ['home goods', 'hardware', 'craft', 'garden', 'outdoor', 'retailer', 'tool', 'consumer', 'hobby', 'maker'],
};

export function matchContacts(quizAnswers: QuizAnswers): ContactMatch[] {
  const db = getDb();
  const contacts = db.prepare('SELECT * FROM contacts').all() as DbContact[];

  const catKeywords = categoryKeywords[quizAnswers.category || ''] || [];
  const listenerTypes = Array.isArray(quizAnswers.listenerType)
    ? quizAnswers.listenerType
    : quizAnswers.listenerType ? [quizAnswers.listenerType] : [];
  const listKeywords = [...new Set(listenerTypes.flatMap(t => listenerKeywords[t] || []))];

  const scored: ContactMatch[] = contacts.map((c) => {
    const searchText = `${c.description} ${c.industries} ${c.title}`.toLowerCase();
    const tagsLower = (c.tags || '').toLowerCase();
    let score = 0;
    const reasons: string[] = [];

    // Podcast Spend tag bonus (up to 20 points) - these contacts have proven podcast ad spend
    if (tagsLower.includes('podcast spend / sponsorship & influencer')) {
      score += 20;
      reasons.push('Active podcast sponsor');
    } else if (tagsLower.includes('podcast spend')) {
      score += 15;
      reasons.push('Has podcast ad spend');
    }

    // Category match (up to 45 points)
    let categoryHits = 0;
    for (const kw of catKeywords) {
      if (searchText.includes(kw.toLowerCase())) {
        categoryHits++;
      }
    }
    if (categoryHits > 0) {
      const categoryScore = Math.min(45, categoryHits * 12);
      score += categoryScore;
      reasons.push(`Industry aligns with ${quizAnswers.category?.replace('-', ' ')} podcasts`);
    }

    // Listener type match (up to 20 points)
    let listenerHits = 0;
    for (const kw of listKeywords) {
      if (searchText.includes(kw.toLowerCase())) {
        listenerHits++;
      }
    }
    if (listenerHits > 0) {
      const listenerScore = Math.min(20, listenerHits * 8);
      score += listenerScore;
      reasons.push(`Relevant to ${listenerTypes.map(t => t.replace(/-/g, ' ')).join(', ')} audience`);
    }

    // Sponsorship/advertising role bonus (up to 15 points)
    const titleLower = c.title.toLowerCase();
    if (titleLower.includes('sponsorship') || titleLower.includes('partnership')) {
      score += 15;
      reasons.push('Handles sponsorship partnerships');
    } else if (titleLower.includes('influencer')) {
      score += 12;
      reasons.push('Manages influencer marketing');
    } else if (titleLower.includes('advertising') || titleLower.includes('media')) {
      score += 10;
      reasons.push('Manages advertising');
    } else if (titleLower.includes('marketing')) {
      score += 8;
      reasons.push('Marketing role');
    }

    // Multi-topic bonus: broad appeal brands get a floor
    if (quizAnswers.category === 'multi-topic' && score < 30) {
      const broadTerms = ['retailer', 'consumer', 'online', 'brand', 'food', 'beverage'];
      for (const term of broadTerms) {
        if (searchText.includes(term)) {
          score = Math.max(score, 30);
          if (!reasons.length) reasons.push('Broad consumer brand');
          break;
        }
      }
    }

    // Cap at 100, ensure scored contacts have minimum visibility
    score = Math.min(100, Math.max(score > 0 ? 25 : 0, score));

    return {
      id: c.id,
      firstName: c.first_name,
      lastName: c.last_name,
      title: c.title,
      company: c.company,
      email: c.email,
      phone: c.phone,
      description: c.description,
      industries: c.industries,
      linkedin: c.linkedin || '',
      website: c.website || '',
      tags: c.tags || '',
      matchScore: score,
      matchReasons: reasons.length > 0 ? reasons : ['General advertising contact'],
    };
  });

  // Return contacts with score > 0, sorted by score descending
  return scored
    .filter((c) => c.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);
}
