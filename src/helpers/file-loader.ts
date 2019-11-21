import glob from 'glob'

const flattenArray = (array: any[]) => {
  if (!Array.isArray(array)) {
    if (!array) return []
    return [array]
  }

  let returnArray: any[] = []

  array.forEach(item => {
    if (Array.isArray(item)) {
      returnArray = [...returnArray, ...flattenArray(item)]
      return
    }

    if (item) {
      returnArray = [...returnArray, item]
    }
  })

  return returnArray
}

const importFile = async (file: string) => {
  const importedFile = await import('../' + file)

  const fileExports: any[] = Object.values(importedFile)

  return fileExports.map(value => flattenArray(value))
}

export const importAllFromGlob = (str: string): Promise<any[]> =>
  new Promise((resolve, reject) => {
    glob(str, { cwd: 'src' }, (err, files) => {
      if (err) {
        reject(err)
        return
      }

      Promise.all(files.map(importFile)).then(importedFiles => {
        resolve(flattenArray(importedFiles))
      })
    })
  })
