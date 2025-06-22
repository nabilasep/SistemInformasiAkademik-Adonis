import type { HttpContext } from '@adonisjs/core/http'
import Krs from '#models/krs'
import Matakuliah from '#models/matakuliah'
import Mahasiswa from '#models/mahasiswa'

export default class KrsController {
  /**
   * Display KRS dashboard for logged in mahasiswa
   */
  async index({ view, auth }: HttpContext) {
    const user = await auth.authenticate()
    
    if (user.role !== 'mahasiswa') {
      return view.render('mahasiswa/krs/index', {
        user,
        mahasiswa: null,
        currentKrs: [],
        currentSks: 0,
        availableMatakuliah: [],
        currentSemester: '2024/2',
        maxSks: 24,
        error: 'Akses ditolak'
      })
    }

    try {
      // Extract NIM from email and get mahasiswa data
      const nim = user.email.split('@')[0]
      const mahasiswa = await Mahasiswa.query()
        .where('nim', nim)
        .preload('prodi', (query) => {
          query.preload('fakultas')
        })
        .first()

      if (!mahasiswa) {
        return view.render('mahasiswa/krs/index', {
          user,
          mahasiswa: null,
          currentKrs: [],
          currentSks: 0,
          availableMatakuliah: [],
          currentSemester: '2024/2',
          maxSks: 24,
          error: 'Data mahasiswa tidak ditemukan'
        })
      }

      // Get current semester KRS
      const currentSemester = '2024/2'
      const currentKrs = await Krs.query()
        .where('mahasiswaId', mahasiswa.id)
        .where('semester', currentSemester)
        .preload('matakuliah')
        .orderBy('createdAt', 'desc')

      // Calculate current SKS
      const currentSks = currentKrs.reduce((total, krs) => total + (krs.matakuliah?.sks || 0), 0)

      // Get available mata kuliah (not yet taken this semester)
      const takenMatakuliahIds = currentKrs.map(krs => krs.matakuliahId)
      const availableMatakuliah = await Matakuliah.query()
        .whereNotIn('id', takenMatakuliahIds)
        .orderBy('namaMatakuliah', 'asc')

      return view.render('mahasiswa/krs/index', {
        user,
        mahasiswa,
        currentKrs,
        currentSks,
        availableMatakuliah,
        currentSemester,
        maxSks: 24
      })
      
    } catch (error) {
      console.error('KRS index error:', error)
      return view.render('mahasiswa/krs/index', {
        user,
        mahasiswa: null,
        currentKrs: [],
        currentSks: 0,
        availableMatakuliah: [],
        currentSemester: '2024/2',
        maxSks: 24,
        error: 'Terjadi kesalahan saat memuat data KRS'
      })
    }
  }

  /**
   * Display form to add new mata kuliah to KRS
   */
  async create({ view, auth }: HttpContext) {
    const user = await auth.authenticate()
    
    if (user.role !== 'mahasiswa') {
      return view.render('mahasiswa/krs/create', {
        user,
        mahasiswa: null,
        availableMatakuliah: [],
        currentSks: 0,
        maxSks: 24,
        currentSemester: '2024/2',
        error: 'Akses ditolak'
      })
    }

    try {
      // Extract NIM from email and get mahasiswa data
      const nim = user.email.split('@')[0]
      const mahasiswa = await Mahasiswa.query()
        .where('nim', nim)
        .preload('prodi', (query) => {
          query.preload('fakultas')
        })
        .first()

      if (!mahasiswa) {
        return view.render('mahasiswa/krs/create', {
          user,
          mahasiswa: null,
          availableMatakuliah: [],
          currentSks: 0,
          maxSks: 24,
          currentSemester: '2024/2',
          error: 'Data mahasiswa tidak ditemukan'
        })
      }

      // Get current semester and SKS
      const currentSemester = '2024/2'
      const currentKrs = await Krs.query()
        .where('mahasiswaId', mahasiswa.id)
        .where('semester', currentSemester)
        .preload('matakuliah')

      const currentSks = currentKrs.reduce((total, krs) => total + (krs.matakuliah?.sks || 0), 0)

      // Get available mata kuliah
      const takenMatakuliahIds = currentKrs.map(krs => krs.matakuliahId)
      const availableMatakuliah = await Matakuliah.query()
        .whereNotIn('id', takenMatakuliahIds)
        .orderBy('namaMatakuliah', 'asc')

      return view.render('mahasiswa/krs/create', {
        user,
        mahasiswa,
        availableMatakuliah,
        currentSks,
        maxSks: 24,
        currentSemester
      })
      
    } catch (error) {
      console.error('KRS create error:', error)
      return view.render('mahasiswa/krs/create', {
        user,
        mahasiswa: null,
        availableMatakuliah: [],
        currentSks: 0,
        maxSks: 24,
        currentSemester: '2024/2',
        error: 'Terjadi kesalahan saat memuat form'
      })
    }
  }

  /**
   * Add mata kuliah to KRS
   */
  async store({ request, response, session, auth }: HttpContext) {
    const user = await auth.authenticate()
    
    if (user.role !== 'mahasiswa') {
      return response.unauthorized('Access denied')
    }

    try {
      // Extract NIM from email and get mahasiswa data
      const nim = user.email.split('@')[0]
      const mahasiswa = await Mahasiswa.findBy('nim', nim)
      
      if (!mahasiswa) {
        session.flash('errors', { general: 'Data mahasiswa tidak ditemukan' })
        return response.redirect().back()
      }

      const { matakuliahId } = request.only(['matakuliahId'])
      
      if (!matakuliahId) {
        session.flash('errors', { general: 'Mata kuliah harus dipilih' })
        return response.redirect().back()
      }

      // Get mata kuliah data
      const matakuliah = await Matakuliah.findOrFail(matakuliahId)

      // Check current semester KRS and SKS
      const currentSemester = '2024/2'
      const currentKrs = await Krs.query()
        .where('mahasiswaId', mahasiswa.id)
        .where('semester', currentSemester)
        .preload('matakuliah')

      const currentSks = currentKrs.reduce((total, krs) => total + (krs.matakuliah?.sks || 0), 0)

      // Validate SKS limit
      if (currentSks + matakuliah.sks > 24) {
        session.flash('errors', { 
          general: `Tidak dapat menambah mata kuliah. Total SKS akan melebihi batas maksimal (${currentSks + matakuliah.sks}/24)` 
        })
        return response.redirect().back()
      }

      // Check if already taken
      const existingKrs = await Krs.query()
        .where('mahasiswaId', mahasiswa.id)
        .where('matakuliahId', matakuliahId)
        .where('semester', currentSemester)
        .first()

      if (existingKrs) {
        session.flash('errors', { general: 'Mata kuliah sudah diambil di semester ini' })
        return response.redirect().back()
      }

      // Add to KRS
      await Krs.create({
        mahasiswaId: mahasiswa.id,
        matakuliahId: Number(matakuliahId),
        semester: currentSemester
      })

      session.flash('success', `Mata kuliah ${matakuliah.namaMatakuliah} berhasil ditambahkan ke KRS`)
      return response.redirect().toRoute('mahasiswa.krs.index')
      
    } catch (error) {
      console.error('KRS store error:', error)
      session.flash('errors', { general: 'Terjadi kesalahan saat menambah mata kuliah' })
      return response.redirect().back()
    }
  }

  /**
   * Remove mata kuliah from KRS
   */
  async destroy({ params, response, session, auth }: HttpContext) {
    const user = await auth.authenticate()
    
    if (user.role !== 'mahasiswa') {
      return response.unauthorized('Access denied')
    }

    try {
      // Extract NIM from email and get mahasiswa data
      const nim = user.email.split('@')[0]
      const mahasiswa = await Mahasiswa.findBy('nim', nim)
      
      if (!mahasiswa) {
        session.flash('errors', { general: 'Data mahasiswa tidak ditemukan' })
        return response.redirect().back()
      }

      // Find KRS record
      const krs = await Krs.query()
        .where('id', params.id)
        .where('mahasiswaId', mahasiswa.id)
        .preload('matakuliah')
        .first()

      if (!krs) {
        session.flash('errors', { general: 'Data KRS tidak ditemukan' })
        return response.redirect().back()
      }

      // Delete KRS record
      await krs.delete()

      session.flash('success', `Mata kuliah ${krs.matakuliah?.namaMatakuliah} berhasil dihapus dari KRS`)
      return response.redirect().toRoute('mahasiswa.krs.index')
      
    } catch (error) {
      console.error('KRS destroy error:', error)
      session.flash('errors', { general: 'Terjadi kesalahan saat menghapus mata kuliah' })
      return response.redirect().back()
    }
  }

  /**
   * Get available mata kuliah (API endpoint)
   */
  async getAvailableMatakuliah({ response, auth }: HttpContext) {
    const user = await auth.authenticate()
    
    if (user.role !== 'mahasiswa') {
      return response.unauthorized('Access denied')
    }

    try {
      const nim = user.email.split('@')[0]
      const mahasiswa = await Mahasiswa.findBy('nim', nim)
      
      if (!mahasiswa) {
        return response.json({ success: false, error: 'Data mahasiswa tidak ditemukan' })
      }

      // Get current semester taken mata kuliah
      const currentSemester = '2024/2'
      const takenKrs = await Krs.query()
        .where('mahasiswaId', mahasiswa.id)
        .where('semester', currentSemester)
        .select('matakuliahId')

      const takenIds = takenKrs.map(krs => krs.matakuliahId)

      // Get available mata kuliah
      const availableMatakuliah = await Matakuliah.query()
        .whereNotIn('id', takenIds)
        .orderBy('namaMatakuliah', 'asc')

      return response.json({
        success: true,
        data: availableMatakuliah
      })
      
    } catch (error) {
      console.error('Get available matakuliah error:', error)
      return response.json({ 
        success: false, 
        error: 'Terjadi kesalahan saat mengambil data mata kuliah' 
      })
    }
  }

  /**
   * Get current SKS count (API endpoint)
   */
  async getCurrentSks({ response, auth }: HttpContext) {
    const user = await auth.authenticate()
    
    if (user.role !== 'mahasiswa') {
      return response.unauthorized('Access denied')
    }

    try {
      const nim = user.email.split('@')[0]
      const mahasiswa = await Mahasiswa.findBy('nim', nim)
      
      if (!mahasiswa) {
        return response.json({ success: false, error: 'Data mahasiswa tidak ditemukan' })
      }

      const currentSemester = '2024/2'
      const currentKrs = await Krs.query()
        .where('mahasiswaId', mahasiswa.id)
        .where('semester', currentSemester)
        .preload('matakuliah')

      const currentSks = currentKrs.reduce((total, krs) => total + (krs.matakuliah?.sks || 0), 0)

      return response.json({
        success: true,
        data: {
          currentSks,
          maxSks: 24,
          remainingSks: 24 - currentSks,
          totalMatakuliah: currentKrs.length
        }
      })
      
    } catch (error) {
      console.error('Get current SKS error:', error)
      return response.json({ 
        success: false, 
        error: 'Terjadi kesalahan saat mengambil data SKS' 
      })
    }
  }
}