import { Router } from 'express'
import {
	ingredientsGet,
	ingredientsGetById,
	ingredientsGetAll,
} from '../controllers/ingredientsController'

export const ingredientRouter = Router()

// create
// ingredientRouter.post('/', () => {})
// read
ingredientRouter.get('/all', ingredientsGetAll)
ingredientRouter.get('/id/:id', ingredientsGetById)
ingredientRouter.get('/', ingredientsGet)
// update
// ingredientRouter.put('/:id', () => {})
// delete
// ingredientRouter.delete('/:id', () => {})
