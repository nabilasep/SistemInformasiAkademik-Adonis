import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { loginValidator, registerValidator } from '#validators/auth'

export default class AuthController {
  /**
   * Show login form
   */
  async showLogin({ view }: HttpContext) {
    return view.render('auth/login')
  }
  /**
   * Handle login
   */
  async login({ request, auth, response, session }: HttpContext) {
    try {
      const { email, password } = await request.validateUsing(loginValidator)

      // Find user by email
      const user = await User.findBy('email', email)
      
      if (!user) {
        session.flash('errors', { auth: 'Email tidak ditemukan' })
        return response.redirect().back()
      }

      // Verify password
      const isPasswordValid = await user.verifyPassword(password)
      
      if (!isPasswordValid) {
        session.flash('errors', { auth: 'Password salah' })
        return response.redirect().back()
      }      // Login user
      await auth.use('web').login(user)

      // Redirect based on user role
      if (user.role === 'admin') {
        console.log('Redirecting admin to admin dashboard')
        return response.redirect().toRoute('admin.dashboard')
      } else if (user.role === 'mahasiswa') {
        console.log('Redirecting mahasiswa to mahasiswa dashboard')
        return response.redirect().toRoute('mahasiswa.dashboard')
      }

      console.log('Unknown role, redirecting to main dashboard')
      return response.redirect().toRoute('dashboard')
      
    } catch (error) {
      console.error('Login error:', error)
      session.flash('errors', { auth: 'Terjadi kesalahan saat login' })
      return response.redirect().back()
    }
  }

  /**
   * Show register form
   */
  async showRegister({ view }: HttpContext) {
    return view.render('auth/register')
  }
  /**
   * Handle registration
   */
  async register({ request, auth, response, session }: HttpContext) {
    try {
      const payload = await request.validateUsing(registerValidator)

      // Check if email already exists
      const existingUser = await User.findBy('email', payload.email)
      if (existingUser) {
        session.flash('errors', { email: 'Email sudah terdaftar' })
        return response.redirect().back()
      }

      const user = await User.create({
        email: payload.email,
        password: payload.password,
        role: 'mahasiswa',
      })

      await auth.use('web').login(user)
      return response.redirect().toRoute('mahasiswa.dashboard')
      
    } catch (error) {
      console.error('Register error:', error)
      session.flash('errors', { general: 'Terjadi kesalahan saat registrasi' })
      return response.redirect().back()
    }
  }

  /**
   * Handle logout
   */
  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect().toRoute('login')
  }
}