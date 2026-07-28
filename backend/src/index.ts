import { App } from './web/app.js'
import { config } from './web/config.js'
import { consoleLog as log } from './console/console-log.js'
import { Level } from './console/log.js'

const app = new App(config, log)

app.start().then(
  () => {
    log(Level.INFO, 'App started')
  },
  () => {
    log(Level.ERROR, 'App promise rejected')
  },
)
