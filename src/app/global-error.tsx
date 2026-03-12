'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en" className="dark">
      <head>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: var(--font-plus-jakarta-sans, system-ui, sans-serif);
            background: oklch(0.145 0 0);
            color: oklch(0.985 0 0);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            text-align: center;
            max-width: 28rem;
          }
          .icon {
            width: 4rem;
            height: 4rem;
            margin: 0 auto 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 1rem;
            background: oklch(0.704 0.191 22.216 / 0.15);
            color: oklch(0.704 0.191 22.216);
          }
          h1 {
            font-family: var(--font-playfair-display, Georgia, serif);
            font-size: 1.5rem;
            font-weight: 600;
            letter-spacing: -0.02em;
            margin-bottom: 0.5rem;
          }
          p {
            font-size: 0.875rem;
            color: oklch(0.708 0 0);
            margin-bottom: 1.5rem;
            line-height: 1.5;
          }
          button {
            font-family: inherit;
            font-size: 0.875rem;
            font-weight: 500;
            padding: 0.5rem 1.25rem;
            border-radius: 0.5rem;
            background: oklch(0.922 0 0);
            color: oklch(0.205 0 0);
            border: none;
            cursor: pointer;
            transition: opacity 0.2s;
          }
          button:hover { opacity: 0.9; }
          button:active { opacity: 0.8; }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="icon" aria-hidden>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h1>Something went wrong</h1>
          <p>An unexpected error occurred. Please try again.</p>
          <button type="button" onClick={() => reset()}>
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
