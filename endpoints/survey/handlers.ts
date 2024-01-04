import { pg } from 'interceptors/Postgres'
import { FastifyReply, FastifyRequest } from 'fastify'
import { SurveyOperation } from 'operations'

export const getAllQuestionsHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  try {
    const questions = await SurveyOperation.getQuestion()
    return res.code(200).send({ questions })
  } catch (err) {
    console.error('An error occurred:', err)
    return res.code(500).send({ message: 'Internal Server Error' })
  }
}
export const getAllSurveysHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  try {
    const surveys = await SurveyOperation.getSurvey()
    return res.code(200).send({ surveys })
  } catch (err) {
    console.error('An error occurred:', err)
    return res.code(500).send({ message: 'Internal Server Error' })
  }
}

export const createQuestionHandler = async (
  req: FastifyRequest<{
    Body: {
      question_data: string
    }
  }>,
  res: FastifyReply,
) => {
  try {
    const { question_data } = req.body
    if (!question_data) throw new Error('Missing question data')
    const question = await SurveyOperation.createQuestion({
      question_data,
    })
    return res.code(201).send({ question })
  } catch (err) {
    console.error('An error occurred:', err)
    return res.code(500).send({ message: 'Internal Server Error' })
  }
}

export const createSurveyHandler = async (
  req: FastifyRequest<{
    Body: {
      survey_type: string
      title: string
      options: string
    }
  }>,
  res: FastifyReply,
) => {
  try {
    const { survey_type, title, options } = req.body
    if (!survey_type || !title || !options)
      throw new Error('Missing survey data')
    const survey = await SurveyOperation.createSurvey({
      survey_type,
      title,
      options,
    })
    return res.code(201).send({ survey })
  } catch (err) {
    console.error('An error occurred:', err)
    return res.code(500).send({ message: 'Internal Server Error' })
  }
}

export const createUserResponseHandler = async (
  req: FastifyRequest<{
    Body: {
      response_id: string
      user_id: string
      question_id: string
      response_value: string
    }
  }>,
  res: FastifyReply,
) => {
  try {
    const { response_id, user_id, question_id, response_value } = req.body
    if (!response_id || !user_id || !question_id || !response_value)
      throw new Error('Missing response data')
    const userResponse = await SurveyOperation.createUserResponse({
      response_id,
      user_id,
      question_id,
      response_value,
    })
    return res.code(201).send({ userResponse })
  } catch (err) {
    console.error('An error occurred:', err)
    return res.code(500).send({ message: 'Internal Server Error' })
  }
}

export const getUserResponseHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  try {
    const userResponses = await SurveyOperation.getUserResponse()
    return res.code(200).send({ userResponses })
  } catch (err) {
    console.error('An error occurred:', err)
    return res.code(500).send({ message: 'Internal Server Error' })
  }
}

export const getUserResponseByIdHandler = async (
  req: FastifyRequest<{
    Params: {
      id: string
    }
  }>,
  res: FastifyReply,
) => {
  try {
    const { id } = req.params
    if (!id) throw new Error('Missing id')
    const userResponses = await SurveyOperation.getUserResponseById(id)
    return res.code(200).send({ userResponses })
  } catch (err) {
    console.error('An error occurred:', err)
    return res.code(500).send({ message: 'Internal Server Error' })
  }
}

export const getSurveyByIdHandler = async (
  req: FastifyRequest<{
    Params: {
      id: string
    }
  }>,
  res: FastifyReply,
) => {
  const { id } = req.params
  if (!id) throw new Error('Missing id')
  try {
    const survey = await SurveyOperation.getSurveyById(id)
    return res.code(200).send({ survey })
  } catch (err) {
    console.error('An error occurred:', err)
    return res.code(500).send({ message: 'Internal Server Error' })
  }
}
