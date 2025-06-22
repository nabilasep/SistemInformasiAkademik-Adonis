import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class RoleMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
    allowedRoles: string[]
  ) {
    // Check if user is authenticated
    const user = ctx.auth.user
    
    if (!user) {
      return ctx.response.redirect().toRoute('login')
    }

    // Check if user has the required role
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return ctx.response.abort('Anda tidak memiliki akses ke halaman ini', 403)
    }

    await next()
  }
}