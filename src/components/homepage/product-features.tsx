"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Phone,
  Users,
  Video,
  Mail,
  Shield,
  BarChart3,
  Calendar,
  CheckSquare,
  Link2,
  Zap,
  Inbox,
  MessageSquare,
  Bot,
  Target,
  TrendingUp,
  DollarSign,
  PieChart,
  Activity,
  Play,
} from "lucide-react";

const CARDS = [
  {
    icon: Phone,
    title: "AI Voice Outreach",
    description:
      "Speech-to-speech AI conversations for seamless customer engagement across every channel.",
    badges: [Video, Users, Phone],
  },
  {
    icon: Users,
    title: "Zero Missed Leads",
    description:
      "Capture every lead from web, inbox, or tickets automatically — nothing slips through.",
    badges: [Mail, Shield, Target, BarChart3],
  },
  {
    icon: Calendar,
    title: "Actionable Context",
    description:
      "Automate follow-ups directly into calendars, tasks, or inbox workflows.",
    badges: [Calendar, CheckSquare, Link2],
  },
  {
    icon: Zap,
    title: "Smart Sequences",
    description:
      "Multi-step outreach that adapts in real-time based on prospect behavior and signals.",
    badges: [Bot, Zap, MessageSquare],
  },
  {
    icon: Inbox,
    title: "Unified Inbox",
    description:
      "Every conversation — email, chat, voice — in one place with full context and history.",
    badges: [Inbox, Mail, MessageSquare, Phone],
  },
  {
    icon: TrendingUp,
    title: "Revenue Intelligence",
    description:
      "Real-time pipeline insights and forecasting powered by your actual engagement data.",
    badges: [DollarSign, PieChart, Activity],
  },
];

const CARDS_PER_PAGE = 3;
const TOTAL_PAGES = Math.ceil(CARDS.length / CARDS_PER_PAGE);
const AUTO_PLAY_INTERVAL = 4000;

const ProductFeatures = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => (prev + 1) % TOTAL_PAGES);
  }, []);

  useEffect(() => {
    if (isAutoPlaying) {
      intervalRef.current = setInterval(nextPage, AUTO_PLAY_INTERVAL);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAutoPlaying, nextPage]);

  const handleDotClick = (page: number) => {
    setCurrentPage(page);
    setIsAutoPlaying(false);
  };

  const handlePlayClick = () => {
    if (isAutoPlaying) {
      setIsAutoPlaying(false);
    } else {
      nextPage();
      setIsAutoPlaying(true);
    }
  };

  const visibleCards = CARDS.slice(
    currentPage * CARDS_PER_PAGE,
    currentPage * CARDS_PER_PAGE + CARDS_PER_PAGE
  );

  return (
    <section className="bg-background px-6">
      <div className="max-w-7xl mx-auto py-20 md:py-28">
        <h2 className="font-display text-3xl md:text-4xl lg:text-[2.75rem] font-semibold leading-[1.3] tracking-tight">
          <span className="text-foreground">
            Alpha is a new kind of GTM platform.
          </span>{" "}
          <span className="text-muted-foreground ">
            Built for revenue teams with AI workflows at its core, Alpha sets a
            new standard for go-to-market execution.
          </span>
        </h2>

        {/* Carousel */}
        <div className="mt-16 md:mt-20">
          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5"
              >
                {visibleCards.map((card, i) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: i * 0.08,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="group relative rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-7 flex flex-col justify-between min-h-[280px] transition-colors duration-300 hover:border-border hover:bg-card/80"
                  >
                    {/* Icon badge */}
                    <div>
                      <div className="mb-8 inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted/80 border border-border/40 text-muted-foreground transition-colors duration-300 group-hover:text-foreground group-hover:border-border/60">
                        <card.icon className="w-5 h-5" strokeWidth={1.5} />
                      </div>

                      {/* Title & description */}
                      <h3 className="text-lg font-semibold text-foreground mb-2 tracking-tight">
                        {card.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {card.description}
                      </p>
                    </div>

                    {/* Divider + bottom badges */}
                    <div>
                      <div className="h-px bg-border/50 mb-5 mt-6" />
                      <div className="flex items-center gap-2">
                        {card.badges.map((BadgeIcon, j) => (
                          <div
                            key={j}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-border/40 bg-muted/40 text-muted-foreground/70 transition-all duration-300 hover:text-foreground hover:border-border/70 hover:bg-muted/70"
                          >
                            <BadgeIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Pagination dots + play button */}
          <div className="flex items-center justify-center gap-3 mt-10">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleDotClick(i)}
                  className="relative h-2 transition-all duration-300 rounded-full"
                  style={{ width: currentPage === i ? 24 : 8 }}
                  aria-label={`Go to page ${i + 1}`}
                >
                  <span
                    className={`absolute inset-0 rounded-full transition-colors duration-300 ${
                      currentPage === i
                        ? "bg-foreground"
                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                  />
                </button>
              ))}
            </div>
            <button
              onClick={handlePlayClick}
              className="ml-2 inline-flex items-center justify-center w-8 h-8 rounded-full border border-border/60 text-muted-foreground hover:text-foreground hover:border-border transition-colors duration-200"
              aria-label={isAutoPlaying ? "Pause autoplay" : "Play autoplay"}
            >
              {isAutoPlaying ? (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="currentColor"
                >
                  <rect x="1" y="1" width="3.5" height="10" rx="1" />
                  <rect x="7.5" y="1" width="3.5" height="10" rx="1" />
                </svg>
              ) : (
                <Play className="w-3.5 h-3.5 ml-0.5" fill="currentColor" />
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductFeatures;
