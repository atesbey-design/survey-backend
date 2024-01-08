import { JWT } from '@fastify/jwt'
import { pg } from './Postgres'
import { FastifyInstance } from 'fastify'

// Interface defining the structure of a user session
export interface ISession {
  id: string
  email: string
  username: string
}

// Augment the FastifyRequest and FastifyInstance interfaces to include session and jwt properties
declare module 'fastify' {
  export interface FastifyRequest {
    session: ISession
  }

  export interface FastifyInstance {
    jwt: JWT
  }
}

// Middleware function to authenticate requests using JWT tokens
export const Authenticator = (app) => async (req, rep) => {
  // Extract the token from the request headers
  const token = req.headers.credentials

  // Check if the token is missing
  if (!token) {
    return rep.status(401).send({ message: 'Unauthorized' })
  }

  // Query the user_credentials table to check if the token is valid and not destroyed
  const credentials = await pg.query(
    'SELECT * FROM user_credentials WHERE credential = $1 AND destroyed_at IS NULL',
    [token],
  )

  // Check if credentials are not found or the token is destroyed
  if (!credentials || credentials.length === 0) {
    return rep.status(401).send({ message: 'Unauthorized' })
  }

  // Decode the JWT token
  const session = app.jwt.decode(token as string)

  // Assign the decoded session to the request object
  req.session = session as ISession

  // Assign the user_id from the credentials to the session
  req.session.id = credentials[0].user_id
}

// Function to add authentication hook to the Fastify instance
export const Authentication = async function (app: FastifyInstance) {
  // Add the Authenticator middleware to the preValidation hook
  app.addHook('preValidation', Authenticator(app))

  // Additional logic can be added here if needed

  // return 0; // (This line is commented out as it doesn't seem to have a clear purpose)
}

// Export the Authentication function as the default export
export default Authentication
