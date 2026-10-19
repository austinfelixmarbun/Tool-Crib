const ts = () => new Date().toISOString();

const fmt = (level: string, msg: string) =>
  `[${ts()}] [${level}] ${msg}`;

export const logger = {
  info: (msg: string, ...args: unknown[]) =>
    console.log(fmt("INFO", msg), ...args),
  warn: (msg: string, ...args: unknown[]) =>
    console.warn(fmt("WARN", msg), ...args),
  error: (msg: string, ...args: unknown[]) =>
    console.error(fmt("ERROR", msg), ...args),
  debug: (msg: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(fmt("DEBUG", msg), ...args);
    }
  },
};

export default logger;
