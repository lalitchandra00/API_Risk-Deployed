type LogMeta = Record<string, unknown> | undefined;

const formatMeta = (meta?: LogMeta) => {
  if (!meta) return "";
  try {
    return ` ${JSON.stringify(meta)}`;
  } catch {
    return "";
  }
};

export const logger = {
  info: (message: string, meta?: LogMeta) => {
    console.log(`[INFO] ${message}${formatMeta(meta)}`);
  },
  warn: (message: string, meta?: LogMeta) => {
    console.warn(`[WARN] ${message}${formatMeta(meta)}`);
  },
  error: (message: string, meta?: LogMeta) => {
    console.error(`[ERROR] ${message}${formatMeta(meta)}`);
  },
};
