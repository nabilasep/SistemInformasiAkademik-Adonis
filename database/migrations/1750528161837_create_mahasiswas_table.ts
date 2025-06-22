import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'mahasiswas'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('nim', 20).notNullable().unique()
      table.string('nama', 100).notNullable()
      table.integer('prodi_id').unsigned().references('id').inTable('prodis').onDelete('CASCADE')
      
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}