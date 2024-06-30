import { App } from './web/app'
import { config } from './web/config'
import { consoleLog as log } from './core/console-log'
import { Level } from './core/log'

const app = new App(config, log)

app.start().then(() => {
  log(Level.INFO, 'App started')
}, () => {
  log(Level.ERROR, 'App promise rejected')
})
