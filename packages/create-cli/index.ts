#!/usr/bin/env node

import { program } from 'commander'
import { version } from './package.json'
import { initGitAction } from './lib/cloneProject'
import { initPackAction } from './lib/pack'
import { initUploadAction } from './lib/upload'

program.option('-V, --version', '版本号').action(() => {
  console.log(version)
})

program.option('--mode <mode>', '环境 development test uat production ')

program.command('init').action(() => {
  console.log('init--')
})

initGitAction()
initPackAction()
initUploadAction()

program.parse(process.argv)
