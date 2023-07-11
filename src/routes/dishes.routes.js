const { Router } = require('express')

const multer = require('multer')
const uploadConfig = require('../configs/upload')

const ensureAuthenticated = require('../middlewares/ensureAuthenticated')

const DishesController = require('../controllers/DishesController')
const dishesController = new DishesController()

const upload = multer(uploadConfig.MULTER)

const dishesRoutes = Router()
dishesRoutes.use(ensureAuthenticated)

dishesRoutes.post('/', upload.single('image'), dishesController.create)
dishesRoutes.get('/', dishesController.index)
dishesRoutes.get('/:id', dishesController.show)
dishesRoutes.put('/:id', upload.single('image'), dishesController.update)
dishesRoutes.delete('/:id', dishesController.delete)

module.exports = dishesRoutes
