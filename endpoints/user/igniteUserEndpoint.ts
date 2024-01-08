import { FastifyInstance } from 'fastify'
import {
  signinHandler,
  createUserHandler,
  getAllUserHandler,
  checkSession,
  getUserById,
  logout,
  // getUserHandler,
} from './handlers'
import { Authentication } from 'interceptors'

// Exported function to configure routes on the Fastify instance
export default async function (app: FastifyInstance) {
  // Route for user sign-in
  app.post('/signin', signinHandler)

  // Route for user sign-up
  app.post('/signup', createUserHandler)

  // Route for checking user session
  app.post('/session', checkSession)

  // Route for user sign-out
  app.post('/signout', logout)

  // Route to get all users
  app.get('/', getAllUserHandler)

  // Route to get user by ID
  app.get('/:userId', getUserById)

  // Uncomment the line below and implement the handler if needed
  // Route to get user by username
  // app.get('/getuser/:user', getUserHandler)
}
