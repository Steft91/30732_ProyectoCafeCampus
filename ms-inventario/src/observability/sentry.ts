import * as Sentry from '@sentry/node';

export function initSentry(serviceName: string) {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? 'development',
    release: process.env.SENTRY_RELEASE,
    serverName: serviceName,
  });
}

export { Sentry };
