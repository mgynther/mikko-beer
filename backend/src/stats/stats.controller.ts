import * as statsService from './stats.service'
import * as authService from '../authentication/authentication.service'

import { type Router } from '../router'

export function statsController (router: Router): void {
  router.get(
    '/api/v1/stats',
    authService.authenticateViewer,
    async (ctx) => {
      const stats = await statsService.getStats(ctx.db)
      ctx.body = { stats }
    }
  )
}
