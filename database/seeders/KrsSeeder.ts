import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Krs from '#models/krs'

export default class extends BaseSeeder {
  async run() {
    // Seeder untuk KRS
    await Krs.updateOrCreateMany(['mahasiswaId', 'matakuliahId', 'semester'], [
      // KRS Semester 1 - Ahmad Rizki Pratama (mahasiswa_id: 1)
      {
        mahasiswaId: 1,
        matakuliahId: 1, // Pancasila
        semester: '2024/1'
      },
      {
        mahasiswaId: 1,
        matakuliahId: 3, // Bahasa Indonesia
        semester: '2024/1'
      },
      {
        mahasiswaId: 1,
        matakuliahId: 5, // Agama
        semester: '2024/1'
      },
      {
        mahasiswaId: 1,
        matakuliahId: 6, // Algoritma dan Pemrograman
        semester: '2024/1'
      },
      {
        mahasiswaId: 1,
        matakuliahId: 22, // Matematika Dasar
        semester: '2024/1'
      },
      {
        mahasiswaId: 1,
        matakuliahId: 24, // Kalkulus
        semester: '2024/1'
      },
      
      // KRS Semester 2 - Ahmad Rizki Pratama (mahasiswa_id: 1)
      {
        mahasiswaId: 1,
        matakuliahId: 2, // Kewarganegaraan
        semester: '2024/2'
      },
      {
        mahasiswaId: 1,
        matakuliahId: 4, // Bahasa Inggris
        semester: '2024/2'
      },
      {
        mahasiswaId: 1,
        matakuliahId: 7, // Struktur Data
        semester: '2024/2'
      },
      {
        mahasiswaId: 1,
        matakuliahId: 8, // Basis Data
        semester: '2024/2'
      },
      {
        mahasiswaId: 1,
        matakuliahId: 23, // Statistika
        semester: '2024/2'
      },
      
      // KRS Semester 1 - Siti Nurhaliza (mahasiswa_id: 2)
      {
        mahasiswaId: 2,
        matakuliahId: 1, // Pancasila
        semester: '2024/1'
      },
      {
        mahasiswaId: 2,
        matakuliahId: 3, // Bahasa Indonesia
        semester: '2024/1'
      },
      {
        mahasiswaId: 2,
        matakuliahId: 5, // Agama
        semester: '2024/1'
      },
      {
        mahasiswaId: 2,
        matakuliahId: 6, // Algoritma dan Pemrograman
        semester: '2024/1'
      },
      {
        mahasiswaId: 2,
        matakuliahId: 22, // Matematika Dasar
        semester: '2024/1'
      },
      
      // KRS Semester 1 - Muhammad Fadil (mahasiswa_id: 5 - Sistem Informasi)
      {
        mahasiswaId: 5,
        matakuliahId: 1, // Pancasila
        semester: '2024/1'
      },
      {
        mahasiswaId: 5,
        matakuliahId: 3, // Bahasa Indonesia
        semester: '2024/1'
      },
      {
        mahasiswaId: 5,
        matakuliahId: 6, // Algoritma dan Pemrograman
        semester: '2024/1'
      },
      {
        mahasiswaId: 5,
        matakuliahId: 13, // Analisis dan Perancangan Sistem
        semester: '2024/1'
      },
      {
        mahasiswaId: 5,
        matakuliahId: 22, // Matematika Dasar
        semester: '2024/1'
      },
      
      // KRS Semester 1 - Indra Gunawan (mahasiswa_id: 7 - Manajemen)
      {
        mahasiswaId: 7,
        matakuliahId: 1, // Pancasila
        semester: '2024/1'
      },
      {
        mahasiswaId: 7,
        matakuliahId: 3, // Bahasa Indonesia
        semester: '2024/1'
      },
      {
        mahasiswaId: 7,
        matakuliahId: 16, // Pengantar Manajemen
        semester: '2024/1'
      },
      {
        mahasiswaId: 7,
        matakuliahId: 20, // Pengantar Akuntansi
        semester: '2024/1'
      },
      {
        mahasiswaId: 7,
        matakuliahId: 22, // Matematika Dasar
        semester: '2024/1'
      },
      {
        mahasiswaId: 7,
        matakuliahId: 23, // Statistika
        semester: '2024/1'
      }
    ])
  }
}