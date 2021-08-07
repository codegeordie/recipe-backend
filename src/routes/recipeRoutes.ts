import { Router } from 'express'
import {
	recipesGet,
	recipesGetById,
	recipesGetAll,
	recipesCreate,
} from '../controllers/recipesController'
import { verifyNextAuthToken } from '../middleware/verifyNextAuthToken'

export const recipeRouter = Router()

// create
recipeRouter.post('/', recipesCreate)
// read
recipeRouter.get('/all', recipesGetAll)
recipeRouter.get('/id/:id', recipesGetById)
recipeRouter.get('/', verifyNextAuthToken, recipesGet)
// update
//recipeRouter.put('/:id', () => {})
// delete
//recipeRouter.delete('/:id', () => {})
