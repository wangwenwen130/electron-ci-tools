import OSS from 'ali-oss'
import path from 'path'
import { textColor } from './textColor'

const baseConfig = (dir: string, env: string) => {
  return {
    updatePath: `packages/${env}/${dir}/updatePackage/`,
    setupPath: `packages/${env}/${dir}/setupPackage/`
  }
}

const client = new OSS({})

// 自定义请求头
const headers = {}

export type UpInfo = {
  filePath: string
  remotePath?: string
  fileName: string
  mode: 'production' | 'test' | 'uat' | 'development'
  dirName?: string
}

export async function ossUploadFile(info: UpInfo) {
  let serverPath = ''
  if (info.remotePath) {
    serverPath = path.join(path.dirname(info.remotePath), info.fileName)
  } else if (info.dirName) {
    const { updatePath, setupPath } = baseConfig(info.dirName, info.mode)
    serverPath = info.dirName.includes('exe') ? setupPath : updatePath
    serverPath = serverPath + info.fileName
  }

  console.log('serverPath', textColor.yellow(serverPath))
  console.log('filePath', textColor.yellow(info.filePath))

  return new Promise((resolve, reject) => {
    client.put(serverPath, path.normalize(info.filePath), { headers }).then((res: any) => {
      if (res.res.statusCode === 200) {
        resolve(res)
      } else {
        reject('上传失败')
      }
    })
  })
}
