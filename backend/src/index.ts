import { App } from './wiring/app.js'
import { config } from './wiring/config.js'
import { consoleLog as log } from './console/console-log.js'
import { createStartFailureHandler } from './wiring/app-start-failure-handler.js'

const app = new App(config, log)

app.start().then(
  () => {
    log('INFO', 'App started')
  },
  createStartFailureHandler(log, process),
)
