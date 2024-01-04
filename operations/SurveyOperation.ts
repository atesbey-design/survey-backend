import { pg } from 'interceptors/Postgres'
import { server } from '../igniteServer'

// -- Table: public.questions

// -- DROP TABLE IF EXISTS public.questions;

// CREATE TABLE IF NOT EXISTS public.questions
// (
//     question_id integer NOT NULL DEFAULT nextval('questions_question_id_seq'::regclass),
//     question_data survey,
//     CONSTRAINT questions_pkey PRIMARY KEY (question_id)
// )

// TABLESPACE pg_default;

// ALTER TABLE IF EXISTS public.questions
//     OWNER to survey_ikag_user;

// -- Table: public.survey

// -- DROP TABLE IF EXISTS public.survey;

// CREATE TABLE IF NOT EXISTS public.survey
// (
//     id uuid NOT NULL DEFAULT uuid_generate_v4(),
//     survey_type survey_types NOT NULL,
//     title text COLLATE pg_catalog."default",
//     options jsonb,
//     created_at timestamp without time zone DEFAULT now(),
//     CONSTRAINT survey_pkey PRIMARY KEY (id)
// )

// TABLESPACE pg_default;

// ALTER TABLE IF EXISTS public.survey
//     OWNER to survey_ikag_user;

// -- Table: public.user_responses

// -- DROP TABLE IF EXISTS public.user_responses;

// CREATE TABLE IF NOT EXISTS public.user_responses
// (
//     response_id uuid NOT NULL,
//     user_id uuid NOT NULL,
//     question_id uuid NOT NULL,
//     response_value jsonb,
//     CONSTRAINT user_responses_pkey PRIMARY KEY (response_id)
// )

// TABLESPACE pg_default;

// ALTER TABLE IF EXISTS public.user_responses
//     OWNER to survey_ikag_user;

export const createSurvey = async (data: {
  survey_type: string
  title: string
  options: string
}) => {
  try {
    const { survey_type, title, options } = data
    const survey = await pg.one(
      'INSERT INTO survey (survey_type, title, options) VALUES ($1, $2, $3) RETURNING *',
      [survey_type, title, options],
    )
    console.log({ survey })
    return survey
  } catch (error) {
    console.error('Error creating survey:', error)
    return null
  }
}

export const getSurvey = async () => {
  try {
    const surveys = await pg.any('SELECT * FROM survey')
    console.log({ surveys })
    return surveys
  } catch (error) {
    console.error('Error getting surveys:', error)
    return null
  }
}

export const createQuestion = async (data: { question_data: string }) => {
  try {
    const { question_data } = data
    const question = await pg.one(
      'INSERT INTO questions (question_data) VALUES ($1) RETURNING *',
      [question_data],
    )
    console.log({ question })
    return question
  } catch (error) {
    console.error('Error creating question:', error)
    return null
  }
}

export const getQuestion = async () => {
  try {
    const questions = await pg.any('SELECT * FROM questions')
    console.log({ questions })
    return questions
  } catch (error) {
    console.error('Error getting questions:', error)
    return null
  }
}

export const createUserResponse = async (data: {
  response_id: string
  user_id: string
  question_id: string
  response_value: string
}) => {
  try {
    const { response_id, user_id, question_id, response_value } = data
    const userResponse = await pg.one(
      'INSERT INTO user_responses (response_id, user_id, question_id, response_value) VALUES ($1, $2, $3, $4) RETURNING *',
      [response_id, user_id, question_id, response_value],
    )
    console.log({ userResponse })
    return userResponse
  } catch (error) {
    console.error('Error creating user response:', error)
    return null
  }
}

export const getUserResponse = async () => {
  try {
    const userResponses = await pg.any('SELECT * FROM user_responses')
    console.log({ userResponses })
    return userResponses
  } catch (error) {
    console.error('Error getting user responses:', error)
    return null
  }
}

export const getUserResponseById = async (id: string) => {
  try {
    const userResponses = await pg.any(
      'SELECT * FROM user_responses WHERE user_id = $1',
      [id],
    )
    console.log({ userResponses })
    return userResponses
  } catch (error) {
    console.error('Error getting user responses by ID:', error)
    return null
  }
}

export const getSurveyById = async (id: string) => {
  try {
    const survey = await pg.any('SELECT * FROM survey WHERE id = $1', [id])
    console.log({ survey })
    return survey
  } catch (error) {
    console.error('Error getting survey by ID:', error)
    return null
  }
}

export const getQuestionById = async (id: string) => {
  try {
    const question = await pg.any(
      'SELECT * FROM questions WHERE question_id = $1',
      [id],
    )
    console.log({ question })
    return question
  } catch (error) {
    console.error('Error getting question by ID:', error)
    return null
  }
}
