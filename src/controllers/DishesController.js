const knex = require('../database/knex')
const DiskStorage = require('../providers/DiskStorage')
const AppError = require('../utils/AppError')

class DishesController {
  async create(request, response) {
    const { name, description, category, price, ingredients } = request.body
    const user_id = request.user.id
    const dishImage = request.file.filename

    const diskStorage = new DiskStorage()

    const filename = await diskStorage.saveFile(dishImage)

    const [dish_id] = await knex('dishes').insert({
      name,
      description,
      category,
      image: filename,
      price,
      user_id
    })

    const ingredientsInsert = ingredients.map(ingredient => {
      return {
        dish_id,
        name: ingredient
      }
    })

    await knex('ingredients').insert(ingredientsInsert)

    return response.status(201).json()
  }

  async index(request, response) {
    const { search } = request.query

    const dish = await knex
      .select([
        'dishes.id',
        'dishes.name',
        'dishes.description',
        'dishes.category',
        'dishes.image',
        'dishes.price'
      ])
      .from('dishes')
      .join('ingredients', 'dishes.id', 'ingredients.dish_id')
      .whereLike('dishes.name', `%${search}%`)
      .orWhereLike('ingredients.name', `%${search}%`)
      .groupBy('dishes.id')

    return response.json(dish)
  }

  async show(request, response) {
    const { id } = request.params

    const dish = await knex('dishes').where({ id }).first()
    const ingredients = await knex('ingredients')
      .where({ dish_id: id })
      .orderBy('name')

    return response.json({
      ...dish,
      ingredients
    })
  }

  async update(request, response) {
    const { name, description, category, price, ingredients } = request.body
    const { id } = request.params
    const dishImage = request.file.filename

    const diskStorage = new DiskStorage()

    const dish = await knex('dishes').where({ id: id }).first()

    if (!dish) {
      throw new AppError('Não encontrado, tente outra opção')
    }

    if (dish.image) {
      await diskStorage.deleteFile(dish.image)
    }

    const filename = await diskStorage.saveFile(dishImage)

    dish.name = name ?? dish.name
    dish.description = description ?? dish.description
    dish.category = category ?? dish.category
    dish.image = filename
    dish.price = price ?? dish.price

    const ingredientsInsert = ingredients.map(ingredient => {
      return {
        dish_id: dish.id,
        name: ingredient
      }
    })

    await knex('dishes').where({ id: id }).update(dish)
    await knex('dishes').where({ id: id }).update('updated_at', knex.fn.now())

    await knex('ingredients').where({ dish_id: id }).delete()
    await knex('ingredients').where({ dish_id: id }).insert(ingredientsInsert)

    return response.json()
  }

  async delete(request, response) {
    const { id } = request.params

    await knex('dishes').where({ id }).delete()

    return response.json()
  }
}

module.exports = DishesController
