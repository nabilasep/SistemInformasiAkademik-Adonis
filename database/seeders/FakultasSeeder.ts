import {BaseSeeder} from '@adonisjs/lucid/seeders'
import Fakultas from '#models/fakultas'

export default class extends BaseSeeder {
  async run() {
    // Using upsert to avoid duplicate entries
    await Fakultas.updateOrCreateMany('namaFakultas', [
      {
        namaFakultas: 'Fakultas Teknik'
      },
      {
        namaFakultas: 'Fakultas Ekonomi dan Bisnis'
      },
      {
        namaFakultas: 'Fakultas Ilmu Komputer'
      },
      {
        namaFakultas: 'Fakultas Kedokteran'
      },
      {
        namaFakultas: 'Fakultas Hukum'
      },
      {
        namaFakultas: 'Fakultas Pertanian'
      }
    ])
  }
}