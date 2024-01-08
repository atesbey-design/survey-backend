import { UserOperation } from 'operations'
import { FastifyReply, FastifyRequest } from 'fastify'

// Sign-in handler
export const signinHandler = async (
  req: FastifyRequest<{
    Body: {
      password: string
      email: string
    }
  }>,
  res: FastifyReply,
) => {
  try {
    const { password, email } = req.body

    // Signing in user by using the UserOperation.signin method
    const result = await UserOperation.signin({
      email,
      password,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    })

    console.log({ result })

    // Responding based on the result of the sign-in operation
    if (result) {
      return res.code(200).send({ credentials: result })
    } else {
      return res.code(400).send({ message: 'Invalid credentials' })
    }
  } catch (err) {
    console.error('An error occurred:', err)
    return res.code(500).send({ message: 'Internal Server Error' })
  }
}

// Create user handler
export const createUserHandler = async (
  req: FastifyRequest<{
    Body: {
      username: string
      password: string
      email: string
    }
  }>,
  res: FastifyReply,
) => {
  try {
    const { username, password, email } = req.body

    // Creating a new user by using the UserOperation.createUser method
    const user = await UserOperation.createUser({
      username,
      password,
      email,
    })

    // Responding with the created user details
    return res.code(201).send({ user })
  } catch (err) {
    console.error('An error occurred:', err)
    return res.code(500).send({ message: 'Internal Server Error' })
  }
}

// Get all users handler
export const getAllUserHandler = async (req, res) => {
  try {
    // Getting all users by using the UserOperation.getAllUser method
    const users = await UserOperation.getAllUser()
    return res.code(200).send({ users })
  } catch (err) {
    console.error('An error occurred:', err)
    return res.code(500).send({ message: 'Internal Server Error' })
  }
}

// Check session handler
export const checkSession = async (req, rep) => {
  try {
    const credentials = req.body

    // Checking session by using the UserOperation.getCredentials method
    const result = await UserOperation.getCredentials(credentials, true)

    // Responding with session validation information
    return rep.code(200).send({
      valid: !!result,
      data: result || {},
      showInstructions: result?.showInstructions,
    })
  } catch (err) {
    console.error('An error occurred:', err)
    return rep.code(500).send({ message: 'Internal Server Error' })
  }
}

// Logout handler
export const logout = async (req, rep) => {
  try {
    const credentials = req.body

    // Getting credentials and destroying session by using UserOperation methods
    const result = await UserOperation.getCredentials(credentials)

    if (result) {
      await UserOperation.destroyCredentials(result.id)
    }

    // Responding after logging out
    return rep.code(200).send({})
  } catch (err) {
    console.error('An error occurred:', err)
    return rep.code(500).send({ message: 'Internal Server Error' })
  }
}

// Get user by ID handler
export const getUserById = async (
  request: FastifyRequest<{ Params: { userId: any } }>,
  reply: FastifyReply,
) => {
  try {
    const { userId } = request.params

    // Getting user by ID using UserOperation.getUserById method
    const user = await UserOperation.getUserById(userId)

    // Responding with the user details
    return reply.send(user)
  } catch (err) {
    console.error('An error occurred:', err)
    return reply.code(500).send({ message: 'Internal Server Error' })
  }
}
