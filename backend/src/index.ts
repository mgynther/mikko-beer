import { App } from './app'
import { config } from './config'

const app = new App(config)

app.start().then(() => {
  console.log('App started')
}, () => {
  console.warn('App promise rejected')
})
