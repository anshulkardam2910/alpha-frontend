'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const categories = [
  'All',
  'Sales',
  'Business Development',
  'Product Marketing',
  'Marketing',
  'Customer Support',
] as const;

type Category = (typeof categories)[number];

interface UseCase {
  category: Exclude<Category, 'All'>;
  title: string;
  description: string;
}

const useCases: UseCase[] = [
  {
    category: 'Sales',
    title: 'Close Deals Faster',
    description:
      'Accelerate your pipeline velocity with automated follow-ups and intelligent lead scoring.',
  },
  {
    category: 'Sales',
    title: 'Forecast Revenue',
    description:
      'Generate accurate revenue forecasts using historical data and real-time pipeline signals.',
  },
  {
    category: 'Sales',
    title: 'Automate Outreach',
    description: 'Scale personalized outreach sequences without sacrificing the human touch.',
  },
  {
    category: 'Business Development',
    title: 'Fill Your Calendar',
    description: 'Drive inbound meeting requests and fill your calendar with qualified prospects.',
  },

  {
    category: 'Product Marketing',
    title: 'Launch Campaigns',
    description:
      'Coordinate cross-functional product launches with clear messaging and go-to-market plans.',
  },
  {
    category: 'Product Marketing',
    title: 'Competitive Intelligence',
    description:
      'Track competitor positioning and arm your team with battle cards and objection handling.',
  },

  {
    category: 'Marketing',
    title: 'Generate Qualified Leads',
    description: 'Build high-converting landing pages and nurture sequences that drive MQLs.',
  },
  {
    category: 'Marketing',
    title: 'Measure Campaign ROI',
    description:
      'Attribute revenue to specific campaigns and channels with multi-touch attribution.',
  },
  {
    category: 'Marketing',
    title: 'Scale Content Production',
    description:
      'Produce SEO-optimized content at scale while maintaining brand voice consistency.',
  },
  {
    category: 'Customer Support',
    title: 'Reduce Ticket Volume',
    description:
      'Deflect common queries with intelligent self-service and contextual help articles.',
  },

  {
    category: 'Customer Support',
    title: 'Boost CSAT Scores',
    description: 'Deliver proactive support by identifying at-risk accounts before they churn.',
  },
];

const UseCases = () => {
  const [active, setActive] = useState<Category>('Sales');

  const filtered = useMemo(
    () => (active === 'All' ? useCases : useCases.filter((u) => u.category === active)),
    [active],
  );

  return (
    <section className="bg-background py-20 md:py-28 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground text-center">
          Real-world use cases
        </h2>
        <p className="text-muted-foreground text-center mt-4 text-lg font-body">
          Discover how teams across different functions drive results
        </p>

        {/* Filter pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`h-9 px-4 rounded-full text-sm font-medium font-body transition-colors duration-150 border ${
                active === cat
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-transparent text-muted-foreground border-border hover:text-foreground hover:border-card-hover-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Card grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
          <AnimatePresence mode="popLayout">
            {filtered.map((item, i) => (
              <motion.div
                key={item.title}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.25, ease: 'easeOut', delay: i * 0.03 }}
                className="relative group rounded-2xl overflow-hidden cursor-pointer"
              >
                {/* Gradient border effect */}
                <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-card-hover-border via-border to-card-hover-border" />

                <div className="relative m-px rounded-[15px] bg-linear-to-br from-[hsl(var(--card-gradient-from))] to-[hsl(var(--card-gradient-to))] p-6 h-[calc(100%-2px)] flex flex-col min-h-[180px]">
                  <div className="flex items-center justify-between mb-5">
                    <span className="inline-block text-[11px] font-medium font-body tracking-wider uppercase text-muted-foreground bg-secondary/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-foreground text-lg leading-tight">
                    {item.title}
                  </h3>
                  <p className="font-body text-muted-foreground text-sm mt-2.5 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                  {/*   line divider effect. */}
                  <div className="mt-auto pt-5">
                    <div className="h-px w-full bg-linear-to-r from-transparent via-card-hover-border to-transparent" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default UseCases;
