import { pg } from 'interceptors/Postgres'
import { FastifyReply, FastifyRequest } from 'fastify'
import { SurveyOperation } from 'operations'

export enum SurveyTypes {
  RADIO = 'radio',
  SELECTION = 'selection',
  RATING = 'rating',
  INPUT = 'input',
  TEXT = 'text',
}

interface Questions {
  survey_types: SurveyTypes
  title: string
}

export interface ISurvey {
  title: string
  description: string
  questions: Array<Questions>
}

export const createSurveyHandler = async (
  req: FastifyRequest<{
    Body: ISurvey
  }>,
  res: FastifyReply,
) => {
  const userId = req.session.id
  console.log('body', req.body)

  try {
    const surveyData: ISurvey = {
      title: req.body.title,
      description: req.body.description,
      questions: req.body.questions,
    }
    const survey = await SurveyOperation.createSurvey(surveyData, userId)

    return res.code(200).send({
      survey,
    })
  } catch (error) {
    console.error('survey oluşturulurken bir hata oluştu:', error)
    return res
      .code(500)
      .send({ message: 'survey oluşturulurken bir hata oluştu' })
  }
}

export const getAllSurveysHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  try {
    const surveys = await SurveyOperation.getAllSurveys()

    return res.code(200).send({
      surveys,
    })
  } catch (error) {
    console.error('survey oluşturulurken bir hata oluştu:', error)
    return res
      .code(500)
      .send({ message: 'survey oluşturulurken bir hata oluştu' })
  }
}

// get surveyby id

export const getSurveyByIdHandler = async (
  req: FastifyRequest<{
    Params: {
      surveyId: string
    }
  }>,
  res: FastifyReply,
) => {
  const surveyId = req.params.surveyId

  try {
    const survey = await SurveyOperation.getSurveyDetailsById(surveyId)

    return res.code(200).send({
      survey,
    })
  } catch (error) {
    console.error('survey oluşturulurken bir hata oluştu:', error)
    return res
      .code(500)
      .send({ message: 'survey oluşturulurken bir hata oluştu' })
  }
}

export const createSurveyResponseHandler = async (
  req: FastifyRequest<{
    Body: {
      data: any
    }
  }>,
  res: FastifyReply,
) => {
  const userId = req.session.id
  const surveyResponse = req.body.data
  console.log('rewqwqq', surveyResponse)
  try {
    const responseId = await SurveyOperation.userResponseCreate(
      surveyResponse,
      userId,
    )

    return res.code(200).send({
      responseId,
    })
  } catch (error) {
    console.error('survey oluşturulurken bir hata oluştu:', error)
    return res
      .code(500)
      .send({ message: 'survey oluşturulurken bir hata oluştu' })
  }
}

export const updateSurveyHandler = async (
  req: FastifyRequest<{
    Params: {
      surveyId: string
    }
    Body: {
      updatedSurvey: {
        title: string
        description: string
        questions: Array<{
          survey_types: string
          title: string
          options: Array<string>
        }>
      }
    }
  }>,
  res: FastifyReply,
) => {
  const surveyId = req.params.surveyId
  const updatedSurveyData = req.body.updatedSurvey

  try {
    // Call the updateSurvey function from SurveyOperation
    const updatedSurvey = await SurveyOperation.updateSurvey(
      surveyId,
      updatedSurveyData,
    )

    // Check if the survey was updated successfully
    if (!updatedSurvey) {
      console.error('Survey update failed.')
      return res
        .code(404)
        .send({ message: 'Survey not found or update failed.' })
    }

    // Return the updated survey details
    return res.code(200).send({
      updatedSurvey,
    })
  } catch (error) {
    console.error('Error updating survey:', error)
    return res.code(500).send({ message: 'Error updating survey.' })
  }
}
