import fs from 'fs'
import { FastifyInstance } from 'fastify'
import Config, { INDEV } from '../data/config'
import Pgp from 'pg-promise'
import { spawn } from 'child_process'
import process from 'node:process'

declare module 'fastify' {
  interface FastifyInstance {
    pg: any
  }
}

function cameliseColumnNames1 (data) {
  const tmp = data[0]
  for (let prop in tmp) {
    const camel = pgp.utils.camelize(prop)
    if (!(camel in tmp)) {
      for (let i = 0; i < data.length; i++) {
        const d = data[i]
        d[camel] = d[prop]
        delete d[prop]
      }
    }
  }

  return data
}

// "Cannot set properties of undefined (setting 'rows')" bug

const pgp = Pgp({
  capSQL: true,
  receive: ((data: any[], result: any, ctx: any) => {
    const camelised = cameliseColumnNames1(data)
    if (camelised && result) {
      result.rows = camelised
    }
  }) as any,
})

// pg-promise connection
export const pg = pgp(Config.db)

export const pgInstance = () => {
  if (pg) {
    return pg
  }

  return pgp(Config.db)
}

export const Postgres = async function (app: FastifyInstance) {
  if (INDEV) {
    const pg = (app.pg = pgInstance())
    return
  }
}

export default Postgres
