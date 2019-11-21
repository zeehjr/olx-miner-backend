import { olxDatabase } from '../../config/database'
import { Schema, Document } from 'mongoose'

export interface Ad {
  adId: string
  categoryId: string
  category: string
  title: string
  link: string
  img: string
  price: number
  location: string
}

export type AdDocument = Document & Ad

const schema = new Schema({
  adId: Schema.Types.String,
  categoryId: Schema.Types.String,
  category: Schema.Types.String,
  title: Schema.Types.String,
  link: Schema.Types.String,
  img: Schema.Types.String,
  price: Schema.Types.Number,
  location: Schema.Types.String,
})

export default olxDatabase.model<AdDocument>('ads', schema, 'ads')
