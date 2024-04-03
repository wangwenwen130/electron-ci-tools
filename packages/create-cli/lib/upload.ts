// 编译
import shelljs from 'shelljs'
import { program } from 'commander'
import { textColor } from '../utils/textColor'
import { nextUploadFile, UpInfo } from '../utils/nextcloudUpload'
import { ossUploadFile } from '../utils/ossFileUpload'
import { getConfig } from '../utils/index'
import path from 'path'

const getCfg = async (filePath: string) => {
  const options = program.opts()
  let odir = ''
  let cdir = ''
  const files = shelljs.find(filePath).filter((file) => file.match(/package\.json$/))
  if (files.length) {
    const { ossDir, cloudDir } = await getConfig(filePath).catch(() => {
      return {
        ossDir: '',
        cloudDir: ''
      }
    })
    odir = ossDir
    cdir = cloudDir
  }
  const { ossDir, cloudDir, mode, oss, cloud } = options as {
    ossDir: string
    cloudDir: string
    mode: 'production' | 'test' | 'uat' | 'development'
    oss: boolean
    cloud: boolean
  }
  return {
    ossDir: ossDir || odir,
    cloudDir: cloudDir || cdir,
    mode: mode || 'production',
    isOss: oss || false,
    isCloud: cloud || false
  }
}
const initOptions = () => {
  program.option('--cloudDir <path>', '云盘上传的项目目录 例如：自助机程序 掌沃住')
  program.option('--ossDir <path>', '云盘上传的项目目录 例如: zhj wxz')
  program.option('--oss', '上传到那个oss服务器')
  program.option('--cloud', '上传到那个cloud服务器')
}

export const initUploadAction = () => {
  initOptions()
  program
    .command('upload <filepath> [remotePath]')
    .description('upload to oss')
    .action(async (filepath: string, remotePath: string) => {
      const { ossDir, cloudDir, mode, isCloud, isOss } = await getCfg('./')
      if (!ossDir && !cloudDir && !remotePath) {
        console.log(textColor.red('请输入要上传的地址'))
        process.exit(1)
      }
      if (remotePath && (isCloud || isOss)) {
        if (isCloud) cloudUpload({ remotePath, filePath: filepath, mode })
        if (isOss) ossUpload({ remotePath, filePath: filepath, mode })
      } else if (!ossDir && !cloudDir) {
        console.log(
          textColor.green('请输入') +
            textColor.yellow('--oss') +
            '(上传到oss) 或 ' +
            textColor.yellow('--cloud') +
            '(上传到云盘)'
        )
      }
      if (ossDir) {
        ossUpload({ dirName: ossDir, filePath: filepath, mode })
      } else if (cloudDir) {
        cloudUpload({ dirName: ossDir, filePath: filepath, mode })
      }
    })
}

type Params = Partial<UpInfo> & {
  filePath: string
  dirName?: string
  mode: 'production' | 'test' | 'uat' | 'development'
}

const isExist = (path: string) => {
  const files = shelljs.find(path)
  return files.length > 0
}

const ossUpload = (data: Params) => {
  console.log('basename', data.filePath)
  const fileName = path.basename(data.filePath)
  if (!isExist(data.filePath)) {
    console.log(textColor.red('文件不存在'))
    process.exit(1)
  }
  ossUploadFile({ ...data, fileName })
    .then(() => {
      console.log(fileName, textColor.green('上传成功'))
    })
    .catch(() => {
      console.log(fileName, textColor.red('上传失败'))
    })
}
const cloudUpload = (data: Params) => {
  const fileName = path.basename(data.filePath)
  if (!isExist(data.filePath)) {
    console.log(textColor.red('文件不存在'))
    process.exit(1)
  }
  nextUploadFile({
    ...data,
    fileName
  })
    .then(() => {
      console.log(fileName, textColor.green('上传成功'))
    })
    .catch(() => {
      console.log(fileName, textColor.red('上传失败'))
    })
}
