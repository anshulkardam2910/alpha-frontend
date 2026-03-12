/**
 * Runs when the Next.js server starts (dev/build/start).
 * Validates env before the server is ready so missing/invalid API URLs
 * fail immediately with a clear error instead of at first request.
 */
/* export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./lib/env");
  }
}
 */

//TODO: Implement ENV check for the instrumentation logic here