import { ShellString } from 'shelljs'
import { textColor } from './textColor'
import shelljs from 'shelljs'
import ora from 'ora'
const spinner = ora()

export const execShell = (command: string, silent = false) => {
  spinner.color = 'magenta'
  spinner.start(`loading : ${command} `)

  const execRes = shelljs.exec(command, { silent: silent })

  printLog(execRes)

  const txt = `'run: ${command} `
  if (execRes.code == 0) {
    spinner.succeed(txt)
  } else {
    spinner.fail(txt)
  }
}

export const printLog = (info: ShellString, ...args: string[]) => {
  if (info.code !== 0 && info.stderr) {
    args.forEach((item) => {
      console.log(textColor.yellow(item))
    })
    console.log(textColor.red(info.stderr))
    console.log(textColor.red('执行命令失败，请检查命令是否正确'))
    process.exit(1)
  } else {
    args.forEach((item) => {
      console.log(textColor.green(item))
    })
    console.log(textColor.blue(info.stdout))
  }
}

export const getCloneName = (url = '') => {
  let res = url.match(/[^\/]+(?=\.git)/)
  return res && res[0]
}
