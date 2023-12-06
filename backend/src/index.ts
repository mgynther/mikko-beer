import { App } from './web/app'
import { config } from './web/config'

const app = new App(config)

app.start().then(() => {
  console.log('App started')
}, () => {
  console.warn('App promise rejected')
})
