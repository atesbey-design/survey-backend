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

export default async function (app: FastifyInstance) {
  app.post('/signin', signinHandler)
  app.post('/signup', createUserHandler)
  app.post('/session', checkSession)
  app.post('/signout', logout)
  app.get('/', getAllUserHandler)
  app.get('/:userId', getUserById)

  // app.get('/getuser/:user', getUserHandler)
}
