import type { HttpContext } from '@adonisjs/core/http'
import Mahasiswa from '#models/mahasiswa'
import Prodi from '#models/prodi'
import Fakultas from '#models/fakultas'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

export default class MahasiswaController {  /**
   * Display a list of mahasiswa with filtering
   */
  async index({ view, auth, request }: HttpContext) {
    const user = await auth.authenticate()
    
    if (user.role !== 'admin') {
      return view.render('errors/404')
    }

    try {
      const page = request.input('page', 1)
      const limit = 20
      const { search, fakultasId, prodiId } = request.qs()

      // Build query with filters
      const query = Mahasiswa.query()
        .preload('prodi', (prodiQuery) => {
          prodiQuery.preload('fakultas')
        })
        .orderBy('createdAt', 'desc')

      // Apply search filter
      if (search) {
        query.where((builder) => {
          builder
            .where('nama', 'like', `%${search}%`)
            .orWhere('nim', 'like', `%${search}%`)
        })
      }

      // Apply fakultas filter
      if (fakultasId) {
        query.whereHas('prodi', (prodiQuery) => {
          prodiQuery.where('fakultasId', fakultasId)
        })
      }

      // Apply prodi filter
      if (prodiId) {
        query.where('prodiId', prodiId)
      }

      const mahasiswas = await query.paginate(page, limit)

      // Get filter options
      const fakultasList = await Fakultas.query().orderBy('namaFakultas', 'asc')
      const prodiList = await Prodi.query()
        .preload('fakultas')
        .orderBy('namaProdi', 'asc')

      return view.render('admin/mahasiswa/index', { 
        user, 
        mahasiswas,
        fakultasList,
        prodiList,
        filters: { search, fakultasId, prodiId }
      })
      
    } catch (error) {
      console.error('Mahasiswa index error:', error)
      return view.render('admin/mahasiswa/index', { 
        user, 
        mahasiswas: [],
        fakultasList: [],
        prodiList: [],
        filters: {},
        error: 'Terjadi kesalahan saat memuat data'
      })
    }
  }

  /**
   * Display the form for creating a new mahasiswa
   */
  async create({ view, auth }: HttpContext) {
    const user = await auth.authenticate()
    
    if (user.role !== 'admin') {
      return view.render('errors/404')
    }

    const prodiList = await Prodi.query()
      .preload('fakultas')
      .orderBy('namaProdi', 'asc')

    return view.render('admin/mahasiswa/create', { user, prodiList })
  }

  /**
   * Handle form submission for creating a new mahasiswa
   */
  async store({ request, response, session, auth }: HttpContext) {
    const user = await auth.authenticate()
    
    if (user.role !== 'admin') {
      return response.unauthorized('Access denied')
    }

    try {
      const { nama, nim, email, password, prodiId } = request.only(['nama', 'nim', 'email', 'password', 'prodiId'])
      
      // Validate required fields
      if (!nama || !nim || !email || !password || !prodiId) {
        session.flash('errors', { general: 'Semua field harus diisi' })
        return response.redirect().back()
      }

      // Check if email already exists
      const existingUser = await User.findBy('email', email)
      if (existingUser) {
        session.flash('errors', { email: 'Email sudah digunakan' })
        return response.redirect().back()
      }

      // Check if NIM already exists
      const existingMahasiswa = await Mahasiswa.findBy('nim', nim)
      if (existingMahasiswa) {
        session.flash('errors', { nim: 'NIM sudah digunakan' })
        return response.redirect().back()
      }      // Create user account first
      await User.create({
        email,
        password: await hash.make(password),
        role: 'mahasiswa'
      })

      // Create mahasiswa record
      await Mahasiswa.create({
        nama,
        nim,
        prodiId: Number(prodiId)
      })

      session.flash('success', 'Mahasiswa berhasil ditambahkan')
      return response.redirect().toRoute('admin.mahasiswa.index')
      
    } catch (error) {
      console.error('Store mahasiswa error:', error)
      session.flash('errors', { general: 'Terjadi kesalahan saat menambah mahasiswa' })
      return response.redirect().back()
    }
  }

  /**
   * Display a specific mahasiswa
   */
  async show({ params, view, auth }: HttpContext) {
    const user = await auth.authenticate()
    
    if (user.role !== 'admin') {
      return view.render('errors/404')
    }

    try {
      const mahasiswa = await Mahasiswa.query()
        .where('id', params.id)
        .preload('prodi', (query) => {
          query.preload('fakultas')
        })
        .first()

      if (!mahasiswa) {
        return view.render('errors/404')
      }

      return view.render('admin/mahasiswa/show', { user, mahasiswa })
      
    } catch (error) {
      console.error('Show mahasiswa error:', error)
      return view.render('errors/404')
    }
  }

  /**
   * Display the form for editing a mahasiswa
   */
  async edit({ params, view, auth }: HttpContext) {
    const user = await auth.authenticate()
    
    if (user.role !== 'admin') {
      return view.render('errors/404')
    }

    try {
      const mahasiswa = await Mahasiswa.query()
        .where('id', params.id)
        .preload('prodi', (query) => {
          query.preload('fakultas')
        })
        .first()

      if (!mahasiswa) {
        return view.render('errors/404')
      }

      const prodiList = await Prodi.query()
        .preload('fakultas')
        .orderBy('namaProdi', 'asc')

      return view.render('admin/mahasiswa/edit', { user, mahasiswa, prodiList })
      
    } catch (error) {
      console.error('Edit mahasiswa error:', error)
      return view.render('errors/404')
    }
  }

  /**
   * Handle form submission for updating a mahasiswa
   */
  async update({ params, request, response, session, auth }: HttpContext) {
    const user = await auth.authenticate()
    
    if (user.role !== 'admin') {
      return response.unauthorized('Access denied')
    }

    try {
      const mahasiswa = await Mahasiswa.findOrFail(params.id)
      const { nama, nim, prodiId } = request.only(['nama', 'nim', 'prodiId'])
      
      // Validate required fields
      if (!nama || !nim || !prodiId) {
        session.flash('errors', { general: 'Nama, NIM, dan prodi harus diisi' })
        return response.redirect().back()
      }

      // Check if NIM is taken by another mahasiswa
      if (nim !== mahasiswa.nim) {
        const existingMahasiswa = await Mahasiswa.findBy('nim', nim)
        if (existingMahasiswa && existingMahasiswa.id !== mahasiswa.id) {
          session.flash('errors', { nim: 'NIM sudah digunakan oleh mahasiswa lain' })
          return response.redirect().back()
        }
      }

      // Update mahasiswa data
      mahasiswa.merge({
        nama,
        nim,
        prodiId: Number(prodiId)
      })
      await mahasiswa.save()

      session.flash('success', 'Data mahasiswa berhasil diperbarui')
      return response.redirect().toRoute('admin.mahasiswa.index')
      
    } catch (error) {
      console.error('Update mahasiswa error:', error)
      session.flash('errors', { general: 'Terjadi kesalahan saat memperbarui data mahasiswa' })
      return response.redirect().back()
    }
  }
  /**
   * Delete a mahasiswa
   */
  async destroy({ params, response, session, auth }: HttpContext) {
    const user = await auth.authenticate()
    
    if (user.role !== 'admin') {
      return response.unauthorized('Access denied')
    }

    try {
      const mahasiswa = await Mahasiswa.findOrFail(params.id)
      
      await mahasiswa.delete()

      session.flash('success', 'Mahasiswa berhasil dihapus')
      return response.redirect().toRoute('admin.mahasiswa.index')
      
    } catch (error) {
      console.error('Destroy mahasiswa error:', error)
      session.flash('errors', { general: 'Terjadi kesalahan saat menghapus mahasiswa' })
      return response.redirect().back()
    }
  }

  /**
   * Display mahasiswa academic summary with SKS tracking
   */
  async academicSummary({ view, auth, request }: HttpContext) {
    const user = await auth.authenticate()
    
    if (user.role !== 'admin') {
      return view.render('errors/404')
    }

    try {
      const { semester, fakultasId, search } = request.qs()
      const currentSemester = semester || '2024/2'

      // Get all mahasiswa with their KRS data
      const mahasiswas = await Mahasiswa.query()
        .preload('prodi', (prodiQuery) => {
          prodiQuery.preload('fakultas')
        })
        .preload('krs', (krsQuery) => {
          if (semester) {
            krsQuery.where('semester', semester)
          }
          krsQuery.preload('matakuliah')
        })
        .if(search, (query) => {
          query.where((builder) => {
            builder
              .where('nama', 'like', `%${search}%`)
              .orWhere('nim', 'like', `%${search}%`)
          })
        })
        .if(fakultasId, (query) => {
          query.whereHas('prodi', (prodiQuery) => {
            prodiQuery.where('fakultasId', fakultasId)
          })
        })
        .orderBy('nama', 'asc')

      // Calculate SKS totals for each mahasiswa
      const mahasiswaWithSks = mahasiswas.map(mahasiswa => {
        const totalSks = mahasiswa.krs.reduce((sum, krs) => {
          return sum + (krs.matakuliah?.sks || 0)
        }, 0)
        
        return {
          ...mahasiswa.serialize(),
          totalSks,
          totalMatakuliah: mahasiswa.krs.length,
          krsDetails: mahasiswa.krs
        }
      }).sort((a, b) => b.totalSks - a.totalSks) // Sort by highest SKS

      // Get filter options
      const fakultasList = await Fakultas.query().orderBy('namaFakultas', 'asc')
      
      // Get available semesters
      const { default: Krs } = await import('#models/krs')
      const semesterList = await Krs.query()
        .select('semester')
        .groupBy('semester')
        .orderBy('semester', 'desc')

      // Calculate summary statistics
      const totalMahasiswa = mahasiswaWithSks.length
      const totalSksAllMahasiswa = mahasiswaWithSks.reduce((sum, m) => sum + m.totalSks, 0)
      const avgSksPerMahasiswa = totalMahasiswa > 0 ? Math.round((totalSksAllMahasiswa / totalMahasiswa) * 100) / 100 : 0

      return view.render('admin/mahasiswa/academic-summary', {
        user,
        mahasiswaWithSks,
        fakultasList,
        semesterList,
        currentSemester,
        filters: { semester, fakultasId, search },
        stats: {
          totalMahasiswa,
          totalSksAllMahasiswa,
          avgSksPerMahasiswa
        }
      })
      
    } catch (error) {
      console.error('Academic summary error:', error)
      return view.render('errors/500')
    }
  }
}