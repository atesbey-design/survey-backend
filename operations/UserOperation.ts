import { pg } from 'interceptors/Postgres'
import { server } from '../igniteServer'
import crypto from 'crypto'

// Function to create a new user
export const createUser = async (data: {
  email: string
  username: string
  password: string
}) => {
  const { email, username, password } = data

  // Check if the user already exists
  const existingUser = await pg.oneOrNone(
    'SELECT * FROM users WHERE email = $[email]',
    {
      email,
    },
  )

  if (existingUser) {
    console.error(`User with email ${email} already exists. Please try to login.`)
    return null
  }

  // Hash the password using MD5
  const md5Password = crypto.createHash('md5').update(password).digest('hex')

  // Insert the new user into the database
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
      if (result) {
        return result
      }
      return null
    })
    .catch((err) => {
      console.error('Error creating user:', err)
    })

  return user
}

// Function to sign in a user
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
  // Hash the password using MD5
  const md5Password = crypto.createHash('md5').update(password).digest('hex')

  // Retrieve user details by email
  const user = await pg.one('SELECT * FROM users WHERE email = $[email]', {
    email,
  })

  if (!user || md5Password !== user.password) {
    return null
  }

  // Sign and generate a JWT token
  const credential = server.jwt.sign({
    email,
    password: md5Password,
  })

  // Save user credentials with user agent and IP address
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

// Function to get details of all users
export const getAllUser = async () => {
  // Retrieve all users from the database
  const users = await pg
    .many('SELECT * FROM users')
    .then((result) => {
      if (result) {
        return result
      }
      return null
    })
    .catch((err) => {
      console.error('Error fetching all users:', err)
    })

  return users
}

// Function to destroy user credentials
export const destroyCredentials = async (token: string) => {
  try {
    // Update the user credentials with the destroyed timestamp
    const credential = await pg.oneOrNone(
      'UPDATE user_credentials SET destroyed_at = NOW() WHERE credential = $[token] RETURNING *',
      {
        token,
      },
    )

    if (credential !== null) {
      return credential
    } else {
      throw new Error('Credential destruction failed: No matching credential found')
    }
  } catch (error) {
    throw new Error(`Credential destruction failed: ${error.message}`)
  }
}

// Function to get user credentials
export const getCredentials = async (token: string, validity: boolean = false) => {
  // Retrieve user credentials based on the provided token and validity flag
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

// Function to get user details by ID
export const getUserById = async (userId: any) => {
  // Retrieve user details by ID
  const user = await pg.oneOrNone('SELECT * FROM users WHERE id = $[userId]', {
    userId,
  })

  return user
}
