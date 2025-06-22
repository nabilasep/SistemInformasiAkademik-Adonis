import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Mahasiswa from '#models/mahasiswa'

export default class extends BaseSeeder {
  async run() {
    // Seeder untuk data mahasiswa dengan NIM yang sesuai email
    await Mahasiswa.updateOrCreateMany('nim', [
      // Fakultas Teknik - Informatika  
      {
        nim: '2021001001',
        nama: 'Ahmad Rizki Pratama',
        prodiId: 1 // Teknik Informatika
      },
      {
        nim: '2021001002', 
        nama: 'Siti Nurhaliza',
        prodiId: 1 // Teknik Informatika
      },
      {
        nim: '2021001003',
        nama: 'Budi Santoso', 
        prodiId: 1 // Teknik Informatika
      },
      
      // Fakultas Ekonomi - Manajemen
      {
        nim: '2021002001',
        nama: 'Muhammad Fadil',
        prodiId: 3 // Manajemen  
      },
      
      // Fakultas Hukum - Ilmu Hukum
      {
        nim: '2021003001',
        nama: 'Indra Gunawan',
        prodiId: 5 // Ilmu Hukum
      }
    ])
    
    console.log('✅ Mahasiswa data seeded successfully')
  }
}