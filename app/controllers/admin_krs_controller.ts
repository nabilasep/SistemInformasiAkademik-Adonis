import type { HttpContext } from '@adonisjs/core/http'
import Krs from '#models/krs'
import Mahasiswa from '#models/mahasiswa'
import Fakultas from '#models/fakultas'

export default class AdminKrsController {
  /**
   * Display KRS overview for admin
   */
  async index({ view, auth, request }: HttpContext) {
    const user = await auth.authenticate()
    
    if (user.role !== 'admin') {
      return view.render('errors/404')
    }

    try {
      const page = request.input('page', 1)
      const limit = 20
      const { fakultasId, semester, search } = request.qs()

      // Build query with filters
      const query = Krs.query()
        .preload('mahasiswa', (mahasiswaQuery) => {
          mahasiswaQuery.preload('prodi', (prodiQuery) => {
            prodiQuery.preload('fakultas')
          })
        })
        .preload('matakuliah')
        .orderBy('createdAt', 'desc')

      // Apply filters
      if (fakultasId) {
        query.whereHas('mahasiswa', (mahasiswaQuery) => {
          mahasiswaQuery.whereHas('prodi', (prodiQuery) => {
            prodiQuery.where('fakultasId', fakultasId)
          })
        })
      }

      if (semester) {
        query.where('semester', semester)
      }

      if (search) {
        query.whereHas('mahasiswa', (mahasiswaQuery) => {
          mahasiswaQuery.where('nama', 'like', `%${search}%`)
            .orWhere('nim', 'like', `%${search}%`)
        })
      }

      const krsList = await query.paginate(page, limit)

      // Get filter options
      const fakultasList = await Fakultas.query().orderBy('namaFakultas', 'asc')
      const semesterList = await Krs.query()
        .select('semester')
        .groupBy('semester')
        .orderBy('semester', 'desc')

      return view.render('admin/krs/index', { 
        user, 
        krsList,
        fakultasList,
        semesterList,
        filters: { fakultasId, semester, search }
      })
      
    } catch (error) {
      console.error('Admin KRS index error:', error)
      return view.render('errors/500')
    }
  }

  /**
   * Display KRS statistics and reports
   */
  async reports({ view, auth, request }: HttpContext) {
    const user = await auth.authenticate()
    
    if (user.role !== 'admin') {
      return view.render('errors/404')
    }

    try {
      const { semester } = request.qs()
      const currentSemester = semester || '2024/1'

      // Get KRS statistics
      const stats = await this.getKrsStatistics(currentSemester)

      // Get top students by SKS
      const topStudents = await this.getTopStudentsBySks(currentSemester)

      // Get faculty breakdown
      const facultyBreakdown = await this.getFacultyBreakdown(currentSemester)

      // Get available semesters
      const semesterList = await Krs.query()
        .select('semester')
        .groupBy('semester')
        .orderBy('semester', 'desc')

      return view.render('admin/krs/reports', {
        user,
        stats,
        topStudents,
        facultyBreakdown,
        semesterList,
        currentSemester
      })
      
    } catch (error) {
      console.error('Admin KRS reports error:', error)
      return view.render('errors/500')
    }
  }

  /**
   * Display specific student KRS details
   */
  async studentDetail({ params, view, auth }: HttpContext) {
    const user = await auth.authenticate()
    
    if (user.role !== 'admin') {
      return view.render('errors/404')
    }

    try {
      const mahasiswa = await Mahasiswa.query()
        .where('id', params.studentId)
        .preload('prodi', (prodiQuery) => {
          prodiQuery.preload('fakultas')
        })
        .first()

      if (!mahasiswa) {
        return view.render('errors/404')
      }

      // Get all KRS for this student grouped by semester
      const krsBysemester = await Krs.query()
        .where('mahasiswaId', mahasiswa.id)
        .preload('matakuliah')
        .orderBy('semester', 'desc')
        .orderBy('createdAt', 'desc')

      // Group by semester
      const groupedKrs = krsBysemester.reduce((acc, krs) => {
        if (!acc[krs.semester]) {
          acc[krs.semester] = []
        }
        acc[krs.semester].push(krs)
        return acc
      }, {} as Record<string, typeof krsBysemester>)

      // Calculate SKS per semester
      const sksSummary = Object.keys(groupedKrs).map(semester => {
        const totalSks = groupedKrs[semester].reduce((sum, krs) => sum + (krs.matakuliah?.sks || 0), 0)
        return {
          semester,
          totalSks,
          totalMatakuliah: groupedKrs[semester].length
        }
      })

      return view.render('admin/krs/student-detail', {
        user,
        mahasiswa,
        groupedKrs,
        sksSummary
      })
      
    } catch (error) {
      console.error('Admin KRS student detail error:', error)
      return view.render('errors/404')
    }
  }

  /**
   * Export KRS data to Excel
   */
  async exportExcel({ response, auth, request }: HttpContext) {
    const user = await auth.authenticate()
    
    if (user.role !== 'admin') {
      return response.unauthorized('Access denied')
    }

    try {
      const { semester, fakultasId } = request.qs()

      // Build query for export
      const query = Krs.query()
        .preload('mahasiswa', (mahasiswaQuery) => {
          mahasiswaQuery.preload('prodi', (prodiQuery) => {
            prodiQuery.preload('fakultas')
          })
        })
        .preload('matakuliah')
        .orderBy('createdAt', 'desc')

      if (semester) {
        query.where('semester', semester)
      }

      if (fakultasId) {
        query.whereHas('mahasiswa', (mahasiswaQuery) => {
          mahasiswaQuery.whereHas('prodi', (prodiQuery) => {
            prodiQuery.where('fakultasId', fakultasId)
          })
        })
      }
      
    } catch (error) {
      console.error('Export KRS error:', error)
      return response.status(500).send('Export failed')
    }
  }
  /**
   * Get KRS statistics for dashboard
   */
  private async getKrsStatistics(semester: string) {
    const totalKrs = await Krs.query().where('semester', semester).count('*')
    const uniqueStudents = await Krs.query()
      .where('semester', semester)
      .select('mahasiswaId')
      .groupBy('mahasiswaId')
    
    const allKrs = await Krs.query()
      .where('semester', semester)
      .preload('matakuliah')

    const studentSks = allKrs.reduce((acc, krs) => {
      if (!acc[krs.mahasiswaId]) {
        acc[krs.mahasiswaId] = 0
      }
      acc[krs.mahasiswaId] += krs.matakuliah?.sks || 0
      return acc
    }, {} as Record<number, number>)
    
    const totalSks = Object.values(studentSks).reduce((sum, sks) => sum + sks, 0)
    const avgSks = Object.keys(studentSks).length > 0 ? totalSks / Object.keys(studentSks).length : 0

    return {
      totalKrs: Number(totalKrs[0]?.$extras?.count) || allKrs.length,
      totalStudents: uniqueStudents.length,
      avgSks: Math.round(avgSks * 100) / 100
    }
  }

  /**
   * Get top students by SKS
   */
  private async getTopStudentsBySks(semester: string, limit: number = 10) {
    const krsData = await Krs.query()
      .where('semester', semester)
      .preload('mahasiswa', (mahasiswaQuery) => {
        mahasiswaQuery.preload('prodi')
      })
      .preload('matakuliah')

    const studentSks = krsData.reduce((acc, krs) => {
      const studentId = krs.mahasiswaId
      if (!acc[studentId]) {
        acc[studentId] = {
          mahasiswa: krs.mahasiswa,
          totalSks: 0,
          totalMatakuliah: 0
        }
      }
      acc[studentId].totalSks += krs.matakuliah?.sks || 0
      acc[studentId].totalMatakuliah += 1
      return acc
    }, {} as Record<number, any>)

    return Object.values(studentSks)
      .sort((a: any, b: any) => b.totalSks - a.totalSks)
      .slice(0, limit)
  }

  /**
   * Get faculty breakdown statistics
   */
  private async getFacultyBreakdown(semester: string) {
    const fakultasList = await Fakultas.query()
      .preload('prodis', (prodiQuery) => {
        prodiQuery.preload('mahasiswas', (mahasiswaQuery) => {
          mahasiswaQuery.preload('krs', (krsQuery) => {
            krsQuery.where('semester', semester)
              .preload('matakuliah')
          })
        })
      })

    return fakultasList.map(fakultas => {
      let totalStudents = 0
      let totalSks = 0
      let totalKrs = 0

      fakultas.prodis.forEach(prodi => {
        prodi.mahasiswas.forEach(mahasiswa => {
          if (mahasiswa.krs.length > 0) {
            totalStudents += 1
            mahasiswa.krs.forEach(krs => {
              totalKrs += 1
              totalSks += krs.matakuliah?.sks || 0
            })
          }
        })
      })

      return {
        namaFakultas: fakultas.namaFakultas,
        totalStudents,
        totalSks,
        totalKrs,
        avgSks: totalStudents > 0 ? Math.round((totalSks / totalStudents) * 100) / 100 : 0
      }
    })
  }

}