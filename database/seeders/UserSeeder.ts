import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class extends BaseSeeder {  async run() {
    // Seeder untuk user
    await User.updateOrCreateMany('email', [
      // Admin users
      {
        email: 'admin@asep.ac.id',
        password: 'password123',
        role: 'admin'
      },
      {
        email: 'staff@asep.ac.id',
        password: 'password123',
        role: 'admin'
      },
      
      // Mahasiswa users (berdasarkan data mahasiswa yang sudah ada)
      {
        email: '2021001001@asep.ac.id',
        password: 'password123',
        role: 'mahasiswa'
      },
      {
        email: '2021001002@asep.ac.id',
        password: 'password123',
        role: 'mahasiswa'
      },
      {
        email: '2021001003@asep.ac.id',
        password: 'password123',
        role: 'mahasiswa'
      },
      {
        email: '2021002001@asep.ac.id',
        password: 'password123',
        role: 'mahasiswa'
      },
      {
        email: '2021003001@asep.ac.id',
        password: 'password123',
        role: 'mahasiswa'
      }
    ])
  }
}