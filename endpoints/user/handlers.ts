import { UserOperation } from 'operations'
import { FastifyReply, FastifyRequest } from 'fastify'

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

    const result = await UserOperation.signin({
      email,
      password,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    })

    console.log({ result })

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

    const user = await UserOperation.createUser({
      username,
      password,
      email,
    })

    return res.code(201).send({ user })
  } catch (err) {
    console.error('An error occurred:', err)
    return res.code(500).send({ message: 'Internal Server Error' })
  }
}

export const getAllUserHandler = async (req, res) => {
  try {
    const users = await UserOperation.getAllUser()
    return res.code(200).send({ users })
  } catch (err) {
    console.error('An error occurred:', err)
    return res.code(500).send({ message: 'Internal Server Error' })
  }
}

export const checkSession = async (req, rep) => {
  try {
    const credentials = req.body

    const result = await UserOperation.getCredentials(credentials, true)

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

export const logout = async (req, rep) => {
  try {
    const credentials = req.body
    console.log(credentials)

    const result = await UserOperation.getCredentials(credentials)

    if (result) {
      await UserOperation.destroyCredentials(result.id)
    }

    return rep.code(200).send({})
  } catch (err) {
    console.error('An error occurred:', err)
    return rep.code(500).send({ message: 'Internal Server Error' })
  }
}

export const getUserById = async (
  request: FastifyRequest<{ Params: { userId: any } }>,
  reply: FastifyReply,
) => {
  try {
    const { userId } = request.params
    const user = await UserOperation.getUserById(userId)
    return reply.send(user)
  } catch (err) {
    console.error('An error occurred:', err)
    return reply.code(500).send({ message: 'Internal Server Error' })
  }
}
