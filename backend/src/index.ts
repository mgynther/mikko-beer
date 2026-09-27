import { App } from './web/app.js'
import { config } from './web/config.js'
import { consoleLog as log } from './console/console-log.js'
import { createStartFailureHandler } from './web/app-start-failure-handler.js'

const app = new App(config, log)

app.start().then(
  () => {
    log('INFO', 'App started')
  },
  createStartFailureHandler(log, process),
)
