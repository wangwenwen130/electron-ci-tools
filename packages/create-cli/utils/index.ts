import { join } from 'path'
import { PackageJson } from 'type-fest'
import { textColor } from './textColor'
import fs from 'fs'

export const getPackage = (path: string): Promise<PackageJson> => {
  console.log(
    textColor.magenta('try get package.json'),
    join(process.cwd()),
    textColor.magenta(path)
  )
  return new Promise((resolve, reject) => {
    fs.readFile(join(process.cwd(), path, 'package.json'), (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(JSON.parse(data.toString()))
      }
    })
  })
}

let config: {
  name: string
  version: string
  innerVersion: string
  testVersion: string
  productName: string
  output: string
  cloudDir: string
  ossDir: string
}
export const getConfig = async (path: string) => {
  if (config) return config
  const { name, version, innerVersion, testVersion, cloudDir, ossDir, build } =
    await getPackage(path)
  const {
    productName,
    directories: { output }
  } = build as any
  return (config = {
    name: name || '',
    version: version || '',
    innerVersion: (innerVersion as string) || '',
    testVersion: (testVersion as string) || '',
    productName,
    output,
    cloudDir: (cloudDir as string) || '',
    ossDir: (ossDir as string) || ''
  })
}
