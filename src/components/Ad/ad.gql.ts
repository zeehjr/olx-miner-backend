import { objectType, queryField, intArg } from 'nexus'
import AdModel from './AdModel'

export const Ad = objectType({
  name: 'Ad',
  definition: t => {
    t.string('adId')
    t.string('categoryId')
    t.string('category')
    t.string('title')
    t.string('link')
    t.string('img')
    t.float('price')
    t.string('location')
  },
})

export const QueryAds = queryField('ads', {
  type: Ad,
  list: true,
  args: {
    limit: intArg({
      default: 10,
      nullable: true,
    }),
    skip: intArg({
      default: 0,
      nullable: true,
    }),
  },
  resolve: (_, { limit, skip }) => {
    let qr = AdModel.find()
    if (limit) {
      qr = qr.limit(limit)
    }
    if (skip) {
      qr = qr.skip(skip)
    }
    return qr.exec()
  },
})
