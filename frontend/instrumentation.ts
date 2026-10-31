// instrumentation.ts — Sentry + OpenTelemetry initialization for Next.js
// This file is loaded by Next.js automatically on server startup.

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { NodeSDK } = await import("@opentelemetry/sdk-node");
    const { OTLPTraceExporter } = await import(
      "@opentelemetry/exporter-trace-otlp-http"
    );
    const { Resource } = await import("@opentelemetry/resources");
    const {
      SEMRESATTRS_SERVICE_NAME,
    } = await import("@opentelemetry/semantic-conventions");

    const sdk = new NodeSDK({
      resource: new Resource({
        [SEMRESATTRS_SERVICE_NAME]:
          process.env.OTEL_SERVICE_NAME ?? "onetowncity-frontend",
      }),
      traceExporter: process.env.OTEL_EXPORTER_OTLP_ENDPOINT
        ? new OTLPTraceExporter({
            url: `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
          })
        : undefined,
    });

    sdk.start();

    process.on("SIGTERM", () => {
      sdk.shutdown().finally(() => process.exit(0));
    });
  }

  // Sentry must always be initialized
  const { init } = await import("@sentry/nextjs");
  init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    debug: process.env.NODE_ENV === "development",
  });
}
