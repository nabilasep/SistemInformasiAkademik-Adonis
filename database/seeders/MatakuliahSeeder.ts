import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Matakuliah from '#models/matakuliah'

export default class extends BaseSeeder {
  async run() {
    // Seeder untuk mata kuliah
    await Matakuliah.updateOrCreateMany('kode', [
      // Mata Kuliah Umum
      {
        kode: 'MKU001',
        namaMatakuliah: 'Pancasila',
        sks: 2
      },
      {
        kode: 'MKU002',
        namaMatakuliah: 'Kewarganegaraan',
        sks: 2
      },
      {
        kode: 'MKU003',
        namaMatakuliah: 'Bahasa Indonesia',
        sks: 2
      },
      {
        kode: 'MKU004',
        namaMatakuliah: 'Bahasa Inggris',
        sks: 2
      },
      {
        kode: 'MKU005',
        namaMatakuliah: 'Agama',
        sks: 2
      },
      
      // Mata Kuliah Teknik Informatika
      {
        kode: 'TIF001',
        namaMatakuliah: 'Algoritma dan Pemrograman',
        sks: 3
      },
      {
        kode: 'TIF002',
        namaMatakuliah: 'Struktur Data',
        sks: 3
      },
      {
        kode: 'TIF003',
        namaMatakuliah: 'Basis Data',
        sks: 3
      },
      {
        kode: 'TIF004',
        namaMatakuliah: 'Pemrograman Web',
        sks: 3
      },
      {
        kode: 'TIF005',
        namaMatakuliah: 'Sistem Operasi',
        sks: 3
      },
      {
        kode: 'TIF006',
        namaMatakuliah: 'Jaringan Komputer',
        sks: 3
      },
      {
        kode: 'TIF007',
        namaMatakuliah: 'Rekayasa Perangkat Lunak',
        sks: 3
      },
      
      // Mata Kuliah Sistem Informasi
      {
        kode: 'SIF001',
        namaMatakuliah: 'Analisis dan Perancangan Sistem',
        sks: 3
      },
      {
        kode: 'SIF002',
        namaMatakuliah: 'Manajemen Proyek TI',
        sks: 3
      },
      {
        kode: 'SIF003',
        namaMatakuliah: 'Sistem Informasi Manajemen',
        sks: 3
      },
      
      // Mata Kuliah Manajemen
      {
        kode: 'MAN001',
        namaMatakuliah: 'Pengantar Manajemen',
        sks: 3
      },
      {
        kode: 'MAN002',
        namaMatakuliah: 'Manajemen Sumber Daya Manusia',
        sks: 3
      },
      {
        kode: 'MAN003',
        namaMatakuliah: 'Manajemen Pemasaran',
        sks: 3
      },
      {
        kode: 'MAN004',
        namaMatakuliah: 'Manajemen Keuangan',
        sks: 3
      },
      
      // Mata Kuliah Akuntansi
      {
        kode: 'AKT001',
        namaMatakuliah: 'Pengantar Akuntansi',
        sks: 3
      },
      {
        kode: 'AKT002',
        namaMatakuliah: 'Akuntansi Keuangan',
        sks: 3
      },
      {
        kode: 'AKT003',
        namaMatakuliah: 'Akuntansi Manajemen',
        sks: 3
      },
      
      // Mata Kuliah Matematika
      {
        kode: 'MAT001',
        namaMatakuliah: 'Matematika Dasar',
        sks: 3
      },
      {
        kode: 'MAT002',
        namaMatakuliah: 'Statistika',
        sks: 3
      },
      {
        kode: 'MAT003',
        namaMatakuliah: 'Kalkulus',
        sks: 4
      }
    ])
  }
}