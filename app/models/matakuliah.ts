import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Krs from './krs.js'

export default class Matakuliah extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare kode: string

  @column()
  declare namaMatakuliah: string

  @column()
  declare sks: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relasi
  @hasMany(() => Krs)
  declare krs: HasMany<typeof Krs>
  total: any
}