import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Prodi from '#models/prodi'

export default class extends BaseSeeder {
  async run() {
    // Seeder untuk prodi
    await Prodi.updateOrCreateMany('namaProdi', [
      // Fakultas Teknik (fakultas_id: 1)
      {
        namaProdi: 'Teknik Informatika',
        fakultasId: 1
      },
      {
        namaProdi: 'Teknik Sipil',
        fakultasId: 1
      },
      {
        namaProdi: 'Teknik Mesin',
        fakultasId: 1
      },
      {
        namaProdi: 'Teknik Elektro',
        fakultasId: 1
      },
      
      // Fakultas Ekonomi dan Bisnis (fakultas_id: 2)
      {
        namaProdi: 'Manajemen',
        fakultasId: 2
      },
      {
        namaProdi: 'Akuntansi',
        fakultasId: 2
      },
      {
        namaProdi: 'Ekonomi Pembangunan',
        fakultasId: 2
      },
      
      // Fakultas Ilmu Komputer (fakultas_id: 3)
      {
        namaProdi: 'Sistem Informasi',
        fakultasId: 3
      },
      {
        namaProdi: 'Ilmu Komputer',
        fakultasId: 3
      },
      {
        namaProdi: 'Teknologi Informasi',
        fakultasId: 3
      },
      
      // Fakultas Kedokteran (fakultas_id: 4)
      {
        namaProdi: 'Pendidikan Dokter',
        fakultasId: 4
      },
      {
        namaProdi: 'Keperawatan',
        fakultasId: 4
      },
      
      // Fakultas Hukum (fakultas_id: 5)
      {
        namaProdi: 'Ilmu Hukum',
        fakultasId: 5
      },
      
      // Fakultas Pertanian (fakultas_id: 6)
      {
        namaProdi: 'Agroteknologi',
        fakultasId: 6
      },
      {
        namaProdi: 'Peternakan',
        fakultasId: 6
      }
    ])
  }
}