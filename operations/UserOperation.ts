import { pg } from 'interceptors/Postgres'
import { server } from '../igniteServer'
import crypto from 'crypto'

export const createUser = async (data: {
  email: string
  username: string
  password: string
}) => {
  const { email, username, password } = data
  const existingUser = await pg.oneOrNone(
    'SELECT * FROM users WHERE email = $[email]',
    {
      email,
    },
  )

  if (existingUser) {
    console.error(
      `User with email ${email} already exists. Please try to login.`,
    )

    return null
  }
  const md5Password = crypto.createHash('md5').update(password).digest('hex')

  const user = await pg
    .one(
      'INSERT INTO users (email, username, password) VALUES ($[email], $[username], $[md5Password]) RETURNING *',
      {
        email,
        username,
        md5Password,
      },
    )
    .then((result) => {
      console.log({ result })
      if (result) {
        return result
      }
      return null
    })
    .catch((err) => {
      console.error('err', err)
    })
  return user
}

export const signin = async ({
  email,
  password,
  userAgent,
  ip,
}: {
  email: string
  password: string
  userAgent: string
  ip: string
}) => {
  const md5Password = crypto.createHash('md5').update(password).digest('hex')

  const user = await pg.one('SELECT * FROM users WHERE email = $[email]', {
    email,
  })

  if (!user) {
    return null
  }
  const passwordMatch = md5Password === user.password
  if (!passwordMatch) {
    return null
  }
  const credential = server.jwt.sign({
    email,
    password: md5Password,
  })

  await pg.one(
    'INSERT INTO user_credentials (user_id, useragent, created_ip, credential) VALUES ($[user_id], $[useragent], $[created_ip], $[credential]) RETURNING *',
    {
      user_id: user.id,
      useragent: userAgent,
      created_ip: ip,
      credential,
    },
  )

  return credential
}

export const getAllUser = async () => {
  const users = await pg
    .many('SELECT * FROM users')
    .then((result) => {
      console.log({ result })
      if (result) {
        return result
      }
      return null
    })
    .catch((err) => {
      console.error('err', err)
    })
  return users
}
export const destroyCredentials = async (token: string) => {
  console.log(token)
  try {
    const credential = await pg.oneOrNone(
      'UPDATE user_credentials SET destroyed_at = NOW() WHERE credential = $[token] RETURNING *',
      {
        token,
      },
    )

    if (credential !== null) {
      return credential
    } else {
      throw new Error(
        'Credential destruction failed: No matching credential found',
      )
    }
  } catch (error) {
    throw new Error(`Credential destruction failed: ${error.message}`)
  }
}

export const getCredentials = async (
  token: string,
  validity: boolean = false,
) => {
  const credential = await pg.oneOrNone(
    `SELECT *,
      (SELECT count(id) FROM user_credentials WHERE user_id = user_credentials.user_id) AS signin_count
    FROM user_credentials
    WHERE credential = $1 ${
      validity ? 'AND destroyed_at IS NULL' : 'AND destroyed_at IS NOT NULL'
    }
    ORDER BY created_at DESC
    LIMIT 1`,
    [token],
  )

  if (credential) {
    return {
      id: credential.user_id,
      showInstructions: Number(credential.signin_count) < 2,
    }
  }

  return null
}

export const getUserById = async (userId: any) => {
  const user = await pg.oneOrNone('SELECT * FROM users WHERE id = $[userId]', {
    userId,
  })

  return user
}
