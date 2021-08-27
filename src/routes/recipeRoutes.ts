import { Router } from 'express'
import {
	recipesGet,
	recipesGetById,
	recipesGetAll,
	recipesCreate,
	recipesUpdate,
	recipesDelete,
} from '../controllers/recipesController'
import { enforceNextAuthToken } from '../middleware/enforceNextAuthToken'

export const recipeRouter = Router()

// create
recipeRouter.post('/', enforceNextAuthToken, recipesCreate)
// read
recipeRouter.get('/all', recipesGetAll)
recipeRouter.get('/id/:id', recipesGetById)
recipeRouter.get('/', recipesGet)
// update
recipeRouter.put('/id/:id', enforceNextAuthToken, recipesUpdate)
// delete
recipeRouter.delete('/id/:id', enforceNextAuthToken, recipesDelete)
