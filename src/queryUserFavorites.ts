import { Request } from 'express'
import { ObjectId } from 'mongodb'

export async function queryUserFavorites(req: Request) {
	const users = req.app.locals.db.collection('users')
	//const recipes = req.app.locals.db.collection('recipes')
	const query = req.query

	console.log('query favorites was called')

	let result = []

	const lookupRecipes = {
		from: 'recipes',
		localField: 'favorites.recipeId',
		foreignField: '_id',
		as: 'favoritesFull',
	}

	result = await users
		.aggregate([
			{ $match: { _id: new ObjectId(query.id) } },
			{ $lookup: lookupRecipes },
			{ $project: { _id: 0, favoritesFull: 1 } },
		])
		.toArray()

	return result
}
