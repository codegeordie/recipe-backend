import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { UserRequest } from '../../@types/types'

// const lookupRecipes = {
// 	from: 'recipes',
// 	localField: 'favorites.recipeId',
// 	foreignField: '_id',
// 	as: 'favoritesFull',
// }

////////////////
export const toggleUserFavorite = async (req: UserRequest, res: Response) => {
	const users = req.app.locals.db.collection('users')
	const usersResponse = await users
		.find({ _id: new ObjectId(req.userId) })
		.project({ _id: 0, favorites: 1 })
		.toArray()

	type userFavorite = { recipeId: ObjectId }
	const userFavoritesArray: userFavorite[] = usersResponse[0].favorites
	const { recipeId, setFavBool } = req.body

	if (!userFavoritesArray && setFavBool === true) {
		//console.log('create fav array')
		users.updateOne(
			{ _id: new ObjectId(req.userId) },
			{ $set: { favorites: [] } },
			{ upsert: true }
		)
	}

	if (setFavBool === true) {
		//console.log('add to set')
		users.updateOne(
			{ _id: new ObjectId(req.userId) },
			{
				$addToSet: { favorites: { recipeId: new ObjectId(recipeId) } },
			}
		)
	} else {
		//console.log('pull from set')
		users.updateOne(
			{ _id: new ObjectId(req.userId) },
			{
				$pull: { favorites: { recipeId: new ObjectId(recipeId) } },
			}
		)
	}
	res.status(200)
}

////////////////
export const getUserCurrency = async (req: UserRequest, res: Response) => {
	const users = req.app.locals.db.collection('users')
	const response = await users.find({ _id: new ObjectId(req.userId) }).toArray()
	const userCurrency = response[0]?.currencyPref

	res.json(userCurrency || { id: 'USD', value: 'US Dollars' })
}

////////////////
export const setUserCurrency = async (req: UserRequest, res: Response) => {
	const users = req.app.locals.db.collection('users')

	const user = await users.updateOne(
		{ _id: new ObjectId(req.userId) },
		{ $set: { currencyPref: req.body.currency } },
		{ upsert: true }
	)

	res.status(200)
}
