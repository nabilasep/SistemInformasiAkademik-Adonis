import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Fakultas from './fakultas.js'
import Mahasiswa from './mahasiswa.js'

export default class Prodi extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare namaProdi: string

  @column()
  declare fakultasId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relasi
  @belongsTo(() => Fakultas)
  declare fakultas: BelongsTo<typeof Fakultas>

  @hasMany(() => Mahasiswa)
  declare mahasiswas: HasMany<typeof Mahasiswa>
  total: any
}