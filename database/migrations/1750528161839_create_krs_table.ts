import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'krs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('mahasiswa_id').unsigned().references('id').inTable('mahasiswas').onDelete('CASCADE')
      table.integer('matakuliah_id').unsigned().references('id').inTable('matakuliahs').onDelete('CASCADE')
      table.string('semester', 10).notNullable()
      
      // Unique constraint untuk mencegah duplikasi pengambilan matkul di semester yang sama
      table.unique(['mahasiswa_id', 'matakuliah_id', 'semester'])
      
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}