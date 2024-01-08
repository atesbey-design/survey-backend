import { pg } from 'interceptors/Postgres'
import { server } from '../igniteServer'
import { FastifyReply, FastifyRequest } from 'fastify'
import { SurveyTypes } from '../endpoints/survey/handlers'

export const createSurvey = async (surveyData, userId) => {
  const { title, description, questions } = surveyData
  console.log(surveyData, 'dataaaaaaaaaaaaaaaaaaaaaa')
  try {
    const userQuery = 'SELECT id FROM public.users WHERE id = $1'
    const userData = await pg.oneOrNone(userQuery, [userId])
    if (!userData) {
      return null
    }

    const insertSurveyQuery = `
      INSERT INTO public.survey (survey_title, survey_description, user_id)
      VALUES ($1, $2, $3)
      RETURNING survey_id
    `

    const { survey_id: surveyId } = await pg.one(insertSurveyQuery, [
      title,
      description,
      userId,
    ])

    if (!surveyId) {
      console.error('Anket ID alınamadı.')
      return null
    }

    const insertSurveyQuestionsQuery = `
    INSERT INTO public.survey_questions (survey_types, title, options, survey_id)
    VALUES ($1, $2, $3, $4)
  `

    for (const question of surveyData.questions) {
      console.log('Question:', question)
      console.log('Options before processing:', question.options)

      // Option'ları uygun şekilde stringified JSON olarak hazırla
      const processedOptions = JSON.stringify(question.questions[0].options)

      console.log('Processed Options:', processedOptions)

      await pg.none(insertSurveyQuestionsQuery, [
        question.survey_types,
        question.title,
        processedOptions,
        surveyId,
      ])
    }

    console.log('Anket oluşturuldu. Anket ID:', surveyId)

    const createdSurveyDetails = {
      survey_id: surveyId,
      title,
      description,
      questions,
    }

    return createdSurveyDetails
  } catch (error) {
    console.error('Anket oluşturulurken bir hata oluştu:', error)
    throw error
  }
}

export const updateSurvey = async (surveyId, updatedSurveyData) => {
  try {
    // Check if the survey exists
    const existingSurvey = await getSurveyDetailsById(surveyId)
    if (!existingSurvey) {
      console.error('Survey not found.')
      return null
    }

    // Update the survey title and description
    const updateSurveyQuery = `
      UPDATE public.survey
      SET survey_title = $1, survey_description = $2
      WHERE survey_id = $3
      RETURNING *
    `

    const updatedSurvey = await pg.one(updateSurveyQuery, [
      updatedSurveyData.title,
      updatedSurveyData.description,
      surveyId,
    ])

    // Update survey questions
    const deleteQuestionsQuery = `
      DELETE FROM public.survey_questions
      WHERE survey_id = $1
    `

    await pg.none(deleteQuestionsQuery, [surveyId])

    const insertSurveyQuestionsQuery = `
      INSERT INTO public.survey_questions (survey_types, title, options, survey_id)
      VALUES ($1, $2, $3, $4)
    `

    for (const question of updatedSurveyData.questions) {
      // Process options
      const processedOptions = JSON.stringify(question.questions[0].options)

      await pg.none(insertSurveyQuestionsQuery, [
        question.survey_types,
        question.title,
        processedOptions,
        surveyId,
      ])
    }

    console.log('Survey updated. Survey ID:', surveyId)

    return updatedSurvey
  } catch (error) {
    console.error('Error updating survey:', error)
    throw error
  }
}

export const getAllSurveys = async () => {
  try {
    const surveyQuery =
      'SELECT survey_id, created_date, user_id, survey_title, survey_description FROM survey '

    const surveys = await pg.many(surveyQuery)

    if (!surveys || surveys.length === 0) {
      return null
    }

    const surveyList = []

    for (const survey of surveys) {
      const surveyId = survey.survey_id

      const surveyDetails = await getSurveyDetailsById(surveyId)

      if (surveyDetails) {
        surveyList.push(surveyDetails)
      }
    }

    return surveyList
  } catch (error) {
    console.error('Anket verileri çekilirken bir hata oluştu:', error)
    throw error
  }
}

export const getSurveyDetailsById = async (surveyId) => {
  try {
    const survey = await pg.one('SELECT * FROM survey WHERE survey_id = $1', [
      surveyId,
    ])

    const surveyQuestions = await getSurveyQuestions(surveyId)

    if (survey && surveyQuestions) {
      return {
        survey_id: survey.survey_id,
        created_date: survey.created_date,
        user_id: survey.user_id,
        survey_title: survey.survey_title,
        survey_description: survey.survey_description,
        questions: surveyQuestions,
      }
    }

    return null
  } catch (error) {
    console.error('Anket detayları çekilirken bir hata oluştu:', error)
    throw error
  }
}

const getSurveyQuestions = async (surveyId) => {
  try {
    const surveyQuestions = await pg.manyOrNone(
      'SELECT * FROM survey_questions WHERE survey_id = $1',
      [surveyId],
    )

    return surveyQuestions
  } catch (error) {
    console.error('Anket soruları çekilirken bir hata oluştu:', error)
    throw error
  }
}

export const userResponseCreate = async (surveyResponse, userId) => {
  console.log('off', surveyResponse)

  try {
    const userQuery = 'SELECT id FROM public.users WHERE id = $1'
    const userData = await pg.oneOrNone(userQuery, [userId])
    if (!userData) {
      return null
    }

    // survey_id değerini kontrol et
    if (!surveyResponse.surveyId) {
      console.error('Anket ID bulunamadı.')
      return null
    }

    const insertResponseQuery = `
      INSERT INTO public.survey_response (user_id, survey_id, response_survey)
      VALUES ($1, $2, $3)
      RETURNING response_id
    `

    const { response_id: responseId } = await pg.one(insertResponseQuery, [
      userId,
      surveyResponse.surveyId, // survey_id değerini kullan
      JSON.stringify(surveyResponse),
    ])

    if (!responseId) {
      console.error('Anket ID alınamadı.')
      return null
    }

    return responseId
  } catch (error) {
    console.error('Anket oluşturulurken bir hata oluştu:', error)
    throw error
  }
}
