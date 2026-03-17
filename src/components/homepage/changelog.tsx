const entries = [
    {
      title: "UI refresh",
      description: "Introducing a calmer, more consistent UI.",
      date: "MAR 11, 2026",
      active: true,
    },
    {
      title: "Deeplink to Contacts",
      description: "Starting an issue used to mean manually creating a feature branch...",
      date: "FEB 26, 2026",
      active: false,
    },
    {
      title: "Advanced filters and share issues in...",
      description: "Refine your searches, views, and dashboards with advanced filters....",
      date: "FEB 12, 2026",
      active: false,
    },
    {
      title: "Voice AI agent for outreach",
      description: "Voice AI agent for outreach to help you automate your outreach process.",
      date: "FEB 4, 2026",
      active: false,
    },
  ];
  
  const Changelog = () => {
    return (
      <section className="bg-background py-20 md:py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Changelog
          </h2>
  
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 mt-14">
            {entries.map((entry, i) => (
              <div key={i} className="relative pb-8">
                {/* Timeline */}
                <div className="flex items-center mb-8">
                  <div
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      entry.active
                        ? "bg-destructive shadow-[0_0_8px_2px_hsl(var(--destructive)/0.4)]"
                        : "bg-muted-foreground/30 border border-border"
                    }`}
                  />
                  <div className="flex-1 h-px bg-border ml-0" />
                </div>
  
                <div className="pr-6">
                  <h3 className="font-display font-bold text-foreground text-sm leading-tight">
                    {entry.title}
                  </h3>
                  <p className="font-body text-muted-foreground text-sm mt-2 leading-relaxed line-clamp-3">
                    {entry.description}
                  </p>
                  <time className="block font-mono text-[11px] tracking-[0.15em] uppercase text-muted-foreground/50 mt-5">
                    {entry.date}
                  </time>
                </div>
              </div>
            ))}
          </div>
  
          <a
            href="#"
            className="inline-flex items-center gap-2 mt-4 font-body text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <span>See all releases</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="transition-transform group-hover:translate-x-0.5"
            >
              <path
                d="M1 7H13M13 7L7 1M13 7L7 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </section>
    );
  };
  
  export default Changelog;
  