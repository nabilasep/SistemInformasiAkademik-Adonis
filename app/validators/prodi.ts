import vine from '@vinejs/vine'

export const createProdiValidator = vine.compile(
  vine.object({
    namaProdi: vine.string().trim().minLength(3).maxLength(100),
    fakultasId: vine.number().positive(),
  })
)

export const updateProdiValidator = vine.compile(
  vine.object({
    namaProdi: vine.string().trim().minLength(3).maxLength(100),
    fakultasId: vine.number().positive(),
  })
)