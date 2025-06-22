import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  private async seed(Seeder: () => Promise<{ default: typeof BaseSeeder }>) {
    const { default: SeederClass } = await Seeder()
    await new SeederClass(this.client).run()
  }

  async run() {
    // Urutan seeding harus benar karena ada foreign key dependencies
    await this.seed(() => import('./FakultasSeeder.js'))
    await this.seed(() => import('./ProdiSeeder.js'))
    await this.seed(() => import('./MahasiswaSeeder.js'))
    await this.seed(() => import('./MatakuliahSeeder.js'))
    await this.seed(() => import('./UserSeeder.js'))
    
    console.log('🎉 All data seeded successfully!')
  }
}