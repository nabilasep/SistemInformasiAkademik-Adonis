import type { HttpContext } from '@adonisjs/core/http'
import Fakultas from '#models/fakultas'
import { createFakultasValidator, updateFakultasValidator } from '../validators/fakultas.js'

export default class FakultasController {
  /**
   * Display a list of fakultas
   */
  async index({ view, auth }: HttpContext) {
    const user = await auth.authenticate()
    
    if (user.role !== 'admin') {
      return view.render('errors/404')
    }

    const fakultas = await Fakultas.query()
      .withCount('prodis')
      .orderBy('created_at', 'desc')

    return view.render('admin/fakultas/index', { user, fakultas })
  }

  /**
   * Display the form for creating a new fakultas
   */
  async create({ view, auth }: HttpContext) {
    const user = await auth.authenticate()
    
    if (user.role !== 'admin') {
      return view.render('errors/404')
    }

    return view.render('admin/fakultas/create', { user })
  }

  /**
   * Handle form submission for creating a new fakultas
   */
  async store({ request, response, session, auth }: HttpContext) {
    const user = await auth.authenticate()
    
    if (user.role !== 'admin') {
      return response.unauthorized('Access denied')
    }

    try {
      const payload = await request.validateUsing(createFakultasValidator)
      
      await Fakultas.create({ namaFakultas: payload.nama })
      
      session.flash('success', 'Fakultas berhasil ditambahkan')
      return response.redirect().toRoute('admin.fakultas.index')
      
    } catch (error) {
      session.flash('errors', { general: 'Terjadi kesalahan saat menambah fakultas' })
      return response.redirect().back()
    }
  }

  /**
   * Display a specific fakultas
   */
  async show({ params, view, auth }: HttpContext) {
    const user = await auth.authenticate()
    
    if (user.role !== 'admin') {
      return view.render('errors/404')
    }

    const fakultas = await Fakultas.query()
      .where('id', params.id)
      .preload('prodis', (query) => {
        query.withCount('mahasiswas')
      })
      .first()

    if (!fakultas) {
      return view.render('errors/404')
    }

    return view.render('admin/fakultas/show', { user, fakultas })
  }

  /**
   * Display the form for editing a fakultas
   */
  async edit({ params, view, auth }: HttpContext) {
    const user = await auth.authenticate()
    
    if (user.role !== 'admin') {
      return view.render('errors/404')
    }

    const fakultas = await Fakultas.findOrFail(params.id)

    return view.render('admin/fakultas/edit', { user, fakultas })
  }

  /**
   * Handle form submission for updating a fakultas
   */
  async update({ params, request, response, session, auth }: HttpContext) {
    const user = await auth.authenticate()
    
    if (user.role !== 'admin') {
      return response.unauthorized('Access denied')
    }

    try {
      const fakultas = await Fakultas.findOrFail(params.id)
      const payload = await request.validateUsing(updateFakultasValidator)
      
      fakultas.merge({ namaFakultas: payload.nama })
      await fakultas.save()
      
      session.flash('success', 'Fakultas berhasil diperbarui')
      return response.redirect().toRoute('admin.fakultas.index')
      
    } catch (error) {
      session.flash('errors', { general: 'Terjadi kesalahan saat memperbarui fakultas' })
      return response.redirect().back()
    }
  }

  /**
   * Delete a fakultas
   */
  async destroy({ params, response, session, auth }: HttpContext) {
    const user = await auth.authenticate()
    
    if (user.role !== 'admin') {
      return response.unauthorized('Access denied')
    }

    try {
      const fakultas = await Fakultas.findOrFail(params.id)
      
      // Check if fakultas has prodis
      await fakultas.load('prodis')
      if (fakultas.prodis.length > 0) {
        session.flash('errors', { general: 'Tidak dapat menghapus fakultas yang masih memiliki program studi' })
        return response.redirect().back()
      }
      
      await fakultas.delete()
      
      session.flash('success', 'Fakultas berhasil dihapus')
      return response.redirect().toRoute('admin.fakultas.index')
      
    } catch (error) {
      session.flash('errors', { general: 'Terjadi kesalahan saat menghapus fakultas' })
      return response.redirect().back()
    }
  }
}