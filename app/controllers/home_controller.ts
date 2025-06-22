import type { HttpContext } from '@adonisjs/core/http'

export default class HomeController {
  async index({ view, auth }: HttpContext) {
    // Check if user is logged in
    const user = auth.user

    if (user) {
      // Redirect to appropriate dashboard based on role
      if (user.role === 'admin') {
        return view.render('admin/dashboard')
      } else if (user.role === 'mahasiswa') {
        return view.render('mahasiswa/dashboard')
      }
    }

    // Show public home page
    return view.render('pages/home')
  }
}