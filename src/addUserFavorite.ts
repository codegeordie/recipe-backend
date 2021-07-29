import { Request } from 'express'
import { ObjectId } from 'mongodb'

export const addUserFavorite = async (req: Request) => {
	const users = req.app.locals.db.collection('users')

	const userFavoritesArray = await users
		.find({ _id: new ObjectId(req.body.uid) })
		.project({ _id: 0, favorites: 1 })
		.toArray()

	if (!userFavoritesArray[0].favorites) {
		users.updateOne(
			{ _id: new ObjectId(req.body.uid) },
			{ $set: { favorites: [{ recipeId: new ObjectId(req.body.recipeId) }] } },
			{ upsert: true }
		)
	} else if (
		!userFavoritesArray[0].favorites.includes({
			recipeId: new ObjectId(req.body.recipeId),
		})
	) {
		users.updateOne(
			{ _id: new ObjectId(req.body.uid) },
			{
				$addToSet: { favorites: { recipeId: new ObjectId(req.body.recipeId) } },
			}
		)
	}
}
