import { createLogger, format, transports } from "winston";
import type { Logger } from "winston";

const { combine, timestamp, label, errors, splat, printf, json } = format;
const config = {
  levels: {
    error: 0,
    debug: 1,
    warn: 2,
    data: 3,
    info: 4,
    verbose: 5,
    silly: 6,
    startup: 7
  },
  colors: {
    error: 'red',
    debug: 'blue',
    warn: 'yellow',
    data: 'grey',
    info: 'green',
    verbose: 'cyan',
    silly: 'magenta',
    startup: 'yellow'
  }
};

const myFormat = printf((log) => {
  return `${log.timestamp} [${log.level}] ${log.message}`;
});
// BUG custom levels not working
const start = (): Logger => {
  const logger = createLogger({
    levels: config.levels,
    format: combine(timestamp(), myFormat),
    transports: [],
  });

  if (process.env.NODE_ENV !== "production") {
    logger.add(
      new transports.Console({
        format: format.combine(
          format.colorize(),
          errors({ stack: true }),
          format.simple(),
          myFormat
        ),
      })
    );
  }
  logger.add(new transports.File({ filename: "log/combined.log", format: combine(errors({ stack: true }), splat(), json()) }));

  return logger;
};

const logger = start();

export default logger;
