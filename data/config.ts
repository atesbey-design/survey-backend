export const INDEV =
  process.env.NODE_ENV === 'development' || process.env.TS_NODE_DEV === 'true'

export const {
  DB_HOST = INDEV
    ? 'dpg-cm60nh8cmk4c73csmnmg-a.oregon-postgres.render.com'
    : 'postgres',
  DB_PORT = 5432,
  DB_USER = 'survey_ikag_user',
  DB_PASSWORD = 'gwLiyAqOXmvZIRQdPl8Reh4yy4i7B9RD',
  DB_DATABASE = 'survey_ikag',
} = process.env

export const Config = {
  port: Number(process.env.PORT) || 32500,
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3000/'],
  },
  swagger: {
    swagger: {
      info: {
        title: 'Project Backend Swagger',
        description: 'Project Backend Swagger API',
        version: '0.1.0',
      },
      tags: [
        { name: 'Default', description: 'Default' },
        { name: 'User', description: 'User' },
      ],
    },
  },
  swaggerUI: {
    routePrefix: '/docs',
  },
  jwtSecret: 'ELIZA',
  db: {
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    ssl: true,
  },
}

export default Config
