import type { HttpContext } from '@adonisjs/core/http'
import Matakuliah from '#models/matakuliah'

export default class MatakuliahController {
  /**
   * Display a list of matakuliah
   */
  async index({ view, auth }: HttpContext) {
    const user = await auth.authenticate()
    
    if (user.role !== 'admin') {
      return view.render('errors/404')
    }

    const matakuliahs = await Matakuliah.query()
      .orderBy('createdAt', 'desc')

    return view.render('admin/matakuliah/index', { user, matakuliahs })
  }

  /**
   * Display the form for creating a new matakuliah
   */
  async create({ view, auth }: HttpContext) {
    const user = await auth.authenticate()
    
    if (user.role !== 'admin') {
      return view.render('errors/404')
    }

    return view.render('admin/matakuliah/create', { user })
  }

  /**
   * Handle form submission for creating a new matakuliah
   */
  async store({ request, response, session, auth }: HttpContext) {
    const user = await auth.authenticate()
    
    if (user.role !== 'admin') {
      return response.unauthorized('Access denied')
    }

    try {
      const { namaMatakuliah, kode, sks } = request.only(['namaMatakuliah', 'kode', 'sks'])
      
      // Validate required fields
      if (!namaMatakuliah || !kode || !sks) {
        session.flash('errors', { general: 'Nama mata kuliah, kode, dan SKS harus diisi' })
        return response.redirect().back()
      }

      // Validate SKS (must be between 1-6)
      const sksNumber = Number(sks)
      if (isNaN(sksNumber) || sksNumber < 1 || sksNumber > 6) {
        session.flash('errors', { sks: 'SKS harus berupa angka antara 1-6' })
        return response.redirect().back()
      }

      // Check if kode already exists
      const existingMatakuliah = await Matakuliah.findBy('kode', kode)
      if (existingMatakuliah) {
        session.flash('errors', { kode: 'Kode mata kuliah sudah digunakan' })
        return response.redirect().back()
      }

      // Create matakuliah record
      await Matakuliah.create({
        namaMatakuliah,
        kode,
        sks: sksNumber
      })

      session.flash('success', 'Mata kuliah berhasil ditambahkan')
      return response.redirect().toRoute('admin.matakuliah.index')
      
    } catch (error) {
      console.error('Store matakuliah error:', error)
      session.flash('errors', { general: 'Terjadi kesalahan saat menambah mata kuliah' })
      return response.redirect().back()
    }
  }

  /**
   * Display a specific matakuliah
   */
  async show({ params, view, auth }: HttpContext) {
    const user = await auth.authenticate()
    
    if (user.role !== 'admin') {
      return view.render('errors/404')
    }

    try {
      const matakuliah = await Matakuliah.findOrFail(params.id)

      return view.render('admin/matakuliah/show', { user, matakuliah })
      
    } catch (error) {
      console.error('Show matakuliah error:', error)
      return view.render('errors/404')
    }
  }

  /**
   * Display the form for editing a matakuliah
   */
  async edit({ params, view, auth }: HttpContext) {
    const user = await auth.authenticate()
    
    if (user.role !== 'admin') {
      return view.render('errors/404')
    }

    try {
      const matakuliah = await Matakuliah.findOrFail(params.id)

      return view.render('admin/matakuliah/edit', { user, matakuliah })
      
    } catch (error) {
      console.error('Edit matakuliah error:', error)
      return view.render('errors/404')
    }
  }

  /**
   * Handle form submission for updating a matakuliah
   */
  async update({ params, request, response, session, auth }: HttpContext) {
    const user = await auth.authenticate()
    
    if (user.role !== 'admin') {
      return response.unauthorized('Access denied')
    }

    try {
      const matakuliah = await Matakuliah.findOrFail(params.id)
      const { namaMatakuliah, kode, sks } = request.only(['namaMatakuliah', 'kode', 'sks'])
      
      // Validate required fields
      if (!namaMatakuliah || !kode || !sks) {
        session.flash('errors', { general: 'Nama mata kuliah, kode, dan SKS harus diisi' })
        return response.redirect().back()
      }

      // Validate SKS (must be between 1-6)
      const sksNumber = Number(sks)
      if (isNaN(sksNumber) || sksNumber < 1 || sksNumber > 6) {
        session.flash('errors', { sks: 'SKS harus berupa angka antara 1-6' })
        return response.redirect().back()
      }

      // Check if kode is taken by another matakuliah
      if (kode !== matakuliah.kode) {
        const existingMatakuliah = await Matakuliah.findBy('kode', kode)
        if (existingMatakuliah && existingMatakuliah.id !== matakuliah.id) {
          session.flash('errors', { kode: 'Kode mata kuliah sudah digunakan' })
          return response.redirect().back()
        }
      }

      // Update matakuliah data
      matakuliah.merge({
        namaMatakuliah,
        kode,
        sks: sksNumber
      })
      await matakuliah.save()

      session.flash('success', 'Data mata kuliah berhasil diperbarui')
      return response.redirect().toRoute('admin.matakuliah.index')
      
    } catch (error) {
      console.error('Update matakuliah error:', error)
      session.flash('errors', { general: 'Terjadi kesalahan saat memperbarui data mata kuliah' })
      return response.redirect().back()
    }
  }

  /**
   * Delete a matakuliah
   */
  async destroy({ params, response, session, auth }: HttpContext) {
    const user = await auth.authenticate()
    
    if (user.role !== 'admin') {
      return response.unauthorized('Access denied')
    }

    try {
      const matakuliah = await Matakuliah.findOrFail(params.id)
      
      await matakuliah.delete()

      session.flash('success', 'Mata kuliah berhasil dihapus')
      return response.redirect().toRoute('admin.matakuliah.index')
      
    } catch (error) {
      console.error('Destroy matakuliah error:', error)
      session.flash('errors', { general: 'Terjadi kesalahan saat menghapus mata kuliah' })
      return response.redirect().back()
    }
  }

  /**
   * Get all matakuliah (API endpoint)
   */
  async getAll({ response, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()
      
      if (user.role !== 'admin' && user.role !== 'mahasiswa') {
        return response.unauthorized('Access denied')
      }

      const matakuliahs = await Matakuliah.query()
        .orderBy('namaMatakuliah', 'asc')

      return response.json({ success: true, data: matakuliahs })
      
    } catch (error) {
      console.error('Get all matakuliah error:', error)
      return response.json({ success: false, error: 'Terjadi kesalahan saat mengambil data mata kuliah' })
    }
  }
}