import { App } from './web/app.js'
import { config } from './web/config.js'
import { consoleLog as log } from './console/console-log.js'

const app = new App(config, log)

app.start().then(
  () => {
    log('INFO', 'App started')
  },
  () => {
    log('ERROR', 'App promise rejected')
  },
)
