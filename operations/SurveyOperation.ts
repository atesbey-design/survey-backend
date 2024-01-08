import { pg } from 'interceptors/Postgres'
import { server } from '../igniteServer'
import { FastifyReply, FastifyRequest } from 'fastify'
import { SurveyTypes } from '../endpoints/survey/handlers'

// Function to create a new survey
export const createSurvey = async (surveyData, userId) => {
  const { title, description, questions } = surveyData;

  try {
    // Check if the user exists
    const userQuery = 'SELECT id FROM public.users WHERE id = $1'
    const userData = await pg.oneOrNone(userQuery, [userId])
    if (!userData) {
      return null
    }

    // Insert survey details into the database
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
      console.error('Survey ID not obtained.')
      return null
    }

    // Insert survey questions into the database
    const insertSurveyQuestionsQuery = `
      INSERT INTO public.survey_questions (survey_types, title, options, survey_id)
      VALUES ($1, $2, $3, $4)
    `

    for (const question of questions) {
      // Process options
      const processedOptions = JSON.stringify(question.questions[0].options)

      await pg.none(insertSurveyQuestionsQuery, [
        question.survey_types,
        question.title,
        processedOptions,
        surveyId,
      ])
    }

    console.log('Survey created. Survey ID:', surveyId)

    const createdSurveyDetails = {
      survey_id: surveyId,
      title,
      description,
      questions,
    }

    return createdSurveyDetails
  } catch (error) {
    console.error('An error occurred while creating a survey:', error)
    throw error
  }
}

// Function to update an existing survey
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

// Function to get details of all surveys
export const getAllSurveys = async () => {
  try {
    // Query to retrieve basic survey information
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
    console.error('An error occurred while fetching survey data:', error)
    throw error
  }
}

// Function to get details of a specific survey by ID
export const getSurveyDetailsById = async (surveyId) => {
  try {
    // Query to retrieve detailed survey information
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
    console.error('An error occurred while fetching survey details:', error)
    throw error
  }
}

// Function to get survey questions by survey ID
const getSurveyQuestions = async (surveyId) => {
  try {
    // Query to retrieve survey questions
    const surveyQuestions = await pg.manyOrNone(
      'SELECT * FROM survey_questions WHERE survey_id = $1',
      [surveyId],
    )

    return surveyQuestions
  } catch (error) {
    console.error('An error occurred while fetching survey questions:', error)
    throw error
  }
}

// Function to record user responses to a survey
export const userResponseCreate = async (surveyResponse, userId) => {
  try {
    // Check if the user exists
    const userQuery = 'SELECT id FROM public.users WHERE id = $1'
    const userData = await pg.oneOrNone(userQuery, [userId])
    if (!userData) {
      return null
    }

    // Check if the survey ID is provided
    if (!surveyResponse.surveyId) {
      console.error('Survey ID not provided.')
      return null
    }

    // Insert the user's response into the database
    const insertResponseQuery = `
      INSERT INTO public.survey_response (user_id, survey_id, response_survey)
      VALUES ($1, $2, $3)
      RETURNING response_id
    `

    const { response_id: responseId } = await pg.one(insertResponseQuery, [
      userId,
      surveyResponse.surveyId,
      JSON.stringify(surveyResponse),
    ])

    if (!responseId) {
      console.error('Response ID not obtained.')
      return null
    }

    return responseId
  } catch (error) {
    console.error('An error occurred while creating a survey response:', error)
    throw error
  }
}
