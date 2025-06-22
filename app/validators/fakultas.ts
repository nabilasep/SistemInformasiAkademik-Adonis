import vine from '@vinejs/vine'

export const createFakultasValidator = vine.compile(
  vine.object({
    nama: vine.string().trim().minLength(3).maxLength(100),
  })
)

export const updateFakultasValidator = vine.compile(
  vine.object({
    nama: vine.string().trim().minLength(3).maxLength(100),
  })
)