import User from './user/igniteUserEndpoint'
import Survey from './survey/igniteSurveyEndpoint'

export default async function (app) {
  app.get('/', (req, rep) => {
    rep.send('Service provider is working properly!')
  })
  app.register(User, { prefix: '/user' })
  app.register(Survey, { prefix: '/survey' })
}
