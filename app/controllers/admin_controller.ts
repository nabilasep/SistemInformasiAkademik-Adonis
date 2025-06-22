import type { HttpContext } from '@adonisjs/core/http'

export default class AdminController {
  /**
   * Check if user is authenticated and has admin role
   */
  private async checkAdminAuth(ctx: HttpContext) {
    try {
      const user = await ctx.auth.authenticate()
      if (user.role !== 'admin') {
        return ctx.response.unauthorized('Akses ditolak: Anda bukan admin')
      }
      return user
    } catch (error) {
      return ctx.response.redirect().toRoute('login')
    }
  }

  async dashboard(ctx: HttpContext) {
    const user = await this.checkAdminAuth(ctx)
    if (!user || typeof user !== 'object') return user // Return response if auth failed
    
    // Get statistics for dashboard
    const { default: Fakultas } = await import('#models/fakultas')
    const { default: Prodi } = await import('#models/prodi')
    const { default: Mahasiswa } = await import('#models/mahasiswa')
    const { default: Matakuliah } = await import('#models/matakuliah')
    const { default: Krs } = await import('#models/krs')

    // Get counts using proper syntax
    const [
      totalFakultas,
      totalProdi,
      totalMahasiswa,
      totalMatakuliah,
      totalKrs
    ] = await Promise.all([
      Fakultas.query().count('*').first().then(result => Number(result?.$extras.count || 0)),
      Prodi.query().count('*').first().then(result => Number(result?.$extras.count || 0)),
      Mahasiswa.query().count('*').first().then(result => Number(result?.$extras.count || 0)),
      Matakuliah.query().count('*').first().then(result => Number(result?.$extras.count || 0)),
      Krs.query().count('*').first().then(result => Number(result?.$extras.count || 0))
    ])

    // Get recent KRS data
    const recentKrs = await Krs.query()
      .preload('mahasiswa', (query) => {
        query.preload('prodi')
      })
      .preload('matakuliah')
      .orderBy('created_at', 'desc')
      .limit(10)

    // Get mahasiswa with highest SKS per semester
    const mahasiswaSks = await Krs.query()
      .select('mahasiswa_id', 'semester')
      .sum('matakuliah.sks as total_sks')
      .join('matakuliahs', 'krs.matakuliah_id', 'matakuliahs.id')
      .groupBy('mahasiswa_id', 'semester')
      .orderBy('total_sks', 'desc')
      .limit(5)
      .preload('mahasiswa')

    const stats = {
      totalFakultas,
      totalProdi,
      totalMahasiswa,
      totalMatakuliah,
      totalKrs
    }

    return ctx.view.render('admin/dashboard', { 
      user, 
      stats, 
      recentKrs,
      mahasiswaSks
    })
  }
  
  /**
   * Admin overview page
   */
  async overview({ view, auth }: HttpContext) {
    try {
      const user = await auth.authenticate()
      
      if (user.role !== 'admin') {
        return view.render('errors/404')
      }

      // Get basic statistics
      const { default: Fakultas } = await import('#models/fakultas')
      const { default: Prodi } = await import('#models/prodi')
      const { default: Mahasiswa } = await import('#models/mahasiswa')
      const { default: Matakuliah } = await import('#models/matakuliah')

      const [totalFakultas, totalProdi, totalMahasiswa, totalMatakuliah] = await Promise.all([
        Fakultas.query().count('*').first().then(result => Number(result?.$extras.count || 0)),
        Prodi.query().count('*').first().then(result => Number(result?.$extras.count || 0)),
        Mahasiswa.query().count('*').first().then(result => Number(result?.$extras.count || 0)),
        Matakuliah.query().count('*').first().then(result => Number(result?.$extras.count || 0))
      ])

      return view.render('admin/overview', {
        user,
        stats: {
          totalFakultas,
          totalProdi,
          totalMahasiswa,
          totalMatakuliah
        }
      })
      
    } catch (error) {
      return view.render('errors/404')
    }
  }
}