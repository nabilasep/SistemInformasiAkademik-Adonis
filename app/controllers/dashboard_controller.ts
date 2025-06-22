import type { HttpContext } from '@adonisjs/core/http'
import Mahasiswa from '#models/mahasiswa'
import Krs from '#models/krs'

export default class DashboardController {
  /**
   * Main dashboard route - redirects based on user role
   */
  async index(ctx: HttpContext) {
    try {
      const user = await ctx.auth.authenticate()

      if (user.role === 'admin') {
        return ctx.response.redirect().toRoute('admin.dashboard')
      } else if (user.role === 'mahasiswa') {
        return ctx.response.redirect().toRoute('mahasiswa.dashboard')
      }

      return ctx.response.redirect().toRoute('login')

    } catch (error) {
      return ctx.response.redirect().toRoute('login')
    }
  }

  /**
   * Admin dashboard with statistics and overview
   */
  async adminDashboard(ctx: HttpContext) {
    try {
      const user = await ctx.auth.authenticate()

      if (user.role !== 'admin') {
        return ctx.response.unauthorized('Akses ditolak: Anda bukan admin')
      }

      const { default: Fakultas } = await import('#models/fakultas')
      const { default: Prodi } = await import('#models/prodi')
      const { default: Mahasiswa } = await import('#models/mahasiswa')
      const { default: Matakuliah } = await import('#models/matakuliah')

      const [
        fakultas,
        prodi,
        mahasiswa,
        matakuliah
      ] = await Promise.all([
        Fakultas.query().count('* as total'),
        Prodi.query().count('* as total'),
        Mahasiswa.query().count('* as total'),
        Matakuliah.query().count('* as total')
      ])

      const totalFakultas = (fakultas[0].total ?? 0)
      const totalProdi = (prodi[0].total ?? 0)
      const totalMahasiswa = (mahasiswa[0].total ?? 0)
      const totalMatakuliah = (matakuliah[0].total ?? 0)

      const facultyStats = await Fakultas.query().withCount('prodis').orderBy('namaFakultas', 'asc').catch(() => [])
      const recentMahasiswa = await Mahasiswa.query().preload('prodi', (query) => {
        query.preload('fakultas')
      }).orderBy('createdAt', 'desc').limit(5).catch(() => [])

      const stats = {
        totalFakultas: totalFakultas,
        totalProdi: totalProdi,
        totalMahasiswa: totalMahasiswa,
        totalMatakuliah: totalMatakuliah,
        totalKrs: 0
      }

      return ctx.view.render('dashboard/admin', {
        user,
        stats,
        recentKrs: [],
        topMahasiswa: [],
        facultyStats: facultyStats || [],
        recentMahasiswa: recentMahasiswa || []
      })

    } catch (error) {
      console.error('Admin dashboard error:', error)
      return ctx.response.redirect().toRoute('login')
    }
  }

  /**
   * Mahasiswa dashboard with debugging and real data
   */
  async mahasiswaDashboard(ctx: HttpContext) {
    console.log('🚀 STARTING mahasiswaDashboard method')

    try {
      const user = await ctx.auth.authenticate()
      console.log('👤 Authenticated user:', { id: user.id, email: user.email, role: user.role })

      if (user.role !== 'mahasiswa') {
        console.log('❌ User is not mahasiswa, role:', user.role)
        return ctx.response.unauthorized('Akses ditolak: Anda bukan mahasiswa')
      }

      const nim = user.email.split('@')[0]
      console.log('🔍 Looking for mahasiswa with NIM:', nim)
      console.log('🔍 User email:', user.email)

      const allMahasiswa = await Mahasiswa.query().select('nim', 'nama', 'prodiId')
      console.log('📊 All mahasiswa in database:', allMahasiswa)

      const mahasiswa = await Mahasiswa.query()
        .where('nim', nim)
        .preload('prodi', (query) => {
          query.preload('fakultas')
        })
        .first()

      console.log('🎯 Found mahasiswa:', mahasiswa ? mahasiswa.serialize() : 'Not found')

      if (!mahasiswa) {
        const availableNims = allMahasiswa.map(m => m.nim).join(', ')

        return ctx.view.render('dashboard/mahasiswa', {
          user,
          mahasiswa: {
            nama: `Data tidak ditemukan untuk NIM: ${nim}`,
            nim: nim,
            prodi: {
              namaProdi: 'N/A',
              fakultas: { namaFakultas: 'N/A' }
            }
          },
          totalSksAmbil: 0,
          totalMatakuliahAmbil: 0,
          totalSemester: 1,
          currentSemester: '2024/2',
          currentKrs: { items: [], totalSks: 0, totalMatakuliah: 0 },
          krsBySemester: {},
          semesterList: [],
          error: `Data mahasiswa tidak ditemukan untuk NIM: ${nim}. NIM yang tersedia: ${availableNims}`
        })
      }

      const allKrs = await Krs.query()
        .where('mahasiswaId', mahasiswa.id)
        .preload('matakuliah')
        .orderBy('semester', 'desc')
        .orderBy('createdAt', 'desc')

      console.log('📚 Found KRS data:', allKrs.length)

      const totalSksAmbil = allKrs.reduce((sum, krs) => sum + (krs.matakuliah?.sks || 0), 0)
      const totalMatakuliahAmbil = allKrs.length

      const krsBySemester = allKrs.reduce((acc, krs) => {
        if (!acc[krs.semester]) {
          acc[krs.semester] = {
            items: [],
            totalSks: 0,
            totalMatakuliah: 0
          }
        }
        acc[krs.semester].items.push(krs)
        acc[krs.semester].totalSks += krs.matakuliah?.sks || 0
        acc[krs.semester].totalMatakuliah += 1
        return acc
      }, {} as Record<string, any>)

      const currentSemester = '2024/2'
      const currentKrs = krsBySemester[currentSemester] || {
        items: [],
        totalSks: 0,
        totalMatakuliah: 0
      }

      const semesterList = Object.keys(krsBySemester).sort().reverse()
      const totalSemester = semesterList.length || 1

      console.log('✅ Rendering dashboard with mahasiswa data:', {
        nama: mahasiswa.nama,
        nim: mahasiswa.nim,
        totalSks: totalSksAmbil
      })

      return ctx.view.render('dashboard/mahasiswa', {
        user,
        mahasiswa,
        totalSksAmbil,
        totalMatakuliahAmbil,
        totalSemester,
        currentSemester,
        currentKrs,
        krsBySemester,
        semesterList
      })

    } catch (error) {
      console.error('❌ Mahasiswa dashboard error:', error)

      try {
        const user = await ctx.auth.authenticate()
        return ctx.view.render('dashboard/mahasiswa', {
          user,
          mahasiswa: {
            nama: 'Error loading data',
            nim: user.email.split('@')[0],
            prodi: {
              namaProdi: 'N/A',
              fakultas: { namaFakultas: 'N/A' }
            }
          },
          totalSksAmbil: 0,
          totalMatakuliahAmbil: 0,
          totalSemester: 1,
          currentSemester: '2024/2',
          currentKrs: { items: [], totalSks: 0, totalMatakuliah: 0 },
          krsBySemester: {},
          semesterList: [],
          error: `Terjadi kesalahan saat memuat data: ${error.message}`
        })
      } catch (authError) {
        return ctx.response.redirect().toRoute('login')
      }
    }
  }

  /**
   * Get dashboard stats for API
   */
  async stats(ctx: HttpContext) {
    try {
      const user = await ctx.auth.authenticate()

      if (user.role === 'admin') {
        const { default: Fakultas } = await import('#models/fakultas')
        const { default: Prodi } = await import('#models/prodi')
        const { default: Mahasiswa } = await import('#models/mahasiswa')
        const { default: Matakuliah } = await import('#models/matakuliah')
        const { default: Krs } = await import('#models/krs')

        const stats = {
          fakultas: await Fakultas.query().count('*').first().then(r => Number(r?.$extras.count || 0)),
          prodi: await Prodi.query().count('*').first().then(r => Number(r?.$extras.count || 0)),
          mahasiswa: await Mahasiswa.query().count('*').first().then(r => Number(r?.$extras.count || 0)),
          matakuliah: await Matakuliah.query().count('*').first().then(r => Number(r?.$extras.count || 0)),
          krs: await Krs.query().count('*').first().then(r => Number(r?.$extras.count || 0))
        }

        return ctx.response.json({ success: true, data: stats })

      } else if (user.role === 'mahasiswa') {
        const { default: Krs } = await import('#models/krs')

        const krsStats = await Krs.query()
          .where('mahasiswa_id', user.id)
          .join('matakuliahs', 'krs.matakuliah_id', 'matakuliahs.id')
          .select('semester')
          .sum('matakuliahs.sks as total_sks')
          .count('* as total_matakuliah')
          .groupBy('semester')
          .orderBy('semester', 'desc')

        return ctx.response.json({ success: true, data: krsStats })
      }

      return ctx.response.unauthorized('Access denied')

    } catch (error) {
      return ctx.response.json({ success: false, error: 'Authentication required' })
    }
  }
}