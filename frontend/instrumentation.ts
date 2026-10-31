// instrumentation.ts — safe local instrumentation for Next.js

export async function register() {
  // Local environment: no external telemetry dependencies required
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    try {
      const { init } = await import("@sentry/nextjs");
      init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        tracesSampleRate: 0.1,
      });
    } catch {
      // Sentry optional
    }
  }
}
