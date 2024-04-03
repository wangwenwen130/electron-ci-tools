import shelljs from 'shelljs'
import { program } from 'commander'
import { execShell, getCloneName, printLog } from '../utils/shelljsLog'
import { textColor } from '../utils/textColor'

const isHasGit = !!shelljs.which('git')

if (!isHasGit) {
  console.log(textColor.red('请安装 git'))
  process.exit(1)
}

const baseGitUrl = 'https://git.resthour.net/amp-front/'

export const initGitAction = () => {
  program.option('--branch <name>', '项目分支')
  program.option('--url <path>', '项目克隆地址')
  program.option('--project <name>', '项目名称')
  program.option('--clonedir <name>', '克隆目录', '')

  program.command('clone [data...]').action((data: Array<string>) => {
    toClone(data)
  })

  program.command('git [commond] [data...]').action((commond: string, data: Array<string>) => {
    if (commond == 'clone') {
      toClone(data)
    } else {
      if (!data.length) {
        execShell(`git ${commond}`)
      } else {
        const com = data.reduce((pre, cur) => {
          pre += ` ${cur}`
          return pre
        }, `git ${commond}`)
        execShell(`git ${com}`)
      }
    }
  })
}

const toClone = (data: string[]) => {
  const options = program.opts()
  const [val] = data
  if (!val && !options.project && !options.url) {
    console.error(textColor.red('程序异常退出： 请输入项目名称或者克隆地址'))
    process.exit(1)
  }

  let clonePath = ''
  const projectName = options.clonedir || getCloneName(options?.url) || options.project || val || ''
  if (options.url) {
    clonePath = `git clone ${options.url}`
  } else if (options.project) {
    clonePath = `git clone ${baseGitUrl}${options.project}.git`
  } else if (val.startsWith('http') || val.startsWith('git@')) {
    clonePath = `git clone ${data}`
  } else {
    clonePath = `git clone ${baseGitUrl}${val}`
  }

  if (options.clonedir) {
    clonePath += ` ${options.clonedir}`
  }

  execShell(clonePath)
  if (options.branch) {
    console.log(textColor.green('切换分支到: '), textColor.blue(options.branch))
    execShell(`git checkout ${options.branch}`)
  }

  printLog(shelljs.cd('./' + projectName), 'run: cd ' + projectName)
  console.log(textColor.green('当前目录' + ': ' + process.cwd()))

  execShell('npm i')
  console.log(textColor.green('项目 ' + projectName + ' init success'))
}
