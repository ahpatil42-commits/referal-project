import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname'
    }
  } : undefined,
});

export const logAIFailure = (context: string, error: any, metadata?: Record<string, any>) => {
  logger.error({
    msg: `AI API Failure: ${context}`,
    error: error?.message || String(error),
    stack: error?.stack,
    ...metadata
  });
};
