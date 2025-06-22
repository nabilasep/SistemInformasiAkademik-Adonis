import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Mahasiswa from './mahasiswa.js'
import Matakuliah from './matakuliah.js'

export default class Krs extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare mahasiswaId: number

  @column()
  declare matakuliahId: number

  @column()
  declare semester: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relasi
  @belongsTo(() => Mahasiswa)
  declare mahasiswa: BelongsTo<typeof Mahasiswa>

  @belongsTo(() => Matakuliah)
  declare matakuliah: BelongsTo<typeof Matakuliah>
}