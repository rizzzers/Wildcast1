import Link from 'next/link';
import { NavBar } from '@/components/NavBar';

export const metadata = {
  title: 'Blog — Howdi',
  description: 'Insights, guides, and stories for podcasters looking to grow and monetize.',
};

const posts = [
  {
    slug: '#',
    category: 'Monetization',
    title: 'Why You Don\'t Need 10,000 Downloads to Land Brand Partners',
    excerpt: 'The download threshold myth is holding podcasters back. Here\'s what brands actually look for — and how to position your show regardless of size.',
    date: 'February 2026',
    readTime: '6 min read',
  },
  {
    slug: '#',
    category: 'Outreach',
    title: 'The Cold Email That Actually Gets Responses from Brand Managers',
    excerpt: 'Most podcast outreach emails are deleted in seconds. We analyzed hundreds of successful introductions to find what actually works.',
    date: 'February 2026',
    readTime: '8 min read',
  },
  {
    slug: '#',
    category: 'Growth',
    title: 'How to Build a Media Kit That Makes Brands Say Yes',
    excerpt: 'Your media kit is your first impression. Learn what to include, how to present your numbers, and what brands are really looking for.',
    date: 'January 2026',
    readTime: '5 min read',
  },
  {
    slug: '#',
    category: 'Strategy',
    title: 'Niche is Your Superpower: Why Smaller Audiences Win Big Deals',
    excerpt: 'A podcast with 2,000 highly engaged listeners in the right category can command better rates than a 50,000-listener general show.',
    date: 'January 2026',
    readTime: '7 min read',
  },
  {
    slug: '#',
    category: 'Outreach',
    title: 'The Follow-Up Formula: Turning No Response into a Conversation',
    excerpt: 'Most deals happen after the third or fourth touchpoint. Here\'s a tested follow-up cadence that doesn\'t feel pushy.',
    date: 'December 2025',
    readTime: '4 min read',
  },
  {
    slug: '#',
    category: 'Monetization',
    title: 'Understanding CPM, Host-Read Ads, and Which Deal Structure Is Right for You',
    excerpt: 'Not all partnership deals are created equal. A breakdown of the most common deal structures and how to negotiate each one.',
    date: 'December 2025',
    readTime: '9 min read',
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <NavBar />

      {/* Hero */}
      <section className="pt-40 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm font-medium tracking-[0.2em] uppercase text-[var(--primary)] mb-6">
            The Howdi Blog
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-[-0.03em] mb-6">
            For podcasters who mean business.
          </h1>
          <p className="text-lg text-gray-400 font-light max-w-2xl">
            Practical guides, outreach strategies, and monetization insights — written for independent podcasters at every stage.
          </p>
        </div>
      </section>

      {/* Posts grid */}
      <section className="pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Featured post */}
          <div className="mb-8 p-8 rounded-2xl border border-[var(--primary)]/20 bg-[var(--primary)]/[0.04] hover:bg-[var(--primary)]/[0.07] transition-colors duration-500 group cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
                {posts[0].category}
              </span>
              <span className="text-xs text-gray-600">{posts[0].date} · {posts[0].readTime}</span>
            </div>
            <h2 className="text-2xl font-bold mb-3 group-hover:text-[var(--primary)] transition-colors duration-300">
              {posts[0].title}
            </h2>
            <p className="text-gray-400 leading-relaxed">{posts[0].excerpt}</p>
            <p className="mt-4 text-sm text-[var(--primary)] font-medium">Read article →</p>
          </div>

          {/* Rest of posts */}
          <div className="grid md:grid-cols-2 gap-6">
            {posts.slice(1).map((post, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border border-[var(--border)]/50 bg-[var(--card)]/30 hover:bg-[var(--card)]/60 hover:border-[var(--border)] transition-all duration-500 group cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/[0.05] text-gray-400 border border-white/[0.08]">
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-600">{post.readTime}</span>
                </div>
                <h3 className="font-semibold mb-2 leading-snug group-hover:text-[var(--primary)] transition-colors duration-300">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">{post.excerpt}</p>
                <p className="mt-3 text-xs text-gray-600">{post.date}</p>
              </div>
            ))}
          </div>

          {/* Coming soon note */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-600">New articles every week. More coming soon.</p>
          </div>
        </div>
      </section>

      {/* Footer back link */}
      <div className="border-t border-white/[0.06] py-8 px-6 text-center">
        <Link href="/" className="text-sm text-gray-600 hover:text-white transition-colors">← Back to Howdi</Link>
      </div>
    </div>
  );
}
