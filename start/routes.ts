/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

router.get('/', ({ response }) => {
  return response.redirect().toRoute('login')
}).as('home')

// Auth routes
router.get('/login', '#controllers/auth_controller.showLogin').as('login')
router.post('/login', '#controllers/auth_controller.login')
router.get('/register', '#controllers/auth_controller.showRegister').as('register')
router.post('/register', '#controllers/auth_controller.register')
router.post('/logout', '#controllers/auth_controller.logout').as('logout')

// Main dashboard route (redirects based on role)
router.get('/dashboard', '#controllers/dashboard_controller.index').as('dashboard')
router.get('/dashboard/stats', '#controllers/dashboard_controller.stats').as('dashboard.stats')

// Admin routes
router.group(() => {
  router.get('/dashboard', '#controllers/dashboard_controller.adminDashboard').as('dashboard')

  // Admin CRUD routes
  // Fakultas routes
  router.get('/fakultas', '#controllers/fakultas_controller.index').as('fakultas.index')
  router.get('/fakultas/create', '#controllers/fakultas_controller.create').as('fakultas.create')
  router.post('/fakultas', '#controllers/fakultas_controller.store').as('fakultas.store')
  router.get('/fakultas/:id', '#controllers/fakultas_controller.show').as('fakultas.show')
  router.get('/fakultas/:id/edit', '#controllers/fakultas_controller.edit').as('fakultas.edit')
  router.put('/fakultas/:id', '#controllers/fakultas_controller.update').as('fakultas.update')
  router.delete('/fakultas/:id', '#controllers/fakultas_controller.destroy').as('fakultas.destroy')

  // Prodi routes
  router.get('/prodi', '#controllers/prodi_controller.index').as('prodi.index')
  router.get('/prodi/create', '#controllers/prodi_controller.create').as('prodi.create')
  router.post('/prodi', '#controllers/prodi_controller.store').as('prodi.store')
  router.get('/prodi/:id', '#controllers/prodi_controller.show').as('prodi.show')
  router.get('/prodi/:id/edit', '#controllers/prodi_controller.edit').as('prodi.edit')
  router.put('/prodi/:id', '#controllers/prodi_controller.update').as('prodi.update')
  router.delete('/prodi/:id', '#controllers/prodi_controller.destroy').as('prodi.destroy')

  // Mahasiswa routes
  router.get('/mahasiswa', '#controllers/mahasiswa_controller.index').as('mahasiswa.index')
  router.get('/mahasiswa/create', '#controllers/mahasiswa_controller.create').as('mahasiswa.create')
  router.post('/mahasiswa', '#controllers/mahasiswa_controller.store').as('mahasiswa.store')
  router.get('/mahasiswa/:id', '#controllers/mahasiswa_controller.show').as('mahasiswa.show')
  router.get('/mahasiswa/:id/edit', '#controllers/mahasiswa_controller.edit').as('mahasiswa.edit')
  router.put('/mahasiswa/:id', '#controllers/mahasiswa_controller.update').as('mahasiswa.update')
  router.delete('/mahasiswa/:id', '#controllers/mahasiswa_controller.destroy').as('mahasiswa.destroy')

  // Academic summary route
  router.get('/mahasiswa-academic-summary', '#controllers/mahasiswa_controller.academicSummary').as('mahasiswa.academic-summary')

}).prefix('/admin').as('admin')

// Admin CRUD routes
// Matakuliah routes
router.get('/admin/matakuliah', '#controllers/matakuliah_controller.index').as('admin.matakuliah.index')
router.get('/admin/matakuliah/create', '#controllers/matakuliah_controller.create').as('admin.matakuliah.create')
router.post('/admin/matakuliah', '#controllers/matakuliah_controller.store').as('admin.matakuliah.store')
router.get('/admin/matakuliah/:id', '#controllers/matakuliah_controller.show').as('admin.matakuliah.show')
router.get('/admin/matakuliah/:id/edit', '#controllers/matakuliah_controller.edit').as('admin.matakuliah.edit')
router.put('/admin/matakuliah/:id', '#controllers/matakuliah_controller.update').as('admin.matakuliah.update')
router.delete('/admin/matakuliah/:id', '#controllers/matakuliah_controller.destroy').as('admin.matakuliah.destroy')

// API routes for matakuliah
router.get('/api/matakuliah', '#controllers/matakuliah_controller.getAll').as('api.matakuliah.all')

// Admin KRS routes
router.get('/admin/krs', '#controllers/admin_krs_controller.index').as('admin.krs.index')
router.get('/admin/krs/reports', '#controllers/admin_krs_controller.reports').as('admin.krs.reports')
router.get('/admin/krs/student/:studentId', '#controllers/admin_krs_controller.studentDetail').as('admin.krs.student')
router.get('/admin/krs/export', '#controllers/admin_krs_controller.exportExcel').as('admin.krs.export')

// Mahasiswa routes (Student Dashboard)
router.get('/mahasiswa/dashboard', '#controllers/dashboard_controller.mahasiswaDashboard').as('mahasiswa.dashboard')

// Mahasiswa KRS routes
router.get('/mahasiswa/krs', '#controllers/krs_controller.index').as('mahasiswa.krs.index')
router.get('/mahasiswa/krs/create', '#controllers/krs_controller.create').as('mahasiswa.krs.create')
router.post('/mahasiswa/krs', '#controllers/krs_controller.store').as('mahasiswa.krs.store')
router.delete('/mahasiswa/krs/:id', '#controllers/krs_controller.destroy').as('mahasiswa.krs.destroy')

// API routes for mahasiswa
router.get('/api/mahasiswa/matakuliah', '#controllers/krs_controller.getAvailableMatakuliah').as('api.mahasiswa.matakuliah')
router.get('/api/mahasiswa/sks', '#controllers/krs_controller.getCurrentSks').as('api.mahasiswa.sks')
