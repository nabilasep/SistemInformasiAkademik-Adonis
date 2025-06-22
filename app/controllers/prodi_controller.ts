import type { HttpContext } from '@adonisjs/core/http'
import Prodi from '#models/prodi'
import Fakultas from '#models/fakultas'

export default class ProdiController {
  /**
   * Display a list of prodi
   */
  async index({ view, auth }: HttpContext) {
    const user = await auth.authenticate()
    
    if (user.role !== 'admin') {
      return view.render('errors/404')
    }

    const prodis = await Prodi.query()
      .preload('fakultas')
      .withCount('mahasiswas')
      .orderBy('createdAt', 'desc')

    return view.render('admin/prodi/index', { user, prodis })
  }

  /**
   * Display the form for creating a new prodi
   */
  async create({ view, auth }: HttpContext) {
    const user = await auth.authenticate()
    
    if (user.role !== 'admin') {
      return view.render('errors/404')
    }

    const fakultasList = await Fakultas.query().orderBy('namaFakultas', 'asc')

    return view.render('admin/prodi/create', { user, fakultasList })
  }

  /**
   * Handle form submission for creating a new prodi
   */
  async store({ request, response, session, auth }: HttpContext) {
    const user = await auth.authenticate()
    
    if (user.role !== 'admin') {
      return response.unauthorized('Access denied')
    }

    try {
      const { namaProdi, fakultasId } = request.only(['namaProdi', 'fakultasId'])
      
      // Validate required fields
      if (!namaProdi || !fakultasId) {
        session.flash('errors', { general: 'Nama prodi dan fakultas harus diisi' })
        return response.redirect().back()
      }

      await Prodi.create({
        namaProdi,
        fakultasId: Number(fakultasId)
      })

      session.flash('success', 'Program studi berhasil ditambahkan')
      return response.redirect().toRoute('admin.prodi.index')
      
    } catch (error) {
      console.error('Store prodi error:', error)
      session.flash('errors', { general: 'Terjadi kesalahan saat menambah program studi' })
      return response.redirect().back()
    }
  }

  /**
   * Display a specific prodi
   */
  async show({ params, view, auth }: HttpContext) {
    const user = await auth.authenticate()
    
    if (user.role !== 'admin') {
      return view.render('errors/404')
    }

    try {
      const prodi = await Prodi.query()
        .where('id', params.id)
        .preload('fakultas')
        .preload('mahasiswas')
        .first()

      if (!prodi) {
        return view.render('errors/404')
      }

      return view.render('admin/prodi/show', { user, prodi })
      
    } catch (error) {
      console.error('Show prodi error:', error)
      return view.render('errors/404')
    }
  }

  /**
   * Display the form for editing a prodi
   */
  async edit({ params, view, auth }: HttpContext) {
    const user = await auth.authenticate()
    
    if (user.role !== 'admin') {
      return view.render('errors/404')
    }

    try {
      const prodi = await Prodi.query()
        .where('id', params.id)
        .preload('fakultas')
        .first()

      if (!prodi) {
        return view.render('errors/404')
      }

      const fakultasList = await Fakultas.query().orderBy('namaFakultas', 'asc')

      return view.render('admin/prodi/edit', { user, prodi, fakultasList })
      
    } catch (error) {
      console.error('Edit prodi error:', error)
      return view.render('errors/404')
    }
  }

  /**
   * Handle form submission for updating a prodi
   */
  async update({ params, request, response, session, auth }: HttpContext) {
    const user = await auth.authenticate()
    
    if (user.role !== 'admin') {
      return response.unauthorized('Access denied')
    }

    try {
      const prodi = await Prodi.findOrFail(params.id)
      const { namaProdi, fakultasId } = request.only(['namaProdi', 'fakultasId'])
      
      // Validate required fields
      if (!namaProdi || !fakultasId) {
        session.flash('errors', { general: 'Nama prodi dan fakultas harus diisi' })
        return response.redirect().back()
      }

      prodi.merge({
        namaProdi,
        fakultasId: Number(fakultasId)
      })
      
      await prodi.save()

      session.flash('success', 'Program studi berhasil diperbarui')
      return response.redirect().toRoute('admin.prodi.index')
      
    } catch (error) {
      console.error('Update prodi error:', error)
      session.flash('errors', { general: 'Terjadi kesalahan saat memperbarui program studi' })
      return response.redirect().back()
    }
  }

  /**
   * Delete a prodi
   */
  async destroy({ params, response, session, auth }: HttpContext) {
    const user = await auth.authenticate()
    
    if (user.role !== 'admin') {
      return response.unauthorized('Access denied')
    }

    try {
      const prodi = await Prodi.findOrFail(params.id)
      
      // Check if prodi has mahasiswa
      await prodi.load('mahasiswas')
      if (prodi.mahasiswas.length > 0) {
        session.flash('errors', { general: 'Tidak dapat menghapus program studi yang masih memiliki mahasiswa' })
        return response.redirect().back()
      }
      
      await prodi.delete()

      session.flash('success', 'Program studi berhasil dihapus')
      return response.redirect().toRoute('admin.prodi.index')
      
    } catch (error) {
      console.error('Destroy prodi error:', error)
      session.flash('errors', { general: 'Terjadi kesalahan saat menghapus program studi' })
      return response.redirect().back()
    }
  }
}