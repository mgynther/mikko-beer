import { App } from './web/app'
import { config } from './web/config'
import { consoleLog as log } from './core/console-log'

const app = new App(config, log)

app.start().then(() => {
  console.log('App started')
}, () => {
  console.warn('App promise rejected')
})
