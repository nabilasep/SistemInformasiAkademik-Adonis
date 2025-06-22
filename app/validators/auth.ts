import vine from '@vinejs/vine'

/**
 * Validator untuk login
 */
export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string(),
  })
)

/**
 * Validator untuk register
 */
export const registerValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string().minLength(6),
    password_confirmation: vine.string().confirmed({ confirmationField: 'password' }),
  })
)