// 编译
import shelljs from 'shelljs'
import { program } from 'commander'
import { execShell, printLog } from '../utils/shelljsLog'
import { textColor } from '../utils/textColor'
import { getConfig } from '../utils/index'
import esbuild from 'esbuild'
import compressing from 'compressing'
import { Arch, build as eleBuilder, Platform } from 'electron-builder'
import { join, dirname } from 'path'
import fs from 'fs'

const initOptions = () => {
  program.option('--mainEntryDir <entrypath>', '入口文件 <entryDir>')
  program.option('--mainOutDir <entrypath>', '入口文件 <outDir>')
}

export const initPackAction = () => {
  program
    .command('pack [dir] [data...]')
    .description('打包项目')
    .action((dir: string, data: string[]) => {
      dir && shelljs.cd(dir)
      console.log(
        textColor.green('***** ') + '切换到当前目录：' + textColor.green(shelljs.pwd().stdout)
      )

      const files = shelljs.find('./').filter((file) => file.match(/vite.config\.ts$/))
      if (!files.length) {
        console.log(textColor.red('未找到vite.config.ts文件，请检查目录是否正确'))
        process.exit(1)
      }
      toBuild(dir)
    })
}

const toBuild = async (dir: string) => {
  webPack()
  await electronPack(dir)
  await renderUpdatePack()
}

const webPack = () => {
  const options = program.opts()
  console.log(textColor.magenta('web vite building...'))
  const command = 'node ./node_modules/vite/bin/vite.js build'
  if (options.mode) {
    execShell(command + ` --mode ${options.mode}`, true)
  } else {
    execShell(command, true)
  }
  console.log(textColor.green('✔ web vite build success'))
}

const electronPack = async (dir: string) => {
  const options = program.opts()

  const mainFile = options.mainEntryDir ? options.mainEntryDir + '/main.ts' : 'electron/main.ts'
  const preloadFile = options.mainEntryDir
    ? options.mainEntryDir + '/preload.ts'
    : 'electron/preload.ts'

  const outFile = dir + '/' + (options.mainOutDir ? options.mainOutDir : 'bundle')

  esbuild.buildSync({
    entryPoints: [join(process.cwd(), mainFile), join(process.cwd(), preloadFile)],
    bundle: true,
    minify: true,
    packages: 'external',
    platform: 'node',
    outdir: outFile
  })

  console.log(`${textColor.green('✔')} 代码压缩目录：${textColor.green(outFile)} `)

  const { version, innerVersion, testVersion, productName, output } = await getConfig('./')

  shelljs.rm('-rf', join(process.cwd(), output))

  return eleBuilder({
    targets: Platform.WINDOWS.createTarget(['nsis'], Arch.ia32),
    config: {
      afterSign: async (context) => {
        await renderUpdateInfo(context.appOutDir)
      }
    }
  })
    .then((result) => {
      const ver = [version, innerVersion, testVersion].join('-')
      const fileName = productName + ' Setup ' + ver + '.exe'
      fs.renameSync(result[1], join(dirname(result[1]), fileName))
      console.log(`${textColor.green('✔')} 安装包：${textColor.green(fileName)} 创建成功 `)
    })
    .catch((error) => {
      console.error(error)
    })
}

const renderUpdateInfo = async (dir: string) => {
  const { productName, version, innerVersion } = await getConfig('./')
  fs.writeFileSync(
    join(dir, 'Update.json'),
    JSON.stringify(
      {
        version: [version, innerVersion].join('-'),
        productName
      },
      null,
      2
    )
  )
  console.log(`${textColor.green('✔')}  升级文件 ${textColor.green('Update.json')} 创建成功 `)
}

const renderUpdatePack = async () => {
  const { output, productName, version, innerVersion } = await getConfig('./')
  const resource = join(process.cwd(), output, 'win-ia32-unpacked')
  const dirName = productName + 'V' + [version, innerVersion].join('-')
  const comPressName = productName + 'V' + [version, innerVersion].join('-') + '.zip'
  const newRes = join(process.cwd(), output, dirName)
  fs.renameSync(resource, newRes)
  return compressing.zip
    .compressDir(newRes, join(process.cwd(), output, comPressName), { zipFileNameEncoding: 'gbk' })
    .then(() => {
      console.log(`${textColor.green('✔')} 升级包 ${textColor.green(comPressName)} 创建成功`)
    })
    .catch((err) => {
      console.log(err)
    })
}
