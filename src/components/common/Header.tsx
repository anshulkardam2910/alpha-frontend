'use client';
import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { navItems } from '@/utils/constants';

const Header = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });
  const navRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const activeItem = activeIndex !== null ? navItems[activeIndex] : null;
  const hasDropdown = activeItem?.dropdown;

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current ?? undefined);
    };
  }, []);

  useEffect(() => {
    if (activeIndex !== null && navRefs.current[activeIndex]) {
      const el = navRefs.current[activeIndex]!;
      const parent = el.parentElement!;
      const parentRect = parent.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      setPillStyle({
        left: elRect.left - parentRect.left,
        width: elRect.width,
      });
    }
  }, [activeIndex]);

  const handleEnter = (i: number) => {
    clearTimeout(timeoutRef.current ?? undefined);
    setActiveIndex(i);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveIndex(null), 150);
  };

  const handleDropdownEnter = () => clearTimeout(timeoutRef.current ?? undefined);
  const handleDropdownLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveIndex(null), 150);
  };

  // Determine dropdown columns
  const dropdownItems = hasDropdown ? activeItem.dropdown : [];
  const cols =
    dropdownItems!.length > 3
      ? 3
      : dropdownItems!.length > 0
        ? Math.min(dropdownItems!.length, 3)
        : 1;

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-border"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between h-18 px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/alpha.jpg"
            alt="Alpha"
            width={24}
            height={24}
            className="object-contain rounded-sm"
          />
          <span className="font-semibold text-foreground text-lg">alpha</span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center relative" onMouseLeave={handleLeave}>
          {/* Pill highlight */}
          <AnimatePresence>
            {activeIndex !== null && (
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 h-8 rounded-full bg-secondary/60 border border-border"
                initial={false}
                animate={{ left: pillStyle.left, width: pillStyle.width }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </AnimatePresence>

          {navItems.map((item, i) =>
            item.dropdown ? (
              <button
                key={item.label}
                ref={(el) => {
                  navRefs.current[i] = el;
                }}
                onMouseEnter={() => handleEnter(i)}
                className="relative z-10 px-3.5 py-1.5 text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </button>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                ref={(el) => {
                  navRefs.current[i] = el as HTMLButtonElement | null;
                }}
                onMouseEnter={() => handleEnter(i)}
                className="relative z-10 px-3.5 py-1.5 text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        {/* Right */}
        <div className="hidden md:flex items-center gap-1">
          <Link
            href="/signin"
            className="px-3.5 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="px-4 py-1.5 text-sm bg-foreground text-background border border-border rounded-lg font-medium transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {hasDropdown && (
          <motion.div
            className="absolute left-0 right-0 flex justify-center"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onMouseEnter={handleDropdownEnter}
            onMouseLeave={handleDropdownLeave}
          >
            <motion.div
              className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden mt-1"
              layout
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              <div
                className="grid gap-px bg-border p-px"
                style={{ gridTemplateColumns: `repeat(${cols}, minmax(200px, 1fr))` }}
              >
                <AnimatePresence mode="popLayout">
                  {dropdownItems!.map((item, i) => (
                    <motion.div
                      key={item.title}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15, delay: i * 0.02 }}
                    >
                      <Link
                        href={item.href}
                        className="bg-card px-6 py-5 hover:bg-secondary/40 transition-colors block h-full"
                        onClick={() => setActiveIndex(null)}
                      >
                        <span className="block font-body text-sm text-muted-foreground/60 mb-0.5">
                          {item.title}
                        </span>
                        <span className="block font-body text-sm text-foreground">{item.desc}</span>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
