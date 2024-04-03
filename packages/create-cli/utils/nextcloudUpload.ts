// @ts-ignore
import Upload from 'nextcloud-chunk-file-upload'
import path from 'path'
import { textColor } from './textColor'

const upload = new Upload()

const cloudPath = {
  production: {
    setup: 'RH/1.睿沃程序包/6.沃享住/1.正式/'
  },
  test: {
    setup: 'RH/1.睿沃程序包/6.沃享住/2.测试/'
  },
  uat: {
    setup: 'RH/1.睿沃程序包/6.沃享住/2.测试/'
  },
  development: {
    setup: 'RH/1.睿沃程序包/6.沃享住/3.开发/'
  }
}

export type UpInfo = {
  filePath: string
  fileName: string
  remotePath?: string
  mode: 'production' | 'test' | 'uat' | 'development'
}
export function nextUploadFile(info: UpInfo) {
  let serverPath
  if (info.remotePath) {
    serverPath = path.join(path.dirname(info.remotePath), info.fileName)
  } else {
    serverPath = cloudPath[info.mode].setup + '/' + info.fileName
  }
  console.log('serverPath', textColor.yellow(serverPath))
  console.log('filePath', textColor.yellow(info.filePath))

  return new Promise((resolve, reject) => {
    upload
      .uploadFile(info.filePath, encodeURIComponent(serverPath!), 5 * 1024 * 1024, undefined, true)
      .then(() => {
        resolve(true)
      })
  })
}
