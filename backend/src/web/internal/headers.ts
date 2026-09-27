import type Koa from 'koa'

export async function addHeaders(
  ctx: Koa.ParameterizedContext,
  next: Koa.Next,
): Promise<void> {
  ctx.set('Access-Control-Allow-Origin', '*')
  ctx.set('Access-Control-Allow-Headers', 'Authorization, Content-Type')
  ctx.set('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
  ctx.set('Vary', 'Origin, Accept-Encoding')
  await next()
}
