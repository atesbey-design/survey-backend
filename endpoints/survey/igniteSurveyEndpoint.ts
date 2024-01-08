import { FastifyInstance } from 'fastify'
import {
  createSurveyHandler,
  createSurveyResponseHandler,
  getAllSurveysHandler,
  getSurveyByIdHandler,
  updateSurveyHandler,
} from './handlers'
import { Authenticator } from 'interceptors'

export default async function (app: FastifyInstance) {
  app.register(Authorized)
}

async function Authorized (app: FastifyInstance) {
  app.addHook('preValidation', Authenticator(app))
  app.post('/create', createSurveyHandler)
  app.post('/update/:surveyId', updateSurveyHandler)
  app.post('/response', createSurveyResponseHandler)
  app.get('/:surveyId', getSurveyByIdHandler)
  app.get('/', getAllSurveysHandler)
}
