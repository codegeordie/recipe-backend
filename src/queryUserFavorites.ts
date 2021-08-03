import { Request } from 'express'
import { ObjectId } from 'mongodb'

export async function queryUserFavorites(req: Request) {
	const users = req.app.locals.db.collection('users')
	const userId = req.query.id
	//if (!userId) throw Error('cannot query favorites, no user id on request')

	let result = []

	const lookupRecipes = {
		from: 'recipes',
		localField: 'favorites.recipeId',
		foreignField: '_id',
		as: 'favoritesFull',
	}

	result = await users
		.aggregate([
			{ $match: { _id: new ObjectId(userId) } },
			{ $lookup: lookupRecipes },
			{ $project: { _id: 0, favoritesFull: 1 } },
		])
		.toArray()

	return result
}
