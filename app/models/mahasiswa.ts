import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Prodi from './prodi.js'
import Krs from './krs.js'

export default class Mahasiswa extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nim: string

  @column()
  declare nama: string

  @column()
  declare prodiId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relasi
  @belongsTo(() => Prodi)
  declare prodi: BelongsTo<typeof Prodi>

  @hasMany(() => Krs)
  declare krs: HasMany<typeof Krs>
  total: any
}