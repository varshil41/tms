import { createLogger, format, transports } from "winston";

const logger = createLogger({
  exitOnError: false,
  transports: [
    new transports.File({
      filename: `${process.env.NODE_ENV || "dev"}-api.log`,
      format: format.combine(format.timestamp(), format.json()),
    }),
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp(),
        format.printf(({ level, message, timestamp }) => {
          return `[${timestamp}] ${level}: ${message}`;
        }),
      ),
    }),
  ],
});

export default logger;
