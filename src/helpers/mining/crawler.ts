export interface CrawlerItem {
  selector?: string
  valueLocation: 'value' | 'innerHTML' | 'attribute'
  attributeName?: string
}

export interface CrawlerDefinitions {
  [key: string]: CrawlerItem
}

export interface CrawlerDataResult {
  [key: string]: any
}

export const GetCrawlerResult = (element: Element, definitions: CrawlerDefinitions): CrawlerDataResult => {
  const keys = Object.keys(definitions)

  const result: CrawlerDataResult = {}

  keys.forEach(key => {
    const def = definitions[key]

    let elem: Element | null = element

    if (def.selector != null) {
      elem = element.querySelector(def.selector)
    }

    if (elem == null) {
      result[key] = null
      return
    }

    if (def.valueLocation === 'value') {
      const valueAttr = elem.attributes.getNamedItem('value')
      if (valueAttr == null) {
        result[key] = null

        return
      }
      result[key] = valueAttr.value

      return
    }

    if (def.valueLocation === 'innerHTML') {
      result[key] = elem.innerHTML
      return
    }

    if (def.valueLocation === 'attribute') {
      if (def.attributeName == null) {
        result[key] = null

        return
      }

      const attr = elem.attributes.getNamedItem(def.attributeName)

      if (attr == null) {
        result[key] = null

        return
      }

      result[key] = attr.value

      return
    }
  })

  return result
}
