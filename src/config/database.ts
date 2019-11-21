import { createConnection } from 'mongoose'

export const olxDatabase = createConnection('mongodb://zeeh:zeeh@localhost:27017/olx?authSource=admin', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
