"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

type PolygonStart = "top-left" | "top-right"

const getPolygonClipPaths = (position: PolygonStart) => {
  switch (position) {
    case "top-left":
      return {
        darkFrom: "polygon(50% -71%, -50% 71%, -50% 71%, 50% -71%)",
        darkTo: "polygon(50% -71%, -50% 71%, 50% 171%, 171% 50%)",
        lightFrom: "polygon(171% 50%, 50% 171%, 50% 171%, 171% 50%)",
        lightTo: "polygon(171% 50%, 50% 171%, -50% 71%, 50% -71%)",
      }
    case "top-right":
      return {
        darkFrom: "polygon(150% -71%, 250% 71%, 250% 71%, 150% -71%)",
        darkTo: "polygon(150% -71%, 250% 71%, 50% 171%, -71% 50%)",
        lightFrom: "polygon(-71% 50%, 50% 171%, 50% 171%, -71% 50%)",
        lightTo: "polygon(-71% 50%, 50% 171%, 250% 71%, 150% -71%)",
      }
  }
}

const buildPolygonTransitionCSS = (start: PolygonStart) => {
  const clipPaths = getPolygonClipPaths(start)

  return `
    ::view-transition-group(root) {
      animation-duration: 0.7s;
      animation-timing-function: var(--expo-out);
    }

    ::view-transition-new(root) {
      animation-name: reveal-light-${start};
    }

    ::view-transition-old(root),
    .dark::view-transition-old(root) {
      animation: none;
      z-index: -1;
    }

    .dark::view-transition-new(root) {
      animation-name: reveal-dark-${start};
    }

    @keyframes reveal-dark-${start} {
      from { clip-path: ${clipPaths.darkFrom}; }
      to { clip-path: ${clipPaths.darkTo}; }
    }

    @keyframes reveal-light-${start} {
      from { clip-path: ${clipPaths.lightFrom}; }
      to { clip-path: ${clipPaths.lightTo}; }
    }
  `
}

const STYLE_ID = "theme-transition-styles"

function injectTransitionStyles(css: string) {
  if (typeof window === "undefined") return

  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null
  if (!el) {
    el = document.createElement("style")
    el.id = STYLE_ID
    document.head.appendChild(el)
  }
  el.textContent = css
}

function usePolygonThemeToggle(start: PolygonStart = "top-left") {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === "dark"

  const toggle = React.useCallback(() => {
    const nextTheme = isDark ? "light" : "dark"
    const css = buildPolygonTransitionCSS(start)
    injectTransitionStyles(css)

    const switchTheme = () => setTheme(nextTheme)

    if (typeof window === "undefined" || !document.startViewTransition) {
      switchTheme()
      return
    }

    document.startViewTransition(switchTheme)
  }, [isDark, setTheme, start])

  return { isDark, mounted, toggle }
}

export function ModeToggle({ start = "top-left" }: { start?: PolygonStart } = {}) {
  const { isDark, mounted, toggle } = usePolygonThemeToggle(start)

  if (!mounted) {
    return (
      <button
        className="relative inline-flex h-7 w-14 shrink-0 items-center rounded-full bg-muted/60 opacity-50"
        disabled
        aria-label="Toggle light/dark mode"
      >
        <span className="absolute left-1.5 flex items-center justify-center">
          <Moon className="h-3.5 w-3.5 text-muted-foreground" />
        </span>
        <span className="absolute right-1.5 flex items-center justify-center">
          <Sun className="h-3.5 w-3.5 text-muted-foreground" />
        </span>
        <span className="pointer-events-none h-5 w-5 translate-x-1 rounded-full bg-foreground/80 shadow-md" />
      </button>
    )
  }

  return (
    <button
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle light/dark mode"
      onClick={toggle}
      className="relative inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full bg-muted/60 border border-border/50 transition-colors duration-300 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <span className="absolute left-1.5 flex items-center justify-center">
        <Moon className={`h-3.5 w-3.5 transition-colors duration-300 ${isDark ? 'text-blue-300' : 'text-muted-foreground/40'}`} />
      </span>
      <span className="absolute right-1.5 flex items-center justify-center">
        <Sun className={`h-3.5 w-3.5 transition-colors duration-300 ${isDark ? 'text-muted-foreground/40' : 'text-amber-400'}`} />
      </span>
      <span
        className={`pointer-events-none absolute h-5 w-5 rounded-full bg-foreground shadow-md transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isDark ? 'left-1' : 'left-[calc(100%-1.5rem)]'
        }`}
      />
    </button>
  )
}
