import winston from 'winston'

// Logger setup: winston

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'blue',
  http: 'magenta',
  debug: 'white',
}

winston.addColors(colors)

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
)

const transports = [
  new winston.transports.Console(),
//   new winston.transports.File({
//     filename: 'logs/error.log',
//     level: '',
//   }),
//   new winston.transports.File({ filename: 'logs/all.log' }),
]

const Logger = winston.createLogger({
  format,
  transports,
})

export default Logger
