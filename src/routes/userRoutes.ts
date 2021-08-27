import { Router } from 'express'
import {
	getUserCurrency,
	setUserCurrency,
	toggleUserFavorite,
} from '../controllers/usersController'
import { enforceNextAuthToken } from '../middleware/enforceNextAuthToken'

export const userRouter = Router()

userRouter.get('/', () => {})

//userRouter.get('/id/:id', enforceNextAuthToken, getUserFavorites)
userRouter.post('/favorites', enforceNextAuthToken, toggleUserFavorite)

userRouter.get('/currency', enforceNextAuthToken, getUserCurrency)
userRouter.post('/currency', enforceNextAuthToken, setUserCurrency)
