const { hash } = require('bcryptjs')
const AppError = require('../utils/AppError')
const knex = require('../database/knex')

class UsersController {
  async create(request, response) {
    const { name, email, password, isAdmin = false } = request.body

    const userExistsVerification = await knex('users')
      .select('id')
      .where('email', email)
      .first()

    if (userExistsVerification) {
      throw new AppError('Este e-mail já está em uso.')
    }

    if (!name || !email || !password) {
      throw new AppError('Preencha todos os campos!')
    }

    if (password.length < 6) {
      throw new AppError('A senha deve conter no mínimo 6 caracteres.')
    }

    const hashedPassword = await hash(password, 8)

    await knex('users').insert({
      name,
      email,
      password: hashedPassword,
      isAdmin
    })

    return response.status(201).json()
  }
}

module.exports = UsersController
