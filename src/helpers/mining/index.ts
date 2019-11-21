import axios from 'axios'
import { JSDOM } from 'jsdom'
import { default as Iconv } from 'iconv'
import AdModel, { Ad } from '../../components/Ad/AdModel'
import { CrawlerDefinitions, CrawlerDataResult, GetCrawlerResult } from './crawler'

const categoryMap = {
  electronics: '/eletronicos-e-celulares',
  smartphones: '/celulares',
}

const locationMap = {
  curitibaParanagua: '/regiao-de-curitiba-e-paranagua',
  pgGuarapuava: '/regiao-de-ponta-grossa-e-guarapuava',
}

const BASE_URL = 'https://pr.olx.com.br'

type MiningCategory = 'electronics' | 'smartphones'
type MiningLocation = 'curitibaParanagua' | 'pgGuarapuava'

const createUrl = (category: MiningCategory, location: MiningLocation, page: number) => {
  return `${BASE_URL}${locationMap[location]}${categoryMap[category]}?sf=1${page > 1 ? `&o=${page}` : ''}`
}

// t.string('id')
// t.string('category_id')
// t.string('category')
// t.string('title')
// t.string('link')
// t.string('img')
// t.string('price')
// t.string('location')

function toUTF8(body: string) {
  // convert from iso-8859-1 to utf-8
  const ic = new Iconv('iso-8859-1', 'utf-8')
  const buf = ic.convert(body)
  return buf.toString('utf-8')
}

type AdElements = {
  [key: string]: Element
}

const extractDataFromElement = (element: Element): CrawlerDataResult => {
  const crawlerData: CrawlerDefinitions = {
    adId: { valueLocation: 'attribute', attributeName: 'id' },
    categoryId: { selector: '.detail-category:nth-child(0)', valueLocation: 'innerHTML' },
    category: { selector: '.detail-category', valueLocation: 'innerHTML' },
    title: { valueLocation: 'attribute', attributeName: 'title' },
    link: { valueLocation: 'attribute', attributeName: '' },
    img: { valueLocation: 'attribute', attributeName: '' },
    price: { selector: '.OLXad-list-price', valueLocation: 'innerHTML' },
    location: { selector: '.detail-region', valueLocation: 'innerHTML' },
  }

  const result = GetCrawlerResult(element, crawlerData)

  return result
}

const clearString = (str: string): string => {
  if (str == null) return str
  return str.replace(/[\r\n\t]+/gm, '').trim()
}

const extractAds = (data: string): Ad[] => {
  const doc = new JSDOM(data)

  const ads = Array.from(doc.window.document.querySelectorAll('.OLXad-list-link'))

  if (ads.length === 0) return []

  return ads.map(
    (ad): Ad => {
      const result = extractDataFromElement(ad)

      return {
        adId: result['adId'],
        category: clearString(result['category']),
        categoryId: result['categoryId'],
        img: result['img'],
        link: result['link'],
        location: clearString(result['location']),
        price: result['price'] == null ? 0 : parseFloat(clearString(result['price'].replace('R$', ''))),
        title: result['title'],
      }
    },
  )
}

export const minePage = async (category, location, page) => {
  const url = createUrl(category, location, page)

  const response = await axios.get(url, {
    responseType: 'arraybuffer',
  })

  const ads = extractAds(toUTF8(response.data))

  return ads
}

export const mine = async (category, location, pages) => {
  const arr = await Promise.all(
    Array.from(new Array(pages)).map(async (v, idx) => minePage(category, location, idx + 1)),
  )

  const flattened = arr.reduce((prev, cur) => [...prev, ...cur])

  console.log(flattened.length)

  await AdModel.insertMany(flattened)

  console.log('everything was inserted')

  return flattened
}
